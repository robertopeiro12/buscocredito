"use client";

import Image from "next/image";
import { Button } from "@heroui/react";
import {
  Users,
  Settings,
  Database,
  Activity,
  LogOut,
  Home,
  Key,
  Zap,
} from "lucide-react";

type SuperAdminSidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSignOut: () => void;
};

export function SuperAdminSidebar({
  activeTab,
  setActiveTab,
  onSignOut,
}: SuperAdminSidebarProps) {
  const getButtonClass = (tab: string) =>
    `w-full justify-start h-12 px-4 mb-2 transition-all duration-200 ease-in-out ${
      activeTab === tab
        ? "bg-[#0e3a45]/[0.08] text-[#0e3a45] border-r-[3px] border-[#0e3a45] font-semibold"
        : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
    }`;

  const navItems = [
    {
      icon: Home,
      label: "Resumen",
      id: "overview",
      description: "Vista general del sistema",
    },
    {
      icon: Users,
      label: "Cuentas",
      id: "accounts",
      description: "Gestionar usuarios",
    },
    {
      icon: Key,
      label: "Tokens Bancos",
      id: "tokens",
      description: "Tokens de registro",
    },
    {
      icon: Zap,
      label: "Accesos Beta",
      id: "beta",
      description: "Gestionar demo privada",
    },
    {
      icon: Database,
      label: "Base de Datos",
      id: "database",
      description: "Info de colecciones",
    },
    {
      icon: Activity,
      label: "Sistema",
      id: "system",
      description: "Estado del servidor",
    },
    {
      icon: Settings,
      label: "Configuración",
      id: "settings",
      description: "Ajustes avanzados",
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm h-screen fixed left-0 top-0 z-10 hidden md:block">
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="px-5 py-5 border-b border-gray-100">
          <Image
            src="/img/logo-buscocredito.png"
            alt="BuscoCrédito"
            width={160}
            height={68}
            className="h-11 w-auto"
            priority
          />
          <p className="text-[11px] uppercase tracking-wide text-gray-400 mt-0.5 font-medium">
            Panel Super Admin
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                startContent={<item.icon className="w-5 h-5" />}
                className={getButtonClass(item.id)}
                variant="light"
                onPress={() => setActiveTab(item.id)}
              >
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="font-semibold text-sm">{item.label}</span>
                  <span className="text-xs opacity-75 truncate w-full text-left">
                    {item.description}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-gray-100">
          <Button
            startContent={<LogOut className="w-4 h-4" />}
            className="w-full justify-start text-red-500 hover:bg-red-50"
            variant="light"
            onPress={onSignOut}
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
