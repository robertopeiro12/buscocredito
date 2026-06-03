'use client';
import '@/lib/chart-config';
import { Bar } from 'react-chartjs-2';
import type { PurposeBreakdown } from '@/app/lender/types/metrics.types';

interface ProposalBreakdownChartProps {
  data: PurposeBreakdown[];
}

export function ProposalBreakdownChart({ data }: ProposalBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        Sin propuestas en este período
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => d.purpose),
    datasets: [
      {
        label: 'Aceptadas',
        data: data.map(d => d.accepted),
        backgroundColor: '#22c55e',
        borderRadius: 3,
      },
      {
        label: 'Pendientes',
        data: data.map(d => d.pending),
        backgroundColor: '#0e3a45',
        borderRadius: 3,
      },
      {
        label: 'Rechazadas',
        data: data.map(d => d.rejected),
        backgroundColor: '#94a3b8',
        borderRadius: 3,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { boxWidth: 10, font: { size: 11 }, padding: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label: string }; parsed: { x: number } }) =>
            ` ${ctx.dataset.label}: ${ctx.parsed.x}`,
        },
      },
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { stepSize: 1, precision: 0 } },
      y: { stacked: true, grid: { display: false } },
    },
    animation: { duration: 600 },
  };

  const height = Math.max(160, data.length * 52);

  return (
    <div style={{ height }}>
      <Bar data={chartData} options={options as any} />
    </div>
  );
}
