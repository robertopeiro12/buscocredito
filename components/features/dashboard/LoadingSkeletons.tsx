import { Card, CardBody } from "@nextui-org/react";

export const InitialLoadingSkeleton = () => (
  <div className="flex-1 flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md p-4">
      <div className="h-8 bg-gray-200 rounded-md animate-pulse w-3/4 mx-auto" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={`initial-loading-${i}`}
            className="bg-white rounded-lg shadow-md p-6 animate-pulse"
          >
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const LoanCardsSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3].map((i) => (
      <Card key={`loans-loading-${i}`} className="bg-white">
        <CardBody className="p-6">
          <div className="space-y-4 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-20" />
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
            <div className="pt-4">
              <div className="h-2 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </CardBody>
      </Card>
    ))}
  </div>
);

export const SettingsLoadingSkeleton = () => (
  <Card className="bg-white max-w-4xl mx-auto">
    <CardBody className="p-6">
      <div className="flex items-center gap-6 mb-6">
        <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse" />
        <div className="space-y-3 flex-1">
          <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>
      </div>
      <div className="space-y-8">
        <div>
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={`settings-loading-${i}`} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardBody>
  </Card>
);

export const AuthLoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Verificando permisos de usuario...</p>
    </div>
  </div>
);
