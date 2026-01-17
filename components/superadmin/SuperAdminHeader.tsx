"use client";

import { Button, Spinner } from "@heroui/react";
import { Menu, Bell, LogOut, User } from "lucide-react";

interface SuperAdminHeaderProps {
  userEmail?: string | null;
  onSignOut: () => void;
  onMenuToggle?: () => void;
}

export function SuperAdminHeader({
  userEmail,
  onSignOut,
  onMenuToggle,
}: SuperAdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        {/* Left side - Menu toggle for mobile */}
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="light"
            className="md:hidden"
            onPress={onMenuToggle}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-gray-800">
              Panel de Super Administrador
            </h1>
            <p className="text-xs text-gray-500">
              Gestión completa del sistema
            </p>
          </div>
        </div>

        {/* Right side - User info and actions */}
        <div className="flex items-center gap-4">
          {/* Notifications placeholder */}
          <Button isIconOnly variant="light" className="relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-[10px] text-white flex items-center justify-center">
              0
            </span>
          </Button>

          {/* User info */}
          <div className="hidden md:flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">Super Admin</p>
              <p className="text-xs text-gray-500">{userEmail || "..."}</p>
            </div>
          </div>

          {/* Sign out button */}
          <Button
            size="sm"
            variant="flat"
            color="danger"
            startContent={<LogOut className="w-4 h-4" />}
            onPress={onSignOut}
            className="hidden md:flex"
          >
            Salir
          </Button>
        </div>
      </div>
    </header>
  );
}

export function SuperAdminLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spinner size="lg" color="secondary" />
        <p className="mt-4 text-gray-600">Verificando acceso...</p>
      </div>
    </div>
  );
}
