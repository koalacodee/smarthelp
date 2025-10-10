export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6 relative overflow-hidden">
      {/* Background Animation Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-400/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-400/10 rounded-full blur-2xl animate-pulse"></div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header skeleton */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl animate-pulse">
            <div className="w-10 h-10 bg-white/20 rounded-md animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <div className="h-10 bg-gradient-to-r from-slate-200 to-slate-300 rounded-md w-96 mx-auto animate-pulse"></div>
            <div className="h-5 bg-slate-200 rounded-md w-80 mx-auto animate-pulse"></div>
          </div>
          <div className="flex justify-center gap-4">
            <div className="h-4 bg-slate-200 rounded-md w-32 animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded-md w-36 animate-pulse"></div>
          </div>
        </div>

        {/* Performance Table skeleton */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl animate-pulse"></div>
            <div className="h-6 bg-slate-200 rounded-md w-48 animate-pulse"></div>
            <div className="h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-8 animate-pulse"></div>
          </div>

          <div className="overflow-x-auto">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm">
              <div className="bg-gradient-to-r from-slate-50/80 to-slate-100/50 px-8 py-5">
                <div className="grid grid-cols-7 gap-8">
                  <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                </div>
              </div>

              <div className="divide-y divide-slate-200/50">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="px-8 py-5">
                    <div className="grid grid-cols-7 gap-8">
                      <div className="h-5 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-5 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-5 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-5 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-5 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-5 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-5 bg-slate-200 rounded animate-pulse w-full">
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-slate-300 rounded-full h-3"></div>
                          <div className="w-12 h-4 bg-slate-300 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Report skeleton */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl animate-pulse"></div>
            <div className="h-6 bg-slate-200 rounded-md w-36 animate-pulse"></div>
            <div className="h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full w-8 animate-pulse"></div>
          </div>

          {/* Activity sections skeleton */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg overflow-hidden mb-6"
            >
              <div className="p-6 bg-gradient-to-r from-slate-50/80 to-slate-100/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl animate-pulse"></div>
                  <div className="h-6 bg-slate-200 rounded w-40 animate-pulse"></div>
                  <div className="h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full w-8 animate-pulse"></div>
                </div>
              </div>
              <div className="p-4">
                <div className="overflow-x-auto">
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm">
                    <div className="bg-slate-50/80 px-6 py-4">
                      <div className="grid grid-cols-6 gap-6">
                        {[...Array(6)].map((_, j) => (
                          <div
                            key={j}
                            className="h-3 bg-slate-200 rounded animate-pulse"
                          ></div>
                        ))}
                      </div>
                    </div>
                    <div className="divide-y divide-slate-200/50">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="px-6 py-4">
                          <div className="grid grid-cols-6 gap-6">
                            {[...Array(6)].map((_, k) => (
                              <div
                                key={k}
                                className="h-4 bg-slate-200 rounded animate-pulse"
                              ></div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
