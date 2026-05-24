import { Card, CardBody } from "@heroui/react";
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

const variantAccent: Record<string, string> = {
  primary: "bg-[#0e3a45]",
  secondary: "bg-slate-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  info: "bg-indigo-500",
};

export const ProfessionalMetricsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  chart,
  variant = 'primary',
  children,
}: ProfessionalMetricsCardProps) => {
  const accent = variantAccent[variant];

  return (
    <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <CardBody className="p-0">
        <div className={`h-0.5 w-full ${accent}`} />

        <div className="px-6 pt-6 pb-5">
          <div className="w-9 h-9 rounded-xl bg-[#0e3a45]/[0.07] flex items-center justify-center mb-4">
            <Icon className="w-4 h-4 text-[#0e3a45]" />
          </div>

          <p className="text-sm font-semibold text-gray-700 mb-0.5">{title}</p>
          {subtitle && (
            <p className="text-[11px] text-gray-400 mb-3">{subtitle}</p>
          )}
          <p className="text-4xl font-bold text-[#0e3a45] leading-none tracking-tight mt-2">
            {value}
          </p>
          {trend && (
            <div className={`inline-flex items-center gap-1 mt-2 text-[11px] font-medium ${trend.isPositive !== false ? "text-emerald-600" : "text-red-500"}`}>
              <span>{trend.isPositive !== false ? "↑" : "↓"}</span>
              <span>{trend.value > 0 ? "+" : ""}{trend.value}%</span>
              <span className="text-gray-400">{trend.label}</span>
            </div>
          )}
        </div>

        {(chart || children) && (
          <>
            <div className="h-px bg-gray-50 mx-6" />
            <div className="px-6 py-5">
              <div className="h-44">
                {chart || children}
              </div>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};
