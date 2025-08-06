import { Card, CardBody, Skeleton } from "@nextui-org/react";

export const AdminLoadingSkeletons = {
  // Skeleton para la página principal
  SubaccountsGrid: () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="bg-white">
          <CardBody className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  ),

  // Skeleton para métricas
  MetricsCards: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="bg-white">
          <CardBody className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-16 w-32 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-32 w-full" />
          </CardBody>
        </Card>
      ))}
    </div>
  ),

  // Skeleton para configuración
  SettingsCard: () => (
    <Card className="bg-white max-w-4xl mx-auto">
      <CardBody className="p-6">
        <div className="flex items-center gap-6 mb-6">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-5 w-40" />
              </div>
              <div>
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-5 w-48" />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
      </CardBody>
    </Card>
  ),

  // Skeleton para centro de ayuda
  HelpCard: () => (
    <Card className="bg-white max-w-4xl mx-auto">
      <CardBody className="p-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Skeleton className="h-5 w-56 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
};
