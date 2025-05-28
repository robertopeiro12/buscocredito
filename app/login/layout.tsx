"use client";
import NavBar from "@/components/common/layout/navbar";
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
    <section className="relative min-h-screen bg-white">
      {/* Elementos decorativos mejorados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-[#55A555] rounded-full mix-blend-multiply blur-3xl opacity-10" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-[#55A555] rounded-full mix-blend-multiply blur-3xl opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#55A555] rounded-full mix-blend-multiply blur-3xl opacity-5" />
      </div>

      <NavBar />

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
