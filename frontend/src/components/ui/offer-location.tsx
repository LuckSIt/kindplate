import { MapPin, Navigation } from 'lucide-react';
import { Button } from './button';

interface OfferLocationProps {
  address: string;
  coords: [number, number];
  businessName: string;
  className?: string;
}

export function OfferLocation({
  address,
  coords,
  businessName,
  className = ''
}: OfferLocationProps) {
  const openInYandexMaps = () => {
    const [lat, lng] = coords;
    const url = `https://yandex.ru/maps/?pt=${lng},${lat}&z=16&l=map`;
    window.open(url, '_blank');
  };

  const openInGoogleMaps = () => {
    const [lat, lng] = coords;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {businessName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {address}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={openInYandexMaps}
          variant="outline"
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          Яндекс.Карты
        </Button>
        
        <Button
          onClick={openInGoogleMaps}
          variant="outline"
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          Google Maps
        </Button>
      </div>
    </div>
  );
}

