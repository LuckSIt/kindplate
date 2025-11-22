import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Menu, Leaf, DollarSign, TrendingUp, Heart, MapPin, Instagram, Send } from "lucide-react";

export const Route = createFileRoute("/")({
    component: App,
});

function App() {
    return (
        <div className="min-h-screen bg-black flex overflow-hidden">
            {/* Left Sidebar - Fixed Width */}
            <div className="w-[400px] xl:w-[500px] bg-[#0a1628] flex flex-col flex-shrink-0 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <Leaf className="w-6 h-6 text-primary-500" />
                        <span className="text-xl font-bold text-white">KindPlate</span>
                    </div>
                    <Menu className="w-6 h-6 text-white cursor-pointer" />
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Hero Section */}
                    <div className="p-6 space-y-6">
                        <h1 className="text-4xl font-bold text-primary-400 leading-tight">
                            Выгодно для тебя, полезно для планеты
                        </h1>
                        <p className="text-white/80 text-base">
                            Соединяем людей с кафе и ресторанами для выгодной и осознанной покупки еды
                        </p>
                        <div className="flex flex-col gap-3">
                            <Link to="/home">
                                <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-2xl py-3 font-semibold text-base">
                                    начать спасать
                                </Button>
                            </Link>
                            <Link to="/auth/register/business">
                                <Button variant="outline" className="w-full border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white rounded-2xl py-3 font-semibold text-base bg-slate-800">
                                    начать продавать
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Statistics - Dark Blue Rectangle */}
                    <div className="px-6 mb-6">
                        <div className="bg-[#0f172a] rounded-2xl p-6">
                            <p className="text-white text-base mb-2">Вместе мы спасли</p>
                            <p className="text-primary-400 text-4xl font-bold">532 блюд от выброса</p>
                        </div>
                    </div>

                    {/* User Benefits Section - White Card */}
                    <div className="px-6 mb-6">
                        <div className="bg-white rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-[#0a1628] mb-2">Для пользователей</h3>
                            <h4 className="text-2xl font-bold text-[#0a1628] mb-4">
                                Экономьте и спасайте еду из любимых заведений
                            </h4>
                            <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                                Получайте вкусные блюда по отличным ценам и помогайте сокращать пищевые отходы. 
                                Смотрите актуальные предложения рядом с вами и бронируйте прямо в KindPlate. 
                                Каждый заказ — шаг к более ответственному потреблению и поддержке экологической устойчивости.
                            </p>
                            <div className="space-y-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <span className="text-primary-500 font-bold text-lg flex-shrink-0">01</span>
                                    <p className="text-gray-700 text-sm">Смотри предложения рядом с тобой</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-primary-500 font-bold text-lg flex-shrink-0">02</span>
                                    <p className="text-gray-700 text-sm">Выбирай и оплачивай прямо в приложении</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-primary-500 font-bold text-lg flex-shrink-0">03</span>
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

                    {/* Partners Section - White Card */}
                    <div className="px-6 mb-6">
                        <div className="bg-white rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-[#0a1628] mb-2">Для пользователей</h3>
                            <h4 className="text-2xl font-bold text-[#0a1628] mb-4">
                                Экономьте и спасайте еду из любимых заведений
                            </h4>
                            <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                                Получайте вкусные блюда по отличным ценам и помогайте сокращать пищевые отходы. 
                                Смотрите актуальные предложения рядом с вами и бронируйте прямо в KindPlate.
                            </p>
                            <div className="space-y-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <span className="text-primary-500 font-bold text-lg flex-shrink-0">01</span>
                                    <p className="text-gray-700 text-sm">Смотри предложения рядом с тобой</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-primary-500 font-bold text-lg flex-shrink-0">02</span>
                                    <p className="text-gray-700 text-sm">Выбирай и оплачивай прямо в приложении</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-primary-500 font-bold text-lg flex-shrink-0">03</span>
                                    <p className="text-gray-700 text-sm">Забери в заведении и наслаждайся</p>
                                </div>
                            </div>
                            <Link to="/auth/register/business">
                                <Button variant="outline" className="w-full border-2 border-[#0a1628] text-[#0a1628] hover:bg-[#0a1628] hover:text-white rounded-xl py-3 font-semibold">
                                    написать о сотрудничестве
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Why KindPlate Section - Green Background */}
                    <div className="px-6 mb-6">
                        <div className="bg-primary-500 rounded-2xl p-6">
                            <h3 className="text-2xl font-bold text-white mb-6">Почему KindPlate?</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                    <DollarSign className="w-8 h-8 text-white mb-3" />
                                    <p className="text-white text-sm font-medium">Экономьте до 70% на качественной еде</p>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                    <TrendingUp className="w-8 h-8 text-white mb-3" />
                                    <p className="text-white text-sm font-medium">Уменьшайте пищевые отходы и СО2</p>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                    <MapPin className="w-8 h-8 text-white mb-3" />
                                    <p className="text-white text-sm font-medium">Поддерживайте местные бизнесы</p>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                    <Heart className="w-8 h-8 text-white mb-3" />
                                    <p className="text-white text-sm font-medium">Создавайте позитивное влияние</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-6 border-t border-slate-800 pt-6">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Leaf className="w-5 h-5 text-primary-500" />
                                <span className="text-lg font-bold text-white">KindPlate</span>
                            </div>
                            <div className="grid grid-cols-2 gap-6 text-sm">
                                <div>
                                    <p className="text-white font-semibold mb-2">KindPlate</p>
                                    <ul className="space-y-1 text-gray-400">
                                        <li><Link to="/auth/register/business" className="hover:text-white transition-colors">Для партнеров</Link></li>
                                        <li><Link to="/home" className="hover:text-white transition-colors">Для пользователей</Link></li>
                                        <li><Link to="/legal/faq" className="hover:text-white transition-colors">Документы</Link></li>
                                        <li><Link to="#" className="hover:text-white transition-colors">Блог</Link></li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-white font-semibold mb-2">Нужна помощь?</p>
                                    <ul className="space-y-1 text-gray-400">
                                        <li><Link to="/legal/faq" className="hover:text-white transition-colors">Ответы на вопросы</Link></li>
                                        <li><Link to="#" className="hover:text-white transition-colors">Контакты</Link></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <p className="text-white font-semibold mb-3 text-sm">Социальные сети</p>
                            <div className="flex gap-3">
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-500 transition-colors text-white text-xs font-bold">
                                    VK
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-500 transition-colors">
                                    <Send className="w-5 h-5 text-white" />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-500 transition-colors">
                                    <Instagram className="w-5 h-5 text-white" />
                                </a>
                            </div>
                        </div>
                        <p className="text-gray-500 text-xs">©KindPlate 2025. Все права защищены</p>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Right Side */}
            <div className="flex-1 bg-black overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {/* Featured Food Item - Large Card with Map */}
                    <div className="p-8">
                        <div className="bg-white rounded-3xl p-6 mb-6 relative overflow-hidden">
                            <div className="relative h-[500px] rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-primary-100 to-primary-200">
                                {/* Placeholder for cinnamon roll image with map overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-8xl mb-4">🥐</div>
                                        <p className="text-gray-800 text-xl font-semibold">Булочка с корицей</p>
                                    </div>
                                </div>
                                {/* Map overlay suggestion - subtle grid pattern */}
                                <div className="absolute inset-0 opacity-10" style={{
                                    backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                                                      linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                                    backgroundSize: '50px 50px'
                                }}></div>
                            </div>
                            
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 mb-1">Булочка с корицей</p>
                                    <p className="text-3xl font-bold text-primary-500">79₽</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
                                    <button className="text-gray-700 text-xl font-bold hover:text-primary-500 transition-colors">-</button>
                                    <span className="text-gray-900 font-bold text-lg mx-2 min-w-[30px] text-center">1</span>
                                    <button className="text-gray-700 text-xl font-bold hover:text-primary-500 transition-colors">+</button>
                                </div>
                                <Link to="/cart" className="flex-1">
                                    <Button className="w-full bg-[#0a1628] hover:bg-[#0f172a] text-white rounded-xl py-4 font-semibold text-base">
                                        добавить в заказ
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Food Items Horizontal Row */}
                        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
                            <div className="flex-shrink-0 w-[200px]">
                                <div className="w-full h-[200px] bg-white rounded-2xl mb-3 flex items-center justify-center shadow-md">
                                    <span className="text-6xl">🥗</span>
                                </div>
                                <p className="text-white text-sm font-medium text-center">Салат с авокадо</p>
                                <p className="text-white text-base font-bold text-center">159₽</p>
                            </div>
                            <div className="flex-shrink-0 w-[200px]">
                                <div className="w-full h-[200px] bg-white rounded-2xl mb-3 flex items-center justify-center shadow-md">
                                    <span className="text-6xl">🥐</span>
                                </div>
                                <p className="text-white text-sm font-medium text-center">Круассан с беконом</p>
                                <p className="text-white text-base font-bold text-center">139₽</p>
                            </div>
                            <div className="flex-shrink-0 w-[200px]">
                                <div className="w-full h-[200px] bg-white rounded-2xl mb-3 flex items-center justify-center shadow-md">
                                    <span className="text-6xl">🥖</span>
                                </div>
                                <p className="text-white text-sm font-medium text-center">Чиабатта 3шт.</p>
                                <p className="text-white text-base font-bold text-center">99₽</p>
                            </div>
                            <div className="flex-shrink-0 w-[200px]">
                                <div className="w-full h-[200px] bg-white rounded-2xl mb-3 flex items-center justify-center shadow-md">
                                    <span className="text-6xl">🍕</span>
                                </div>
                                <p className="text-white text-sm font-medium text-center">Пепперони пицца</p>
                                <p className="text-white text-base font-bold text-center">279₽</p>
                            </div>
                            <div className="flex-shrink-0 w-[200px]">
                                <div className="w-full h-[200px] bg-white rounded-2xl mb-3 flex items-center justify-center shadow-md">
                                    <span className="text-6xl">🍪</span>
                                </div>
                                <p className="text-white text-sm font-medium text-center">Печенье с шоколадом</p>
                                <p className="text-white text-base font-bold text-center">99₽</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}