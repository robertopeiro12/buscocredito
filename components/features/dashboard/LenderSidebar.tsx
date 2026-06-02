"use client";

import { Button } from "@heroui/react";
import Image from "next/image";
import { Store, FileText, Settings, HelpCircle, BarChart3, Bell, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";

type LenderSidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  companyName: string;
  userId: string;
  onSignOut?: () => void;
};

export function LenderSidebar({
  activeTab,
  setActiveTab,
  companyName,
  userId,
  onSignOut,
}: LenderSidebarProps) {
  const [unreadCount, setUnreadCount] = useState(0);

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
    `w-full justify-start h-12 px-4 mb-2 transition-all duration-200 ease-in-out ${
      activeTab === tab
        ? "bg-[#0e3a45]/[0.08] text-[#0e3a45] border-r-[3px] border-[#0e3a45] font-semibold"
        : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
    }`;

  const navItems = [
    { icon: Store, label: "Mercado", id: "marketplace", description: "Solicitudes disponibles" },
    { icon: FileText, label: "Mis Ofertas", id: "myoffers", description: "Propuestas enviadas" },
    { icon: BarChart3, label: "Métricas", id: "metrics", description: "Estadísticas y análisis" },
    { icon: Bell, label: "Notificaciones", id: "notifications", description: "Alertas y actualizaciones", badge: unreadCount },
    { icon: Settings, label: "Configuración", id: "settings", description: "Perfil y preferencias" },
    { icon: HelpCircle, label: "Ayuda", id: "help", description: "Soporte y FAQ" },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm h-screen fixed left-0 top-0 z-10 hidden md:block">
      <div className="flex flex-col h-full">
        <div className="px-5 py-5 border-b border-gray-100">
          <Image
            src="/img/logo-buscocredito.png"
            alt="BuscoCrédito"
            width={160}
            height={68}
            className="h-11 w-auto"
            priority
          />
          <p className="text-sm font-semibold text-gray-800 truncate mt-2">{companyName}</p>
          <p className="text-[11px] uppercase tracking-wide text-gray-400 mt-0.5 font-medium">
            Panel de Prestamista
          </p>
        </div>

        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                startContent={
                  <div className="relative">
                    <item.icon className="w-5 h-5" />
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                        {item.badge > 9 ? "9+" : item.badge}
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

        {onSignOut && (
          <div className="px-4 pb-5 border-t border-gray-100 pt-4">
            <Button
              startContent={<LogOut className="w-4 h-4" />}
              className="w-full justify-start text-red-500 hover:bg-red-50"
              variant="light"
              onPress={onSignOut}
            >
              Cerrar Sesión
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
