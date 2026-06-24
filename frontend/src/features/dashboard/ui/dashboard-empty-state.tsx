import { Inbox } from 'lucide-react'

interface DashboardEmptyStateProps {
  title?: string
  description?: string
}

export function DashboardEmptyState({
  title = 'Aucune donnée',
  description = 'Les informations apparaîtront ici dès qu’elles seront disponibles.',
}: DashboardEmptyStateProps) {
  return (
    <div className="grid min-h-44 place-items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm">
          <Inbox className="size-6" aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-sm font-bold text-[#14213a]">{title}</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  )
}
