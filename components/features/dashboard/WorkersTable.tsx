"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { Search, Activity, PlusCircle, Trash2, User } from "lucide-react";
import { MarketplacePagination } from "@/components/features/dashboard/MarketplacePagination";
import { Worker } from "@/hooks/useWorkerStats";

const ROWS_PER_PAGE = 10;

type WorkersTableProps = {
  workers: Worker[];
  isLoading: boolean;
  error: string | null;
  period: "month" | "all";
  onPeriodChange: (p: "month" | "all") => void;
  onRefresh: () => void;
  onDelete: (id: string) => void;
  onCreateWorker: () => void;
  formatLastActivity: (lastActivity: string | null) => string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
};

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div className="w-8 h-8 rounded-full bg-[#0e3a45]/10 flex items-center justify-center shrink-0">
      <span className="text-xs font-semibold text-[#0e3a45]">{initials}</span>
    </div>
  );
}

function RateBar({ value }: { value: number }) {
  return (
    <div className="flex flex-col gap-1 min-w-[80px]">
      <span className="text-sm font-semibold text-gray-800">{value}%</span>
      <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-1 bg-[#0e3a45] rounded-full transition-all duration-300"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function WorkersTable({
  workers,
  isLoading,
  error,
  period,
  onPeriodChange,
  onRefresh,
  onDelete,
  onCreateWorker,
  formatLastActivity,
  searchTerm,
  onSearchChange,
}: WorkersTableProps) {
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Worker | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    setPage(1);
  }, [searchTerm, period]);

  const filteredWorkers = workers.filter(
    (w) =>
      searchTerm === "" ||
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredWorkers.length / ROWS_PER_PAGE);
  const pagedWorkers = filteredWorkers.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE
  );

  const openDeleteModal = (worker: Worker) => {
    setDeleteTarget(worker);
    onOpen();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const response = await fetch("/api/users/subaccounts/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: deleteTarget.id }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar");
      }
      onDelete(deleteTarget.id);
      onClose();
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            type="text"
            placeholder="Buscar por nombre o email..."
            startContent={<Search className="text-gray-400 w-4 h-4" />}
            classNames={{
              inputWrapper:
                "bg-white border border-gray-200 hover:border-gray-300 shadow-sm",
            }}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Period toggle */}
          <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 gap-0.5">
            <button
              onClick={() => onPeriodChange("month")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                period === "month"
                  ? "bg-[#0e3a45] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Este mes
            </button>
            <button
              onClick={() => onPeriodChange("all")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                period === "all"
                  ? "bg-[#0e3a45] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Todo el tiempo
            </button>
          </div>

          <Button
            variant="flat"
            size="sm"
            onPress={onRefresh}
            isDisabled={isLoading}
            startContent={
              isLoading ? (
                <Spinner size="sm" />
              ) : (
                <Activity className="w-4 h-4" />
              )
            }
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            {isLoading ? "Actualizando..." : "Actualizar"}
          </Button>

          <span className="text-sm text-gray-500 whitespace-nowrap">
            · {workers.length} trabajadores
          </span>

          <Button
            size="sm"
            onPress={onCreateWorker}
            startContent={<PlusCircle className="w-4 h-4" />}
            style={{ backgroundColor: "#0e3a45" }}
            className="text-white font-medium whitespace-nowrap"
          >
            Nuevo Trabajador
          </Button>
        </div>
      </div>

      {/* ── Body ── */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <User className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button
            size="sm"
            variant="flat"
            onPress={onRefresh}
            className="bg-red-50 text-red-600"
          >
            Reintentar
          </Button>
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-gray-600 mb-2">
            No se encontraron trabajadores
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {searchTerm
              ? `No hay trabajadores que coincidan con "${searchTerm}".`
              : "Aún no tienes trabajadores registrados."}
          </p>
          {!searchTerm && (
            <Button
              size="sm"
              onPress={onCreateWorker}
              startContent={<PlusCircle className="w-4 h-4" />}
              style={{ backgroundColor: "#0e3a45" }}
              className="text-white"
            >
              Crear Primer Trabajador
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Trabajador
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Estado
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Tasa
                  </th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Propuestas
                  </th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Aprobadas
                  </th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Pendientes
                  </th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Rechazadas
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Últ. actividad
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedWorkers.map((worker) => (
                  <tr
                    key={worker.id}
                    className="hover:bg-[#0e3a45]/[0.025] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={worker.name} />
                        <div>
                          <p className="font-medium text-gray-900">
                            {worker.name}
                          </p>
                          <p className="text-xs text-gray-500">{worker.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            worker.stats.isActive
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <span className="text-gray-700">
                          {worker.stats.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <RateBar value={worker.stats.approvalRate} />
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-[#0e3a45]">
                        {worker.stats.totalPropuestas}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-green-600">
                        {worker.stats.solicitudesApproved}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-yellow-600">
                        {worker.stats.solicitudesPending}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-red-500">
                        {worker.stats.solicitudesRejected}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-gray-500 text-xs">
                        {formatLastActivity(worker.stats.lastActivity)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDeleteModal(worker)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
                        aria-label="Eliminar trabajador"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <MarketplacePagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* ── Delete modal ── */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Confirmar eliminación</ModalHeader>
          <ModalBody>
            <p>
              ¿Eliminar la cuenta de{" "}
              <strong>{deleteTarget?.name}</strong>?
            </p>
            <div className="mt-2 p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">
                Esta acción no se puede deshacer.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={onClose}
              isDisabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isLoading={isDeleting}
            >
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
