import apiClient from './axiosConfig'
import type { Doctor } from '../types'

const BASE = '/api/doctors'

export const doctorApi = {
  getAll: () => apiClient.get<Doctor[]>(BASE),
  getById: (id: number) => apiClient.get<Doctor>(`${BASE}/${id}`),
  getAvailable: () => apiClient.get<Doctor[]>(`${BASE}/available`),
  getBySpecialization: (spec: string) =>
    apiClient.get<Doctor[]>(`${BASE}/specialization/${spec}`),
  search: (keyword: string) => apiClient.get<Doctor[]>(`${BASE}/search?keyword=${keyword}`),
  create: (doctor: Omit<Doctor, 'id' | 'createdAt'>) =>
    apiClient.post<Doctor>(BASE, doctor),
  update: (id: number, doctor: Omit<Doctor, 'id' | 'createdAt'>) =>
    apiClient.put<Doctor>(`${BASE}/${id}`, doctor),
  delete: (id: number) => apiClient.delete(`${BASE}/${id}`),
}
