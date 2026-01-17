"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { AlertTriangle } from "lucide-react";
import type { AccountInfo } from "@/types/superadmin";

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: {
    type: "delete" | "deactivate" | "activate";
    account: AccountInfo;
  } | null;
  isLoading?: boolean;
}

export function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  isLoading = false,
}: ConfirmActionModalProps) {
  if (!action) return null;

  const actionConfig = {
    delete: {
      title: "Eliminar Cuenta",
      message: `¿Estás seguro de que deseas eliminar permanentemente la cuenta de ${action.account.email}? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      color: "danger" as const,
    },
    deactivate: {
      title: "Desactivar Cuenta",
      message: `¿Estás seguro de que deseas desactivar la cuenta de ${action.account.email}? El usuario no podrá acceder hasta que se reactive.`,
      confirmText: "Desactivar",
      color: "warning" as const,
    },
    activate: {
      title: "Activar Cuenta",
      message: `¿Estás seguro de que deseas activar la cuenta de ${action.account.email}?`,
      confirmText: "Activar",
      color: "success" as const,
    },
  };

  const config = actionConfig[action.type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          <div
            className={`p-2 rounded-full ${
              action.type === "delete"
                ? "bg-red-100"
                : action.type === "deactivate"
                ? "bg-yellow-100"
                : "bg-green-100"
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 ${
                action.type === "delete"
                  ? "text-red-600"
                  : action.type === "deactivate"
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}
            />
          </div>
          {config.title}
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-600">{config.message}</p>
          <div className="bg-gray-50 p-3 rounded-lg mt-4">
            <p className="text-sm text-gray-500">Cuenta afectada:</p>
            <p className="font-medium">{action.account.name || "Sin nombre"}</p>
            <p className="text-sm text-gray-600">{action.account.email}</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            color={config.color}
            onPress={onConfirm}
            isLoading={isLoading}
          >
            {config.confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
