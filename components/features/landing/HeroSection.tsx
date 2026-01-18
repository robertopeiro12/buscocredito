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
              Cuando necesitas <br />
              crédito <span className="text-green-600">ya</span>, no mañana:
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
              Una solicitud, varios prestamistas, ofertas claras para comparar.
              Simplifica tus finanzas hoy mismo.
            </p>
            <Link
              href="/como-funciona"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-full text-green-900 bg-green-100 hover:bg-green-200 transition duration-300 shadow-sm"
            >
              CONOCE MÁS
            </Link>
          </div>

          {/* Right Images */}
          <div className="relative h-[400px] lg:h-[500px] w-full hidden md:block">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

            {/* Images */}
            <div className="absolute top-0 right-0 w-3/4 rounded-2xl shadow-2xl z-10 border-4 border-white overflow-hidden h-64">
              <Image
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop"
                alt="Persona revisando documentos financieros"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute bottom-10 left-0 w-2/3 rounded-2xl shadow-2xl z-20 border-4 border-white overflow-hidden h-60 transform hover:scale-105 transition duration-500">
              <Image
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop"
                alt="Tarjeta de crédito en primer plano"
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
