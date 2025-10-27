import { createFileRoute } from '@tanstack/react-router';
import { OfferPage } from '@/components/pages/offer-page';

export const Route = createFileRoute('/o/$offerId')({
  component: () => {
    const { offerId } = Route.useParams();
    return <OfferPage offerId={offerId} />;
  },
});