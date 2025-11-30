import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Minimize2, ShoppingBag, Send, Instagram, Mail } from "lucide-react";

export function LandingPage() {
    return (
        <div className="min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: '#10172A' }}>
            {/* Mobile-first layout - single column */}
            <div className="max-w-[375px] mx-auto w-full" style={{ backgroundColor: '#10172A' }}>
                {/* Header */}
                <header className="px-[15px] pt-0 pb-0">
                    <div className="flex items-center justify-between h-[103px]">
                        <div className="flex items-center">
                            {/* Logo Icon - будет заменен на логотип из брендбука */}
                            <div 
                                className="w-[40px] h-[40px] rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: '#35741F' }}
                            >
                                <svg className="w-[24px] h-[24px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <button 
                            className="flex flex-col gap-[7px] cursor-pointer"
                            aria-label="Меню"
                        >
                            <div className="w-[27px] h-[3px] bg-white rounded"></div>
                            <div className="w-[27px] h-[3px] bg-white rounded"></div>
                            <div className="w-[27px] h-[3px] bg-white rounded"></div>
                        </button>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="px-[15px] pt-[105px] pb-[105px]">
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
                                    color: '#FFFFFF',
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
                            className="relative rounded-[30px] p-[15px] mx-auto"
                            style={{ 
                                backgroundColor: '#C8EBBB',
                                width: '280px',
                                height: '500px',
                                minWidth: '280px',
                                minHeight: '500px'
                            }}
                        >
                            {/* Phone Screen */}
                            <div 
                                className="w-full h-full rounded-[20px] overflow-hidden relative"
                                style={{ 
                                    backgroundColor: '#FFFFFF',
                                    width: '100%',
                                    height: '100%'
                                }}
                            >
                                {/* Product Image */}
                                <div className="w-full h-[60%] relative overflow-hidden bg-gray-100">
                                    {/* Map pattern background */}
                                    <div 
                                        className="absolute inset-0 opacity-30"
                                        style={{ 
                                            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23e5e7eb\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' 
                                        }}
                                    />
                                    {/* Cinnamon Bun Placeholder */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div 
                                            className="w-[120px] h-[120px] rounded-full flex items-center justify-center"
                                            style={{ 
                                                backgroundColor: '#D4A574',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                                            }}
                                        >
                                            <div className="w-[80px] h-[80px] rounded-full" style={{ backgroundColor: '#F5DEB3' }}></div>
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
                                className="px-[15px] py-[5px] rounded-[5px] inline-block"
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
                <section className="px-[14px] pb-[60px]">
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
                            {/* Card 1 - Save up to 70% */}
                            <div 
                                className="rounded-[15px] p-[34px] relative h-[122px] flex flex-col items-center justify-center"
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
                                className="rounded-[15px] p-[34px] relative h-[122px] flex flex-col items-center justify-center"
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
                                className="rounded-[15px] p-[34px] relative h-[122px] flex flex-col items-center justify-center"
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
                                className="rounded-[15px] p-[34px] relative h-[122px] flex flex-col items-center justify-center"
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
                                    className="w-[25px] h-[25px] rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                                    style={{ backgroundColor: '#7E879D' }}
                                    aria-label="ВКонтакте"
                                >
                                    <span className="text-[10px] font-bold text-white">VK</span>
                                </a>
                                <a 
                                    href="#" 
                                    className="w-[25px] h-[25px] rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                                    style={{ backgroundColor: '#7E879D' }}
                                    aria-label="Telegram"
                                >
                                    <Send className="w-[14px] h-[14px] text-white" />
                                </a>
                                <a 
                                    href="#" 
                                    className="w-[31px] h-[31px] rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                                    style={{ backgroundColor: '#7E879D' }}
                                    aria-label="Instagram"
                                >
                                    <Instagram className="w-[19px] h-[19px] text-white" />
                                </a>
                                <a 
                                    href="#" 
                                    className="w-[25px] h-[25px] rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                                    style={{ backgroundColor: '#7E879D' }}
                                    aria-label="Email"
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
                            ©KindPlate 2005. Все права защищены
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
