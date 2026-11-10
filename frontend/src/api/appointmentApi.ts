import apiClient from './axiosConfig'
import type { Appointment } from '../types'

const BASE = '/api/appointments'

export const appointmentApi = {
  getAll: () => apiClient.get<Appointment[]>(BASE),
  getById: (id: number) => apiClient.get<Appointment>(`${BASE}/${id}`),
  getByPatient: (patientId: number) =>
    apiClient.get<Appointment[]>(`${BASE}/patient/${patientId}`),
  getByDoctor: (doctorId: number) =>
    apiClient.get<Appointment[]>(`${BASE}/doctor/${doctorId}`),
  create: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'patientName' | 'patientEmail' | 'doctorName' | 'doctorSpecialization'>) =>
    apiClient.post<Appointment>(BASE, appointment),
  update: (id: number, appointment: Partial<Appointment>) =>
    apiClient.put<Appointment>(`${BASE}/${id}`, appointment),
  updateStatus: (id: number, status: string) =>
    apiClient.patch<Appointment>(`${BASE}/${id}/status`, { status }),
  delete: (id: number) => apiClient.delete(`${BASE}/${id}`),
}
