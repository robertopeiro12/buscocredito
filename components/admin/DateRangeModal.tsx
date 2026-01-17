import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";

interface DateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  customDateRange: {
    startDate: Date;
    endDate: Date;
  };
  setCustomDateRange: (range: { startDate: Date; endDate: Date }) => void;
  onConfirm: () => void;
}

export const DateRangeModal = ({
  isOpen,
  onClose,
  customDateRange,
  setCustomDateRange,
  onConfirm,
}: DateRangeModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        base: "rounded-xl shadow-xl",
        header: "border-b border-gray-100",
        body: "py-6",
        footer: "border-t border-gray-100",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="text-lg font-semibold text-gray-900">
            Seleccionar Rango de Fechas
          </div>
          <div className="text-xs text-gray-500">
            Elige un período personalizado para analizar tus métricas
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de inicio
              </label>
              <Input
                type="date"
                value={customDateRange.startDate.toISOString().split("T")[0]}
                onChange={(e) =>
                  setCustomDateRange({
                    ...customDateRange,
                    startDate: new Date(e.target.value),
                  })
                }
                className="w-full"
                classNames={{
                  input: "bg-gray-50 border border-gray-200",
                  inputWrapper:
                    "bg-gray-50 hover:bg-gray-100 transition-colors",
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de fin
              </label>
              <Input
                type="date"
                value={customDateRange.endDate.toISOString().split("T")[0]}
                onChange={(e) =>
                  setCustomDateRange({
                    ...customDateRange,
                    endDate: new Date(e.target.value),
                  })
                }
                className="w-full"
                classNames={{
                  input: "bg-gray-50 border border-gray-200",
                  inputWrapper:
                    "bg-gray-50 hover:bg-gray-100 transition-colors",
                }}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onPress={onClose}
            className="rounded-md"
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={onConfirm}
            className="rounded-md shadow-sm"
          >
            Aplicar Filtro
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
