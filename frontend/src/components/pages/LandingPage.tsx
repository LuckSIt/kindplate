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
                backgroundColor: '#000019',
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
                    backgroundColor: '#000019',
                    minHeight: '100%',
                    paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))'
                }}
            >
                {/* Header */}
                <header className="px-[12px] pb-0" style={{ paddingTop: 'calc(env(safe-area-inset-top, 14px) + 14px)' }}>
                    {/* Навбар из макета Figma (node 322-460) */}
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
                        */}
                    </div>
                </header>

                {/* Hero Section */}
                <section className="px-[15px] pt-[21px] pb-[20px]">
                    <div className="flex flex-col items-center text-center gap-[6px]">
                        <div className="flex w-full max-w-[360px] md:max-w-[720px] flex-nowrap items-center justify-center gap-[8px] sm:gap-[10px] md:gap-[14px] text-[26px] leading-[32px] sm:text-[32px] sm:leading-[38px] md:text-[44px] md:leading-[50px] text-white">
                            <span
                                data-testid="hero-profitable"
                                className="font-ramona inline-flex items-center justify-center rounded-full px-[12px] py-[6px] sm:px-[16px] sm:py-[8px] md:px-[18px] md:py-[10px] flex-shrink-0 whitespace-nowrap"
                                style={{ backgroundColor: '#001900' }}
                            >
                                Выгодно
                            </span>
                            <span
                                data-testid="hero-for-you"
                                className="font-ramona inline-flex items-center whitespace-nowrap"
                            >
                                для тебя,
                            </span>
                        </div>

                        <div className="flex w-full max-w-[360px] md:max-w-[720px] flex-nowrap items-center justify-center gap-[8px] sm:gap-[10px] md:gap-[14px] text-[26px] leading-[32px] sm:text-[32px] sm:leading-[38px] md:text-[44px] md:leading-[50px] text-white">
                            <span
                                data-testid="hero-useful"
                                className="font-ramona inline-flex items-center justify-center rounded-full px-[12px] py-[6px] sm:px-[16px] sm:py-[8px] md:px-[18px] md:py-[10px] flex-shrink-0 whitespace-nowrap"
                                style={{ backgroundColor: '#001900' }}
                            >
                                полезно
                            </span>
                            <span
                                data-testid="hero-for-planet"
                                className="font-ramona inline-flex items-center whitespace-nowrap"
                            >
                                для планеты
                            </span>
                        </div>

                        <p 
                            className="text-[13px] leading-[18px] md:text-[14px] md:leading-[20px] font-normal text-center mt-[5px] font-montserrat-alt"
                            style={{ color: '#FFFFFF' }}
                        >
                            <span className="block whitespace-nowrap font-montserrat-alt">
                                Соединяем людей с кафе и ресторанами
                            </span>
                            <span className="block whitespace-nowrap font-montserrat-alt">
                                для выгодной и осознанной покупки еды
                            </span>
                        </p>
                    </div>
                </section>

                {/* CTA Buttons */}
                <section className="pb-[40px] w-full flex justify-center">
                    <div className="flex gap-[14px] justify-center px-[24px] w-full max-w-[400px]">
                        <Link to="/auth/login" className="flex-1">
                            <button 
                                className="w-full h-[38px] rounded-[26px] text-[13px] font-bold leading-[1.14] text-center transition-opacity hover:opacity-90 whitespace-nowrap"
                                style={{ 
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #001900',
                                    color: '#001900',
                                    fontFamily: 'Montserrat Alternates, sans-serif',
                                    lineHeight: '1.14em'
                                }}
                            >
                                смотреть предложения
                            </button>
                        </Link>
                        <a href="mailto:kindplate.io@mail.ru" target="_blank" rel="noopener noreferrer" className="flex-1">
                            <button 
                                className="w-full h-[38px] rounded-[26px] border border-white text-[13px] font-bold leading-[1.14] text-center transition-opacity hover:opacity-90 whitespace-nowrap"
                                style={{ 
                                    backgroundColor: '#000019',
                                    color: '#E3E3E3',
                                    fontFamily: 'Montserrat Alternates, sans-serif',
                                    borderWidth: '1px',
                                    lineHeight: '1.14em'
                                }}
                            >
                                стать партнером
                            </button>
                        </a>
                    </div>
                </section>

                {/* Phone Mockup Section with Product */}
                <section className="px-[15px] pb-[30px]">
                    <div className="flex justify-center items-center">
                        {/* Phone Frame - responsive, auto height по контенту */}
                        <div 
                            className="relative rounded-[30px] p-[12px] sm:p-[16px] mx-auto w-[85vw] max-w-[310px]"
                            style={{ 
                                backgroundColor: '#C8EBBB',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Phone Screen — flex column: карта + подпись + кнопки */}
                            <div 
                                className="w-full rounded-[20px] overflow-hidden flex flex-col"
                                style={{ backgroundColor: '#C8EBBB' }}
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
                                            boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.1)",
                                            borderRadius: 14,
                                            padding: "5px 8px",
                                        }}
                                    >
                                        {/* Категория */}
                                        <div
                                            style={{
                                                color: "#6B7280",
                                                fontSize: 11,
                                                fontFamily: "Montserrat Alternates, sans-serif",
                                                fontWeight: 500,
                                                marginBottom: 0,
                                                letterSpacing: "-0.2px",
                                            }}
                                        >
                                            {currentItem.category}
                                        </div>
                                        
                                        {/* Название + скидка */}
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}>
                                            <span
                                                style={{
                                                    color: "#1F2937",
                                                    fontSize: 15,
                                                    fontFamily: "Montserrat Alternates, sans-serif",
                                                    fontWeight: 700,
                                                    lineHeight: "20px",
                                                    letterSpacing: "-0.3px",
                                                }}
                                            >
                                                {currentItem.name}
                                            </span>
                                            <span
                                                style={{
                                                    backgroundColor: "#F97316",
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
                                        
                                        {/* Цены */}
                                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                                            <span
                                                style={{
                                                    color: "#9CA3AF",
                                                    fontSize: 15,
                                                    fontFamily: "Montserrat Alternates, sans-serif",
                                                    fontWeight: 500,
                                                    textDecoration: "line-through",
                                                    letterSpacing: "-0.3px",
                                                }}
                                            >
                                                {currentItem.oldPrice}
                                            </span>
                                            <span
                                                style={{
                                                    color: "#16A34A",
                                                    fontSize: 22,
                                                    fontFamily: "Montserrat Alternates, sans-serif",
                                                    fontWeight: 700,
                                                    letterSpacing: "-0.5px",
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
                                            className="flex-1 h-[32px] rounded-[8px] text-[11px] font-semibold transition-opacity hover:opacity-90"
                                            style={{ 
                                                backgroundColor: '#000019',
                                                color: '#FFFFFF',
                                                fontFamily: 'Montserrat Alternates, sans-serif'
                                            }}
                                        >
                                            Добавить в заказ
                                        </button>
                                    </div>
                                </div>
                </div>
                        </div>
                    </div>
                </section>

                {/* Blog Section — без больших отступов между надписью, картинкой и следующим блоком */}
                <section className="px-[15px] pt-[48px] pb-[20px]">
                    <div className="w-full max-w-[400px] mx-auto flex flex-col items-center gap-0">
                        <h2 
                            className="text-[32px] font-[700] leading-[1.2] text-center font-montserrat-alt"
                            style={{ color: '#FFFFFF', margin: 0 }}
                        >
                            Блог
                        </h2>
                        <p 
                            className="text-[22px] font-[600] leading-[1.2] text-center font-montserrat-alt mb-0"
                            style={{ color: '#FFFFFF', margin: 0 }}
                        >
                            <span 
                                className="font-ramona items-center justify-center rounded-full px-[8px] py-[8px] md:px-[18px] md:py-[10px] flex-shrink-0 whitespace-nowrap"
                                style={{ backgroundColor: '#001900' }}
                            >
                                Следите
                            </span>
                            {' '}за нами в нашем канале
                        </p>
                        <div
                            className="w-full rounded-[24px] overflow-hidden p-4 mt-0"
                            style={{ backgroundColor: '#C8EBBB' }}
                        >
                            <a
                                href="https://t.me/kindplate"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full cursor-pointer transition-opacity hover:opacity-90 active:opacity-80"
                            >
                                <img 
                                    src={blogImage} 
                                    alt="KindPlate блог — выгодно для тебя, полезно для планеты"
                                    className="w-full h-auto block"
                                />
                            </a>
                        </div>
                    </div>
                </section>

                {/* User Benefits Section - White Card */}
                <section className="px-[15px] pb-[60px]">
                    <div 
                        className="rounded-[15px] px-[20px] pt-[5px] pb-[20px]"
                        style={{ backgroundColor: '#FFFFFF' }}
                    >
                        <h3 
                            className="text-[16px] leading-[1.08] mb-0 font-montserrat-alt"
                            style={{ 
                                fontWeight: 700,
                                color: '#001900',
                                lineHeight: '1.08em'
                            }}
                        >
                            Для клиентов
                        </h3>
                        <h4 
                            className="leading-[0.87] mt-[-4px] mb-[6px] font-montserrat-alt"
                            style={{ 
                                fontSize: '22px',
                                fontWeight: 600,
                                lineHeight: '0.87em'
                            }}
                        >
                            <span className="font-montserrat-alt" style={{ color: '#001900', fontSize: '22px', fontWeight: 600, display: 'inline' }}>Сэкономьте деньги,</span>
                            {' '}
                            <span className="font-montserrat-alt" style={{ color: '#000000', fontSize: '22px', fontWeight: 600, display: 'inline' }}>купив товары в ваших любимых заведениях</span>
                        </h4>
                        <p 
                            className="text-[12px] leading-[0.94] mb-[32px] font-montserrat-alt"
                            style={{ 
                                fontWeight: 400,
                                color: '#000019',
                                lineHeight: '0.94em'
                            }}
                        >
                            Покупайте вкусную еду по невероятным ценам. Просматривайте предложения по близости и покупайте товары прямо в приложении KindPlate. Наши выгодные цены порадуют ваш кошелек.
                        </p>
                        
                        {/* Steps */}
                        <div className="space-y-[14px] mb-[21px]">
                            <div className="flex items-baseline gap-[22px]">
                                <span 
                                    className="text-[12px] leading-[0.87] flex-shrink-0 font-montserrat-alt"
                                    style={{ 
                                        fontWeight: 600,
                                        color: '#001900',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    01
                                </span>
                                <p 
                                    className="text-[11px] leading-[0.87] font-montserrat-alt"
                                    style={{ 
                                        fontWeight: 600,
                                        color: '#000019',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    Смотри предложения рядом с тобой
                                </p>
                            </div>
                            <div className="w-full h-[1px]" style={{ backgroundColor: '#C4CEE8' }}></div>
                            <div className="flex items-baseline gap-[22px]">
                                <span 
                                    className="text-[12px] leading-[0.87] flex-shrink-0 font-montserrat-alt"
                                    style={{ 
                                        fontWeight: 600,
                                        color: '#001900',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    02
                                </span>
                                <p 
                                    className="text-[11px] leading-[0.87] font-montserrat-alt"
                                    style={{ 
                                        fontWeight: 600,
                                        color: '#000019',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    Выбирай и оплачивай прямо в приложении
                                </p>
                            </div>
                            <div className="w-full h-[1px]" style={{ backgroundColor: '#C4CEE8' }}></div>
                            <div className="flex items-baseline gap-[22px]">
                                <span 
                                    className="text-[12px] leading-[0.87] flex-shrink-0 font-montserrat-alt"
                                    style={{ 
                                        fontWeight: 600,
                                        color: '#001900',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    03
                                </span>
                                <p 
                                    className="text-[11px] leading-[0.87] font-montserrat-alt"
                                    style={{ 
                                        fontWeight: 600,
                                        color: '#000019',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    Забери в заведении и наслаждайся
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex justify-center">
                            <Link to="/auth/login">
                                <button 
                                    className="w-[186px] h-[28px] rounded-[5px] text-[12px] font-semibold leading-[0.94] transition-opacity hover:opacity-90 font-montserrat-alt"
                                    style={{ 
                                        backgroundColor: '#001900',
                                        color: '#FFFFFF',
                                        lineHeight: '0.94em'
                                    }}
                                >
                                    смотреть предложения
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* User Benefits Section - Dark Card (Repeated) */}
                <section className="px-[15px] pb-[60px]">
                    <div 
                        className="rounded-[15px] px-[20px] pt-[5px] pb-[20px]"
                        style={{ backgroundColor: '#000019' }}
                    >
                        <h3 
                            className="text-[16px] leading-[1.08] mb-0 font-montserrat-alt"
                            style={{ 
                                fontWeight: 700,
                                color: '#004900',
                                lineHeight: '1.08em'
                            }}
                        >
                            Для бизнеса
                        </h3>
                        <h4 
                            className="leading-[0.87] mt-[-4px] mb-[6px] font-montserrat-alt"
                            style={{ 
                                fontSize: '22px',
                                fontWeight: 600,
                                color: '#F5FBA2',
                                lineHeight: '0.87em'
                            }}
                        >
                            Продавайте больше и привлекайте новых гостей
                        </h4>
                        <p 
                            className="text-[12px] leading-[0.94] mb-[32px] font-montserrat-alt"
                            style={{ 
                                fontWeight: 400,
                                color: '#FFFFFF',
                                lineHeight: '0.94em'
                            }}
                        >
                            Kindplate помогает ресторанам и магазинам реализовывать непроданные блюда и готовые продукты со скидкой, вместо того чтобы списывать их. Так вы вносите вклад в осознанное потребление и заботу о планете. Получите дополнительный стабильный источник дохода и привлекайте новых клиентов.
                        </p>
                        
                        {/* Steps */}
                        <div className="space-y-[14px] mb-[21px]">
                            <div className="flex items-baseline gap-[22px]">
                                <span 
                                    className="text-[12px] leading-[0.87] flex-shrink-0 font-montserrat-alt"
                                    style={{ 
                                        fontWeight: 600,
                                        color: 'rgba(245, 251, 162, 0.6)',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    01
                                </span>
                                <p 
                                    className="text-[11px] leading-[0.87] font-montserrat-alt"
                                    style={{ 
                                        fontWeight: 600,
                                        color: '#FFFFFF',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    Выкладывайте в личном кабинете блюда и наборы со скидкой.
                                </p>
                            </div>
                            <div className="w-full h-[1px]" style={{ backgroundColor: '#C4CEE8' }}></div>
                            <div className="flex items-baseline gap-[22px]">
                                <span 
                                    className="text-[12px] leading-[0.87] flex-shrink-0 font-montserrat-alt"
                                    style={{ 
                                        fontWeight: 600,
                                        color: 'rgba(245, 251, 162, 0.6)',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    02
                                </span>
                                <p 
                                    className="text-[11px] leading-[0.87] font-montserrat-alt"
                                    style={{ 
                                        fontWeight: 600,
                                        color: '#FFFFFF',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    Получайте предоплаченные заказы от гостей в приложении.
                                </p>
                            </div>
                            <div className="w-full h-[1px]" style={{ backgroundColor: '#C4CEE8' }}></div>
                            <div className="flex items-baseline gap-[22px]">
                                <span 
                                    className="text-[12px] leading-[0.87] flex-shrink-0 font-montserrat-alt"
                                    style={{ 
                                        fontWeight: 600,
                                        color: 'rgba(245, 251, 162, 0.6)',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    03
                                </span>
                                <p 
                                    className="text-[11px] leading-[0.87] font-montserrat-alt"
                                    style={{ 
                                        fontWeight: 600,
                                        color: '#FFFFFF',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    Выдавайте заказы в заведении и снижайте потери еды.
                                </p>
                            </div>
                        </div>

                        <a href="https://t.me/kindplatesupportbot" target="_blank" rel="noopener noreferrer">
                            <button 
                                className="w-full h-[31px] rounded-[5px] text-[12px] font-semibold leading-[0.94] transition-opacity hover:opacity-90 font-montserrat-alt"
                                style={{ 
                                    backgroundColor: '#F5FBA2',
                                    color: '#000019',
                                    lineHeight: '0.94em'
                                }}
                            >
                                написать о сотрудничестве
                            </button>
                        </a>
                    </div>
                </section>

                {/* Why KindPlate Section */}
                <section className="px-[15px] pb-[60px]">
                    <WhyKindPlate />
                </section>

                {/* Footer - точное соответствие Figma node 35-753 */}
                <footer className="px-0 pb-0">
                    <div
                        className="relative w-full"
                        style={{ 
                            backgroundColor: "#000019",
                            minHeight: "201px",
                            paddingTop: "10px",
                            paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))"
                        }}
                    >
                        {/* Два столбца: KindPlate и Нужна помощь? */}
                        <div className="flex px-[26px] gap-[40px]">
                            {/* Левый столбец - KindPlate */}
                            <div className="flex-1 min-w-0">

                                <p 
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        fontWeight: 600,
                                        fontSize: "14px",
                                        lineHeight: "22px",
                                        color: '#004900',
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
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        fontWeight: 600,
                                        fontSize: "11px",
                                        lineHeight: "22px",
                                        color: '#FFFFFF',
                                        textAlign: "left"
                                    }}
                                >
                                    Для партнеров
                                </a>
                                <Link 
                                    to="/auth/login"
                                    className="block transition-opacity hover:opacity-80 footer-link"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        fontWeight: 600,
                                        fontSize: "11px",
                                        lineHeight: "22px",
                                        color: '#FFFFFF',
                                        textAlign: "left"
                                    }}
                                >
                                    Для пользователей
                                </Link>
                                <button
                                    onClick={() => setIsDocumentsModalOpen(true)}
                                    className="block transition-opacity hover:opacity-80 footer-link"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        fontWeight: 600,
                                        fontSize: "11px",
                                        lineHeight: "22px",
                                        color: '#FFFFFF',
                                        textAlign: "left",
                                        background: 'none',
                                        border: 'none',
                                        padding: 0,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Документы
                                </button>
                                <a 
                                    href="https://t.me/kindplate"
                                    className="block transition-opacity hover:opacity-80 footer-link"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        fontWeight: 600,
                                        fontSize: "11px",
                                        lineHeight: "22px",
                                        color: '#FFFFFF',
                                        textAlign: "left"
                                    }}
                                >
                                    Блог
                                </a>
                            </div>
                            
                            {/* Правый столбец - Нужна помощь? */}
                            <div className="flex-1 min-w-0">

                                <p 
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        fontWeight: 600,
                                        fontSize: "14px",
                                        lineHeight: "22px",
                                        color: '#004900',
                                        textAlign: "left",
                                        marginBottom: "0px"
                                    }}
                                >
                                    Нужна помощь?
                                </p>
                                <Link 
                                    to="/legal/faq"
                                    className="block transition-opacity hover:opacity-80 footer-link"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        fontWeight: 600,
                                        fontSize: "11px",
                                        lineHeight: "22px",
                                        color: '#FFFFFF',
                                        textAlign: "left"
                                    }}
                                >
                                    Ответы на вопросы
                                </Link>
                                <a 
                                    href="https://t.me/kindplatesupportbot"
                                    className="block transition-opacity hover:opacity-80 footer-link"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        fontWeight: 600,
                                        fontSize: "11px",
                                        lineHeight: "22px",
                                        color: '#FFFFFF',
                                        textAlign: "left"
                                    }}
                                >
                                    Контакты
                                </a>
                            </div>
                        </div>
                        
                        {/* Социальные сети (x:27, y:101 - примерно 91px от начала контента) */}
                        <div 
                            style={{ 
                                marginLeft: "26px",
                                marginRight: "26px",
                                marginTop: "13px"
                            }}
                        >
                            <p
                                style={{
                                    fontFamily: "Montserrat Alternates, sans-serif",
                                    fontWeight: 600,
                                    fontSize: "14px",
                                    lineHeight: "22px",
                                    color: "#004900",
                                    marginBottom: "3px"
                                }}
                            >
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
