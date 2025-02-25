// hooks/useLoans.ts
import { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { auth } from '../../firebase';

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
  acceptedOfferId?: string;
}

export function useLoans() {
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [acceptedLoans, setAcceptedLoans] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore();
        const currentUser = auth.currentUser;
        const lenderId = currentUser?.uid;
        
        if (!lenderId) {
          console.error("No authenticated user found");
          setLoading(false);
          return;
        }
        
        // Get all solicitudes that don't have an acceptedOfferId (available for proposals)
        const solicitudesRef = collection(db, "solicitudes");
        
        const unsubscribe = onSnapshot(solicitudesRef, 
          async (snapshot) => {
            // Process available loan requests (no acceptedOfferId)
            const availableLoans = snapshot.docs
              .filter(doc => !doc.data().acceptedOfferId)
              .map(doc => {
                const data = doc.data();
                
                // Handle different date formats correctly
                let createdAtDate: Date;
                if (data.createdAt) {
                  if (data.createdAt instanceof Timestamp) {
                    createdAtDate = data.createdAt.toDate();
                  } else if (data.createdAt.seconds && data.createdAt.nanoseconds) {
                    // Handle Firestore timestamp object format
                    createdAtDate = new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds).toDate();
                  } else if (typeof data.createdAt === 'string') {
                    // If it's a string (ISO format)
                    createdAtDate = new Date(data.createdAt);
                  } else {
                    // Fallback
                    createdAtDate = new Date();
                  }
                } else {
                  createdAtDate = new Date();
                }
                
                return {
                  id: doc.id,
                  userId: data.userId,
                  amount: data.amount,
                  income: data.income,
                  term: data.term,
                  payment: data.payment,
                  status: data.status,
                  createdAt: createdAtDate,
                  acceptedOfferId: data.acceptedOfferId
                } as LoanRequest;
              });
            
            setLoans(availableLoans);
            
            // Find loans where this lender's proposal was accepted
            const propuestasRef = collection(db, "propuestas");
            const propuestasQuery = query(propuestasRef, where("partner", "==", lenderId));
            const propuestasSnapshot = await getDocs(propuestasQuery);
            
            const myProposalIds = propuestasSnapshot.docs.map(doc => doc.id);
            
            // Get loans where acceptedOfferId matches one of this lender's proposals
            const acceptedLoansData = snapshot.docs
              .filter(doc => {
                const data = doc.data();
                return data.acceptedOfferId && myProposalIds.includes(data.acceptedOfferId);
              })
              .map(doc => {
                const data = doc.data();
                
                // Handle different date formats correctly
                let createdAtDate: Date;
                if (data.createdAt) {
                  if (data.createdAt instanceof Timestamp) {
                    createdAtDate = data.createdAt.toDate();
                  } else if (data.createdAt.seconds && data.createdAt.nanoseconds) {
                    // Handle Firestore timestamp object format
                    createdAtDate = new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds).toDate();
                  } else if (typeof data.createdAt === 'string') {
                    // If it's a string (ISO format)
                    createdAtDate = new Date(data.createdAt);
                  } else {
                    // Fallback
                    createdAtDate = new Date();
                  }
                } else {
                  createdAtDate = new Date();
                }
                
                return {
                  id: doc.id,
                  userId: data.userId,
                  amount: data.amount,
                  income: data.income,
                  term: data.term,
                  payment: data.payment,
                  status: data.status,
                  createdAt: createdAtDate,
                  acceptedOfferId: data.acceptedOfferId
                } as LoanRequest;
              });
            
            setAcceptedLoans(acceptedLoansData);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching loans:", err);
            setError(err);
            setLoading(false);
          }
        );
        
        return () => unsubscribe();
      } catch (err) {
        console.error("Error in useLoans hook:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return { loans, acceptedLoans, loading, error };
}