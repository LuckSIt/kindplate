import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru';

dayjs.extend(relativeTime);
dayjs.locale('ru');

interface CountdownTimerProps {
  endTime: string; // ISO string
  className?: string;
  onExpired?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  endTime,
  className = '',
  onExpired
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const updateTimer = () => {
      const now = dayjs();
      const end = dayjs(endTime);
      const diff = end.diff(now);

      if (diff <= 0) {
        setTimeLeft('Время истекло');
        setIsExpired(true);
        onExpired?.();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}ч ${minutes}м`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}м ${seconds}с`);
      } else {
        setTimeLeft(`${seconds}с`);
      }

      animationFrameRef.current = requestAnimationFrame(updateTimer);
    };

    updateTimer();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [endTime, onExpired]);

  if (isExpired) {
    return (
      <div className={`flex items-center gap-1 text-red-500 ${className}`}>
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Время истекло</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 text-orange-500 ${className}`}>
      <Clock className="w-4 h-4" />
      <span className="text-sm font-medium">До {timeLeft}</span>
    </div>
  );
};
