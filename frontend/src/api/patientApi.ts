import apiClient from './axiosConfig'
import type { AuthUser, Patient, PatientCreate, PatientUpdate } from '../types'

const BASE = '/api/patients'

export const patientApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post<AuthUser>(`${BASE}/auth/login`, credentials),
  getAll: () => apiClient.get<Patient[]>(BASE),
  getById: (id: number) => apiClient.get<Patient>(`${BASE}/${id}`),
  getByEmail: (email: string) => apiClient.get<Patient>(`${BASE}/email/${email}`),
  search: (keyword: string) => apiClient.get<Patient[]>(`${BASE}/search?keyword=${keyword}`),
  create: (patient: PatientCreate) =>
    apiClient.post<Patient>(BASE, patient),
  update: (id: number, patient: PatientUpdate) =>
    apiClient.put<Patient>(`${BASE}/${id}`, patient),
  delete: (id: number) => apiClient.delete(`${BASE}/${id}`),
}
