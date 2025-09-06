export default function Loading() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-7 bg-slate-200 rounded-md w-32 animate-pulse"></div>
        <div className="h-9 bg-slate-200 rounded-md w-24 animate-pulse"></div>
      </div>

      {/* Table skeleton */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Table header skeleton */}
          <div className="bg-slate-100 rounded-t-lg">
            <div className="grid grid-cols-12 gap-4 px-6 py-3">
              <div className="col-span-4 h-4 bg-slate-200 rounded animate-pulse"></div>
              <div className="col-span-2 h-4 bg-slate-200 rounded animate-pulse"></div>
              <div className="col-span-1 h-4 bg-slate-200 rounded animate-pulse"></div>
              <div className="col-span-1 h-4 bg-slate-200 rounded animate-pulse"></div>
              <div className="col-span-1 h-4 bg-slate-200 rounded animate-pulse"></div>
              <div className="col-span-3 h-4 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Table body skeleton */}
          <div className="divide-y divide-slate-200">
            {/* Department group skeleton */}
            <div>
              <div className="bg-slate-50 px-6 py-2">
                <div className="h-5 bg-slate-200 rounded w-48 animate-pulse"></div>
              </div>
              
              {/* FAQ rows skeleton */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4">
                  <div className="col-span-4">
                    <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-slate-200 rounded w-3/4 mt-1 animate-pulse"></div>
                  </div>
                  <div className="col-span-2">
                    <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                  <div className="col-span-1">
                    <div className="h-4 bg-slate-200 rounded w-8 animate-pulse"></div>
                  </div>
                  <div className="col-span-1">
                    <div className="h-4 bg-slate-200 rounded w-6 animate-pulse"></div>
                  </div>
                  <div className="col-span-1">
                    <div className="h-4 bg-slate-200 rounded w-6 animate-pulse"></div>
                  </div>
                  <div className="col-span-3 flex justify-end space-x-2">
                    <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Second department group skeleton */}
            <div>
              <div className="bg-slate-50 px-6 py-2">
                <div className="h-5 bg-slate-200 rounded w-40 animate-pulse"></div>
              </div>
              
              {[...Array(2)].map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4">
                  <div className="col-span-4">
                    <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3 mt-1 animate-pulse"></div>
                  </div>
                  <div className="col-span-2">
                    <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                  <div className="col-span-1">
                    <div className="h-4 bg-slate-200 rounded w-8 animate-pulse"></div>
                  </div>
                  <div className="col-span-1">
                    <div className="h-4 bg-slate-200 rounded w-6 animate-pulse"></div>
                  </div>
                  <div className="col-span-1">
                    <div className="h-4 bg-slate-200 rounded w-6 animate-pulse"></div>
                  </div>
                  <div className="col-span-3 flex justify-end space-x-2">
                    <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
