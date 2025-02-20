"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";

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

  return (
    <nav className="w-full bg-white fixed top-0 z-50">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 h-20 border-b border-gray-100">
        {/* Logo and Brand */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="relative w-12 h-12">
              <Image
                src="/img/logo.png"
                alt="BuscoCredito Logo"
                width={500}
                height={500}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-[#2EA043] text-2xl font-semibold ml-2">
              BuscoCredito
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center">
          <div className="flex space-x-8 mr-8">
            <Link
              href="/acerca-de"
              className={`text-gray-700 hover:text-[#2EA043] transition-colors duration-200 text-base font-medium ${
                pathname === "/acerca-de" ? "text-[#2EA043]" : ""
              }`}
            >
              Acerca de
            </Link>
            <Link
              href="/prestamos"
              className={`text-gray-700 hover:text-[#2EA043] transition-colors duration-200 text-base font-medium ${
                pathname === "/prestamos" ? "text-[#2EA043]" : ""
              }`}
            >
              ¿Necesitas un préstamo?
            </Link>
            <Link
              href="/prestamista"
              className={`text-gray-700 hover:text-[#2EA043] transition-colors duration-200 text-base font-medium ${
                pathname === "/prestamista" ? "text-[#2EA043]" : ""
              }`}
            >
              ¿Eres prestamista?
            </Link>
            <Link
              href="/como-funciona"
              className={`text-gray-700 hover:text-[#2EA043] transition-colors duration-200 text-base font-medium ${
                pathname === "/como-funciona" ? "text-[#2EA043]" : ""
              }`}
            >
              ¿Cómo funciona?
            </Link>
          </div>

          {!shouldHideAuthButtons && (
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="px-5 py-2 text-[#2EA043] font-medium hover:text-green-700 transition-colors duration-200"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2 rounded-lg bg-[#2EA043] text-white font-medium hover:bg-green-700 transition-colors duration-200"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
        >
          <div className="w-6 h-5 flex flex-col justify-between">
            <span
              className={`block h-0.5 w-6 bg-gray-600 transform transition-transform ${
                isOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-gray-600 transition-opacity ${
                isOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-gray-600 transform transition-transform ${
                isOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </div>
        </button>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100">
            <div className="max-w-[1400px] mx-auto py-4 px-4">
              <div className="flex flex-col space-y-4">
                <Link
                  href="/acerca-de"
                  className={`text-gray-700 hover:text-[#2EA043] transition-colors duration-200 py-2 ${
                    pathname === "/acerca-de" ? "text-[#2EA043]" : ""
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Acerca de
                </Link>
                <Link
                  href="/prestamos"
                  className={`text-gray-700 hover:text-[#2EA043] transition-colors duration-200 py-2 ${
                    pathname === "/prestamos" ? "text-[#2EA043]" : ""
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  ¿Necesitas un préstamo?
                </Link>
                <Link
                  href="/prestamista"
                  className={`text-gray-700 hover:text-[#2EA043] transition-colors duration-200 py-2 ${
                    pathname === "/prestamista" ? "text-[#2EA043]" : ""
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  ¿Eres prestamista?
                </Link>
                <Link
                  href="/como-funciona"
                  className={`text-gray-700 hover:text-[#2EA043] transition-colors duration-200 py-2 ${
                    pathname === "/como-funciona" ? "text-[#2EA043]" : ""
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  ¿Cómo funciona?
                </Link>

                {!shouldHideAuthButtons && (
                  <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
                    <Link
                      href="/login"
                      className="w-full px-4 py-2 text-center text-[#2EA043] font-medium border border-[#2EA043] rounded-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      href="/signup"
                      className="w-full px-4 py-2 text-center rounded-lg bg-[#2EA043] text-white font-medium hover:bg-green-700"
                      onClick={() => setIsOpen(false)}
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
