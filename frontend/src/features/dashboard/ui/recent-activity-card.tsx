import { Activity } from 'lucide-react'
import type { DashboardActivity } from '@/features/dashboard/dashboard-model'
import { DashboardEmptyState } from '@/features/dashboard/ui/dashboard-empty-state'
import { DashboardLoadingSkeleton } from '@/features/dashboard/ui/dashboard-loading-skeleton'

interface RecentActivityCardProps {
  items: DashboardActivity[]
  loading: boolean
}

export function RecentActivityCard({
  items,
  loading,
}: RecentActivityCardProps) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-[#14213a]">
          Activité récente
        </h2>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#075fd7]">
          Aujourd’hui
        </span>
      </div>

      {loading ? <DashboardLoadingSkeleton /> : null}
      {!loading && !items.length ? (
        <DashboardEmptyState description="Aucune activité récente à afficher pour le moment." />
      ) : null}
      {!loading && items.length ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={`${item.title}-${item.time}`}
              className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-[#075fd7] shadow-sm">
                <Activity className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-[#14213a]">{item.title}</p>
                  <span className="shrink-0 text-xs font-semibold text-slate-400">
                    {item.time}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
