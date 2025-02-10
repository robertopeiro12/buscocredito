import "server-only";
import {getFirestore ,FieldValue } from "firebase-admin/firestore"

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

export const getUserOfferData = async (id: string) => {
    const Firestore = getFirestore();
    const accountRef = Firestore.collection('cuentas').doc(id)
    try {
        const snapshot = await accountRef.get();
        console.log("snapshot", snapshot.data());   
        const filteredData = {
            birthday: snapshot.data().birthday,
            country: snapshot.data().address.country,
        };
        const json_data = JSON.stringify(filteredData);
        console.log("json_data", json_data);
        return { status: 200, data: json_data};
    } catch (error) {
        console.error("Error getting offer: ", error);
        return { error: error.message, status: 500 };
    }
}

export const add_propuesta = async (id: string, offer_data: any) => {
    
    const Firestore = getFirestore();
    const accountRef = Firestore.collection('solicitudes').doc(id)
    const propuestasRef = Firestore.collection('propuestas')
    try {
    const newDocRef = await propuestasRef.add(offer_data);
    const newDocId = newDocRef.id;
    console.log("New document ID: ", newDocId);
      
     await accountRef.update({
            accepted: FieldValue.arrayUnion(newDocId)
        });
        return { status: 200 };
    } catch (error) {
        console.error("Error updating offer: ", error);
        return { error: error.message, status: 500 };
    }
}
