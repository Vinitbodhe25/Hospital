import React from 'react';
import { NotificationItem } from '../types';
import { Bell, AlertTriangle, CheckCircle2, Info, X, Clock } from 'lucide-react';

interface NotificationPanelProps {
  notifications: NotificationItem[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l border-slate-900 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-900 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 border border-slate-700 bg-slate-800 text-sky-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-white">Hospital Real-Time Stream</h3>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Live OPD arrivals & priority triage log</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">
              No recent notifications recorded.
            </div>
          ) : (
            notifications.map((n) => {
              const isEmergency = n.type === 'emergency';
              const isSuccess = n.type === 'success';
              const isWarning = n.type === 'warning';

              return (
                <div
                  key={n.id}
                  className={`p-3.5 border text-xs space-y-1 transition-all ${
                    isEmergency
                      ? 'bg-rose-50 border-rose-600'
                      : isSuccess
                      ? 'bg-emerald-50 border-emerald-300'
                      : isWarning
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-serif font-bold">
                      {isEmergency ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 animate-pulse" />
                      ) : isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                      ) : (
                        <Info className="w-4 h-4 text-slate-800 flex-shrink-0" />
                      )}
                      <span className={isEmergency ? 'text-rose-900' : 'text-slate-900'}>
                        {n.title}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono font-bold">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 leading-relaxed pl-5.5">
                    {n.message}
                  </p>

                  {n.targetToken && (
                    <div className="pl-5.5 pt-1">
                      <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 border border-slate-400 text-slate-900">
                        Token {n.targetToken}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-900 bg-white flex items-center justify-between">
          <button
            onClick={onMarkAllRead}
            className="text-xs text-slate-900 hover:underline font-bold uppercase tracking-wider cursor-pointer"
          >
            Mark all as read
          </button>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Shrushrut PubSub</span>
        </div>
      </div>
    </div>
  );
};
