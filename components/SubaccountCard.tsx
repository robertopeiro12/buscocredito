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
} from "@nextui-org/react";
import { Eye, Edit, Trash } from "lucide-react";

type Subaccount = {
  id: number;
  name: string;
  email: string;
  userId: string;
};

type SubaccountCardProps = {
  subaccount: Subaccount;
  onDelete: (id: number) => void;
};

export function SubaccountCard({ subaccount, onDelete }: SubaccountCardProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // Agregar console.log para debug
      console.log("Intentando eliminar usuario con ID:", subaccount.userId);

      const response = await fetch("/api/deleteSubaccount", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: subaccount.userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Error ${response.status}: ${response.statusText}`
        );
      }

      onDelete(subaccount.id);
      onClose();
    } catch (error: any) {
      console.error("Error detallado:", error);
      alert(`Error al eliminar la subcuenta: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow duration-300 ease-in-out">
        <CardBody className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar
              name={subaccount.name}
              size="lg"
              color="success"
              className="bg-green-100 text-green-600"
            />
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-gray-900">
                {subaccount.name}
              </h3>
              <p className="text-sm text-gray-500">{subaccount.email}</p>
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              #{subaccount.id}
            </span>
          </div>
        </CardBody>
        <CardFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between w-full">
            <Button
              color="danger"
              variant="light"
              onPress={onOpen}
              startContent={<Trash className="w-4 h-4" />}
            >
              Eliminar
            </Button>
            <div className="flex gap-2">
              <Button
                color="primary"
                variant="flat"
                startContent={<Eye className="w-4 h-4" />}
              >
                Ver
              </Button>
              <Button
                color="primary"
                variant="flat"
                startContent={<Edit className="w-4 h-4" />}
              >
                Editar
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Confirmar Eliminación
          </ModalHeader>
          <ModalBody>
            <p>
              ¿Estás seguro de que deseas eliminar la subcuenta de{" "}
              {subaccount.name}?
            </p>
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
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
