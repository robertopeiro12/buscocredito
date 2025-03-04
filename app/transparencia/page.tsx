"use client";

import React from "react";

const Transparencia = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Transparencia
        </h1>

        <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
          {/* Introducción */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              1. Nuestro Compromiso
            </h2>
            <p className="text-gray-600">
              En BuscoCredito nos comprometemos a operar con total
              transparencia, proporcionando información clara y precisa sobre
              nuestros servicios, procesos y relaciones comerciales. Creemos que
              la transparencia es fundamental para construir confianza con
              nuestros usuarios y partners financieros.
            </p>
          </section>

          {/* Modelo de Negocio */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              2. Modelo de Negocio
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                BuscoCredito opera como un marketplace que conecta:
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Personas buscando préstamos (Prestatarios)</li>
                <li>Instituciones financieras autorizadas (Prestamistas)</li>
              </ul>
              <p className="text-gray-600 mt-4">
                <strong>Importante:</strong> No somos una institución financiera
                y no otorgamos préstamos directamente. Nuestro rol es facilitar
                la conexión entre las partes y proporcionar herramientas para
                una toma de decisiones informada.
              </p>
            </div>
          </section>

          {/* Costos y Comisiones */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              3. Costos y Comisiones
            </h2>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">
                3.1 Para Prestatarios:
              </h3>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>El registro en la plataforma es completamente gratuito</li>
                <li>La búsqueda y comparación de ofertas es gratuita</li>
                <li>No cobramos comisión por la gestión de préstamos</li>
                <li>No existen costos ocultos por nuestros servicios</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-700">
                3.2 Para Instituciones Financieras:
              </h3>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Comisión por préstamo exitoso: [Porcentaje]</li>
                <li>Cuota de suscripción mensual: [Monto]</li>
                <li>
                  Servicios adicionales opcionales: Variables según el servicio
                </li>
              </ul>
            </div>
          </section>

          {/* Proceso de Selección de Prestamistas */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              4. Proceso de Selección de Prestamistas
            </h2>
            <p className="text-gray-600 mb-4">
              Todas las instituciones financieras en nuestra plataforma pasan
              por un riguroso proceso de verificación que incluye:
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>Verificación de licencias y autorizaciones regulatorias</li>
              <li>Revisión de historial operativo y reputación</li>
              <li>Evaluación de prácticas de préstamo responsable</li>
              <li>Verificación de cumplimiento normativo</li>
              <li>
                Monitoreo continuo de desempeño y satisfacción del usuario
              </li>
            </ul>
          </section>

          {/* Proceso de Matching */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              5. Proceso de Matching
            </h2>
            <p className="text-gray-600 mb-4">
              Nuestro algoritmo de matching considera:
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>Perfil crediticio del solicitante</li>
              <li>Criterios de elegibilidad de los prestamistas</li>
              <li>Términos y condiciones de los productos</li>
              <li>Preferencias del usuario</li>
            </ul>
            <p className="text-gray-600 mt-4">
              <strong>Nota:</strong> No favorecemos a ninguna institución
              financiera sobre otra. Las recomendaciones se basan únicamente en
              la compatibilidad entre el perfil del usuario y los criterios de
              los prestamistas.
            </p>
          </section>

          {/* Protección al Usuario */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              6. Protección al Usuario
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Implementamos las siguientes medidas para proteger a nuestros
                usuarios:
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Verificación de identidad robusta</li>
                <li>Encriptación de datos sensibles</li>
                <li>Monitoreo de prácticas predatorias</li>
                <li>Canal de denuncias y quejas</li>
                <li>Evaluación regular de satisfacción</li>
              </ul>
            </div>
          </section>

          {/* Métricas y Resultados */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              7. Métricas y Resultados
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">Publicamos regularmente:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Tasa de aprobación de préstamos</li>
                <li>Tiempo promedio de procesamiento</li>
                <li>Índice de satisfacción del usuario</li>
                <li>Número de quejas y resoluciones</li>
              </ul>
              <p className="text-gray-600 mt-4">
                Estas métricas se actualizan trimestralmente y están disponibles
                en nuestro dashboard de transparencia.
              </p>
            </div>
          </section>

          {/* Cumplimiento Regulatorio */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              8. Cumplimiento Regulatorio
            </h2>
            <p className="text-gray-600">
              Operamos en cumplimiento con todas las regulaciones aplicables,
              incluyendo:
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>Ley Fintech</li>
              <li>Ley Federal de Protección de Datos Personales</li>
              <li>
                Ley para la Transparencia y Ordenamiento de los Servicios
                Financieros
              </li>
              <li>Disposiciones de carácter general aplicables</li>
            </ul>
          </section>

          {/* Contacto */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              9. Contacto y Reportes
            </h2>
            <p className="text-gray-600 mb-4">
              Para consultas sobre transparencia o para reportar
              irregularidades:
            </p>
            <ul className="list-none text-gray-600">
              <li>Email: transparencia@buscocredito.com</li>
              <li>Teléfono: [Número de Contacto]</li>
              <li>
                Horario: Lunes a Viernes de 9:00 a 18:00 (Hora del Centro de
                México)
              </li>
            </ul>
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

export default Transparencia;
