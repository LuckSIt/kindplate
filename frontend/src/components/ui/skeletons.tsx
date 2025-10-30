interface SkeletonProps { className?: string }

export function SkeletonLine({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />;
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="flex-1 min-w-0 space-y-2">
          <SkeletonLine className="h-4 w-2/3" />
          <SkeletonLine className="h-3 w-1/2" />
        </div>
        <div className="w-8 h-8 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>
      <div className="mt-4 space-y-2">
        <SkeletonLine className="h-3 w-full" />
        <SkeletonLine className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function OfferSkeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-white dark:bg-gray-900 ${className}`}>
      <div className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse" />
      <div className="p-4 space-y-3">
        <SkeletonLine className="h-6 w-3/4" />
        <SkeletonLine className="h-4 w-1/2" />
        <SkeletonLine className="h-24 w-full" />
      </div>
    </div>
  );
}


