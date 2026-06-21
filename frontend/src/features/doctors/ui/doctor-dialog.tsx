import { X } from 'lucide-react'
import { useEffect, type PropsWithChildren } from 'react'

interface DoctorDialogProps extends PropsWithChildren {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  size?: 'sm' | 'md'
}

export function DoctorDialog({
  open,
  title,
  description,
  onClose,
  size = 'md',
  children,
}: DoctorDialogProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#0b1730]/45 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="doctor-dialog-title"
        className={`w-full rounded-xl bg-white shadow-2xl ${size === 'sm' ? 'max-w-md' : 'max-w-xl'}`}
      >
        <header className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <h2
              id="doctor-dialog-title"
              className="text-lg font-bold text-[#111d35]"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>
        </header>
        {children}
      </section>
    </div>
  )
}
