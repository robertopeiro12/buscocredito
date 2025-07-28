import { Button } from "@nextui-org/react";
import { CreditCard, HelpCircle, Settings, LogOut } from "lucide-react";
import { DashboardTab } from "@/types/dashboard";

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onSignOut: () => void;
}

export const DashboardSidebar = ({ 
  activeTab, 
  onTabChange, 
  onSignOut 
}: DashboardSidebarProps) => {
  const getButtonClass = (tab: DashboardTab) => 
    `w-full justify-start h-11 px-4 ${
      activeTab === tab
        ? "bg-green-50 text-green-700 hover:bg-green-100"
        : "bg-transparent text-gray-600 hover:bg-gray-50"
    }`;

  return (
    <div className="w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <h1 className="text-xl font-semibold text-gray-900">
            Panel de Usuario
          </h1>
        </div>
        
        <nav className="flex-1 px-3 space-y-1">
          <Button
            startContent={<CreditCard className="w-4 h-4" />}
            className={getButtonClass("loans")}
            variant="light"
            onPress={() => onTabChange("loans")}
          >
            <span className="font-medium">Préstamos</span>
          </Button>
          
          <Button
            startContent={<Settings className="w-4 h-4" />}
            className={getButtonClass("settings")}
            variant="light"
            onPress={() => onTabChange("settings")}
          >
            <span className="font-medium">Configuración</span>
          </Button>
          
          <Button
            startContent={<HelpCircle className="w-4 h-4" />}
            className={getButtonClass("help")}
            variant="light"
            onPress={() => onTabChange("help")}
          >
            <span className="font-medium">Ayuda</span>
          </Button>
          
          <Button
            startContent={<LogOut className="w-4 h-4" />}
            className="w-full justify-start h-11 px-4 text-gray-600 hover:text-red-600 hover:bg-red-50"
            variant="light"
            onPress={onSignOut}
          >
            <span className="font-medium">Cerrar sesión</span>
          </Button>
        </nav>
        
        <div className="flex-grow"></div>
      </div>
    </div>
  );
};
