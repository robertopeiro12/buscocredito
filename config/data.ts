export interface Offer {
    id: string;
    userId: string;
    amount: number;
    interestRate: number;
    term: number;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
  }
  
  export interface BorrowDetails {
    userId: string;
    creditScore: number;
    income: number;
    employmentStatus: string;
    debtToIncomeRatio: number;
  }
  
  export const offers: Offer[] = [
    {
      id: '1',
      userId: 'user1',
      amount: 5000,
      interestRate: 5.5,
      term: 12,
      status: 'pending',
      createdAt: '2023-04-01T10:00:00Z',
    },
    {
      id: '2',
      userId: 'user2',
      amount: 10000,
      interestRate: 6.0,
      term: 24,
      status: 'pending',
      createdAt: '2023-04-02T14:30:00Z',
    },
    {
      id: '3',
      userId: 'user3',
      amount: 7500,
      interestRate: 5.8,
      term: 18,
      status: 'pending',
      createdAt: '2023-04-03T09:15:00Z',
    },
  ];
  
  export const borrowDetails: Record<string, BorrowDetails> = {
    user1: {
      userId: 'user1',
      creditScore: 720,
      income: 60000,
      employmentStatus: 'Full-time',
      debtToIncomeRatio: 0.3,
    },
    user2: {
      userId: 'user2',
      creditScore: 680,
      income: 55000,
      employmentStatus: 'Part-time',
      debtToIncomeRatio: 0.35,
    },
    user3: {
      userId: 'user3',
      creditScore: 750,
      income: 75000,
      employmentStatus: 'Full-time',
      debtToIncomeRatio: 0.25,
    },
  };
  
  