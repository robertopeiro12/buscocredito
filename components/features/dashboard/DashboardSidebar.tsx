import { Button } from "@heroui/react";
import { Bell, CreditCard, HelpCircle, Settings } from "lucide-react";
import Image from "next/image";
import { DashboardTab } from "@/types/dashboard";

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  unreadNotifications?: number;
}

export const DashboardSidebar = ({ 
  activeTab, 
  onTabChange,
  unreadNotifications = 0
}: DashboardSidebarProps) => {
  const getButtonClass = (tab: DashboardTab) => 
    `w-full justify-start h-12 px-4 mb-2 transition-all duration-200 ease-in-out ${
      activeTab === tab
        ? "bg-[#0e3a45]/8 text-[#0e3a45] border-r-[3px] border-[#0e3a45] font-semibold"
        : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
    }`;

  const menuItems = [
    {
      tab: "loans" as DashboardTab,
      icon: CreditCard,
      label: "Préstamos",
      description: "Gestiona tus solicitudes"
    },
    {
      tab: "notifications" as DashboardTab,
      icon: Bell,
      label: "Notificaciones",
      description: "Historial de alertas",
      badge: unreadNotifications > 0 ? unreadNotifications : undefined
    },
    {
      tab: "settings" as DashboardTab,
      icon: Settings,
      label: "Configuración",
      description: "Perfil y preferencias"
    },
    {
      tab: "help" as DashboardTab,
      icon: HelpCircle,
      label: "Ayuda",
      description: "Soporte y FAQ"
    }
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
          <p className="text-[11px] tracking-wide text-gray-400 mt-1.5 font-medium uppercase">Panel de Usuario</p>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.tab}
                startContent={
                  <div className="relative">
                    <item.icon className="w-5 h-5" />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>
                }
                className={getButtonClass(item.tab)}
                variant="light"
                onPress={() => onTabChange(item.tab)}
              >
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[10px] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs opacity-75 truncate w-full text-left">
                    {item.description}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </nav>
        
      </div>
    </div>
  );
};
