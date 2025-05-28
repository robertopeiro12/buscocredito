import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  Building,
  User,
  DollarSign,
  Calendar,
  CreditCard,
  Wallet,
} from "lucide-react";

// Progress Bar Component
// This component shows the user's progress through the form
const ProgressBar = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => (
  <div className="w-full mb-8">
    <div className="relative pt-1">
      {/* Progress text showing current step and percentage */}
      <div className="flex mb-2 items-center justify-between">
        <div className="text-xs font-semibold text-green-600">
          Paso {currentStep} de {totalSteps}
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-green-600">
            {Math.round((currentStep / totalSteps) * 100)}%
          </span>
        </div>
      </div>
      {/* Progress bar visual element */}
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-100">
        <motion.div
          initial={{ width: `${((currentStep - 1) / totalSteps) * 100}%` }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#2EA043]"
        />
      </div>
    </div>
  </div>
);

// Reusable Button Component
// This component provides consistent button styling across the form
const Button = ({
  onClick,
  variant = "default",
  disabled = false,
  children,
}: {
  onClick: () => void;
  variant?: "default" | "primary" | "success";
  disabled?: boolean;
  children: React.ReactNode;
}) => {
  const baseStyles =
    "py-2 px-6 rounded-lg font-medium transition-all duration-200 flex items-center gap-2";
  const variants = {
    default: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    success: "bg-green-500 hover:bg-green-600 text-white",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {children}
    </button>
  );
};

// Section 1: Purpose Selection Component
const Section1 = ({
  next,
  setPurpose,
  purpose,
  error,
  setError,
}: {
  next: () => void;
  setPurpose: (purpose: string) => void;
  purpose: string;
  error: boolean;
  setError: (error: boolean) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 100 }}
    className="w-full space-y-6"
  >
    {/* Section Header */}
    <div className="text-center space-y-2">
      <h2 className="text-2xl font-bold text-gray-800">
        Propósito del Crédito
      </h2>
      <p className="text-gray-600">
        Seleccione el tipo de crédito que necesita
      </p>
    </div>

    {/* Purpose Selection Cards */}
    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
      {/* Personal Credit Card */}
      <button
        onClick={() => {
          setPurpose("Personal");
          setError(false);
        }}
        className={`p-6 rounded-xl border-2 transition-all duration-200 ${
          purpose === "Personal"
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-blue-200"
        }`}
      >
        <User
          className={`w-8 h-8 mb-2 mx-auto ${
            purpose === "Personal" ? "text-blue-500" : "text-gray-400"
          }`}
        />
        <span
          className={`block font-medium ${
            purpose === "Personal" ? "text-blue-500" : "text-gray-600"
          }`}
        >
          Personal
        </span>
      </button>

      {/* Business Credit Card */}
      <button
        onClick={() => {
          setPurpose("Negocio");
          setError(false);
        }}
        className={`p-6 rounded-xl border-2 transition-all duration-200 ${
          purpose === "Negocio"
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-blue-200"
        }`}
      >
        <Building
          className={`w-8 h-8 mb-2 mx-auto ${
            purpose === "Negocio" ? "text-blue-500" : "text-gray-400"
          }`}
        />
        <span
          className={`block font-medium ${
            purpose === "Negocio" ? "text-blue-500" : "text-gray-600"
          }`}
        >
          Negocio
        </span>
      </button>
    </div>

    {/* Error Message */}
    {error && (
      <p className="text-red-500 text-center text-sm">
        Por favor seleccione un propósito para continuar
      </p>
    )}

    {/* Navigation Buttons */}
    <div className="flex justify-center mt-6">
      <Button
        onClick={() => (purpose ? next() : setError(true))}
        variant="primary"
        disabled={!purpose}
      >
        Siguiente <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  </motion.div>
);
// Section 2: Credit Type Selection Component
const Section2 = ({
  purpose,
  next,
  prev,
  setType,
  type,
  error,
  setError,
}: {
  purpose: string;
  next: () => void;
  prev: () => void;
  setType: (type: string) => void;
  type: string;
  error: boolean;
  setError: (error: boolean) => void;
}) => {
  // Define credit type options based on purpose
  const creditTypes = {
    Personal: [
      { id: "consumo", label: "Crédito al consumo", icon: CreditCard },
      { id: "deudas", label: "Liquidación deudas", icon: Wallet },
    ],
    Negocio: [
      { id: "capital", label: "Capital de trabajo", icon: DollarSign },
      {
        id: "maquinaria",
        label: "Adquisición de maquinaria o equipo",
        icon: Building,
      },
      { id: "deudas", label: "Liquidación deudas", icon: Wallet },
    ],
  };

  const selectedTypes = creditTypes[purpose as keyof typeof creditTypes];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full space-y-6"
    >
      {/* Section Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">
          Tipo de Crédito ({purpose})
        </h2>
        <p className="text-gray-600">
          Seleccione el propósito específico de su crédito
        </p>
      </div>

      {/* Credit Type Options */}
      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {selectedTypes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setType(label);
              setError(false);
            }}
            className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
              type === label
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-200"
            }`}
          >
            <Icon
              className={`w-6 h-6 ${
                type === label ? "text-blue-500" : "text-gray-400"
              }`}
            />
            <span
              className={`font-medium ${
                type === label ? "text-blue-500" : "text-gray-600"
              }`}
            >
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-center text-sm">
          Por favor seleccione un tipo de crédito para continuar
        </p>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 mt-6">
        <Button onClick={prev} variant="default">
          <ChevronLeft className="w-4 h-4" /> Atrás
        </Button>
        <Button
          onClick={() => (type ? next() : setError(true))}
          variant="primary"
          disabled={!type}
        >
          Siguiente <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};
// Section 3: Amount Selection Component
const Section3 = ({
  amount,
  setAmount,
  next,
  prev,
}: {
  amount: number;
  setAmount: (amount: number) => void;
  next: () => void;
  prev: () => void;
}) => {
  // Estado para controlar si se está usando entrada manual
  const [isManualInput, setIsManualInput] = useState(false);
  // Estado para el valor de entrada manual
  const [manualInputValue, setManualInputValue] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value));
    setIsManualInput(false);
  };

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Eliminar cualquier carácter que no sea número
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    setManualInputValue(rawValue);

    if (rawValue === "") {
      return;
    }

    const numericValue = parseInt(rawValue);

    if (!isNaN(numericValue)) {
      setAmount(numericValue);
      setIsManualInput(true);
    }
  };

  const toggleInputMode = () => {
    setIsManualInput(!isManualInput);
    if (!isManualInput) {
      setManualInputValue(amount.toString());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full space-y-8"
    >
      {/* Section Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">Monto del Crédito</h2>
        <p className="text-gray-600">
          Seleccione el monto que necesita para su crédito
        </p>
      </div>

      {/* Amount Display */}
      <div className="text-center">
        <span className="text-4xl font-bold text-blue-500">
          {formatCurrency(amount)}
        </span>
      </div>

      {/* Slider or Manual Input Toggle */}
      <div className="max-w-md mx-auto">
        <button
          onClick={toggleInputMode}
          className="mb-4 text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center mx-auto"
        >
          {isManualInput
            ? "Usar slider para seleccionar monto"
            : "O escribe tu monto personalizado"}
        </button>

        {!isManualInput ? (
          // Slider Input
          <div className="space-y-6">
            <input
              type="range"
              min="10000"
              max="5000000"
              step="10000"
              value={amount <= 5000000 ? amount : 5000000}
              onChange={handleSliderChange}
              className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
                  ((Math.min(amount, 5000000) - 10000) / (5000000 - 10000)) *
                  100
                }%, #E5E7EB ${
                  ((Math.min(amount, 5000000) - 10000) / (5000000 - 10000)) *
                  100
                }%, #E5E7EB 100%)`,
              }}
            />

            {/* Range Labels */}
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatCurrency(10000)}</span>
              <span>{formatCurrency(5000000)}</span>
            </div>

            {/* Helper Text */}
            <p className="text-sm text-gray-500 text-center">
              Deslice para ajustar el monto del crédito
            </p>
          </div>
        ) : (
          // Manual Input
          <div className="space-y-4">
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={manualInputValue}
                onChange={handleManualInputChange}
                className="w-full pl-10 pr-4 py-3 text-lg rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Ingrese cualquier monto"
              />
            </div>
            <p className="text-sm text-gray-500 text-center">
              Ingrese el monto exacto que necesita para su crédito
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4">
        <Button onClick={prev} variant="default">
          <ChevronLeft className="w-4 h-4" /> Atrás
        </Button>
        <Button onClick={next} variant="primary">
          Siguiente <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};
// Section 4: Term Selection Component
const Section4 = ({
  term,
  setTerm,
  next,
  prev,
  error,
  setError,
}: {
  term: string;
  setTerm: (term: string) => void;
  next: () => void;
  prev: () => void;
  error: boolean;
  setError: (error: boolean) => void;
}) => {
  const terms = [
    { months: 3, label: "3 meses", unit: "meses" },
    { months: 6, label: "6 meses", unit: "meses" },
    { months: 9, label: "9 meses", unit: "meses" },
    { months: 12, label: "12 meses", unit: "meses" },
    { months: 18, label: "18 meses", unit: "meses" },
    { months: 24, label: "2 años", unit: "años" },
    { months: 36, label: "3 años", unit: "años" },
    { months: 48, label: "4 años", unit: "años" },
    { months: 60, label: "5 años", unit: "años" },
    { months: -1, label: "6+ años", unit: "años" },
  ];

  const termGroups = [
    terms.slice(0, 5), // Short terms (3-18 months)
    terms.slice(5), // Long terms (2-5+ years)
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full space-y-6"
    >
      {/* Section Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">Plazo del Crédito</h2>
        <p className="text-gray-600">
          Seleccione el tiempo en el que desea pagar el crédito
        </p>
      </div>

      {/* Term Selection Grid */}
      <div className="space-y-6 max-w-2xl mx-auto">
        {termGroups.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
          >
            {group.map(({ months, label, unit }) => (
              <button
                key={months}
                onClick={() => {
                  setTerm(label);
                  setError(false);
                }}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  term === label
                    ? "border-blue-500 bg-blue-50 text-blue-500"
                    : "border-gray-200 hover:border-blue-200 text-gray-600"
                }`}
              >
                <span className="block text-lg font-semibold">
                  {months === -1
                    ? "6+"
                    : months === 18
                    ? 18
                    : months > 12
                    ? months / 12
                    : months}
                </span>
                <span className="block text-sm">{unit}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-center text-sm">
          Por favor seleccione un plazo para continuar
        </p>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <Button onClick={prev} variant="default">
          <ChevronLeft className="w-4 h-4" /> Atrás
        </Button>
        <Button
          onClick={() => (term ? next() : setError(true))}
          variant="primary"
          disabled={!term}
        >
          Siguiente <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};
// Section 5: Payment Frequency Selection Component
const Section5 = ({
  payment,
  setPayment,
  next,
  prev,
  error,
  setError,
}: {
  payment: string;
  setPayment: (payment: string) => void;
  next: () => void;
  prev: () => void;
  error: boolean;
  setError: (error: boolean) => void;
}) => {
  // Payment frequency options with their respective metadata
  const paymentOptions = [
    {
      id: "semanal",
      label: "Semanal",
      icon: Calendar,
      description: "pagos cada 7 dias",
    },
    {
      id: "quincenal",
      label: "Quincenal",
      description: "pagos cada 15 dias",
      icon: Calendar,
      frequency: "26 pagos al año",
    },
    {
      id: "mensual",
      label: "Mensual",
      icon: Calendar,
      description: "pagos cada mes",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full space-y-8"
    >
      {/* Section Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-gray-800">Frecuencia de Pago</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Seleccione la frecuencia con la que prefiere realizar sus pagos. Esta
          decisión afectará el monto de cada pago.
        </p>
      </div>

      {/* Payment Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-4">
        {paymentOptions.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            onClick={() => {
              setPayment(label);
              setError(false);
            }}
            className={`
              relative p-6 rounded-xl border-2 transition-all duration-200
              ${
                payment === label
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
              }
            `}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <Icon
                className={`w-8 h-8 ${
                  payment === label ? "text-blue-500" : "text-gray-400"
                }`}
              />
              <div className="space-y-1">
                <span
                  className={`block text-lg font-medium ${
                    payment === label ? "text-blue-500" : "text-gray-700"
                  }`}
                >
                  {label}
                </span>
                <span className="block text-sm text-gray-500">
                  {description}
                </span>
              </div>
            </div>
            {payment === label && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1"
              >
                <Check className="w-4 h-4" />
              </motion.div>
            )}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-center text-sm bg-red-50 py-2 px-4 rounded-lg mx-auto max-w-md"
        >
          Por favor seleccione una frecuencia de pago para continuar
        </motion.p>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4">
        <Button onClick={prev} variant="default">
          <ChevronLeft className="w-4 h-4" />
          Atrás
        </Button>
        <Button
          onClick={() => (payment ? next() : setError(true))}
          variant="primary"
          disabled={!payment}
        >
          Siguiente <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};
// Section 6: Income Input Component
const Section6 = ({
  income,
  setIncome,
  next,
  prev,
  error,
  setError,
}: {
  income: string;
  setIncome: (income: string) => void;
  next: () => void;
  prev: () => void;
  error: boolean;
  setError: (error: boolean) => void;
}) => {
  // Currency formatter utility
  const formatCurrency = (value: string) => {
    const number = parseFloat(value.replace(/[^\d]/g, ""));
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    })
      .format(number || 0)
      .replace(/MX\$\s?|\$\s?/, "");
  };

  // Income validation and handling
  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, "");

    if (rawValue === "" || parseInt(rawValue) >= 0) {
      setIncome(rawValue);
      setError(false);
    }
  };

  const validateAndProceed = () => {
    const incomeValue = parseInt(income);
    if (!income || incomeValue <= 0) {
      setError(true);
      return;
    }
    next();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full space-y-8"
    >
      {/* Section Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-gray-800">
          Ingresos Anuales Comprobables
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Ingrese sus ingresos anuales totales que pueda comprobar. Esta
          información nos ayuda a determinar la capacidad de pago para su
          crédito.
        </p>
      </div>

      {/* Income Input Field */}
      <div className="max-w-md mx-auto space-y-4">
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={formatCurrency(income)}
            onChange={handleIncomeChange}
            className={`
              w-full pl-10 pr-4 py-3 text-lg rounded-lg border-2 
              transition-colors duration-200
              ${
                error
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 focus:border-blue-500"
              }
              focus:outline-none focus:ring-2 
              ${error ? "focus:ring-red-200" : "focus:ring-blue-200"}
            `}
            placeholder="Ingrese sus ingresos anuales"
          />
        </div>

        {/* Helper Text */}
        <p className="text-sm text-gray-500 text-center">
          Posteriormente se le solicitará documentación que respalde estos
          ingresos anuales declarados
        </p>

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm bg-red-50 p-2 rounded-lg text-center"
          >
            Por favor ingrese un monto anual válido mayor a cero
          </motion.p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4">
        <Button onClick={prev} variant="default">
          <ChevronLeft className="w-4 h-4" />
          Atrás
        </Button>
        <Button
          onClick={validateAndProceed}
          variant="primary"
          disabled={!income || parseInt(income) <= 0}
        >
          Siguiente <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};
// Final Section: Review and Submit Component
const FinalSection = ({
  formData,
  prev,
  onSubmit,
  isSubmitting,
}: {
  formData: {
    purpose: string;
    type: string;
    amount: number;
    term: string;
    payment: string;
    income: string;
  };
  prev: () => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}) => {
  const formatCurrency = (value: number | string) => {
    const numericValue =
      typeof value === "string" ? parseInt(value.replace(/[^\d]/g, "")) : value;

    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(numericValue || 0);
  };

  const summaryItems = [
    {
      label: "Propósito del Crédito",
      value: formData.purpose,
      icon: formData.purpose === "Personal" ? User : Building,
    },
    {
      label: "Tipo de Crédito",
      value: formData.type,
      icon: CreditCard,
    },
    {
      label: "Monto Solicitado",
      value: formatCurrency(formData.amount),
      icon: DollarSign,
    },
    {
      label: "Plazo de Pago",
      value: formData.term,
      icon: Calendar,
    },
    {
      label: "Frecuencia de Pago",
      value: formData.payment,
      icon: Calendar,
    },
    {
      label: "Ingresos Anuales Comprobables",
      value: formatCurrency(formData.income),
      icon: Wallet,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full space-y-8"
    >
      {/* Review Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-gray-800">Revisión Final</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Por favor revise los detalles de su solicitud antes de enviarla. Puede
          regresar a cualquier sección si necesita hacer cambios.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {summaryItems.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-50">
                <Icon className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="font-medium text-gray-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Terms and Conditions */}
      <div className="max-w-3xl mx-auto p-4 rounded-lg bg-gray-50 border border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          Al enviar esta solicitud, confirma que todos los datos proporcionados
          son correctos y autoriza la verificación de su información crediticia.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4">
        <Button onClick={prev} variant="default" disabled={isSubmitting}>
          <ChevronLeft className="w-4 h-4" />
          Modificar Datos
        </Button>
        <Button onClick={onSubmit} variant="success" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              Procesando...
            </>
          ) : (
            <>
              Enviar Solicitud
              <Check className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};
const CreditForm = ({
  addSolicitud,
  resetForm,
}: {
  addSolicitud: (data: {
    purpose: string;
    type: string;
    amount: number;
    term: string;
    payment: string;
    income: string;
  }) => void;
  resetForm: () => void;
}) => {
  const [formData, setFormData] = useState({
    purpose: "",
    type: "",
    amount: 10000,
    term: "",
    payment: "",
    income: "",
  });
  const [step, setStep] = useState(1);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 7;

  const nextStep = () => {
    setError(false);
    setStep(step + 1);
  };

  const prevStep = () => {
    setError(false);
    setStep(step - 1);
  };

  const updateFormData = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await addSolicitud(formData);
      resetForm();
    } catch (error) {
      setError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={resetForm}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white p-8 rounded-xl shadow-xl w-full max-w-2xl mx-4"
      >
        <button
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
          onClick={resetForm}
        >
          <X className="w-6 h-6 text-gray-400" />
        </button>

        <ProgressBar currentStep={step} totalSteps={totalSteps} />

        {step === 1 && (
          <Section1
            purpose={formData.purpose}
            setPurpose={(value) => updateFormData("purpose", value)}
            next={nextStep}
            error={error}
            setError={setError}
          />
        )}
        {step === 2 && (
          <Section2
            purpose={formData.purpose}
            type={formData.type}
            setType={(value) => updateFormData("type", value)}
            next={nextStep}
            prev={prevStep}
            error={error}
            setError={setError}
          />
        )}
        {step === 3 && (
          <Section3
            amount={formData.amount}
            setAmount={(value) => updateFormData("amount", value)}
            next={nextStep}
            prev={prevStep}
          />
        )}
        {step === 4 && (
          <Section4
            term={formData.term}
            setTerm={(value) => updateFormData("term", value)}
            next={nextStep}
            prev={prevStep}
            error={error}
            setError={setError}
          />
        )}
        {step === 5 && (
          <Section5
            payment={formData.payment}
            setPayment={(value) => updateFormData("payment", value)}
            next={nextStep}
            prev={prevStep}
            error={error}
            setError={setError}
          />
        )}
        {step === 6 && (
          <Section6
            income={formData.income}
            setIncome={(value) => updateFormData("income", value)}
            next={nextStep}
            prev={prevStep}
            error={error}
            setError={setError}
          />
        )}
        {step === 7 && (
          <FinalSection
            formData={formData}
            prev={prevStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </motion.div>
    </div>
  );
};
export default CreditForm;
