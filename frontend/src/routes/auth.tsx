import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
    component: RouteComponent,
});

function RouteComponent() {
    // Прозрачная обёртка — login/register имеют свои полноэкранные layouts
    return (
        <div className="w-full min-h-full">
            <Outlet />
        </div>
    )
}
