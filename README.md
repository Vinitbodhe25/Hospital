# 🏥 Hospital OPD Queue Management System

### Outpatient Wait-Time & Dynamic Queue Velocity Tracker

A smart hospital OPD queue management system designed to reduce patient waiting time and improve doctor workload management.

The system dynamically tracks the outpatient queue based on **real-time consultation speed, patient priority, emergency cases, no-shows, and doctor availability** instead of depending only on fixed appointment schedules.

---

## 🚀 Problem Statement

Traditional hospital appointment systems use fixed time slots. However, doctors may spend different amounts of time with different patients.

For example:

* Patient A may require 5 minutes.
* Patient B may require 20 minutes.
* Emergency cases can interrupt the normal queue.
* Patients may not show up for their appointments.
* Doctors can become unavailable.
* Workload may be unevenly distributed between doctors.

This results in:

* ⏳ Long and unpredictable waiting times
* 🏥 OPD overcrowding
* 👨‍⚕️ Uneven doctor workload
* 🚨 Difficulty handling emergency cases
* ❌ Wasted appointment slots due to no-shows

---

## 💡 Our Solution

Our system provides a **dynamic and intelligent OPD queue** that continuously updates according to the current hospital situation.

### Core Idea

> **Instead of relying only on fixed appointment times, the system estimates when a patient will actually be seen based on the current queue velocity.**

---

## ✨ Key Features

### 👤 Patient Management

* Patient registration
* Appointment booking
* Digital queue/token tracking
* Booking confirmation
* Real-time queue status

### ⏱️ Dynamic Wait-Time Tracking

* Calculates estimated patient waiting time
* Uses current consultation speed
* Updates queue when consultations finish
* Displays current queue position

### 🚨 Emergency Priority

* Supports emergency patient routing
* Dynamically adjusts affected queue positions
* Updates estimated waiting times

### ❌ No-Show Management

* Tracks missed appointments
* Removes inactive patients from the active queue
* Automatically updates queue estimates

### 👨‍⚕️ Doctor Workload Balancing

* Displays doctor workload
* Tracks available doctors
* Helps distribute patients between available doctors
* Provides doctor operation controls

### 🔔 Notifications

* Queue status notifications
* Delay updates
* Priority-change notifications
* Appointment-related communication

### 📊 Admin Dashboard

* OPD monitoring
* Appointment management
* Doctor workload monitoring
* Queue monitoring
* CSV data export

### 📧 Email Support

* Appointment communication
* Email preview functionality
* Email service integration

---

## 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Lucide React
* Motion

### Backend / Services

* Express.js
* Firebase
* Email Service

### Development Tools

* Bun
* TypeScript
* Vite

### AI Integration

* Google Gemini API integration

---

## 🏗️ System Architecture

```text
                    ┌───────────────────┐
                    │      Patient      │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Registration /    │
                    │ Appointment       │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Dynamic Queue     │
                    │ Management        │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
       Doctor Speed       Priority         Availability
              │               │                │
              └───────────────┼────────────────┘
                              ▼
                    ┌───────────────────┐
                    │ Wait-Time         │
                    │ Calculation       │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Queue Optimization│
                    └─────────┬─────────┘
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
          Patient Dashboard          Admin/Doctor
                                      Dashboard
```

---

## ⚙️ How It Works

### Step 1 — Patient Registration

The patient enters their details and books an appointment.

### Step 2 — Token Generation

The system generates a queue/token position for the patient.

### Step 3 — Consultation Tracking

The system records consultation start and completion times.

### Step 4 — Queue Velocity Calculation

Recent consultation durations are used to estimate the current consultation speed.

Example:

```text
Patient 1 → 10 minutes
Patient 2 → 12 minutes
Patient 3 → 8 minutes

Average consultation time = 10 minutes
```

If 4 patients are ahead:

```text
Estimated Waiting Time
= 4 × 10
= 40 minutes
```

### Step 5 — Dynamic Updates

The queue is recalculated whenever:

* A consultation finishes
* An emergency patient arrives
* A patient becomes a no-show
* A doctor becomes unavailable
* Another doctor becomes available

### Step 6 — Notification

Patients receive updated queue and waiting-time information.

---

## 📁 Project Structure

```text
hosp-main/
│
├── assets/
│
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminLogin.tsx
│   │   ├── AppointmentForm.tsx
│   │   ├── AppointmentTable.tsx
│   │   ├── BookingConfirmation.tsx
│   │   ├── DepartmentTabs.tsx
│   │   ├── DoctorCard.tsx
│   │   ├── DoctorOperationPanel.tsx
│   │   ├── DoctorWorkloadCard.tsx
│   │   ├── NotificationPanel.tsx
│   │   ├── OPDStatusCard.tsx
│   │   ├── QueueStatusBadge.tsx
│   │   └── QueueTracker.tsx
│   │
│   ├── data/
│   │   └── mockData.ts
│   │
│   ├── services/
│   │   ├── authService.ts
│   │   ├── csvExport.ts
│   │   ├── emailService.ts
│   │   ├── firebaseService.ts
│   │   └── queueService.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── types.ts
│
├── .env.example
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 💻 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd hosp-main
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Or using Bun:

```bash
bun install
```

### 3. Configure Environment Variables

Create a `.env` file using `.env.example`:

```bash
cp .env.example .env
```

Add the required API/service credentials to `.env`.

### 4. Start Development Server

```bash
npm run dev
```

Or:

```bash
bun run dev
```

The application will be available on the local development server.

---

## 🧪 Build the Project

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

For TypeScript checking:

```bash
npm run lint
```

---

## 📊 Expected Impact

### For Patients

* Reduced unnecessary waiting
* Better waiting-time visibility
* Real-time queue updates
* Improved emergency handling

### For Doctors

* Better workload distribution
* Real-time queue visibility
* Reduced OPD pressure

### For Hospitals

* Improved OPD efficiency
* Reduced overcrowding
* Better doctor utilization
* Data-driven queue management

---

## 🎯 Key Performance Indicators

The system can be evaluated using:

| KPI                       | Expected Improvement |
| ------------------------- | -------------------- |
| Average Waiting Time      | ↓                    |
| Queue Abandonment         | ↓                    |
| Doctor Utilization        | ↑                    |
| OPD Throughput            | ↑                    |
| Patient Satisfaction      | ↑                    |
| Queue Prediction Accuracy | ↑                    |

---

## 🔮 Future Scope

* Advanced ML-based waiting-time prediction
* Mobile application for patients
* SMS and WhatsApp notifications
* Hospital-wide multi-department integration
* IoT-based patient flow monitoring
* Predictive OPD crowd analysis
* Multi-hospital deployment
* Integration with existing hospital management systems

---

## 🌟 Unique Selling Proposition

> **Traditional appointment systems tell patients when to arrive.
> Our system predicts when they are actually likely to be seen.**

---

## 🤝 Contribution

Contributions are welcome.

```text
1. Fork the repository
2. Create a new branch
3. Make your changes
4. Commit your changes
5. Push the branch
6. Create a Pull Request
```

---

## 📜 License

This project is developed for **educational, hackathon, and prototype purposes**.

---

## 👨‍💻 Team

**Project:** Outpatient Wait-Time & Dynamic Queue Velocity Tracker

**Built for:** Smart India Hackathon / Healthcare Innovation

**Team Members:**

* Yash Petkar
* Suhani Kadu
* Vinit Bodhe

---

### 🏥 Making Hospital Queues Smarter

**Predict → Monitor → Adapt → Notify → Optimize**
