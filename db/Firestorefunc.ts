import "server-only"
import { getFirestore, FieldValue } from "firebase-admin/firestore"
import { initAdmin } from './FirebaseAdmin'

// Helper function to get Firebase Admin Firestore instance
function getAdminFirestore() {
  initAdmin(); // Asegurar que esté inicializado
  return getFirestore(); // Obtener instancia sin async
}

export const create_subaccount_doc = async (
  name: string,
  email: string,
  admin_uid: string,
  account_uid: string,
  Empresa: string
): Promise<{ status: number; error?: string }> => {
  const Firestore = getFirestore();
  const docRef = Firestore.collection("cuentas").doc(account_uid);

  try {
    await docRef.set({
      Empresa: Empresa,
      Empresa_id: admin_uid,
      Nombre: name,
      email: email,
      type: "b_sale"
    });
    return { status: 200 };
  } catch (error: any) {
    console.error("Error adding document: ", error);
    return { error: error.message, status: 500 };
  }
};

export const getUserOffers = async () => {
  const Firestore = getFirestore()
  const accountRef = Firestore.collection("solicitudes")
  try {
    const snapshot = await accountRef.get()
    const offers = snapshot.docs.map((doc) => doc.data())
    return { status: 200, offers: offers }
  } catch (error: any) {
    console.error("Error getting offers: ", error)
    return { error: error.message, status: 500 }
  }
}

export const getUserOffersByUserId = async (userId: string) => {
  const Firestore = getFirestore()
  const accountRef = Firestore.collection("solicitudes")
  try {
    // Filtrar ofertas por el usuario específico
    const snapshot = await accountRef.where("user_id", "==", userId).get()
    const offers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return { status: 200, offers: offers }
  } catch (error: any) {
    console.error("Error getting user offers: ", error)
    return { error: error.message, status: 500 }
  }
}

export const getUserOfferData = async (id: string) => {
  const Firestore = getFirestore()
  const accountRef = Firestore.collection("cuentas").doc(id)
  try {
    const snapshot = await accountRef.get()
    const userData = snapshot.data();
    
    if (!userData) {
      return { error: "User data not found", status: 404 };
    }
    
    const filteredData = {
      birthday: userData.birthday || 'No disponible',
      country: userData.address?.country || 'No disponible',
      state: userData.address?.state || 'No disponible',
      city: userData.address?.city || 'No disponible',
      purpose: userData.purpose || 'No especificado'
    }
    const json_data = JSON.stringify(filteredData)
    return { status: 200, data: json_data }
  } catch (error: any) {
    console.error("Error getting offer: ", error)
    return { error: error.message, status: 500 }
  }
}


export const add_propuesta = async (id: string, offer_data: any) => {
    
    const Firestore = getFirestore();
    const accountRef = Firestore.collection('solicitudes').doc(id)
    const propuestasRef = Firestore.collection('propuestas')
    try {
    const newDocRef = await propuestasRef.add(offer_data);
    const newDocId = newDocRef.id;
      
     await accountRef.update({
            accepted: FieldValue.arrayUnion(newDocId)
        });
        return { status: 200 };
    } catch (error: any) {
        console.error("Error updating offer: ", error);
        return { error: error.message, status: 500 };
    }
  }
export async function delete_subaccount_doc(userId: string) {
  try {
    const db = getFirestore()
    await db.collection("cuentas").doc(userId).delete()
    return { status: 200, message: "Documento eliminado correctamente" }
  } catch (error: any) {
    console.error("Error al eliminar documento en Firestore:", error)
    return {
      status: 500,
      error: `Error al eliminar documento en Firestore: ${error.message}`,

    }
  }
}

export const getLoanOffers = async (loanId: string) => {
  const Firestore = getFirestore();
  const propuestasRef = Firestore.collection("propuestas");
  
  try {
    const snapshot = await propuestasRef
      .where("loanId", "==", loanId)
      .get();
    
    const offers = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        
        lender_name: data.company,
        amount: data.amount,
        interest_rate: data.interest_rate,
        term: data.deadline,
        monthly_payment: data.amortization_frequency,
        amortization: data.amortization,
        medical_balance: data.medical_balance,
        comision: data.comision,
        deadline: data.deadline
      };
    });

    return { status: 200, data: offers };
  } catch (error: any) {
    console.error("Error getting offers: ", error);
    return { error: error.message, status: 500 };
  }
};

// Helper function to calculate monthly payment
function calculateMonthlyPayment(amount: number, interestRate: number, term: number): number {
  const monthlyRate = (interestRate / 100) / 12;
  const payments = term * (12/52); // Convert weeks to months
  const payment = (amount * monthlyRate * Math.pow(1 + monthlyRate, payments)) / 
                 (Math.pow(1 + monthlyRate, payments) - 1);
  return Math.round(payment * 100) / 100;
}

export const getLenderProposals = async (lenderId: string) => {
  try {
    const Firestore = getAdminFirestore();
    const propuestasRef = Firestore.collection("propuestas");
    
    // Buscar propuestas donde el partner sea el lenderId
    const allDocs = await propuestasRef
      .where("partner", "==", lenderId)
      .get();
    
    const proposals = await Promise.all(allDocs.docs.map(async (doc) => {
      const data = doc.data();
      let contactInfo = null;

      // Si la propuesta fue aceptada, obtener datos de contacto del solicitante
      if (data.status === "accepted" && data.loanId) {
        try {
          // Obtener la solicitud para conseguir el userId
          const solicitudDoc = await Firestore.collection("solicitudes").doc(data.loanId).get();
          if (solicitudDoc.exists) {
            const solicitudData = solicitudDoc.data();
            const userId = solicitudData?.userId;
            
            if (userId) {
              // Obtener datos de contacto del usuario
              const userDoc = await Firestore.collection("cuentas").doc(userId).get();
              if (userDoc.exists) {
                const userData = userDoc.data();
                // Construir nombre completo con los campos correctos
                const firstName = userData?.name || '';
                const lastName = userData?.last_name || '';
                const secondLastName = userData?.second_last_name || '';
                const fullName = `${firstName} ${lastName} ${secondLastName}`.trim().replace(/\s+/g, ' ');
                
                contactInfo = {
                  fullName: fullName || userData?.Nombre || "No disponible",
                  email: userData?.email || "No disponible",
                  phone: userData?.phone || userData?.telefono || "No disponible"
                };
              }
            }
          }
        } catch (error) {
          console.error("Error getting contact info for proposal:", doc.id, error);
        }
      }
      
      return {
        id: doc.id,
        amortization: data.amortization,
        amortization_frequency: data.amortization_frequency,
        medical_balance: data.medical_balance,
        comision: data.comision,
        amount: data.amount,
        deadline: data.deadline,
        interest_rate: data.interest_rate,
        term: data.deadline,
        status: data.status,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : 
                  data.createdAt instanceof Date ? data.createdAt.toISOString() : null,
        requestInfo: data.requestInfo || {},
        contactInfo: contactInfo
      };
    }));

    return { status: 200, data: proposals };
  } catch (error: any) {
    console.error("Error getting lender proposals:", error);
    return { error: error.message, status: 500 };
  }
};// Notification functions
export const createNotification = async (notificationData: {
  recipientId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
}) => {
  const Firestore = getAdminFirestore();
  const notificationsRef = Firestore.collection("notifications");
  
  try {
    const newNotification = {
      ...notificationData,
      read: false,
      createdAt: new Date(),
    };
    
    console.log("Creating notification:", newNotification);
    const docRef = await notificationsRef.add(newNotification);
    console.log("Notification created with ID:", docRef.id);
    
    return { status: 200, notificationId: docRef.id };
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return { error: error.message, status: 500 };
  }
};

export const getNotificationsForUser = async (userId: string) => {
  try {
    const Firestore = getAdminFirestore();
    const notificationsRef = Firestore.collection("notifications");
    
    const snapshot = await notificationsRef
      .where("recipientId", "==", userId)
      .limit(50)
      .get();
    
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordenar por fecha en el cliente
    notifications.sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime(); // Más recientes primero
    });
    
    return { status: 200, data: notifications };
  } catch (error: any) {
    console.error("Error getting notifications:", error);
    return { error: error.message, status: 500 };
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  const Firestore = getFirestore();
  const notificationRef = Firestore.collection("notifications").doc(notificationId);
  
  try {
    await notificationRef.update({
      read: true,
      readAt: new Date()
    });
    
    return { status: 200 };
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    return { error: error.message, status: 500 };
  }
};

export const getUnreadNotificationCount = async (userId: string) => {
  const Firestore = getFirestore();
  const notificationsRef = Firestore.collection("notifications");
  
  try {
    const snapshot = await notificationsRef
      .where("recipientId", "==", userId)
      .where("read", "==", false)
      .get();
    
    return { status: 200, count: snapshot.size };
  } catch (error: any) {
    console.error("Error getting unread count:", error);
    return { error: error.message, status: 500 };
  }
};

