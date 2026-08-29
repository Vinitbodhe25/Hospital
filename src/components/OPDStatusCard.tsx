import React from 'react';
import { QueueSnapshot, Department, Doctor, Booking } from '../types';
import { getDepartmentSvgIcon } from './MedicalIcons';
import { Clock, Users, ArrowUpRight, Activity, Stethoscope } from 'lucide-react';
import { QueueCalculationService } from '../services/queueService';

interface OPDStatusCardProps {
  snapshot?: QueueSnapshot;
  department?: Department;
  doctors?: Doctor[];
  bookings?: Booking[];
  onTrackQueueClick?: (deptId: string) => void;
  onQuickBook?: (deptId: string) => void;
}

export const OPDStatusCard: React.FC<OPDStatusCardProps> = ({
  snapshot: propSnapshot,
  department,
  doctors = [],
  bookings = [],
  onTrackQueueClick,
  onQuickBook,
}) => {
  // If department & doctors are passed instead of raw snapshot, calculate snapshot
  const snapshot: QueueSnapshot = propSnapshot || (department ? {
    departmentId: department.id,
    departmentName: department.name,
    activeDoctorsCount: doctors.filter((d) => d.status === 'AVAILABLE').length,
    totalPatientsWaiting: QueueCalculationService.getWaitingCountForDepartment(bookings, department.id),
    estimatedWaitMinutes: QueueCalculationService.getEstimatedWaitForDepartment(bookings, department.id, doctors),
    currentlyConsultingToken: QueueCalculationService.getCurrentlyConsultingToken(bookings, department.id),
    statusDescription: QueueCalculationService.getDepartmentLoadStatus(bookings, department.id),
  } : {
    departmentId: 'cardiology',
    departmentName: 'Cardiology',
    activeDoctorsCount: 2,
    totalPatientsWaiting: 4,
    estimatedWaitMinutes: 25,
    currentlyConsultingToken: 'C-018',
    statusDescription: 'Light',
  });

  const getStatusColor = (status: QueueSnapshot['statusDescription']) => {
    switch (status) {
      case 'Light':
        return 'bg-emerald-50 text-emerald-900 border-emerald-300';
      case 'Moderately Busy':
        return 'bg-sky-50 text-sky-900 border-sky-300';
      case 'High Volume':
        return 'bg-amber-50 text-amber-900 border-amber-300';
      case 'Critical':
        return 'bg-rose-50 text-rose-900 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div
      id={`opd-status-card-${snapshot.departmentId}`}
      className="bg-white border border-slate-900 shadow-sm p-6 sm:p-7 relative overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-900">
        {/* Left: Department Name & Details */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 border border-slate-900 bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
            {getDepartmentSvgIcon(snapshot.departmentId, 'w-6 h-6 text-sky-300')}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight">
                {snapshot.departmentName} OPD
              </h2>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 border ${getStatusColor(
                  snapshot.statusDescription
                )}`}
              >
                {snapshot.statusDescription}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-2">
              <span>{snapshot.activeDoctorsCount} {snapshot.activeDoctorsCount === 1 ? 'Doctor Active' : 'Doctors Active'} on duty</span>
              <span>•</span>
              <span>Continuous rolling consultation analytics</span>
            </p>
          </div>
        </div>

        {/* Quick CTA */}
        {onTrackQueueClick && (
          <button
            id={`btn-track-dept-${snapshot.departmentId}`}
            onClick={() => onTrackQueueClick(snapshot.departmentId)}
            className="self-start lg:self-center py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs uppercase tracking-wider font-bold border border-slate-900 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>Track Specialty Queue</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Live Metrics: Stat boxes in Editorial Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
        {/* Metric 1 */}
        <div className="sm:border-r border-slate-200 sm:pr-6">
          <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 opacity-60 block">
            Patients Waiting
          </span>
          <div className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
            {snapshot.totalPatientsWaiting}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Corridor & waiting lounge
          </p>
        </div>

        {/* Metric 2 */}
        <div className="sm:border-r border-slate-200 sm:pr-6">
          <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 opacity-60 block">
            Currently In Suite
          </span>
          <div className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
            {snapshot.currentlyConsultingToken ? (
              <span className="font-mono text-slate-900">
                {snapshot.currentlyConsultingToken}
              </span>
            ) : (
              <span className="text-xl font-sans font-semibold text-slate-400">
                Calling Next
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Inside consultation room
          </p>
        </div>

        {/* Metric 3 */}
        <div>
          <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 opacity-60 block">
            Estimated Next Wait
          </span>
          <div className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-1 flex items-baseline gap-1">
            <span>~{snapshot.estimatedWaitMinutes}</span>
            <span className="text-sm font-sans font-normal text-slate-500">mins</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Rolling consultation speed
          </p>
        </div>
      </div>
    </div>
  );
};
