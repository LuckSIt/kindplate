# 👤 Использование страницы профиля

## Доступ к профилю

Страница профиля доступна по маршруту `/profile`.

## Компоненты

### ProfilePage
Главная страница профиля с формами редактирования.

**Расположение**: `frontend/src/components/pages/profile-page.tsx`

### Hooks

#### useProfile
Получение данных профиля пользователя.

```typescript
import { useProfile } from '@/lib/hooks/use-profile';

const { data: profile, isLoading, error } = useProfile();
```

#### useUpdateProfile
Обновление данных профиля.

```typescript
import { useUpdateProfile } from '@/lib/hooks/use-profile';

const updateProfileMutation = useUpdateProfile();

updateProfileMutation.mutate({
  name: 'Новое имя',
  phone: '+7 999 123 45 67',
});
```

#### useChangePassword
Изменение пароля.

```typescript
import { useChangePassword } from '@/lib/hooks/use-profile';

const changePasswordMutation = useChangePassword();

changePasswordMutation.mutate({
  currentPassword: 'old',
  newPassword: 'new',
  confirmPassword: 'new',
});
```

#### useDeleteAccount
Удаление аккаунта.

```typescript
import { useDeleteAccount } from '@/lib/hooks/use-profile';

const deleteAccountMutation = useDeleteAccount();

deleteAccountMutation.mutate('password');
```

## Валидация

Используется Zod для валидации форм:

### Профиль
```typescript
{
  name: string (2-100 символов),
  phone: string (10-20 символов, опционально),
  address: string (макс. 200 символов, опционально),
  coords: [number, number] (опционально)
}
```

### Пароль
```typescript
{
  currentPassword: string (обязательно),
  newPassword: string (мин. 6 символов),
  confirmPassword: string (должен совпадать с newPassword)
}
```

## Примеры использования

### Навигация к профилю
```typescript
import { useNavigate } from '@tanstack/react-router';

const navigate = useNavigate();
navigate({ to: '/profile' });
```

### Обновление имени
```typescript
const updateProfileMutation = useUpdateProfile();

const handleUpdateName = () => {
  updateProfileMutation.mutate({
    name: 'Новое имя'
  });
};
```

### Изменение пароля
```typescript
const changePasswordMutation = useChangePassword();

const handleChangePassword = () => {
  changePasswordMutation.mutate({
    currentPassword: 'current',
    newPassword: 'new123456',
    confirmPassword: 'new123456'
  }, {
    onSuccess: () => {
      console.log('Пароль изменен');
    }
  });
};
```

## UI Элементы

### Основная информация
- Аватар (градиент с иконкой)
- Имя пользователя
- Email (только для чтения)
- Бейдж "Бизнес-аккаунт" (если применимо)

### Форма редактирования
- Имя (обязательно)
- Email (только для чтения)
- Телефон (опционально)
- Адрес (только для бизнеса)

### Безопасность
- Кнопка "Изменить пароль" → открывает диалог

### Согласия
- Статус принятия оферты
- Статус принятия согласия на ПДн

### Опасная зона
- Кнопка "Удалить аккаунт" → открывает диалог с подтверждением

## Диалоги

### Изменение пароля
```typescript
<Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
  {/* Форма с 3 полями */}
</Dialog>
```

### Удаление аккаунта
```typescript
<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
  {/* Подтверждение с вводом пароля */}
</Dialog>
```

## Уведомления

Все операции показывают уведомления:
- ✅ Успех: "Профиль успешно обновлен"
- ✅ Успех: "Пароль успешно изменен"
- ❌ Ошибка: "Не удалось обновить профиль"

## Состояния загрузки

### Загрузка профиля
```typescript
if (isLoading) {
  return <Skeleton />; // 3 скелетона
}
```

### Обновление профиля
```typescript
<Button disabled={updateProfileMutation.isPending}>
  {updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить'}
</Button>
```

## Обработка ошибок

### Ошибка загрузки
```typescript
if (error) {
  return <ErrorMessage error={error} />;
}
```

### Профиль не найден
```typescript
if (!profile) {
  return <EmptyState message="Профиль не найден" />;
}
```

## Интеграция с другими страницами

### Ссылка на профиль
```typescript
<Link to="/profile">
  <User className="w-5 h-5" />
  Профиль
</Link>
```

### Кнопка профиля в header
```typescript
<Button onClick={() => navigate({ to: '/profile' })}>
  <User className="w-4 h-4 mr-2" />
  Мой профиль
</Button>
```

## Стилизация

Используется Tailwind CSS:
- Градиенты для аватара
- Rounded corners (rounded-2xl)
- Shadows (shadow-sm)
- Dark mode support
- Responsive design

## Доступность

- ARIA labels для диалогов
- Keyboard navigation
- Focus rings
- Screen reader support

## Безопасность

- Пароль требуется для удаления аккаунта
- Текущий пароль требуется для изменения пароля
- Все запросы требуют аутентификации
- Cookie-based session

## Дальнейшие улучшения

- [ ] Загрузка аватара
- [ ] Email верификация
- [ ] Двухфакторная аутентификация
- [ ] История изменений профиля
- [ ] Экспорт данных




