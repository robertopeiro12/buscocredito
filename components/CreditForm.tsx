import { useState } from "react";
import { motion } from "framer-motion";

const Section1 = ({ next, setPurpose, purpose, error, setError }) => (
  <motion.div
    initial={{ opacity: 0, x: -100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 100 }}
    className="w-full"
  >
    <h2 className="text-xl font-bold mb-4 text-center">
      Propósito del Crédito
    </h2>
    <div className="flex space-x-4 justify-center">
      <button
        onClick={() => {
          setPurpose("Personal");
          setError(false);
        }}
        className={`py-2 px-4 ${
          purpose === "Personal" ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        Personal
      </button>
      <button
        onClick={() => {
          setPurpose("Negocio");
          setError(false);
        }}
        className={`py-2 px-4 ${
          purpose === "Negocio" ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        Negocio
      </button>
    </div>
    {error && (
      <p className="text-red-500 text-center mt-2">
        Por favor complete la sección.
      </p>
    )}
    <div className="flex space-x-4 mt-4 justify-center">
      <button
        onClick={() => (purpose ? next() : setError(true))}
        className="py-2 px-4 bg-gray-200"
      >
        Siguiente
      </button>
    </div>
  </motion.div>
);

const Section2 = ({ purpose, next, prev, setType, type, error, setError }) => (
  <motion.div
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    className="w-full"
  >
    <h2 className="text-xl font-bold mb-4 text-center">
      Tipo de Crédito ({purpose})
    </h2>
    <div className="flex space-x-4 justify-center">
      {purpose === "Personal" && (
        <>
          <button
            onClick={() => {
              setType("Crédito al consumo");
              setError(false);
            }}
            className={`py-2 px-4 ${
              type === "Crédito al consumo"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            Crédito al consumo
          </button>
          <button
            onClick={() => {
              setType("Liquidación deudas");
              setError(false);
            }}
            className={`py-2 px-4 ${
              type === "Liquidación deudas"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            Liquidación deudas
          </button>
        </>
      )}
      {purpose === "Negocio" && (
        <>
          <button
            onClick={() => {
              setType("Capital de trabajo");
              setError(false);
            }}
            className={`py-2 px-4 ${
              type === "Capital de trabajo"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            Capital de trabajo
          </button>
          <button
            onClick={() => {
              setType("Adquisición de maquinaria o equipo");
              setError(false);
            }}
            className={`py-2 px-4 ${
              type === "Adquisición de maquinaria o equipo"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            Adquisición de maquinaria o equipo
          </button>
          <button
            onClick={() => {
              setType("Liquidación deudas");
              setError(false);
            }}
            className={`py-2 px-4 ${
              type === "Liquidación deudas"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            Liquidación deudas
          </button>
        </>
      )}
    </div>
    {error && (
      <p className="text-red-500 text-center mt-2">
        Por favor complete la sección.
      </p>
    )}
    <div className="flex space-x-4 mt-4 justify-center">
      <button onClick={prev} className="py-2 px-4 bg-gray-200">
        Atrás
      </button>
      <button
        onClick={() => (type ? next() : setError(true))}
        className="py-2 px-4 bg-gray-200"
      >
        Siguiente
      </button>
    </div>
  </motion.div>
);

const Section3 = ({ amount, setAmount, next, prev }) => (
  <motion.div
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    className="w-full"
  >
    <h2 className="text-xl font-bold mb-4 text-center">Monto deseado</h2>
    <input
      type="range"
      min="10000"
      max="5000000"
      step="10000"
      value={amount}
      onChange={(e) => setAmount(Number(e.target.value))}
      className="w-full"
    />
    <p className="text-gray-700 mt-2 text-center">
      Monto seleccionado: ${amount.toLocaleString()}
    </p>
    <div className="flex space-x-4 mt-4 justify-center">
      <button onClick={prev} className="py-2 px-4 bg-gray-200">
        Atrás
      </button>
      <button onClick={next} className="py-2 px-4 bg-gray-200">
        Siguiente
      </button>
    </div>
  </motion.div>
);

const Section4 = ({ term, setTerm, next, prev, error, setError }) => (
  <motion.div
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    className="w-full"
  >
    <h2 className="text-xl font-bold mb-4 text-center">Plazo de Pago</h2>
    <div className="grid grid-cols-4 gap-2 justify-center">
      {[
        "3 meses",
        "6 meses",
        "8 meses",
        "12 meses",
        "18 meses",
        "24 meses",
        "36 meses",
        "48 meses",
        "60 meses",
        "72 meses",
      ].map((t) => (
        <button
          key={t}
          onClick={() => {
            setTerm(t);
            setError(false);
          }}
          className={`py-2 px-4 ${
            term === t ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
    {error && (
      <p className="text-red-500 text-center mt-2">
        Por favor complete la sección.
      </p>
    )}
    <div className="flex space-x-4 mt-4 justify-center">
      <button onClick={prev} className="py-2 px-4 bg-gray-200">
        Atrás
      </button>
      <button
        onClick={() => (term ? next() : setError(true))}
        className="py-2 px-4 bg-gray-200"
      >
        Siguiente
      </button>
    </div>
  </motion.div>
);

const Section5 = ({ payment, setPayment, next, prev, error, setError }) => (
  <motion.div
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    className="w-full"
  >
    <h2 className="text-xl font-bold mb-4 text-center">Forma de Pago</h2>
    <div className="flex space-x-4 justify-center">
      {["Semanal", "Quincenal", "Mensual"].map((p) => (
        <button
          key={p}
          onClick={() => {
            setPayment(p);
            setError(false);
          }}
          className={`py-2 px-4 ${
            payment === p ? "bg-yellow-500 text-white" : "bg-gray-200"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
    {error && (
      <p className="text-red-500 text-center mt-2">
        Por favor complete la sección.
      </p>
    )}
    <div className="flex space-x-4 mt-4 justify-center">
      <button onClick={prev} className="py-2 px-4 bg-gray-200">
        Atrás
      </button>
      <button
        onClick={() => (payment ? next() : setError(true))}
        className="py-2 px-4 bg-gray-200"
      >
        Siguiente
      </button>
    </div>
  </motion.div>
);

const Section6 = ({ income, setIncome, next, prev, error, setError }) => (
  <motion.div
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    className="w-full"
  >
    <h2 className="text-xl font-bold mb-4 text-center">Ingresos Mensuales</h2>
    <input
      type="number"
      value={income}
      onChange={(e) => {
        setIncome(e.target.value);
        setError(false);
      }}
      className="w-full p-2 border rounded"
      placeholder="Ingresos en $"
    />
    <p className="text-gray-600 mt-2 text-center">
      Aviso: Más adelante se te requerirá que demuestres esos ingresos.
    </p>
    {error && (
      <p className="text-red-500 text-center mt-2">
        Por favor complete la sección.
      </p>
    )}
    <div className="flex space-x-4 mt-4 justify-center">
      <button onClick={prev} className="py-2 px-4 bg-gray-200">
        Atrás
      </button>
      <button
        onClick={() => (income ? next() : setError(true))}
        className="py-2 px-4 bg-gray-200"
      >
        Siguiente
      </button>
    </div>
  </motion.div>
);

const FinalSection = ({ prev, submitForm }) => (
  <motion.div
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    className="w-full"
  >
    <h2 className="text-xl font-bold mb-4 text-center">Revisión Final</h2>
    <p className="mb-4 text-center">
      Por favor revisa tus respuestas antes de enviar el formulario.
    </p>
    <div className="flex space-x-4 mt-4 justify-center">
      <button onClick={prev} className="py-2 px-4 bg-gray-200 rounded">
        Atrás
      </button>
      <button
        onClick={submitForm}
        className="py-2 px-4 bg-green-500 text-white rounded"
      >
        Enviar Solicitud
      </button>
    </div>
  </motion.div>
);

const CreditForm = ({ addSolicitud, resetForm }) => {
  const [purpose, setPurpose] = useState("");
  const [type, setType] = useState("");
  const [amount, setAmount] = useState(10000);
  const [term, setTerm] = useState("");
  const [payment, setPayment] = useState("");
  const [income, setIncome] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState(false);

  const nextStep = () => {
    setError(false);
    setStep(step + 1);
  };

  const prevStep = () => {
    setError(false);
    setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addSolicitud({ purpose, type, amount, term, payment, income });
    resetForm();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={resetForm}
      ></div>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-auto"
      >
        <button
          className="absolute top-2 right-2 text-gray-500"
          onClick={resetForm}
        >
          X
        </button>
        <h1 className="text-2xl font-bold mb-4 text-center">
          Solicitud de Crédito
        </h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key={step}
        >
          {step === 1 && (
            <Section1
              next={nextStep}
              setPurpose={setPurpose}
              purpose={purpose}
              error={error}
              setError={setError}
            />
          )}
          {step === 2 && (
            <Section2
              purpose={purpose}
              next={nextStep}
              prev={prevStep}
              setType={setType}
              type={type}
              error={error}
              setError={setError}
            />
          )}
          {step === 3 && (
            <Section3
              amount={amount}
              setAmount={setAmount}
              next={nextStep}
              prev={prevStep}
            />
          )}
          {step === 4 && (
            <Section4
              term={term}
              setTerm={setTerm}
              next={nextStep}
              prev={prevStep}
              error={error}
              setError={setError}
            />
          )}
          {step === 5 && (
            <Section5
              payment={payment}
              setPayment={setPayment}
              next={nextStep}
              prev={prevStep}
              error={error}
              setError={setError}
            />
          )}
          {step === 6 && (
            <Section6
              income={income}
              setIncome={setIncome}
              next={nextStep}
              prev={prevStep}
              error={error}
              setError={setError}
            />
          )}
          {step === 7 && (
            <FinalSection prev={prevStep} submitForm={handleSubmit} />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CreditForm;