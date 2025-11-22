import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schema";
import { axiosInstance } from "@/lib/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/notifications";
import type { LoginForm } from "@/lib/types";
import arrowBackIcon from "@/figma/arrow-back.svg";

export const Route = createFileRoute("/auth/login/")({
    component: RouteComponent,
});

function RouteComponent() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const methods = useForm({
        resolver: zodResolver(loginSchema),
    });
    const { register, handleSubmit } = methods;
    const { mutate, isPending } = useMutation({
        mutationKey: ["login"],
        mutationFn: (data: LoginForm) => axiosInstance.post("/auth/login/", data),
        onSuccess: (res) => {
            if (res.data.success) {
                notify.success("Успешный вход", "Добро пожаловать!");
                navigate({ to: "/home" });
                queryClient.invalidateQueries(["auth"]);
            } else {
                notify.error("Ошибка входа", "Неверные учетные данные");
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Ошибка входа";
            notify.error("Ошибка входа", message);
        },
    });

    const onSubmit = (toSend) => {
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
                {/* Back Button */}
                <button 
                    className="login-page__back-button"
                    onClick={() => navigate({ to: "/" })}
                    aria-label="Назад"
                >
                    <img 
                        src={arrowBackIcon} 
                        alt="Назад" 
                        className="login-page__back-button-icon"
                    />
                </button>

                {/* Login Card */}
                <div className="login-page__card">
                    {/* Header */}
                    <div className="login-page__header">
                        <h1 className="login-page__title">Войти в аккаунт</h1>
                        <p className="login-page__subtitle">
                            Нету аккаунта?{" "}
                            <Link 
                                to="/auth/register/customer" 
                                className="login-page__link"
                            >
                                Зарегестрируйтесь
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
                        Продолжая, вы соглашаетесь с нашими условиями и политикой конфиденциальности
                    </p>
                </div>
            </div>
        </div>
    );
}
