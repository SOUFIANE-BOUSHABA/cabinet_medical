import type { LucideIcon } from 'lucide-react'
import type { PropsWithChildren } from 'react'

interface PageHeaderProps extends PropsWithChildren {
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
}

export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
}: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white px-6 py-6 shadow-[0_18px_55px_rgba(15,23,42,0.07)] ring-1 ring-slate-100 sm:px-8">
      <div className="absolute top-0 right-0 h-28 w-72 rounded-bl-full bg-gradient-to-l from-blue-100 via-cyan-50 to-transparent" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#075fd7] text-white shadow-[0_18px_35px_rgba(7,95,215,0.22)]">
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-black tracking-[0.22em] text-[#075fd7] uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#101b31] sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 font-medium text-slate-500">
              {description}
            </p>
          </div>
        </div>
        {children ? <div className="relative">{children}</div> : null}
      </div>
    </section>
  )
}
