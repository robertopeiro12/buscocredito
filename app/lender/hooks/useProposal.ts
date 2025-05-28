// hooks/useProposal.ts
import { useState, useEffect } from 'react';
import { getFirestore, addDoc, collection } from 'firebase/firestore';
import type { ProposalData, LoanRequest } from '../types/loan.types';

export function useProposal(loan: LoanRequest | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposalData, setProposalData] = useState<ProposalData>({
    company: '',
    amount: loan?.amount || 0,
    comision: 0, // Comisión en pesos (MXN)
    amortization_frequency: loan?.payment || 'mensual',
    amortization: 0, // Monto de amortización en pesos (MXN)
    partner: '',
    deadline: parseTermToMonths(loan?.term || ''),
    interest_rate: -1,
    medical_balance: -1
  });

  // Función para convertir el término de la solicitud a meses
  function parseTermToMonths(term: string): number {
    // Si el término está en formato "X meses" o "X años"
    const monthsMatch = term.match(/(\d+)\s*meses?/i);
    const yearsMatch = term.match(/(\d+)\s*años?/i);

    if (monthsMatch) {
      return parseInt(monthsMatch[1], 10);
    } else if (yearsMatch) {
      return parseInt(yearsMatch[1], 10) * 12;
    } else {
      // Si solo es un número, asumimos que son meses
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
        amortization_frequency: loan.payment,
        deadline: parseTermToMonths(loan.term)
      }));
    }
  }, [loan]);

  const updateProposal = (fields: Partial<ProposalData>) => {
    setProposalData(prev => ({ ...prev, ...fields }));
  };

  const validateProposal = (): string[] => {
    const errors: string[] = [];
    if (proposalData.amount <= 0) errors.push('El monto debe ser mayor a 0');
    if (proposalData.interest_rate < 0) errors.push('La tasa de interés es requerida');
    if (proposalData.deadline <= 0) errors.push('El plazo debe ser mayor a 0');
    if (!proposalData.amortization_frequency) errors.push('La frecuencia de pago es requerida');
    if (proposalData.amortization <= 0) errors.push('El monto de amortización es requerido');
    if (proposalData.comision < 0) errors.push('La comisión no puede ser negativa');
    if (proposalData.medical_balance < 0) errors.push('El seguro de vida en pesos es requerido');
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
      const db = getFirestore();
      await addDoc(collection(db, 'propuestas'), {
        ...proposalData,
        loanId: loan.id,
        userId: loan.userId,
        status: 'pending',
        createdAt: new Date(),
        // Incluir información adicional de la solicitud para referencia
        requestInfo: {
          originalAmount: loan.amount,
          originalTerm: loan.term,
          originalPayment: loan.payment,
          purpose: loan.purpose,
          type: loan.type
        }
      });

      return true;
    } catch (err) {
      setError('Error al enviar la propuesta');
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
      comision: 0, // Comisión en pesos (MXN)
      amortization_frequency: loan?.payment || 'mensual',
      amortization: 0, // Monto de amortización en pesos (MXN)
      partner: '',
      deadline: parseTermToMonths(loan?.term || ''),
      interest_rate: -1,
      medical_balance: -1
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