"use client";

import React from "react";

const Terminos = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Términos y Condiciones de Uso de BuscoCredito
        </h1>

        <div className="bg-white shadow-lg rounded-lg p-6 space-y-8">
          {/* Introducción */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              1. Introducción
            </h2>
            <p className="text-gray-600">
              Bienvenido a BuscoCredito. Estos Términos y Condiciones regulan el
              uso de nuestra plataforma de intermediación financiera, disponible
              en buscocredito.com. Al acceder o utilizar nuestros servicios,
              usted acepta cumplir con estos términos en su totalidad. Si no
              está de acuerdo con alguna disposición, por favor absténgase de
              utilizar la plataforma.
            </p>
          </section>

          {/* Definiciones */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              2. Definiciones
            </h2>
            <ul className="list-none space-y-3 text-gray-600">
              <li>
                <span className="font-medium">BuscoCredito:</span> Plataforma
                digital que permite a prestamistas y prestatarios conectarse
                para la generación de ofertas de crédito.
              </li>
              <li>
                <span className="font-medium">Prestatario:</span> Persona física
                o moral que busca obtener un préstamo mediante la plataforma.
              </li>
              <li>
                <span className="font-medium">Prestamista:</span> Institución
                financiera o entidad autorizada que ofrece préstamos a los
                prestatarios a través de la plataforma.
              </li>
              <li>
                <span className="font-medium">Administrador:</span> Usuario
                representante de una institución financiera con facultades para
                registrar y gestionar cuentas de trabajadores dentro de la
                plataforma.
              </li>
              <li>
                <span className="font-medium">Trabajador:</span> Usuario
                habilitado por un Administrador para interactuar con la
                plataforma y realizar ofertas de préstamo.
              </li>
              <li>
                <span className="font-medium">Oferta de Préstamo:</span>{" "}
                Propuesta formal realizada por un Prestamista que incluye
                términos y condiciones específicos del préstamo ofrecido.
              </li>
              <li>
                <span className="font-medium">Servicios:</span> Conjunto de
                funcionalidades proporcionadas por la plataforma para facilitar
                la conexión entre Prestamistas y Prestatarios.
              </li>
              <li>
                <span className="font-medium">Contenido del Usuario:</span> Toda
                información, datos y material proporcionado por los usuarios en
                la plataforma.
              </li>
            </ul>
          </section>

          {/* Objeto del Servicio */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              3. Objeto del Servicio
            </h2>
            <p className="text-gray-600">
              BuscoCredito actúa como un intermediario tecnológico que facilita
              la comunicación entre prestatarios y prestamistas. La plataforma
              no ofrece préstamos ni asume responsabilidad sobre las ofertas
              realizadas por los prestamistas.
            </p>
          </section>

          {/* Registro y Uso de la Plataforma */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              4. Registro y Uso de la Plataforma
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  4.1. Registro de Usuarios:
                </h3>
                <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                  <li>
                    Para acceder a la plataforma, los prestatarios deben
                    proporcionar información personal, incluyendo nombre
                    completo, RFC, domicilio y demás datos necesarios.
                  </li>
                  <li>
                    Los prestamistas deben registrarse a través de un
                    Administrador de su institución financiera, quien recibirá
                    un token especial de acceso tras la verificación de su
                    institución.
                  </li>
                  <li>
                    El token de registro empresarial es intransferible y su uso
                    indebido resultará en la cancelación inmediata de la cuenta
                    y posibles acciones legales.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  4.2. Uso del Marketplace:
                </h3>
                <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                  <li>
                    Los prestatarios pueden enviar solicitudes de préstamo
                    indicando monto, plazo y otras condiciones.
                  </li>
                  <li>
                    Los prestamistas pueden analizar solicitudes y enviar
                    ofertas de préstamo personalizadas.
                  </li>
                  <li>
                    Los prestatarios pueden seleccionar la oferta que mejor les
                    convenga.
                  </li>
                  <li>
                    Los ingresos declarados deberán ser comprobables mediante
                    documentación oficial cuando la institución financiera lo
                    requiera.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  4.3. Autorización para Consulta en Buró de Crédito:
                </h3>
                <p className="text-gray-600 ml-4">
                  Al registrarse, los prestatarios otorgan autorización expresa
                  para la consulta de su historial crediticio mediante servicios
                  de terceros.
                </p>
              </div>
            </div>
          </section>

          {/* Responsabilidades y Obligaciones */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              5. Responsabilidades y Obligaciones
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  5.1. BuscoCredito:
                </h3>
                <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                  <li>
                    Proporcionar una plataforma segura y funcional para la
                    intermediación financiera.
                  </li>
                  <li>
                    Implementar medidas de seguridad para la protección de
                    datos.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  5.2. Prestatarios:
                </h3>
                <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                  <li>Proveer información veraz y actualizada.</li>
                  <li>
                    Evaluar las ofertas recibidas y asumir las condiciones
                    pactadas con los prestamistas.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  5.3. Prestamistas:
                </h3>
                <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                  <li>
                    Cumplir con la normativa aplicable en materia financiera y
                    de protección al consumidor.
                  </li>
                  <li>
                    Presentar ofertas transparentes y respetar las condiciones
                    de las mismas.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Limitación de Responsabilidad */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              6. Limitación de Responsabilidad
            </h2>
            <p className="text-gray-600">
              BuscoCredito no es responsable por la veracidad de la información
              proporcionada por los usuarios, ni por la relación contractual que
              se genere entre prestatario y prestamista. No garantizamos la
              aprobación de créditos ni la calidad de los servicios ofrecidos
              por los prestamistas.
            </p>
          </section>

          {/* Privacidad y Protección de Datos */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              7. Privacidad y Protección de Datos
            </h2>
            <p className="text-gray-600">
              La información recopilada por BuscoCredito se manejará conforme a
              nuestra Política de Privacidad. Los datos personales solo serán
              compartidos con terceros cuando sea necesario para la prestación
              del servicio.
            </p>
          </section>

          {/* Modificaciones */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              8. Modificaciones a los Términos y Condiciones
            </h2>
            <p className="text-gray-600">
              BuscoCredito se reserva el derecho de modificar estos Términos y
              Condiciones en cualquier momento. Cualquier cambio será notificado
              a los usuarios y entrará en vigor desde su publicación en la
              plataforma.
            </p>
          </section>

          {/* Propiedad Intelectual */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              9. Propiedad Intelectual
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Todos los derechos de propiedad intelectual relacionados con
                BuscoCredito, incluyendo pero no limitado a marcas comerciales,
                logotipos, diseños, textos, gráficos y software, son propiedad
                exclusiva de BuscoCredito o sus licenciantes.
              </p>
              <p className="text-gray-600">
                Los usuarios no están autorizados a copiar, modificar,
                distribuir, vender o arrendar ninguna parte de nuestros
                servicios o software incluido.
              </p>
            </div>
          </section>

          {/* Responsabilidades Financieras */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              10. Responsabilidades Financieras
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                BuscoCredito no asume responsabilidad por:
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                <li>Incumplimientos de pago entre las partes</li>
                <li>La capacidad de pago de los Prestatarios</li>
                <li>La solvencia de las instituciones financieras</li>
                <li>Disputas financieras entre Prestamistas y Prestatarios</li>
                <li>La veracidad de la información financiera proporcionada</li>
              </ul>
            </div>
          </section>

          {/* Proceso de Verificación */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              11. Proceso de Verificación
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                BuscoCredito realiza una verificación básica de las
                instituciones financieras registradas. Sin embargo, esta
                verificación:
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                <li>No constituye una recomendación o respaldo</li>
                <li>No garantiza la calidad de sus servicios</li>
                <li>No asegura la aprobación de préstamos</li>
              </ul>
            </div>
          </section>

          {/* Terminación del Servicio */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              12. Terminación del Servicio
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                BuscoCredito se reserva el derecho de:
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                <li>Suspender o terminar cuentas que violen estos términos</li>
                <li>Modificar o discontinuar el servicio sin previo aviso</li>
                <li>Rechazar el acceso a cualquier usuario</li>
              </ul>
              <p className="text-gray-600 mt-4">
                Los usuarios pueden cancelar su cuenta en cualquier momento,
                quedando pendientes las obligaciones financieras existentes.
              </p>
            </div>
          </section>

          {/* Fuerza Mayor */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              13. Fuerza Mayor
            </h2>
            <p className="text-gray-600">
              BuscoCredito no será responsable por el incumplimiento de sus
              obligaciones debido a circunstancias fuera de su control
              razonable, incluyendo pero no limitado a: desastres naturales,
              pandemias, interrupciones tecnológicas, cambios regulatorios o
              acciones gubernamentales.
            </p>
          </section>

          {/* Indemnización */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              14. Indemnización
            </h2>
            <p className="text-gray-600">
              Los usuarios acuerdan indemnizar y mantener indemne a
              BuscoCredito, sus directores, empleados y agentes, de cualquier
              reclamo, demanda, pérdida, responsabilidad y gastos (incluyendo
              honorarios legales) que surjan del uso de la plataforma o la
              violación de estos términos.
            </p>
          </section>

          {/* Legislación Aplicable */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              15. Legislación Aplicable y Jurisdicción
            </h2>
            <p className="text-gray-600">
              Estos Términos y Condiciones se rigen por las leyes de los Estados
              Unidos Mexicanos. Cualquier controversia se someterá a los
              tribunales competentes de la Ciudad de México, renunciando las
              partes a cualquier otro fuero que pudiera corresponderles por
              razón de sus domicilios presentes o futuros.
            </p>
          </section>

          {/* Contacto */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              16. Contacto
            </h2>
            <p className="text-gray-600">
              Para cualquier consulta sobre estos términos, puede contactarnos a
              través de nuestro sitio web buscocredito.com o mediante nuestro
              correo electrónico legal@buscocredito.com.
            </p>
          </section>

          {/* Responsabilidades del Administrador */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              17. Responsabilidades del Administrador
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Los Administradores de instituciones financieras tienen las
                siguientes responsabilidades y limitaciones:
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>
                  Gestionar y supervisar las cuentas de los trabajadores de su
                  institución.
                </li>
                <li>
                  Garantizar el uso apropiado del token de registro y la
                  plataforma.
                </li>
                <li>
                  Mantener actualizada la información de la institución
                  financiera.
                </li>
                <li>
                  Asegurar el cumplimiento de las políticas de seguridad y
                  privacidad.
                </li>
                <li>
                  Reportar cualquier actividad sospechosa o uso indebido de la
                  plataforma.
                </li>
              </ul>
            </div>
          </section>

          {/* Cumplimiento Regulatorio */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              18. Cumplimiento Regulatorio
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                BuscoCredito opera en cumplimiento con:
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>
                  Ley para Regular las Instituciones de Tecnología Financiera
                  (Ley Fintech)
                </li>
                <li>
                  Ley Federal de Protección de Datos Personales en Posesión de
                  los Particulares
                </li>
                <li>
                  Disposiciones de la Comisión Nacional para la Protección y
                  Defensa de los Usuarios de Servicios Financieros (CONDUSEF)
                </li>
                <li>
                  Ley Federal para la Prevención e Identificación de Operaciones
                  con Recursos de Procedencia Ilícita
                </li>
              </ul>
              <p className="text-gray-600 mt-4">
                Para la resolución de disputas, los usuarios pueden acudir a la
                CONDUSEF o a los tribunales competentes de la Ciudad de México,
                según corresponda la naturaleza de la reclamación.
              </p>
            </div>
          </section>

          {/* Retención y Eliminación de Datos */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              19. Retención y Eliminación de Datos
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                BuscoCredito mantiene los datos personales y financieros durante
                el tiempo necesario para cumplir con:
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Las finalidades descritas en la Política de Privacidad</li>
                <li>Obligaciones legales y regulatorias aplicables</li>
                <li>Requerimientos de las autoridades competentes</li>
              </ul>
              <p className="text-gray-600 mt-4">
                Tras la cancelación de una cuenta, los datos serán:
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>
                  Eliminados en un plazo máximo de 60 días naturales, excepto
                  aquellos que por ley deban conservarse por un período mayor
                </li>
                <li>
                  Conservados de forma anonimizada para fines estadísticos
                </li>
                <li>
                  Protegidos bajo las mismas medidas de seguridad hasta su
                  eliminación definitiva
                </li>
              </ul>
            </div>
          </section>

          {/* Fecha de última actualización */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Última actualización: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminos;
