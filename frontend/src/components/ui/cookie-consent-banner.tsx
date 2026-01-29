import React, { useState, useEffect } from 'react';
import { DocumentsModal } from '@/components/ui/documents-modal';

const STORAGE_KEY = 'kp_cookie_consent';

export function CookieConsentBanner() {
    const [visible, setVisible] = useState(false);
    const [docsOpen, setDocsOpen] = useState(false);

    useEffect(() => {
        try {
            const accepted = typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY);
            setVisible(!accepted);
        } catch {
            setVisible(false);
        }
    }, []);

    const accept = () => {
        try {
            if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, '1');
            setVisible(false);
        } catch {
            setVisible(false);
        }
    };

    if (!visible) return null;

    return (
        <>
            <div className="cookie-consent-banner" role="dialog" aria-label="Согласие на использование cookie">
                <p className="cookie-consent-banner__text">
                    Мы используем файлы cookie для работы сайта и авторизации.{' '}
                    <button
                        type="button"
                        className="cookie-consent-banner__link"
                        onClick={() => setDocsOpen(true)}
                    >
                        Подробнее
                    </button>
                </p>
                <button
                    type="button"
                    className="cookie-consent-banner__btn"
                    onClick={accept}
                >
                    Принять
                </button>
            </div>
            <DocumentsModal
                isOpen={docsOpen}
                onClose={() => setDocsOpen(false)}
                initialTab="cookie"
            />
        </>
    );
}
