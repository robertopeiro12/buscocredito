// app/lender/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect } from "react";
import { auth } from "../firebase";
import { useRouter } from "next/navigation";
import {
  doc,
  getFirestore,
  collection,
  onSnapshot,
  getDoc,
} from "firebase/firestore";

// Hooks
import { useLoans } from "./hooks/useLoans";
import { useProposal } from "./hooks/useProposal";

// Components
import LoanRequestList from "@/components/LoanRequestList";
import LoanRequestDetails from "@/components/LoanRequestDetails";
import { ProposalForm } from "@/components/ProposalForm";

// Types
import type {
  PublicUserData,
  LoanRequest,
} from "@/app/lender/types/loan.types";

export default function LenderPage() {
  const router = useRouter();
  const [user, setUser] = useState<string>("");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  const [partnerData, setPartnerData] = useState({
    name: "",
    company: "",
    company_id: "",
  });
  const [userData, setUserData] = useState<PublicUserData | null>(null);

  const { loans: requests, loading } = useLoans();
  const selectedRequest = selectedRequestId
    ? requests.find((r) => r.id === selectedRequestId)
    : null;

  const {
    proposalData,
    updateProposal,
    submitProposal,
    loading: submitting,
    error: submitError,
    resetProposal,
  } = useProposal(selectedRequest);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user.uid);
        getPartnerData(user.uid);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const getPartnerData = async (uid: string) => {
    const db = getFirestore();
    const docRef = doc(db, "cuentas", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setPartnerData({
        name: docSnap.data().name,
        company: docSnap.data().Empresa,
        company_id: docSnap.data().company_id,
      });
    }
  };

  const getUserData = async (userId: string) => {
    try {
      const response = await fetch("/api/getUserOfferData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.data ? JSON.parse(data.data) : null);
      }
    } catch (error) {
      console.error("Error getting data:", error);
    }
  };

  const handleSelectRequest = async (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (request) {
      setSelectedRequestId(requestId);
      await getUserData(request.userId);
    }
  };

  const handleSubmitOffer = async () => {
    const success = await submitProposal();
    if (success) {
      setIsCreatingOffer(false);
      resetProposal();
    }
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        router.push("/login");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="font-bold text-xl text-gray-800">
                Panel de {partnerData.company}
              </span>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-gray-600">{partnerData.name}</span>
              <motion.button
                onClick={handleSignOut}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow container mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <LoanRequestList
              requests={requests}
              loading={loading}
              onSelectRequest={handleSelectRequest}
              selectedRequestId={selectedRequestId}
            />
          </div>
          <div className="w-full md:w-1/2">
            <AnimatePresence mode="wait">
              {isCreatingOffer ? (
                <ProposalForm
                  proposal={proposalData}
                  loading={submitting}
                  error={submitError}
                  onUpdate={updateProposal}
                  onSubmit={handleSubmitOffer}
                  onCancel={() => {
                    setIsCreatingOffer(false);
                    resetProposal();
                  }}
                />
              ) : (
                <LoanRequestDetails
                  request={selectedRequest}
                  userData={userData}
                  onMakeOffer={() => {
                    updateProposal({
                      company: partnerData.company,
                      partner: partnerData.name,
                    });
                    setIsCreatingOffer(true);
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
