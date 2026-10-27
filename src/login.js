// UniCare Campus Health Corner - Login & Authentication Controller
import { api } from './api/client.js';
import { setSession, getSession } from './modules/session.js';
import confetti from 'canvas-confetti';

let currentRole = 'student'; // 'student' or 'admin'

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  checkExistingSession();
  setupRoleSwitcher();
  setupDemoFillers();
  setupPasswordToggle();
  setupFormSubmission();
  setupRegistrationDrawer();
  checkDbStatus();
});

// 1. Theme Management
function initTheme() {
  const toggleBtn = document.getElementById('login-theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('unicare-theme');
  const active = saved || (prefersDark ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', active);
  updateThemeIcon(active);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('unicare-theme', next);
      updateThemeIcon(next);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('login-theme-icon');
  if (icon) {
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// 2. Check if already logged in
function checkExistingSession() {
  const params = new URLSearchParams(window.location.search);
  const requestedRole = params.get('role');
  const redirectTarget = params.get('redirect');

  // If user explicitly asked for a role via URL query, activate it
  if (requestedRole === 'admin') {
    switchRole('admin');
  } else {
    switchRole('student');
  }

  // Check existing session
  const session = getSession();
  if (session && session.user) {
    // If already logged in to this requested role, inform user
    if (requestedRole && session.role === requestedRole) {
      showAlert(`You are already signed in as ${session.user.name} (${session.role}). Redirecting...`, 'success');
      setTimeout(() => {
        window.location.href = session.role === 'admin' ? '/admin.html' : '/';
      }, 900);
    }
  }
}

// 3. Role Switcher (Student vs Admin)
function setupRoleSwitcher() {
  const tabStudent = document.getElementById('tab-student');
  const tabAdmin = document.getElementById('tab-admin');

  if (tabStudent) {
    tabStudent.addEventListener('click', () => switchRole('student'));
  }
  if (tabAdmin) {
    tabAdmin.addEventListener('click', () => switchRole('admin'));
  }
}

function switchRole(role) {
  currentRole = role;
  hideAlert();

  const tabStudent = document.getElementById('tab-student');
  const tabAdmin = document.getElementById('tab-admin');
  const roleBadgeText = document.getElementById('role-badge-text');
  const roleBadgeIcon = document.getElementById('role-badge-icon');
  const loginTitle = document.getElementById('login-title');
  const loginSubtitle = document.getElementById('login-subtitle');
  const labelIdentifier = document.getElementById('label-identifier');
  const identifierInput = document.getElementById('auth-identifier');
  const identifierIcon = document.getElementById('identifier-icon');
  const labelPassword = document.getElementById('label-password');
  const passwordInput = document.getElementById('auth-password');
  const submitBtnText = document.getElementById('submit-btn-text');
  const targetHint = document.getElementById('role-target-hint');
  const registerBox = document.getElementById('student-register-box');

  if (role === 'admin') {
    document.body.classList.add('mode-admin');
    tabStudent?.classList.remove('active');
    tabAdmin?.classList.add('active');
    tabStudent?.setAttribute('aria-selected', 'false');
    tabAdmin?.setAttribute('aria-selected', 'true');

    const dbText = document.getElementById('login-db-text');
    if (dbText) dbText.textContent = 'SQLite Online';

    if (roleBadgeIcon) roleBadgeIcon.textContent = '🛡️';
    if (roleBadgeText) roleBadgeText.textContent = 'Clinic Staff & Administrator';
    if (loginTitle) loginTitle.textContent = 'Staff Admin Console Login';
    if (loginSubtitle) loginSubtitle.textContent = 'Access the operations dashboard, doctor rosters, dispensary inventory, and SQLite tables.';
    if (labelIdentifier) labelIdentifier.textContent = 'Admin Email or Username';
    if (identifierInput) {
      identifierInput.placeholder = 'admin@campus.edu or admin';
      identifierInput.value = '';
    }
    if (identifierIcon) identifierIcon.textContent = '🛡️';
    if (labelPassword) labelPassword.textContent = 'Staff Access Key';
    if (passwordInput) passwordInput.value = '';
    if (submitBtnText) submitBtnText.textContent = 'Sign In to Admin Console →';
    if (targetHint) targetHint.textContent = 'Target: Admin Console (/admin.html)';
    if (registerBox) registerBox.style.display = 'none';
  } else {
    document.body.classList.remove('mode-admin');
    tabAdmin?.classList.remove('active');
    tabStudent?.classList.add('active');
    tabAdmin?.setAttribute('aria-selected', 'false');
    tabStudent?.setAttribute('aria-selected', 'true');

    const dbText = document.getElementById('login-db-text');
    if (dbText) dbText.textContent = 'System Online';

    if (roleBadgeIcon) roleBadgeIcon.textContent = '🎓';
    if (roleBadgeText) roleBadgeText.textContent = 'Student Health Portal';
    if (loginTitle) loginTitle.textContent = 'Sign In as Student';
    if (loginSubtitle) loginSubtitle.textContent = 'Sign in to access your digital health card, health profile, and rapid dispensary tokens.';
    if (labelIdentifier) labelIdentifier.textContent = 'University Email or Student ID';
    if (identifierInput) {
      identifierInput.placeholder = 'alex.rivera@campus.edu or U-2024-88419';
      identifierInput.value = '';
    }
    if (identifierIcon) identifierIcon.textContent = '📧';
    if (labelPassword) labelPassword.textContent = 'Student Portal Password';
    if (passwordInput) passwordInput.value = '';
    if (submitBtnText) submitBtnText.textContent = 'Sign In to Student Portal →';
    if (targetHint) targetHint.textContent = 'Target: Student Portal (/)';
    if (registerBox) registerBox.style.display = 'block';
  }
}

// 4. One-Click Demo Credentials
function setupDemoFillers() {
  const demoStudentBtn = document.getElementById('demo-student-btn');
  const demoAdminBtn = document.getElementById('demo-admin-btn');
  const demoHintBtn = document.getElementById('demo-hint-btn');

  if (demoStudentBtn) {
    demoStudentBtn.addEventListener('click', () => {
      switchRole('student');
      document.getElementById('auth-identifier').value = 'alex.rivera@campus.edu';
      document.getElementById('auth-password').value = 'student123';
      showAlert('Autofilled demo student credentials (Alex Rivera). Click Sign In!', 'success');
    });
  }

  if (demoAdminBtn) {
    demoAdminBtn.addEventListener('click', () => {
      switchRole('admin');
      document.getElementById('auth-identifier').value = 'admin@campus.edu';
      document.getElementById('auth-password').value = 'admin123';
      showAlert('Autofilled demo administrator credentials (Dr. Sarah Jenkins). Click Sign In!', 'success');
    });
  }

  if (demoHintBtn) {
    demoHintBtn.addEventListener('click', () => {
      if (currentRole === 'admin') {
        document.getElementById('auth-identifier').value = 'admin@campus.edu';
        document.getElementById('auth-password').value = 'admin123';
        showAlert('Demo Admin hint: admin@campus.edu / admin123', 'success');
      } else {
        document.getElementById('auth-identifier').value = 'alex.rivera@campus.edu';
        document.getElementById('auth-password').value = 'student123';
        showAlert('Demo Student hint: alex.rivera@campus.edu / student123', 'success');
      }
    });
  }
}

// 5. Password toggle
function setupPasswordToggle() {
  const toggleBtn = document.getElementById('toggle-password-btn');
  const passwordInput = document.getElementById('auth-password');

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
      const isPass = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPass ? 'text' : 'password');
      toggleBtn.textContent = isPass ? '🙈' : '👁️';
    });
  }
}

// 6. Form Submission & Validation
function setupFormSubmission() {
  const form = document.getElementById('auth-form');
  const submitBtn = document.getElementById('login-submit-btn');
  const spinner = document.getElementById('submit-btn-spinner');
  const btnText = document.getElementById('submit-btn-text');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const identifier = document.getElementById('auth-identifier').value.trim();
    const password = document.getElementById('auth-password').value;

    if (!identifier) {
      showAlert(currentRole === 'admin' ? 'Please enter your Admin Email or username.' : 'Please enter your Student ID or University Email.', 'error');
      document.getElementById('auth-identifier').focus();
      return;
    }

    if (!password) {
      showAlert('Please enter your password.', 'error');
      document.getElementById('auth-password').focus();
      return;
    }

    // Set loading state
    submitBtn.disabled = true;
    spinner.style.display = 'inline-block';
    btnText.style.display = 'none';

    try {
      const response = await api.login(identifier, password, currentRole);

      if (response && response.success) {
        // Save session
        setSession(response.user, response.role, response.token);

        // Also sync profile in localStorage for student
        if (response.role === 'student' && response.user) {
          localStorage.setItem('unicare_student_profile', JSON.stringify({
            name: response.user.name,
            id: response.user.studentId || 'U-2024-88419',
            email: response.user.email,
            department: response.user.department || 'Computer Science & Engineering',
            year: '3rd Year (Junior)',
            residence: 'North Pioneer Commons, Room 314',
            bloodGroup: 'O+',
            allergies: 'Penicillin, Tree nuts',
            emergencyContact: 'Maria Rivera (Parent) • (555) 234-5678',
            insuranceStatus: 'Active - University Care Plus Plan',
            vaccinationStatus: 'Verified & Fully Compliant',
            isLoggedIn: true
          }));
        }

        showAlert(`Welcome back, ${response.user.name}! Redirecting to portal...`, 'success');

        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');

        setTimeout(() => {
          if (redirect) {
            window.location.href = redirect;
          } else if (response.role === 'admin') {
            window.location.href = '/admin.html';
          } else {
            window.location.href = '/';
          }
        }, 650);
      }
    } catch (err) {
      showAlert(err.message || 'Authentication failed. Please verify your credentials.', 'error');
      submitBtn.disabled = false;
      spinner.style.display = 'none';
      btnText.style.display = 'inline-block';
    }
  });
}

// 7. Student Registration Drawer
function setupRegistrationDrawer() {
  const toggleBtn = document.getElementById('toggle-register-btn');
  const regForm = document.getElementById('register-form');
  const cancelBtn = document.getElementById('cancel-register-btn');

  if (toggleBtn && regForm) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = regForm.style.display === 'block';
      regForm.style.display = isOpen ? 'none' : 'block';
      toggleBtn.textContent = isOpen ? '➕ Register as New Student' : '✕ Close Registration Form';
      if (!isOpen) {
        document.getElementById('reg-name')?.focus();
      }
    });
  }

  if (cancelBtn && regForm) {
    cancelBtn.addEventListener('click', () => {
      regForm.style.display = 'none';
      if (toggleBtn) toggleBtn.textContent = '➕ Register as New Student';
    });
  }

  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const name = document.getElementById('reg-name').value.trim();
      const studentId = document.getElementById('reg-id').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const department = document.getElementById('reg-dept').value.trim();
      const password = document.getElementById('reg-password').value;

      if (!name || !email || !password) {
        showAlert('Please fill in your name, email, and a password.', 'error');
        return;
      }

      try {
        const response = await api.registerStudent({
          name,
          studentId: studentId || `U-${Math.floor(10000 + Math.random() * 90000)}`,
          email,
          department: department || 'General Studies',
          password
        });

        if (response && response.success) {
          setSession(response.user, 'student', response.token);
          showAlert(`Account created for ${response.user.name}! Redirecting to student portal...`, 'success');

          try {
            confetti({
              particleCount: 80,
              spread: 80,
              origin: { y: 0.6 }
            });
          } catch (e) {}

          setTimeout(() => {
            window.location.href = '/';
          }, 800);
        }
      } catch (err) {
        showAlert(err.message || 'Registration failed.', 'error');
      }
    });
  }
}

// 8. Alerts
function showAlert(msg, type = 'error') {
  const alertBox = document.getElementById('login-alert');
  const alertMsg = document.getElementById('alert-msg');
  const alertIcon = document.getElementById('alert-icon');

  if (alertBox && alertMsg) {
    alertBox.className = `login-alert ${type}`;
    alertMsg.textContent = msg;
    if (alertIcon) alertIcon.textContent = type === 'success' ? '✓' : '⚠️';
    alertBox.style.display = 'flex';
  }
}

function hideAlert() {
  const alertBox = document.getElementById('login-alert');
  if (alertBox) alertBox.style.display = 'none';
}

// 9. Live Database Status
async function checkDbStatus() {
  const statusBadge = document.getElementById('login-db-status');
  const statusText = document.getElementById('login-db-text');

  try {
    const data = await api.getStatus();
    if (data && data.status === 'online') {
      if (statusText) statusText.textContent = currentRole === 'admin' ? 'SQLite Online' : 'System Online';
    }
  } catch (e) {
    if (statusText) statusText.textContent = currentRole === 'admin' ? 'SQLite Fallback' : 'System Standby';
  }
}
