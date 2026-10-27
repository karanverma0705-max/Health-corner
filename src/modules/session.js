// Session and Auth Management Helper for UniCare Campus Health Corner
const SESSION_KEY = 'unicare_auth_session';

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setSession(user, role, token) {
  const session = {
    user,
    role,
    token: token || `token-${Date.now()}`,
    loginTime: new Date().toISOString()
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function isStudentLoggedIn() {
  const s = getSession();
  return !!(s && s.role === 'student');
}

export function isAdminLoggedIn() {
  const s = getSession();
  return !!(s && s.role === 'admin');
}
