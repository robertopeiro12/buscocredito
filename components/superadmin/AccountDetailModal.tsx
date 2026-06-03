"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider,
} from "@heroui/react";
import {
  User,
  Mail,
  Building,
  Calendar,
  Clock,
  Shield,
} from "lucide-react";
import type { AccountInfo } from "@/types/superadmin";

interface AccountDetailModalProps {
  account: AccountInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onActivate: (account: AccountInfo) => void;
  onDeactivate: (account: AccountInfo) => void;
  onDelete: (account: AccountInfo) => void;
}

const typeLabels: Record<string, { label: string; color: "default" | "primary" | "secondary" | "success" | "warning" | "danger" }> = {
  superAdmin: { label: "Super Admin", color: "secondary" },
  companyAdmin: { label: "Admin Empresa", color: "primary" },
  lender: { label: "Prestamista", color: "success" },
  borrower: { label: "Solicitante", color: "default" },
};

export function AccountDetailModal({
  account,
  isOpen,
  onClose,
  onActivate,
  onDeactivate,
  onDelete,
}: AccountDetailModalProps) {
  if (!account) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No disponible";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isSuperAdmin = account.type === "superAdmin";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0e3a45] flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {account.name || "Sin nombre"}
              </h2>
              <p className="text-sm text-gray-500">{account.email}</p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            {/* Status & Type */}
            <div className="flex items-center gap-4">
              <Chip
                color={typeLabels[account.type]?.color || "default"}
                variant="flat"
                startContent={<Shield className="w-3 h-3" />}
              >
                {typeLabels[account.type]?.label || account.type}
              </Chip>
              <Chip
                color={account.disabled ? "danger" : "success"}
                variant="dot"
              >
                {account.disabled ? "Cuenta Desactivada" : "Cuenta Activa"}
              </Chip>
            </div>

            <Divider />

            {/* Account Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Información de la Cuenta
              </h3>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{account.email}</p>
                  </div>
                </div>

                {account.companyName && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Building className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Empresa</p>
                      <p className="text-sm font-medium">{account.companyName}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fecha de Registro</p>
                    <p className="text-sm font-medium">
                      {formatDate(account.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Clock className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Último Acceso</p>
                    <p className="text-sm font-medium">
                      {formatDate(account.lastLoginAt)}
                    </p>
                  </div>
                </div>
              {account.address && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Building className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ubicación</p>
                    <p className="text-sm font-medium">
                      {[account.address.city, account.address.state, account.address.country]
                        .filter(Boolean)
                        .join(", ") || "No disponible"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* UID */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">ID de Usuario</p>
              <p className="text-xs font-mono text-gray-600 break-all">
                {account.uid}
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          {!isSuperAdmin && (
            <>
              {account.disabled ? (
                <Button
                  color="success"
                  variant="flat"
                  onPress={() => {
                    onActivate(account);
                    onClose();
                  }}
                >
                  Activar Cuenta
                </Button>
              ) : (
                <Button
                  color="warning"
                  variant="flat"
                  onPress={() => {
                    onDeactivate(account);
                    onClose();
                  }}
                >
                  Desactivar Cuenta
                </Button>
              )}
              <Button
                color="danger"
                variant="flat"
                onPress={() => {
                  onDelete(account);
                  onClose();
                }}
              >
                Eliminar Cuenta
              </Button>
            </>
          )}
          <Button color="default" variant="light" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
