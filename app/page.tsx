import HeroSection from "@/components/features/landing/HeroSection";
import CTABanner from "@/components/features/landing/CTABanner";
import ConfusionSection from "@/components/features/landing/ConfusionSection";
import WhatIsBuscoCredito from "@/components/features/landing/WhatIsBuscoCredito";
import HowItWorks from "@/components/features/landing/HowItWorks";
import WhyUseBuscoCredito from "@/components/features/landing/WhyUseBuscoCredito";
import StartEvaluatingCTA from "@/components/features/landing/StartEvaluatingCTA";
import CompareCreditsCTA from "@/components/features/landing/CompareCreditsCTA";
import LenderSection from "@/components/features/landing/LenderSection";
import ScrollProgressBar from "@/components/features/landing/ScrollProgressBar";
import Footer from "@/components/common/layout/Footer";

export default function Home() {
  return (
    <>
      <ScrollProgressBar />
      <HeroSection />
      <CTABanner />
      <ConfusionSection />
      <CompareCreditsCTA />
      <WhatIsBuscoCredito />
      <HowItWorks />
      <WhyUseBuscoCredito />
      <StartEvaluatingCTA />
      <LenderSection />
      <Footer />
    </>
  );
}
