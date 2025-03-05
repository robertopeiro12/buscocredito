import { Button } from "@nextui-org/react";
import { Users, Settings, HelpCircle, LogOut } from "lucide-react";

type AdminSidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleSignOut: () => void;
};

export function AdminSidebar({
  activeTab,
  setActiveTab,
  handleSignOut,
}: AdminSidebarProps) {
  const navItems = [
    {
      icon: Users,
      label: "Subcuentas",
      id: "subaccounts",
    },
    {
      icon: Settings,
      label: "Configuración",
      id: "settings",
    },
    {
      icon: HelpCircle,
      label: "Ayuda",
      id: "help",
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">
            Empresa Administrativa
          </h1>
        </div>
        <nav className="flex-1 px-3 py-4">
          {navItems.map((item) => (
            <Button
              key={item.id}
              startContent={<item.icon className="w-5 h-5" />}
              className={`w-full justify-start h-12 px-4 mb-2 transition-all duration-200 ease-in-out ${
                activeTab === item.id
                  ? "bg-green-50 text-green-700 hover:bg-green-100"
                  : "bg-transparent text-gray-600 hover:bg-gray-50"
              }`}
              onPress={() => setActiveTab(item.id)}
            >
              {item.label}
            </Button>
          ))}
          <Button
            startContent={<LogOut className="w-5 h-5" />}
            className="w-full justify-start h-12 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 ease-in-out mt-2"
            onPress={handleSignOut}
          >
            Cerrar Sesión
          </Button>
        </nav>
      </div>
    </div>
  );
}
