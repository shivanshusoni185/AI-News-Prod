function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-xl"></div>
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="flex justify-between pt-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
        </div>
      </div>
    </div>
  );
}

export function NewsCardSkeleton() {
  return <LoadingSkeleton />;
}

export function ArticleSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-8"></div>
      <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl mb-8"></div>
      <div className="space-y-4 mb-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export default LoadingSkeleton;
