"use client";

import Image from "next/image";

const WhyUseBuscoCredito = () => {
  const benefits = [
    {
      icon: "/img/landing/icon-time.png",
      title: "Ahorro de tiempo",
      description: "Centraliza tu búsqueda de crédito en un solo lugar.",
    },
    {
      icon: "/img/landing/icon-directions.png",
      title: "Opciones claras",
      description:
        "Evalúa las condiciones de todas las propuestas antes de tomar una decisión.",
    },
    {
      icon: "/img/landing/icon-partnership.png",
      title: "Sin compromiso",
      description: "Tú decides si continúas con alguna opción.",
    },
    {
      icon: "/img/landing/icon-hand.png",
      title: "Plataforma confiable",
      description:
        "Diseñada para operar de forma transparente en el mercado mexicano.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">
          ¿Por qué usar BuscoCrédito?
        </h2>
        <p className="text-gray-600 mb-12 max-w-2xl">
          Creamos un sistema que te ahorra tiempo y te ayuda a tomar la mejor
          decisión para tu futuro. Conoce nuestros beneficios:
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-sm flex gap-6 items-start hover:shadow-md transition"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <Image
                  src={benefit.icon}
                  alt={benefit.title}
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUseBuscoCredito;
