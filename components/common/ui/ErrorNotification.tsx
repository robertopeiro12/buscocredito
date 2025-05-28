import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle } from "lucide-react";

interface ErrorNotificationProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function ErrorNotification({
  message,
  onClose,
  duration = 5000,
}: ErrorNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 z-50 bg-red-50 text-red-900 px-4 py-3 rounded-lg shadow-lg border border-red-200 max-w-md"
    >
      <div className="flex items-start gap-3">
        <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium text-red-900 mb-1">Error</h3>
          <p className="text-sm text-red-700">{message}</p>
        </div>
        <button onClick={onClose} className="text-red-700 hover:text-red-900">
          <XCircle className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
