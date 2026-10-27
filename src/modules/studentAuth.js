// Student Health Portal & Digital Health Card Module
import { api } from '../api/client.js';
import { showToast } from './appointments.js';
import { getSession, clearSession } from './session.js';

const STUDENT_STORAGE_KEY = 'unicare_student_profile';

const defaultProfile = {
  name: "Alex Rivera",
  id: "U-2024-88419",
  email: "alex.rivera@campus.edu",
  department: "Computer Science & Engineering",
  year: "3rd Year (Junior)",
  residence: "North Pioneer Commons, Room 314",
  bloodGroup: "O+",
  allergies: "Penicillin, Tree nuts",
  emergencyContact: "Maria Rivera (Parent) • (555) 234-5678",
  insuranceStatus: "Active - University Care Plus Plan",
  vaccinationStatus: "Verified & Fully Compliant (MMR, Tdap, MenACWY, COVID)",
  isLoggedIn: true
};

export async function initStudentAuth() {
  const session = getSession();
  let profile;

  if (session && session.role === 'student' && session.user) {
    profile = {
      ...defaultProfile,
      name: session.user.name || defaultProfile.name,
      id: session.user.studentId || session.user.id || defaultProfile.id,
      email: session.user.email || defaultProfile.email,
      department: session.user.department || defaultProfile.department
    };
  } else {
    profile = await getStudentProfile();
  }

  renderStudentNavbarBadge(profile, session);
  setupPortalModalListeners();
  setupNavAuthButtons(session);
}

export async function getStudentProfile() {
  try {
    const data = await api.getStudentProfile();
    if (data && data.name) {
      localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (e) {}

  const saved = localStorage.getItem(STUDENT_STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(defaultProfile));
    return defaultProfile;
  }
  return JSON.parse(saved);
}

function renderStudentNavbarBadge(profile, session) {
  const badge = document.getElementById('student-nav-profile-badge');
  if (!badge) return;

  const isStudent = session && session.role === 'student';

  badge.innerHTML = `
    <span class="user-avatar-circle">${(profile.name || 'S').charAt(0)}</span>
    <div class="user-nav-meta">
      <span class="user-name">${profile.name}</span>
      <span class="user-role">${profile.id}</span>
    </div>
  `;
}

function setupNavAuthButtons(session) {
  const navAuthLink = document.getElementById('nav-auth-link');
  const navAuthText = document.getElementById('nav-auth-link-text');
  const adminBtn = document.getElementById('nav-admin-btn');

  if (navAuthLink && navAuthText) {
    if (session && session.user) {
      navAuthText.textContent = session.role === 'admin' ? 'Admin Active' : 'Sign Out / Switch';
      navAuthLink.title = `Signed in as ${session.user.name} (${session.role}). Click to switch account.`;
      
      // If student is logged in, clicking the button can log out or switch
      navAuthLink.addEventListener('click', (e) => {
        if (confirm(`Currently signed in as ${session.user.name}. Would you like to switch accounts or sign out?`)) {
          clearSession();
        }
      });
    } else {
      navAuthText.textContent = 'Sign In';
      navAuthLink.title = 'Sign in to access your student health card or admin console';
    }
  }

  // Intercept Admin Button: if not admin, guide them to login as admin
  if (adminBtn) {
    adminBtn.addEventListener('click', (e) => {
      const currentSession = getSession();
      if (!currentSession || currentSession.role !== 'admin') {
        e.preventDefault();
        window.location.href = '/login.html?role=admin&redirect=/admin.html';
      }
    });
  }
}

function setupPortalModalListeners() {
  const openBtn = document.getElementById('student-nav-profile-badge');
  const modal = document.getElementById('student-portal-modal');
  const closeBtn = document.getElementById('close-student-portal-modal');
  const editForm = document.getElementById('student-edit-profile-form');
  const logoutBtn = document.getElementById('student-portal-logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearSession();
      window.location.href = '/login.html';
    });
  }

  if (openBtn && modal) {
    openBtn.addEventListener('click', async () => {
      const p = await getStudentProfile();
      renderHealthCard(p);
      modal.classList.add('active');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const current = await getStudentProfile();
      current.name = document.getElementById('edit-profile-name').value || current.name;
      current.id = document.getElementById('edit-profile-id').value || current.id;
      current.bloodGroup = document.getElementById('edit-profile-blood').value || current.bloodGroup;
      current.allergies = document.getElementById('edit-profile-allergies').value || current.allergies;
      current.emergencyContact = document.getElementById('edit-profile-emergency').value || current.emergencyContact;

      try {
        await api.updateStudentProfile(current);
      } catch (err) {
        localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(current));
      }

      renderStudentNavbarBadge(current);
      renderHealthCard(current);
      showToast('Student Health Profile updated successfully!', 'success');
    });
  }
}

function renderHealthCard(profile) {
  const cardContainer = document.getElementById('digital-health-id-card');
  if (!cardContainer) return;

  cardContainer.innerHTML = `
    <div class="student-id-physical-card">
      <div class="id-card-top">
        <div class="id-univ-brand">
          <span class="id-seal">🏛</span>
          <div>
            <h3>UNIVERSITY CAMPUS HEALTH</h3>
            <span>OFFICIAL STUDENT HEALTH IDENTIFICATION</span>
          </div>
        </div>
        <div class="id-blood-badge">Blood: ${profile.bloodGroup}</div>
      </div>

      <div class="id-card-mid">
        <div class="id-photo-frame">
          <div class="id-avatar-placeholder">${profile.name.charAt(0)}</div>
          <span class="id-verified-tick">✓ Active</span>
        </div>
        <div class="id-info-grid">
          <div class="id-info-item">
            <label>Name</label>
            <strong>${profile.name}</strong>
          </div>
          <div class="id-info-item">
            <label>Student ID</label>
            <strong>${profile.id}</strong>
          </div>
          <div class="id-info-item">
            <label>Department / Year</label>
            <span>${profile.department} (${profile.year})</span>
          </div>
          <div class="id-info-item">
            <label>Residence</label>
            <span>${profile.residence}</span>
          </div>
          <div class="id-info-item full">
            <label>Known Allergies / Medical Flags</label>
            <span class="allergy-flag">⚠️ ${profile.allergies}</span>
          </div>
          <div class="id-info-item full">
            <label>Emergency Primary Contact</label>
            <span>📞 ${profile.emergencyContact}</span>
          </div>
        </div>
      </div>

      <div class="id-card-bottom">
        <div class="compliance-badge">🛡 ${profile.vaccinationStatus}</div>
        <div class="barcode-sim">|||| | |||||| || | |||| ||||| | |||</div>
      </div>
    </div>
  `;

  // Pre-fill edit form
  const editName = document.getElementById('edit-profile-name');
  const editId = document.getElementById('edit-profile-id');
  const editBlood = document.getElementById('edit-profile-blood');
  const editAllergies = document.getElementById('edit-profile-allergies');
  const editEmergency = document.getElementById('edit-profile-emergency');

  if (editName) editName.value = profile.name;
  if (editId) editId.value = profile.id;
  if (editBlood) editBlood.value = profile.bloodGroup;
  if (editAllergies) editAllergies.value = profile.allergies;
  if (editEmergency) editEmergency.value = profile.emergencyContact;
}
