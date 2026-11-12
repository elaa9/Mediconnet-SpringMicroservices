import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Search, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { TopBar } from '../../components/layout/TopBar'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { ErrorAlert } from '../../components/common/ErrorAlert'
import { EmptyState } from '../../components/common/EmptyState'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { appointmentApi } from '../../api/appointmentApi'
import { patientApi } from '../../api/patientApi'
import { doctorApi } from '../../api/doctorApi'
import { getAppointmentStatusColor, formatDate, getErrorMessage } from '../../utils/statusUtils'
import type { Appointment, Patient, Doctor } from '../../types'
import { useAuth } from '../../contexts/AuthContext'

const STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']

const EMPTY: Omit<Appointment, 'id' | 'createdAt' | 'patientName' | 'patientEmail' | 'doctorName' | 'doctorSpecialization'> = {
  patientId: 0, doctorId: 0, appointmentDate: '', appointmentTime: '', reason: '', status: 'PENDING',
}

export function AppointmentsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filtered, setFiltered] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    try {
      if (!user) return
      if (user.role === 'ADMIN') {
        const [aRes, pRes, dRes] = await Promise.all([
          appointmentApi.getAll(), patientApi.getAll(), doctorApi.getAll()
        ])
        setAppointments(aRes.data)
        setPatients(pRes.data)
        setDoctors(dRes.data)
      } else if (user.id) {
        const response = user.role === 'PATIENT'
          ? await appointmentApi.getByPatient(user.id)
          : await appointmentApi.getByDoctor(user.id)
        setAppointments(response.data)
      }
    } catch (err) { setError(getErrorMessage(err)) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [user])
  useEffect(() => {
    const kw = search.toLowerCase()
    setFiltered(appointments.filter(a =>
      (!statusFilter || a.status === statusFilter) &&
      (
        (a.patientName || '').toLowerCase().includes(kw) ||
        (a.doctorName || '').toLowerCase().includes(kw) ||
        (a.reason || '').toLowerCase().includes(kw)
      )
    ))
  }, [search, statusFilter, appointments])

  const openAdd = () => { setForm({ ...EMPTY }); setEditingId(null); setShowForm(true) }
  const openEdit = (a: Appointment) => {
    setForm({ patientId: a.patientId, doctorId: a.doctorId, appointmentDate: a.appointmentDate, appointmentTime: a.appointmentTime, reason: a.reason || '', status: a.status })
    setEditingId(a.id!); setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editingId) { await appointmentApi.update(editingId, form); toast.success('Appointment updated') }
      else { await appointmentApi.create(form); toast.success('Appointment created') }
      setShowForm(false); fetchAll()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try { await appointmentApi.delete(deleteId); toast.success('Appointment deleted'); setDeleteId(null); fetchAll() }
    catch (err) { toast.error(getErrorMessage(err)) }
  }

  return (
    <div>
      <TopBar title={isAdmin ? 'Appointments' : 'My Appointments'} subtitle={isAdmin ? 'Manage and track appointments' : 'Appointments linked to your account'} />
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input className="input-field pl-9" placeholder="Search by patient, doctor, or reason..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input-field w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          {isAdmin && <button onClick={openAdd} className="btn-primary"><Plus className="h-4 w-4" /> New Appointment</button>}
        </div>
        {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}
        {loading ? <LoadingSpinner /> : (
          <div className="card overflow-hidden p-0">
            {filtered.length === 0 ? <EmptyState icon={Calendar} title="No appointments found" action={isAdmin ? <button onClick={openAdd} className="btn-primary">Create Appointment</button> : undefined} /> : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b"><tr>
                  <th className="table-header">Patient</th>
                  <th className="table-header hidden sm:table-cell">Doctor</th>
                  <th className="table-header">Date & Time</th>
                  <th className="table-header hidden md:table-cell">Reason</th>
                  <th className="table-header">Status</th>
                  {isAdmin && <th className="table-header">Actions</th>}
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">{a.patientName || `Patient #${a.patientId}`}</td>
                      <td className="table-cell hidden sm:table-cell text-gray-600">{a.doctorName || `Doctor #${a.doctorId}`}</td>
                      <td className="table-cell text-gray-600">{formatDate(a.appointmentDate)}<br /><span className="text-xs text-gray-400">{a.appointmentTime}</span></td>
                      <td className="table-cell hidden md:table-cell text-gray-600 max-w-xs truncate">{a.reason || '—'}</td>
                      <td className="table-cell"><span className={`badge ${getAppointmentStatusColor(a.status)}`}>{a.status}</span></td>
                      {isAdmin && <td className="table-cell">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(a)} className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteId(a.id!)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>}
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
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b"><h2 className="text-lg font-semibold">{editingId ? 'Edit Appointment' : 'New Appointment'}</h2></div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div><label className="label">Patient *</label>
                <select className="input-field" required value={form.patientId || ''} onChange={e => setForm({ ...form, patientId: Number(e.target.value) })}>
                  <option value="">Select patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                </select>
              </div>
              <div><label className="label">Doctor *</label>
                <select className="input-field" required value={form.doctorId || ''} onChange={e => setForm({ ...form, doctorId: Number(e.target.value) })}>
                  <option value="">Select doctor</option>
                  {doctors.filter(d => d.available).map(d => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName} — {d.specialization}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Date *</label><input className="input-field" type="date" required value={form.appointmentDate} onChange={e => setForm({ ...form, appointmentDate: e.target.value })} /></div>
                <div><label className="label">Time *</label><input className="input-field" type="time" required value={form.appointmentTime} onChange={e => setForm({ ...form, appointmentTime: e.target.value })} /></div>
              </div>
              <div><label className="label">Reason</label><input className="input-field" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></div>
              {editingId && <div><label className="label">Status</label>
                <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog isOpen={deleteId !== null} title="Delete Appointment" message="Delete this appointment?" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
