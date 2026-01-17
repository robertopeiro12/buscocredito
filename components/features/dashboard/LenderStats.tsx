import { Card, CardBody } from "@heroui/react";
import { 
  TrendingUp, 
  FileText, 
  CheckCircle, 
  Clock,
  DollarSign,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import type { LenderProposal, LoanRequest } from '@/app/lender/types/loan.types';

interface LenderStatsProps {
  requests: any[];
  proposals: any[];
  detailed?: boolean;
}

export const LenderStats = ({ requests, proposals, detailed = false }: LenderStatsProps) => {
  const totalProposals = proposals.length;
  const acceptedProposals = proposals.filter(p => p.status === "accepted").length;
  const pendingProposals = proposals.filter(p => p.status === "pending").length;
  const totalRequestsValue = requests.reduce((sum, req) => sum + req.amount, 0);
  const acceptanceRate = totalProposals > 0 ? (acceptedProposals / totalProposals * 100) : 0;

  const stats = [
    {
      title: "Solicitudes Disponibles",
      value: requests.length.toString(),
      icon: Users,
      color: "blue",
      description: "Nuevas oportunidades",
    },
    {
      title: "Mis Propuestas",
      value: totalProposals.toString(),
      icon: FileText,
      color: "green",
      description: "Ofertas enviadas",
    },
    {
      title: "Propuestas Aceptadas",
      value: acceptedProposals.toString(),
      icon: CheckCircle,
      color: "emerald",
      description: `${acceptanceRate.toFixed(1)}% tasa de éxito`,
    },
    {
      title: "Valor del Mercado",
      value: `$${(totalRequestsValue / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: "purple",
      description: "Total disponible",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div 
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${detailed ? 'mb-8' : 'mb-6'}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => (
        <motion.div key={stat.title} variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardBody className={detailed ? "p-6" : "p-4"}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className={`font-bold text-gray-900 mb-1 ${detailed ? 'text-3xl' : 'text-2xl'}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stat.description}
                  </p>
                </div>
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${stat.color === 'blue' && 'bg-blue-100'}
                  ${stat.color === 'green' && 'bg-green-100'}
                  ${stat.color === 'emerald' && 'bg-emerald-100'}
                  ${stat.color === 'purple' && 'bg-purple-100'}
                `}>
                  <stat.icon className={`
                    w-6 h-6
                    ${stat.color === 'blue' && 'text-blue-600'}
                    ${stat.color === 'green' && 'text-green-600'}
                    ${stat.color === 'emerald' && 'text-emerald-600'}
                    ${stat.color === 'purple' && 'text-purple-600'}
                  `} />
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};
