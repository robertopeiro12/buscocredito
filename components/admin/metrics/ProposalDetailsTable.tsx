"use client";

import React, { useState } from "react";
import { ProposalComparisonItem } from "@/hooks/useProposalComparison";
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  comparisons: ProposalComparisonItem[];
  companyName: string;
}

export function ProposalDetailsTable({ comparisons, companyName }: Props) {
  const [sortField, setSortField] = useState<string>("proposalIndex");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  if (comparisons.length === 0) {
    return null;
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sorted = [...comparisons].sort((a, b) => {
    let aVal: any = a[sortField as keyof ProposalComparisonItem];
    let bVal: any = b[sortField as keyof ProposalComparisonItem];
    if (aVal == null) aVal = 0;
    if (bVal == null) bVal = 0;
    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 inline ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-1" />
    );
  };

  const StatusBadge = ({ status, won }: { status: string; won: boolean }) => {
    if (won) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" /> Ganada
        </span>
      );
    }
    if (status === "rejected" || status === "accepted") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <XCircle className="w-3 h-3" /> Perdida
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        <Clock className="w-3 h-3" /> Pendiente
      </span>
    );
  };

  const DiffBadge = ({ value, suffix = "%" }: { value: number | null; suffix?: string }) => {
    if (value === null) return <span className="text-gray-400">—</span>;
    const isPositive = value > 0;
    const color = isPositive ? "text-red-600" : "text-green-600";
    const sign = isPositive ? "+" : "";
    return (
      <span className={`font-medium ${color}`}>
        {sign}
        {value.toFixed(2)}
        {suffix}
      </span>
    );
  };

  const thClass =
    "px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none";
  const tdClass = "px-4 py-3 text-sm text-gray-700 whitespace-nowrap";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">
          Detalle de Propuestas — {companyName}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {comparisons.length} propuestas en el período seleccionado.
          Haz clic en una fila para ver la comparación detallada.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className={thClass} onClick={() => handleSort("proposalIndex")}>
                # <SortIcon field="proposalIndex" />
              </th>
              <th className={thClass} onClick={() => handleSort("adminStatus")}>
                Estado <SortIcon field="adminStatus" />
              </th>
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
                Tu Amortización <SortIcon field="adminAmortization" />
              </th>
              <th className={thClass}>Dif. Amort.</th>
              <th className={thClass}>Dif. Tasa</th>
              <th className={thClass} onClick={() => handleSort("acceptedCompany")}>
                Ganador <SortIcon field="acceptedCompany" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((item) => (
              <React.Fragment key={item.loanId}>
                <tr
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() =>
                    setExpandedRow(
                      expandedRow === item.proposalIndex
                        ? null
                        : item.proposalIndex
                    )
                  }
                >
                  <td className={tdClass}>{item.proposalIndex}</td>
                  <td className={tdClass}>
                    <StatusBadge status={item.adminStatus} won={item.adminWon} />
                  </td>
                  <td className={tdClass}>{item.requestType || "—"}</td>
                  <td className={tdClass}>
                    ${item.adminAmount.toLocaleString()}
                  </td>
                  <td className={tdClass}>{item.adminInterestRate.toFixed(2)}%</td>
                  <td className={tdClass}>
                    ${item.adminAmortization.toLocaleString()}
                  </td>
                  <td className={tdClass}>
                    <DiffBadge value={item.amortizationDiff} />
                  </td>
                  <td className={tdClass}>
                    <DiffBadge value={item.interestRateDiff} suffix=" pp" />
                  </td>
                  <td className={tdClass}>
                    {item.adminWon ? (
                      <span className="text-green-600 font-medium">{companyName}</span>
                    ) : item.hasAccepted ? (
                      <span className="text-gray-900">{item.acceptedCompany || "Otra empresa"}</span>
                    ) : (
                      <span className="text-gray-400">Sin resolver</span>
                    )}
                  </td>
                </tr>

                {/* Expanded row detail */}
                {expandedRow === item.proposalIndex && (
                  <tr key={`${item.loanId}-detail`}>
                    <td colSpan={9} className="bg-gray-50 px-6 py-4">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Admin's proposal */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="text-sm font-bold text-blue-800 mb-3">
                            Tu Propuesta ({companyName})
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Monto:</span>{" "}
                              <span className="font-medium">${item.adminAmount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Tasa:</span>{" "}
                              <span className="font-medium">{item.adminInterestRate.toFixed(2)}%</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Amortización:</span>{" "}
                              <span className="font-medium">${item.adminAmortization.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Comisión:</span>{" "}
                              <span className="font-medium">${item.adminCommission.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Plazo:</span>{" "}
                              <span className="font-medium">{item.adminDeadline} meses</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Frecuencia:</span>{" "}
                              <span className="font-medium capitalize">{item.adminFrequency || "—"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Accepted proposal */}
                        <div className={`rounded-lg p-4 ${item.adminWon ? "bg-green-50" : item.hasAccepted ? "bg-gray-100" : "bg-yellow-50"}`}>
                          <h4 className={`text-sm font-bold mb-3 ${item.adminWon ? "text-green-800" : item.hasAccepted ? "text-gray-800" : "text-yellow-800"}`}>
                            {item.adminWon
                              ? "Propuesta Ganadora (Tuya)"
                              : item.hasAccepted
                              ? `Propuesta Aceptada (${item.acceptedCompany || "Otra empresa"})`
                              : "Sin propuesta aceptada aún"}
                          </h4>
                          {item.hasAccepted && !item.adminWon ? (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-500">Monto:</span>{" "}
                                <span className="font-medium">${item.acceptedAmount?.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Tasa:</span>{" "}
                                <span className="font-medium">{item.acceptedInterestRate?.toFixed(2)}%</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Amortización:</span>{" "}
                                <span className="font-medium">${item.acceptedAmortization?.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Comisión:</span>{" "}
                                <span className="font-medium">${item.acceptedCommission?.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Plazo:</span>{" "}
                                <span className="font-medium">{item.acceptedDeadline} meses</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Frecuencia:</span>{" "}
                                <span className="font-medium capitalize">{item.acceptedFrequency || "—"}</span>
                              </div>
                            </div>
                          ) : !item.hasAccepted ? (
                            <p className="text-sm text-yellow-700">La solicitud aún no tiene propuesta aceptada.</p>
                          ) : null}
                        </div>
                      </div>

                      {/* Differences summary */}
                      {item.hasAccepted && !item.adminWon && (
                        <div className="mt-4 flex gap-4">
                          <div className="bg-white rounded-lg p-3 flex-1 text-center border">
                            <p className="text-xs text-gray-500 mb-1">Dif. Monto</p>
                            <DiffBadge value={item.amountDiff} />
                          </div>
                          <div className="bg-white rounded-lg p-3 flex-1 text-center border">
                            <p className="text-xs text-gray-500 mb-1">Dif. Tasa</p>
                            <DiffBadge value={item.interestRateDiff} suffix=" pp" />
                          </div>
                          <div className="bg-white rounded-lg p-3 flex-1 text-center border">
                            <p className="text-xs text-gray-500 mb-1">Dif. Amortización</p>
                            <DiffBadge value={item.amortizationDiff} />
                          </div>
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
    </div>
  );
}
