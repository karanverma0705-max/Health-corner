// Interactive Campus Medical Map & AED Locator Module
import { campusHotspots } from '../data/emergencyContacts.js';
import { showToast } from './appointments.js';

export function initCampusMap() {
  renderMapHotspots('all');
  setupMapFilterButtons();
}

function renderMapHotspots(filter = 'all') {
  const mapOverlay = document.getElementById('campus-map-interactive-layer');
  if (!mapOverlay) return;

  const filteredSpots = campusHotspots.filter(spot => {
    if (filter === 'aed') return spot.aedAvailable;
    if (filter === 'kiosk') return spot.firstAidKiosk;
    if (filter === 'clinic') return spot.type.includes('Clinic') || spot.type.includes('Rehab');
    return true;
  });

  mapOverlay.innerHTML = filteredSpots.map(spot => {
    let icon = '📍';
    let iconClass = 'standard';
    if (spot.id === 'loc-health-center') {
      icon = '🏥';
      iconClass = 'hospital';
    } else if (spot.aedAvailable) {
      icon = '⚡';
      iconClass = 'aed';
    } else if (spot.firstAidKiosk) {
      icon = '🩹';
      iconClass = 'kiosk';
    }

    return `
      <button type="button" class="map-pin ${iconClass}" 
        style="left: ${spot.coordinates.x}%; top: ${spot.coordinates.y}%;"
        data-spot-id="${spot.id}"
        title="${spot.name}">
        <span class="pin-icon">${icon}</span>
        <span class="pin-pulse"></span>
        <span class="pin-tooltip">${spot.name}</span>
      </button>
    `;
  }).join('');

  // Attach click listeners to map pins
  mapOverlay.querySelectorAll('.map-pin').forEach(pin => {
    pin.addEventListener('click', () => {
      mapOverlay.querySelectorAll('.map-pin').forEach(p => p.classList.remove('selected'));
      pin.classList.add('selected');
      const id = pin.getAttribute('data-spot-id');
      const spot = campusHotspots.find(s => s.id === id);
      if (spot) displaySpotDetails(spot);
    });
  });

  // Default display first spot (Health Center)
  if (filteredSpots.length > 0) {
    displaySpotDetails(filteredSpots[0]);
  }
}

function displaySpotDetails(spot) {
  const panel = document.getElementById('map-spot-details-panel');
  if (!panel) return;

  panel.innerHTML = `
    <div class="spot-card">
      <div class="spot-card-badge-row">
        <span class="spot-type-badge">${spot.type}</span>
        <span class="spot-hours">⏰ ${spot.hours}</span>
      </div>
      <h3 class="spot-title">${spot.name}</h3>
      <p class="spot-building">🏢 <strong>${spot.building}</strong> • ${spot.floor}</p>
      
      <div class="spot-features-list">
        <div class="spot-feat ${spot.aedAvailable ? 'active' : 'inactive'}">
          ${spot.aedAvailable ? '⚡ Automated External Defibrillator (AED) Ready' : '— No AED Unit'}
        </div>
        <div class="spot-feat ${spot.firstAidKiosk ? 'active' : 'inactive'}">
          ${spot.firstAidKiosk ? '🩹 First Aid & Trauma Kit On-Site' : '— Basic supplies only'}
        </div>
        <div class="spot-feat active">
          📶 Emergency Blue Light Phone Connection
        </div>
      </div>

      <div class="spot-actions-row">
        <button type="button" class="btn btn-primary btn-sm" id="map-get-directions-btn">
          🗺 Get Walking Directions
        </button>
        <a href="tel:5550190911" class="btn btn-secondary btn-sm">
          📞 Dispatch to this Location
        </a>
      </div>
    </div>
  `;

  const dirBtn = document.getElementById('map-get-directions-btn');
  if (dirBtn) {
    dirBtn.addEventListener('click', () => {
      showToast(`Walking route to ${spot.name}: ~3-4 mins via Central Quad Walkway.`, 'info');
    });
  }
}

function setupMapFilterButtons() {
  const filterBtns = document.querySelectorAll('.map-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-map-filter');
      renderMapHotspots(filter);
    });
  });
}
