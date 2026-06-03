import { useState, useEffect } from "react";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

export interface ProposalComparisonItem {
  proposalIndex: number;
  loanId: string;
  // Admin's proposal data
  adminAmount: number;
  adminInterestRate: number;
  adminAmortization: number;
  adminCommission: number;
  adminDeadline: number;
  adminFrequency: string;
  adminStatus: string;
  adminCompany: string;
  adminCreatedAt: string;
  // Accepted proposal data (from whoever won)
  acceptedAmount: number | null;
  acceptedInterestRate: number | null;
  acceptedAmortization: number | null;
  acceptedCommission: number | null;
  acceptedDeadline: number | null;
  acceptedFrequency: string | null;
  acceptedCompany: string | null;
  // Computed comparisons (% difference)
  amortizationDiff: number | null; // % difference
  interestRateDiff: number | null; // absolute difference
  amountDiff: number | null; // % difference
  // Whether admin won this one
  adminWon: boolean;
  hasAccepted: boolean;
  // Request info
  requestPurpose: string;
  requestType: string;
  requestedAmount: number;
}

export interface ComparisonSummary {
  totalProposals: number;
  totalWins: number;
  winRate: number;
  avgAmortizationDiff: number;
  avgInterestRateDiff: number;
  avgAmountDiff: number;
  proposalsWithComparison: number;
}

interface UseProposalComparisonProps {
  rawProposals: any[];
  companyName: string;
  isLoadingMetrics: boolean;
}

export function useProposalComparison({
  rawProposals,
  companyName,
  isLoadingMetrics,
}: UseProposalComparisonProps) {
  const [comparisons, setComparisons] = useState<ProposalComparisonItem[]>([]);
  const [summary, setSummary] = useState<ComparisonSummary>({
    totalProposals: 0,
    totalWins: 0,
    winRate: 0,
    avgAmortizationDiff: 0,
    avgInterestRateDiff: 0,
    avgAmountDiff: 0,
    proposalsWithComparison: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoadingMetrics || rawProposals.length === 0) return;
    fetchComparisons();
  }, [rawProposals, isLoadingMetrics]);

  const parseDate = (dateField: any): string => {
    if (!dateField) return "";
    if (dateField.toDate) return dateField.toDate().toISOString();
    if (dateField instanceof Date) return dateField.toISOString();
    if (typeof dateField === "string") return dateField;
    return "";
  };

  const fetchComparisons = async () => {
    setIsLoading(true);
    try {
      const db = getFirestore();

      const loanIdSet = new Set<string>(rawProposals.map((p) => p.loanId || p.solicitudId).filter(Boolean));
      const loanIds = Array.from(loanIdSet);

      // Process all loanIds in parallel
      const settled = await Promise.all(
        loanIds.map(async (loanId): Promise<ProposalComparisonItem | null> => {
          const adminProposal = rawProposals.find(
            (p) => (p.loanId || p.solicitudId) === loanId
          );
          if (!adminProposal) return null;

          const proposalsRef = collection(db, "propuestas");

          // Fire both loanId and solicitudId queries + solicitud fetch in parallel
          const [snapshot, legacySnapshot, solicitudDoc] = await Promise.all([
            getDocs(query(proposalsRef, where("loanId", "==", loanId))),
            getDocs(query(proposalsRef, where("solicitudId", "==", loanId))),
            getDoc(doc(db, "solicitudes", loanId)).catch(() => null),
          ]);

          // Merge and deduplicate proposal results
          const seen = new Set<string>();
          let acceptedProposal: any = null;
          for (const snap of [snapshot, legacySnapshot]) {
            snap.forEach((docSnap) => {
              if (seen.has(docSnap.id)) return;
              seen.add(docSnap.id);
              const data = docSnap.data();
              if (data.status === "accepted") {
                acceptedProposal = { id: docSnap.id, ...data };
              }
            });
          }

          const adminWon = acceptedProposal?.id === adminProposal.id;
          const hasAccepted = !!acceptedProposal;

          let amortizationDiff: number | null = null;
          let interestRateDiff: number | null = null;
          let amountDiff: number | null = null;

          if (hasAccepted && !adminWon) {
            const acceptedAmort = parseFloat(acceptedProposal.amortization?.toString() || "0");
            const adminAmort = parseFloat(adminProposal.amortization?.toString() || "0");
            if (acceptedAmort > 0) {
              amortizationDiff = ((adminAmort - acceptedAmort) / acceptedAmort) * 100;
            }
            const acceptedRate = parseFloat(acceptedProposal.interestRate?.toString() || "0");
            const adminRate = parseFloat(adminProposal.interestRate?.toString() || "0");
            interestRateDiff = adminRate - acceptedRate;
            const acceptedAmt = parseFloat(acceptedProposal.amount?.toString() || "0");
            const adminAmt = parseFloat(adminProposal.amount?.toString() || "0");
            if (acceptedAmt > 0) {
              amountDiff = ((adminAmt - acceptedAmt) / acceptedAmt) * 100;
            }
          }

          let requestedAmount = 0;
          let requestPurpose = adminProposal.requestInfo?.purpose || "";
          let requestType = adminProposal.requestInfo?.type || "";

          if (solicitudDoc?.exists()) {
            const solicitudData = solicitudDoc.data();
            requestedAmount = solicitudData.amount || 0;
            if (!requestPurpose) requestPurpose = solicitudData.purpose || "";
            if (!requestType) requestType = solicitudData.type || "";
          }

          return {
            proposalIndex: 0, // assigned after sort
            loanId,
            adminAmount: parseFloat(adminProposal.amount?.toString() || "0"),
            adminInterestRate: parseFloat(adminProposal.interestRate?.toString() || "0"),
            adminAmortization: parseFloat(adminProposal.amortization?.toString() || "0"),
            adminCommission: parseFloat((adminProposal.comision || adminProposal.commission || 0).toString()),
            adminDeadline: parseFloat(adminProposal.deadline?.toString() || "0"),
            adminFrequency: adminProposal.amortizationFrequency || "",
            adminStatus: adminProposal.status || "pending",
            adminCompany: adminProposal.company || companyName,
            adminCreatedAt: parseDate(adminProposal.createdAt || adminProposal.fechaCreacion),
            acceptedAmount: acceptedProposal ? parseFloat(acceptedProposal.amount?.toString() || "0") : null,
            acceptedInterestRate: acceptedProposal ? parseFloat(acceptedProposal.interestRate?.toString() || "0") : null,
            acceptedAmortization: acceptedProposal ? parseFloat(acceptedProposal.amortization?.toString() || "0") : null,
            acceptedCommission: acceptedProposal ? parseFloat((acceptedProposal.comision || acceptedProposal.commission || 0).toString()) : null,
            acceptedDeadline: acceptedProposal ? parseFloat(acceptedProposal.deadline?.toString() || "0") : null,
            acceptedFrequency: acceptedProposal?.amortizationFrequency || null,
            acceptedCompany: acceptedProposal?.company || null,
            amortizationDiff,
            interestRateDiff,
            amountDiff,
            adminWon,
            hasAccepted,
            requestPurpose,
            requestType,
            requestedAmount,
          };
        })
      );

      const results = settled
        .filter((r): r is ProposalComparisonItem => r !== null)
        .map((r, i) => ({ ...r, proposalIndex: i + 1 }));

      // Calculate summary
      const withComparison = results.filter((r) => r.hasAccepted && !r.adminWon);
      const wins = results.filter((r) => r.adminWon);
      const avgAmortDiff = withComparison.length > 0
        ? withComparison.reduce((sum, r) => sum + (r.amortizationDiff || 0), 0) / withComparison.length
        : 0;
      const avgRateDiff = withComparison.length > 0
        ? withComparison.reduce((sum, r) => sum + (r.interestRateDiff || 0), 0) / withComparison.length
        : 0;
      const avgAmtDiff = withComparison.length > 0
        ? withComparison.reduce((sum, r) => sum + (r.amountDiff || 0), 0) / withComparison.length
        : 0;

      setComparisons(results);
      setSummary({
        totalProposals: results.length,
        totalWins: wins.length,
        winRate: results.length > 0 ? (wins.length / results.length) * 100 : 0,
        avgAmortizationDiff: parseFloat(avgAmortDiff.toFixed(2)),
        avgInterestRateDiff: parseFloat(avgRateDiff.toFixed(2)),
        avgAmountDiff: parseFloat(avgAmtDiff.toFixed(2)),
        proposalsWithComparison: withComparison.length,
      });
    } catch (error) {
      console.error("Error fetching proposal comparisons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    comparisons,
    summary,
    isLoading,
  };
}
