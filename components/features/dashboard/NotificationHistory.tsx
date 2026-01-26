"use client";

import { useState, useEffect } from "react";
import { getFirestore, collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
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
  Tooltip,
  Spinner,
} from "@heroui/react";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Clock,
  Filter,
  Info,
  Mail,
  MailOpen,
  MoreVertical,
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
      const response = await fetch("/api/markNotificationRead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
      const unreadNotifications = notifications.filter((n) => !n.read);
      await Promise.all(
        unreadNotifications.map((n) =>
          fetch("/api/markNotificationRead", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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

  // Get notification icon and colors
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "loan_accepted":
        return {
          icon: "✅",
          bgColor: "bg-green-50",
          borderColor: "border-green-500",
          chipColor: "success" as const,
          label: "Propuesta Aceptada",
        };
      case "loan_assigned_other":
        return {
          icon: "ℹ️",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-500",
          chipColor: "primary" as const,
          label: "Otra Propuesta Elegida",
        };
      case "nueva_propuesta":
        return {
          icon: "💰",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-500",
          chipColor: "warning" as const,
          label: "Nueva Propuesta",
        };
      default:
        return {
          icon: "📢",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-500",
          chipColor: "default" as const,
          label: "Notificación",
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Centro de Notificaciones
            </h1>
            <p className="text-gray-600">
              Historial de todas tus notificaciones y alertas
            </p>
          </div>

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

            return (
              <Card
                key={notification.id}
                isPressable
                onPress={() => {
                  if (!notification.read) {
                    markAsRead(notification.id);
                  }
                  setSelectedNotification(notification);
                }}
                className={`transition-all ${
                  !notification.read
                    ? "border-l-4 " + style.borderColor + " shadow-md"
                    : "border-l-4 border-gray-200 opacity-75 hover:opacity-100"
                }`}
              >
                <CardBody className={`p-4 ${!notification.read ? style.bgColor : ""}`}>
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                        !notification.read ? "bg-white shadow-sm" : "bg-gray-100"
                      }`}
                    >
                      {style.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={`font-medium ${
                            !notification.read ? "text-gray-900" : "text-gray-600"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <Chip size="sm" color={style.chipColor} variant="flat">
                          {style.label}
                        </Chip>
                        {notification.emailSent && (
                          <Tooltip content="Notificación enviada por email">
                            <Mail className="w-4 h-4 text-gray-400" />
                          </Tooltip>
                        )}
                      </div>

                      <p
                        className={`text-sm ${
                          !notification.read ? "text-gray-700" : "text-gray-500"
                        } line-clamp-2`}
                      >
                        {notification.message}
                      </p>

                      {/* Quick info for proposals */}
                      {notification.type === "nueva_propuesta" && notification.data?.amount && (
                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                          <span>
                            <strong>Monto:</strong> $
                            {notification.data.amount.toLocaleString("es-MX")}
                          </span>
                          {notification.data.interestRate && (
                            <span>
                              <strong>Tasa:</strong> {notification.data.interestRate}%
                            </span>
                          )}
                          {notification.data.term && (
                            <span>
                              <strong>Plazo:</strong> {notification.data.term} meses
                            </span>
                          )}
                          {notification.data.amortization !== undefined && notification.data.amortization > 0 && (
                            <span>
                              <strong>Monto de amortización:</strong> $
                              {notification.data.amortization.toLocaleString("es-MX")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(notification.createdAt)}
                      </span>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
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
        size="lg"
      >
        <ModalContent>
          {selectedNotification && (
            <>
              <ModalHeader>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {getNotificationStyle(selectedNotification.type).icon}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedNotification.title}</h3>
                    <p className="text-sm text-gray-500 font-normal">
                      {formatDate(selectedNotification.createdAt)}
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                <p className="text-gray-700 mb-4">{selectedNotification.message}</p>

                {/* Detailed info for proposals */}
                {selectedNotification.data && (
                  <Card className="bg-gray-50">
                    <CardBody>
                      <h4 className="font-medium text-gray-800 mb-3">
                        {selectedNotification.type === "loan_assigned_other" 
                          ? "Detalles de la propuesta ganadora" 
                          : "Información de la Propuesta"}
                      </h4>
                      {(() => {
                        // For loan_assigned_other, use winningOffer data; otherwise use direct data
                        const proposalData = selectedNotification.type === "loan_assigned_other" 
                          ? selectedNotification.data.winningOffer 
                          : selectedNotification.data;
                        
                        if (!proposalData) return null;
                        
                        return (
                          <>
                            <div className="space-y-3 text-sm">
                              {proposalData.amount !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">{isLender ? "Monto:" : "Cantidad que te prestan:"}</span>
                                  <span className="font-semibold text-gray-900">
                                    ${proposalData.amount?.toLocaleString("es-MX")}
                                  </span>
                                </div>
                              )}
                              {proposalData.comision !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Comisión por apertura:</span>
                                  <span className="font-semibold text-gray-900">
                                    ${proposalData.comision?.toLocaleString("es-MX")}
                                  </span>
                                </div>
                              )}
                              {selectedNotification.data.lenderName && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Compañía:</span>
                                  <span className="font-semibold text-gray-900">
                                    {selectedNotification.data.lenderName}
                                  </span>
                                </div>
                              )}
                              {proposalData.interestRate !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Tasa de interés:</span>
                                  <span className="font-semibold text-gray-900">
                                    {proposalData.interestRate}% anual
                                  </span>
                                </div>
                              )}
                              {proposalData.term !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Plazo:</span>
                                  <span className="font-semibold text-gray-900">
                                    {proposalData.term} meses
                                  </span>
                                </div>
                              )}
                              {proposalData.amortizationFrequency && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Frecuencia de pago:</span>
                                  <span className="font-semibold text-gray-900 capitalize">
                                    {proposalData.amortizationFrequency}
                                  </span>
                                </div>
                              )}
                              {proposalData.medicalBalance !== undefined && proposalData.medicalBalance > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Seguro de vida saldo deudor:</span>
                                  <span className="font-semibold text-gray-900">
                                    ${proposalData.medicalBalance?.toLocaleString("es-MX")}
                                  </span>
                                </div>
                              )}
                              {selectedNotification.data.loanType && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Tipo de préstamo:</span>
                                  <span className="font-semibold text-gray-900">
                                    {selectedNotification.data.loanType}
                                  </span>
                                </div>
                              )}
                              {selectedNotification.data.purpose && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Propósito:</span>
                                  <span className="font-semibold text-gray-900">
                                    {selectedNotification.data.purpose}
                                  </span>
                                </div>
                              )}
                              {/* Amortización field - only shown for workers/lenders */}
                              {isLender && proposalData.amortization !== undefined && proposalData.amortization > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Amortización:</span>
                                  <span className="font-semibold text-gray-900">
                                    ${proposalData.amortization?.toLocaleString("es-MX")}
                                  </span>
                                </div>
                              )}
                              {/* Pago field - only shown for regular users, not workers/lenders */}
                              {!isLender && proposalData.amortization !== undefined && proposalData.amortization > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Pago:</span>
                                  <span className="font-semibold text-gray-900">
                                    ${proposalData.amortization?.toLocaleString("es-MX")}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Payment summary - only shown for regular users, not workers/lenders */}
                            {!isLender && proposalData.amortization !== undefined && proposalData.amortization > 0 && proposalData.amortizationFrequency && proposalData.term && (
                              <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200">
                                <p className="text-gray-900 font-medium text-sm">
                                  Pagarás{" "}
                                  <span className="font-bold text-green-600">
                                    ${proposalData.amortization?.toLocaleString("es-MX")}
                                  </span>{" "}
                                  de forma{" "}
                                  <span className="font-bold capitalize">
                                    {proposalData.amortizationFrequency}
                                  </span>{" "}
                                  durante <span className="font-bold">{proposalData.term} meses</span>
                                </p>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </CardBody>
                  </Card>
                )}

                {/* Email status */}
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                  {selectedNotification.emailSent ? (
                    <>
                      <Mail className="w-4 h-4 text-green-500" />
                      <span>Esta notificación también fue enviada a tu correo electrónico</span>
                    </>
                  ) : (
                    <>
                      <Info className="w-4 h-4" />
                      <span>Notificación solo visible en el panel</span>
                    </>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={() => setSelectedNotification(null)}>
                  Cerrar
                </Button>
                <Button
                  color="success"
                  onPress={() => {
                    // Navigate based on notification type
                    // loan_accepted and loan_assigned_other are for lenders/workers
                    // nueva_propuesta is for regular users
                    if (selectedNotification?.type === "loan_accepted" || 
                        selectedNotification?.type === "loan_assigned_other") {
                      window.location.href = "/lender?tab=myoffers";
                    } else {
                      window.location.href = "/user_dashboard";
                    }
                  }}
                >
                  {selectedNotification?.type === "loan_accepted" || 
                   selectedNotification?.type === "loan_assigned_other" 
                    ? "Ver Mis Ofertas" 
                    : "Ver en Dashboard"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
