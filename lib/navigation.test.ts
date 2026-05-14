import { describe, it, expect } from 'vitest';
import { getRedirectPath } from './navigation';

describe('getRedirectPath', () => {
  it('redirige superAdmin a /super_admin_dashboard', () => {
    expect(getRedirectPath('superAdmin')).toBe('/super_admin_dashboard');
  });

  it('redirige companyAdmin a /admin_dashboard', () => {
    expect(getRedirectPath('companyAdmin')).toBe('/admin_dashboard');
  });

  it('redirige lender a /lender', () => {
    expect(getRedirectPath('lender')).toBe('/lender');
  });

  it('redirige borrower a /user_dashboard', () => {
    expect(getRedirectPath('borrower')).toBe('/user_dashboard');
  });

  it('redirige tipo desconocido a /user_dashboard', () => {
    expect(getRedirectPath('unknown' as any)).toBe('/user_dashboard');
  });
});
