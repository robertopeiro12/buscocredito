import { DashboardTab } from "@/types/dashboard";

interface DashboardHeaderProps {
  activeTab: DashboardTab;
}

export const DashboardHeader = ({ activeTab }: DashboardHeaderProps) => {
  const getTitle = () => {
    switch (activeTab) {
      case "loans":
        return "Préstamos";
      case "settings":
        return "Configuración";
      case "help":
        return "Centro de Ayuda";
      default:
        return "Dashboard";
    }
  };

  return (
    <header className="py-8 mb-4 flex justify-center">
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-green-50 rounded-lg shadow-md transform rotate-1"></div>
        <div className="absolute inset-0 bg-white rounded-lg shadow-sm"></div>
        <h1 className="relative px-8 py-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">
          {getTitle()}
        </h1>
      </div>
    </header>
  );
};
