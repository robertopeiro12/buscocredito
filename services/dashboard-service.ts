import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { UserData, SolicitudData, NewSolicitudData, Offer } from "@/types/dashboard";
import { saveAcceptedOfferToStorage } from "@/utils/dashboard-utils";

/**
 * Fetches user data from Firestore
 */
export const fetchUserData = async (userId: string): Promise<UserData> => {
  try {
    const db = getFirestore();
    const userDoc = await getDoc(doc(db, "cuentas", userId));
    
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    } else {
      throw new Error('Documento de usuario no encontrado');
    }
  } catch (error) {
    console.error('fetchUserData: Error occurred:', error);
    throw error;
  }
};

/**
 * Fetches user's loan requests (solicitudes) from Firestore
 */
export const fetchSolicitudes = async (userId: string): Promise<SolicitudData[]> => {
  try {
    const db = getFirestore();
    const solicitudesRef = collection(db, "solicitudes");
    const q = query(solicitudesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const fetchedSolicitudes: SolicitudData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      fetchedSolicitudes.push({
        id: doc.id,
        userId: data.userId,
        purpose: data.purpose,
        type: data.type,
        amount: data.amount,
        term: data.term,
        payment: data.payment,
        income: data.income,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        comision: data.comision,
      });
    });
    
    return fetchedSolicitudes;
  } catch (error) {
    console.error('fetchSolicitudes: Error occurred:', error);
    throw error;
  }
};

/**
 * Fetches offer count for a specific loan
 */
export const fetchOfferCount = async (loanId: string): Promise<number> => {
  try {
    const response = await fetch("/api/loans/offers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ loanId }),
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      const offers = data.data?.offers || [];
      return offers.length;
    }
    return 0;
  } catch (error) {
    console.error("Error getting offer count:", error);
    return 0;
  }
};

/**
 * Deletes a solicitud from Firestore
 */
export const deleteSolicitud = async (solicitudId: string): Promise<void> => {
  const db = getFirestore();
  await deleteDoc(doc(db, "solicitudes", solicitudId));
};

/**
 * Creates a new solicitud in Firestore
 */
export const createSolicitud = async (solicitudData: NewSolicitudData): Promise<void> => {
  try {
    const db = getFirestore();
    await addDoc(collection(db, "solicitudes"), solicitudData);
  } catch (error) {
    console.error("Error creating solicitud:", error);
    throw error;
  }
};

/**
 * Fetches offers for a specific loan
 */
export const fetchOfferData = async (loanId: string): Promise<Offer[]> => {
  try {
    const response = await fetch("/api/loans/offers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ loanId }),
    });

    if (!response.ok) {
      throw new Error("Error al obtener las ofertas");
    }

    const data = await response.json();
    return data.data?.offers || [];
  } catch (error) {
    console.error("Error fetching offer data:", error);
    throw error;
  }
};

/**
 * Checks solicitud status and accepted offer
 */
export const checkSolicitudStatus = async (solicitudId: string): Promise<{
  status: string;
  acceptedOfferId?: string;
}> => {
  try {
    const db = getFirestore();
    const solicitudDoc = await getDoc(doc(db, "solicitudes", solicitudId));
    
    if (solicitudDoc.exists()) {
      const data = solicitudDoc.data();
      return {
        status: data.status,
        acceptedOfferId: data.acceptedOfferId,
      };
    }
    
    return { status: "pending" };
  } catch (error) {
    console.error("Error checking solicitud status:", error);
    return { status: "pending" };
  }
};

/**
 * Accepts an offer and updates related documents
 */
export const acceptOffer = async (
  offerId: string,
  loanId: string,
  offer: Offer
): Promise<void> => {
  try {
    // Update the proposal status using our API endpoint
    const response = await fetch("/api/proposals/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        proposalId: offerId,
        loanId: loanId,
        status: "accepted",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error en la respuesta:", errorData);
      throw new Error("Error al aceptar la oferta");
    }

    // Update the solicitud status
    const db = getFirestore();
    const solicitudRef = doc(db, "solicitudes", loanId);
    await updateDoc(solicitudRef, {
      status: "approved",
      updatedAt: new Date().toISOString(),
      acceptedOfferId: offerId,
    });

    // Store in localStorage
    saveAcceptedOfferToStorage(loanId, offerId);

  } catch (error) {
    console.error("Error accepting offer:", error);
    throw error;
  }
};
