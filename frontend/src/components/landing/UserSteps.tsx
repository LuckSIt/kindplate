import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

interface UserStepsProps {
    title?: string;
    subtitle?: string;
    description?: string;
    steps: Array<{ number: string; text: string }>;
    buttonText: string;
    buttonLink: string;
    buttonVariant?: "primary" | "outline";
    variant?: "white" | "dark";
}

export function UserSteps({
    title = "Для пользователей",
    subtitle = "Экономьте и спасайте еду из любимых заведений",
    description,
    steps,
    buttonText,
    buttonLink,
    buttonVariant = "primary",
    variant = "white"
}: UserStepsProps) {
    const bgClass = variant === "white" ? "bg-white" : "bg-slate-800";
    const textClass = variant === "white" ? "text-[#0a1628]" : "text-white";
    const textSecondaryClass = variant === "white" ? "text-gray-700" : "text-white/80";

    return (
        <div className="px-6 mb-6">
            <div className={`${bgClass} rounded-2xl p-6`}>
                <h3 className={`text-lg font-bold ${textClass} mb-2`}>{title}</h3>
                <h4 className={`text-2xl font-bold ${variant === "white" ? textClass : "text-primary-400"} mb-4`}>
                    {subtitle}
                </h4>
                {description && (
                    <p className={`${textSecondaryClass} text-sm mb-6 leading-relaxed`}>
                        {description}
                    </p>
                )}
                <div className="space-y-4 mb-6">
                    {steps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <span className="text-primary-500 font-bold text-lg flex-shrink-0">{step.number}</span>
                            <p className={`${textSecondaryClass} text-sm`}>{step.text}</p>
                        </div>
                    ))}
                </div>
                <Link to={buttonLink}>
                    <Button 
                        variant={buttonVariant}
                        className={`w-full ${buttonVariant === "outline" ? "border-2 border-[#0a1628] text-[#0a1628] hover:bg-[#0a1628] hover:text-white" : "bg-primary-500 hover:bg-primary-600 text-white"} rounded-xl py-3 font-semibold transition-all`}
                    >
                        {buttonText}
                    </Button>
                </Link>
            </div>
        </div>
    );
}

