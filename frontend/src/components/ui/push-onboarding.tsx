import { useEffect, useState } from 'react';
import { registerPush, getPushState, shouldShowOnboarding, markOnboardingDismissed } from '@/lib/push';
import { Button } from './button';

export function PushOnboarding() {
  const [visible, setVisible] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const [state, setState] = useState(getPushState());

  useEffect(() => {
    setState(getPushState());
    if (shouldShowOnboarding()) setVisible(true);
  }, []);

  if (state === 'granted' || state === 'denied' || state === 'unsupported') return null;
  if (!visible) return null;

  return (
    <div className="fixed bottom-16 inset-x-0 z-40 px-4 pb-safe">
      {/* Soft banner */}
      <div className="kp-card border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">🔔</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 dark:text-white">Включить уведомления</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Будем напоминать о лучших предложениях рядом</div>
            <div className="mt-3 flex items-center gap-2">
              <Button className="bg-primary-500 hover:bg-primary-600 text-white" onClick={() => setExplainOpen(true)}>Подробнее</Button>
              <Button variant="ghost" onClick={() => { setVisible(false); markOnboardingDismissed(); }}>Позже</Button>
            </div>
          </div>
        </div>
      </div>

      {explainOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setExplainOpen(false)} />
          <div role="dialog" aria-modal="true" aria-labelledby="push-explain-title" className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div id="push-explain-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Почему это важно</div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Мы пришлём уведомление, когда поблизости появятся новые предложения. Разрешение можно поменять в настройках браузера.</p>
            <div className="flex gap-2">
              <Button autoFocus variant="outline" className="flex-1" onClick={() => setExplainOpen(false)} aria-label="Отмена">Отмена</Button>
              <Button className="flex-1 bg-primary-500 hover:bg-primary-600 text-white" aria-label="Разрешить уведомления" onClick={async () => {
                const ok = await registerPush();
                setState(getPushState());
                setExplainOpen(false);
                setVisible(false);
                markOnboardingDismissed();
              }}>Разрешить</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


