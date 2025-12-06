import instagramFooterIcon from "@/figma/instagram-footer.svg";
import gmailFooterIcon from "@/figma/gmail-footer.svg";
import telegramFooterIcon from "@/figma/telegram-footer.svg";
import vkFooterIcon from "@/figma/vk-footer.svg";
import clsx from "clsx";

type SocialLinksProps = {
    circleSize?: number;
    iconSize?: number;
    gap?: number;
    className?: string;
    style?: React.CSSProperties;
};

export function SocialLinks({
    circleSize = 34,
    iconSize = 22,
    gap = 11,
    className,
    style,
}: SocialLinksProps) {
    const circleStyle: React.CSSProperties = {
        width: `${circleSize}px`,
        height: `${circleSize}px`,
        borderRadius: "50%",
        backgroundColor: "#7E879D",
    };

    const iconStyle: React.CSSProperties = {
        width: `${iconSize}px`,
        height: `${iconSize}px`,
        objectFit: "contain",
        display: "block",
    };

    const wrapperStyle: React.CSSProperties = {
        gap: `${gap}px`,
        ...style,
    };

    return (
        <div className={clsx("flex items-center", className)} style={wrapperStyle}>
            <a
                href="#"
                className="flex items-center justify-center transition-opacity hover:opacity-80"
                aria-label="VK"
                style={circleStyle}
            >
                <img src={vkFooterIcon} alt="VK" style={iconStyle} />
            </a>
            <a
                href="#"
                className="flex items-center justify-center transition-opacity hover:opacity-80"
                aria-label="Telegram"
                style={circleStyle}
            >
                <img src={telegramFooterIcon} alt="Telegram" style={iconStyle} />
            </a>
            <a
                href="#"
                className="flex items-center justify-center transition-opacity hover:opacity-80"
                aria-label="Instagram"
                style={circleStyle}
            >
                <img src={instagramFooterIcon} alt="Instagram" style={iconStyle} />
            </a>
            <a
                href="#"
                className="flex items-center justify-center transition-opacity hover:opacity-80"
                aria-label="Email"
                style={circleStyle}
            >
                <img src={gmailFooterIcon} alt="Email" style={iconStyle} />
            </a>
        </div>
    );
}

