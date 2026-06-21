import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Stethoscope,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PortalShell } from '@/components/layout/portal-shell'
import {
  createDoctor,
  deleteDoctor,
  type Doctor,
  updateDoctor,
} from '@/features/doctors/api/doctors-api'
import {
  doctorKeys,
  doctorQuery,
  doctorsQuery,
} from '@/features/doctors/api/doctor-queries'
import type {
  CreateDoctorFormValues,
  UpdateDoctorFormValues,
} from '@/features/doctors/schemas/doctor-schemas'
import { DoctorDialog } from '@/features/doctors/ui/doctor-dialog'
import { DoctorForm } from '@/features/doctors/ui/doctor-form'
import { useAuth } from '@/features/auth/use-auth'
import { getApiErrorMessage } from '@/lib/api/client'

const PAGE_SIZE = 20

function DoctorsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-11 border-b bg-slate-100" />
      {[1, 2, 3].map((row) => (
        <div key={row} className="grid grid-cols-4 gap-5 border-b p-4">
          <div className="h-8 rounded bg-slate-100" />
          <div className="h-8 rounded bg-slate-100" />
          <div className="h-8 rounded bg-slate-100" />
          <div className="h-8 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  )
}

function valueOrDash(value?: string) {
  return value?.trim() || 'Non renseigné'
}

export function DoctorManagementPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null)
  const [detailId, setDetailId] = useState<number | null>(null)
  const isAdmin = user?.role === 'ADMIN'

  const doctors = useQuery(doctorsQuery(page, PAGE_SIZE))
  const details = useQuery(doctorQuery(detailId ?? 0))

  const createMutation = useMutation({
    mutationFn: createDoctor,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: doctorKeys.lists() })
      toast.success('Médecin créé avec succès')
      setCreateOpen(false)
      setPage(0)
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: number
      values: UpdateDoctorFormValues
    }) => updateDoctor(id, values),
    onSuccess: async (updatedDoctor) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: doctorKeys.lists() }),
        updatedDoctor.id
          ? queryClient.invalidateQueries({
              queryKey: doctorKeys.detail(updatedDoctor.id),
            })
          : Promise.resolve(),
      ])
      toast.success('Médecin mis à jour')
      setEditDoctor(null)
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDoctor,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: doctorKeys.lists() })
      toast.success('Médecin supprimé')
      setDeleteTarget(null)
      if ((doctors.data?.content?.length ?? 0) === 1 && page > 0) {
        setPage((current) => current - 1)
      }
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const content = doctors.data?.content ?? []
  const totalElements = doctors.data?.totalElements ?? 0
  const totalPages = doctors.data?.totalPages ?? 0
  const start = totalElements === 0 ? 0 : page * PAGE_SIZE + 1
  const end = Math.min((page + 1) * PAGE_SIZE, totalElements)

  return (
    <PortalShell>
      <div className="mx-auto max-w-[1120px]">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-xl leading-tight font-bold tracking-[-0.03em] text-[#101b31]">
              Annuaire des Médecins
            </h1>
            <p className="mt-1 text-[11px] text-[#5f6c81]">
              Gérez votre équipe médicale et ses disponibilités quotidiennes.
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex h-[30px] items-center justify-center gap-2 rounded-md bg-[#075bd8] px-3.5 text-[10px] font-semibold text-white shadow-sm hover:bg-[#064fb9]"
            >
              <Plus className="size-3.5" strokeWidth={2.2} />
              Ajouter un médecin
            </button>
          )}
        </section>

        <section className="mt-2 grid gap-3 sm:grid-cols-[136px]">
          <div className="h-[54px] rounded-lg border border-[#cfd7e7] bg-white px-3 py-2 shadow-[0_1px_3px_rgba(16,29,53,0.06)]">
            <p className="text-[9px] font-medium text-[#667287]">
              Total Médecins
            </p>
            <p className="mt-1 text-base font-bold text-[#142039]">
              {doctors.isLoading ? '—' : totalElements}
            </p>
          </div>
        </section>

        <section className="mt-3 overflow-hidden rounded-lg border border-[#cfd7e7] bg-white shadow-[0_2px_8px_rgba(16,29,53,0.06)]">
          {doctors.isLoading ? (
            <DoctorsSkeleton />
          ) : doctors.isError ? (
            <div className="grid min-h-72 place-items-center p-6 text-center">
              <div>
                <AlertCircle className="mx-auto size-8 text-red-500" />
                <h2 className="mt-3 text-sm font-bold text-[#142039]">
                  Impossible de charger les médecins
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {getApiErrorMessage(doctors.error)}
                </p>
                <button
                  type="button"
                  onClick={() => void doctors.refetch()}
                  className="mt-4 rounded-md bg-[#075bd8] px-4 py-2 text-xs font-semibold text-white"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : content.length === 0 ? (
            <div className="grid min-h-72 place-items-center p-6 text-center">
              <div>
                <div className="mx-auto grid size-11 place-items-center rounded-full bg-blue-50 text-[#075bd8]">
                  <Stethoscope className="size-5" />
                </div>
                <h2 className="mt-3 text-sm font-bold text-[#142039]">
                  Aucun médecin enregistré
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {isAdmin
                    ? 'Ajoutez le premier médecin de votre équipe.'
                    : "L'annuaire ne contient encore aucun médecin."}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-[#f6f8ff] text-[10px] font-semibold text-[#26334b]">
                    <tr>
                      <th className="px-4 py-3">Médecin</th>
                      <th className="px-4 py-3">Spécialité</th>
                      <th className="px-4 py-3">Disponibilité</th>
                      {isAdmin && (
                        <th className="px-4 py-3 text-right">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {content.map((doctor) => (
                      <tr
                        key={doctor.id ?? doctor.userId}
                        className="border-t border-[#dce2ed] text-[11px] text-[#334158] hover:bg-[#fafbff]"
                      >
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => doctor.id && setDetailId(doctor.id)}
                            className="text-left"
                            disabled={!doctor.id}
                          >
                            <span className="block font-bold text-[#17233b] hover:text-[#075bd8]">
                              {valueOrDash(doctor.name)}
                            </span>
                            <span className="mt-0.5 block text-[10px] text-slate-500">
                              {valueOrDash(doctor.email)}
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex rounded-full bg-[#e8efff] px-2.5 py-1 text-[10px] font-semibold text-[#075bd8]">
                            {valueOrDash(doctor.specialty)}
                          </span>
                        </td>
                        <td className="max-w-64 px-4 py-3.5 leading-5">
                          {valueOrDash(doctor.availability)}
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3.5">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setEditDoctor(doctor)}
                                className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-blue-50 hover:text-[#075bd8]"
                                aria-label={`Modifier ${doctor.name ?? 'le médecin'}`}
                              >
                                <Pencil className="size-4" strokeWidth={1.8} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(doctor)}
                                className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600"
                                aria-label={`Supprimer ${doctor.name ?? 'le médecin'}`}
                              >
                                <Trash2 className="size-4" strokeWidth={1.8} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y md:hidden">
                {content.map((doctor) => (
                  <article key={doctor.id ?? doctor.userId} className="p-4">
                    <button
                      type="button"
                      onClick={() => doctor.id && setDetailId(doctor.id)}
                      className="text-left"
                      disabled={!doctor.id}
                    >
                      <h2 className="text-sm font-bold text-[#17233b]">
                        {valueOrDash(doctor.name)}
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {valueOrDash(doctor.email)}
                      </p>
                    </button>
                    <dl className="mt-3 grid gap-2 text-xs">
                      <div>
                        <dt className="font-semibold text-slate-500">
                          Spécialité
                        </dt>
                        <dd className="mt-0.5 text-[#17233b]">
                          {valueOrDash(doctor.specialty)}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-500">
                          Disponibilité
                        </dt>
                        <dd className="mt-0.5 text-[#17233b]">
                          {valueOrDash(doctor.availability)}
                        </dd>
                      </div>
                    </dl>
                    {isAdmin && (
                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditDoctor(doctor)}
                          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md border text-xs font-semibold text-[#344055]"
                        >
                          <Pencil className="size-3.5" /> Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(doctor)}
                          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md border border-red-200 text-xs font-semibold text-red-600"
                        >
                          <Trash2 className="size-3.5" /> Supprimer
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </>
          )}

          {!doctors.isLoading && !doctors.isError && totalElements > 0 && (
            <footer className="flex flex-col gap-3 border-t border-[#dce2ed] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] text-[#657187]">
                Affichage de {start} à {end} sur {totalElements} médecins
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((current) => current - 1)}
                  className="grid size-8 place-items-center rounded-md border text-slate-500 disabled:opacity-35"
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="grid h-8 min-w-8 place-items-center rounded-md bg-[#075bd8] px-2 text-[11px] font-semibold text-white">
                  {page + 1}
                </span>
                <button
                  type="button"
                  disabled={totalPages === 0 || page >= totalPages - 1}
                  onClick={() => setPage((current) => current + 1)}
                  className="grid size-8 place-items-center rounded-md border text-slate-500 disabled:opacity-35"
                  aria-label="Page suivante"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </footer>
          )}
        </section>
      </div>

      <DoctorDialog
        open={createOpen}
        title="Ajouter un médecin"
        description="Créez le compte professionnel et le profil médical en une seule étape."
        onClose={() => !createMutation.isPending && setCreateOpen(false)}
      >
        <DoctorForm
          mode="create"
          submitting={createMutation.isPending}
          onCancel={() => setCreateOpen(false)}
          onSubmit={async (values) => {
            try {
              await createMutation.mutateAsync(values as CreateDoctorFormValues)
            } catch {
              // The mutation displays the API error toast.
            }
          }}
        />
      </DoctorDialog>

      <DoctorDialog
        open={Boolean(editDoctor)}
        title="Modifier le médecin"
        description="L'email et le mot de passe ne sont pas modifiables ici."
        onClose={() => !updateMutation.isPending && setEditDoctor(null)}
      >
        <DoctorForm
          mode="edit"
          doctor={editDoctor ?? undefined}
          submitting={updateMutation.isPending}
          onCancel={() => setEditDoctor(null)}
          onSubmit={async (values) => {
            if (!editDoctor?.id) return
            try {
              await updateMutation.mutateAsync({
                id: editDoctor.id,
                values: values as UpdateDoctorFormValues,
              })
            } catch {
              // The mutation displays the API error toast.
            }
          }}
        />
      </DoctorDialog>

      <DoctorDialog
        open={Boolean(deleteTarget)}
        title="Supprimer ce médecin ?"
        description="Cette action supprime également son compte professionnel et ne peut pas être annulée."
        onClose={() => !deleteMutation.isPending && setDeleteTarget(null)}
        size="sm"
      >
        <div className="p-5">
          <p className="text-sm font-semibold text-[#17233b]">
            {deleteTarget?.name}
          </p>
          <p className="mt-1 text-xs text-slate-500">{deleteTarget?.email}</p>
          <div className="mt-6 flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
              className="h-10 rounded-lg border px-4 text-xs font-semibold text-[#465269]"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={deleteMutation.isPending || !deleteTarget?.id}
              onClick={() =>
                deleteTarget?.id && deleteMutation.mutate(deleteTarget.id)
              }
              className="h-10 rounded-lg bg-red-600 px-4 text-xs font-semibold text-white disabled:opacity-60"
            >
              {deleteMutation.isPending ? 'Suppression…' : 'Supprimer'}
            </button>
          </div>
        </div>
      </DoctorDialog>

      <DoctorDialog
        open={detailId !== null}
        title="Fiche du médecin"
        onClose={() => setDetailId(null)}
        size="sm"
      >
        <div className="p-5">
          {details.isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-2/3 rounded bg-slate-100" />
              <div className="h-4 w-1/2 rounded bg-slate-100" />
              <div className="h-16 rounded bg-slate-100" />
            </div>
          ) : details.isError ? (
            <div className="text-center">
              <AlertCircle className="mx-auto size-7 text-red-500" />
              <p className="mt-2 text-xs text-slate-600">
                {getApiErrorMessage(details.error)}
              </p>
              <button
                type="button"
                onClick={() => void details.refetch()}
                className="mt-3 rounded-md bg-[#075bd8] px-3 py-2 text-xs font-semibold text-white"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs font-semibold text-slate-500">Nom</dt>
                <dd className="mt-1 font-bold text-[#17233b]">
                  {valueOrDash(details.data?.name)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Email</dt>
                <dd className="mt-1 text-[#17233b]">
                  {valueOrDash(details.data?.email)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">
                  Spécialité
                </dt>
                <dd className="mt-1 text-[#17233b]">
                  {valueOrDash(details.data?.specialty)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">
                  Disponibilité
                </dt>
                <dd className="mt-1 leading-6 text-[#17233b]">
                  {valueOrDash(details.data?.availability)}
                </dd>
              </div>
            </dl>
          )}
        </div>
      </DoctorDialog>
    </PortalShell>
  )
}
