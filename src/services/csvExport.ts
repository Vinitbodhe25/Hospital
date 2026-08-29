/**
 * Shrushrut — Hospital OPD Dynamic Queue Management System
 * CSV Export Utility
 * 
 * Generates properly formatted clinical audit CSVs containing:
 * Token Number, Patient Name, Doctor, Department, Appointment Date, Appointment Time,
 * Booking Status, Arrival Status, Queue Status, Priority, Consultation Start/End Time,
 * Consultation Duration, Estimated Wait Time
 */

import { Booking, Doctor, Department } from '../types';

export class CsvExportService {
  /**
   * Sanitizes text to safely escape commas, quotes, and newlines in CSV format
   */
  private static escapeCsvValue(val: string | number | null | undefined): string {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  }

  /**
   * Builds and triggers client download of the OPD appointments CSV
   */
  public static exportBookingsToCsv(params: {
    bookings: Booking[];
    doctors: Doctor[];
    departments: Department[];
    dateRangeLabel?: string;
    departmentFilter?: string;
  }): void {
    const { bookings, doctors, departments, dateRangeLabel = 'Today', departmentFilter } = params;

    let filtered = bookings;
    if (departmentFilter && departmentFilter !== 'ALL') {
      filtered = filtered.filter((b) => b.departmentId === departmentFilter);
    }

    const headers = [
      'Token Number',
      'Patient ID',
      'Patient Name',
      'Age',
      'Gender',
      'Mobile',
      'Email',
      'Department',
      'Doctor Name',
      'Doctor No',
      'OPD Room',
      'Appointment Date',
      'Appointment Time',
      'Priority',
      'Priority Reason',
      'Booking Status',
      'Arrival Status',
      'Queue Status',
      'Consultation Start',
      'Consultation End',
      'Consultation Duration (Mins)',
      'Estimated Wait (Mins)',
      'Created At',
    ];

    const rows = filtered.map((b) => {
      const doc = doctors.find((d) => d.id === b.doctorId);
      const dept = departments.find((d) => d.id === b.departmentId);

      return [
        b.tokenNumber,
        b.patientId,
        b.patientName,
        b.age,
        b.gender,
        b.mobile,
        b.email,
        dept?.name || b.departmentId,
        doc?.name || 'Unassigned',
        doc?.doctorNo || '-',
        doc?.roomNo || '-',
        b.appointmentDate,
        b.appointmentTime,
        b.priority,
        b.priorityReason || 'None',
        b.bookingStatus,
        b.arrivalStatus,
        b.queueStatus,
        b.consultationStartTime ? new Date(b.consultationStartTime).toLocaleTimeString() : '-',
        b.consultationEndTime ? new Date(b.consultationEndTime).toLocaleTimeString() : '-',
        b.consultationDuration !== undefined ? b.consultationDuration : '-',
        b.estimatedWaitMinutes !== undefined ? b.estimatedWaitMinutes : '-',
        b.createdAt ? new Date(b.createdAt).toLocaleString() : '-',
      ];
    });

    const csvContent = [
      headers.map(this.escapeCsvValue).join(','),
      ...rows.map((row) => row.map(this.escapeCsvValue).join(',')),
    ].join('\r\n');

    // Create blob and trigger browser download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `Shrushrut_OPD_Report_${dateRangeLabel.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
