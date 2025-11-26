import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
    component: RouteComponent,
});

function RouteComponent() {
    // Редиректим на страницу входа, если пользователь зашел на /auth
    return <Navigate to="/auth/login" />;
}
