// services/firebase.service.ts
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  addDoc, 
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { auth } from '../../firebase';
import type { LoanRequest, ProposalData, PublicUserData } from '@/app/lender/types/loan.types';

export class FirebaseService {
  private db = getFirestore();

  // Servicios relacionados con préstamos
  async getLoanRequest(id: string): Promise<LoanRequest | null> {
    try {
      const docRef = doc(this.db, "solicitudes", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as LoanRequest;
      }
      return null;
    } catch (error) {
      console.error("Error fetching loan request:", error);
      throw error;
    }
  }

  subscribeToLoanRequests(callback: (loans: LoanRequest[]) => void) {
    const loansQuery = query(
      collection(this.db, "solicitudes"),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(loansQuery, (snapshot) => {
      const loans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LoanRequest[];
      callback(loans);
    });
  }

  // Servicios relacionados con propuestas
  async createProposal(proposal: ProposalData, loanId: string) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No authenticated user");

      await addDoc(collection(this.db, "propuestas"), {
        ...proposal,
        loanId,
        lenderId: currentUser.uid,
        status: 'pending',
        createdAt: Timestamp.now()
      });

      return true;
    } catch (error) {
      console.error("Error creating proposal:", error);
      throw error;
    }
  }

  // Servicios relacionados con usuarios
  async getPublicUserData(userId: string): Promise<PublicUserData | null> {
    try {
      const docRef = doc(this.db, "users", userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        return {
          city: userData.address?.city || '',
          state: userData.address?.state || '',
          country: userData.address?.country || '',
          purpose: userData.purpose || ''
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  }

  // Servicios relacionados con prestamistas
  async getLenderInfo(lenderId: string) {
    try {
      const docRef = doc(this.db, "cuentas", lenderId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          name: docSnap.data().name,
          company: docSnap.data().Empresa,
          company_id: docSnap.data().company_id
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching lender info:", error);
      throw error;
    }
  }

  // Utilidades
  async getDocumentCount(collectionName: string): Promise<number> {
    try {
      const snapshot = await getDocs(collection(this.db, collectionName));
      return snapshot.size;
    } catch (error) {
      console.error("Error getting document count:", error);
      throw error;
    }
  }
}

export const firebaseService = new FirebaseService();