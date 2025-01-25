"use client";

import Introduction from "@/components/Introduction";
import Acerca from "@/components/Acerca";
import Footer from "@/components/Footer";
import React, { useState, useEffect } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);

    const handleScroll = () => {
      const totalScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.scrollY / totalScroll) * 100;
      setScrollProgress(currentProgress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {/* Progress bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-green-600 transition-all duration-300 z-[60]"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Hero Section */}
      <section
        className="relative bg-gradient-to-b from-white via-white to-gray-50"
        id="inicio"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:24px_24px] opacity-25" />
        <Introduction />
      </section>

      {/* About Section */}
      <section className="relative bg-white" id="acerca">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-gray-50 to-transparent" />
        <Acerca />
      </section>

      {/* Footer */}
      <Footer />
    </>
  );
}
