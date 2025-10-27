import React from 'react';
import { AlertTriangle, ShoppingCart, Store } from 'lucide-react';
import { Button } from './button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import type { CartItemWithDetails } from '@/lib/schemas/cart';

interface CartReplacementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentCartItems: CartItemWithDetails[];
  newBusinessName: string;
  newOfferTitle: string;
}

export const CartReplacementDialog: React.FC<CartReplacementDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentCartItems,
  newBusinessName,
  newOfferTitle
}) => {
  const currentBusinessName = currentCartItems[0]?.offer.business.name || '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <DialogTitle className="text-lg">
              Корзина одного продавца
            </DialogTitle>
          </div>
          <DialogDescription className="text-left">
            В вашей корзине уже есть товары от другого продавца. 
            Добавление товара от <strong>{newBusinessName}</strong> заменит текущие товары.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Cart Items */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Store className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Текущая корзина ({currentCartItems.length} товар{currentCartItems.length !== 1 ? 'ов' : ''})
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Продавец: <strong>{currentBusinessName}</strong>
            </div>
            <div className="space-y-1">
              {currentCartItems.slice(0, 3).map((item) => (
                <div key={item.offer_id} className="flex justify-between text-sm">
                  <span className="truncate">{item.offer.title}</span>
                  <span className="text-gray-500">×{item.quantity}</span>
                </div>
              ))}
              {currentCartItems.length > 3 && (
                <div className="text-xs text-gray-500">
                  и еще {currentCartItems.length - 3} товар{currentCartItems.length - 3 !== 1 ? 'ов' : ''}...
                </div>
              )}
            </div>
          </div>

          {/* New Item */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Новый товар
              </span>
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Продавец: <strong>{newBusinessName}</strong>
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Товар: <strong>{newOfferTitle}</strong>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Отмена
          </Button>
          <Button
            onClick={onConfirm}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
          >
            Заменить корзину
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};



