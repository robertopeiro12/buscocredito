import { Button, Card, CardBody, Chip, Tooltip } from "@heroui/react";
import { CheckCircle2, Building2, Info } from "lucide-react";
import { Offer } from "@/types/dashboard";

interface OfferCardProps {
  offer: Offer;
  index: number;
  acceptedOfferId: string | null;
  onAcceptOffer: (offer: Offer, index: number) => void;
}

const DetailRow = ({ label, value, tooltip }: { label: string; value: string; tooltip?: string }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-500">{label}</span>
      {tooltip && (
        <Tooltip content={tooltip} placement="top" className="max-w-xs">
          <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
        </Tooltip>
      )}
    </div>
    <span className="text-xs font-semibold text-gray-800">{value}</span>
  </div>
);

export const OfferCard = ({
  offer,
  index,
  acceptedOfferId,
  onAcceptOffer,
}: OfferCardProps) => {
  const isAccepted = acceptedOfferId === offer.id;

  return (
    <Card
      className={`w-full border overflow-hidden ${
        isAccepted ? "border-green-400" : "border-gray-200"
      } hover:shadow-md transition-shadow duration-200`}
    >
      {/* Accent bar */}
      <div className={`h-0.5 ${isAccepted ? "bg-green-500" : "bg-[#0e3a45]"}`} />

      <CardBody className="p-5">
        {/* Lender header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#0e3a45]/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-[#0e3a45]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">{offer.lender_name}</h4>
              <p className="text-[11px] text-gray-400">Institución financiera</p>
            </div>
          </div>
          {isAccepted && (
            <Chip color="success" variant="flat" size="sm" className="text-[11px] h-5">
              Aceptada
            </Chip>
          )}
        </div>

        {/* Payment summary */}
        <div className={`rounded-xl p-4 mb-4 ${isAccepted ? "bg-green-50 border border-green-200" : "bg-[#0e3a45]/5 border border-[#0e3a45]/10"}`}>
          <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">Pago periódico</p>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold ${isAccepted ? "text-green-700" : "text-[#0e3a45]"}`}>
              ${offer.amortization?.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 capitalize">
              / {offer.amortizationFrequency}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            durante <span className="font-semibold">{offer.deadline} meses</span>
          </p>
        </div>

        {/* Detail rows */}
        <div className="mb-4">
          <DetailRow
            label="Monto del préstamo"
            value={`$${offer.amount?.toLocaleString()}`}
          />
          <DetailRow
            label="Tasa de interés"
            value={`${offer.interestRate}% anual`}
          />
          <DetailRow
            label="Plazo"
            value={`${offer.deadline} meses`}
          />
          <DetailRow
            label="Frecuencia de pago"
            value={offer.amortizationFrequency}
          />
          {offer.comision != null && offer.comision > 0 && (
            <DetailRow
              label="Comisión por apertura"
              value={`$${offer.comision.toLocaleString()}`}
            />
          )}
          {offer.medicalBalance != null && offer.medicalBalance > 0 && (
            <DetailRow
              label="Seguro de vida saldo deudor"
              value={`$${offer.medicalBalance?.toLocaleString()}`}
              tooltip="Seguro que cubre el adeudo en caso de una situación fatal"
            />
          )}
          {offer.requestInfo?.type && (
            <DetailRow label="Tipo de préstamo" value={offer.requestInfo.type} />
          )}
          {offer.requestInfo?.purpose && (
            <DetailRow label="Propósito" value={offer.requestInfo.purpose} />
          )}
        </div>

        {/* Action */}
        {isAccepted ? (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-xs text-green-700 font-medium">
              Propuesta aceptada. El prestamista se pondrá en contacto contigo.
            </p>
          </div>
        ) : (
          <Button
            size="sm"
            className="w-full bg-[#0e3a45] hover:opacity-90 text-white font-semibold"
            onPress={() => onAcceptOffer(offer, index)}
            startContent={<CheckCircle2 className="w-4 h-4" />}
          >
            Aceptar Propuesta
          </Button>
        )}
      </CardBody>
    </Card>
  );
};
