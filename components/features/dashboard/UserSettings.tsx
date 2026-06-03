import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  Switch,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@heroui/react";
import { User as UserIcon, Bell, Mail, Edit2, Save, X, MapPin } from "lucide-react";
import { UserData } from "@/types/dashboard";
import { formatDate } from "@/utils/dashboard-utils";
import { useNotification } from "@/components/common/ui/NotificationProvider";

interface UserSettingsProps {
  userData: UserData;
  onUpdate: (data: any) => void;
  userId?: string;
}

export const UserSettings = ({ userData, onUpdate, userId }: UserSettingsProps) => {
  const { showNotification } = useNotification();
  const [emailNotifications, setEmailNotifications] = useState(
    (userData as any).emailNotifications !== false
  );
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [addressForm, setAddressForm] = useState({
    street: userData.address?.street || "",
    exteriorNumber: userData.address?.exteriorNumber || "",
    interiorNumber: userData.address?.interiorNumber || "",
    colony: userData.address?.colony || "",
    city: userData.address?.city || "",
    state: userData.address?.state || "",
    zipCode: userData.address?.zipCode || "",
  });

  useEffect(() => {
    setAddressForm({
      street: userData.address?.street || "",
      exteriorNumber: userData.address?.exteriorNumber || "",
      interiorNumber: userData.address?.interiorNumber || "",
      colony: userData.address?.colony || "",
      city: userData.address?.city || "",
      state: userData.address?.state || "",
      zipCode: userData.address?.zipCode || "",
    });
  }, [userData]);

  const handleEmailNotificationsChange = async (enabled: boolean) => {
    if (!userId) return;

    setSavingPreferences(true);
    try {
      const response = await fetch("/api/users/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, emailNotifications: enabled }),
        credentials: "include",
      });

      if (response.ok) {
        setEmailNotifications(enabled);
        showNotification({
          type: "success",
          message: "Preferencias actualizadas",
          description: enabled
            ? "Recibirás notificaciones por correo electrónico"
            : "Las notificaciones por correo han sido desactivadas",
        });
      } else {
        showNotification({
          type: "error",
          message: "Error al actualizar preferencias",
          description: "Por favor, intenta de nuevo más tarde",
        });
      }
    } catch {
      showNotification({
        type: "error",
        message: "Error al actualizar preferencias",
        description: "Por favor, intenta de nuevo más tarde",
      });
    } finally {
      setSavingPreferences(false);
    }
  };

  const openEditModal = () => {
    setAddressForm({
      street: userData.address?.street || "",
      exteriorNumber: userData.address?.exteriorNumber || "",
      interiorNumber: userData.address?.interiorNumber || "",
      colony: userData.address?.colony || "",
      city: userData.address?.city || "",
      state: userData.address?.state || "",
      zipCode: userData.address?.zipCode || "",
    });
    setIsEditModalOpen(true);
  };

  const handleSaveAddress = async () => {
    if (!userId) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/users/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, address: addressForm }),
        credentials: "include",
      });

      if (response.ok) {
        showNotification({
          type: "success",
          message: "Domicilio actualizado",
          description: "Tu dirección ha sido actualizada correctamente",
        });
        setIsEditModalOpen(false);
        onUpdate({ ...userData, address: { ...userData.address, ...addressForm } });
      } else {
        const errorData = await response.json();
        showNotification({
          type: "error",
          message: "Error al actualizar domicilio",
          description: errorData.error || "Por favor, intenta de nuevo más tarde",
        });
      }
    } catch {
      showNotification({
        type: "error",
        message: "Error al actualizar domicilio",
        description: "Por favor, intenta de nuevo más tarde",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const field = (key: keyof typeof addressForm, value: string) =>
    setAddressForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Card className="bg-white max-w-4xl mx-auto">
      <CardBody className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-[#0e3a45]/10 flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-7 h-7 text-[#0e3a45]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {`${userData.name} ${userData.lastName} ${userData.secondLastName}`}
            </h2>
            <p className="text-xs text-gray-500">{userData.email}</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Datos Personales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              DATOS PERSONALES
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Correo electrónico</p>
                <p className="text-gray-900">{userData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de nacimiento</p>
                <p className="text-gray-900">{formatDate(userData.birthday)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contraseña</p>
                <p className="text-gray-900">••••••••••••</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">RFC</p>
                <p className="text-gray-900">{userData.rfc}</p>
              </div>
            </div>
          </div>

          {/* Domicilio */}
          <div>
            <div className="flex items-center justify-between border-b pb-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">DOMICILIO</h3>
              <Button
                size="sm"
                variant="flat"
                onPress={openEditModal}
                startContent={<Edit2 className="w-3.5 h-3.5" />}
                className="text-[#0e3a45] bg-[#0e3a45]/[0.06] hover:bg-[#0e3a45]/10"
              >
                Modificar
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Colonia</p>
                <p className="text-gray-900">{userData.address.colony}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Calle y Número</p>
                <p className="text-gray-900">
                  {`${userData.address.street} #${
                    userData.address.exteriorNumber || "No disponible"
                  }${
                    userData.address.interiorNumber
                      ? ` Int. ${userData.address.interiorNumber}`
                      : ""
                  }`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Código Postal</p>
                <p className="text-gray-900">{userData.address.zipCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ciudad</p>
                <p className="text-gray-900">{userData.address.city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <p className="text-gray-900">{userData.address.state}</p>
              </div>
            </div>
          </div>

          {/* Score Crediticio */}
          {userData.creditScore && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                SCORE CREDITICIO
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Puntuación</p>
                  <p className="text-2xl font-bold text-green-600">
                    {userData.creditScore.score}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Clasificación</p>
                  <div className="mt-1">
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                        userData.creditScore.classification === "Excelente"
                          ? "bg-emerald-100 text-emerald-800"
                          : userData.creditScore.classification === "Bueno"
                          ? "bg-green-100 text-green-800"
                          : userData.creditScore.classification === "Regular"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {userData.creditScore.classification}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferencias de Notificaciones */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              PREFERENCIAS DE NOTIFICACIONES
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0e3a45]/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#0e3a45]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Notificaciones por correo</p>
                    <p className="text-sm text-gray-500">
                      Recibe alertas por email cuando recibas nuevas propuestas
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {savingPreferences && <Spinner size="sm" />}
                  <Switch
                    isSelected={emailNotifications}
                    onValueChange={handleEmailNotificationsChange}
                    isDisabled={savingPreferences || !userId}
                    color="success"
                    size="lg"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0e3a45]/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-[#0e3a45]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Notificaciones en la web</p>
                    <p className="text-sm text-gray-500">
                      Siempre recibirás notificaciones dentro de la plataforma
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  Siempre activas
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardBody>

      {/* Modal domicilio */}
      <Modal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0e3a45]" />
                <div>
                  <h3 className="text-xl font-semibold">Modificar Domicilio</h3>
                  <p className="text-sm text-gray-500 font-normal">
                    Actualiza tu dirección registrada
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Calle"
                      placeholder="Nombre de la calle"
                      value={addressForm.street}
                      onValueChange={(v) => field("street", v)}
                      variant="bordered"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="No. Exterior"
                        placeholder="No. Ext"
                        value={addressForm.exteriorNumber}
                        onValueChange={(v) => field("exteriorNumber", v)}
                        variant="bordered"
                      />
                      <Input
                        label="No. Interior"
                        placeholder="Opcional"
                        value={addressForm.interiorNumber}
                        onValueChange={(v) => field("interiorNumber", v)}
                        variant="bordered"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Colonia"
                      placeholder="Nombre de la colonia"
                      value={addressForm.colony}
                      onValueChange={(v) => field("colony", v)}
                      variant="bordered"
                    />
                    <Input
                      label="Código Postal"
                      placeholder="C.P."
                      value={addressForm.zipCode}
                      onValueChange={(v) => field("zipCode", v)}
                      variant="bordered"
                      maxLength={5}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Ciudad"
                      placeholder="Ciudad"
                      value={addressForm.city}
                      onValueChange={(v) => field("city", v)}
                      variant="bordered"
                    />
                    <Input
                      label="Estado"
                      placeholder="Estado"
                      value={addressForm.state}
                      onValueChange={(v) => field("state", v)}
                      variant="bordered"
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  startContent={<X className="w-4 h-4" />}
                  isDisabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  onPress={handleSaveAddress}
                  startContent={isSaving ? undefined : <Save className="w-4 h-4" />}
                  isLoading={isSaving}
                  className="bg-[#0e3a45] text-white hover:opacity-90"
                >
                  Guardar Cambios
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Card>
  );
};
