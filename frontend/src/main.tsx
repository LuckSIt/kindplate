import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// PWA SW отключен

import "./styles.css";

// Глобальный компонент ошибки, чтобы не показывать стандартную «лупу» TanStack Router
function AppErrorComponent({ error }: { error: unknown }) {
    if (import.meta.env.DEV && error) {
        // eslint-disable-next-line no-console
        console.error("Route error:", error);
    }

    return (
        <div className="min-h-[260px] flex flex-col items-center justify-center px-6 py-8 bg-slate-900 text-center">
            <p className="text-sm text-slate-100 font-medium">
                Произошла ошибка при загрузке страницы.
            </p>
            <p className="mt-2 text-xs text-slate-400 max-w-xs">
                Пожалуйста, обновите страницу. Если проблема повторяется, напишите в поддержку.
            </p>
        </div>
    );
}

// Create a new router instance
const router = createRouter({
    routeTree,
    context: {},
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
    // Заменяем стандартный error‑экран с огромной лупой на наш аккуратный компонент
    defaultErrorComponent: AppErrorComponent as any,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

// Принудительно применяем темную тему
document.documentElement.classList.add('dark');
localStorage.setItem('theme', 'dark');

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<RouterProvider router={router} />);
}

// Service Worker registration removed to avoid stale caches in production
