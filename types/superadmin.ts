// Super Admin Dashboard Types

export interface AccountInfo {
  uid: string;
  email: string | null;
  name: string | null;
  type: 'super_admin' | 'b_admin' | 'b_sale' | 'user';
  Empresa: string | null;
  Empresa_id: string | null;
  createdAt: string | null;
  lastLoginAt: string | null;
  isActive: boolean;
  disabled: boolean;
  phone: string | null;
  address: {
    country: string | null;
    state: string | null;
    city: string | null;
  } | null;
}

export interface SystemStats {
  totalAccounts: number;
  activeAccounts: number;
  disabledAccounts: number;
  accountsByType: {
    super_admin: number;
    b_admin: number;
    b_sale: number;
    user: number;
  };
  totalSolicitudes: number;
  totalPropuestas: number;
  pendingSolicitudes: number;
  approvedSolicitudes: number;
  rejectedSolicitudes: number;
  recentSignups: number;
  recentLogins: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  action: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'signup';
  resource: string | null;
  details: string | null;
  timestamp: string;
  ipAddress: string | null;
}

export interface SuperAdminDashboardState {
  accounts: AccountInfo[];
  stats: SystemStats;
  activityLogs: ActivityLog[];
  isLoading: boolean;
  error: string | null;
  selectedAccount: AccountInfo | null;
  searchTerm: string;
  filterType: 'all' | 'super_admin' | 'b_admin' | 'b_sale' | 'user';
  filterStatus: 'all' | 'active' | 'disabled';
}

export interface AccountActionResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface DatabaseInfo {
  collections: {
    name: string;
    documentCount: number;
  }[];
  totalDocuments: number;
  lastBackup: string | null;
}

export interface ServerHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  memoryUsage: number | null;
  cpuUsage: number | null;
  lastChecked: string;
}

export interface SuperAdminContextType {
  state: SuperAdminDashboardState;
  fetchAccounts: () => Promise<void>;
  fetchStats: () => Promise<void>;
  deactivateAccount: (uid: string) => Promise<AccountActionResult>;
  activateAccount: (uid: string) => Promise<AccountActionResult>;
  deleteAccount: (uid: string) => Promise<AccountActionResult>;
  setSearchTerm: (term: string) => void;
  setFilterType: (type: SuperAdminDashboardState['filterType']) => void;
  setFilterStatus: (status: SuperAdminDashboardState['filterStatus']) => void;
  selectAccount: (account: AccountInfo | null) => void;
}
