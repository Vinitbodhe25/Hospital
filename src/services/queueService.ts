/**
 * Shrushrut — Hospital OPD Dynamic Queue Management System
 * Core Queue Calculation Engine
 * 
 * Implements pure, isolated mathematical logic for:
 * 1. Rolling average consultation duration (last N patient visits)
 * 2. Dynamic wait-time computation (Patients Ahead * Rolling Avg)
 * 3. Priority & Emergency queue sorting (triage queueing)
 * 4. Doctor workload balancing & optimal doctor recommendation
 * 5. Department OPD load snapshots
 */

import {
  Booking,
  Doctor,
  DepartmentId,
  QueuePositionResult,
  QueueSnapshot,
  DoctorWorkloadMetric,
} from '../types';

export class QueueCalculationService {
  /**
   * Default fallback consultation duration in minutes when insufficient history exists
   */
  private static DEFAULT_AVG_DURATION_MINUTES = 10;

  /**
   * Maximum history window size for calculating the rolling average
   */
  private static ROLLING_WINDOW_SIZE = 5;

  /**
   * Calculates the rolling average consultation time from the last N records.
   * e.g., Last 5: [8, 12, 10, 15, 10] => Average: 11 mins
   */
  public static calculateRollingAverage(
    durations: number[] = [],
    fallback: number = this.DEFAULT_AVG_DURATION_MINUTES
  ): number {
    if (!durations || durations.length === 0) {
      return fallback;
    }
    const recent = durations.slice(-this.ROLLING_WINDOW_SIZE);
    const sum = recent.reduce((acc, curr) => acc + curr, 0);
    const avg = sum / recent.length;
    return Math.max(3, Math.round(avg * 10) / 10); // Minimum 3 mins for clinical realism
  }

  /**
   * Dynamic Wait-Time Formula:
   * Estimated Wait = (Patients Ahead * Average Consultation Time) + (Remaining time on current consultation)
   */
  public static calculateEstimatedWaitTime(
    patientsAhead: number,
    rollingAvgMinutes: number,
    isCurrentlyConsulting: boolean = false,
    consultationStartedAt?: string
  ): number {
    if (patientsAhead < 0) return 0;

    let baseWait = patientsAhead * rollingAvgMinutes;

    // If there is someone currently in consultation, estimate how many minutes are left for them
    if (isCurrentlyConsulting && consultationStartedAt) {
      const startTime = new Date(consultationStartedAt).getTime();
      const now = Date.now();
      const elapsedMinutes = Math.max(0, Math.floor((now - startTime) / (1000 * 60)));
      const remainingMinutes = Math.max(1, rollingAvgMinutes - elapsedMinutes);
      // Replace one unit of average time with the actual estimated remaining time
      baseWait = Math.max(0, (patientsAhead - 1) * rollingAvgMinutes + remainingMinutes);
    }

    return Math.max(0, Math.round(baseWait));
  }

  /**
   * Filters and sorts the active queue for a specific doctor according to hospital policy:
   * 1. Status must be 'ARRIVED' and BookingStatus must be 'BOOKED' and QueueStatus is not 'COMPLETED'
   * 2. 'IN_CONSULTATION' is at the very top (index 0)
   * 3. Waiting 'EMERGENCY' cases come immediately after current consultation, ordered by priorityTimestamp
   * 4. Waiting 'NORMAL' cases follow, ordered by arrival time (or creation time)
   */
  public static getSortedActiveQueueForDoctor(
    bookings: Booking[],
    doctorId: string
  ): Booking[] {
    const doctorBookings = bookings.filter(
      (b) =>
        b.doctorId === doctorId &&
        b.bookingStatus === 'BOOKED' &&
        b.arrivalStatus === 'ARRIVED' &&
        b.queueStatus !== 'COMPLETED'
    );

    const inConsultation = doctorBookings.filter((b) => b.queueStatus === 'IN_CONSULTATION');
    const waiting = doctorBookings.filter((b) => b.queueStatus === 'WAITING');

    const emergencies = waiting.filter((b) => b.priority === 'EMERGENCY');
    const normals = waiting.filter((b) => b.priority !== 'EMERGENCY');

    // Sort emergencies by priority timestamp or arrival time
    emergencies.sort((a, b) => {
      const timeA = a.priorityTimestamp || (a.arrivedAt ? new Date(a.arrivedAt).getTime() : 0);
      const timeB = b.priorityTimestamp || (b.arrivedAt ? new Date(b.arrivedAt).getTime() : 0);
      return timeA - timeB;
    });

    // Sort normal patients by arrival time or creation time
    normals.sort((a, b) => {
      const timeA = a.arrivedAt ? new Date(a.arrivedAt).getTime() : new Date(a.createdAt).getTime();
      const timeB = b.arrivedAt ? new Date(b.arrivedAt).getTime() : new Date(b.createdAt).getTime();
      return timeA - timeB;
    });

    return [...inConsultation, ...emergencies, ...normals];
  }

  /**
   * Calculates real-time queue position and dynamic wait-time for a specific patient token
   */
  public static calculateQueuePosition(
    bookings: Booking[],
    targetToken: string,
    doctors: Doctor[]
  ): QueuePositionResult | null {
    const booking = bookings.find((b) => b.tokenNumber.toUpperCase() === targetToken.toUpperCase());
    if (!booking) return null;

    const doctor = doctors.find((d) => d.id === booking.doctorId);
    const doctorName = doctor ? doctor.name : 'OPD Physician';
    const roomNo = doctor ? doctor.roomNo : 'Room 101';
    const departmentName = booking.departmentId.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    const rollingAvg = doctor
      ? this.calculateRollingAverage(doctor.recentDurations)
      : this.DEFAULT_AVG_DURATION_MINUTES;

    // If cancelled, completed or no-show
    if (booking.bookingStatus === 'CANCELLED' || booking.queueStatus === 'COMPLETED' || booking.arrivalStatus === 'NO_SHOW') {
      return {
        tokenNumber: booking.tokenNumber,
        position: 0,
        patientsAhead: 0,
        estimatedWaitMinutes: 0,
        status: booking.queueStatus,
        arrivalStatus: booking.arrivalStatus,
        bookingStatus: booking.bookingStatus,
        priority: booking.priority,
        doctorName,
        doctorId: booking.doctorId,
        departmentName,
        departmentId: booking.departmentId,
        roomNo,
        averageConsultationTime: rollingAvg,
      };
    }

    // If not yet arrived at the hospital
    if (booking.arrivalStatus === 'PENDING') {
      // Calculate hypothetical position if they arrived now
      const activeQueue = this.getSortedActiveQueueForDoctor(bookings, booking.doctorId);
      const currentlyConsulting = activeQueue.find((b) => b.queueStatus === 'IN_CONSULTATION');
      const estimatedWait = (activeQueue.length + 1) * rollingAvg;

      return {
        tokenNumber: booking.tokenNumber,
        position: activeQueue.length + 1,
        patientsAhead: activeQueue.length,
        currentlyConsultingToken: currentlyConsulting?.tokenNumber,
        estimatedWaitMinutes: Math.round(estimatedWait),
        status: 'WAITING',
        arrivalStatus: 'PENDING',
        bookingStatus: booking.bookingStatus,
        priority: booking.priority,
        doctorName,
        doctorId: booking.doctorId,
        departmentName,
        departmentId: booking.departmentId,
        roomNo,
        averageConsultationTime: rollingAvg,
      };
    }

    // Patient has arrived - find their active queue slot
    const activeQueue = this.getSortedActiveQueueForDoctor(bookings, booking.doctorId);
    const targetIndex = activeQueue.findIndex((b) => b.id === booking.id);
    const currentlyConsulting = activeQueue.find((b) => b.queueStatus === 'IN_CONSULTATION');

    if (booking.queueStatus === 'IN_CONSULTATION') {
      return {
        tokenNumber: booking.tokenNumber,
        position: 1,
        patientsAhead: 0,
        currentlyConsultingToken: booking.tokenNumber,
        currentlyConsultingPatientName: booking.patientName,
        estimatedWaitMinutes: 0,
        status: 'IN_CONSULTATION',
        arrivalStatus: 'ARRIVED',
        bookingStatus: 'BOOKED',
        priority: booking.priority,
        doctorName,
        doctorId: booking.doctorId,
        departmentName,
        departmentId: booking.departmentId,
        roomNo,
        averageConsultationTime: rollingAvg,
      };
    }

    if (targetIndex === -1) {
      // Edge case: arrived but not in active queue
      return {
        tokenNumber: booking.tokenNumber,
        position: 1,
        patientsAhead: 0,
        currentlyConsultingToken: currentlyConsulting?.tokenNumber,
        estimatedWaitMinutes: rollingAvg,
        status: 'WAITING',
        arrivalStatus: 'ARRIVED',
        bookingStatus: 'BOOKED',
        priority: booking.priority,
        doctorName,
        doctorId: booking.doctorId,
        departmentName,
        departmentId: booking.departmentId,
        roomNo,
        averageConsultationTime: rollingAvg,
      };
    }

    // Position is 1-indexed (position 1 is next or consulting)
    const position = targetIndex + 1;
    // Patients ahead are those before targetIndex
    const patientsAhead = targetIndex;
    const isDoctorConsulting = !!currentlyConsulting;

    const estimatedWait = this.calculateEstimatedWaitTime(
      patientsAhead,
      rollingAvg,
      isDoctorConsulting,
      doctor?.consultationStartedAt
    );

    return {
      tokenNumber: booking.tokenNumber,
      position,
      patientsAhead,
      currentlyConsultingToken: currentlyConsulting?.tokenNumber,
      estimatedWaitMinutes: estimatedWait,
      status: 'WAITING',
      arrivalStatus: 'ARRIVED',
      bookingStatus: 'BOOKED',
      priority: booking.priority,
      doctorName,
      doctorId: booking.doctorId,
      departmentName,
      departmentId: booking.departmentId,
      roomNo,
      averageConsultationTime: rollingAvg,
    };
  }

  /**
   * Generates a live department OPD snapshot summarizing active wait times and load
   */
  public static getDepartmentQueueSnapshot(
    departmentId: DepartmentId,
    bookings: Booking[],
    doctors: Doctor[]
  ): QueueSnapshot {
    const deptDoctors = doctors.filter((d) => d.departmentId === departmentId);
    const deptBookings = bookings.filter(
      (b) =>
        b.departmentId === departmentId &&
        b.bookingStatus === 'BOOKED' &&
        b.arrivalStatus === 'ARRIVED' &&
        b.queueStatus !== 'COMPLETED'
    );

    const totalWaiting = deptBookings.filter((b) => b.queueStatus === 'WAITING').length;
    const currentlyConsulting = deptBookings.find((b) => b.queueStatus === 'IN_CONSULTATION');
    const consultingDoctor = currentlyConsulting
      ? deptDoctors.find((d) => d.id === currentlyConsulting.doctorId)?.name
      : undefined;

    // Average rolling duration across all active doctors in this department
    const avgDuration =
      deptDoctors.length > 0
        ? deptDoctors.reduce(
            (acc, doc) => acc + this.calculateRollingAverage(doc.recentDurations),
            0
          ) / deptDoctors.length
        : this.DEFAULT_AVG_DURATION_MINUTES;

    const effectiveDoctors = Math.max(1, deptDoctors.filter((d) => d.status === 'AVAILABLE').length);
    // Parallel queue throughput: Estimated wait per incoming patient = (Total Waiting / Active Doctors) * Avg Duration
    const estimatedWait = Math.round((totalWaiting / effectiveDoctors) * avgDuration);

    let statusDescription: QueueSnapshot['statusDescription'] = 'Light';
    if (totalWaiting > 20 || estimatedWait > 60) {
      statusDescription = 'Critical';
    } else if (totalWaiting > 12 || estimatedWait > 35) {
      statusDescription = 'High Volume';
    } else if (totalWaiting > 5 || estimatedWait > 15) {
      statusDescription = 'Moderately Busy';
    }

    const deptNameMap: Record<DepartmentId, { name: string; prefix: string }> = {
      cardiology: { name: 'Cardiology OPD', prefix: 'C' },
      orthopedics: { name: 'Orthopedics OPD', prefix: 'O' },
      neurology: { name: 'Neurology OPD', prefix: 'N' },
      pulmonology: { name: 'Pulmonology OPD', prefix: 'P' },
      general_medicine: { name: 'General Medicine OPD', prefix: 'G' },
      pediatrics: { name: 'Pediatrics OPD', prefix: 'PED' },
      gynecology: { name: 'Gynecology OPD', prefix: 'GYN' },
      dentistry: { name: 'Dentistry OPD', prefix: 'D' },
      ophthalmology: { name: 'Ophthalmology OPD', prefix: 'E' },
    };

    return {
      departmentId,
      departmentName: deptNameMap[departmentId]?.name || 'OPD Department',
      totalPatientsWaiting: totalWaiting,
      currentlyConsultingToken: currentlyConsulting?.tokenNumber,
      currentlyConsultingDoctor: consultingDoctor,
      estimatedWaitMinutes: estimatedWait,
      statusDescription,
      activeDoctorsCount: deptDoctors.filter((d) => d.status === 'AVAILABLE').length,
      tokenPrefix: deptNameMap[departmentId]?.prefix || 'T',
    };
  }

  /**
   * Analyzes workload distribution across all doctors in a department to assist staff
   * in routing walk-ins and new bookings evenly
   */
  public static calculateDoctorWorkloads(
    departmentId: DepartmentId,
    doctors: Doctor[],
    bookings: Booking[]
  ): DoctorWorkloadMetric[] {
    const deptDoctors = doctors.filter((d) => d.departmentId === departmentId);

    const metrics: DoctorWorkloadMetric[] = deptDoctors.map((doctor) => {
      const activeQueue = this.getSortedActiveQueueForDoctor(bookings, doctor.id);
      const waitingCount = activeQueue.filter((b) => b.queueStatus === 'WAITING').length;
      const currentConsulting = activeQueue.find((b) => b.queueStatus === 'IN_CONSULTATION');
      const avgDuration = this.calculateRollingAverage(doctor.recentDurations);
      const estimatedQueueMinutes = Math.round(
        waitingCount * avgDuration + (currentConsulting ? avgDuration * 0.5 : 0)
      );

      let workloadStatus: DoctorWorkloadMetric['workloadStatus'] = 'OPTIMAL';
      if (waitingCount >= 8 || estimatedQueueMinutes >= 60) {
        workloadStatus = 'HEAVY';
      } else if (waitingCount >= 4 || estimatedQueueMinutes >= 30) {
        workloadStatus = 'MODERATE';
      }

      return {
        doctor,
        patientsWaiting: waitingCount,
        averageConsultationMinutes: avgDuration,
        currentPatientToken: currentConsulting?.tokenNumber,
        estimatedQueueMinutes,
        workloadStatus,
        isRecommended: false,
      };
    });

    // Identify doctor with lowest estimated queue time who is AVAILABLE
    const availableDocs = metrics.filter((m) => m.doctor.status === 'AVAILABLE');
    if (availableDocs.length > 0) {
      availableDocs.sort((a, b) => a.estimatedQueueMinutes - b.estimatedQueueMinutes);
      availableDocs[0].isRecommended = true;
    }

    return metrics;
  }

  /**
   * Helper method to get waiting count for a specific doctor
   */
  public static getWaitingCountForDoctor(bookings: Booking[] = [], doctorId: string): number {
    return bookings.filter(
      (b) =>
        b.doctorId === doctorId &&
        b.bookingStatus === 'BOOKED' &&
        b.arrivalStatus === 'ARRIVED' &&
        b.queueStatus === 'WAITING'
    ).length;
  }

  /**
   * Helper method to get waiting count for a department
   */
  public static getWaitingCountForDepartment(bookings: Booking[] = [], departmentId: string): number {
    return bookings.filter(
      (b) =>
        b.departmentId === departmentId &&
        b.bookingStatus === 'BOOKED' &&
        b.arrivalStatus === 'ARRIVED' &&
        b.queueStatus === 'WAITING'
    ).length;
  }

  /**
   * Helper method to get estimated wait for a department
   */
  public static getEstimatedWaitForDepartment(
    bookings: Booking[] = [],
    departmentId: DepartmentId,
    doctors: Doctor[] = []
  ): number {
    const snapshot = this.getDepartmentQueueSnapshot(departmentId, bookings, doctors);
    return snapshot.estimatedWaitMinutes;
  }

  /**
   * Helper method to get currently consulting token for a department
   */
  public static getCurrentlyConsultingToken(
    bookings: Booking[] = [],
    departmentId: string
  ): string | undefined {
    const consulting = bookings.find(
      (b) =>
        b.departmentId === departmentId &&
        b.bookingStatus === 'BOOKED' &&
        b.arrivalStatus === 'ARRIVED' &&
        b.queueStatus === 'IN_CONSULTATION'
    );
    return consulting?.tokenNumber;
  }

  /**
   * Helper method to get department load status
   */
  public static getDepartmentLoadStatus(
    bookings: Booking[] = [],
    departmentId: string
  ): QueueSnapshot['statusDescription'] {
    const waiting = this.getWaitingCountForDepartment(bookings, departmentId);
    if (waiting > 20) return 'Critical';
    if (waiting > 12) return 'High Volume';
    if (waiting > 5) return 'Moderately Busy';
    return 'Light';
  }

  /**
   * Smart doctor recommender for patient booking
   */
  public static recommendDoctorForDepartment(
    departmentId: DepartmentId,
    doctors: Doctor[],
    bookings: Booking[]
  ): Doctor | null {
    const workloads = this.calculateDoctorWorkloads(departmentId, doctors, bookings);
    const recommended = workloads.find((w) => w.isRecommended);
    return recommended ? recommended.doctor : (doctors.find((d) => d.departmentId === departmentId) || null);
  }

  /**
   * Generates a unique formatted OPD token e.g. "C-024" based on department prefix and count
   */
  public static generateTokenNumber(tokenPrefix: string, existingTokensForDay: number): string {
    const sequenceNumber = existingTokensForDay + 1;
    const padded = sequenceNumber.toString().padStart(3, '0');
    return `${tokenPrefix}-${padded}`;
  }
}
