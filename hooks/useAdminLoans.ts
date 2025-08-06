import { useState, useEffect, useCallback } from 'react';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  Timestamp, 
  query, 
  where, 
  getDocs
} from 'firebase/firestore';
import { auth } from '@/app/firebase';
import type { LoanRequest } from '@/types/entities/business.types';

interface UseAdminLoansOptions {
  status?: 'pending' | 'approved' | 'rejected';
  enableRealtime?: boolean;
}

export function useAdminLoans(options: UseAdminLoansOptions = {}) {
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLoans = useCallback(async () => {
    // No hacer consultas si no hay usuario autenticado
    if (!auth.currentUser) {
      setLoading(false);
      setLoans([]);
      return;
    }

    setLoading(true);
    const db = getFirestore();
    const solicitudesRef = collection(db, "solicitudes");
    let loansQuery = query(solicitudesRef);

    // Aplicar filtros
    if (options.status) {
      loansQuery = query(loansQuery, where("status", "==", options.status));
    }

    try {
      // Para admin: obtener todas las solicitudes y filtrar las que ya tienen propuestas
      const loansSnapshot = await getDocs(loansQuery);
      
      // Obtener todas las propuestas existentes para filtrar solicitudes que ya tienen ofertas
      const propuestasRef = collection(db, "propuestas");
      const propuestasSnapshot = await getDocs(propuestasRef);
      
      const existingLoanIds = new Set();
      propuestasSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.loanId) {
          existingLoanIds.add(data.loanId);
        }
      });

      // Filtrar solicitudes que NO tienen propuestas (como en el lender)
      const fetchedLoans = loansSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt instanceof Timestamp 
            ? doc.data().createdAt.toDate() 
            : new Date()
        } as LoanRequest))
        .filter(loan => !existingLoanIds.has(loan.id));
      
      console.log("useAdminLoans - Total loans found:", loansSnapshot.docs.length);
      console.log("useAdminLoans - Loans with proposals:", existingLoanIds.size);
      console.log("useAdminLoans - Filtered loans (no proposals):", fetchedLoans.length);
      console.log("useAdminLoans - Query status:", options.status);
      
      setLoans(fetchedLoans);
      setError(null);
    } catch (err) {
      console.error("Error fetching loans:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [options.status]);

  useEffect(() => {
    // Fetch inicial
    fetchLoans();

    // Configurar listener en tiempo real si está habilitado
    if (options.enableRealtime) {
      const db = getFirestore();
      const solicitudesRef = collection(db, "solicitudes");
      let loansQuery = query(solicitudesRef);

      // Aplicar filtros
      if (options.status) {
        loansQuery = query(loansQuery, where("status", "==", options.status));
      }

      const unsubscribe = onSnapshot(
        loansQuery,
        async (snapshot) => {
          // También filtrar en tiempo real las solicitudes que ya tienen propuestas
          const propuestasRef = collection(db, "propuestas");
          const propuestasSnapshot = await getDocs(propuestasRef);
          
          const existingLoanIds = new Set();
          propuestasSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.loanId) {
              existingLoanIds.add(data.loanId);
            }
          });

          const fetchedLoans = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt instanceof Timestamp 
                ? doc.data().createdAt.toDate() 
                : new Date()
            } as LoanRequest))
            .filter(loan => !existingLoanIds.has(loan.id));
          
          setLoans(fetchedLoans);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error("Error in realtime listener:", err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    }
  }, [fetchLoans, options.enableRealtime, options.status]);

  return {
    loans,
    loading,
    error,
    fetchLoans,
  };
}
