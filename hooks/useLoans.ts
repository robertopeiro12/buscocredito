import { useState, useEffect, useCallback } from 'react';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  Timestamp, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';

export interface LoanRequest {
  id: string;
  userId: string;
  amount: number;
  income: number;
  term: string;
  payment: 'mensual' | 'quincenal' | 'semanal';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  purpose: string;
  type: string;
}

interface UseLoanOptions {
  companyName?: string;
  userId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  enableRealtime?: boolean;
}

export function useLoan(options: UseLoanOptions = {}) {
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLoans = useCallback(async () => {
    if (!options.companyName && !options.userId) {
      setLoading(false);
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
    if (options.userId) {
      loansQuery = query(loansQuery, where("userId", "==", options.userId));
    }

    try {
      // Si hay companyName, filtrar préstamos que ya tienen propuestas
      if (options.companyName) {
        const propuestasRef = collection(db, "propuestas");
        const propuestasQuery = query(propuestasRef, where("company", "==", options.companyName));
        const propuestasSnapshot = await getDocs(propuestasQuery);
        
        const existingLoanIds = new Set();
        propuestasSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.loanId) {
            existingLoanIds.add(data.loanId);
          }
        });

        const loansSnapshot = await getDocs(loansQuery);
        const fetchedLoans = loansSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt instanceof Timestamp 
              ? doc.data().createdAt.toDate() 
              : new Date()
          } as LoanRequest))
          .filter(loan => !existingLoanIds.has(loan.id));

        setLoans(fetchedLoans);
      } else {
        // Si no hay companyName, obtener todos los préstamos que coincidan con los filtros
        const loansSnapshot = await getDocs(loansQuery);
        const fetchedLoans = loansSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt instanceof Timestamp 
            ? doc.data().createdAt.toDate() 
            : new Date()
        } as LoanRequest));
        
        setLoans(fetchedLoans);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching loans:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [options.companyName, options.userId, options.status]);

  const getLoanById = useCallback(async (loanId: string) => {
    try {
      const db = getFirestore();
      const loanDoc = await getDoc(doc(db, "solicitudes", loanId));
      
      if (!loanDoc.exists()) {
        throw new Error('Préstamo no encontrado');
      }

      return {
        id: loanDoc.id,
        ...loanDoc.data(),
        createdAt: loanDoc.data().createdAt instanceof Timestamp 
          ? loanDoc.data().createdAt.toDate() 
          : new Date()
      } as LoanRequest;
    } catch (err) {
      console.error("Error fetching loan:", err);
      throw err;
    }
  }, []);

  const updateLoanStatus = useCallback(async (loanId: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      const db = getFirestore();
      await updateDoc(doc(db, "solicitudes", loanId), {
        status,
        updatedAt: new Date()
      });

      // Actualizar la lista de préstamos
      await fetchLoans();
    } catch (err) {
      console.error("Error updating loan status:", err);
      throw err;
    }
  }, [fetchLoans]);

  useEffect(() => {
    // Fetch inicial
    fetchLoans();

    // Configurar listener en tiempo real si está habilitado
    if (options.enableRealtime) {
      const db = getFirestore();
      const solicitudesRef = collection(db, "solicitudes");
      let loansQuery = query(solicitudesRef);

      if (options.status) {
        loansQuery = query(loansQuery, where("status", "==", options.status));
      }
      if (options.userId) {
        loansQuery = query(loansQuery, where("userId", "==", options.userId));
      }

      const unsubscribe = onSnapshot(loansQuery, 
        () => fetchLoans(),
        (err) => {
          console.error("Error in loans listener:", err);
          setError(err);
        }
      );

      return () => unsubscribe();
    }
  }, [fetchLoans, options.enableRealtime]);

  return {
    loans,
    loading,
    error,
    fetchLoans,
    getLoanById,
    updateLoanStatus
  };
}
