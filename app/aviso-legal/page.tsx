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
              BuscoCredito es un marketplace financiero operado por [Nombre
              Legal de la Empresa], con domicilio en [Dirección Legal]. La
              plataforma actúa exclusivamente como intermediario entre
              prestamistas y prestatarios.
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

          {/* Seguridad */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              5. Seguridad
            </h2>
            <p className="text-gray-600">
              Utilizamos cifrado AES-256 y seguimos las mejores prácticas de
              seguridad para proteger la información de nuestros usuarios. Sin
              embargo, ningún sistema es 100% seguro, por lo que recomendamos a
              los usuarios tomar precauciones adicionales al compartir
              información sensible.
            </p>
          </section>

          {/* Modificaciones */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              6. Modificaciones
            </h2>
            <p className="text-gray-600">
              BuscoCredito se reserva el derecho de modificar este Aviso Legal
              en cualquier momento. Los cambios entrarán en vigor desde su
              publicación en la plataforma.
            </p>
          </section>

          {/* Contacto */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              7. Contacto
            </h2>
            <p className="text-gray-600">
              Para cualquier duda o aclaración sobre este Aviso Legal, puede
              contactarnos a través de [correo electrónico de contacto] o
              [teléfono de contacto].
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
