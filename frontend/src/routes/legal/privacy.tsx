import { createFileRoute } from "@tanstack/react-router";
import { LegalPageSEO } from "@/components/ui/seo";

export const Route = createFileRoute("/legal/privacy")({
    component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
    return (
        <>
            <LegalPageSEO 
                title="Политика конфиденциальности" 
                description="Политика конфиденциальности KindPlate. Узнайте, как мы собираем, используем и защищаем ваши персональные данные."
            />
            <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-3">
                        <img src="/kandlate.png" alt="KindPlate" className="h-8 w-8" />
                        <h1 className="text-2xl font-bold text-gray-900">Политика конфиденциальности</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <p className="text-gray-600">
                        Последнее обновление: 27 октября 2025 г.
                    </p>
                    <p className="text-gray-600 mt-4">
                        KindPlate серьезно относится к защите вашей конфиденциальности. Настоящая политика
                        описывает, какие данные мы собираем и как их используем.
                    </p>
                </div>

                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">1. Какие данные мы собираем</h2>
                    <div className="space-y-4 text-gray-700">
                        <div>
                            <h3 className="font-semibold">1.1. Данные при регистрации</h3>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li>Email адрес</li>
                                <li>Имя и фамилия</li>
                                <li>Номер телефона</li>
                                <li>Для бизнеса: название, адрес, ИНН/ОГРН</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold">1.2. Данные при использовании</h3>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li>История заказов</li>
                                <li>Избранные заведения</li>
                                <li>Отзывы и оценки</li>
                                <li>Местоположение (с вашего согласия)</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold">1.3. Технические данные</h3>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li>IP адрес</li>
                                <li>Тип браузера и устройства</li>
                                <li>Cookie файлы</li>
                                <li>Логи активности</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">2. Как мы используем данные</h2>
                    <div className="text-gray-700 space-y-2">
                        <p>Мы используем ваши данные для:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Обработки заказов и платежей</li>
                            <li>Связи с вами по вопросам заказов</li>
                            <li>Улучшения качества сервиса</li>
                            <li>Отправки уведомлений (можно отключить)</li>
                            <li>Предотвращения мошенничества</li>
                            <li>Соблюдения законодательства РФ</li>
                        </ul>
                    </div>
                </section>

                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">3. Защита данных</h2>
                    <div className="text-gray-700 space-y-3">
                        <p>
                            Мы применяем современные технологии для защиты ваших данных:
                        </p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>SSL/TLS шифрование всех соединений</li>
                            <li>Хеширование паролей (bcrypt)</li>
                            <li>Регулярное резервное копирование</li>
                            <li>Ограниченный доступ к данным</li>
                            <li>Мониторинг подозрительной активности</li>
                        </ul>
                        <p className="mt-4">
                            Платежные данные не хранятся на наших серверах — они обрабатываются
                            сертифицированными платежными системами.
                        </p>
                    </div>
                </section>

                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">4. Ваши права</h2>
                    <div className="text-gray-700 space-y-2">
                        <p>В соответствии с ФЗ-152 «О персональных данных» вы имеете право:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Получить информацию о хранимых данных</li>
                            <li>Исправить неточные данные</li>
                            <li>Удалить свой аккаунт и все данные</li>
                            <li>Отозвать согласие на обработку</li>
                            <li>Экспортировать свои данные</li>
                        </ul>
                    </div>
                </section>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Контакты</h2>
                    <p className="text-gray-700 mb-2">
                        По вопросам защиты данных: <a href="mailto:privacy@kindplate.ru" className="text-green-600 hover:text-green-700 font-medium">privacy@kindplate.ru</a>
                    </p>
                </div>

                <div className="text-center mt-6">
                    <a href="/" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium">
                        ← Вернуться на главную
                    </a>
                </div>
            </main>
            </div>
        </>
    );
}
