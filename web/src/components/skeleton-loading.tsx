"use client";

export function PoolCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          </div>
          <div className="text-right ml-4">
            <div className="h-8 bg-gray-200 rounded w-20 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>

        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="flex space-x-3">
          <div className="flex-1 h-10 bg-gray-200 rounded"></div>
          <div className="flex-1 h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="animate-pulse mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Pools Section Skeleton */}
        <div className="grid lg:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="bg-gray-50 p-3 rounded-lg">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PoolListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <PoolCardSkeleton key={i} />
      ))}
    </div>
  );
}
