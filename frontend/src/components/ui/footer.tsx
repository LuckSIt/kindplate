/**
 * Footer Component
 * Футер с ссылками на легальные страницы и контактами
 */

export function Footer() {
    return (
        <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Main Footer Content */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
                    {/* About */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <img src="/kandlate.png" alt="KindPlate" className="h-6 w-6" />
                            <span className="font-bold text-base text-gray-100">KindPlate</span>
                        </div>
                        <p className="text-xs text-gray-400">
                            Спасаем еду от выбрасывания
                        </p>
                    </div>

                    {/* For Customers */}
                    <div>
                        <h3 className="font-semibold text-gray-100 mb-2 text-sm">Покупателям</h3>
                        <ul className="space-y-1 text-xs text-gray-400">
                            <li>
                                <a href="/legal/faq" className="hover:text-green-500 transition-colors">
                                    FAQ
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* For Businesses */}
                    <div>
                        <h3 className="font-semibold text-gray-100 mb-2 text-sm">Продавцам</h3>
                        <ul className="space-y-1 text-xs text-gray-400">
                            <li>
                                <a href="https://t.me/kindplatesupportbot" className="hover:text-green-500 transition-colors">
                                    Стать партнером
                                </a>
                            </li>
                            <li>
                                <a href="/panel" className="hover:text-green-500 transition-colors">
                                    Панель продавца
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Support & Legal */}
                    <div>
                        <h3 className="font-semibold text-gray-100 mb-2 text-sm">Поддержка</h3>
                        <ul className="space-y-1 text-xs text-gray-400">
                            <li>
                                <a href="/legal/terms" className="hover:text-green-500 transition-colors">
                                    Условия
                                </a>
                            </li>
                            <li>
                                <a href="/legal/privacy" className="hover:text-green-500 transition-colors">
                                    Конфиденциальность
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="https://t.me/kindplatesupportbot" 
                                    className="hover:text-green-500 transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Telegram
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-4 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-400">
                        <div>© 2025 KindPlate. Все права защищены.</div>
                        <div className="flex items-center gap-3">
                            <span>СПб</span>
                            <span>•</span>
                            <span>24/7</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

