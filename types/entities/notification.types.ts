// Tipos centralizados para notificaciones (colección: notifications)

export type NotificationType = 'nueva_propuesta' | 'loan_accepted' | 'loan_assigned_other';

export interface AppNotification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  readAt: string | null; // ISO 8601
  emailSent: boolean;
  emailId: string | null;
  createdAt: string; // ISO 8601
}
