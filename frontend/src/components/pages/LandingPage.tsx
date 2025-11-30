import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Minimize2, ShoppingBag } from "lucide-react";
import bunImage from "@/figma/90428C7F-3E7E-49B8-81BC-472D67411732 1.png";
import phoneMapImage from "@/figma/image.png";
import vkIcon from "@/figma/87413 1.png";
import telegramIcon from "@/figma/25684 1.png";
import instagramIcon from "@/figma/av16efeffeed4418c90c1 1.png";
import emailIcon from "@/figma/email-and-mail-icon-black-free-png 1.png";

export function LandingPage() {
    return (
        <div className="min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: '#10172A' }}>
            {/* Mobile-first layout - single column */}
            <div className="max-w-[375px] mx-auto w-full" style={{ backgroundColor: '#10172A' }}>
                {/* Header */}
                <header className="px-[15px] pt-[26px] pb-0">
                    {/* Белый прямоугольник-хедер как в макете */}
                    <div className="w-80 h-11 mx-auto bg-white rounded-2xl flex items-center justify-between px-[16px]">
                        {/* Лого‑заглушка (кружок) — на месте брендового лого */}
                        <div 
                            className="w-[40px] h-[40px] rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: '#35741F' }}
                        >
                            <svg className="w-[24px] h-[24px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>

                        {/* Бургер‑меню, как в макете (3 тёмные полоски) */}
                        <button 
                            className="flex flex-col gap-[7px] cursor-pointer"
                            aria-label="Меню"
                        >
                            <div className="w-7 h-[3px] bg-[#10172A] rounded" />
                            <div className="w-7 h-[3px] bg-[#10172A] rounded" />
                            <div className="w-7 h-[3px] bg-[#10172A] rounded" />
                        </button>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="px-[15px] pt-[105px] pb-[40px]">
                    <div className="relative">
                        {/* Green Rectangle Backgrounds */}
                        <div 
                            className="absolute top-[4.74px] left-[16.27px] w-[143px] h-[32px] rounded-[15px] z-0"
                            style={{ backgroundColor: '#35741F' }}
                        ></div>
                        <div 
                            className="absolute top-[42.83px] left-[0.03px] w-[136px] h-[26px] rounded-[15px] z-0"
                            style={{ backgroundColor: '#35741F' }}
                        ></div>
                        
                        {/* Text Content */}
                        <div className="relative z-10">
                            <h1 
                                className="text-[32px] font-bold leading-[1.08] text-center mb-[1px]"
                                style={{ 
                                    fontFamily: 'Ramona, "Montserrat Alternates", sans-serif',
                                    color: '#FFFFFF',
                                    lineHeight: '1.08em'
                                }}
                            >
                                Выгодно для тебя,<br />
                                полезно для планеты
                            </h1>
                            <p 
                                className="text-[10px] font-normal text-center mt-[6px]"
                                style={{ 
                                    fontFamily: 'Montserrat Alternates, sans-serif',
                                    color: '#FFFFFF',
                                    lineHeight: '10.8px'
                                }}
                            >
                                Соединяем людей с кафе и ресторанами<br />
                                для выгодной и осознанной покупки еды
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA Buttons */}
                <section className="px-[60px] pb-[40px]">
                    <div className="flex gap-[18px]">
                        <Link to="/home" className="flex-1">
                            <button 
                                className="w-full h-[24px] rounded-[20px] text-[9px] font-bold leading-[1.08] text-center transition-opacity hover:opacity-90"
                                style={{ 
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #35741F',
                                    color: '#35741F',
                                    fontFamily: 'Montserrat Alternates, sans-serif',
                                    lineHeight: '1.08em'
                                }}
                            >
                                начать спасать
                            </button>
                        </Link>
                        <Link to="/auth/register/business" className="flex-1">
                            <button 
                                className="w-full h-[24px] rounded-[20px] border border-white text-[9px] font-bold leading-[1.08] text-center transition-opacity hover:opacity-90"
                                style={{ 
                                    backgroundColor: '#10172A',
                                    color: '#E3E3E3',
                                    fontFamily: 'Montserrat Alternates, sans-serif',
                                    borderWidth: '1px',
                                    lineHeight: '1.08em'
                                }}
                            >
                                начать продавать
                            </button>
                        </Link>
                    </div>
                </section>

                {/* Phone Mockup Section with Product */}
                <section className="px-[15px] pb-[60px]">
                    <div className="flex justify-center items-center">
                        {/* Phone Frame */}
                        <div 
                            className="relative rounded-[30px] p-[18px] mx-auto"
                            style={{ 
                                backgroundColor: '#C8EBBB',
                                width: '310px',
                                height: '580px',
                                minWidth: '310px',
                                minHeight: '580px'
                            }}
                        >
                            {/* Phone Screen */}
                            <div 
                                className="w-full h-full rounded-[24px] overflow-hidden relative"
                                style={{ 
                                    backgroundColor: '#FFFFFF',
                                    width: '100%',
                                    height: '100%'
                                }}
                            >
                                {/* Product Image + карта СПб */}
                                <div className="w-full h-[65%] relative overflow-hidden">
                                    {/* Карта Санкт‑Петербурга как фон */}
                                    <img
                                        src={phoneMapImage}
                                        alt="Карта Санкт-Петербурга"
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    {/* Булочка поверх карты (по макету) */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div
                                            style={{
                                                width: 289,
                                                height: 289,
                                                position: "relative",
                                            }}
                                        >
                                            {/* Фото булочки */}
                                            <img
                                                src={bunImage}
                                                alt="Булочка с корицей"
                                                style={{
                                                    width: 289,
                                                    height: 289,
                                                    left: 0,
                                                    top: 0,
                                                    position: "absolute",
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                    boxShadow: "0 16px 36px rgba(0,0,0,0.45)",
                                                }}
                                            />

                                            {/* Подпись под булочкой */}
                                            <div
                                                style={{
                                                    width: 125,
                                                    height: 26,
                                                    left: 82,
                                                    top: 244,
                                                    position: "absolute",
                                                    background: "#FFFFFF",
                                                    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                                                    borderRadius: 5,
                                                }}
                                            />
                                            <div
                                                style={{
                                                    width: 107,
                                                    height: 7,
                                                    left: 86,
                                                    top: 256,
                                                    position: "absolute",
                                                    color: "#10172A",
                                                    fontSize: 8,
                                                    fontFamily: "Montserrat Alternates, sans-serif",
                                                    fontWeight: 600,
                                                    lineHeight: "6.96px",
                                                    wordWrap: "break-word",
                                                }}
                                            >
                                                Булочка с корицей
                                            </div>
                                            <div
                                                style={{
                                                    width: 19,
                                                    height: 7,
                                                    left: 183,
                                                    top: 255,
                                                    position: "absolute",
                                                    textAlign: "right",
                                                    color: "#35741F",
                                                    fontSize: 9,
                                                    fontFamily: "Montserrat Alternates, sans-serif",
                                                    fontWeight: 600,
                                                    lineHeight: "7.83px",
                                                    wordWrap: "break-word",
                                                }}
                                            >
                                                79₽
                                            </div>
                                            <div
                                                style={{
                                                    width: 107,
                                                    height: 7,
                                                    left: 86,
                                                    top: 249,
                                                    position: "absolute",
                                                    color: "#757575",
                                                    fontSize: 5,
                                                    fontFamily: "Montserrat Alternates, sans-serif",
                                                    fontWeight: 600,
                                                    lineHeight: "4.35px",
                                                    wordWrap: "break-word",
                                                }}
                                            >
                                                Пекарня / Выпечка
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Product Card */}
                                <div 
                                    className="absolute bottom-0 left-0 right-0 p-[15px] rounded-t-[20px]"
                                    style={{ 
                                        backgroundColor: '#FFFFFF',
                                        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <h3 
                                        className="text-[16px] font-semibold mb-[8px]"
                                        style={{ 
                                            fontFamily: 'Montserrat Alternates, sans-serif',
                                            color: '#10172A'
                                        }}
                                    >
                                        Булочка с корицей
                                    </h3>
                                    <div className="flex items-center justify-between mb-[12px]">
                                        <span 
                                            className="text-[20px] font-bold"
                                            style={{ 
                                                fontFamily: 'Montserrat Alternates, sans-serif',
                                                color: '#35741F'
                                            }}
                                        >
                                            739 ₽
                                        </span>
                                        {/* Quantity Selector */}
                                        <div className="flex items-center gap-[10px]">
                                            <button 
                                                className="w-[24px] h-[24px] rounded-full flex items-center justify-center"
                                                style={{ backgroundColor: '#F3F4F6' }}
                                            >
                                                <span className="text-[14px] font-bold" style={{ color: '#10172A' }}>-</span>
                                            </button>
                                            <span 
                                                className="text-[14px] font-semibold min-w-[20px] text-center"
                                                style={{ 
                                                    fontFamily: 'Montserrat Alternates, sans-serif',
                                                    color: '#10172A'
                                                }}
                                            >
                                                1
                                            </span>
                                            <button 
                                                className="w-[24px] h-[24px] rounded-full flex items-center justify-center"
                                                style={{ backgroundColor: '#F3F4F6' }}
                                            >
                                                <span className="text-[14px] font-bold" style={{ color: '#10172A' }}>+</span>
                                            </button>
                                        </div>
                                    </div>
                                    <button 
                                        className="w-full h-[36px] rounded-[8px] text-[12px] font-semibold transition-opacity hover:opacity-90"
                                        style={{ 
                                            backgroundColor: '#10172A',
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
                </section>

                {/* Statistics Section */}
                <section className="px-[15px] pb-[60px]">
                    <div 
                        className="rounded-[15px] p-[23px]"
                        style={{ backgroundColor: '#2B344D' }}
                    >
                        <p 
                            className="text-[22px] font-semibold leading-[0.87] mb-[6px] text-center"
                            style={{ 
                                fontFamily: 'Montserrat Alternates, sans-serif',
                                color: '#FFFFFF',
                                lineHeight: '0.87em'
                            }}
                        >
                            Вместе мы спасли
                        </p>
                        <div className="flex items-center justify-center">
                            <div 
                                className="flex items-center justify-center w-[115px] h-[25px] rounded-[5px]"
                                style={{ backgroundColor: '#35741F' }}
                            >
                                <p 
                                    className="text-[22px] font-semibold leading-[0.84] text-center whitespace-nowrap"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: '#FFFFFF',
                                        lineHeight: '0.84em'
                                    }}
                                >
                                    532 блюд от выброса
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
                    
                    {/* User Benefits Section - White Card */}
                <section className="px-[15px] pb-[60px]">
                    <div 
                        className="rounded-[15px] p-[20px]"
                        style={{ backgroundColor: '#FFFFFF' }}
                    >
                        <h3 
                            className="text-[14px] font-bold leading-[1.08] mb-[4px]"
                            style={{ 
                                fontFamily: 'Montserrat Alternates, sans-serif',
                                color: '#35741F',
                                lineHeight: '1.08em'
                            }}
                        >
                            Для пользователей
                        </h3>
                        <h4 
                            className="text-[22px] font-semibold leading-[0.87] mb-[46px]"
                            style={{ 
                                fontFamily: 'Montserrat Alternates, sans-serif',
                                color: '#10172A',
                                lineHeight: '0.87em'
                            }}
                        >
                            Экономьте и спасайте еду из любимых заведений
                        </h4>
                        <p 
                            className="text-[12px] font-normal leading-[0.94] mb-[125px]"
                            style={{ 
                                fontFamily: 'Montserrat Alternates, sans-serif',
                                color: '#10172A',
                                lineHeight: '0.94em'
                            }}
                        >
                            Получайте вкусные блюда по отличным ценам и помогайте сокращать пищевые отходы. Смотрите актуальные предложения рядом с вами и бронируйте прямо в KindPlate. Каждый заказ — шаг к более ответственному потреблению и поддержке экологической устойчивости.
                        </p>
                        
                        {/* Steps */}
                        <div className="space-y-[14px] mb-[21px]">
                            <div className="flex items-start gap-[22px]">
                                <span 
                                    className="text-[12px] font-semibold leading-[0.87] flex-shrink-0"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: '#35741F',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    01
                                </span>
                            </div>
                            <div className="w-full h-[1px]" style={{ backgroundColor: '#C4CEE8' }}></div>
                            <div className="flex items-start gap-[22px]">
                                <span 
                                    className="text-[12px] font-semibold leading-[0.87] flex-shrink-0"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: '#35741F',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    02.
                                </span>
                                <p 
                                    className="text-[11px] font-semibold leading-[0.87]"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: '#10172A',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    Выбирай и оплачивай прямо в приложении
                                </p>
                            </div>
                            <div className="w-full h-[1px]" style={{ backgroundColor: '#C4CEE8' }}></div>
                            <div className="flex items-start gap-[22px]">
                                <span 
                                    className="text-[12px] font-semibold leading-[0.87] flex-shrink-0"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: '#35741F',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    03.
                                </span>
                                <p 
                                    className="text-[11px] font-semibold leading-[0.87]"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: '#10172A',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    Забери в заведении и наслаждайся
                                </p>
                            </div>
                        </div>
                        
                        <Link to="/home">
                            <button 
                                className="w-full h-[28px] rounded-[5px] text-[12px] font-semibold leading-[0.94] transition-opacity hover:opacity-90"
                                style={{ 
                                    backgroundColor: '#35741F',
                                    color: '#FFFFFF',
                                    fontFamily: 'Montserrat Alternates, sans-serif',
                                    lineHeight: '0.94em'
                                }}
                            >
                                смотреть предложения
                            </button>
                        </Link>
                    </div>
                </section>

                {/* User Benefits Section - Dark Card (Repeated) */}
                <section className="px-[15px] pb-[60px]">
                    <div 
                        className="rounded-[15px] p-[20px]"
                        style={{ backgroundColor: '#2B344D' }}
                    >
                        <h3 
                            className="text-[14px] font-bold leading-[1.08] mb-[4px]"
                            style={{ 
                                fontFamily: 'Montserrat Alternates, sans-serif',
                                color: '#35741F',
                                lineHeight: '1.08em'
                            }}
                        >
                            Для пользователей
                        </h3>
                        <h4 
                            className="text-[22px] font-semibold leading-[0.87] mb-[46px]"
                            style={{ 
                                fontFamily: 'Montserrat Alternates, sans-serif',
                                color: '#F5FBA2',
                                lineHeight: '0.87em'
                            }}
                        >
                            Экономьте и спасайте еду из любимых заведений
                        </h4>
                        <p 
                            className="text-[12px] font-normal leading-[0.94] mb-[125px]"
                            style={{ 
                                fontFamily: 'Montserrat Alternates, sans-serif',
                                color: '#FFFFFF',
                                lineHeight: '0.94em'
                            }}
                        >
                            Получайте вкусные блюда по отличным ценам и помогайте сокращать пищевые отходы. Смотрите актуальные предложения рядом с вами и бронируйте прямо в KindPlate. Каждый заказ — шаг к более ответственному потреблению и поддержке экологической устойчивости.
                        </p>
                        
                        {/* Steps */}
                        <div className="space-y-[14px] mb-[21px]">
                            <div className="flex items-start gap-[22px]">
                                <span 
                                    className="text-[12px] font-semibold leading-[0.87] flex-shrink-0"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: 'rgba(245, 251, 162, 0.6)',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    01
                                </span>
                                <p 
                                    className="text-[11px] font-semibold leading-[0.87]"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: '#FFFFFF',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    Смотри предложения рядом с тобой
                                </p>
                            </div>
                            <div className="w-full h-[1px]" style={{ backgroundColor: '#C4CEE8' }}></div>
                            <div className="flex items-start gap-[22px]">
                                <span 
                                    className="text-[12px] font-semibold leading-[0.87] flex-shrink-0"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: 'rgba(245, 251, 162, 0.6)',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    02
                                </span>
                                <p 
                                    className="text-[11px] font-semibold leading-[0.87]"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: '#FFFFFF',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    Выбирай и оплачивай прямо в приложении
                                </p>
                            </div>
                            <div className="w-full h-[1px]" style={{ backgroundColor: '#C4CEE8' }}></div>
                            <div className="flex items-start gap-[22px]">
                                <span 
                                    className="text-[12px] font-semibold leading-[0.87] flex-shrink-0"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: 'rgba(245, 251, 162, 0.6)',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    03
                                </span>
                                <p 
                                    className="text-[11px] font-semibold leading-[0.87]"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: '#FFFFFF',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    Забери в заведении и наслаждайся
                                </p>
                </div>
            </div>

                        <Link to="/auth/register/business">
                            <button 
                                className="w-full h-[31px] rounded-[5px] text-[12px] font-semibold leading-[0.94] transition-opacity hover:opacity-90"
                                style={{ 
                                    backgroundColor: '#F5FBA2',
                                    color: '#10172A',
                                    fontFamily: 'Montserrat Alternates, sans-serif',
                                    lineHeight: '0.94em'
                                }}
                            >
                                написать о сотрудничестве
                            </button>
                        </Link>
                    </div>
                </section>

                {/* Why KindPlate Section */}
                <section className="px-[15px] pb-[60px]">
                    <div
                        className="rounded-[15px] pt-[24px] pb-[32px] px-[24px]"
                        style={{ backgroundColor: "#35741F" }}
                    >
                        <h3
                            className="text-[23px] font-bold text-center mb-[24px]"
                            style={{
                                fontFamily: "Montserrat Alternates, sans-serif",
                                color: "#FFFFFF",
                                lineHeight: "24.84px",
                            }}
                        >
                            Почему KindPlate?
                        </h3>

                        {/* Grid of 4 cards */}
                        <div className="grid grid-cols-2 gap-x-[20px] gap-y-[18px]">
                            {/* Card 1 - Save up to 70% */}
                            <div 
                                className="rounded-[15px] py-[20px] px-[12px] h-[122px] flex flex-col items-center justify-center"
                                style={{ backgroundColor: '#C8EBBB' }}
                            >
                                <div className="mb-[20px] w-[40px] h-[40px] flex items-center justify-center">
                                    <ShoppingBag className="w-full h-full" style={{ color: '#35741F', strokeWidth: 2 }} />
                                </div>
                                <p 
                                    className="text-[13px] font-semibold leading-[0.87] text-center"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: '#10172A',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    Экономьте<br />
                                    до 70% на качественной<br />
                                    еде
                                </p>
                            </div>
                            
                            {/* Card 2 - Reduce waste */}
                            <div 
                                className="rounded-[15px] py-[20px] px-[12px] h-[122px] flex flex-col items-center justify-center"
                                style={{ backgroundColor: '#C8EBBB' }}
                            >
                                <div className="mb-[20px] w-[40px] h-[40px] flex items-center justify-center">
                                    <Minimize2 className="w-full h-full" style={{ color: '#35741F', strokeWidth: 2 }} />
                                </div>
                                <p 
                                    className="text-[13px] font-semibold leading-[0.87] text-center"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: '#10172A',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    Уменьшайте пищевые отходы и СО₂
                                </p>
                            </div>
                            
                            {/* Card 3 - Support local businesses */}
                            <div 
                                className="rounded-[15px] py-[20px] px-[12px] h-[122px] flex flex-col items-center justify-center"
                                style={{ backgroundColor: '#C8EBBB' }}
                            >
                                <div className="mb-[20px] w-[40px] h-[40px] flex items-center justify-center">
                                    <MapPin className="w-full h-full" style={{ color: '#35741F', strokeWidth: 2 }} />
                                </div>
                                <p 
                                    className="text-[13px] font-semibold leading-[0.87] text-center"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: '#10172A',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    Поддержи-<br />
                                    вайте местные бизнесы
                                </p>
                            </div>
                            
                            {/* Card 4 - Positive impact */}
                            <div 
                                className="rounded-[15px] py-[20px] px-[12px] h-[122px] flex flex-col items-center justify-center"
                                style={{ backgroundColor: '#C8EBBB' }}
                            >
                                <div className="mb-[20px] w-[40px] h-[40px] flex items-center justify-center">
                                    <Heart className="w-full h-full" style={{ color: '#35741F', strokeWidth: 2 }} />
                                </div>
                                <p 
                                    className="text-[13px] font-semibold leading-[0.87] text-center"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: '#10172A',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    Создавайте позитивное влияние
                                </p>
                </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="px-0 pb-[60px]">
                    <div
                        className="rounded-0 p-[27px]"
                        style={{ backgroundColor: "#2B344D" }}
                    >
                        <div className="grid grid-cols-2 gap-[27px] mb-[25px]">
                            {/* KindPlate Column */}
                            <div>
                                <h4 
                                    className="text-[14px] font-semibold leading-[1.57] mb-[21px]"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: '#35741F',
                                        lineHeight: '1.57em'
                                    }}
                                >
                                    KindPlate
                                </h4>
                                <ul className="space-y-[11px]">
                                    <li>
                                        <Link 
                                            to="/auth/register/business"
                                            className="text-[11px] font-semibold leading-[2] transition-opacity hover:opacity-80"
                                            style={{ 
                                                fontFamily: 'Montserrat Alternates, sans-serif',
                                                color: '#FFFFFF',
                                                lineHeight: '2em'
                                            }}
                                        >
                                            Для партнеров
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            to="/home"
                                            className="text-[11px] font-semibold leading-[2] transition-opacity hover:opacity-80"
                                            style={{ 
                                                fontFamily: 'Montserrat Alternates, sans-serif',
                                                color: '#FFFFFF',
                                                lineHeight: '2em'
                                            }}
                                        >
                                            Для пользователей
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            to="/legal/faq"
                                            className="text-[11px] font-semibold leading-[2] transition-opacity hover:opacity-80"
                                            style={{ 
                                                fontFamily: 'Montserrat Alternates, sans-serif',
                                                color: '#FFFFFF',
                                                lineHeight: '2em'
                                            }}
                                        >
                                            Документы
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            to="#"
                                            className="text-[11px] font-semibold leading-[2] transition-opacity hover:opacity-80"
                                            style={{ 
                                                fontFamily: 'Montserrat Alternates, sans-serif',
                                                color: '#FFFFFF',
                                                lineHeight: '2em'
                                            }}
                                        >
                                            Блог
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            
                            {/* Help Column */}
                            <div>
                                <h4 
                                    className="text-[14px] font-semibold leading-[1.57] mb-[21px]"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: '#35741F',
                                        lineHeight: '1.57em'
                                    }}
                                >
                                    Нужна помощь?
                                </h4>
                                <ul className="space-y-[11px]">
                                    <li>
                                        <Link 
                                            to="/legal/faq"
                                            className="text-[11px] font-semibold leading-[2] transition-opacity hover:opacity-80"
                                            style={{ 
                                                fontFamily: 'Montserrat Alternates, sans-serif',
                                                color: '#FFFFFF',
                                                lineHeight: '2em'
                                            }}
                                        >
                                            Ответы на вопросы
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            to="#"
                                            className="text-[11px] font-semibold leading-[2] transition-opacity hover:opacity-80"
                                            style={{ 
                                                fontFamily: 'Montserrat Alternates, sans-serif',
                                                color: '#FFFFFF',
                                                lineHeight: '2em'
                                            }}
                                        >
                                            Контакты
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        {/* Social Media */}
                        <div className="mb-[25px]">
                            <h4
                                className="text-[14px] font-semibold leading-[1.57] mb-[25px]"
                                style={{
                                    fontFamily: "Montserrat Alternates, sans-serif",
                                    color: "#35741F",
                                    lineHeight: "1.57em",
                                }}
                            >
                                Социальные сети
                            </h4>
                            <div className="flex gap-[11px] items-center">
                                <a
                                    href="#"
                                    className="w-[25px] h-[25px] rounded-full flex items-center justify-center bg-[#7E879D] transition-opacity hover:opacity-80"
                                    aria-label="VK"
                                >
                                    <img
                                        src={vkIcon}
                                        alt="VK"
                                        className="w-[15px] h-[15px]"
                                    />
                                </a>
                                <a
                                    href="#"
                                    className="w-[25px] h-[25px] rounded-full flex items-center justify-center bg-[#7E879D] transition-opacity hover:opacity-80"
                                    aria-label="Telegram"
                                >
                                    <img
                                        src={telegramIcon}
                                        alt="Telegram"
                                        className="w-[15px] h-[15px]"
                                    />
                                </a>
                                <a
                                    href="#"
                                    className="w-[31px] h-[31px] rounded-full flex items-center justify-center bg-[#7E879D] transition-opacity hover:opacity-80"
                                    aria-label="Instagram"
                                >
                                    <img
                                        src={instagramIcon}
                                        alt="Instagram"
                                        className="w-[19px] h-[19px]"
                                    />
                                </a>
                                <a
                                    href="#"
                                    className="w-[25px] h-[25px] rounded-full flex items-center justify-center bg-[#7E879D] transition-opacity hover:opacity-80"
                                    aria-label="Email"
                                >
                                    <img
                                        src={emailIcon}
                                        alt="Email"
                                        className="w-[16px] h-[16px]"
                                    />
                                </a>
                            </div>
                        </div>
                        
                        {/* Copyright */}
                        <p 
                            className="text-[8px] font-normal leading-[2.75] text-center"
                            style={{ 
                                fontFamily: 'Montserrat Alternates, sans-serif',
                                color: '#FFFFFF',
                                lineHeight: '2.75em'
                            }}
                        >
                            ©KindPlate 2005. Все права защищены
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
