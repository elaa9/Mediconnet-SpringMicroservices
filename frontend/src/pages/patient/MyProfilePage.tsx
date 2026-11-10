import { useEffect, useState } from 'react'
import { Calendar, FileText, User, Clock } from 'lucide-react'
import { TopBar } from '../../components/layout/TopBar'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import { patientApi } from '../../api/patientApi'
import { appointmentApi } from '../../api/appointmentApi'
import { consultationApi } from '../../api/consultationApi'
import { getAppointmentStatusColor, formatDate, formatDateTime } from '../../utils/statusUtils'
import type { Patient, Appointment, Consultation } from '../../types'

export function MyProfilePage() {
  const { user } = useAuth()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      if (!user?.id) return
      try {
        const [pRes, aRes, cRes] = await Promise.allSettled([
          patientApi.getById(user.id),
          appointmentApi.getByPatient(user.id),
          consultationApi.getByPatient(user.id),
        ])
        if (pRes.status === 'fulfilled') setPatient(pRes.value.data)
        if (aRes.status === 'fulfilled') setAppointments(aRes.value.data)
        if (cRes.status === 'fulfilled') setConsultations(cRes.value.data)
      } finally { setLoading(false) }
    }
    fetch()
  }, [user])

  const upcoming = appointments.filter(a => ['PENDING', 'CONFIRMED'].includes(a.status))
  const past = appointments.filter(a => ['COMPLETED', 'CANCELLED'].includes(a.status))

  return (
    <div>
      <TopBar title="My Profile" subtitle="Your health dashboard" />
      <div className="p-6 space-y-6">
        {loading ? <LoadingSpinner /> : (
          <>
            {/* Patient card */}
            {patient && (
              <div className="card flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-full"><User className="h-6 w-6 text-green-600" /></div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div><div className="text-xs text-gray-500">Full Name</div><div className="font-semibold">{patient.firstName} {patient.lastName}</div></div>
                  <div><div className="text-xs text-gray-500">Email</div><div>{patient.email}</div></div>
                  <div><div className="text-xs text-gray-500">Phone</div><div>{patient.phone || '—'}</div></div>
                  <div><div className="text-xs text-gray-500">Date of Birth</div><div>{patient.dateOfBirth ? formatDate(patient.dateOfBirth) : '—'}</div></div>
                  <div><div className="text-xs text-gray-500">Gender</div><div>{patient.gender || '—'}</div></div>
                  <div><div className="text-xs text-gray-500">Address</div><div>{patient.address || '—'}</div></div>
                  {patient.medicalHistory && (
                    <div className="sm:col-span-2 lg:col-span-3"><div className="text-xs text-gray-500 mb-1">Medical History</div><div className="bg-gray-50 p-3 rounded-lg text-sm">{patient.medicalHistory}</div></div>
                  )}
                </div>
              </div>
            )}

            {/* Upcoming appointments */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4"><Clock className="h-5 w-5 text-primary-600" /><h2 className="text-lg font-semibold">Upcoming Appointments ({upcoming.length})</h2></div>
              {upcoming.length === 0 ? <p className="text-sm text-gray-500">No upcoming appointments.</p> : (
                <div className="space-y-3">
                  {upcoming.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{a.doctorName || `Doctor #${a.doctorId}`}</div>
                        <div className="text-xs text-gray-500">{a.doctorSpecialization} · {formatDate(a.appointmentDate)} at {a.appointmentTime}</div>
                        {a.reason && <div className="text-xs text-gray-400 mt-1">{a.reason}</div>}
                      </div>
                      <span className={`badge ${getAppointmentStatusColor(a.status)}`}>{a.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past appointments */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4"><Calendar className="h-5 w-5 text-gray-600" /><h2 className="text-lg font-semibold">Appointment History ({past.length})</h2></div>
              {past.length === 0 ? <p className="text-sm text-gray-500">No past appointments.</p> : (
                <div className="space-y-2">
                  {past.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                      <div><div className="text-sm font-medium">{a.doctorName || `Doctor #${a.doctorId}`}</div><div className="text-xs text-gray-500">{formatDate(a.appointmentDate)}</div></div>
                      <span className={`badge ${getAppointmentStatusColor(a.status)}`}>{a.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Consultations */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4"><FileText className="h-5 w-5 text-orange-600" /><h2 className="text-lg font-semibold">Consultation History ({consultations.length})</h2></div>
              {consultations.length === 0 ? <p className="text-sm text-gray-500">No consultation records.</p> : (
                <div className="space-y-3">
                  {consultations.map(c => (
                    <div key={c.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="text-xs text-gray-500 mb-2">{formatDateTime(c.consultationDate)}</div>
                      {c.diagnosis && <div className="mb-2"><span className="text-xs font-semibold text-gray-500">Diagnosis</span><p className="text-sm mt-0.5">{c.diagnosis}</p></div>}
                      {c.prescription && <div className="mb-2"><span className="text-xs font-semibold text-gray-500">Prescription</span><p className="text-sm mt-0.5">{c.prescription}</p></div>}
                      {c.notes && <div><span className="text-xs font-semibold text-gray-500">Notes</span><p className="text-sm mt-0.5">{c.notes}</p></div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
