/**
 * Shrushrut — Hospital OPD Dynamic Queue Management System
 * Transactional Email Service (Resend Integration Architecture)
 * 
 * Complies with strict client-side security:
 * - API keys are never exposed in client bundles (read from process.env or backend proxy)
 * - Generates high-fidelity clinical HTML confirmation emails
 * - Maintains interactive in-app dispatch logs so users & testers can preview exact emails delivered
 */

import { Booking, Doctor, Department, TransactionalEmailLog } from '../types';

class EmailService {
  private static instance: EmailService;
  private emailLogs: TransactionalEmailLog[] = [];
  private listeners: Set<(logs: TransactionalEmailLog[]) => void> = new Set();
  private storageKey = 'shrushrut_email_logs_v1';
  private adminEmailKey = 'shrushrut_admin_email_v1';
  private adminEmail = 'ritikpetkar44@gmail.com';

  private constructor() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.emailLogs = JSON.parse(saved);
      }
      const savedAdmin = localStorage.getItem(this.adminEmailKey);
      if (savedAdmin && savedAdmin.includes('@')) {
        this.adminEmail = savedAdmin.trim();
      }
    } catch {
      this.emailLogs = [];
    }
  }

  public getAdminEmail(): string {
    return this.adminEmail || 'ritikpetkar44@gmail.com';
  }

  public setAdminEmail(email: string): void {
    if (email && email.includes('@')) {
      this.adminEmail = email.trim();
      try {
        localStorage.setItem(this.adminEmailKey, this.adminEmail);
      } catch {
        // quota fallback
      }
    }
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public onLogsChanged(callback: (logs: TransactionalEmailLog[]) => void): () => void {
    this.listeners.add(callback);
    callback([...this.emailLogs]);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public getLogs(): TransactionalEmailLog[] {
    return [...this.emailLogs];
  }

  /**
   * Generates formatted clinical HTML email for Resend / Gmail delivery
   */
  public generateConfirmationHtml(params: {
    booking: Booking;
    doctor: Doctor;
    department: Department;
    estimatedWaitMinutes: number;
  }): string {
    const { booking, doctor, department, estimatedWaitMinutes } = params;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OPD Token #${booking.tokenNumber} - Shrushrut Hospital</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #0f172a; -webkit-font-smoothing: antialiased; }
    .email-wrapper { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 14px 34px -8px rgba(15, 23, 42, 0.12); }
    
    /* Header */
    .header { background: linear-gradient(135deg, #06182e 0%, #0c3359 55%, #0f766e 100%); color: #ffffff; padding: 36px 28px 30px; text-align: center; position: relative; }
    .hospital-logo-badge { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 12px; font-size: 22px; margin-bottom: 12px; }
    .hospital-title { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; }
    .hospital-subtitle { margin: 6px 0 0; font-size: 13px; color: #5eead4; font-weight: 600; letter-spacing: 0.02em; }
    .verified-pill { display: inline-block; background: rgba(13, 148, 136, 0.35); border: 1px solid #2dd4bf; color: #ffffff; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 12px; border-radius: 9999px; margin-top: 14px; }
    
    /* Main Content */
    .content { padding: 32px 28px; }
    .greeting-text { font-size: 16px; margin-top: 0; margin-bottom: 8px; color: #0f172a; font-weight: 700; }
    .intro-p { font-size: 13.5px; color: #475569; line-height: 1.6; margin-top: 0; margin-bottom: 24px; }
    
    /* DIGITAL TOKEN PASS CARD */
    .token-card { background: linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%); border: 2px solid #0d9488; border-radius: 16px; padding: 24px 20px; text-align: center; margin-bottom: 28px; box-shadow: 0 4px 16px -2px rgba(13, 148, 136, 0.12); position: relative; }
    .token-tag { font-size: 11px; text-transform: uppercase; color: #0f766e; font-weight: 800; letter-spacing: 0.14em; display: block; margin-bottom: 4px; }
    .token-large-number { font-size: 48px; font-weight: 900; color: #0f766e; letter-spacing: 0.06em; font-family: 'SF Mono', 'Roboto Mono', Monaco, monospace; margin: 4px 0 8px; line-height: 1; }
    .token-destination { font-size: 13px; color: #042f2e; font-weight: 700; background: #ccfbf1; display: inline-block; padding: 5px 14px; border-radius: 8px; border: 1px solid #99f6e4; }
    .token-wait-chip { font-size: 11.5px; color: #475569; margin-top: 10px; font-weight: 500; }
    .token-wait-chip strong { color: #0f766e; }

    /* Summary Grid Table */
    .section-heading { font-size: 11px; text-transform: uppercase; font-weight: 800; color: #64748b; letter-spacing: 0.1em; margin-bottom: 12px; display: block; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 26px; }
    .info-table tr:nth-child(even) { background-color: #f8fafc; }
    .info-table td { padding: 12px 10px; font-size: 13px; vertical-align: middle; }
    .info-table td.label-col { color: #64748b; width: 40%; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.04em; }
    .info-table td.val-col { color: #0f172a; font-weight: 700; width: 60%; }
    .highlight-pill { background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; font-family: monospace; }

    /* Instructions Box */
    .instruction-card { background: #f8fafc; border: 1px solid #cbd5e1; border-left: 5px solid #0d9488; padding: 18px 20px; border-radius: 10px; margin-bottom: 24px; font-size: 13px; line-height: 1.65; color: #334155; }
    .instruction-card h4 { margin: 0 0 8px 0; font-size: 13px; color: #0f766e; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 800; }
    .instruction-card ol { margin: 0; padding-left: 18px; }
    .instruction-card li { margin-bottom: 6px; }
    .instruction-card li:last-child { margin-bottom: 0; }

    /* Action CTA */
    .cta-container { text-align: center; margin: 24px 0 10px; }
    .cta-btn { display: inline-block; background: #0f766e; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; font-weight: 800; font-size: 13px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.08em; box-shadow: 0 4px 12px rgba(15, 118, 110, 0.25); }

    /* Footer */
    .footer { background: #f1f5f9; padding: 24px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; line-height: 1.6; }
    .footer strong { color: #334155; }
    .footer-meta { font-size: 11px; color: #94a3b8; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <!-- HEADER -->
    <div class="header">
      <div class="hospital-logo-badge">🏥</div>
      <h1 class="hospital-title">Shrushrut Hospital</h1>
      <p class="hospital-subtitle">Outpatient Department (OPD) • Digital Consultation Pass</p>
      <div class="verified-pill">✓ Verified Booking Confirmed</div>
    </div>

    <!-- CONTENT -->
    <div class="content">
      <p class="greeting-text">Namaste ${booking.patientName},</p>
      <p class="intro-p">
        Aapki OPD doctor consultation safaltapoorvak book ho gayi hai. Hospital aane par reception aur doctor ke OPD room par neeche diya gaya <strong>Digital Token Number</strong> dikhayein:
      </p>
      
      <!-- TOKEN PASS BADGE -->
      <div class="token-card">
        <span class="token-tag">YOUR LIVE OPD TOKEN NUMBER</span>
        <div class="token-large-number">#${booking.tokenNumber}</div>
        <div class="token-destination">
          📍 Room #${doctor.roomNo} • ${department.name} (${department.floor})
        </div>
        <div class="token-wait-chip">
          Scheduled Slot: <strong>${booking.appointmentDate} at ${booking.appointmentTime}</strong> | Est. Wait: <strong>~${estimatedWaitMinutes} Mins</strong>
        </div>
      </div>

      <!-- APPOINTMENT DETAILS TABLE -->
      <span class="section-heading">Consultation & Patient Summary</span>
      <table class="info-table">
        <tr>
          <td class="label-col">Token Number:</td>
          <td class="val-col"><span class="highlight-pill">${booking.tokenNumber}</span></td>
        </tr>
        <tr>
          <td class="label-col">Patient Name:</td>
          <td class="val-col">${booking.patientName} (${booking.age} Yrs • ${booking.gender})</td>
        </tr>
        <tr>
          <td class="label-col">Consulting Doctor:</td>
          <td class="val-col">${doctor.name} <br/><span style="font-size: 11px; color: #64748b; font-weight: normal;">${doctor.specialization} • ID: ${doctor.doctorNo}</span></td>
        </tr>
        <tr>
          <td class="label-col">Department & Wing:</td>
          <td class="val-col">${department.name} (${department.floor})</td>
        </tr>
        <tr>
          <td class="label-col">OPD Consultation Suite:</td>
          <td class="val-col">Room #${doctor.roomNo} (Doctor Assistant: ${doctor.assistantNo})</td>
        </tr>
        <tr>
          <td class="label-col">Appointment Date & Time:</td>
          <td class="val-col">${booking.appointmentDate} at ${booking.appointmentTime}</td>
        </tr>
        <tr>
          <td class="label-col">Registered Email:</td>
          <td class="val-col" style="font-family: monospace; font-size: 12px; color: #0f766e;">${booking.email}</td>
        </tr>
        <tr>
          <td class="label-col">Registered Mobile:</td>
          <td class="val-col" style="font-family: monospace; font-size: 12px;">${booking.mobile}</td>
        </tr>
        <tr>
          <td class="label-col">Chief Complaint:</td>
          <td class="val-col" style="color: #0369a1;">${booking.reason || 'General Outpatient Assessment'}</td>
        </tr>
      </table>

      <!-- INSTRUCTIONS CARD -->
      <div class="instruction-card">
        <h4>📋 Patient Guidelines / ज़रूरी दिशा-निर्देश:</h4>
        <ol>
          <li><strong>Timely Arrival:</strong> Kripya apne scheduled time se <strong>15 minute pehle</strong> hospital OPD wing mein pahunchein.</li>
          <li><strong>Check-in Token:</strong> Hospital pahunchne par portal par <em>"I have arrived at the hospital"</em> dabayein ya counter par Token <strong>#${booking.tokenNumber}</strong> batayein taaki doctor ke live queue me aapka turn activate ho sake.</li>
          <li><strong>Live Tracker:</strong> Aap kisi bhi samay Shrushrut app par apna token number enter karke live queue status aur bacha hua wait time dekh sakte hain.</li>
        </ol>
      </div>

      <!-- CTA -->
      <div class="cta-container">
        <a href="https://shrushrut.hospital/track?token=${encodeURIComponent(booking.tokenNumber)}" class="cta-btn">
          ⏱️ Track Live Queue Status (#${booking.tokenNumber})
        </a>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <strong>Shrushrut Multi-Specialty Hospital & Research Centre</strong><br/>
      Central Healthcare Hub • 24x7 OPD & Emergency Management Information System<br/>
      <div class="footer-meta">
        This is an automated verified transactional pass sent directly to <strong>${booking.email}</strong>.<br/>
        Booking Reference ID: ${booking.id} • Generated on ${new Date().toLocaleString()}
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generates formatted clinical HTML email for Hospital Admin Alert
   */
  public generateAdminAlertHtml(params: {
    booking: Booking;
    doctor: Doctor;
    department: Department;
    adminEmail?: string;
    queuePosition?: number;
  }): string {
    const { booking, doctor, department, adminEmail = this.getAdminEmail(), queuePosition = 1 } = params;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Alert: New OPD Booking #${booking.tokenNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1524; margin: 0; padding: 20px; color: #0f172a; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 12px 30px rgba(0,0,0,0.2); }
    .header { background: linear-gradient(135deg, #091a30 0%, #1e3a8a 100%); color: #ffffff; padding: 28px 24px; text-align: left; border-bottom: 3px solid #38bdf8; }
    .header-badge { display: inline-block; background: #38bdf8; color: #082f49; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 10px; border-radius: 9999px; margin-bottom: 10px; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #93c5fd; }
    .content { padding: 26px 24px; }
    .alert-banner { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px 16px; margin-bottom: 22px; display: flex; align-items: center; justify-content: space-between; }
    .alert-title { font-size: 13px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.05em; }
    .alert-desc { font-size: 12px; color: #15803d; margin-top: 2px; }
    .token-card { background: #f8fafc; border: 2px solid #0f172a; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 22px; }
    .token-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.1em; }
    .token-val { font-size: 38px; font-weight: 900; color: #0f172a; font-family: 'SF Mono', Monaco, monospace; letter-spacing: 0.04em; margin: 4px 0; }
    .token-sub { font-size: 12px; color: #0284c7; font-weight: 600; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 22px; }
    .info-table td { padding: 10px 6px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .info-table td.label { color: #64748b; width: 38%; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
    .info-table td.val { color: #0f172a; font-weight: 700; width: 62%; }
    .action-box { background: #0f172a; color: #f8fafc; padding: 18px; border-radius: 12px; margin-top: 20px; font-size: 12px; line-height: 1.6; }
    .action-box h4 { margin: 0 0 6px 0; font-size: 13px; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; }
    .footer { background: #f8fafc; padding: 18px 24px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-badge">Admin Dispatch Alert</div>
      <h1>🔔 New OPD Booking Registered</h1>
      <p>Shrushrut Central Hospital Administration & Triage System</p>
    </div>
    <div class="content">
      <div class="alert-banner">
        <div>
          <div class="alert-title">Live Registration Confirmed</div>
          <div class="alert-desc">A new patient has scheduled an outpatient consultation via portal.</div>
        </div>
      </div>

      <!-- TOKEN SUMMARY -->
      <div class="token-card">
        <div class="token-label">Allocated OPD Token Number</div>
        <div class="token-val">${booking.tokenNumber}</div>
        <div class="token-sub">Department: ${department.name} • Room ${doctor.roomNo}</div>
      </div>

      <!-- PATIENT & CLINICAL DETAILS -->
      <table class="info-table">
        <tr>
          <td class="label">Patient Name:</td>
          <td class="val">${booking.patientName}</td>
        </tr>
        <tr>
          <td class="label">Age & Gender:</td>
          <td class="val">${booking.age} Yrs • ${booking.gender}</td>
        </tr>
        <tr>
          <td class="label">Patient Mobile:</td>
          <td class="val">${booking.mobile}</td>
        </tr>
        <tr>
          <td class="label">Patient Email:</td>
          <td class="val">${booking.email}</td>
        </tr>
        <tr>
          <td class="label">Chief Complaint / Reason:</td>
          <td class="val" style="color: #0369a1;">${booking.reason || 'General Outpatient Assessment'}</td>
        </tr>
        <tr>
          <td class="label">Assigned Specialist:</td>
          <td class="val">${doctor.name} (${doctor.specialization})</td>
        </tr>
        <tr>
          <td class="label">OPD Suite / Room:</td>
          <td class="val">Suite #${doctor.roomNo} (${department.floor})</td>
        </tr>
        <tr>
          <td class="label">Appointment Slot:</td>
          <td class="val">${booking.appointmentDate} at ${booking.appointmentTime}</td>
        </tr>
        <tr>
          <td class="label">Queue Status:</td>
          <td class="val"><span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-size: 11px;">PENDING ARRIVAL (Queue Position: #${queuePosition})</span></td>
        </tr>
        <tr>
          <td class="label">Registration Time:</td>
          <td class="val">${new Date().toLocaleString()}</td>
        </tr>
      </table>

      <!-- ADMIN NEXT STEPS -->
      <div class="action-box">
        <h4>⚡ Admin & Registrar Protocol:</h4>
        • Token <strong>${booking.tokenNumber}</strong> is now live in the Master OPD Register.<br/>
        • When patient arrives at reception, verify arrival status to move token to Dr. ${doctor.name.split(' ')[1] || doctor.name}'s active queue.<br/>
        • In case of triage escalation or doctor unavailability, use the Admin Console to reassign or mark priority.
      </div>
    </div>

    <div class="footer">
      <strong>Shrushrut Hospital Management Information System (HMIS)</strong><br/>
      Automated Administrator Notification • Delivered to ${adminEmail}<br/>
      <span style="font-size: 10px; color: #94a3b8;">Ref ID: ${booking.id} • Security Level: Confidential</span>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Sends transactional email (proxied to server or recorded to mock dispatch ledger)
   */
  public async sendBookingConfirmation(params: {
    booking: Booking;
    doctor: Doctor;
    department: Department;
    estimatedWaitMinutes: number;
    customRecipientEmail?: string;
  }): Promise<{ success: boolean; logId: string }> {
    const { booking, doctor, department, estimatedWaitMinutes, customRecipientEmail } = params;
    const recipientEmail = customRecipientEmail || booking.email || 'patient@shrushrut.hospital';
    const htmlContent = this.generateConfirmationHtml(params);

    const log: TransactionalEmailLog = {
      id: `email-patient-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      to: recipientEmail,
      recipientType: 'PATIENT',
      patientName: booking.patientName,
      tokenNumber: booking.tokenNumber,
      doctorName: doctor.name,
      departmentName: department.name,
      appointmentDate: booking.appointmentDate,
      appointmentTime: booking.appointmentTime,
      estimatedWait: estimatedWaitMinutes,
      subject: `🎫 [TOKEN #${booking.tokenNumber}] Confirmed OPD Pass — Dr. ${doctor.name} (${department.name}) | Shrushrut Hospital`,
      sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'SENT',
      htmlContent,
    };

    // Real external inbox dispatch to Patient's entered Gmail / Email
    try {
      if (recipientEmail && recipientEmail.includes('@') && !recipientEmail.includes('example.com')) {
        fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            name: '🏥 Shrushrut Hospital OPD Desk',
            _subject: `🎫 [TOKEN #${booking.tokenNumber}] Confirmed OPD Pass — ${booking.patientName}`,
            _template: 'table',
            _captcha: 'false',
            '🎫 TOKEN NUMBER': `#${booking.tokenNumber} (OPD PASS)`,
            '👤 Patient Name': `${booking.patientName} (${booking.age} Yrs / ${booking.gender})`,
            '🩺 Consulting Doctor': `${doctor.name} (${doctor.specialization})`,
            '🏥 Department & Wing': `${department.name} (${department.floor})`,
            '🚪 OPD Room / Suite': `Room #${doctor.roomNo} (Doctor Assistant: ${doctor.assistantNo})`,
            '📅 Appointment Schedule': `${booking.appointmentDate} at ${booking.appointmentTime}`,
            '⏱️ Est. Queue Wait Time': `~${estimatedWaitMinutes} minutes`,
            '📱 Registered Mobile': booking.mobile,
            '✉️ Registered Email': booking.email || recipientEmail,
            '📋 Chief Complaint': booking.reason || 'General Outpatient Assessment',
            '📌 Hospital Instructions': `Kripya apne time se 15 min pehle Room #${doctor.roomNo} reception par ye Token #${booking.tokenNumber} dikhayein.`,
            '⏰ Generated Timestamp': new Date().toLocaleString(),
          }),
        }).catch(() => {
          // background sync
        });
      }
    } catch {
      // ignore network errors
    }

    // If a server endpoint exists in production, post to /api/send-email:
    try {
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost-skip') {
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: log.to,
            recipientType: 'PATIENT',
            subject: log.subject,
            html: htmlContent,
            tokenNumber: booking.tokenNumber,
          }),
        }).catch(() => {
          // Graceful fallback for preview sandbox
        });
      }
    } catch {
      // Ignore network errors in local preview
    }

    this.emailLogs.unshift(log);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.emailLogs.slice(0, 40)));
    } catch {
      // Local storage quota fallback
    }

    this.listeners.forEach((fn) => fn([...this.emailLogs]));
    return { success: true, logId: log.id };
  }

  /**
   * Sends transactional alert email to Hospital Admin upon new booking
   */
  public async sendAdminBookingAlert(params: {
    booking: Booking;
    doctor: Doctor;
    department: Department;
    adminEmail?: string;
    queuePosition?: number;
  }): Promise<{ success: boolean; logId: string }> {
    const { booking, doctor, department, adminEmail = this.getAdminEmail(), queuePosition = 1 } = params;
    const htmlContent = this.generateAdminAlertHtml(params);

    const log: TransactionalEmailLog = {
      id: `email-admin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      to: adminEmail,
      recipientType: 'ADMIN',
      patientName: booking.patientName,
      tokenNumber: booking.tokenNumber,
      doctorName: doctor.name,
      departmentName: department.name,
      appointmentDate: booking.appointmentDate,
      appointmentTime: booking.appointmentTime,
      estimatedWait: 0,
      subject: `[Admin Alert] New OPD Registration: Token #${booking.tokenNumber} — ${booking.patientName} (${department.name})`,
      sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'SENT',
      htmlContent,
    };

    // Real external inbox dispatch (FormSubmit Delivery Relay to actual Gmail)
    try {
      if (adminEmail && adminEmail.includes('@')) {
        fetch(`https://formsubmit.co/ajax/${encodeURIComponent(adminEmail)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            name: 'Shrushrut Hospital Admin System',
            _subject: `🔔 [Admin Alert] New OPD Booking #${booking.tokenNumber} — ${booking.patientName}`,
            _template: 'table',
            _captcha: 'false',
            'Token Number': booking.tokenNumber,
            'Patient Name': booking.patientName,
            'Age & Gender': `${booking.age} Yrs / ${booking.gender}`,
            'Contact Mobile': booking.mobile,
            'Patient Email': booking.email || 'N/A',
            'Department': department.name,
            'Specialist Doctor': `${doctor.name} (${doctor.specialization})`,
            'Room / OPD Suite': `Suite #${doctor.roomNo} (${department.floor})`,
            'Appointment Schedule': `${booking.appointmentDate} at ${booking.appointmentTime}`,
            'Chief Complaint / Symptoms': booking.reason || 'General Outpatient Assessment',
            'Triage Queue Position': `#${queuePosition}`,
            'Dispatched Timestamp': new Date().toLocaleString(),
          }),
        }).catch(() => {
          // background sync
        });
      }
    } catch {
      // ignore network errors
    }

    // Also post to internal API route if present
    try {
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost-skip') {
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: log.to,
            recipientType: 'ADMIN',
            subject: log.subject,
            html: htmlContent,
            tokenNumber: booking.tokenNumber,
          }),
        }).catch(() => {
          // Graceful fallback for preview sandbox
        });
      }
    } catch {
      // Ignore network errors in local preview
    }

    this.emailLogs.unshift(log);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.emailLogs.slice(0, 40)));
    } catch {
      // Local storage quota fallback
    }

    this.listeners.forEach((fn) => fn([...this.emailLogs]));
    return { success: true, logId: log.id };
  }
}

export const emailService = EmailService.getInstance();
