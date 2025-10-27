import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="w-full h-[100vh] flex justify-center items-center bg-gray-300">
            <div className="max-w-[400px] w-full bg-gray-200 p-5 rounded-xl shadow-lg mt-[-150px]">
                <Outlet />
            </div>
        </div>
    );
}
