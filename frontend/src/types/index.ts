// =====================================================================
// MediConnect TypeScript Type Definitions
// =====================================================================

export interface Patient {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  medicalHistory?: string;
  createdAt?: string;
}

export type PatientCreate = Omit<Patient, 'id' | 'createdAt'> & { password: string };
export type PatientUpdate = Omit<Patient, 'id' | 'createdAt'> & { password?: string };

export interface Doctor {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization: string;
  experienceYears?: number;
  description?: string;
  consultationPrice?: number;
  available?: boolean;
  createdAt?: string;
}

export type DoctorCreate = Omit<Doctor, 'id' | 'createdAt'> & { password: string };
export type DoctorUpdate = Omit<Doctor, 'id' | 'createdAt'> & { password?: string };

export interface Appointment {
  id?: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
  status: string;
  createdAt?: string;
  // @Transient enriched fields — populated by appointment-service via OpenFeign
  patientName?: string;
  patientEmail?: string;
  doctorName?: string;
  doctorSpecialization?: string;
}

export interface Consultation {
  id?: number;
  appointmentId: number;
  patientId: number;
  doctorId: number;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  consultationDate?: string;
  createdAt?: string;
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT';

export interface AuthUser {
  role: UserRole;
  name: string;
  id?: number;
  email?: string;
}

export interface ApiError {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  details?: Record<string, string>;
}
