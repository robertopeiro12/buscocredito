import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Users,
  ClipboardCheck,
  BarChart3,
  Workflow,
  ShieldCheck,
  CircleCheck,
  Mail,
  GanttChartSquare,
} from "lucide-react";
import Footer from "@/components/common/layout/Footer";

export default function PrestamistaPage() {
  const pillars = [
    {
      title: "Control operativo",
      description:
        "Estructura de roles para administrar equipos y flujos de trabajo desde una cuenta principal.",
      icon: Workflow,
    },
    {
      title: "Gestión comercial",
      description:
        "Evaluación de solicitudes y envío de propuestas en un entorno unificado.",
      icon: BriefcaseBusiness,
    },
    {
      title: "Visibilidad del desempeño",
      description:
        "Seguimiento de actividad para mejorar tiempos de respuesta y efectividad operativa.",
      icon: BarChart3,
    },
  ];

  const process = [
    {
      title: "Solicitud de integración",
      description:
        "Tu institución se pone en contacto con BuscoCrédito para validar compatibilidad operativa.",
      icon: Building2,
    },
    {
      title: "Alta institucional",
      description:
        "Se habilita el acceso del administrador para crear y gestionar cuentas de trabajo.",
      icon: Users,
    },
    {
      title: "Operación diaria",
      description:
        "Tu equipo analiza solicitudes, envía propuestas y da seguimiento comercial.",
      icon: ClipboardCheck,
    },
  ];

  const requirements = [
    {
      label: "Representación legal de la institución",
    },
    {
      label: "Definición de responsables operativos",
    },
    {
      label: "Alineación de criterios internos de evaluación",
    },
    {
      label: "Canal de contacto institucional activo",
    },
  ];

  return (
    <div className="flex flex-col">
      <div className="flex-grow bg-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden border border-green-100 shadow-2xl mb-16">
            <div className="bg-gradient-to-r from-[#0e3a45] to-[#1a5c6e] px-6 py-10 md:px-12 md:py-14 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-green-200 mb-3">
                Institución Financiera
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4 max-w-4xl">
                Integración institucional para operar con orden y trazabilidad
              </h1>
              <p className="text-green-100 text-lg max-w-3xl leading-relaxed">
                BuscoCrédito no otorga préstamos: conectamos instituciones con personas
                solicitantes para que tu equipo evalúe y presente ofertas con control operativo.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="mailto:contacto@buscocredito.com"
                  className="inline-flex items-center gap-2 bg-[#2EA043] hover:bg-green-500 text-white font-bold px-7 py-3 rounded-xl shadow-lg hover:shadow-green-500/30 transition"
                >
                  Contacto institucional
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/como-funciona"
                  className="inline-flex items-center gap-2 bg-white text-[#0e3a45] font-bold px-7 py-3 rounded-xl hover:bg-gray-100 transition"
                >
                  Ver cómo funciona
                </Link>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-16">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article
                  key={pillar.title}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-6"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-green-100 text-[#2EA043] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">{pillar.title}</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{pillar.description}</p>
                </article>
              );
            })}
          </div>

          <div className="mb-20 rounded-3xl border border-gray-200 overflow-hidden">
            <div className="bg-white px-6 md:px-10 py-8 border-b border-gray-200">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Proceso de incorporación
              </h2>
              <p className="text-gray-600 max-w-2xl">
                Un flujo simple para habilitar a tu institución dentro del marketplace.
              </p>
            </div>
            <div className="grid md:grid-cols-3 bg-gray-50">
              {process.map((step, index) => {
                const Icon = step.icon;
                return (
                  <article
                    key={step.title}
                    className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-200 last:border-r-0"
                  >
                    <p className="text-xs font-bold text-[#0e3a45] mb-3">ETAPA {index + 1}</p>
                    <div className="w-10 h-10 rounded-xl bg-white border border-green-100 text-[#2EA043] flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mb-20 grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 rounded-3xl border border-gray-200 bg-white p-7 md:p-8 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-[#0e3a45]" />
                <h2 className="text-xl font-bold text-gray-900">Requisitos base</h2>
              </div>
              <ul className="space-y-3">
                {requirements.map((item) => (
                  <li key={item.label} className="flex items-start gap-2 text-sm text-gray-700">
                    <CircleCheck className="w-4 h-4 text-[#2EA043] mt-0.5" />
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-green-100 shadow-2xl">
              <div className="bg-[#0e3a45] text-white p-8 md:p-10">
                <div className="flex items-center gap-2 mb-4">
                  <GanttChartSquare className="w-5 h-5 text-green-200" />
                  <p className="text-xs uppercase tracking-[0.16em] text-green-200">Siguiente paso</p>
                </div>
                <h2 className="font-display text-3xl font-bold mb-3">
                  Agenda la evaluación institucional
                </h2>
                <p className="text-green-100 max-w-xl leading-relaxed mb-6">
                  Nuestro equipo revisará tu caso, resolverá dudas de operación y te compartirá
                  el proceso de activación para iniciar en el marketplace.
                </p>
                <div className="flex items-center gap-2 text-green-100 mb-7">
                  <Mail className="w-5 h-5" />
                  <span>contacto@buscocredito.com</span>
                </div>
                <Link
                  href="mailto:contacto@buscocredito.com"
                  className="inline-flex items-center gap-2 bg-green-100 text-[#0e3a45] font-bold px-7 py-3 rounded-xl hover:bg-green-200 transition shadow-lg"
                >
                  Solicitar información
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <p className="text-sm text-gray-600 leading-relaxed">
                <strong>Nota importante:</strong> BuscoCrédito es un marketplace financiero.
                No otorga préstamos ni capta recursos del público; facilita el contacto
                entre solicitantes e instituciones financieras.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
