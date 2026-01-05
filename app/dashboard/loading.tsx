export default function DashboardLoading() {
  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-9 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-5 w-64 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="h-4 w-24 bg-gray-200 rounded mb-3 animate-pulse"></div>
            <div className="h-8 w-32 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="h-3 w-20 bg-gray-100 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* List Skeleton */}
      <div className="flex flex-col gap-4">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-5 w-48 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

