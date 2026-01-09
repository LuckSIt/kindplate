import type { CSSProperties } from "react";
import { Heart, MapPin, Minimize2, ShoppingBag } from "lucide-react";

const CARD_TEXT_STYLES: CSSProperties = {
    fontWeight: 600,
    fontSize: "13px",
    lineHeight: "0.87em",
    color: "#000019",
};

const ICON_SIZE_PX = 44; // увеличенный размер иконок

const WHY_KIND_PLATE_CARDS = [
    {
        id: "save",
        Icon: ShoppingBag,
        message: "Экономьте\nдо 70% на качественной\nеде",
    },
    {
        id: "waste",
        Icon: Minimize2,
        message: "Уменьшайте\nпищевые потери и CO₂",
    },
    {
        id: "local",
        Icon: MapPin,
        message: "Поддержи-\nвайте местные бизнесы",
    },
    {
        id: "impact",
        Icon: Heart,
        message: "Создавайте\nпозитивное влияние",
    },
];

export function WhyKindPlate() {
    return (
        <section
            data-testid="why-kindplate"
            className="relative mx-auto flex h-[383px] w-[344px] flex-col rounded-[15px]"
            style={{ backgroundColor: "#004900" }}
        >
            <h3
                className="absolute left-[39px] top-[4px] text-center font-montserrat-alt"
                style={{
                    fontWeight: 700,
                    color: "#FFFFFF",
                    fontSize: "23px",
                    lineHeight: "1.08em",
                    width: "267px",
                }}
            >
                Почему KindPlate?
            </h3>

            <div className="absolute left-[32px] top-[68px] grid grid-cols-2 gap-x-[30px] gap-y-[31px]">
                {WHY_KIND_PLATE_CARDS.map(({ id, Icon, message }) => (
                    <div
                        key={id}
                        className="flex h-[122px] w-[122px] flex-col items-center rounded-[15px] bg-[#004900] px-[14px] pt-[15px] text-center"
                    >
                        <span
                            className="mb-0 flex items-center justify-center"
                            style={{ width: ICON_SIZE_PX, height: ICON_SIZE_PX }}
                        >
                            <Icon
                                className="text-[#000019]"
                                strokeWidth={2}
                                style={{
                                    width: ICON_SIZE_PX,
                                    height: ICON_SIZE_PX,
                                }}
                            />
                        </span>
                        <p
                            className="whitespace-pre-line font-montserrat-alt"
                            style={CARD_TEXT_STYLES}
                        >
                            {message}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
