// Campus Emergency SOS System & Audio Dispatch Simulation
import { emergencyContacts } from '../data/emergencyContacts.js';
import { api } from '../api/client.js';

let audioCtx = null;
let sirenOscillator = null;
let sirenInterval = null;
let countdownTimer = null;
let etaTimer = null;
let isSirenPlaying = false;

export function initEmergency() {
  renderEmergencyContacts();
  setupEmergencyListeners();
}

function renderEmergencyContacts() {
  const container = document.getElementById('emergency-contacts-grid');
  if (!container) return;

  container.innerHTML = emergencyContacts.map(contact => `
    <div class="emergency-contact-card ${contact.primary ? 'primary-emergency' : ''}">
      <div class="emergency-card-header">
        <span class="emergency-badge ${contact.primary ? 'urgent' : 'standard'}">
          ${contact.available}
        </span>
        <span class="emergency-response-time">⏱ ${contact.avgResponse}</span>
      </div>
      <h3 class="emergency-contact-title">${contact.title}</h3>
      <p class="emergency-contact-desc">${contact.action}</p>
      <div class="emergency-contact-meta">
        <span class="location-tag">📍 ${contact.location}</span>
      </div>
      <div class="emergency-action-row">
        <a href="tel:${contact.phone.replace(/[^0-9]/g, '')}" class="emergency-call-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          ${contact.phone}
        </a>
      </div>
    </div>
  `).join('');
}

function setupEmergencyListeners() {
  // All buttons triggering emergency modal
  const sosTriggers = document.querySelectorAll('.trigger-sos-btn');
  const sosModal = document.getElementById('sos-modal');
  const sosModalClose = document.getElementById('close-sos-modal');
  const startSosBtn = document.getElementById('start-sos-alert-btn');
  const cancelSosBtn = document.getElementById('cancel-sos-btn');
  const sirenToggleBtn = document.getElementById('toggle-siren-btn');

  sosTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openSosModal();
    });
  });

  if (sosModalClose) {
    sosModalClose.addEventListener('click', closeSosModal);
  }

  // Click outside modal
  window.addEventListener('click', (e) => {
    if (e.target === sosModal) {
      closeSosModal();
    }
  });

  if (startSosBtn) {
    startSosBtn.addEventListener('click', beginSosCountdown);
  }

  if (cancelSosBtn) {
    cancelSosBtn.addEventListener('click', resetSosState);
  }

  if (sirenToggleBtn) {
    sirenToggleBtn.addEventListener('click', toggleSirenSound);
  }

  // Quick CPR / First aid modal trigger
  const cprBtn = document.getElementById('open-first-aid-guide');
  const firstAidModal = document.getElementById('first-aid-modal');
  const closeFirstAid = document.getElementById('close-first-aid-modal');

  if (cprBtn && firstAidModal) {
    cprBtn.addEventListener('click', () => firstAidModal.classList.add('active'));
  }
  if (closeFirstAid && firstAidModal) {
    closeFirstAid.addEventListener('click', () => firstAidModal.classList.remove('active'));
  }
}

export function openSosModal() {
  const modal = document.getElementById('sos-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

export function closeSosModal() {
  const modal = document.getElementById('sos-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    stopSiren();
    resetSosState();
  }
}

function beginSosCountdown() {
  const triggerBtn = document.getElementById('start-sos-alert-btn');
  const stageInitial = document.getElementById('sos-stage-initial');
  const stageCountdown = document.getElementById('sos-stage-countdown');
  const countdownNumber = document.getElementById('sos-countdown-number');
  const locationSelect = document.getElementById('sos-location-select');
  const emergencyType = document.getElementById('sos-nature-select');

  const selectedLocation = locationSelect ? locationSelect.value : "Current Campus Coordinates";
  const selectedNature = emergencyType ? emergencyType.value : "Medical Emergency";

  stageInitial.style.display = 'none';
  stageCountdown.style.display = 'block';

  let seconds = 4;
  countdownNumber.textContent = seconds;

  // Start audible alert
  startSiren();

  countdownTimer = setInterval(() => {
    seconds--;
    if (seconds > 0) {
      countdownNumber.textContent = seconds;
    } else {
      clearInterval(countdownTimer);
      triggerDispatchSuccess(selectedLocation, selectedNature);
    }
  }, 1000);
}

function triggerDispatchSuccess(location, nature) {
  const stageCountdown = document.getElementById('sos-stage-countdown');
  const stageDispatched = document.getElementById('sos-stage-dispatched');
  const dispatchLocationText = document.getElementById('dispatch-assigned-location');
  const dispatchNatureText = document.getElementById('dispatch-assigned-nature');

  stageCountdown.style.display = 'none';
  stageDispatched.style.display = 'block';

  if (dispatchLocationText) dispatchLocationText.textContent = location;
  if (dispatchNatureText) dispatchNatureText.textContent = nature;

  // Record into SQLite Database
  api.logEmergencySos(location, nature).catch(e => console.warn("SOS log fallback:", e));

  startEtaCountdown(180); // 3 minutes ETA
}

function startEtaCountdown(totalSeconds) {
  const etaDisplay = document.getElementById('dispatch-eta-timer');
  let remaining = totalSeconds;

  if (etaTimer) clearInterval(etaTimer);

  etaTimer = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(etaTimer);
      if (etaDisplay) etaDisplay.textContent = "Unit On Scene Now!";
      return;
    }
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    if (etaDisplay) {
      etaDisplay.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
  }, 1000);
}

function resetSosState() {
  if (countdownTimer) clearInterval(countdownTimer);
  if (etaTimer) clearInterval(etaTimer);
  stopSiren();

  const stageInitial = document.getElementById('sos-stage-initial');
  const stageCountdown = document.getElementById('sos-stage-countdown');
  const stageDispatched = document.getElementById('sos-stage-dispatched');

  if (stageInitial) stageInitial.style.display = 'block';
  if (stageCountdown) stageCountdown.style.display = 'none';
  if (stageDispatched) stageDispatched.style.display = 'none';
}

function toggleSirenSound() {
  if (isSirenPlaying) {
    stopSiren();
  } else {
    startSiren();
  }
}

function startSiren() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (isSirenPlaying) return;

    sirenOscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    sirenOscillator.type = 'sawtooth';
    sirenOscillator.frequency.setValueAtTime(650, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    sirenOscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    sirenOscillator.start();
    isSirenPlaying = true;

    let high = false;
    sirenInterval = setInterval(() => {
      if (!isSirenPlaying || !sirenOscillator) return;
      const targetFreq = high ? 600 : 900;
      sirenOscillator.frequency.exponentialRampToValueAtTime(targetFreq, audioCtx.currentTime + 0.35);
      high = !high;
    }, 400);

    const toggleBtn = document.getElementById('toggle-siren-btn');
    if (toggleBtn) {
      toggleBtn.innerHTML = `<span>🔊 Siren Active (Click to Mute)</span>`;
      toggleBtn.classList.add('siren-active');
    }
  } catch (err) {
    console.warn("Audio Context playback prevented by browser:", err);
  }
}

function stopSiren() {
  if (sirenInterval) clearInterval(sirenInterval);
  if (sirenOscillator) {
    try {
      sirenOscillator.stop();
      sirenOscillator.disconnect();
    } catch (e) {}
    sirenOscillator = null;
  }
  isSirenPlaying = false;

  const toggleBtn = document.getElementById('toggle-siren-btn');
  if (toggleBtn) {
    toggleBtn.innerHTML = `<span>🔈 Siren Muted (Click to Sound)</span>`;
    toggleBtn.classList.remove('siren-active');
  }
}
