import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axiosInstance';
import { notify } from '@/lib/notifications';
import type { OrderDraft, UpdateOrderData, ConfirmOrderData, PaymentData } from '@/lib/schemas/order';

// Order API functions
const orderApi = {
  getConfig: () => axiosInstance.get('/orders/config'),
  createDraft: (data: OrderDraft) => axiosInstance.post('/orders/draft', data),
  updateOrder: (id: number, data: UpdateOrderData) => axiosInstance.patch(`/orders/${id}`, data),
  confirmOrder: (id: number, data: ConfirmOrderData) => axiosInstance.post(`/orders/${id}/confirm`, data),
  getOrders: () => axiosInstance.get('/orders'),
  getOrder: (id: number) => axiosInstance.get(`/orders/${id}`),
};

const paymentApi = {
  createPayment: (data: PaymentData) => axiosInstance.post('/payments/create', data),
  getPaymentStatus: (paymentId: number) => axiosInstance.get(`/payments/${paymentId}/status`),
  getPaymentStatusByOrder: (orderId: number) => axiosInstance.get(`/payments/order/${orderId}/status`),
  getPayments: () => axiosInstance.get('/payments'),
};

// Query keys
export const orderKeys = {
  all: ['orders'] as const,
  config: () => [...orderKeys.all, 'config'] as const,
  list: () => [...orderKeys.all, 'list'] as const,
  detail: (id: number) => [...orderKeys.all, 'detail', id] as const,
};

export const paymentKeys = {
  all: ['payments'] as const,
  list: () => [...paymentKeys.all, 'list'] as const,
  detail: (id: number) => [...paymentKeys.all, 'detail', id] as const,
};

// Custom hook for order management
export const useOrders = () => {
  const queryClient = useQueryClient();

  // Get order configuration
  const {
    data: configData,
    isLoading: isConfigLoading,
    error: configError
  } = useQuery({
    queryKey: orderKeys.config(),
    queryFn: orderApi.getConfig,
    select: (res) => res.data.data,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get user orders
  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    error: ordersError
  } = useQuery({
    queryKey: orderKeys.list(),
    queryFn: orderApi.getOrders,
    select: (res) => res.data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const orders = ordersData || [];

  // Create order draft mutation
  const createDraftMutation = useMutation({
    mutationFn: orderApi.createDraft,
    onSuccess: (response) => {
      console.log('✅ Черновик заказа создан:', response.data);
      queryClient.invalidateQueries({ queryKey: orderKeys.list() });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      notify.success('Заказ создан', 'Черновик заказа успешно создан!');
    },
    onError: (error: any) => {
      console.error('❌ Ошибка создания заказа:', error);
      notify.error('Ошибка', error.response?.data?.error || 'Не удалось создать заказ');
    },
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOrderData }) => 
      orderApi.updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.list() });
      notify.success('Заказ обновлен', 'Заказ успешно обновлен');
    },
    onError: (error: any) => {
      console.error('❌ Ошибка обновления заказа:', error);
      notify.error('Ошибка', error.response?.data?.error || 'Не удалось обновить заказ');
    },
  });

  // Confirm order mutation
  const confirmOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ConfirmOrderData }) => 
      orderApi.confirmOrder(id, data),
    onSuccess: (response) => {
      console.log('✅ Заказ подтвержден:', response.data);
      queryClient.invalidateQueries({ queryKey: orderKeys.list() });
      notify.success('Заказ подтвержден', 'Заказ успешно подтвержден!');
    },
    onError: (error: any) => {
      console.error('❌ Ошибка подтверждения заказа:', error);
      notify.error('Ошибка', error.response?.data?.error || 'Не удалось подтвердить заказ');
    },
  });

  // Helper functions
  const createDraft = (data: OrderDraft) => {
    createDraftMutation.mutate(data);
  };

  const updateOrder = (id: number, data: UpdateOrderData) => {
    updateOrderMutation.mutate({ id, data });
  };

  const confirmOrder = (id: number, data: ConfirmOrderData) => {
    confirmOrderMutation.mutate({ id, data });
  };

  return {
    // Data
    config: configData,
    orders,
    isConfigLoading,
    isOrdersLoading,
    configError,
    ordersError,
    
    // Mutations
    createDraft,
    updateOrder,
    confirmOrder,
    
    // Mutation states
    isCreatingDraft: createDraftMutation.isPending,
    isUpdatingOrder: updateOrderMutation.isPending,
    isConfirmingOrder: confirmOrderMutation.isPending,
  };
};

// Custom hook for payment management
export const usePayments = () => {
  const queryClient = useQueryClient();

  // Get user payments
  const {
    data: paymentsData,
    isLoading: isPaymentsLoading,
    error: paymentsError
  } = useQuery({
    queryKey: paymentKeys.list(),
    queryFn: paymentApi.getPayments,
    select: (res) => res.data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const payments = paymentsData || [];

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: paymentApi.createPayment,
    onSuccess: (response) => {
      console.log('✅ Платеж создан:', response.data);
      queryClient.invalidateQueries({ queryKey: paymentKeys.list() });
      queryClient.invalidateQueries({ queryKey: orderKeys.list() });
      // Убираем автоматическое уведомление, чтобы избежать спама
    },
    onError: (error: any) => {
      console.error('❌ Ошибка создания платежа:', error);
      notify.error('Ошибка', error.response?.data?.error || 'Не удалось создать платеж');
    },
  });

  // Helper functions
  const createPayment = async (data: PaymentData) => {
    return new Promise((resolve, reject) => {
      createPaymentMutation.mutate(data, {
        onSuccess: (response) => {
          resolve(response.data.data);
        },
        onError: (error) => {
          reject(error);
        }
      });
    });
  };

  const getPaymentStatus = async (orderId: number) => {
    const response = await paymentApi.getPaymentStatusByOrder(orderId);
    return response.data.data;
  };

  return {
    // Data
    payments,
    isPaymentsLoading,
    paymentsError,
    
    // Mutations
    createPayment,
    getPaymentStatus,
    
    // Mutation states
    isCreatingPayment: createPaymentMutation.isPending,
  };
};
