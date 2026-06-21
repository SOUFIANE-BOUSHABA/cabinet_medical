import { ArrowRight, LoaderCircle } from 'lucide-react'

interface SubmitButtonProps {
  loading: boolean
  children: React.ReactNode
}

export function SubmitButton({ loading, children }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-[#075fd7] px-5 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(9,96,220,0.18)] transition hover:bg-[#0756c1] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-65"
    >
      {loading ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : null}
      <span>{children}</span>
      {!loading ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
    </button>
  )
}
