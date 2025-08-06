import React from 'react';
import {
  Input,
  Select,
  SelectItem,
  Button,
  Card,
} from "@nextui-org/react";
import {
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { LenderFilters as LenderFiltersType } from '@/app/lender/types/loan.types';

interface LenderFiltersProps {
  filters: LenderFiltersType;
  onFilterChange: (key: keyof LenderFiltersType, value: string) => void;
  onClearFilters: () => void;
}

const LenderFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters 
}: LenderFiltersProps) => {
  return (
    <Card className="mb-6 p-4 shadow-sm border border-gray-100">
      <div className="flex flex-wrap gap-4">
        <Input
          type="text"
          placeholder="Buscar por monto o plazo..."
          startContent={
            <Search className="w-4 h-4 text-gray-400" />
          }
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="w-full md:w-72"
          classNames={{
            inputWrapper: "bg-white border-gray-200",
          }}
        />
        
        <Select
          placeholder="Monto"
          size="sm"
          selectedKeys={[filters.amount]}
          onChange={(e) => onFilterChange('amount', e.target.value)}
          className="w-full md:w-48"
          classNames={{
            trigger: "bg-white border-gray-200",
          }}
        >
          <SelectItem key="all">Todos los montos</SelectItem>
          <SelectItem key="0-50000">Hasta $50,000</SelectItem>
          <SelectItem key="50000-100000">$50,000 - $100,000</SelectItem>
          <SelectItem key="100000+">Más de $100,000</SelectItem>
        </Select>
        
        <Select
          placeholder="Plazo"
          size="sm"
          selectedKeys={[filters.term]}
          onChange={(e) => onFilterChange('term', e.target.value)}
          className="w-full md:w-48"
          classNames={{
            trigger: "bg-white border-gray-200",
          }}
        >
          <SelectItem key="all">Todos los plazos</SelectItem>
          <SelectItem key="1-12">1-12 meses</SelectItem>
          <SelectItem key="13-24">13-24 meses</SelectItem>
          <SelectItem key="25+">Más de 24 meses</SelectItem>
        </Select>
        
        <Button
          variant="flat"
          startContent={<SlidersHorizontal className="w-4 h-4" />}
          onClick={onClearFilters}
          className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          Limpiar filtros
        </Button>
      </div>
    </Card>
  );
};

export default LenderFilters;
