import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Footer from "@/components/common/layout/Footer";

const tocItems = [
  { id: "introduccion", label: "1. Introducción" },
  { id: "definiciones", label: "2. Definiciones" },
  { id: "objeto", label: "3. Objeto del Servicio" },
  { id: "registro", label: "4. Registro y Uso" },
  { id: "responsabilidades", label: "5. Responsabilidades" },
  { id: "limitacion", label: "6. Limitación de Responsabilidad" },
  { id: "privacidad", label: "7. Privacidad y Datos" },
  { id: "modificaciones", label: "8. Modificaciones" },
  { id: "propiedad", label: "9. Propiedad Intelectual" },
  { id: "financieras", label: "10. Resp. Financieras" },
  { id: "verificacion", label: "11. Verificación" },
  { id: "terminacion", label: "12. Terminación" },
  { id: "fuerza-mayor", label: "13. Fuerza Mayor" },
  { id: "indemnizacion", label: "14. Indemnización" },
  { id: "legislacion", label: "15. Legislación" },
  { id: "contacto", label: "16. Contacto" },
  { id: "administrador", label: "17. Resp. del Administrador" },
  { id: "regulatorio", label: "18. Cumplimiento Regulatorio" },
  { id: "retencion", label: "19. Retención de Datos" },
];

const Terminos = () => {
  return (
    <div className="flex flex-col">
      <div className="flex-grow bg-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Hero card — mismo patrón que /como-funciona y /soluciones */}
          <div className="rounded-3xl overflow-hidden border border-green-100 shadow-2xl mb-10">
            <div className="bg-gradient-to-r from-[#0e3a45] to-[#1a5c6e] px-6 py-10 md:px-12 md:py-12 text-white">
              <nav className="flex items-center gap-1.5 text-xs text-green-300 mb-4">
                <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
                <ChevronRight size={12} />
                <span className="text-green-100">Términos y condiciones</span>
              </nav>
              <p className="text-xs uppercase tracking-[0.2em] text-green-200 mb-3">Legal</p>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
                Términos y Condiciones de Uso
              </h1>
              <p className="text-green-100 text-sm">
                BuscoCrédito &mdash; Última actualización: 2 de junio de 2026
              </p>
            </div>
          </div>

          {/* Body: ToC + Contenido */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

            {/* ToC sticky */}
            <aside className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-[#0e3a45] px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-green-200 font-semibold">
                    Contenido
                  </p>
                </div>
                <nav className="bg-white p-3 space-y-0.5">
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block text-sm text-gray-500 hover:text-[#0e3a45] hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors leading-snug"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Contenido */}
            <main className="lg:col-span-3">
              <div className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden">
                <div className="divide-y divide-gray-100">

                  {[
                    {
                      id: "introduccion",
                      title: "Introducción",
                      num: "1",
                      content: (
                        <p>
                          Bienvenido a BuscoCrédito. Estos Términos y Condiciones regulan el uso de
                          nuestra plataforma de intermediación financiera, disponible en buscocredito.com.
                          Al acceder o utilizar nuestros servicios, usted acepta cumplir con estos
                          términos en su totalidad. Si no está de acuerdo con alguna disposición, por
                          favor absténgase de utilizar la plataforma.
                        </p>
                      ),
                    },
                    {
                      id: "definiciones",
                      title: "Definiciones",
                      num: "2",
                      content: (
                        <ul className="space-y-3">
                          {[
                            { term: "BuscoCrédito", def: "Plataforma digital que permite a prestamistas y prestatarios conectarse para la generación de ofertas de crédito." },
                            { term: "Prestatario", def: "Persona física o moral que busca obtener un préstamo mediante la plataforma." },
                            { term: "Prestamista", def: "Institución financiera o entidad autorizada que ofrece préstamos a los prestatarios a través de la plataforma." },
                            { term: "Administrador", def: "Usuario representante de una institución financiera con facultades para registrar y gestionar cuentas de trabajadores dentro de la plataforma." },
                            { term: "Trabajador", def: "Usuario habilitado por un Administrador para interactuar con la plataforma y realizar ofertas de préstamo." },
                            { term: "Oferta de Préstamo", def: "Propuesta formal realizada por un Prestamista que incluye términos y condiciones específicos del préstamo ofrecido." },
                            { term: "Servicios", def: "Conjunto de funcionalidades proporcionadas por la plataforma para facilitar la conexión entre Prestamistas y Prestatarios." },
                            { term: "Contenido del Usuario", def: "Toda información, datos y material proporcionado por los usuarios en la plataforma." },
                          ].map(({ term, def }) => (
                            <li key={term} className="text-gray-600">
                              <span className="font-semibold text-gray-800">{term}:</span> {def}
                            </li>
                          ))}
                        </ul>
                      ),
                    },
                    {
                      id: "objeto",
                      title: "Objeto del Servicio",
                      num: "3",
                      content: (
                        <p>
                          BuscoCrédito actúa como un intermediario tecnológico que facilita la
                          comunicación entre prestatarios y prestamistas. La plataforma no ofrece
                          préstamos ni asume responsabilidad sobre las ofertas realizadas por los
                          prestamistas.
                        </p>
                      ),
                    },
                    {
                      id: "registro",
                      title: "Registro y Uso de la Plataforma",
                      num: "4",
                      content: (
                        <div className="space-y-5">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">4.1. Registro de Usuarios</h3>
                            <ul className="list-disc list-inside ml-3 space-y-1 text-gray-600">
                              <li>El uso de la plataforma está reservado a personas mayores de 18 años con plena capacidad legal para contratar.</li>
                              <li>Para acceder a la plataforma, los prestatarios deben proporcionar información personal, incluyendo nombre completo, RFC, domicilio y demás datos necesarios.</li>
                              <li>Los prestamistas deben registrarse a través de un Administrador de su institución financiera, quien recibirá un token especial de acceso tras la verificación de su institución.</li>
                              <li>El token de registro empresarial es intransferible y su uso indebido resultará en la cancelación inmediata de la cuenta y posibles acciones legales.</li>
                            </ul>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">4.2. Uso del Marketplace</h3>
                            <ul className="list-disc list-inside ml-3 space-y-1 text-gray-600">
                              <li>Los prestatarios pueden enviar solicitudes de préstamo indicando monto, plazo y otras condiciones.</li>
                              <li>Los prestamistas pueden analizar solicitudes y enviar ofertas de préstamo personalizadas.</li>
                              <li>Los prestatarios pueden seleccionar la oferta que mejor les convenga.</li>
                              <li>Los ingresos declarados deberán ser comprobables mediante documentación oficial cuando la institución financiera lo requiera.</li>
                            </ul>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">4.3. Autorización para Consulta en Buró de Crédito</h3>
                            <p className="ml-3 text-gray-600">
                              Al registrarse, los prestatarios otorgan autorización expresa a BuscoCrédito para consultar su historial crediticio ante las sociedades de información crediticia (Buró de Crédito). Dicha consulta se registra como tipo &quot;suave&quot; y no afecta su historial crediticio.
                            </p>
                          </div>
                        </div>
                      ),
                    },
                    {
                      id: "responsabilidades",
                      title: "Responsabilidades y Obligaciones",
                      num: "5",
                      content: (
                        <div className="space-y-5">
                          {[
                            { title: "5.1. BuscoCrédito", items: ["Proporcionar una plataforma segura y funcional para la intermediación financiera.", "Implementar medidas de seguridad para la protección de datos."] },
                            { title: "5.2. Prestatarios", items: ["Proveer información veraz y actualizada.", "Evaluar las ofertas recibidas y asumir las condiciones pactadas con los prestamistas."] },
                            { title: "5.3. Prestamistas", items: ["Cumplir con la normativa aplicable en materia financiera y de protección al consumidor.", "Presentar ofertas transparentes y respetar las condiciones de las mismas."] },
                          ].map(({ title, items }) => (
                            <div key={title}>
                              <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
                              <ul className="list-disc list-inside ml-3 space-y-1 text-gray-600">
                                {items.map(i => <li key={i}>{i}</li>)}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ),
                    },
                    {
                      id: "limitacion",
                      title: "Limitación de Responsabilidad",
                      num: "6",
                      content: (
                        <p>
                          BuscoCrédito no es responsable por la veracidad de la información
                          proporcionada por los usuarios, ni por la relación contractual que se genere
                          entre prestatario y prestamista. No garantizamos la aprobación de créditos
                          ni la calidad de los servicios ofrecidos por los prestamistas.
                        </p>
                      ),
                    },
                    {
                      id: "privacidad",
                      title: "Privacidad y Protección de Datos",
                      num: "7",
                      content: (
                        <p>
                          La información recopilada por BuscoCrédito se manejará conforme a nuestra{" "}
                          <Link href="/politica-privacidad" className="text-[#0e3a45] underline underline-offset-2 hover:opacity-80 transition-opacity">
                            Política de Privacidad
                          </Link>
                          . Los datos personales solo serán compartidos con terceros cuando sea
                          necesario para la prestación del servicio.
                        </p>
                      ),
                    },
                    {
                      id: "modificaciones",
                      title: "Modificaciones a los Términos y Condiciones",
                      num: "8",
                      content: (
                        <p>
                          BuscoCrédito se reserva el derecho de modificar estos Términos y Condiciones
                          en cualquier momento. Cualquier cambio será notificado a los usuarios y
                          entrará en vigor desde su publicación en la plataforma.
                        </p>
                      ),
                    },
                    {
                      id: "propiedad",
                      title: "Propiedad Intelectual",
                      num: "9",
                      content: (
                        <div className="space-y-3">
                          <p>Todos los derechos de propiedad intelectual relacionados con BuscoCrédito, incluyendo pero no limitado a marcas comerciales, logotipos, diseños, textos, gráficos y software, son propiedad exclusiva de BuscoCrédito o sus licenciantes.</p>
                          <p>Los usuarios no están autorizados a copiar, modificar, distribuir, vender o arrendar ninguna parte de nuestros servicios o software incluido.</p>
                        </div>
                      ),
                    },
                    {
                      id: "financieras",
                      title: "Responsabilidades Financieras",
                      num: "10",
                      content: (
                        <>
                          <p className="mb-3">BuscoCrédito no asume responsabilidad por:</p>
                          <ul className="list-disc list-inside ml-3 space-y-1">
                            <li>Incumplimientos de pago entre las partes</li>
                            <li>La capacidad de pago de los Prestatarios</li>
                            <li>La solvencia de las instituciones financieras</li>
                            <li>Disputas financieras entre Prestamistas y Prestatarios</li>
                            <li>La veracidad de la información financiera proporcionada</li>
                          </ul>
                        </>
                      ),
                    },
                    {
                      id: "verificacion",
                      title: "Proceso de Verificación",
                      num: "11",
                      content: (
                        <>
                          <p className="mb-3">BuscoCrédito realiza una verificación básica de las instituciones financieras registradas. Sin embargo, esta verificación:</p>
                          <ul className="list-disc list-inside ml-3 space-y-1">
                            <li>No constituye una recomendación o respaldo</li>
                            <li>No garantiza la calidad de sus servicios</li>
                            <li>No asegura la aprobación de préstamos</li>
                          </ul>
                        </>
                      ),
                    },
                    {
                      id: "terminacion",
                      title: "Terminación del Servicio",
                      num: "12",
                      content: (
                        <>
                          <p className="mb-3">BuscoCrédito se reserva el derecho de:</p>
                          <ul className="list-disc list-inside ml-3 space-y-1 mb-3">
                            <li>Suspender o terminar cuentas que violen estos términos</li>
                            <li>Modificar o discontinuar el servicio sin previo aviso</li>
                            <li>Rechazar el acceso a cualquier usuario</li>
                          </ul>
                          <p>Los usuarios pueden cancelar su cuenta en cualquier momento, quedando pendientes las obligaciones financieras existentes.</p>
                        </>
                      ),
                    },
                    {
                      id: "fuerza-mayor",
                      title: "Fuerza Mayor",
                      num: "13",
                      content: (
                        <p>
                          BuscoCrédito no será responsable por el incumplimiento de sus obligaciones
                          debido a circunstancias fuera de su control razonable, incluyendo pero no
                          limitado a: desastres naturales, pandemias, interrupciones tecnológicas,
                          cambios regulatorios o acciones gubernamentales.
                        </p>
                      ),
                    },
                    {
                      id: "indemnizacion",
                      title: "Indemnización",
                      num: "14",
                      content: (
                        <p>
                          Los usuarios acuerdan indemnizar y mantener indemne a BuscoCrédito, sus
                          directores, empleados y agentes, de cualquier reclamo, demanda, pérdida,
                          responsabilidad y gastos (incluyendo honorarios legales) que surjan del uso
                          de la plataforma o la violación de estos términos.
                        </p>
                      ),
                    },
                    {
                      id: "legislacion",
                      title: "Legislación Aplicable y Jurisdicción",
                      num: "15",
                      content: (
                        <p>
                          Estos Términos y Condiciones se rigen por las leyes de los Estados Unidos
                          Mexicanos. Cualquier controversia se someterá a los tribunales competentes
                          de la Ciudad de México, renunciando las partes a cualquier otro fuero que
                          pudiera corresponderles por razón de sus domicilios presentes o futuros.
                        </p>
                      ),
                    },
                    {
                      id: "contacto",
                      title: "Contacto",
                      num: "16",
                      content: (
                        <p>
                          Para cualquier consulta sobre estos términos, puede contactarnos a través de
                          nuestro sitio web buscocredito.com o mediante nuestro correo electrónico{" "}
                          <a href="mailto:legal@buscocredito.com" className="text-[#0e3a45] underline underline-offset-2 hover:opacity-80 transition-opacity">
                            legal@buscocredito.com
                          </a>
                          .
                        </p>
                      ),
                    },
                    {
                      id: "administrador",
                      title: "Responsabilidades del Administrador",
                      num: "17",
                      content: (
                        <>
                          <p className="mb-3">Los Administradores de instituciones financieras tienen las siguientes responsabilidades:</p>
                          <ul className="list-disc list-inside ml-3 space-y-1">
                            <li>Gestionar y supervisar las cuentas de los trabajadores de su institución.</li>
                            <li>Garantizar el uso apropiado del token de registro y la plataforma.</li>
                            <li>Mantener actualizada la información de la institución financiera.</li>
                            <li>Asegurar el cumplimiento de las políticas de seguridad y privacidad.</li>
                            <li>Reportar cualquier actividad sospechosa o uso indebido de la plataforma.</li>
                          </ul>
                        </>
                      ),
                    },
                    {
                      id: "regulatorio",
                      title: "Cumplimiento Regulatorio",
                      num: "18",
                      content: (
                        <>
                          <p className="mb-3">BuscoCrédito opera en cumplimiento con:</p>
                          <ul className="list-disc list-inside ml-3 space-y-1 mb-3">
                            <li>Ley para Regular las Instituciones de Tecnología Financiera (Ley Fintech)</li>
                            <li>Ley Federal de Protección de Datos Personales en Posesión de los Particulares</li>
                            <li>Disposiciones de la CONDUSEF</li>
                            <li>Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita</li>
                          </ul>
                          <p>Para la resolución de disputas, los usuarios pueden acudir a la CONDUSEF o a los tribunales competentes de la Ciudad de México.</p>
                        </>
                      ),
                    },
                    {
                      id: "retencion",
                      title: "Retención y Eliminación de Datos",
                      num: "19",
                      content: (
                        <>
                          <p className="mb-3">BuscoCrédito mantiene los datos personales y financieros durante el tiempo necesario para cumplir con:</p>
                          <ul className="list-disc list-inside ml-3 space-y-1 mb-3">
                            <li>Las finalidades descritas en la Política de Privacidad</li>
                            <li>Obligaciones legales y regulatorias aplicables</li>
                            <li>Requerimientos de las autoridades competentes</li>
                          </ul>
                          <p className="mb-3">Tras la cancelación de una cuenta, los datos serán:</p>
                          <ul className="list-disc list-inside ml-3 space-y-1">
                            <li>Eliminados en un plazo máximo de 60 días naturales, excepto aquellos que por ley deban conservarse por un período mayor</li>
                            <li>Conservados de forma anonimizada para fines estadísticos</li>
                            <li>Protegidos bajo las mismas medidas de seguridad hasta su eliminación definitiva</li>
                          </ul>
                        </>
                      ),
                    },
                  ].map((section) => (
                    <section
                      key={section.id}
                      id={section.id}
                      className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed"
                    >
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                        <span className="text-[#0e3a45] font-bold tabular-nums">{section.num}.</span>
                        {section.title}
                      </h2>
                      {section.content}
                    </section>
                  ))}

                  {/* Footer del card */}
                  <div className="px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-gray-50">
                    <p className="text-xs text-gray-400">
                      Última actualización: 2 de junio de 2026
                    </p>
                    <Link href="/" className="text-xs text-[#0e3a45] hover:underline transition-colors">
                      ← Volver al inicio
                    </Link>
                  </div>

                </div>
              </div>
            </main>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terminos;
