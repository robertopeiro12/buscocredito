// hooks/useLoans.ts
import { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, Timestamp, query, where,getDocs } from 'firebase/firestore';

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

export function useLoans() {
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const db = getFirestore();
    const solicitudesRef = collection(db, "solicitudes");
    const propuestasRef = collection(db, "propuestas");
    
    setLoading(true);
  
    // First, fetch all the existing proposals to get the loanIds to filter out
    const fetchProposals = async () => {
      try {
        // Query to get proposals where company is "Banorte"
        const propuestasQuery = query(propuestasRef, where("company", "==", "Banorte"));
        const propuestasSnapshot = await getDocs(propuestasQuery);
        
        // Create a set of existing loanIds
        const existingLoanIds = new Set();
        propuestasSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.loanId) {
            existingLoanIds.add(data.loanId);
          }
        });
  
        // Now set up the listener for pending loans that don't have proposals yet
        const pendingLoansQuery = query(solicitudesRef, where("status", "==", "pending"));
  
        const unsubscribe = onSnapshot(pendingLoansQuery, 
          (snapshot) => {
            const fetchedLoans = snapshot.docs
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
            
            setLoans(fetchedLoans);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching loans:", err);
            setError(err);
            setLoading(false);
          }
        );
  
        return unsubscribe;
      } catch (err) {
        console.error("Error fetching proposals:", err);
        setError(err as Error);
        setLoading(false);
        return () => {};
      }
    };
  
    // Execute the async function and store the unsubscribe function
    let unsubscribe: () => void;
    fetchProposals().then(unsub => {
      unsubscribe = unsub;
    });
  
    // Return cleanup function
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { loans, loading, error };
}