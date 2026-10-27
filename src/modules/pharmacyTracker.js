// Campus Pharmacy & First-Aid Inventory Tracker Module
import { pharmacyInventory, dispensaryHours } from '../data/pharmacy.js';
import { api } from '../api/client.js';
import { showToast } from './appointments.js';

export function initPharmacyTracker() {
  renderPharmacyInventory('all', '');
  setupPharmacyFilters();
  setupTokenGenerator();
}

async function renderPharmacyInventory(category = 'all', searchQuery = '') {
  const container = document.getElementById('pharmacy-items-grid');
  if (!container) return;

  let filtered = [];
  try {
    filtered = await api.getPharmacyInventory(category, searchQuery);
  } catch (e) {
    const query = searchQuery.trim().toLowerCase();
    filtered = pharmacyInventory.filter(item => {
      const matchesCat = category === 'all' || item.category.toLowerCase().includes(category.toLowerCase());
      const matchesQuery = query === '' || 
        item.name.toLowerCase().includes(query) ||
        item.indications.toLowerCase().includes(query);
      return matchesCat && matchesQuery;
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-pharmacy-state">
        <span class="empty-icon">💊</span>
        <p>No medicines or first-aid supplies found matching "<strong>${searchQuery}</strong>".</p>
        <p class="empty-sub">If this is urgent, please visit the 24/7 Urgent Care Triage at Block C Gate 2.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="med-item-card" data-id="${item.id}">
      <div class="med-header">
        <span class="med-category-pill">${item.category}</span>
        <span class="med-stock-badge ${item.stockStatus === 'In Stock' ? 'in-stock' : 'low-stock'}">
          ${item.stockStatus} (${item.stockQuantity} units)
        </span>
      </div>
      <h3 class="med-name">${item.name}</h3>
      <p class="med-indications">🎯 <strong>For:</strong> ${item.indications}</p>
      <div class="med-meta-box">
        <div class="med-meta-row">
          <span class="meta-label">Dosage:</span>
          <span class="meta-val">${item.dosage}</span>
        </div>
        <div class="med-meta-row">
          <span class="meta-label">Cost:</span>
          <span class="meta-val highlight-free">${item.cost}</span>
        </div>
        <div class="med-meta-row">
          <span class="meta-label">Access:</span>
          <span class="meta-val">${item.requiresPrescription ? '🩺 Needs Clinic Prescription' : '🟢 OTC Direct Dispense'}</span>
        </div>
      </div>
      <div class="med-actions">
        <button class="btn btn-secondary btn-sm generate-token-btn" data-med-name="${item.name}" data-med-cost="${item.cost}">
          🎫 Generate Fast Pickup Token
        </button>
      </div>
    </div>
  `).join('');

  // Bind token button events
  container.querySelectorAll('.generate-token-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const medName = btn.getAttribute('data-med-name');
      const medCost = btn.getAttribute('data-med-cost');
      openPickupTokenModal(medName, medCost);
    });
  });
}

function setupPharmacyFilters() {
  const searchInput = document.getElementById('pharmacy-search-input');
  const catButtons = document.querySelectorAll('.pharmacy-filter-chip');

  let currentCategory = 'all';

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderPharmacyInventory(currentCategory, e.target.value);
    });
  }

  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category');
      const query = searchInput ? searchInput.value : '';
      renderPharmacyInventory(currentCategory, query);
    });
  });
}

function setupTokenGenerator() {
  const modal = document.getElementById('pharmacy-token-modal');
  const closeBtn = document.getElementById('close-pharmacy-token-modal');
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }
}

async function openPickupTokenModal(medName, cost) {
  const modal = document.getElementById('pharmacy-token-modal');
  const tokenDisplay = document.getElementById('dispensary-token-code');
  const tokenMedName = document.getElementById('token-med-name');
  const tokenTimestamp = document.getElementById('token-validity-time');

  if (!modal) return;

  let tokenCode = `DISP-${Math.floor(1000 + Math.random() * 9000)}`;
  try {
    const res = await api.createDispensaryToken(medName, 'U-88419');
    if (res && res.token) tokenCode = res.token;
  } catch (e) {}

  if (tokenDisplay) tokenDisplay.textContent = tokenCode;
  if (tokenMedName) tokenMedName.textContent = medName;
  if (tokenTimestamp) {
    const validUntil = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours valid
    tokenTimestamp.textContent = `Valid until ${validUntil.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  modal.classList.add('active');
  showToast(`Token ${tokenCode} generated! Show this at the dispensary window.`, 'success');
}
