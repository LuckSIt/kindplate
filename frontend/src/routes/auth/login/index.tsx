import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import InputWrapper from "@/components/form/inputWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schema";
import { axiosInstance } from "@/lib/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/notifications";
import type { LoginForm } from "@/lib/types";

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
        <>
            {/* Шапка */}
            <header className="fixed top-0 left-0 right-0 bg-slate-900 dark:bg-gray-900 border-b border-slate-800 dark:border-gray-800 z-50">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3">
                            <img src="/kandlate.png" alt="KindPlate" className="w-8 h-8" />
                            <span className="text-xl font-bold text-white">KindPlate</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Форма входа */}
            <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
            {/* Декоративные элементы */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200/20 dark:bg-primary-800/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-300/20 dark:bg-primary-700/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-400/10 dark:bg-primary-600/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="relative z-10 h-full w-full flex items-center justify-center p-4">
                <div className="w-full max-w-lg mx-auto px-6">
                    {/* Форма авторизации по центру */}
                    <div className="w-full">
                        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center mb-6">
                                    <img src="/kandlate.png" alt="KindPlate" className="w-16 h-16" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                                        KindPlate
                                    </span>
                                </h1>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Вход в аккаунт</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Нет аккаунта?{" "}
                                    <Link to="/auth/register/customer" className="text-primary-600 hover:text-primary-500 font-semibold transition-colors">
                                        Зарегистрироваться
                                    </Link>
                                </p>
                            </div>
                            
                            <FormProvider {...methods}>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div>
                                        <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                            Электронная почта
                                        </label>
                                        <Input 
                                            {...register("email")} 
                                            type="email" 
                                            className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 py-3 px-4"
                                            placeholder="your@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                            Пароль
                                        </label>
                                        <Input 
                                            {...register("password")} 
                                            type="password" 
                                            className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 py-3 px-4"
                                            placeholder="Введите пароль"
                                        />
                                    </div>

                                    <Button 
                                        type="submit" 
                                        className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] py-3"
                                        disabled={isPending}
                                    >
                                        {isPending ? (
                                            <div className="flex items-center justify-center">
                                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                                                Вход...
                                            </div>
                                        ) : (
                                            "Войти в аккаунт"
                                        )}
                                    </Button>
                                </form>
                            </FormProvider>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}