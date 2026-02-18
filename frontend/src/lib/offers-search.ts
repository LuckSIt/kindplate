import { axiosInstance } from '@/lib/axiosInstance';
import type { Business, Offer } from '@/lib/types';

export type OffersSearchFilters = {
  q?: string;
  lat?: number;
  lon?: number;
  radius_km?: number;
  pickup_from?: string;
  pickup_to?: string;
  price_min?: number;
  price_max?: number;
  cuisines?: string[];
  diets?: string[];
  allergens?: string[];
  sort?: 'distance' | 'price' | 'rating';
  page?: number;
  limit?: number;
};

export type OfferSearchResult = Offer & {
  business: {
    id: number;
    name: string;
    address?: string;
    coords?: [string, string];
    rating?: number;
    total_reviews?: number;
    logo_url?: string;
    phone?: string;
    working_hours?: string;
    website?: string;
    establishment_type?: string | null;
  };
  distance_km?: number | null;
  location?: {
    id: number;
    name?: string;
    address?: string;
    coords?: [number, number] | null;
  } | null;
};

export type OffersSearchResponse = {
  offers: OfferSearchResult[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
};

const appendNumber = (params: URLSearchParams, key: string, value?: number) => {
  if (value === undefined || value === null) return;
  if (Number.isNaN(value)) return;
  params.append(key, value.toString());
};

const appendArray = (params: URLSearchParams, key: string, values?: string[]) => {
  if (!values || values.length === 0) return;
  values.forEach((value) => params.append(`${key}[]`, value));
};

export const buildOffersSearchParams = (filters: OffersSearchFilters) => {
  const params = new URLSearchParams();

  if (filters.q) params.append('q', filters.q);
  appendNumber(params, 'lat', filters.lat);
  appendNumber(params, 'lon', filters.lon);
  appendNumber(params, 'radius_km', filters.radius_km);
  if (filters.pickup_from) params.append('pickup_from', filters.pickup_from);
  if (filters.pickup_to) params.append('pickup_to', filters.pickup_to);
  appendNumber(params, 'price_min', filters.price_min);
  appendNumber(params, 'price_max', filters.price_max);
  appendArray(params, 'cuisines', filters.cuisines);
  appendArray(params, 'diets', filters.diets);
  appendArray(params, 'allergens', filters.allergens);
  if (filters.sort) params.append('sort', filters.sort);
  appendNumber(params, 'page', filters.page);
  appendNumber(params, 'limit', filters.limit);

  return params;
};

export const fetchOffersSearch = async (
  filters: OffersSearchFilters,
  options?: { skipErrorNotification?: boolean; signal?: AbortSignal }
): Promise<OffersSearchResponse> => {
  const params = buildOffersSearchParams(filters);

  const response = await axiosInstance.get(`/offers/search?${params.toString()}`, {
    signal: options?.signal,
    skipErrorNotification: options?.skipErrorNotification,
  } as any);

  return response.data.data as OffersSearchResponse;
};

export const mapOffersToBusinesses = (offers?: OfferSearchResult[]): Business[] => {
  if (!offers || offers.length === 0) {
    return [];
  }

  const businessMap = new Map<number, Business>();

  offers.forEach((offer) => {
    const businessId = offer.business?.id;
    if (!businessId) return;

    if (!businessMap.has(businessId)) {
      businessMap.set(businessId, {
        id: businessId,
        name: offer.business.name,
        address: offer.business.address,
        coords: offer.business.coords,
        rating: offer.business.rating,
        total_reviews: offer.business.total_reviews,
        logo_url: offer.business.logo_url,
        phone: offer.business.phone,
        working_hours: offer.business.working_hours,
        website: offer.business.website,
        establishment_type: offer.business.establishment_type ?? null,
        offers: [],
        distance_km: offer.distance_km ?? null,
      });
    }

    const business = businessMap.get(businessId)!;
    business.offers = business.offers || [];
    business.offers.push({
      id: offer.id,
      title: offer.title,
      description: offer.description,
      image_url: offer.image_url,
      original_price: offer.original_price,
      discounted_price: offer.discounted_price,
      quantity_available: offer.quantity_available,
      pickup_time_start: offer.pickup_time_start,
      pickup_time_end: offer.pickup_time_end,
      is_active: offer.is_active,
      business_id: businessId,
      created_at: offer.created_at,
    });
  });

  return Array.from(businessMap.values());
};

