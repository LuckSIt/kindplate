const WHY_KIND_PLATE_ITEMS = [
    { id: "save", text: "Экономьте до 70% на качественной еде", align: "left" as const },
    { id: "local", text: "Поддерживайте местные бизнесы", align: "right" as const },
    { id: "waste", text: "Уменьшайте пищевые отходы и CO₂", align: "left" as const },
    { id: "impact", text: "Создавайте позитивное влияние", align: "right" as const },
];

export function WhyKindPlate() {
    return (
        <>
            <h3
                className="mb-0 font-bold kp-landing-why-title"
                style={{
                    fontFamily: "Manrope, sans-serif",
                    fontWeight: 700,
                    fontSize: 26,
                    lineHeight: "108%",
                    letterSpacing: 0,
                    color: "#DEF4EE",
                    marginTop: 60,
                }}
            >
                Почему KindPlate?
            </h3>
            <div className="px-4 pt-5 pb-5 mt-[25px]">
                <div
                    className="relative mb-6"
                    style={{ width: "calc(100% + 32px)", marginLeft: -16, marginRight: -16 }}
                >
                    <div
                        className="grain-card manrope kp-landing-why-cards kp-landing-why-two-grains"
                        style={{
                            width: "100%",
                            minHeight: 280,
                            paddingLeft: 24,
                            paddingRight: 24,
                            paddingTop: 28,
                            paddingBottom: 28,
                            boxSizing: "border-box",
                        }}
                    >
                        <div
                            className="flex flex-col relative items-stretch"
                            style={{ gap: 20, zIndex: 20 }}
                        >
                            {WHY_KIND_PLATE_ITEMS.map(({ id, text, align }) => (
                                <div
                                    key={id}
                                    className="kp-landing-why-pill"
                                    style={{
                                        alignSelf: align === "left" ? "flex-start" : "flex-end",
                                        maxWidth: "85%",
                                    }}
                                >
                                    <span className="kp-landing-why-pill-text">{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
