import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeHelp,
  BellRing,
  FileText,
  Scale,
  ShieldCheck,
  Building2,
} from "lucide-react";
import Footer from "@/components/common/layout/Footer";

export default function ComoFuncionaPage() {
  const timeline = [
    {
      title: "Registro y solicitud",
      description:
        "Creas tu cuenta y capturas la información base de tu necesidad de crédito.",
      icon: FileText,
    },
    {
      title: "Revisión por instituciones",
      description:
        "Instituciones financieras registradas analizan tu solicitud y perfil.",
      icon: Building2,
    },
    {
      title: "Recepción de propuestas",
      description:
        "Recibes ofertas con condiciones para compararlas en un solo entorno.",
      icon: BellRing,
    },
    {
      title: "Comparación y decisión",
      description:
        "Evalúas variables clave y decides si avanzar con alguna propuesta.",
      icon: Scale,
    },
  ];

  const keyRules = [
    "BuscoCrédito no otorga préstamos; conecta solicitantes e instituciones financieras.",
    "Cada institución define sus propios criterios de evaluación y oferta.",
    "El solicitante puede comparar propuestas antes de decidir si avanzar.",
  ];

  return (
    <div className="flex flex-col">
      <div className="flex-grow bg-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden border border-green-100 shadow-2xl mb-16">
            <div className="bg-gradient-to-r from-[#0e3a45] to-[#1a5c6e] px-6 py-10 md:px-12 md:py-14 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-green-200 mb-3">
                Cómo funciona
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4 max-w-4xl">
                Tu proceso de solicitud, comparación y decisión en cuatro pasos
              </h1>
              <p className="text-green-100 text-lg max-w-3xl leading-relaxed">
                BuscoCrédito conecta personas solicitantes con instituciones financieras.
                No otorgamos préstamos: facilitamos un proceso claro para evaluar ofertas.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-[#2EA043] hover:bg-green-500 text-white font-bold px-7 py-3 rounded-xl shadow-lg hover:shadow-green-500/30 transition"
                >
                  Iniciar solicitud
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/prestamista"
                  className="inline-flex items-center gap-2 bg-white text-[#0e3a45] font-bold px-7 py-3 rounded-xl hover:bg-gray-100 transition"
                >
                  Proceso para instituciones
                </Link>
              </div>
            </div>
          </div>

          <div className="mb-20 grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Flujo para solicitantes
              </h2>
              <p className="text-gray-600 max-w-2xl mb-10">
                Este es el recorrido típico desde la solicitud hasta la decisión.
              </p>

              <div className="relative pl-6">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-green-200" />
                <div className="space-y-7">
                  {timeline.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <article key={item.title} className="relative">
                        <div className="absolute -left-6 top-2 w-6 h-6 rounded-full bg-[#2EA043] text-white text-[11px] font-bold flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                              <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>

            <aside className="lg:col-span-5">
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 md:p-7 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-[#0e3a45]" />
                  <h3 className="text-lg font-bold text-gray-900">Reglas del marketplace</h3>
                </div>
                <ul className="space-y-3 text-sm text-gray-700 leading-relaxed">
                  {keyRules.map((rule) => (
                    <li key={rule} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2EA043]" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl overflow-hidden border border-green-100 shadow-xl">
                <div className="bg-[#0e3a45] text-white p-6">
                  <h3 className="font-display text-2xl font-bold mb-2">¿Dudas frecuentes?</h3>
                  <p className="text-green-100 text-sm">
                    Respuestas rápidas para entender el proceso antes de registrarte.
                  </p>
                </div>
                <div className="bg-white p-4">
                  <details className="group border-b border-gray-100 py-3" open>
                    <summary className="list-none cursor-pointer flex items-center justify-between gap-3 text-sm font-semibold text-gray-900">
                      ¿Recibo dinero directamente de BuscoCrédito?
                      <BadgeHelp className="w-4 h-4 text-[#0e3a45]" />
                    </summary>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      No. BuscoCrédito no otorga préstamos; funciona como conexión entre solicitantes e instituciones.
                    </p>
                  </details>

                  <details className="group border-b border-gray-100 py-3">
                    <summary className="list-none cursor-pointer flex items-center justify-between gap-3 text-sm font-semibold text-gray-900">
                      ¿Tengo obligación de aceptar una propuesta?
                      <BadgeHelp className="w-4 h-4 text-[#0e3a45]" />
                    </summary>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      No. Puedes comparar ofertas y decidir libremente si avanzar con alguna.
                    </p>
                  </details>

                  <details className="group py-3">
                    <summary className="list-none cursor-pointer flex items-center justify-between gap-3 text-sm font-semibold text-gray-900">
                      ¿Cuánto tarda en llegar una oferta?
                      <BadgeHelp className="w-4 h-4 text-[#0e3a45]" />
                    </summary>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      Depende del perfil y de las instituciones activas, pero el flujo está diseñado para ser ágil.
                    </p>
                  </details>
                </div>
              </div>
            </aside>
          </div>

          <div className="mb-16">
            <div className="grid lg:grid-cols-3 rounded-3xl overflow-hidden shadow-2xl border border-green-100">
              <div className="lg:col-span-2 bg-green-100/40 p-8 md:p-10">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  ¿Listo para iniciar tu proceso?
                </h2>
                <p className="text-gray-700 max-w-2xl leading-relaxed">
                  Si necesitas financiamiento, crea tu cuenta y completa la solicitud.
                  Si eres institución financiera, te acompañamos en tu integración.
                </p>
              </div>
              <div className="bg-[#0e3a45] p-8 md:p-10 flex items-center justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-green-100 text-[#0e3a45] font-bold px-7 py-3 rounded-xl hover:bg-green-200 transition shadow-lg"
                >
                  Crear cuenta
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
