import React from 'react';
import { X, ChevronLeft, ChevronRight, Download, Share2, Heart, Eye } from 'lucide-react';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  thumbnail?: string;
  caption?: string;
  tags?: string[];
  metadata?: {
    width?: number;
    height?: number;
    size?: string;
    format?: string;
  };
}

interface GalleryProps {
  images: GalleryImage[];
  columns?: number;
  gap?: 'sm' | 'md' | 'lg';
  showThumbnails?: boolean;
  showCaptions?: boolean;
  showMetadata?: boolean;
  showActions?: boolean;
  onImageClick?: (image: GalleryImage, index: number) => void;
  onImageLike?: (image: GalleryImage, index: number) => void;
  onImageDownload?: (image: GalleryImage, index: number) => void;
  onImageShare?: (image: GalleryImage, index: number) => void;
  className?: string;
}

export function Gallery({
  images,
  columns = 3,
  gap = 'md',
  showThumbnails = true,
  showCaptions = true,
  showMetadata = false,
  showActions = true,
  onImageClick,
  onImageLike,
  onImageDownload,
  onImageShare,
  className = ''
}: GalleryProps) {
  const [selectedImage, setSelectedImage] = React.useState<GalleryImage | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(-1);
  const [likedImages, setLikedImages] = React.useState<Set<string>>(new Set());

  const getGapClasses = () => {
    switch (gap) {
      case 'sm':
        return 'gap-2';
      case 'md':
        return 'gap-4';
      case 'lg':
        return 'gap-6';
      default:
        return 'gap-4';
    }
  };

  const getColumnsClasses = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 5:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';
      case 6:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  const handleImageClick = (image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setSelectedIndex(index);
    onImageClick?.(image, index);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setSelectedIndex(-1);
  };

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      setSelectedImage(images[selectedIndex - 1]);
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex < images.length - 1) {
      setSelectedImage(images[selectedIndex + 1]);
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleLike = (image: GalleryImage, index: number) => {
    const newLikedImages = new Set(likedImages);
    if (newLikedImages.has(image.id)) {
      newLikedImages.delete(image.id);
    } else {
      newLikedImages.add(image.id);
    }
    setLikedImages(newLikedImages);
    onImageLike?.(image, index);
  };

  const handleDownload = (image: GalleryImage, index: number) => {
    const link = document.createElement('a');
    link.href = image.src;
    link.download = image.alt || 'image';
    link.click();
    onImageDownload?.(image, index);
  };

  const handleShare = (image: GalleryImage, index: number) => {
    if (navigator.share) {
      navigator.share({
        title: image.alt,
        text: image.caption,
        url: image.src
      });
    } else {
      navigator.clipboard.writeText(image.src);
    }
    onImageShare?.(image, index);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (selectedImage) {
      switch (event.key) {
        case 'Escape':
          handleCloseModal();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    }
  };

  React.useEffect(() => {
    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedImage]);

  return (
    <>
      <div className={`grid ${getColumnsClasses()} ${getGapClasses()} ${className}`}>
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative group cursor-pointer"
            onClick={() => handleImageClick(image, index)}
          >
            <div className="relative overflow-hidden rounded-lg aspect-square">
              <img
                src={showThumbnails && image.thumbnail ? image.thumbnail : image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              
              {/* Actions */}
              {showActions && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(image, index);
                      }}
                      className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          likedImages.has(image.id)
                            ? 'text-red-500 fill-current'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image, index);
                      }}
                      className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
                    >
                      <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(image, index);
                      }}
                      className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
                    >
                      <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Caption */}
            {showCaptions && image.caption && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {image.caption}
                </p>
              </div>
            )}
            
            {/* Metadata */}
            {showMetadata && image.metadata && (
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                {image.metadata.width && image.metadata.height && (
                  <span>{image.metadata.width} × {image.metadata.height}</span>
                )}
                {image.metadata.size && (
                  <span className="ml-2">{image.metadata.size}</span>
                )}
                {image.metadata.format && (
                  <span className="ml-2 uppercase">{image.metadata.format}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full p-4">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  disabled={selectedIndex === 0}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={selectedIndex === images.length - 1}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {/* Image */}
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-full object-contain"
            />

            {/* Caption */}
            {selectedImage.caption && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-4 rounded-lg">
                <p className="text-sm">{selectedImage.caption}</p>
                {selectedImage.tags && selectedImage.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedImage.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white/20 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Counter */}
            {images.length > 1 && (
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

interface GalleryThumbnailProps {
  src: string;
  alt: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function GalleryThumbnail({
  src,
  alt,
  isActive = false,
  onClick,
  className = ''
}: GalleryThumbnailProps) {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden rounded-lg aspect-square transition-all duration-200 ${
        isActive
          ? 'ring-2 ring-primary-500 scale-105'
          : 'hover:scale-105'
      } ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
      {isActive && (
        <div className="absolute inset-0 bg-primary-500/20" />
      )}
    </button>
  );
}

interface GalleryGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function GalleryGrid({
  children,
  columns = 3,
  gap = 'md',
  className = ''
}: GalleryGridProps) {
  const getGapClasses = () => {
    switch (gap) {
      case 'sm':
        return 'gap-2';
      case 'md':
        return 'gap-4';
      case 'lg':
        return 'gap-6';
      default:
        return 'gap-4';
    }
  };

  const getColumnsClasses = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 5:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';
      case 6:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div className={`grid ${getColumnsClasses()} ${getGapClasses()} ${className}`}>
      {children}
    </div>
  );
}

interface GalleryItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function GalleryItem({
  children,
  onClick,
  className = ''
}: GalleryItemProps) {
  return (
    <div
      className={`relative group cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface GalleryOverlayProps {
  children: React.ReactNode;
  className?: string;
}

export function GalleryOverlay({
  children,
  className = ''
}: GalleryOverlayProps) {
  return (
    <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 ${className}`}>
      {children}
    </div>
  );
}

interface GalleryActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function GalleryActions({
  children,
  className = ''
}: GalleryActionsProps) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${className}`}>
      {children}
    </div>
  );
}

interface GalleryCaptionProps {
  children: React.ReactNode;
  className?: string;
}

export function GalleryCaption({
  children,
  className = ''
}: GalleryCaptionProps) {
  return (
    <div className={`mt-2 ${className}`}>
      {children}
    </div>
  );
}

interface GalleryMetadataProps {
  children: React.ReactNode;
  className?: string;
}

export function GalleryMetadata({
  children,
  className = ''
}: GalleryMetadataProps) {
  return (
    <div className={`mt-1 text-xs text-gray-500 dark:text-gray-500 ${className}`}>
      {children}
    </div>
  );
}



