import React from 'react';
import { Booking, Doctor, Department } from '../types';
import { CheckCircle2, Clock, UserCheck, XCircle, ArrowRight, Mail, Calendar, MapPin, Stethoscope, Copy, ExternalLink } from 'lucide-react';
import { QueueStatusBadge } from './QueueStatusBadge';
import { emailService } from '../services/emailService';

interface BookingConfirmationProps {
  booking: Booking;
  doctor: Doctor;
  department: Department;
  estimatedWaitMinutes: number;
  onViewMyQueue: (tokenNumber: string) => void;
  onConfirmArrival: (bookingId: string) => void;
  onCancelBooking: (bookingId: string) => void;
  onReturnHome: () => void;
  onOpenEmailPreview?: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  booking,
  doctor,
  department,
  estimatedWaitMinutes,
  onViewMyQueue,
  onConfirmArrival,
  onCancelBooking,
  onReturnHome,
  onOpenEmailPreview,
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyToken = () => {
    navigator.clipboard?.writeText(booking.tokenNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Card: Verified Token Pass */}
      <div className="bg-white border border-slate-900 shadow-sm overflow-hidden text-center">
        {/* Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 border-b border-slate-900">
          <div className="w-12 h-12 border border-slate-700 bg-slate-800 text-sky-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-sky-300 bg-slate-800 px-2.5 py-0.5 border border-slate-700">
            Consultation Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black mt-2 tracking-tight">
            OPD Queue Token Issued
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
            Your appointment has been registered in the Shrushrut Central Queue Engine.
          </p>
        </div>

        {/* Big Token Display Box */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-slate-50 border-2 border-dashed border-slate-900 p-6 relative group">
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-600 mb-1">
              Your Dynamic OPD Token
            </div>
            <div className="font-mono text-5xl sm:text-6xl font-black text-slate-900 tracking-wider my-2">
              {booking.tokenNumber}
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Keep this token handy. You will be called into <strong className="text-slate-900">Suite {doctor.roomNo}</strong>.
            </p>

            <button
              onClick={copyToken}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-900 font-bold uppercase tracking-wider bg-white border border-slate-300 px-3 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied Token!' : 'Copy Token #'}</span>
            </button>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="p-3.5 bg-white border border-slate-300">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Stethoscope className="w-4 h-4 text-slate-700" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Consulting Doctor</span>
              </div>
              <p className="text-xs font-bold text-slate-900 font-serif">{doctor.name}</p>
              <p className="text-[11px] text-slate-500 font-mono">
                {doctor.doctorNo} • Asst: {doctor.assistantNo}
              </p>
            </div>

            <div className="p-3.5 bg-white border border-slate-300">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <MapPin className="w-4 h-4 text-slate-700" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Department & Suite</span>
              </div>
              <p className="text-xs font-bold text-slate-900 font-serif">{department.name}</p>
              <p className="text-[11px] text-slate-500 font-mono">
                Suite {doctor.roomNo} ({department.floor})
              </p>
            </div>

            <div className="p-3.5 bg-white border border-slate-300">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Calendar className="w-4 h-4 text-slate-700" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Appointment Time</span>
              </div>
              <p className="text-xs font-bold text-slate-900 font-mono">
                {booking.appointmentDate} at {booking.appointmentTime}
              </p>
              <p className="text-[11px] text-slate-500">Today's OPD Session</p>
            </div>

            <div className="p-3.5 bg-sky-50/60 border border-sky-200">
              <div className="flex items-center gap-2 text-xs text-sky-900 mb-1 font-bold">
                <Clock className="w-4 h-4 text-sky-700" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Initial Estimated Wait</span>
              </div>
              <p className="text-lg font-bold font-mono text-sky-950">
                ~{estimatedWaitMinutes} minutes
              </p>
              <p className="text-[10px] text-sky-800 font-medium">
                Dynamically calculated from real consultation durations
              </p>
            </div>
          </div>

          {/* Email Dispatched Notification Banner */}
          <div className="bg-teal-50/80 border-2 border-teal-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between text-left gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                    Token Emails Dispatched
                  </p>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Pass Emailed to Patient
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1">
                  Digital Token Pass <strong className="text-teal-900 font-mono font-black">#{booking.tokenNumber}</strong> has been emailed to your Gmail: <span className="font-mono font-bold text-teal-950 bg-white px-2 py-0.5 rounded border border-teal-300 shadow-xs">{booking.email}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Open Gmail to view alert"
              >
                <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                <span>Open Gmail</span>
              </a>
              {onOpenEmailPreview && (
                <button
                  onClick={onOpenEmailPreview}
                  className="py-2 px-3 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Log</span>
                </button>
              )}
            </div>
          </div>

          {/* Attendance Confirmation Protocol */}
          <div className="bg-amber-50 border border-amber-200 p-4 sm:p-5 text-left">
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-widest mb-1">
              Step 2: Hospital Arrival Check-In
            </h4>
            <p className="text-xs text-amber-900/90 leading-relaxed mb-4">
              When you arrive in the hospital waiting lobby, tap <strong>"I have arrived at the hospital"</strong>. This immediately activates your token in Dr. {doctor.name.split(' ')[1] || doctor.name}’s active consultation screen.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5">
              {booking.arrivalStatus !== 'ARRIVED' ? (
                <button
                  id="btn-confirm-arrived"
                  onClick={() => onConfirmArrival(booking.id)}
                  className="flex-1 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider border border-emerald-900 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>I Have Arrived at the Hospital</span>
                </button>
              ) : (
                <div className="flex-1 py-2.5 px-4 bg-emerald-50 text-emerald-950 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Arrival Verified (Active in Queue)</span>
                </div>
              )}

              {booking.bookingStatus === 'BOOKED' && (
                <button
                  id="btn-cancel-booking"
                  onClick={() => onCancelBooking(booking.id)}
                  className="py-2.5 px-4 bg-white hover:bg-rose-50 border border-slate-300 text-rose-800 hover:text-rose-900 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancel Slot</span>
                </button>
              )}
            </div>
          </div>

          {/* Primary View My Queue CTA */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              id="btn-view-my-queue"
              onClick={() => onViewMyQueue(booking.tokenNumber)}
              className="flex-1 py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider border border-slate-900 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>View My Live Queue Tracker</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onReturnHome}
              className="py-3.5 px-5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider border border-slate-300 transition-colors cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
