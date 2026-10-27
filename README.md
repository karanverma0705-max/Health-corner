# Campus Care — University Health & Wellness Portal

**Campus Care** is a modern, comprehensive university healthcare and student wellness web platform powered by a lightweight **SQLite 3 relational database** backend and a responsive, dynamic frontend.

---

## 🌟 Key Features

### 🎓 1. Student / User Portal (`/index.html`)
* **Emergency SOS Dispatch**: 1-click campus panic alarm with live GPS coordinates, triage urgency selection, and real-time paramedic ETA countdown.
* **Healthcare Professionals Directory**: Filterable roster of campus doctors, clinical psychologists, and physiotherapists with credentials, room locations, and active consultation hours.
* **MindCare & Mental Health Support**:
  * Confidential **PHQ-4 Stress Self-Check** quiz with tailored clinical advice.
  * Guided **4-7-8 Calm Breathing Pacer** with visual animation circle.
  * **Anonymous Peer Support Chat** simulation with certified peer counselors.
* **Campus Dispensary Medicine Tracker**: Real-time stock levels of essential medications, search/filter by indication, and 1-click digital prescription pickup token generation.
* **Interactive Campus Medical Map**: Visual floorplan locator for automated external defibrillators (AEDs), first-aid kiosks, and urgent care suites.
* **Gender-Calibrated Vitals & Lifestyle Calculators**:
  * **Collegiate BMI & Wellness Calculator** with dedicated **👨 Male** and **👩 Female** physiological calibrations (distinct height/weight categories, ideal body weight ranges, body fat % estimation via Deurenberg formula, and basal metabolic rate).
  * **Hydration Calculator**: Daily optimal water intake goals calibrated by biological sex, workout intensity, and sedentary study hours.
* **Student Digital Health ID**: Personal student profile, blood type badge, emergency contacts, allergy warnings, and digital health pass.

---

### 🛡️ 2. Clinic Staff & Admin Portal (`/admin.html`)
* **Live KPI Metrics**: Real-time counters for active bookings, on-duty doctors, dispensary inventory levels, emergency SOS calls, and SQLite WAL database status.
* **Bookings & Appointments Management**:
  * View, search, and filter all student bookings (Confirmed, Completed, Cancelled).
  * **`📅 Book / Schedule Appointment`**: Book appointments on behalf of students with custom dates and time slots.
  * **`➕ Urgent Walk-in`**: Register immediate triage patients directly into SQLite.
  * Update appointment status or permanently delete records from the SQLite database.
* **Healthcare Staff Control**: Toggle doctor on-duty status and edit consultation time slots in real time.
* **Dispensary Stock Management**: Live inventory tracking, quick stock unit adjustments (`- / +`), and add new medicines modal.
* **Emergency Dispatch Center**: High-priority log of mobile panic alarms with status tracking (Dispatched / Resolved).
* **SQLite Database Live Inspector**:
  * Live connection metadata and database file status (`database/campus_health.sqlite`).
  * Direct **`💾 Download .sqlite File`** download link.
  * Interactive table chips for all 9 database tables (`appointments`, `doctors`, `pharmacy_inventory`, `emergency_sos`, `health_drives`, `student_profiles`, `faqs`, etc.).
  * Tabular records preview displaying rows and columns directly from SQLite with a **`🔄 Refresh SQLite Tables`** button.

---

### 🔑 3. Authentication & Role Switching (`/login.html`)
* Role-based login switcher between **Student / Patient** and **Clinic Staff & Administrator**.
* 1-Click quick demo credential buttons:
  * **Student**: Alex Rivera (`alex.rivera@campus.edu`)
  * **Admin**: Dr. Sarah Jenkins (`admin@campus.edu`)

---

## 🚀 Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18 or higher recommended)
* `npm` package manager

### 1. Installation
Clone or extract the project folder, then install dependencies:
```bash
npm install
```

### 2. Run Both Backend & Frontend Concurrently
Start the SQLite Express REST API (Port 3000) and the Vite development server (Port 5173) simultaneously:
```bash
npm run dev
```

### 3. Open in Browser
* **Student Health Portal**: [http://localhost:5173/](http://localhost:5173/)
* **Clinic Staff & Admin Console**: [http://localhost:5173/admin.html](http://localhost:5173/admin.html)
* **Authentication Portal**: [http://localhost:5173/login.html](http://localhost:5173/login.html)
* **SQLite REST Server Health & Download**: [http://localhost:3000/](http://localhost:3000/)

---

## 🗄️ Database Architecture
* Engine: Built-in Node.js **SQLite DatabaseSync** with WAL (Write-Ahead Logging) enabled.
* Storage Location: `database/campus_health.sqlite`
* Automatic Schema Initialization: The server automatically initializes all necessary tables and seeds default records upon startup if the database file does not exist.

---

## 🛠️ Project Structure
```
project-minor/
├── admin.html               # Staff & Admin Console
├── index.html               # Main Student Health Portal
├── login.html               # Role-based Authentication Page
├── package.json             # Project dependencies and scripts
├── vite.config.js           # Vite build configuration (multi-page)
├── database/                # SQLite database storage directory
│   └── campus_health.sqlite
├── server/                  # Express REST API connecting to SQLite
│   └── index.js
├── public/                  # Static images and public assets
│   └── images/
├── src/                     # Frontend source code
│   ├── admin.css            # Styles for admin console
│   ├── admin.js             # Admin console controller
│   ├── login.css            # Styles for login page
│   ├── login.js             # Authentication controller
│   ├── style.css            # Core portal styles & theme system
│   ├── main.js              # Main student portal controller
│   ├── api/
│   │   └── client.js        # REST API client with fallback support
│   ├── data/                # Initial seed and reference data
│   │   ├── doctors.js
│   │   ├── medicines.js
│   │   └── professionals.js
│   └── modules/             # Modular feature controllers
│       ├── appointments.js
│       ├── campusMap.js
│       ├── dbInspector.js
│       ├── drivesAndFaqs.js
│       ├── emergency.js
│       ├── mindcare.js
│       ├── pharmacyTracker.js
│       ├── session.js
│       ├── studentAuth.js
│       ├── theme.js
│       └── vitalsCalculator.js
```

---

## 📜 License
Developed for University Health & Wellness Services. All records protected under FERPA & HIPAA simulation protocols.
