export interface Business {
  id: number;
  name: string;
  address?: string;
  coord_0?: number;
  coord_1?: number;
}

export interface Offer {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  original_price: number;
  discounted_price: number;
  quantity_available: number;
  pickup_time_start?: string;
  pickup_time_end?: string;
}

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
  address: string;
  coords: [string, string]; // [lat, lon] as strings from API
  rating?: number;
  total_reviews?: number;
  logo_url?: string;
  phone?: string;
  offers: Offer[];
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
