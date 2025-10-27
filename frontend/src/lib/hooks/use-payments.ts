import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axiosInstance';
import { notify } from '@/lib/notifications';

export interface PaymentData {
  orderId: number;
  paymentMethod: 'yookassa' | 'sbp' | 'cash';
  returnUrl?: string;
}

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  payment_method: string;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  payment_url?: string;
  created_at: string;
  updated_at: string;
}

export const usePayments = () => {
  const queryClient = useQueryClient();

  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: PaymentData) => {
      const response = await axiosInstance.post('/payments/create', paymentData);
      return response.data.data;
    },
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      notify.success('Платеж создан', 'Перенаправляем на страницу оплаты');
    },
    onError: (error: any) => {
      console.error("Failed to create payment:", error);
      notify.error('Ошибка', error.response?.data?.message || 'Не удалось создать платеж');
    },
  });

  const getPaymentStatus = async (orderId: number): Promise<Payment> => {
    const response = await axiosInstance.get(`/payments/order/${orderId}/status`);
    return response.data.data;
  };

  const getPaymentStatusQuery = (orderId: number) => {
    return useQuery({
      queryKey: ['paymentStatus', orderId],
      queryFn: () => getPaymentStatus(orderId),
      enabled: !!orderId,
      refetchInterval: 5000, // Проверяем статус каждые 5 секунд
    });
  };

  return {
    createPayment: createPaymentMutation.mutate,
    isCreatingPayment: createPaymentMutation.isPending,
    getPaymentStatus,
    getPaymentStatusQuery,
  };
};
