import type { DashboardStat } from '@/features/dashboard/dashboard-model'
import { DashboardStatCard } from '@/features/dashboard/ui/dashboard-stat-card'

interface DashboardStatGridProps {
  loading: boolean
  stats: DashboardStat[]
}

export function DashboardStatGrid({ loading, stats }: DashboardStatGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-3xl border border-slate-100 bg-white"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <DashboardStatCard key={stat.key} stat={stat} />
      ))}
    </div>
  )
}
