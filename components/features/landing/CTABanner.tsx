"use client";

import Image from "next/image";
import Link from "next/link";

const CTABanner = () => {
  const steps = [
    {
      icon: "/img/landing/icon-resume.png",
      text: "Subes tu solicitud",
    },
    {
      icon: "/img/landing/icon-choice.png",
      text: "Recibes varias opciones reales",
    },
    {
      icon: "/img/landing/icon-decision.png",
      text: "TÚ decides si avanzar",
    },
    {
      icon: "/img/landing/icon-best-seller.png",
      text: "Recibe tu crédito",
    },
  ];

  return (
    <section className="relative">
      {/* Background with payment card image */}
      <div className="h-80 w-full relative overflow-hidden">
        <Image
          src="/img/landing/payment-card.jpg"
          alt="Tarjeta de crédito"
          fill
          className="object-cover"
        />
      </div>

      {/* CTA Card */}
      <div className="max-w-6xl mx-auto px-10 sm:px-6 relative -mt-32 z-20">
        <div className="bg-[#0e3a45] rounded-3xl p-8 lg:p-12 shadow-2xl text-white">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 leading-tight">
                BuscoCrédito te conecta con prestamistas reales
              </h2>
            </div>
            <div className="flex flex-col gap-3 max-w-xl justify-center md:justify-end">
              <p className="text-gray-300 text-sm mb-6">
                para que puedas evaluar varias alternativas de financiamiento según tu situación,
                de forma clara y sin perder tiempo.
              </p>
              <div className="flex gap-2 text-sm">
                <Link
                  href="/soluciones"
                  className="bg-white text-[#0e3a45] font-bold py-2 px-1.5 rounded-full hover:bg-gray-100 transition shadow-md text-sm md:text-lg text-center"
                >
                  BUSCAR OPCIONES DE CRÉDITO
                </Link>
                <Link
                  href="/como-funciona"
                  className="bg-green-100 text-[#0e3a45] font-bold py-2 px-1.5 rounded-full hover:bg-green-200 transition shadow-md text-sm md:text-base text-center"
                >
                  ¿CÓMO FUNCIONA BUSCA CRÉDITO?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="bg-green-100/30 pt-20 pb-12 -mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center pt-8">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-4">
                  <Image
                    src={step.icon}
                    alt={step.text}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <p className="text-sm font-medium text-gray-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
