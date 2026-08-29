import React, { useState } from 'react';
import {
  Activity,
  Bell,
  Mail,
  Shield,
  Search,
  Calendar,
  Layers,
  Home,
  MessageSquare,
  ChevronDown,
  User,
  LogOut,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onNavigate: (
    tab: 'home' | 'book' | 'tracker' | 'feedback' | 'admin' | 'doctor-panel'
  ) => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onOpenEmailInspector?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onNavigate,
  unreadNotificationsCount = 3,
  onOpenNotifications,
  onOpenEmailInspector,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Hospital Brand Identity */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-sans font-extrabold text-2xl tracking-tight text-slate-900">
                  Shrushrut
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest -mt-0.5">
                HOSPITAL
              </p>
            </div>
          </button>

          {/* Center Navigation Pill Bar (Matching Reference Screenshot) */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold">
            <button
              id="nav-home"
              onClick={() => onNavigate('home')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'home'
                  ? 'bg-teal-50 text-teal-800 border border-teal-200 font-bold shadow-xs'
                  : 'bg-transparent text-slate-600 border border-transparent hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4 text-teal-600" />
              <span>Home</span>
            </button>

            <button
              id="nav-departments"
              onClick={() => onNavigate('home')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'departments'
                  ? 'bg-teal-50 text-teal-800 border border-teal-200 font-bold shadow-xs'
                  : 'bg-transparent text-slate-600 border border-transparent hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span>OPD Departments</span>
            </button>

            <button
              id="nav-book"
              onClick={() => onNavigate('book')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'book'
                  ? 'bg-teal-50 text-teal-800 border border-teal-200 font-bold shadow-xs'
                  : 'bg-transparent text-slate-600 border border-transparent hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Book Consultation</span>
            </button>

            <button
              id="nav-tracker"
              onClick={() => onNavigate('tracker')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'tracker'
                  ? 'bg-teal-50 text-teal-800 border border-teal-200 font-bold shadow-xs'
                  : 'bg-transparent text-slate-600 border border-transparent hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Track Token</span>
            </button>

            <button
              id="nav-feedback"
              onClick={() => onNavigate('feedback')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'feedback'
                  ? 'bg-teal-50 text-teal-800 border border-teal-200 font-bold shadow-xs'
                  : 'bg-transparent text-slate-600 border border-transparent hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <span>Feedback</span>
            </button>
          </nav>

          {/* Right Action Area: Live Badge, Bell, & User Profile */}
          <div className="flex items-center gap-3">
            {/* Live Indicator Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50/90 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>OPD ACTIVE</span>
            </div>

            {/* Email Dispatch Inspector Button */}
            {onOpenEmailInspector && (
              <button
                id="btn-open-email-inspector"
                onClick={onOpenEmailInspector}
                className="flex p-2.5 text-slate-600 hover:text-teal-700 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-full transition-colors cursor-pointer relative"
                title="Sent Token Emails / Email Passes"
              >
                <Mail className="w-4 h-4" />
                <span className="sr-only">Token Emails</span>
              </button>
            )}

            {/* Notifications Bell with Counter (Red badge '3' like reference) */}
            {onOpenNotifications && (
              <button
                id="btn-open-notifications"
                onClick={onOpenNotifications}
                className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-colors cursor-pointer relative"
                title="Real-Time Hospital Queue Broadcasts"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {unreadNotificationsCount || 3}
                </span>
              </button>
            )}

            {/* User Profile Avatar with dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none"
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                  alt="User Avatar"
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">Hospital Portal</p>
                    <p className="text-[11px] text-slate-500 font-mono">Patient & Staff Access</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate('admin');
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-900 flex items-center gap-2 cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-teal-600" />
                    <span>Admin Portal</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate('doctor-panel');
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-900 flex items-center gap-2 cursor-pointer"
                  >
                    <Activity className="w-4 h-4 text-teal-600" />
                    <span>Doctor OPD Console</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate('feedback');
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-900 flex items-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-teal-600" />
                    <span>Give Patient Feedback</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center justify-around py-2.5 border-t border-slate-100 text-xs font-medium text-slate-600 overflow-x-auto gap-2">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${
              activeTab === 'home' ? 'bg-teal-50 text-teal-800 font-bold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('book')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${
              activeTab === 'book' ? 'bg-teal-50 text-teal-800 font-bold' : ''
            }`}
          >
            Book OPD
          </button>
          <button
            onClick={() => onNavigate('tracker')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${
              activeTab === 'tracker' ? 'bg-teal-50 text-teal-800 font-bold' : ''
            }`}
          >
            Track Token
          </button>
          <button
            onClick={() => onNavigate('feedback')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${
              activeTab === 'feedback' ? 'bg-teal-50 text-teal-800 font-bold' : ''
            }`}
          >
            Feedback
          </button>
          <button
            onClick={() => onNavigate('admin')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${
              activeTab === 'admin' || activeTab === 'admin-login'
                ? 'bg-teal-50 text-teal-800 font-bold'
                : ''
            }`}
          >
            Admin
          </button>
        </div>
      </div>
    </header>
  );
};
