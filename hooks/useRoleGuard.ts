import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import type { AuthUser, UserRole } from "../types/entities/account.types";

interface UseRoleGuardOptions {
  allowedRoles: UserRole[];
  redirectTo?: string;
  fallbackRoute?: string;
}

interface UseRoleGuardReturn {
  isAuthorized: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  userType: UserRole | null;
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
    const hasPermission = allowedRoles.includes(user.type as UserRole);

    if (!hasPermission) {
      // Usuario no autorizado
      if (fallbackRoute) {
        router.push(fallbackRoute);
      } else {
        // Redirigir al dashboard correcto según su rol
        switch (user.type) {
          case 'companyAdmin':
            router.push('/admin_dashboard');
            break;
          case 'lender':
            router.push('/lender');
            break;
          case 'borrower':
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
    userType: user?.type as UserRole || null,
  };
};

// Hook específico para diferentes tipos de dashboards
export const useAdminGuard = () => {
  return useRoleGuard({
    allowedRoles: ['companyAdmin'],
    fallbackRoute: '/unauthorized'
  });
};

export const useLenderGuard = () => {
  return useRoleGuard({
    allowedRoles: ['lender'],
    fallbackRoute: '/unauthorized'
  });
};

export const useUserGuard = () => {
  return useRoleGuard({
    allowedRoles: ['borrower'],
    fallbackRoute: '/unauthorized'
  });
};

// Hook para verificar múltiples roles
export const useMultiRoleGuard = (roles: UserRole[]) => {
  return useRoleGuard({
    allowedRoles: roles,
    fallbackRoute: '/unauthorized'
  });
};
