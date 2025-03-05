// components/ProposalForm.tsx
import { motion } from "framer-motion";
import { DollarSign, Percent, Calendar, ClipboardCheck } from "lucide-react";
import { Button, Input, Select, SelectItem, Card } from "@nextui-org/react";
import type { ProposalData } from "@/app/lender/types/loan.types";

interface ProposalFormProps {
  proposal: ProposalData;
  loading: boolean;
  error: string | null;
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
    <Card className="p-6">
      {/* Encabezado del Formulario */}
      <div className="border-b pb-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Nueva Propuesta</h2>
        <p className="text-sm text-gray-500 mt-1">
          Complete los detalles de su oferta para el solicitante
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Formulario en Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Columna 1 */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto de la Oferta
            </label>
            <Input
              type="number"
              startContent={<DollarSign className="w-4 h-4 text-gray-400" />}
              value={proposal.amount.toString()}
              onChange={(e) => onUpdate({ amount: Number(e.target.value) })}
              placeholder="Ingrese el monto"
              className="w-full"
              size="lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comisión por Apertura (%)
            </label>
            <Input
              type="number"
              startContent={<Percent className="w-4 h-4 text-gray-400" />}
              value={proposal.comision.toString()}
              onChange={(e) => onUpdate({ comision: Number(e.target.value) })}
              placeholder="Ingrese la comisión"
              className="w-full"
              size="lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amortización
            </label>
            <Select
              size="lg"
              placeholder="Seleccione frecuencia de pago"
              selectedKeys={[proposal.amortization]}
              onChange={(e) =>
                onUpdate({ amortization: e.target.value as any })
              }
            >
              <SelectItem key="mensual">Mensual</SelectItem>
              <SelectItem key="quincenal">Quincenal</SelectItem>
              <SelectItem key="semanal">Semanal</SelectItem>
            </Select>
          </div>
        </div>

        {/* Columna 2 */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plazo (semanas)
            </label>
            <Input
              type="number"
              startContent={<Calendar className="w-4 h-4 text-gray-400" />}
              value={proposal.deadline.toString()}
              onChange={(e) => onUpdate({ deadline: Number(e.target.value) })}
              placeholder="Ingrese el plazo"
              className="w-full"
              size="lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tasa de Interés (%)
            </label>
            <Input
              type="number"
              startContent={<Percent className="w-4 h-4 text-gray-400" />}
              value={
                proposal.interest_rate === -1
                  ? ""
                  : proposal.interest_rate.toString()
              }
              onChange={(e) =>
                onUpdate({ interest_rate: Number(e.target.value) })
              }
              placeholder="Ingrese la tasa"
              className="w-full"
              size="lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seguro de Vida Saldo Deudor (%)
            </label>
            <Input
              type="number"
              startContent={
                <ClipboardCheck className="w-4 h-4 text-gray-400" />
              }
              value={
                proposal.medical_balance === -1
                  ? ""
                  : proposal.medical_balance.toString()
              }
              onChange={(e) =>
                onUpdate({ medical_balance: Number(e.target.value) })
              }
              placeholder="Ingrese el porcentaje"
              className="w-full"
              size="lg"
            />
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          color="danger"
          variant="light"
          onClick={onCancel}
          size="lg"
          className="min-w-[120px]"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          color="success"
          onClick={onSubmit}
          size="lg"
          className="min-w-[120px]"
          isLoading={loading}
        >
          Enviar Propuesta
        </Button>
      </div>
    </Card>
  );
}
