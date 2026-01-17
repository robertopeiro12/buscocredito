import { Button } from "@heroui/react";
import { LogOut, Users, BarChart, Settings, HelpCircle, Store } from "lucide-react";

interface AdminHeaderProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
  onSignOut?: () => void;
  companyName?: string;
}

export const AdminHeader = ({ 
  activeTab, 
  onTabChange, 
  onSignOut, 
  companyName 
}: AdminHeaderProps) => {
  const getTitle = () => {
    switch (activeTab) {
      case "subaccounts":
        return "Gestionar Subcuentas";
      case "metrics":
        return "Dashboard de Métricas";
      case "marketplace":
        return "Mercado de Préstamos";
      case "settings":
        return "Configuración de Administrador";
      case "help":
        return "Centro de Ayuda";
      default:
        return "Dashboard Administrativo";
    }
  };

  const getDescription = () => {
    switch (activeTab) {
      case "subaccounts":
        return "Administra las cuentas de vendedores y su acceso al sistema";
      case "metrics":
        return "Analiza el rendimiento y estadísticas de la plataforma";
      case "marketplace":
        return "Monitorea las solicitudes de préstamos y actividad del mercado";
      case "settings":
        return "Configura tu perfil y preferencias de administrador";
      case "help":
        return "Encuentra ayuda y soporte técnico";
      default:
        return "Panel de control administrativo";
    }
  };

  const menuItems = [
    {
      tab: "subaccounts",
      icon: Users,
      label: "Subcuentas"
    },
    {
      tab: "metrics",
      icon: BarChart,
      label: "Métricas"
    },
    {
      tab: "marketplace",
      icon: Store,
      label: "Mercado"
    },
    {
      tab: "settings",
      icon: Settings,
      label: "Configuración"
    },
    {
      tab: "help",
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">BuscoCredito Admin</h1>
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
                color={activeTab === item.tab ? "primary" : "default"}
                startContent={<item.icon className="w-4 h-4" />}
                onPress={() => onTabChange(item.tab)}
                className={`flex-1 ${
                  activeTab === item.tab 
                    ? "bg-blue-600 text-white" 
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
            <p className="text-gray-600">
              {getDescription()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
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
