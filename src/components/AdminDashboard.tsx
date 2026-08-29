import React, { useState } from 'react';
import { Booking, Doctor, Department, AdminUser, DepartmentId } from '../types';
import { QueueCalculationService } from '../services/queueService';
import { AppointmentTable } from './AppointmentTable';
import { DoctorWorkloadCard } from './DoctorWorkloadCard';
import { CSVExportButton } from './CSVExportButton';
import { firebaseService } from '../services/firebaseService';
import {
  Users,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertTriangle,
  XCircle,
  Activity,
  Layers,
  Sparkles,
  Calendar,
  LogOut,
  Shield,
  Stethoscope,
  Trash2,
  Mail,
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: AdminUser;
  bookings: Booking[];
  doctors: Doctor[];
  departments: Department[];
  onLogout: () => void;
  onOpenDoctorPanel?: (doctorId: string) => void;
  onOpenEmailInspector?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  bookings,
  doctors,
  departments,
  onLogout,
  onOpenDoctorPanel,
  onOpenEmailInspector,
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState<DepartmentId>('cardiology');
  const [selectedPatientModal, setSelectedPatientModal] = useState<Booking | null>(null);

  // Calculate Today's OPD Overview Metrics (Section 13)
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.bookingStatus === 'BOOKED').length;
  const arrivedPatients = bookings.filter((b) => b.arrivalStatus === 'ARRIVED').length;
  const waitingPatients = bookings.filter(
    (b) => b.arrivalStatus === 'ARRIVED' && b.queueStatus === 'WAITING'
  ).length;
  const completedConsultations = bookings.filter((b) => b.queueStatus === 'COMPLETED').length;
  const noShows = bookings.filter((b) => b.arrivalStatus === 'NO_SHOW').length;
  const cancelled = bookings.filter((b) => b.bookingStatus === 'CANCELLED').length;
  const emergencyCases = bookings.filter((b) => b.priority === 'EMERGENCY').length;

  // Workload analysis for selected department
  const doctorWorkloads = QueueCalculationService.calculateDoctorWorkloads(
    selectedDeptId,
    doctors,
    bookings
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner: Admin Profile & CSV Export */}
      <div className="bg-slate-900 text-white p-6 border border-slate-900 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 border border-slate-700 bg-slate-800 text-sky-400 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-white tracking-tight">Shrushrut Central Command</h1>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-sky-400 px-2 py-0.5 border border-slate-700">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Logged in as <strong className="text-white font-mono">{currentUser.email}</strong> • Real-time OPD corridor synchronized
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenEmailInspector && (
            <button
              id="btn-admin-email-logs"
              onClick={onOpenEmailInspector}
              className="py-2 px-3 bg-teal-800 hover:bg-teal-700 border border-teal-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Inspect patient passes and admin alerts"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Gateway</span>
            </button>
          )}
          <CSVExportButton
            bookings={bookings}
            doctors={doctors}
            departments={departments}
          />
          <button
            id="btn-admin-logout"
            onClick={onLogout}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Metrics Grid (Section 13) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs uppercase tracking-widest font-bold text-slate-700 font-serif">
            Today's OPD Operational Overview
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Updated live from triage desk
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* Total Bookings */}
          <div className="bg-white p-4 border border-slate-900 shadow-2xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              Total Bookings
            </span>
            <span className="font-mono text-2xl font-black text-slate-900 block mt-1">
              {totalBookings}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">All Slots</span>
          </div>

          {/* Confirmed */}
          <div className="bg-white p-4 border border-slate-900 shadow-2xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-900 block">
              Confirmed
            </span>
            <span className="font-mono text-2xl font-black text-slate-900 block mt-1">
              {confirmedBookings}
            </span>
            <span className="text-[10px] text-slate-600 font-medium">Active Bookings</span>
          </div>

          {/* Arrived */}
          <div className="bg-white p-4 border border-slate-900 shadow-2xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block">
              Arrived
            </span>
            <span className="font-mono text-2xl font-black text-emerald-900 block mt-1">
              {arrivedPatients}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">In Building</span>
          </div>

          {/* Waiting */}
          <div className="bg-white p-4 border border-slate-900 shadow-2xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-800 block">
              Waiting
            </span>
            <span className="font-mono text-2xl font-black text-sky-900 block mt-1">
              {waitingPatients}
            </span>
            <span className="text-[10px] text-sky-700 font-medium">In Corridor</span>
          </div>

          {/* Completed */}
          <div className="bg-white p-4 border border-slate-900 shadow-2xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-700 block">
              Completed
            </span>
            <span className="font-mono text-2xl font-black text-slate-900 block mt-1">
              {completedConsultations}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Concluded</span>
          </div>

          {/* No-Shows */}
          <div className="bg-white p-4 border border-slate-900 shadow-2xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 block">
              No-Shows
            </span>
            <span className="font-mono text-2xl font-black text-amber-900 block mt-1">
              {noShows}
            </span>
            <span className="text-[10px] text-amber-700 font-medium">Slots Released</span>
          </div>

          {/* Cancelled */}
          <div className="bg-white p-4 border border-slate-900 shadow-2xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-800 block">
              Cancelled
            </span>
            <span className="font-mono text-2xl font-black text-rose-900 block mt-1">
              {cancelled}
            </span>
            <span className="text-[10px] text-rose-700 font-medium">Patient Voided</span>
          </div>

          {/* Emergency Cases */}
          <div className="bg-rose-50 p-4 border border-rose-900 shadow-2xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-900 block">
              Emergencies
            </span>
            <span className="font-mono text-2xl font-black text-rose-800 block mt-1 animate-pulse">
              {emergencyCases}
            </span>
            <span className="text-[10px] text-rose-700 font-bold uppercase">Priority Triaged</span>
          </div>
        </div>
      </div>

      {/* Section 12: Doctor Workload Balancing Panel */}
      <div className="bg-white border border-slate-900 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-serif font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-900" />
              Doctor Workload Balancing & Smart Routing
            </h3>
            <p className="text-xs text-slate-600">
              Evaluates live queue depth & rolling consultation velocity to recommend optimal physician assignment.
            </p>
          </div>

          {/* Department Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-bold uppercase tracking-wider text-[11px]">Department:</span>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value as DepartmentId)}
              className="text-xs bg-slate-50 border border-slate-400 px-3 py-1.5 font-semibold text-slate-900 focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctorWorkloads.map((workload) => (
            <DoctorWorkloadCard
              key={workload.doctor.id}
              workload={workload}
              onOpenDoctorPanel={onOpenDoctorPanel}
            />
          ))}
        </div>
      </div>

      {/* Master Appointments Table (Section 13) */}
      <AppointmentTable
        bookings={bookings}
        doctors={doctors}
        departments={departments}
        onViewPatientDetails={(booking) => setSelectedPatientModal(booking)}
      />

      {/* Patient Record Detail Modal */}
      {selectedPatientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-900 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-900 px-2 py-0.5 border border-slate-300">
                  TOKEN {selectedPatientModal.tokenNumber}
                </span>
                <h3 className="text-lg font-serif font-bold text-slate-900 mt-1">
                  {selectedPatientModal.patientName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPatientModal(null)}
                className="text-slate-500 hover:text-slate-900 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 border border-slate-200">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">Age & Gender:</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {selectedPatientModal.age} Years • {selectedPatientModal.gender}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">Mobile Phone:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {selectedPatientModal.mobile}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">Email:</span>
                  <span className="font-mono text-slate-900">
                    {selectedPatientModal.email}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">Patient ID:</span>
                  <span className="font-mono text-slate-900">
                    {selectedPatientModal.patientId}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-600 text-[10px] uppercase font-bold tracking-wider block mb-0.5">
                  Address / Residence:
                </span>
                <p className="text-slate-800 bg-white p-2 border border-slate-200">
                  {selectedPatientModal.address}
                </p>
              </div>

              <div>
                <span className="text-slate-600 text-[10px] uppercase font-bold tracking-wider block mb-0.5">
                  Clinical Consultation Reason:
                </span>
                <p className="text-slate-800 bg-white p-2.5 border border-slate-200">
                  {selectedPatientModal.reason}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Booking</span>
                  <strong className="text-slate-800">{selectedPatientModal.bookingStatus}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Arrival</span>
                  <strong className="text-slate-800">{selectedPatientModal.arrivalStatus}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Queue</span>
                  <strong className="text-slate-800">{selectedPatientModal.queueStatus}</strong>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setSelectedPatientModal(null)}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider border border-slate-900 cursor-pointer"
              >
                Close Record
              </button>
              {selectedPatientModal.queueStatus === 'COMPLETED' && (
                <button
                  id="btn-modal-remove-token"
                  onClick={async () => {
                    if (window.confirm(`Remove completed token ${selectedPatientModal.tokenNumber} from the OPD register?`)) {
                      await firebaseService.removeBooking(selectedPatientModal.id);
                      setSelectedPatientModal(null);
                    }
                  }}
                  className="py-2.5 px-4 bg-rose-50 hover:bg-rose-700 text-rose-700 hover:text-white border border-rose-300 hover:border-rose-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Remove Completed Token"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Token</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
