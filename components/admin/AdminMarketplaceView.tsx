import React, { useState, useEffect, useMemo } from "react";
import { Card, CardBody, Spinner } from "@nextui-org/react";
import { Store, TrendingUp, Users, DollarSign } from "lucide-react";
import { useAdminLoans } from "@/hooks/useAdminLoans";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import type {
  LoanRequest,
  PublicUserData,
} from "@/types/entities/business.types";
import AdminLoanRequestCard from "./AdminLoanRequestCard";
import AdminMarketplaceFilters from "./AdminMarketplaceFilters";

// Extender el tipo para incluir campos adicionales
interface ExtendedPublicUserData extends PublicUserData {
  first_name?: string;
  last_name?: string;
  age?: number;
  location?: string;
}

interface AdminMarketplaceViewProps {
  // Props opcionales para futuras extensiones
}

const AdminMarketplaceView = ({}: AdminMarketplaceViewProps = {}) => {
  const [userDataMap, setUserDataMap] = useState<
    Record<string, ExtendedPublicUserData>
  >({});

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [amountRangeFilter, setAmountRangeFilter] = useState("all");
  const [termFilter, setTermFilter] = useState("all");

  // Obtener información del admin para pasar al hook
  const { adminData } = useAdminDashboard();

  // Usar hook específico para admin que puede obtener todas las solicitudes
  const {
    loans: loanRequests,
    loading: isLoading,
    fetchLoans: refreshLoans,
  } = useAdminLoans({
    status: "pending", // Solo solicitudes pendientes
    enableRealtime: true,
    adminCompany: adminData.Empresa, // Pasar la empresa del admin
  });

  // Cargar datos de usuarios para las solicitudes
  useEffect(() => {
    const loadUserData = async () => {
      const userIds = loanRequests
        .map((request) => request.userId)
        .filter(Boolean);
      const uniqueUserIds = Array.from(new Set(userIds));

      for (const userId of uniqueUserIds) {
        if (userId && !userDataMap[userId]) {
          try {
            const response = await fetch("/api/users/public-profile", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ userId }),
            });

            if (response.ok) {
              const data = await response.json();
              setUserDataMap((prev) => ({
                ...prev,
                [userId]: data.data || {},
              }));
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        }
      }
    };

    if (loanRequests.length > 0) {
      loadUserData();
    }
  }, [loanRequests, userDataMap]);

  // Filtrar solicitudes usando la misma lógica que el lender
  const filteredRequests = useMemo(() => {
    return loanRequests.filter((request) => {
      // Filtro de búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          request.id.toLowerCase().includes(searchLower) ||
          request.amount.toString().includes(searchLower) ||
          request.purpose?.toLowerCase().includes(searchLower) ||
          request.type.toLowerCase().includes(searchLower) ||
          request.term.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Filtro de estado - para admin, status se determina por la presencia de ofertas
      // Por simplicidad, consideramos todas como "activas" ya que son solicitudes pendientes
      if (statusFilter !== "all") {
        // Aquí podrías agregar lógica más específica basada en el estado real
        const requestStatus = "active"; // Por defecto, las solicitudes del marketplace están activas
        if (requestStatus !== statusFilter) {
          return false;
        }
      }

      // Filtro de monto
      if (amountRangeFilter !== "all") {
        const amount = request.amount;
        switch (amountRangeFilter) {
          case "0-50000":
            if (amount < 0 || amount > 50000) return false;
            break;
          case "50000-100000":
            if (amount < 50000 || amount > 100000) return false;
            break;
          case "100000-250000":
            if (amount < 100000 || amount > 250000) return false;
            break;
          case "250000-500000":
            if (amount < 250000 || amount > 500000) return false;
            break;
          case "500000+":
            if (amount < 500000) return false;
            break;
        }
      }

      // Filtro de plazo
      if (termFilter !== "all") {
        if (request.term !== termFilter) {
          return false;
        }
      }

      return true;
    });
  }, [loanRequests, searchTerm, statusFilter, amountRangeFilter, termFilter]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setAmountRangeFilter("all");
    setTermFilter("all");
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Filtros */}
      <AdminMarketplaceFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        amountRangeFilter={amountRangeFilter}
        setAmountRangeFilter={setAmountRangeFilter}
        termFilter={termFilter}
        setTermFilter={setTermFilter}
        onClearFilters={handleClearFilters}
      />

      {/* Lista de solicitudes */}
      {filteredRequests.length === 0 ? (
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardBody className="p-12 text-center">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No hay solicitudes que mostrar
            </h3>
            <p className="text-gray-500">
              {searchTerm ||
              statusFilter !== "all" ||
              amountRangeFilter !== "all" ||
              termFilter !== "all"
                ? "No se encontraron solicitudes que coincidan con los filtros aplicados."
                : "Aún no hay solicitudes de préstamos en el marketplace."}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request, index) => (
            <AdminLoanRequestCard
              key={request.id}
              request={request}
              userData={userDataMap[request.userId || ""]}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Información adicional */}
      <Card className="bg-gray-50 border border-gray-200">
        <CardBody className="p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Store className="w-4 h-4" />
            <p className="text-sm">
              <strong>Nota:</strong> Esta vista permite monitorear todas las
              solicitudes de préstamos en el marketplace. Como administrador,
              puedes ver toda la información pero no realizar ofertas.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminMarketplaceView;
