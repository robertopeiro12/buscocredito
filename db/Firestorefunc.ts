import "server-only"
import { getFirestore, FieldValue } from "firebase-admin/firestore"

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
  } catch (error) {
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
  } catch (error) {
    console.error("Error getting offers: ", error)
    return { error: error.message, status: 500 }
  }
}

export const getUserOfferData = async (id: string) => {
  const Firestore = getFirestore()
  const accountRef = Firestore.collection("cuentas").doc(id)
  try {
    const snapshot = await accountRef.get()
    console.log("snapshot", snapshot.data())
    const filteredData = {
      birthday: snapshot.data().birthday,
      country: snapshot.data().address.country,
    }
    const json_data = JSON.stringify(filteredData)
    console.log("json_data", json_data)
    return { status: 200, data: json_data }
  } catch (error) {
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
        monthly_payment: calculateMonthlyPayment(data.amount, data.interest_rate, data.deadline),
        amortization: data.amortization,
        medical_balance: data.medical_balance,
        comision: data.comision
      };
    });

    return { status: 200, data: offers };
  } catch (error) {
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

