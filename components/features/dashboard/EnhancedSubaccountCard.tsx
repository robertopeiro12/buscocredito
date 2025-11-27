import React from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Avatar,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Progress,
  Chip,
  Tooltip,
} from "@nextui-org/react";
import {
  Eye,
  Edit,
  Trash,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Worker } from "@/hooks/useWorkerStats";

type EnhancedSubaccountCardProps = {
  worker: Worker;
  onDelete: (id: string) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  formatLastActivity: (lastActivity: string | null) => string;
};

export function EnhancedSubaccountCard({
  worker,
  onDelete,
  onView,
  onEdit,
  formatLastActivity,
}: EnhancedSubaccountCardProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const { stats } = worker;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const response = await fetch("/api/users/subaccounts/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: worker.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Error ${response.status}: ${response.statusText}`
        );
      }

      onDelete(worker.id);
      onClose();
    } catch (error: any) {
      console.error("Error detallado:", error);
      alert(`Error al eliminar la subcuenta: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Determinar color del badge de estado
  const getStatusColor = () => {
    if (stats.isActive) return "success";
    if (stats.lastActivity) return "warning";
    return "danger";
  };

  // Determinar color de la tasa de aceptación
  const getApprovalRateColor = () => {
    if (stats.approvalRate >= 80) return "success";
    if (stats.approvalRate >= 60) return "warning";
    return "danger";
  };

  return (
    <>
      <Card
        className={`hover:shadow-lg transition-all duration-300 ease-in-out ${
          stats.isActive ? "border-l-4 border-l-green-500" : ""
        }`}
      >
        <CardBody className="p-6">
          {/* Header con avatar y estado */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar
                  name={worker.name}
                  size="lg"
                  color={stats.isActive ? "success" : "default"}
                  className={`${
                    stats.isActive
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                />
                {/* Dot indicator para estado activo */}
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    stats.isActive ? "bg-green-400" : "bg-gray-400"
                  }`}
                />
              </div>

              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {worker.name}
                  </h3>
                  <Chip size="sm" color={getStatusColor()} variant="flat">
                    {stats.isActive ? "Activo" : "Inactivo"}
                  </Chip>
                </div>
                <p className="text-sm text-gray-500">{worker.email}</p>
              </div>
            </div>
          </div>

          {/* Métricas principales */}
          <div className="space-y-4">
            {/* Progress bar de aprobación */}
            {stats.totalPropuestas > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tasa de aceptación</span>
                  <span className="font-medium">{stats.approvalRate}%</span>
                </div>
                <Progress
                  value={stats.approvalRate}
                  color={getApprovalRateColor()}
                  size="sm"
                  className="max-w-full"
                />
              </div>
            )}

            {/* Estadísticas en grid */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <Tooltip content="Total de propuestas enviadas">
                <div className="p-2 bg-purple-50 rounded-lg cursor-help">
                  <div className="text-lg font-bold text-purple-600">
                    {stats.totalPropuestas}
                  </div>
                  <div className="text-xs text-purple-500">Propuestas</div>
                </div>
              </Tooltip>

              <Tooltip content="Propuestas aprobadas">
                <div className="p-2 bg-green-50 rounded-lg cursor-help">
                  <div className="text-lg font-bold text-green-600">
                    {stats.solicitudesApproved}
                  </div>
                  <div className="text-xs text-green-500">Aprobadas</div>
                </div>
              </Tooltip>

              <Tooltip content="Propuestas pendientes">
                <div className="p-2 bg-yellow-50 rounded-lg cursor-help">
                  <div className="text-lg font-bold text-yellow-600">
                    {stats.solicitudesPending}
                  </div>
                  <div className="text-xs text-yellow-500">Pendientes</div>
                </div>
              </Tooltip>

              <Tooltip content="Propuestas rechazadas">
                <div className="p-2 bg-red-50 rounded-lg cursor-help">
                  <div className="text-lg font-bold text-red-600">
                    {stats.solicitudesRejected}
                  </div>
                  <div className="text-xs text-red-500">Rechazadas</div>
                </div>
              </Tooltip>
            </div>

            {/* Última actividad - solo si hay actividad */}
            {stats.lastActivity && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{formatLastActivity(stats.lastActivity)}</span>
                {stats.averageDailyActivity > 0 && (
                  <Chip size="sm" variant="flat" color="primary">
                    {stats.averageDailyActivity}/día
                  </Chip>
                )}
              </div>
            )}
          </div>
        </CardBody>

        <CardFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-center w-full">
            <Button
              color="danger"
              variant="light"
              onPress={onOpen}
              startContent={<Trash className="w-4 h-4" />}
              size="sm"
            >
              Eliminar
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Modal de confirmación */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Confirmar Eliminación
          </ModalHeader>
          <ModalBody>
            <p>
              ¿Estás seguro de que deseas eliminar la subcuenta de{" "}
              <strong>{worker.name}</strong>?
            </p>
            <div className="mt-2 p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">
                Se perderán {stats.totalPropuestas} propuestas enviadas.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Esta acción no se puede deshacer.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onPress={onClose}
              isDisabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isLoading={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
