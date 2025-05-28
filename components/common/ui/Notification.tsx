"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

export type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationProps {
  id: string;
  type: NotificationType;
  message: string;
  description?: string;
  onClose: (id: string) => void;
  duration?: number;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-900",
    icon: "text-green-500",
    hover: "hover:text-green-900",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-900",
    icon: "text-red-500",
    hover: "hover:text-red-900",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-900",
    icon: "text-blue-500",
    hover: "hover:text-blue-900",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-900",
    icon: "text-yellow-500",
    hover: "hover:text-yellow-900",
  },
};

export default function Notification({
  id,
  type,
  message,
  description,
  onClose,
  duration = 5000,
}: NotificationProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose, id]);

  const Icon = icons[type];
  const color = colors[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`${color.bg} ${color.text} px-4 py-3 rounded-lg shadow-lg border ${color.border} max-w-md`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${color.icon} mt-0.5 flex-shrink-0`} />
        <div className="flex-1">
          <h3 className="font-medium mb-1">{message}</h3>
          {description && <p className={`text-sm opacity-90`}>{description}</p>}
        </div>
        <button
          onClick={() => onClose(id)}
          className={`${color.icon} ${color.hover}`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
