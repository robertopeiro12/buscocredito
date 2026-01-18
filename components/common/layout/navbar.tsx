"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Wallet, Menu } from "lucide-react";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const shouldHideAuthButtons =
    [
      "/login",
      "/signup",
      "/user_dashboard",
      "/admin_dashboard",
      "/lender",
      "/lender/offer",
    ].includes(pathname) || pathname.startsWith("/lender");

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/prestamos", label: "Soluciones" },
    { href: "/acerca-de", label: "Acerca de" },
    { href: "/prestamista", label: "Inversionistas" },
    { href: "/como-funciona", label: "Blog" },
  ];

  return (
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <Wallet className="w-8 h-8 text-green-600" />
            <span className="font-display font-bold text-2xl text-[#0e3a45] tracking-tight">
              Busco<span className="text-green-600">Crédito</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-gray-600 hover:text-[#0e3a45] font-medium transition ${
                  pathname === link.href ? "text-[#0e3a45]" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          {!shouldHideAuthButtons && (
            <div className="hidden md:block">
              <Link
                href="/prestamos"
                className="bg-[#0e3a45] hover:bg-[#082830] text-white px-6 py-2.5 rounded-full font-semibold text-sm transition shadow-lg transform hover:-translate-y-0.5"
              >
                SOLICITA TU CRÉDITO
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <Menu className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-lg transform transition-all duration-300 ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-7xl mx-auto py-4 px-4">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-gray-700 hover:text-[#0e3a45] transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-green-50 ${
                  pathname === link.href ? "text-[#0e3a45] bg-green-50" : ""
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {!shouldHideAuthButtons && (
              <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
                <Link
                  href="/login"
                  className="w-full text-center px-5 py-2 text-[#0e3a45] font-medium hover:text-green-700 transition-colors duration-200 border border-[#0e3a45] rounded-lg hover:bg-green-50"
                  onClick={() => setIsOpen(false)}
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/prestamos"
                  className="w-full text-center px-5 py-2 rounded-full bg-[#0e3a45] text-white font-medium hover:bg-[#082830] transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  SOLICITA TU CRÉDITO
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
