// components/lender/ProposalForm.tsx
import { motion } from "framer-motion";
import type { ProposalData } from "@/app/lender/types/loan.types";

interface ProposalFormProps {
  proposal: ProposalData;
  loading?: boolean;
  error?: string | null;
  onUpdate: (fields: Partial<ProposalData>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function ProposalForm({
  proposal,
  loading,
  error,
  onUpdate,
  onSubmit,
  onCancel,
}: ProposalFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Generar Propuesta</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna 1 */}
        <div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Monto</label>
            <input
              type="number"
              min="0"
              className="w-full p-2 border rounded-md"
              value={proposal.amount}
              onChange={(e) =>
                onUpdate({
                  amount: Math.max(0, parseFloat(e.target.value) || 0),
                })
              }
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Comisión (%)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full p-2 border rounded-md"
              value={proposal.comision}
              onChange={(e) =>
                onUpdate({
                  comision: Math.max(0, parseFloat(e.target.value) || 0),
                })
              }
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Forma de Pago</label>
            <select
              className="w-full p-2 border rounded-md"
              value={proposal.amortization}
              onChange={(e) =>
                onUpdate({
                  amortization: e.target.value as ProposalData["amortization"],
                })
              }
            >
              <option value="mensual">Mensual</option>
              <option value="quincenal">Quincenal</option>
              <option value="semanal">Semanal</option>
            </select>
          </div>
        </div>

        {/* Columna 2 */}
        <div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Plazo (semanas)</label>
            <input
              type="number"
              min="0"
              className="w-full p-2 border rounded-md"
              value={proposal.deadline}
              onChange={(e) =>
                onUpdate({
                  deadline: Math.max(0, parseInt(e.target.value) || 0),
                })
              }
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">
              Tasa de Interés (%)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full p-2 border rounded-md"
              value={
                proposal.interest_rate === -1 ? "" : proposal.interest_rate
              }
              onChange={(e) =>
                onUpdate({
                  interest_rate: Math.max(0, parseFloat(e.target.value) || 0),
                })
              }
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">
              Seguro de Vida Saldo Deudor (%)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full p-2 border rounded-md"
              value={
                proposal.medical_balance === -1 ? "" : proposal.medical_balance
              }
              onChange={(e) =>
                onUpdate({
                  medical_balance: Math.max(0, parseFloat(e.target.value) || 0),
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          disabled={loading}
        >
          Cancelar
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSubmit}
          className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar Propuesta"}
        </motion.button>
      </div>
    </motion.div>
  );
}
