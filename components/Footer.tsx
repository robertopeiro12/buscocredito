import React from "react";
import Link from "next/link";
import { Phone, Mail, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer
      className="bg-gray-100 border-t border-gray-200 text-gray-600 py-12"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Sección de la empresa */}
          <div>
            <h2 className="text-2xl font-semibold text-green-600 mb-4">
              BuscoCredito
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Tu plataforma confiable para encontrar las mejores opciones de
              financiamiento. Conectamos prestatarios con instituciones
              financieras verificadas.
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-2" />
              <span>Lun - Vie: 9:00 - 18:00</span>
            </div>
          </div>

          {/* Enlaces Principales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Servicios
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/prestamos-personales"
                  className="text-gray-600 hover:text-green-600 transition-colors duration-300"
                >
                  Préstamos Personales
                </Link>
              </li>
              <li>
                <Link
                  href="/prestamos-empresariales"
                  className="text-gray-600 hover:text-green-600 transition-colors duration-300"
                >
                  Préstamos Empresariales
                </Link>
              </li>
              <li>
                <Link
                  href="/prestamistas"
                  className="text-gray-600 hover:text-green-600 transition-colors duration-300"
                >
                  Para Prestamistas
                </Link>
              </li>
              <li>
                <Link
                  href="/como-funciona"
                  className="text-gray-600 hover:text-green-600 transition-colors duration-300"
                >
                  Cómo Funciona
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal y Regulatorio */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/terminos"
                  className="text-gray-600 hover:text-green-600 transition-colors duration-300"
                >
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-privacidad"
                  className="text-gray-600 hover:text-green-600 transition-colors duration-300"
                >
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/aviso-legal"
                  className="text-gray-600 hover:text-green-600 transition-colors duration-300"
                >
                  Aviso Legal
                </Link>
              </li>
              <li>
                <Link
                  href="/transparencia"
                  className="text-gray-600 hover:text-green-600 transition-colors duration-300"
                >
                  Transparencia
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Contacto
            </h3>
            <address className="not-italic space-y-4">
              <div className="flex items-center text-gray-600">
                <Mail className="w-5 h-5 mr-3" />
                <a
                  href="mailto:contacto@buscocredito.com"
                  className="text-sm hover:text-green-600 transition-colors duration-300"
                >
                  contacto@buscocredito.com
                </a>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-5 h-5 mr-3" />
                <a
                  href="tel:+525512345678"
                  className="text-sm hover:text-green-600 transition-colors duration-300"
                >
                  +52 (55) 1234-5678
                </a>
              </div>
            </address>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              © {new Date().getFullYear()} BuscoCredito. Todos los derechos
              reservados.
            </p>
            <p className="text-xs text-gray-400 text-center">
              BuscoCredito es una plataforma de intermediación financiera
              regulada. No somos una institución bancaria.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
