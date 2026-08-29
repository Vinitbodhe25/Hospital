import React from 'react';
import { DoctorWorkloadMetric } from '../types';
import { Clock, Users, Activity, Sparkles, Check, Stethoscope } from 'lucide-react';
import { QueueStatusBadge } from './QueueStatusBadge';

interface DoctorWorkloadCardProps {
  workload: DoctorWorkloadMetric;
  onSelectDoctor?: (doctorId: string) => void;
  onOpenDoctorPanel?: (doctorId: string) => void;
}

export const DoctorWorkloadCard: React.FC<DoctorWorkloadCardProps> = ({
  workload,
  onSelectDoctor,
  onOpenDoctorPanel,
}) => {
  const { doctor, patientsWaiting, averageConsultationMinutes, currentPatientToken, estimatedQueueMinutes, workloadStatus, isRecommended } = workload;

  const getLoadBadgeColor = () => {
    switch (workloadStatus) {
      case 'OPTIMAL':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'MODERATE':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'HEAVY':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      id={`workload-card-${doctor.id}`}
      className={`bg-white border p-4 sm:p-5 flex flex-col justify-between shadow-xs transition-all ${
        isRecommended
          ? 'border-slate-900 ring-1 ring-slate-900 bg-slate-50/50'
          : 'border-slate-900'
      }`}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-serif font-bold text-slate-900">{doctor.name}</h4>
              {isRecommended && (
                <span className="bg-slate-900 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Recommended
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5 font-mono">
              Suite {doctor.roomNo} • {doctor.specialization}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${getLoadBadgeColor()}`}>
              {workloadStatus} LOAD
            </span>
            <QueueStatusBadge type="doctor" value={doctor.status} size="sm" />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 border border-slate-300 mb-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Waiting</span>
            <span className="font-mono text-sm font-black text-slate-900">
              {patientsWaiting}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Avg Time</span>
            <span className="font-mono text-sm font-black text-slate-900">
              ~{averageConsultationMinutes}m
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">In Room</span>
            <span className="font-mono text-sm font-black text-slate-900">
              {currentPatientToken || 'None'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Est. Finish</span>
            <span className="font-mono text-sm font-black text-slate-900">
              ~{estimatedQueueMinutes}m
            </span>
          </div>
        </div>
      </div>

      {/* Action Footers */}
      <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-200">
        {onOpenDoctorPanel && (
          <button
            id={`btn-open-doc-panel-${doctor.id}`}
            onClick={() => onOpenDoctorPanel(doctor.id)}
            className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Launch OP Console</span>
          </button>
        )}

        {onSelectDoctor && (
          <button
            id={`btn-assign-doc-${doctor.id}`}
            onClick={() => onSelectDoctor(doctor.id)}
            className={`py-1.5 px-3 text-xs font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
              isRecommended
                ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
                : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-900'
            }`}
          >
            Assign Walk-in
          </button>
        )}
      </div>
    </div>
  );
};
