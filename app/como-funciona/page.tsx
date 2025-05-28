import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  DollarSign,
  Shield,
  CheckCircle,
  Building,
  LineChart,
  BarChart,
} from "lucide-react";
import Footer from "@/components/common/layout/Footer";

export default function ComoFuncionaPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-grow bg-gradient-to-br from-green-50 to-blue-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Una Nueva Forma de Prestar
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Plataforma que optimiza el proceso de préstamos para beneficiar
              tanto a solicitantes como a prestamistas.
            </p>
          </div>

          {/* Para Prestatarios */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Solicitantes de Préstamos
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  title: "Perfil Único",
                  description: "Crea tu perfil una sola vez",
                  icon: <Users className="w-6 h-6 text-green-600" />,
                },
                {
                  title: "Solicitud Simple",
                  description: "Define tus necesidades financieras",
                  icon: <DollarSign className="w-6 h-6 text-green-600" />,
                },
                {
                  title: "Múltiples Ofertas",
                  description: "Recibe propuestas competitivas",
                  icon: <Shield className="w-6 h-6 text-green-600" />,
                },
                {
                  title: "Mejor Opción",
                  description: "Elige la oferta que más te convenga",
                  icon: <CheckCircle className="w-6 h-6 text-green-600" />,
                },
              ].map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-xl shadow-lg p-6 h-full">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-center">
                      {step.description}
                    </p>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-8 h-8 text-green-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Para Prestamistas */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Empresas Prestamistas
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  title: "Acceso Filtrado",
                  description: "Solicitudes según tus criterios",
                  icon: <Users className="w-6 h-6 text-green-600" />,
                },
                {
                  title: "Evaluación Rápida",
                  description: "Perfiles pre-verificados",
                  icon: <BarChart className="w-6 h-6 text-green-600" />,
                },
                {
                  title: "Ofertas Competitivas",
                  description: "Propón tus condiciones",
                  icon: <DollarSign className="w-6 h-6 text-green-600" />,
                },
                {
                  title: "Mejora Continua",
                  description: "Optimiza con datos del mercado",
                  icon: <LineChart className="w-6 h-6 text-green-600" />,
                },
              ].map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-xl shadow-lg p-6 h-full">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-center">
                      {step.description}
                    </p>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-8 h-8 text-green-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Para Empresas */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Gestión Empresarial
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Control Total",
                  description: "Administra tu equipo de trabajo",
                  icon: <Building className="w-6 h-6 text-green-600" />,
                },
                {
                  title: "Asignación Eficiente",
                  description: "Distribuye solicitudes automáticamente",
                  icon: <Users className="w-6 h-6 text-green-600" />,
                },
                {
                  title: "Métricas en Tiempo Real",
                  description: "Monitorea el desempeño de tu equipo",
                  icon: <BarChart className="w-6 h-6 text-green-600" />,
                },
              ].map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-xl shadow-lg p-6 h-full">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-center">
                      {step.description}
                    </p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-8 h-8 text-green-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Comienza Hoy
              </h2>
              <p className="text-gray-600 mb-8">
                Únete a la plataforma que está transformando el mercado de
                préstamos en México.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/prestamos"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#2EA043] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Solicitar Préstamo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/prestamista"
                  className="inline-flex items-center px-6 py-3 border border-[#2EA043] text-base font-medium rounded-md shadow-sm text-[#2EA043] bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Información para Prestamistas
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
