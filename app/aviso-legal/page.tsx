"use client";

import React from "react";

const AvisoLegal = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Aviso Legal
        </h1>

        <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
          {/* Información de la Empresa */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              1. Información General
            </h2>
            <p className="text-gray-600">
              BuscoCredito es un marketplace financiero operado por BuscoCredito
              S.A. de C.V., con domicilio fiscal en [Dirección Legal], inscrita
              en el Registro Público de Comercio bajo el folio mercantil número
              [Número], y con RFC [RFC]. La plataforma actúa exclusivamente como
              intermediario entre prestamistas y prestatarios.
            </p>
          </section>

          {/* Naturaleza del Servicio */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              2. Naturaleza del Servicio
            </h2>
            <p className="text-gray-600 mb-4">
              BuscoCredito NO es una entidad financiera y NO otorga préstamos
              directamente. Nuestra plataforma funciona exclusivamente como un
              marketplace que conecta a personas que buscan préstamos con
              instituciones financieras autorizadas.
            </p>
            <p className="text-gray-600">
              Las ofertas de préstamos son realizadas directamente por las
              instituciones financieras registradas en nuestra plataforma,
              quienes son las únicas responsables de los términos y condiciones
              de sus ofertas.
            </p>
          </section>

          {/* Responsabilidades */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              3. Responsabilidades
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>
                BuscoCredito no garantiza la aprobación de ningún préstamo.
              </li>
              <li>
                No nos hacemos responsables por las decisiones financieras
                tomadas por los usuarios.
              </li>
              <li>
                La plataforma no participa en la evaluación crediticia final ni
                en el proceso de desembolso.
              </li>
              <li>
                Los usuarios son responsables de verificar la legitimidad de las
                instituciones financieras antes de aceptar cualquier oferta.
              </li>
            </ul>
          </section>

          {/* Protección de Datos */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              4. Protección de Datos
            </h2>
            <p className="text-gray-600 mb-4">
              Todos los datos personales son tratados de acuerdo con nuestra
              Política de Privacidad y la legislación vigente en materia de
              protección de datos.
            </p>
            <p className="text-gray-600">
              La autorización para consultar el Buró de Crédito es gestionada de
              manera segura y solo se comparte con las instituciones financieras
              autorizadas cuando el usuario lo permite explícitamente.
            </p>
          </section>

          {/* Propiedad Intelectual */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              5. Propiedad Intelectual y Uso del Sitio
            </h2>
            <p className="text-gray-600 mb-4">
              Todo el contenido de este sitio web (incluyendo, pero no limitado
              a, texto, logotipos, contenido multimedia, diseños, software) está
              protegido por derechos de autor y es propiedad exclusiva de
              BuscoCredito S.A. de C.V. o de terceros que han autorizado su uso.
            </p>
            <p className="text-gray-600">
              Queda estrictamente prohibida cualquier reproducción,
              distribución, transmisión, almacenamiento, o uso total o parcial
              del contenido de este sitio sin la autorización previa y por
              escrito de BuscoCredito.
            </p>
          </section>

          {/* Uso del Sitio */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              6. Condiciones de Uso del Sitio
            </h2>
            <p className="text-gray-600 mb-4">
              El usuario se compromete a utilizar el sitio web y sus servicios
              de conformidad con la ley, este Aviso Legal, y demás avisos e
              instrucciones puestos en su conocimiento.
            </p>
            <p className="text-gray-600">
              BuscoCredito se reserva el derecho de denegar o retirar el acceso
              al sitio y/o servicios en cualquier momento y sin necesidad de
              preaviso a aquellos usuarios que incumplan estas condiciones.
            </p>
          </section>

          {/* Enlaces a Terceros */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              7. Enlaces a Sitios de Terceros
            </h2>
            <p className="text-gray-600">
              Este sitio puede contener enlaces a sitios web de terceros.
              BuscoCredito no asume ninguna responsabilidad por el contenido,
              información o servicios que pudieran aparecer o ofrecerse en
              dichos sitios, que tendrán carácter meramente informativo.
            </p>
          </section>

          {/* Cookies y Privacidad */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              8. Cookies y Tecnologías de Seguimiento
            </h2>
            <p className="text-gray-600">
              Este sitio utiliza cookies y otras tecnologías de seguimiento para
              mejorar la experiencia del usuario y analizar el tráfico. Al
              utilizar nuestro sitio, el usuario acepta el uso de estas
              tecnologías según se detalla en nuestra Política de Cookies.
            </p>
          </section>

          {/* Seguridad */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              9. Seguridad
            </h2>
            <p className="text-gray-600">
              Utilizamos cifrado AES-256 y seguimos las mejores prácticas de
              seguridad para proteger la información de nuestros usuarios. Sin
              embargo, ningún sistema es 100% seguro, por lo que recomendamos a
              los usuarios tomar precauciones adicionales al compartir
              información sensible.
            </p>
          </section>

          {/* Jurisdicción */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              10. Ley Aplicable y Jurisdicción
            </h2>
            <p className="text-gray-600">
              Este Aviso Legal se rige por la legislación mexicana. Para la
              resolución de cualquier controversia que pudiera surgir de la
              interpretación o cumplimiento del presente Aviso Legal, las partes
              se someten expresamente a la jurisdicción de los tribunales
              competentes de la Ciudad de México, renunciando expresamente a
              cualquier otro fuero que pudiera corresponderles por razón de sus
              domicilios presentes o futuros.
            </p>
          </section>

          {/* Limitación de Responsabilidad */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              11. Limitación de Responsabilidad
            </h2>
            <p className="text-gray-600 mb-4">
              BuscoCredito no será responsable de:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>
                Decisiones tomadas por los usuarios basadas en la información
                proporcionada
              </li>
              <li>
                Interrupciones temporales del servicio por mantenimiento o
                causas técnicas
              </li>
              <li>
                Daños causados por virus, programas maliciosos o lesivos en los
                contenidos
              </li>
              <li>
                La veracidad, integridad o actualización de la información
                proporcionada por terceros
              </li>
              <li>
                El incumplimiento por parte de los prestamistas de sus
                obligaciones legales o contractuales
              </li>
              <li>
                Pérdidas económicas directas o indirectas derivadas del uso de
                la plataforma
              </li>
            </ul>
          </section>

          {/* Contacto */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              12. Contacto
            </h2>
            <p className="text-gray-600">
              Para cualquier duda o aclaración sobre este Aviso Legal, puede
              contactarnos a través de legal@buscocredito.com o al teléfono
              [Número de Contacto]. Nuestro horario de atención es de lunes a
              viernes de 9:00 a 18:00 horas (hora del Centro de México).
            </p>
          </section>

          {/* Fecha */}
          <section className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Última actualización: {new Date().toLocaleDateString()}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AvisoLegal;
