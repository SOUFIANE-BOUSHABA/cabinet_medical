import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { forwardRef, type InputHTMLAttributes, useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  labelAction?: React.ReactNode
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, error, labelAction, className, id, ...props }, ref) => {
    const [visible, setVisible] = useState(false)
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
          {labelAction}
        </div>
        <div className="relative">
          <LockKeyhole
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#7e8ba5]"
            aria-hidden="true"
          />
          <input
            ref={ref}
            id={fieldId}
            type={visible ? 'text' : 'password'}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            className={cn(
              'h-12 w-full rounded-lg border bg-white pr-11 pl-10 text-sm text-[#17233c] shadow-[0_1px_2px_rgba(15,35,70,0.03)] transition placeholder:text-[#9aa5b8] hover:border-[#9eacc2] focus:border-[#0960dc] focus:ring-3 focus:ring-blue-100',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            className="absolute top-1/2 right-2.5 grid size-8 -translate-y-1/2 place-items-center rounded-md text-[#6f7b91] transition hover:bg-slate-100 hover:text-[#243148]"
            aria-label={
              visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
            }
          >
            {visible ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
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

PasswordField.displayName = 'PasswordField'
