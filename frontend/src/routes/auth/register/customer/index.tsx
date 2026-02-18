import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerRegisterSchema } from "@/lib/schema";
import { axiosInstance, tokenStorage } from "@/lib/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/notifications";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { DocumentsModal } from "@/components/ui/documents-modal";
import { useState } from "react";

export const Route = createFileRoute("/auth/register/customer/")({
    component: RouteComponent,
});

function RouteComponent() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const methods = useForm({
        resolver: zodResolver(customerRegisterSchema),
    });
    const { register, handleSubmit } = methods;
    const { mutate, isPending } = useMutation({
        mutationKey: ["register.customer"],
        mutationFn: (data: any) => axiosInstance.post("/auth/register/", data),
        onSuccess: (res) => {
            const tokens = res.data?.tokens;
            if (tokens?.accessToken) tokenStorage.setAccessToken(tokens.accessToken);
            if (tokens?.refreshToken) tokenStorage.setRefreshToken(tokens.refreshToken);
            notify.success("Регистрация успешна", "Добро пожаловать в KindPlate!");
            queryClient.invalidateQueries({ queryKey: ["auth"] });
            navigate({ to: "/home" });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Ошибка регистрации";
            notify.error("Ошибка регистрации", message);
        },
    });

    const onSubmit = (data: any) => {
        const toSend = {
            name: data.name,
            password: data.password,
            email: data.email,
            is_business: false,
        };
        mutate(toSend);
    };

    return (
        <div className="register-page">
            {/* Status Bar (заглушка для мобильного вида) */}
            <div className="register-page__status-bar">
                <div className="register-page__status-bar-time">9:41</div>
                <div className="register-page__status-bar-levels"></div>
                </div>

            {/* Main Container */}
            <div className="register-page__container">
                {/* Register Card */}
                <div className="register-page__card">
                    {/* Back Button */}
                    <button 
                        className="register-page__back-button"
                        onClick={() => (window.history.length > 1 ? window.history.back() : navigate({ to: "/" }))}
                        aria-label="Назад"
                    >
                        <ArrowLeft className="register-page__back-button-icon" size={32} strokeWidth={2} />
                    </button>
                    {/* Header */}
                    <div className="register-page__header">
                        <h1 className="register-page__title">
                            Регистрация
                        </h1>
                        <p className="register-page__subtitle">
                                        Уже есть аккаунт?{" "}
                            <Link 
                                to="/auth/login" 
                                className="register-page__link"
                            >
                                            Войти
                                        </Link>
                                    </p>
                                </div>
                                
                    {/* Form */}
                                <FormProvider {...methods}>
                        <form 
                            onSubmit={handleSubmit(onSubmit)} 
                            className="register-page__form"
                        >
                            {/* Name Field */}
                            <div className="register-page__field">
                                <label className="register-page__field-label">
                                                Ваше ФИО
                                            </label>
                                <div className="register-page__input-wrapper">
                                    <input
                                                {...register("name")} 
                                                type="text" 
                                        className="register-page__input"
                                        placeholder="Иванов Иван Иванович"
                                            />
                                </div>
                                        </div>

                            {/* Email Field */}
                            <div className="register-page__field">
                                <label className="register-page__field-label">
                                                Электронная почта
                                            </label>
                                <div className="register-page__input-wrapper">
                                    <input
                                                {...register("email")} 
                                                type="email" 
                                        className="register-page__input"
                                                placeholder="your@email.com"
                                            />
                                </div>
                                        </div>

                            {/* Password Field */}
                            <div className="register-page__field">
                                <label className="register-page__field-label">
                                                Пароль
                                            </label>
                                <div className="register-page__input-wrapper register-page__input-wrapper--password">
                                    <input
                                                {...register("password")} 
                                                type={showPassword ? "text" : "password"} 
                                        className="register-page__input"
                                                placeholder="Минимум 6 символов"
                                            />
                                    <button
                                        type="button"
                                        className="register-page__password-toggle"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                        </div>

                            {/* Confirm Password Field */}
                            <div className="register-page__field">
                                <label className="register-page__field-label">
                                                Повторите пароль
                                            </label>
                                <div className="register-page__input-wrapper register-page__input-wrapper--password">
                                    <input
                                                {...register("confirmPassword")} 
                                                type={showConfirmPassword ? "text" : "password"} 
                                        className="register-page__input"
                                        placeholder="Повторить пароль"
                                            />
                                    <button
                                        type="button"
                                        className="register-page__password-toggle"
                                        onClick={() => setShowConfirmPassword((v) => !v)}
                                        aria-label={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                        </div>

                            {/* Consent Checkbox */}
                            <div className="register-page__consent">
                                <label className="register-page__consent-label">
                                    <input
                                        {...register("consent")}
                                        type="checkbox"
                                        className="register-page__consent-checkbox"
                                    />
                                    <span className="register-page__consent-text">
                                        Я даю{" "}
                                        <button
                                            type="button"
                                            className="register-page__consent-link"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsDocumentsModalOpen(true);
                                            }}
                                        >
                                            согласие
                                        </button>
                                        {" "}на обработку моих персональных данных в соответствии с{" "}
                                        <button
                                            type="button"
                                            className="register-page__consent-link"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsDocumentsModalOpen(true);
                                            }}
                                        >
                                            политикой конфиденциальности
                                        </button>
                                        , в целях регистрации на сайте и предоставления доступа к личному кабинету.
                                    </span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                            type="submit" 
                                className="register-page__submit-button"
                                            disabled={isPending}
                                        >
                                            {isPending ? (
                                    <div className="register-page__submit-button-loading">
                                        <div className="register-page__spinner"></div>
                                                    Создание...
                                                </div>
                                            ) : (
                                                "Создать аккаунт"
                                            )}
                            </button>
                                    </form>
                                </FormProvider>

                    {/* Footer Text 
                    <p className="register-page__footer-text">
                        Продолжая, вы соглашаетесь с нашими условиями и{" "}
                        <button
                            type="button"
                            className="register-page__footer-link"
                            onClick={() => setIsDocumentsModalOpen(true)}
                        >
                            политикой конфиденциальности
                        </button>
                    </p>*/}
                </div>
            </div>
            
            {/* Documents Modal */}
            <DocumentsModal
                isOpen={isDocumentsModalOpen}
                onClose={() => setIsDocumentsModalOpen(false)}
            />
        </div>
    );
}
