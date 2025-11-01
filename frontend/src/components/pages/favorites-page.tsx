import React, { useMemo, useRef, useState } from 'react';
import { Heart, MapPin, Star, Clock, ArrowLeft, Grid, List, Trash2, CheckSquare, Square } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useFavorites, useRemoveFromFavorites } from '@/lib/hooks/use-favorites';
import { FavoriteButton } from '@/components/ui/favorite-button';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonCard } from '@/components/ui/skeletons';

export function FavoritesPage() {
  const navigate = useNavigate();
  const { data: favorites, isLoading, error } = useFavorites();
  const removeFavorite = useRemoveFromFavorites();

  // UI state
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const touchTimer = useRef<number | null>(null);

  const handleBack = () => {
    navigate({ to: '/home' });
  };

  const handleBusinessClick = (businessId: number) => {
    if (editMode) {
      toggleSelection(businessId);
      return;
    }
    navigate({ to: '/v/$vendorId', params: { vendorId: businessId.toString() } });
  };

  const toggleSelection = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (!favorites) return;
    setSelected(new Set(favorites.map(f => f.id)));
  };

  const clearSelection = () => setSelected(new Set());

  const handleBulkRemove = async () => {
    const ids = Array.from(selected);
    for (const id of ids) {
      await removeFavorite.mutateAsync(id);
    }
    setSelected(new Set());
    setEditMode(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
              role="button"
              tabIndex={0}
              aria-label={favorite.name}
              onKeyDown={(e) => { if (e.key==='Enter' || e.key===' ') { e.preventDefault(); handleBusinessClick(favorite.id);} }}
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Избранное
            </h1>
          </div>
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Избранное
            </h1>
          </div>
          <ErrorState message="Не удалось загрузить список избранных заведений" onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Избранное
            </h1>
          </div>
          <EmptyState title="Пока пусто" description="Добавьте заведения в избранное, чтобы быстро находить их и получать уведомления о новых предложениях" actionLabel="Найти заведения" onAction={handleBack} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 fill-current" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Избранное</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">{favorites.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setView(v => v === 'grid' ? 'list' : 'grid')} className="p-2">
              {view === 'grid' ? <List className="w-5 h-5"/> : <Grid className="w-5 h-5"/>}
            </Button>
            {!editMode ? (
              <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>Редактировать</Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}><CheckSquare className="w-4 h-4"/></Button>
                <Button variant="ghost" size="sm" onClick={clearSelection}><Square className="w-4 h-4"/></Button>
                <Button variant="danger" size="sm" disabled={selected.size===0} onClick={handleBulkRemove}>
                  <Trash2 className="w-4 h-4 mr-1"/> Удалить
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setEditMode(false); setSelected(new Set()); }}>Готово</Button>
              </div>
            )}
          </div>
        </div>

        {/* Favorites List */}
        <div className={cn("gap-3", view === 'grid' ? "grid grid-cols-1 md:grid-cols-2" : "flex flex-col") }>
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className={cn(
                "relative bg-gray-800 rounded-xl border border-gray-700 p-4 cursor-pointer transition-all duration-150 will-change-transform motion-fade-in",
                editMode ? 'ring-0' : 'hover:shadow-lg'
              )}
              onClick={() => handleBusinessClick(favorite.id)}
              onTouchStart={() => {
                if (editMode) return;
                touchTimer.current = window.setTimeout(() => setEditMode(true), 350);
              }}
              onTouchEnd={() => { if (touchTimer.current) { clearTimeout(touchTimer.current); touchTimer.current = null; } }}
              onContextMenu={(e) => { e.preventDefault(); setEditMode(true); }}
            >
              {/* Selection overlay */}
              {editMode && (
                <div className="absolute top-3 right-3 z-10 motion-scale-pop">
                  <div className={cn("w-6 h-6 rounded-md border flex items-center justify-center transition-transform", selected.has(favorite.id) ? 'bg-primary-500 text-white scale-105' : 'bg-gray-900/60 border-gray-600 text-transparent')}>✓</div>
                </div>
              )}
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Logo */}
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-200 to-primary-300 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {favorite.logo_url ? (
                      <img 
                        src={favorite.logo_url} 
                        alt={favorite.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">🏪</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">
                      {favorite.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {favorite.rating?.toFixed(1) || 'Н/Д'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({favorite.total_reviews || 0})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {!editMode && (
                  <FavoriteButton 
                    businessId={favorite.id}
                    size="sm"
                    className="flex-shrink-0"
                  />
                )}
              </div>

              {/* Address */}
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {favorite.address}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    favorite.active_offers > 0 ? 'bg-green-500' : 'bg-gray-400'
                  )} />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {favorite.active_offers > 0 
                      ? `${favorite.active_offers} предложений` 
                      : 'Нет предложений'
                    }
                  </span>
                </div>
                
                {favorite.active_offers > 0 && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Активно</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



