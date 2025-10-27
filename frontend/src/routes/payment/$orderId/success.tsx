import { createFileRoute } from '@tanstack/react-router';
import { PaymentSuccessPage } from '@/components/pages/payment-success-page';

export const Route = createFileRoute('/payment/$orderId/success')({
  component: () => {
    const { orderId } = Route.useParams();
    return <PaymentSuccessPage orderId={orderId} />;
  },
});