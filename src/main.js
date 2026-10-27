// Main Application Controller for Campus Health Corner
import { initTheme } from './modules/theme.js';
import { initEmergency } from './modules/emergency.js';
import { initAppointments } from './modules/appointments.js';
import { initMindCare } from './modules/mindcare.js';
import { initPharmacyTracker } from './modules/pharmacyTracker.js';
import { initCampusMap } from './modules/campusMap.js';
import { initVitalsCalculator } from './modules/vitalsCalculator.js';
import { initStudentAuth } from './modules/studentAuth.js';
import { initDrivesAndFaqs } from './modules/drivesAndFaqs.js';

document.addEventListener('DOMContentLoaded', () => {
  try {
    // 1. Initialize Theme (Dark/Light mode)
    initTheme();

    // 2. Initialize Emergency SOS Dispatch
    initEmergency();

    // 3. Initialize Healthcare Professionals Directory
    initAppointments();

    // 4. Initialize MindCare & Mental Health Support
    initMindCare();

    // 5. Initialize Pharmacy & Dispensary Inventory Tracker
    initPharmacyTracker();

    // 6. Initialize Interactive Campus Medical Map & AED Locator
    initCampusMap();

    // 7. Initialize Student Health Vitals & Lifestyle Calculators
    initVitalsCalculator();

    // 8. Initialize Student Health Portal & Digital ID Card
    initStudentAuth();

    // 9. Initialize Health Drives, FAQs & Global Search
    initDrivesAndFaqs();

    // Mobile navigation toggle
    const mobileBtn = document.getElementById('mobile-menu-toggle-btn');
    const mainNav = document.getElementById('main-nav');
    if (mobileBtn && mainNav) {
      mobileBtn.addEventListener('click', () => {
        mainNav.classList.toggle('mobile-open');
      });
      mainNav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => mainNav.classList.remove('mobile-open'));
      });
    }

    console.log("UniCare Campus Health Corner Initialized Successfully.");
  } catch (error) {
    console.error("Initialization error:", error);
  }
});
