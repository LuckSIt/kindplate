import React, { useState } from 'react';
import { Award, TrendingUp, Users, Star, CheckCircle } from 'lucide-react';
import type { Business } from '@/lib/types';

interface QualityBadgeProps {
  business: Business;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({
  business,
  size = 'md',
  showTooltip = true,
  className = ''
}) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Если не топовый продавец, не показываем бейдж
  if (!business.is_top) {
    return null;
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const metrics = business.quality_metrics || {
    total_orders: 0,
    completed_orders: 0,
    repeat_customers: 0,
    avg_rating: 0
  };

  const completionRate = metrics.total_orders > 0
    ? ((metrics.completed_orders / metrics.total_orders) * 100).toFixed(0)
    : 0;

  const repeatRate = metrics.total_orders > 0
    ? ((metrics.repeat_customers / metrics.total_orders) * 100).toFixed(0)
    : 0;

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Бейдж */}
      <div
        className={`
          inline-flex items-center gap-1.5
          ${sizeClasses[size]}
          bg-gradient-to-r from-amber-400 to-yellow-500
          text-white font-semibold rounded-full
          shadow-lg shadow-amber-500/50
          cursor-pointer
          transition-all duration-300
          hover:scale-105 hover:shadow-xl hover:shadow-amber-500/60
        `}
        onMouseEnter={() => showTooltip && setTooltipVisible(true)}
        onMouseLeave={() => showTooltip && setTooltipVisible(false)}
        onClick={() => showTooltip && setTooltipVisible(!tooltipVisible)}
      >
        <Award className={iconSizes[size]} />
        <span>Лучшие у нас</span>
      </div>

      {/* Tooltip */}
      {showTooltip && tooltipVisible && (
        <div
          className="absolute z-50 w-72 p-4 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 left-1/2 transform -translate-x-1/2"
          style={{ top: '100%' }}
        >
          {/* Стрелка */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 rotate-45" />

          {/* Контент */}
          <div className="relative space-y-3">
            {/* Заголовок */}
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-gray-900 dark:text-white">
                Почему "Лучшие у нас"?
              </h3>
            </div>

            {/* Метрики */}
            <div className="space-y-2">
              {/* Завершенные заказы */}
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {completionRate}% завершенных заказов
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {metrics.completed_orders} из {metrics.total_orders} заказов успешно выполнены
                  </div>
                </div>
              </div>

              {/* Средняя оценка */}
              <div className="flex items-start gap-2">
                <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Высокая оценка {metrics.avg_rating.toFixed(1)}★
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Клиенты довольны качеством
                  </div>
                </div>
              </div>

              {/* Повторные покупки */}
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {repeatRate}% повторных клиентов
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {metrics.repeat_customers} клиентов возвращаются снова
                  </div>
                </div>
              </div>

              {/* Общий балл качества */}
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Балл качества: {business.quality_score?.toFixed(0)}/100
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Рассчитывается на основе всех метрик
                  </div>
                </div>
              </div>
            </div>

            {/* Подсказка */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Бейдж "Лучшие у нас" получают только проверенные продавцы с высоким качеством обслуживания
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Компактная версия бейджа (только иконка)
export const QualityBadgeCompact: React.FC<{ business: Business; className?: string }> = ({
  business,
  className = ''
}) => {
  if (!business.is_top) {
    return null;
  }

  return (
    <div
      className={`
        inline-flex items-center justify-center
        w-6 h-6 rounded-full
        bg-gradient-to-r from-amber-400 to-yellow-500
        shadow-md shadow-amber-500/50
        ${className}
      `}
      title="Лучшие у нас"
    >
      <Award className="w-3.5 h-3.5 text-white" />
    </div>
  );
};




