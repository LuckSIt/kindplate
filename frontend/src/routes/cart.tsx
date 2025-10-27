import { createFileRoute } from '@tanstack/react-router';
import { CartPage } from '@/components/pages/cart-page';

export const Route = createFileRoute('/cart')({
  component: CartPage,
});