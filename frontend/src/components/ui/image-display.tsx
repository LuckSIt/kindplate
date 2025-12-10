import React from 'react';
import { Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageDisplayProps {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  loading?: 'lazy' | 'eager';
  onError?: () => void;
  onLoad?: () => void;
}

export function ImageDisplay({
  src,
  alt,
  fallback,
  className = '',
  objectFit = 'cover',
  loading = 'lazy',
  onError,
  onLoad
}: ImageDisplayProps) {
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  if (imageError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
        {fallback ? (
          <img
            src={fallback}
            alt={alt}
            className="w-full h-full object-cover"
            onError={handleError}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
            <ImageIcon className="w-8 h-8 mb-2" />
            <span className="text-sm">Изображение недоступно</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="w-5 h-5 animate-spin" style={{ border: '2px solid rgba(22, 163, 74, 0.3)', borderTopColor: '#16a34a', borderRadius: '50%' }}></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-${objectFit} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
}

interface ImageGalleryProps {
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  className?: string;
}

export function ImageGallery({
  images,
  currentIndex,
  onIndexChange,
  className = ''
}: ImageGalleryProps) {
  if (images.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
          <ImageIcon className="w-8 h-8 mb-2" />
          <span className="text-sm">Нет изображений</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <ImageDisplay
        src={images[currentIndex]}
        alt={`Изображение ${currentIndex + 1}`}
        className="w-full h-full"
      />
      
      {images.length > 1 && (
        <>
          <button
            onClick={() => onIndexChange((currentIndex - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => onIndexChange((currentIndex + 1) % images.length)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          >
            →
          </button>
          
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => onIndexChange(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex
                    ? 'bg-white'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ImageUpload({
  onImageSelect,
  accept = 'image/*',
  multiple = false,
  className = '',
  children
}: ImageUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (multiple) {
        Array.from(files).forEach(onImageSelect);
      } else {
        onImageSelect(files[0]);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />
      <div onClick={handleClick} className="cursor-pointer">
        {children || (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 transition-colors">
            <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-600 mb-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Нажмите для выбора изображения
            </span>
          </div>
        )}
      </div>
    </div>
  );
}



