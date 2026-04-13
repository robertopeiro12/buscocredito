// hooks/useProposal.ts
import { useState, useEffect } from 'react';
import type { LoanRequest } from '../types/loan.types';
import type { PaymentFrequency } from '@/types/entities/account.types';

// Datos del formulario de propuesta (subconjunto editable por el lender)
interface ProposalFormData {
  company: string;
  amount: number;
  comision: number;
  amortizationFrequency: PaymentFrequency | '';
  amortization: number;
  lenderId: string;
  deadline: number;
  interestRate: number;
  medicalBalance: number;
}

export function useProposal(loan: LoanRequest | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposalData, setProposalData] = useState<ProposalFormData>({
    company: '',
    amount: loan?.amount || 0,
    comision: 0,
    amortizationFrequency: loan?.payment || 'mensual',
    amortization: 0,
    lenderId: '',
    deadline: parseTermToMonths(loan?.term || ''),
    interestRate: -1,
    medicalBalance: -1
  });

  // Función para convertir el término de la solicitud a meses
  function parseTermToMonths(term: string): number {
    const monthsMatch = term.match(/(\d+)\s*meses?/i);
    const yearsMatch = term.match(/(\d+)\s*años?/i);

    if (monthsMatch) {
      return parseInt(monthsMatch[1], 10);
    } else if (yearsMatch) {
      return parseInt(yearsMatch[1], 10) * 12;
    } else {
      const numericMatch = term.match(/(\d+)/);
      if (numericMatch) {
        return parseInt(numericMatch[1], 10);
      }
    }

    return 0;
  }

  // Actualizar los datos de la propuesta cuando cambia la solicitud seleccionada
  useEffect(() => {
    if (loan) {
      setProposalData(prev => ({
        ...prev,
        amount: loan.amount,
        amortizationFrequency: loan.payment,
        deadline: parseTermToMonths(loan.term)
      }));
    }
  }, [loan]);

  const updateProposal = (fields: Partial<ProposalFormData>) => {
    setProposalData(prev => ({ ...prev, ...fields }));
  };

  const validateProposal = (): string[] => {
    const errors: string[] = [];
    if (proposalData.amount <= 0) errors.push('El monto debe ser mayor a 0');
    if (proposalData.interestRate < 0) errors.push('La tasa de interés es requerida');
    if (proposalData.deadline <= 0) errors.push('El plazo debe ser mayor a 0');
    if (!proposalData.amortizationFrequency) errors.push('La frecuencia de pago es requerida');
    if (proposalData.amortization <= 0) errors.push('El monto de amortización es requerido');
    if (proposalData.comision < 0) errors.push('La comisión no puede ser negativa');
    if (proposalData.medicalBalance < 0) errors.push('El seguro de vida en pesos es requerido');
    return errors;
  };

  const submitProposal = async () => {
    if (!loan) return;

    const errors = validateProposal();
    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/createPropuesta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...proposalData,
          solicitudId: loan.id,
          userId: loan.userId,
          requestInfo: {
            originalAmount: loan.amount,
            originalTerm: loan.term,
            originalPayment: loan.payment,
            purpose: loan.purpose,
            type: loan.type
          }
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar la propuesta');
      }

      return true;
    } catch (err: any) {
      setError(err.message || 'Error al enviar la propuesta');
      console.error('Error al enviar la propuesta:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetProposal = () => {
    setProposalData({
      company: '',
      amount: loan?.amount || 0,
      comision: 0,
      amortizationFrequency: loan?.payment || 'mensual',
      amortization: 0,
      lenderId: '',
      deadline: parseTermToMonths(loan?.term || ''),
      interestRate: -1,
      medicalBalance: -1
    });
    setError(null);
  };

  return {
    proposalData,
    updateProposal,
    validateProposal,
    submitProposal,
    loading,
    error,
    resetProposal
  };
}
