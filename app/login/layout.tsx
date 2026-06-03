"use client";
import { useEffect, useState } from "react";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen bg-gray-50">
      {/* Franja superior de acento */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#0e3a45]" />

      {/* Patrón geométrico sutil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute right-0 top-0 h-full opacity-[0.03]"
          viewBox="0 0 400 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="350" cy="150" r="200" stroke="#0e3a45" strokeWidth="60" />
          <circle cx="350" cy="500" r="140" stroke="#0e3a45" strokeWidth="40" />
          <circle cx="350" cy="750" r="80" stroke="#0e3a45" strokeWidth="30" />
        </svg>
        <svg
          className="absolute left-0 bottom-0 h-full opacity-[0.03]"
          viewBox="0 0 400 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="650" r="200" stroke="#0e3a45" strokeWidth="60" />
          <circle cx="50" cy="300" r="120" stroke="#0e3a45" strokeWidth="40" />
        </svg>
      </div>

      <div
        className={`
          flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4
          transition-all duration-700 ease-out relative z-10
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
      >
        <div className="w-full max-w-md relative">{children}</div>
      </div>
    </section>
  );
}
