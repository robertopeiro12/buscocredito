"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Store } from "lucide-react";
import { auth } from "@/app/firebase";
import type { LoanRequest } from "@/types/entities/business.types";
import type { LenderFilters as LenderFiltersType } from "@/app/lender/types/loan.types";
import LenderFilters from "@/components/lender/LenderFilters";
import { LenderLoadingSkeletons } from "@/components/features/dashboard/LenderLoadingSkeletons";
import { MarketplacePagination } from "@/components/features/dashboard/MarketplacePagination";
import AdminLoanRequestCard from "./AdminLoanRequestCard";

interface AdminMarketplaceViewProps {
  loans: LoanRequest[];
  loading: boolean;
}

const ITEMS_PER_PAGE = 6;

const TYPE_LABEL_MAP: Record<string, string> = {
  consumo: "Crédito al consumo",
  deudas: "Liquidación deudas",
  capital: "Capital de trabajo",
  maquinaria: "Adquisición de maquinaria o equipo",
};

const AdminMarketplaceView = ({ loans: loanRequests, loading: isLoading }: AdminMarketplaceViewProps) => {
  const [filters, setFilters] = useState<LenderFiltersType>({
    search: "",
    state: "",
    city: "",
    purpose: "all",
    type: "all",
    amountRange: "all",
  });
  const [userDataMap, setUserDataMap] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const fetchedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const loadUserData = async () => {
      const uniqueIds = Array.from(
        new Set(loanRequests.map((r) => r.userId).filter(Boolean))
      );
      for (const userId of uniqueIds) {
        if (!userId || fetchedIds.current.has(userId)) continue;
        fetchedIds.current.add(userId);
        try {
          const token = await auth.currentUser?.getIdToken();
          const res = await fetch("/api/users/public-profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: "include",
            body: JSON.stringify({ userId }),
          });
          if (res.ok) {
            const data = await res.json();
            setUserDataMap((prev) => ({ ...prev, [userId]: data.data || {} }));
          } else {
            fetchedIds.current.delete(userId);
            console.error(`Failed to fetch user data for ${userId}: ${res.status}`);
          }
        } catch (err) {
          fetchedIds.current.delete(userId);
          console.error(`Error fetching user data for ${userId}:`, err);
        }
      }
    };
    if (loanRequests.length > 0) loadUserData();
  }, [loanRequests]);

  const handleFilterChange = (key: keyof LenderFiltersType, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ search: "", state: "", city: "", purpose: "all", type: "all", amountRange: "all" });
    setCurrentPage(1);
  };

  const filteredRequests = useMemo(() => {
    return loanRequests.filter((request) => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        const match =
          request.amount.toString().includes(s) ||
          request.purpose?.toLowerCase().includes(s) ||
          request.type?.toLowerCase().includes(s);
        if (!match) return false;
      }
      if (filters.state) {
        const ud = userDataMap[request.userId || ""];
        if (ud?.state !== filters.state) return false;
      }
      if (filters.city) {
        const ud = userDataMap[request.userId || ""];
        if (!ud?.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
      }
      if (filters.purpose !== "all" && request.purpose !== filters.purpose) return false;
      if (filters.type !== "all") {
        const expectedLabel = TYPE_LABEL_MAP[filters.type] ?? filters.type;
        if (request.type !== expectedLabel && request.type !== filters.type) return false;
      }
      if (filters.amountRange !== "all") {
        const amt = request.amount;
        const ranges: Record<string, [number, number]> = {
          "0-50000": [0, 50000],
          "50000-100000": [50000, 100000],
          "100000-250000": [100000, 250000],
          "250000-500000": [250000, 500000],
          "500000+": [500000, Infinity],
        };
        const [min, max] = ranges[filters.amountRange] ?? [0, Infinity];
        if (amt < min || amt > max) return false;
      }
      return true;
    });
  }, [loanRequests, filters, userDataMap]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredRequests]);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasActiveFilters = Object.values(filters).some((v) => v && v !== "all");

  if (isLoading) return <LenderLoadingSkeletons.MarketplaceGrid />;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <LenderFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {filteredRequests.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#0e3a45]/[0.06] flex items-center justify-center">
            <Store className="w-9 h-9 text-[#0e3a45]/40" />
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-1.5">
            {hasActiveFilters ? "Sin resultados" : "No hay solicitudes"}
          </h3>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">
            {hasActiveFilters
              ? "Ninguna solicitud coincide con los filtros aplicados."
              : "Las solicitudes pendientes del mercado aparecerán aquí."}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-0.5">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
              {filteredRequests.length}{" "}
              {filteredRequests.length === 1 ? "solicitud" : "solicitudes"}
              {hasActiveFilters && (
                <span className="ml-1 text-[#0e3a45]/60">· filtradas</span>
              )}
            </p>
            {totalPages > 1 && (
              <p className="text-[10px] uppercase tracking-widest text-gray-400">
                Pág. {currentPage} / {totalPages}
              </p>
            )}
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {paginatedRequests.map((request, index) => (
              <AdminLoanRequestCard
                key={request.id}
                request={request}
                userData={userDataMap[request.userId || ""]}
                index={(currentPage - 1) * ITEMS_PER_PAGE + index}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <MarketplacePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AdminMarketplaceView;
