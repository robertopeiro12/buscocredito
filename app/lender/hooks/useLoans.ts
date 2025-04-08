// hooks/useLoans.ts
import { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, onSnapshot, Timestamp, query, where, getDocs } from 'firebase/firestore';

// Asegúrate que la interfaz coincida con tus datos
interface LoanRequest {
  id: string;
  userId: string;
  amount: number;
  income: number;
  term: string;
  payment: 'mensual' | 'quincenal' | 'semanal';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  purpose: string; // Propósito del préstamo
  type: string;    // Tipo de préstamo
}

export function useLoans(companyName: string = '') {
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Create a refreshLoans function that can be called whenever needed
  const refreshLoans = useCallback(async () => {
    console.log(`Refreshing loans with company name: "${companyName}"`);
    if (!companyName) {
      console.log("Waiting for company name before fetching loans...");
      setLoading(false); // Set loading to false when no company name is available
      return;
    }
    
    setLoading(true);
    
    const db = getFirestore();
    const solicitudesRef = collection(db, "solicitudes");
    const propuestasRef = collection(db, "propuestas");
    
    try {
      // Query to get proposals where company is the provided value
      console.log(`Looking for proposals from company: ${companyName}`);
      const propuestasQuery = query(propuestasRef, where("company", "==", companyName));
      const propuestasSnapshot = await getDocs(propuestasQuery);
      
      // Create a set of existing loanIds
      const existingLoanIds = new Set();
      propuestasSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.loanId) {
          existingLoanIds.add(data.loanId);
        }
      });
      console.log(`Found ${existingLoanIds.size} existing proposals`);

      // Fetch pending loans
      const pendingLoansQuery = query(solicitudesRef, where("status", "==", "pending"));
      const loansSnapshot = await getDocs(pendingLoansQuery);
      
      const fetchedLoans = loansSnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            amount: data.amount,
            income: data.income,
            term: data.term,
            payment: data.payment,
            status: data.status,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            purpose: data.purpose || 'No especificado',
            type: data.type || 'No especificado'
          } as LoanRequest;
        })
        // Filter out loans that already have proposals
        .filter(loan => !existingLoanIds.has(loan.id));
      
      console.log(`Fetched ${loansSnapshot.docs.length} total loans, filtered to ${fetchedLoans.length} available loans`);
      setLoans(fetchedLoans);
      setError(null);
    } catch (err) {
      console.error("Error refreshing loans:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [companyName]); // Add companyName to the dependency array so the function updates when it changes

  useEffect(() => {
    console.log(`useLoans effect triggered with company name: "${companyName}"`);
    // Initial fetch
    refreshLoans();
    
    // Set up real-time listener only if we have a company name
    if (companyName) {
      const db = getFirestore();
      const solicitudesRef = collection(db, "solicitudes");
      const pendingLoansQuery = query(solicitudesRef, where("status", "==", "pending"));
      
      const unsubscribe = onSnapshot(pendingLoansQuery, 
        () => {
          // When any change is detected, refresh the loans
          refreshLoans();
        },
        (err) => {
          console.error("Error in loans listener:", err);
          setError(err);
        }
      );

      return () => unsubscribe();
    }
    
    return () => {}; // Return empty cleanup if no listener was set
  }, [refreshLoans]); // Since refreshLoans depends on companyName, this will re-run when companyName changes

  return { loans, loading, error, refreshLoans };
}