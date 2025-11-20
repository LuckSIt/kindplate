import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Menu, Leaf, Check, TrendingUp, Heart, MessageCircle, Instagram, Facebook, Send } from "lucide-react";

export const Route = createFileRoute("/")({
    component: App,
});

function App() {
    return (
        <div className="min-h-screen bg-black flex">
            {/* Left Sidebar - Dark Blue */}
            <div className="w-full lg:w-1/3 xl:w-1/4 bg-slate-900 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <Leaf className="w-6 h-6 text-primary-500" />
                        <span className="text-xl font-bold text-white">KindPlate</span>
                        <span className="text-xs text-gray-400 ml-2">FOOD WITH LOVE</span>
                    </div>
                    <Menu className="w-6 h-6 text-white cursor-pointer" />
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Hero Section */}
                    <div className="p-6 space-y-6">
                        <h1 className="text-3xl lg:text-4xl font-bold text-primary-500 leading-tight">
                            Выгодно для тебя, полезно для планеты
                        </h1>
                        <p className="text-white/80 text-sm lg:text-base">
                            Соединяем людей с кафе и ресторанами для выгодной и осознанной покупки еды
                        </p>
                        <div className="flex flex-col gap-3">
                            <Link to="/home">
                                <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-xl py-3 font-semibold">
                                    начать спасать
                                </Button>
                            </Link>
                            <Link to="/auth/register/business">
                                <Button variant="outline" className="w-full border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white rounded-xl py-3 font-semibold">
                                    начать продавать
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Featured Food Item */}
                    <div className="px-6 mb-6">
                        <div className="bg-slate-800 rounded-2xl p-4">
                            <div className="relative mb-4 bg-slate-700 rounded-xl p-4 flex items-center justify-center min-h-[200px]">
                                <div className="text-center">
                                    <div className="text-6xl mb-2">🥐</div>
                                    <p className="text-white text-sm">Булочка с корицей</p>
                                </div>
                            </div>
                            <p className="text-white font-medium mb-3">Булочка с корицей 79₽</p>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-2">
                                    <button className="text-white text-lg">-</button>
                                    <span className="text-white font-semibold mx-2">1</span>
                                    <button className="text-white text-lg">+</button>
                                </div>
                                <Button className="flex-1 bg-primary-500 hover:bg-primary-600 text-white rounded-lg py-2">
                                    добавить в 🛒
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="px-6 mb-6">
                        <p className="text-primary-500 text-sm mb-2">Вместе мы спасли</p>
                        <p className="text-white text-3xl font-bold">532 блюд от выброса</p>
                    </div>

                    {/* User Benefits Section - White Card */}
                    <div className="px-6 mb-6">
                        <div className="bg-white rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Для пользователей</h3>
                            <h4 className="text-2xl font-bold text-primary-500 mb-4">
                                Экономьте и спасайте еду из любимых заведений
                            </h4>
                            <p className="text-gray-700 text-sm mb-6">
                                Получайте вкусные блюда по отличным ценам и помогайте сокращать пищевые отходы. 
                                Смотрите актуальные предложения рядом с вами и бронируйте прямо в KindPlate. 
                                Каждый заказ — шаг к более ответственному потреблению и поддержке экологической устойчивости.
                            </p>
                            <div className="space-y-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <span className="text-primary-500 font-bold text-lg">01</span>
                                    <p className="text-gray-700 text-sm">Смотри предложения рядом с тобой</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-primary-500 font-bold text-lg">02</span>
                                    <p className="text-gray-700 text-sm">Выбирай и оплачивай прямо в приложении</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-primary-500 font-bold text-lg">03</span>
                                    <p className="text-gray-700 text-sm">Забери в заведении и наслаждайся</p>
                                </div>
                            </div>
                            <Link to="/home">
                                <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-xl py-3 font-semibold">
                                    смотреть предложения
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Why KindPlate Section */}
                    <div className="px-6 mb-6">
                        <h3 className="text-xl font-bold text-white mb-4">Почему KindPlate?</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-primary-500/20 rounded-xl p-4 border border-primary-500/30">
                                <Check className="w-6 h-6 text-primary-500 mb-2" />
                                <p className="text-white text-xs font-medium">Экономьте до 70% на качественной еде</p>
                            </div>
                            <div className="bg-primary-500/20 rounded-xl p-4 border border-primary-500/30">
                                <TrendingUp className="w-6 h-6 text-primary-500 mb-2" />
                                <p className="text-white text-xs font-medium">Уменьшайте пищевые отходы и СО2</p>
                            </div>
                            <div className="bg-primary-500/20 rounded-xl p-4 border border-primary-500/30">
                                <Heart className="w-6 h-6 text-primary-500 mb-2" />
                                <p className="text-white text-xs font-medium">Поддерживайте местные бизнесы</p>
                            </div>
                            <div className="bg-primary-500/20 rounded-xl p-4 border border-primary-500/30">
                                <MessageCircle className="w-6 h-6 text-primary-500 mb-2" />
                                <p className="text-white text-xs font-medium">Создавайте позитивное влияние</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-6 border-t border-slate-800 pt-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Leaf className="w-5 h-5 text-primary-500" />
                            <span className="text-lg font-bold text-white">KindPlate</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                            <div>
                                <p className="text-white font-semibold mb-2">KindPlate</p>
                                <ul className="space-y-1 text-gray-400">
                                    <li><Link to="/auth/register/business" className="hover:text-white">Для партнеров</Link></li>
                                    <li><Link to="/home" className="hover:text-white">Для пользователей</Link></li>
                                    <li><Link to="#" className="hover:text-white">Документы</Link></li>
                                    <li><Link to="#" className="hover:text-white">Блог</Link></li>
                                </ul>
                            </div>
                            <div>
                                <p className="text-white font-semibold mb-2">Нужна помощь?</p>
                                <ul className="space-y-1 text-gray-400">
                                    <li><Link to="#" className="hover:text-white">Ответы на вопросы</Link></li>
                                    <li><Link to="#" className="hover:text-white">Контакты</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="mb-4">
                            <p className="text-white font-semibold mb-2 text-sm">Социальные сети</p>
                            <div className="flex gap-3">
                                <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-500 transition-colors text-white text-xs font-bold">
                                    VK
                                </a>
                                <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-500 transition-colors">
                                    <Send className="w-4 h-4 text-white" />
                                </a>
                                <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-500 transition-colors">
                                    <Instagram className="w-4 h-4 text-white" />
                                </a>
                            </div>
                        </div>
                        <p className="text-gray-500 text-xs">©KindPlate 2025. Все права защищены</p>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Black Background */}
            <div className="flex-1 bg-black overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-black/95 backdrop-blur-sm z-10 border-b border-slate-800 p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">Выгодно для тебя, полезно для планеты</h2>
                        <Menu className="w-6 h-6 text-white cursor-pointer" />
                    </div>
                    <p className="text-white/70 mt-2 text-sm">
                        Забирай вкусную еду со скидкой до 70% и спасай планету от пищевых отходов
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                        <Link to="/home">
                            <Button className="bg-white text-black hover:bg-gray-100 rounded-xl px-6 py-2 font-semibold">
                                Найти предложения
                            </Button>
                        </Link>
                        <Link to="#" className="text-primary-500 hover:text-primary-400 text-sm">
                            Как это работает?
                        </Link>
                    </div>
                </div>

                {/* Food Items Showcase */}
                <div className="p-6">
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        <div className="flex-shrink-0 w-48">
                            <div className="w-full h-48 bg-slate-800 rounded-xl mb-2 flex items-center justify-center">
                                <span className="text-4xl">🥗</span>
                            </div>
                            <p className="text-white text-sm font-medium">Салат с авокадо 159₽</p>
                        </div>
                        <div className="flex-shrink-0 w-48">
                            <div className="w-full h-48 bg-slate-800 rounded-xl mb-2 flex items-center justify-center">
                                <span className="text-4xl">🥐</span>
                            </div>
                            <p className="text-white text-sm font-medium">Круассан с беконом 139₽</p>
                        </div>
                        <div className="flex-shrink-0 w-48">
                            <div className="w-full h-48 bg-slate-800 rounded-xl mb-2 flex items-center justify-center">
                                <span className="text-4xl">🥖</span>
                            </div>
                            <p className="text-white text-sm font-medium">Чиабатта 3шт. 99₽</p>
                        </div>
                        <div className="flex-shrink-0 w-48">
                            <div className="w-full h-48 bg-slate-800 rounded-xl mb-2 flex items-center justify-center">
                                <span className="text-4xl">🍕</span>
                            </div>
                            <p className="text-white text-sm font-medium">Пепперони пицца 279₽</p>
                        </div>
                        <div className="flex-shrink-0 w-48">
                            <div className="w-full h-48 bg-slate-800 rounded-xl mb-2 flex items-center justify-center">
                                <span className="text-4xl">🍪</span>
                            </div>
                            <p className="text-white text-sm font-medium">Печенье с шоколадом 99₽</p>
                        </div>
                    </div>
                </div>

                {/* Impact Section */}
                <div className="px-6 py-8 border-t border-slate-800">
                    <p className="text-white/70 text-sm mb-2">Вместе мы спасли</p>
                    <p className="text-primary-500 text-4xl font-bold">532 блюд от выброса</p>
                </div>

                {/* Second User Benefits Section - Dark Card */}
                <div className="px-6 pb-6">
                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                        <h3 className="text-lg font-bold text-white mb-2">Для пользователей</h3>
                        <h4 className="text-2xl font-bold text-primary-500 mb-4">
                            Экономьте и спасайте еду из любимых заведений
                        </h4>
                        <p className="text-white/70 text-sm mb-6">
                            Получайте вкусные блюда по отличным ценам и помогайте сокращать пищевые отходы. 
                            Смотрите актуальные предложения рядом с вами и бронируйте прямо в KindPlate.
                        </p>
                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3">
                                <span className="text-primary-500 font-bold text-lg">01</span>
                                <p className="text-white/80 text-sm">Смотри предложения рядом с тобой</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-primary-500 font-bold text-lg">02</span>
                                <p className="text-white/80 text-sm">Выбирай и оплачивай прямо в приложении</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-primary-500 font-bold text-lg">03</span>
                                <p className="text-white/80 text-sm">Забери в заведении и наслаждайся</p>
                            </div>
                        </div>
                        <Link to="/auth/register/business">
                            <Button variant="outline" className="w-full border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white rounded-xl py-3 font-semibold">
                                Написать о сотрудничестве
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}