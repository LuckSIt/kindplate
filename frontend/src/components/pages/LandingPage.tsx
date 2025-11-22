import { Header, HeroSection, Stats, UserSteps, WhyKindPlate, Footer, ProductMainCard, SliderProducts } from "@/components/landing";

export function LandingPage() {
    const userStepsData = [
        {
            number: "01",
            text: "Смотри предложения рядом с тобой"
        },
        {
            number: "02",
            text: "Выбирай и оплачивай прямо в приложении"
        },
        {
            number: "03",
            text: "Забери в заведении и наслаждайся"
        }
    ];

    const userStepsDescription = "Получайте вкусные блюда по отличным ценам и помогайте сокращать пищевые отходы. Смотрите актуальные предложения рядом с вами и бронируйте прямо в KindPlate. Каждый заказ — шаг к более ответственному потреблению и поддержке экологической устойчивости.";

    const partnerStepsData = [
        {
            number: "01",
            text: "Смотри предложения рядом с тобой"
        },
        {
            number: "02",
            text: "Выбирай и оплачивай прямо в приложении"
        },
        {
            number: "03",
            text: "Забери в заведении и наслаждайся"
        }
    ];

    const partnerStepsDescription = "Получайте вкусные блюда по отличным ценам и помогайте сокращать пищевые отходы. Смотрите актуальные предложения рядом с вами и бронируйте прямо в KindPlate.";

    return (
        <div className="min-h-screen bg-black flex flex-col lg:flex-row overflow-hidden">
            {/* Left Sidebar - Fixed Width */}
            <div className="w-full lg:w-[400px] xl:w-[500px] bg-[#0a1628] flex flex-col flex-shrink-0 overflow-y-auto max-h-screen">
                <Header />
                
                <div className="flex-1 overflow-y-auto">
                    <HeroSection />
                    <Stats />
                    
                    {/* User Benefits Section - White Card */}
                    <UserSteps
                        title="Для пользователей"
                        subtitle="Экономьте и спасайте еду из любимых заведений"
                        description={userStepsDescription}
                        steps={userStepsData}
                        buttonText="смотреть предложения"
                        buttonLink="/home"
                        buttonVariant="primary"
                        variant="white"
                    />
                    
                    {/* Partners Section - White Card */}
                    <UserSteps
                        title="Для пользователей"
                        subtitle="Экономьте и спасайте еду из любимых заведений"
                        description={partnerStepsDescription}
                        steps={partnerStepsData}
                        buttonText="написать о сотрудничестве"
                        buttonLink="/auth/register/business"
                        buttonVariant="outline"
                        variant="white"
                    />
                    
                    <WhyKindPlate />
                    <Footer />
                </div>
            </div>

            {/* Right Content Area - Flexible Width */}
            <div className="flex-1 bg-black overflow-y-auto hidden lg:block max-h-screen">
                <div className="max-w-6xl mx-auto p-4 lg:p-8">
                    <ProductMainCard />
                    <SliderProducts />
                </div>
            </div>
        </div>
    );
}

