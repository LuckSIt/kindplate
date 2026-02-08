import { useEffect, useState } from 'react';
import { X, Bell } from 'lucide-react';
import { registerPush, getPushState, shouldShowOnboarding, markOnboardingDismissed } from '@/lib/push';
import { KP_MODAL } from '@/lib/kp-modal-style';

export function PushOnboarding() {
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState(getPushState());
  const [loading, setLoading] = useState(false);

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
        className="fixed inset-0 z-[9998]"
        style={KP_MODAL.backdrop}
        onClick={handleDismiss}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="push-onboarding-title"
          className="w-full max-w-[340px] rounded-2xl overflow-hidden"
          style={KP_MODAL.card}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end pt-3 pr-3">
            <button
              onClick={handleDismiss}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-95"
              style={{ color: KP_MODAL.textMuted }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = KP_MODAL.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = KP_MODAL.textMuted;
              }}
              aria-label="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 pb-4 -mt-1 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: KP_MODAL.primaryRgba }}
            >
              <Bell className="w-6 h-6" style={{ color: KP_MODAL.primary }} />
            </div>
            <div>
              <h2
                id="push-onboarding-title"
                className="font-bold"
                style={{
                  fontSize: '19px',
                  letterSpacing: '-0.3px',
                  lineHeight: '24px',
                  color: KP_MODAL.text,
                }}
              >
                Включить уведомления
              </h2>
              <p
                className="mt-0.5"
                style={{ fontSize: '14px', lineHeight: '20px', color: KP_MODAL.textMuted }}
              >
                Будем напоминать о лучших предложениях рядом
              </p>
            </div>
          </div>

          <div className="mx-6 h-px" style={{ background: KP_MODAL.divider }} />

          <div className="px-6 py-4">
            <p
              className="text-[14px] leading-relaxed"
              style={{ color: KP_MODAL.textMuted }}
            >
              Мы пришлём уведомление, когда поблизости появятся новые предложения. Разрешение можно изменить в настройках браузера.
            </p>
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={handleAllow}
              disabled={loading}
              className="flex-1 h-12 rounded-xl font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-70"
              style={{
                background: KP_MODAL.primary,
                boxShadow: '0 4px 16px rgba(0, 25, 0, 0.4)',
                fontSize: '15px',
              }}
              aria-label="Разрешить уведомления"
            >
              {loading ? '…' : 'Разрешить'}
            </button>
            <button
              onClick={handleDismiss}
              className="h-12 px-6 rounded-xl font-medium transition-all active:scale-[0.98]"
              style={{
                background: KP_MODAL.btnSecondary,
                border: `1px solid ${KP_MODAL.btnSecondaryBorder}`,
                color: KP_MODAL.textMuted,
                fontSize: '15px',
              }}
            >
              Позже
            </button>
          </div>
        </div>
      </div>
    </>
  );
}


