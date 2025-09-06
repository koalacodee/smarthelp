import React from "react";

export default function SidebarSkeleton() {
  console.log("SidebarSkeleton");

  return (
    <aside className="fixed left-10 top-0 h-full w-64 z-40">
      <div className="h-full pt-20 pb-4 overflow-y-auto">
        <nav className="space-y-1 px-4">
          {/* Logo/Brand skeleton */}
          <div className="mb-8 px-2">
            <div className="h-8 bg-slate-200 rounded w-32 animate-pulse"></div>
          </div>

          {/* Navigation items skeleton */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-2 py-2">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          ))}

          {/* Bottom section skeleton */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="h-10 bg-slate-200 rounded-lg animate-pulse"></div>
          </div>
        </nav>
      </div>
    </aside>
  );
}
