import React from "react";
import { Input, Select, SelectItem, Button, Card } from "@nextui-org/react";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Building2,
  Target,
  DollarSign,
  Calendar,
  CreditCard,
} from "lucide-react";
import type { LenderFilters as LenderFiltersType } from "@/app/lender/types/loan.types";

interface LenderFiltersProps {
  filters: LenderFiltersType;
  onFilterChange: (key: keyof LenderFiltersType, value: string) => void;
  onClearFilters: () => void;
}

const LenderFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
}: LenderFiltersProps) => {
  return (
    <Card className="mb-6 p-4 shadow-sm border border-gray-100">
      <div className="space-y-4">
        {/* Primera fila: Búsqueda y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="text"
            placeholder="Buscar por monto, términos, propósito..."
            startContent={<Search className="w-4 h-4 text-gray-400" />}
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            classNames={{
              inputWrapper: "bg-white border-gray-200 border-2",
            }}
          />

          <div className="relative">
            <Select
              placeholder="Estado"
              selectedKeys={filters.state ? [filters.state] : []}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0] as string;
                onFilterChange("state", selectedKey || "");
              }}
              startContent={<MapPin className="w-4 h-4 text-gray-400" />}
              classNames={{
                trigger: "bg-white border-gray-200 border-2",
              }}
            >
              <SelectItem key="">Todos los estados</SelectItem>
              <SelectItem key="Aguascalientes">Aguascalientes</SelectItem>
              <SelectItem key="Baja California">Baja California</SelectItem>
              <SelectItem key="Baja California Sur">
                Baja California Sur
              </SelectItem>
              <SelectItem key="Campeche">Campeche</SelectItem>
              <SelectItem key="Chiapas">Chiapas</SelectItem>
              <SelectItem key="Chihuahua">Chihuahua</SelectItem>
              <SelectItem key="Coahuila">Coahuila</SelectItem>
              <SelectItem key="Colima">Colima</SelectItem>
              <SelectItem key="Durango">Durango</SelectItem>
              <SelectItem key="Estado de México">Estado de México</SelectItem>
              <SelectItem key="Guanajuato">Guanajuato</SelectItem>
              <SelectItem key="Guerrero">Guerrero</SelectItem>
              <SelectItem key="Hidalgo">Hidalgo</SelectItem>
              <SelectItem key="Jalisco">Jalisco</SelectItem>
              <SelectItem key="Michoacán">Michoacán</SelectItem>
              <SelectItem key="Morelos">Morelos</SelectItem>
              <SelectItem key="Nayarit">Nayarit</SelectItem>
              <SelectItem key="Nuevo León">Nuevo León</SelectItem>
              <SelectItem key="Oaxaca">Oaxaca</SelectItem>
              <SelectItem key="Puebla">Puebla</SelectItem>
              <SelectItem key="Querétaro">Querétaro</SelectItem>
              <SelectItem key="Quintana Roo">Quintana Roo</SelectItem>
              <SelectItem key="San Luis Potosí">San Luis Potosí</SelectItem>
              <SelectItem key="Sinaloa">Sinaloa</SelectItem>
              <SelectItem key="Sonora">Sonora</SelectItem>
              <SelectItem key="Tabasco">Tabasco</SelectItem>
              <SelectItem key="Tamaulipas">Tamaulipas</SelectItem>
              <SelectItem key="Tlaxcala">Tlaxcala</SelectItem>
              <SelectItem key="Veracruz">Veracruz</SelectItem>
              <SelectItem key="Yucatán">Yucatán</SelectItem>
              <SelectItem key="Zacatecas">Zacatecas</SelectItem>
              <SelectItem key="Ciudad de México">Ciudad de México</SelectItem>
            </Select>
            {/* Flechita personalizada más visible */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-800 font-bold"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 9l6 6 6-6"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Segunda fila: Ciudad y Propósito */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="text"
            placeholder="Ciudad"
            startContent={<Building2 className="w-4 h-4 text-gray-400" />}
            value={filters.city}
            onChange={(e) => onFilterChange("city", e.target.value)}
            classNames={{
              inputWrapper: "bg-white border-gray-200 border-2",
            }}
          />

          <div className="relative">
            <Select
              placeholder="Propósito"
              selectedKeys={filters.purpose ? [filters.purpose] : []}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0] as string;
                onFilterChange("purpose", selectedKey || "all");
              }}
              startContent={<Target className="w-4 h-4 text-gray-400" />}
              classNames={{
                trigger: "bg-white border-gray-200 border-2",
              }}
            >
              <SelectItem key="all">Todos los propósitos</SelectItem>
              <SelectItem key="Personal">Personal</SelectItem>
              <SelectItem key="Negocio">Negocio</SelectItem>
            </Select>
            {/* Flechita personalizada más visible */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-800 font-bold"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 9l6 6 6-6"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Tercera fila: Tipo y Botón de limpiar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Select
              placeholder="Tipo de crédito"
              selectedKeys={filters.type ? [filters.type] : []}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0] as string;
                onFilterChange("type", selectedKey || "all");
              }}
              startContent={<CreditCard className="w-4 h-4 text-gray-400" />}
              classNames={{
                trigger: "bg-white border-gray-200 border-2",
              }}
            >
              <SelectItem key="all">Todos los tipos</SelectItem>
              <SelectItem key="consumo">Crédito al consumo</SelectItem>
              <SelectItem key="deudas">Liquidación deudas</SelectItem>
              <SelectItem key="capital">Capital de trabajo</SelectItem>
              <SelectItem key="maquinaria">
                Adquisición de maquinaria o equipo
              </SelectItem>
            </Select>
            {/* Flechita personalizada más visible */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-800 font-bold"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 9l6 6 6-6"
                />
              </svg>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Limpiar filtros
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default LenderFilters;
