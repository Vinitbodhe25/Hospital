import React, { useState, useEffect } from 'react';
import { DepartmentId, Booking, Doctor, Department, AdminUser, NotificationItem, TransactionalEmailLog } from './types';
import { firebaseService } from './services/firebaseService';
import { authService } from './services/authService';
import { emailService } from './services/emailService';
import { QueueCalculationService } from './services/queueService';

// UI Components
import { Header } from './components/Header';
import { HomeLandingView } from './components/HomeLandingView';
import { DepartmentTabs } from './components/DepartmentTabs';
import { OPDStatusCard } from './components/OPDStatusCard';
import { DoctorCard } from './components/DoctorCard';
import { AppointmentForm } from './components/AppointmentForm';
import { BookingConfirmation } from './components/BookingConfirmation';
import { QueueTracker } from './components/QueueTracker';
import { FeedbackForm } from './components/FeedbackForm';
import { DoctorOperationPanel } from './components/DoctorOperationPanel';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { NotificationPanel } from './components/NotificationPanel';
import { EmailPreviewModal } from './components/EmailPreviewModal';
import { PetChatBot } from './components/PetChatBot';

// Icons
import {
  Activity,
  AlertTriangle,
  HeartHandshake,
  Search,
  Sparkles,
  ShieldCheck,
  Building2,
  Stethoscope,
  Clock,
  CheckCircle2,
  Bell,
  Mail,
  Shield,
  Layers,
} from 'lucide-react';

export default function App() {
  // Global Navigation State
  const [currentView, setCurrentView] = useState<
    'home' | 'book' | 'confirmation' | 'tracker' | 'feedback' | 'doctor-panel' | 'admin' | 'admin-login'
  >('home');

  // Core Reactive Data Store State
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [emailLogs, setEmailLogs] = useState<TransactionalEmailLog[]>([]);

  // Selected Department for Home View
  const [selectedDeptId, setSelectedDeptId] = useState<DepartmentId>('cardiology');

  // Booking & Flow State
  const [preselectedDoctorId, setPreselectedDoctorId] = useState<string | undefined>();
  const [lastCreatedBooking, setLastCreatedBooking] = useState<Booking | null>(null);
  const [activeTrackingToken, setActiveTrackingToken] = useState<string>('');
  const [activeDoctorIdForPanel, setActiveDoctorIdForPanel] = useState<string>('doc-card-1');

  // Auth State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Modals & Drawers
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);

  // Subscribe to Firebase Real-time reactive data
  useEffect(() => {
    const unsubDept = firebaseService.onDepartmentsChanged(setDepartments);
    const unsubDocs = firebaseService.onDoctorsChanged(setDoctors);
    const unsubBookings = firebaseService.onBookingsChanged(setBookings);
    const unsubNotifs = firebaseService.onNotificationsChanged(setNotifications);
    const unsubEmails = emailService.onLogsChanged(setEmailLogs);
    const unsubAuth = authService.onAuthStateChanged(setCurrentUser);

    return () => {
      unsubDept();
      unsubDocs();
      unsubBookings();
      unsubNotifs();
      unsubEmails();
      unsubAuth();
    };
  }, []);

  // Compute selected department & doctors
  const selectedDepartment = departments.find((d) => d.id === selectedDeptId) || departments[0];
  const departmentDoctors = doctors.filter((doc) => doc.departmentId === selectedDeptId);

  // Workload and Recommendations for Selected Department
  const doctorWorkloads = selectedDepartment
    ? QueueCalculationService.calculateDoctorWorkloads(selectedDeptId, doctors, bookings)
    : [];

  const recommendedDoctorWorkload = doctorWorkloads.find((w) => w.isRecommended) || doctorWorkloads[0];

  // Global OPD Emergency Alert Check
  const activeEmergencies = bookings.filter(
    (b) => b.priority === 'EMERGENCY' && b.queueStatus === 'WAITING'
  );

  // Unread notifications count
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // Handlers for Navigation & Booking
  const handleSelectDepartment = (deptId: DepartmentId) => {
    setSelectedDeptId(deptId);
  };

  const handleStartBooking = (doctorId?: string) => {
    setPreselectedDoctorId(doctorId);
    setCurrentView('book');
  };

  const handleBookingCreated = (booking: Booking) => {
    setLastCreatedBooking(booking);
    setActiveTrackingToken(booking.tokenNumber);
    setCurrentView('confirmation');
  };

  const handleViewTracker = (tokenNumber: string) => {
    setActiveTrackingToken(tokenNumber);
    setCurrentView('tracker');
  };

  const handleConfirmArrival = async (bookingId: string) => {
    await firebaseService.updateArrivalStatus(bookingId, 'ARRIVED');
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel your consultation slot?')) {
      await firebaseService.cancelBooking(bookingId);
      if (lastCreatedBooking?.id === bookingId) {
        setLastCreatedBooking((prev) => (prev ? { ...prev, bookingStatus: 'CANCELLED' } : null));
      }
    }
  };

  const handleOpenDoctorConsole = (doctorId: string) => {
    setActiveDoctorIdForPanel(doctorId);
    setCurrentView('doctor-panel');
  };

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setCurrentUser(user);
    setCurrentView('admin');
  };

  const handleAdminLogout = () => {
    authService.logout();
    setCurrentView('home');
  };

  // Find targeted booking & doctor for confirmation screen
  const confirmationDoctor = lastCreatedBooking
    ? doctors.find((d) => d.id === lastCreatedBooking.doctorId) || doctors[0]
    : doctors[0];
  const confirmationDepartment = lastCreatedBooking
    ? departments.find((d) => d.id === lastCreatedBooking.departmentId) || departments[0]
    : departments[0];

  const estimatedWaitForConfirmed = lastCreatedBooking
    ? (QueueCalculationService.calculateQueuePosition(bookings, lastCreatedBooking.tokenNumber, doctors)?.estimatedWaitMinutes ?? 10)
    : 10;

  const currentOpDoctor = doctors.find((d) => d.id === activeDoctorIdForPanel) || doctors[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* Global Header */}
      <Header
        activeTab={currentView}
        onNavigate={(tab) => {
          if (tab === 'admin') {
            if (currentUser) {
              setCurrentView('admin');
            } else {
              setCurrentView('admin-login');
            }
          } else {
            setCurrentView(tab);
          }
        }}
        unreadNotificationsCount={unreadNotifsCount}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenEmailInspector={() => setIsEmailPreviewOpen(true)}
      />

      {/* Hospital Global Emergency Broadcast Notice */}
      {activeEmergencies.length > 0 && (
        <div className="bg-rose-900 text-white px-4 py-2.5 shadow-sm text-xs font-semibold border-b border-rose-950">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-300 animate-bounce flex-shrink-0" />
              <span>
                <strong className="uppercase tracking-wider">Clinical Triage Protocol Active:</strong> {activeEmergencies.length} emergency patient{activeEmergencies.length > 1 ? 's are' : ' is'} prioritized into consultation suites. Wait times recalculate automatically.
              </span>
            </div>
            <button
              onClick={() => setCurrentView('tracker')}
              className="text-[11px] uppercase tracking-wider font-bold underline hover:text-amber-200 cursor-pointer whitespace-nowrap"
            >
              Track Impact Live →
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* VIEW 1: PATIENT HOME / OPD LIVE QUEUE SCREEN */}
        {currentView === 'home' && (
          <HomeLandingView
            departments={departments}
            doctors={doctors}
            bookings={bookings}
            selectedDeptId={selectedDeptId}
            onSelectDepartment={handleSelectDepartment}
            onStartBooking={(docId) => handleStartBooking(docId)}
            onViewTracker={() => setCurrentView('tracker')}
            onOpenFeedback={() => setCurrentView('feedback')}
          />
        )}

        {/* VIEW 2: APPOINTMENT BOOKING SCREEN */}
        {currentView === 'book' && (
          <div className="space-y-4">
            <AppointmentForm
              departments={departments}
              doctors={doctors}
              bookings={bookings}
              preselectedDoctorId={preselectedDoctorId}
              preselectedDepartmentId={selectedDeptId}
              onBookingCreated={handleBookingCreated}
              onCancel={() => setCurrentView('home')}
            />
          </div>
        )}

        {/* VIEW 3: BOOKING CONFIRMATION & PASS SCREEN */}
        {currentView === 'confirmation' && lastCreatedBooking && (
          <BookingConfirmation
            booking={lastCreatedBooking}
            doctor={confirmationDoctor}
            department={confirmationDepartment}
            estimatedWaitMinutes={estimatedWaitForConfirmed}
            onViewMyQueue={handleViewTracker}
            onConfirmArrival={handleConfirmArrival}
            onCancelBooking={handleCancelBooking}
            onReturnHome={() => setCurrentView('home')}
            onOpenEmailPreview={() => setIsEmailPreviewOpen(true)}
          />
        )}

        {/* VIEW 4: LIVE QUEUE TRACKER */}
        {currentView === 'tracker' && (
          <div className="space-y-4">
            <QueueTracker
              initialToken={activeTrackingToken}
              bookings={bookings}
              doctors={doctors}
              departments={departments}
              onBookNew={() => handleStartBooking()}
            />
          </div>
        )}

        {/* VIEW 5: PATIENT FEEDBACK FORM */}
        {currentView === 'feedback' && (
          <FeedbackForm
            doctors={doctors}
            departments={departments}
            onSubmitted={() => setCurrentView('home')}
            onCancel={() => setCurrentView('home')}
          />
        )}

        {/* VIEW 6: DOCTOR OP CONSOLE */}
        {currentView === 'doctor-panel' && (
          <DoctorOperationPanel
            doctor={currentOpDoctor}
            doctors={doctors}
            bookings={bookings}
            departments={departments}
            onSelectOtherDoctor={(docId) => setActiveDoctorIdForPanel(docId)}
          />
        )}

        {/* VIEW 7: ADMIN & CENTRAL COMMAND */}
        {currentView === 'admin' && currentUser && (
          <AdminDashboard
            currentUser={currentUser}
            bookings={bookings}
            doctors={doctors}
            departments={departments}
            onLogout={handleAdminLogout}
            onOpenDoctorPanel={(docId) => {
              setActiveDoctorIdForPanel(docId);
              setCurrentView('doctor-panel');
            }}
            onOpenEmailInspector={() => setIsEmailPreviewOpen(true)}
          />
        )}

        {/* VIEW 8: ADMIN LOGIN MODAL */}
        {currentView === 'admin-login' && (
          <AdminLogin
            onLoginSuccess={handleAdminLoginSuccess}
            onCancel={() => setCurrentView('home')}
          />
        )}
      </main>

      {/* Hospital Footer */}
      <footer className="bg-white border-t border-slate-200/80 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              S
            </div>
            <span className="font-bold text-slate-900 text-sm">Shrushrut OPD System</span>
            <span className="text-slate-400 font-mono text-[11px]">| Real-Time Queue & Smart Hospital Care</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <button onClick={() => setCurrentView('home')} className="hover:text-teal-700 cursor-pointer">Home</button>
            <button onClick={() => setCurrentView('tracker')} className="hover:text-teal-700 cursor-pointer">Queue Tracker</button>
            <button onClick={() => setCurrentView('feedback')} className="hover:text-teal-700 cursor-pointer">Feedback</button>
          </div>
        </div>
      </footer>

      {/* Real-time Notifications Drawer */}
      <NotificationPanel
        notifications={notifications}
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onMarkAllRead={() => firebaseService.markNotificationsRead()}
      />

      {/* Resend Transactional Email Inspector Modal */}
      <EmailPreviewModal
        logs={emailLogs}
        isOpen={isEmailPreviewOpen}
        onClose={() => setIsEmailPreviewOpen(false)}
      />

      {/* Floating Pet / Virtual Assistant */}
      <PetChatBot
        departments={departments}
        doctors={doctors}
        onStartBooking={(docId) => handleStartBooking(docId)}
        onTrackToken={() => setCurrentView('tracker')}
      />
    </div>
  );
}
