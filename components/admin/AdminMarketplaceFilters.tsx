import React from "react";
import {
  Card,
  CardBody,
  Select,
  SelectItem,
  Button,
  Input,
} from "@heroui/react";
import { Search, Filter, X } from "lucide-react";

interface AdminMarketplaceFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  amountRangeFilter: string;
  setAmountRangeFilter: (range: string) => void;
  termFilter: string;
  setTermFilter: (term: string) => void;
  onClearFilters: () => void;
}

const AdminMarketplaceFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  amountRangeFilter,
  setAmountRangeFilter,
  termFilter,
  setTermFilter,
  onClearFilters,
}: AdminMarketplaceFiltersProps) => {
  const statusOptions = [
    { key: "all", label: "Todos los estados" },
    { key: "active", label: "Activas" },
    { key: "pending", label: "Pendientes" },
    { key: "completed", label: "Completadas" },
  ];

  const amountRangeOptions = [
    { key: "all", label: "Todos los montos" },
    { key: "0-50000", label: "$0 - $50,000" },
    { key: "50000-100000", label: "$50,000 - $100,000" },
    { key: "100000-250000", label: "$100,000 - $250,000" },
    { key: "250000-500000", label: "$250,000 - $500,000" },
    { key: "500000+", label: "Más de $500,000" },
  ];

  const termOptions = [
    { key: "all", label: "Todos los plazos" },
    { key: "6 meses", label: "6 meses" },
    { key: "12 meses", label: "12 meses" },
    { key: "18 meses", label: "18 meses" },
    { key: "24 meses", label: "24 meses" },
    { key: "36 meses", label: "36 meses" },
    { key: "48 meses", label: "48 meses" },
    { key: "60 meses", label: "60 meses" },
  ];

  const hasActiveFilters =
    searchTerm ||
    statusFilter !== "all" ||
    amountRangeFilter !== "all" ||
    termFilter !== "all";

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardBody className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar por ID, propósito o tipo..."
              startContent={<Search className="text-gray-400 w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 lg:w-auto">
            <Select
              placeholder="Estado"
              selectedKeys={[statusFilter]}
              onSelectionChange={(keys) =>
                setStatusFilter(Array.from(keys)[0] as string)
              }
              className="w-full sm:w-40"
              size="sm"
              startContent={<Filter className="w-4 h-4 text-gray-400" />}
              classNames={{
                trigger: "bg-white border-gray-200 border-2",
                selectorIcon: "text-gray-700 text-lg font-bold",
              }}
            >
              {statusOptions.map((option) => (
                <SelectItem key={option.key} value={option.key}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>

            <Select
              placeholder="Monto"
              selectedKeys={[amountRangeFilter]}
              onSelectionChange={(keys) =>
                setAmountRangeFilter(Array.from(keys)[0] as string)
              }
              className="w-full sm:w-48"
              size="sm"
              classNames={{
                trigger: "bg-white border-gray-200 border-2",
                selectorIcon: "text-gray-700 text-lg font-bold",
              }}
            >
              {amountRangeOptions.map((option) => (
                <SelectItem key={option.key} value={option.key}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>

            <Select
              placeholder="Plazo"
              selectedKeys={[termFilter]}
              onSelectionChange={(keys) =>
                setTermFilter(Array.from(keys)[0] as string)
              }
              className="w-full sm:w-36"
              size="sm"
              classNames={{
                trigger: "bg-white border-gray-200 border-2",
                selectorIcon: "text-gray-700 text-lg font-bold",
              }}
            >
              {termOptions.map((option) => (
                <SelectItem key={option.key} value={option.key}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>

            {hasActiveFilters && (
              <Button
                variant="light"
                size="sm"
                onPress={onClearFilters}
                startContent={<X className="w-4 h-4" />}
                className="text-gray-600 hover:text-red-600"
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default AdminMarketplaceFilters;
