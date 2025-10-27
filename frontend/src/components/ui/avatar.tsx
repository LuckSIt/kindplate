import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  fallback?: string;
  className?: string;
  onClick?: () => void;
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  fallback,
  className = '',
  onClick
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(!!src);

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-6 h-6 text-xs';
      case 'sm':
        return 'w-8 h-8 text-sm';
      case 'md':
        return 'w-10 h-10 text-base';
      case 'lg':
        return 'w-12 h-12 text-lg';
      case 'xl':
        return 'w-16 h-16 text-xl';
      case '2xl':
        return 'w-20 h-20 text-2xl';
      default:
        return 'w-10 h-10 text-base';
    }
  };

  const getShapeClasses = () => {
    return shape === 'circle' ? 'rounded-full' : 'rounded-lg';
  };

  const getInitials = () => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBackgroundColor = () => {
    if (!name) return 'bg-gray-400 dark:bg-gray-600';
    
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const baseClasses = `inline-flex items-center justify-center font-medium text-white ${getSizeClasses()} ${getShapeClasses()} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`;

  if (src && !imageError) {
    return (
      <div className={`relative ${baseClasses}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          </div>
        )}
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className={`w-full h-full object-cover ${getShapeClasses()} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          onClick={onClick}
        />
      </div>
    );
  }

  if (fallback) {
    return (
      <div
        className={`${baseClasses} bg-cover bg-center`}
        style={{ backgroundImage: `url(${fallback})` }}
        onClick={onClick}
      />
    );
  }

  return (
    <div
      className={`${baseClasses} ${getBackgroundColor()}`}
      onClick={onClick}
    >
      {getInitials()}
    </div>
  );
}

interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    name?: string;
    alt?: string;
  }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 3,
  size = 'md',
  shape = 'circle',
  className = ''
}: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          alt={avatar.alt}
          size={size}
          shape={shape}
          className="ring-2 ring-white dark:ring-gray-900"
        />
      ))}
      {remainingCount > 0 && (
        <div className={`inline-flex items-center justify-center font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 ring-2 ring-white dark:ring-gray-900 ${getSizeClasses(size)} ${getShapeClasses(shape)}`}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

interface UserAvatarProps {
  user: {
    id: number;
    name: string;
    email?: string;
    avatar_url?: string;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  showName?: boolean;
  showEmail?: boolean;
  className?: string;
  onClick?: () => void;
}

export function UserAvatar({
  user,
  size = 'md',
  shape = 'circle',
  showName = false,
  showEmail = false,
  className = '',
  onClick
}: UserAvatarProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Avatar
        src={user.avatar_url}
        name={user.name}
        alt={user.name}
        size={size}
        shape={shape}
        onClick={onClick}
      />
      {(showName || showEmail) && (
        <div className="flex flex-col">
          {showName && (
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {user.name}
            </span>
          )}
          {showEmail && user.email && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {user.email}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Вспомогательные функции
function getSizeClasses(size: string) {
  switch (size) {
    case 'xs':
      return 'w-6 h-6 text-xs';
    case 'sm':
      return 'w-8 h-8 text-sm';
    case 'md':
      return 'w-10 h-10 text-base';
    case 'lg':
      return 'w-12 h-12 text-lg';
    case 'xl':
      return 'w-16 h-16 text-xl';
    case '2xl':
      return 'w-20 h-20 text-2xl';
    default:
      return 'w-10 h-10 text-base';
  }
}

function getShapeClasses(shape: string) {
  return shape === 'circle' ? 'rounded-full' : 'rounded-lg';
}



