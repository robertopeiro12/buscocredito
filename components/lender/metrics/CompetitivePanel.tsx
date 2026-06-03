'use client';
import type { CompetitiveData } from '@/app/lender/types/metrics.types';

const MIN_SAMPLE = 3;

function formatRate(diff: number): string {
  return `${diff > 0 ? '+' : ''}${diff}%`;
}

function formatAmount(diff: number): string {
  const abs = Math.abs(diff).toLocaleString('es-MX');
  return diff >= 0 ? `+$${abs}` : `-$${abs}`;
}

function formatTerm(diff: number): string {
  return `${diff > 0 ? '+' : ''}${diff} meses`;
}

interface MetricItemProps {
  label: string;
  formatted: string;
  description: string;
  colorClass: string;
  hasDivider?: boolean;
}

function MetricItem({ label, formatted, description, colorClass, hasDivider }: MetricItemProps) {
  return (
    <div className={`text-center ${hasDivider ? 'md:pl-8 md:border-l md:border-white/10' : ''}`}>
      <p className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-3">{label}</p>
      <p className={`text-4xl font-bold tabular-nums mb-2 ${colorClass}`}>{formatted}</p>
      <p className="text-white/50 text-xs">{description}</p>
    </div>
  );
}

interface CompetitivePanelProps {
  data: CompetitiveData | null;
}

export function CompetitivePanel({ data }: CompetitivePanelProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#0e3a45',
        backgroundImage:
          'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h3 className="text-white font-bold text-lg">Inteligencia Competitiva</h3>
            <p className="text-white/50 text-sm mt-1">
              Cómo se comparan tus propuestas rechazadas con las ganadoras
            </p>
          </div>
          {data && data.sampleSize > 0 && (
            <span className="text-white/40 text-xs font-medium bg-white/10 px-3 py-1 rounded-full whitespace-nowrap">
              {data.sampleSize} {data.sampleSize === 1 ? 'caso' : 'casos'}
            </span>
          )}
        </div>

        {!data || data.sampleSize < MIN_SAMPLE ? (
          <div className="text-center py-8">
            <p className="text-white/60 text-sm">
              Necesitas al menos {MIN_SAMPLE} propuestas rechazadas en este período para ver patrones.
            </p>
            {data && (
              <p className="text-white/40 text-xs mt-2">
                Tienes {data.sampleSize} {data.sampleSize === 1 ? 'caso' : 'casos'} hasta ahora.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <MetricItem
              label="Tasa de interés"
              formatted={formatRate(data.avgRateDiff)}
              description={
                data.avgRateDiff > 0
                  ? 'más alta que la oferta ganadora'
                  : data.avgRateDiff < 0
                  ? 'más baja que la oferta ganadora'
                  : 'igual que la oferta ganadora'
              }
              colorClass={
                data.avgRateDiff > 0
                  ? 'text-red-300'
                  : data.avgRateDiff < 0
                  ? 'text-green-300'
                  : 'text-white'
              }
            />
            <MetricItem
              label="Monto ofrecido"
              formatted={formatAmount(data.avgAmountDiff)}
              description="diferencia promedio de monto"
              colorClass="text-white"
              hasDivider
            />
            <MetricItem
              label="Plazo"
              formatted={formatTerm(data.avgTermDiff)}
              description="diferencia promedio de plazo"
              colorClass="text-white"
              hasDivider
            />
          </div>
        )}
      </div>
    </div>
  );
}
