// hooks/useProposal.ts
import { useState } from 'react';
import { getFirestore, addDoc, collection } from 'firebase/firestore';
import type { ProposalData, LoanRequest } from '../types/loan.types';

export function useProposal(loan: LoanRequest | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposalData, setProposalData] = useState<ProposalData>({
    company: '',
    amount: loan?.amount || 0,
    comision: 0,
    amortization: 'mensual',
    partner: '',
    deadline: 0,
    interest_rate: -1,
    medical_balance: -1
  });

  const updateProposal = (fields: Partial<ProposalData>) => {
    setProposalData(prev => ({ ...prev, ...fields }));
  };

  const validateProposal = (): string[] => {
    const errors: string[] = [];
    if (proposalData.amount <= 0) errors.push('El monto debe ser mayor a 0');
    if (proposalData.interest_rate < 0) errors.push('La tasa de interés es requerida');
    if (proposalData.deadline <= 0) errors.push('El plazo debe ser mayor a 0');
    if (!proposalData.amortization) errors.push('La forma de pago es requerida');
    if (proposalData.comision < 0) errors.push('La comisión no puede ser negativa');
    if (proposalData.medical_balance < 0) errors.push('El seguro de vida es requerido');
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
        createdAt: new Date()
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
      comision: 0,
      amortization: 'mensual',
      partner: '',
      deadline: 0,
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