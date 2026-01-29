import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

type DocumentTab = 'policy' | 'processing' | 'distribution' | 'advertising' | 'cookie' | 'offer';

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** При открытии переключить на эту вкладку (например, 'cookie' из баннера согласия). */
  initialTab?: DocumentTab;
}

export function DocumentsModal({ isOpen, onClose, initialTab }: DocumentsModalProps) {
  const [activeTab, setActiveTab] = useState<DocumentTab>(initialTab ?? 'policy');

  useEffect(() => {
    if (isOpen && initialTab) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const tabs: { id: DocumentTab; label: string }[] = [
    { id: 'policy', label: 'ПОЛИТИКА' },
    { id: 'processing', label: 'ОБРАБОТКА' },
    /*{ id: 'distribution', label: 'РАСПРОСТРАНЕНИЕ' },
    { id: 'advertising', label: 'РЕКЛАМА' },*/
    { id: 'cookie', label: 'COOKIE' },
    { id: 'offer', label: 'ОФЕРТА' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'policy':
        return (
          <div className="documents-modal__content">
            <h2 className="documents-modal__content-title">
              ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ И ОБРАБОТКИ ПЕРСОНАЛЬНЫХ ДАННЫХ KINDPLATE
            </h2>
            <p className="documents-modal__content-subtitle">
              г. Санкт-Петербург, «26» января 2026 г.
            </p>
            
            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">1. Общие положения</h3>
              <p className="documents-modal__content-text">
                <strong>1.1.</strong> Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки и защиты персональных данных пользователей платформы Kindplate (сайт и мобильное приложение) индивидуальным предпринимателем ИП А. М. Сатаев (ИНН: 784808895487, ОГРН: 326784700012921, далее — «Оператор», «мы»).
              </p>
              <p className="documents-modal__content-text">
                <strong>1.2.</strong> Политика разработана в соответствии с Федеральным законом РФ № 152-ФЗ «О персональных данных» и иным применимым законодательством Российской Федерации.
              </p>
              <p className="documents-modal__content-text">
                <strong>1.3.</strong> Регистрация в приложении, использование сайта, нажатие кнопки «Зарегистрироваться» / «Продолжить» либо фактическое использование сервиса означает согласие пользователя с настоящей Политикой, пользовательским соглашением и офертой.
              </p>
              <p className="documents-modal__content-text">
                <strong>1.4.</strong> Если пользователь не согласен с условиями Политики, он обязан немедленно прекратить использование платформы Kindplate.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">2. Термины</h3>
              <p className="documents-modal__content-text">
                <strong>2.1.</strong> «Платформа Kindplate» (далее — «Платформа») — сайт и мобильное приложение Kindplate, принадлежащие Оператору и предназначенные для взаимодействия пользователей с партнёрами (ресторанами, кафе, магазинами) по бронированию и покупке продуктов с истекающим сроком годности.
              </p>
              <p className="documents-modal__content-text">
                <strong>2.2.</strong> «Персональные данные» — любая информация, относящаяся к прямо или косвенно определённому физическому лицу (пользователю), включая, но не ограничиваясь: ФИО, номер телефона, адрес электронной почты, данные о заказах, данные устройства, IP-адрес и иные сведения.
              </p>
              <p className="documents-modal__content-text">
                <strong>2.3.</strong> «Обработка персональных данных» — любое действие (операция) или совокупность действий, совершаемых с персональными данными с использованием средств автоматизации или без них: сбор, запись, систематизация, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передача (в том числе предоставление, доступ), обезличивание, блокирование, удаление, уничтожение.
              </p>
              <p className="documents-modal__content-text">
                <strong>2.4.</strong> «Пользователь» — любое физическое лицо, прошедшее регистрацию на Платформе или использующее Платформу любым способом.
              </p>
              <p className="documents-modal__content-text">
                <strong>2.5.</strong> «Партнёр» — юридическое или физическое лицо (ресторан, кафе, магазин и др.), размещающее предложения о продаже продуктов через Платформу.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">3. Статус Оператора</h3>
              <p className="documents-modal__content-text">
                <strong>3.1.</strong> Оператором персональных данных является ИП А. М. Сатаев (ИНН: 784808895487, ОГРН: 326784700012921), осуществляющий обработку персональных данных пользователей Платформы в целях её функционирования, исполнения договоров и соблюдения требований законодательства.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">4. Состав обрабатываемых персональных данных</h3>
              <p className="documents-modal__content-text">
                <strong>4.1.</strong> Оператор может обрабатывать следующие категории персональных данных пользователей:
              </p>
              <ul className="documents-modal__content-list">
                <li>фамилия, имя (при наличии — отчество);</li>
                <li>номер мобильного телефона;</li>
                <li>адрес электронной почты;</li>
                <li>данные об аккаунте (идентификатор пользователя, история заказов, отзывы, бонусы и т.п.);</li>
                <li>данные о взаимодействии с Платформой: дата и время посещения, использованные функции, IP-адрес, данные браузера и устройства, cookie-файлы, идентификаторы рекламных и аналитических систем;</li>
                <li>информация о платежах: сумма, метод оплаты, статус транзакции (при этом реквизиты банковской карты обрабатываются платёжным агрегатором и не хранятся у Оператора).</li>
              </ul>
              <p className="documents-modal__content-text">
                <strong>4.2.</strong> Оператор, как правило, не обрабатывает специальные категории персональных данных (о здоровье, политических взглядах, религиозных убеждениях и т.п.). В случае их получения по ошибке такие данные подлежат удалению либо обезличиванию, если иное не требуется по закону.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">5. Цели обработки персональных данных</h3>
              <p className="documents-modal__content-text">
                <strong>5.1.</strong> Персональные данные пользователей обрабатываются Оператором в следующих целях:
              </p>
              <ul className="documents-modal__content-list">
                <li>регистрация и идентификация пользователя на Платформе;</li>
                <li>обеспечение работы функционала Платформы, создание, оформление и исполнение заказов;</li>
                <li>обмен информацией между пользователем и Партнёром (передача данных о заказе и контактных данных пользователя Партнёру для исполнения заказа);</li>
                <li>обработка платежей, возвратов, претензий и обращений пользователей;</li>
                <li>направление сервисных и информационных уведомлений (о статусе заказа, изменении условий, технических уведомлениях, безопасности);</li>
                <li>улучшение качества работы Платформы, проведение аналитики и статистики, персонализация отображаемого контента и предложений;</li>
                <li>соблюдение требований действующего законодательства РФ, включая бухгалтерский и налоговый учёт, отчётность и ответы на запросы уполномоченных органов.</li>
              </ul>
              <p className="documents-modal__content-text">
                <strong>5.2.</strong> Обработка персональных данных не осуществляется в целях, несовместимых с указанными в настоящем разделе.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">6. Правовые основания обработки</h3>
              <p className="documents-modal__content-text">
                <strong>6.1.</strong> Правовыми основаниями обработки персональных данных являются:
              </p>
              <ul className="documents-modal__content-list">
                <li>согласие пользователя на обработку его персональных данных, выраженное при регистрации, оформлении заказа, а также при ином использовании Платформы;</li>
                <li>необходимость обработки для заключения и исполнения договоров (публичной оферты) между пользователем и Оператором, а также между пользователем и Партнёром;</li>
                <li>исполнение обязательств Оператора, наложенных законодательством Российской Федерации (включая в сфере бухгалтерского и налогового учёта, защиты прав потребителей и т.п.).</li>
              </ul>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">7. Передача персональных данных третьим лицам</h3>
              <p className="documents-modal__content-text">
                <strong>7.1.</strong> Оператор может передавать персональные данные пользователей третьим лицам в следующих случаях:
              </p>
              <ul className="documents-modal__content-list">
                <li>Партнёрам Платформы — в объёме, необходимом для исполнения заказа (ФИО, номер телефона, информация о заказе, комментарии и т.п.);</li>
                <li>платёжным агрегаторам, банкам и иным финансовым организациям — для приёма и возврата платежей;</li>
                <li>подрядчикам Оператора (хостинг-провайдерам, службам технической поддержки, маркетинговым и аналитическим сервисам, провайдерам SMS и email-рассылок) — при условии заключения соглашений о конфиденциальности и защите данных;</li>
                <li>государственным органам и органам местного самоуправления — при наличии правового основания и надлежащим образом оформленного запроса;</li>
                <li>в случаях реорганизации бизнеса (передача в рамках правопреемства) — при условии соблюдения требований законодательства о персональных данных.</li>
              </ul>
              <p className="documents-modal__content-text">
                <strong>7.2.</strong> Оператор не продаёт персональные данные пользователей и не раскрывает их третьим лицам вне случаев, указанных в п. 7.1, либо предусмотренных законом.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">8. Хранение и сроки обработки персональных данных</h3>
              <p className="documents-modal__content-text">
                <strong>8.1.</strong> Персональные данные пользователей хранятся на серверах, расположенных на территории Российской Федерации, либо в юрисдикциях, обеспечивающих адекватный уровень защиты персональных данных в соответствии с требованиями законодательства РФ.
              </p>
              <p className="documents-modal__content-text">
                <strong>8.2.</strong> Срок обработки персональных данных определяется целями обработки, сроком действия договоров с пользователем, сроками исковой давности, а также требованиями законодательства Российской Федерации (для хранения бухгалтерской, налоговой и иной документации).
              </p>
              <p className="documents-modal__content-text">
                <strong>8.3.</strong> Персональные данные подлежат удалению или обезличиванию после достижения целей обработки либо при отзыве согласия пользователя, если хранение данных не требуется по закону.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">9. Защита персональных данных</h3>
              <p className="documents-modal__content-text">
                <strong>9.1.</strong> Оператор принимает необходимые и достаточные организационные и технические меры для защиты персональных данных от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования, распространения, а также иных неправомерных действий.
              </p>
              <p className="documents-modal__content-text">
                <strong>9.2.</strong> Доступ к персональным данным предоставляется только тем сотрудникам и подрядчикам Оператора, которым такой доступ необходим для выполнения служебных обязанностей и исполнения договоров.
              </p>
              <p className="documents-modal__content-text">
                <strong>9.3.</strong> В случае утечки или иного инцидента, связанного с персональными данными, Оператор принимает необходимые меры по минимизации последствий и при необходимости уведомляет уполномоченные органы и пользователей.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">10. Права пользователя как субъекта персональных данных</h3>
              <p className="documents-modal__content-text">
                <strong>10.1.</strong> Пользователь имеет право получать информацию о факте, целях, правовых основаниях и способах обработки его персональных данных, а также о лицах, которым данные могут быть переданы.
              </p>
              <p className="documents-modal__content-text">
                <strong>10.2.</strong> Пользователь имеет право требовать уточнения своих персональных данных, их блокирования или уничтожения, если данные являются неполными, устаревшими, неточными, незаконно полученными или не являются необходимыми для заявленных целей обработки.
              </p>
              <p className="documents-modal__content-text">
                <strong>10.3.</strong> Пользователь имеет право отозвать своё согласие на обработку персональных данных, направив Оператору соответствующее заявление по контактам, указанным в разделе 14 настоящей Политики. При этом Оператор вправе продолжить обработку персональных данных при наличии иных законных оснований.
              </p>
              <p className="documents-modal__content-text">
                <strong>10.4.</strong> Пользователь имеет право обжаловать действия или бездействие Оператора, нарушающие его права, в уполномоченный орган по защите прав субъектов персональных данных или в суд.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">11. Использование файлов cookie и аналогичных технологий</h3>
              <p className="documents-modal__content-text">
                <strong>11.1.</strong> Платформа может использовать cookie-файлы, пиксель-теги, веб-маяки и другие технологии для:
              </p>
              <ul className="documents-modal__content-list">
                <li>идентификации пользователя и поддержания сессии;</li>
                <li>сохранения настроек и параметров аккаунта;</li>
                <li>анализа трафика и статистики использования Платформы;</li>
                <li>показа персонализированных предложений и рекламы.</li>
              </ul>
              <p className="documents-modal__content-text">
                <strong>11.2.</strong> Пользователь может ограничить или отключить использование cookie в настройках браузера или устройства. Однако это может повлиять на корректность работы Платформы, в том числе на возможность авторизации или оформления заказов.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">12. Обработка персональных данных третьих лиц</h3>
              <p className="documents-modal__content-text">
                <strong>12.1.</strong> Если пользователь предоставляет Оператору персональные данные третьих лиц (например, контактные данные получателя заказа), пользователь подтверждает, что получил согласие этих лиц на передачу и обработку их персональных данных в соответствии с настоящей Политикой.
              </p>
              <p className="documents-modal__content-text">
                <strong>12.2.</strong> Оператор вправе использовать такие данные исключительно для целей, указанных пользователем (исполнение заказа, доставка и т.п.).
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">13. Изменение Политики</h3>
              <p className="documents-modal__content-text">
                <strong>13.1.</strong> Оператор вправе вносить изменения в настоящую Политику в одностороннем порядке. Актуальная версия Политики всегда доступна на сайте и/или в мобильном приложении Платформы.
              </p>
              <p className="documents-modal__content-text">
                <strong>13.2.</strong> Изменения вступают в силу с момента размещения новой версии Политики, если иное не указано в самой Политике.
              </p>
              <p className="documents-modal__content-text">
                <strong>13.3.</strong> Продолжение использования Платформы после внесения изменений означает согласие пользователя с обновлённой Политикой.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">14. Контактные данные Оператора</h3>
              <p className="documents-modal__content-text">
                ИП А. М. Сатаев
              </p>
              <p className="documents-modal__content-text">
                <strong>ИНН:</strong> 784808895487
              </p>
              <p className="documents-modal__content-text">
                <strong>ОГРН:</strong> 326784700012921
              </p>
              <p className="documents-modal__content-text">
                <strong>Телефон:</strong> +7 999 028 1207
              </p>
              <p className="documents-modal__content-text">
                <strong>Email:</strong> <a href="mailto:kindplate.io@mail.ru" className="documents-modal__content-link">kindplate.io@mail.ru</a>
              </p>
              <p className="documents-modal__content-text" style={{ marginTop: '20px' }}>
                Используя Платформу Kindplate, пользователь подтверждает, что внимательно ознакомился с настоящей Политикой, полностью её понимает и соглашается с условиями обработки своих персональных данных.
              </p>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="documents-modal__content">
            <h2 className="documents-modal__content-title">
              ОБРАБОТКА ПЕРСОНАЛЬНЫХ ДАННЫХ
            </h2>
            <p className="documents-modal__content-subtitle">
              г. Санкт-Петербург, «26» января 2026 г.
            </p>
            
            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">Правовые основания для обработки данных</h3>
              <p className="documents-modal__content-text">
                Если вы являетесь резидентом ЕЭЗ, мы обрабатываем ваши данные на следующих правовых основаниях:
              </p>
              <ul className="documents-modal__content-list">
                <li><strong>Исполнение договора:</strong> Обработка необходима для выполнения наших обязательств перед вами 
                (например, для обработки и выполнения вашего заказа).</li>
                <li><strong>Законный интерес:</strong> Для анализа использования Приложения, предотвращения мошенничества, 
                обеспечения безопасности и маркетинга наших Услуг.</li>
                <li><strong>Согласие:</strong> В случаях, когда мы запрашиваем ваше явное согласие (например, для отправки 
                маркетинговых сообщений или использования точных данных о местоположении). Вы можете отозвать свое согласие в любое время.</li>
              </ul>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">Международная передача данных</h3>
              <p className="documents-modal__content-text">
                Ваши данные могут обрабатываться и храниться на серверах, расположенных за пределами вашей страны проживания. 
                Мы принимаем все необходимые меры для обеспечения того, чтобы такая передача соответствовала применимому 
                законодательству о защите данных и что ваши данные оставались защищенными.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">Срок хранения данных</h3>
              <p className="documents-modal__content-text">
                Мы будем хранить ваши персональные данные только до тех пор, пока это необходимо для достижения целей, для которых 
                они были собраны, включая выполнение юридических, бухгалтерских или отчетных требований. По истечении срока хранения 
                ваши данные будут безопасно удалены или анонимизированы.
              </p>
            </div>
          </div>
        );

      /*case 'distribution':
        return (
          <div className="documents-modal__content">
            <h2 className="documents-modal__content-title">
              РАСПРОСТРАНЕНИЕ ДАННЫХ
            </h2>
            <p className="documents-modal__content-subtitle">
              г. Санкт-Петербург, «26» января 2026 г.
            </p>
            
            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">Передача данных Партнерам</h3>
              <p className="documents-modal__content-text">
                Мы передаем Партнеру, у которого вы забронировали продукцию, ваше имя и детали заказа (список товаров, 
                время бронирования). Это необходимо для того, чтобы Партнер мог идентифицировать вас и передать вам заказ. 
                Мы не передаем Партнерам ваш адрес электронной почты, номер телефона или платежную информацию для их 
                независимого маркетинга.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">Передача данных Поставщикам услуг</h3>
              <p className="documents-modal__content-text">
                Мы привлекаем доверенные третьи стороны для оказания услуг от нашего имени:
              </p>
              <ul className="documents-modal__content-list">
                <li>Платежные шлюзы для обработки платежей</li>
                <li>Службы доставки</li>
                <li>Хостинг-провайдеры и облачные сервисы (например, AWS, Google Cloud)</li>
                <li>Сервисы аналитики (например, Google Analytics, Firebase)</li>
                <li>Сервисы маркетинга и рассылок</li>
              </ul>
              <p className="documents-modal__content-text">
                Эти поставщики имеют доступ к вашим данным только для выполнения своих задач от нашего имени и обязаны 
                не раскрывать и не использовать их для других целей.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">Другие случаи передачи</h3>
              <p className="documents-modal__content-text">
                <strong>По требованию закона:</strong> Мы можем раскрыть вашу информацию, если это требуется по закону, 
                для защиты наших прав или безопасности, или для расследования мошенничества или нарушения безопасности.
              </p>
              <p className="documents-modal__content-text">
                <strong>При смене владельца:</strong> В случае слияния, поглощения или продажи активов компании мы можем 
                передать вашу информацию новому владельцу.
              </p>
            </div>
          </div>
        );
*/
      /*case 'advertising':
        return (
          <div className="documents-modal__content">
            <h2 className="documents-modal__content-title">
              РЕКЛАМА И МАРКЕТИНГ
            </h2>
            <p className="documents-modal__content-subtitle">
              г. Санкт-Петербург, «26» января 2026 г.
            </p>
            
            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">Маркетинговые сообщения</h3>
              <p className="documents-modal__content-text">
                Мы можем отправлять вам информационные сообщения об акциях, новых предложениях и обновлениях Приложения. 
                Вы можете отказаться от маркетинговых сообщений в любой момент через настройки вашего профиля в Приложении 
                или по ссылке в письме.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">Персонализация рекламы</h3>
              <p className="documents-modal__content-text">
                Мы используем собранную информацию для персонализации рекламы и предложений, которые вы видите в Приложении. 
                Это помогает нам показывать вам релевантный контент на основе ваших предыдущих заказов, предпочтений и местоположения.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">Управление рекламой</h3>
              <p className="documents-modal__content-text">
                Вы можете управлять настройками рекламы и маркетинговых сообщений через настройки вашего профиля в Приложении. 
                Вы также можете отключить персонализированную рекламу в настройках вашего устройства.
              </p>
            </div>
          </div>
        );
*/
      case 'cookie':
        return (
          <div className="documents-modal__content">
            <h2 className="documents-modal__content-title">
              ФАЙЛЫ COOKIE И АНАЛОГИЧНЫЕ ТЕХНОЛОГИИ
            </h2>
            <p className="documents-modal__content-subtitle">
              г. Санкт-Петербург, «26» января 2026 г.
            </p>
            
            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">Что такое cookie</h3>
              <p className="documents-modal__content-text">
                Наше Приложение использует файлы cookie и аналогичные технологии (например, пиксели) для сбора данных об использовании, 
                запоминания ваших предпочтений и персонализации рекламы.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">Типы используемых cookie</h3>
              <ul className="documents-modal__content-list">
                <li><strong>Необходимые cookie:</strong> Эти cookie необходимы для работы Приложения и не могут быть отключены. 
                Они обычно устанавливаются в ответ на ваши действия, такие как вход в систему или заполнение форм.</li>
                <li><strong>Функциональные cookie:</strong> Эти cookie позволяют Приложению запоминать ваши предпочтения (например, 
                язык, регион) и предоставлять улучшенные функции.</li>
                <li><strong>Аналитические cookie:</strong> Эти cookie помогают нам понять, как посетители взаимодействуют с Приложением, 
                собирая и сообщая информацию анонимно.</li>
                <li><strong>Рекламные cookie:</strong> Эти cookie используются для отслеживания ваших посещений и интересов для показа 
                релевантной рекламы.</li>
              </ul>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">Управление cookie</h3>
              <p className="documents-modal__content-text">
                Вы можете управлять настройками cookie через настройки вашего браузера или устройства. Обратите внимание, что отключение 
                некоторых типов cookie может повлиять на функциональность Приложения.
              </p>
            </div>
          </div>
        );

      case 'offer':
        return (
          <div className="documents-modal__content">
            <h2 className="documents-modal__content-title">
              ПУБЛИЧНАЯ ОФЕРТА ПЛАТФОРМЫ KINDPLATE
            </h2>
            <p className="documents-modal__content-subtitle">
              г. Санкт-Петербург, «26» января 2026 г.
            </p>
            
            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">1. Общие положения</h3>
              <p className="documents-modal__content-text">
                <strong>1.1.</strong> Настоящий документ является официальной публичной офертой индивидуального предпринимателя ИП А. М. Сатаев (ИНН: 784808895487, ОГРН: 326784700012921, тел.: +7 999 028 1207, email: kindplate.io@mail.ru, далее — «Компания»), адресованной юридическим и физическим лицам (далее — «Покупатель») о предоставлении доступа к платформе Kindplate для поиска, бронирования и оплаты продуктов.
              </p>
              <p className="documents-modal__content-text">
                <strong>1.2.</strong> Акцепт оферты (полное и безоговорочное принятие) происходит путём: регистрации на Платформе, оплаты услуг, либо совершения покупки. С момента акцепта считается заключённым договор на указанных условиях.
              </p>
              <p className="documents-modal__content-text">
                <strong>1.3.</strong> Платформа выступает информационным агрегатором и платёжным посредником. Компания НЕ продаёт продукты и НЕ несёт ответственности за их качество, безопасность и соответствие стандартам.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">2. Предмет оферты</h3>
              <p className="documents-modal__content-text">
                <strong>2.1.</strong> Компания предоставляет Покупателю доступ к Платформе для:
              </p>
              <ul className="documents-modal__content-list">
                <li>поиска предложений от Продавцов (рестораны, кафе, магазины);</li>
                <li>бронирования и оплаты продуктов онлайн;</li>
                <li>передачи платежа Продавцу за вычетом комиссии 12%.</li>
              </ul>
              <p className="documents-modal__content-text">
                <strong>2.2.</strong> Услуги оказываются дистанционно через сайт и мобильное приложение.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">3. Порядок оказания услуг</h3>
              <p className="documents-modal__content-text">
                <strong>3.1.</strong> Покупатель регистрируется, выбирает продукт и оплачивает через платёжный сервис.
              </p>
              <p className="documents-modal__content-text">
                <strong>3.2.</strong> Деньги передаются Продавцу после подтверждения Покупателем получения заказа.
              </p>
              <p className="documents-modal__content-text">
                <strong>3.3.</strong> Срок оказания услуг — момент предоставления доступа к Платформе (сразу после оплаты).
              </p>
              <p className="documents-modal__content-text">
                <strong>3.4.</strong> Покупатель самостоятельно забирает заказ у Продавца в указанное время.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">4. Стоимость услуг и порядок расчетов</h3>
              <p className="documents-modal__content-text">
                <strong>4.1.</strong> Стоимость услуг включена в цену продукта (с Продавца удерживается комиссия 10%). Покупатель оплачивает только цену продукта.
              </p>
              <p className="documents-modal__content-text">
                <strong>4.2.</strong> Оплата производится банковской картой или электронными средствами. Возврат средств возможен только при отказе Продавца от исполнения заказа.
              </p>
              <p className="documents-modal__content-text">
                <strong>4.3.</strong> Налоги: Компания выступает налоговым агентом по НДФЛ при необходимости.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">5. Права и обязанности сторон</h3>
              <p className="documents-modal__content-text">
                <strong>Обязанности Покупателя:</strong>
              </p>
              <ul className="documents-modal__content-list">
                <li>предоставлять достоверные данные;</li>
                <li>оплачивать услуги своевременно;</li>
                <li>получить заказ у Продавца и проверить качество самостоятельно.</li>
              </ul>
              <p className="documents-modal__content-text">
                <strong>Обязанности Компании:</strong>
              </p>
              <ul className="documents-modal__content-list">
                <li>обеспечить доступ к Платформе;</li>
                <li>передать платеж Продавцу;</li>
                <li>предоставить информацию о предложениях.</li>
              </ul>
              <p className="documents-modal__content-text">
                <strong>5.1.</strong> Компания НЕ отвечает за:
              </p>
              <ul className="documents-modal__content-list">
                <li>качество, безопасность продуктов (это ответственность Продавца);</li>
                <li>соблюдение Продавцом санитарных норм;</li>
                <li>вред здоровью от продуктов.</li>
              </ul>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">6. Порядок расторжения и возврата</h3>
              <p className="documents-modal__content-text">
                <strong>6.1.</strong> Покупатель вправе отказаться до получения заказа. После получения — только при порче (спор с Продавцом).
              </p>
              <p className="documents-modal__content-text">
                <strong>6.2.</strong> Возврат средств в течение 10 дней на реквизиты Покупателя.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">7. Ответственность сторон</h3>
              <p className="documents-modal__content-text">
                <strong>7.1.</strong> Штраф за просрочку оплаты — 0,1% в день.
              </p>
              <p className="documents-modal__content-text">
                <strong>7.2.</strong> Компания не несет ответственности за убытки от действий Продавцов. Максимальная ответственность — стоимость услуг.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">8. Конфиденциальность</h3>
              <p className="documents-modal__content-text">
                <strong>8.1.</strong> Обработка персональных данных по ФЗ-152. Согласие дается акцептом оферты.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">9. Разрешение споров</h3>
              <p className="documents-modal__content-text">
                <strong>9.1.</strong> Претензии направлять на email: <a href="mailto:info@kindplate.ru" className="documents-modal__content-link">info@kindplate.ru</a> или +7 999 028 1207. Срок рассмотрения — 10 дней.
              </p>
              <p className="documents-modal__content-text">
                <strong>9.2.</strong> Споры — в Арбитражном суде г. Санкт-Петербурга.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">10. Прочие условия</h3>
              <p className="documents-modal__content-text">
                <strong>10.1.</strong> Оферта действует с момента размещения на сайте. Изменения публикуются на сайте.
              </p>
              <p className="documents-modal__content-text">
                <strong>10.2.</strong> Признание пункта недействительным не влияет на остальные.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">Реквизиты Компании</h3>
              <p className="documents-modal__content-text">
                ИП А. М. Сатаев «Kindplate»
              </p>
              <p className="documents-modal__content-text">
                <strong>ИНН:</strong> 784808895487
              </p>
              <p className="documents-modal__content-text">
                <strong>ОГРН:</strong> 326784700012921
              </p>
              <p className="documents-modal__content-text">
                <strong>Телефон:</strong> +7 999 028 1207
              </p>
              <p className="documents-modal__content-text">
                <strong>Email:</strong> <a href="mailto:kindplate.io@mail.ru" className="documents-modal__content-link">kindplate.io@mail.ru</a>
              </p>
              <p className="documents-modal__content-text" style={{ marginTop: '20px' }}>
                Акцептуя оферту, Покупатель подтверждает понимание рисков и ответственности Продавца за продукты.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="documents-modal__overlay" onClick={onClose}>
      <div className="documents-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="documents-modal__header">
          <h1 className="documents-modal__title">
            Документы
          </h1>
          <button 
            className="documents-modal__close-button"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="documents-modal__tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`documents-modal__tab ${activeTab === tab.id ? 'documents-modal__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="documents-modal__content-wrapper">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="documents-modal__footer">
          <button 
            className="documents-modal__button"
            onClick={onClose}
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}
