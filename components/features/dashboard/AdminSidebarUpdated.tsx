import { Button } from "@heroui/react";
import { Users, Settings, HelpCircle, BarChart, Store } from "lucide-react";
import Image from "next/image";

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
        ? "bg-[#0e3a45]/[0.08] text-[#0e3a45] border-r-[3px] border-[#0e3a45] font-semibold"
        : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
    }`;

  const navItems = [
    { icon: Users,      label: "Subcuentas",    id: "subaccounts", description: "Gestiona vendedores" },
    { icon: BarChart,   label: "Métricas",      id: "metrics",     description: "Análisis y estadísticas" },
    { icon: Store,      label: "Mercado",        id: "marketplace", description: "Monitorea solicitudes" },
    { icon: Settings,   label: "Configuración", id: "settings",    description: "Perfil y preferencias" },
    { icon: HelpCircle, label: "Ayuda",          id: "help",        description: "Soporte y FAQ" },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm h-screen fixed left-0 top-0 z-10 hidden md:block">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-5 py-5 border-b border-gray-100">
          <Image
            src="/img/logo-buscocredito.png"
            alt="BuscoCrédito"
            width={160}
            height={68}
            className="h-11 w-auto"
            priority
          />
          {companyName && (
            <p className="text-sm font-semibold text-gray-800 truncate mt-2">{companyName}</p>
          )}
          <p className="text-[11px] uppercase tracking-wide text-gray-400 mt-0.5 font-medium">
            Panel Administrativo
          </p>
        </div>

        {/* Navigation */}
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

      </div>
    </div>
  );
}
