"use client";

import Link from "next/link";
import {
  ClipboardList,
  MousePointerClick,
  Brain,
  Banknote,
} from "lucide-react";

const CTABanner = () => {
  const steps = [
    {
      icon: ClipboardList,
      text: "Subes tu solicitud",
    },
    {
      icon: MousePointerClick,
      text: "Recibes varias opciones reales",
    },
    {
      icon: Brain,
      text: "Tú decides si avanzar",
    },
    {
      icon: Banknote,
      text: "Recibe tu crédito",
    },
  ];

  return (
    <section className="relative">
      {/* Background Image */}
      <div
        className="h-80 w-full bg-gradient-to-r from-blue-900 to-blue-700 relative"
      >
        <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply"></div>
      </div>

      {/* CTA Card */}
      <div className="max-w-6xl mx-auto px-10 sm:px-6 relative -mt-32 z-20">
        <div className="bg-[#0e3a45] rounded-3xl p-8 lg:p-12 shadow-2xl text-white">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="text-4xl">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 leading-tight">
                En lugar de tocar puerta por puerta, subes tu solicitud una vez
              </h2>
              
            </div>
            <div className="flex flex-col gap-3 max-w-xl justify-center md:justify-end">
              <p className="text-gray-300 text-sm mb-6">
                para que puedas evaluar varias alternativas de financiamiento segun tu situacion,
                de forma clara y sin perder tiempo.
              </p>
              <div className="flex gap-2 text-sm">
                <Link
                href="/prestamos"
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
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-[#0e3a45]">
                  <step.icon className="w-7 h-7" />
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
