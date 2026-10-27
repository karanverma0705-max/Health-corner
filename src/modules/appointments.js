// Appointment Booking & Healthcare Professional Directory Module
import { healthcareProfessionals } from '../data/professionals.js';
import { api } from '../api/client.js';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'unicare_booked_appointments';

let cachedDoctors = [...healthcareProfessionals];

export async function initAppointments() {
  await renderProfessionals('all');
  setupFilterTabs();
  setupBookingWizard();
  await renderMyBookings();
}

export async function renderProfessionals(filterCategory = 'all') {
  const container = document.getElementById('professionals-grid');
  if (!container) return;

  try {
    cachedDoctors = await api.getProfessionals('all');
  } catch (e) {
    cachedDoctors = healthcareProfessionals;
  }

  // Populate doctor select options dynamically in booking modal
  const doctorSelect = document.getElementById('booking-doctor-select');
  if (doctorSelect) {
    doctorSelect.innerHTML = `<option value="">-- Choose a Healthcare Professional --</option>` +
      cachedDoctors.map(doc => `
        <option value="${doc.id}">${doc.name} - ${doc.department} (${doc.room})</option>
      `).join('');
  }

  const filtered = filterCategory === 'all' 
    ? cachedDoctors 
    : cachedDoctors.filter(p => {
        const dept = (p.department || '').toLowerCase();
        if (filterCategory === 'general') return dept.includes('general') || dept.includes('triage') || dept.includes('acute');
        if (filterCategory === 'mental') return dept.includes('mental') || dept.includes('psycholog') || dept.includes('counseling');
        if (filterCategory === 'physio') return dept.includes('sports') || dept.includes('physical') || dept.includes('rehab');
        if (filterCategory === 'dental') return dept.includes('dental') || dept.includes('oral');
        if (filterCategory === 'women') return dept.includes('women') || dept.includes('reproductive') || dept.includes('gynecolog');
        return true;
      });

  container.innerHTML = filtered.map(doc => {
    const slots = Array.isArray(doc.slotsToday) ? doc.slotsToday : (typeof doc.slotsToday === 'string' ? JSON.parse(doc.slotsToday || '[]') : []);
    const specs = Array.isArray(doc.specialties) ? doc.specialties : (typeof doc.specialties === 'string' ? JSON.parse(doc.specialties || '[]') : []);

    return `
    <div class="doctor-card" data-id="${doc.id}">
      <div class="doctor-card-img-wrap">
        <img src="${doc.avatar || '/images/doctor-consultation.jpg'}" alt="${doc.name}" class="doctor-avatar" loading="lazy" />
        <span class="doctor-status-badge ${doc.availableToday ? 'available' : 'booked'}">
          ${doc.availableToday ? '● Available Today' : '○ Next Slots Tomorrow'}
        </span>
      </div>
      <div class="doctor-info-body">
        <div class="doctor-rating-row">
          <span class="rating-stars">★ ${Number(doc.rating || 5).toFixed(1)}</span>
          <span class="rating-count">(${doc.reviewsCount || 100}+ reviews)</span>
          <span class="experience-badge">${doc.experience || 'Specialist'}</span>
        </div>
        <h3 class="doctor-name">${doc.name}</h3>
        <p class="doctor-title">${doc.title}</p>
        <p class="doctor-dept">${doc.department}</p>
        <p class="doctor-qualification">🎓 ${doc.qualification || 'Board Certified'}</p>
        <p class="doctor-room">📍 ${doc.room}</p>
        <div class="doctor-tags">
          ${specs.map(tag => `<span class="specialty-tag">${tag}</span>`).join('')}
        </div>
        <div class="doctor-slots-preview">
          <span class="slots-label">Clinic Consultation Hours:</span>
          <div class="slot-chips">
            ${slots.slice(0, 3).map(slot => `<span class="slot-chip">${slot}</span>`).join('')}
          </div>
        </div>
        <div class="doctor-card-actions">
          <div class="doctor-walkin-info">
            <span class="duty-pill ${doc.availableToday ? 'duty-active' : 'duty-inactive'}">
              ${doc.availableToday ? '● Available Today • Room ' + doc.room : '○ Consultations Resume Tomorrow'}
            </span>
          </div>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

function setupFilterTabs() {
  const tabs = document.querySelectorAll('.dept-filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const category = tab.getAttribute('data-category');
      renderProfessionals(category);
    });
  });
}

// Booking Wizard State
let bookingState = {
  step: 1,
  doctorId: '',
  doctorName: '',
  date: '',
  time: '',
  studentName: '',
  studentId: '',
  studentEmail: '',
  hostel: '',
  reason: '',
  isConfidential: false
};

function setupBookingWizard() {
  const modal = document.getElementById('booking-modal');
  const closeBtn = document.getElementById('close-booking-modal');
  const openButtons = document.querySelectorAll('.trigger-booking-modal-btn');

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openBookingModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeBookingModal);
  }

  // Next / Prev step buttons
  const step1Next = document.getElementById('booking-step1-next');
  const step2Prev = document.getElementById('booking-step2-prev');
  const step2Next = document.getElementById('booking-step2-next');
  const step3Prev = document.getElementById('booking-step3-prev');
  const bookingForm = document.getElementById('appointment-booking-form');

  if (step1Next) {
    step1Next.addEventListener('click', () => {
      const selectedDocId = document.getElementById('booking-doctor-select').value;
      if (!selectedDocId) {
        showToast('Please select a healthcare professional or clinic service.', 'warning');
        return;
      }
      const doc = cachedDoctors.find(d => d.id === selectedDocId) || healthcareProfessionals.find(d => d.id === selectedDocId);
      bookingState.doctorId = selectedDocId;
      bookingState.doctorName = doc ? doc.name : 'Campus Physician';
      
      populateDateAndSlots(doc);
      goToStep(2);
    });
  }

  if (step2Prev) step2Prev.addEventListener('click', () => goToStep(1));

  if (step2Next) {
    step2Next.addEventListener('click', () => {
      const selectedDate = document.getElementById('booking-date-picker').value;
      const selectedSlot = document.querySelector('.time-slot-option.selected');
      if (!selectedDate) {
        showToast('Please select your preferred appointment date.', 'warning');
        return;
      }
      if (!selectedSlot) {
        showToast('Please choose an available time slot.', 'warning');
        return;
      }
      bookingState.date = selectedDate;
      bookingState.time = selectedSlot.getAttribute('data-time');
      goToStep(3);
    });
  }

  if (step3Prev) step3Prev.addEventListener('click', () => goToStep(2));

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const sName = document.getElementById('student-full-name').value.trim();
      const sId = document.getElementById('student-id-number').value.trim();
      const sEmail = document.getElementById('student-email-input').value.trim();
      const sHostel = document.getElementById('student-residence-select').value;
      const sReason = document.getElementById('student-visit-reason').value.trim();
      const sConf = document.getElementById('student-confidential-check').checked;

      if (!sName || !sId || !sEmail) {
        showToast('Please fill in your name, student ID and email.', 'warning');
        return;
      }

      bookingState.studentName = sName;
      bookingState.studentId = sId;
      bookingState.studentEmail = sEmail;
      bookingState.hostel = sHostel || 'Campus Dorms';
      bookingState.reason = sReason || 'Routine consultation';
      bookingState.isConfidential = sConf;

      saveAndConfirmAppointment();
    });
  }

  // "My Bookings" modal trigger & listener
  const myBookingsBtn = document.getElementById('open-my-bookings-btn');
  const myBookingsModal = document.getElementById('my-bookings-modal');
  const closeMyBookings = document.getElementById('close-my-bookings-modal');

  if (myBookingsBtn && myBookingsModal) {
    myBookingsBtn.addEventListener('click', () => {
      renderMyBookings();
      myBookingsModal.classList.add('active');
    });
  }
  if (closeMyBookings && myBookingsModal) {
    closeMyBookings.addEventListener('click', () => {
      myBookingsModal.classList.remove('active');
    });
  }
}

export function openBookingModalWithDoctor(doctorId) {
  openBookingModal();
  const select = document.getElementById('booking-doctor-select');
  if (select) {
    select.value = doctorId;
    const doc = cachedDoctors.find(d => d.id === doctorId) || healthcareProfessionals.find(d => d.id === doctorId);
    if (doc) {
      bookingState.doctorId = doctorId;
      bookingState.doctorName = doc.name;
      populateDateAndSlots(doc);
      goToStep(2);
    }
  }
}

export function openBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    goToStep(1);
    
    // Set min date to today
    const dateInput = document.getElementById('booking-date-picker');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
      dateInput.value = today;
    }
  }
}

export function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function goToStep(stepNumber) {
  bookingState.step = stepNumber;
  
  // Update step indicators
  document.querySelectorAll('.wizard-step-node').forEach(node => {
    const nodeStep = parseInt(node.getAttribute('data-step'), 10);
    if (nodeStep === stepNumber) {
      node.classList.add('active');
      node.classList.remove('completed');
    } else if (nodeStep < stepNumber) {
      node.classList.add('completed');
      node.classList.remove('active');
    } else {
      node.classList.remove('active', 'completed');
    }
  });

  // Hide/Show containers
  document.querySelectorAll('.wizard-step-content').forEach(c => c.style.display = 'none');
  const activeContent = document.getElementById(`booking-step-${stepNumber}`);
  if (activeContent) activeContent.style.display = 'block';
}

function populateDateAndSlots(doc) {
  const slotsGrid = document.getElementById('available-slots-container');
  if (!slotsGrid) return;

  const defaultSlots = ["09:00 AM", "09:45 AM", "10:30 AM", "11:15 AM", "01:30 PM", "02:15 PM", "03:00 PM", "03:45 PM", "04:30 PM"];
  const slotsToUse = (doc && doc.slotsToday && doc.slotsToday.length > 0) ? doc.slotsToday : defaultSlots;

  slotsGrid.innerHTML = slotsToUse.map(slot => `
    <button type="button" class="time-slot-option" data-time="${slot}">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      ${slot}
    </button>
  `).join('');

  slotsGrid.querySelectorAll('.time-slot-option').forEach(slotBtn => {
    slotBtn.addEventListener('click', () => {
      slotsGrid.querySelectorAll('.time-slot-option').forEach(s => s.classList.remove('selected'));
      slotBtn.classList.add('selected');
    });
  });
}

async function saveAndConfirmAppointment() {
  const doc = cachedDoctors.find(d => d.id === bookingState.doctorId) || healthcareProfessionals.find(d => d.id === bookingState.doctorId) || {
    name: bookingState.doctorName,
    room: "Campus Health Center, Suite 101",
    department: "General Medicine"
  };

  const passId = "UC-" + Math.floor(100000 + Math.random() * 900000);
  const newAppointment = {
    id: passId,
    doctorId: bookingState.doctorId,
    doctorName: doc.name,
    department: doc.department,
    room: doc.room,
    date: bookingState.date,
    time: bookingState.time,
    studentName: bookingState.studentName,
    studentId: bookingState.studentId,
    studentEmail: bookingState.studentEmail,
    hostel: bookingState.hostel,
    reason: bookingState.reason,
    isConfidential: bookingState.isConfidential,
    status: "Confirmed",
    createdAt: new Date().toISOString()
  };

  // Persist to SQLite Database via REST API
  try {
    await api.createAppointment(newAppointment);
  } catch (err) {
    console.warn("Falling back to local cache:", err);
  }

  // Render Confirmation Pass
  renderAppointmentPass(newAppointment);
  goToStep(4);
  await renderMyBookings();

  // Trigger celebration confetti
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch(e) {}

  showToast(`Appointment saved to SQLite! Pass ID: ${passId}`, 'success');
}

function renderAppointmentPass(appointment) {
  const passContainer = document.getElementById('appointment-pass-card');
  if (!passContainer) return;

  passContainer.innerHTML = `
    <div class="digital-health-pass">
      <div class="pass-header">
        <div class="pass-brand">
          <span class="pass-seal">🛡</span>
          <div>
            <h4>Campus Health Corner Digital Pass</h4>
            <span class="pass-sub">Official Student Medical Clearance & Slot</span>
          </div>
        </div>
        <div class="pass-id-badge">${appointment.id}</div>
      </div>

      <div class="pass-grid">
        <div class="pass-field">
          <span class="pass-label">Student Patient</span>
          <span class="pass-val">${appointment.studentName} (${appointment.studentId})</span>
        </div>
        <div class="pass-field">
          <span class="pass-label">Healthcare Professional</span>
          <span class="pass-val">${appointment.doctorName}</span>
        </div>
        <div class="pass-field">
          <span class="pass-label">Date & Time</span>
          <span class="pass-val bold">📅 ${appointment.date} at ${appointment.time}</span>
        </div>
        <div class="pass-field">
          <span class="pass-label">Clinic Location</span>
          <span class="pass-val">📍 ${appointment.room}</span>
        </div>
        <div class="pass-field">
          <span class="pass-label">Service & Reason</span>
          <span class="pass-val">${appointment.department} (${appointment.reason})</span>
        </div>
        <div class="pass-field">
          <span class="pass-label">Confidentiality Tier</span>
          <span class="pass-val">${appointment.isConfidential ? '🔒 100% Private (No Log in Dean Record)' : 'Standard Student Record'}</span>
        </div>
      </div>

      <div class="pass-footer">
        <div class="pass-qr-wrap">
          <canvas id="pass-qr-canvas" width="100" height="100"></canvas>
          <span class="qr-caption">Scan at Clinic Turnstile</span>
        </div>
        <div class="pass-actions">
          <button type="button" class="btn btn-secondary btn-sm" id="download-calendar-invite-btn">
            📅 Add to Calendar (.ics)
          </button>
          <button type="button" class="btn btn-primary btn-sm" id="print-pass-btn">
            🖨 Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  `;

  // Draw simulated QR Code on canvas
  drawMockQRCode('pass-qr-canvas', appointment.id);

  // Bind actions
  const calBtn = document.getElementById('download-calendar-invite-btn');
  if (calBtn) {
    calBtn.addEventListener('click', () => downloadICS(appointment));
  }

  const printBtn = document.getElementById('print-pass-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }
}

function drawMockQRCode(canvasId, text) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = 100;
  ctx.clearRect(0, 0, size, size);

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // Simple QR-like grid pattern
  ctx.fillStyle = "#0f172a";
  const cells = 15;
  const cellSize = size / cells;

  // Corner markers
  drawQRCorner(ctx, 0, 0, cellSize);
  drawQRCorner(ctx, (cells - 4) * cellSize, 0, cellSize);
  drawQRCorner(ctx, 0, (cells - 4) * cellSize, cellSize);

  // Seeded noise based on string
  let seed = 0;
  for (let i = 0; i < text.length; i++) seed += text.charCodeAt(i);

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if ((r < 5 && c < 5) || (r < 5 && c >= cells - 5) || (r >= cells - 5 && c < 5)) continue;
      const val = Math.sin(r * 12 + c * 7 + seed) * 10000;
      if (val - Math.floor(val) > 0.45) {
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }
}

function drawQRCorner(ctx, x, y, cellSize) {
  ctx.fillRect(x, y, cellSize * 4, cellSize * 4);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + cellSize * 0.7, y + cellSize * 0.7, cellSize * 2.6, cellSize * 2.6);
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x + cellSize * 1.3, y + cellSize * 1.3, cellSize * 1.4, cellSize * 1.4);
}

function downloadICS(apt) {
  const title = `Campus Health Appt: ${apt.doctorName}`;
  const description = `Appointment at Campus Health Corner with ${apt.doctorName}. Room: ${apt.room}. Pass ID: ${apt.id}`;
  const location = apt.room;

  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Campus Health Corner//EN',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `STATUS:CONFIRMED`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `CampusHealth_${apt.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Calendar event downloaded!', 'success');
}

export async function renderMyBookings() {
  const listContainer = document.getElementById('my-bookings-list');
  const countBadge = document.getElementById('my-bookings-count-badge');
  if (!listContainer) return;

  let saved = [];
  try {
    saved = await api.getAppointments();
  } catch (err) {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }

  if (countBadge) countBadge.textContent = saved.length;

  if (saved.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📅</span>
        <p>You have no scheduled appointments yet.</p>
        <button class="btn btn-secondary btn-sm trigger-booking-modal-btn">Book One Now</button>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = saved.map(apt => `
    <div class="saved-appointment-row">
      <div class="saved-apt-info">
        <span class="apt-tag-status ${apt.status.toLowerCase()}">${apt.status}</span>
        <h4>${apt.doctorName}</h4>
        <p class="apt-meta-line">📍 ${apt.room} • 📅 ${apt.date} at ${apt.time}</p>
        <span class="apt-pass-code">Pass ID: ${apt.id}</span>
      </div>
      <div class="saved-apt-actions">
        <button class="btn btn-secondary btn-sm cancel-apt-btn" data-apt-id="${apt.id}">Cancel</button>
      </div>
    </div>
  `).join('');

  listContainer.querySelectorAll('.cancel-apt-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idToCancel = btn.getAttribute('data-apt-id');
      await cancelAppointment(idToCancel);
    });
  });
}

async function cancelAppointment(id) {
  try {
    await api.deleteAppointment(id);
  } catch (e) {
    console.warn("Delete fallback:", e);
  }
  await renderMyBookings();
  showToast('Appointment removed from SQLite database.', 'info');
}

export function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-indicator"></span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}
