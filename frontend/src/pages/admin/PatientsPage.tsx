import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { TopBar } from '../../components/layout/TopBar'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { ErrorAlert } from '../../components/common/ErrorAlert'
import { EmptyState } from '../../components/common/EmptyState'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { patientApi } from '../../api/patientApi'
import { formatDate, getErrorMessage } from '../../utils/statusUtils'
import type { Patient } from '../../types'

const EMPTY_PATIENT: Omit<Patient, 'id' | 'createdAt'> = {
  firstName: '', lastName: '', email: '', phone: '',
  dateOfBirth: '', gender: '', address: '', medicalHistory: '',
}

export function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filtered, setFiltered] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [form, setForm] = useState({ ...EMPTY_PATIENT })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const { data } = await patientApi.getAll()
      setPatients(data)
      setFiltered(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPatients() }, [])

  useEffect(() => {
    const kw = search.toLowerCase()
    setFiltered(patients.filter(p =>
      p.firstName.toLowerCase().includes(kw) ||
      p.lastName.toLowerCase().includes(kw) ||
      p.email.toLowerCase().includes(kw)
    ))
  }, [search, patients])

  const openAdd = () => { setForm({ ...EMPTY_PATIENT }); setEditingPatient(null); setShowForm(true) }
  const openEdit = (p: Patient) => { setForm({ firstName: p.firstName, lastName: p.lastName, email: p.email, phone: p.phone || '', dateOfBirth: p.dateOfBirth || '', gender: p.gender || '', address: p.address || '', medicalHistory: p.medicalHistory || '' }); setEditingPatient(p); setShowForm(true) }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingPatient?.id) {
        await patientApi.update(editingPatient.id, form)
        toast.success('Patient updated successfully')
      } else {
        await patientApi.create(form)
        toast.success('Patient created successfully')
      }
      setShowForm(false)
      fetchPatients()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await patientApi.delete(deleteId)
      toast.success('Patient deleted')
      setDeleteId(null)
      fetchPatients()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div>
      <TopBar title="Patients" subtitle="Manage patient records" />
      <div className="p-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="input-field pl-9"
              placeholder="Search patients by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={openAdd} className="btn-primary">
            <Plus className="h-4 w-4" /> Add Patient
          </button>
        </div>

        {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}
        {loading ? <LoadingSpinner message="Loading patients..." /> : (
          <div className="card overflow-hidden p-0">
            {filtered.length === 0 ? (
              <EmptyState icon={Users} title="No patients found" description="Add your first patient to get started." action={<button onClick={openAdd} className="btn-primary">Add Patient</button>} />
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-header">Name</th>
                    <th className="table-header hidden md:table-cell">Email</th>
                    <th className="table-header hidden lg:table-cell">Phone</th>
                    <th className="table-header hidden lg:table-cell">Date of Birth</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">{p.firstName} {p.lastName}</td>
                      <td className="table-cell hidden md:table-cell text-gray-600">{p.email}</td>
                      <td className="table-cell hidden lg:table-cell text-gray-600">{p.phone || '—'}</td>
                      <td className="table-cell hidden lg:table-cell text-gray-600">{p.dateOfBirth ? formatDate(p.dateOfBirth) : '—'}</td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(p)} className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteId(p.id!)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">{editingPatient ? 'Edit Patient' : 'Add Patient'}</h2>
            </div>
            <form onSubmit={handleSave} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name *</label>
                <input className="input-field" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input className="input-field" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
              </div>
              <div>
                <label className="label">Email *</label>
                <input className="input-field" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input className="input-field" type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
              </div>
              <div>
                <label className="label">Gender</label>
                <select className="input-field" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address</label>
                <input className="input-field" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Medical History</label>
                <textarea className="input-field min-h-20" value={form.medicalHistory} onChange={e => setForm({ ...form, medicalHistory: e.target.value })} />
              </div>
              <div className="sm:col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingPatient ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Patient"
        message="Are you sure you want to delete this patient? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
