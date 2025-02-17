// app/lender/offer/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { firebaseService } from "@/app/lender/services/firebase.service";
import type {
  LoanRequest,
  PublicUserData,
} from "@/app/lender/types/loan.types";
import { motion } from "framer-motion";

export default function OfferDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [loan, setLoan] = useState<LoanRequest | null>(null);
  const [userData, setUserData] = useState<PublicUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loanData = await firebaseService.getLoanRequest(params.id);
        if (!loanData) {
          setError("Solicitud no encontrada");
          return;
        }

        setLoan(loanData);
        const userData = await firebaseService.getPublicUserData(
          loanData.userId
        );
        setUserData(userData);
      } catch (err) {
        setError("Error al cargar los datos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || "No se encontró la solicitud"}
        </div>
        <button
          onClick={() => router.push("/lender")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Volver al panel
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Detalles de la Solicitud</h1>
          <button
            onClick={() => router.push("/lender")}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
          >
            Volver al panel
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Información del Préstamo
            </h2>
            <div className="space-y-3">
              <p>
                <span className="font-medium">Monto:</span> $
                {loan.amount.toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Plazo:</span> {loan.term}
              </p>
              <p>
                <span className="font-medium">Forma de pago:</span>{" "}
                {loan.payment}
              </p>
              <p>
                <span className="font-medium">Estado:</span> {loan.status}
              </p>
              <p>
                <span className="font-medium">Fecha de creación:</span>{" "}
                {new Date(loan.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {userData && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Información del Solicitante
              </h2>
              <div className="space-y-3">
                <p>
                  <span className="font-medium">País:</span> {userData.country}
                </p>
                <p>
                  <span className="font-medium">Estado:</span> {userData.state}
                </p>
                <p>
                  <span className="font-medium">Ciudad:</span> {userData.city}
                </p>
                <p>
                  <span className="font-medium">Propósito:</span>{" "}
                  {userData.purpose}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <button
            onClick={() => router.push(`/lender?offer=${params.id}`)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Hacer una propuesta
          </button>
        </div>
      </motion.div>
    </div>
  );
}
