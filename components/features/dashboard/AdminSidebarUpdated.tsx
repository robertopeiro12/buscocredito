import { Button } from "@heroui/react";
import { Users, Settings, HelpCircle, BarChart, CreditCard, Store } from "lucide-react";

type AdminSidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  companyName?: string;
};

export function AdminSidebarUpdated({
  activeTab,
  setActiveTab,
  companyName,
}: AdminSidebarProps) {
  const getButtonClass = (tab: string) => 
    `w-full justify-start h-12 px-4 mb-2 transition-all duration-200 ease-in-out ${
      activeTab === tab
        ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-r-3 border-blue-500 shadow-sm"
        : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;

  const navItems = [
    {
      icon: Users,
      label: "Subcuentas",
      id: "subaccounts",
      description: "Gestiona vendedores"
    },
    {
      icon: BarChart,
      label: "Métricas",
      id: "metrics",
      description: "Análisis y estadísticas"
    },
    {
      icon: Store,
      label: "Mercado",
      id: "marketplace",
      description: "Monitorea solicitudes"
    },
    {
      icon: Settings,
      label: "Configuración",
      id: "settings",
      description: "Perfil y preferencias"
    },
    {
      icon: HelpCircle,
      label: "Ayuda",
      id: "help",
      description: "Soporte y FAQ"
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm h-screen fixed left-0 top-0 z-10 hidden md:block">
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                BuscoCredito
              </h1>
              <p className="text-sm text-gray-500">Panel Administrativo</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6">
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
          <div className="px-4 py-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              BuscoCredito Admin v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
