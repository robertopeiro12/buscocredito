export interface User {
  uid: string;
  email: string | null;
  type?: 'b_admin' | 'b_sale' | 'user';
  Empresa?: string;
  Empresa_id?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
