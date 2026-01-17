import { Card, CardBody } from "@heroui/react";
import { ReactNode } from "react";

interface MetricsCardProps {
  title: string;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
  children: ReactNode;
}

export const MetricsCard = ({
  title,
  gradientFrom,
  gradientTo,
  textColor,
  children,
}: MetricsCardProps) => {
  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-xl overflow-hidden border-0 group">
      <CardBody className="p-0">
        <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} p-6 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <h3 className={`text-lg font-semibold ${textColor} relative z-10 flex items-center gap-2`}>
            <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
            {title}
          </h3>
        </div>
        <div className="h-64 flex flex-col justify-center items-center p-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent"></div>
          <div className="relative z-10 w-full h-full flex flex-col justify-center items-center">
            {children}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
