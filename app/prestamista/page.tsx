import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  DollarSign,
  Users,
  LineChart,
  ShieldCheck,
  CheckCircle,
  Mail,
  Phone,
} from "lucide-react";
import Footer from "@/components/Footer";

export default function PrestamistaPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-grow bg-gradient-to-br from-green-50 to-blue-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Únete como Prestamista
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Forma parte de nuestra red exclusiva de prestamistas verificados y
              optimiza tus operaciones crediticias.
            </p>
            <Link
              href="mailto:contacto@buscocredito.com"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#2EA043] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Contactar a BuscoCredito
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {/* Beneficios */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Ventajas Competitivas
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                  Mayor Eficiencia
                </h3>
                <p className="text-gray-600 text-center">
                  Reduce hasta 40% en costos operativos con nuestro sistema
                  automatizado.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <LineChart className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                  Mejores Decisiones
                </h3>
                <p className="text-gray-600 text-center">
                  Optimiza tus tasas con feedback comparativo del mercado en
                  tiempo real.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                  Riesgo Controlado
                </h3>
                <p className="text-gray-600 text-center">
                  Accede a solicitantes pre-evaluados con verificación
                  crediticia completa.
                </p>
              </div>
            </div>
          </div>

          {/* Proceso */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              ¿Cómo Funciona?
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  step: "1",
                  title: "Regístrate y Verifica tu Cuenta",
                  description:
                    "Completa tu perfil y verifica tu identidad para comenzar a prestar",
                },
                {
                  step: "2",
                  title: "Revisa Solicitudes",
                  description:
                    "Analiza las solicitudes de préstamo y selecciona las que te interesen",
                },
                {
                  step: "3",
                  title: "Realiza Ofertas",
                  description:
                    "Haz ofertas a los prestatarios estableciendo tus términos y condiciones",
                },
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-xl shadow-lg p-8 h-full">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-green-600 font-semibold">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                      <ArrowRight className="w-8 h-8 text-green-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Requisitos */}
          <div className="mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
                Requisitos para ser Prestamista
              </h2>
              <ul className="space-y-4">
                {[
                  "Ser mayor de edad",
                  "Identificación oficial vigente",
                  "Comprobante de domicilio",
                  "Cuenta bancaria a tu nombre",
                  "Documentación que acredite el origen de los recursos",
                ].map((req, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ¿Interesado en Formar Parte?
              </h2>
              <p className="text-gray-600 mb-4">
                Para unirte a nuestra red de prestamistas, contáctanos
                directamente. Evaluaremos tu solicitud y te guiaremos en el
                proceso.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Mail className="w-5 h-5" />
                  <span>contacto@buscocredito.com</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <span>+52 (55) 1234-5678</span>
                </div>
              </div>
              <Link
                href="mailto:contacto@buscocredito.com"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#2EA043] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Enviar Mensaje
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
