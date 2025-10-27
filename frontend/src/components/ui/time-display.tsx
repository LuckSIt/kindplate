import React from 'react';
import { Clock, Calendar } from 'lucide-react';

interface TimeDisplayProps {
  time: string;
  date?: string;
  showIcon?: boolean;
  format?: 'time' | 'datetime' | 'relative';
  className?: string;
}

export function TimeDisplay({
  time,
  date,
  showIcon = true,
  format = 'time',
  className = ''
}: TimeDisplayProps) {
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'только что';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} мин. назад`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ч. назад`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} дн. назад`;
    } else {
      return formatDate(dateString);
    }
  };

  const renderContent = () => {
    switch (format) {
      case 'time':
        return formatTime(time);
      case 'datetime':
        return date ? `${formatTime(time)} • ${formatDate(date)}` : formatTime(time);
      case 'relative':
        return date ? getRelativeTime(date) : formatTime(time);
      default:
        return formatTime(time);
    }
  };

  return (
    <div className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 ${className}`}>
      {showIcon && (
        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      )}
      <span>{renderContent()}</span>
    </div>
  );
}

interface TimeRangeProps {
  startTime: string;
  endTime: string;
  showIcon?: boolean;
  className?: string;
}

export function TimeRange({
  startTime,
  endTime,
  showIcon = true,
  className = ''
}: TimeRangeProps) {
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <div className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 ${className}`}>
      {showIcon && (
        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      )}
      <span>
        {formatTime(startTime)} - {formatTime(endTime)}
      </span>
    </div>
  );
}

interface CountdownProps {
  targetTime: string;
  onExpire?: () => void;
  className?: string;
}

export function Countdown({
  targetTime,
  onExpire,
  className = ''
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = React.useState<string>('');

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(targetTime);
      const difference = target.getTime() - now.getTime();

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (hours > 0) {
          return `${hours}ч ${minutes}м ${seconds}с`;
        } else if (minutes > 0) {
          return `${minutes}м ${seconds}с`;
        } else {
          return `${seconds}с`;
        }
      } else {
        onExpire?.();
        return 'Время истекло';
      }
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetTime, onExpire]);

  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${className}`}>
      <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
      <span className="text-orange-600 dark:text-orange-400">{timeLeft}</span>
    </div>
  );
}



