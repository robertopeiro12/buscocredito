import React from "react";
import { Input, Select, SelectItem, Button, Card } from "@heroui/react";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Building2,
  Target,
  CreditCard,
  DollarSign,
  X,
} from "lucide-react";
import type { LenderFilters as LenderFiltersType } from "@/app/lender/types/loan.types";

interface LenderFiltersProps {
  filters: LenderFiltersType;
  onFilterChange: (key: keyof LenderFiltersType, value: string) => void;
  onClearFilters: () => void;
}

const inputClasses = {
  inputWrapper:
    "bg-white border border-[#0e3a45]/20 hover:border-[#0e3a45]/40 group-data-[focus=true]:border-[#0e3a45] shadow-none",
};

const selectClasses = {
  trigger:
    "bg-white border border-[#0e3a45]/20 hover:border-[#0e3a45]/40 data-[open=true]:border-[#0e3a45] shadow-none",
};

const LenderFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
}: LenderFiltersProps) => {
  const activeCount = [
    filters.search,
    filters.state,
    filters.city,
    filters.purpose !== "all" ? filters.purpose : "",
    filters.type !== "all" ? filters.type : "",
    filters.amountRange !== "all" ? filters.amountRange : "",
  ].filter(Boolean).length;

  return (
    <Card className="mb-6 shadow-sm border border-[#0e3a45]/10 overflow-hidden">
      <div className="h-1 bg-green-500 w-full" />
      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#0e3a45]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#0e3a45]">
              Filtros
            </span>
            {activeCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0e3a45] text-white text-[10px] font-bold">
                {activeCount}
              </span>
            )}
          </div>
          {activeCount > 0 && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 text-xs text-[#0e3a45]/70 hover:text-[#0e3a45] transition-colors"
            >
              <X className="w-3 h-3" />
              Limpiar
            </button>
          )}
        </div>

        {/* Primera fila: Búsqueda + Estado + Ciudad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Input
            size="sm"
            type="text"
            placeholder="Buscar por monto, propósito..."
            startContent={<Search className="w-4 h-4 text-[#0e3a45]/60" />}
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            classNames={inputClasses}
          />

          <Select
            size="sm"
            placeholder="Estado"
            selectedKeys={filters.state ? [filters.state] : []}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string;
              onFilterChange("state", selectedKey || "");
            }}
            startContent={<MapPin className="w-4 h-4 text-[#0e3a45]/60" />}
            classNames={selectClasses}
          >
            <SelectItem key="">Todos los estados</SelectItem>
            <SelectItem key="Aguascalientes">Aguascalientes</SelectItem>
            <SelectItem key="Baja California">Baja California</SelectItem>
            <SelectItem key="Baja California Sur">Baja California Sur</SelectItem>
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

          <Input
            size="sm"
            type="text"
            placeholder="Ciudad"
            startContent={<Building2 className="w-4 h-4 text-[#0e3a45]/60" />}
            value={filters.city}
            onChange={(e) => onFilterChange("city", e.target.value)}
            classNames={inputClasses}
          />
        </div>

        {/* Segunda fila: Propósito + Tipo + Rango de monto */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            size="sm"
            placeholder="Propósito"
            selectedKeys={filters.purpose ? [filters.purpose] : []}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string;
              onFilterChange("purpose", selectedKey || "all");
            }}
            startContent={<Target className="w-4 h-4 text-[#0e3a45]/60" />}
            classNames={selectClasses}
          >
            <SelectItem key="all">Todos los propósitos</SelectItem>
            <SelectItem key="Personal">Personal</SelectItem>
            <SelectItem key="Negocio">Negocio</SelectItem>
          </Select>

          <Select
            size="sm"
            placeholder="Tipo de crédito"
            selectedKeys={filters.type ? [filters.type] : []}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string;
              onFilterChange("type", selectedKey || "all");
            }}
            startContent={<CreditCard className="w-4 h-4 text-[#0e3a45]/60" />}
            classNames={selectClasses}
          >
            <SelectItem key="all">Todos los tipos</SelectItem>
            <SelectItem key="consumo">Crédito al consumo</SelectItem>
            <SelectItem key="deudas">Liquidación deudas</SelectItem>
            <SelectItem key="capital">Capital de trabajo</SelectItem>
            <SelectItem key="maquinaria">Maquinaria o equipo</SelectItem>
          </Select>

          <Select
            size="sm"
            placeholder="Rango de monto"
            selectedKeys={filters.amountRange ? [filters.amountRange] : []}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string;
              onFilterChange("amountRange", selectedKey || "all");
            }}
            startContent={<DollarSign className="w-4 h-4 text-[#0e3a45]/60" />}
            classNames={selectClasses}
          >
            <SelectItem key="all">Todos los montos</SelectItem>
            <SelectItem key="0-50000">$0 - $50,000</SelectItem>
            <SelectItem key="50000-100000">$50,000 - $100,000</SelectItem>
            <SelectItem key="100000-250000">$100,000 - $250,000</SelectItem>
            <SelectItem key="250000-500000">$250,000 - $500,000</SelectItem>
            <SelectItem key="500000+">$500,000+</SelectItem>
          </Select>
        </div>
      </div>
    </Card>
  );
};

export default LenderFilters;
