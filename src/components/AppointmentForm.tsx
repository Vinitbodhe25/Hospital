import React, { useState } from 'react';
import { Doctor, Department, DepartmentId, Booking } from '../types';
import { firebaseService } from '../services/firebaseService';
import { emailService } from '../services/emailService';
import { QueueCalculationService } from '../services/queueService';
import { Stethoscope, Calendar, Clock, User, Phone, Mail, MapPin, FileText, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AppointmentFormProps {
  departments: Department[];
  doctors: Doctor[];
  bookings?: Booking[];
  preselectedDoctorId?: string;
  preselectedDepartmentId?: DepartmentId;
  initialDoctor?: Doctor;
  initialDepartmentId?: DepartmentId;
  onBookingCreated?: (booking: Booking) => void;
  onBookingSuccess?: (bookingId: string, tokenNumber: string) => void;
  onCancel: () => void;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  departments,
  doctors,
  bookings = [],
  preselectedDoctorId,
  preselectedDepartmentId,
  initialDoctor,
  initialDepartmentId,
  onBookingCreated,
  onBookingSuccess,
  onCancel,
}) => {
  const initialDept =
    preselectedDepartmentId || initialDepartmentId || initialDoctor?.departmentId || 'cardiology';
  const initialDoc =
    preselectedDoctorId ||
    initialDoctor?.id ||
    doctors.find((d) => d.departmentId === initialDept)?.id ||
    '';

  const [selectedDeptId, setSelectedDeptId] = useState<DepartmentId>(initialDept);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(initialDoc);

  // Form Fields
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [reason, setReason] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointmentTime, setAppointmentTime] = useState('10:30');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filter available doctors for selected department
  const availableDoctors = doctors.filter((d) => d.departmentId === selectedDeptId);
  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || availableDoctors[0];
  const selectedDepartment = departments.find((d) => d.id === selectedDeptId);

  const handleDeptChange = (deptId: DepartmentId) => {
    setSelectedDeptId(deptId);
    const docs = doctors.filter((d) => d.departmentId === deptId);
    if (docs.length > 0) {
      setSelectedDoctorId(docs[0].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!patientName.trim()) {
      setFormError('Please enter the patient’s full name.');
      return;
    }
    if (!age || Number(age) <= 0 || Number(age) > 120) {
      setFormError('Please enter a valid age between 1 and 120.');
      return;
    }
    if (!mobile.trim() || mobile.length < 8) {
      setFormError('Please enter a valid mobile number for OPD SMS / WhatsApp notifications.');
      return;
    }
    if (!selectedDoctor) {
      setFormError('Please select an available doctor for consultation.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create booking in Firestore/Service layer (automatically dispatches Admin email alert & Patient pass)
      const newBooking = await firebaseService.createBooking({
        patientName: patientName.trim(),
        age: Number(age),
        gender,
        mobile: mobile.trim(),
        email: email.trim() || `${patientName.toLowerCase().replace(/\s+/g, '')}@patient.shrushrut.hospital`,
        address: address.trim() || 'Outpatient Patient Area',
        reason: reason.trim() || 'General OPD consultation and clinical assessment',
        doctorId: selectedDoctor.id,
        departmentId: selectedDeptId,
        appointmentDate,
        appointmentTime,
      });

      // Trigger pleasant celebratory confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#0f766e', '#14b8a6', '#0d9488', '#38bdf8'],
        });
      } catch {
        // pass
      }

      if (onBookingCreated) {
        onBookingCreated(newBooking);
      } else if (onBookingSuccess) {
        onBookingSuccess(newBooking.id, newBooking.tokenNumber);
      }
    } catch (err: any) {
      console.error('Booking submission error:', err);
      setFormError(err?.message || 'Unable to confirm consultation. Please verify your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <button
        id="btn-back-to-home"
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to OPD Departments</span>
      </button>

      {/* Main Form Card */}
      <div className="bg-white border border-slate-900 shadow-sm overflow-hidden">
        {/* Header Banner: Selected Doctor & Department */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 border-b border-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-300 bg-slate-800 px-2 py-0.5 border border-slate-700">
                Outpatient Consultation Request
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-black mt-2 text-white tracking-tight">
                Book Consultation with {selectedDoctor ? selectedDoctor.name : 'Specialist'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {selectedDepartment?.name} • Suite {selectedDoctor?.roomNo} • {selectedDoctor?.opdTiming}
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 p-3 text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Doctor ID</span>
              <span className="font-mono font-bold text-white text-sm">
                {selectedDoctor?.doctorNo}
              </span>
              <span className="text-[10px] text-sky-300 font-mono block mt-0.5">
                Assistant: {selectedDoctor?.assistantNo}
              </span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {formError && (
            <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-rose-600" />
              {formError}
            </div>
          )}

          {/* Section 1: Department & Doctor Selection */}
          <div className="bg-slate-50 p-4 sm:p-5 border border-slate-200 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-slate-700" />
              1. Specialty & Consulting Physician
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                  Selected Department
                </label>
                <select
                  id="select-dept"
                  value={selectedDeptId}
                  onChange={(e) => handleDeptChange(e.target.value as DepartmentId)}
                  className="w-full text-xs font-medium bg-white border border-slate-300 px-3 py-2.5 focus:outline-none focus:border-slate-900 text-slate-900"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                  Selected Doctor
                </label>
                <select
                  id="select-doctor"
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-300 px-3 py-2.5 focus:outline-none focus:border-slate-900 text-slate-900"
                >
                  {availableDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.specialization} — Room {doc.roomNo})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Patient Demographics */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-700" />
              2. Patient Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-patient-name"
                  type="text"
                  required
                  placeholder="e.g. Ritik Petkar"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 px-3 py-2.5 focus:outline-none focus:border-slate-900 text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                  Age <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-age"
                  type="number"
                  required
                  min="1"
                  max="120"
                  placeholder="e.g. 26"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-xs bg-white border border-slate-300 px-3 py-2.5 focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                  Gender
                </label>
                <select
                  id="select-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full text-xs bg-white border border-slate-300 px-3 py-2.5 focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-mobile"
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 px-3 py-2.5 focus:outline-none focus:border-slate-900 text-slate-900 font-medium font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span>Email Address <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-teal-700 font-semibold lowercase">token will be sent here</span>
                </label>
                <div className="relative">
                  <input
                    id="input-email"
                    type="email"
                    required
                    placeholder="e.g. ritikpetkar44@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 pl-3 pr-8 py-2.5 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-slate-900 font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  📧 Digital OPD token number & live queue link will be sent to this email.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                Residential Address / Locality
              </label>
              <input
                id="input-address"
                type="text"
                placeholder="e.g. Prestige Boulevard, Flat 402, Shivajinagar"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 px-3 py-2.5 focus:outline-none focus:border-slate-900 text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Section 3: Consultation Details */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              3. Clinical Reason & Preferred Slot
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                  Preferred Appointment Date
                </label>
                <input
                  id="input-date"
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 px-3 py-2.5 focus:outline-none focus:border-slate-900 text-slate-900 font-medium font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                  Preferred Arrival Time
                </label>
                <input
                  id="input-time"
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 px-3 py-2.5 focus:outline-none focus:border-slate-900 text-slate-900 font-medium font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                Reason for Consultation / Symptoms
              </label>
              <textarea
                id="input-reason"
                rows={3}
                placeholder="Briefly describe symptoms, onset duration, or follow-up requirements"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 p-3 focus:outline-none focus:border-slate-900 text-slate-900 font-medium resize-none"
              />
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-600">
            <ShieldCheck className="w-4 h-4 text-slate-700 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Shrushrut Privacy Guard:</strong> Patient medical reason & phone number are restricted to authorized OPD physicians. Public waiting monitors only display anonymized token numbers.
            </p>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              id="btn-confirm-consultation"
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider border border-slate-900 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating OPD Token...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>Confirm Consultation & Generate Token</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="py-3.5 px-5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider border border-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
