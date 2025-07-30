"use client";

import React, { createContext, useContext, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import Notification, { NotificationType } from "./Notification";

interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
  description?: string;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (props: Omit<NotificationItem, "id">) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
}

export function NotificationProvider({
  children,
  maxNotifications = 3,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const showNotification = useCallback(
    ({
      type,
      message,
      description,
      duration,
    }: Omit<NotificationItem, "id">) => {
      const id = uuidv4();
      setNotifications((prev) => {
        const newNotifications = [
          { id, type, message, description, duration },
          ...prev,
        ].slice(0, maxNotifications);
        return newNotifications;
      });
    },
    [maxNotifications]
  );

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, clearAll }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-4">
        <>
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              {...notification}
              onClose={removeNotification}
            />
          ))}
        </>
      </div>
    </NotificationContext.Provider>
  );
}
