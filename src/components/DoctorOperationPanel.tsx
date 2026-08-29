import React, { useState, useEffect } from 'react';
import { Doctor, Booking, Department } from '../types';
import { firebaseService } from '../services/firebaseService';
import { QueueCalculationService } from '../services/queueService';
import { QueueStatusBadge } from './QueueStatusBadge';
import {
  Stethoscope,
  Play,
  CheckCircle2,
  AlertTriangle,
  UserX,
  Clock,
  Users,
  ChevronRight,
  Sparkles,
  Phone,
  FileText,
  UserCheck,
  Trash2,
} from 'lucide-react';

interface DoctorOperationPanelProps {
  doctor: Doctor;
  doctors: Doctor[];
  bookings: Booking[];
  departments: Department[];
  onSelectOtherDoctor?: (docId: string) => void;
}

export const DoctorOperationPanel: React.FC<DoctorOperationPanelProps> = ({
  doctor,
  doctors,
  bookings,
  departments,
  onSelectOtherDoctor,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [manualDuration, setManualDuration] = useState<number | ''>('');
  const [emergencyReason, setEmergencyReason] = useState('');
  const [selectedEmergencyBookingId, setSelectedEmergencyBookingId] = useState<string | null>(null);

  // Active queue for this doctor
  const activeQueue = QueueCalculationService.getSortedActiveQueueForDoctor(bookings, doctor.id);
  const currentConsulting = activeQueue.find((b) => b.queueStatus === 'IN_CONSULTATION');
  const waitingPatients = activeQueue.filter((b) => b.queueStatus === 'WAITING');

  const dept = departments.find((d) => d.id === doctor.departmentId);
  const rollingAvg = QueueCalculationService.calculateRollingAverage(doctor.recentDurations);

  // Timer for active consultation
  useEffect(() => {
    let interval: any = null;
    if (currentConsulting && currentConsulting.consultationStartTime) {
      const startMs = new Date(currentConsulting.consultationStartTime).getTime();
      interval = setInterval(() => {
        const diffSecs = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
        setElapsedSeconds(diffSecs);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [currentConsulting]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartNext = async () => {
    if (waitingPatients.length === 0) return;
    const nextPatient = waitingPatients[0];
    await firebaseService.startConsultation(doctor.id, nextPatient.id);
  };

  const handleStartSpecific = async (bookingId: string) => {
    await firebaseService.startConsultation(doctor.id, bookingId);
  };

  const handleCompleteCurrent = async () => {
    if (!currentConsulting) return;
    const customMinutes = manualDuration ? Number(manualDuration) : undefined;
    await firebaseService.completeConsultation(doctor.id, currentConsulting.id, customMinutes);
    setManualDuration('');
  };

  const handleMarkNoShow = async (bookingId: string) => {
    if (window.confirm('Mark this patient as No-Show and remove from active queue?')) {
      await firebaseService.updateArrivalStatus(bookingId, 'NO_SHOW');
    }
  };

  const handleMarkEmergency = async () => {
    if (!selectedEmergencyBookingId) return;
    const reason = emergencyReason.trim() || 'Urgent physician triage override';
    await firebaseService.markEmergencyPriority(selectedEmergencyBookingId, reason);
    setSelectedEmergencyBookingId(null);
    setEmergencyReason('');
  };

  const handleToggleStatus = async (status: Doctor['status']) => {
    await firebaseService.updateDoctorStatus(doctor.id, status);
  };

  const handleRemoveCompletedToken = async (bookingId: string, tokenNumber: string) => {
    if (window.confirm(`Remove completed token ${tokenNumber} from this suite's active record?`)) {
      await firebaseService.removeBooking(bookingId);
    }
  };

  const completedPatients = bookings.filter(
    (b) => b.doctorId === doctor.id && b.queueStatus === 'COMPLETED'
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Console Bar */}
      <div className="bg-slate-900 text-white p-6 border border-slate-900 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 border border-slate-700 bg-slate-800 text-sky-400 flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-bold text-white tracking-tight">{doctor.name}</h1>
                <QueueStatusBadge type="doctor" value={doctor.status} size="sm" />
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {dept?.name} • Suite {doctor.roomNo} • Doctor No: <strong className="font-mono text-slate-100">{doctor.doctorNo}</strong> (Asst: {doctor.assistantNo})
              </p>
            </div>
          </div>

          {/* Quick Doctor Switcher */}
          {onSelectOtherDoctor && (
            <div className="flex items-center gap-2 bg-slate-800 p-2 border border-slate-700">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Switch OPD Room:</span>
              <select
                id="select-op-doctor"
                value={doctor.id}
                onChange={(e) => onSelectOtherDoctor(e.target.value)}
                className="text-xs bg-slate-900 border border-slate-700 px-2.5 py-1 text-white font-medium focus:outline-none"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} (Room {d.roomNo})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Doctor Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block">Waiting Outside</span>
            <span className="font-mono text-xl font-black text-white">
              {waitingPatients.length} Patients
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block">Completed Today</span>
            <span className="font-mono text-xl font-black text-emerald-400">
              {doctor.completedConsultations} Visits
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block">Rolling Avg Duration</span>
            <span className="font-mono text-xl font-black text-sky-400">
              ~{rollingAvg} min/patient
            </span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <button
              onClick={() => handleToggleStatus(doctor.status === 'AVAILABLE' ? 'ON_BREAK' : 'AVAILABLE')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                doctor.status === 'AVAILABLE'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              {doctor.status === 'AVAILABLE' ? 'Take Break' : 'Resume OPD'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Active In-Consultation Console */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-900 shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 bg-slate-100 border border-slate-300 px-2 py-0.5">
                  Active Consultation Room
                </span>
                <h2 className="text-xl font-serif font-bold text-slate-900 mt-1">
                  Current Patient in Suite {doctor.roomNo}
                </h2>
              </div>

              {currentConsulting && (
                <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 border border-slate-900 font-mono text-sm font-bold shadow-xs">
                  <Clock className="w-4 h-4 text-sky-400 animate-spin" />
                  <span>{formatTimer(elapsedSeconds)}</span>
                </div>
              )}
            </div>

            {currentConsulting ? (
              <div className="space-y-5">
                {/* Patient Header Box */}
                <div className="bg-slate-50 border border-slate-900 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900">
                          {currentConsulting.tokenNumber}
                        </span>
                        <span className="text-base font-serif font-bold text-slate-900">
                          — {currentConsulting.patientName}
                        </span>
                        <QueueStatusBadge type="priority" value={currentConsulting.priority} size="sm" />
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-mono">
                        {currentConsulting.age} yrs • {currentConsulting.gender} • Mobile: <strong className="text-slate-900">{currentConsulting.mobile}</strong>
                      </p>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900 bg-white border border-slate-900 px-2.5 py-1">
                      In Room Now
                    </span>
                  </div>

                  {/* Clinical Reason */}
                  <div className="mt-4 pt-3 border-t border-slate-300 text-xs">
                    <span className="text-slate-700 font-bold uppercase tracking-wider text-[10px] block mb-1">
                      Reason for Consultation:
                    </span>
                    <p className="text-slate-900 bg-white p-3 border border-slate-300 leading-relaxed font-medium">
                      {currentConsulting.reason}
                    </p>
                  </div>
                </div>

                {/* Consultation Conclude Actions */}
                <div className="p-4 bg-slate-100 border border-slate-900 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      Conclude Consultation & Update Rolling Wait Model:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 text-[11px]">Override Duration (min):</span>
                      <input
                        id="input-manual-duration"
                        type="number"
                        min="1"
                        max="120"
                        placeholder={Math.max(1, Math.round(elapsedSeconds / 60)).toString()}
                        value={manualDuration}
                        onChange={(e) => setManualDuration(e.target.value ? Number(e.target.value) : '')}
                        className="w-16 text-xs font-mono font-bold bg-white border border-slate-400 px-2 py-1"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      id="btn-complete-consultation"
                      onClick={handleCompleteCurrent}
                      className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider border border-slate-900 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Complete Consultation & Call Next</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-400 space-y-4">
                <div className="w-12 h-12 border border-slate-300 bg-white text-slate-800 flex items-center justify-center mx-auto">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-slate-900">Room is Ready</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
                    {waitingPatients.length > 0
                      ? `${waitingPatients.length} patients are currently waiting in the OPD corridor.`
                      : 'No patients currently waiting in queue.'}
                  </p>
                </div>

                {waitingPatients.length > 0 && (
                  <button
                    id="btn-call-next-patient"
                    onClick={handleStartNext}
                    className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider border border-slate-900 shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Call Next Patient ({waitingPatients[0].tokenNumber} — {waitingPatients[0].patientName})</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Emergency Insertion Modal/Drawer inside console */}
          {selectedEmergencyBookingId && (
            <div className="bg-rose-50 border border-rose-900 p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-950 font-bold text-xs uppercase tracking-widest">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Expedite Emergency Priority Triage</span>
              </div>
              <p className="text-xs text-rose-900">
                Marking this patient as Emergency will insert them directly to the top of the queue and dynamically notify all waiting patients.
              </p>
              <textarea
                rows={2}
                placeholder="Enter clinical reason (e.g. Acute severe dyspnea, suspected arrhythmia)"
                value={emergencyReason}
                onChange={(e) => setEmergencyReason(e.target.value)}
                className="w-full text-xs bg-white border border-rose-300 p-2.5 text-slate-900 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleMarkEmergency}
                  className="py-2 px-4 bg-rose-800 hover:bg-rose-900 text-white text-xs font-bold uppercase tracking-wider border border-rose-900 cursor-pointer"
                >
                  Confirm Emergency Elevation
                </button>
                <button
                  onClick={() => setSelectedEmergencyBookingId(null)}
                  className="py-2 px-3 bg-white border border-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 span): Active Waiting Queue List with Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-900 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 flex items-center gap-1.5 font-serif">
                <Users className="w-4 h-4 text-slate-800" />
                Waiting Queue ({waitingPatients.length})
              </h3>
              <span className="text-[11px] font-mono text-slate-600 font-bold">
                Est: ~{waitingPatients.length * rollingAvg}m
              </span>
            </div>

            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {waitingPatients.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-6 text-center font-mono">
                  Waiting room is currently clear.
                </p>
              ) : (
                waitingPatients.map((patient, idx) => {
                  const isEmergency = patient.priority === 'EMERGENCY';

                  return (
                    <div
                      key={patient.id}
                      className={`p-3.5 border text-xs space-y-2 transition-all ${
                        isEmergency
                          ? 'bg-rose-50 border-rose-600'
                          : 'bg-slate-50 border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {patient.tokenNumber}
                            </span>
                            <span className="font-serif font-bold text-slate-900">
                              {patient.patientName}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-600 block font-mono">
                            {patient.age}y • {patient.gender} • Pos #{idx + 1}
                          </span>
                        </div>

                        {isEmergency ? (
                          <span className="bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                            EMERGENCY
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono font-bold">
                            ~{(idx + 1) * rollingAvg}m
                          </span>
                        )}
                      </div>

                      {/* Patient Reason snippet */}
                      <p className="text-[11px] text-slate-700 line-clamp-1 bg-white p-1.5 border border-slate-300">
                        {patient.reason}
                      </p>

                      {/* Action buttons for staff */}
                      <div className="pt-1 flex items-center justify-between gap-1.5 border-t border-slate-200">
                        <button
                          onClick={() => handleStartSpecific(patient.id)}
                          className="py-1 px-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Call In</span>
                        </button>

                        {!isEmergency && (
                          <button
                            onClick={() => setSelectedEmergencyBookingId(patient.id)}
                            className="py-1 px-2 text-rose-800 hover:bg-rose-100 border border-rose-200 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                            title="Mark Emergency Priority"
                          >
                            🚨 Emergency
                          </button>
                        )}

                        <button
                          onClick={() => handleMarkNoShow(patient.id)}
                          className="py-1 px-2 text-slate-600 hover:text-rose-800 hover:bg-rose-50 border border-slate-200 text-[11px] cursor-pointer"
                          title="Mark No-Show"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Completed in Suite with Remove Token Action */}
          {completedPatients.length > 0 && (
            <div className="bg-white border border-slate-900 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 flex items-center gap-1.5 font-serif">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Completed in Suite ({completedPatients.length})
                </h3>
                <button
                  onClick={async () => {
                    if (window.confirm(`Clear all ${completedPatients.length} completed tokens from this suite?`)) {
                      await Promise.all(completedPatients.map((p) => firebaseService.removeBooking(p.id)));
                    }
                  }}
                  className="text-[10px] text-rose-700 hover:text-rose-900 font-bold uppercase tracking-wider underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {completedPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900">{patient.tokenNumber}</span>
                        <span className="font-serif font-bold text-slate-900">{patient.patientName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {patient.consultationDuration || 10}m consultation
                      </span>
                    </div>

                    <button
                      id={`btn-doc-remove-token-${patient.id}`}
                      onClick={() => handleRemoveCompletedToken(patient.id, patient.tokenNumber)}
                      className="py-1 px-2 text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-700 border border-rose-300 hover:border-rose-700 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                      title="Remove completed token from queue"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
