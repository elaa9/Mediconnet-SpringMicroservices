import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Search, UserCheck, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { TopBar } from '../../components/layout/TopBar'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { ErrorAlert } from '../../components/common/ErrorAlert'
import { EmptyState } from '../../components/common/EmptyState'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { doctorApi } from '../../api/doctorApi'
import { getErrorMessage } from '../../utils/statusUtils'
import type { Doctor } from '../../types'

const SPECIALIZATIONS = [
  'Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 'Orthopedics',
  'Endocrinology', 'Ophthalmology', 'Gastroenterology', 'Psychiatry', 'General Medicine'
]

const EMPTY: Omit<Doctor, 'id' | 'createdAt'> = {
  firstName: '', lastName: '', email: '', phone: '',
  specialization: '', experienceYears: 0, description: '',
  consultationPrice: 0, available: true,
}

export function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filtered, setFiltered] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [specFilter, setSpecFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetch = async () => {
    try {
      setLoading(true)
      const { data } = await doctorApi.getAll()
      setDoctors(data)
    } catch (err) { setError(getErrorMessage(err)) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])
  useEffect(() => {
    const kw = search.toLowerCase()
    setFiltered(doctors.filter(d =>
      (!specFilter || d.specialization.toLowerCase() === specFilter.toLowerCase()) &&
      (d.firstName.toLowerCase().includes(kw) || d.lastName.toLowerCase().includes(kw) || d.email.toLowerCase().includes(kw))
    ))
  }, [search, specFilter, doctors])

  const openAdd = () => { setForm({ ...EMPTY }); setEditingDoctor(null); setShowForm(true) }
  const openEdit = (d: Doctor) => {
    setForm({ firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone || '', specialization: d.specialization, experienceYears: d.experienceYears || 0, description: d.description || '', consultationPrice: d.consultationPrice || 0, available: d.available ?? true })
    setEditingDoctor(d); setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editingDoctor?.id) { await doctorApi.update(editingDoctor.id, form); toast.success('Doctor updated') }
      else { await doctorApi.create(form); toast.success('Doctor created') }
      setShowForm(false); fetch()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try { await doctorApi.delete(deleteId); toast.success('Doctor deleted'); setDeleteId(null); fetch() }
    catch (err) { toast.error(getErrorMessage(err)) }
  }

  return (
    <div>
      <TopBar title="Doctors" subtitle="Manage doctor profiles and availability" />
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input className="input-field pl-9" placeholder="Search doctors..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input-field w-auto" value={specFilter} onChange={e => setSpecFilter(e.target.value)}>
            <option value="">All specializations</option>
            {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={openAdd} className="btn-primary"><Plus className="h-4 w-4" /> Add Doctor</button>
        </div>
        {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}
        {loading ? <LoadingSpinner /> : (
          <div className="card overflow-hidden p-0">
            {filtered.length === 0 ? <EmptyState icon={UserCheck} title="No doctors found" action={<button onClick={openAdd} className="btn-primary">Add Doctor</button>} /> : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b"><tr>
                  <th className="table-header">Name</th>
                  <th className="table-header hidden sm:table-cell">Specialization</th>
                  <th className="table-header hidden md:table-cell">Experience</th>
                  <th className="table-header hidden lg:table-cell">Price</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">Dr. {d.firstName} {d.lastName}</td>
                      <td className="table-cell hidden sm:table-cell text-gray-600">{d.specialization}</td>
                      <td className="table-cell hidden md:table-cell text-gray-600">{d.experienceYears ? `${d.experienceYears} yrs` : '—'}</td>
                      <td className="table-cell hidden lg:table-cell text-gray-600">{d.consultationPrice ? `${d.consultationPrice} MAD` : '—'}</td>
                      <td className="table-cell">
                        {d.available
                          ? <span className="flex items-center gap-1 text-green-700 text-xs font-medium"><CheckCircle className="h-3.5 w-3.5" />Available</span>
                          : <span className="flex items-center gap-1 text-red-700 text-xs font-medium"><XCircle className="h-3.5 w-3.5" />Unavailable</span>}
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(d)} className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteId(d.id!)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6 border-b"><h2 className="text-lg font-semibold">{editingDoctor ? 'Edit Doctor' : 'Add Doctor'}</h2></div>
            <form onSubmit={handleSave} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">First Name *</label><input className="input-field" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
              <div><label className="label">Last Name *</label><input className="input-field" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
              <div><label className="label">Email *</label><input className="input-field" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="label">Phone</label><input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="label">Specialization *</label>
                <select className="input-field" required value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })}>
                  <option value="">Select specialization</option>
                  {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><label className="label">Experience (years)</label><input className="input-field" type="number" min="0" value={form.experienceYears} onChange={e => setForm({ ...form, experienceYears: Number(e.target.value) })} /></div>
              <div><label className="label">Consultation Price (MAD)</label><input className="input-field" type="number" min="0" value={form.consultationPrice} onChange={e => setForm({ ...form, consultationPrice: Number(e.target.value) })} /></div>
              <div className="flex items-center gap-3 pt-5">
                <input type="checkbox" id="available" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} className="h-4 w-4" />
                <label htmlFor="available" className="text-sm font-medium text-gray-700">Available for appointments</label>
              </div>
              <div className="sm:col-span-2"><label className="label">Description</label><textarea className="input-field min-h-20" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="sm:col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editingDoctor ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog isOpen={deleteId !== null} title="Delete Doctor" message="Delete this doctor? This cannot be undone." confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
