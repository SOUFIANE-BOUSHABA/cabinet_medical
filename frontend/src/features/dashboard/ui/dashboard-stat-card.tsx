import type { DashboardStat } from '@/features/dashboard/dashboard-model'
import { cn } from '@/lib/utils/cn'

const toneClasses: Record<DashboardStat['tone'], string> = {
  blue: 'bg-blue-50 text-[#075fd7] ring-blue-100',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  red: 'bg-rose-50 text-rose-700 ring-rose-100',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
}

interface DashboardStatCardProps {
  stat: DashboardStat
}

export function DashboardStatCard({ stat }: DashboardStatCardProps) {
  const Icon = stat.icon

  return (
    <article className="rounded-3xl border border-white/70 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(7,95,215,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-slate-400 uppercase">
            {stat.label}
          </p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-[#14213a]">
            {stat.value}
          </p>
        </div>
        <span
          className={cn(
            'grid size-12 place-items-center rounded-2xl ring-1',
            toneClasses[stat.tone],
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500">{stat.helper}</p>
    </article>
  )
}
