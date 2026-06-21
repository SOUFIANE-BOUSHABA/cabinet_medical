import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: LucideIcon
  action?: ReactNode
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ label, error, icon: Icon, action, className, id, ...props }, ref) => {
    const fieldId = id ?? props.name
    const errorId = error ? `${fieldId}-error` : undefined

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor={fieldId}
            className="text-xs font-medium text-[#29354c]"
          >
            {label}
          </label>
          {action}
        </div>
        <div className="relative">
          {Icon ? (
            <Icon
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#7e8ba5]"
              aria-hidden="true"
            />
          ) : null}
          <input
            ref={ref}
            id={fieldId}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            className={cn(
              'h-12 w-full rounded-lg border bg-white pr-11 text-sm text-[#17233c] shadow-[0_1px_2px_rgba(15,35,70,0.03)] transition placeholder:text-[#9aa5b8] hover:border-[#9eacc2] focus:border-[#0960dc] focus:ring-3 focus:ring-blue-100',
              Icon ? 'pl-10' : 'pl-3.5',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
              className,
            )}
            {...props}
          />
        </div>
        {error ? (
          <p id={errorId} className="text-xs font-medium text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)

AuthField.displayName = 'AuthField'
