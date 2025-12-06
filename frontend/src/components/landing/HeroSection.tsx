import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function HeroSection() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-4xl font-bold text-white leading-tight">
                Выгодно для тебя, полезно для планеты
            </h1>
            <p className="text-white/80 text-base leading-relaxed">
                Соединяем людей с кафе и ресторанами для выгодной и осознанной покупки еды
            </p>
            <div className="flex flex-col gap-3">
                <Link to="/auth/login">
                    <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-2xl py-3 font-semibold text-base transition-all">
                        начать спасать
                    </Button>
                </Link>
                <a href="mailto:kindplate.io@mail.ru" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white rounded-2xl py-3 font-semibold text-base bg-slate-800 transition-all">
                        начать продавать
                    </Button>
                </a>
            </div>
        </div>
    );
}

