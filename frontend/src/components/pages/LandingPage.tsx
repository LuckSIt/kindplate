import { Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import { WhyKindPlate } from "@/components/landing/WhyKindPlate";
import bunImage from "@/figma/90428C7F-3E7E-49B8-81BC-472D67411732 1.png";
import saladImage from "@/figma/4A8982E1-D5E6-4397-803C-713423EA08C3 1.png";
import croissantImage from "@/figma/740E9EA4-6631-4323-80F3-0B84AA6F61B9 1 (1).png";
import breadImage from "@/figma/C4B41631-5FC6-4D7A-91CE-6E3D6B94E9A0 1.png";
import pizzaImage from "@/figma/762ADCA2-E303-44E5-B6E0-272EE15C6913 1.png";
import cookiesImage from "@/figma/29BD33A8-EE31-48BF-A53C-02BC08740634 1.png";
import phoneMapImage from "@/figma/image.png";
import blogImage from "@/figma/blog.png";
import { DocumentsModal } from "@/components/ui/documents-modal";
import "./landing.css";

// Данные о продуктах из Figma
const carouselItems = [
    {
        id: 1,
        image: bunImage,
        name: "Булочка с корицей",
        price: "79₽",
        oldPrice: "247₽",
        discount: "-68%",
        category: "Пекарня / Выпечка"
    },
    {
        id: 2,
        image: saladImage,
        name: "Салат с авокадо",
        price: "159₽",
        oldPrice: "399₽",
        discount: "-60%",
        category: "Кафе / готовая еда"
    },
    {
        id: 3,
        image: croissantImage,
        name: "Круассан с беконом",
        price: "139₽",
        oldPrice: "349₽",
        discount: "-60%",
        category: "Кафе / готовая еда"
    },
    {
        id: 4,
        image: breadImage,
        name: "Чиабатта 3шт.",
        price: "99₽",
        oldPrice: "299₽",
        discount: "-67%",
        category: "Пекарня / хлеб"
    },
    {
        id: 5,
        image: pizzaImage,
        name: "Пепперони пицца",
        price: "279₽",
        oldPrice: "699₽",
        discount: "-60%",
        category: "Кафе / готовая еда"
    },
    {
        id: 6,
        image: cookiesImage,
        name: "Печенье с шоколадом",
        price: "99₽",
        oldPrice: "249₽",
        discount: "-60%",
        category: "Пекарня / кондитерское изделие"
    }
];


export function LandingPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);

    // Минимальное расстояние для распознавания свайпа
    const minSwipeDistance = 50;

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, []);

    // Переход к конкретному слайду с паузой автоперелистывания
    const goToSlide = useCallback((index: number) => {
        setCurrentSlide(index);
        setIsPaused(true);
        // Возобновить автоперелистывание через 8 секунд после взаимодействия
        setTimeout(() => setIsPaused(false), 8000);
    }, []);

    // Автоматическое перелистывание каждые 4 секунды (если не на паузе)
    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(nextSlide, 4000);
        return () => clearInterval(timer);
    }, [nextSlide, isPaused]);

    // Обработчики свайпа
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        if (isLeftSwipe) {
            goToSlide((currentSlide + 1) % carouselItems.length);
        }
        if (isRightSwipe) {
            goToSlide((currentSlide - 1 + carouselItems.length) % carouselItems.length);
        }
    };

    const currentItem = carouselItems[currentSlide];

    return (
        <div 
            className="kp-landing w-full overflow-y-auto overflow-x-hidden"
            style={{ 
                backgroundColor: '#111E42',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1,
                WebkitOverflowScrolling: 'touch',
            }}
        >
            <div 
                className="w-full mx-auto max-w-[480px] sm:max-w-[640px] md:max-w-[768px]" 
                style={{ 
                    backgroundColor: '#111E42',
                    minHeight: '100%',
                    paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))'
                }}
            >
                {/* Header 
                <header className="px-[12px] pb-0" style={{ paddingTop: 'calc(env(safe-area-inset-top, 14px) + 14px)' }}>
                    {/* Навбар из макета Figma (node 322-460) 
                    <div
                        className="mx-auto flex h-[58px] w-full max-w-[780px] items-center justify-between rounded-[18px] px-[20px] shadow-[0_12px_26px_rgba(0,0,0,0.16)]"
                        style={{ backgroundColor: "#ffffff" }}
                    >
                        <div className="flex items-center">
                            <img
                                src="/@kindplate_for_bar.png"
                                alt="KindPlate логотип"
                                className="h-[44px] w-auto"
                            />
                        </div>

                        {/*<button
                            className="flex flex-col gap-[7px] pr-[6px]"
                            aria-label="Меню"
                        >
                            <span
                                className="h-[4px] w-[38px] rounded-full"
                                style={{ backgroundColor: "#000019" }}
                            />
                            <span
                                className="h-[4px] w-[38px] rounded-full"
                                style={{ backgroundColor: "#000019" }}
                            />
                            <span
                                className="h-[4px] w-[38px] rounded-full"
                                style={{ backgroundColor: "#000019" }}
                            />
                        </button>
                        
                    </div>
                </header> */}

                {/* Hero — как должно быть: заголовок и подпись белым по тёмному фону; шрифт Manrope через класс .manrope */}
                <section className="manrope px-4 pt-8 pb-10 overflow-x-hidden">
                    <div className="max-w-full mx-auto text-center" style={{ maxWidth: 361 }}>
                        {/* Заголовок hero — по Figma node 1-1296 */}
                        <h1
                            data-testid="hero-heading"
                            className="landing-hero-title"
                        >
                            <span className="block">Выгодно для тебя</span>
                            <span className="block mt-1">Полезно для планеты</span>
                        </h1>
                        <p
                            className="landing-hero-subtitle text-center mb-[48px]"
                            style={{
                                fontFamily: 'Manrope, sans-serif',
                                fontWeight: 200,
                                fontSize: 20,
                                lineHeight: '108%',
                                letterSpacing: 0,
                                textAlign: 'center',
                                color: '#ECF4F2',
                            }}
                        >
                            <span className="landing-hero-text block">Соединяем людей<br/> с кафе и ресторанами</span>
                            <span className="landing-hero-text block">
                                для{' '}
                                <span className="landing-hero-accent" style={{ fontWeight: 700 }}>выгодной</span>
                                {' '}и{' '}
                                <span className="landing-hero-accent" style={{ fontWeight: 700 }}>осознанной</span>
                                {' '}<br/>покупки еды
                            </span>
                        </p>
                        <div className="landing-cta-buttons">
                            <Link to="/auth/login" className="landing-cta-link">
                                <button type="button" className="landing-cta-btn landing-cta-btn--primary">
                                    Начать покупать
                                </button>
                            </Link>
                            <a href="mailto:kindplate.io@mail.ru" target="_blank" rel="noopener noreferrer" className="landing-cta-link">
                                <button type="button" className="landing-cta-btn landing-cta-btn--secondary">
                                    Начать продавать
                                </button>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Phone — по Figma: 267×548, mt 11, border 6px #098771, rounded 36px, gradient */}
                <section className="flex justify-center px-0 pb-[30px]" style={{ marginTop: 11 }}>
                    <div 
                        className="relative rounded-[36px] p-[6px] overflow-hidden flex flex-col"
                        style={{ 
                            width: 267,
                            minHeight: 548,
                            maxWidth: '85vw',
                            border: '6px solid #098771',
                            background: 'linear-gradient(23.17deg, #EFF4F3 0%, #DEF4EE 73.56%)',
                        }}
                    >
                            {/* Phone Screen — карта + подпись + кнопки. clip-path убирает артефакты в углах на iOS. */}
                            <div 
                                className="w-full rounded-[30px] overflow-hidden flex flex-col"
                                style={{ 
                                    background: 'linear-gradient(23.17deg, #EFF4F3 0%, #DEF4EE 73.56%)',
                                    isolation: 'isolate',
                                    clipPath: 'inset(0 round 30px)',
                                    WebkitClipPath: 'inset(0 round 30px)',
                                } as React.CSSProperties}
                            >
                                {/* Верхняя часть: карта + продукт (низ карты закруглён). */}
                                <div 
                                    className="relative overflow-hidden w-full aspect-[1/1.6]"
                                    style={{ 
                                        borderRadius: '30px 30px 16px 16px',
                                        isolation: 'isolate',
                                        clipPath: 'inset(0 round 30px 30px 16px 16px)',
                                        WebkitClipPath: 'inset(0 round 30px 30px 16px 16px)',
                                    } as React.CSSProperties}
                                    onTouchStart={onTouchStart}
                                    onTouchMove={onTouchMove}
                                    onTouchEnd={onTouchEnd}
                                >
                                    {/* Карта Санкт‑Петербурга как фон */}
                                    <img
                                        src={phoneMapImage}
                                        alt="Карта Санкт-Петербурга"
                                        className="absolute inset-0 w-full h-full object-cover"
                                        style={{ borderRadius: 'inherit' }}
                                    />
                                    
                                    {/* Продукт поверх карты (карусель) — чуть крупнее и по центру */}
                                    <div 
                                        style={{
                                            position: "absolute",
                                            left: "50%",
                                            top: "50%",
                                            transform: "translate(-50%, -50%) scale(0.92)",
                                            width: "94%",
                                            aspectRatio: "1",
                                            cursor: "grab"
                                        }}
                                    >
                                        <div className="relative w-full h-full">
                                            {carouselItems.map((item, index) => (
                                                <img
                                                    key={item.id}
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="absolute inset-0 w-full h-full transition-all duration-500 ease-in-out"
                                                    style={{
                                                        borderRadius: "0",
                                                        objectFit: "cover",
                                                        opacity: index === currentSlide ? 1 : 0,
                                                        transform: `scale(${index === currentSlide ? 1 : 0.8})`,
                                                        pointerEvents: index === currentSlide ? 'auto' : 'none'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Подпись продукта — компактная типографика; ценник сдвинут вниз */}
                                <div className="px-[10px] pt-[6px] phone-product-card" style={{ marginTop: 4 }}>
                                    <div
                                        className="transition-opacity duration-300"
                                        style={{
                                            background: "#FFFFFF",
                                            boxShadow: "0px 0px 1px 0px rgba(146,144,144,0.2), 1px 2px 2px 0px rgba(146,144,144,0.17), 2px 4px 3px 0px rgba(146,144,144,0.1)",
                                            borderRadius: 7.3,
                                            padding: "5px 8px",
                                        }}
                                    >
                                        {/* Категория */}
                                        <div className="phone-card-category">
                                            {currentItem.category}
                                        </div>
                                        
                                        {/* Название + скидка: название переносится, не налезает на бейдж */}
                                        <div className="flex items-start justify-between gap-2 mb-0" style={{ minHeight: 0 }}>
                                            <span className="phone-card-name font-montserrat-alt">
                                                {currentItem.name}
                                            </span>
                                            <span className="phone-card-badge font-montserrat-alt">
                                                {currentItem.discount}
                                            </span>
                                        </div>
                                        
                                        {/* Цены */}
                                        <div className="flex items-baseline justify-between">
                                            <span className="phone-card-old-price font-montserrat-alt">
                                                {currentItem.oldPrice}
                                            </span>
                                            <span className="phone-card-price font-montserrat-alt">
                                                {currentItem.price}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Кнопки — шрифт Manrope, цифра количества уменьшена */}
                                <div className="px-[10px] py-[8px] phone-product-controls">
                                    <div className="flex items-center gap-[8px]">
                                        {/* Quantity Selector */}
                                        <div
                                            className="flex items-center"
                                            style={{ 
                                                backgroundColor: '#F3F4F6',
                                                borderRadius: 10,
                                                padding: '6px 10px',
                                                gap: '10px',
                                                boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                                            }}
                                        >
                                            <button 
                                                className="flex items-center justify-center phone-qty-btn"
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                style={{ 
                                                    width: 18,
                                                    height: 18,
                                                    backgroundColor: 'transparent',
                                                    boxShadow: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <span className="phone-qty-symbol font-bold">-</span>
                                            </button>
                                            <span className="phone-quantity-value">
                                                {quantity}
                                            </span>
                                            <button 
                                                className="flex items-center justify-center phone-qty-btn"
                                                onClick={() => setQuantity(q => q + 1)}
                                                style={{ 
                                                    width: 18,
                                                    height: 18,
                                                    backgroundColor: 'transparent',
                                                    boxShadow: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <span className="phone-qty-symbol font-bold">+</span>
                                            </button>
                                        </div>
                                        <button 
                                            className="flex-1 h-[30px] rounded-[8px] font-bold transition-opacity hover:opacity-90 phone-add-btn"
                                            style={{ 
                                                backgroundColor: '#10172A',
                                                color: '#E3E3E3',
                                                fontSize: 10
                                            }}
                                        >
                                            Добавить в заказ
                                        </button>
                                    </div>
                                </div>
                            </div>
                    </div>
                </section>

                {/* Для клиентов — блок шагов с блюром без обрезки */}
                <section className="kp-landing-steps-section px-4 pb-[60px]" style={{ paddingLeft: 16, paddingRight: 16, overflow: 'visible' }}>
                    <h3 
                        className="mb-0 font-bold"
                        style={{
                            fontFamily: 'Manrope, sans-serif',
                            fontWeight: 700,
                            fontSize: 26,
                            lineHeight: '108%',
                            letterSpacing: 0,
                            color: '#DEF4EE',
                            marginTop: 60,
                            width: 210,
                            height: 28,
                        }}
                    >
                        Для клиентов
                    </h3>
                    <div 
                        className="px-4 pt-5 pb-5 mt-[25px]"
                    >
                        <h4 
                            className="mb-2 font-extrabold w-full"
                            style={{
                                fontFamily: 'Manrope, sans-serif',
                                fontWeight: 800,
                                fontSize: 24,
                                lineHeight: '87%',
                                letterSpacing: 0,
                                minHeight: 63,
                                maxWidth: '100%',
                            }}
                        >
                            <span className="landing-clients-green font-montserrat-alt"
                                style={{
                                    fontFamily: 'Manrope, sans-serif',
                                    fontWeight: 800,
                                    lineHeight: '87%',
                                    letterSpacing: 0,
                                    color: '#098771',
                                }}
                            >
                                Сэкономьте деньги,<br/> купив товары в ваших любимых заведениях
                            </span>
                        </h4>
                        <p 
                            className="mb-8 landing-clients-desc font-montserrat-alt"
                            style={{
                                fontFamily: 'Manrope, sans-serif',
                                fontWeight: 400,
                                lineHeight: '107%',
                                letterSpacing: '0.05em',
                                color: '#FFFFFF',
                                width: 371,
                                minHeight: 114,
                                boxSizing: 'border-box',
                                maxWidth: '100%',
                            }}
                        >
                            Покупайте вкусную еду по невероятным ценам. Просматривайте предложения по близости и покупайте товары прямо в приложении KindPlate. Наши выгодные цены порадуют ваш кошелек.
                        </p>
                        {/* Блок шагов: градиент на всю ширину секции, без шума */}
                        <div className="relative mb-6" style={{ width: 'calc(100% + 32px)', marginLeft: -16, marginRight: -16 }}>
                            <div
                                className="grain-card manrope landing-steps"
                                style={{
                                    width: '100%',
                                    minHeight: 246,
                                    paddingLeft: 24,
                                    paddingRight: 24,
                                    paddingTop: 34,
                                    paddingBottom: 34,
                                    boxSizing: 'border-box',
                                }}
                            >
                            <div className="flex flex-col relative items-start" style={{ gap: 36, zIndex: 20 }}>
                                <div className="landing-step-row flex items-start" style={{ width: '100%', maxWidth: 349 }}>
                                    <span className="step-num landing-step-num flex-shrink-0 text-white">01</span>
                                    <p className="m-0 text-white landing-step-text font-montserrat-alt">Смотри предложения рядом с тобой</p>
                                </div>
                                <div className="landing-step-row flex items-start" style={{ width: '100%', maxWidth: 349 }}>
                                    <span className="step-num landing-step-num flex-shrink-0 text-white">02</span>
                                    <p className="m-0 text-white landing-step-text font-montserrat-alt">Выбирай и оплачивай прямо в приложении</p>
                                </div>
                                <div className="landing-step-row flex items-start" style={{ width: '100%', maxWidth: 349 }}>
                                    <span className="step-num landing-step-num flex-shrink-0 text-white">03</span>
                                    <p className="m-0 text-white landing-step-text font-montserrat-alt">Забери в заведении и наслаждайся</p>
                                </div>
                            </div>
                            </div>
                        </div>
                        <div className="flex justify-center" style={{ marginTop: 32 }}>
                            <Link to="/auth/login" className="kp-landing-more-link">
                                <button
                                    type="button"
                                    className="kp-landing-more-btn rounded-[12px] text-[15px] font-bold transition-opacity hover:opacity-90 flex items-center justify-center"
                                    style={{
                                        width: 203,
                                        height: 53,
                                        backgroundColor: '#DEFAF6',
                                        color: '#009688',
                                        paddingTop: 19,
                                        paddingRight: 20,
                                        paddingBottom: 18,
                                        paddingLeft: 20,
                                        boxSizing: 'border-box',
                                        border: 'none',
                                        textDecoration: 'none',
                                    }}
                                >
                                    Подробнее
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Для бизнеса — по шаблону «Для клиентов»: заголовок, зелёный подзаголовок, описание, блок шагов, кнопка */}
                <section className="kp-landing-steps-section px-4 pb-[60px]" style={{ paddingLeft: 16, paddingRight: 16, overflow: 'visible' }}>
                    <h3 
                        className="mb-0 font-bold"
                        style={{
                            fontFamily: 'Manrope, sans-serif',
                            fontWeight: 700,
                            fontSize: 26,
                            lineHeight: '108%',
                            letterSpacing: 0,
                            color: '#DEF4EE',
                            marginTop: 60,
                            width: 210,
                            height: 28,
                        }}
                    >
                        Для бизнеса
                    </h3>
                    <div className="px-4 pt-5 pb-5 mt-[25px]">
                        <h4 
                            className="mb-2 font-extrabold w-full"
                            style={{
                                fontFamily: 'Manrope, sans-serif',
                                fontWeight: 800,
                                fontSize: 24,
                                lineHeight: '87%',
                                letterSpacing: 0,
                                minHeight: 63,
                                maxWidth: '100%',
                            }}
                        >
                            <span className="landing-clients-green font-montserrat-alt"
                                style={{
                                    fontFamily: 'Manrope, sans-serif',
                                    fontWeight: 800,
                                    lineHeight: '87%',
                                    letterSpacing: 0,
                                    color: '#098771',
                                }}
                            >
                                Продавайте больше<br/> и привлекайте новых<br/> гостей
                            </span>
                        </h4>
                        <p 
                            className="mb-8 landing-clients-desc font-montserrat-alt"
                            style={{
                                fontFamily: 'Manrope, sans-serif',
                                fontWeight: 400,
                                lineHeight: '107%',
                                letterSpacing: '0.05em',
                                color: '#FFFFFF',
                                width: 371,
                                minHeight: 114,
                                boxSizing: 'border-box',
                                maxWidth: '100%',
                            }}
                        >
                            Kindplate помогает ресторанам и магазинам реализовывать непроданные блюда и готовые продукты со скидкой, вместо того чтобы списывать их. Так вы вносите вклад в осознанное потребление и заботу о планете. Получите дополнительный стабильный источник дохода и привлекайте новых клиентов.
                        </p>
                        <div className="relative mb-6" style={{ width: 'calc(100% + 32px)', marginLeft: -16, marginRight: -16 }}>
                            <div
                                className="grain-card manrope landing-steps"
                                style={{
                                    width: '100%',
                                    minHeight: 246,
                                    paddingLeft: 24,
                                    paddingRight: 24,
                                    paddingTop: 34,
                                    paddingBottom: 34,
                                    boxSizing: 'border-box',
                                }}
                            >
                                <div className="flex flex-col relative items-start" style={{ gap: 36, zIndex: 20 }}>
                                    <div className="landing-step-row flex items-start" style={{ width: '100%', maxWidth: 349 }}>
                                        <span className="step-num landing-step-num flex-shrink-0 text-white">01</span>
                                        <p className="m-0 text-white landing-step-text font-montserrat-alt">Выкладывайте в личном кабинете блюда и наборы со скидкой</p>
                                    </div>
                                    <div className="landing-step-row flex items-start" style={{ width: '100%', maxWidth: 349 }}>
                                        <span className="step-num landing-step-num flex-shrink-0 text-white">02</span>
                                        <p className="m-0 text-white landing-step-text font-montserrat-alt">Получайте предоплаченные заказы от гостей в приложении</p>
                                    </div>
                                    <div className="landing-step-row flex items-start" style={{ width: '100%', maxWidth: 349 }}>
                                        <span className="step-num landing-step-num flex-shrink-0 text-white">03</span>
                                        <p className="m-0 text-white landing-step-text font-montserrat-alt">Выдавайте заказы в заведении и снижайте потери еды</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center" style={{ marginTop: 32 }}>
                            <a href="https://t.me/kindplatesupportbot" target="_blank" rel="noopener noreferrer" className="kp-landing-more-link">
                                <button
                                    type="button"
                                    className="kp-landing-more-btn rounded-[12px] text-[15px] font-bold transition-opacity hover:opacity-90 flex items-center justify-center"
                                    style={{
                                        width: 203,
                                        height: 53,
                                        backgroundColor: '#DEFAF6',
                                        color: '#009688',
                                        paddingTop: 19,
                                        paddingRight: 20,
                                        paddingBottom: 18,
                                        paddingLeft: 20,
                                        boxSizing: 'border-box',
                                        border: 'none',
                                        textDecoration: 'none',
                                    }}
                                >
                                    Подробнее
                                </button>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Почему KindPlate? */}
                <section className="px-4 pb-[60px] overflow-x-hidden" style={{ paddingLeft: 16, paddingRight: 16 }}>
                    <WhyKindPlate />
                </section>

                {/* Footer — Контакты: карточки + ИП/ИНН/ОГРН */}
                <footer className="px-0 pb-0">
                    <div className="kp-landing-footer">
                        <h2 className="kp-landing-footer-title">Контакты:</h2>
                        <div className="kp-landing-footer-cards">
                            <a
                                href="https://t.me/kindplate"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="kp-landing-footer-card"
                            >
                                <span className="kp-landing-footer-card-text">Telegram</span>
                                <ArrowRight className="kp-landing-footer-card-arrow" size={28} strokeWidth={2.41} />
                            </a>
                            <a
                                href="https://vk.com/kindplate"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="kp-landing-footer-card"
                            >
                                <span className="kp-landing-footer-card-text">VK</span>
                                <ArrowRight className="kp-landing-footer-card-arrow" size={28} strokeWidth={2.41} />
                            </a>
                            <a
                                href="https://www.instagram.com/kindplate/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="kp-landing-footer-card"
                            >
                                <span className="kp-landing-footer-card-text">Instagram</span>
                                <ArrowRight className="kp-landing-footer-card-arrow" size={28} strokeWidth={2.41} />
                            </a>
                        </div>
                        <div className="kp-landing-footer-legal-block">
                            <p className="kp-landing-footer-legal">ИП Сатаев А.М.</p>
                            <p className="kp-landing-footer-legal">ИНН: 784808895487</p>
                            <p className="kp-landing-footer-legal">ОГРН: 326784700012921</p>
                        </div>
                    </div>
                </footer>
            </div>
            
            {/* Documents Modal */}
            <DocumentsModal 
                isOpen={isDocumentsModalOpen} 
                onClose={() => setIsDocumentsModalOpen(false)} 
            />
        </div>
    );
}
