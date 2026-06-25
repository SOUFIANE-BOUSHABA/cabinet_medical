import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Plus,
  Search,
  Trash2,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { PortalShell } from '@/components/layout/portal-shell'
import {
  approvePatient,
  deletePatient,
  type Patient,
} from '@/features/patients/api/patients-api'
import { useAuth } from '@/features/auth/use-auth'
import { CreatePatientModal } from '@/features/patients/components/create-patient-modal'
import { useState, useEffect } from 'react'
import {
  patientKeys,
  patientsQuery,
  searchPatientsQuery,
} from '@/features/patients/api/patient-queries'
import { PatientDetailsDrawer } from '@/features/patients/components/patient-details-drawer'

const PAGE_SIZE = 10

export function PatientManagementPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null)
  const isAdminOrSecretary =
    user?.role === 'ADMIN' || user?.role === 'SECRETARY'

  // Debounce effect for the search bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(0) // Reset to page 1 on new search
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const isSearching = debouncedSearch.trim().length > 0

  // Switch between Search and Normal List
  const patientList = useQuery(patientsQuery(page, PAGE_SIZE))
  const patientSearch = useQuery(searchPatientsQuery(debouncedSearch))
  const activeQuery = isSearching ? patientSearch : patientList
  const { data, isLoading, isError, error } = activeQuery

  // Mutations for Action Buttons
  const approveMutation = useMutation({
    mutationFn: approvePatient,
    onSuccess: () => {
      toast.success('Dossier patient approuvé !')
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
    },
    onError: () => toast.error("Erreur lors de l'approbation."),
  })

  const deleteMutation = useMutation({
    mutationFn: deletePatient,
    onSuccess: () => {
      toast.success('Patient supprimé.')
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
    },
    onError: () => toast.error('Erreur lors de la suppression.'),
  })

  const content = data?.content ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 0

  return (
    <PortalShell>
      <div className="mx-auto max-w-[1120px]">
        {/* Header Section */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-xl leading-tight font-bold tracking-[-0.03em] text-[#101b31]">
              Dossiers Patients
            </h1>
            <p className="mt-1 text-[11px] text-[#5f6c81]">
              Gérez les dossiers médicaux, les approbations et les informations
              de contact.
            </p>
          </div>
          {isAdminOrSecretary && (
            <button
              type="button"
              // <-- Clears the state so the form is empty for a new patient
              onClick={() => {
                setEditingPatient(null)
                setIsModalOpen(true)
              }}
              className="inline-flex h-[30px] items-center justify-center gap-2 rounded-md bg-[#075bd8] px-3.5 text-[10px] font-semibold text-white shadow-sm hover:bg-[#064fb9]"
            >
              <Plus className="size-3.5" strokeWidth={2.2} />
              Ajouter un patient
            </button>
          )}
        </section>

        {/* Search Bar & Stats */}
        <section className="mt-4 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, CIN ou téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-[#cfd7e7] pl-9 text-xs outline-none focus:border-[#075bd8] focus:ring-1 focus:ring-[#075bd8]"
            />
          </div>
          <div className="hidden rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 sm:block">
            Total : {isLoading ? '...' : totalElements} patients
          </div>
        </section>

        {/* The Table */}
        <section className="mt-4 overflow-hidden rounded-lg border border-[#cfd7e7] bg-white shadow-[0_2px_8px_rgba(16,29,53,0.06)]">
          {isLoading ? (
            <div className="animate-pulse p-6 text-center text-sm text-slate-400">
              Chargement des patients...
            </div>
          ) : isError ? (
            <div className="p-6 text-center text-red-500">
              Erreur lors du chargement: {String(error)}
            </div>
          ) : content.length === 0 ? (
            <div className="grid min-h-72 place-items-center p-6 text-center">
              <div>
                <div className="mx-auto grid size-11 place-items-center rounded-full bg-blue-50 text-[#075bd8]">
                  <User className="size-5" />
                </div>
                <h2 className="mt-3 text-sm font-bold text-[#142039]">
                  Aucun patient trouvé
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {isAdminOrSecretary
                    ? 'Ajoutez un nouveau patient pour commencer.'
                    : "L'annuaire est vide."}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="bg-[#f6f8ff] text-[10px] font-semibold text-[#26334b]">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">CIN</th>
                    <th className="px-4 py-3">Téléphone</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {content.map((patient: Patient) => (
                    <tr
                      key={patient.id}
                      className="border-t border-[#dce2ed] text-[11px] text-[#334158] hover:bg-[#fafbff]"
                    >
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setViewingPatient(patient)}
                          className="block text-left font-bold text-[#17233b] transition-colors hover:text-[#075bd8]"
                        >
                          {patient.firstName} {patient.lastName}
                        </button>
                        <span className="mt-0.5 block text-[10px] text-slate-500">
                          {patient.email}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">{patient.cin || '—'}</td>
                      <td className="px-4 py-3.5">{patient.phone || '—'}</td>
                      <td className="px-4 py-3.5">
                        {patient.accountStatus === 'PENDING' ? (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] font-bold text-amber-700">
                            EN ATTENTE
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-bold text-emerald-700">
                            ACTIF
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Approve Button */}
                          {patient.accountStatus === 'PENDING' &&
                            isAdminOrSecretary && (
                              <button
                                onClick={() =>
                                  approveMutation.mutate(patient.id!)
                                }
                                disabled={approveMutation.isPending}
                                className="rounded-md p-1.5 text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-50"
                                title="Approuver le dossier"
                              >
                                <CheckCircle2
                                  className="size-4"
                                  strokeWidth={2}
                                />
                              </button>
                            )}

                          {/* Edit Button */}
                          <button
                            // <-- Passes the current patient into the modal
                            onClick={() => {
                              setEditingPatient(patient)
                              setIsModalOpen(true)
                            }}
                            className="rounded-md p-1.5 text-blue-600 transition-colors hover:bg-blue-50"
                            title="Modifier le dossier"
                          >
                            <Edit2 className="size-4" strokeWidth={2} />
                          </button>

                          {/* Delete Button */}
                          {isAdminOrSecretary && (
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    'Voulez-vous vraiment supprimer ce patient ?',
                                  )
                                ) {
                                  deleteMutation.mutate(patient.id!)
                                }
                              }}
                              disabled={deleteMutation.isPending}
                              className="rounded-md p-1.5 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                              title="Supprimer le patient"
                            >
                              <Trash2 className="size-4" strokeWidth={2} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !isSearching && totalPages > 1 && (
            <footer className="flex items-center justify-between border-t border-[#dce2ed] px-4 py-3">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="grid size-8 place-items-center rounded-md border text-slate-500 disabled:opacity-35"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-[11px] font-semibold text-slate-600">
                Page {page + 1} sur {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="grid size-8 place-items-center rounded-md border text-slate-500 disabled:opacity-35"
              >
                <ChevronRight className="size-4" />
              </button>
            </footer>
          )}
        </section>
      </div>

      {/* <-- We pass the initialData down to the modal --> */}
      <CreatePatientModal
        key={`${isModalOpen ? 'open' : 'closed'}-${editingPatient?.id ?? 'new'}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingPatient}
      />
      <PatientDetailsDrawer
        isOpen={!!viewingPatient}
        onClose={() => setViewingPatient(null)}
        patient={viewingPatient}
      />
    </PortalShell>
  )
}
