'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signOut} from "firebase/auth"
import { useEffect } from "react"
import { auth } from '../firebase'
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
// Mock data (in a real application, this would come from an API)
// const offers = [
//   { id: '1', userId: 'user1', amount: 5000, interestRate: 5.5, term: 12, status: 'pending', createdAt: '2023-04-01T10:00:00Z' },
//   { id: '2', userId: 'user2', amount: 10000, interestRate: 6.0, term: 24, status: 'pending', createdAt: '2023-04-02T14:30:00Z' },
//   { id: '3', userId: 'user3', amount: 7500, interestRate: 5.8, term: 18, status: 'pending', createdAt: '2023-04-03T09:15:00Z' },
// ];

// const borrowDetails = {
//   user1: { userId: 'user1', creditScore: 720, income: 60000, employmentStatus: 'Full-time', debtToIncomeRatio: 0.3 },
//   user2: { userId: 'user2', creditScore: 680, income: 55000, employmentStatus: 'Part-time', debtToIncomeRatio: 0.35 },
//   user3: { userId: 'user3', creditScore: 750, income: 75000, employmentStatus: 'Full-time', debtToIncomeRatio: 0.25 },
// };

const adminData = {
  name: "Admin User",
  email: "admin@example.com",
  avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
};

export default function Lender() {
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [user, setUser] = useState("")
  const [offers, setOffers] = useState<any[]>([]);
  const borrowDetails = {};
  const selectedOffer = selectedOfferId ? offers.find(o => o.id === selectedOfferId) : null;
  const selectedBorrowerDetails = selectedOffer ? borrowDetails[selectedOffer.userId as keyof typeof borrowDetails] : null;
  

   useEffect(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(user.uid)
          console.log("uid", user.uid)
          get_offer()
          
        } else {
          console.log("user is logged out")
        }
      })
    }, [])
    

  const get_offer = async() =>{
    // try {
    //   const response = await fetch('/api/getUserOffers', {
    //     method: 'GET',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //   });

    //   if (response.ok) {
    //     const data = await response.json();
    //     console.log("Data:", data);
    //     if (response.status === 200) {
    //       setOffers(data.offers);
    //     } else {
    //       console.error("Error fetching offers:", response.error);
    //     }
    //   } else {
    //     const errorData = await response.json();
    //     console.error("Error getting data:", errorData.error);
    //   }
    // } catch (error) {
    //   console.error("Error getting data:", error);
    // }
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
    });

  }

  const sign_out = () => {
    // Implement sign out logic here
    console.log("Signing out...");
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
              {offers.map((offer) => (
                <motion.div
                  key={offer.id}
                  layoutId={`offer-${offer.id}`}
                  onClick={() => setSelectedOfferId(offer.id)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h2 className="text-xl font-semibold mb-2">Offer #{offer.id}</h2>
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
              {selectedOffer && selectedBorrowerDetails ? (
                <motion.div
                  key={selectedOffer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-md p-4"
                >
                  <h2 className="text-2xl font-semibold mb-4">Offer Details</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Offer Information</h3>
                      <p>Amount: ${selectedOffer.amount}</p>
                      <p>Income: {selectedOffer.income}</p>
                      <p>Term: {selectedOffer.term}</p>
                      {/* <p>Created At: {new Date(selectedOffer.createdAt).toLocaleString()}</p> */}
                      <span className="inline-block mt-2 px-2 py-1 text-sm rounded-full bg-gray-200">
                        {selectedOffer.status}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Borrower Details</h3>
                      <p>Credit Score: {selectedBorrowerDetails.creditScore}</p>
                      <p>Income: ${selectedBorrowerDetails.income}</p>
                      <p>Employment Status: {selectedBorrowerDetails.employmentStatus}</p>
                      <p>Debt-to-Income Ratio: {(selectedBorrowerDetails.debtToIncomeRatio * 100).toFixed(2)}%</p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                    >
                      Reject
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Accept
                    </motion.button>
                  </div>
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

