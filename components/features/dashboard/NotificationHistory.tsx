"use client";

import { useState, useEffect } from "react";
import { getFirestore, collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { auth } from "@/app/firebase";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from "@heroui/react";
import {
  Bell,
  BellOff,
  Check,
  CheckCircle2,
  CheckCheck,
  Clock,
  Info,
  Mail,
  MailOpen,
  TrendingDown,
  Banknote,
  Trash2,
  X,
} from "lucide-react";

interface NotificationData {
  id: string;
  recipientId: string;
  type: "loan_accepted" | "loan_assigned_other" | "nueva_propuesta" | string;
  title: string;
  message: string;
  data?: {
    loanId?: string;
    proposalId?: string;
    amount?: number;
    interestRate?: number;
    amortizationFrequency?: string;
    amortization?: number;
    term?: number;
    comision?: number;
    medicalBalance?: number;
    lenderName?: string;
    purpose?: string;
    loanType?: string;
    winningOffer?: {
      amount?: number;
      interestRate?: number;
      amortizationFrequency?: string;
      amortization?: number;
      term?: number;
      comision?: number;
      medicalBalance?: number;
    };
  };
  read: boolean;
  emailSent?: boolean;
  createdAt: any;
}

interface NotificationHistoryProps {
  userId: string;
  isLender?: boolean;
}

type FilterType = "all" | "unread" | "read";

export default function NotificationHistory({ userId, isLender = false }: NotificationHistoryProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearingType, setClearingType] = useState<"all" | "read">("read");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationData | null>(null);

  // Real-time listener for notifications
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    const db = getFirestore();
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("recipientId", "==", userId),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const notificationsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as NotificationData[];

        // Sort by createdAt (newest first)
        notificationsList.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

        setNotifications(notificationsList);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading notifications:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch("/api/markNotificationRead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    setActionLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const unreadNotifications = notifications.filter((n) => !n.read);
      await Promise.all(
        unreadNotifications.map((n) =>
          fetch("/api/markNotificationRead", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: "include",
            body: JSON.stringify({ notificationId: n.id }),
          })
        )
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Clear read notifications
  const clearReadNotifications = async () => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/notifications/clear-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        setNotifications((prev) => prev.filter((n) => !n.read));
        setShowClearModal(false);
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/notifications/clear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
        credentials: "include",
      });

      if (response.ok) {
        setNotifications([]);
        setShowClearModal(false);
      }
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  // Stats
  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;

  // Format date
  const formatDate = (createdAt: any) => {
    if (!createdAt) return "";

    let date: Date;
    if (createdAt.toDate) {
      date = createdAt.toDate();
    } else if (createdAt.seconds) {
      date = new Date(createdAt.seconds * 1000);
    } else {
      date = new Date(createdAt);
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: diffDays > 365 ? "numeric" : undefined,
    });
  };

  // Get notification style config
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "loan_accepted":
        return {
          Icon: CheckCircle2,
          accentColor: "border-[#0e3a45]",
          iconBg: "bg-[#0e3a45]/8",
          iconColor: "text-[#0e3a45]",
          dotColor: "bg-[#0e3a45]",
          label: "Propuesta aceptada",
        };
      case "loan_assigned_other":
        return {
          Icon: TrendingDown,
          accentColor: "border-slate-400",
          iconBg: "bg-slate-100",
          iconColor: "text-slate-500",
          dotColor: "bg-slate-400",
          label: "Otra propuesta elegida",
        };
      case "nueva_propuesta":
        return {
          Icon: Banknote,
          accentColor: "border-amber-500",
          iconBg: "bg-amber-50",
          iconColor: "text-amber-600",
          dotColor: "bg-amber-500",
          label: "Nueva propuesta",
        };
      default:
        return {
          Icon: Bell,
          accentColor: "border-gray-300",
          iconBg: "bg-gray-100",
          iconColor: "text-gray-400",
          dotColor: "bg-gray-400",
          label: "Notificación",
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {!isLender && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Centro de Notificaciones
              </h1>
              <p className="text-gray-600">
                Historial de todas tus notificaciones y alertas
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3">
            <Chip
              startContent={<Bell className="w-3 h-3" />}
              color={unreadCount > 0 ? "warning" : "default"}
              variant="flat"
              size="sm"
            >
              {unreadCount} sin leer
            </Chip>
            <Chip
              startContent={<CheckCheck className="w-3 h-3" />}
              color="success"
              variant="flat"
              size="sm"
            >
              {readCount} leídas
            </Chip>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <Card className="mb-4">
        <CardBody className="p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={filter === "all" ? "solid" : "flat"}
                color={filter === "all" ? "success" : "default"}
                onPress={() => setFilter("all")}
                className={filter === "all" ? "bg-green-600" : ""}
              >
                Todas ({notifications.length})
              </Button>
              <Button
                size="sm"
                variant={filter === "unread" ? "solid" : "flat"}
                color={filter === "unread" ? "warning" : "default"}
                onPress={() => setFilter("unread")}
                startContent={<Bell className="w-3 h-3" />}
              >
                Sin leer ({unreadCount})
              </Button>
              <Button
                size="sm"
                variant={filter === "read" ? "solid" : "flat"}
                color={filter === "read" ? "success" : "default"}
                onPress={() => setFilter("read")}
                startContent={<MailOpen className="w-3 h-3" />}
              >
                Leídas ({readCount})
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="flat"
                  color="success"
                  onPress={markAllAsRead}
                  isLoading={actionLoading}
                  startContent={<CheckCheck className="w-4 h-4" />}
                  className="text-green-700 hover:bg-green-100"
                >
                  Marcar todas como leídas
                </Button>
              )}

              <Dropdown>
                <DropdownTrigger>
                  <Button size="sm" variant="flat" startContent={<Trash2 className="w-4 h-4" />}>
                    Limpiar
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Clear options">
                  <DropdownItem
                    key="clear-read"
                    description="Eliminar notificaciones ya leídas"
                    startContent={<MailOpen className="w-4 h-4 text-gray-500" />}
                    onPress={() => {
                      setClearingType("read");
                      setShowClearModal(true);
                    }}
                    isDisabled={readCount === 0}
                  >
                    Limpiar leídas ({readCount})
                  </DropdownItem>
                  <DropdownItem
                    key="clear-all"
                    description="Eliminar todas las notificaciones"
                    startContent={<Trash2 className="w-4 h-4 text-danger" />}
                    className="text-danger"
                    color="danger"
                    onPress={() => {
                      setClearingType("all");
                      setShowClearModal(true);
                    }}
                    isDisabled={notifications.length === 0}
                  >
                    Limpiar todas ({notifications.length})
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Notifications List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size="lg" color="success" className="text-green-600" />
          <p className="text-gray-500 mt-4">Cargando notificaciones...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <BellOff className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {filter === "all"
                ? "No tienes notificaciones"
                : filter === "unread"
                ? "No hay notificaciones sin leer"
                : "No hay notificaciones leídas"}
            </h3>
            <p className="text-gray-500 text-sm">
              {filter === "all"
                ? "Las notificaciones aparecerán aquí cuando recibas nuevas propuestas o actualizaciones."
                : "Cambia el filtro para ver otras notificaciones."}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const style = getNotificationStyle(notification.type);

            const { Icon, accentColor, iconBg, iconColor, dotColor, label } = style;
            const isUnread = !notification.read;

            return (
              <button
                key={notification.id}
                onClick={() => {
                  if (isUnread) markAsRead(notification.id);
                  setSelectedNotification(notification);
                }}
                className={`w-full text-left group rounded-xl border transition-all ${
                  isUnread
                    ? `border-l-[3px] ${accentColor} border-t-gray-200 border-r-gray-200 border-b-gray-200 bg-white shadow-sm hover:shadow-md`
                    : "border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3 px-4 py-3.5">
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    <Icon className={`w-4.5 h-4.5 ${iconColor}`} strokeWidth={1.75} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className={`text-xs font-semibold uppercase tracking-wide ${isUnread ? iconColor : "text-gray-500"}`}>
                        {label}
                      </span>
                    </div>
                    <p className={`text-sm leading-snug line-clamp-1 ${isUnread ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                      {notification.message}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-xs text-gray-500 tabular-nums">{formatDate(notification.createdAt)}</span>
                    {isUnread && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Clear Confirmation Modal */}
      <Modal isOpen={showClearModal} onClose={() => setShowClearModal(false)}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-danger" />
              {clearingType === "read" ? "Limpiar notificaciones leídas" : "Limpiar todas las notificaciones"}
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-600">
              {clearingType === "read"
                ? `¿Estás seguro de que deseas eliminar las ${readCount} notificaciones leídas? Esta acción no se puede deshacer.`
                : `¿Estás seguro de que deseas eliminar las ${notifications.length} notificaciones? Esta acción no se puede deshacer.`}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowClearModal(false)}>
              Cancelar
            </Button>
            <Button
              color="danger"
              onPress={clearingType === "read" ? clearReadNotifications : clearAllNotifications}
              isLoading={actionLoading}
            >
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Notification Detail Modal */}
      <Modal
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        size="md"
        hideCloseButton
        classNames={{ base: "overflow-hidden" }}
      >
        <ModalContent>
          {selectedNotification && (() => {
            const type = selectedNotification.type;
            const d = selectedNotification.data;
            const proposalData = type === "loan_assigned_other" ? d?.winningOffer : d;

            const isAccepted = type === "loan_accepted";
            const isLost = type === "loan_assigned_other";

            const headerBg = isAccepted ? "bg-[#0e3a45]" : isLost ? "bg-slate-700" : "bg-amber-600";
            const HeaderIcon = isAccepted ? CheckCircle2 : isLost ? TrendingDown : Banknote;

            const rows: { label: string; value: string }[] = [];
            if (proposalData?.interestRate !== undefined)
              rows.push({ label: "Tasa de interés", value: `${proposalData.interestRate}% anual` });
            if (proposalData?.term !== undefined)
              rows.push({ label: "Plazo", value: `${proposalData.term} meses` });
            if (proposalData?.amortizationFrequency)
              rows.push({ label: "Frecuencia de pago", value: proposalData.amortizationFrequency });
            if (proposalData?.comision !== undefined)
              rows.push({ label: "Comisión apertura", value: `$${proposalData.comision?.toLocaleString("es-MX")}` });
            if (proposalData?.medicalBalance !== undefined && proposalData.medicalBalance > 0)
              rows.push({ label: "Seguro de vida", value: `$${proposalData.medicalBalance?.toLocaleString("es-MX")}` });
            if (isLender && proposalData?.amortization !== undefined && proposalData.amortization > 0)
              rows.push({ label: "Amortización", value: `$${proposalData.amortization?.toLocaleString("es-MX")}` });
            if (!isLender && proposalData?.amortization !== undefined && proposalData.amortization > 0)
              rows.push({ label: "Pago periódico", value: `$${proposalData.amortization?.toLocaleString("es-MX")}` });
            if (d?.lenderName)
              rows.push({ label: "Institución", value: d.lenderName });
            if (d?.purpose)
              rows.push({ label: "Propósito", value: d.purpose });

            return (
              <>
                {/* Colored header banner — outside ModalHeader to go edge to edge */}
                <div className={`${headerBg} px-6 pt-6 pb-5`}>
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/25 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
                      <HeaderIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-0.5">
                        {isAccepted ? "Propuesta aceptada" : isLost ? "Otra propuesta elegida" : "Nueva propuesta"}
                      </p>
                      <h3 className="text-white font-bold text-lg leading-tight">
                        {selectedNotification.title}
                      </h3>
                    </div>
                  </div>

                  {/* Amount — main KPI */}
                  {proposalData?.amount !== undefined && (
                    <div className="mt-5 pt-5 border-t border-white/10">
                      <p className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-1">
                        {isLender ? "Monto de la propuesta" : "Cantidad que te prestan"}
                      </p>
                      <p className="text-white font-bold text-3xl tabular-nums">
                        ${proposalData.amount.toLocaleString("es-MX")}
                      </p>
                    </div>
                  )}
                </div>

                <ModalBody className="px-6 py-5">
                  {/* Message */}
                  <p className="text-gray-600 text-sm">{selectedNotification.message}</p>

                  {/* Detail rows */}
                  {rows.length > 0 && (
                    <div className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
                      {rows.map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center px-4 py-3">
                          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
                          <span className="text-sm font-semibold text-gray-900 capitalize">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Payment summary for borrowers */}
                  {!isLender && proposalData?.amortization !== undefined && proposalData.amortization > 0 && proposalData.amortizationFrequency && proposalData.term && (
                    <div className="mt-3 bg-green-50 rounded-xl p-4 border border-green-100">
                      <p className="text-sm text-gray-700">
                        Pagarás{" "}
                        <span className="font-bold text-green-700">
                          ${proposalData.amortization.toLocaleString("es-MX")}
                        </span>{" "}
                        de forma{" "}
                        <span className="font-semibold capitalize">{proposalData.amortizationFrequency}</span>{" "}
                        durante <span className="font-semibold">{proposalData.term} meses</span>
                      </p>
                    </div>
                  )}

                  {/* Email note */}
                  {selectedNotification.emailSent && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Esta notificación también fue enviada a tu correo</span>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(selectedNotification.createdAt)}</span>
                  </div>
                </ModalBody>

                <ModalFooter className="pt-0 pb-5 px-6 gap-2">
                  <Button variant="flat" size="sm" onPress={() => setSelectedNotification(null)}>
                    Cerrar
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#0e3a45] text-white font-semibold"
                    onPress={() => {
                      if (type === "loan_accepted" || type === "loan_assigned_other") {
                        window.location.href = "/lender?tab=myoffers";
                      } else {
                        window.location.href = "/user_dashboard";
                      }
                    }}
                  >
                    {type === "loan_accepted" || type === "loan_assigned_other"
                      ? "Ver Mis Ofertas"
                      : "Ver en Dashboard"}
                  </Button>
                </ModalFooter>
              </>
            );
          })()}
        </ModalContent>
      </Modal>
    </div>
  );
}
