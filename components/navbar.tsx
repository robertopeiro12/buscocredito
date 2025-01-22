"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-white border-b border-gray-100 px-4 py-2.5 fixed top-0 z-50">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center">
            <div className="relative w-12 h-12">
              <Image
                src="/img/logo.png"
                alt="BuscoCredito Logo"
                width={500}
                height={500}
                className="object-contain"
              />
            </div>
            <span className="text-[#2EA043] text-2xl font-semibold ml-2">
              BuscoCredito
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          <Link
            href="/acerca-de"
            className="text-gray-700 hover:text-[#2EA043] transition-colors duration-200 text-base font-medium"
          >
            Acerca de
          </Link>
          <Link
            href="/prestamos"
            className="text-gray-700 hover:text-[#2EA043] transition-colors duration-200 text-base font-medium"
          >
            ¿Necesitas un préstamo?
          </Link>
          <Link
            href="/prestamista"
            className="text-gray-700 hover:text-[#2EA043] transition-colors duration-200 text-base font-medium"
          >
            ¿Eres prestamista?
          </Link>
          <Link
            href="/como-funciona"
            className="text-gray-700 hover:text-[#2EA043] transition-colors duration-200 text-base font-medium"
          >
            ¿Cómo funciona?
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-[#2EA043] font-medium hover:text-green-700 transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-full bg-[#2EA043] text-white font-medium hover:bg-green-700 transition-colors duration-200"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/acerca-de"
                className="text-gray-700 hover:text-[#2EA043] transition-colors duration-200"
              >
                Acerca de
              </Link>
              <Link
                href="/prestamos"
                className="text-gray-700 hover:text-[#2EA043] transition-colors duration-200"
              >
                ¿Necesitas un préstamo?
              </Link>
              <Link
                href="/prestamista"
                className="text-gray-700 hover:text-[#2EA043] transition-colors duration-200"
              >
                ¿Eres prestamista?
              </Link>
              <Link
                href="/como-funciona"
                className="text-gray-700 hover:text-[#2EA043] transition-colors duration-200"
              >
                ¿Cómo funciona?
              </Link>
              <div className="flex flex-col space-y-2">
                <Link
                  href="/login"
                  className="w-full px-4 py-2 text-center text-[#2EA043] font-medium hover:text-green-700 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="w-full px-4 py-2 text-center rounded-full bg-[#2EA043] text-white font-medium hover:bg-green-700 transition-colors duration-200"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
