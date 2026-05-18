'use client';
import type { MetricsPeriod } from '@/app/lender/types/metrics.types';

const OPTIONS: { label: string; value: MetricsPeriod }[] = [
  { label: '30D', value: '30d' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: 'Todo', value: 'all' },
];

interface MetricsPeriodFilterProps {
  value: MetricsPeriod;
  onChange: (period: MetricsPeriod) => void;
}

export function MetricsPeriodFilter({ value, onChange }: MetricsPeriodFilterProps) {
  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all duration-150 ${
            value === opt.value
              ? 'bg-[#0e3a45] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
