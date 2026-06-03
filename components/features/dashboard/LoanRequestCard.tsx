import { Button, Card, CardBody, CardFooter, Chip, Progress } from "@heroui/react";
import { Eye, Trash2 } from "lucide-react";
import { SolicitudData } from "@/types/dashboard";

interface LoanRequestCardProps {
  solicitud: SolicitudData;
  offerCount: number;
  onViewOffers: (solicitudId: string) => void;
  onDelete: (solicitud: SolicitudData) => void;
}

export const LoanRequestCard = ({
  solicitud,
  offerCount,
  onViewOffers,
  onDelete,
}: LoanRequestCardProps) => {
  const hasAcceptedOffer = solicitud.status === "approved";

  const statusColor = hasAcceptedOffer
    ? "success"
    : offerCount === 0
    ? "default"
    : offerCount < 3
    ? "warning"
    : "success";

  const statusText = hasAcceptedOffer
    ? "Propuesta aceptada"
    : offerCount === 0
    ? "Sin propuestas"
    : offerCount === 1
    ? "1 propuesta"
    : `${offerCount} propuestas`;

  return (
    <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Accent bar */}
      <div className="h-0.5 bg-[#0e3a45]" />

      <CardBody className="p-5">
        {/* Header row */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {solicitud.purpose}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{solicitud.type}</p>
          </div>
          <span className="text-lg font-bold text-[#0e3a45] whitespace-nowrap">
            ${solicitud.amount.toLocaleString()}
          </span>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="bg-gray-50 rounded-lg px-2 py-2">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Plazo</p>
            <p className="text-xs font-semibold text-gray-800">{solicitud.term}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-2 py-2">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Pago</p>
            <p className="text-xs font-semibold text-gray-800">{solicitud.payment}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-2 py-2">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Ingresos</p>
            <p className="text-xs font-semibold text-gray-800">${Number(solicitud.income).toLocaleString("es-MX")}</p>
          </div>
        </div>

        {/* Offer progress */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gray-500">Interés de prestamistas</span>
            <Chip color={statusColor} variant="flat" size="sm" className="text-[11px] h-5">
              {statusText}
            </Chip>
          </div>
          <Progress
            value={offerCount > 0 ? Math.min((offerCount / 3) * 100, 100) : 0}
            className="h-1.5"
            color="success"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            {offerCount === 0 ? "Esperando propuestas" : "Propuestas recibidas"}
          </p>
        </div>
      </CardBody>

      <CardFooter className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-between w-full gap-3">
          {!hasAcceptedOffer && (
            <Button
              variant="light"
              size="sm"
              startContent={<Trash2 className="w-3.5 h-3.5" />}
              onPress={() => onDelete(solicitud)}
              className="text-red-500 hover:bg-red-50 flex-1 text-xs"
            >
              Eliminar
            </Button>
          )}
          <Button
            size="sm"
            endContent={<Eye className="w-3.5 h-3.5" />}
            onPress={() => onViewOffers(solicitud.id)}
            className={`bg-[#0e3a45] hover:opacity-90 text-white text-xs ${
              hasAcceptedOffer ? "w-full" : "flex-1"
            }`}
            isDisabled={offerCount === 0 && !hasAcceptedOffer}
          >
            {hasAcceptedOffer
              ? "Ver Propuesta Aceptada"
              : offerCount === 0
              ? "Sin propuestas"
              : "Ver Propuestas"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
