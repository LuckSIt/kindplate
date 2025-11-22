import { Link } from "@tanstack/react-router";
import { Menu, Leaf } from "lucide-react";

export function Header() {
    return (
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <Link to="/" className="flex items-center gap-2">
                <Leaf className="w-6 h-6 text-primary-500" />
                <span className="text-xl font-bold text-white">KindPlate</span>
            </Link>
            <button className="text-white hover:text-primary-500 transition-colors">
                <Menu className="w-6 h-6" />
            </button>
        </div>
    );
}

