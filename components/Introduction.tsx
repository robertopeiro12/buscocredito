import Image from "next/image";
import Link from "next/link";
import "animate.css";
import { useState } from "react";

const Introduction = () => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <section
      className="relative min-h-screen bg-[#F8F9FA] overflow-hidden"
      id="home"
      role="banner"
      aria-label="Página principal"
    >
      {/* Gradient Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-gray-50/10" />

      <div className="max-w-[800px] mx-auto w-full flex flex-col items-center px-4 pt-12 relative z-10">
        {/* Logo con Loader */}
        <div className="relative w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] mb-2 md:mb-3 transition-transform duration-300 hover:scale-105">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-[#2EA043] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <Image
            width={400}
            height={400}
            src="/img/logo.png"
            alt="BuscoCredito Logo"
            className={`w-full h-full object-contain transition-opacity duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            priority
            onLoadingComplete={() => setImageLoaded(true)}
          />
        </div>

        {/* Contenido Principal */}
        <div className="text-center">
          <h1 className="animate__animated animate__fadeIn animate__delay-1s">
            <span className="block text-[32px] sm:text-[38px] md:text-[42px] font-bold text-[#212529] leading-tight">
              Obtén el préstamo que
            </span>
            <span className="block text-[32px] sm:text-[38px] md:text-[42px] font-bold text-[#2EA043] leading-tight">
              necesitas hoy mismo
            </span>
          </h1>

          <p className="mt-4 md:mt-5 text-[16px] md:text-[18px] text-[#6C757D] leading-relaxed max-w-[90%] mx-auto animate__animated animate__fadeIn animate__delay-1s">
            Encuentra las mejores ofertas de préstamos personalizadas para ti.
            <br className="hidden sm:block" />
            Simple, seguro y 100% en línea.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3 md:gap-4 animate__animated animate__fadeIn animate__delay-1s">
            <Link
              href="/prestamos"
              className="px-6 py-3 bg-[#2EA043] text-white text-[15px] md:text-[16px] font-medium rounded-lg
                hover:bg-green-600 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              aria-label="Solicitar préstamo ahora"
            >
              Solicitar préstamo →
            </Link>
            <Link
              href="/como-funciona"
              className="px-6 py-3 text-[#6C757D] text-[15px] md:text-[16px] font-medium border border-[#2EA043] rounded-lg 
                hover:bg-green-50 hover:text-[#2EA043] transition-all duration-300 hover:shadow-md transform hover:-translate-y-0.5
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              aria-label="Ver cómo funciona la plataforma"
            >
              Ver cómo funciona
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Solo visible en móvil */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 sm:hidden animate-bounce">
        <div className="w-6 h-6 text-[#6C757D]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Introduction;
