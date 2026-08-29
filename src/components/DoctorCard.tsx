import React from 'react';
import { Doctor, Booking } from '../types';
import { Clock, Award, UserCheck, Stethoscope, ArrowRight, Shield } from 'lucide-react';
import { QueueStatusBadge } from './QueueStatusBadge';
import { QueueCalculationService } from '../services/queueService';

interface DoctorCardProps {
  doctor: Doctor;
  bookings?: Booking[];
  onBookAppointment?: (doctorId: string) => void;
  onBookConsultation?: (doctor: Doctor) => void;
  onOpenDoctorConsole?: (doctorId: string) => void;
  waitingCount?: number;
  isRecommended?: boolean;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  bookings = [],
  onBookAppointment,
  onBookConsultation,
  onOpenDoctorConsole,
  waitingCount: propWaitingCount,
  isRecommended = false,
}) => {
  const waitingCount =
    propWaitingCount !== undefined
      ? propWaitingCount
      : QueueCalculationService.getWaitingCountForDoctor(bookings, doctor.id);

  const rollingAvg = QueueCalculationService.calculateRollingAverage(doctor.recentDurations);
  const estimatedQueueMinutes = Math.round(waitingCount * rollingAvg);

  const handleBooking = () => {
    if (onBookAppointment) {
      onBookAppointment(doctor.id);
    } else if (onBookConsultation) {
      onBookConsultation(doctor);
    }
  };

  return (
    <div
      id={`doctor-card-${doctor.id}`}
      className={`bg-white border transition-all duration-150 flex flex-col justify-between relative shadow-sm hover:shadow-md ${
        isRecommended
          ? 'border-slate-900 ring-2 ring-slate-900/10'
          : 'border-slate-900'
      }`}
    >
      {/* Recommended for Smart Workload Balancing Pill */}
      {isRecommended && (
        <div className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 flex items-center justify-between border-b border-slate-900">
          <span>⚡ Shrushrut Workload Match</span>
          <span className="text-sky-300">Fastest Queue</span>
        </div>
      )}

      <div className="p-5 sm:p-6">
        {/* Header: Name, Specialization & Status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900 leading-tight">
              {doctor.name}
            </h3>
            <p className="text-xs uppercase tracking-wider font-bold text-sky-800 mt-1">
              {doctor.specialization}
            </p>
          </div>
          <QueueStatusBadge type="doctor" value={doctor.status} size="sm" />
        </div>

        {/* Doctor & Assistant Identifiers Bar */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 p-3 mb-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              Doctor ID
            </span>
            <span className="font-mono font-bold text-slate-900 text-xs">
              {doctor.doctorNo}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              Assistant ID
            </span>
            <span className="font-mono font-bold text-slate-900 text-xs">
              {doctor.assistantNo}
            </span>
          </div>
        </div>

        {/* Experience, Room & OPD Hours */}
        <div className="space-y-2.5 text-xs text-slate-700 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Clinical Experience:</span>
            <span className="font-semibold text-slate-900">{doctor.experienceYears} Years</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">OPD Timings:</span>
            <span className="font-semibold font-mono text-slate-900">{doctor.opdTiming}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">OPD Consultation Room:</span>
            <span className="font-semibold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 border border-slate-300">
              {doctor.roomNo}
            </span>
          </div>
        </div>

        {/* Live Queue Health Meter for this doctor */}
        <div className="pt-3.5 border-t border-dashed border-slate-300 grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-slate-500 text-[10px] uppercase tracking-wider font-bold block">
              Waiting
            </span>
            <span className="font-serif font-bold text-slate-900 text-base">
              {waitingCount}
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase tracking-wider font-bold block">
              Avg Pace
            </span>
            <span className="font-mono font-semibold text-slate-800 text-xs">
              ~{rollingAvg}m
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 text-[10px] uppercase tracking-wider font-bold block">
              Est. Wait
            </span>
            <span
              className={`font-mono font-bold text-xs ${
                estimatedQueueMinutes > 40 ? 'text-amber-700' : 'text-slate-900'
              }`}
            >
              ~{estimatedQueueMinutes} mins
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 mt-auto flex items-center gap-2">
        <button
          id={`btn-book-doc-${doctor.id}`}
          onClick={handleBooking}
          disabled={doctor.status === 'OFF_DUTY'}
          className={`flex-1 py-2.5 px-4 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer border ${
            doctor.status === 'OFF_DUTY'
              ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
              : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900 shadow-2xs'
          }`}
        >
          <span>Book Consultation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {onOpenDoctorConsole && (
          <button
            onClick={() => onOpenDoctorConsole(doctor.id)}
            title="Open Room Physician Console"
            className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 hover:border-slate-900 transition-colors cursor-pointer"
          >
            <Stethoscope className="w-4 h-4 text-slate-700" />
          </button>
        )}
      </div>
    </div>
  );
};
