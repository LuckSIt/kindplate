import { useEffect, useState } from 'react';
import { registerPush, getPushState, shouldShowOnboarding, markOnboardingDismissed } from '@/lib/push';
import { DocumentsModal } from '@/components/ui/documents-modal';

/**
 * Плашка разрешения уведомлений в стиле cookie-баннера, но сверху.
 * Показывается только на странице карты (/home) для авторизованных пользователей.
 */
export function PushOnboarding() {
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState(getPushState());
  const [loading, setLoading] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);

  useEffect(() => {
    setState(getPushState());
    if (shouldShowOnboarding()) setVisible(true);
  }, []);

  if (state === 'granted' || state === 'denied' || state === 'unsupported') return null;
  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    markOnboardingDismissed();
  };

  const handleAllow = async () => {
    setLoading(true);
    await registerPush();
    setState(getPushState());
    setVisible(false);
    markOnboardingDismissed();
    setLoading(false);
  };

  return (
    <>
      <div
        className="notification-consent-banner"
        role="dialog"
        aria-label="Включить уведомления"
      >
        <p className="notification-consent-banner__text">
          Будем напоминать о лучших предложениях рядом.{' '}
          <button
            type="button"
            className="notification-consent-banner__link"
            onClick={() => setDocsOpen(true)}
          >
            Подробнее
          </button>
        </p>
        <div className="notification-consent-banner__actions">
          <button
            type="button"
            className="notification-consent-banner__btn notification-consent-banner__btn--secondary"
            onClick={handleDismiss}
          >
            Позже
          </button>
          <button
            type="button"
            className="notification-consent-banner__btn"
            onClick={handleAllow}
            disabled={loading}
            aria-label="Разрешить уведомления"
          >
            {loading ? '…' : 'Разрешить'}
          </button>
        </div>
      </div>
      <DocumentsModal
        isOpen={docsOpen}
        onClose={() => setDocsOpen(false)}
        initialTab="cookie"
      />
    </>
  );
}


