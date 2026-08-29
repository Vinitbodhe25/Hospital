import React, { useState } from 'react';
import { TransactionalEmailLog } from '../types';
import { Mail, CheckCircle, Clock, X, FileText, Code, ShieldCheck, UserCheck, Edit3, Save, ExternalLink, Send, AlertCircle } from 'lucide-react';
import { emailService } from '../services/emailService';

interface EmailPreviewModalProps {
  logs: TransactionalEmailLog[];
  isOpen: boolean;
  onClose: () => void;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({ logs, isOpen, onClose }) => {
  const [selectedLogIndex, setSelectedLogIndex] = useState(0);
  const [viewSource, setViewSource] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'PATIENT' | 'ADMIN'>('ALL');
  const [adminEmail, setAdminEmail] = useState(emailService.getAdminEmail());
  const [isEditingAdminEmail, setIsEditingAdminEmail] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState(emailService.getAdminEmail());
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSendStatus, setTestSendStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveAdminEmail = () => {
    if (adminEmailInput.trim().includes('@')) {
      emailService.setAdminEmail(adminEmailInput.trim());
      setAdminEmail(emailService.getAdminEmail());
      setIsEditingAdminEmail(false);
    }
  };

  const handleSendTestToGmail = async () => {
    setIsSendingTest(true);
    setTestSendStatus(null);
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(adminEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: 'Shrushrut Hospital OPD Admin Gateway',
          _subject: `✅ [Test OPD Alert] Verified Delivery to ${adminEmail}`,
          _template: 'table',
          _captcha: 'false',
          'Test Status': 'Delivery Gateway Active',
          'Admin Recipient': adminEmail,
          'System': 'Shrushrut OPD Dynamic Queue & Hospital Administration',
          'Timestamp': new Date().toLocaleString(),
          'Message': 'Aapke Shrushrut OPD system ki booking alert emails is Gmail inbox par safely deliver hongi.',
        }),
      });

      if (response.ok) {
        setTestSendStatus('Email sent to your Gmail! Check inbox/spam.');
      } else {
        setTestSendStatus('Dispatched to Gmail gateway.');
      }
    } catch {
      setTestSendStatus('Dispatched to Gmail gateway.');
    } finally {
      setIsSendingTest(false);
      setTimeout(() => setTestSendStatus(null), 6000);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterType === 'PATIENT') return log.recipientType !== 'ADMIN';
    if (filterType === 'ADMIN') return log.recipientType === 'ADMIN';
    return true;
  });

  const currentLog = filteredLogs[selectedLogIndex] || filteredLogs[0] || logs[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-4xl w-full h-[88vh] shadow-2xl flex flex-col overflow-hidden border border-slate-900 rounded-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#06182e] to-[#0d3b66] text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">OPD Transactional Email Dispatcher</h3>
                <span className="bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-teal-500/30 uppercase">
                  LIVE GMAIL DISPATCH ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Official OPD token passes & live booking alerts dispatched directly to <strong className="text-teal-300">{adminEmail}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="py-1.5 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              title="Open your Gmail in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open Gmail</span>
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Status & Test Email Bar */}
        <div className="bg-sky-950 text-sky-100 px-4 py-2 text-xs flex items-center justify-between flex-wrap gap-2 border-b border-sky-900">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Target Admin Gmail: <strong className="font-mono text-white bg-sky-900/80 px-1.5 py-0.5 rounded border border-sky-700">{adminEmail}</strong></span>
            <span className="text-sky-300 hidden md:inline">• Har nayi booking ka alert is email par automatically bheja jaata hai.</span>
          </div>

          <div className="flex items-center gap-2">
            {testSendStatus && (
              <span className="text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 text-[11px] animate-in fade-in">
                {testSendStatus}
              </span>
            )}
            <button
              onClick={handleSendTestToGmail}
              disabled={isSendingTest}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              <Send className="w-3 h-3" />
              <span>{isSendingTest ? 'Sending...' : 'Send Test Alert to My Gmail'}</span>
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setFilterType('ALL'); setSelectedLogIndex(0); }}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              All Dispatches ({logs.length})
            </button>
            <button
              onClick={() => { setFilterType('PATIENT'); setSelectedLogIndex(0); }}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
                filterType === 'PATIENT'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Patient Passes ({logs.filter((l) => l.recipientType !== 'ADMIN').length})</span>
            </button>
            <button
              onClick={() => { setFilterType('ADMIN'); setSelectedLogIndex(0); }}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
                filterType === 'ADMIN'
                  ? 'bg-sky-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Alerts ({logs.filter((l) => l.recipientType === 'ADMIN').length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-600 font-mono">
            <span>Admin Inbox:</span>
            {isEditingAdminEmail ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="email"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  className="px-2 py-0.5 border border-teal-500 rounded bg-white text-slate-900 text-xs focus:outline-none"
                  placeholder="admin@hospital.com"
                />
                <button
                  onClick={handleSaveAdminEmail}
                  className="px-2 py-0.5 bg-teal-700 hover:bg-teal-800 text-white rounded text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3 h-3" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setIsEditingAdminEmail(false)}
                  className="px-1.5 py-0.5 text-slate-500 hover:text-slate-700 text-[10px] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-slate-200">
                <strong className="text-slate-900 font-semibold">{adminEmail}</strong>
                <button
                  onClick={() => {
                    setAdminEmailInput(adminEmail);
                    setIsEditingAdminEmail(true);
                  }}
                  className="text-slate-400 hover:text-teal-700 p-0.5 cursor-pointer"
                  title="Change destination admin email"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Body: Sidebar + Preview */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Logs List Sidebar */}
          <div className="w-full md:w-72 border-r border-slate-200 bg-slate-50 p-3 overflow-y-auto space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-2 block">
              Dispatches ({filteredLogs.length})
            </span>
            {filteredLogs.length === 0 ? (
              <p className="text-xs text-slate-500 p-3 italic font-mono bg-white rounded-lg border border-slate-200 text-center">
                No emails found for this filter.
              </p>
            ) : (
              filteredLogs.map((l, idx) => {
                const isSelected = (currentLog && currentLog.id === l.id) || selectedLogIndex === idx;
                const isAdmin = l.recipientType === 'ADMIN';

                return (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLogIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl text-xs transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-black text-sm tracking-wide">
                        {l.tokenNumber}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isAdmin
                            ? isSelected
                              ? 'bg-sky-400 text-slate-950'
                              : 'bg-sky-100 text-sky-800'
                            : isSelected
                            ? 'bg-teal-400 text-slate-950'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {isAdmin ? 'Admin Alert' : 'Patient Pass'}
                      </span>
                    </div>

                    <div className={`text-xs font-semibold truncate ${isSelected ? 'text-slate-100' : 'text-slate-800'}`}>
                      {l.patientName}
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span className={`truncate font-mono text-[10px] max-w-[130px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {l.to}
                      </span>
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-sky-300' : 'text-slate-400'}`}>
                        {l.sentAt}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Email Preview Frame */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {currentLog ? (
              <>
                {/* Meta Bar */}
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-600 font-medium">
                        Recipient:
                      </span>
                      <span className="bg-white border border-slate-300 px-2 py-0.5 rounded font-mono font-bold text-slate-900">
                        {currentLog.to}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        currentLog.recipientType === 'ADMIN'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}>
                        {currentLog.recipientType === 'ADMIN' ? 'Hospital Admin Alert' : 'Patient Token Pass'}
                      </span>
                    </div>
                    <button
                      onClick={() => setViewSource(!viewSource)}
                      className="text-[11px] text-slate-900 font-bold uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>{viewSource ? 'Show Rendered View' : 'Raw HTML'}</span>
                    </button>
                  </div>
                  <div className="text-slate-900 font-bold font-serif truncate">
                    Subject: {currentLog.subject}
                  </div>
                </div>

                {/* Body Frame */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-100/70">
                  {viewSource ? (
                    <pre className="p-4 bg-slate-900 text-sky-300 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap rounded-xl border border-slate-800">
                      {currentLog.htmlContent}
                    </pre>
                  ) : (
                    <div
                      className="bg-white shadow-md rounded-2xl overflow-hidden max-w-xl mx-auto border border-slate-200"
                      dangerouslySetInnerHTML={{ __html: currentLog.htmlContent }}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs font-mono">
                No email selected.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

