import React, { useState } from 'react';
import {
  Department,
  Doctor,
  Booking,
  DepartmentId
} from '../types';
import {
  Activity,
  Calendar,
  Search,
  Users,
  Clock,
  UserCheck,
  ClipboardList,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Star,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Radio,
  MessageSquare,
  Stethoscope,
  Heart,
  FileText
} from 'lucide-react';
import { DepartmentTabs } from './DepartmentTabs';
import { QueueCalculationService } from '../services/queueService';

interface HomeLandingViewProps {
  departments: Department[];
  doctors: Doctor[];
  bookings: Booking[];
  selectedDeptId: DepartmentId;
  onSelectDepartment: (deptId: DepartmentId) => void;
  onStartBooking: (doctorId?: string) => void;
  onViewTracker: () => void;
  onOpenFeedback: () => void;
}

export const HomeLandingView: React.FC<HomeLandingViewProps> = ({
  departments,
  doctors,
  bookings,
  selectedDeptId,
  onSelectDepartment,
  onStartBooking,
  onViewTracker,
  onOpenFeedback,
}) => {
  // Current selected department
  const selectedDepartment = departments.find((d) => d.id === selectedDeptId) || departments[0];
  const departmentDoctors = doctors.filter((d) => d.departmentId === selectedDeptId);

  // Doctor carousel index for Top Specialists card
  const [specialistIndex, setSpecialistIndex] = useState(0);

  // Active doctor for specialist card
  const activeSpecialist = departmentDoctors[specialistIndex % Math.max(1, departmentDoctors.length)] || doctors[0];

  const nextSpecialist = () => {
    if (departmentDoctors.length > 0) {
      setSpecialistIndex((prev) => (prev + 1) % departmentDoctors.length);
    }
  };

  // Queue calculation metrics for current department
  const deptBookings = bookings.filter(
    (b) => b.departmentId === selectedDeptId && b.bookingStatus === 'BOOKED'
  );
  const waitingPatientsCount = deptBookings.filter(
    (b) => b.queueStatus === 'WAITING' && b.arrivalStatus === 'ARRIVED'
  ).length || deptBookings.length || 24;

  const inConsultationCount = deptBookings.filter(
    (b) => b.queueStatus === 'IN_CONSULTATION'
  ).length || departmentDoctors.filter((d) => d.status === 'AVAILABLE').length || 7;

  // Overview metrics for today
  const totalPatientsToday = bookings.length > 0 ? bookings.length + 210 : 248;
  const availableDoctorsCount = doctors.filter((d) => d.status === 'AVAILABLE').length || 12;

  return (
    <div className="space-y-8">
      {/* 1. HERO SECTION (Matching User Image Layout) */}
      <div className="bg-gradient-to-br from-[#06182e] via-[#092242] to-[#0c315e] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl border border-slate-800">
        {/* Background Subtle Medical Glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-radial from-teal-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Hero Copy & Actions */}
          <div className="lg:col-span-7 space-y-5">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Real-Time OPD Queue Management</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Compassionate Care,<br />
              <span className="text-teal-400">Smarter</span> Experience
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-slate-300 max-w-xl font-normal leading-relaxed">
              Real-time queue tracking, smart consultations, and better care — all in one place.
            </p>

            {/* Hero CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                id="btn-hero-book-consultation"
                onClick={() => onStartBooking()}
                className="py-3.5 px-6 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-white" />
                <span>Book Consultation</span>
              </button>

              <button
                id="btn-hero-track-token"
                onClick={onViewTracker}
                className="py-3.5 px-6 bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Radio className="w-4 h-4 text-teal-300 animate-pulse" />
                <span>Track My Token</span>
              </button>
            </div>
          </div>

          {/* Right Column: Floating "Today's OPD Overview" Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Today's OPD Overview</span>
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Live Updates</span>
                </div>
              </div>

              {/* 2x2 Metric Tiles */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* Tile 1: Patients Today */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold font-mono text-white leading-none">
                      {totalPatientsToday}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1">Patients Today</div>
                  </div>
                </div>

                {/* Tile 2: Avg. Wait Time */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold font-mono text-white leading-none">
                      36 min
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1">Avg. Wait Time</div>
                  </div>
                </div>

                {/* Tile 3: Doctors Available */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold font-mono text-white leading-none">
                      {availableDoctorsCount}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1">Doctors Available</div>
                  </div>
                </div>

                {/* Tile 4: In Consultation */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 flex-shrink-0">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold font-mono text-white leading-none">
                      {inConsultationCount}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1">In Consultation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OPD DEPARTMENTS CAROUSEL (Round Colored Icons) */}
      <DepartmentTabs
        departments={departments}
        selectedDepartmentId={selectedDeptId}
        onSelectDepartment={onSelectDepartment}
        onViewAll={() => {}}
      />

      {/* 3. THREE-COLUMN BENTO CARDS (Matching Reference Screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CARD 1: TRACK OPD LIVE */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center">
                  <Radio className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Track OPD Live</h3>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live</span>
              </span>
            </div>

            {/* Department Indicator */}
            <div className="flex items-center gap-2 mb-4 bg-slate-50 border border-slate-100 rounded-xl p-2.5">
              <Heart className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span className="text-xs font-bold text-slate-800">
                {selectedDepartment?.name} OPD
              </span>
              <span className="text-[10px] text-slate-500 ml-auto font-mono font-semibold">
                {selectedDepartment?.floor.split('—')[0].trim()}
              </span>
            </div>

            {/* 2x2 Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3.5">
                <div className="text-lg font-mono font-bold text-slate-900">
                  {waitingPatientsCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  Patients Waiting
                </div>
              </div>

              <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3.5">
                <div className="text-lg font-mono font-bold text-slate-900">
                  {inConsultationCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  Currently Consulting
                </div>
              </div>

              <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3.5">
                <div className="text-lg font-mono font-bold text-teal-700">
                  7
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  Your Position
                </div>
              </div>

              <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3.5">
                <div className="text-lg font-mono font-bold text-slate-900">
                  42 min
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  Estimated Wait Time
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onViewTracker}
            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Track My Queue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* CARD 2: TOP SPECIALISTS */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Top Specialists</h3>
              </div>
              <button
                onClick={() => onStartBooking()}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
              >
                View All Doctors
              </button>
            </div>

            {/* Doctor Profile Details */}
            {activeSpecialist && (
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={activeSpecialist.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'}
                      alt={activeSpecialist.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {activeSpecialist.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {activeSpecialist.specialization.split('&')[0].trim()}
                    </p>
                  </div>
                </div>

                {/* Attribute List */}
                <div className="space-y-2 bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Experience:</span>
                    <span className="font-bold text-slate-900">
                      {activeSpecialist.experienceYears}+ Years
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Consultation Fee:</span>
                    <span className="font-bold text-slate-900">
                      ₹{activeSpecialist.consultationFee || 800}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>OPD Timing:</span>
                    <span className="font-bold text-slate-900 font-mono text-[11px]">
                      {activeSpecialist.opdTiming}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 mt-5">
            <button
              onClick={() => onStartBooking(activeSpecialist?.id)}
              className="flex-1 py-3 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors text-center cursor-pointer shadow-xs"
            >
              Book Now
            </button>

            {departmentDoctors.length > 1 && (
              <button
                onClick={nextSpecialist}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                title="Next Doctor"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* CARD 3: GIVE FEEDBACK */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Give Feedback</h3>
            </div>

            <div className="space-y-3">
              <h4 className="text-base font-bold text-slate-900 leading-snug">
                Help us improve our services
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your feedback helps us provide better care and experience for every patient.
              </p>

              {/* Decorative Stars & Survey Mock Graphic */}
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-indigo-900 font-semibold">
                    Over 98% Patient Satisfaction
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button (Purple solid like screenshot) */}
          <button
            onClick={onOpenFeedback}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer mt-5"
          >
            <span>Share Feedback</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. BOTTOM FEATURE HIGHLIGHTS BAR (Matching Reference Screenshot) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Feature 1 */}
          <div className="flex items-center gap-3 pt-2 md:pt-0 px-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Smart Queue</div>
              <div className="text-[11px] text-slate-500">Real-time updates</div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-center gap-3 pt-2 md:pt-0 px-2 md:pl-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center flex-shrink-0">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Live Tracking</div>
              <div className="text-[11px] text-slate-500">Track your token live</div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-center gap-3 pt-2 md:pt-0 px-2 md:pl-4">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Priority Care</div>
              <div className="text-[11px] text-slate-500">Emergency cases first</div>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex items-center gap-3 pt-2 md:pt-0 px-2 md:pl-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Secure & Safe</div>
              <div className="text-[11px] text-slate-500">Your data is protected</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
