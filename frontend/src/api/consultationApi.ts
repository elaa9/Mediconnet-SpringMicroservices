import apiClient from './axiosConfig'
import type { Consultation } from '../types'

const BASE = '/api/consultations'

export const consultationApi = {
  getAll: () => apiClient.get<Consultation[]>(BASE),
  getById: (id: number) => apiClient.get<Consultation>(`${BASE}/${id}`),
  getByPatient: (patientId: number) =>
    apiClient.get<Consultation[]>(`${BASE}/patient/${patientId}`),
  getByDoctor: (doctorId: number) =>
    apiClient.get<Consultation[]>(`${BASE}/doctor/${doctorId}`),
  getByAppointment: (appointmentId: number) =>
    apiClient.get<Consultation>(`${BASE}/appointment/${appointmentId}`),
  create: (consultation: Omit<Consultation, 'id' | 'createdAt'>) =>
    apiClient.post<Consultation>(BASE, consultation),
  update: (id: number, consultation: Partial<Consultation>) =>
    apiClient.put<Consultation>(`${BASE}/${id}`, consultation),
  delete: (id: number) => apiClient.delete(`${BASE}/${id}`),
}
