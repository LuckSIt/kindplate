import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axiosInstance';
import { CartItem } from './cart-item';
import { CartSummary } from './cart-summary';
import { CartEmpty } from './cart-empty';
import { VendorConflictModal } from './vendor-conflict-modal';
import { notify } from '@/lib/notifications';
import { SkeletonCard } from './skeletons';
import type { Offer, Business } from '@/lib/types';

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToOffers: () => void;
  onCheckout: () => void;
  className?: string;
}

interface CartItemData {
  offer: Offer & { business?: Business };
  quantity: number;
  business?: Business;
}

export function CartSheet({
  isOpen,
  onClose,
  onGoToOffers,
  onCheckout,
  className = ''
}: CartSheetProps) {
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
    enabled: isOpen,
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
  const serviceFee = 0; // Сервисный сбор отключен
  const total = subtotal;
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
    onCheckout();
  };

  // Close overflow menus when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setVendorConflict(prev => ({ ...prev, isOpen: false }));
    }
  }, [isOpen]);

  const touchStartYRef = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartYRef.current == null) return;
    const delta = e.touches[0].clientY - touchStartYRef.current;
    if (delta > 60) {
      onClose();
      touchStartYRef.current = null;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className={`fixed bottom-0 left-0 right-0 z-60 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col ${className}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="cart-title" className="text-xl font-semibold text-gray-900 dark:text-white">
            Корзина
            {itemCount > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({itemCount} шт.)
              </span>
            )}
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : cartItems.length === 0 ? (
            <CartEmpty onGoToOffers={onGoToOffers} />
          ) : (
            <div className="p-6 space-y-4">
              {cartItems.map((item) => (
                <CartItem
                  key={item.offer.id}
                  offer={item.offer}
                  quantity={item.quantity}
                  businessName={item.business?.name || item.offer?.business?.name || 'Заведение'}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {cartItems.length > 0 && (
          <CartSummary
            subtotal={subtotal}
            serviceFee={serviceFee}
            total={total}
            itemCount={itemCount}
            onCheckout={handleCheckout}
            disabled={updateQuantityMutation.isPending || removeItemMutation.isPending}
          />
        )}
      </div>

      {/* Vendor Conflict Modal */}
      <VendorConflictModal
        isOpen={vendorConflict.isOpen}
        onClose={() => setVendorConflict(prev => ({ ...prev, isOpen: false }))}
        onConfirm={vendorConflict.onConfirm}
        currentVendor={vendorConflict.currentVendor}
        newVendor={vendorConflict.newVendor}
      />
    </>
  );
}

