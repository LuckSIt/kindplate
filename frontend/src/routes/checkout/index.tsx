import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/checkout/")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();

  // Cart
  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await axiosInstance.get("/customer/cart");
      return res.data.data || [];
    },
  });

  const subtotal = useMemo(
    () => (cartData || []).reduce((s: number, it: any) => s + it.offer.discounted_price * it.quantity, 0),
    [cartData]
  );
  const serviceFee = Math.round(subtotal * 0.05);
  const total = Math.round(subtotal + serviceFee);

  // Avoid iOS zoom: base text size >= 16px
  useEffect(() => {
    document.documentElement.style.setProperty("--kp-input-font-size", "16px");
    return () => document.documentElement.style.removeProperty("--kp-input-font-size");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sticky top summary */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate({ to: "/cart" })} className="text-sm text-gray-600 dark:text-gray-300">Назад</button>
          <div className="text-base font-semibold text-gray-900 dark:text-white">Итого: {total}₽</div>
          <a href="#pay" className="text-sm text-primary-600">К оплате</a>
        </div>
      </div>

      {/* Anchored steps */}
      <div className="px-4 pb-28 space-y-8">
        {/* Steps nav */}
        <nav className="sticky top-12 z-30 py-2 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur">
          <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-300 overflow-x-auto no-scrollbar">
            <a href="#contact" className="px-3 py-1 rounded-full bg-gray-200/60 dark:bg-gray-700/60">Контакты</a>
            <a href="#pickup" className="px-3 py-1 rounded-full bg-gray-200/60 dark:bg-gray-700/60">Самовывоз</a>
            <a href="#payment" className="px-3 py-1 rounded-full bg-gray-200/60 dark:bg-gray-700/60">Оплата</a>
          </div>
        </nav>

        {/* Contact */}
        <section id="contact" className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Контактные данные</h2>
          <div className="space-y-3">
            <Input inputMode="text" className="text-base" placeholder="Имя" style={{ fontSize: "var(--kp-input-font-size)" }} />
            <Input inputMode="email" className="text-base" placeholder="Email" style={{ fontSize: "var(--kp-input-font-size)" }} />
            <Input inputMode="tel" className="text-base" placeholder="Телефон" style={{ fontSize: "var(--kp-input-font-size)" }} />
          </div>
        </section>

        {/* Pickup */}
        <section id="pickup" className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Самовывоз</h2>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Заберите заказ в выбранном заведении в интервале, указанном в предложении.
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            {(cartData || []).map((it: any) => (
              <div key={it.offer.id} className="flex items-center justify-between py-2 text-sm">
                <div className="truncate pr-2">
                  <div className="font-semibold text-gray-900 dark:text-white truncate">{it.offer.title}</div>
                  <div className="text-gray-500 dark:text-gray-400">× {it.quantity}</div>
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">{Math.round(it.offer.discounted_price * it.quantity)}₽</div>
              </div>
            ))}
          </div>
        </section>

        {/* Payment */}
        <section id="payment" className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Способ оплаты</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <input type="radio" name="pay" defaultChecked className="w-5 h-5" />
              <span className="text-sm">Картой онлайн</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <input type="radio" name="pay" className="w-5 h-5" />
              <span className="text-sm">СБП</span>
            </label>
          </div>
        </section>
      </div>

      {/* Sticky bottom summary */}
      <div id="pay" className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-700 pb-safe">
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Товары</span>
            <span className="text-gray-900 dark:text-white">{Math.round(subtotal)}₽</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Сервисный сбор</span>
            <span className="text-gray-900 dark:text-white">{serviceFee}₽</span>
          </div>
          <div className="flex items-center justify-between text-lg font-semibold">
            <span className="text-gray-900 dark:text-white">Итого</span>
            <span className="text-gray-900 dark:text-white">{total}₽</span>
          </div>
          <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 text-lg font-semibold"
            onClick={() => navigate({ to: "/checkout/success" })}
          >
            Оплатить
          </Button>
        </div>
      </div>
    </div>
  );
}

