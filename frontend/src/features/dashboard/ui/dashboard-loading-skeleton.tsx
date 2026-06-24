interface DashboardLoadingSkeletonProps {
  rows?: number
}

export function DashboardLoadingSkeleton({
  rows = 3,
}: DashboardLoadingSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-2xl bg-slate-100"
        />
      ))}
    </div>
  )
}
