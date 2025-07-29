import { Card, CardBody } from "@nextui-org/react";
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
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl overflow-hidden border border-gray-100">
      <CardBody className="p-0">
        <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} p-4 border-b border-gray-100`}>
          <h3 className={`text-lg font-semibold ${textColor}`}>
            {title}
          </h3>
        </div>
        <div className="h-64 flex flex-col justify-center items-center p-6">
          {children}
        </div>
      </CardBody>
    </Card>
  );
};
