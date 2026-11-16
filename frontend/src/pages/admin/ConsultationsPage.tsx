import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { TopBar } from '../../components/layout/TopBar'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { ErrorAlert } from '../../components/common/ErrorAlert'
import { EmptyState } from '../../components/common/EmptyState'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { appointmentApi } from '../../api/appointmentApi'
import { consultationApi } from '../../api/consultationApi'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate, formatDateTime, getErrorMessage } from '../../utils/statusUtils'
import type { Appointment, Consultation } from '../../types'

const EMPTY: Omit<Consultation, 'id' | 'createdAt'> = {
  appointmentId: 0, patientId: 0, doctorId: 0,
  diagnosis: '', prescription: '', notes: '', consultationDate: '',
}

export function ConsultationsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    setError('')
    try {
      if (user?.role === 'DOCTOR') {
        if (user.id === undefined) throw new Error('The signed-in doctor account has no ID')
        const [consultationsResponse, appointmentsResponse] = await Promise.all([
          consultationApi.getByDoctor(user.id),
          appointmentApi.getByDoctor(user.id),
        ])
        setConsultations(consultationsResponse.data)
        setAppointments(appointmentsResponse.data)
      } else if (user?.role === 'ADMIN') {
        const [consultationsResponse, appointmentsResponse] = await Promise.all([
          consultationApi.getAll(),
          appointmentApi.getAll(),
        ])
        setConsultations(consultationsResponse.data)
        setAppointments(appointmentsResponse.data)
      } else {
        throw new Error('Only doctors and admins can view consultations')
      }
    }
    catch (err) { setError(getErrorMessage(err)) }
    finally { setLoading(false) }
  }

  const openAdd = (appointment?: Appointment) => {
    if (appointment && consultations.some(c => c.appointmentId === appointment.id)) {
      toast.error('This appointment already has a consultation')
      return
    }
    setForm({
      ...EMPTY,
      appointmentId: appointment?.id ?? 0,
      patientId: appointment?.patientId ?? 0,
      doctorId: appointment?.doctorId ?? 0,
    })
    setEditingId(null)
    setShowForm(true)
  }
  const openEdit = (c: Consultation) => {
    setForm({ appointmentId: c.appointmentId, patientId: c.patientId, doctorId: c.doctorId, diagnosis: c.diagnosis || '', prescription: c.prescription || '', notes: c.notes || '', consultationDate: c.consultationDate || '' })
    setEditingId(c.id!); setShowForm(true)
  }

  useEffect(() => { fetchAll() }, [])

  useEffect(() => {
    const appointmentId = location.state?.appointmentId
    if (loading || !appointmentId) return
    const appointment = appointments.find(a => a.id === appointmentId)
    if (appointment) openAdd(appointment)
    else toast.error('Appointment could not be found')
    navigate(location.pathname, { replace: true, state: null })
  }, [appointments, loading, location.pathname, location.state, navigate])

  const updateAppointment = (appointmentId: number) => {
    const appointment = appointments.find(a => a.id === appointmentId)
    if (!appointment) return
    setForm({
      ...form,
      appointmentId,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
    })
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
          <button onClick={() => openAdd()} className="btn-primary"><Plus className="h-4 w-4" /> New Consultation</button>
        </div>
        {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}
        {loading ? <LoadingSpinner /> : (
          <div className="card overflow-hidden p-0">
            {consultations.length === 0 ? <EmptyState icon={FileText} title="No consultations yet" action={<button onClick={() => openAdd()} className="btn-primary">Add Consultation</button>} /> : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b"><tr>
                  <th className="table-header">Appointment</th>
                  <th className="table-header">Patient</th>
                  <th className="table-header">Doctor</th>
                  <th className="table-header hidden md:table-cell">Diagnosis</th>
                  <th className="table-header hidden lg:table-cell">Date</th>
                  <th className="table-header">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {consultations.map(c => {
                    const appointment = appointments.find(a => a.id === c.appointmentId)
                    return (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="table-cell">{appointment
                          ? <>{formatDate(appointment.appointmentDate)}<br /><span className="text-xs text-gray-400">{appointment.appointmentTime}</span></>
                          : 'Appointment details unavailable'}</td>
                        <td className="table-cell">{appointment?.patientName || 'Patient unavailable'}</td>
                        <td className="table-cell">{appointment?.doctorName || 'Doctor unavailable'}</td>
                        <td className="table-cell hidden md:table-cell text-gray-600 max-w-xs truncate">{c.diagnosis || '—'}</td>
                        <td className="table-cell hidden lg:table-cell text-gray-500 text-xs">{formatDateTime(c.consultationDate)}</td>
                        <td className="table-cell">
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(c)} className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => setDeleteId(c.id!)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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
              <div>
                <label className="label">Appointment *</label>
                <select
                  className="input-field"
                  required
                  disabled={editingId !== null}
                  value={form.appointmentId || ''}
                  onChange={e => updateAppointment(Number(e.target.value))}
                >
                  <option value="">Select an appointment</option>
                  {appointments
                    .filter(a => editingId !== null
                      ? a.id === form.appointmentId
                      : !consultations.some(c => c.appointmentId === a.id))
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.patientName || 'Patient unavailable'} — {a.doctorName || 'Doctor unavailable'} · {formatDate(a.appointmentDate)} {a.appointmentTime}
                      </option>
                    ))}
                </select>
                {form.appointmentId > 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    Patient: {appointments.find(a => a.id === form.appointmentId)?.patientName || 'Unavailable'}
                    {' · '}Doctor: {appointments.find(a => a.id === form.appointmentId)?.doctorName || 'Unavailable'}
                  </p>
                )}
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
