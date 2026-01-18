import React from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";

const Footer = () => {
  return (
    <footer
      className="bg-white border-t border-gray-100 py-16"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo Section */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Wallet className="w-8 h-8 text-green-600" />
              <span className="font-display font-bold text-xl text-[#0e3a45]">
                Busco<span className="text-green-600">Crédito</span>
              </span>
            </div>
            <p className="text-xs text-gray-500">
              © BuscoCrédito 2026 - All Rights Reserved
            </p>
          </div>

          {/* Soluciones */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Soluciones</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link
                  href="/prestamos"
                  className="hover:text-[#0e3a45] transition"
                >
                  Crédito personal
                </Link>
              </li>
              <li>
                <Link
                  href="/prestamos"
                  className="hover:text-[#0e3a45] transition"
                >
                  Crédito hoy
                </Link>
              </li>
              <li>
                <Link
                  href="/prestamista"
                  className="hover:text-[#0e3a45] transition"
                >
                  Otros servicios
                </Link>
              </li>
            </ul>
          </div>

          {/* Nosotros */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Nosotros</h4>
            <ul className="space-y-3 text-sm text-gray-600">
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
                  href="/como-funciona"
                  className="hover:text-[#0e3a45] transition"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#0e3a45] transition">
                  Bolsa de Trabajo
                </Link>
              </li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Ayuda</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link
                  href="/como-funciona"
                  className="hover:text-[#0e3a45] transition"
                >
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link
                  href="/como-funciona"
                  className="hover:text-[#0e3a45] transition"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/terminos"
                  className="hover:text-[#0e3a45] transition"
                >
                  Términos
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-privacidad"
                  className="hover:text-[#0e3a45] transition"
                >
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
