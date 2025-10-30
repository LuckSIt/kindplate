import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/checkout/success")({
  component: SuccessPage,
});

function SuccessPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-6 text-center">
      <div className="max-w-sm w-full">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <svg className="w-12 h-12 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Заказ оформлен</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Мы отправили чек на вашу почту. Покажите код при получении заказа.</p>
        <Button className="w-full" onClick={() => navigate({ to: "/home" })}>На главную</Button>
      </div>
    </div>
  );
}

