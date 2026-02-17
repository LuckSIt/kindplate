import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";
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

    // Отчёт по переводам: выручка по периодам сб/вс/пн и вт/ср/чт/пт для составления списка переводов
    const { data: transferReportData, isLoading: transferReportLoading } = useQuery({
        queryKey: ["admin", "transfer-report"],
        queryFn: () => axiosInstance.get<{ success: boolean; report: Array<{ id: number; name: string; email: string; monday_transfer_revenue: number; friday_transfer_revenue: number }> }>("/admin/transfer-report"),
        enabled: !!user && user.role === 'admin',
    });
    const transferReport = transferReportData?.data?.report ?? [];

    // Мутация для создания бизнеса
    const createBusinessMutation = useMutation({
        mutationFn: (data) => axiosInstance.post("/admin/register-business", data),
        onSuccess: () => {
            notify.success("Успешно", "Бизнес-аккаунт создан");
            queryClient.invalidateQueries({ queryKey: ["admin", "businesses"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "transfer-report"] });
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
            queryClient.invalidateQueries({ queryKey: ["admin", "transfer-report"] });
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
            <div className="admin-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="admin-page__spinner" />
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="max-w-4xl mx-auto">
                {/* Заголовок */}
                <div className="admin-page__header">
                    <Link to="/account" className="admin-page__back-button" aria-label="Назад">
                        <svg className="w-6 h-6 text-[#111E42]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="admin-page__title">Панель администратора</h1>
                        <p className="admin-page__subtitle">Управление платформой KindPlate</p>
                    </div>
                </div>

                {/* Статистика */}
                <div className="admin-page__stats-grid">
                    <div className="admin-page__stat-card">
                        <div>
                            <p className="admin-page__stat-label">Пользователи</p>
                            <p className="admin-page__stat-value">{stats?.data?.stats?.users || 0}</p>
                        </div>
                        <div className="admin-page__stat-icon">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="admin-page__stat-card">
                        <div>
                            <p className="admin-page__stat-label">Бизнесы</p>
                            <p className="admin-page__stat-value">{stats?.data?.stats?.businesses || 0}</p>
                        </div>
                        <div className="admin-page__stat-icon">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                    <div className="admin-page__stat-card">
                        <div>
                            <p className="admin-page__stat-label">Офферы</p>
                            <p className="admin-page__stat-value">{stats?.data?.stats?.offers || 0}</p>
                        </div>
                        <div className="admin-page__stat-icon">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                        </div>
                    </div>
                    <div className="admin-page__stat-card">
                        <div>
                            <p className="admin-page__stat-label">Заказы</p>
                            <p className="admin-page__stat-value">{stats?.data?.stats?.orders || 0}</p>
                        </div>
                        <div className="admin-page__stat-icon">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Кнопка добавления бизнеса */}
                <button
                    type="button"
                    onClick={() => setShowForm(!showForm)}
                    className="admin-page__add-btn"
                >
                    {showForm ? "Отменить" : "+ Добавить бизнес"}
                </button>

                {/* Форма создания бизнеса */}
                {showForm && (
                    <div className="admin-page__form-card">
                        <h2 className="admin-page__form-title">Создать новый бизнес-аккаунт</h2>
                        <form onSubmit={handleSubmit}>
                            <label className="admin-page__form-label">Название заведения</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="admin-page__form-input"
                                placeholder="Название бизнеса"
                            />
                            <label className="admin-page__form-label">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="admin-page__form-input"
                                placeholder="business@example.com"
                            />
                            <label className="admin-page__form-label">Пароль</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={6}
                                className="admin-page__form-input"
                                placeholder="Минимум 6 символов"
                            />
                            <label className="admin-page__form-label">Адрес</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                required
                                className="admin-page__form-input"
                                placeholder="г. Санкт-Петербург, ул. Примерная, д. 1"
                            />
                            <label className="admin-page__form-label">Широта (опционально)</label>
                            <input
                                type="number"
                                step="0.000001"
                                value={formData.coord_0}
                                onChange={(e) => setFormData({ ...formData, coord_0: parseFloat(e.target.value) || 0 })}
                                className="admin-page__form-input"
                                placeholder="59.9311"
                                style={{ marginBottom: 14 }}
                            />
                            <label className="admin-page__form-label">Долгота (опционально)</label>
                            <input
                                type="number"
                                step="0.000001"
                                value={formData.coord_1}
                                onChange={(e) => setFormData({ ...formData, coord_1: parseFloat(e.target.value) || 0 })}
                                className="admin-page__form-input"
                                placeholder="30.3609"
                            />
                            <button
                                type="submit"
                                disabled={createBusinessMutation.isPending}
                                className="admin-page__submit-btn"
                            >
                                {createBusinessMutation.isPending ? "Создание..." : "Создать бизнес"}
                            </button>
                        </form>
                    </div>
                )}

                {/* Отчёт по переводам */}
                <div className="admin-page__section">
                    <div className="admin-page__section-header">
                        <h2 className="admin-page__section-title">Отчёт по переводам</h2>
                        <p className="admin-page__section-desc">
                            Выручка по периодам: к переводу в понедельник (сб/вс/пн), к переводу в пятницу (вт/ср/чт/пт)
                        </p>
                    </div>
                    {transferReportLoading ? (
                        <div className="admin-page__loading">
                            <span className="admin-page__spinner" />
                            Загрузка…
                        </div>
                    ) : transferReport.length === 0 ? (
                        <div className="admin-page__empty">Нет данных</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="admin-page__table">
                                <thead>
                                    <tr>
                                        <th>Название</th>
                                        <th>Email</th>
                                        <th style={{ textAlign: 'right' }}>К переводу в пн (сб/вс/пн)</th>
                                        <th style={{ textAlign: 'right' }}>К переводу в пт (вт/ср/чт/пт)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transferReport.map((row) => (
                                        <tr key={row.id}>
                                            <td>{row.name}</td>
                                            <td className="admin-page__table-cell--muted">{row.email}</td>
                                            <td style={{ textAlign: 'right' }}>{Number(row.monday_transfer_revenue || 0).toFixed(0)}₽</td>
                                            <td style={{ textAlign: 'right' }}>{Number(row.friday_transfer_revenue || 0).toFixed(0)}₽</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Список бизнесов */}
                <div className="admin-page__section">
                    <div className="admin-page__section-header">
                        <h2 className="admin-page__section-title">Список бизнесов</h2>
                    </div>
                    {businessesLoading ? (
                        <div className="admin-page__loading">
                            <span className="admin-page__spinner" />
                            Загрузка…
                        </div>
                    ) : businesses.length === 0 ? (
                        <div className="admin-page__empty">Нет зарегистрированных бизнесов</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="admin-page__table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Название</th>
                                        <th>Email</th>
                                        <th>Адрес</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {businesses.map((business) => (
                                        <tr key={business.id}>
                                            <td>{business.id}</td>
                                            <td>
                                                <span>{business.name}</span>
                                                {business.is_top && (
                                                    <span style={{ marginLeft: 8, padding: '2px 8px', fontSize: 11, background: 'rgba(234, 179, 8, 0.25)', color: '#facc15', borderRadius: 9999 }}>TOP</span>
                                                )}
                                            </td>
                                            <td className="admin-page__table-cell--muted">{business.email}</td>
                                            <td className="admin-page__table-cell--muted">{business.address}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(business.id, business.name)}
                                                    disabled={deleteBusinessMutation.isPending}
                                                    className="admin-page__delete-btn"
                                                >
                                                    Удалить
                                                </button>
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
