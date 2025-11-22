import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import cinnamonRollImage from "@/figma/90428C7F-3E7E-49B8-81BC-472D67411732 1.png";
import saladImage from "@/figma/4A8982E1-D5E6-4397-803C-713423EA08C3 1.png";
import croissantImage from "@/figma/740E9EA4-6631-4323-80F3-0B84AA6F61B9 1 (1).png";
import ciabattaImage from "@/figma/C4B41631-5FC6-4D7A-91CE-6E3D6B94E9A0 1.png";
import pizzaImage from "@/figma/762ADCA2-E303-44E5-B6E0-272EE15C6913 1.png";
import cookieImage from "@/figma/29BD33A8-EE31-48BF-A53C-02BC08740634 1.png";

interface Product {
    id: string;
    name: string;
    price: string;
    image: string;
    category?: string;
}

const products: Product[] = [
    { id: "1", name: "Булочка с корицей", price: "79₽", image: cinnamonRollImage, category: "Пекарня / Выпечка" },
    { id: "2", name: "Салат с авокадо", price: "159₽", image: saladImage, category: "Кафе / готовая еда" },
    { id: "3", name: "Круассан с беконом", price: "139₽", image: croissantImage, category: "Кафе / готовая еда" },
    { id: "4", name: "Чиабатта 3шт.", price: "99₽", image: ciabattaImage, category: "Пекарня / хлеб" },
    { id: "5", name: "Пепперони пицца", price: "279₽", image: pizzaImage, category: "Кафе / готовая еда" },
    { id: "6", name: "Печенье с шоколадом", price: "99₽", image: cookieImage, category: "Пекарня / кондитерское изделие" }
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
        const scrollAmount = 256; // card width (240px) + gap (16px)
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
            {/* Section Title */}
            <h2 className="text-white text-2xl font-bold mb-6">Еда</h2>
            
            {/* Products Slider Container */}
            <div className="relative">
                {/* Scroll Buttons */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-2 top-[172px] z-10 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center text-white transition-all shadow-lg"
                        aria-label="Прокрутить влево"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}
                {canScrollRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-2 top-[172px] z-10 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center text-white transition-all shadow-lg"
                        aria-label="Прокрутить вправо"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}

                {/* Products Slider */}
                <div 
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide scroll-smooth px-1"
                    style={{
                        scrollSnapType: 'x mandatory',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="flex-shrink-0 w-[240px] cursor-pointer group"
                        style={{ scrollSnapAlign: 'start' }}
                    >
                        <div className="relative w-full aspect-square rounded-2xl mb-3 overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                            <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-md">
                            <p className="text-gray-900 text-sm font-semibold text-center mb-1">
                                {product.name}
                            </p>
                            <p className="text-primary-600 text-base font-bold text-center">
                                {product.price}
                            </p>
                            {product.category && (
                                <p className="text-gray-500 text-xs text-center mt-1">
                                    {product.category}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}

