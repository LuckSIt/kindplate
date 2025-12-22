import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPageSEO } from "@/components/ui/seo";

export const Route = createFileRoute("/legal/privacy")({
    component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
    return (
        <>
            <LegalPageSEO 
                title="Политика конфиденциальности - KindPlate" 
                description="Политика конфиденциальности KindPlate. Узнайте, как мы собираем, используем, передаем и защищаем вашу информацию."
            />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                    <div className="max-w-4xl mx-auto px-4 py-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Политика Конфиденциальности KindPlate
                        </h1>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-4 py-8">
                    {/* Введение */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Последнее обновление: 22 декабря 2025 г.
                        </p>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">1. Введение</h2>
                        <div className="text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
                            <p>
                                Компания KindPlate ценит вашу конфиденциальность и обязуется защищать ваши персональные данные. 
                                Настоящая Политика конфиденциальности объясняет, как мы собираем, используем, передаем и защищаем 
                                вашу информацию, когда вы используете наше мобильное приложение KindPlate (далее – «Приложение») 
                                и связанные с ним услуги (далее – «Услуги»).
                            </p>
                            <p>
                                Услуги позволяют пользователям приобретать и резервировать излишки еды из участвующих (партнеров) 
                                кофеен, ресторанов, пекарен и других предприятий общественного питания.
                            </p>
                            <p>
                                Используя наше Приложение, вы соглашаетесь на сбор и использование информации в соответствии с 
                                настоящей Политикой конфиденциальности.
                            </p>
                        </div>
                    </section>

                    {/* Собираемая информация */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            2. Мы собираем следующие виды информации
                        </h2>
                        <div className="space-y-6 text-gray-700 dark:text-gray-300">
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    2.1. Информация, предоставляемая вами напрямую:
                                </h3>
                                <ul className="list-disc list-inside ml-4 space-y-2">
                                    <li>
                                        <strong>Данные для регистрации аккаунта:</strong> Имя, адрес электронной почты, номер телефона.
                                    </li>
                                    <li>
                                        <strong>Профильная информация:</strong> Ваши пищевые предпочтения (например, вегетарианские, безглютеновые).
                                    </li>
                                    <li>
                                        <strong>Платежная информация:</strong> Данные вашей банковской карты или реквизиты других платежных систем 
                                        (например, Apple Pay, Google Pay). Обратите внимание: обработка платежей осуществляется сторонними 
                                        платежными шлюзами, и мы не храним данные вашей карты на наших серверах. Мы получаем от них только 
                                        подтверждение оплаты и токенизированную информацию.
                                    </li>
                                    <li>
                                        <strong>Данные о заказах:</strong> История ваших бронирований и покупок, включая выбранные товары, 
                                        время заказа, сумму и Партнера, у которого был сделан заказ.
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    2.2. Информация, собираемая автоматически:
                                </h3>
                                <ul className="list-disc list-inside ml-4 space-y-2">
                                    <li>
                                        <strong>Данные об устройстве:</strong> Тип устройства, операционная система, уникальные идентификаторы 
                                        устройства (такие как IDFA или Android ID), IP-адрес, мобильный оператор.
                                    </li>
                                    <li>
                                        <strong>Данные о использовании Приложения:</strong> Как вы взаимодействуете с Приложением: какие страницы 
                                        просматриваете, какие поисковые запросы используете, время, проведенное в Приложении, частота и время 
                                        ваших сеансов.
                                    </li>
                                    <li>
                                        <strong>Геолокационные данные:</strong> С вашего явного согласия (через настройки устройства), мы можем 
                                        собирать данные о вашем точном или приблизительном местоположении для того, чтобы показывать вам ближайших 
                                        Партнеров и доступные для бронирования «сюрпризы» в вашем районе.
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    2.3. Информация от третьих сторон:
                                </h3>
                                <ul className="list-disc list-inside ml-4 space-y-2">
                                    <li>
                                        Мы можем получать информацию о вас от наших Партнеров в связи с выполнением вашего заказа 
                                        (например, статус готовности заказа).
                                    </li>
                                    <li>
                                        Если вы войдете в наше Приложение через социальные сети (например, Facebook, Google), мы получим 
                                        ваш публичный профиль и, в зависимости от ваших настроек, список друзей.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Использование информации */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            3. Мы используем собранную информацию для следующих целей:
                        </h2>
                        <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>
                                <strong>Предоставление и улучшение Услуг:</strong> Для создания и управления вашим аккаунтом, обработки 
                                бронирований и платежей, показа доступных предложений от Партнеров.
                            </li>
                            <li>
                                <strong>Связь с вами:</strong> Для отправки уведомлений о статусе заказа, подтверждений бронирования, 
                                информационных сообщений об акциях и обновлениях Приложения (вы можете отказаться от маркетинговых сообщений 
                                в любой момент).
                            </li>
                            <li>
                                <strong>Персонализация:</strong> Чтобы предлагать вам персонализированный контент и рекомендации на основе 
                                ваших предыдущих заказов, предпочтений и местоположения.
                            </li>
                            <li>
                                <strong>Поддержка и аналитика:</strong> Для ответа на ваши запросы в службу поддержки, анализа производительности 
                                Приложения и понимания поведения пользователей с целью улучшения функционала и пользовательского опыта.
                            </li>
                            <li>
                                <strong>Безопасность:</strong> Для выявления и предотвращения мошеннических транзакций, обеспечения безопасности 
                                наших систем и защиты прав наших пользователей и Партнеров.
                            </li>
                        </ul>
                    </section>

                    {/* Правовые основания */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            4. Правовые основания для обработки данных (в соответствии с GDPR):
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                            Если вы являетесь резидентом ЕЭЗ, мы обрабатываем ваши данные на следующих правовых основаниях:
                        </p>
                        <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>
                                <strong>Исполнение договора:</strong> Обработка необходима для выполнения наших обязательств перед вами 
                                (например, для обработки и выполнения вашего заказа).
                            </li>
                            <li>
                                <strong>Законный интерес:</strong> Для анализа использования Приложения, предотвращения мошенничества, 
                                обеспечения безопасности и маркетинга наших Услуг (при условии, что ваши интересы и основные права не перевешивают).
                            </li>
                            <li>
                                <strong>Согласие:</strong> В случаях, когда мы запрашиваем ваше явное согласие (например, для отправки 
                                маркетинговых сообщений по электронной почте или использования точных данных о местоположении). Вы можете 
                                отозвать свое согласие в любое время.
                            </li>
                        </ul>
                    </section>

                    {/* Передача данных */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            5. Мы не продаем и не сдаем в аренду ваши персональные данные третьим лицам. 
                            Мы передаем вашу информацию только в следующих случаях:
                        </h2>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300">
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    С Партнерами (кофейнями, ресторанами):
                                </h3>
                                <p>
                                    Мы передаем Партнеру, у которого вы забронировали продукцию, ваше имя и детали заказа (список товаров, 
                                    время бронирования). Это необходимо для того, чтобы Партнер мог идентифицировать вас и передать вам заказ. 
                                    Мы не передаем Партнерам ваш адрес электронной почты, номер телефона или платежную информацию для их 
                                    независимого маркетинга.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    С Поставщиками услуг:
                                </h3>
                                <p className="mb-2">
                                    Мы привлекаем доверенные третьи стороны для оказания услуг от нашего имени:
                                </p>
                                <ul className="list-disc list-inside ml-4 space-y-1">
                                    <li>Платежные шлюзы для обработки платежей.</li>
                                    <li>Службы доставки.</li>
                                    <li>Хостинг-провайдеры и облачные сервисы (например, AWS, Google Cloud).</li>
                                    <li>Сервисы аналитики (например, Google Analytics, Firebase) для анализа поведения пользователей.</li>
                                    <li>Сервисы маркетинга и рассылок.</li>
                                </ul>
                                <p className="mt-2">
                                    Эти поставщики имеют доступ к вашим данным только для выполнения своих задач от нашего имени и обязаны 
                                    не раскрывать и не использовать их для других целей.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    По требованию закона:
                                </h3>
                                <p>
                                    Мы можем раскрыть вашу информацию, если это требуется по закону, для защиты наших прав или безопасности, 
                                    или для расследования мошенничества или нарушения безопасности.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    При смене владельца:
                                </h3>
                                <p>
                                    В случае слияния, поглощения или продажи активов компании мы можем передать вашу информацию новому владельцу.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Международная передача */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            6. Международная передача данных
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Ваши данные могут обрабатываться и храниться на серверах, расположенных за пределами вашей страны проживания. 
                            Мы принимаем все необходимые меры для обеспечения того, чтобы такая передача соответствовала применимому 
                            законодательству о защите данных и что ваши данные оставались защищенными.
                        </p>
                    </section>

                    {/* Безопасность */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            7. Безопасность данных
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Мы реализовали соответствующие технические и организационные меры безопасности, предназначенные для защиты ваших 
                            персональных данных от несанкционированного доступа, использования, изменения или уничтожения. Эти меры включают 
                            шифрование данных (как при передаче, так и при хранении), регулярный мониторинг наших систем на предмет уязвимостей 
                            и строгий контроль доступа к данным.
                        </p>
                    </section>

                    {/* Срок хранения */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            8. Срок хранения данных
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Мы будем хранить ваши персональные данные только до тех пор, пока это необходимо для достижения целей, для которых 
                            они были собраны, включая выполнение юридических, бухгалтерских или отчетных требований. Например, мы храним данные 
                            о заказах для целей налогообложения и выполнения договорных обязательств. По истечении срока хранения ваши данные 
                            будут безопасно удалены или анонимизированы.
                        </p>
                    </section>

                    {/* Права пользователей */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            9. Ваши права и возможности
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                            В зависимости от вашей юрисдикции, у вас могут быть следующие права:
                        </p>
                        <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700 dark:text-gray-300">
                            <li><strong>Право на доступ:</strong> Вы можете запросить копию ваших персональных данных.</li>
                            <li><strong>Право на исправление:</strong> Вы можете исправить неточные или неполные данные.</li>
                            <li><strong>Право на удаление («Право на забвение»):</strong> Вы можете запросить удаление ваших данных.</li>
                            <li><strong>Право на ограничение обработки:</strong> Вы можете запросить приостановку обработки ваших данных.</li>
                            <li><strong>Право на переносимость данных:</strong> Вы можете запросить передачу ваших данных другому оператору.</li>
                            <li><strong>Право на возражение:</strong> Вы можете возразить против обработки ваших данных на основании законных интересов.</li>
                            <li><strong>Право отозвать согласие:</strong> Если обработка основана на согласии, вы можете отозвать его в любое время.</li>
                            <li><strong>Управление уведомлениями:</strong> Вы можете отключить push-уведомления и маркетинговые рассылки через настройки вашего устройства или в профиле в Приложении.</li>
                        </ul>
                        <p className="mt-4 text-gray-700 dark:text-gray-300">
                            Чтобы воспользоваться этими правами, свяжитесь с нами по контактам, указанным ниже.
                        </p>
                    </section>

                    {/* Cookie */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            10. Файлы cookie и аналогичные технологии
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Наше Приложение использует файлы cookie и аналогичные технологии (например, пиксели) для сбора данных об использовании, 
                            запоминания ваших предпочтений и персонализации рекламы. Вы можете управлять настройками cookie через настройки вашего 
                            браузера или устройства.
                        </p>
                    </section>

                    {/* Изменения */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            11. Изменения в Политике конфиденциальности
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Мы можем время от времени обновлять нашу Политику конфиденциальности. О любых изменениях мы уведомим вас, разместив 
                            новую версию Политики в Приложении с указанием даты последнего обновления. Рекомендуем периодически просматривать эту 
                            страницу для получения актуальной информации.
                        </p>
                    </section>

                    {/* Контакты */}
                    <section className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            12. Контактная информация
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                            Если у вас есть какие-либо вопросы, concerns или запросы относительно этой Политики конфиденциальности или ваших данных, 
                            пожалуйста, свяжитесь с нами:
                        </p>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                            <li>
                                По электронной почте: <a 
                                    href="mailto:kindplate.io@mail.ru" 
                                    className="text-green-600 dark:text-green-400 hover:underline font-medium"
                                >
                                    kindplate.io@mail.ru
                                </a>
                            </li>
                            <li>
                                Через Приложение: Раздел «Помощь» или «Служба поддержки»
                            </li>
                        </ul>
                    </section>

                    {/* Навигация */}
                    <div className="text-center mt-8">
                        <Link 
                            to="/" 
                            className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                        >
                            ← Вернуться на главную
                        </Link>
                    </div>
                </main>
            </div>
        </>
    );
}
