import { Card, CardBody } from "@nextui-org/react";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface ProfessionalMetricsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  chart?: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
  children?: ReactNode;
}

const variantStyles = {
  primary: {
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    iconColor: "text-white",
    accentColor: "text-blue-600",
    trendPositive: "text-emerald-600 bg-emerald-50",
    trendNegative: "text-red-600 bg-red-50",
    borderAccent: "border-blue-200"
  },
  secondary: {
    iconBg: "bg-gradient-to-br from-slate-500 to-slate-600",
    iconColor: "text-white",
    accentColor: "text-slate-600",
    trendPositive: "text-emerald-600 bg-emerald-50",
    trendNegative: "text-red-600 bg-red-50",
    borderAccent: "border-slate-200"
  },
  success: {
    iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    iconColor: "text-white",
    accentColor: "text-emerald-600",
    trendPositive: "text-emerald-600 bg-emerald-50",
    trendNegative: "text-red-600 bg-red-50",
    borderAccent: "border-emerald-200"
  },
  warning: {
    iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
    iconColor: "text-white",
    accentColor: "text-amber-600",
    trendPositive: "text-emerald-600 bg-emerald-50",
    trendNegative: "text-red-600 bg-red-50",
    borderAccent: "border-amber-200"
  },
  info: {
    iconBg: "bg-gradient-to-br from-cyan-500 to-cyan-600",
    iconColor: "text-white",
    accentColor: "text-cyan-600",
    trendPositive: "text-emerald-600 bg-emerald-50",
    trendNegative: "text-red-600 bg-red-50",
    borderAccent: "border-cyan-200"
  }
};

export const ProfessionalMetricsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  chart,
  variant = 'primary',
  children
}: ProfessionalMetricsCardProps) => {
  const styles = variantStyles[variant];

  return (
    <Card className={`
      bg-white border ${styles.borderAccent} shadow-sm hover:shadow-lg 
      transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden
    `}>
      <CardBody className="p-0">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={`
                  p-2.5 rounded-xl ${styles.iconBg} shadow-sm 
                  group-hover:scale-110 transition-transform duration-300
                `}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 leading-tight">{title}</h3>
                  {subtitle && (
                    <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className={`text-3xl font-bold ${styles.accentColor} leading-none tracking-tight`}>
                  {value}
                </div>
                
                {trend && (
                  <div className={`
                    inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                    ${trend.isPositive !== false ? styles.trendPositive : styles.trendNegative}
                  `}>
                    <svg 
                      className={`w-3 h-3 ${trend.isPositive !== false ? 'rotate-0' : 'rotate-180'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    <span>
                      {trend.isPositive !== false ? '+' : ''}{trend.value}% {trend.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        {(chart || children) && (
          <div className="p-6 bg-gradient-to-br from-gray-50/30 to-white">
            <div className="h-40 flex items-center justify-center">
              {chart || children}
            </div>
          </div>
        )}

        {/* Decorative accent line */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${styles.iconBg}`}></div>
      </CardBody>
    </Card>
  );
};
