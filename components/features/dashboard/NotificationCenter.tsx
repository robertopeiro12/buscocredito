"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, X, Check, Clock, Info } from "lucide-react";
import { Button, Card, Tooltip } from "@heroui/react";

interface NotificationData {
  id: string;
  recipientId: string;
  type: "loan_accepted" | "loan_assigned_other" | "nueva_propuesta";
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
  createdAt: any;
}

interface NotificationCenterProps {
  userId: string;
  compact?: boolean;
}

export default function NotificationCenter({
  userId,
  compact = false,
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Cargar notificaciones
  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();

        // Manejar la estructura de respuesta correcta
        let notifications = [];
        if (data.success && data.data) {
          // Nueva estructura: {success: true, data: {notifications: [...]}, message: "..."}
          if (data.data.notifications) {
            notifications = Array.isArray(data.data.notifications)
              ? data.data.notifications
              : [];
          } else if (Array.isArray(data.data)) {
            notifications = data.data;
          }
        } else if (data.status === 200) {
          // Estructura antigua: {status: 200, data: [...]}
          notifications = data.data || [];
        } else if (Array.isArray(data)) {
          // Respuesta directa como array
          notifications = data;
        }

        setNotifications(notifications);
      } else {
        console.error("Error loading notifications:", response.statusText);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Cargar contador de no leídas
  const loadUnreadCount = useCallback(async () => {
    if (!userId) {
      console.log("No userId provided for unread count");
      return;
    }

    console.log("Loading unread count for userId:", userId);

    try {
      const response = await fetch("/api/getUnreadCount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Unread count response:", data);
        if (data.status === 200) {
          setUnreadCount(data.count || 0);
        }
      } else {
        const errorText = await response.text();
        console.error(
          "Error loading unread count:",
          response.status,
          response.statusText,
          errorText
        );
      }
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  }, [userId]);

  // Marcar como leída
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
        // Actualizar la notificación en el estado local
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        // Actualizar contador
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (userId) {
      loadNotifications();
      loadUnreadCount();

      // Recargar cada 30 segundos
      const interval = setInterval(() => {
        loadUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [userId, loadNotifications, loadUnreadCount]);

  // Recargar notificaciones cuando se abre el panel
  useEffect(() => {
    if (isOpen && userId) {
      loadNotifications();
    }
  }, [isOpen, userId, loadNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "loan_accepted":
        return "✓";
      case "loan_assigned_other":
        return "i";
      case "nueva_propuesta":
        return "💰";
      default:
        return "•";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "loan_accepted":
        return "border-l-green-500 bg-green-50";
      case "loan_assigned_other":
        return "border-l-blue-500 bg-blue-50";
      case "nueva_propuesta":
        return "border-l-yellow-500 bg-yellow-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

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

    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative">
      {/* Botón de campana */}
      <Button
        isIconOnly
        variant="light"
        size={compact ? "sm" : "md"}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative hover:bg-gray-100 ${compact ? "h-8 w-8" : ""}`}
      >
        <Bell className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-gray-600`} />
        {unreadCount > 0 && (
          <span
            className={`absolute ${
              compact
                ? "-top-0.5 -right-0.5 h-4 w-4 text-[10px]"
                : "-top-1 -right-1 h-5 w-5 text-xs"
            } bg-red-500 text-white rounded-full flex items-center justify-center font-medium`}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div
          className={`absolute ${
            compact ? "right-0 top-10" : "right-0 top-12"
          } w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Notificaciones</h3>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onClick={() => setIsOpen(false)}
                className="hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount} sin leer
              </p>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Cargando...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 border-l-4 ${getNotificationColor(
                    notification.type
                  )} ${
                    !notification.read ? "bg-opacity-100" : "bg-opacity-30"
                  } hover:bg-opacity-60 transition-colors`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <h4
                          className={`font-medium text-sm ${
                            !notification.read
                              ? "text-gray-900"
                              : "text-gray-600"
                          }`}
                        >
                          {notification.title}
                        </h4>
                      </div>
                      <p
                        className={`text-sm ${
                          !notification.read ? "text-gray-700" : "text-gray-500"
                        }`}
                      >
                        {notification.message}
                      </p>

                      {/* Información adicional para competidores */}
                      {notification.type === "loan_assigned_other" &&
                        notification.data && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md text-xs">
                            <h5 className="font-medium text-gray-700 mb-2">
                              Detalles de la propuesta ganadora:
                            </h5>
                            <div className="space-y-1 text-gray-600">
                              <div>
                                <span className="font-medium">Monto:</span> $
                                {notification.data.winningOffer?.amount?.toLocaleString() ||
                                  "N/A"}
                              </div>
                              <div>
                                <span className="font-medium">Tasa:</span>{" "}
                                {notification.data.winningOffer?.interestRate ||
                                  "N/A"}
                                %
                              </div>
                              <div>
                                <span className="font-medium">Frecuencia:</span>{" "}
                                {notification.data.winningOffer
                                  ?.amortizationFrequency || "N/A"}
                              </div>
                              <div>
                                <span className="font-medium">Plazo:</span>{" "}
                                {notification.data.winningOffer?.term || "N/A"}{" "}
                                meses
                              </div>
                              {notification.data.winningOffer?.amortization !== undefined && notification.data.winningOffer?.amortization > 0 && (
                                <div>
                                  <span className="font-medium">Monto de amortización:</span> $
                                  {notification.data.winningOffer?.amortization?.toLocaleString()}
                                </div>
                              )}
                              <div>
                                <span className="font-medium">Comisión por apertura:</span> $
                                {notification.data.winningOffer?.comision?.toLocaleString() ||
                                  "N/A"}
                              </div>
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">
                                    Seguro de vida saldo deudor:
                                  </span>
                                  <Tooltip
                                    content="Seguro que cubre el adeudo en caso de una situación fatal"
                                    placement="top"
                                    className="max-w-xs"
                                  >
                                    <Info className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                                  </Tooltip>
                                </div>
                                <span className="ml-1">
                                  $
                                  {notification.data.winningOffer?.medicalBalance?.toLocaleString() ||
                                    "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Información adicional para propuestas nuevas */}
                      {notification.type === "nueva_propuesta" &&
                        notification.data && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded-md text-xs">
                            <h5 className="font-medium text-yellow-700 mb-2">
                              Detalles de la nueva propuesta:
                            </h5>
                            <div className="space-y-1 text-yellow-600">
                              <div>
                                <span className="font-medium">Monto:</span> $
                                {notification.data.amount?.toLocaleString() ||
                                  "N/A"}
                              </div>
                              <div>
                                <span className="font-medium">Tasa:</span>{" "}
                                {notification.data.interestRate || "N/A"}%
                              </div>
                              <div>
                                <span className="font-medium">Plazo:</span>{" "}
                                {notification.data.term || "N/A"} meses
                              </div>
                              <div>
                                <span className="font-medium">Frecuencia:</span>{" "}
                                {notification.data.amortizationFrequency ||
                                  "N/A"}
                              </div>
                              {notification.data.amortization !== undefined && notification.data.amortization > 0 && (
                                <div>
                                  <span className="font-medium">Monto de amortización:</span> $
                                  {notification.data.amortization?.toLocaleString()}
                                </div>
                              )}
                            </div>
                            <div className="border-t border-yellow-200 pt-2 mt-2">
                              <span className="font-medium text-yellow-700">
                                Revisa las ofertas en tu dashboard
                              </span>
                            </div>
                          </div>
                        )}

                      {/* Información adicional para ganadores */}
                      {notification.type === "loan_accepted" &&
                        notification.data && (
                          <div className="mt-3 p-3 bg-green-50 rounded-md text-xs">
                            <h5 className="font-medium text-green-700 mb-2">
                              Detalles de la propuesta aceptada
                            </h5>
                            <div className="grid grid-cols-2 gap-2 text-green-600 mb-3">
                              <div>
                                <span className="font-medium">Monto:</span>
                                <br />$
                                {notification.data.amount?.toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Tasa:</span>
                                <br />
                                {notification.data.interestRate}%
                              </div>
                              <div>
                                <span className="font-medium">Frecuencia:</span>
                                <br />
                                {notification.data.amortizationFrequency}
                              </div>
                              <div>
                                <span className="font-medium">Plazo:</span>
                                <br />
                                {notification.data.term} meses
                              </div>
                              {notification.data.amortization !== undefined && notification.data.amortization > 0 && (
                                <div>
                                  <span className="font-medium">Monto de amortización:</span>
                                  <br />$
                                  {notification.data.amortization?.toLocaleString()}
                                </div>
                              )}
                              <div>
                                <span className="font-medium">Comisión por apertura:</span>
                                <br />$
                                {notification.data.comision?.toLocaleString()}
                              </div>
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">
                                    Seguro de vida saldo deudor:
                                  </span>
                                  <Tooltip
                                    content="Seguro que cubre el adeudo en caso de una situación fatal"
                                    placement="top"
                                    className="max-w-xs"
                                  >
                                    <Info className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                                  </Tooltip>
                                </div>
                                <span>
                                  $
                                  {notification.data.medicalBalance?.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <div className="border-t border-green-200 pt-2">
                              <span className="font-medium text-green-700">
                                Próximos pasos:
                              </span>
                              <br />
                              <span className="text-green-600">
                                Contactate con el usuario
                              </span>
                            </div>
                          </div>
                        )}
                    </div>
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="light"
                        onClick={() => markAsRead(notification.id)}
                        className="ml-2 hover:bg-gray-200"
                        title="Marcar como leída"
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
