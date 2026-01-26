import React, { useState } from 'react';
import { X } from 'lucide-react';

type DocumentTab = 'policy' | 'processing' | 'distribution' | 'advertising' | 'cookie';

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentsModal({ isOpen, onClose }: DocumentsModalProps) {
  const [activeTab, setActiveTab] = useState<DocumentTab>('policy');

  if (!isOpen) return null;

  const tabs: { id: DocumentTab; label: string }[] = [
    { id: 'policy', label: 'ПОЛИТИКА' },
    { id: 'processing', label: 'ОБРАБОТКА' },
    { id: 'distribution', label: 'РАСПРОСТРАНЕНИЕ' },
    { id: 'advertising', label: 'РЕКЛАМА' },
    { id: 'cookie', label: 'COOKIE' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'policy':
        return (
          <div className="documents-modal__content">
            <h2 className="documents-modal__content-title">
              ПОЛИТИКА В ОТНОШЕНИИ ОБРАБОТКИ ПЕРСОНАЛЬНЫХ ДАННЫХ
            </h2>
            <p className="documents-modal__content-subtitle">
              г. Москва, редакция от 22.12.2025 г.
            </p>
            
            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">Термины и определения</h3>
              <p className="documents-modal__content-text">
                Компания KindPlate ценит вашу конфиденциальность и обязуется защищать ваши персональные данные. 
                Настоящая Политика конфиденциальности объясняет, как мы собираем, используем, передаем и защищаем 
                вашу информацию, когда вы используете наше мобильное приложение KindPlate (далее – «Приложение») 
                и связанные с ним услуги (далее – «Услуги»).
              </p>
              <p className="documents-modal__content-text">
                Услуги позволяют пользователям приобретать и резервировать излишки еды из участвующих (партнеров) 
                кофеен, ресторанов, пекарен и других предприятий общественного питания.
              </p>
              <p className="documents-modal__content-text">
                Используя наше Приложение, вы соглашаетесь на сбор и использование информации в соответствии с 
                настоящей Политикой конфиденциальности.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">1. Мы собираем следующие виды информации</h3>
              <p className="documents-modal__content-text">
                <strong>Информация, предоставляемая вами напрямую:</strong> Данные для регистрации аккаунта (имя, 
                адрес электронной почты, номер телефона), профильная информация, платежная информация, данные о заказах.
              </p>
              <p className="documents-modal__content-text">
                <strong>Информация, собираемая автоматически:</strong> Данные об устройстве, данные о использовании 
                Приложения, геолокационные данные (с вашего согласия).
              </p>
              <p className="documents-modal__content-text">
                <strong>Информация от третьих сторон:</strong> Информация от наших Партнеров в связи с выполнением 
                вашего заказа, данные из социальных сетей при входе через них.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">2. Мы используем собранную информацию для следующих целей</h3>
              <ul className="documents-modal__content-list">
                <li>Предоставление и улучшение Услуг</li>
                <li>Связь с вами (уведомления о статусе заказа, подтверждения бронирования)</li>
                <li>Персонализация контента и рекомендаций</li>
                <li>Поддержка и аналитика</li>
                <li>Безопасность (выявление и предотвращение мошеннических транзакций)</li>
              </ul>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">3. Передача данных</h3>
              <p className="documents-modal__content-text">
                Мы не продаем и не сдаем в аренду ваши персональные данные третьим лицам. Мы передаем вашу информацию 
                только Партнерам (для выполнения заказа), Поставщикам услуг (платежные шлюзы, хостинг, аналитика), 
                по требованию закона или при смене владельца компании.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">4. Безопасность данных</h3>
              <p className="documents-modal__content-text">
                Мы реализовали соответствующие технические и организационные меры безопасности, предназначенные для защиты 
                ваших персональных данных от несанкционированного доступа, использования, изменения или уничтожения. 
                Эти меры включают шифрование данных, регулярный мониторинг наших систем и строгий контроль доступа.
              </p>
            </div>

            <div className="documents-modal__content-section">
              <h3 className="documents-modal__content-heading">5. Ваши права</h3>
              <p className="documents-modal__content-text">
                В зависимости от вашей юрисдикции, у вас могут быть следующие права: право на доступ, исправление, 
                удаление, ограничение обработки, переносимость данных, право на возражение, право отозвать согласие, 
                управление уведомлениями.
              </p>
              <p className="documents-modal__content-text">
                Чтобы воспользоваться этими правами, свяжитесь с нами по электронной почте: 
                <a href="mailto:kindplate.io@mail.ru" className="documents-modal__content-link">
                  kindplate.io@mail.ru
                </a>
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
              г. Москва, редакция от 22.12.2025 г.
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

      case 'distribution':
        return (
          <div className="documents-modal__content">
            <h2 className="documents-modal__content-title">
              РАСПРОСТРАНЕНИЕ ДАННЫХ
            </h2>
            <p className="documents-modal__content-subtitle">
              г. Москва, редакция от 22.12.2025 г.
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

      case 'advertising':
        return (
          <div className="documents-modal__content">
            <h2 className="documents-modal__content-title">
              РЕКЛАМА И МАРКЕТИНГ
            </h2>
            <p className="documents-modal__content-subtitle">
              г. Москва, редакция от 22.12.2025 г.
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

      case 'cookie':
        return (
          <div className="documents-modal__content">
            <h2 className="documents-modal__content-title">
              ФАЙЛЫ COOKIE И АНАЛОГИЧНЫЕ ТЕХНОЛОГИИ
            </h2>
            <p className="documents-modal__content-subtitle">
              г. Москва, редакция от 22.12.2025 г.
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
            Политика в отношении обработки персональных данных
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
