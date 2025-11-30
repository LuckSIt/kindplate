// Базовые типы API
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

// Пользователь
export type User = {
  id: number;
  name: string;
  email: string;
  is_business: boolean;
  role?: 'admin' | 'business' | 'customer';
  phone?: string;
  address?: string;
  coords?: [number, number];
  rating?: number;
  total_reviews?: number;
  logo_url?: string;
  terms_accepted?: boolean;
  privacy_accepted?: boolean;
  profile_updated_at?: string;
  created_at?: string;
}

// Профиль пользователя (расширенный тип)
export type UserProfile = User & {
  terms_accepted: boolean;
  privacy_accepted: boolean;
  profile_updated_at: string;
  created_at: string;
}

// Метрики качества продавца
export type QualityMetrics = {
  total_orders: number;
  completed_orders: number;
  repeat_customers: number;
  avg_rating: number;
}

// Бизнес/Заведение
export type Business = {
  id: number;
  name: string;
  address?: string;
  coords?: [string, string]; // [lat, lon] as strings from API
  rating?: number;
  total_reviews?: number;
  logo_url?: string;
  phone?: string;
  offers?: Offer[];
  is_top?: boolean; // Флаг "Лучшие у нас"
  quality_score?: number; // Балл качества (0-100)
  quality_metrics?: QualityMetrics; // Детальные метрики
  badges?: Array<{
    key: string;
    awarded_at?: string;
    expires_at?: string | null;
    metadata?: Record<string, any>;
  }>; // Бейджи качества
}

// Предложение
export type Offer = {
  id: number;
  business_id: number;
  title: string;
  description?: string;
  image_url?: string;
  original_price: number;
  discounted_price: number;
  quantity_available: number;
  pickup_time_start: string;
  pickup_time_end: string;
  is_active: boolean;
  is_best?: boolean; // Лучшие предложения
  created_at: string;
  updated_at?: string;
  discount_percent?: number;
}

// Элемент заказа
export type OrderItem = {
  id?: number;
  title: string;
  quantity: number;
  price: number;
  price_cents?: number; // Для обратной совместимости
}

// Заказ
export type Order = {
  id: number;
  offer_id: number;
  customer_id: number;
  business_id: number;
  quantity: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  pickup_code: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  updated_at?: string;
  // Дополнительные поля из JOIN запросов
  title?: string;
  description?: string;
  offer_image_url?: string;
  pickup_time_start?: string;
  pickup_time_end?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  business_name?: string;
  business_address?: string;
  order_items?: OrderItem[];
  items?: OrderItem[]; // Для обратной совместимости
}

// Отзыв
export type Review = {
  id: number;
  order_id?: number;
  customer_id: number;
  business_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  customer_name?: string;
}

// Заведение с предложениями
export type Seller = {
  id: number;
  name: string;
  email: string;
  address: string;
  coords: [number, number];
  rating: number;
  total_reviews: number;
  logo_url?: string;
  offers: Offer[];
}

// Статистика
export type BusinessStats = {
  total_revenue: number;
  orders_count: number;
  completed_orders: number;
  unique_customers: number;
  avg_check: number;
  top_offers: Array<{
    title: string;
    orders_count: number;
    revenue: number;
  }>;
  status_stats: Array<{
    status: string;
    count: number;
  }>;
  chart_data: Array<{
    day: string;
    orders: number;
    revenue: number;
  }>;
}

// Формы
export type LoginForm = {
  email: string;
  password: string;
}

export type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  is_business: boolean;
  address?: string;
  coords?: [number, number];
}

export type OfferForm = {
  title: string;
  description?: string;
  original_price: number;
  discounted_price: number;
  quantity_available: number;
  pickup_time_start: string;
  pickup_time_end: string;
}

// Ошибки API
export type ApiError = {
  success: false;
  error: string;
  message?: string;
  details?: any;
}

// Состояния загрузки
export type LoadingState = {
  isLoading: boolean;
  error: string | null;
}

// Фильтры и поиск
export type SearchFilters = {
  query?: string;
  maxDistance?: number;
  minRating?: number;
  priceRange?: [number, number];
  categories?: string[];
}

// Настройки карты
export type MapSettings = {
  center: [number, number];
  zoom: number;
  showUserLocation: boolean;
  showOffers: boolean;
}

// Утилиты форматирования
export function formatPrice(cents: number): string {
  // Если цена в центах (больше 100), делим на 100
  const rubles = cents >= 1000 ? Math.round(cents / 100) : cents;
  return `${rubles.toLocaleString('ru-RU')}₽`;
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    // Если сегодня
    if (daysDiff === 0) {
      return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // Если вчера
    if (daysDiff === 1) {
      return `Вчера в ${date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
    
    // Если на этой неделе
    if (daysDiff < 7) {
      return date.toLocaleDateString('ru-RU', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // Иначе полная дата
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}