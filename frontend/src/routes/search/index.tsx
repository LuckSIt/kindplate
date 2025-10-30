import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import type { Business, Offer } from "@/lib/types";
import { OffersFeed } from "@/components/ui/offers-feed";

export const Route = createFileRoute("/search/")({
  component: SearchPage,
});

function SearchPage() {
  const [query, setQuery] = useState("");

  const { data } = useQuery({
    queryKey: ["sellers", "all"],
    queryFn: async () => {
      const res = await axiosInstance.get('/customer/sellers');
      return res.data.sellers || [];
    },
    staleTime: 30_000,
  });

  const businesses: Business[] = useMemo(() => {
    const sellers = data || [];
    return sellers.map((s: any) => ({
      id: s.id,
      name: s.name,
      address: s.address,
      coords: s.coords,
      rating: s.rating,
      logo_url: s.logo_url,
      phone: s.phone,
      offers: (s.offers || []) as Offer[],
    }));
  }, [data]);

  const filteredBusinesses = useMemo(() => {
    if (!query) return businesses;
    const q = query.toLowerCase();
    return businesses
      .map(b => ({
        ...b,
        offers: (b.offers || []).filter(o =>
          (o.title || '').toLowerCase().includes(q) || (o.description || '').toLowerCase().includes(q)
        )
      }))
      .filter(b => (b.offers || []).length > 0 || b.name.toLowerCase().includes(q) || (b.address || '').toLowerCase().includes(q));
  }, [businesses, query]);

  useEffect(() => {
    // autofocus when route opens
    const el = document.getElementById('kp-search-input') as HTMLInputElement | null;
    el?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="relative">
          <input
            id="kp-search-input"
            type="search"
            placeholder="Поиск по заведениям и предложениям"
            className="w-full px-3 py-2 pl-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"/></svg>
        </div>
      </div>

      <div className="p-3">
        <OffersFeed businesses={filteredBusinesses} onOfferClick={() => {}} />
      </div>
    </div>
  );
}

