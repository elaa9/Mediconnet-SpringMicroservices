import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { TopBar } from '../../components/layout/TopBar'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { ErrorAlert } from '../../components/common/ErrorAlert'
import { EmptyState } from '../../components/common/EmptyState'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { consultationApi } from '../../api/consultationApi'
import { formatDateTime, getErrorMessage } from '../../utils/statusUtils'
import type { Consultation } from '../../types'

const EMPTY: Omit<Consultation, 'id' | 'createdAt'> = {
  appointmentId: 0, patientId: 0, doctorId: 0,
  diagnosis: '', prescription: '', notes: '', consultationDate: '',
}

export function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    try { const { data } = await consultationApi.getAll(); setConsultations(data) }
    catch (err) { setError(getErrorMessage(err)) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const openAdd = () => { setForm({ ...EMPTY }); setEditingId(null); setShowForm(true) }
  const openEdit = (c: Consultation) => {
    setForm({ appointmentId: c.appointmentId, patientId: c.patientId, doctorId: c.doctorId, diagnosis: c.diagnosis || '', prescription: c.prescription || '', notes: c.notes || '', consultationDate: c.consultationDate || '' })
    setEditingId(c.id!); setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editingId) { await consultationApi.update(editingId, form); toast.success('Consultation updated') }
      else { await consultationApi.create(form); toast.success('Consultation created') }
      setShowForm(false); fetchAll()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try { await consultationApi.delete(deleteId); toast.success('Consultation deleted'); setDeleteId(null); fetchAll() }
    catch (err) { toast.error(getErrorMessage(err)) }
  }

  return (
    <div>
      <TopBar title="Consultations" subtitle="Medical consultation records" />
      <div className="p-6">
        <div className="flex justify-end mb-6">
          <button onClick={openAdd} className="btn-primary"><Plus className="h-4 w-4" /> New Consultation</button>
        </div>
        {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}
        {loading ? <LoadingSpinner /> : (
          <div className="card overflow-hidden p-0">
            {consultations.length === 0 ? <EmptyState icon={FileText} title="No consultations yet" action={<button onClick={openAdd} className="btn-primary">Add Consultation</button>} /> : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b"><tr>
                  <th className="table-header">ID</th>
                  <th className="table-header">Appointment</th>
                  <th className="table-header">Patient</th>
                  <th className="table-header">Doctor</th>
                  <th className="table-header hidden md:table-cell">Diagnosis</th>
                  <th className="table-header hidden lg:table-cell">Date</th>
                  <th className="table-header">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {consultations.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="table-cell text-gray-500">#{c.id}</td>
                      <td className="table-cell">Apt #{c.appointmentId}</td>
                      <td className="table-cell">Patient #{c.patientId}</td>
                      <td className="table-cell">Doctor #{c.doctorId}</td>
                      <td className="table-cell hidden md:table-cell text-gray-600 max-w-xs truncate">{c.diagnosis || '—'}</td>
                      <td className="table-cell hidden lg:table-cell text-gray-500 text-xs">{formatDateTime(c.consultationDate)}</td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(c)} className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteId(c.id!)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
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
            <div className="p-6 border-b"><h2 className="text-lg font-semibold">{editingId ? 'Edit Consultation' : 'New Consultation'}</h2></div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div><label className="label">Appointment ID *</label><input className="input-field" type="number" required value={form.appointmentId || ''} onChange={e => setForm({ ...form, appointmentId: Number(e.target.value) })} /></div>
                <div><label className="label">Patient ID *</label><input className="input-field" type="number" required value={form.patientId || ''} onChange={e => setForm({ ...form, patientId: Number(e.target.value) })} /></div>
                <div><label className="label">Doctor ID *</label><input className="input-field" type="number" required value={form.doctorId || ''} onChange={e => setForm({ ...form, doctorId: Number(e.target.value) })} /></div>
              </div>
              <div><label className="label">Diagnosis</label><textarea className="input-field min-h-16" value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} /></div>
              <div><label className="label">Prescription</label><textarea className="input-field min-h-16" value={form.prescription} onChange={e => setForm({ ...form, prescription: e.target.value })} /></div>
              <div><label className="label">Notes</label><textarea className="input-field min-h-16" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <div><label className="label">Consultation Date</label><input className="input-field" type="datetime-local" value={form.consultationDate?.slice(0, 16)} onChange={e => setForm({ ...form, consultationDate: e.target.value })} /></div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog isOpen={deleteId !== null} title="Delete Consultation" message="Delete this consultation?" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
