import React, { useState } from 'react';
import { Doctor, Department } from '../types';
import { firebaseService } from '../services/firebaseService';
import { Star, MessageSquare, Heart, CheckCircle2, ArrowLeft, Send } from 'lucide-react';

interface FeedbackFormProps {
  doctors: Doctor[];
  departments: Department[];
  onSubmitted: () => void;
  onCancel: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  doctors,
  departments,
  onSubmitted,
  onCancel,
}) => {
  const [patientName, setPatientName] = useState('');
  const [tokenNumber, setTokenNumber] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');

  const [hospitalRating, setHospitalRating] = useState(5);
  const [doctorRating, setDoctorRating] = useState(5);
  const [waitTimeRating, setWaitTimeRating] = useState(5);
  const [overallRating, setOverallRating] = useState(5);
  const [comments, setComments] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    setIsSubmitting(true);
    try {
      await firebaseService.addFeedback({
        patientName: patientName.trim(),
        tokenNumber: tokenNumber.trim().toUpperCase() || undefined,
        doctorId: selectedDoctorId || undefined,
        departmentId: (selectedDeptId as any) || undefined,
        hospitalExperience: hospitalRating,
        doctorExperience: doctorRating,
        waitingTimeRating: waitTimeRating,
        overallRating: overallRating,
        comments: comments.trim() || 'Patient reported satisfactory care at Shrushrut OPD.',
      });

      setSubmittedSuccess(true);
      setTimeout(() => {
        onSubmitted();
      }, 1500);
    } catch (e) {
      console.error('Feedback error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarSelector = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (val: number) => void;
  }) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition-colors cursor-pointer"
          >
            <Star
              className={`w-5 h-5 ${
                star <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
              }`}
            />
          </button>
        ))}
        <span className="text-xs font-mono font-bold text-slate-700 ml-1.5 w-4">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </button>

      <div className="bg-white border border-slate-900 shadow-sm overflow-hidden">
        <div className="bg-slate-900 text-white p-6 sm:p-7 border-b border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-slate-700 bg-slate-800 flex items-center justify-center text-rose-300">
              <Heart className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">Patient Experience & OPD Feedback</h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Help us refine queue wait-time precision and clinical care quality.
              </p>
            </div>
          </div>
        </div>

        {submittedSuccess ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 border border-slate-900 bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-slate-900">Thank You For Your Feedback</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your response has been stored and shared with the OPD Quality Assurance Team.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shalini Murthy"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 px-3 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                  OPD Token Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. C-019"
                  value={tokenNumber}
                  onChange={(e) => setTokenNumber(e.target.value.toUpperCase())}
                  className="w-full text-xs font-mono uppercase bg-white border border-slate-300 px-3 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                Rate Your Clinical Experience
              </h3>
              <StarSelector
                label="1. Hospital Cleanliness & OPD Facilities"
                value={hospitalRating}
                onChange={setHospitalRating}
              />
              <StarSelector
                label="2. Doctor Consultation & Explanation"
                value={doctorRating}
                onChange={setDoctorRating}
              />
              <StarSelector
                label="3. Waiting Time Accuracy & Queue Clarity"
                value={waitTimeRating}
                onChange={setWaitTimeRating}
              />
              <StarSelector
                label="4. Overall Outpatient Service"
                value={overallRating}
                onChange={setOverallRating}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                Comments, Compliments, or Suggestions
              </label>
              <textarea
                rows={3}
                placeholder="Share your thoughts about your visit, wait duration, or nursing assistance..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 p-3 text-slate-900 focus:outline-none focus:border-slate-900 resize-none"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider border border-slate-900 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-sky-400" />
                <span>Submit Experience Review</span>
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="py-3 px-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider border border-slate-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
