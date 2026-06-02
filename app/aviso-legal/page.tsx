import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Footer from "@/components/common/layout/Footer";

const tocItems = [
  { id: "informacion-general", label: "1. Información General" },
  { id: "naturaleza", label: "2. Naturaleza del Servicio" },
  { id: "responsabilidades", label: "3. Responsabilidades" },
  { id: "datos", label: "4. Protección de Datos" },
  { id: "propiedad", label: "5. Propiedad Intelectual" },
  { id: "condiciones", label: "6. Condiciones de Uso" },
  { id: "terceros", label: "7. Enlaces a Terceros" },
  { id: "cookies", label: "8. Cookies y Seguimiento" },
  { id: "seguridad", label: "9. Seguridad" },
  { id: "jurisdiccion", label: "10. Ley y Jurisdicción" },
  { id: "limitacion", label: "11. Limitación de Responsabilidad" },
  { id: "contacto", label: "12. Contacto" },
];

const AvisoLegal = () => {
  return (
    <div className="flex flex-col">
      <div className="flex-grow bg-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Hero card */}
          <div className="rounded-3xl overflow-hidden border border-green-100 shadow-2xl mb-10">
            <div className="bg-gradient-to-r from-[#0e3a45] to-[#1a5c6e] px-6 py-10 md:px-12 md:py-12 text-white">
              <nav className="flex items-center gap-1.5 text-xs text-green-300 mb-4">
                <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
                <ChevronRight size={12} />
                <span className="text-green-100">Aviso legal</span>
              </nav>
              <p className="text-xs uppercase tracking-[0.2em] text-green-200 mb-3">Legal</p>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
                Aviso Legal
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

                  <section id="informacion-general" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">1.</span>
                      Información General
                    </h2>
                    <p>
                      BuscoCrédito es un marketplace financiero operado por BuscoCrédito S.A. de C.V.,
                      con domicilio fiscal en Av. Insurgentes Sur 1602, Piso 4, Col. Crédito Constructor,
                      Alcaldía Benito Juárez, C.P. 03940, Ciudad de México, inscrita en el Registro
                      Público de Comercio bajo el folio mercantil número N-2023-023-456, y con RFC
                      BCR230301XX5. La plataforma actúa exclusivamente como intermediario entre
                      prestamistas y prestatarios.
                    </p>
                  </section>

                  <section id="naturaleza" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">2.</span>
                      Naturaleza del Servicio
                    </h2>
                    <p className="mb-3">
                      BuscoCrédito <strong className="text-gray-800">NO es una entidad financiera</strong> y{" "}
                      <strong className="text-gray-800">NO otorga préstamos directamente</strong>. Nuestra
                      plataforma funciona exclusivamente como un marketplace que conecta a personas que
                      buscan financiamiento con instituciones financieras autorizadas.
                    </p>
                    <p>
                      Las ofertas de préstamos son realizadas directamente por las instituciones
                      financieras registradas en nuestra plataforma, quienes son las únicas
                      responsables de los términos y condiciones de sus ofertas. BuscoCrédito no
                      interviene en la decisión final de otorgamiento de crédito ni en la determinación
                      de tasas y condiciones.
                    </p>
                  </section>

                  <section id="responsabilidades" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">3.</span>
                      Responsabilidades
                    </h2>
                    <ul className="list-disc list-inside ml-3 space-y-2">
                      <li>BuscoCrédito no garantiza la aprobación de ningún préstamo.</li>
                      <li>No nos hacemos responsables por las decisiones financieras tomadas por los usuarios.</li>
                      <li>La plataforma no participa en la evaluación crediticia final ni en el proceso de desembolso.</li>
                      <li>Los usuarios son responsables de verificar la legitimidad de las instituciones financieras antes de aceptar cualquier oferta.</li>
                    </ul>
                  </section>

                  <section id="datos" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">4.</span>
                      Protección de Datos
                    </h2>
                    <p className="mb-3">
                      Todos los datos personales son tratados de acuerdo con nuestra{" "}
                      <Link href="/politica-privacidad" className="text-[#0e3a45] underline underline-offset-2 hover:opacity-80 transition-opacity">
                        Política de Privacidad
                      </Link>{" "}
                      y la Ley Federal de Protección de Datos Personales en Posesión de los
                      Particulares (LFPDPPP).
                    </p>
                    <p>
                      La autorización para consultar el Buró de Crédito es gestionada de manera segura
                      y solo se comparte con las instituciones financieras autorizadas cuando el usuario
                      lo permite explícitamente.
                    </p>
                  </section>

                  <section id="propiedad" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">5.</span>
                      Propiedad Intelectual y Uso del Sitio
                    </h2>
                    <p className="mb-3">
                      Todo el contenido de este sitio web (incluyendo, pero no limitado a, texto,
                      logotipos, contenido multimedia, diseños y software) está protegido por derechos
                      de autor y es propiedad exclusiva de BuscoCrédito S.A. de C.V. o de terceros que
                      han autorizado su uso.
                    </p>
                    <p>
                      Queda estrictamente prohibida cualquier reproducción, distribución, transmisión,
                      almacenamiento o uso total o parcial del contenido de este sitio sin autorización
                      previa y por escrito de BuscoCrédito.
                    </p>
                  </section>

                  <section id="condiciones" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">6.</span>
                      Condiciones de Uso del Sitio
                    </h2>
                    <p className="mb-3">
                      El usuario se compromete a utilizar el sitio web y sus servicios de conformidad
                      con la ley, este Aviso Legal, y demás avisos e instrucciones puestos en su
                      conocimiento.
                    </p>
                    <p>
                      BuscoCrédito se reserva el derecho de denegar o retirar el acceso al sitio y/o
                      servicios en cualquier momento y sin necesidad de preaviso a aquellos usuarios
                      que incumplan estas condiciones.
                    </p>
                  </section>

                  <section id="terceros" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">7.</span>
                      Enlaces a Sitios de Terceros
                    </h2>
                    <p>
                      Este sitio puede contener enlaces a sitios web de terceros. BuscoCrédito no
                      asume ninguna responsabilidad por el contenido, información o servicios que
                      pudieran aparecer o ofrecerse en dichos sitios, que tendrán carácter meramente
                      informativo para el usuario.
                    </p>
                  </section>

                  <section id="cookies" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">8.</span>
                      Cookies y Tecnologías de Seguimiento
                    </h2>
                    <p>
                      Este sitio utiliza cookies y otras tecnologías de seguimiento para mejorar la
                      experiencia del usuario y analizar el tráfico. Al utilizar nuestro sitio, el
                      usuario acepta el uso de estas tecnologías conforme a lo descrito en nuestra{" "}
                      <Link href="/politica-privacidad#cookies" className="text-[#0e3a45] underline underline-offset-2 hover:opacity-80 transition-opacity">
                        Política de Privacidad
                      </Link>
                      .
                    </p>
                  </section>

                  <section id="seguridad" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">9.</span>
                      Seguridad
                    </h2>
                    <p className="mb-3">Implementamos las siguientes medidas de seguridad:</p>
                    <ul className="list-disc list-inside ml-3 space-y-2">
                      <li>Cifrado AES-256 para la transmisión y almacenamiento de datos sensibles (información personal, consultas al Buró de Crédito, tokens de autenticación)</li>
                      <li>Certificados SSL/TLS para todas las comunicaciones web</li>
                      <li>Monitoreo continuo de actividades sospechosas</li>
                      <li>Autenticación de dos factores para cuentas administrativas</li>
                      <li>Respaldos diarios encriptados de la información</li>
                    </ul>
                  </section>

                  <section id="jurisdiccion" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">10.</span>
                      Ley Aplicable y Jurisdicción
                    </h2>
                    <p>
                      Este Aviso Legal se rige por la legislación de los Estados Unidos Mexicanos.
                      Para la resolución de cualquier controversia que pudiera surgir de su
                      interpretación o cumplimiento, las partes se someten expresamente a la
                      jurisdicción de los tribunales competentes de la Ciudad de México, renunciando
                      a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios
                      presentes o futuros.
                    </p>
                  </section>

                  <section id="limitacion" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">11.</span>
                      Limitación de Responsabilidad
                    </h2>
                    <p className="mb-3">BuscoCrédito no será responsable de:</p>
                    <ul className="list-disc list-inside ml-3 space-y-2">
                      <li>Decisiones tomadas por los usuarios basadas en la información proporcionada en la plataforma</li>
                      <li>Interrupciones temporales del servicio por mantenimiento o causas técnicas</li>
                      <li>Daños causados por virus o programas maliciosos en los contenidos</li>
                      <li>La veracidad, integridad o actualización de la información proporcionada por terceros</li>
                      <li>El incumplimiento por parte de los prestamistas de sus obligaciones legales o contractuales</li>
                      <li>Pérdidas económicas directas o indirectas derivadas del uso de la plataforma</li>
                    </ul>
                  </section>

                  <section id="contacto" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">12.</span>
                      Contacto
                    </h2>
                    <p className="mb-4">
                      Para cualquier duda o aclaración sobre este Aviso Legal, puede contactarnos a través de:
                    </p>
                    <ul className="space-y-2 mb-5">
                      {[
                        { label: "Email", value: "legal@buscocredito.com", href: "mailto:legal@buscocredito.com" },
                        { label: "Teléfono", value: "+52 (55) 5340-9823", href: "tel:+525553409823" },
                        { label: "Dirección", value: "Av. Insurgentes Sur 1602, Piso 4, Col. Crédito Constructor, Alcaldía Benito Juárez, C.P. 03940, Ciudad de México", href: null },
                        { label: "Horario", value: "Lunes a viernes de 9:00 a 18:00 hrs (hora del Centro de México)", href: null },
                      ].map(({ label, value, href }) => (
                        <li key={label} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                          <span className="font-semibold text-gray-700 shrink-0 sm:w-24">{label}:</span>
                          {href ? (
                            <a href={href} className="text-[#0e3a45] underline underline-offset-2 hover:opacity-80 transition-opacity">{value}</a>
                          ) : (
                            <span>{value}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-gray-500 mb-3">Para asuntos específicos:</p>
                    <ul className="space-y-2">
                      {[
                        { email: "privacidad@buscocredito.com", desc: "Privacidad y datos personales" },
                        { email: "contacto@buscocredito.com", desc: "Soporte técnico" },
                        { email: "transparencia@buscocredito.com", desc: "Transparencia" },
                      ].map(({ email, desc }) => (
                        <li key={email} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                          <a href={`mailto:${email}`} className="text-[#0e3a45] font-medium underline underline-offset-2 hover:opacity-80 transition-opacity shrink-0">
                            {email}
                          </a>
                          <span className="text-gray-500 text-sm sm:before:content-['—'] sm:before:mx-2">{desc}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

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

export default AvisoLegal;
