// SQLite Database Live Inspector Module
import { api } from '../api/client.js';

export function initDbInspector() {
  const openBtn = document.getElementById('open-db-inspector-btn');
  const footerBtn = document.getElementById('footer-open-db-inspector');
  const modal = document.getElementById('db-inspector-modal');
  const closeBtn = document.getElementById('close-db-inspector-modal');
  const refreshBtn = document.getElementById('refresh-db-inspector-btn');

  const openInspector = () => {
    loadDbData();
    modal.classList.add('active');
  };

  if (openBtn && modal) openBtn.addEventListener('click', openInspector);
  if (footerBtn && modal) {
    footerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openInspector();
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => loadDbData());
  }

  // Periodic check of database connection status
  checkDbStatus();
}

async function checkDbStatus() {
  const dot = document.querySelector('.db-dot');
  const statusPill = document.getElementById('open-db-inspector-btn');
  try {
    const status = await api.getStatus();
    if (status && status.status === 'online') {
      if (dot) dot.style.background = '#10b981';
      if (statusPill) statusPill.title = `Connected to SQLite (${status.databaseFile})`;
    } else {
      if (dot) dot.style.background = '#f59e0b';
    }
  } catch (e) {
    if (dot) dot.style.background = '#f59e0b';
  }
}

async function loadDbData() {
  const statusContainer = document.getElementById('db-status-summary');
  const tablesContainer = document.getElementById('db-tables-list');
  const recordsContainer = document.getElementById('db-records-preview');

  if (statusContainer) statusContainer.innerHTML = '<p>Loading live database metadata...</p>';

  try {
    const status = await api.getStatus();
    const viewer = await api.getDatabaseViewer();

    if (statusContainer) {
      statusContainer.innerHTML = `
        <div class="db-meta-grid">
          <div class="db-meta-item">
            <span class="db-meta-label">Engine</span>
            <strong class="db-meta-val">${status.database || 'SQLite 3'}</strong>
          </div>
          <div class="db-meta-item">
            <span class="db-meta-label">Database File</span>
            <strong class="db-meta-val">${status.databaseFile || 'database/campus_health.sqlite'}</strong>
          </div>
          <div class="db-meta-item">
            <span class="db-meta-label">Connection Status</span>
            <strong class="db-meta-val" style="color: #10b981;">● Online & Synchronized</strong>
          </div>
        </div>
      `;
    }

    if (tablesContainer && status.tables) {
      const tableNames = Object.keys(status.tables);
      tablesContainer.innerHTML = `
        <div class="db-tables-chips">
          ${tableNames.map((tbl, idx) => `
            <button type="button" class="db-table-chip ${idx === 0 ? 'active' : ''}" data-table="${tbl}">
              🗄️ <strong>${tbl}</strong> (${status.tables[tbl]} rows)
            </button>
          `).join('')}
        </div>
      `;

      // Table chip clicks
      tablesContainer.querySelectorAll('.db-table-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          tablesContainer.querySelectorAll('.db-table-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          const selectedTable = chip.getAttribute('data-table');
          renderTableRows(selectedTable, viewer ? viewer.data[selectedTable] : []);
        });
      });

      // Render first table
      if (tableNames.length > 0 && viewer && viewer.data) {
        renderTableRows(tableNames[0], viewer.data[tableNames[0]] || []);
      }
    }
  } catch (err) {
    if (statusContainer) {
      statusContainer.innerHTML = `<p style="color: #ef4444;">Error connecting to SQLite server: ${err.message}</p>`;
    }
  }
}

function renderTableRows(tableName, rows) {
  const container = document.getElementById('db-records-preview');
  if (!container) return;

  if (!rows || rows.length === 0) {
    container.innerHTML = `
      <div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">
        Table <code>${tableName}</code> is currently empty.
      </div>
    `;
    return;
  }

  const columns = Object.keys(rows[0]);

  container.innerHTML = `
    <div style="margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
      <h4>Live Data in <code>${tableName}</code></h4>
      <span style="font-size: 0.8rem; color: var(--text-muted);">${rows.length} rows loaded from SQLite</span>
    </div>
    <div class="db-table-scroll-wrap">
      <table class="db-preview-table">
        <thead>
          <tr>
            ${columns.map(col => `<th>${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${columns.map(col => {
                let val = row[col];
                if (typeof val === 'string' && val.length > 45) {
                  val = val.slice(0, 42) + '...';
                }
                return `<td>${val !== null && val !== undefined ? val : '<em>null</em>'}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
