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
} from "@nextui-org/react";
import { User as UserIcon, Bell, Mail, Edit2, Save, X } from "lucide-react";
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
  
  // Form state for editing
  const [formData, setFormData] = useState({
    name: userData.name || "",
    last_name: userData.last_name || "",
    second_last_name: userData.second_last_name || "",
    phone: userData.phone || "",
    rfc: userData.rfc || "",
    address: {
      street: userData.address?.street || "",
      exteriorNumber: userData.address?.exteriorNumber || "",
      interiorNumber: userData.address?.interiorNumber || "",
      colony: userData.address?.colony || "",
      city: userData.address?.city || "",
      state: userData.address?.state || "",
      zipCode: userData.address?.zipCode || "",
    }
  });

  // Update form data when userData changes
  useEffect(() => {
    setFormData({
      name: userData.name || "",
      last_name: userData.last_name || "",
      second_last_name: userData.second_last_name || "",
      phone: userData.phone || "",
      rfc: userData.rfc || "",
      address: {
        street: userData.address?.street || "",
        exteriorNumber: userData.address?.exteriorNumber || "",
        interiorNumber: userData.address?.interiorNumber || "",
        colony: userData.address?.colony || "",
        city: userData.address?.city || "",
        state: userData.address?.state || "",
        zipCode: userData.address?.zipCode || "",
      }
    });
  }, [userData]);

  const handleEmailNotificationsChange = async (enabled: boolean) => {
    if (!userId) return;
    
    setSavingPreferences(true);
    try {
      const response = await fetch("/api/users/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          emailNotifications: enabled 
        }),
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
    } catch (error) {
      console.error("Error updating preferences:", error);
      showNotification({
        type: "error",
        message: "Error al actualizar preferencias",
        description: "Por favor, intenta de nuevo más tarde",
      });
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("address.")) {
      const addressField = field.replace("address.", "");
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    
    setIsSaving(true);
    try {
      const response = await fetch("/api/users/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...formData,
        }),
        credentials: "include",
      });

      if (response.ok) {
        showNotification({
          type: "success",
          message: "Perfil actualizado",
          description: "Tu información ha sido actualizada correctamente",
        });
        setIsEditModalOpen(false);
        // Trigger parent update to refresh data
        onUpdate({ ...userData, ...formData });
      } else {
        const errorData = await response.json();
        showNotification({
          type: "error",
          message: "Error al actualizar perfil",
          description: errorData.error || "Por favor, intenta de nuevo más tarde",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification({
        type: "error",
        message: "Error al actualizar perfil",
        description: "Por favor, intenta de nuevo más tarde",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = () => {
    // Reset form data to current userData
    setFormData({
      name: userData.name || "",
      last_name: userData.last_name || "",
      second_last_name: userData.second_last_name || "",
      phone: userData.phone || "",
      rfc: userData.rfc || "",
      address: {
        street: userData.address?.street || "",
        exteriorNumber: userData.address?.exteriorNumber || "",
        interiorNumber: userData.address?.interiorNumber || "",
        colony: userData.address?.colony || "",
        city: userData.address?.city || "",
        state: userData.address?.state || "",
        zipCode: userData.address?.zipCode || "",
      }
    });
    setIsEditModalOpen(true);
  };

  return (
    <Card className="bg-white max-w-4xl mx-auto">
      <CardBody className="p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              <UserIcon className="w-12 h-12 text-gray-400" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {`${userData.name} ${userData.last_name} ${userData.second_last_name}`}
            </h2>
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
                <p className="text-sm text-gray-500">correo electrónico</p>
                <p className="text-gray-900">{userData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">fecha nacimiento</p>
                <p className="text-gray-900">{formatDate(userData.birthday)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">contraseña</p>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              DOMICILIO
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Colonia</p>
                <p className="text-gray-900">{userData.address.colony}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Calle y Número</p>
                <p className="text-gray-900">
                  {`${userData.address.street} #${
                    userData.address.exteriorNumber ||
                    userData.address.number ||
                    "No disponible"
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
                <p className="text-sm text-gray-500">Municipio</p>
                <p className="text-gray-900">{userData.address.state}</p>
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
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-600" />
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
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-600" />
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

        <div className="mt-8 flex justify-end">
          <Button 
            color="primary" 
            onPress={openEditModal}
            startContent={<Edit2 className="w-4 h-4" />}
          >
            Modificar
          </Button>
        </div>
      </CardBody>

      {/* Edit Profile Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-semibold">Editar Información Personal</h3>
                <p className="text-sm text-gray-500 font-normal">Actualiza tus datos personales y dirección</p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  {/* Datos Personales */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-4">Datos Personales</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Nombre"
                        placeholder="Tu nombre"
                        value={formData.name}
                        onValueChange={(value) => handleInputChange("name", value)}
                        variant="bordered"
                      />
                      <Input
                        label="Apellido Paterno"
                        placeholder="Apellido paterno"
                        value={formData.last_name}
                        onValueChange={(value) => handleInputChange("last_name", value)}
                        variant="bordered"
                      />
                      <Input
                        label="Apellido Materno"
                        placeholder="Apellido materno"
                        value={formData.second_last_name}
                        onValueChange={(value) => handleInputChange("second_last_name", value)}
                        variant="bordered"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <Input
                        label="Teléfono"
                        placeholder="Tu número de teléfono"
                        value={formData.phone}
                        onValueChange={(value) => handleInputChange("phone", value)}
                        variant="bordered"
                        type="tel"
                      />
                      <Input
                        label="RFC"
                        placeholder="Tu RFC"
                        value={formData.rfc}
                        onValueChange={(value) => handleInputChange("rfc", value.toUpperCase())}
                        variant="bordered"
                        maxLength={13}
                      />
                    </div>
                  </div>

                  {/* Dirección */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-4">Domicilio</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Calle"
                        placeholder="Nombre de la calle"
                        value={formData.address.street}
                        onValueChange={(value) => handleInputChange("address.street", value)}
                        variant="bordered"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Número Exterior"
                          placeholder="No. Ext"
                          value={formData.address.exteriorNumber}
                          onValueChange={(value) => handleInputChange("address.exteriorNumber", value)}
                          variant="bordered"
                        />
                        <Input
                          label="Número Interior"
                          placeholder="No. Int (opcional)"
                          value={formData.address.interiorNumber}
                          onValueChange={(value) => handleInputChange("address.interiorNumber", value)}
                          variant="bordered"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <Input
                        label="Colonia"
                        placeholder="Nombre de la colonia"
                        value={formData.address.colony}
                        onValueChange={(value) => handleInputChange("address.colony", value)}
                        variant="bordered"
                      />
                      <Input
                        label="Código Postal"
                        placeholder="C.P."
                        value={formData.address.zipCode}
                        onValueChange={(value) => handleInputChange("address.zipCode", value)}
                        variant="bordered"
                        maxLength={5}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <Input
                        label="Ciudad"
                        placeholder="Ciudad"
                        value={formData.address.city}
                        onValueChange={(value) => handleInputChange("address.city", value)}
                        variant="bordered"
                      />
                      <Input
                        label="Estado"
                        placeholder="Estado"
                        value={formData.address.state}
                        onValueChange={(value) => handleInputChange("address.state", value)}
                        variant="bordered"
                      />
                    </div>
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
                  color="primary" 
                  onPress={handleSaveProfile}
                  startContent={isSaving ? undefined : <Save className="w-4 h-4" />}
                  isLoading={isSaving}
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
