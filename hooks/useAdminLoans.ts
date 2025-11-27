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
  adminCompany?: string; // Agregar empresa del admin como parámetro
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
      // Para admin: obtener todas las solicitudes y filtrar correctamente
      const loansSnapshot = await getDocs(loansQuery);
      
      // Si no hay adminCompany, mostrar todas las solicitudes
      if (!options.adminCompany) {
        const fetchedLoans = loansSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt instanceof Timestamp 
              ? doc.data().createdAt.toDate() 
              : new Date()
          } as LoanRequest));
        
        setLoans(fetchedLoans);
        setError(null);
        setLoading(false);
        return;
      }

      // Obtener todas las propuestas existentes
      const propuestasRef = collection(db, "propuestas");
      const propuestasSnapshot = await getDocs(propuestasRef);
      
      // Agrupar propuestas por loanId
      const proposalsByLoanId = new Map();
      propuestasSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.loanId) {
          if (!proposalsByLoanId.has(data.loanId)) {
            proposalsByLoanId.set(data.loanId, []);
          }
          proposalsByLoanId.get(data.loanId).push(data);
        }
      });

      // Filtrar solicitudes: mostrar las que NO tienen propuestas de la empresa del admin
      const fetchedLoans = loansSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt instanceof Timestamp 
            ? doc.data().createdAt.toDate() 
            : new Date()
        } as LoanRequest))
        .filter(loan => {
          const proposals = proposalsByLoanId.get(loan.id) || [];
          
          // Si no hay propuestas, mostrar la solicitud (disponible para todas las empresas)
          if (proposals.length === 0) {
            return true;
          }
          
          // Si hay propuestas, mostrar solo si NINGUNA es de la empresa del admin
          // (ocultar solo las solicitudes donde esta empresa ya envió propuesta)
          const hasOwnProposal = proposals.some((proposal: any) => proposal.company === options.adminCompany);
          return !hasOwnProposal; // Invertir la lógica: mostrar si NO tiene propuesta propia
        });
      
      setLoans(fetchedLoans);
      setError(null);
    } catch (err) {
      console.error("Error fetching loans:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [options.status, options.adminCompany]);

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
          // Si no hay adminCompany, mostrar todas las solicitudes
          if (!options.adminCompany) {
            const fetchedLoans = snapshot.docs
              .map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt instanceof Timestamp 
                  ? doc.data().createdAt.toDate() 
                  : new Date()
              } as LoanRequest));
            
            setLoans(fetchedLoans);
            setLoading(false);
            setError(null);
            return;
          }

          // También aplicar el mismo filtro en tiempo real
          const propuestasRef = collection(db, "propuestas");
          const propuestasSnapshot = await getDocs(propuestasRef);
          
          // Agrupar propuestas por loanId
          const proposalsByLoanId = new Map();
          propuestasSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.loanId) {
              if (!proposalsByLoanId.has(data.loanId)) {
                proposalsByLoanId.set(data.loanId, []);
              }
              proposalsByLoanId.get(data.loanId).push(data);
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
            .filter(loan => {
              const proposals = proposalsByLoanId.get(loan.id) || [];
              
              // Si no hay propuestas, mostrar la solicitud (disponible para todas las empresas)
              if (proposals.length === 0) {
                return true;
              }
              
              // Si hay propuestas, mostrar solo si NINGUNA es de la empresa del admin
              // (ocultar solo las solicitudes donde esta empresa ya envió propuesta)
              const hasOwnProposal = proposals.some((proposal: any) => proposal.company === options.adminCompany);
              return !hasOwnProposal; // Invertir la lógica: mostrar si NO tiene propuesta propia
            });
          
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
  }, [fetchLoans, options.enableRealtime, options.status, options.adminCompany]);

  return {
    loans,
    loading,
    error,
    fetchLoans,
  };
}
