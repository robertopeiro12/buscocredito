import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-600 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-center">
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h2 className="text-2xl font-semibold text-green-600 mb-2">
              BuscoCredito
            </h2>
            <p className="text-sm">
              Conectando prestatarios y prestamistas para un mejor futuro
              financiero.
            </p>
          </div>
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-2">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#acerca"
                  className="hover:text-green-600 transition-colors duration-300"
                >
                  Acerca de
                </Link>
              </li>
              <li>
                <Link
                  href="#prestamo"
                  className="hover:text-green-600 transition-colors duration-300"
                >
                  ¿Necesitas un préstamo?
                </Link>
              </li>
              <li>
                <Link
                  href="#prestamista"
                  className="hover:text-green-600 transition-colors duration-300"
                >
                  ¿Eres prestamista?
                </Link>
              </li>
              <li>
                <Link
                  href="#funcionalidad"
                  className="hover:text-green-600 transition-colors duration-300"
                >
                  ¿Cómo funciona?
                </Link>
              </li>
            </ul>
          </div>
          <div className="w-full md:w-1/3">
            <h3 className="text-lg font-semibold mb-2">Contáctanos</h3>
            <p className="text-sm mb-2">Correo: info@buscocredito.com</p>
            <p className="text-sm">Teléfono: +52 (123) 456-7890</p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm">
          © {new Date().getFullYear()} BuscoCredito. Todos los derechos
          reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
