import "server-only";
import { getFirestore } from 'firebase-admin/firestore';

export const getUserContactInfo = async (userId: string) => {
  const db = getFirestore();
  const userRef = db.collection("cuentas").doc(userId);
  
  try {
    const snapshot = await userRef.get();
    const userData = snapshot.data();
    
    if (!userData) {
      return { error: "User data not found", status: 404 };
    }
    
    const contactInfo = {
      fullName: userData.fullName || userData.name || userData.nombre || 'No disponible',
      email: userData.email || 'No disponible',
      phone: userData.phone || userData.telefono || userData.celular || 'No disponible',
      address: {
        country: userData.address?.country || 'No disponible',
        state: userData.address?.state || 'No disponible', 
        city: userData.address?.city || 'No disponible',
        fullAddress: userData.address?.fullAddress || userData.address?.direccion || 'No disponible'
      }
    };
    
    return { status: 200, data: contactInfo };
  } catch (error: any) {
    console.error("Error getting contact info:", error);
    return { error: error.message, status: 500 };
  }
};
