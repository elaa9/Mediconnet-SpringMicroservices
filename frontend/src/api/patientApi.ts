import apiClient from './axiosConfig'
import type { Patient } from '../types'

const BASE = '/api/patients'

export const patientApi = {
  getAll: () => apiClient.get<Patient[]>(BASE),
  getById: (id: number) => apiClient.get<Patient>(`${BASE}/${id}`),
  getByEmail: (email: string) => apiClient.get<Patient>(`${BASE}/email/${email}`),
  search: (keyword: string) => apiClient.get<Patient[]>(`${BASE}/search?keyword=${keyword}`),
  create: (patient: Omit<Patient, 'id' | 'createdAt'>) =>
    apiClient.post<Patient>(BASE, patient),
  update: (id: number, patient: Omit<Patient, 'id' | 'createdAt'>) =>
    apiClient.put<Patient>(`${BASE}/${id}`, patient),
  delete: (id: number) => apiClient.delete(`${BASE}/${id}`),
}
