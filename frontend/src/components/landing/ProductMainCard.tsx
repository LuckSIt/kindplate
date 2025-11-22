import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import cinnamonRollImage from "@/figma/90428C7F-3E7E-49B8-81BC-472D67411732 1.png";

export function ProductMainCard() {
    const [quantity, setQuantity] = useState(1);

    const handleDecrease = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleIncrease = () => {
        setQuantity(quantity + 1);
    };

    return (
        <div className="bg-white rounded-3xl p-6 mb-6 relative overflow-hidden shadow-2xl">
            {/* Product Image */}
            <div className="relative h-[500px] rounded-2xl overflow-hidden mb-6">
                <img 
                    src={cinnamonRollImage} 
                    alt="Булочка с корицей"
                    className="w-full h-full object-cover"
                />
            </div>
            
            {/* Product Info */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">Булочка с корицей</p>
                    <p className="text-xs text-gray-500 mb-2">Пекарня / Выпечка</p>
                    <p className="text-3xl font-bold text-primary-500">79₽</p>
                </div>
            </div>
            
            {/* Quantity Selector and Add to Cart */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
                    <button 
                        onClick={handleDecrease}
                        className="text-gray-700 text-xl font-bold hover:text-primary-500 transition-colors"
                        aria-label="Уменьшить количество"
                    >
                        -
                    </button>
                    <span className="text-gray-900 font-bold text-lg mx-2 min-w-[30px] text-center">
                        {quantity}
                    </span>
                    <button 
                        onClick={handleIncrease}
                        className="text-gray-700 text-xl font-bold hover:text-primary-500 transition-colors"
                        aria-label="Увеличить количество"
                    >
                        +
                    </button>
                </div>
                <Link to="/cart" className="flex-1">
                    <Button className="w-full bg-[#0a1628] hover:bg-[#0f172a] text-white rounded-xl py-4 font-semibold text-base transition-all">
                        добавить в заказ
                    </Button>
                </Link>
            </div>
        </div>
    );
}

