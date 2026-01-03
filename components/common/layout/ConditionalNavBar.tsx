"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/common/layout/navbar";

export function ConditionalNavBar() {
  const pathname = usePathname();
  
  // No mostrar navbar en dashboards
  const hiddenRoutes = ['/user_dashboard', '/admin_dashboard', '/lender', '/super_admin_dashboard'];
  const shouldHideNavBar = hiddenRoutes.some(route => pathname.startsWith(route));
  
  if (shouldHideNavBar) {
    return null;
  }
  
  return (
    <>
      <NavBar />
      <div className="h-16" /> {/* Spacer para compensar navbar fixed */}
    </>
  );
}
