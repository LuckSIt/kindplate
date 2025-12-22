import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Heart, Leaf, Users, Target, Shield, Award } from "lucide-react";
import { LegalPageSEO } from "@/components/ui/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about/")({
    component: AboutPage,
});

function AboutPage() {
    const navigate = useNavigate();

    const values = [
        {
            icon: <Leaf className="w-8 h-8" />,
            title: "Экологичность",
            description: "Мы помогаем сократить пищевые отходы и заботимся об окружающей среде. Каждый спасенный продукт — это вклад в будущее нашей планеты."
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
                description="Узнайте больше о KindPlate — платформе для спасения еды и борьбы с пищевыми отходами. Наша миссия, ценности и команда."
            />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                    <div className="max-w-6xl mx-auto px-4 py-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate({ to: "/account" })}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Назад
                            </Button>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                О нас
                            </h1>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="bg-gradient-to-br from-green-500 to-green-600 text-white py-16">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="text-center">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">
                                KindPlate — Спаси еду
                            </h2>
                            <p className="text-xl md:text-2xl text-green-50 max-w-3xl mx-auto">
                                Платформа, которая помогает заведениям продавать нераспроданную еду, 
                                а покупателям — получать качественные продукты по выгодным ценам
                            </p>
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-16 bg-white dark:bg-gray-800">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Наша миссия
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                                Мы верим, что еда не должна выбрасываться. Наша цель — создать экосистему, 
                                где каждый может внести вклад в сокращение пищевых отходов, получая при этом 
                                качественную еду по доступным ценам.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                >
                                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                                        {stat.number}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-16 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Наши ценности
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                                Принципы, которыми мы руководствуемся в работе
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {values.map((value, index) => (
                                <div
                                    key={index}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="text-green-600 dark:text-green-400 mb-4">
                                        {value.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        {value.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {value.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-16 bg-white dark:bg-gray-800">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Как это работает
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">1</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Для покупателей
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Найдите на карте заведения с предложениями, выберите понравившееся блюдо, 
                                    оформите заказ и заберите еду в указанное время.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Для продавцов
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Зарегистрируйтесь, создайте предложение на нераспроданную еду, 
                                    получите заказы и найдите новых постоянных клиентов.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">3</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Результат
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Меньше отходов, больше довольных клиентов, чище планета. 
                                    Все выигрывают!
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <div className="max-w-6xl mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold mb-4">
                            Присоединяйтесь к нам!
                        </h2>
                        <p className="text-xl text-green-50 mb-8 max-w-2xl mx-auto">
                            Станьте частью сообщества, которое заботится о еде, людях и планете
                        </p>
                        
                    </div>
                </section>

                {/* Contact Section */}
                <section className="py-16 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                                Свяжитесь с нами
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6 text-center">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
                                    <a
                                        href="mailto:kindplate.io@mail.ru"
                                        className="text-green-600 dark:text-green-400 hover:underline"
                                    >
                                        kindplate.io@mail.ru
                                    </a>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Telegram</h3>
                                    <a
                                        href="https://t.me/kindplatesupportbot"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-600 dark:text-green-400 hover:underline"
                                    >
                                        @kindplatesupportbot
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <div className="max-w-6xl mx-auto px-4 py-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div>© 2025 KindPlate. Все права защищены.</div>
                            <div className="flex gap-4">
                                
                                <Link to="/legal/privacy" className="hover:text-green-600 dark:hover:text-green-400">
                                    Конфиденциальность
                                </Link>
                        
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
