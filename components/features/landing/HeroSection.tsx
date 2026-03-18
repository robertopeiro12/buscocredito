"use client";

import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="z-10 animate-fade-in-up">
            <h1 className="font-display text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Deja de dar vueltas<br />
              por crédito:
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-lg leading-relaxed">
              Con una sola solicitud recibes ofertas claras de varios prestamistas
              en minutos.
            </p>
            <Link
              href="/como-funciona"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-gray-900 text-base font-semibold rounded-full text-gray-900 bg-transparent hover:bg-gray-100 transition duration-300"
            >
              CONOCE MÁS
            </Link>
          </div>

          {/* Right Images - 3 overlapping */}
          <div className="relative h-[400px] lg:h-[520px] w-full hidden md:block">
            {/* Image 1: Credit card on chart paper (back-left) */}
            <div className="absolute top-12 left-0 w-[55%] rounded-2xl shadow-xl z-10 border-4 border-white overflow-hidden h-72">
              <Image
                src="/img/landing/credit-card-chart.jpg"
                alt="Tarjeta de crédito sobre gráficos financieros"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Image 2: Credit card model on graph spreadsheet (center-top) */}
            <div className="absolute -top-2 right-8 w-[50%] rounded-2xl shadow-2xl z-20 border-4 border-white overflow-hidden h-80">
              <Image
                src="/img/landing/hero-credit-card.jpg"
                alt="Modelo de tarjeta de crédito sobre hoja de cálculo"
                fill
                className="object-cover"
              />
            </div>

            {/* Image 3: Groups businessman and credit cards (front-right-bottom) */}
            <div className="absolute bottom-0 right-0 w-[55%] rounded-2xl shadow-2xl z-30 border-4 border-white overflow-hidden h-64">
              <Image
                src="/img/landing/hero-credit-cards-group.jpg"
                alt="Grupo de tarjetas de crédito"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
