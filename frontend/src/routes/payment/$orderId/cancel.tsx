import { createFileRoute } from '@tanstack/react-router';
import { PaymentCancelPage } from '@/components/pages/payment-cancel-page';

export const Route = createFileRoute('/payment/$orderId/cancel')({
  component: () => {
    const { orderId } = Route.useParams();
    return <PaymentCancelPage orderId={orderId} />;
  },
});