import React, { useState, useEffect } from 'react';
import { Booking, Doctor, Department } from '../types';
import { QueueCalculationService } from '../services/queueService';
import { firebaseService } from '../services/firebaseService';
import { QueueStatusBadge } from './QueueStatusBadge';
import {
  Clock,
  Users,
  Search,
  AlertTriangle,
  UserCheck,
  XCircle,
  Activity,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Stethoscope,
} from 'lucide-react';

interface QueueTrackerProps {
  initialToken?: string;
  bookings: Booking[];
  doctors: Doctor[];
  departments: Department[];
  onBookNew?: () => void;
}

export const QueueTracker: React.FC<QueueTrackerProps> = ({
  initialToken = '',
  bookings,
  doctors,
  departments,
  onBookNew,
}) => {
  const [searchToken, setSearchToken] = useState(initialToken);
  const [activeToken, setActiveToken] = useState(initialToken);
  const [lastRefreshedTime, setLastRefreshedTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    if (initialToken) {
      setSearchToken(initialToken);
      setActiveToken(initialToken);
    }
  }, [initialToken]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchToken.trim()) {
      setActiveToken(searchToken.trim().toUpperCase());
      setLastRefreshedTime(new Date().toLocaleTimeString());
    }
  };

  const queueResult = activeToken
    ? QueueCalculationService.calculateQueuePosition(bookings, activeToken, doctors)
    : null;
  const targetBooking = activeToken
    ? bookings.find((b) => b.tokenNumber.toUpperCase() === activeToken.toUpperCase())
    : undefined;
  const targetDoctor = targetBooking ? doctors.find((d) => d.id === targetBooking.doctorId) : undefined;
  const targetDepartment = targetBooking
    ? departments.find((d) => d.id === targetBooking.departmentId)
    : undefined;

  // Active queue list for this doctor (anonymized for patient view)
  const doctorActiveQueue = targetDoctor
    ? QueueCalculationService.getSortedActiveQueueForDoctor(bookings, targetDoctor.id)
    : [];

  const handleArrived = async () => {
    if (!targetBooking) return;
    await firebaseService.updateArrivalStatus(targetBooking.id, 'ARRIVED');
  };

  const handleCancel = async () => {
    if (!targetBooking) return;
    if (window.confirm('Are you sure you want to cancel your consultation slot?')) {
      await firebaseService.cancelBooking(targetBooking.id);
    }
  };

  const hasEmergencyInQueue = doctorActiveQueue.some(
    (b) => b.priority === 'EMERGENCY' && b.queueStatus === 'WAITING'
  );

  const activeTokensList = bookings
    .filter((b) => b.bookingStatus === 'BOOKED' && b.queueStatus !== 'COMPLETED')
    .slice(-6)
    .map((b) => b.tokenNumber);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Search Bar for Any Token */}
      <div className="bg-white border border-slate-900 p-5 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-tracker-token-search"
              type="text"
              placeholder="Enter Token (e.g. C-001, O-001, G-001)"
              value={searchToken}
              onChange={(e) => setSearchToken(e.target.value.toUpperCase())}
              className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 pl-10 pr-4 py-2.5 focus:outline-none focus:border-slate-900 uppercase placeholder:normal-case placeholder:font-normal"
            />
          </div>

          <button
            id="btn-search-token"
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider border border-slate-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <span>Track OPD Live</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Suggestion Tokens (Dynamic from active bookings) */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-dashed border-slate-200 text-xs">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Active Tokens:</span>
          {activeTokensList.length > 0 ? (
            activeTokensList.map((tok) => (
              <button
                key={tok}
                type="button"
                onClick={() => {
                  setSearchToken(tok);
                  setActiveToken(tok);
                }}
                className={`px-2.5 py-0.5 font-mono text-[11px] font-bold border transition-colors cursor-pointer ${
                  activeToken === tok
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-900'
                }`}
              >
                {tok}
              </button>
            ))
          ) : (
            <span className="text-slate-400 italic text-[11px]">
              No active tokens in queue. Book a new appointment to generate your live token.
            </span>
          )}
        </div>
      </div>

      {!activeToken ? (
        <div className="bg-white border border-slate-900 p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 border border-slate-900 bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-900">Live OPD Queue Tracking</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
              Enter your issued token above or register a new consultation to track your live queue position and estimated arrival time.
            </p>
          </div>
          {onBookNew && (
            <button
              onClick={onBookNew}
              className="py-2.5 px-5 bg-slate-900 text-white text-xs uppercase tracking-wider font-bold border border-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Book OPD Consultation
            </button>
          )}
        </div>
      ) : !queueResult ? (
        <div className="bg-white border border-slate-900 p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 border border-slate-900 bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-900">Token Not Found</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
              Could not find active record for token <strong className="font-mono">{activeToken}</strong>. Please check your token number or book a new consultation.
            </p>
          </div>
          {onBookNew && (
            <button
              onClick={onBookNew}
              className="py-2.5 px-5 bg-slate-900 text-white text-xs uppercase tracking-wider font-bold border border-slate-900 hover:bg-slate-800 transition-colors"
            >
              Book OPD Consultation
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Emergency Priority Alert Banner */}
          {hasEmergencyInQueue && queueResult.status === 'WAITING' && (
            <div className="bg-amber-50 border border-amber-300 p-4 flex items-start gap-3 shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5 animate-bounce" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Dynamic Queue Notice: Priority Triage Active
                </h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  An urgent emergency clinical case was triaged into the queue. Your estimated waiting time has been dynamically recalculated to reflect hospital priority protocols.
                </p>
              </div>
            </div>
          )}

          {/* Main Status Display Screen */}
          <div className="bg-white border border-slate-900 shadow-sm overflow-hidden">
            {/* Header: Token ID, Doctor & Real-time timestamp */}
            <div className="bg-slate-900 text-white p-6 sm:p-7 flex flex-wrap items-center justify-between gap-4 border-b border-slate-900">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-300 bg-slate-800 px-2 py-0.5 border border-slate-700">
                    Live Shrushrut Queue Synced
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {lastRefreshedTime}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-white">
                  Token: <span className="font-mono">{queueResult.tokenNumber}</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {queueResult.doctorName} • {queueResult.departmentName} • Suite {queueResult.roomNo}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <QueueStatusBadge type="queue" value={queueResult.status} size="md" />
                <QueueStatusBadge type="priority" value={queueResult.priority} size="sm" />
              </div>
            </div>

            {/* Arrival Notice if Pending */}
            {queueResult.arrivalStatus === 'PENDING' && (
              <div className="bg-amber-50 border-b border-amber-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 bg-amber-600 animate-ping" />
                  <p className="text-xs font-bold text-amber-950">
                    Arrival Pending — Tap when you reach the hospital to activate queue position.
                  </p>
                </div>
                <button
                  id="btn-tracker-arrived"
                  onClick={handleArrived}
                  className="w-full sm:w-auto py-2 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider border border-emerald-900 transition-colors cursor-pointer whitespace-nowrap"
                >
                  I Have Arrived
                </button>
              </div>
            )}

            {/* Core Live Metrics Display */}
            <div className="p-6 sm:p-7">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {/* Metric 1: Position */}
                <div className="bg-slate-50 border border-slate-200 p-4 text-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    Queue Position
                  </span>
                  <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900">
                    #{queueResult.position}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">In Room Queue</span>
                </div>

                {/* Metric 2: Patients Ahead */}
                <div className="bg-slate-50 border border-slate-200 p-4 text-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    Patients Ahead
                  </span>
                  <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900">
                    {queueResult.patientsAhead}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">Waiting Before You</span>
                </div>

                {/* Metric 3: Currently Consulting */}
                <div className="bg-sky-50/60 border border-sky-200 p-4 text-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-sky-900 block mb-1">
                    In Consultation
                  </span>
                  <span className="font-mono text-2xl sm:text-3xl font-black text-sky-950">
                    {queueResult.currentlyConsultingToken || 'Next In'}
                  </span>
                  <span className="text-[10px] text-sky-800 block mt-0.5 font-mono">
                    {queueResult.currentlyConsultingToken === queueResult.tokenNumber ? '🟢 CURRENT PATIENT' : 'With Doctor'}
                  </span>
                </div>

                {/* Metric 4: Estimated Wait Time */}
                <div className="bg-slate-900 text-white border border-slate-900 p-4 text-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 block mb-1">
                    Estimated Wait
                  </span>
                  <span className="font-mono text-2xl sm:text-3xl font-black text-white">
                    {queueResult.status === 'IN_CONSULTATION' ? '0' : `~${queueResult.estimatedWaitMinutes}`}
                    <span className="text-xs font-normal text-slate-400 ml-1">min</span>
                  </span>
                  <span className="text-[10px] text-sky-300 block mt-0.5 font-mono">Rolling Average</span>
                </div>
              </div>

              {/* Dynamic Wait-Time Math Explanation Box */}
              <div className="bg-slate-50 border border-slate-200 p-4 mb-6 text-xs text-slate-700 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 font-serif text-sm">
                    <Activity className="w-3.5 h-3.5 text-sky-700" />
                    Shrushrut Dynamic Wait Calculation Formula
                  </span>
                  <span className="text-[11px] font-mono text-slate-800 font-bold">
                    Pace: {queueResult.averageConsultationTime} min/patient
                  </span>
                </div>

                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Unlike static schedules, this timer recalculates live based on actual doctor consultation duration rolling averages (last visits: {targetDoctor?.recentDurations?.join(', ') || '10, 12, 11'} min).
                </p>

                <div className="bg-white p-2.5 border border-slate-300 font-mono text-[11px] text-slate-900 flex items-center justify-between">
                  <span>
                    Formula: {queueResult.patientsAhead} patients ahead × {queueResult.averageConsultationTime} min avg
                  </span>
                  <strong className="text-slate-900">= ~{queueResult.estimatedWaitMinutes} minutes</strong>
                </div>
              </div>

              {/* Anonymized Queue Progress List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-700" />
                    Doctor's Active Suite Queue ({doctorActiveQueue.length} Active)
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Privacy-protected token log
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {doctorActiveQueue.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-3 text-center">
                      No active patients currently waiting in this suite.
                    </p>
                  ) : (
                    doctorActiveQueue.map((item, idx) => {
                      const isSelf = item.tokenNumber.toUpperCase() === activeToken.toUpperCase();
                      const isConsulting = item.queueStatus === 'IN_CONSULTATION';
                      const isEmergency = item.priority === 'EMERGENCY';

                      return (
                        <div
                          key={item.id}
                          className={`p-3 border text-xs flex items-center justify-between transition-all ${
                            isSelf
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : isConsulting
                              ? 'bg-sky-50 text-sky-950 border-sky-300'
                              : isEmergency
                              ? 'bg-rose-50 text-rose-950 border-rose-300'
                              : 'bg-white text-slate-800 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 flex items-center justify-center font-mono font-bold text-[11px] border ${
                                isSelf
                                  ? 'bg-slate-800 text-sky-300 border-slate-700'
                                  : isConsulting
                                  ? 'bg-sky-200 text-sky-900 border-sky-300'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-sm">
                                  {item.tokenNumber}
                                </span>
                                {isSelf && (
                                  <span className="bg-sky-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.2 uppercase tracking-wider">
                                    Your Token
                                  </span>
                                )}
                              </div>
                              <span
                                className={`text-[10px] font-mono ${
                                  isSelf ? 'text-slate-300' : 'text-slate-500'
                                }`}
                              >
                                {isConsulting ? 'Currently Inside Suite' : `Arrived ${item.arrivedAt ? new Date(item.arrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}`}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isEmergency && (
                              <span className="bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                                EMERGENCY
                              </span>
                            )}
                            <span
                              className={`font-mono text-xs font-bold px-2 py-0.5 border ${
                                isSelf
                                  ? 'bg-slate-800 text-sky-300 border-slate-700'
                                  : isConsulting
                                  ? 'bg-sky-200 text-sky-950 border-sky-300'
                                  : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              {isConsulting ? 'In Suite' : `Pos #${idx + 1}`}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Attendance Controls inside Tracker */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {targetBooking?.arrivalStatus !== 'ARRIVED' ? (
                    <button
                      id="btn-tracker-confirm-arrived-bottom"
                      onClick={handleArrived}
                      className="py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider border border-emerald-900 flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Confirm Arrival at OPD</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-900 font-bold uppercase tracking-wider flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-3 py-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-700" />
                      Arrival Confirmed & Logged
                    </span>
                  )}

                  {targetBooking?.bookingStatus === 'BOOKED' && (
                    <button
                      id="btn-tracker-cancel-bottom"
                      onClick={handleCancel}
                      className="py-2 px-3 bg-white hover:bg-rose-50 border border-slate-300 hover:border-rose-400 text-rose-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Slot</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                  <ShieldCheck className="w-4 h-4 text-slate-700" />
                  <span>Privacy protected by Shrushrut OPD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
