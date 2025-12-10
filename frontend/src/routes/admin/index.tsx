import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useContext } from "react";
import { authContext } from "@/lib/auth";
import { notify } from "@/lib/notifications";

export const Route = createFileRoute("/admin/")({
    component: AdminPanel,
});

function AdminPanel() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, isLoading: authLoading } = useContext(authContext);
    const [showForm, setShowForm] = useState(false);

    // Форма для регистрации бизнеса
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        password: "",
        address: "",
        coord_0: 59.9311,
        coord_1: 30.3609,
    });

    // Проверка прав доступа
    if (!authLoading && (!user || user.role !== 'admin')) {
        navigate({ to: "/home" });
        return null;
    }

    // Загрузка статистики
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ["admin", "stats"],
        queryFn: () => axiosInstance.get("/admin/stats"),
        enabled: !!user && user.role === 'admin',
    });

    // Загрузка списка бизнесов
    const { data: businessesData, isLoading: businessesLoading } = useQuery({
        queryKey: ["admin", "businesses"],
        queryFn: () => axiosInstance.get("/admin/businesses"),
        enabled: !!user && user.role === 'admin',
    });

    // Мутация для создания бизнеса
    const createBusinessMutation = useMutation({
        mutationFn: (data) => axiosInstance.post("/admin/register-business", data),
        onSuccess: () => {
            notify.success("Успешно", "Бизнес-аккаунт создан");
            queryClient.invalidateQueries({ queryKey: ["admin", "businesses"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
            setShowForm(false);
            setFormData({
                email: "",
                name: "",
                password: "",
                address: "",
                coord_0: 59.9311,
                coord_1: 30.3609,
            });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Ошибка создания бизнеса";
            notify.error("Ошибка", message);
        },
    });

    // Мутация для удаления бизнеса
    const deleteBusinessMutation = useMutation({
        mutationFn: (id: number) => axiosInstance.delete(`/admin/businesses/${id}`),
        onSuccess: () => {
            notify.success("Успешно", "Бизнес удален");
            queryClient.invalidateQueries({ queryKey: ["admin", "businesses"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Ошибка удаления";
            notify.error("Ошибка", message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createBusinessMutation.mutate(formData);
    };

    const handleDelete = (id: number, name: string) => {
        if (window.confirm(`Вы уверены, что хотите удалить бизнес "${name}"?`)) {
            deleteBusinessMutation.mutate(id);
        }
    };

    const businesses = businessesData?.data?.businesses || [];

    if (authLoading || statsLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="w-5 h-5 animate-spin" style={{ border: '2px solid rgba(34, 197, 94, 0.3)', borderTopColor: '#22c55e', borderRadius: '50%' }}></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Заголовок */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Панель администратора
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Управление платформой KindPlate
                    </p>
                </div>

                {/* Статистика */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Пользователи</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {stats?.data?.stats?.users || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Бизнесы</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {stats?.data?.stats?.businesses || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Офферы</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {stats?.data?.stats?.offers || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Заказы</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {stats?.data?.stats?.orders || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Кнопка добавления бизнеса */}
                <div className="mb-8">
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                        {showForm ? "Отменить" : "+ Добавить бизнес"}
                    </Button>
                </div>

                {/* Форма создания бизнеса */}
                {showForm && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Создать новый бизнес-аккаунт
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Название заведения
                                </label>
                                <Input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full"
                                    placeholder="Название бизнеса"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="w-full"
                                    placeholder="business@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Пароль
                                </label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    minLength={6}
                                    className="w-full"
                                    placeholder="Минимум 6 символов"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Адрес
                                </label>
                                <Input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    required
                                    className="w-full"
                                    placeholder="г. Санкт-Петербург, ул. Примерная, д. 1"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Широта (опционально)
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.000001"
                                        value={formData.coord_0}
                                        onChange={(e) => setFormData({ ...formData, coord_0: parseFloat(e.target.value) })}
                                        className="w-full"
                                        placeholder="59.9311"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Долгота (опционально)
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.000001"
                                        value={formData.coord_1}
                                        onChange={(e) => setFormData({ ...formData, coord_1: parseFloat(e.target.value) })}
                                        className="w-full"
                                        placeholder="30.3609"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={createBusinessMutation.isPending}
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-semibold"
                            >
                                {createBusinessMutation.isPending ? "Создание..." : "Создать бизнес"}
                            </Button>
                        </form>
                    </div>
                )}

                {/* Список бизнесов */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Список бизнесов
                        </h2>
                    </div>
                    
                    {businessesLoading ? (
                        <div className="p-8 text-center">
                            <div className="w-5 h-5 animate-spin mx-auto" style={{ border: '2px solid rgba(34, 197, 94, 0.3)', borderTopColor: '#22c55e', borderRadius: '50%' }}></div>
                        </div>
                    ) : businesses.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            Нет зарегистрированных бизнесов
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Название
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Адрес
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Действия
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {businesses.map((business) => (
                                        <tr key={business.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {business.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {business.name}
                                                    </div>
                                                    {business.is_top && (
                                                        <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full">
                                                            TOP
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {business.email}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {business.address}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Button
                                                    onClick={() => handleDelete(business.id, business.name)}
                                                    disabled={deleteBusinessMutation.isPending}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs"
                                                >
                                                    Удалить
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
