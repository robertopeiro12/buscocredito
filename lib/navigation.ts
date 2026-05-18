import type { UserRole } from '@/types/entities/account.types';

export function getRedirectPath(userType: UserRole): string {
  switch (userType) {
    case 'superAdmin':
      return '/super_admin_dashboard';
    case 'companyAdmin':
      return '/admin_dashboard';
    case 'lender':
      return '/lender';
    case 'borrower':
    default:
      return '/user_dashboard';
  }
}
