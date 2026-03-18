"use client";

import Image from "next/image";
import { Share2, Settings2, Target, Coins } from "lucide-react";

const WhatIsBuscoCredito = () => {
  const features = [
    {
      icon: Share2,
      title: "Es una plataforma",
      description:
        "que facilita el contacto entre personas que buscan crédito y prestamistas.",
    },
    {
      icon: Settings2,
      title: "Ofrecemos alternativas",
      description:
        "de financiamiento, para que conozcas todas tus opciones previo a firmar contratos.",
    },
    {
      icon: Target,
      title: "Nuestro objetivo es",
      description:
        "ayudarte a comparar opciones y que tomes decisiones informadas para tu economía.",
    },
    {
      icon: Coins,
      title: "No otorgamos créditos",
      description:
        "directamente. Facilitamos el acceso a opciones reales.",
    },
  ];

  return (
    <section className="flex flex-col lg:flex-row min-h-[600px]">
      {/* Left Content */}
      <div className="w-full lg:w-1/2 bg-gray-100 p-8 lg:p-20 flex flex-col justify-center">
        <h2 className="font-display text-4xl font-bold text-gray-900 mb-12">
          ¿Qué es
          <br />
          BuscoCrédito?
        </h2>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-12">
          {features.map((feature, index) => (
            <div key={index}>
              <feature.icon className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Image */}
      <div className="w-full lg:w-1/2 relative bg-yellow-400 min-h-[400px]">
        <Image
          src="https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=800&h=600&fit=crop"
          alt="Mujer feliz con tarjeta"
          fill
          className="object-cover mix-blend-multiply opacity-90"
        />
        <div className="absolute inset-0 bg-yellow-500/20"></div>
      </div>
    </section>
  );
};

export default WhatIsBuscoCredito;
