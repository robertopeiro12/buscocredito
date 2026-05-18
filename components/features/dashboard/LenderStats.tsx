'use client';

import { Card, CardBody } from '@heroui/react';
import { FileText, CheckCircle, DollarSign, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LenderProposal, LoanRequest } from '@/app/lender/types/loan.types';
import type { KPITrends } from '@/app/lender/types/metrics.types';

interface LenderStatsProps {
  requests: LoanRequest[];
  proposals: LenderProposal[];
  detailed?: boolean;
  trends?: KPITrends;
}

function TrendBadge({ change }: { change: number | null }) {
  if (change === null) return null;
  const positive = change >= 0;
  return (
    <span
      className={`text-xs font-semibold tabular-nums ${
        positive ? 'text-green-600' : 'text-red-500'
      }`}
    >
      {positive ? '▲' : '▼'} {Math.abs(change)}%
    </span>
  );
}

export const LenderStats = ({
  requests,
  proposals,
  detailed = false,
  trends,
}: LenderStatsProps) => {
  const totalProposals = proposals.length;
  const acceptedProposals = proposals.filter(p => p.status === 'accepted').length;
  const totalRequestsValue = requests.reduce((sum, req) => sum + req.amount, 0);
  const acceptanceRate =
    totalProposals > 0 ? (acceptedProposals / totalProposals) * 100 : 0;

  const stats = [
    {
      title: 'Solicitudes Disponibles',
      value: requests.length.toString(),
      icon: Users,
      color: 'brand',
      description: 'Nuevas oportunidades',
      trend: null,
    },
    {
      title: 'Mis Propuestas',
      value: totalProposals.toString(),
      icon: FileText,
      color: 'green',
      description: 'Ofertas enviadas',
      trend: trends?.proposalsChange ?? null,
    },
    {
      title: 'Propuestas Aceptadas',
      value: acceptedProposals.toString(),
      icon: CheckCircle,
      color: 'emerald',
      description: `${acceptanceRate.toFixed(1)}% tasa de éxito`,
      trend: trends?.acceptedChange ?? null,
    },
    {
      title: 'Valor del Mercado',
      value: `$${(totalRequestsValue / 1_000_000).toFixed(1)}M`,
      icon: DollarSign,
      color: 'purple',
      description: 'Total disponible',
      trend: null,
    },
  ];

  const iconColorClass = (color: string) => {
    if (color === 'brand') return 'text-[#0e3a45]';
    if (color === 'green') return 'text-green-600';
    if (color === 'emerald') return 'text-emerald-600';
    return 'text-purple-600';
  };

  const iconBgClass = (color: string) => {
    if (color === 'brand') return 'bg-[#0e3a45]/[0.08]';
    if (color === 'green') return 'bg-green-100';
    if (color === 'emerald') return 'bg-emerald-100';
    return 'bg-purple-100';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${
        detailed ? 'mb-8' : 'mb-6'
      }`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map(stat => (
        <motion.div key={stat.title} variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardBody className={detailed ? 'p-6' : 'p-4'}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p
                    className={`font-bold text-gray-900 tabular-nums ${
                      detailed ? 'text-3xl' : 'text-2xl'
                    }`}
                  >
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">{stat.description}</p>
                    <TrendBadge change={stat.trend} />
                  </div>
                </div>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconBgClass(
                    stat.color
                  )}`}
                >
                  <stat.icon className={`w-6 h-6 ${iconColorClass(stat.color)}`} />
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};
