import React from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Button } from './button';

interface EmptyOffersStateProps {
  onEnableNotifications?: () => void;
  className?: string;
}

export const EmptyOffersState: React.FC<EmptyOffersStateProps> = ({
  onEnableNotifications,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <Bell className="w-8 h-8 text-gray-400" />
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          Пока нет предложений
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          Заведение пока не добавило предложения на сегодня. 
          Включите уведомления, чтобы первыми узнавать о новых предложениях!
        </p>
        
        {/* CTA Button */}
        <Button
          onClick={onEnableNotifications}
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 flex items-center gap-2 mx-auto"
        >
          <BellRing className="w-4 h-4" />
          Включить уведомления
        </Button>
        
        {/* Additional Info */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Мы сообщим вам, когда появятся новые предложения
        </p>
      </div>
    </div>
  );
};



