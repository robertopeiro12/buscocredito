'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { onAuthStateChanged, signOut} from "firebase/auth"
import { useEffect } from "react"
import { auth } from '../firebase'
import { useRouter } from 'next/navigation';
import {doc, getFirestore, collection, onSnapshot,getDoc } from 'firebase/firestore';
import { ProposalData, PartnerData } from '@/types';

const adminData = {
  name: "Admin User",
  email: "admin@example.com",
  avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
};

export default function Lender() {
  const router = useRouter();
  const [user, setUser] = useState("")
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const selectedOffer = selectedOfferId ? offers.find(o => o.id === selectedOfferId) : null;
  const [offeruserdata, setOfferuserdata] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [proposaldata, setproposaldata] = useState<ProposalData | null>(null);
  const [partnerdata, setPartnerData] = useState<PartnerData>({ name: '', company: '', company_id: '' });

  
// INITIAL USE EFFECT
   useEffect(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(user.uid)
          console.log("uid", user.uid)
          get_partner_data(user.uid)
          get_offer()
          
        } else {
          console.log("user is logged out")
        }
      })
    }, [])

// Basic Functions
const sign_out = () => {
  signOut(auth).then(() => {
    console.log("user is logged out")
    setUser("");
    router.push('/login')
  }).catch((error) => {
    console.log("error", error)
  });
};

const get_partner_data = async(uid) =>{

  const db = getFirestore();
  const partnersRef = collection(db, "cuentas");
  const query = doc(partnersRef, uid);
  const docSnap = await getDoc(query);
  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
    setPartnerData((prev) => ({
      ...prev,
      name: docSnap.data().name,
      company_id: docSnap.data().company_id,
      company: docSnap.data().Empresa
    }));
  } else {
    console.log("No such document!");
  } 
};
    

  const get_offer = async() =>{
    const db = getFirestore();
    const solicitudesRef = collection(db, "solicitudes");

    onSnapshot(solicitudesRef, (querySnapshot) => {
      const fetchedOffers = [];
      querySnapshot.forEach((doc) => {
        const temp = doc.data();
        temp['id'] = doc.id;
        fetchedOffers.push(temp);
      });
      setOffers(fetchedOffers);
      console.log(fetchedOffers);
    });

  }

  const get_user_data = async(id, userId) =>{
    try {
      const response = await fetch('/api/getUserOfferData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (response.status === 200) {
          console.log("Datas:", data.data);
          setOfferuserdata(JSON.parse(data.data));
          setSelectedOfferId(id);

        } else {
          console.error("Error fetching user data:", response.error);
        }
      } else {
        const errorData = await response.json();
        console.error("Error getting data:", errorData.error);
      }
    } catch (error) {
      console.error("Error getting data:", error);
    }
  }


  const updateOffer = async (id: string) => {
    try {
      await fetch('/api/updateOffer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, amount: editedAmount, term: editedTerm }),
      });
      setIsEditing(false);
      // ...existing code...
    } catch (error) {
      console.error('Error updating offer:', error);
    }
  };
  


  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="font-bold text-xl text-gray-800">Admin Dashboard</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-8 w-8 rounded-full"
                  src={adminData.avatar}
                  alt="Admin user"
                />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{adminData.name}</div>
                <div className="text-sm font-medium text-gray-500">{adminData.email}</div>
              </div>
              <motion.button
                onClick={sign_out}
                className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Worker Dashboard</h1>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Offer list */}
          <div className="w-full md:w-1/2">
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              {offers.map((offer, index) => (
                <motion.div
                  key={offer.id}
                  layoutId={`offer-${offer.id}`}
                  onClick={() => get_user_data(offer.id, offer.userId)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer"
                  whileHover={{ scale: 1.03 }}  
                  whileTap={{ scale: 0.98 }}
                >
                  <h2 className="text-xl font-semibold mb-2">Offer #{index + 1}</h2>
                  <p>Amount: ${offer.amount}</p>
                  <p>Income: {offer.income}</p>
                  <p>Term: {offer.term}</p>
                  <span className="inline-block mt-2 px-2 py-1 text-sm rounded-full bg-gray-200">
                    {offer.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Offer details */}
          <div className="w-full md:w-1/2">
            <AnimatePresence mode="wait">
              {selectedOffer && offeruserdata ? (
                <motion.div
                  key={selectedOffer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-md p-4"
                >
                  <h2 className="text-2xl font-semibold mb-4">Detalles de solicitud</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Solicitud</h3>
                      <p>Cantidad: ${selectedOffer.amount}</p>
                      <p>Ganancias: {selectedOffer.income}</p>
                      <p>Plazo: {selectedOffer.term}</p>
                      <p>Amortizacion: {selectedOffer.payment}</p>
                      {/* <p>Created At: {new Date(selectedOffer.createdAt).toLocaleString()}</p> */}
                      <span className="inline-block mt-2 px-2 py-1 text-sm rounded-full bg-gray-200">
                        {selectedOffer.status}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Detalles del prestatario</h3>
                      <p>Pais: {offeruserdata.country}</p>
                      <p>Motivo: {offeruserdata.country}</p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4 mt-4">
                  
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setproposaldata({
                          company: ,
                          amount: selectedOffer.amount,
                          comision: selectedOffer.comision,
                          amortization: selectedOffer.amortization,
                          partner: offeruserdata.partner,
                          deadline: parseInt(selectedOffer.term.split(' ')[0]) || 0,
                          interest_rate: -1,
                          medical_balance: -1,
                        });
                        setIsEditing(true);
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      Generar propuesta
                    </motion.button>
                  </div>


                  {isEditing && (
                    <div className='fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex items-center justify-center' >
                    
                    <div className=" fixed mt-4 p-4 px-6 border bg-white rounded-lg shadow-md justify-center items-center flex flex-col">
                    <button onClick={() => setIsEditing(false)} className="absolute top-2 right-2 text-red-500">X</button>
                      <h2 className="text-2xl font-semibold mb-4">Generar propuesta</h2>
                      <div className="flex items-center justify-center flex-row">
                      <div className="flex items-left flex-col  mr-2">
                      <label className="block mb-2 font-black">Empresa:</label>
                      <input
                        className="border mb-2 p-1 border-[#858585] rounded-md"
                        value={editedAmount}
                        onChange={(e) => setEditedAmount(e.target.value)}
                      />
                      <label className="block mb-2 font-black">Monto:</label>
                      <input
                        className="border mb-2 p-1 border-[#858585] rounded-md"
                        value={editedTerm}
                        onChange={(e) => setEditedTerm(e.target.value)}
                      />
                       <label className="block mb-2 font-black">Comision:</label>
                      <input
                        className="border mb-2 p-1 border-[#858585] rounded-md"
                        value={editedTerm}
                        onChange={(e) => setEditedTerm(e.target.value)}
                      />
                       <label className="block mb-2 font-black">Amortizacion:</label>
                      <input
                        className="border mb-2 p-1 border-[#858585] rounded-md"
                        value={editedTerm}
                        onChange={(e) => setEditedTerm(e.target.value)}
                      />
                      </div>
                      <div className="flex items-left flex-col  px-2">
                      <label className="block mb-2 font-black">Representante:</label>
                      <input
                        className="border mb-2 p-1 border-[#858585] rounded-md"
                        value={editedAmount}
                        onChange={(e) => setEditedAmount(e.target.value)}
                      />
                      <label className="block mb-2 font-black">Plazo:</label>
                      <input
                        className="border mb-2 p-1 border-[#858585] rounded-md"
                        value={editedAmount}
                        onChange={(e) => setEditedAmount(e.target.value)}
                      />
                      <label className="block mb-2 font-black">Tasa de interes:</label>
                      <input
                        className="border mb-2 p-1 border-[#858585] rounded-md"
                        value={editedTerm}
                        onChange={(e) => setEditedTerm(e.target.value)}
                      />
                      <label className="block mb-2 font-black">Seguro de Vida saldo deudor:</label>
                      <input
                        className="border mb-2 p-1 border-[#858585] rounded-md"
                        value={editedTerm}
                        onChange={(e) => setEditedTerm(e.target.value)}
                      />
                      </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateOffer(selectedOffer.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mt-6"
                      >
                       Enviar propuesta
                      </motion.button>
                    </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-md p-4"
                >
                  <p className="text-gray-500">Select an offer to view details</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 text-gray-600 p-4">
        <div className="container mx-auto text-center">
          © 2023 Worker Dashboard. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

