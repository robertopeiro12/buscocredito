"use client";

import Image from "next/image";
import Link from "next/link";

const HowItWorks = () => {
  const steps = [
    {
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop",
      title: "Completa tu Solicitud",
      description:
        "Indica el tipo de crédito que necesitas y proporciona tu información básica.",
    },
    {
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
      title: "Revisión por Prestamistas",
      description:
        "Los prestamistas registrados revisan tu solicitud según sus propios criterios.",
    },
    {
      image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&h=400&fit=crop",
      title: "Conoce tus Opciones",
      description:
        "Recibe todas las alternativas disponibles y decide si alguna se ajusta a lo que buscas.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-4xl font-bold text-gray-900 mb-16">
          Cómo funciona BuscoCrédito
        </h2>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="group text-left">
              <div className="overflow-hidden rounded-xl mb-6 shadow-lg h-64 relative">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover transform group-hover:scale-110 transition duration-500"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>

        <Link
          href="/prestamos"
          className="inline-block bg-green-100 hover:bg-green-200 text-green-900 font-bold py-3 px-10 rounded-full transition shadow-md"
        >
          INICIAR SOLICITUD
        </Link>
      </div>
    </section>
  );
};

export default HowItWorks;
