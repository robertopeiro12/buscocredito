"use client";

// components/LenderSidebar.tsx
import { Button } from "@heroui/react";
import { Store, FileText, Settings, HelpCircle, BarChart3, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";

type LenderSidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  companyName: string;
  userId: string;
};

export function LenderSidebar({
  activeTab,
  setActiveTab,
  companyName,
  userId,
}: LenderSidebarProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  // Real-time listener for unread notifications
  useEffect(() => {
    if (!userId) return;

    const db = getFirestore();
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("recipientId", "==", userId),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      setUnreadCount(snapshot.docs.length);
    });

    return () => unsubscribe();
  }, [userId]);

  const getButtonClass = (tab: string) => 
    `w-full justify-start h-14 px-4 mb-3 transition-all duration-200 ease-in-out ${
      activeTab === tab
        ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-r-3 border-green-500 shadow-sm"
        : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;

  const navItems = [
    {
      icon: Store,
      label: "Mercado",
      id: "marketplace",
      description: "Solicitudes disponibles"
    },
    {
      icon: FileText,
      label: "Mis Ofertas",
      id: "myoffers",
      description: "Propuestas enviadas"
    },
    {
      icon: BarChart3,
      label: "Métricas",
      id: "metrics",
      description: "Estadísticas y análisis"
    },
    {
      icon: Bell,
      label: "Notificaciones",
      id: "notifications",
      description: "Alertas y actualizaciones",
      badge: unreadCount
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
    <div className="w-72 bg-white border-r border-gray-200 shadow-sm h-screen fixed left-0 top-0 z-10 hidden md:block">
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                {companyName}
              </h1>
              <p className="text-sm text-gray-500">Panel de Prestamista</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 px-6 py-6">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                startContent={
                  <div className="relative">
                    <item.icon className="w-5 h-5" />
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>
                }
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
        <div className="p-6 border-t border-gray-100">
          <div className="px-4 py-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              BuscoCredito Lender v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
