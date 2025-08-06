import { Button, Card, CardBody } from "@nextui-org/react";
import { User as UserIcon } from "lucide-react";
import { UserData } from "@/types/dashboard";
import { formatDate } from "@/utils/dashboard-utils";

interface UserSettingsProps {
  userData: UserData;
  onUpdate: (data: any) => void;
}

export const UserSettings = ({ userData, onUpdate }: UserSettingsProps) => {
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
                  {`${userData.address.street} #${userData.address.number}`}
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
        </div>

        <div className="mt-8 flex justify-between">
          <Button color="primary" variant="flat">
            Inhabilitar
          </Button>
          <Button color="primary" onPress={() => onUpdate(userData)}>
            Modificar
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
