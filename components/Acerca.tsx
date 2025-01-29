import React from "react";
import Image from "next/image";

const Acerca = () => {
  return (
    <section
      className="w-full bg-gradient-to-b from-white to-gray-50 py-20"
      id="acerca"
    >
      <div className="lg:max-w-6xl mx-auto max-w-lg px-5 lg:px-8">
        {/* Header Section */}
        <div className="text-center lg:text-left mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-green-600 mb-4">
            Acerca de la plataforma
          </h2>
          <div className="w-24 h-1 bg-green-500 rounded-full lg:mx-0 mx-auto" />
        </div>

        {/* Main Content */}
        <div className="flex lg:flex-row flex-col items-start justify-between gap-12 bg-white rounded-2xl p-8 shadow-lg">
          <div className="lg:w-2/3">
            <p className="text-gray-700 text-lg lg:text-xl lg:text-start text-center leading-relaxed">
              La plataforma de{" "}
              <span className="font-semibold text-green-600">BuscoCredito</span>{" "}
              está hecha con el fin de que las personas puedan encontrar las
              diferentes opciones de préstamos que los bancos les pueden
              ofrecer, simplemente ingresando el tipo de préstamo y la cantidad
              que requiere.
            </p>

            {/* Features Section */}
            <div className="mt-8 flex flex-wrap gap-6 justify-center lg:justify-start">
              <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-lg">
                <span className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  ✓
                </span>
                <span className="text-gray-700 font-medium">
                  Proceso Simple
                </span>
              </div>
              <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-lg">
                <span className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  🔒
                </span>
                <span className="text-gray-700 font-medium">100% Seguro</span>
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="lg:w-1/3 w-full">
            <div className="relative group">
              <div className="absolute -inset-2 bg-green-100 rounded-lg opacity-75 group-hover:bg-green-200 transition-all duration-300"></div>
              <Image
                width={400}
                height={300}
                src="/img/prestamo.avif"
                alt="Plataforma BuscoCredito"
                className="relative rounded-lg shadow-md w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Acerca;
