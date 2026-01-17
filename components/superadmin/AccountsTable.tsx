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
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Tooltip,
} from "@heroui/react";
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  UserX,
  UserCheck,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useState, useMemo } from "react";
import type { AccountInfo } from "@/types/superadmin";

interface AccountsTableProps {
  accounts: AccountInfo[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: "all" | "super_admin" | "b_admin" | "b_sale" | "user";
  setFilterType: (type: "all" | "super_admin" | "b_admin" | "b_sale" | "user") => void;
  filterStatus: "all" | "active" | "disabled";
  setFilterStatus: (status: "all" | "active" | "disabled") => void;
  onViewAccount: (account: AccountInfo) => void;
  onActivate: (account: AccountInfo) => void;
  onDeactivate: (account: AccountInfo) => void;
  onDelete: (account: AccountInfo) => void;
  onRefresh: () => void;
}

const typeLabels: Record<string, { label: string; color: "default" | "primary" | "secondary" | "success" | "warning" | "danger" }> = {
  super_admin: { label: "Super Admin", color: "secondary" },
  b_admin: { label: "Admin", color: "primary" },
  b_sale: { label: "Vendedor", color: "success" },
  user: { label: "Usuario", color: "default" },
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

  const pages = Math.ceil(accounts.length / rowsPerPage);

  const paginatedAccounts = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return accounts.slice(start, end);
  }, [accounts, page]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-96 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <Input
            placeholder="Buscar por email, nombre o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<Search className="w-4 h-4 text-gray-400" />}
            className="w-64"
            size="sm"
          />
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                size="sm"
                startContent={<Filter className="w-4 h-4" />}
              >
                Tipo: {filterType === "all" ? "Todos" : typeLabels[filterType]?.label}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Filtro por tipo"
              selectionMode="single"
              selectedKeys={new Set([filterType])}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as typeof filterType;
                setFilterType(selected);
              }}
            >
              <DropdownItem key="all">Todos</DropdownItem>
              <DropdownItem key="super_admin">Super Admin</DropdownItem>
              <DropdownItem key="b_admin">Admin</DropdownItem>
              <DropdownItem key="b_sale">Vendedor</DropdownItem>
              <DropdownItem key="user">Usuario</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                size="sm"
                startContent={<Filter className="w-4 h-4" />}
              >
                Estado: {filterStatus === "all" ? "Todos" : filterStatus === "active" ? "Activos" : "Desactivados"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Filtro por estado"
              selectionMode="single"
              selectedKeys={new Set([filterStatus])}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as typeof filterStatus;
                setFilterStatus(selected);
              }}
            >
              <DropdownItem key="all">Todos</DropdownItem>
              <DropdownItem key="active">Activos</DropdownItem>
              <DropdownItem key="disabled">Desactivados</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <Button
          variant="bordered"
          size="sm"
          startContent={<RefreshCw className="w-4 h-4" />}
          onPress={onRefresh}
        >
          Actualizar
        </Button>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        Mostrando {paginatedAccounts.length} de {accounts.length} cuentas
      </p>

      {/* Table */}
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
                onChange={(page) => setPage(page)}
              />
            </div>
          ) : null
        }
      >
        <TableHeader>
          <TableColumn>USUARIO</TableColumn>
          <TableColumn>TIPO</TableColumn>
          <TableColumn>EMPRESA</TableColumn>
          <TableColumn>ESTADO</TableColumn>
          <TableColumn>CREADO</TableColumn>
          <TableColumn>ÚLTIMO LOGIN</TableColumn>
          <TableColumn>ACCIONES</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No se encontraron cuentas">
          {paginatedAccounts.map((account) => (
            <TableRow key={account.uid}>
              <TableCell>
                <div>
                  <p className="font-medium text-gray-900">
                    {account.name || "Sin nombre"}
                  </p>
                  <p className="text-sm text-gray-500">{account.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <Chip
                  color={typeLabels[account.type]?.color || "default"}
                  size="sm"
                  variant="flat"
                >
                  {typeLabels[account.type]?.label || account.type}
                </Chip>
              </TableCell>
              <TableCell>
                <span className="text-gray-600">
                  {account.Empresa || "-"}
                </span>
              </TableCell>
              <TableCell>
                <Chip
                  color={account.disabled ? "danger" : "success"}
                  size="sm"
                  variant="dot"
                >
                  {account.disabled ? "Desactivado" : "Activo"}
                </Chip>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-500">
                  {formatDate(account.createdAt)}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-500">
                  {formatDate(account.lastLoginAt)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Tooltip content="Ver detalles">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => onViewAccount(account)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                  {account.type !== "super_admin" && (
                    <>
                      {account.disabled ? (
                        <Tooltip content="Activar cuenta">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="success"
                            onPress={() => onActivate(account)}
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      ) : (
                        <Tooltip content="Desactivar cuenta">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="warning"
                            onPress={() => onDeactivate(account)}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      )}
                      <Tooltip content="Eliminar cuenta">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => onDelete(account)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </Tooltip>
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
