import { offers, borrowDetails } from '@/config/data';
import OfferDetails from '@/components/OfferDetails';
import { notFound } from 'next/navigation';

export default function OfferPage({ params }: { params: { id: string } }) {
  const offer = offers.find((o) => o.id === params.id);
  
  if (!offer) {
    notFound();
  }

  const details = borrowDetails[offer.userId];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Offer Details</h1>
      <OfferDetails offer={offer} borrowDetails={details} />
    </div>
  );
}

