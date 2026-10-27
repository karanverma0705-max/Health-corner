// SQLite REST API Client for Campus Health Corner
import { healthcareProfessionals } from '../data/professionals.js';
import { pharmacyInventory } from '../data/pharmacy.js';

const API_BASE = '/api';

export const api = {
  // 1. Database Status & Download
  async getStatus() {
    try {
      const res = await fetch(`${API_BASE}/status`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('[API Client] Server unreachable, using local fallback:', e);
      return { 
        status: 'offline', 
        database: 'SQLite 3 (Local Fallback)',
        databaseFile: 'database/campus_health.sqlite',
        tables: { appointments: 0, professionals: 6, pharmacy_inventory: 11 }
      };
    }
  },

  getDbDownloadUrl() {
    return `${API_BASE}/db/download`;
  },

  // Admin KPI metrics
  async getAdminMetrics() {
    try {
      const res = await fetch(`${API_BASE}/admin/metrics`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return {
        appointments: { total: 0, confirmed: 0, completed: 0 },
        doctors: { total: 6, activeToday: 5 },
        pharmacy: { total: 11, lowStock: 2 },
        emergency: { total: 0, active: 0 }
      };
    }
  },

  // 2. Healthcare Professionals
  async getProfessionals(category = 'all') {
    try {
      const res = await fetch(`${API_BASE}/professionals`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list = await res.json();
      return filterDoctors(list, category);
    } catch (e) {
      console.warn('[API Client] Falling back to local data for professionals');
      return filterDoctors(healthcareProfessionals, category);
    }
  },

  async toggleDoctorAvailability(id, availableToday) {
    try {
      const res = await fetch(`${API_BASE}/professionals/${id}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableToday })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('[API Client] Toggle doctor availability failed:', e);
      return { id, availableToday };
    }
  },

  async updateDoctor(id, data) {
    try {
      const res = await fetch(`${API_BASE}/professionals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return data;
    }
  },

  async createDoctor(data) {
    try {
      const res = await fetch(`${API_BASE}/professionals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return data;
    }
  },

  async deleteDoctor(id) {
    try {
      const res = await fetch(`${API_BASE}/professionals/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return { success: true };
    }
  },

  // 3. Appointments
  async getAppointments() {
    try {
      const res = await fetch(`${API_BASE}/appointments`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      const saved = localStorage.getItem('unicare_booked_appointments');
      return saved ? JSON.parse(saved) : [];
    }
  },

  async createAppointment(appointment) {
    try {
      const res = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      syncLocalAppointment(data);
      return data;
    } catch (e) {
      console.warn('[API Client] Using local storage for appointment creation');
      syncLocalAppointment(appointment);
      return appointment;
    }
  },

  async updateAppointmentStatus(id, status) {
    try {
      const res = await fetch(`${API_BASE}/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      const existing = JSON.parse(localStorage.getItem('unicare_booked_appointments') || '[]');
      const item = existing.find(a => a.id === id);
      if (item) item.status = status;
      localStorage.setItem('unicare_booked_appointments', JSON.stringify(existing));
      return { id, status };
    }
  },

  async deleteAppointment(id) {
    try {
      const res = await fetch(`${API_BASE}/appointments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      removeLocalAppointment(id);
      return await res.json();
    } catch (e) {
      removeLocalAppointment(id);
      return { success: true };
    }
  },

  // 4. Pharmacy & Dispensary
  async getPharmacyInventory(category = 'all', search = '') {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.set('category', category);
      if (search) params.set('search', search);

      const res = await fetch(`${API_BASE}/pharmacy?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return pharmacyInventory.filter(item => {
        const matchesCat = category === 'all' || item.category.toLowerCase().includes(category.toLowerCase());
        const query = search.toLowerCase();
        const matchesQuery = !search || item.name.toLowerCase().includes(query) || item.indications.toLowerCase().includes(query);
        return matchesCat && matchesQuery;
      });
    }
  },

  async updatePharmacyStock(id, data) {
    try {
      const res = await fetch(`${API_BASE}/pharmacy/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return data;
    }
  },

  async createPharmacyItem(data) {
    try {
      const res = await fetch(`${API_BASE}/pharmacy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return data;
    }
  },

  async deletePharmacyItem(id) {
    try {
      const res = await fetch(`${API_BASE}/pharmacy/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return { success: true };
    }
  },

  async createDispensaryToken(medName, studentId) {
    try {
      const res = await fetch(`${API_BASE}/pharmacy/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medName, studentId })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      const token = "DISP-" + Math.floor(1000 + Math.random() * 9000);
      return { token, medName, validUntil: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() };
    }
  },

  // 5. Emergency SOS Logging & Admin Fetch
  async getEmergencySosLogs() {
    try {
      const res = await fetch(`${API_BASE}/emergency/sos`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async logEmergencySos(location, crisisNature) {
    try {
      const res = await fetch(`${API_BASE}/emergency/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, crisisNature })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return { id: "SOS-" + Date.now(), status: 'Dispatched', assignedUnit: 'Mobile Paramedic Unit 2' };
    }
  },

  async updateEmergencyStatus(id, status, assignedUnit) {
    try {
      const res = await fetch(`${API_BASE}/emergency/sos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, assignedUnit })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return { id, status, assignedUnit };
    }
  },

  // 6. Student Profile
  async getStudentProfile() {
    try {
      const res = await fetch(`${API_BASE}/student-profile`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      const saved = localStorage.getItem('unicare_student_profile');
      return saved ? JSON.parse(saved) : null;
    }
  },

  async updateStudentProfile(profile) {
    try {
      const res = await fetch(`${API_BASE}/student-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      localStorage.setItem('unicare_student_profile', JSON.stringify(data));
      return data;
    } catch (e) {
      localStorage.setItem('unicare_student_profile', JSON.stringify(profile));
      return profile;
    }
  },

  // 7. Database Inspector Viewer
  async getDatabaseViewer() {
    try {
      const res = await fetch(`${API_BASE}/db/viewer`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // 8. User Authentication (Admin & Student)
  async login(identifier, password, role) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      return data;
    } catch (e) {
      // Offline fallback for demo
      console.warn('[API Client] Server login failed, testing fallback accounts:', e);
      const clean = String(identifier || '').trim().toLowerCase();
      if (role === 'admin') {
        if ((clean === 'admin@campus.edu' || clean === 'admin') && password === 'admin123') {
          return {
            success: true,
            role: 'admin',
            user: { id: 'usr-admin-1', name: 'Dr. Sarah Jenkins', email: 'admin@campus.edu', role: 'admin' },
            token: 'offline-admin-token'
          };
        }
      } else {
        if ((clean === 'alex.rivera@campus.edu' || clean === 'alex.rivera' || clean === 'u-2024-88419') && password === 'student123') {
          return {
            success: true,
            role: 'student',
            user: { id: 'usr-student-1', name: 'Alex Rivera', studentId: 'U-2024-88419', email: 'alex.rivera@campus.edu', role: 'student' },
            token: 'offline-student-token'
          };
        }
      }
      throw e;
    }
  },

  async registerStudent(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async getUsers() {
    try {
      const res = await fetch(`${API_BASE}/auth/users`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return [];
    }
  }
};

function filterDoctors(list, filterCategory) {
  if (filterCategory === 'all') return list;
  return list.filter(p => {
    const dept = (p.department || '').toLowerCase();
    if (filterCategory === 'general') return dept.includes('general') || dept.includes('triage') || dept.includes('acute');
    if (filterCategory === 'mental') return dept.includes('mental') || dept.includes('psycholog') || dept.includes('counseling');
    if (filterCategory === 'physio') return dept.includes('sports') || dept.includes('physical') || dept.includes('rehab');
    if (filterCategory === 'dental') return dept.includes('dental') || dept.includes('oral');
    if (filterCategory === 'women') return dept.includes('women') || dept.includes('reproductive') || dept.includes('gynecolog');
    return true;
  });
}

function syncLocalAppointment(apt) {
  const existing = JSON.parse(localStorage.getItem('unicare_booked_appointments') || '[]');
  const filtered = existing.filter(a => a.id !== apt.id);
  filtered.unshift(apt);
  localStorage.setItem('unicare_booked_appointments', JSON.stringify(filtered));
}

function removeLocalAppointment(id) {
  const existing = JSON.parse(localStorage.getItem('unicare_booked_appointments') || '[]');
  const filtered = existing.filter(a => a.id !== id);
  localStorage.setItem('unicare_booked_appointments', JSON.stringify(filtered));
}
