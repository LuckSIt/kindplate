import { DollarSign, TrendingUp, MapPin, Heart } from "lucide-react";

interface BenefitCard {
    icon: React.ReactNode;
    text: string;
}

const benefits: BenefitCard[] = [
    {
        icon: <DollarSign className="w-8 h-8 text-white" />,
        text: "Экономьте до 70% на качественной еде"
    },
    {
        icon: <TrendingUp className="w-8 h-8 text-white" />,
        text: "Уменьшайте пищевые отходы и СО2"
    },
    {
        icon: <MapPin className="w-8 h-8 text-white" />,
        text: "Поддерживайте местные бизнесы"
    },
    {
        icon: <Heart className="w-8 h-8 text-white" />,
        text: "Создавайте позитивное влияние"
    }
];

export function WhyKindPlate() {
    return (
        <div className="px-6 mb-6">
            <div className="bg-primary-500 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-white mb-6">Почему KindPlate?</h3>
                <div className="grid grid-cols-2 gap-4">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                            <div className="mb-3">
                                {benefit.icon}
                            </div>
                            <p className="text-white text-sm font-medium leading-relaxed">
                                {benefit.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

