import React from 'react';
import { Award, Zap, Shield, Leaf, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QualityBadge {
  key: string;
  awarded_at?: string;
  expires_at?: string | null;
  metadata?: Record<string, any>;
}

interface QualityBadgeProps {
  badge: QualityBadge;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const BADGE_CONFIG: Record<string, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  description: string;
  criteria: string;
}> = {
  top_rated: {
    label: 'Топ рейтинг',
    icon: Award,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800',
    description: 'Высокий рейтинг и много отзывов',
    criteria: 'Рейтинг ≥ 4.5 и минимум 10 отзывов'
  },
  fast_delivery: {
    label: 'Быстрая выдача',
    icon: Zap,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800',
    description: 'Своевременная выдача заказов',
    criteria: '≥ 90% своевременной выдачи и минимум 20 заказов'
  },
  reliable: {
    label: 'Надежный',
    icon: Shield,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
    description: 'Низкий процент инцидентов',
    criteria: '< 5% отмен и минимум 50 заказов'
  },
  eco_champion: {
    label: 'Эко-чемпион',
    icon: Leaf,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800',
    description: 'Предотвращение пищевых отходов',
    criteria: '≥ 100 завершенных заказов'
  },
  quick_response: {
    label: 'Быстрый ответ',
    icon: MessageSquare,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800',
    description: 'Быстрое подтверждение заказов',
    criteria: 'Среднее время ответа < 1 часа и минимум 10 заказов'
  }
};

export const QualityBadge: React.FC<QualityBadgeProps> = ({
  badge,
  size = 'md',
  showTooltip = false,
  className = ''
}) => {
  const config = BADGE_CONFIG[badge.key];
  
  if (!config) {
    return null; // Неизвестный бейдж
  }

  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border',
        config.bgColor,
        config.color,
        sizeClasses[size],
        className
      )}
      title={showTooltip ? `${config.label}: ${config.description}` : undefined}
    >
      <Icon className={iconSizeClasses[size]} />
      <span className="font-medium">{config.label}</span>
    </div>
  );
};

interface QualityBadgesListProps {
  badges: QualityBadge[];
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  showDescriptions?: boolean;
  className?: string;
}

export const QualityBadgesList: React.FC<QualityBadgesListProps> = ({
  badges,
  size = 'md',
  showTooltip = false,
  showDescriptions = false,
  className = ''
}) => {
  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {badges.map((badge, index) => {
        const config = BADGE_CONFIG[badge.key];
        if (!config) return null;

        return (
          <div key={index} className="relative group">
            <QualityBadge
              badge={badge}
              size={size}
              showTooltip={showTooltip}
            />
            {showDescriptions && (
              <div className="absolute left-0 top-full mt-2 z-50 w-64 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="font-semibold text-gray-900 dark:text-white mb-1">
                  {config.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {config.description}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Критерии:</strong> {config.criteria}
                </div>
                {badge.metadata && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                    {Object.entries(badge.metadata).map(([key, value]) => (
                      <div key={key}>
                        {key === 'avg_rating' && `Рейтинг: ${value}`}
                        {key === 'total_reviews' && `Отзывов: ${value}`}
                        {key === 'on_time_rate' && `Своевременность: ${value}%`}
                        {key === 'incident_rate' && `Инциденты: ${value}%`}
                        {key === 'completed_orders' && `Заказов: ${value}`}
                        {key === 'avg_response_hours' && `Время ответа: ${value}ч`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Компактная версия бейджа для использования в списках
interface QualityBadgeCompactProps {
  business: {
    badges?: QualityBadge[];
    is_top?: boolean;
  };
  className?: string;
}

export const QualityBadgeCompact: React.FC<QualityBadgeCompactProps> = ({
  business,
  className = ''
}) => {
  // Показываем первый бейдж или используем is_top как индикатор
  const firstBadge = business.badges && business.badges.length > 0 
    ? business.badges[0] 
    : business.is_top 
      ? { key: 'top_rated' as const } 
      : null;

  if (!firstBadge) {
    return null;
  }

  const config = BADGE_CONFIG[firstBadge.key];
  if (!config) {
    return null;
  }

  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] gap-0.5',
        config.bgColor,
        config.color,
        className
      )}
      title={config.label}
    >
      <Icon className="w-2.5 h-2.5" />
    </div>
  );
};