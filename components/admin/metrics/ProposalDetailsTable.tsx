"use client";

import React, { useState, useMemo } from "react";
import { ProposalComparisonItem } from "@/hooks/useProposalComparison";
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  comparisons: ProposalComparisonItem[];
  companyName: string;
}

const ITEMS_PER_PAGE = 10;

type StatusFilter = "all" | "won" | "lost" | "pending";

const StatusBadge = ({ won, hasAccepted }: { won: boolean; hasAccepted: boolean }) => {
  if (won) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
      <CheckCircle className="w-3 h-3" /> Ganada
    </span>
  );
  if (hasAccepted) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-600">
      <XCircle className="w-3 h-3" /> Perdida
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600">
      <Clock className="w-3 h-3" /> Pendiente
    </span>
  );
};

const DiffBadge = ({ value, suffix = "%" }: { value: number | null; suffix?: string }) => {
  if (value === null) return <span className="text-gray-300 text-xs">—</span>;
  const bad = value > 0;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
      bad ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
    }`}>
      {bad ? "+" : ""}{value.toFixed(2)}{suffix}
    </span>
  );
};

export function ProposalDetailsTable({ comparisons, companyName }: Props) {
  const [sortField, setSortField] = useState<string>("proposalIndex");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  if (comparisons.length === 0) return null;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    return comparisons.filter(c => {
      if (statusFilter === "won") return c.adminWon;
      if (statusFilter === "lost") return c.hasAccepted && !c.adminWon;
      if (statusFilter === "pending") return !c.hasAccepted;
      return true;
    });
  }, [comparisons, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aVal: any = a[sortField as keyof ProposalComparisonItem] ?? 0;
      let bVal: any = b[sortField as keyof ProposalComparisonItem] ?? 0;
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30 inline ml-0.5" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 inline ml-0.5 text-[#0e3a45]" />
      : <ChevronDown className="w-3 h-3 inline ml-0.5 text-[#0e3a45]" />;
  };

  const filterButtons: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all",     label: "Todas",     count: comparisons.length },
    { key: "won",     label: "Ganadas",   count: comparisons.filter(c => c.adminWon).length },
    { key: "lost",    label: "Perdidas",  count: comparisons.filter(c => c.hasAccepted && !c.adminWon).length },
    { key: "pending", label: "Pendientes",count: comparisons.filter(c => !c.hasAccepted).length },
  ];

  const thClass = "px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-700 select-none whitespace-nowrap";
  const tdClass = "px-4 py-3 text-xs text-gray-700 whitespace-nowrap";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-700">Detalle de Propuestas</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {sorted.length} {sorted.length === 1 ? "propuesta" : "propuestas"} · haz clic en una fila para ver el detalle
          </p>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
          {filterButtons.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => { setStatusFilter(key); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                statusFilter === key
                  ? "bg-white text-[#0e3a45] shadow-sm border border-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
              <span className={`ml-1.5 text-[10px] ${statusFilter === key ? "text-[#0e3a45]/60" : "text-gray-400"}`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className={thClass} onClick={() => handleSort("proposalIndex")}>
                # <SortIcon field="proposalIndex" />
              </th>
              <th className={thClass}>Resultado</th>
              <th className={thClass} onClick={() => handleSort("requestType")}>
                Tipo <SortIcon field="requestType" />
              </th>
              <th className={thClass} onClick={() => handleSort("adminAmount")}>
                Tu Monto <SortIcon field="adminAmount" />
              </th>
              <th className={thClass} onClick={() => handleSort("adminInterestRate")}>
                Tu Tasa <SortIcon field="adminInterestRate" />
              </th>
              <th className={thClass} onClick={() => handleSort("adminAmortization")}>
                Tu Amort. <SortIcon field="adminAmortization" />
              </th>
              <th className={thClass} onClick={() => handleSort("amortizationDiff")}>
                Dif. Amort. <SortIcon field="amortizationDiff" />
              </th>
              <th className={thClass} onClick={() => handleSort("interestRateDiff")}>
                Dif. Tasa <SortIcon field="interestRateDiff" />
              </th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {paginated.map((item, i) => (
              <React.Fragment key={item.loanId}>
                <tr
                  className={`cursor-pointer transition-colors hover:bg-[#0e3a45]/[0.03] border-b border-gray-50 ${
                    i % 2 === 1 ? "bg-gray-50/40" : "bg-white"
                  } ${expandedId === item.loanId ? "bg-[#0e3a45]/[0.04]" : ""}`}
                  onClick={() => setExpandedId(expandedId === item.loanId ? null : item.loanId)}
                >
                  <td className={`${tdClass} font-medium text-gray-500`}>#{item.proposalIndex}</td>
                  <td className={tdClass}>
                    <StatusBadge won={item.adminWon} hasAccepted={item.hasAccepted} />
                  </td>
                  <td className={`${tdClass} text-gray-500`}>{item.requestType || "—"}</td>
                  <td className={tdClass}>${item.adminAmount.toLocaleString("es-MX")}</td>
                  <td className={tdClass}>{item.adminInterestRate.toFixed(2)}%</td>
                  <td className={tdClass}>${item.adminAmortization.toLocaleString("es-MX")}</td>
                  <td className={tdClass}><DiffBadge value={item.amortizationDiff} /></td>
                  <td className={tdClass}><DiffBadge value={item.interestRateDiff} suffix=" pp" /></td>
                  <td className="px-3 py-3">
                    {expandedId === item.loanId
                      ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                      : <ChevronDown className="w-3.5 h-3.5 text-gray-300" />
                    }
                  </td>
                </tr>

                {expandedId === item.loanId && (
                  <tr key={`${item.loanId}-detail`}>
                    <td colSpan={9} className="bg-gray-50/80 px-6 py-5 border-b border-gray-100">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Tu propuesta */}
                        <div className="bg-white rounded-lg border border-[#0e3a45]/10 p-4">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#0e3a45] mb-3">
                            Tu Propuesta · {companyName}
                          </p>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                            {[
                              ["Monto", `$${item.adminAmount.toLocaleString("es-MX")}`],
                              ["Tasa", `${item.adminInterestRate.toFixed(2)}%`],
                              ["Amortización", `$${item.adminAmortization.toLocaleString("es-MX")}`],
                              ["Comisión", `$${item.adminCommission.toLocaleString("es-MX")}`],
                              ["Plazo", `${item.adminDeadline} meses`],
                              ["Frecuencia", item.adminFrequency || "—"],
                            ].map(([label, val]) => (
                              <div key={label}>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
                                <p className="text-xs font-semibold text-gray-800 capitalize">{val}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Propuesta aceptada */}
                        <div className={`rounded-lg border p-4 ${
                          item.adminWon
                            ? "bg-emerald-50/50 border-emerald-100"
                            : item.hasAccepted
                            ? "bg-white border-gray-100"
                            : "bg-amber-50/50 border-amber-100"
                        }`}>
                          <p className={`text-[10px] font-semibold uppercase tracking-widest mb-3 ${
                            item.adminWon ? "text-emerald-700" : item.hasAccepted ? "text-gray-500" : "text-amber-600"
                          }`}>
                            {item.adminWon ? "Ganador · Tu propuesta" : item.hasAccepted ? "Propuesta Aceptada · Otra institución" : "Sin resolver aún"}
                          </p>
                          {item.hasAccepted && !item.adminWon ? (
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              {[
                                ["Monto", `$${item.acceptedAmount?.toLocaleString("es-MX")}`],
                                ["Tasa", `${item.acceptedInterestRate?.toFixed(2)}%`],
                                ["Amortización", `$${item.acceptedAmortization?.toLocaleString("es-MX")}`],
                                ["Comisión", `$${item.acceptedCommission?.toLocaleString("es-MX")}`],
                                ["Plazo", `${item.acceptedDeadline} meses`],
                                ["Frecuencia", item.acceptedFrequency || "—"],
                              ].map(([label, val]) => (
                                <div key={label}>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
                                  <p className="text-xs font-semibold text-gray-800 capitalize">{val}</p>
                                </div>
                              ))}
                            </div>
                          ) : item.adminWon ? (
                            <p className="text-xs text-emerald-700">Tu propuesta fue seleccionada por el solicitante.</p>
                          ) : (
                            <p className="text-xs text-amber-600">La solicitud aún no tiene propuesta aceptada.</p>
                          )}
                        </div>
                      </div>

                      {/* Diff summary */}
                      {item.hasAccepted && !item.adminWon && (
                        <div className="flex gap-3">
                          {[
                            { label: "Dif. Monto", node: <DiffBadge value={item.amountDiff} /> },
                            { label: "Dif. Tasa", node: <DiffBadge value={item.interestRateDiff} suffix=" pp" /> },
                            { label: "Dif. Amortización", node: <DiffBadge value={item.amortizationDiff} /> },
                          ].map(({ label, node }) => (
                            <div key={label} className="bg-white rounded-lg border border-gray-100 px-4 py-2.5 flex-1 text-center">
                              <p className="text-[10px] text-gray-400 mb-1">{label}</p>
                              {node}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">
            {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, sorted.length)} de {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-[11px] font-medium transition-all ${
                    page === p
                      ? "bg-[#0e3a45] text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
