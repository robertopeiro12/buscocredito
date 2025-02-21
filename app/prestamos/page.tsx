import React from "react";
import Link from "next/link";
import { ArrowRight, Shield, Clock, FileText, CheckCircle } from "lucide-react";
import Footer from "@/components/Footer";

export default function PrestamosPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-grow bg-gradient-to-br from-green-50 to-blue-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Necesitas un Préstamo?
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Recibe múltiples ofertas de prestamistas verificados y elige la
              que mejor se adapte a tus necesidades.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#2EA043] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Solicitar Préstamo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {/* Proceso */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Proceso Simple y Rápido
            </h2>
            <div className="grid md:grid-cols-5 gap-8">
              {[
                {
                  step: "1",
                  title: "Registro",
                  description: "Crea tu cuenta con datos personales",
                  icon: <CheckCircle className="w-6 h-6 text-green-600" />,
                },
                {
                  step: "2",
                  title: "Solicitud",
                  description: "Especifica monto y plazo deseado",
                  icon: <FileText className="w-6 h-6 text-green-600" />,
                },
                {
                  step: "3",
                  title: "Verificación",
                  description: "Sistema verifica tu score crediticio",
                  icon: <Shield className="w-6 h-6 text-green-600" />,
                },
                {
                  step: "4",
                  title: "Ofertas",
                  description: "Recibe ofertas de prestamistas en horas",
                  icon: <Clock className="w-6 h-6 text-green-600" />,
                },
                {
                  step: "5",
                  title: "Selección",
                  description: "Elige la mejor oferta para ti",
                  icon: <CheckCircle className="w-6 h-6 text-green-600" />,
                },
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-xl shadow-lg p-6 h-full">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-center">
                      {item.description}
                    </p>
                  </div>
                  {index < 4 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-8 h-8 text-green-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Beneficios */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Ventajas de BuscoCredito
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                  Score Crediticio Integrado
                </h3>
                <p className="text-gray-600 text-center">
                  Tu perfil único incluye verificación automática con el buró de
                  crédito.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                  Respuesta Rápida
                </h3>
                <p className="text-gray-600 text-center">
                  Recibe múltiples ofertas de prestamistas en cuestión de horas.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                  Mejores Tasas
                </h3>
                <p className="text-gray-600 text-center">
                  Los prestamistas compiten por ofrecerte las mejores
                  condiciones.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Comienza tu Solicitud
              </h2>
              <p className="text-gray-600 mb-8">
                Únete a miles de personas que ya han encontrado el préstamo que
                necesitan con las mejores condiciones.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#2EA043] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Crear Cuenta Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
