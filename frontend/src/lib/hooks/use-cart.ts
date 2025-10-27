import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axiosInstance';
import { notify } from '@/lib/notifications';
import type { CartItemWithDetails, AddToCartData, UpdateCartItemData } from '@/lib/schemas/cart';

// Cart API functions
const cartApi = {
  getCart: () => axiosInstance.get('/customer/cart'),
  addToCart: (data: AddToCartData) => axiosInstance.post('/customer/cart', data),
  updateCartItem: (data: UpdateCartItemData) => axiosInstance.put('/customer/cart', data),
  removeFromCart: (offerId: number) => axiosInstance.delete(`/customer/cart/${offerId}`),
  clearCart: () => axiosInstance.delete('/customer/cart'),
};

// Query keys
export const cartKeys = {
  all: ['cart'] as const,
  items: () => [...cartKeys.all, 'items'] as const,
};

// Custom hook for cart management
export const useCart = () => {
  const queryClient = useQueryClient();

  // Get cart items
  const {
    data: cartData,
    isLoading: isCartLoading,
    error: cartError
  } = useQuery({
    queryKey: cartKeys.items(),
    queryFn: cartApi.getCart,
    select: (res) => res.data.data as CartItemWithDetails[],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const cartItems = cartData || [];

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: cartApi.addToCart,
    onSuccess: (response) => {
      console.log('✅ Товар добавлен в корзину:', response.data);
      queryClient.invalidateQueries({ queryKey: cartKeys.items() });
      notify.success('Товар добавлен', 'Товар успешно добавлен в корзину!');
    },
    onError: (error: any) => {
      console.error('❌ Ошибка добавления в корзину:', error);
      notify.error('Ошибка', error.response?.data?.error || 'Не удалось добавить товар в корзину');
    },
  });

  // Update cart item mutation
  const updateCartItemMutation = useMutation({
    mutationFn: cartApi.updateCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.items() });
      notify.success('Корзина обновлена', 'Количество товара изменено');
    },
    onError: (error: any) => {
      console.error('❌ Ошибка обновления корзины:', error);
      notify.error('Ошибка', error.response?.data?.error || 'Не удалось обновить корзину');
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: cartApi.removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.items() });
      notify.success('Товар удален', 'Товар удален из корзины');
    },
    onError: (error: any) => {
      console.error('❌ Ошибка удаления из корзины:', error);
      notify.error('Ошибка', error.response?.data?.error || 'Не удалось удалить товар из корзины');
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.items() });
      notify.success('Корзина очищена', 'Все товары удалены из корзины');
    },
    onError: (error: any) => {
      console.error('❌ Ошибка очистки корзины:', error);
      notify.error('Ошибка', error.response?.data?.error || 'Не удалось очистить корзину');
    },
  });

  // Helper functions
  const addToCart = (data: AddToCartData) => {
    addToCartMutation.mutate(data);
  };

  const updateCartItem = (data: UpdateCartItemData) => {
    updateCartItemMutation.mutate(data);
  };

  const removeFromCart = (offerId: number) => {
    removeFromCartMutation.mutate(offerId);
  };

  const clearCart = () => {
    clearCartMutation.mutate();
  };

  // Check if cart has items from different business
  const hasDifferentBusiness = (businessId: number) => {
    if (cartItems.length === 0) return false;
    return cartItems.some(item => item.business_id !== businessId);
  };

  // Get current business ID from cart
  const getCurrentBusinessId = () => {
    return cartItems[0]?.business_id || null;
  };

  // Calculate total price
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.offer.discounted_price * item.quantity);
    }, 0);
  };

  // Calculate total items count
  const getTotalItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    // Data
    cartItems,
    isCartLoading,
    cartError,
    
    // Mutations
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    
    // Mutation states
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingCart: updateCartItemMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
    
    // Helper functions
    hasDifferentBusiness,
    getCurrentBusinessId,
    getTotalPrice,
    getTotalItemsCount,
  };
};
