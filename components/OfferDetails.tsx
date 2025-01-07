'use client'

import { Offer, BorrowDetails } from '@/config/data';

interface OfferDetailsProps {
  offer: Offer;
  borrowDetails: BorrowDetails;
}

export default function OfferDetails({ offer, borrowDetails }: OfferDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-2xl font-semibold mb-4">Offer Details</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold mb-2">Offer Information</h3>
          <p>Amount: ${offer.amount}</p>
          <p>Interest Rate: {offer.interestRate}%</p>
          <p>Term: {offer.term} months</p>
          <p>Created At: {new Date(offer.createdAt).toLocaleString()}</p>
          <span className="inline-block mt-2 px-2 py-1 text-sm rounded-full bg-gray-200">
            {offer.status}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Borrower Details</h3>
          <p>Credit Score: {borrowDetails.creditScore}</p>
          <p>Income: ${borrowDetails.income}</p>
          <p>Employment Status: {borrowDetails.employmentStatus}</p>
          <p>Debt-to-Income Ratio: {(borrowDetails.debtToIncomeRatio * 100).toFixed(2)}%</p>
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-4">
        <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors">
          Reject
        </button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          Accept
        </button>
      </div>
    </div>
  );
}

