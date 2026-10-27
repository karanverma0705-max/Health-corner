// Campus Care Admin Portal & Database Management Controller
import { api } from './api/client.js';
import { getSession, clearSession } from './modules/session.js';

let allAppointments = [];
let allDoctors = [];
let allPharmacy = [];
let allSosLogs = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Check admin authentication session
  const session = getSession();
  if (!session || session.role !== 'admin') {
    window.location.href = '/login.html?role=admin&redirect=/admin.html';
    return;
  }

  // Display active admin name
  const nameEl = document.getElementById('admin-current-user-name');
  if (nameEl && session.user?.name) {
    nameEl.textContent = session.user.name;
  }

  // Bind logout button
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearSession();
      window.location.href = '/login.html?role=admin';
    });
  }

  initTheme();
  setupTabNavigation();
  setupModals();

  await loadAllData();

  // Polling for live status every 15s
  setInterval(async () => {
    await updateKpiMetrics();
  }, 15000);
});

// Theme Management
function initTheme() {
  const toggleBtn = document.getElementById('adm-theme-toggle');
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
  const icon = document.getElementById('adm-theme-icon');
  if (!icon) return;
  icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Tab Navigation
function setupTabNavigation() {
  const tabs = document.querySelectorAll('.admin-tab-btn');
  const panels = document.querySelectorAll('.admin-tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      const panel = document.getElementById(targetId);
      if (panel) panel.classList.add('active');
    });
  });
}

// Load all dashboard data from SQLite REST server
async function loadAllData() {
  await Promise.all([
    updateKpiMetrics(),
    loadAppointments(),
    loadDoctors(),
    loadPharmacy(),
    loadSosLogs(),
    loadDatabaseOverview()
  ]);
}

// 1. KPI Metrics
async function updateKpiMetrics() {
  try {
    const metrics = await api.getAdminMetrics();
    const status = await api.getStatus();

    document.getElementById('kpi-appointments-count').textContent = metrics.appointments?.total || 0;
    document.getElementById('kpi-appointments-sub').textContent = `${metrics.appointments?.confirmed || 0} active • ${metrics.appointments?.completed || 0} completed`;

    document.getElementById('kpi-doctors-count').textContent = `${metrics.doctors?.activeToday || 0} / ${metrics.doctors?.total || 0}`;
    document.getElementById('kpi-doctors-sub').textContent = `${metrics.doctors?.activeToday || 0} currently on duty`;

    document.getElementById('kpi-pharmacy-count').textContent = metrics.pharmacy?.total || 0;
    document.getElementById('kpi-pharmacy-sub').textContent = `${metrics.pharmacy?.lowStock || 0} low stock items`;

    document.getElementById('kpi-sos-count').textContent = metrics.emergency?.total || 0;
    document.getElementById('kpi-sos-sub').textContent = `${metrics.emergency?.active || 0} active dispatches`;

    // Database Status Pill
    const dbStatusPill = document.getElementById('db-connection-status');
    if (dbStatusPill) {
      if (status.status === 'online') {
        dbStatusPill.innerHTML = `<span class="pulse-dot-green"></span><span>SQLite Online (${status.fileSizeKb || 'Active'})</span>`;
      } else {
        dbStatusPill.innerHTML = `<span style="color: #f59e0b;">●</span><span>SQLite Fallback</span>`;
      }
    }
  } catch (err) {
    console.warn("KPI error:", err);
  }
}

// 2. Appointments Management
async function loadAppointments() {
  const tbody = document.getElementById('appointments-table-body');
  if (!tbody) return;

  try {
    allAppointments = await api.getAppointments();
    renderAppointmentsTable(allAppointments);
    setupAppointmentFilters();
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #ef4444;">Failed to load appointments from SQLite.</td></tr>`;
  }
}

function renderAppointmentsTable(list) {
  const tbody = document.getElementById('appointments-table-body');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--adm-text-muted);">No appointments recorded in the database.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(apt => `
    <tr>
      <td><strong style="font-family: var(--admin-mono); color: var(--adm-primary);">${apt.id}</strong></td>
      <td>
        <strong>${apt.studentName}</strong>
        <div style="font-size: 0.78rem; color: var(--adm-text-muted);">${apt.studentId} • ${apt.studentEmail}</div>
      </td>
      <td>
        <strong>${apt.doctorName}</strong>
        <div style="font-size: 0.78rem; color: var(--adm-text-muted);">${apt.department} (${apt.room})</div>
      </td>
      <td>
        <strong>📅 ${apt.date}</strong>
        <div style="font-size: 0.78rem; color: var(--adm-text-muted);">⏰ ${apt.time}</div>
      </td>
      <td>
        <span style="font-size: 0.85rem;">${apt.reason || 'General'}</span>
        ${apt.isConfidential ? '<span style="display: block; font-size: 0.7rem; color: #a855f7;">🔒 Strict Privacy</span>' : ''}
      </td>
      <td>
        <span class="status-pill ${(apt.status || 'Confirmed').toLowerCase()}">${apt.status || 'Confirmed'}</span>
      </td>
      <td>
        <div style="display: flex; gap: 0.35rem;">
          ${apt.status !== 'Completed' ? `
            <button class="btn-adm btn-adm-secondary btn-adm-sm update-apt-status-btn" data-id="${apt.id}" data-status="Completed" title="Mark as Completed">✓ Done</button>
          ` : ''}
          ${apt.status !== 'Cancelled' ? `
            <button class="btn-adm btn-adm-secondary btn-adm-sm update-apt-status-btn" data-id="${apt.id}" data-status="Cancelled" title="Mark as Cancelled">✕ Cancel</button>
          ` : ''}
          <button class="btn-adm btn-adm-outline-danger btn-adm-sm delete-apt-btn" data-id="${apt.id}" title="Delete from SQLite">🗑</button>
        </div>
      </td>
    </tr>
  `).join('');

  // Attach status change events
  tbody.querySelectorAll('.update-apt-status-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const status = btn.getAttribute('data-status');
      await api.updateAppointmentStatus(id, status);
      showToast(`Appointment ${id} status updated to ${status}.`);
      await loadAppointments();
      await updateKpiMetrics();
    });
  });

  // Attach delete events
  tbody.querySelectorAll('.delete-apt-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (confirm(`Are you sure you want to delete appointment ${id} permanently from SQLite?`)) {
        await api.deleteAppointment(id);
        showToast(`Appointment ${id} removed from SQLite database.`);
        await loadAppointments();
        await updateKpiMetrics();
      }
    });
  });
}

function setupAppointmentFilters() {
  const searchInput = document.getElementById('search-appointments');
  const filterPills = document.querySelectorAll('.apt-filter-pill');

  let activeFilter = 'all';

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      applyFilters();
    });
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.getAttribute('data-filter');
      applyFilters();
    });
  });

  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const filtered = allAppointments.filter(apt => {
      const matchesFilter = activeFilter === 'all' || (apt.status || 'Confirmed').toLowerCase() === activeFilter.toLowerCase();
      const matchesQuery = !query ||
        apt.studentName.toLowerCase().includes(query) ||
        apt.studentId.toLowerCase().includes(query) ||
        apt.doctorName.toLowerCase().includes(query) ||
        apt.id.toLowerCase().includes(query);
      return matchesFilter && matchesQuery;
    });
    renderAppointmentsTable(filtered);
  }
}

// 3. Doctors & Healthcare Team
async function loadDoctors() {
  const container = document.getElementById('admin-doctors-list');
  if (!container) return;

  try {
    allDoctors = await api.getProfessionals('all');
    renderDoctorsGrid(allDoctors);
  } catch (e) {
    container.innerHTML = `<p style="color: #ef4444;">Failed to load doctors list.</p>`;
  }
}

function renderDoctorsGrid(list) {
  const container = document.getElementById('admin-doctors-list');
  if (!container) return;

  container.innerHTML = list.map(doc => {
    const slots = Array.isArray(doc.slotsToday) ? doc.slotsToday : (typeof doc.slotsToday === 'string' ? JSON.parse(doc.slotsToday || '[]') : []);

    return `
      <div class="adm-doc-card">
        <div class="adm-doc-header">
          <img src="${doc.avatar || '/images/doctor-consultation.jpg'}" alt="${doc.name}" class="adm-doc-avatar" />
          <div class="adm-doc-title-box">
            <h4 class="adm-doc-name">${doc.name}</h4>
            <div class="adm-doc-dept">${doc.department}</div>
            <div style="font-size: 0.75rem; color: var(--adm-text-muted);">📍 ${doc.room}</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--adm-surface-alt); padding: 0.65rem 0.85rem; border-radius: var(--adm-radius-sm);">
          <div>
            <strong style="font-size: 0.82rem; display: block;">Available Today:</strong>
            <span style="font-size: 0.75rem; color: ${doc.availableToday ? 'var(--adm-emerald)' : 'var(--adm-text-muted)'};">
              ${doc.availableToday ? '● Accepting Walk-ins & Bookings' : '○ Off-duty Today'}
            </span>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" class="doc-duty-toggle" data-id="${doc.id}" ${doc.availableToday ? 'checked' : ''} />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div style="font-size: 0.8rem; color: var(--adm-text-secondary);">
          <strong>Hours:</strong> ${doc.schedule}
        </div>

        <div style="font-size: 0.78rem; color: var(--adm-text-muted);">
          <strong>Today's Slots:</strong> ${slots.join(', ') || 'No slots configured'}
        </div>

        <div style="margin-top: auto; display: flex; gap: 0.5rem; justify-content: flex-end; flex-wrap: wrap;">
          <button class="btn-adm btn-adm-primary btn-adm-sm admin-book-doc-btn" data-id="${doc.id}">
            📅 Book Patient
          </button>
          <button class="btn-adm btn-adm-secondary btn-adm-sm edit-doc-slots-btn" data-id="${doc.id}" data-name="${doc.name}" data-slots="${slots.join(', ')}">
            ✏️ Edit Slots
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Attach book patient listeners
  container.querySelectorAll('.admin-book-doc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const docId = btn.getAttribute('data-id');
      openAdminBookingModal('scheduled', docId);
    });
  });

  // Attach toggle listeners
  container.querySelectorAll('.doc-duty-toggle').forEach(chk => {
    chk.addEventListener('change', async () => {
      const id = chk.getAttribute('data-id');
      const isAvailable = chk.checked;
      await api.toggleDoctorAvailability(id, isAvailable);
      showToast(`Updated doctor availability in SQLite.`);
      await updateKpiMetrics();
    });
  });

  // Attach edit slots listeners
  container.querySelectorAll('.edit-doc-slots-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const currentSlots = btn.getAttribute('data-slots');

      const newSlots = prompt(`Edit consultation slots for ${name} (comma-separated):`, currentSlots);
      if (newSlots !== null) {
        const slotsArray = newSlots.split(',').map(s => s.trim()).filter(Boolean);
        await api.updateDoctor(id, { slotsToday: slotsArray });
        showToast(`Updated slots for ${name}.`);
        await loadDoctors();
      }
    });
  });
}

// 4. Pharmacy & Dispensary Stock
async function loadPharmacy() {
  const tbody = document.getElementById('pharmacy-table-body');
  if (!tbody) return;

  try {
    allPharmacy = await api.getPharmacyInventory('all', '');
    renderPharmacyTable(allPharmacy);
    setupPharmacySearch();
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #ef4444;">Failed to load pharmacy from SQLite.</td></tr>`;
  }
}

function renderPharmacyTable(list) {
  const tbody = document.getElementById('pharmacy-table-body');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--adm-text-muted);">No medication records match filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(item => `
    <tr>
      <td>
        <strong>${item.name}</strong>
        <div style="font-size: 0.75rem; color: var(--adm-text-muted);">${item.indications}</div>
      </td>
      <td><span class="tab-badge">${item.category}</span></td>
      <td>
        <div class="stock-counter">
          <button class="stock-btn adjust-stock-btn" data-id="${item.id}" data-delta="-10">-10</button>
          <button class="stock-btn adjust-stock-btn" data-id="${item.id}" data-delta="-1">-</button>
          <span class="stock-number-bold">${item.stockQuantity}</span>
          <button class="stock-btn adjust-stock-btn" data-id="${item.id}" data-delta="1">+</button>
          <button class="stock-btn adjust-stock-btn" data-id="${item.id}" data-delta="25">+25</button>
        </div>
      </td>
      <td>
        <span class="status-pill ${(item.stockStatus || 'in-stock').toLowerCase().replace(/\s+/g, '-')}">
          ${item.stockStatus}
        </span>
      </td>
      <td><span style="font-size: 0.85rem;">${item.cost}</span></td>
      <td>${item.requiresPrescription ? '🩺 Prescription Required' : '🟢 OTC Express'}</td>
      <td>
        <button class="btn-adm btn-adm-outline-danger btn-adm-sm delete-med-btn" data-id="${item.id}" title="Remove Medicine">🗑</button>
      </td>
    </tr>
  `).join('');

  // Stock adjuster buttons
  tbody.querySelectorAll('.adjust-stock-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const delta = parseInt(btn.getAttribute('data-delta'), 10);
      const item = allPharmacy.find(m => m.id === id);
      if (!item) return;

      const newQty = Math.max(0, item.stockQuantity + delta);
      const newStatus = newQty > 40 ? 'In Stock' : (newQty > 0 ? 'Low Stock' : 'Out of Stock');

      await api.updatePharmacyStock(id, { stockQuantity: newQty, stockStatus: newStatus });
      showToast(`${item.name} stock updated to ${newQty}.`);
      await loadPharmacy();
      await updateKpiMetrics();
    });
  });

  // Delete medicine
  tbody.querySelectorAll('.delete-med-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (confirm(`Remove this item from SQLite pharmacy database?`)) {
        await api.deletePharmacyItem(id);
        showToast('Medication removed.');
        await loadPharmacy();
        await updateKpiMetrics();
      }
    });
  });
}

function setupPharmacySearch() {
  const searchInput = document.getElementById('search-pharmacy');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = allPharmacy.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.indications.toLowerCase().includes(q)
      );
      renderPharmacyTable(filtered);
    });
  }
}

// 5. Emergency SOS Logs
async function loadSosLogs() {
  const tbody = document.getElementById('sos-table-body');
  if (!tbody) return;

  try {
    allSosLogs = await api.getEmergencySosLogs();
    renderSosTable(allSosLogs);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #ef4444;">Failed to load SOS logs.</td></tr>`;
  }
}

function renderSosTable(list) {
  const tbody = document.getElementById('sos-table-body');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--adm-text-muted);">No emergency SOS calls recorded yet. All quiet on campus.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(log => `
    <tr>
      <td><strong style="font-family: var(--admin-mono); color: var(--adm-rose);">${log.id}</strong></td>
      <td><strong>📍 ${log.location}</strong></td>
      <td><span style="color: var(--adm-rose); font-weight: 600;">⚠️ ${log.crisisNature}</span></td>
      <td><span>🚑 ${log.assignedUnit || 'Mobile Unit 2'}</span></td>
      <td>
        <span class="status-pill ${(log.status || 'Dispatched').toLowerCase()}">${log.status}</span>
      </td>
      <td>
        <div style="display: flex; gap: 0.35rem;">
          ${log.status !== 'Resolved' ? `
            <button class="btn-adm btn-adm-success btn-adm-sm resolve-sos-btn" data-id="${log.id}">✓ Mark Resolved</button>
          ` : '<span style="color: var(--adm-emerald); font-weight: 600; font-size: 0.8rem;">Resolved ✓</span>'}
        </div>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.resolve-sos-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      await api.updateEmergencyStatus(id, 'Resolved');
      showToast(`Emergency incident ${id} marked as Resolved.`);
      await loadSosLogs();
      await updateKpiMetrics();
    });
  });
}

// 6. Database Overview & Inspector Tab
async function loadDatabaseOverview() {
  try {
    const status = await api.getStatus();
    const viewer = await api.getDatabaseViewer();

    const infoContainer = document.getElementById('db-overview-info');
    if (infoContainer) {
      infoContainer.innerHTML = `
        <div>
          <h3 style="margin-bottom: 0.35rem;">🗄️ SQLite Database File & Connection</h3>
          <p style="color: var(--adm-text-muted); font-size: 0.85rem;">Direct Relational Storage using Node.js DatabaseSync Engine (WAL Enabled)</p>
          <div class="db-file-box">
            📁 File: <strong>${status.databaseFile || 'database/campus_health.sqlite'}</strong>
            <span style="color: var(--adm-text-muted);">(${status.fileSizeKb || 'Active'})</span>
          </div>
        </div>
        <div style="display: flex; gap: 0.65rem; flex-wrap: wrap;">
          <a href="/api/db/download" class="btn-adm btn-adm-primary" download>
            💾 Download .sqlite File
          </a>
          <button type="button" class="btn-adm btn-adm-secondary" id="admin-refresh-db-btn">
            🔄 Refresh SQLite Tables
          </button>
          <a href="/api/db/viewer" target="_blank" class="btn-adm btn-adm-secondary">
            🔗 Open JSON Table Feed
          </a>
          <a href="/api/status" target="_blank" class="btn-adm btn-adm-secondary">
            ⚡ API Status
          </a>
        </div>
      `;
    }

    const refreshDbBtn = document.getElementById('admin-refresh-db-btn');
    if (refreshDbBtn) {
      refreshDbBtn.onclick = async () => {
        await loadDatabaseOverview();
        showToast('SQLite database tables refreshed!');
      };
    }

    // Render Table Chips
    const chipsContainer = document.getElementById('db-table-chips-list');
    if (chipsContainer && status.tables) {
      const tables = Object.keys(status.tables);
      chipsContainer.innerHTML = tables.map((t, idx) => `
        <button class="db-chip-btn ${idx === 0 ? 'active' : ''}" data-table="${t}">
          📊 ${t} (${status.tables[t]} rows)
        </button>
      `).join('');

      chipsContainer.querySelectorAll('.db-chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          chipsContainer.querySelectorAll('.db-chip-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const tbl = btn.getAttribute('data-table');
          renderTableDataPreview(tbl, viewer ? viewer.data[tbl] : []);
        });
      });

      if (tables.length > 0 && viewer && viewer.data) {
        renderTableDataPreview(tables[0], viewer.data[tables[0]] || []);
      }
    }
  } catch (err) {
    console.warn("DB overview error:", err);
  }
}

function renderTableDataPreview(tableName, rows) {
  const container = document.getElementById('db-table-preview-content');
  if (!container) return;

  if (!rows || rows.length === 0) {
    container.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--adm-text-muted);">Table <code>${tableName}</code> is currently empty.</div>`;
    return;
  }

  const columns = Object.keys(rows[0]);

  container.innerHTML = `
    <div style="padding: 0.85rem 1.25rem; background: var(--adm-surface-alt); border-bottom: 1px solid var(--adm-border); display: flex; justify-content: space-between; align-items: center;">
      <strong>Showing rows in <code>${tableName}</code></strong>
      <span style="font-size: 0.8rem; color: var(--adm-text-muted);">${rows.length} rows previewed</span>
    </div>
    <div class="table-responsive">
      <table class="adm-table">
        <thead>
          <tr>
            ${columns.map(c => `<th>${c}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${columns.map(c => {
                let val = row[c];
                if (typeof val === 'string' && val.length > 50) val = val.substring(0, 47) + '...';
                return `<td>${val !== null && val !== undefined ? val : '<em style="color:#94a3b8">null</em>'}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Open unified admin appointment booking / walkin modal
function openAdminBookingModal(mode = 'scheduled', preselectedDocId = null) {
  const walkinModal = document.getElementById('walkin-modal');
  const modalTitle = document.getElementById('walkin-modal-title');
  const docSelect = document.getElementById('walkin-doctor-select');
  const scheduledFields = document.getElementById('admin-scheduled-fields');
  const radioScheduled = document.getElementById('admin-mode-scheduled');
  const radioWalkin = document.getElementById('admin-mode-walkin');
  const dateInput = document.getElementById('walkin-date');
  const timeInput = document.getElementById('walkin-time');

  if (docSelect && allDoctors.length > 0) {
    docSelect.innerHTML = allDoctors.map(d => `<option value="${d.id}" data-name="${d.name}" data-dept="${d.department}" data-room="${d.room}">${d.name} (${d.department})</option>`).join('');
    if (preselectedDocId) {
      docSelect.value = preselectedDocId;
    }
  }

  // Pre-fill next slot if available for preselected doctor
  if (preselectedDocId && timeInput) {
    const doc = allDoctors.find(d => d.id === preselectedDocId);
    if (doc) {
      const slots = Array.isArray(doc.slotsToday) ? doc.slotsToday : (typeof doc.slotsToday === 'string' ? JSON.parse(doc.slotsToday || '[]') : []);
      if (slots.length > 0) timeInput.value = slots[0];
    }
  }

  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  if (mode === 'walkin') {
    if (radioWalkin) radioWalkin.checked = true;
    if (modalTitle) modalTitle.textContent = 'Register Urgent Walk-in Patient';
    if (scheduledFields) scheduledFields.style.display = 'none';
  } else {
    if (radioScheduled) radioScheduled.checked = true;
    if (modalTitle) modalTitle.textContent = 'Book Patient Appointment (Scheduled)';
    if (scheduledFields) scheduledFields.style.display = 'flex';
  }

  if (walkinModal) walkinModal.classList.add('active');
}

// Modals Handling (Walk-in Appointment & Add Medicine)
function setupModals() {
  // 1. Unified Appointment Booking & Walk-in Modal
  const openBookBtn = document.getElementById('open-book-modal-btn');
  const openWalkinBtn = document.getElementById('open-walkin-modal-btn');
  const walkinModal = document.getElementById('walkin-modal');
  const closeWalkinBtn = document.getElementById('close-walkin-modal');
  const walkinForm = document.getElementById('walkin-form');
  const scheduledFields = document.getElementById('admin-scheduled-fields');
  const radioScheduled = document.getElementById('admin-mode-scheduled');
  const radioWalkin = document.getElementById('admin-mode-walkin');
  const modalTitle = document.getElementById('walkin-modal-title');

  if (openBookBtn) {
    openBookBtn.addEventListener('click', () => openAdminBookingModal('scheduled'));
  }

  if (openWalkinBtn) {
    openWalkinBtn.addEventListener('click', () => openAdminBookingModal('walkin'));
  }

  if (radioScheduled && radioWalkin) {
    radioScheduled.addEventListener('change', () => {
      if (radioScheduled.checked) {
        if (scheduledFields) scheduledFields.style.display = 'flex';
        if (modalTitle) modalTitle.textContent = 'Book Patient Appointment (Scheduled)';
      }
    });
    radioWalkin.addEventListener('change', () => {
      if (radioWalkin.checked) {
        if (scheduledFields) scheduledFields.style.display = 'none';
        if (modalTitle) modalTitle.textContent = 'Register Urgent Walk-in Patient';
      }
    });
  }

  if (closeWalkinBtn && walkinModal) {
    closeWalkinBtn.addEventListener('click', () => walkinModal.classList.remove('active'));
  }

  if (walkinForm) {
    walkinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const docSelect = document.getElementById('walkin-doctor-select');
      const selectedOption = docSelect.options[docSelect.selectedIndex];
      const isWalkin = document.getElementById('admin-mode-walkin')?.checked;

      const aptDate = isWalkin
        ? new Date().toISOString().split('T')[0]
        : (document.getElementById('walkin-date')?.value || new Date().toISOString().split('T')[0]);

      const aptTime = isWalkin
        ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Walk-in)'
        : (document.getElementById('walkin-time')?.value.trim() || '10:00 AM');

      const newApt = {
        studentName: document.getElementById('walkin-name').value.trim(),
        studentId: document.getElementById('walkin-id').value.trim(),
        studentEmail: document.getElementById('walkin-email').value.trim(),
        doctorId: docSelect.value,
        doctorName: selectedOption.getAttribute('data-name'),
        department: selectedOption.getAttribute('data-dept'),
        room: selectedOption.getAttribute('data-room'),
        date: aptDate,
        time: aptTime,
        reason: document.getElementById('walkin-reason').value.trim() || (isWalkin ? 'Urgent Walk-in Triage' : 'Routine Consultation'),
        isConfidential: document.getElementById('walkin-confidential').checked
      };

      await api.createAppointment(newApt);
      showToast(isWalkin ? 'Walk-in patient registered in SQLite!' : 'Appointment booked and saved to SQLite!');
      walkinModal.classList.remove('active');
      walkinForm.reset();
      await loadAppointments();
      await updateKpiMetrics();
    });
  }

  // 2. Add Medicine Modal
  const openMedBtn = document.getElementById('open-add-med-modal-btn');
  const medModal = document.getElementById('add-med-modal');
  const closeMedBtn = document.getElementById('close-add-med-modal');
  const medForm = document.getElementById('add-med-form');

  if (openMedBtn && medModal) {
    openMedBtn.addEventListener('click', () => medModal.classList.add('active'));
  }
  if (closeMedBtn && medModal) {
    closeMedBtn.addEventListener('click', () => medModal.classList.remove('active'));
  }

  if (medForm) {
    medForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const item = {
        name: document.getElementById('med-name-input').value.trim(),
        category: document.getElementById('med-category-select').value,
        stockQuantity: parseInt(document.getElementById('med-qty-input').value, 10) || 100,
        cost: document.getElementById('med-cost-input').value.trim() || 'Free with Student ID',
        dosage: document.getElementById('med-dosage-input').value.trim() || 'As directed',
        indications: document.getElementById('med-indications-input').value.trim() || 'Treatment',
        requiresPrescription: document.getElementById('med-prescription-check').checked
      };

      await api.createPharmacyItem(item);
      showToast(`Added ${item.name} to SQLite pharmacy database!`);
      medModal.classList.remove('active');
      medForm.reset();
      await loadPharmacy();
      await updateKpiMetrics();
    });
  }
}

// Simple Toast Helper
function showToast(msg) {
  let container = document.getElementById('adm-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'adm-toast-container';
    container.className = 'adm-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'adm-toast';
  toast.textContent = msg;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
