'use client';
import '@/lib/chart-config';
import { Line } from 'react-chartjs-2';
import type { ProposalTrend } from '@/app/lender/types/metrics.types';

interface ProposalTrendChartProps {
  data: ProposalTrend[];
}

export function ProposalTrendChart({ data }: ProposalTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        Sin propuestas en este período
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        label: 'Propuestas',
        data: data.map(d => d.count),
        borderColor: '#0e3a45',
        backgroundColor: 'rgba(14,58,69,0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#0e3a45',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number } }) =>
            ` ${ctx.parsed.y} propuesta${ctx.parsed.y !== 1 ? 's' : ''}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { stepSize: 1, precision: 0 },
      },
    },
    animation: { duration: 600 },
  };

  return (
    <div className="h-48">
      <Line data={chartData} options={options as any} />
    </div>
  );
}
