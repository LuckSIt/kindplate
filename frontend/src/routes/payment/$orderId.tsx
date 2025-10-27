import { createFileRoute } from '@tanstack/react-router';
import { PaymentPage } from '@/components/pages/payment-page';

export const Route = createFileRoute('/payment/$orderId')({
  component: () => {
    const { orderId } = Route.useParams();
    return <PaymentPage orderId={orderId} />;
  },
});