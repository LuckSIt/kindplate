import { createFileRoute } from "@tanstack/react-router";
import { LegalPageSEO } from "@/components/ui/seo";

export const Route = createFileRoute("/legal/faq")({
    component: FAQPage,
});

function FAQPage() {
    const faqs = [
        {
            category: "Общие вопросы",
            items: [
                {
                    question: "Что такое Соммил?",
                    answer: "Соммил — это платформа для продажи и покупки готовой еды по сниженным ценам. Мы помогаем заведениям общественного питания быстрее продавать свою продукцию, а покупателям — приобрести качественную еду по выгодным ценам."
                },
                {
                    question: "Как это работает?",
                    answer: "Заведения выставляют предложения на еду, которая не была продана в течение дня. Покупатели видят эти предложения на карте, оформляют заказ и забирают еду в указанное время. Все просто и удобно!"
                },
                {
                    question: "Безопасно ли покупать еду через Соммил?",
                    answer: "Да, абсолютно безопасно. Все продавцы проходят верификацию, а еда соответствует всем стандартам качества."
                }
            ]
        },
        {
            category: "Для покупателей",
            items: [
                {
                    question: "Как оформить заказ?",
                    answer: "1. Найдите интересующее заведение на карте или в списке\n2. Выберите предложение\n3. Укажите количество\n4. Оформите заказ\n5. Заберите еду в указанное время"
                },
                {
                    question: "Когда я могу забрать заказ?",
                    answer: "Время получения указано в каждом предложении. Обычно это вечернее время (18:00-22:00), когда заведения подводят итоги дня и понимают, что осталось непроданным."
                },
                {
                    question: "Могу ли я отменить заказ?",
                    answer: "Да, вы можете отменить заказ до момента его подтверждения продавцом. После подтверждения отмена возможна только по согласованию с заведением. Подробности в разделе «Политика возвратов»."
                },
                {
                    question: "Что делать, если я опоздал за заказом?",
                    answer: "Свяжитесь с заведением по телефону, указанному в заказе. В большинстве случаев продавцы идут навстречу и могут продлить время ожидания на 15-30 минут."
                },
                {
                    question: "Что если еда не соответствует ожиданиям?",
                    answer: "Вы можете оставить отзыв и оценку заведению. В случае серьезных претензий свяжитесь с нашей службой поддержки через форму обратной связи."
                }
            ]
        },
        {
            category: "Для продавцов",
            items: [
                {
                    question: "Кто может стать продавцом на Соммил?",
                    answer: "Любое заведение общественного питания: кафе, рестораны, пекарни, кондитерские, магазины готовой еды. Необходимо иметь действующие документы (ОГРН/ИНН) и соответствовать санитарным нормам."
                },
                {
                    question: "Сколько стоит размещение на платформе?",
                    answer: "Регистрация бесплатна. Мы берем комиссию 10-15% с каждого проданного заказа. Подробности в личном кабинете продавца."
                },
                {
                    question: "Как выставить предложение?",
                    answer: "В панели продавца нажмите «Создать предложение», заполните информацию о блюде, укажите цены, количество и время получения. Загрузите фото — и предложение опубликовано!"
                },
                {
                    question: "Как получать оплату?",
                    answer: "Оплата производится на банковский счет, указанный при регистрации. Выплаты еженедельные. Комиссия платформы вычитается автоматически."
                }
            ]
        },
        {
            category: "Оплата и безопасность",
            items: [
                {
                    question: "Какие способы оплаты доступны?",
                    answer: "Оплата банковскими картами (МИР) через защищенный платежный шлюз. Также возможна оплата через СБП (Систему быстрых платежей)."
                },
                {
                    question: "Безопасны ли мои платежные данные?",
                    answer: "Да. Мы используем PCI DSS сертифицированные платежные системы. Данные вашей карты не хранятся на наших серверах и передаются напрямую в банк через зашифрованное соединение."
                },
                {
                    question: "Когда списываются деньги?",
                    answer: "Деньги списываются сразу после оформления заказа. При отмене или возврате средства возвращаются на вашу карту в течение 3-10 рабочих дней."
                },
                {
                    question: "Что делать, если деньги списались, а заказ не создался?",
                    answer: "Свяжитесь с нашей службой поддержки через форму обратной связи. Мы проверим транзакцию и вернем средства или создадим заказ вручную."
                }
            ]
        },
        {
            category: "Технические вопросы",
            items: [
                {
                    question: "Какие браузеры поддерживаются?",
                    answer: "Мы поддерживаем последние версии Chrome, Firefox, Safari, Edge, Яндекс."
                },
                {
                    question: "Почему не загружается карта?",
                    answer: "Проверьте подключение к интернету и разрешение на использование геолокации. Если проблема сохраняется, попробуйте очистить кэш."
                },
                {
                    question: "Есть ли мобильное приложение?",
                    answer: "Пока нет, но наш сайт полностью адаптирован для мобильных устройств. Вы можете добавить ярлык на главный экран для быстрого доступа."
                },
                {
                    question: "Как связаться с поддержкой?",
                    answer: "Напишите нам на kindplate.io@mail.ru или воспользуйтесь формой обратной связи на сайте. Мы отвечаем в течение 24 часов."
                }
            ]
        }
    ];

    return (
        <>
            <LegalPageSEO 
                title="FAQ - Часто задаваемые вопросы" 
                description="Ответы на часто задаваемые вопросы о Соммил. Узнайте, как заказывать еду, что делать с заказами, как стать партнером и многое другое."
            />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="max-w-4xl mx-auto px-4 py-6">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">Часто задаваемые вопросы</h1>
                        </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <p className="text-gray-600 text-lg">
                        Здесь вы найдете ответы на самые популярные вопросы о работе платформы Соммил.
                        Если вы не нашли ответ на свой вопрос, напишите нам на{" "}
                        <a href="mailto:kindplate.io@mail.ru" className="text-green-600 hover:text-green-700 font-medium">
                            kindplate.io@mail.ru
                        </a>
                    </p>
                </div>

                {faqs.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                            {section.category}
                        </h2>
                        
                        <div className="space-y-4">
                            {section.items.map((faq, faqIndex) => (
                                <div
                                    key={faqIndex}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                        {faq.question}
                                    </h3>
                                    <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                                        {faq.answer}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Contact Section */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Не нашли ответ?</h2>
                    <p className="text-gray-700 mb-4">
                        Мы всегда готовы помочь! Свяжитесь с нами удобным способом:
                    </p>
                    <ul className="space-y-2 text-gray-700">
                        <li>📧 Email: <a href="mailto:kindplate.io@mail.ru" className="text-green-600 hover:text-green-700 font-medium">kindplate.io@mail.ru</a></li>
                        <li>📱 Telegram: <a href="https://t.me/kindplatesupportbot" className="text-green-600 hover:text-green-700 font-medium">@kindplatesupportbot</a></li>
                        <li>⏰ Время работы: Пн-Пт, 9:00-21:00 МСК</li>
                    </ul>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-8">
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
                            <a href="/legal/privacy" className="hover:text-green-600">Конфиденциальность</a>
                        </div>
                    </div>
                </div>
            </footer>
            </div>
        </>
    );
}

