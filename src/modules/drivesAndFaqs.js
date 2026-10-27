// Health Drives, FAQs and Global Search Module
import { campusFAQs, healthDrives } from '../data/faqs.js';
import { healthcareProfessionals } from '../data/professionals.js';
import { pharmacyInventory } from '../data/pharmacy.js';
import { showToast } from './appointments.js';

export function initDrivesAndFaqs() {
  renderFaqs();
  renderHealthDrives();
  setupGlobalSearch();
}

function renderFaqs() {
  const container = document.getElementById('faqs-accordion-container');
  if (!container) return;

  container.innerHTML = campusFAQs.map((faq, index) => `
    <div class="faq-item ${index === 0 ? 'open' : ''}">
      <button type="button" class="faq-question-btn" aria-expanded="${index === 0 ? 'true' : 'false'}">
        <span class="faq-q-text">${faq.question}</span>
        <span class="faq-chevron">▾</span>
      </button>
      <div class="faq-answer-collapse">
        <p class="faq-answer-text">${faq.answer}</p>
        <span class="faq-tag">${faq.category}</span>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.faq-question-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.parentElement;
      const isOpen = parent.classList.contains('open');

      // Close all others
      container.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('open');
        item.querySelector('.faq-question-btn').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        parent.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

function renderHealthDrives() {
  const container = document.getElementById('health-drives-grid');
  if (!container) return;

  container.innerHTML = healthDrives.map(drive => {
    const isRegistered = localStorage.getItem(`drive_rsvp_${drive.id}`) === 'true';

    return `
      <div class="drive-card">
        <div class="drive-header">
          <span class="drive-badge">${drive.badge}</span>
          <span class="drive-counter">👥 ${drive.registeredCount} / ${drive.targetCount} Joined</span>
        </div>
        <h3 class="drive-title">${drive.title}</h3>
        <p class="drive-partner">🤝 ${drive.partner}</p>
        <div class="drive-details">
          <div class="drive-meta-row"><span>🗓 ${drive.date}</span></div>
          <div class="drive-meta-row"><span>📍 ${drive.venue}</span></div>
          <div class="drive-meta-row perk"><span>🎁 <strong>Perk:</strong> ${drive.perk}</span></div>
        </div>
        <div class="drive-action">
          <button type="button" class="btn ${isRegistered ? 'btn-secondary' : 'btn-primary'} btn-sm rsvp-drive-btn" data-drive-id="${drive.id}">
            ${isRegistered ? '✓ Registered (Slot Reserved)' : 'RSVP Free Registration'}
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.rsvp-drive-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const driveId = btn.getAttribute('data-drive-id');
      const isRegistered = localStorage.getItem(`drive_rsvp_${driveId}`) === 'true';

      if (isRegistered) {
        localStorage.removeItem(`drive_rsvp_${driveId}`);
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
        btn.textContent = 'RSVP Free Registration';
        showToast('Registration cancelled.', 'info');
      } else {
        localStorage.setItem(`drive_rsvp_${driveId}`, 'true');
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
        btn.textContent = '✓ Registered (Slot Reserved)';
        showToast('You are officially registered! Reminder added to your student profile.', 'success');
      }
    });
  });
}

function setupGlobalSearch() {
  const globalInput = document.getElementById('global-hero-search-input');
  const searchResultsModal = document.getElementById('global-search-results-modal');
  const searchResultsList = document.getElementById('global-search-results-list');
  const closeBtn = document.getElementById('close-global-search-modal');

  if (!globalInput) return;

  globalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = globalInput.value.trim().toLowerCase();
      if (!query) return;

      executeGlobalSearch(query);
    }
  });

  const searchSubmitBtn = document.getElementById('global-hero-search-submit');
  if (searchSubmitBtn) {
    searchSubmitBtn.addEventListener('click', () => {
      const query = globalInput.value.trim().toLowerCase();
      if (query) executeGlobalSearch(query);
    });
  }

  // Quick tag chips in hero
  document.querySelectorAll('.hero-quick-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const keyword = tag.getAttribute('data-tag');
      if (globalInput) globalInput.value = keyword;
      executeGlobalSearch(keyword);
    });
  });

  if (closeBtn && searchResultsModal) {
    closeBtn.addEventListener('click', () => {
      searchResultsModal.classList.remove('active');
    });
  }

  function executeGlobalSearch(term) {
    if (!searchResultsModal || !searchResultsList) return;

    // Search doctors, pharmacy, FAQs
    const results = [];

    // Check doctors
    healthcareProfessionals.forEach(doc => {
      if (doc.name.toLowerCase().includes(term) || doc.department.toLowerCase().includes(term) || doc.specialties.some(s => s.toLowerCase().includes(term))) {
        results.push({
          type: 'Healthcare Professional',
          title: doc.name,
          sub: `${doc.title} • ${doc.room}`,
          action: `#professionals`,
          icon: '🩺'
        });
      }
    });

    // Check pharmacy
    pharmacyInventory.forEach(med => {
      if (med.name.toLowerCase().includes(term) || med.indications.toLowerCase().includes(term) || med.category.toLowerCase().includes(term)) {
        results.push({
          type: 'Dispensary Item',
          title: med.name,
          sub: `${med.category} • ${med.stockStatus} (${med.cost})`,
          action: `#pharmacy`,
          icon: '💊'
        });
      }
    });

    // Check FAQs
    campusFAQs.forEach(faq => {
      if (faq.question.toLowerCase().includes(term) || faq.answer.toLowerCase().includes(term)) {
        results.push({
          type: 'Campus Health Guide',
          title: faq.question,
          sub: faq.answer.slice(0, 95) + '...',
          action: `#faqs`,
          icon: 'ℹ️'
        });
      }
    });

    renderSearchResults(term, results);
  }

  function renderSearchResults(term, results) {
    const title = document.getElementById('search-modal-title');
    if (title) title.textContent = `Search Results for "${term}" (${results.length} found)`;

    if (results.length === 0) {
      searchResultsList.innerHTML = `
        <div class="empty-state">
          <p>No direct records matched "<strong>${term}</strong>".</p>
          <p class="empty-sub">For urgent assistance, walk into Health Center Block C or click the Emergency SOS button.</p>
        </div>
      `;
    } else {
      searchResultsList.innerHTML = results.map(item => `
        <a href="${item.action}" class="search-result-item" onclick="document.getElementById('global-search-results-modal').classList.remove('active');">
          <span class="res-icon">${item.icon}</span>
          <div class="res-info">
            <span class="res-type">${item.type}</span>
            <strong class="res-title">${item.title}</strong>
            <p class="res-sub">${item.sub}</p>
          </div>
          <span class="res-arrow">→</span>
        </a>
      `).join('');
    }

    searchResultsModal.classList.add('active');
  }
}
