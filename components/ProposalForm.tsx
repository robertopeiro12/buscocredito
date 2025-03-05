// components/ProposalForm.tsx
import { motion } from "framer-motion";
import {
  DollarSign,
  Percent,
  Calendar,
  ClipboardCheck,
  Info,
  Clock,
} from "lucide-react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Card,
  RadioGroup,
  Radio,
  Tooltip,
  Switch,
  Chip,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { useState, useEffect } from "react";
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
  // Determinar la unidad de tiempo inicial basada en el valor actual de deadline
  const initialTimeUnit = proposal.deadline >= 24 ? "years" : "months";
  const [timeUnit, setTimeUnit] = useState<"months" | "years">(initialTimeUnit);

  // Estado para el valor manual del plazo
  const [termValue, setTermValue] = useState<string>("");
  const [termError, setTermError] = useState<string>("");

  // Estados para los valores formateados
  const [formattedAmount, setFormattedAmount] = useState<string>("");
  const [formattedComision, setFormattedComision] = useState<string>("");
  const [formattedInterestRate, setFormattedInterestRate] =
    useState<string>("");
  const [formattedMedicalBalance, setFormattedMedicalBalance] =
    useState<string>("");
  const [formattedAmortization, setFormattedAmortization] =
    useState<string>("");

  // Función para formatear valores monetarios
  const formatCurrency = (value: number): string => {
    return value.toLocaleString("es-MX", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Función para formatear porcentajes
  const formatPercentage = (value: number): string => {
    return value.toLocaleString("es-MX", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Función para parsear valores formateados a números
  const parseFormattedValue = (formattedValue: string): number => {
    // Eliminar todos los caracteres no numéricos excepto el punto decimal
    const numericValue = formattedValue.replace(/[^\d.]/g, "");
    // Redondear al entero más cercano
    return Math.round(parseFloat(numericValue) || 0);
  };

  // Actualizar los valores formateados cuando cambian los valores de la propuesta
  useEffect(() => {
    // Redondear los valores a enteros
    const roundedAmount = Math.round(proposal.amount || 0);
    const roundedComision = Math.round(proposal.comision || 0);
    const roundedInterestRate =
      proposal.interest_rate !== -1 ? Math.round(proposal.interest_rate) : -1;
    const roundedMedicalBalance =
      proposal.medical_balance !== -1
        ? Math.round(proposal.medical_balance)
        : -1;

    // Para amortización, no formateamos el valor para preservar los decimales exactos
    const amortizationValue = proposal.amortization;

    setFormattedAmount(roundedAmount ? formatCurrency(roundedAmount) : "");
    setFormattedComision(
      roundedComision ? formatCurrency(roundedComision) : ""
    );
    setFormattedInterestRate(
      roundedInterestRate !== -1 ? formatPercentage(roundedInterestRate) : ""
    );
    setFormattedMedicalBalance(
      roundedMedicalBalance !== -1 ? formatCurrency(roundedMedicalBalance) : ""
    );

    // Convertir a string pero preservar el formato exacto (con decimales si existen)
    setFormattedAmortization(
      amortizationValue ? amortizationValue.toString() : ""
    );
  }, [
    proposal.amount,
    proposal.comision,
    proposal.interest_rate,
    proposal.medical_balance,
    proposal.amortization,
  ]);

  // Actualizar el valor del plazo cuando cambia el deadline
  useEffect(() => {
    if (proposal.deadline > 0) {
      if (timeUnit === "years") {
        const years = (proposal.deadline / 12).toFixed(1);
        // Si es un número entero, quitar los decimales
        setTermValue(years.endsWith(".0") ? years.slice(0, -2) : years);
      } else {
        setTermValue(proposal.deadline.toString());
      }
    } else {
      setTermValue("");
    }
  }, [timeUnit, proposal.deadline]);

  // Manejar cambios en el valor del plazo
  const handleTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Permitir solo números y un punto decimal
    if (/^[0-9]*\.?[0-9]*$/.test(value) || value === "") {
      setTermValue(value);
      setTermError("");

      if (value) {
        const numValue = parseFloat(value);

        // Validar que el valor sea positivo
        if (numValue <= 0) {
          setTermError("El plazo debe ser mayor a 0");
          return;
        }

        // Convertir a meses según la unidad seleccionada
        const deadlineInMonths =
          timeUnit === "years" ? numValue * 12 : numValue;
        onUpdate({ deadline: Math.round(deadlineInMonths) });
      }
    }
  };

  // Cambiar la unidad de tiempo y recalcular el valor
  const handleTimeUnitChange = (unit: "months" | "years") => {
    if (termValue) {
      const currentValue = parseFloat(termValue);
      if (!isNaN(currentValue)) {
        // Convertir el valor actual a la nueva unidad
        if (unit === "years" && timeUnit === "months") {
          // De meses a años
          const years = (currentValue / 12).toFixed(1);
          setTermValue(years.endsWith(".0") ? years.slice(0, -2) : years);
        } else if (unit === "months" && timeUnit === "years") {
          // De años a meses
          setTermValue(Math.round(currentValue * 12).toString());
        }
      }
    }
    setTimeUnit(unit);
  };

  // Manejadores para los campos con formato
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir solo números y separadores
    const cleanValue = value.replace(/[^\d,]/g, "");
    setFormattedAmount(cleanValue);
    onUpdate({ amount: parseFormattedValue(cleanValue) });
  };

  const handleComisionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir solo números y separadores
    const cleanValue = value.replace(/[^\d,]/g, "");
    setFormattedComision(cleanValue);
    onUpdate({ comision: parseFormattedValue(cleanValue) });
  };

  const handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir solo números y separadores
    const cleanValue = value.replace(/[^\d,]/g, "");
    setFormattedInterestRate(cleanValue);
    onUpdate({ interest_rate: parseFormattedValue(cleanValue) });
  };

  const handleMedicalBalanceChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    // Permitir solo números y separadores
    const cleanValue = value.replace(/[^\d,]/g, "");
    setFormattedMedicalBalance(cleanValue);
    onUpdate({ medical_balance: parseFormattedValue(cleanValue) });
  };

  // Manejador para el campo de amortización
  const handleAmortizationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Permitir números, punto decimal y decimales en progreso
    // Esta expresión permite valores como "10.", "10.2" y "10.22"
    const regex = /^[0-9]+\.?[0-9]{0,2}$|^[0-9]+$/;

    if (value === "" || regex.test(value)) {
      setFormattedAmortization(value);
      // Solo convertir a número si no termina con punto decimal
      const numericValue = value.endsWith(".")
        ? parseFloat(value + "0")
        : parseFloat(value) || 0;
      onUpdate({ amortization: numericValue });
    }
  };

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
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              Monto de la Oferta
              <Tooltip content="Monto total que se ofrecerá al solicitante">
                <Info className="w-4 h-4 ml-1 text-gray-400" />
              </Tooltip>
            </label>
            <Input
              type="text"
              startContent={<DollarSign className="w-4 h-4 text-gray-400" />}
              value={formattedAmount}
              onChange={handleAmountChange}
              placeholder="Ingrese el monto"
              className="w-full"
              size="lg"
              classNames={{
                inputWrapper:
                  "border-gray-200 focus-within:border-green-500 focus-within:ring-green-200",
              }}
            />
            {formattedAmount && (
              <p className="text-xs text-gray-500 mt-1">
                ${formatCurrency(parseFormattedValue(formattedAmount))} MXN
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              Comisión por Apertura (MXN)
              <Tooltip content="Monto en pesos que se cobrará como comisión por apertura">
                <Info className="w-4 h-4 ml-1 text-gray-400" />
              </Tooltip>
            </label>
            <Input
              type="text"
              startContent={<DollarSign className="w-4 h-4 text-gray-400" />}
              value={formattedComision}
              onChange={handleComisionChange}
              placeholder="Ingrese la comisión en pesos"
              className="w-full"
              size="lg"
              classNames={{
                inputWrapper:
                  "border-gray-200 focus-within:border-green-500 focus-within:ring-green-200",
              }}
            />
            {formattedComision && (
              <p className="text-xs text-gray-500 mt-1">
                ${formatCurrency(parseFormattedValue(formattedComision))} MXN
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              Frecuencia de Pago
              <Tooltip content="Frecuencia con la que se realizarán los pagos">
                <Info className="w-4 h-4 ml-1 text-gray-400" />
              </Tooltip>
            </label>
            <Select
              size="lg"
              placeholder="Seleccione frecuencia de pago"
              selectedKeys={[proposal.amortization_frequency]}
              onChange={(e) =>
                onUpdate({ amortization_frequency: e.target.value as any })
              }
              classNames={{
                trigger: "border-gray-200 data-[hover=true]:border-green-500",
                listbox: "border-gray-200",
              }}
            >
              <SelectItem key="mensual">Mensual</SelectItem>
              <SelectItem key="quincenal">Quincenal</SelectItem>
              <SelectItem key="semanal">Semanal</SelectItem>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              Monto de Amortización (MXN)
              <Tooltip content="Monto en pesos que se pagará en cada periodo según la frecuencia seleccionada">
                <Info className="w-4 h-4 ml-1 text-gray-400" />
              </Tooltip>
            </label>
            <Input
              type="text"
              startContent={<DollarSign className="w-4 h-4 text-gray-400" />}
              value={formattedAmortization}
              onChange={handleAmortizationChange}
              placeholder="Ingrese el monto de pago"
              className="w-full"
              size="lg"
              classNames={{
                inputWrapper:
                  "border-gray-200 focus-within:border-green-500 focus-within:ring-green-200",
              }}
            />
            {formattedAmortization && (
              <p className="text-xs text-gray-500 mt-1">
                ${formattedAmortization} MXN
              </p>
            )}
          </div>
        </div>

        {/* Columna 2 */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              Plazo
              <Tooltip content="Duración total del préstamo">
                <Info className="w-4 h-4 ml-1 text-gray-400" />
              </Tooltip>
            </label>

            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                <div className="flex-1 flex justify-center">
                  <Button
                    variant={timeUnit === "months" ? "solid" : "light"}
                    color={timeUnit === "months" ? "success" : "default"}
                    className="w-full"
                    startContent={<Clock className="w-4 h-4" />}
                    onClick={() => handleTimeUnitChange("months")}
                  >
                    Meses
                  </Button>
                </div>
                <div className="flex-1 flex justify-center">
                  <Button
                    variant={timeUnit === "years" ? "solid" : "light"}
                    color={timeUnit === "years" ? "success" : "default"}
                    className="w-full"
                    startContent={<Calendar className="w-4 h-4" />}
                    onClick={() => handleTimeUnitChange("years")}
                  >
                    Años
                  </Button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex flex-col space-y-2">
                  <Input
                    type="text"
                    value={termValue}
                    onChange={handleTermChange}
                    placeholder={`Ingrese el plazo en ${
                      timeUnit === "months" ? "meses" : "años"
                    }`}
                    size="lg"
                    startContent={
                      timeUnit === "months" ? (
                        <Clock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Calendar className="w-4 h-4 text-gray-400" />
                      )
                    }
                    classNames={{
                      inputWrapper:
                        "border-gray-200 focus-within:border-green-500 focus-within:ring-green-200",
                    }}
                    isInvalid={!!termError}
                    errorMessage={termError}
                  />

                  {termValue && !termError && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium text-success-600">
                          {termValue} {timeUnit === "months" ? "meses" : "años"}
                        </span>
                        <span className="text-gray-400 mx-1">•</span>
                        <span className="text-gray-500">
                          {timeUnit === "years"
                            ? `Equivale a ${Math.round(
                                parseFloat(termValue) * 12
                              )} meses`
                            : `Equivale a ${(
                                parseFloat(termValue) / 12
                              ).toFixed(1)} años`}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              Tasa de Interés (%)
              <Tooltip content="Tasa de interés anual que se aplicará al préstamo">
                <Info className="w-4 h-4 ml-1 text-gray-400" />
              </Tooltip>
            </label>
            <Input
              type="text"
              startContent={<Percent className="w-4 h-4 text-gray-400" />}
              value={formattedInterestRate}
              onChange={handleInterestRateChange}
              placeholder="Ingrese la tasa"
              className="w-full"
              size="lg"
              classNames={{
                inputWrapper:
                  "border-gray-200 focus-within:border-green-500 focus-within:ring-green-200",
              }}
            />
            {formattedInterestRate && (
              <p className="text-xs text-gray-500 mt-1">
                {formatPercentage(parseFormattedValue(formattedInterestRate))}%
                anual
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              Seguro de Vida Saldo Deudor (MXN)
              <Tooltip content="Monto en pesos que se aplicará como seguro de vida sobre el saldo deudor">
                <Info className="w-4 h-4 ml-1 text-gray-400" />
              </Tooltip>
            </label>
            <Input
              type="text"
              startContent={<DollarSign className="w-4 h-4 text-gray-400" />}
              value={formattedMedicalBalance}
              onChange={handleMedicalBalanceChange}
              placeholder="Ingrese el monto en pesos"
              className="w-full"
              size="lg"
              classNames={{
                inputWrapper:
                  "border-gray-200 focus-within:border-green-500 focus-within:ring-green-200",
              }}
            />
            {formattedMedicalBalance && (
              <p className="text-xs text-gray-500 mt-1">
                ${formatCurrency(parseFormattedValue(formattedMedicalBalance))}{" "}
                MXN
              </p>
            )}
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
