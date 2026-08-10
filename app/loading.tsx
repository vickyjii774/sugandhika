import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fadeIn">
      {/* Banner Skeleton */}
      <Skeleton className="w-full h-80 rounded-3xl" />

      {/* Grid Skeleton */}
      <div className="space-y-4">
        <Skeleton className="w-48 h-8 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-soft">
              <Skeleton className="w-full aspect-square rounded-xl" />
              <Skeleton className="w-3/4 h-5 rounded-md" />
              <Skeleton className="w-1/2 h-4 rounded-md" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="w-20 h-6 rounded-md" />
                <Skeleton className="w-10 h-10 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
