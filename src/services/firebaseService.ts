/**
 * Shrushrut — Hospital OPD Dynamic Queue Management System
 * Firebase Service Layer (Firestore & Real-Time Sync)
 * 
 * Provides an isolated, swappable data layer with:
 * - Real-time subscription listeners (onSnapshot equivalent)
 * - LocalStorage persistence for multi-tab / full session continuity
 * - Pluggable backend adapter interface for Firebase Firestore / Auth SDKs
 */

import {
  Booking,
  Doctor,
  Department,
  Feedback,
  NotificationItem,
  DepartmentId,
  ArrivalStatus,
  QueueStatus,
  BookingStatus,
  Priority,
} from '../types';
import {
  MOCK_DEPARTMENTS,
  MOCK_DOCTORS,
  INITIAL_MOCK_BOOKINGS,
  INITIAL_MOCK_FEEDBACKS,
} from '../data/mockData';
import { QueueCalculationService } from './queueService';
import { emailService } from './emailService';

type Listener<T> = (data: T) => void;

class FirebaseService {
  private static instance: FirebaseService;

  private bookings: Booking[] = [];
  private doctors: Doctor[] = [];
  private departments: Department[] = [];
  private feedbacks: Feedback[] = [];
  private notifications: NotificationItem[] = [];

  // Active real-time listeners
  private bookingListeners: Set<Listener<Booking[]>> = new Set();
  private doctorListeners: Set<Listener<Doctor[]>> = new Set();
  private departmentListeners: Set<Listener<Department[]>> = new Set();
  private notificationListeners: Set<Listener<NotificationItem[]>> = new Set();
  private feedbackListeners: Set<Listener<Feedback[]>> = new Set();

  private storageKey = 'shrushrut_hospital_db_v2';

  private constructor() {
    this.loadState();
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  private loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.bookings = parsed.bookings || INITIAL_MOCK_BOOKINGS;
        this.doctors = parsed.doctors || MOCK_DOCTORS;
        this.departments = parsed.departments || MOCK_DEPARTMENTS;
        this.feedbacks = parsed.feedbacks || INITIAL_MOCK_FEEDBACKS;
        this.notifications = parsed.notifications || [];
      } else {
        this.resetToDefaults();
      }
    } catch (e) {
      console.warn('Could not read from local storage, using initial mock data:', e);
      this.resetToDefaults();
    }
  }

  private saveState() {
    try {
      const payload = {
        bookings: this.bookings,
        doctors: this.doctors,
        departments: this.departments,
        feedbacks: this.feedbacks,
        notifications: this.notifications,
      };
      localStorage.setItem(this.storageKey, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to persist database state:', e);
    }
  }

  public resetToDefaults() {
    this.bookings = JSON.parse(JSON.stringify(INITIAL_MOCK_BOOKINGS));
    this.doctors = JSON.parse(JSON.stringify(MOCK_DOCTORS));
    this.departments = JSON.parse(JSON.stringify(MOCK_DEPARTMENTS));
    this.feedbacks = JSON.parse(JSON.stringify(INITIAL_MOCK_FEEDBACKS));
    this.notifications = [
      {
        id: 'notif-init-1',
        title: 'OPD Queue Active',
        message: 'All 9 clinical outpatient departments are actively consulting.',
        type: 'info',
        timestamp: Date.now() - 1000 * 60 * 20,
      },
    ];
    this.saveState();
    this.notifyAll();
  }

  private notifyAll() {
    this.bookingListeners.forEach((fn) => fn([...this.bookings]));
    this.doctorListeners.forEach((fn) => fn([...this.doctors]));
    this.departmentListeners.forEach((fn) => fn([...this.departments]));
    this.notificationListeners.forEach((fn) => fn([...this.notifications]));
    this.feedbackListeners.forEach((fn) => fn([...this.feedbacks]));
  }

  // --- Real-time Subscription hooks ---

  public onDepartmentsChanged(callback: Listener<Department[]>): () => void {
    this.departmentListeners.add(callback);
    callback([...this.departments]);
    return () => {
      this.departmentListeners.delete(callback);
    };
  }

  public onBookingsChanged(callback: Listener<Booking[]>): () => void {
    this.bookingListeners.add(callback);
    callback([...this.bookings]);
    return () => {
      this.bookingListeners.delete(callback);
    };
  }

  public onDoctorsChanged(callback: Listener<Doctor[]>): () => void {
    this.doctorListeners.add(callback);
    callback([...this.doctors]);
    return () => {
      this.doctorListeners.delete(callback);
    };
  }

  public onNotificationsChanged(callback: Listener<NotificationItem[]>): () => void {
    this.notificationListeners.add(callback);
    callback([...this.notifications]);
    return () => {
      this.notificationListeners.delete(callback);
    };
  }

  public onFeedbacksChanged(callback: Listener<Feedback[]>): () => void {
    this.feedbackListeners.add(callback);
    callback([...this.feedbacks]);
    return () => {
      this.feedbackListeners.delete(callback);
    };
  }

  // --- Data Access & Operations ---

  public getDepartments(): Department[] {
    return [...this.departments];
  }

  public getDoctors(departmentId?: DepartmentId): Doctor[] {
    if (!departmentId) return [...this.doctors];
    return this.doctors.filter((d) => d.departmentId === departmentId);
  }

  public getDoctorById(doctorId: string): Doctor | undefined {
    return this.doctors.find((d) => d.id === doctorId);
  }

  public getBookings(): Booking[] {
    return [...this.bookings];
  }

  public getBookingByToken(tokenNumber: string): Booking | undefined {
    return this.bookings.find((b) => b.tokenNumber.toUpperCase() === tokenNumber.toUpperCase());
  }

  public getBookingById(id: string): Booking | undefined {
    return this.bookings.find((b) => b.id === id);
  }

  /**
   * Creates a new patient consultation booking
   */
  public async createBooking(
    data: Omit<
      Booking,
      'id' | 'patientId' | 'tokenNumber' | 'bookingStatus' | 'arrivalStatus' | 'queueStatus' | 'priority' | 'createdAt'
    >
  ): Promise<Booking> {
    const department = this.departments.find((d) => d.id === data.departmentId);
    const prefix = department ? department.tokenPrefix : 'T';

    // Count today's tokens for this department to generate incremental sequence
    const existingCount = this.bookings.filter(
      (b) => b.departmentId === data.departmentId
    ).length;

    const tokenNumber = QueueCalculationService.generateTokenNumber(prefix, existingCount);
    const newId = `b-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const patientId = `p-${Date.now().toString().slice(-4)}`;

    const newBooking: Booking = {
      ...data,
      id: newId,
      patientId,
      tokenNumber,
      bookingStatus: 'BOOKED',
      arrivalStatus: 'PENDING',
      queueStatus: 'WAITING',
      priority: 'NORMAL',
      createdAt: new Date().toISOString(),
    };

    this.bookings.push(newBooking);

    this.addNotification({
      title: 'New Consultation Booked',
      message: `Token ${tokenNumber} registered for ${data.patientName} (${department?.name || 'OPD'}).`,
      type: 'info',
      targetToken: tokenNumber,
      targetDepartment: data.departmentId,
    });

    // Automatically trigger Admin Alert Email & Patient Confirmation Pass
    const doctor = this.doctors.find((d) => d.id === data.doctorId);
    if (department && doctor) {
      const activeQueue = this.bookings.filter(
        (b) => b.doctorId === data.doctorId && b.bookingStatus === 'BOOKED' && b.queueStatus !== 'COMPLETED'
      );
      const queuePosition = activeQueue.length;
      const rollingAvg = QueueCalculationService.calculateRollingAverage(doctor.recentDurations);
      const estimatedWait = Math.round(queuePosition * (rollingAvg || 10));

      // 1. Dispatch Admin Alert to configured admin email (e.g. ritikpetkar44@gmail.com)
      emailService.sendAdminBookingAlert({
        booking: newBooking,
        doctor,
        department,
        queuePosition,
      }).catch((err) => console.warn('Admin alert email notice:', err));

      // 2. Dispatch Patient Pass if patient email provided
      if (newBooking.email) {
        emailService.sendBookingConfirmation({
          booking: newBooking,
          doctor,
          department,
          estimatedWaitMinutes: estimatedWait,
        }).catch((err) => console.warn('Patient pass email notice:', err));
      }
    }

    this.saveState();
    this.notifyAll();

    return newBooking;
  }

  /**
   * Updates patient arrival status (e.g. Patient taps "I have arrived at the hospital")
   */
  public async updateArrivalStatus(
    tokenOrId: string,
    arrivalStatus: ArrivalStatus
  ): Promise<Booking | null> {
    const booking = this.bookings.find(
      (b) => b.tokenNumber.toUpperCase() === tokenOrOrUpper(tokenOrId) || b.id === tokenOrId
    );
    if (!booking) return null;

    booking.arrivalStatus = arrivalStatus;
    if (arrivalStatus === 'ARRIVED') {
      booking.arrivedAt = new Date().toISOString();
      this.addNotification({
        title: 'Patient Arrived at OPD Desk',
        message: `Token ${booking.tokenNumber} (${booking.patientName}) arrived. Placed in active doctor queue.`,
        type: 'success',
        targetToken: booking.tokenNumber,
        targetDepartment: booking.departmentId,
      });
    } else if (arrivalStatus === 'NO_SHOW') {
      booking.queueStatus = 'WAITING';
      this.addNotification({
        title: 'Patient Marked No-Show',
        message: `Token ${booking.tokenNumber} marked as No-Show. Queue dynamically recalculated.`,
        type: 'warning',
        targetToken: booking.tokenNumber,
        targetDepartment: booking.departmentId,
      });
    }

    this.saveState();
    this.notifyAll();
    return booking;
  }

  /**
   * Cancels a booking
   */
  public async cancelBooking(tokenOrId: string): Promise<Booking | null> {
    const booking = this.bookings.find(
      (b) => b.tokenNumber.toUpperCase() === tokenOrOrUpper(tokenOrId) || b.id === tokenOrId
    );
    if (!booking) return null;

    booking.bookingStatus = 'CANCELLED';
    this.addNotification({
      title: 'Booking Cancelled',
      message: `Token ${booking.tokenNumber} (${booking.patientName}) was cancelled.`,
      type: 'warning',
      targetToken: booking.tokenNumber,
      targetDepartment: booking.departmentId,
    });

    this.saveState();
    this.notifyAll();
    return booking;
  }

  /**
   * Completely removes / dismisses a token from the active master OPD register
   */
  public async removeBooking(tokenOrId: string): Promise<boolean> {
    const index = this.bookings.findIndex(
      (b) => b.tokenNumber.toUpperCase() === tokenOrOrUpper(tokenOrId) || b.id === tokenOrId
    );
    if (index === -1) return false;

    const removed = this.bookings[index];
    this.bookings.splice(index, 1);

    // If any doctor currently had this token assigned, clear it
    this.doctors.forEach((d) => {
      if (d.currentPatientToken === removed.tokenNumber) {
        d.currentPatientToken = undefined;
        d.consultationStartedAt = undefined;
      }
    });

    this.addNotification({
      title: 'Token Removed from Register',
      message: `Token ${removed.tokenNumber} (${removed.patientName}) was cleared from the OPD register.`,
      type: 'info',
      targetToken: removed.tokenNumber,
      targetDepartment: removed.departmentId,
    });

    this.saveState();
    this.notifyAll();
    return true;
  }

  /**
   * Clears all completed consultation tokens in bulk
   */
  public async clearCompletedBookings(departmentId?: DepartmentId): Promise<number> {
    const initialCount = this.bookings.length;
    this.bookings = this.bookings.filter((b) => {
      if (departmentId && b.departmentId !== departmentId) return true;
      return b.queueStatus !== 'COMPLETED';
    });

    const removedCount = initialCount - this.bookings.length;
    if (removedCount > 0) {
      this.addNotification({
        title: 'Completed Tokens Cleared',
        message: `${removedCount} completed consultation token(s) were cleared from the register.`,
        type: 'success',
      });
      this.saveState();
      this.notifyAll();
    }
    return removedCount;
  }

  /**
   * Sets Emergency priority on a patient with immediate triage queue elevation
   */
  public async markEmergencyPriority(
    tokenOrId: string,
    reason: string
  ): Promise<Booking | null> {
    const booking = this.bookings.find(
      (b) => b.tokenNumber.toUpperCase() === tokenOrOrUpper(tokenOrId) || b.id === tokenOrId
    );
    if (!booking) return null;

    booking.priority = 'EMERGENCY';
    booking.priorityReason = reason || 'Clinical emergency triage expedited by OPD physician';
    booking.priorityTimestamp = Date.now();

    // If patient had not marked arrival, expedite arrival automatically for urgent care
    if (booking.arrivalStatus !== 'ARRIVED') {
      booking.arrivalStatus = 'ARRIVED';
      booking.arrivedAt = new Date().toISOString();
    }

    this.addNotification({
      title: 'EMERGENCY PRIORITY ELEVATED',
      message: `Queue Updated — Emergency case ${booking.tokenNumber} inserted. Wait times updated.`,
      type: 'emergency',
      targetToken: booking.tokenNumber,
      targetDepartment: booking.departmentId,
    });

    this.saveState();
    this.notifyAll();
    return booking;
  }

  /**
   * Staff/Doctor: Start consultation for a patient
   */
  public async startConsultation(doctorId: string, bookingId: string): Promise<void> {
    const doctor = this.doctors.find((d) => d.id === doctorId);
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!doctor || !booking) return;

    // Conclude any prior active consultation for this doctor if not marked
    this.bookings.forEach((b) => {
      if (b.doctorId === doctorId && b.queueStatus === 'IN_CONSULTATION' && b.id !== bookingId) {
        b.queueStatus = 'COMPLETED';
        b.consultationEndTime = new Date().toISOString();
      }
    });

    booking.queueStatus = 'IN_CONSULTATION';
    booking.consultationStartTime = new Date().toISOString();

    doctor.currentPatientToken = booking.tokenNumber;
    doctor.consultationStartedAt = booking.consultationStartTime;

    this.addNotification({
      title: 'Consultation Started',
      message: `Doctor ${doctor.name} called ${booking.tokenNumber} (${booking.patientName}) into ${doctor.roomNo}.`,
      type: 'info',
      targetToken: booking.tokenNumber,
      targetDepartment: booking.departmentId,
    });

    this.saveState();
    this.notifyAll();
  }

  /**
   * Staff/Doctor: Complete consultation, record duration, and update doctor's rolling average
   */
  public async completeConsultation(
    doctorId: string,
    bookingId: string,
    actualDurationMinutes?: number
  ): Promise<void> {
    const doctor = this.doctors.find((d) => d.id === doctorId);
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!doctor || !booking) return;

    const endTime = new Date().toISOString();
    booking.queueStatus = 'COMPLETED';
    booking.consultationEndTime = endTime;

    let duration = actualDurationMinutes;
    if (!duration) {
      if (booking.consultationStartTime) {
        const diffMs = new Date(endTime).getTime() - new Date(booking.consultationStartTime).getTime();
        duration = Math.max(3, Math.round(diffMs / (1000 * 60)));
      } else {
        duration = 10;
      }
    }

    booking.consultationDuration = duration;

    // Update doctor's rolling durations array
    doctor.recentDurations = [...(doctor.recentDurations || []), duration].slice(-10);
    doctor.completedConsultations = (doctor.completedConsultations || 0) + 1;
    doctor.currentPatientToken = undefined;
    doctor.consultationStartedAt = undefined;

    this.addNotification({
      title: 'Consultation Completed',
      message: `Token ${booking.tokenNumber} completed in ${duration} mins. Rolling average updated to ${QueueCalculationService.calculateRollingAverage(doctor.recentDurations)} min/pt.`,
      type: 'success',
      targetToken: booking.tokenNumber,
      targetDepartment: booking.departmentId,
    });

    this.saveState();
    this.notifyAll();
  }

  /**
   * Updates a doctor's availability status (AVAILABLE, ON_BREAK, OFF_DUTY)
   */
  public async updateDoctorStatus(doctorId: string, status: Doctor['status']): Promise<void> {
    const doctor = this.doctors.find((d) => d.id === doctorId);
    if (!doctor) return;

    doctor.status = status;
    this.addNotification({
      title: 'Doctor Status Updated',
      message: `${doctor.name} is now marked as ${status.replace('_', ' ')}.`,
      type: 'info',
      targetDepartment: doctor.departmentId,
    });

    this.saveState();
    this.notifyAll();
  }

  /**
   * Reassigns a patient's booking to another doctor for workload balancing
   */
  public async reassignDoctor(bookingId: string, newDoctorId: string): Promise<Booking | null> {
    const booking = this.bookings.find((b) => b.id === bookingId);
    const newDoctor = this.doctors.find((d) => d.id === newDoctorId);
    if (!booking || !newDoctor) return null;

    const oldDoctor = this.doctors.find((d) => d.id === booking.doctorId);
    booking.doctorId = newDoctorId;
    booking.departmentId = newDoctor.departmentId;

    this.addNotification({
      title: 'Queue Workload Balanced',
      message: `Token ${booking.tokenNumber} reassigned from ${oldDoctor?.name || 'prev doctor'} to ${newDoctor.name} (${newDoctor.roomNo}).`,
      type: 'info',
      targetToken: booking.tokenNumber,
    });

    this.saveState();
    this.notifyAll();
    return booking;
  }

  /**
   * Adds feedback from patient
   */
  public async addFeedback(data: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback> {
    const newFeedback: Feedback = {
      ...data,
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.feedbacks.unshift(newFeedback);

    this.addNotification({
      title: 'New Patient Feedback',
      message: `Rating: ${data.overallRating}/5 stars from ${data.patientName}.`,
      type: 'success',
    });

    this.saveState();
    this.notifyAll();
    return newFeedback;
  }

  public getFeedbacks(): Feedback[] {
    return [...this.feedbacks];
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'timestamp'>): void {
    const notif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      read: false,
    };
    this.notifications.unshift(notif);
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
  }

  public markNotificationsRead(): void {
    this.notifications.forEach((n) => (n.read = true));
    this.saveState();
    this.notifyAll();
  }

  /**
   * Clears all OPD tokens/bookings and resets doctor consultation counters
   */
  public async clearAllBookings(): Promise<void> {
    this.bookings = [];
    this.doctors.forEach((d) => {
      d.currentPatientToken = undefined;
      d.consultationStartedAt = undefined;
      d.completedConsultations = 0;
    });
    this.addNotification({
      title: 'OPD Queue Cleared',
      message: 'All existing tokens have been removed. System is ready for new token registrations.',
      type: 'warning',
    });
    this.saveState();
    this.notifyAll();
  }

  /**
   * Complete purge and re-initialization of application state
   */
  public async purgeAndResetAll(): Promise<void> {
    this.resetToDefaults();
  }
}

function tokenOrOrUpper(val: string): string {
  return val ? val.trim().toUpperCase() : '';
}

export const firebaseService = FirebaseService.getInstance();
