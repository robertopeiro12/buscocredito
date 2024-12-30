"use client";
import Image from "next/image";
import "animate.css";
import Link from "next/link";
import React, { useState } from "react";

const NavBar = () => {
  const [sidebar, setSidebar] = useState(false);
  const [active_show_sidebar, setIsActive] = useState(false);
  const change_sidebar_state = () => {
    setIsActive(true);
    setSidebar(!sidebar);
  };

  return (
    <header className="bg-white sticky top-0 z-10 shadow-md">
      <section className="flex justify-between items-center mx-auto max-w-7xl px-4 py-2">
        <Link href="/" className="flex items-center">
          <Image
            width={842}
            height={485}
            src={"/img/logo.png"}
            alt="Logo"
            className="w-24"
          />
          <h1 className="mx-auto px-2 text-2xl font-semibold text-green-600">
            {" "}
            BuscoCredito
          </h1>
        </Link>
        <button
          onClick={change_sidebar_state}
          id="hamburger-button"
          className="text-4xl lg:hidden focus:outline-none cursor-pointer px-4 text-green-600"
        >
          &#9776;
        </button>
        <nav className="hidden lg:block space-x-8 text-lg" aria-label="main">
          <a
            href="#acerca"
            className="hover:text-green-600 transition-colors duration-300"
          >
            Acerca de
          </a>
          <a
            href="#prestamo"
            className="hover:text-green-600 transition-colors duration-300"
          >
            ¿Necesitas un préstamo?
          </a>
          <a
            href="#prestamista"
            className="hover:text-green-600 transition-colors duration-300"
          >
            ¿Eres prestamista?
          </a>
          <a
            href="#funcionalidad"
            className="hover:text-green-600 transition-colors duration-300"
          >
            ¿Cómo funciona?
          </a>
        </nav>
        <Link href="/sign-up">
          <button className="hover:bg-gradient-to-r hover:from-green-600 hover:to-blue-600 hover:text-white transition ease-out duration-300 active:bg-slate-500 hidden lg:block border-2 border-green-500 rounded-full py-2 px-6 text-green-600">
            Cuenta
          </button>
        </Link>
      </section>
      <section>
        <div
          className={`fixed w-full h-full bg-black opacity-45 z-10 ${
            sidebar ? "block" : "hidden"
          }`}
          onClick={change_sidebar_state}
        ></div>
        <section
          id="sidebar-check"
          className={`fixed right-0 top-[79.3px] bottom-0 text-black bg-white z-50 text-3xl animate__animated ${
            sidebar ? "animate__fadeInRight" : "animate__fadeOutRight"
          } ${active_show_sidebar ? "block" : "hidden"} animate__faster`}
        >
          <nav className="flex flex-col justify-center items-center mt-6 px-2">
            <a
              href="#acerca"
              onClick={change_sidebar_state}
              className="px-3 py-6 hover:text-green-600 transition-colors duration-300"
            >
              Acerca de
            </a>
            <hr className="bg-gradient-to-l from-slate-200 w-full h-0.5" />
            <a
              href="#prestamo"
              onClick={change_sidebar_state}
              className="px-3 py-6 hover:text-green-600 transition-colors duration-300"
            >
              ¿Necesitas un préstamo?
            </a>
            <hr className="bg-gradient-to-l from-slate-200 w-full h-0.5" />
            <a
              href="#prestamista"
              onClick={change_sidebar_state}
              className="px-3 py-6 hover:text-green-600 transition-colors duration-300"
            >
              ¿Eres prestamista?
            </a>
            <hr className="bg-gradient-to-l from-slate-200 w-full h-0.5" />
            <a
              href="#funcionalidad"
              onClick={change_sidebar_state}
              className="px-3 py-6 hover:text-green-600 transition-colors duration-300"
            >
              ¿Cómo funciona?
            </a>
            <hr className="bg-gradient-to-l from-slate-200 w-full h-0.5" />
          </nav>
          <div className="flex justify-center items-center w-full mt-10">
            <button
              onClick={change_sidebar_state}
              className="active:bg-slate-500 transition ease-out duration-150 border-2 border-green-500 rounded-full py-2 px-5 text-2xl text-green-600 hover:bg-gradient-to-r hover:from-green-600 hover:to-blue-600 hover:text-white"
            >
              CUENTA
            </button>
          </div>
        </section>
      </section>
    </header>
  );
};

export default NavBar;
