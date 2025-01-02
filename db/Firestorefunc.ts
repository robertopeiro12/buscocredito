import "server-only";
import {getFirestore } from "firebase-admin/firestore"

export const create_subaccount_doc = async (name: string, email: string, admin_uid: string, account_uid: string): Promise<{ status: number, error?: string }> => {
    const Firestore = getFirestore();
    const docRef = Firestore.collection('cuentas').doc(account_uid);
    try {
        await docRef.set({
            Nombre: name,
            Empresa: "",
            Empresa_id: admin_uid,
            type: "b_sale",
            email: email,
        });
        return { status: 200 };
    } catch (error) {
        console.error("Error adding document: ", error);
        return { error: error.message, status: 500 };
    }
}

export const getUserOffers = async () => {
    const Firestore = getFirestore();
    const accountRef = Firestore.collection('solicitudes')
    try {
        const snapshot = await accountRef.get();
        const offers = snapshot.docs.map(doc => doc.data());
        return { status: 200, offers: offers };
    } catch (error) {
        console.error("Error getting offers: ", error);
        return { error: error.message, status: 500 };
    }
}