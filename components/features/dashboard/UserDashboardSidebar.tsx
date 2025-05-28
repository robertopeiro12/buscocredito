import { User } from "firebase/auth";
import { Button } from "@nextui-org/react";
import {
  Home,
  FileText,
  User as UserIcon,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

interface UserDashboardSidebarProps {
  user: User;
  onSignOut: () => Promise<void>;
}

export default function UserDashboardSidebar({
  user,
  onSignOut,
}: UserDashboardSidebarProps) {
  const navItems = [
    { icon: Home, label: "Inicio", href: "#" },
    { icon: FileText, label: "Solicitudes", href: "#" },
    { icon: UserIcon, label: "Perfil", href: "#" },
    { icon: Settings, label: "Ajustes", href: "#" },
    { icon: HelpCircle, label: "Ayuda", href: "#" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.email}
            </p>
            <p className="text-xs text-gray-500 truncate">Usuario</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
          <li>
            <Button
              color="danger"
              variant="light"
              startContent={<LogOut className="w-4 h-4" />}
              className="w-full justify-start mt-2"
              onPress={onSignOut}
            >
              Cerrar Sesión
            </Button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
