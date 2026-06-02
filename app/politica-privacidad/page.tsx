import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Footer from "@/components/common/layout/Footer";

const tocItems = [
  { id: "introduccion", label: "1. Introducción" },
  { id: "datos-personales", label: "2. Datos que Recopilamos" },
  { id: "finalidades", label: "3. Finalidades del Tratamiento" },
  { id: "transferencias", label: "4. Transferencias de Datos" },
  { id: "arco", label: "5. Derechos ARCO" },
  { id: "cookies", label: "6. Cookies y Rastreo" },
  { id: "seguridad", label: "7. Medidas de Seguridad" },
  { id: "cambios", label: "8. Cambios a la Política" },
  { id: "retencion", label: "9. Retención de Datos" },
  { id: "buro", label: "10. Consulta al Buró de Crédito" },
  { id: "canales", label: "11. Canales de Comunicación" },
];

const PoliticaPrivacidad = () => {
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
                <span className="text-green-100">Política de privacidad</span>
              </nav>
              <p className="text-xs uppercase tracking-[0.2em] text-green-200 mb-3">Legal</p>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
                Política de Privacidad
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

                  {/* 1. Introducción */}
                  <section id="introduccion" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">1.</span>
                      Introducción e Identidad del Responsable
                    </h2>
                    <p className="mb-3">
                      BuscoCrédito S.A. de C.V. (&quot;BuscoCrédito&quot;, &quot;nosotros&quot; o &quot;nuestro&quot;), con
                      domicilio en Ciudad de México, México, es responsable del tratamiento de sus
                      datos personales en términos de la Ley Federal de Protección de Datos
                      Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.
                    </p>
                    <p>
                      Esta Política de Privacidad describe cómo recopilamos, utilizamos, compartimos
                      y protegemos su información personal. Al utilizar nuestra plataforma, usted
                      acepta el tratamiento de sus datos conforme a lo aquí descrito.
                    </p>
                  </section>

                  {/* 2. Datos Personales */}
                  <section id="datos-personales" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">2.</span>
                      Datos Personales que Recopilamos
                    </h2>
                    <p className="mb-4">Recopilamos los siguientes tipos de información personal:</p>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">2.1 Datos de Identificación</h3>
                        <ul className="list-disc list-inside ml-3 space-y-1">
                          <li>Nombre completo (apellido paterno, apellido materno, nombre y segundo nombre)</li>
                          <li>Fecha de nacimiento</li>
                          <li>Domicilio completo (calle, número, colonia, ciudad, municipio, estado, código postal)</li>
                          <li>Correo electrónico</li>
                          <li>Número telefónico</li>
                          <li>CURP</li>
                          <li>RFC</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">2.2 Datos Financieros</h3>
                        <ul className="list-disc list-inside ml-3 space-y-1">
                          <li>Historial crediticio (mediante consulta autorizada al Buró de Crédito)</li>
                          <li>Ingresos mensuales declarados (sujetos a comprobación por las instituciones financieras)</li>
                          <li>Información laboral básica</li>
                          <li>Capacidad de pago estimada</li>
                          <li>Propósito del crédito solicitado</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">2.3 Datos Técnicos</h3>
                        <ul className="list-disc list-inside ml-3 space-y-1">
                          <li>Dirección IP</li>
                          <li>Tipo de navegador y sistema operativo</li>
                          <li>Comportamiento de navegación dentro de la plataforma</li>
                          <li>Tokens de autenticación y sesión</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* 3. Finalidades */}
                  <section id="finalidades" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">3.</span>
                      Finalidades del Tratamiento de Datos
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">3.1 Finalidades Primarias</h3>
                        <p className="ml-3 mb-2 text-sm text-gray-500">Necesarias para la prestación del servicio. No pueden negarse sin afectar el uso de la plataforma.</p>
                        <ul className="list-disc list-inside ml-3 space-y-1">
                          <li>Verificación de identidad y prevención de fraude</li>
                          <li>Evaluación y procesamiento de solicitudes de crédito</li>
                          <li>Conexión con instituciones financieras participantes</li>
                          <li>Gestión de su cuenta y comunicaciones relacionadas al servicio</li>
                          <li>Cumplimiento de obligaciones legales y regulatorias</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">3.2 Finalidades Secundarias</h3>
                        <p className="ml-3 mb-2 text-sm text-gray-500">No son indispensables para el servicio. Puede oponerse a ellas en cualquier momento.</p>
                        <ul className="list-disc list-inside ml-3 space-y-1 mb-3">
                          <li>Envío de comunicaciones promocionales y novedades de la plataforma</li>
                          <li>Análisis estadístico e investigación para mejora del servicio</li>
                          <li>Personalización de la experiencia en la plataforma</li>
                        </ul>
                        <p className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm">
                          Si no desea que sus datos sean utilizados para finalidades secundarias, puede manifestarlo en cualquier momento escribiendo a{" "}
                          <a href="mailto:privacidad@buscocredito.com" className="text-[#0e3a45] underline underline-offset-2 hover:opacity-80 transition-opacity">
                            privacidad@buscocredito.com
                          </a>
                          . Su negativa no afectará el uso del servicio principal.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* 4. Transferencias */}
                  <section id="transferencias" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">4.</span>
                      Transferencias de Datos
                    </h2>
                    <p className="mb-3">Sus datos personales pueden ser transferidos a:</p>
                    <ul className="list-disc list-inside ml-3 space-y-1 mb-4">
                      <li>Instituciones financieras participantes en la plataforma (solo los datos necesarios para la evaluación inicial de su solicitud)</li>
                      <li>Sociedades de información crediticia — Buró de Crédito (previa autorización expresa)</li>
                      <li>Autoridades competentes (CONDUSEF, SAT, etc.) cuando lo requieran en ejercicio de sus facultades legales</li>
                      <li>Proveedores de servicios tecnológicos necesarios para la operación de la plataforma</li>
                    </ul>
                    <p className="mb-3">
                      Toda transferencia nacional se realiza bajo acuerdos de confidencialidad y con las medidas de seguridad apropiadas.
                    </p>
                    <div className="space-y-3">
                      <p className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm">
                        <strong className="text-gray-800">Transferencias internacionales:</strong> BuscoCrédito utiliza servicios de infraestructura tecnológica (como almacenamiento en la nube y autenticación) cuyos servidores pueden ubicarse fuera de México. En estos casos, nos aseguramos de que los proveedores cuenten con niveles de protección equivalentes a los exigidos por la LFPDPPP.
                      </p>
                      <p className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm">
                        <strong className="text-gray-800">Nota importante:</strong> BuscoCrédito no almacena ni procesa información bancaria o financiera sensible. La gestión de cuentas bancarias y transferencias de fondos se realiza directamente entre el usuario y las instituciones financieras seleccionadas.
                      </p>
                    </div>
                  </section>

                  {/* 5. Derechos ARCO */}
                  <section id="arco" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">5.</span>
                      Derechos ARCO
                    </h2>
                    <p className="mb-3">
                      En términos de la LFPDPPP, usted tiene derecho a:
                    </p>
                    <ul className="list-disc list-inside ml-3 space-y-1 mb-4">
                      <li><strong className="text-gray-700">Acceso:</strong> conocer qué datos personales tenemos sobre usted y cómo los utilizamos</li>
                      <li><strong className="text-gray-700">Rectificación:</strong> corregir sus datos cuando sean inexactos o incompletos</li>
                      <li><strong className="text-gray-700">Cancelación:</strong> solicitar la eliminación de sus datos cuando considere que no son necesarios</li>
                      <li><strong className="text-gray-700">Oposición:</strong> oponerse al tratamiento de sus datos para finalidades específicas</li>
                    </ul>
                    <p className="mb-3">
                      Para ejercer sus derechos ARCO, envíe su solicitud a{" "}
                      <a href="mailto:privacidad@buscocredito.com" className="text-[#0e3a45] underline underline-offset-2 hover:opacity-80 transition-opacity">
                        privacidad@buscocredito.com
                      </a>{" "}
                      incluyendo:
                    </p>
                    <ul className="list-disc list-inside ml-3 space-y-1 mb-4">
                      <li>Nombre completo</li>
                      <li>Documento oficial que acredite su identidad</li>
                      <li>Descripción clara del derecho que desea ejercer y los datos a los que se refiere</li>
                      <li>Cualquier documento que facilite la localización de la información</li>
                    </ul>
                    <p className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm">
                      <strong className="text-gray-800">Plazos de respuesta:</strong> Daremos respuesta a su solicitud en un plazo máximo de <strong>20 días hábiles</strong> contados desde su recepción. De ser procedente, la resolución se hará efectiva dentro de los 15 días hábiles siguientes. Ambos plazos pueden ampliarse una sola vez por un periodo igual, cuando así lo justifiquen las circunstancias.
                    </p>
                  </section>

                  {/* 6. Cookies */}
                  <section id="cookies" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">6.</span>
                      Cookies y Tecnologías de Rastreo
                    </h2>
                    <p className="mb-3">Utilizamos cookies y tecnologías similares para:</p>
                    <ul className="list-disc list-inside ml-3 space-y-1 mb-3">
                      <li><strong className="text-gray-700">Cookies esenciales:</strong> mantener su sesión activa y garantizar el funcionamiento de la plataforma</li>
                      <li><strong className="text-gray-700">Cookies analíticas:</strong> analizar el uso del sitio para mejorar nuestros servicios</li>
                      <li><strong className="text-gray-700">Cookies de preferencias:</strong> recordar sus configuraciones y personalizar su experiencia</li>
                    </ul>
                    <p>
                      Puede configurar su navegador para rechazar cookies. Las cookies esenciales no pueden desactivarse sin afectar el funcionamiento de la plataforma.
                    </p>
                  </section>

                  {/* 7. Seguridad */}
                  <section id="seguridad" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">7.</span>
                      Medidas de Seguridad
                    </h2>
                    <p className="mb-3">
                      Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger sus datos personales, incluyendo:
                    </p>
                    <ul className="list-disc list-inside ml-3 space-y-1">
                      <li>Cifrado AES-256 para datos sensibles en tránsito y en reposo</li>
                      <li>Firewalls y sistemas de detección de intrusiones</li>
                      <li>Control de acceso restringido a datos personales</li>
                      <li>Políticas internas de seguridad de la información</li>
                      <li>Capacitación periódica al personal con acceso a datos</li>
                    </ul>
                  </section>

                  {/* 8. Cambios */}
                  <section id="cambios" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">8.</span>
                      Cambios a la Política de Privacidad
                    </h2>
                    <p>
                      Nos reservamos el derecho de modificar esta política en cualquier momento para
                      reflejar cambios en nuestras prácticas o en la legislación aplicable. Los cambios
                      serán publicados en esta página con la fecha de actualización correspondiente.
                      Cuando los cambios sean significativos, se lo notificaremos por correo electrónico
                      o mediante un aviso visible en la plataforma.
                    </p>
                  </section>

                  {/* 9. Retención de Datos */}
                  <section id="retencion" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">9.</span>
                      Retención y Eliminación de Datos
                    </h2>
                    <p className="mb-3">
                      Conservamos sus datos personales durante el tiempo necesario para cumplir con las
                      finalidades descritas en esta política, así como para atender obligaciones legales,
                      regulatorias o contractuales aplicables.
                    </p>
                    <p className="mb-3">Tras la cancelación de su cuenta:</p>
                    <ul className="list-disc list-inside ml-3 space-y-1 mb-3">
                      <li>Sus datos serán eliminados en un plazo máximo de <strong className="text-gray-700">60 días naturales</strong>, salvo aquellos que deban conservarse por disposición legal</li>
                      <li>Los datos que la ley exija conservar se mantendrán bloqueados durante el tiempo requerido y serán eliminados al vencimiento de dicho plazo</li>
                      <li>Ciertos datos podrán conservarse de forma anonimizada para fines estadísticos</li>
                    </ul>
                    <p className="text-sm text-gray-500">
                      Los plazos de conservación legal aplicables incluyen, entre otros, los establecidos por el SAT en materia fiscal y los requerimientos de la CONDUSEF para registros de servicios financieros.
                    </p>
                  </section>

                  {/* 10. Buró de Crédito */}
                  <section id="buro" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">10.</span>
                      Proceso de Consulta al Buró de Crédito
                    </h2>
                    <p className="mb-3">
                      Con su autorización expresa, BuscoCrédito consulta su historial crediticio ante
                      las sociedades de información crediticia para evaluar su solicitud. Este proceso:
                    </p>
                    <ul className="list-disc list-inside ml-3 space-y-1 mb-4">
                      <li>Se realiza exclusivamente con su consentimiento previo</li>
                      <li>Utiliza una conexión cifrada para garantizar la seguridad de la transmisión</li>
                      <li>La información obtenida se procesa y almacena de forma segura en nuestros servidores</li>
                      <li>Solo se comparte con las instituciones financieras la información estrictamente necesaria para la evaluación inicial de su solicitud</li>
                    </ul>
                    <p className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm">
                      <strong className="text-gray-800">Importante:</strong> La consulta se registra como tipo <strong>&quot;suave&quot;</strong> y no afecta su historial crediticio.
                    </p>
                  </section>

                  {/* 11. Canales */}
                  <section id="canales" className="scroll-mt-24 px-6 sm:px-8 py-7 text-gray-600 leading-relaxed">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-baseline gap-2">
                      <span className="text-[#0e3a45] font-bold">11.</span>
                      Canales de Comunicación
                    </h2>
                    <p className="mb-4">
                      Para garantizar una atención especializada, contamos con los siguientes canales:
                    </p>
                    <ul className="space-y-3">
                      {[
                        { email: "privacidad@buscocredito.com", desc: "Ejercicio de derechos ARCO y consultas sobre datos personales" },
                        { email: "legal@buscocredito.com", desc: "Consultas sobre términos, condiciones y asuntos legales" },
                        { email: "contacto@buscocredito.com", desc: "Atención general y soporte técnico" },
                        { email: "transparencia@buscocredito.com", desc: "Consultas sobre prácticas y políticas de transparencia" },
                      ].map(({ email, desc }) => (
                        <li key={email} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                          <a href={`mailto:${email}`} className="text-[#0e3a45] font-medium underline underline-offset-2 hover:opacity-80 transition-opacity shrink-0">
                            {email}
                          </a>
                          <span className="text-gray-500 text-sm sm:before:content-['—'] sm:before:mx-2">{desc}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-sm text-gray-500">
                      Si considera que su solicitud no fue atendida satisfactoriamente, tiene derecho a
                      acudir ante el INAI (Instituto Nacional de Transparencia, Acceso a la Información
                      y Protección de Datos Personales) en{" "}
                      <a href="https://www.inai.org.mx" target="_blank" rel="noopener noreferrer" className="text-[#0e3a45] underline underline-offset-2 hover:opacity-80 transition-opacity">
                        www.inai.org.mx
                      </a>
                      .
                    </p>
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

export default PoliticaPrivacidad;
