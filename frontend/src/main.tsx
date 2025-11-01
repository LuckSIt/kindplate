import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// PWA SW отключен

import "./styles.css";

// Create a new router instance
const router = createRouter({
    routeTree,
    context: {},
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
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
