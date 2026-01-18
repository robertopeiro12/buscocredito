import { Button } from "@heroui/react";
import { LogOut, CreditCard, Settings, HelpCircle } from "lucide-react";
import { DashboardTab } from "@/types/dashboard";

interface DashboardHeaderProps {
  activeTab: DashboardTab;
  onTabChange?: (tab: DashboardTab) => void;
  onSignOut?: () => void;
}

export const DashboardHeader = ({
  activeTab,
  onTabChange,
  onSignOut,
}: DashboardHeaderProps) => {
  const getTitle = () => {
    switch (activeTab) {
      case "loans":
        return "Mis Préstamos";
      case "settings":
        return "Configuración";
      case "help":
        return "Ayuda";
      default:
        return "Dashboard";
    }
  };

  const getDescription = () => {
    switch (activeTab) {
      case "loans":
        return "Gestiona tus solicitudes y revisa las propuestas recibidas";
      case "settings":
        return "Administra tu perfil y preferencias de cuenta";
      case "help":
        return "Encuentra respuestas a tus preguntas frecuentes";
      default:
        return "Panel de control principal";
    }
  };

  const menuItems = [
    {
      tab: "loans" as DashboardTab,
      icon: CreditCard,
      label: "Préstamos",
    },
    {
      tab: "settings" as DashboardTab,
      icon: Settings,
      label: "Configuración",
    },
    {
      tab: "help" as DashboardTab,
      icon: HelpCircle,
      label: "Ayuda",
    },
  ];

  return (
    <>
      {/* Mobile Navigation - Only visible on mobile */}
      {onTabChange && (
        <div className="md:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">BuscoCredito</h1>
            </div>
            <div className="flex items-center gap-2">
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
            <p className="text-gray-600 text-lg">{getDescription()}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">En línea</span>
            </div>

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
