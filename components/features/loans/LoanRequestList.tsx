// components/lender/LoanRequestList.tsx
"use client";

import { motion } from "framer-motion";
import { DollarSign, Clock } from "lucide-react";
import type { LoanRequest } from "@/app/lender/types/loan.types";

export interface LoanRequestListProps {
  requests: LoanRequest[];
  loading: boolean;
  onSelectRequest: (requestId: string) => void;
  selectedRequestId: string | null;
}

export default function LoanRequestList({
  requests,
  loading,
  onSelectRequest,
  selectedRequestId,
}: LoanRequestListProps) {
  if (loading) {
    return (
      <div className="w-full space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md p-4 animate-pulse"
          >
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
      {requests.map((request, index) => (
        <motion.div
          key={request.id}
          layoutId={`request-${request.id}`}
          onClick={() => onSelectRequest(request.id)}
          className={`
            bg-white rounded-lg shadow-md hover:shadow-lg 
            transition-all p-4 cursor-pointer
            ${selectedRequestId === request.id ? "ring-2 ring-[#2EA043]" : ""}
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <h2 className="text-lg font-semibold mb-3">Solicitud #{index + 1}</h2>

          <div className="space-y-2">
            <div className="flex items-center text-gray-700">
              <DollarSign className="h-4 w-4 mr-2 text-[#2EA043]" />
              <span className="font-medium">
                ${request.amount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center text-gray-700">
              <Clock className="h-4 w-4 mr-2 text-[#2EA043]" />
              <span>Plazo: {request.term}</span>
            </div>

            <div className="text-gray-600">Pago: {request.payment}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
