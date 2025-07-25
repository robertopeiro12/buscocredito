import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import type { User } from "../types/auth";

type UserType = 'b_admin' | 'b_sale' | 'user';

interface UseRoleGuardOptions {
  allowedRoles: UserType[];
  redirectTo?: string;
  fallbackRoute?: string;
}

interface UseRoleGuardReturn {
  isAuthorized: boolean;
  isLoading: boolean;
  user: User | null;
  userType: UserType | null;
}

export const useRoleGuard = (options: UseRoleGuardOptions): UseRoleGuardReturn => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const { allowedRoles, redirectTo, fallbackRoute } = options;

  useEffect(() => {
    if (loading) {
      return; // Aún cargando, no hacer nada
    }

    if (!user) {
      // Usuario no autenticado, redirigir a login
      const loginUrl = redirectTo || '/login';
      router.push(loginUrl);
      setIsAuthorized(false);
      setIsChecking(false);
      return;
    }

    if (!user.type) {
      // Usuario sin tipo definido, redirigir a login
      router.push('/login');
      setIsAuthorized(false);
      setIsChecking(false);
      return;
    }

    // Verificar si el usuario tiene el rol adecuado
    const hasPermission = allowedRoles.includes(user.type as UserType);
    
    if (!hasPermission) {
      // Usuario no autorizado
      if (fallbackRoute) {
        router.push(fallbackRoute);
      } else {
        // Redirigir al dashboard correcto según su rol
        switch (user.type) {
          case 'b_admin':
            router.push('/admin_dashboard');
            break;
          case 'b_sale':
            router.push('/lender');
            break;
          case 'user':
            router.push('/user_dashboard');
            break;
          default:
            router.push('/unauthorized');
        }
      }
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
    
    setIsChecking(false);
  }, [user, loading, allowedRoles, redirectTo, fallbackRoute, router]);

  return {
    isAuthorized,
    isLoading: loading || isChecking,
    user,
    userType: user?.type as UserType || null,
  };
};

// Hook específico para diferentes tipos de dashboards
export const useAdminGuard = () => {
  return useRoleGuard({
    allowedRoles: ['b_admin'],
    fallbackRoute: '/unauthorized'
  });
};

export const useLenderGuard = () => {
  return useRoleGuard({
    allowedRoles: ['b_sale'],
    fallbackRoute: '/unauthorized'
  });
};

export const useUserGuard = () => {
  return useRoleGuard({
    allowedRoles: ['user'],
    fallbackRoute: '/unauthorized'
  });
};

// Hook para verificar múltiples roles
export const useMultiRoleGuard = (roles: UserType[]) => {
  return useRoleGuard({
    allowedRoles: roles,
    fallbackRoute: '/unauthorized'
  });
};
