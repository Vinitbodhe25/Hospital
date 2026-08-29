import React from 'react';
import { BookingStatus, ArrivalStatus, QueueStatus, Priority, DoctorStatus } from '../types';

interface QueueStatusBadgeProps {
  type: 'booking' | 'arrival' | 'queue' | 'priority' | 'doctor';
  value: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const QueueStatusBadge: React.FC<QueueStatusBadgeProps> = ({
  type,
  value,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider',
    md: 'text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider',
    lg: 'text-xs px-3 py-1 font-bold uppercase tracking-wider',
  }[size];

  let label = value;
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';

  if (type === 'priority') {
    const p = value as Priority;
    if (p === 'EMERGENCY') {
      label = 'EMERGENCY CASE';
      colorClasses = 'bg-rose-900 text-white border-rose-950 animate-pulse';
    } else {
      label = 'Regular Routine';
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
    }
  } else if (type === 'arrival') {
    const a = value as ArrivalStatus;
    if (a === 'ARRIVED') {
      label = 'Arrived at OPD';
      colorClasses = 'bg-emerald-50 text-emerald-900 border-emerald-400';
    } else if (a === 'NO_SHOW') {
      label = 'No-Show / Absent';
      colorClasses = 'bg-rose-50 text-rose-900 border-rose-400';
    } else {
      label = 'Arrival Pending';
      colorClasses = 'bg-amber-50 text-amber-900 border-amber-400';
    }
  } else if (type === 'queue') {
    const q = value as QueueStatus;
    if (q === 'IN_CONSULTATION') {
      label = 'In Consultation';
      colorClasses = 'bg-slate-900 text-white border-slate-900 shadow-xs';
    } else if (q === 'COMPLETED') {
      label = 'Consultation Completed';
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-300';
    } else {
      label = 'Waiting in Queue';
      colorClasses = 'bg-sky-50 text-sky-900 border-sky-300';
    }
  } else if (type === 'booking') {
    const b = value as BookingStatus;
    if (b === 'BOOKED') {
      label = 'Confirmed';
      colorClasses = 'bg-slate-100 text-slate-900 border-slate-400';
    } else {
      label = 'Cancelled';
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-300 line-through';
    }
  } else if (type === 'doctor') {
    const d = value as DoctorStatus;
    if (d === 'AVAILABLE') {
      label = 'Active OPD';
      colorClasses = 'bg-emerald-50 text-emerald-900 border-emerald-400';
    } else if (d === 'ON_BREAK') {
      label = 'On Short Break';
      colorClasses = 'bg-amber-50 text-amber-900 border-amber-400';
    } else {
      label = 'Off Duty';
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-300';
    }
  }

  return (
    <span
      id={`badge-${type}-${value.toLowerCase()}`}
      className={`inline-flex items-center justify-center border ${sizeClasses} ${colorClasses} ${className} whitespace-nowrap transition-colors`}
    >
      {type === 'priority' && value === 'EMERGENCY' && (
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5 animate-ping" />
      )}
      {type === 'queue' && value === 'IN_CONSULTATION' && (
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mr-1.5 animate-pulse" />
      )}
      {label}
    </span>
  );
};
