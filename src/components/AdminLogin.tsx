import React, { useState } from 'react';
import { authService } from '../services/authService';
import { AdminUser } from '../types';
import { Shield, Lock, Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your authorized hospital email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.loginWithEmail(email.trim(), password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Login error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Patient Portal</span>
      </button>

      <div className="bg-white border border-slate-900 shadow-sm overflow-hidden">
        <div className="bg-slate-900 text-white p-6 sm:p-7 text-center border-b border-slate-900">
          <div className="w-12 h-12 border border-slate-700 bg-slate-800 text-sky-400 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-sky-300 bg-slate-800 px-2.5 py-0.5 border border-slate-700">
            Admin Authentication
          </span>
          <h1 className="text-xl font-serif font-bold text-white mt-2">Hospital Admin Portal</h1>
          <p className="text-xs text-slate-300 mt-1">
            Protected administrative access for OPD queue management, CSV export, and doctor rosters.
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-6 sm:p-7 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-admin-email"
                type="email"
                required
                placeholder="name@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-admin-password"
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
              />
            </div>
          </div>

          <button
            id="btn-admin-submit-login"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider border border-slate-900 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <KeyRound className="w-4 h-4 text-sky-400" />
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Admin Portal'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
