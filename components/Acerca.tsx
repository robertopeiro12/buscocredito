import React from "react";
import Image from "next/image";

const Acerca = () => {
  return (
    <section className="w-full bg-white py-24" id="acerca">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Contenido */}
          <div className="space-y-10">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Plataforma líder en{" "}
                <span className="text-[#2EA043]">soluciones financieras</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                BuscoCredito es una plataforma tecnológica que optimiza el
                proceso de financiamiento, conectando instituciones financieras
                con solicitantes calificados. Nuestra tecnología permite evaluar
                y procesar solicitudes de manera eficiente, garantizando la
                mejor experiencia tanto para prestamistas como para
                solicitantes.
              </p>
            </div>

            {/* Características */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-[#2EA043]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Máxima Seguridad
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Certificaciones internacionales y protocolos avanzados de
                      encriptación
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-[#2EA043]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Tasas Competitivas
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Acceso a las mejores ofertas del mercado financiero
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-[#2EA043]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Proceso Optimizado
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Evaluación y procesamiento eficiente de solicitudes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Imagen */}
          <div className="relative lg:order-last order-first">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-green-50 to-gray-50 rounded-2xl transform -rotate-2" />
              <div className="absolute inset-0 bg-gradient-to-tr from-green-50 to-gray-50 rounded-2xl transform rotate-2" />
              <Image
                src="/img/prestamo.avif"
                alt="BuscoCredito Platform"
                width={600}
                height={400}
                className="relative rounded-2xl shadow-lg object-cover w-full h-[400px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Acerca;
