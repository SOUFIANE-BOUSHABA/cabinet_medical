import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  LoaderCircle,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
} from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { PortalShell } from '@/components/layout/portal-shell'
import { DoctorDialog } from '@/features/doctors/ui/doctor-dialog'
import {
  createUser,
  deleteUser,
  updateUser,
  updateUserStatus,
  type User,
  type UserRole,
} from '@/features/users/api/users-api'
import { userKeys, usersQuery } from '@/features/users/api/user-queries'
import { getApiErrorMessage } from '@/lib/api/client'
import { cn } from '@/lib/utils/cn'
import { formatDateTime, valueOrDash } from '@/lib/utils/format'

const PAGE_SIZE = 12
const roles: Array<UserRole | ''> = ['', 'ADMIN', 'DOCTOR', 'SECRETARY']

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Admin',
  DOCTOR: 'Médecin',
  SECRETARY: 'Secrétaire',
  PATIENT: 'Patient',
}

interface UserFormState {
  name: string
  email: string
  password: string
  role: UserRole
}

const blankForm = (): UserFormState => ({
  name: '',
  email: '',
  password: '',
  role: 'SECRETARY',
})

function toForm(user: User): UserFormState {
  return {
    name: user.name ?? '',
    email: user.email ?? '',
    password: '',
    role: user.role ?? 'SECRETARY',
  }
}

export function UserManagementPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [role, setRole] = useState<UserRole | ''>('')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [form, setForm] = useState<UserFormState>(() => blankForm())

  const users = useQuery(usersQuery({ page, size: PAGE_SIZE, role }))

  const refreshUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: userKeys.lists() })
  }

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      toast.success('Utilisateur créé')
      setFormOpen(false)
      setForm(blankForm())
      await refreshUsers()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: UserFormState }) =>
      updateUser(id, {
        name: values.name,
        email: values.email,
        role: values.role,
        password: values.password || undefined,
      }),
    onSuccess: async () => {
      toast.success('Utilisateur mis à jour')
      setEditing(null)
      setFormOpen(false)
      await refreshUsers()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      updateUserStatus(id, enabled),
    onSuccess: async () => {
      toast.success('Statut mis à jour')
      await refreshUsers()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      toast.success('Utilisateur supprimé')
      setDeleteTarget(null)
      await refreshUsers()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const rows = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    const content = users.data?.content ?? []
    if (!normalized) return content
    return content.filter((user) =>
      [user.name, user.email, user.role]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    )
  }, [search, users.data?.content])

  const totalElements = users.data?.totalElements ?? 0
  const totalPages = users.data?.totalPages ?? 0
  const active = rows.filter((item) => item.enabled).length
  const admins = rows.filter((item) => item.role === 'ADMIN').length
  const submitting = createMutation.isPending || updateMutation.isPending

  const openCreate = () => {
    setEditing(null)
    setForm(blankForm())
    setFormOpen(true)
  }

  const openEdit = (user: User) => {
    setEditing(user)
    setForm(toForm(user))
    setFormOpen(true)
  }

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editing && form.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    if (editing?.id) {
      await updateMutation.mutateAsync({ id: editing.id, values: form })
      return
    }
    await createMutation.mutateAsync({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    })
  }

  return (
    <PortalShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          eyebrow="Accès & sécurité"
          title="Utilisateurs"
          description="Administrez les comptes staff, les rôles et l’activation des accès au cabinet."
          icon={UserCog}
        >
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#075fd7] px-5 text-sm font-black text-white shadow-[0_18px_35px_rgba(7,95,215,0.25)] transition hover:-translate-y-0.5 hover:bg-[#064fb9]"
          >
            <Plus className="size-4" />
            Nouvel utilisateur
          </button>
        </PageHeader>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
            <p className="text-xs font-black tracking-[0.18em] text-slate-400 uppercase">
              Total
            </p>
            <p className="mt-3 text-4xl font-black text-[#101b31]">
              {totalElements}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Comptes staff
            </p>
          </article>
          <article className="rounded-3xl bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
            <p className="text-xs font-black tracking-[0.18em] text-emerald-500 uppercase">
              Actifs
            </p>
            <p className="mt-3 text-4xl font-black text-[#101b31]">{active}</p>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Sur cette page
            </p>
          </article>
          <article className="rounded-3xl bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
            <p className="text-xs font-black tracking-[0.18em] text-blue-500 uppercase">
              Admins
            </p>
            <p className="mt-3 text-4xl font-black text-[#101b31]">{admins}</p>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Droits sensibles
            </p>
          </article>
        </section>

        <section className="rounded-[2rem] bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.07)] ring-1 ring-slate-100">
          <div className="grid gap-3 border-b border-slate-100 pb-4 lg:grid-cols-[1fr_220px]">
            <label className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pr-4 pl-11 text-sm font-bold transition outline-none focus:border-[#075fd7] focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="Rechercher nom, email, rôle..."
              />
            </label>
            <select
              value={role}
              onChange={(event) => {
                setRole(event.target.value as UserRole | '')
                setPage(0)
              }}
              className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-[#075fd7] focus:ring-4 focus:ring-blue-100"
            >
              {roles.map((item) => (
                <option key={item || 'all'} value={item}>
                  {item ? roleLabels[item] : 'Tous les rôles'}
                </option>
              ))}
            </select>
          </div>

          {users.isLoading ? (
            <div className="grid min-h-80 place-items-center">
              <LoaderCircle className="size-8 animate-spin text-[#075fd7]" />
            </div>
          ) : users.isError ? (
            <div className="grid min-h-80 place-items-center text-center">
              <div>
                <AlertCircle className="mx-auto size-9 text-rose-500" />
                <p className="mt-3 text-sm font-bold text-slate-700">
                  {getApiErrorMessage(users.error)}
                </p>
              </div>
            </div>
          ) : rows.length === 0 ? (
            <div className="grid min-h-80 place-items-center text-center">
              <div>
                <UserCog className="mx-auto size-10 text-slate-300" />
                <h2 className="mt-3 text-lg font-black text-[#101b31]">
                  Aucun utilisateur
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Créez un compte staff pour commencer.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[840px] border-collapse text-left">
                <thead>
                  <tr className="text-xs font-black tracking-[0.08em] text-slate-400 uppercase">
                    <th className="px-4 py-3">Utilisateur</th>
                    <th className="px-4 py-3">Rôle</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Créé le</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((item) => (
                    <tr
                      key={item.id}
                      className="text-sm font-semibold text-slate-600 transition hover:bg-slate-50/80"
                    >
                      <td className="px-4 py-4">
                        <p className="font-black text-[#101b31]">
                          {valueOrDash(item.name)}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {valueOrDash(item.email)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-[#075fd7] ring-1 ring-blue-100">
                          <ShieldCheck className="size-3.5" />
                          {roleLabels[item.role ?? 'SECRETARY']}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-3 py-1 text-xs font-black ring-1',
                            item.enabled
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                              : 'bg-slate-100 text-slate-600 ring-slate-200',
                          )}
                        >
                          {item.enabled ? 'Actif' : 'Désactivé'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {formatDateTime(item.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            disabled={!item.id || statusMutation.isPending}
                            onClick={() =>
                              item.id &&
                              statusMutation.mutate({
                                id: item.id,
                                enabled: !item.enabled,
                              })
                            }
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                          >
                            {item.enabled ? 'Désactiver' : 'Activer'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="grid size-9 place-items-center rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100"
                            title="Supprimer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 ? (
            <footer className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <p className="text-sm font-bold text-slate-500">
                Page {page + 1} sur {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((current) => current - 1)}
                  className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-black text-slate-600 disabled:opacity-40"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((current) => current + 1)}
                  className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-black text-slate-600 disabled:opacity-40"
                >
                  Suivant
                </button>
              </div>
            </footer>
          ) : null}
        </section>
      </div>

      <DoctorDialog
        open={formOpen}
        title={editing ? 'Modifier l’utilisateur' : 'Nouvel utilisateur'}
        description={
          editing
            ? 'Laissez le mot de passe vide si vous ne voulez pas le changer.'
            : 'Créez un compte staff pour administrer le cabinet.'
        }
        onClose={() => !submitting && setFormOpen(false)}
      >
        <form className="space-y-4 p-5" onSubmit={submitForm}>
          <label className="block">
            <span className="text-xs font-black text-slate-500">Nom</span>
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold"
              placeholder="Dr. Sara Benali"
            />
          </label>
          <label className="block">
            <span className="text-xs font-black text-slate-500">Email</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold"
              placeholder="nom@cabinet.ma"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-black text-slate-500">Rôle</span>
              <select
                value={form.role}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target.value as UserRole,
                  }))
                }
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold"
              >
                <option value="ADMIN">Admin</option>
                <option value="DOCTOR">Médecin</option>
                <option value="SECRETARY">Secrétaire</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-black text-slate-500">
                Mot de passe
              </span>
              <input
                type="password"
                required={!editing}
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold"
                placeholder={editing ? 'Optionnel' : 'Minimum 6 caractères'}
              />
            </label>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-black text-slate-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 min-w-32 items-center justify-center gap-2 rounded-xl bg-[#075fd7] px-5 text-sm font-black text-white disabled:opacity-60"
            >
              {submitting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : null}
              Enregistrer
            </button>
          </div>
        </form>
      </DoctorDialog>

      <DoctorDialog
        open={Boolean(deleteTarget)}
        title="Supprimer cet utilisateur ?"
        description="Cette action supprime définitivement le compte staff."
        onClose={() => !deleteMutation.isPending && setDeleteTarget(null)}
        size="sm"
      >
        <div className="p-5">
          <p className="text-sm font-black text-[#101b31]">
            {deleteTarget?.name}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {deleteTarget?.email}
          </p>
          <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-black text-slate-600"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={!deleteTarget?.id || deleteMutation.isPending}
              onClick={() =>
                deleteTarget?.id && deleteMutation.mutate(deleteTarget.id)
              }
              className="h-11 rounded-xl bg-rose-600 px-4 text-sm font-black text-white disabled:opacity-60"
            >
              Supprimer
            </button>
          </div>
        </div>
      </DoctorDialog>
    </PortalShell>
  )
}
