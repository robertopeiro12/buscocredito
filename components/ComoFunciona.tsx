import React from "react";

const ComoFunciona = () => {
  const steps = [
    {
      number: "01",
      title: "Registra tu perfil",
      description:
        "Crea tu cuenta en minutos proporcionando información básica sobre ti o tu empresa.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Solicita tu préstamo",
      description:
        "Especifica el monto que necesitas y el propósito del préstamo. Te ayudaremos a encontrar las mejores opciones.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Compara ofertas",
      description:
        "Recibe y compara diferentes ofertas de préstamos de nuestros prestamistas verificados.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      number: "04",
      title: "Obtén tu préstamo",
      description:
        "Selecciona la mejor oferta y completa el proceso con el prestamista de tu elección.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full bg-white py-20" id="como-funciona">
      <div className="max-w-7xl mx-auto px-4">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            ¿Cómo funciona <span className="text-[#2EA043]">BuscoCredito</span>?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Un proceso simple y transparente para conseguir el préstamo que
            necesitas
          </p>
        </div>

        {/* Pasos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative flex flex-col items-start p-6 bg-white rounded-xl"
            >
              {/* Línea conectora */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 left-full w-full h-0.5 bg-gray-100 transform -translate-y-1/2 z-0" />
              )}

              {/* Número e Icono */}
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-[#2EA043]">
                  {step.icon}
                </div>
                <span className="ml-4 text-4xl font-bold text-gray-200">
                  {step.number}
                </span>
              </div>

              {/* Contenido */}
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComoFunciona;
