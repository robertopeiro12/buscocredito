"use client";

import { Clock, GitFork, ThumbsUp, ShieldCheck } from "lucide-react";

const WhyUseBuscoCredito = () => {
  const benefits = [
    {
      icon: Clock,
      title: "Ahorro de tiempo",
      description: "Centraliza tu búsqueda de crédito en un solo lugar.",
    },
    {
      icon: GitFork,
      title: "Opciones claras",
      description:
        "Evalúa las condiciones de todas las propuestas antes de tomar una decisión.",
    },
    {
      icon: ThumbsUp,
      title: "Sin compromiso",
      description: "Tú decides si continúas con alguna opción.",
    },
    {
      icon: ShieldCheck,
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
              <div className="flex-shrink-0">
                <benefit.icon className="w-10 h-10 text-[#0e3a45]" />
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
