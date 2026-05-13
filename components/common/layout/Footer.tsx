import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer role="contentinfo">
      <div className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Logo Section */}
            <div className="md:col-span-1">
              <p className="text-sm text-gray-600 leading-relaxed mb-4 max-w-xs">
                Marketplace financiero que conecta personas solicitantes con instituciones
                financieras para comparar ofertas con mayor claridad.
              </p>
            </div>

            {/* Navegación */}
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Navegación</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link
                    href="/"
                    className="hover:text-[#0e3a45] transition"
                  >
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link
                    href="/soluciones"
                    className="hover:text-[#0e3a45] transition"
                  >
                    Soluciones
                  </Link>
                </li>
                <li>
                  <Link
                    href="/como-funciona"
                    className="hover:text-[#0e3a45] transition"
                  >
                    Cómo funciona
                  </Link>
                </li>
                <li>
                  <Link
                    href="/prestamista"
                    className="hover:text-[#0e3a45] transition"
                  >
                    Institución financiera
                  </Link>
                </li>
              </ul>
            </div>

            {/* Compañía */}
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Compañía</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link
                    href="/acerca-de"
                    className="hover:text-[#0e3a45] transition"
                  >
                    Acerca de
                  </Link>
                </li>
                <li>
                  <Link
                    href="/transparencia"
                    className="hover:text-[#0e3a45] transition"
                  >
                    Transparencia
                  </Link>
                </li>
                <li>
                  <Link
                    href="mailto:contacto@buscocredito.com"
                    className="hover:text-[#0e3a45] transition"
                  >
                    contacto@buscocredito.com
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link
                    href="/terminos"
                    className="hover:text-[#0e3a45] transition"
                  >
                    Términos y condiciones
                  </Link>
                </li>
                <li>
                  <Link
                    href="/politica-privacidad"
                    className="hover:text-[#0e3a45] transition"
                  >
                    Política de privacidad
                  </Link>
                </li>
                <li>
                  <Link
                    href="/aviso-legal"
                    className="hover:text-[#0e3a45] transition"
                  >
                    Aviso legal
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-gray-500">
                © BuscoCrédito 2026. Todos los derechos reservados.
              </p>
              <p className="text-xs text-gray-500">
                BuscoCrédito no otorga préstamos; funciona como intermediario financiero.
              </p>
            </div>
        </div>
      </div>

      {/* Green bottom bar */}
      <div className="h-3 bg-green-600"></div>
    </footer>
  );
};

export default Footer;
