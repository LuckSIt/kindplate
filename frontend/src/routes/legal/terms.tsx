import { createFileRoute } from "@tanstack/react-router";
import { LegalPageSEO } from "@/components/ui/seo";

export const Route = createFileRoute("/legal/terms")({
    component: TermsPage,
});

function TermsPage() {
    return (
        <>
            <LegalPageSEO 
                title="Пользовательское соглашение" 
                description="Условия использования платформы KindPlate. Права и обязанности пользователей, правила работы с сервисом."
            />
            <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-3">
                        <img src="/kandlate.png" alt="KindPlate" className="h-8 w-8" />
                        <h1 className="text-2xl font-bold text-gray-900">Пользовательское соглашение</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <p className="text-gray-600">
                        Последнее обновление: 27 октября 2025 г.
                    </p>
                    <p className="text-gray-600 mt-4">
                        Используя платформу KindPlate, вы соглашаетесь с настоящими условиями.
                        Пожалуйста, внимательно ознакомьтесь с ними перед использованием сервиса.
                    </p>
                </div>

                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">1. Общие положения</h2>
                    <div className="text-gray-700 space-y-3">
                        <p>
                            1.1. KindPlate (далее — «Платформа») предоставляет онлайн-сервис для связи
                            покупателей с заведениями общественного питания, продающими готовую еду
                            с коротким сроком годности.
                        </p>
                        <p>
                            1.2. Платформа не является продавцом еды и не несет ответственности за
                            качество продукции. Мы выступаем посредником между покупателями и продавцами.
                        </p>
                        <p>
                            1.3. Регистрируясь на Платформе, вы подтверждаете, что вам исполнилось 18 лет.
                        </p>
                    </div>
                </section>

                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">2. Регистрация и аккаунт</h2>
                    <div className="text-gray-700 space-y-3">
                        <p>2.1. Для использования Платформы необходимо создать аккаунт.</p>
                        <p>2.2. Вы обязаны предоставлять актуальную и достоверную информацию.</p>
                        <p>2.3. Вы несете ответственность за безопасность своего пароля.</p>
                        <p>2.4. Запрещено создавать несколько аккаунтов для одного лица.</p>
                        <p>
                            2.5. Мы оставляем за собой право заблокировать аккаунт при нарушении правил
                            или подозрении в мошенничестве.
                        </p>
                    </div>
                </section>

                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">3. Правила для покупателей</h2>
                    <div className="text-gray-700 space-y-3">
                        <p>3.1. Покупатель обязан забрать заказ в указанное время.</p>
                        <p>3.2. При невозможности забрать заказ необходимо предупредить продавца заранее.</p>
                        <p>3.3. Систематическое неполучение заказов может привести к блокировке аккаунта.</p>
                        <p>3.4. Запрещено оставлять ложные отзывы или завышать/занижать оценки умышленно.</p>
                        <p>3.5. Оплата производится сразу при оформлении заказа.</p>
                    </div>
                </section>

                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">4. Правила для продавцов</h2>
                    <div className="text-gray-700 space-y-3">
                        <p>4.1. Продавец обязан иметь действующие документы на осуществление деятельности.</p>
                        <p>4.2. Вся еда должна соответствовать санитарным нормам и стандартам качества.</p>
                        <p>4.3. Информация о предложениях должна быть точной (описание, фото, цена, количество).</p>
                        <p>4.4. Продавец обязан подтвердить или отклонить заказ в течение 1 часа.</p>
                        <p>4.5. Запрещено отменять подтвержденные заказы без уважительной причины.</p>
                        <p>4.6. Платформа взимает комиссию 10-15% с каждого проданного заказа.</p>
                    </div>
                </section>

                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">5. Платежи и комиссии</h2>
                    <div className="text-gray-700 space-y-3">
                        <p>5.1. Оплата производится банковскими картами через защищенные платежные шлюзы.</p>
                        <p>5.2. Возврат средств осуществляется согласно Политике возвратов.</p>
                        <p>5.3. Выплаты продавцам производятся еженедельно за вычетом комиссии.</p>
                        <p>5.4. Все цены указаны в российских рублях.</p>
                    </div>
                </section>

                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">6. Ответственность</h2>
                    <div className="text-gray-700 space-y-3">
                        <p>
                            6.1. Платформа не несет ответственности за качество, безопасность и вкус еды.
                            Это ответственность продавца.
                        </p>
                        <p>
                            6.2. Платформа не несет ответственности за действия пользователей, включая
                            неисполнение обязательств.
                        </p>
                        <p>
                            6.3. Максимальная ответственность Платформы ограничена суммой конкретного заказа.
                        </p>
                        <p>
                            6.4. Мы не гарантируем бесперебойную работу сервиса и не несем ответственности
                            за технические сбои.
                        </p>
                    </div>
                </section>

                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">7. Интеллектуальная собственность</h2>
                    <div className="text-gray-700 space-y-3">
                        <p>7.1. Все материалы Платформы защищены авторским правом.</p>
                        <p>7.2. Запрещено копировать, распространять или модифицировать контент без разрешения.</p>
                        <p>7.3. Загружая контент (фото, отзывы), вы предоставляете нам право на его использование.</p>
                    </div>
                </section>

                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">8. Изменения и прекращение</h2>
                    <div className="text-gray-700 space-y-3">
                        <p>8.1. Мы оставляем за собой право изменять эти условия в любое время.</p>
                        <p>8.2. Об изменениях мы уведомим по email за 7 дней.</p>
                        <p>8.3. Продолжение использования после изменений означает принятие новых условий.</p>
                        <p>8.4. Вы можете удалить аккаунт в любое время через настройки.</p>
                    </div>
                </section>

                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">9. Применимое право</h2>
                    <div className="text-gray-700 space-y-3">
                        <p>
                            9.1. К настоящему соглашению применяется законодательство Российской Федерации.
                        </p>
                        <p>
                            9.2. Споры разрешаются путем переговоров, а при недостижении согласия —
                            в судебном порядке по месту нахождения Платформы.
                        </p>
                    </div>
                </section>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Контакты</h2>
                    <p className="text-gray-700">
                        ООО "КиндПлейт"<br />
                        ИНН: 1234567890<br />
                        Адрес: Россия, Санкт-Петербург<br />
                        Email: <a href="mailto:legal@kindplate.ru" className="text-green-600 hover:text-green-700 font-medium">legal@kindplate.ru</a>
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
