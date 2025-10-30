import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axiosInstance';
import { CartItem } from '@/components/ui/cart-item';
import { CartSummary } from '@/components/ui/cart-summary';
import { CartEmpty } from '@/components/ui/cart-empty';
import { VendorConflictModal } from '@/components/ui/vendor-conflict-modal';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { notify } from '@/lib/notifications';
import type { Offer, Business } from '@/lib/types';

export const Route = createFileRoute("/cart/")({
  component: CartPage,
});

interface CartItemData {
  offer: Offer;
  quantity: number;
  business: Business;
}

function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [vendorConflict, setVendorConflict] = useState<{
    isOpen: boolean;
    currentVendor: string;
    newVendor: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    currentVendor: '',
    newVendor: '',
    onConfirm: () => {}
  });

  // Fetch cart data
  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await axiosInstance.get('/customer/cart');
      return response.data.data || [];
    },
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: ({ offerId, quantity }: { offerId: number; quantity: number }) =>
      axiosInstance.put('/customer/cart', { offer_id: offerId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      notify.error("Ошибка", error.response?.data?.message || "Не удалось обновить корзину");
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: (offerId: number) =>
      axiosInstance.delete(`/customer/cart/${offerId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      notify.success("Удалено", "Товар удален из корзины");
    },
    onError: (error: any) => {
      notify.error("Ошибка", error.response?.data?.message || "Не удалось удалить товар");
    },
  });

  // Process cart data
  const cartItems: CartItemData[] = cartData || [];
  const subtotal = cartItems.reduce((sum, item) => sum + (item.offer.discounted_price * item.quantity), 0);
  const serviceFee = subtotal * 0.05; // 5% service fee
  const total = subtotal + serviceFee;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Handle quantity change
  const handleQuantityChange = (offerId: number, quantity: number) => {
    updateQuantityMutation.mutate({ offerId, quantity });
  };

  // Handle item removal
  const handleRemoveItem = (offerId: number) => {
    removeItemMutation.mutate(offerId);
  };

  // Handle checkout
  const handleCheckout = () => {
    if (itemCount === 0) return;
    navigate({ to: '/checkout' });
  };

  // Handle go to offers
  const handleGoToOffers = () => {
    navigate({ to: '/home' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/home' })}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Корзина
            {itemCount > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({itemCount} шт.)
              </span>
            )}
          </h1>
          
          <div className="w-9" /> {/* Spacer */}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-24" />
              </div>
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <CartEmpty onGoToOffers={handleGoToOffers} />
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <CartItem
                key={item.offer.id}
                offer={item.offer}
                quantity={item.quantity}
                businessName={item.business.name}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fixed Summary */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 pb-safe">
          <CartSummary
            subtotal={subtotal}
            serviceFee={serviceFee}
            total={total}
            itemCount={itemCount}
            onCheckout={handleCheckout}
            disabled={updateQuantityMutation.isPending || removeItemMutation.isPending}
          />
        </div>
      )}

      {/* Vendor Conflict Modal */}
      <VendorConflictModal
        isOpen={vendorConflict.isOpen}
        onClose={() => setVendorConflict(prev => ({ ...prev, isOpen: false }))}
        onConfirm={vendorConflict.onConfirm}
        currentVendor={vendorConflict.currentVendor}
        newVendor={vendorConflict.newVendor}
      />
    </div>
  );
}