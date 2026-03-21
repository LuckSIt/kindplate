import { createFileRoute } from "@tanstack/react-router";
import { LegalPageSEO } from "@/components/ui/seo";

export const Route = createFileRoute("/legal/refund-policy")({
    component: RefundPolicyPage,
});

function RefundPolicyPage() {
    return (
        <>
            <LegalPageSEO 
                title="Политика возвратов и отмен" 
                description="Условия возврата средств и отмены заказов на Соммил. Правила оформления возвратов, сроки и процедура рассмотрения."
            />
            <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-3">
                        <img src="/icons/icon192.png" alt="Соммил" className="h-8 w-8" />
                        <h1 className="text-2xl font-bold text-gray-900">Политика возвратов и отмен</h1>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Intro */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <p className="text-gray-600 text-lg">
                        Соммил стремится обеспечить справедливые условия для всех участников платформы.
                        Данная политика описывает правила возврата средств и отмены заказов в соответствии с
                        законодательством Российской Федерации.
                    </p>
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                            <strong>Обратите внимание:</strong> Еда на Соммил продается по сниженным ценам,
                            так как имеет короткий срок годности. Это влияет на условия возврата.
                        </p>
                    </div>
                </div>

                {/* Section 1 */}
                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                        1. Отмена заказа покупателем
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">1.1. До подтверждения продавцом</h3>
                            <p>
                                Вы можете отменить заказ бесплатно до момента его подтверждения продавцом.
                                Полная сумма будет возвращена на вашу карту в течение 3-10 рабочих дней.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">1.2. После подтверждения</h3>
                            <p>
                                После подтверждения заказа продавцом отмена возможна только по согласованию
                                с заведением. Свяжитесь с продавцом по телефону, указанному в заказе.
                            </p>
                            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                <li>Если продавец согласен, возврат производится за вычетом 15% комиссии</li>
                                <li>Если еда уже начала готовиться — возврат не производится</li>
                                <li>Если до времени получения осталось менее 1 часа — возврат не производится</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">1.3. В день получения</h3>
                            <p>
                                В день получения заказа отмена без согласования с продавцом невозможна.
                                Если вы не можете забрать заказ, обязательно свяжитесь с заведением заранее.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 2 */}
                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                        2. Возврат средств
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">2.1. Основания для возврата</h3>
                            <p>Полный возврат средств производится в следующих случаях:</p>
                            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                <li>Заказ не был подтвержден продавцом</li>
                                <li>Заведение отменило заказ</li>
                                <li>Еда не соответствует описанию (брак, испорченный продукт)</li>
                                <li>Заведение закрыто в указанное время получения</li>
                                <li>Нарушение санитарных норм</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">2.2. Частичный возврат</h3>
                            <p>
                                Частичный возврат (за вычетом 15-30% комиссии) возможен при согласовании
                                с продавцом в случае:
                            </p>
                            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                <li>Отмены заказа после подтверждения (но до начала приготовления)</li>
                                <li>Неполной комплектации заказа</li>
                                <li>Незначительных отклонений от описания</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">2.3. Возврат не производится</h3>
                            <p>Возврат средств не производится в следующих случаях:</p>
                            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                <li>Вы не явились за заказом в указанное время без предупреждения</li>
                                <li>Вы передумали после получения заказа (еда не понравилась по вкусу)</li>
                                <li>Заказ был получен полностью и соответствовал описанию</li>
                                <li>Прошло более 24 часов после получения заказа</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">2.4. Сроки возврата</h3>
                            <p>
                                Возврат средств на банковскую карту производится в течение 3-10 рабочих дней
                                с момента одобрения заявки на возврат. Точные сроки зависят от вашего банка.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 3 */}
                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                        3. Отмена заказа продавцом
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                        <p>
                            Продавец имеет право отменить заказ в следующих случаях:
                        </p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Товар закончился или испортился</li>
                            <li>Технический сбой в системе</li>
                            <li>Форс-мажорные обстоятельства (аварии, ЧС и т.д.)</li>
                            <li>Нарушение покупателем правил платформы</li>
                        </ul>
                        <p className="mt-4">
                            При отмене продавцом покупатель получает полный возврат средств и уведомление
                            на email и в личном кабинете.
                        </p>
                    </div>
                </section>

                {/* Section 4 */}
                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                        4. Порядок оформления возврата
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">4.1. Как оформить возврат</h3>
                            <ol className="list-decimal list-inside ml-4 space-y-2">
                                <li>Свяжитесь с продавцом по телефону (если требуется согласование)</li>
                                <li>Откройте раздел «Мои заказы» в личном кабинете</li>
                                <li>Нажмите кнопку «Запросить возврат» рядом с заказом</li>
                                <li>Укажите причину возврата</li>
                                <li>Дождитесь рассмотрения заявки (до 24 часов)</li>
                            </ol>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">4.2. Рассмотрение заявки</h3>
                            <p>
                                Заявка на возврат рассматривается в течение 24 часов. В сложных случаях
                                мы можем запросить дополнительную информацию (фото, описание проблемы).
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">4.3. Спорные ситуации</h3>
                            <p>
                                Если продавец не согласен с возвратом, спор рассматривается службой поддержки
                                Соммил. Решение принимается в течение 3 рабочих дней на основании:
                            </p>
                            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                <li>Переписки между покупателем и продавцом</li>
                                <li>Предоставленных фото и видео</li>
                                <li>Истории заказов обеих сторон</li>
                                <li>Отзывов других покупателей</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Section 5 */}
                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                        5. Права потребителя
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                        <p>
                            В соответствии с Законом РФ «О защите прав потребителей» (№ 2300-1 от 07.02.1992)
                            покупатель имеет право:
                        </p>
                        <ul className="list-disc list-inside ml-4 space-y-2">
                            <li>Получить полную информацию о товаре до покупки</li>
                            <li>Вернуть товар ненадлежащего качества</li>
                            <li>Получить возмещение убытков при нарушении прав</li>
                            <li>Обратиться в Роспотребнадзор при нарушении прав</li>
                        </ul>
                        
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-900">
                                <strong>Важно:</strong> Продукты питания не подлежат возврату, если они
                                надлежащего качества (ст. 25 Закона «О защите прав потребителей», Перечень
                                товаров, утв. Постановлением Правительства РФ № 2463 от 31.12.2020).
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Нужна помощь?</h2>
                    <p className="text-gray-700 mb-4">
                        Если у вас возникли вопросы по возврату или отмене заказа, свяжитесь с нами:
                    </p>
                    <ul className="space-y-2 text-gray-700">
                        <li>📧 Email: <a href="mailto:sommeal.io@mail.ru" className="text-green-600 hover:text-green-700 font-medium">sommeal.io@mail.ru</a></li>
                        <li>📱 Telegram: <a href="https://t.me/kindplate_support" className="text-green-600 hover:text-green-700 font-medium">@kindplate_support</a></li>
                        <li>⏰ Время работы: Пн-Пт, 9:00-21:00 МСК</li>
                    </ul>
                </div>

                {/* Last Update */}
                <div className="text-center text-sm text-gray-500 mt-6">
                    Последнее обновление: 27 октября 2025 г.
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                    >
                        ← Вернуться на главную
                    </a>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                        <div>© 2026 Соммил. Все права защищены.</div>
                        <div className="flex gap-4">
                            <a href="/legal/faq" className="hover:text-green-600">FAQ</a>
                            <a href="/legal/privacy" className="hover:text-green-600">Конфиденциальность</a>
                            <a href="/legal/terms" className="hover:text-green-600">Условия использования</a>
                        </div>
                    </div>
                </div>
            </footer>
            </div>
        </>
    );
}
