import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, Leaf, Users, Target, Shield, Award } from "lucide-react";
import { LegalPageSEO } from "@/components/ui/seo";
import arrowBackIcon from "@/figma/arrow-back.svg";

export const Route = createFileRoute("/about/")({
    component: AboutPage,
});

function AboutPage() {
    const navigate = useNavigate();

    const values = [
        {
            icon: <Leaf className="w-8 h-8" />,
            title: "Экологичность",
            description: "Мы помогаем сократить пищевые потери и заботимся об окружающей среде. Каждый спасенный продукт — это вклад в будущее нашей планеты."
        },
        {
            icon: <Heart className="w-8 h-8" />,
            title: "Забота о людях",
            description: "Мы создаем доступные решения для всех: покупатели получают качественную еду по выгодным ценам, а продавцы находят новых клиентов."
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Сообщество",
            description: "KindPlate объединяет людей, которые ценят качество, заботятся об экологии и хотят делать мир лучше."
        },
        {
            icon: <Target className="w-8 h-8" />,
            title: "Прозрачность",
            description: "Честные цены, открытая информация о продуктах и честные отзывы — основа доверия между всеми участниками платформы."
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Безопасность",
            description: "Все продавцы проходят верификацию, а продукты соответствуют всем стандартам качества и безопасности."
        },
        {
            icon: <Award className="w-8 h-8" />,
            title: "Качество",
            description: "Мы работаем только с проверенными заведениями, которые предлагают свежую и вкусную еду."
        }
    ];

    const stats = [
        { number: "10,000+", label: "Спасенных порций еды" },
        { number: "500+", label: "Партнеров-заведений" },
        { number: "50,000+", label: "Довольных пользователей" },
        { number: "30+", label: "Городов России" }
    ];

    return (
        <>
            <LegalPageSEO 
                title="О нас - KindPlate" 
                description="Узнайте больше о KindPlate — платформе для спасения еды и борьбы с пищевыми потерями. Наша миссия, ценности и команда."
            />
            <div className="about-page">
                {/* Header */}
                <div className="about-page__header">
                    <div className="about-page__header-floating">
                        <button 
                            className="about-page__back-button"
                            onClick={() => navigate({ to: "/account" })}
                            aria-label="Назад"
                        >
                            <img 
                                src={arrowBackIcon} 
                                alt="Назад" 
                                className="about-page__back-button-icon"
                            />
                        </button>
                        <div className="about-page__header-title-container">
                            <h1 className="about-page__header-name">О НАС</h1>
                        </div>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="about-page__content">
                    <section className="about-page__hero">
                        <h2 className="about-page__hero-title">
                            KindPlate
                        </h2>
                        <p className="about-page__hero-description">
                            Платформа, которая помогает заведениям продавать нераспроданную еду, 
                            а покупателям — получать качественные продукты по выгодным ценам
                        </p>
                    </section>

                    {/* Mission Section */}
                    <section className="about-page__section">
                        <div className="about-page__section-header">
                            <h2 className="about-page__section-title">
                                Наша миссия
                            </h2>
                            <p className="about-page__section-description">
                                Мы верим, что еда не должна выбрасываться. Наша цель — создать экосистему, 
                                где каждый может внести вклад в сокращение пищевых потерь, получая при этом 
                                качественную еду по доступным ценам.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="about-page__stats">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="about-page__stat-card"
                                >
                                    <div className="about-page__stat-number">
                                        {stat.number}
                                    </div>
                                    <div className="about-page__stat-label">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Values Section */}
                    <section className="about-page__section">
                        <div className="about-page__section-header">
                            <h2 className="about-page__section-title">
                                Наши ценности
                            </h2>
                            <p className="about-page__section-subtitle">
                                Принципы, которыми мы руководствуемся в работе
                            </p>
                        </div>

                        <div className="about-page__values">
                            {values.map((value, index) => (
                                <div
                                    key={index}
                                    className="about-page__value-card"
                                >
                                    <div className="about-page__value-icon">
                                        {value.icon}
                                    </div>
                                    <h3 className="about-page__value-title">
                                        {value.title}
                                    </h3>
                                    <p className="about-page__value-description">
                                        {value.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* How It Works Section */}
                    <section className="about-page__section">
                        <div className="about-page__section-header">
                            <h2 className="about-page__section-title">
                                Как это работает
                            </h2>
                        </div>

                        <div className="about-page__how-it-works">
                            <div className="about-page__how-item">
                                <div className="about-page__how-number">1</div>
                                <h3 className="about-page__how-title">
                                    Для покупателей
                                </h3>
                                <p className="about-page__how-description">
                                    Найдите на карте заведения с предложениями, выберите понравившееся блюдо, 
                                    оформите заказ и заберите еду в указанное время.
                                </p>
                            </div>

                            <div className="about-page__how-item">
                                <div className="about-page__how-number">2</div>
                                <h3 className="about-page__how-title">
                                    Для продавцов
                                </h3>
                                <p className="about-page__how-description">
                                    Зарегистрируйтесь, создайте предложение на нераспроданную еду, 
                                    получите заказы и найдите новых постоянных клиентов.
                                </p>
                            </div>

                            <div className="about-page__how-item">
                                <div className="about-page__how-number">3</div>
                                <h3 className="about-page__how-title">
                                    Результат
                                </h3>
                                <p className="about-page__how-description">
                                    Меньше потерь, больше довольных клиентов, чище планета. 
                                    Все выигрывают!
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="about-page__cta">
                        <h2 className="about-page__cta-title">
                            Присоединяйтесь к нам!
                        </h2>
                        <p className="about-page__cta-description">
                            Станьте частью сообщества, которое заботится о еде, людях и планете
                        </p>
                    </section>

                    {/* Contact Section */}
                    <section className="about-page__section">
                        <div className="about-page__contact">
                            <h2 className="about-page__contact-title">
                                Свяжитесь с нами
                            </h2>
                            <div className="about-page__contact-info">
                                <div className="about-page__contact-item">
                                    <h3 className="about-page__contact-label">Email</h3>
                                    <a
                                        href="mailto:kindplate.io@mail.ru"
                                        className="about-page__contact-link"
                                    >
                                        kindplate.io@mail.ru
                                    </a>
                                </div>
                                <div className="about-page__contact-item">
                                    <h3 className="about-page__contact-label">Telegram</h3>
                                    <a
                                        href="https://t.me/kindplatesupportbot"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="about-page__contact-link"
                                    >
                                        @kindplatesupportbot
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="about-page__footer">
                        <div className="about-page__footer-content">
                            <div className="about-page__footer-text">© 2025 KindPlate. Все права защищены.</div>
                            <div className="about-page__footer-links">
                                <Link to="/legal/privacy" className="about-page__footer-link">
                                    Конфиденциальность
                                </Link>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
