/**
 * Shrushrut — Hospital OPD Dynamic Queue Management System
 * Core TypeScript Interfaces & Enums
 */

export type DepartmentId = 
  | 'cardiology'
  | 'orthopedics'
  | 'neurology'
  | 'pulmonology'
  | 'general_medicine'
  | 'pediatrics'
  | 'gynecology'
  | 'dentistry'
  | 'ophthalmology';

export type BookingStatus = 'BOOKED' | 'CANCELLED';

export type ArrivalStatus = 'PENDING' | 'ARRIVED' | 'NO_SHOW';

export type QueueStatus = 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED';

export type Priority = 'NORMAL' | 'EMERGENCY';

export type DoctorStatus = 'AVAILABLE' | 'ON_BREAK' | 'OFF_DUTY';

export interface Department {
  id: DepartmentId;
  name: string;
  code: string; // e.g., 'CARD', 'ORTH', 'NEUR'
  tokenPrefix: string; // e.g., 'C', 'O', 'N'
  iconName: string;
  description: string;
  floor: string;
  roomPrefix: string;
  activeDoctorsCount: number;
}

export interface Doctor {
  id: string;
  name: string;
  doctorNo: string;     // e.g. "DR-1024"
  assistantNo: string;  // e.g. "AS-204"
  specialization: string;
  departmentId: DepartmentId;
  experienceYears: number;
  consultationFee?: number; // e.g. 800
  avatar?: string;
  opdTiming: string;    // e.g. "10:00 AM – 2:00 PM"
  roomNo: string;       // e.g. "OPD Room 104"
  status: DoctorStatus;
  completedConsultations: number;
  recentDurations: number[]; // Rolling window of last N consultation times in minutes (e.g. [8, 12, 10, 15, 10])
  currentPatientToken?: string;
  consultationStartedAt?: string; // ISO string when current consultation started
}

export interface Booking {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  email: string;
  address: string;
  reason: string;
  doctorId: string;
  departmentId: DepartmentId;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  tokenNumber: string;    // e.g. "C-024"
  
  // Explicit separated state fields per requirements
  bookingStatus: BookingStatus;
  arrivalStatus: ArrivalStatus;
  queueStatus: QueueStatus;
  priority: Priority;
  
  priorityReason?: string;
  priorityTimestamp?: number;
  
  consultationStartTime?: string; // ISO or time string
  consultationEndTime?: string;
  consultationDuration?: number;   // In minutes
  
  createdAt: string;
  arrivedAt?: string;
  estimatedWaitMinutes?: number;
}

export interface QueueSnapshot {
  departmentId: DepartmentId;
  departmentName: string;
  totalPatientsWaiting: number;
  currentlyConsultingToken?: string;
  currentlyConsultingDoctor?: string;
  estimatedWaitMinutes: number;
  statusDescription: 'Light' | 'Moderately Busy' | 'High Volume' | 'Critical';
  activeDoctorsCount: number;
  tokenPrefix: string;
}

export interface QueuePositionResult {
  tokenNumber: string;
  position: number;
  patientsAhead: number;
  currentlyConsultingToken?: string;
  currentlyConsultingPatientName?: string;
  estimatedWaitMinutes: number;
  status: QueueStatus;
  arrivalStatus: ArrivalStatus;
  bookingStatus: BookingStatus;
  priority: Priority;
  doctorName: string;
  doctorId: string;
  departmentName: string;
  departmentId: DepartmentId;
  roomNo: string;
  averageConsultationTime: number;
}

export interface DoctorWorkloadMetric {
  doctor: Doctor;
  patientsWaiting: number;
  averageConsultationMinutes: number;
  currentPatientToken?: string;
  estimatedQueueMinutes: number;
  workloadStatus: 'OPTIMAL' | 'MODERATE' | 'HEAVY';
  isRecommended: boolean;
}

export interface Feedback {
  id: string;
  patientName: string;
  tokenNumber?: string;
  doctorId?: string;
  departmentId?: DepartmentId;
  hospitalExperience: number; // 1-5
  doctorExperience: number;   // 1-5
  waitingTimeRating: number;  // 1-5
  overallRating: number;      // 1-5
  comments: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'OPD_REGISTRAR' | 'CHIEF_MEDICAL_OFFICER' | 'DOCTOR';
  departmentId?: DepartmentId;
  doctorId?: string;
  permissions?: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'emergency';
  timestamp: number;
  targetToken?: string;
  targetDepartment?: DepartmentId;
  read?: boolean;
}

export interface TransactionalEmailLog {
  id: string;
  to: string;
  recipientType?: 'PATIENT' | 'ADMIN';
  patientName: string;
  tokenNumber: string;
  doctorName: string;
  departmentName: string;
  appointmentDate: string;
  appointmentTime: string;
  estimatedWait: number;
  subject: string;
  sentAt: string;
  status: 'SENT' | 'QUEUED' | 'SIMULATED';
  htmlContent: string;
}
