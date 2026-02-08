import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useContext, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schema";
import { axiosInstance, tokenStorage } from "@/lib/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/notifications";
import type { LoginForm } from "@/lib/types";
import arrowBackIcon from "@/figma/arrow-back.svg";
import { DocumentsModal } from "@/components/ui/documents-modal";
import { authContext } from "@/lib/auth";

export const Route = createFileRoute("/auth/login/")({
    component: RouteComponent,
});

function RouteComponent() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useContext(authContext);
    const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);

    // Если пользователь уже авторизован — перенаправляем на главную.
    // Это критично для iOS PWA: предыдущий interceptor мог сохранить URL /auth/login,
    // и PWA при открытии попадает сюда, даже если сессия валидна.
    useEffect(() => {
        if (!authLoading && user) {
            console.log('🔄 Login page: user already authenticated, redirecting to /home');
            navigate({ to: "/home" });
        }
    }, [user, authLoading, navigate]);
    const methods = useForm({
        resolver: zodResolver(loginSchema),
    });
    const { register, handleSubmit } = methods;
    const { mutate, isPending } = useMutation({
        mutationKey: ["login"],
        mutationFn: (data: LoginForm) => axiosInstance.post("/auth/login/", data),
        onSuccess: (res) => {
            if (res.data.success) {
                // Сохраняем токены, если они есть (для мобильных браузеров без cookie)
                const tokens = (res.data as any).tokens;
                if (tokens?.accessToken) {
                    tokenStorage.setAccessToken(tokens.accessToken);
                }
                if (tokens?.refreshToken) {
                    tokenStorage.setRefreshToken(tokens.refreshToken);
                }

                notify.success("Успешный вход", "Добро пожаловать!");
                // Принудительно обновляем данные пользователя
                queryClient.invalidateQueries({ queryKey: ["auth"] });
                queryClient.refetchQueries({ queryKey: ["auth"] });
                // Небольшая задержка перед навигацией, чтобы данные успели обновиться
                setTimeout(() => {
                    navigate({ to: "/home" });
                }, 100);
            } else {
                notify.error("Ошибка входа", "Неверные учетные данные");
            }
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || "Ошибка входа";
            notify.error("Ошибка входа", message);
        },
    });

    const onSubmit = (toSend: LoginForm) => {
        mutate(toSend);
    };

    return (
        <div className="login-page">
            {/* Status Bar (заглушка для мобильного вида) */}
            <div className="login-page__status-bar">
                <div className="login-page__status-bar-time">9:41</div>
                <div className="login-page__status-bar-levels"></div>
            </div>

            {/* Main Container */}
            <div className="login-page__container">
                {/* Login Card */}
                <div className="login-page__card">
                    {/* Back Button */}
                    <button 
                        className="login-page__back-button"
                        onClick={() => (window.history.length > 1 ? window.history.back() : navigate({ to: "/" }))}
                        aria-label="Назад"
                    >
                        <img 
                            src={arrowBackIcon} 
                            alt="Назад" 
                            className="login-page__back-button-icon"
                        />
                    </button>
                    {/* Header */}
                    <div className="login-page__header">
                        <h1 className="login-page__title">Войти в аккаунт</h1>
                        <p className="login-page__subtitle">
                            Нет аккаунта?{" "}
                            <Link 
                                to="/auth/register/customer" 
                                className="login-page__link"
                            >
                                Зарегистрируйтесь
                            </Link>
                        </p>
                    </div>

                    {/* Form */}
                    <FormProvider {...methods}>
                        <form 
                            onSubmit={handleSubmit(onSubmit)} 
                            className="login-page__form"
                        >
                            {/* Email Field */}
                            <div className="login-page__field">
                                <label className="login-page__field-label">
                                    Электронная почта
                                </label>
                                <div className="login-page__input-wrapper">
                                    <input
                                        {...register("email")}
                                        type="email"
                                        className="login-page__input"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="login-page__field">
                                <label className="login-page__field-label">
                                    Пароль
                                </label>
                                <div className="login-page__input-wrapper">
                                    <input
                                        {...register("password")}
                                        type="password"
                                        className="login-page__input"
                                        placeholder="Минимум 6 символов"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="login-page__submit-button"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <div className="login-page__submit-button-loading">
                                        <div className="login-page__spinner"></div>
                                        Вход...
                                    </div>
                                ) : (
                                    "Войти"
                                )}
                            </button>
                        </form>
                    </FormProvider>

                    {/* Footer Text */}
                    <p className="login-page__footer-text">
                        Продолжая, вы соглашаетесь с нашими условиями и{" "}
                        <button
                            type="button"
                            className="login-page__footer-link"
                            onClick={() => setIsDocumentsModalOpen(true)}
                        >
                            политикой конфиденциальности
                        </button>
                    </p>
                </div>
            </div>

            <DocumentsModal
                isOpen={isDocumentsModalOpen}
                onClose={() => setIsDocumentsModalOpen(false)}
            />
        </div>
    );
}
