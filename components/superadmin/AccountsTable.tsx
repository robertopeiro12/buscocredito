"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
} from "@heroui/react";
import { Search, Filter, UserX, UserCheck, Trash2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import type { AccountInfo } from "@/types/superadmin";

interface AccountsTableProps {
  accounts: AccountInfo[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: "all" | "superAdmin" | "companyAdmin" | "lender" | "borrower";
  setFilterType: (type: "all" | "superAdmin" | "companyAdmin" | "lender" | "borrower") => void;
  filterStatus: "all" | "active" | "disabled";
  setFilterStatus: (status: "all" | "active" | "disabled") => void;
  onViewAccount: (account: AccountInfo) => void;
  onActivate: (account: AccountInfo) => void;
  onDeactivate: (account: AccountInfo) => void;
  onDelete: (account: AccountInfo) => void;
  onRefresh: () => void;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  superAdmin:   { label: "Super Admin",   color: "text-[#0e3a45] font-medium" },
  companyAdmin: { label: "Admin Empresa", color: "text-gray-700 font-medium" },
  lender:       { label: "Prestamista",   color: "text-green-700 font-medium" },
  borrower:     { label: "Solicitante",   color: "text-gray-500" },
};

export function AccountsTable({
  accounts,
  isLoading,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  onViewAccount,
  onActivate,
  onDeactivate,
  onDelete,
  onRefresh,
}: AccountsTableProps) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [searchTerm, filterType, filterStatus]);

  const pages = Math.ceil(accounts.length / rowsPerPage);

  const paginatedAccounts = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return accounts.slice(start, start + rowsPerPage);
  }, [accounts, page]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="h-10 bg-gray-200 rounded w-64 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        <div className="h-96 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder="Buscar por email, nombre o empresa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          startContent={<Search className="w-4 h-4 text-gray-400" />}
          className="w-80"
          size="sm"
        />
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" size="sm" startContent={<Filter className="w-4 h-4" />}>
              Tipo: {filterType === "all" ? "Todos" : typeLabels[filterType]?.label}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Filtro por tipo"
            selectionMode="single"
            selectedKeys={new Set([filterType])}
            onSelectionChange={(keys) => setFilterType(Array.from(keys)[0] as typeof filterType)}
          >
            <DropdownItem key="all">Todos</DropdownItem>
            <DropdownItem key="superAdmin">Super Admin</DropdownItem>
            <DropdownItem key="companyAdmin">Admin Empresa</DropdownItem>
            <DropdownItem key="lender">Prestamista</DropdownItem>
            <DropdownItem key="borrower">Solicitante</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" size="sm" startContent={<Filter className="w-4 h-4" />}>
              Estado: {filterStatus === "all" ? "Todos" : filterStatus === "active" ? "Activos" : "Desactivados"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Filtro por estado"
            selectionMode="single"
            selectedKeys={new Set([filterStatus])}
            onSelectionChange={(keys) => setFilterStatus(Array.from(keys)[0] as typeof filterStatus)}
          >
            <DropdownItem key="all">Todos</DropdownItem>
            <DropdownItem key="active">Activos</DropdownItem>
            <DropdownItem key="disabled">Desactivados</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <p className="text-sm text-gray-500">
        Mostrando {paginatedAccounts.length} de {accounts.length} cuentas
      </p>

      <Table
        aria-label="Tabla de cuentas"
        bottomContent={
          pages > 1 ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="secondary"
                page={page}
                total={pages}
                onChange={setPage}
              />
            </div>
          ) : null
        }
      >
        <TableHeader>
          <TableColumn>USUARIO</TableColumn>
          <TableColumn>TIPO</TableColumn>
          <TableColumn>ESTADO</TableColumn>
          <TableColumn>CREADO</TableColumn>
          <TableColumn>ACCIONES</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No se encontraron cuentas">
          {paginatedAccounts.map((account) => (
            <TableRow
              key={account.uid}
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onViewAccount(account)}
            >
              <TableCell>
                <div>
                  <p className="font-medium text-gray-900">{account.name || "Sin nombre"}</p>
                  <p className="text-sm text-gray-400">{account.email}</p>
                  {account.companyName && (
                    <p className="text-xs text-gray-400 mt-0.5">{account.companyName}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className={`text-sm ${typeLabels[account.type]?.color || "text-gray-500"}`}>
                  {typeLabels[account.type]?.label || account.type}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${account.disabled ? "bg-red-400" : "bg-green-500"}`} />
                  <span className={`text-sm ${account.disabled ? "text-red-500" : "text-gray-600"}`}>
                    {account.disabled ? "Desactivado" : "Activo"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-500">{formatDate(account.createdAt)}</span>
              </TableCell>
              <TableCell>
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {account.type !== "superAdmin" && (
                    <>
                      {account.disabled ? (
                        <Button
                          isIconOnly size="sm" variant="light" color="success"
                          onPress={() => onActivate(account)}
                          title="Activar cuenta"
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          isIconOnly size="sm" variant="light" color="warning"
                          onPress={() => onDeactivate(account)}
                          title="Desactivar cuenta"
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        isIconOnly size="sm" variant="light" color="danger"
                        onPress={() => onDelete(account)}
                        title="Eliminar cuenta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
