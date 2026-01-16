"use client";

import { Button } from "@nextui-org/react";
import {
  Users,
  Settings,
  BarChart,
  Database,
  Shield,
  Activity,
  LogOut,
  Home,
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
        ? "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-r-3 border-purple-500 shadow-sm"
        : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
      icon: BarChart,
      label: "Estadísticas",
      id: "stats",
      description: "Métricas del sistema",
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
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Super Admin</h1>
              <p className="text-sm text-gray-500">Panel de Desarrollador</p>
            </div>
          </div>
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
          <div className="px-4 py-2 mt-2 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-600 text-center font-medium">
              🔒 Super Admin Access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
