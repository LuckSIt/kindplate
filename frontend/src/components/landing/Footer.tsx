import { Link } from "@tanstack/react-router";
import { Leaf, Instagram, Send, Facebook } from "lucide-react";

export function Footer() {
    return (
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
                            <li>
                                <Link to="/auth/register/business" className="hover:text-white transition-colors">
                                    Для партнеров
                                </Link>
                            </li>
                            <li>
                                <Link to="/home" className="hover:text-white transition-colors">
                                    Для пользователей
                                </Link>
                            </li>
                            <li>
                                <Link to="/legal/faq" className="hover:text-white transition-colors">
                                    Документы
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-white transition-colors">
                                    Блог
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-white font-semibold mb-2">Нужна помощь?</p>
                        <ul className="space-y-1 text-gray-400">
                            <li>
                                <Link to="/legal/faq" className="hover:text-white transition-colors">
                                    Ответы на вопросы
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-white transition-colors">
                                    Контакты
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="mb-4">
                <p className="text-white font-semibold mb-3 text-sm">Социальные сети</p>
                <div className="flex gap-3">
                    <a 
                        href="#" 
                        className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-500 transition-colors text-white text-xs font-bold"
                        aria-label="VKontakte"
                    >
                        VK
                    </a>
                    <a 
                        href="#" 
                        className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-500 transition-colors"
                        aria-label="Telegram"
                    >
                        <Send className="w-5 h-5 text-white" />
                    </a>
                    <a 
                        href="#" 
                        className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-500 transition-colors"
                        aria-label="Instagram"
                    >
                        <Instagram className="w-5 h-5 text-white" />
                    </a>
                    <a 
                        href="#" 
                        className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-500 transition-colors"
                        aria-label="Facebook"
                    >
                        <Facebook className="w-5 h-5 text-white" />
                    </a>
                </div>
            </div>
            <p className="text-gray-500 text-xs">©KindPlate 2025. Все права защищены</p>
        </div>
    );
}

