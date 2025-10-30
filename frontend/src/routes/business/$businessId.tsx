import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axiosInstance';
import { BusinessHeader } from '@/components/ui/business-header';
import { OffersGrid } from '@/components/ui/offers-grid';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { notify } from '@/lib/notifications';
import type { Business, Offer } from '@/lib/types';

export const Route = createFileRoute("/business/$businessId")({
  component: BusinessPage,
});

function BusinessPage() {
  const { businessId } = Route.useParams();
  const navigate = useNavigate();
  const [isSticky, setIsSticky] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);

  // Fetch business data
  const { data: businessData, isLoading: businessLoading } = useQuery({
    queryKey: ['business', businessId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/customer/sellers`);
      const business = response.data.sellers.find((b: Business) => b.id === parseInt(businessId));
      if (!business) throw new Error('Business not found');
      return business;
    },
    enabled: !!businessId,
  });

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle offer selection
  const handleOfferClick = (offer: Offer) => {
    setSelectedOffer(offer);
    setOrderQuantity(1);
    setOrderDialogOpen(true);
  };

  // Handle order creation
  const handleCreateOrder = () => {
    if (selectedOffer && businessData) {
      const orderData = {
        items: [{
          offer_id: selectedOffer.id,
          quantity: orderQuantity,
          business_id: selectedOffer.business_id,
          title: selectedOffer.title,
          price: selectedOffer.discounted_price
        }],
        business_id: businessData.id,
        business_name: businessData.name,
        business_address: businessData.address,
        pickup_time_start: selectedOffer.pickup_time_start,
        pickup_time_end: selectedOffer.pickup_time_end,
        notes: ""
      };

      // TODO: Implement order creation
      console.log('Creating order:', orderData);
      notify.success("Заказ создан", "Ваш заказ успешно оформлен!");
      setOrderDialogOpen(false);
    }
  };

  if (businessLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-800" />
          <div className="p-4 space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!businessData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Заведение не найдено
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Возможно, оно было удалено или перемещено
          </p>
          <Button onClick={() => navigate({ to: '/home' })}>
            Вернуться на главную
          </Button>
        </div>
      </div>
    );
  }

  const offers = businessData.offers || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Header */}
      <BusinessHeader 
        business={businessData} 
        isSticky={isSticky}
      />

      {/* Main Content */}
      <div className={`${isSticky ? 'pt-24' : ''}`}>
        <div className="p-4">
          <OffersGrid
            offers={offers}
            onOfferClick={handleOfferClick}
            hasMore={false} // TODO: Implement pagination
            loading={false}
          />
        </div>
      </div>

      {/* Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Оформление заказа</DialogTitle>
            <DialogDescription>
              {selectedOffer?.title}
            </DialogDescription>
          </DialogHeader>

          {selectedOffer && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Количество:</span>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0"
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-semibold">{orderQuantity}</span>
                  <Button
                    onClick={() => setOrderQuantity(Math.min(selectedOffer.quantity_available, orderQuantity + 1))}
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  Итого: {(selectedOffer.discounted_price * orderQuantity).toFixed(0)}₽
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedOffer.discounted_price}₽ × {orderQuantity}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOrderDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleCreateOrder}
              className="bg-primary-500 hover:bg-primary-600"
            >
              Заказать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}