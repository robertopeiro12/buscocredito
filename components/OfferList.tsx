'use client'

import { Offer } from '@/config/data';

interface OfferListProps {
  offers: Offer[];
  onSelectOffer: (id: string) => void;
}

export default function OfferList({ offers, onSelectOffer }: OfferListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
      {offers.map((offer) => (
        <div
          key={offer.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer"
          onClick={() => onSelectOffer(offer.id)}
        >
          <h2 className="text-xl font-semibold mb-2">Offer #{offer.id}</h2>
          <p>Amount: ${offer.amount}</p>
          <p>Interest Rate: {offer.interestRate}%</p>
          <p>Term: {offer.term} months</p>
          <span className="inline-block mt-2 px-2 py-1 text-sm rounded-full bg-gray-200">
            {offer.status}
          </span>
        </div>
      ))}
    </div>
  );
}

