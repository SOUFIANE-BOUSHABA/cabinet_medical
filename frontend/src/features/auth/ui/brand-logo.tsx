import { CalendarHeart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface BrandLogoProps {
  compact?: boolean
  light?: boolean
  className?: string
}

export function BrandLogo({ compact, light, className }: BrandLogoProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center font-bold tracking-[-0.04em]',
        compact ? 'gap-1.5 text-sm' : 'gap-3 text-4xl',
        light ? 'text-white' : 'text-[#0b2453]',
        className,
      )}
      aria-label="Medico"
    >
      <span
        className={cn(
          'grid shrink-0 place-items-center rounded-xl bg-white text-[#0960dc] shadow-sm ring-1 ring-blue-100',
          compact ? 'size-7 rounded-lg' : 'size-14',
        )}
      >
        <CalendarHeart
          className={compact ? 'size-4' : 'size-8'}
          strokeWidth={2.2}
          aria-hidden="true"
        />
      </span>
      <span>medico</span>
    </div>
  )
}
