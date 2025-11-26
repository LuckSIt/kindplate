import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Minimize2, ShoppingBag, Send, Instagram, Mail } from "lucide-react";
import cinnamonRollImage from "@/figma/90428C7F-3E7E-49B8-81BC-472D67411732 1.png";

export function LandingPage() {
    return (
        <div className="min-h-screen w-full" style={{ backgroundColor: '#10172A' }}>
            <div className="flex">
                {/* Left Column - Fixed Width */}
                <div className="w-[375px] flex-shrink-0" style={{ backgroundColor: '#10172A' }}>
                    {/* Header */}
                    <div className="px-[15px] pt-0 pb-0">
                        <div className="flex items-center justify-between h-[103px]">
                            <div className="w-[103px] h-[103px] flex items-center justify-center">
                                <span 
                                    className="text-[32px] font-bold"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: '#FFFFFF'
                                    }}
                                >
                                    KindPlate
                                </span>
                            </div>
                            <div className="flex flex-col gap-[7px]">
                                <div className="w-[27px] h-[3px] bg-white"></div>
                                <div className="w-[27px] h-[3px] bg-white"></div>
                                <div className="w-[27px] h-[3px] bg-white"></div>
                            </div>
                        </div>
                    </div>

                    {/* Hero Text Section */}
                    <div className="px-[15px] pt-[105px] pb-[105px]">
                        <div className="relative">
                            {/* Green Rectangle 6 */}
                            <div 
                                className="absolute top-[4.74px] left-[16.27px] w-[143px] h-[32px] rounded-[15px]"
                                style={{ backgroundColor: '#35741F' }}
                            ></div>
                            {/* Green Rectangle 7 */}
                            <div 
                                className="absolute top-[42.83px] left-[0.03px] w-[136px] h-[26px] rounded-[15px]"
                                style={{ backgroundColor: '#35741F' }}
                            ></div>
                            
                            {/* Text Content */}
                            <div className="relative z-10 pt-0">
                                <h1 
                                    className="text-[32px] font-bold leading-[1.08] text-center mb-[1px]"
                                    style={{ 
                                        fontFamily: 'Ramona, sans-serif',
                                        color: '#FFFFFF',
                                        lineHeight: '1.08em'
                                    }}
                                >
                                    Выгодно для тебя,<br />
                                    полезно для планеты
                                </h1>
                                <p 
                                    className="text-[10px] font-normal leading-[1.08] text-center mt-[3px]"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: '#FFFFFF',
                                        lineHeight: '1.08em'
                                    }}
                                >
                                    Соединяем людей с кафе и ресторанами<br />
                                    для выгодной и осознанной покупки еды
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="px-[60px] pb-[105px]">
                        <div className="flex gap-[18px]">
                            <Link to="/home" className="flex-1">
                                <button 
                                    className="w-full h-[24px] rounded-[20px] text-[9px] font-bold leading-[1.08] text-center"
                                    style={{ 
                                        backgroundColor: '#FFFFFF',
                                        color: '#35741F',
                                        fontFamily: 'Montserrat Alternates, sans-serif'
                                    }}
                                >
                                    начать спасать
                                </button>
                            </Link>
                            <Link to="/auth/register/business" className="flex-1">
                                <button 
                                    className="w-full h-[24px] rounded-[20px] border border-white text-[9px] font-bold leading-[1.08] text-center"
                                    style={{ 
                                        backgroundColor: 'transparent',
                                        color: '#E3E3E3',
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        borderWidth: '1px'
                                    }}
                                >
                                    начать продовать
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="px-[15px] pb-[60px]">
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
                                    className="rounded-[5px] px-[15px] py-[5px] flex items-center justify-center"
                                    style={{ backgroundColor: '#35741F' }}
                                >
                                    <p 
                                        className="text-[22px] font-semibold leading-[0.84] whitespace-nowrap"
                                        style={{ 
                                            fontFamily: 'Montserrat Alternates, sans-serif',
                                            lineHeight: '0.84em'
                                        }}
                                    >
                                        <span style={{ color: '#C8EBBB' }}>532</span> <span style={{ color: '#C8EBBB' }}>блюд</span> <span style={{ color: '#FFFFFF' }}>от выброса</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Steps Section */}
                    <div className="px-[15px] pb-[60px]">
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
                                    <p 
                                        className="text-[11px] font-semibold leading-[0.87]"
                                        style={{ 
                                            fontFamily: 'Montserrat Alternates, sans-serif',
                                            color: '#10172A',
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
                                            color: '#35741F',
                                            lineHeight: '0.87em'
                                        }}
                                    >
                                        02
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
                                        03
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
                                    className="w-full h-[28px] rounded-[5px] text-[12px] font-semibold leading-[0.94]"
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
                    </div>

                    {/* Partner Steps Section */}
                    <div className="px-[15px] pb-[60px]">
                        <div 
                            className="rounded-[15px] p-[20px]"
                            style={{ backgroundColor: '#2B344D' }}
                        >
                            <h3 
                                className="text-[14px] font-bold leading-[1.08] mb-[4px]"
                                style={{ 
                                    fontFamily: 'Montserrat Alternates, sans-serif',
                                    color: '#F5FBA2',
                                    lineHeight: '1.08em'
                                }}
                            >
                                Для партнеров
                            </h3>
                            <h4 
                                className="text-[22px] font-semibold leading-[0.87] mb-[46px]"
                                style={{ 
                                    fontFamily: 'Montserrat Alternates, sans-serif',
                                    color: '#FFFFFF',
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
                                    className="w-full h-[31px] rounded-[5px] text-[12px] font-semibold leading-[0.94]"
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
                    </div>

                    {/* Why KindPlate Section */}
                    <div className="px-[14px] pb-[60px]">
                        <div 
                            className="rounded-[15px] p-[53px] relative"
                            style={{ backgroundColor: '#35741F' }}
                        >
                            <h3 
                                className="text-[23px] font-bold leading-[1.08] mb-[196px] text-center"
                                style={{ 
                                    fontFamily: 'Montserrat Alternates, sans-serif',
                                    color: '#FFFFFF',
                                    lineHeight: '1.08em'
                                }}
                            >
                                Почему KindPlate?
                            </h3>
                            
                            {/* Grid of 4 cards */}
                            <div className="grid grid-cols-2 gap-[30px]">
                                {/* Card 1 */}
                                <div 
                                    className="rounded-[15px] p-[34px] relative h-[122px] flex flex-col items-center justify-center"
                                    style={{ backgroundColor: '#C8EBBB' }}
                                >
                                    <div className="mb-[20px] w-[40px] h-[40px] flex items-center justify-center">
                                        <Heart className="w-full h-full" style={{ color: '#FFFFFF', strokeWidth: 4, fill: '#FFFFFF' }} />
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
                                
                                {/* Card 2 */}
                                <div 
                                    className="rounded-[15px] p-[34px] relative h-[122px] flex flex-col items-center justify-center"
                                    style={{ backgroundColor: '#C8EBBB' }}
                                >
                                    <div className="mb-[20px] w-[40px] h-[40px] flex items-center justify-center">
                                        <MapPin className="w-full h-full" style={{ color: '#FFFFFF', strokeWidth: 4, fill: '#FFFFFF' }} />
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
                                
                                {/* Card 3 */}
                                <div 
                                    className="rounded-[15px] p-[34px] relative h-[122px] flex flex-col items-center justify-center"
                                    style={{ backgroundColor: '#C8EBBB' }}
                                >
                                    <div className="mb-[20px] w-[40px] h-[40px] flex items-center justify-center">
                                        <Minimize2 className="w-full h-full" style={{ color: '#FFFFFF', strokeWidth: 4 }} />
                                    </div>
                                    <p 
                                        className="text-[13px] font-semibold leading-[0.87] text-center"
                                        style={{ 
                                            fontFamily: 'Montserrat Alternates, sans-serif',
                                            color: '#10172A',
                                            lineHeight: '0.87em'
                                        }}
                                    >
                                        Уменьшайте пищевые отходы и CO₂
                                    </p>
                                </div>
                                
                                {/* Card 4 */}
                                <div 
                                    className="rounded-[15px] p-[34px] relative h-[122px] flex flex-col items-center justify-center"
                                    style={{ backgroundColor: '#C8EBBB' }}
                                >
                                    <div className="mb-[20px] w-[40px] h-[40px] flex items-center justify-center">
                                        <ShoppingBag className="w-full h-full" style={{ color: '#FFFFFF', strokeWidth: 4, fill: '#FFFFFF' }} />
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
                    </div>

                    {/* Footer */}
                    <div className="px-0 pb-[60px]">
                        <div 
                            className="p-[27px]"
                            style={{ backgroundColor: '#2B344D' }}
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
                                                className="text-[11px] font-semibold leading-[2]"
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
                                                className="text-[11px] font-semibold leading-[2]"
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
                                                className="text-[11px] font-semibold leading-[2]"
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
                                                className="text-[11px] font-semibold leading-[2]"
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
                                                className="text-[11px] font-semibold leading-[2]"
                                                style={{ 
                                                    fontFamily: 'Montserrat Alternates, sans-serif',
                                                    color: '#FFFFFF',
                                                    lineHeight: '2em'
                                                }}
                                            >
                                                Ответы на ворпосы
                                            </Link>
                                        </li>
                                        <li>
                                            <Link 
                                                to="#"
                                                className="text-[11px] font-semibold leading-[2]"
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
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: '#35741F',
                                        lineHeight: '1.57em'
                                    }}
                                >
                                    Социальные сети
                                </h4>
                                <div className="flex gap-[11px]">
                                    <a 
                                        href="#" 
                                        className="w-[25px] h-[25px] rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: '#7E879D' }}
                                    >
                                        <span className="text-[10px] font-bold text-white">VK</span>
                                    </a>
                                    <a 
                                        href="#" 
                                        className="w-[25px] h-[25px] rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: '#7E879D' }}
                                    >
                                        <Send className="w-[14px] h-[14px] text-white" />
                                    </a>
                                    <a 
                                        href="#" 
                                        className="w-[31px] h-[31px] rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: '#7E879D' }}
                                    >
                                        <Instagram className="w-[19px] h-[19px] text-white" />
                                    </a>
                                    <a 
                                        href="#" 
                                        className="w-[25px] h-[25px] rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: '#7E879D' }}
                                    >
                                        <Mail className="w-[14px] h-[14px] text-white" />
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
                                ©KindPlate 2025. Все права защищены
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column - Product Section */}
                <div className="flex-1 relative" style={{ backgroundColor: '#10172A' }}>
                    {/* Product Card - Fixed Position */}
                    <div className="sticky top-[285px] right-[95px] w-[183px] h-[376px] ml-auto mr-[95px]">
                        <div 
                            className="w-full h-full rounded-[25px] border-[5px] p-[17px] flex flex-col"
                            style={{ 
                                backgroundColor: '#E7F5E2',
                                borderColor: '#345E34'
                            }}
                        >
                            {/* Map Image */}
                            <div 
                                className="w-[150px] h-[174px] rounded-[15px] mb-[136px] overflow-hidden flex-shrink-0"
                                style={{ backgroundColor: '#D9D9D9' }}
                            >
                                {/* Placeholder for map - можно заменить на реальное изображение */}
                                <div className="w-full h-full flex items-center justify-center">
                                    <MapPin className="w-[40px] h-[40px]" style={{ color: '#757575' }} />
                                </div>
                            </div>
                            
                            {/* Product Image */}
                            <div className="w-[289px] h-[289px] mb-[12px] overflow-hidden flex-shrink-0 -ml-[53px]">
                                <img 
                                    src={cinnamonRollImage} 
                                    alt="Булочка с корицей"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            
                            {/* Product Info Card */}
                            <div 
                                className="w-[125px] h-[26px] rounded-[5px] p-[4px] shadow-md flex-shrink-0"
                                style={{ backgroundColor: '#FFFFFF' }}
                            >
                                <p 
                                    className="text-[8px] font-semibold leading-[0.87] mb-[5px]"
                                    style={{ 
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        color: '#10172A',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    Булочка с корицей
                                </p>
                                <div className="flex items-center justify-between">
                                    <p 
                                        className="text-[5px] font-semibold leading-[0.87]"
                                        style={{ 
                                            fontFamily: 'Montserrat Alternates, sans-serif',
                                            color: '#757575',
                                            lineHeight: '0.87em'
                                        }}
                                    >
                                        Пекарня / Выпечка
                                    </p>
                                    <p 
                                        className="text-[9px] font-semibold leading-[0.87]"
                                        style={{ 
                                            fontFamily: 'Montserrat Alternates, sans-serif',
                                            color: '#35741F',
                                            lineHeight: '0.87em'
                                        }}
                                    >
                                        79₽
                                    </p>
                </div>
            </div>

                            {/* Quantity Selector and Add Button */}
                            <div className="flex items-center gap-[29px] mt-auto">
                                <div 
                                    className="w-[57px] h-[23px] rounded-[5px] flex items-center justify-center shadow-md"
                                    style={{ backgroundColor: '#FFFFFF' }}
                                >
                                    <div className="flex items-center gap-[10px]">
                                        <div className="w-[7px] h-[1px]" style={{ backgroundColor: '#D9D9D9' }}></div>
                                        <span 
                                            className="text-[10px] font-bold leading-[0.87]"
                                            style={{ 
                                                fontFamily: 'Montserrat Alternates, sans-serif',
                                                color: '#10172A',
                                                lineHeight: '0.87em'
                                            }}
                                        >
                                            1
                                        </span>
                                        <div className="w-[7px] h-[1px]" style={{ backgroundColor: '#D9D9D9' }}></div>
                                    </div>
                                </div>
                                <button 
                                    className="w-[107px] h-[23px] rounded-[5px] text-[9px] font-normal leading-[0.87] shadow-md"
                                    style={{ 
                                        backgroundColor: '#10172A',
                                        color: '#E3E3E3',
                                        fontFamily: 'Montserrat Alternates, sans-serif',
                                        lineHeight: '0.87em'
                                    }}
                                >
                                    добавить в заказ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
