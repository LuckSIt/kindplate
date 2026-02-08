import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useContext, useEffect } from "react";
import { authContext } from "@/lib/auth";
import { LandingPage } from "@/components/pages/LandingPage";

export const Route = createFileRoute("/")({
    component: RootIndex,
});

function RootIndex() {
    const { user, isLoading } = useContext(authContext);
    const navigate = useNavigate();

    // Авторизованных пользователей сразу перенаправляем на /home
    useEffect(() => {
        if (!isLoading && user) {
            navigate({ to: "/home" });
        }
    }, [user, isLoading, navigate]);

    // Пока проверяем авторизацию — ничего не показываем (избегаем мелькания landing)
    if (isLoading) return null;

    // Не авторизован — показываем landing
    return <LandingPage />;
}
