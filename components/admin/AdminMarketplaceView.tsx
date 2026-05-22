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
      const token = await auth.currentUser?.getIdToken();
      for (const userId of uniqueIds) {
        if (!userId || fetchedIds.current.has(userId)) continue;
        fetchedIds.current.add(userId);
        try {
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
          }
        } catch {}
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

  if (isLoading) return <LenderLoadingSkeletons.MarketplaceGrid />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <LenderFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No hay solicitudes
          </h3>
          <p className="text-sm text-gray-500">
            {Object.values(filters).some((v) => v && v !== "all")
              ? "No se encontraron solicitudes con los filtros aplicados."
              : "Aún no hay solicitudes de préstamos en el marketplace."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedRequests.map((request, index) => (
              <AdminLoanRequestCard
                key={request.id}
                request={request}
                userData={userDataMap[request.userId || ""]}
                index={(currentPage - 1) * ITEMS_PER_PAGE + index}
              />
            ))}
          </div>
          <MarketplacePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default AdminMarketplaceView;
