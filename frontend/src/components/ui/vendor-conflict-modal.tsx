import { AlertTriangle, ShoppingBag, X } from 'lucide-react';
import { Button } from './button';

interface VendorConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentVendor: string;
  newVendor: string;
  className?: string;
}

export function VendorConflictModal({
  isOpen,
  onClose,
  onConfirm,
  currentVendor,
  newVendor,
  className = ''
}: VendorConflictModalProps) {
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Один продавец на заказ
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            В корзине уже есть товары от <strong>{currentVendor}</strong>. 
            Добавление товара от <strong>{newVendor}</strong> заменит текущий заказ.
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Это правило помогает заведениям готовить заказы быстрее и эффективнее.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Отмена
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Заменить заказ
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}

