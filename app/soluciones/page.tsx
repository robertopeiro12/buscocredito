import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Clock3,
  FileSearch,
  Landmark,
  Scale,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Footer from "@/components/common/layout/Footer";

export default function SolucionesPage() {
  const solutions = [
    {
      title: "Soluciones para Personas",
      subtitle: "Enfoque personal",
      description: "Para consumo, reorganización de deuda y objetivos puntuales.",
      highlights: ["Respuesta ágil", "Comparación clara", "Sin compromiso de avance"],
      icon: UserRound,
      href: "/signup",
      cta: "Explorar soluciones personales",
      theme: "bg-[#0e3a45] text-white border-[#0e3a45]",
      badge: "text-green-200",
    },
    {
      title: "Soluciones para Negocio",
      subtitle: "Enfoque empresarial",
      description: "Para capital de trabajo, expansión operativa y adquisición de equipo.",
      highlights: ["Mayor contexto financiero", "Opciones por plazo", "Análisis comparativo"],
      icon: Building2,
      href: "/signup",
      cta: "Explorar soluciones para negocio",
      theme: "bg-white text-gray-900 border-gray-200",
      badge: "text-[#0e3a45]",
    },
  ];

  const comparisonPoints = [
    {
      title: "Monto y plazo",
      description: "Evalúa cuánto recibirías y en cuánto tiempo lo liquidarías.",
      icon: Landmark,
    },
    {
      title: "Frecuencia de pago",
      description: "Compara esquemas semanales, quincenales o mensuales.",
      icon: Clock3,
    },
    {
      title: "Condiciones y costos",
      description: "Revisa comisiones, términos y detalles antes de aceptar.",
      icon: Scale,
    },
    {
      title: "Perfil del ofertante",
      description: "Conoce quién emite la propuesta y su enfoque de atención.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="flex flex-col">
      <div className="flex-grow bg-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden border border-green-100 shadow-2xl mb-16">
            <div className="bg-gradient-to-r from-[#0e3a45] to-[#1a5c6e] px-6 py-10 md:px-12 md:py-14 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-green-200 mb-3">
                Marketplace Financiero
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4 max-w-4xl">
                Soluciones de crédito para tu momento financiero
              </h1>
              <p className="text-green-100 text-lg max-w-3xl leading-relaxed">
                Aquí no te prestamos dinero directamente. Te conectamos con prestamistas
                reales para que compares propuestas y tomes una decisión informada.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-[#2EA043] hover:bg-green-500 text-white font-bold px-7 py-3 rounded-xl shadow-lg hover:shadow-green-500/30 transition"
                >
                  Empezar mi solicitud
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/como-funciona"
                  className="inline-flex items-center gap-2 bg-white text-[#0e3a45] font-bold px-7 py-3 rounded-xl hover:bg-gray-100 transition"
                >
                  Ver metodología
                </Link>
              </div>
            </div>
          </div>

          <div className="mb-20 grid md:grid-cols-2 gap-6">
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              const isPrimary = index === 0;
              return (
                <article
                  key={solution.title}
                  className={`${solution.theme} rounded-3xl border shadow-xl p-7 md:p-8 h-full flex flex-col ${
                    isPrimary ? "ring-1 ring-green-300/40" : ""
                  }`}
                >
                  <p className={`text-xs uppercase tracking-[0.18em] mb-4 ${solution.badge}`}>
                    {solution.subtitle}
                  </p>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                      isPrimary
                        ? "bg-white/10 border border-white/20"
                        : "bg-green-50 border border-green-100 text-[#0e3a45]"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="font-display text-3xl font-bold mb-3">{solution.title}</h2>
                  <p className={`${isPrimary ? "text-green-100" : "text-gray-600"} leading-relaxed mb-6`}>
                    {solution.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-7 min-h-16">
                    {solution.highlights.map((item) => (
                      <span
                        key={item}
                        className={`${
                          isPrimary
                            ? "bg-white/10 text-green-100 border-white/20"
                            : "bg-green-50 text-[#0e3a45] border-green-100"
                        } inline-flex items-center h-8 text-[13px] font-semibold px-3.5 rounded-xl border leading-none`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={solution.href}
                    className={`${
                      isPrimary
                        ? "text-white hover:text-green-200"
                        : "text-[#0e3a45] hover:text-green-700"
                    } inline-flex items-center gap-2 text-sm font-bold transition mt-auto`}
                  >
                    {solution.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>
              );
            })}
          </div>

          <div className="mb-20">
            <div className="flex items-center gap-3 mb-6">
              <FileSearch className="w-6 h-6 text-[#0e3a45]" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
                Qué comparar antes de decidir
              </h2>
            </div>
            <p className="text-gray-600 max-w-2xl mb-10">
              No se trata solo de conseguir una oferta, sino de encontrar la alternativa
              que mejor se ajuste a tu contexto financiero.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {comparisonPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <article
                    key={point.title}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-6"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-green-100 text-[#2EA043] flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{point.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{point.description}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mb-16 rounded-3xl border border-gray-200 overflow-hidden shadow-xl">
            <div className="bg-white px-6 md:px-10 py-8 md:py-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Soluciones con respaldo de proceso
              </h2>
              <p className="text-gray-600 max-w-2xl">
                Cada propuesta entra al mismo flujo de comparación y decisión para que
                evalúes con mayor claridad, tiempo y control.
              </p>
            </div>
            <div className="grid md:grid-cols-3 bg-gray-50 border-t border-gray-200">
              <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-200">
                <BadgeCheck className="w-6 h-6 text-[#2EA043] mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Información estandarizada</h3>
                <p className="text-sm text-gray-600">Visualiza condiciones bajo un mismo marco de lectura.</p>
              </div>
              <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-200">
                <Scale className="w-6 h-6 text-[#2EA043] mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Comparación transparente</h3>
                <p className="text-sm text-gray-600">Analiza variables clave antes de comprometerte.</p>
              </div>
              <div className="p-6 md:p-8">
                <ShieldCheck className="w-6 h-6 text-[#2EA043] mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Decisión en tus manos</h3>
                <p className="text-sm text-gray-600">Tú eliges si avanzas y con qué alternativa continuar.</p>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <div className="grid lg:grid-cols-3 rounded-3xl overflow-hidden shadow-2xl border border-green-100">
              <div className="lg:col-span-2 bg-green-100/40 p-8 md:p-10">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Define tu objetivo y activa tu solicitud
                </h2>
                <p className="text-gray-700 max-w-2xl leading-relaxed">
                  Con una sola solicitud podrás recibir propuestas para tu contexto y comparar
                  alternativas antes de tomar una decisión.
                </p>
              </div>
              <div className="bg-[#0e3a45] p-8 md:p-10 flex items-center justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-green-100 text-[#0e3a45] font-bold px-7 py-3 rounded-xl hover:bg-green-200 transition shadow-lg"
                >
                  Solicita tu crédito
                  <ArrowRight className="w-5 h-5" />
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
