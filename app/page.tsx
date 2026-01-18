"use client";

import HeroSection from "@/components/features/landing/HeroSection";
import CTABanner from "@/components/features/landing/CTABanner";
import ConfusionSection from "@/components/features/landing/ConfusionSection";
import WhatIsBuscoCredito from "@/components/features/landing/WhatIsBuscoCredito";
import HowItWorks from "@/components/features/landing/HowItWorks";
import WhyUseBuscoCredito from "@/components/features/landing/WhyUseBuscoCredito";
import StartEvaluatingCTA from "@/components/features/landing/StartEvaluatingCTA";
import LenderSection from "@/components/features/landing/LenderSection";
import Footer from "@/components/common/layout/Footer";
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
      <HeroSection />

      {/* CTA Banner with Steps */}
      <CTABanner />

      {/* Confusion Section */}
      <ConfusionSection />

      {/* What is BuscoCredito */}
      <WhatIsBuscoCredito />

      {/* How It Works */}
      <HowItWorks />

      {/* Why Use BuscoCredito */}
      <WhyUseBuscoCredito />

      {/* Start Evaluating CTA */}
      <StartEvaluatingCTA />

      {/* Lender Section */}
      <LenderSection />

      {/* Footer */}
      <Footer />
    </>
  );
}
