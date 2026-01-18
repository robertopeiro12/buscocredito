"use client";

import Link from "next/link";

const StartEvaluatingCTA = () => {
  return (
    <div className="grid md:grid-cols-3 min-h-[400px]">
      {/* Left Content */}
      <div className="md:col-span-2 bg-green-100/40 p-12 lg:p-20 flex flex-col justify-center">
        <h2 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          Empieza a evaluar opciones de crédito hoy
        </h2>
        <p className="text-lg text-gray-700 max-w-lg">
          Completa una solicitud y recibe varias propuestas con información
          clara para tomar una decisión con mayor seguridad.
        </p>
      </div>

      {/* Right CTA */}
      <div className="md:col-span-1 bg-[#0e3a45] p-12 lg:p-20 flex items-center justify-center">
        <Link
          href="/prestamos"
          className="bg-green-100 text-[#0e3a45] font-bold py-4 px-8 rounded-2xl shadow-xl text-center hover:scale-105 transition transform leading-tight"
        >
          Buscar opciones
          <br />
          de Crédito
        </Link>
      </div>
    </div>
  );
};

export default StartEvaluatingCTA;
