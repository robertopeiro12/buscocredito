// Tipos para el panel de administración de empresa

export interface AdminAccount {
  companyName: string;
  adminId: string;
  name: string;
  email: string;
  type: 'lender' | 'companyAdmin';
  id: string | null;
}

// Toast de UI (no confundir con AppNotification de DB)
export interface ToastNotification {
  type: 'success' | 'error';
  message: string;
  show: boolean;
}
