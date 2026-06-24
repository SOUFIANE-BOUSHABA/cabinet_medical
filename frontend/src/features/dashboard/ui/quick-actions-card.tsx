import { Link } from 'react-router-dom'
import type { DashboardQuickAction } from '@/features/dashboard/dashboard-model'

interface QuickActionsCardProps {
  actions: DashboardQuickAction[]
}

export function QuickActionsCard({ actions }: QuickActionsCardProps) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
      <h2 className="text-lg font-semibold tracking-tight text-[#14213a]">
        Actions rapides
      </h2>
      <div className="mt-5 grid gap-3">
        {actions.map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-bold text-[#14213a] transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#075fd7]"
          >
            <span className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-white text-[#075fd7] shadow-sm">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              {label}
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
