import apiClient from './axiosConfig'
import type { AuthUser, Doctor, DoctorCreate, DoctorUpdate } from '../types'

const BASE = '/api/doctors'

export const doctorApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post<AuthUser>(`${BASE}/auth/login`, credentials),
  getAll: () => apiClient.get<Doctor[]>(BASE),
  getById: (id: number) => apiClient.get<Doctor>(`${BASE}/${id}`),
  getAvailable: () => apiClient.get<Doctor[]>(`${BASE}/available`),
  getBySpecialization: (spec: string) =>
    apiClient.get<Doctor[]>(`${BASE}/specialization/${spec}`),
  search: (keyword: string) => apiClient.get<Doctor[]>(`${BASE}/search?keyword=${keyword}`),
  create: (doctor: DoctorCreate) =>
    apiClient.post<Doctor>(BASE, doctor),
  update: (id: number, doctor: DoctorUpdate) =>
    apiClient.put<Doctor>(`${BASE}/${id}`, doctor),
  delete: (id: number) => apiClient.delete(`${BASE}/${id}`),
}
