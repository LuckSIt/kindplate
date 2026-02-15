import { Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { WhyKindPlate } from "@/components/landing/WhyKindPlate";
import bunImage from "@/figma/90428C7F-3E7E-49B8-81BC-472D67411732 1.png";
import saladImage from "@/figma/4A8982E1-D5E6-4397-803C-713423EA08C3 1.png";
import croissantImage from "@/figma/740E9EA4-6631-4323-80F3-0B84AA6F61B9 1 (1).png";
import breadImage from "@/figma/C4B41631-5FC6-4D7A-91CE-6E3D6B94E9A0 1.png";
import pizzaImage from "@/figma/762ADCA2-E303-44E5-B6E0-272EE15C6913 1.png";
import cookiesImage from "@/figma/29BD33A8-EE31-48BF-A53C-02BC08740634 1.png";
import phoneMapImage from "@/figma/image.png";
import { SocialLinks } from "@/components/landing/SocialLinks";
import blogImage from "@/figma/blog.png";
import { DocumentsModal } from "@/components/ui/documents-modal";

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
            className="w-full overflow-y-auto overflow-x-hidden"
            style={{ 
                backgroundColor: '#111E42',
                /* fixed + inset:0 гарантирует, что контейнер занимает весь экран
                   без зависимости от html/body overflow:hidden и --app-height */
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1,
                WebkitOverflowScrolling: 'touch',
            }}
        >
            {/* Mobile-first layout - single column, adapts to all screen widths */}
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

                {/* Hero — по скриншоту: центрированный заголовок, подпись с подчёркиванием, кнопки внизу */}
                <section className="px-4 pt-8 pb-10">
                    <div className="max-w-[360px] mx-auto text-center">
                        <h1
                            data-testid="hero-heading"
                            className="text-white font-extrabold leading-[1.2] mb-5"
                            style={{
                                fontFamily: 'Manrope, sans-serif',
                                fontSize: 33,
                                letterSpacing: '-0.04em',
                            }}
                        >
                            <span className="block">Выгодно для тебя</span>
                            <span className="block mt-1">Полезно для планеты</span>
                        </h1>
                        <p
                            className="mb-10 text-center"
                            style={{
                                fontFamily: 'Manrope, sans-serif',
                                fontWeight: 200,
                                fontSize: 20,
                                lineHeight: '108%',
                                letterSpacing: 0,
                                textAlign: 'center',
                                background: '#ECF4F2',
                                color: '#10172A',
                                padding: '12px 16px',
                                borderRadius: 8,
                                boxSizing: 'border-box',
                            }}
                        >
                            <span className="block">Соединяем людей</span>
                            <span className="block">с кафе и ресторанами</span>
                            <span className="block">
                                для{' '}
                                <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 20, lineHeight: '108%', letterSpacing: 0 }}>выгодной</span>
                                {' '}и{' '}
                                <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 20, lineHeight: '108%', letterSpacing: 0 }}>осознанной</span>
                            </span>
                            <span className="block">покупки еды</span>
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Link to="/auth/login">
                                <button
                                    type="button"
                                    className="h-[51px] min-w-[160px] px-6 rounded-[8px] text-[15px] font-bold text-white transition-opacity hover:opacity-90"
                                    style={{ fontFamily: 'Manrope, sans-serif', backgroundColor: '#098771' }}
                                >
                                    Начать покупать
                                </button>
                            </Link>
                            <a href="mailto:kindplate.io@mail.ru" target="_blank" rel="noopener noreferrer">
                                <button
                                    type="button"
                                    className="h-[51px] min-w-[160px] px-6 rounded-[8px] text-[15px] font-bold transition-opacity hover:opacity-90 border-[1.5px] border-solid"
                                    style={{
                                        fontFamily: 'Manrope, sans-serif',
                                        borderColor: '#ECF4F2',
                                        color: '#FFFFFF',
                                        backgroundColor: 'transparent',
                                    }}
                                >
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
                            {/* Phone Screen — карта + подпись + кнопки */}
                            <div 
                                className="w-full rounded-[30px] overflow-hidden flex flex-col"
                                style={{ background: 'linear-gradient(23.17deg, #EFF4F3 0%, #DEF4EE 73.56%)' }}
                            >
                                {/* Верхняя часть: карта + продукт */}
                                <div 
                                    className="relative overflow-hidden w-full aspect-[1/1.15]"
                                    onTouchStart={onTouchStart}
                                    onTouchMove={onTouchMove}
                                    onTouchEnd={onTouchEnd}
                                >
                                    {/* Карта Санкт‑Петербурга как фон */}
                                    <img
                                        src={phoneMapImage}
                                        alt="Карта Санкт-Петербурга"
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    
                                    {/* Продукт поверх карты (карусель) */}
                                    <div 
                                        style={{
                                            position: "absolute",
                                            left: "50%",
                                            top: "45%",
                                            transform: "translate(-50%, -50%) scale(0.82)",
                                            width: "88%",
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

                                {/* Подпись продукта */}
                                <div className="px-[10px] pt-[6px]">
                                    <div
                                        className="transition-opacity duration-300"
                                        style={{
                                            background: "#FFFFFF",
                                            boxShadow: "0px 0px 1px 0px rgba(146,144,144,0.2), 1px 2px 2px 0px rgba(146,144,144,0.17), 2px 4px 3px 0px rgba(146,144,144,0.1)",
                                            borderRadius: 7.3,
                                            padding: "5px 8px",
                                        }}
                                    >
                                        {/* Категория — по Figma: #757575, Montserrat Alternates */}
                                        <div
                                            style={{
                                                color: "#757575",
                                                fontSize: 11,
                                                fontFamily: "Montserrat Alternates, sans-serif",
                                                fontWeight: 500,
                                                marginBottom: 0,
                                            }}
                                        >
                                            {currentItem.category}
                                        </div>
                                        
                                        {/* Название + скидка — текст #10172A, скидка #FA7D00 */}
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}>
                                            <span
                                                style={{
                                                    color: "#10172A",
                                                    fontSize: 14,
                                                    fontFamily: "Montserrat Alternates, sans-serif",
                                                    fontWeight: 700,
                                                    lineHeight: "20px",
                                                }}
                                            >
                                                {currentItem.name}
                                            </span>
                                            <span
                                                style={{
                                                    backgroundColor: "#FA7D00",
                                                    color: "#FFFFFF",
                                                    fontSize: 12,
                                                    fontFamily: "Montserrat Alternates, sans-serif",
                                                    fontWeight: 700,
                                                    padding: "4px 10px",
                                                    borderRadius: "6px 14px 14px 6px",
                                                    whiteSpace: "nowrap",
                                                    marginLeft: 8,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {currentItem.discount}
                                            </span>
                                        </div>
                                        
                                        {/* Цены — по Figma: зачёркнутая 10px, актуальная 17.19px #35741F */}
                                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                                            <span
                                                style={{
                                                    color: "#000000",
                                                    fontSize: 10,
                                                    fontFamily: "Montserrat Alternates, sans-serif",
                                                    fontWeight: 600,
                                                    textDecoration: "line-through",
                                                }}
                                            >
                                                {currentItem.oldPrice}
                                            </span>
                                            <span
                                                style={{
                                                    color: "#35741F",
                                                    fontSize: 17.19,
                                                    fontFamily: "Montserrat Alternates, sans-serif",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {currentItem.price}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Кнопки — внутри зелёной рамки */}
                                <div className="px-[10px] py-[8px]">
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
                                                className="flex items-center justify-center"
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                style={{ 
                                                    width: 18,
                                                    height: 18,
                                                    backgroundColor: 'transparent',
                                                    boxShadow: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <span className="text-[13px] font-bold" style={{ color: '#000019' }}>-</span>
                                            </button>
                                            <span 
                                                className="text-[13px] font-semibold text-center"
                                                style={{ 
                                                    minWidth: 20,
                                                    fontFamily: 'Montserrat Alternates, sans-serif',
                                                    color: '#000019',
                                                    lineHeight: '16px'
                                                }}
                                            >
                                                {quantity}
                                            </span>
                                            <button 
                                                className="flex items-center justify-center"
                                                onClick={() => setQuantity(q => q + 1)}
                                                style={{ 
                                                    width: 18,
                                                    height: 18,
                                                    backgroundColor: 'transparent',
                                                    boxShadow: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <span className="text-[13px] font-bold" style={{ color: '#000019' }}>+</span>
                                            </button>
                                        </div>
                                        <button 
                                            className="flex-1 h-[32px] rounded-[8px] text-[11px] font-bold transition-opacity hover:opacity-90"
                                            style={{ 
                                                backgroundColor: '#10172A',
                                                color: '#E3E3E3',
                                                fontFamily: 'Manrope, sans-serif'
                                            }}
                                        >
                                            Добавить в заказ
                                        </button>
                                    </div>
                                </div>
                            </div>
                    </div>
                </section>

                {/* Для клиентов — по макету: заголовок 210×28, 26px Bold 108%; подпись 353×63; блок шагов #098771, blur */}
                <section className="px-4 pb-[60px] overflow-x-hidden" style={{ paddingLeft: 16, paddingRight: 16 }}>
                    <h3 
                        className="mb-0 font-bold"
                        style={{
                            fontFamily: 'Montserrat Alternates, sans-serif',
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
                        className="rounded-[15px] px-4 pt-5 pb-5 mt-[25px]"
                        style={{ backgroundColor: '#111E42' }}
                    >
                        <h4 
                            className="mb-2 font-extrabold"
                            style={{
                                fontFamily: 'Montserrat Alternates, sans-serif',
                                fontWeight: 800,
                                fontSize: 24,
                                lineHeight: '87%',
                                letterSpacing: 0,
                                width: 353,
                                minHeight: 63,
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: 'Montserrat Alternates, sans-serif',
                                    fontWeight: 800,
                                    fontSize: 24,
                                    lineHeight: '87%',
                                    letterSpacing: 0,
                                    background: '#098771',
                                    color: '#FFFFFF',
                                }}
                            >
                                Сэкономьте деньги, купив товары в ваших любимых заведениях
                            </span>
                        </h4>
                        <p 
                            className="mb-8"
                            style={{
                                fontFamily: 'Manrope, sans-serif',
                                fontWeight: 400,
                                fontSize: 18,
                                lineHeight: '107%',
                                letterSpacing: '0.05em',
                                background: '#FFFFFF',
                                color: '#10172A',
                                width: 361,
                                minHeight: 114,
                                padding: '12px 16px',
                                boxSizing: 'border-box',
                            }}
                        >
                            Покупайте вкусную еду по невероятным ценам. Просматривайте предложения по близости и покупайте товары прямо в приложении KindPlate. Наши выгодные цены порадуют ваш кошелек.
                        </p>
                        {/* Блок шагов: фон #098771, blur, 513×246, radius 10px; строки 349×54, номер 53×54 (Manrope 50px), текст 253×36 (Manrope 600 16px) */}
                        <div
                            className="mb-6 overflow-hidden"
                            style={{
                                width: '100%',
                                maxWidth: 513,
                                minHeight: 246,
                                marginLeft: -65,
                                paddingLeft: 65,
                                paddingRight: 16,
                                paddingTop: 34,
                                paddingBottom: 34,
                                borderRadius: 10,
                                background: '#098771',
                                backdropFilter: 'blur(213px)',
                                WebkitBackdropFilter: 'blur(213px)',
                                boxSizing: 'border-box',
                            }}
                        >
                            <div className="flex flex-col" style={{ gap: 28 }}>
                                <div className="flex items-center" style={{ width: 349, height: 54 }}>
                                    <span
                                        className="flex-shrink-0 text-white"
                                        style={{
                                            fontFamily: 'Manrope, sans-serif',
                                            fontWeight: 400,
                                            fontSize: 50,
                                            lineHeight: '107%',
                                            letterSpacing: '0.05em',
                                            width: 53,
                                            height: 54,
                                        }}
                                    >
                                        01
                                    </span>
                                    <p
                                        className="m-0 text-white flex-shrink-0"
                                        style={{
                                            fontFamily: 'Manrope, sans-serif',
                                            fontWeight: 600,
                                            fontSize: 16,
                                            lineHeight: '110%',
                                            letterSpacing: 0,
                                            width: 253,
                                            marginLeft: 43,
                                        }}
                                    >
                                        Смотри предложения рядом с тобой
                                    </p>
                                </div>
                                <div className="flex items-center" style={{ width: 349, height: 54 }}>
                                    <span
                                        className="flex-shrink-0 text-white"
                                        style={{
                                            fontFamily: 'Manrope, sans-serif',
                                            fontWeight: 400,
                                            fontSize: 50,
                                            lineHeight: '107%',
                                            letterSpacing: '0.05em',
                                            width: 53,
                                            height: 54,
                                        }}
                                    >
                                        02
                                    </span>
                                    <p
                                        className="m-0 text-white flex-shrink-0"
                                        style={{
                                            fontFamily: 'Manrope, sans-serif',
                                            fontWeight: 600,
                                            fontSize: 16,
                                            lineHeight: '110%',
                                            letterSpacing: 0,
                                            width: 253,
                                            marginLeft: 43,
                                        }}
                                    >
                                        Выбирай и оплачивай прямо в приложении
                                    </p>
                                </div>
                                <div className="flex items-center" style={{ width: 349, height: 54 }}>
                                    <span
                                        className="flex-shrink-0 text-white"
                                        style={{
                                            fontFamily: 'Manrope, sans-serif',
                                            fontWeight: 400,
                                            fontSize: 50,
                                            lineHeight: '107%',
                                            letterSpacing: '0.05em',
                                            width: 53,
                                            height: 54,
                                        }}
                                    >
                                        03
                                    </span>
                                    <p
                                        className="m-0 text-white flex-shrink-0"
                                        style={{
                                            fontFamily: 'Manrope, sans-serif',
                                            fontWeight: 600,
                                            fontSize: 16,
                                            lineHeight: '110%',
                                            letterSpacing: 0,
                                            width: 253,
                                            marginLeft: 43,
                                        }}
                                    >
                                        Забери в заведении и наслаждайся
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <Link to="/auth/login">
                                <button 
                                    type="button"
                                    className="rounded-[8px] text-[15px] font-bold transition-opacity hover:opacity-90 border-[1.5px] border-solid flex items-center justify-center"
                                    style={{
                                        width: 203,
                                        height: 53,
                                        borderColor: '#098771',
                                        backgroundColor: '#DEF4EE',
                                        color: '#098771',
                                        fontFamily: 'Manrope, sans-serif',
                                        paddingTop: 19,
                                        paddingRight: 20,
                                        paddingBottom: 18,
                                        paddingLeft: 20,
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    Подробнее
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Для бизнеса — по Figma: заголовок 26px #DEF4EE; подзаголовок 24px #098771 extrabold; шаги 50px + 16px; кнопка 203×53 */}
                <section className="px-4 pb-[60px]" style={{ paddingLeft: 16, paddingRight: 16 }}>
                    <h3 
                        className="mb-0 font-bold"
                        style={{ fontFamily: 'Montserrat Alternates, sans-serif', fontSize: 26, color: '#DEF4EE' }}
                    >
                        Для бизнеса
                    </h3>
                    <h4 
                        className="mt-[30px] mb-0 font-extrabold leading-tight"
                        style={{ fontFamily: 'Montserrat Alternates, sans-serif', fontSize: 24, color: '#098771' }}
                    >
                        Продавайте больше и привлекайте новых гостей
                    </h4>
                    <div 
                        className="rounded-[15px] px-4 pt-5 pb-5 mt-5"
                        style={{ backgroundColor: '#111E42' }}
                    >
                        <p 
                            className="text-[18px] leading-normal mb-8"
                            style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 400, color: '#FFFFFF', letterSpacing: '0.9px' }}
                        >
                            Kindplate помогает ресторанам и магазинам реализовывать непроданные блюда и готовые продукты со скидкой, вместо того чтобы списывать их. Так вы вносите вклад в осознанное потребление и заботу о планете. Получите дополнительный стабильный источник дохода и привлекайте новых клиентов.
                        </p>
                        <div className="space-y-7 mb-6">
                            <div className="flex items-center gap-[39px]">
                                <span className="font-normal flex-shrink-0" style={{ fontFamily: 'Manrope, sans-serif', fontSize: 50, color: '#FFFFFF', letterSpacing: '2.5px' }}>01</span>
                                <p className="font-semibold m-0" style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, color: '#FFFFFF' }}>Выкладывайте в личном кабинете блюда и наборы со скидкой.</p>
                            </div>
                            <div className="flex items-center gap-[32px]">
                                <span className="font-normal flex-shrink-0" style={{ fontFamily: 'Manrope, sans-serif', fontSize: 50, color: '#FFFFFF', letterSpacing: '2.5px' }}>02</span>
                                <p className="font-semibold m-0" style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, color: '#FFFFFF' }}>Получайте предоплаченные заказы от гостей в приложении.</p>
                            </div>
                            <div className="flex items-center gap-[32px]">
                                <span className="font-normal flex-shrink-0" style={{ fontFamily: 'Manrope, sans-serif', fontSize: 50, color: '#FFFFFF', letterSpacing: '2.5px' }}>03</span>
                                <p className="font-semibold m-0" style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, color: '#FFFFFF' }}>Выдавайте заказы в заведении и снижайте потери еды.</p>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <a href="https://t.me/kindplatesupportbot" target="_blank" rel="noopener noreferrer">
                                <button 
                                    type="button"
                                    className="rounded-[8px] text-[15px] font-bold transition-opacity hover:opacity-90 border-[1.5px] border-solid flex items-center justify-center"
                                    style={{
                                        width: 203,
                                        height: 53,
                                        borderColor: '#098771',
                                        backgroundColor: '#DEF4EE',
                                        color: '#098771',
                                        fontFamily: 'Manrope, sans-serif',
                                        paddingTop: 19,
                                        paddingRight: 20,
                                        paddingBottom: 18,
                                        paddingLeft: 20,
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    Подробнее
                                </button>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Why KindPlate Section */}
                <section className="px-[15px] pb-[60px]">
                    <WhyKindPlate />
                </section>

                {/* Footer — по палитре Figma: фон #111E42, заголовки #DEF4EE, ссылки #ECF4F2 */}
                <footer className="px-0 pb-0">
                    <div
                        className="relative w-full"
                        style={{ 
                            backgroundColor: "#111E42",
                            minHeight: "201px",
                            paddingTop: "10px",
                            paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))"
                        }}
                    >
                        <div className="flex px-[26px] gap-[40px]">
                            <div className="flex-1 min-w-0">
                                <p 
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        fontWeight: 600,
                                        fontSize: "14px",
                                        lineHeight: "22px",
                                        color: '#DEF4EE',
                                        textAlign: "left",
                                        marginBottom: "0px"
                                    }}
                                >
                                    KindPlate
                                </p>
                                <a 
                                    href="https://t.me/kindplatesupportbot"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block transition-opacity hover:opacity-80 footer-link"
                                    style={{ fontFamily: 'Montserrat Alternates, sans-serif', fontWeight: 600, fontSize: "11px", lineHeight: "22px", color: '#ECF4F2', textAlign: "left" }}
                                >
                                    Для партнеров
                                </a>
                                <Link to="/auth/login" className="block transition-opacity hover:opacity-80 footer-link" style={{ fontFamily: 'Montserrat Alternates, sans-serif', fontWeight: 600, fontSize: "11px", lineHeight: "22px", color: '#ECF4F2', textAlign: "left" }}>
                                    Для пользователей
                                </Link>
                                <button onClick={() => setIsDocumentsModalOpen(true)} className="block transition-opacity hover:opacity-80 footer-link" style={{ fontFamily: 'Montserrat Alternates, sans-serif', fontWeight: 600, fontSize: "11px", lineHeight: "22px", color: '#ECF4F2', textAlign: "left", background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                                    Документы
                                </button>
                                <a href="https://t.me/kindplate" className="block transition-opacity hover:opacity-80 footer-link" style={{ fontFamily: 'Montserrat Alternates, sans-serif', fontWeight: 600, fontSize: "11px", lineHeight: "22px", color: '#ECF4F2', textAlign: "left" }}>
                                    Блог
                                </a>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p style={{ fontFamily: 'Montserrat Alternates, sans-serif', fontWeight: 600, fontSize: "14px", lineHeight: "22px", color: '#DEF4EE', textAlign: "left", marginBottom: "0px" }}>
                                    Нужна помощь?
                                </p>
                                <Link to="/legal/faq" className="block transition-opacity hover:opacity-80 footer-link" style={{ fontFamily: 'Montserrat Alternates, sans-serif', fontWeight: 600, fontSize: "11px", lineHeight: "22px", color: '#ECF4F2', textAlign: "left" }}>
                                    Ответы на вопросы
                                </Link>
                                <a href="https://t.me/kindplatesupportbot" className="block transition-opacity hover:opacity-80 footer-link" style={{ fontFamily: 'Montserrat Alternates, sans-serif', fontWeight: 600, fontSize: "11px", lineHeight: "22px", color: '#ECF4F2', textAlign: "left" }}>
                                    Контакты
                                </a>
                            </div>
                        </div>
                        <div style={{ marginLeft: "26px", marginRight: "26px", marginTop: "13px" }}>
                            <p style={{ fontFamily: "Montserrat Alternates, sans-serif", fontWeight: 600, fontSize: "14px", lineHeight: "22px", color: "#DEF4EE", marginBottom: "3px" }}>
                                Социальные сети
                            </p>
                            <SocialLinks />
                        </div>
                        
                        {/* Copyright - по центру */}
                        <p
                            className="font-montserrat-alt"
                            style={{ 
                                fontFamily: 'Montserrat Alternates, sans-serif',
                                fontWeight: 400,
                                fontSize: "8px",
                                lineHeight: "20px",
                                color: '#FFFFFF',
                                textAlign: "center",
                                marginTop: "5px",
                                marginBottom: "0px"
                            }}
                        >
                            ИП Сатаев А.М.
                        </p>
                        <p
                            className="font-montserrat-alt"
                            style={{ 
                                fontFamily: 'Montserrat Alternates, sans-serif',
                                fontWeight: 400,
                                fontSize: "8px",
                                lineHeight: "20px",
                                color: '#FFFFFF',
                                textAlign: "center",
                                marginTop: "0px",
                                marginBottom: "0px"
                            }}
                        >
                            ИНН: 784808895487
                        </p>
                        <p
                            className="font-montserrat-alt"
                            style={{ 
                                fontFamily: 'Montserrat Alternates, sans-serif',
                                fontWeight: 400,
                                fontSize: "8px",
                                lineHeight: "20px",
                                color: '#FFFFFF',
                                textAlign: "center",
                                marginTop: "0px",
                                marginBottom: "0px"
                            }}
                        >
                            ОГРН: 326784700012921
                        </p>
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
