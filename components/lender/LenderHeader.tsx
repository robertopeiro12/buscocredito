import React from 'react';
import { Button } from "@heroui/react";
import { LogOut, Store, FileText, Settings, HelpCircle, BarChart3 } from "lucide-react";
import NotificationCenter from "@/components/features/dashboard/NotificationCenter";

type LenderTab = "marketplace" | "myoffers" | "metrics" | "notifications" | "settings" | "help";

interface LenderHeaderProps {
  activeTab: LenderTab;
  companyName: string;
  onTabChange?: (tab: LenderTab) => void;
  onSignOut?: () => void;
  userId?: string;
}

const LenderHeader = ({ 
  activeTab, 
  companyName, 
  onTabChange, 
  onSignOut,
  userId 
}: LenderHeaderProps) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'marketplace':
        return 'Mercado de Préstamos';
      case 'myoffers':
        return 'Mis Propuestas';
      case 'metrics':
        return 'Métricas y Análisis';
      case 'settings':
        return 'Configuración';
      case 'help':
        return 'Centro de Ayuda';
      default:
        return 'Dashboard Prestamista';
    }
  };

  const getDescription = () => {
    switch (activeTab) {
      case 'marketplace':
        return 'Encuentra y evalúa solicitudes de préstamos disponibles';
      case 'myoffers':
        return 'Gestiona y monitorea tus propuestas enviadas';
      case 'metrics':
        return 'Analiza tu rendimiento como prestamista y encuentra oportunidades de mejora';
      case 'settings':
        return 'Administra tu perfil y configuración de cuenta';
      case 'help':
        return 'Encuentra respuestas y soporte técnico';
      default:
        return 'Panel de control principal';
    }
  };

  const menuItems = [
    {
      tab: "marketplace" as LenderTab,
      icon: Store,
      label: "Mercado"
    },
    {
      tab: "myoffers" as LenderTab,
      icon: FileText,
      label: "Mis Propuestas"
    },
    {
      tab: "metrics" as LenderTab,
      icon: BarChart3,
      label: "Métricas"
    },
    {
      tab: "settings" as LenderTab,
      icon: Settings,
      label: "Configuración"
    },
    {
      tab: "help" as LenderTab,
      icon: HelpCircle,
      label: "Ayuda"
    }
  ];

  return (
    <>
      {/* Mobile Navigation - Only visible on mobile */}
      {onTabChange && (
        <div className="md:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Store className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{companyName}</h1>
                <p className="text-xs text-gray-500">Prestamista</p>
              </div>
            </div>
            {onSignOut && (
              <Button
                variant="light"
                size="sm"
                isIconOnly
                onPress={onSignOut}
                className="text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {menuItems.map((item) => (
              <Button
                key={item.tab}
                size="sm"
                variant={activeTab === item.tab ? "solid" : "light"}
                color={activeTab === item.tab ? "success" : "default"}
                startContent={<item.icon className="w-4 h-4" />}
                onPress={() => onTabChange(item.tab)}
                className={`flex-1 ${
                  activeTab === item.tab 
                    ? "bg-green-600 text-white" 
                    : "text-gray-600"
                }`}
              >
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Header */}
      <div className="mb-8 pb-6 border-b border-gray-200 hidden md:block">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getTitle()}
            </h1>
            <p className="text-gray-600 text-lg">
              {getDescription()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">En línea</span>
            </div>
            
            {/* Notificaciones */}
            {userId && (
              <NotificationCenter userId={userId} compact />
            )}
            
            {onSignOut && (
              <Button
                variant="light"
                size="sm"
                startContent={<LogOut className="w-4 h-4" />}
                onPress={onSignOut}
                className="text-gray-600 hover:text-red-600 hover:bg-red-50"
              >
                Salir
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LenderHeader;
