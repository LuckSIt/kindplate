import { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  /** Текст, который «печатается» посимвольно */
  text: string;
  /** Задержка перед началом печати (мс) */
  delay?: number;
  /** Скорость печати — интервал между символами (мс) */
  speed?: number;
  /** Класс для обёртки текста */
  className?: string;
  /** Класс для мигающего курсора */
  cursorClassName?: string;
  /** Скрывать ли курсор после завершения печати */
  hideCursorOnComplete?: boolean;
  /** Колбэк при завершении печати */
  onComplete?: () => void;
}

/**
 * Текст с анимацией печати и мигающим курсором в конце.
 */
export function TypewriterText({
  text,
  delay = 0,
  speed = 60,
  className = '',
  cursorClassName = '',
  hideCursorOnComplete = false,
  onComplete,
}: TypewriterTextProps) {
  const [visibleLength, setVisibleLength] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!text) return;

    const startTimer = setTimeout(() => {
      setIsStarted(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [text, delay]);

  useEffect(() => {
    if (!isStarted || visibleLength >= text.length) return;

    const timer = setInterval(() => {
      setVisibleLength((prev) => {
        if (prev >= text.length) return prev;
        const next = prev + 1;
        if (next >= text.length) {
          setIsComplete(true);
        }
        return next;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [isStarted, visibleLength, text.length, speed]);

  useEffect(() => {
    if (isComplete) {
      onCompleteRef.current?.();
    }
  }, [isComplete]);

  const visibleText = text.slice(0, visibleLength);
  const shouldShowCursor = isStarted && !(isComplete && hideCursorOnComplete);

  return (
    <span className={className}>
      {visibleText}
      {shouldShowCursor && (
        <span
          className={`typewriter-cursor ${cursorClassName}`.trim()}
          aria-hidden="true"
        >
          |
        </span>
      )}
    </span>
  );
}
