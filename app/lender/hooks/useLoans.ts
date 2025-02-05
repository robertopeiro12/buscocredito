// hooks/useLoans.ts
import { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';

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
}

export function useLoans() {
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const db = getFirestore();
    const solicitudesRef = collection(db, "solicitudes");

    const unsubscribe = onSnapshot(solicitudesRef, 
      (snapshot) => {
        const fetchedLoans = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            amount: data.amount,
            income: data.income,
            term: data.term,
            payment: data.payment,
            status: data.status,
            createdAt: data.createdAt?.toDate() || new Date()
          } as LoanRequest;
        });
        
        setLoans(fetchedLoans);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching loans:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { loans, loading, error };
}