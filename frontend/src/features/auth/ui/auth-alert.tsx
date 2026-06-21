import { CircleAlert, CircleCheck } from 'lucide-react'

interface AuthAlertProps {
  variant: 'error' | 'success'
  children: React.ReactNode
}

export function AuthAlert({ variant, children }: AuthAlertProps) {
  const success = variant === 'success'
  const Icon = success ? CircleCheck : CircleAlert

  return (
    <div
      role={success ? 'status' : 'alert'}
      className={
        success
          ? 'flex gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-800'
          : 'flex gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700'
      }
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}
