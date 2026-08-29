import React, { useState } from 'react';
import { Booking, Doctor, Department } from '../types';
import { firebaseService } from '../services/firebaseService';
import { QueueStatusBadge } from './QueueStatusBadge';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  UserX,
  AlertTriangle,
  Eye,
  ArrowUpDown,
  UserCheck,
  Stethoscope,
  Clock,
  Shuffle,
  Trash2,
  CheckCheck,
} from 'lucide-react';

interface AppointmentTableProps {
  bookings: Booking[];
  doctors: Doctor[];
  departments: Department[];
  onViewPatientDetails?: (booking: Booking) => void;
}

export const AppointmentTable: React.FC<AppointmentTableProps> = ({
  bookings,
  doctors,
  departments,
  onViewPatientDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [arrivalFilter, setArrivalFilter] = useState('ALL');
  const [queueFilter, setQueueFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const [selectedBookingForReassign, setSelectedBookingForReassign] = useState<Booking | null>(null);
  const [targetReassignDoctorId, setTargetReassignDoctorId] = useState<string>('');

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    // Search query
    const query = searchTerm.toLowerCase().trim();
    if (query) {
      const matchToken = b.tokenNumber.toLowerCase().includes(query);
      const matchName = b.patientName.toLowerCase().includes(query);
      const matchMobile = b.mobile.toLowerCase().includes(query);
      if (!matchToken && !matchName && !matchMobile) return false;
    }

    if (departmentFilter !== 'ALL' && b.departmentId !== departmentFilter) return false;
    if (arrivalFilter !== 'ALL' && b.arrivalStatus !== arrivalFilter) return false;
    if (queueFilter !== 'ALL' && b.queueStatus !== queueFilter) return false;
    if (priorityFilter !== 'ALL' && b.priority !== priorityFilter) return false;

    return true;
  });

  const handleConfirmArrival = async (bookingId: string) => {
    await firebaseService.updateArrivalStatus(bookingId, 'ARRIVED');
  };

  const handleMarkNoShow = async (bookingId: string) => {
    if (window.confirm('Mark this patient as No-Show?')) {
      await firebaseService.updateArrivalStatus(bookingId, 'NO_SHOW');
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      await firebaseService.cancelBooking(bookingId);
    }
  };

  const handleElevateEmergency = async (bookingId: string) => {
    const reason = prompt('Enter clinical reason for emergency prioritization:', 'Acute symptoms triage override');
    if (reason) {
      await firebaseService.markEmergencyPriority(bookingId, reason);
    }
  };

  const handleExecuteReassign = async () => {
    if (!selectedBookingForReassign || !targetReassignDoctorId) return;
    await firebaseService.reassignDoctor(selectedBookingForReassign.id, targetReassignDoctorId);
    setSelectedBookingForReassign(null);
    setTargetReassignDoctorId('');
  };

  const handleRemoveBooking = async (bookingId: string, tokenNumber: string) => {
    if (window.confirm(`Are you sure you want to remove token ${tokenNumber} from the active OPD register?`)) {
      await firebaseService.removeBooking(bookingId);
    }
  };

  const handleClearAllCompleted = async () => {
    const completedCount = bookings.filter((b) => b.queueStatus === 'COMPLETED').length;
    if (completedCount === 0) return;
    if (window.confirm(`Remove all ${completedCount} completed consultation tokens from the register?`)) {
      await firebaseService.clearCompletedBookings();
    }
  };

  const completedTotal = bookings.filter((b) => b.queueStatus === 'COMPLETED').length;

  return (
    <div className="bg-white border border-slate-900 shadow-sm overflow-hidden space-y-4">
      {/* Header & Filter Controls */}
      <div className="p-5 border-b border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-900">
              Today's Master Outpatient Register
            </h3>
            <p className="text-xs text-slate-600 font-mono">
              Live tracking {filteredBookings.length} of {bookings.length} patient consultations
            </p>
          </div>

          {completedTotal > 0 && (
            <button
              id="btn-clear-completed-tokens"
              onClick={handleClearAllCompleted}
              className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Remove all completed tokens from register"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Completed ({completedTotal})</span>
            </button>
          )}
        </div>

        {/* Search & Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-table-search"
              type="text"
              placeholder="Search Token (e.g. C-024), Name, Mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>

          {/* Dept Filter */}
          <div>
            <select
              id="select-filter-dept"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 px-2.5 py-2 text-slate-900 font-medium focus:border-slate-900"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Arrival Status Filter */}
          <div>
            <select
              id="select-filter-arrival"
              value={arrivalFilter}
              onChange={(e) => setArrivalFilter(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 px-2.5 py-2 text-slate-900 font-medium focus:border-slate-900"
            >
              <option value="ALL">Arrival: All</option>
              <option value="PENDING">Arrival: Pending</option>
              <option value="ARRIVED">Arrival: Arrived</option>
              <option value="NO_SHOW">Arrival: No-Show</option>
            </select>
          </div>

          {/* Queue Status Filter */}
          <div>
            <select
              id="select-filter-queue"
              value={queueFilter}
              onChange={(e) => setQueueFilter(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 px-2.5 py-2 text-slate-900 font-medium focus:border-slate-900"
            >
              <option value="ALL">Queue: All</option>
              <option value="WAITING">Queue: Waiting</option>
              <option value="IN_CONSULTATION">Queue: In Consultation</option>
              <option value="COMPLETED">Queue: Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reassign Modal Bar */}
      {selectedBookingForReassign && (
        <div className="mx-5 p-4 bg-slate-100 border border-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-900 uppercase tracking-wider block font-serif">
              Reassign Token {selectedBookingForReassign.tokenNumber} ({selectedBookingForReassign.patientName})
            </span>
            <span className="text-slate-600 text-[11px]">
              Transfer patient to another active physician to balance wait times.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={targetReassignDoctorId}
              onChange={(e) => setTargetReassignDoctorId(e.target.value)}
              className="text-xs bg-white border border-slate-400 px-3 py-1.5 font-medium text-slate-900"
            >
              <option value="">Select Target Physician...</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} (Room {doc.roomNo})
                </option>
              ))}
            </select>
            <button
              onClick={handleExecuteReassign}
              disabled={!targetReassignDoctorId}
              className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              Apply Transfer
            </button>
            <button
              onClick={() => setSelectedBookingForReassign(null)}
              className="py-1.5 px-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-900 text-white uppercase tracking-widest text-[10px] font-bold">
              <th className="py-3.5 px-4">Token #</th>
              <th className="py-3.5 px-4">Patient Name & Demographics</th>
              <th className="py-3.5 px-4">Physician & Suite</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">Appt Slot</th>
              <th className="py-3.5 px-4">Booking Status</th>
              <th className="py-3.5 px-4">Arrival Status</th>
              <th className="py-3.5 px-4">Queue Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500 italic font-mono">
                  No matching consultations found for current filters.
                </td>
              </tr>
            ) : (
              filteredBookings.map((b) => {
                const doc = doctors.find((d) => d.id === b.doctorId);
                const dept = departments.find((d) => d.id === b.departmentId);
                const isEmergency = b.priority === 'EMERGENCY';

                return (
                  <tr
                    key={b.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isEmergency ? 'bg-rose-50/60' : ''
                    }`}
                  >
                    {/* Token */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{b.tokenNumber}</span>
                        {isEmergency && (
                          <span className="bg-rose-600 text-white text-[9px] font-bold px-1 uppercase tracking-wider">
                            EMERGENCY
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Patient Name & Demographics */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 font-serif">{b.patientName}</div>
                      <div className="text-[11px] text-slate-600 font-mono">
                        {b.age}y • {b.gender} • <span>{b.mobile}</span>
                      </div>
                    </td>

                    {/* Doctor */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 font-serif">{doc?.name || 'Unassigned'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Suite {doc?.roomNo} ({doc?.doctorNo})
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">{dept?.name || b.departmentId}</span>
                    </td>

                    {/* Slot */}
                    <td className="py-3.5 px-4 font-mono text-slate-800 whitespace-nowrap">
                      <div className="font-bold">{b.appointmentTime}</div>
                      <div className="text-[10px] text-slate-500">{b.appointmentDate}</div>
                    </td>

                    {/* 3 Separate State Models */}
                    <td className="py-3.5 px-4">
                      <QueueStatusBadge type="booking" value={b.bookingStatus} size="sm" />
                    </td>

                    <td className="py-3.5 px-4">
                      <QueueStatusBadge type="arrival" value={b.arrivalStatus} size="sm" />
                    </td>

                    <td className="py-3.5 px-4">
                      <QueueStatusBadge type="queue" value={b.queueStatus} size="sm" />
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* Confirm Arrived Button */}
                        {b.arrivalStatus !== 'ARRIVED' && b.bookingStatus === 'BOOKED' && (
                          <button
                            id={`btn-table-arrive-${b.id}`}
                            onClick={() => handleConfirmArrival(b.id)}
                            className="p-1.5 text-emerald-800 hover:bg-emerald-50 border border-emerald-300 transition-colors cursor-pointer"
                            title="Confirm Arrival at OPD"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Mark Emergency */}
                        {!isEmergency && b.queueStatus === 'WAITING' && b.bookingStatus === 'BOOKED' && (
                          <button
                            id={`btn-table-emergency-${b.id}`}
                            onClick={() => handleElevateEmergency(b.id)}
                            className="p-1.5 text-rose-800 hover:bg-rose-50 border border-rose-300 transition-colors cursor-pointer"
                            title="Elevate to Emergency Priority"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Reassign Doctor */}
                        {b.queueStatus === 'WAITING' && b.bookingStatus === 'BOOKED' && (
                          <button
                            id={`btn-table-reassign-${b.id}`}
                            onClick={() => {
                              setSelectedBookingForReassign(b);
                              setTargetReassignDoctorId('');
                            }}
                            className="p-1.5 text-slate-800 hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
                            title="Reassign to another physician"
                          >
                            <Shuffle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Mark No-Show */}
                        {b.arrivalStatus === 'PENDING' && (
                          <button
                            id={`btn-table-noshow-${b.id}`}
                            onClick={() => handleMarkNoShow(b.id)}
                            className="p-1.5 text-slate-600 hover:text-amber-800 hover:bg-amber-50 border border-slate-300 transition-colors cursor-pointer"
                            title="Mark No-Show"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Cancel Booking (if not completed) */}
                        {b.bookingStatus === 'BOOKED' && b.queueStatus !== 'COMPLETED' && (
                          <button
                            id={`btn-table-cancel-${b.id}`}
                            onClick={() => handleCancel(b.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-800 hover:bg-rose-50 border border-slate-300 transition-colors cursor-pointer"
                            title="Cancel Booking"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Dedicated REMOVE TOKEN button when Consultation is Completed */}
                        {b.queueStatus === 'COMPLETED' && (
                          <button
                            id={`btn-table-remove-token-${b.id}`}
                            onClick={() => handleRemoveBooking(b.id, b.tokenNumber)}
                            className="py-1 px-2.5 bg-rose-50 hover:bg-rose-700 text-rose-700 hover:text-white border border-rose-300 hover:border-rose-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                            title="Consultation Completed: Remove token from OPD register"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove Token</span>
                          </button>
                        )}

                        {/* Remove button for Cancelled/No-Show tokens if desired */}
                        {(b.bookingStatus === 'CANCELLED' || b.arrivalStatus === 'NO_SHOW') && (
                          <button
                            id={`btn-table-delete-voided-${b.id}`}
                            onClick={() => handleRemoveBooking(b.id, b.tokenNumber)}
                            className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                            title="Remove voided token record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* View Details */}
                        {onViewPatientDetails && (
                          <button
                            id={`btn-table-view-${b.id}`}
                            onClick={() => onViewPatientDetails(b)}
                            className="p-1.5 text-slate-800 hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
                            title="View Consultation Record"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
