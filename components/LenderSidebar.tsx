// components/LenderSidebar.tsx
import { Button } from "@nextui-org/react";
import { Store, FileText, Settings, HelpCircle, LogOut, CheckCircle } from "lucide-react";

type Tab = {
  id: string;
  label: string;
  icon: string;
}

type LenderSidebarProps = {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onSignOut: () => void;
  tabs?: Tab[];
  companyName?: string;
};

export function LenderSidebar({
  activeTab,
  onChangeTab,
  onSignOut,
  tabs,
  companyName = "BuscoCredito"
}: LenderSidebarProps) {
  // Map icons to their components
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'market':
        return <Store className="w-5 h-5" />;
      case 'offers':
        return <FileText className="w-5 h-5" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'settings':
        return <Settings className="w-5 h-5" />;
      case 'help':
        return <HelpCircle className="w-5 h-5" />;
      default:
        return <Store className="w-5 h-5" />;
    }
  };

  // Default tabs if none provided
  const defaultTabs = [
    { id: "marketplace", label: "Mercado", icon: "market" },
    { id: "myoffers", label: "Mis Ofertas", icon: "offers" },
    { id: "settings", label: "Configuración", icon: "settings" },
    { id: "help", label: "Ayuda", icon: "help" }
  ];

  const navTabs = tabs || defaultTabs;

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">{companyName}</h1>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navTabs.map((tab) => (
            <Button
              key={tab.id}
              startContent={getIcon(tab.icon)}
              className={`w-full justify-start h-12 px-4 mb-2 transition-all duration-200 ease-in-out ${
                activeTab === tab.id
                  ? "bg-green-50 text-green-700 hover:bg-green-100"
                  : "bg-transparent text-gray-600 hover:bg-gray-50"
              }`}
              onPress={() => onChangeTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Button
            startContent={<LogOut className="w-5 h-5" />}
            className="w-full justify-start h-12 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 ease-in-out"
            onPress={onSignOut}

          >
            Cerrar Sesión
          </Button>
        </nav>
      </div>
    </div>
  );
}
