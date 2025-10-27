import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/")({
    component: App,
});

function App() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero Section with Animation */}
            <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="mb-6">
                    <span className="text-6xl animate-bounce inline-block">🍽️</span>
                </div>
                <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
                    Добро пожаловать в{" "}
                    <span className="bg-gradient-to-r from-primary-500 to-primary-400 bg-clip-text text-transparent animate-pulse">
                        KindPlate
                    </span>
                </h1>
                <p className="text-xl text-gray-700 dark:text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
                    Спасайте еду и экономьте деньги! 💰 Находите скидки до 60% на вкусную еду от местных кафе и ресторанов 🎯
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/home">
                        <Button size="lg" className="bg-gradient-to-r from-primary-500 to-primary-400 hover:from-primary-600 hover:to-primary-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-lg font-semibold hover:scale-105 transform">
                            🗺️ Найти предложения рядом
                        </Button>
                    </Link>
                    <Link to="/auth/register/business">
                        <Button size="lg" variant="outline" className="border-2 border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500 transition-all duration-200 px-8 py-3 text-lg font-semibold hover:scale-105 transform">
                            💼 Для бизнеса
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Features Grid with Icons */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className={`bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform border border-gray-200 dark:border-gray-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '200ms'}}>
                    <div className="text-5xl mb-4">📍</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Рядом с вами</h3>
                    <p className="text-gray-700 dark:text-gray-200">
                        Находите кафе и рестораны с выгодными предложениями в вашем районе на интерактивной карте
                    </p>
                </div>

                <div className={`bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform border border-gray-200 dark:border-gray-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '400ms'}}>
                    <div className="text-5xl mb-4">💸</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Экономьте до 60%</h3>
                    <p className="text-gray-700 dark:text-gray-200">
                        Покупайте качественную еду со скидкой и помогайте бизнесам сократить пищевые отходы
                    </p>
                </div>

                <div className={`bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform border border-gray-200 dark:border-gray-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '600ms'}}>
                    <div className="text-5xl mb-4">🌱</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Забота об экологии</h3>
                    <p className="text-gray-700 dark:text-gray-200">
                        Вместе мы спасаем тонны еды от выбрасывания и заботимся о планете
                    </p>
                </div>
            </div>

            {/* How it Works Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 mb-16 shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Как это работает? 🤔</h2>
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="bg-white dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                            <span className="text-2xl font-bold text-primary-600">1</span>
                        </div>
                        <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Откройте карту</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Найдите предложения рядом с вами</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-white dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                            <span className="text-2xl font-bold text-primary-600">2</span>
                        </div>
                        <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Выберите блюдо</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Закажите понравившееся предложение</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-white dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                            <span className="text-2xl font-bold text-primary-600">3</span>
                        </div>
                        <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Заберите заказ</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Придите в указанное время</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-white dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                            <span className="text-2xl font-bold text-primary-600">4</span>
                        </div>
                        <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Наслаждайтесь!</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">И спасибо за спасение еды! 💚</p>
                    </div>
                </div>
            </div>

            {/* Trust Indicators */}
            <div className="text-center mb-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Нам доверяют</h3>
                <div className="flex justify-center items-center gap-8 flex-wrap">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600">1000+</div>
                        <div className="text-gray-700 dark:text-gray-200">Спасенных блюд</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600">50+</div>
                        <div className="text-gray-700 dark:text-gray-200">Партнеров</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600">4.8⭐</div>
                        <div className="text-gray-700 dark:text-gray-200">Рейтинг</div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-400 rounded-3xl p-10 text-white text-center shadow-xl">
                <h2 className="text-3xl font-bold mb-4">Готовы начать экономить? 🚀</h2>
                <p className="text-xl mb-6 text-white/90">Присоединяйтесь к тысячам пользователей, которые уже спасают еду!</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/auth/register/customer">
                        <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-lg font-semibold">
                            Создать аккаунт бесплатно
                        </Button>
                    </Link>
                    <Link to="/auth/login">
                        <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 transition-all duration-200 px-8 py-3 text-lg font-semibold">
                            У меня есть аккаунт
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}