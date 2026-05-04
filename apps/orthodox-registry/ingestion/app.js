// Global variables
let map;
let markers = [];
let parishesData = [];
let markerClusterGroup;

// Initialize the application
async function init() {
    try {
        // Load enhanced parish data
        const response = await fetch('rocor_parishes_detailed.json');
        parishesData = await response.json();

        // Initialize map
        initMap();

        // Populate filters
        populateFilters();

        // Display all parishes
        displayParishes(parishesData);

        // Setup event listeners
        setupEventListeners();

    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading parish data. Please make sure rocor_parishes.json is in the same directory.');
    }
}

// Initialize Leaflet map
function initMap() {
    map = L.map('map').setView([20, 0], 2);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
}

// Populate country and state filters
function populateFilters() {
    const countries = [...new Set(parishesData.map(p => p.country))].sort();
    const states = [...new Set(parishesData.filter(p => p.state).map(p => p.state))].sort();

    const countrySelect = document.getElementById('countryFilter');
    const stateSelect = document.getElementById('stateFilter');

    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });

    states.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });
}

// Display parishes on map and in list
function displayParishes(parishes) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Update count
    document.getElementById('parishCount').textContent = parishes.length;

    // Add markers to map
    parishes.forEach(parish => {
        const marker = L.marker([parish.latitude, parish.longitude])
            .addTo(map)
            .bindPopup(createPopupContent(parish));

        marker.parishData = parish;

        // Click event to highlight parish in list
        marker.on('click', () => {
            highlightParish(parish.uid);
        });

        markers.push(marker);
    });

    // Fit map to show all markers
    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }

    // Display parish list
    displayParishList(parishes);
}

// Create popup content for map markers
function createPopupContent(parish) {
    const location = [parish.city, parish.state, parish.country]
        .filter(Boolean)
        .join(', ');

    let html = `
        <div class="parish-popup">
            <div class="popup-name">${parish.name}</div>
            <div class="popup-location">${location}</div>
    `;

    // Add organization/diocese if available
    if (parish.organization) {
        html += `<div class="popup-org">${parish.organization}</div>`;
    }

    // Add clergy if available
    if (parish.clergy && parish.clergy.length > 0) {
        html += `<div class="popup-clergy">`;
        parish.clergy.forEach(c => {
            const role = c.role ? ` - ${c.role}` : '';
            html += `<div>${c.name}${role}</div>`;
        });
        html += `</div>`;
    }

    // Add contact info if available
    if (parish.contact) {
        html += `<div class="popup-contact">`;
        if (parish.contact.phone) {
            html += `<div>📞 ${parish.contact.phone}</div>`;
        }
        if (parish.contact.email) {
            html += `<div>📧 <a href="mailto:${parish.contact.email}">${parish.contact.email}</a></div>`;
        }
        if (parish.contact.website) {
            html += `<div>🌐 <a href="${parish.contact.website}" target="_blank">Website</a></div>`;
        }
        html += `</div>`;
    }

    // Add service languages if available
    if (parish.additional_info && parish.additional_info.service_languages) {
        html += `<div class="popup-languages">Languages: ${parish.additional_info.service_languages}</div>`;
    }

    html += `<a href="${parish.detail_url || parish.url}" target="_blank" class="popup-link">Full Details →</a>`;
    html += `</div>`;

    return html;
}

// Display parish list
function displayParishList(parishes) {
    const container = document.getElementById('parishListContainer');
    container.innerHTML = '';

    parishes.forEach(parish => {
        const item = document.createElement('div');
        item.className = 'parish-item';
        item.dataset.uid = parish.uid;

        const location = [parish.city, parish.state, parish.country]
            .filter(Boolean)
            .join(', ');

        let html = `
            <div class="parish-name">${parish.name}</div>
            <div class="parish-location">${location}</div>
        `;

        // Add organization/diocese
        if (parish.organization) {
            html += `<div class="parish-org">${parish.organization}</div>`;
        }

        // Add clergy
        if (parish.clergy && parish.clergy.length > 0) {
            const primaryClergy = parish.clergy[0];
            const role = primaryClergy.role ? ` - ${primaryClergy.role}` : '';
            html += `<div class="parish-clergy">${primaryClergy.name}${role}</div>`;

            if (parish.clergy.length > 1) {
                html += `<div class="parish-clergy-more">+${parish.clergy.length - 1} more</div>`;
            }
        }

        // Add contact info
        if (parish.contact) {
            html += `<div class="parish-contact-icons">`;
            if (parish.contact.phone) html += `<span title="${parish.contact.phone}">📞</span>`;
            if (parish.contact.email) html += `<span title="${parish.contact.email}">📧</span>`;
            if (parish.contact.website) html += `<span title="Website">🌐</span>`;
            html += `</div>`;
        }

        // Add service languages badge
        if (parish.additional_info && parish.additional_info.service_languages) {
            html += `<div class="parish-languages">${parish.additional_info.service_languages}</div>`;
        }

        html += `<a href="${parish.detail_url || parish.url}" target="_blank" class="parish-link" onclick="event.stopPropagation()">View Details →</a>`;

        item.innerHTML = html;

        item.addEventListener('click', () => {
            // Find and open the corresponding marker
            const marker = markers.find(m => m.parishData.uid === parish.uid);
            if (marker) {
                map.setView(marker.getLatLng(), 12);
                marker.openPopup();
                highlightParish(parish.uid);
            }
        });

        container.appendChild(item);
    });
}

// Highlight parish in list
function highlightParish(uid) {
    // Remove previous highlights
    document.querySelectorAll('.parish-item').forEach(item => {
        item.classList.remove('active');
    });

    // Add highlight to selected parish
    const item = document.querySelector(`.parish-item[data-uid="${uid}"]`);
    if (item) {
        item.classList.add('active');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Filter parishes based on search and filters
function filterParishes() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const countryFilter = document.getElementById('countryFilter').value;
    const stateFilter = document.getElementById('stateFilter').value;

    const filtered = parishesData.filter(parish => {
        // Search filter
        const matchesSearch = !searchTerm ||
            parish.name.toLowerCase().includes(searchTerm) ||
            (parish.city && parish.city.toLowerCase().includes(searchTerm)) ||
            (parish.state && parish.state.toLowerCase().includes(searchTerm)) ||
            parish.country.toLowerCase().includes(searchTerm);

        // Country filter
        const matchesCountry = !countryFilter || parish.country === countryFilter;

        // State filter
        const matchesState = !stateFilter || parish.state === stateFilter;

        return matchesSearch && matchesCountry && matchesState;
    });

    displayParishes(filtered);
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', filterParishes);
    document.getElementById('countryFilter').addEventListener('change', filterParishes);
    document.getElementById('stateFilter').addEventListener('change', filterParishes);

    document.getElementById('resetBtn').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('countryFilter').value = '';
        document.getElementById('stateFilter').value = '';
        filterParishes();
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
