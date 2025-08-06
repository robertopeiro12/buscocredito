"use client";

import React from "react";

const PoliticaPrivacidad = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Política de Privacidad
        </h1>

        <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
          {/* Introducción */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              1. Introducción
            </h2>
            <p className="text-gray-600">
              BuscoCredito S.A. de C.V. (&quot;BuscoCredito&quot;, &quot;nosotros&quot; o
              &quot;nuestro&quot;), está comprometido con la protección de sus datos
              personales. Esta Política de Privacidad describe cómo recopilamos,
              utilizamos, compartimos y protegemos su información personal de
              conformidad con la Ley Federal de Protección de Datos Personales
              en Posesión de los Particulares (LFPDPPP).
            </p>
          </section>

          {/* Datos que Recopilamos */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              2. Datos Personales que Recopilamos
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Recopilamos los siguientes tipos de información personal:
              </p>
              <h3 className="text-lg font-medium text-gray-700">
                2.1 Datos de Identificación:
              </h3>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>
                  Nombre completo (apellido paterno, apellido materno, primer
                  nombre y segundo nombre)
                </li>
                <li>Fecha de nacimiento</li>
                <li>
                  Domicilio completo (calle, número exterior, número interior,
                  colonia, ciudad, municipio, estado, código postal)
                </li>
                <li>Correo electrónico</li>
                <li>Número telefónico</li>
                <li>CURP</li>
                <li>RFC</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-700">
                2.2 Datos Financieros:
              </h3>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>
                  Historial crediticio (mediante consulta autorizada al Buró de
                  Crédito)
                </li>
                <li>
                  Ingresos mensuales declarados (sujetos a comprobación por
                  parte de las instituciones financieras)
                </li>
                <li>Información laboral básica</li>
                <li>Capacidad de pago estimada</li>
                <li>Propósito del crédito solicitado</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-700">
                2.3 Datos Técnicos:
              </h3>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Dirección IP</li>
                <li>Tipo de navegador</li>
                <li>Sistema operativo</li>
                <li>Comportamiento de navegación</li>
                <li>Tokens de autenticación y sesión</li>
              </ul>
            </div>
          </section>

          {/* Finalidades del Tratamiento */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              3. Finalidades del Tratamiento de Datos
            </h2>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">
                3.1 Finalidades Primarias:
              </h3>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Verificación de identidad</li>
                <li>Evaluación de solicitudes de préstamo</li>
                <li>Conexión con instituciones financieras</li>
                <li>Prevención de fraude</li>
                <li>Cumplimiento de obligaciones regulatorias</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-700">
                3.2 Finalidades Secundarias:
              </h3>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Mejora de nuestros servicios</li>
                <li>Envío de comunicaciones promocionales</li>
                <li>Análisis estadístico</li>
                <li>Investigación de mercado</li>
              </ul>
            </div>
          </section>

          {/* Transferencias */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              4. Transferencias de Datos
            </h2>
            <p className="text-gray-600 mb-4">
              Sus datos personales pueden ser transferidos a:
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>
                Instituciones financieras participantes en la plataforma (solo
                datos necesarios para evaluación inicial)
              </li>
              <li>
                Sociedades de información crediticia (previa autorización
                expresa)
              </li>
              <li>Autoridades competentes cuando lo requieran legalmente</li>
              <li>
                Proveedores de servicios necesarios para la operación de la
                plataforma
              </li>
            </ul>
            <p className="text-gray-600 mt-4">
              Toda transferencia se realiza con las medidas de seguridad
              apropiadas y bajo estrictos acuerdos de confidencialidad.
            </p>
            <p className="text-gray-600 mt-4">
              <strong>Nota importante:</strong> BuscoCredito no almacena ni
              procesa información bancaria o financiera sensible. La gestión de
              cuentas bancarias, transferencias y otros datos financieros
              sensibles se realiza directamente entre el usuario y las
              instituciones financieras seleccionadas.
            </p>
          </section>

          {/* Derechos ARCO */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              5. Derechos ARCO
            </h2>
            <p className="text-gray-600 mb-4">Usted tiene derecho a:</p>
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>Acceder a sus datos personales</li>
              <li>Rectificar sus datos cuando sean inexactos</li>
              <li>Cancelar sus datos</li>
              <li>Oponerse al tratamiento de sus datos</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Para ejercer sus derechos ARCO, envíe su solicitud a
              privacidad@buscocredito.com incluyendo:
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>Nombre completo</li>
              <li>Documento que acredite su identidad</li>
              <li>
                Descripción clara de los datos sobre los que busca ejercer sus
                derechos
              </li>
              <li>
                Cualquier documento que facilite la localización de sus datos
              </li>
            </ul>
          </section>

          {/* Cookies y Tecnologías */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              6. Cookies y Tecnologías de Rastreo
            </h2>
            <p className="text-gray-600 mb-4">
              Utilizamos cookies y tecnologías similares para:
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>Mantener su sesión activa</li>
              <li>Recordar sus preferencias</li>
              <li>Analizar el uso de nuestro sitio</li>
              <li>Personalizar su experiencia</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Puede configurar su navegador para rechazar cookies, aunque esto
              podría afectar la funcionalidad del sitio.
            </p>
          </section>

          {/* Medidas de Seguridad */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              7. Medidas de Seguridad
            </h2>
            <p className="text-gray-600">
              Implementamos medidas de seguridad técnicas, administrativas y
              físicas para proteger sus datos personales, incluyendo:
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>Cifrado AES-256 para datos sensibles</li>
              <li>Firewalls y sistemas de detección de intrusiones</li>
              <li>Acceso restringido a datos personales</li>
              <li>Políticas y procedimientos de seguridad</li>
              <li>Capacitación regular del personal</li>
            </ul>
          </section>

          {/* Cambios a la Política */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              8. Cambios a la Política de Privacidad
            </h2>
            <p className="text-gray-600">
              Nos reservamos el derecho de modificar esta política en cualquier
              momento. Los cambios serán publicados en esta página y, cuando
              sean significativos, se le notificará a través de nuestro sitio
              web o por correo electrónico.
            </p>
          </section>

          {/* Proceso del Buró de Crédito */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              10. Proceso de Consulta al Buró de Crédito
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                BuscoCredito utiliza una API segura para la consulta del Buró de
                Crédito, que funciona de la siguiente manera:
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>
                  La consulta se realiza en tiempo real mediante una conexión
                  cifrada AES-256
                </li>
                <li>
                  Se obtiene un archivo XML con la información crediticia del
                  solicitante
                </li>
                <li>
                  La información se procesa y almacena de forma segura en
                  nuestros servidores
                </li>
                <li>
                  Solo se comparte con las instituciones financieras la
                  información necesaria para la evaluación inicial
                </li>
              </ul>
              <p className="text-gray-600 mt-4">
                <strong>Importante:</strong> La consulta al Buró de Crédito solo
                se realiza con su autorización expresa y se registra como una
                consulta de tipo &quot;suave&quot; que no afecta su historial crediticio.
              </p>
            </div>
          </section>

          {/* Correos de Contacto */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              11. Canales de Comunicación
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Para garantizar una atención especializada, contamos con
                diferentes canales de contacto:
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>
                  <strong>privacidad@buscocredito.com:</strong> Para ejercer sus
                  derechos ARCO y temas relacionados con datos personales
                </li>
                <li>
                  <strong>legal@buscocredito.com:</strong> Para consultas sobre
                  términos y condiciones o asuntos legales
                </li>
                <li>
                  <strong>contacto@buscocredito.com:</strong> Para atención
                  general y soporte técnico
                </li>
                <li>
                  <strong>transparencia@buscocredito.com:</strong> Para
                  consultas sobre nuestras prácticas y políticas de
                  transparencia
                </li>
              </ul>
            </div>
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

export default PoliticaPrivacidad;
