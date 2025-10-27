import { createFileRoute } from '@tanstack/react-router';
import { OfferForm } from '@/components/pages/offer-form';

export const Route = createFileRoute('/biz/offers/create')({
  component: OfferForm,
});
