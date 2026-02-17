import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import arrowBackIcon from "@/figma/arrow-back.svg";

export const Route = createFileRoute("/contacts")({
    component: ContactsPage,
});

function ContactsPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        // TODO: подключить API подписки на рассылку
        setEmail("");
    };

    return (
        <div className="contacts-page">
            <div className="contacts-page__header">
                <div className="contacts-page__header-floating">
                    <button
                        className="contacts-page__back-button"
                        onClick={() => (window.history.length > 1 ? window.history.back() : navigate({ to: "/account" }))}
                        aria-label="Назад"
                    >
                        <img src={arrowBackIcon} alt="Назад" className="contacts-page__back-button-icon" />
                    </button>
                    <div className="contacts-page__header-title-container">
                        <h1 className="contacts-page__header-name">Контакты</h1>
                    </div>
                </div>
            </div>

            <div className="contacts-page__content">
                <h2 className="contacts-page__title">Контакты:</h2>

                <div className="contacts-page__block">
                    <div className="contacts-page__label">Горячая линия:</div>
                    <a href="tel:+79990281207" className="contacts-page__value">8(999)028-12-07</a>
                </div>

                <div className="contacts-page__block">
                    <div className="contacts-page__label">Телеграмм канал:</div>
                    <a href="https://t.me/kindplate" target="_blank" rel="noopener noreferrer" className="contacts-page__value contacts-page__link">
                        t.me/kindplate
                    </a>
                </div>

                <div className="contacts-page__block">
                    <div className="contacts-page__label">Почта:</div>
                    <a href="mailto:kindplate.io@mail.ru" className="contacts-page__value contacts-page__link">
                        kindplate.io@mail.ru
                    </a>
                </div>

                <div className="contacts-page__block">
                    <div className="contacts-page__label">Instagram:</div>
                    <a href="https://instagram.com/kindplate" target="_blank" rel="noopener noreferrer" className="contacts-page__value contacts-page__link">
                        @kindplate
                    </a>
                </div>

                <div className="contacts-page__newsletter">
                    <div className="contacts-page__label">Подписаться на рассылку новостей:</div>
                    <form onSubmit={handleSubmit} className="contacts-page__form">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Ваш email"
                            className="contacts-page__input"
                            aria-label="Email для рассылки"
                        />
                        <button type="submit" className="contacts-page__submit">
                            Отправить
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
