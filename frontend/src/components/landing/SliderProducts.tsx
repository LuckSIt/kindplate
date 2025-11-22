import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
    id: string;
    name: string;
    price: string;
    emoji: string;
}

const products: Product[] = [
    { id: "1", name: "Салат с авокадо", price: "159₽", emoji: "🥗" },
    { id: "2", name: "Круассан с беконом", price: "139₽", emoji: "🥐" },
    { id: "3", name: "Чиабатта 3шт.", price: "99₽", emoji: "🥖" },
    { id: "4", name: "Пепперони пицца", price: "279₽", emoji: "🍕" },
    { id: "5", name: "Печенье с шоколадом", price: "99₽", emoji: "🍪" }
];

export function SliderProducts() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    };

    useEffect(() => {
        checkScroll();
        const scrollContainer = scrollRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
        }
        return () => {
            if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', checkScroll);
            }
            window.removeEventListener('resize', checkScroll);
        };
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = 240; // card width + gap
        const currentScroll = scrollRef.current.scrollLeft;
        const newScroll = direction === 'left' 
            ? currentScroll - scrollAmount 
            : currentScroll + scrollAmount;
        
        scrollRef.current.scrollTo({
            left: newScroll,
            behavior: 'smooth'
        });
    };

    return (
        <div className="relative">
            {/* Scroll Buttons */}
            {canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center text-white transition-all"
                    aria-label="Прокрутить влево"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            )}
            {canScrollRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center text-white transition-all"
                    aria-label="Прокрутить вправо"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            )}

            {/* Products Slider */}
            <div 
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide scroll-smooth"
                style={{
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="flex-shrink-0 w-[200px] cursor-pointer group"
                        style={{ scrollSnapAlign: 'start' }}
                    >
                        <div className="w-full h-[200px] bg-white rounded-2xl mb-3 flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300">
                            <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                                {product.emoji}
                            </span>
                        </div>
                        <p className="text-white text-sm font-medium text-center mb-1">
                            {product.name}
                        </p>
                        <p className="text-white text-base font-bold text-center">
                            {product.price}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

