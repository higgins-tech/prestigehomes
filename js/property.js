/* ============================================================
   PRESTIGE HOMES — PROPERTY DETAILS JAVASCRIPT
   ============================================================ */
'use strict';

let property = null;
let currentImageIndex = 0;
let descriptionExpanded = false;

const PROPERTY_DETAIL_TTL = 1000 * 60 * 60 * 24; // 24 hours

/* ─── Init ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  const id = getParam('id');
  if (!id) { window.location.href = 'search.html'; return; }

  // 1. Try cache first — zero API cost, covers the normal click-through flow
  property = Cache.get(`prop_${id}`);

  // 2. Cache miss — fall back to a live API call (direct links, expired cache, etc.)
  if (!property) {
    showLoadingState();
    try {
      property = await fetchPropertyDetail(id);
    } catch (err) {
      console.error('[Property] Detail fetch failed:', err);
      showNotFound(err.userMessage);
      return;
    }
  }

  if (!property) { showNotFound(); return; }

  document.title = `${property.addressLine1 || 'Property'} | Prestige Homes`;

  RecentlyViewed.add({ id: property.id, addressLine1: property.addressLine1, price: property.price, image: property.images?.[0], listingType: property.listingType });

  buildGallery();
  populateHeader();
  populateDescription();
  populateFeatures();
  populateAmenities();
  populateNearby();
  populateSidebar();
  populateAgent();
  populateSimilar();
  updateMortgage();

  setTimeout(initScrollReveal, 100);
});

/* ─── Loading / Not Found States ─────────────────────────── */
function showLoadingState() {
  const page = document.getElementById('property-page');
  if (!page) return;
  page.innerHTML = `
    <div class="empty-state" style="min-height:60vh;">
      <div class="empty-state-icon"><i class="fa-solid fa-spinner fa-spin"></i></div>
      <h2 class="empty-state-title">Loading Property…</h2>
    </div>
  `;
}

function showNotFound(message) {
  document.getElementById('property-page').innerHTML = `
    <div class="empty-state" style="min-height:60vh;">
      <div class="empty-state-icon"><i class="fa-regular fa-building"></i></div>
      <h2 class="empty-state-title">Property Not Found</h2>
      <p class="empty-state-text">${message || 'This listing may have been removed or the link is incorrect.'}</p>
      <a href="search.html" class="btn btn-primary">Browse All Properties</a>
    </div>
  `;
}

/* ─── Detail API Fetch (fallback only — not called on normal click-through) */
async function fetchPropertyDetail(id) {
  if (!ApiTracker.canCall()) {
    const err = new Error('API call limit reached for this session.');
    err.userMessage = 'You have reached the search limit for this session. Please wait a few minutes and try again.';
    throw err;
  }

  const apiKey = CONFIG.REALTY_API_KEY;
  if (!apiKey || apiKey === 'PASTE_YOUR_RAPIDAPI_KEY_HERE') {
    const err = new Error('API key not configured');
    err.userMessage = 'The property service has not been configured. Please contact the administrator.';
    throw err;
  }

  ApiTracker.increment();

  const url = `https://${CONFIG.REALTY_API_HOST}/properties/v3/detail?property_id=${encodeURIComponent(id)}`;

  let res;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': CONFIG.REALTY_API_HOST,
        'x-rapidapi-key': CONFIG.REALTY_API_KEY,
      },
    });
  } catch (networkErr) {
    const err = new Error('Network error');
    err.userMessage = 'Unable to connect to the property service. Please check your connection and try again.';
    throw err;
  }

  if (res.status === 401 || res.status === 403) {
    const err = new Error(`API auth error: ${res.status}`);
    err.userMessage = 'Property service unavailable. Please contact the administrator.';
    throw err;
  }

  if (res.status === 404) {
    const err = new Error('Property not found');
    err.userMessage = 'This property could not be found. It may have been removed.';
    throw err;
  }

  if (res.status === 429) {
    const err = new Error('API rate limited');
    err.userMessage = 'Request limit reached. Please wait a few minutes and try again.';
    throw err;
  }

  if (!res.ok) {
    const err = new Error(`API error: ${res.status}`);
    err.userMessage = `The property service returned an error (${res.status}). Please try again in a moment.`;
    throw err;
  }

  let raw;
  try {
    raw = await res.json();
  } catch {
    const err = new Error('Invalid API response');
    err.userMessage = 'The property service returned an unexpected response.';
    throw err;
  }

  const normalized = normalizePropertyDetail(raw, id);
  if (!normalized) {
    const err = new Error('Empty property payload');
    err.userMessage = 'This property could not be found. It may have been removed.';
    throw err;
  }

  // Cache it so a refresh/revisit doesn't cost another call
  Cache.set(`prop_${normalized.id}`, normalized, PROPERTY_DETAIL_TTL);

  return normalized;
}


function _seededRand(seed, min, max) {
  const hash = String(seed).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const pseudo = Math.abs(Math.sin(hash) * 10000) % 1;
  return Math.floor(pseudo * (max - min + 1)) + min;
}

function _generateFallbacks(id, propType) {
  const type = (propType || '').toLowerCase();
  const seed = String(id);

  let minBeds = 2, maxBeds = 5;
  if (type.includes('condo')) { minBeds = 1; maxBeds = 3; }
  if (type.includes('multi')) { minBeds = 4; maxBeds = 8; }
  if (type.includes('single')) { minBeds = 3; maxBeds = 6; }
  const beds = _seededRand(seed + '_beds', minBeds, maxBeds);
  const baths = _seededRand(seed + '_baths', Math.max(1, beds - 1), beds + 1);

  let baseSqft = 900 + beds * 300;
  if (type.includes('multi')) baseSqft = 2000 + beds * 250;
  const sqft = _seededRand(seed + '_sqft', baseSqft, baseSqft + 800);

  const yearBuilt = _seededRand(seed + '_year', 1925, 2015);

  return { beds, baths, sqft, yearBuilt };
}

/**
 * Returns a display value: uses the real value when available,
 * otherwise falls back to a seeded-generated realistic value.
 */
function resolveDetail(realVal, fallbackVal, formatter) {
  const v = (realVal !== null && realVal !== undefined && realVal !== '') ? realVal : fallbackVal;
  return formatter ? formatter(v) : v;
}

/* ─── Normalize Detail API Response ──────────────────────── */
function normalizePropertyDetail(raw, fallbackId) {
  const l = raw?.listing;
  if (!l) return null;

  const isRent = l.prop_status === 'for_rent' || l.status?.toLowerCase().includes('rent');

  return {
    id: l.property_id || fallbackId,
    formattedAddress: l.address?.line || '',
    addressLine1: l.address?.line || '',
    city: l.address?.city || '',
    state: l.address?.state_code || '',
    zipCode: l.address?.postal_code || '',
    propertyType: l.prop_type || 'Property',
    listingType: isRent ? 'rent' : 'buy',
    price: l.price ?? null,
    bedrooms: l.beds ?? null,
    bathrooms: l.baths ?? null,
    squareFootage: l.sqft || null,
    yearBuilt: l.year_built || null,
    description: l.description || '',
    amenities: [],
    images: (l.photos || []).map(p => p.href).filter(Boolean),
    agent: {
      name: l.agent?.name || l.office?.name || 'Agent',
      phone: l.agent?.phone1?.number || l.office?.phone1?.number || CONFIG.PHONE,
      rating: 4.8,
    },
    featured: false,
    trending: false,
    new: false,
  };
}

/* ─── Gallery ────────────────────────────────────────────── */
function buildGallery() {
  const images = property.images || [];

  const mainImg = document.getElementById('gallery-main-img');
  const thumbsEl = document.getElementById('gallery-thumbs');
  const dotsEl = document.getElementById('gallery-dots');
  const countBtn = document.getElementById('photo-count');

  // Set initial main image
  if (mainImg && images.length > 0) {
    mainImg.src = images[0];
    mainImg.style.opacity = '1';
  }

  // Photo count label
  if (countBtn) {
    countBtn.textContent = `${images.length} Photo${images.length !== 1 ? 's' : ''}`;
  }

  // Thumbnail strip — only show when there are multiple images
  if (thumbsEl) {
    if (images.length > 1) {
      thumbsEl.innerHTML = images.map((src, i) => `
        <div
          class="gallery-thumb${i === 0 ? ' active' : ''}"
          onclick="changeToImage(${i})"
          role="button"
          tabindex="0"
          aria-label="View photo ${i + 1} of ${images.length}"
        >
          <img src="${src}" alt="Property photo ${i + 1}" loading="lazy" />
        </div>
      `).join('');

      // Keyboard support on thumbnails
      thumbsEl.querySelectorAll('.gallery-thumb').forEach((thumb, i) => {
        thumb.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            changeToImage(i);
          }
        });
      });
    } else {
      thumbsEl.innerHTML = ''; // hide strip when only one image
    }
  }

  // Dot indicators — practical up to ~12 images; hide for very large sets
  if (dotsEl) {
    if (images.length > 1 && images.length <= 12) {
      dotsEl.innerHTML = images.map((_, i) => `
        <div
          class="gallery-dot${i === 0 ? ' active' : ''}"
          onclick="changeToImage(${i})"
          role="button"
          tabindex="0"
          aria-label="Photo ${i + 1}"
        ></div>
      `).join('');
    } else {
      dotsEl.innerHTML = '';
    }
  }

  // Update the "X / Y" counter shown on the main image (if you have one)
  _updateImageCounter();

  // Keyboard arrow navigation (only fires when lightbox is NOT open)
  document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('lightbox');
    if (!lb || lb.classList.contains('hidden')) {
      if (e.key === 'ArrowRight') changeImage(1);
      if (e.key === 'ArrowLeft') changeImage(-1);
    } else {
      if (e.key === 'ArrowRight') changeImage(1);
      if (e.key === 'ArrowLeft') changeImage(-1);
      if (e.key === 'Escape') closeLightbox();
    }
  });
}

/* ─── Image Counter Helper ───────────────────────────────── */
function _updateImageCounter() {
  const images = property.images || [];
  const counterEl = document.getElementById('gallery-counter'); // optional element
  if (counterEl) {
    counterEl.textContent = images.length > 0
      ? `${currentImageIndex + 1} / ${images.length}`
      : '';
  }
}

function changeImage(dir) {
  const images = property.images || [];
  if (images.length === 0) return;
  currentImageIndex = (currentImageIndex + dir + images.length) % images.length;
  changeToImage(currentImageIndex);
}

/* ─── Change To Specific Image Index ────────────────────── */
function changeToImage(idx) {
  const images = property.images || [];
  if (images.length === 0) return;

  // Clamp index
  currentImageIndex = ((idx % images.length) + images.length) % images.length;

  const mainImg = document.getElementById('gallery-main-img');
  const lbImg = document.getElementById('lightbox-img');
  const lbEl = document.getElementById('lightbox');

  // Fade-swap main image
  if (mainImg) {
    mainImg.style.opacity = '0';
    mainImg.style.transition = 'opacity 0.15s ease';
    setTimeout(() => {
      mainImg.src = images[currentImageIndex];
      mainImg.style.opacity = '1';
    }, 150);
  }

  // Sync lightbox image if open
  if (lbImg && lbEl && !lbEl.classList.contains('hidden')) {
    lbImg.src = images[currentImageIndex];
  }

  // Sync thumbnails
  document.querySelectorAll('.gallery-thumb').forEach((t, i) => {
    t.classList.toggle('active', i === currentImageIndex);
  });

  // Scroll active thumbnail into view (horizontal strip)
  const activeThumb = document.querySelector('.gallery-thumb.active');
  if (activeThumb) {
    activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  // Sync dots
  document.querySelectorAll('.gallery-dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentImageIndex);
  });

  // Update counter
  _updateImageCounter();
}

function openLightbox(idx) {
  const images = property.images || [];
  if (images.length === 0) return;

  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (!lb || !img) return;

  currentImageIndex = ((idx % images.length) + images.length) % images.length;
  img.src = images[currentImageIndex];
  lb.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeLightbox() {
  document.getElementById('lightbox')?.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

/* ─── Populate Header ────────────────────────────────────── */
function populateHeader() {
  const isRent = property.listingType === 'rent';

  // Generate seeded fallbacks keyed to this property's ID + type
  const fallbacks = _generateFallbacks(property.id, property.propertyType);

  // Resolve each field: use real API value when present, else fallback
  const beds = resolveDetail(property.bedrooms, fallbacks.beds, null);
  const baths = resolveDetail(property.bathrooms, fallbacks.baths, null);
  const sqft = resolveDetail(property.squareFootage, fallbacks.sqft, null);
  const yearBuilt = resolveDetail(property.yearBuilt, fallbacks.yearBuilt, null);

  // Breadcrumb
  const breadcrumb = document.getElementById('breadcrumb-address');
  if (breadcrumb) {
    breadcrumb.textContent = property.addressLine1 || property.formattedAddress || 'Property';
  }

  // Price
  const priceEl = document.getElementById('prop-price');
  if (priceEl) {
    priceEl.innerHTML = `${formatPrice(property.price, property.listingType)}${isRent ? '<span class="property-detail-price-period"> / month</span>' : ''
      }`;
  }

  // Address & location
  const addrEl = document.getElementById('prop-address');
  if (addrEl) addrEl.textContent = property.addressLine1 || property.formattedAddress;

  const locEl = document.getElementById('prop-location');
  if (locEl) {
    locEl.textContent = [
      property.city,
      property.state,
      property.zipCode,
    ].filter(Boolean).join(', ').replace(', ', ', ').trim();
  }

  // Stats — never show "—"
  const bedsEl = document.getElementById('prop-beds');
  if (bedsEl) bedsEl.textContent = beds ?? '—';

  const bathsEl = document.getElementById('prop-baths');
  if (bathsEl) bathsEl.textContent = baths ?? '—';

  const sqftEl = document.getElementById('prop-sqft');
  if (sqftEl) sqftEl.textContent = sqft ? formatNumber(sqft) : '—';

  const yearEl = document.getElementById('prop-year');
  if (yearEl) yearEl.textContent = yearBuilt ?? '—';

  const typeEl = document.getElementById('prop-type');
  if (typeEl) typeEl.textContent = property.propertyType ?? '—';

  // Save button state
  const saveBtn = document.getElementById('save-property-btn');
  if (saveBtn && typeof Saved !== 'undefined' && Saved.isSaved(property.id)) {
    saveBtn.classList.add('saved');
    const icon = saveBtn.querySelector('i');
    if (icon) icon.className = 'fa-solid fa-heart';
  }
}

/* ─── Description ────────────────────────────────────────── */
function populateDescription() {
  const el = document.getElementById('prop-description');
  const btn = document.getElementById('read-more-btn');
  if (!el) return;

  const text = property.description || 'No description available.';
  const SHORT = 280;

  if (text.length > SHORT) {
    el.textContent = text.slice(0, SHORT) + '…';
    el.dataset.full = text;
    el.dataset.short = text.slice(0, SHORT) + '…';
    if (btn) btn.style.display = 'inline-flex';
  } else {
    el.textContent = text;
  }
}

function toggleDescription() {
  const el = document.getElementById('prop-description');
  const btn = document.getElementById('read-more-btn');
  if (!el) return;
  descriptionExpanded = !descriptionExpanded;
  el.textContent = descriptionExpanded ? el.dataset.full : el.dataset.short;
  if (btn) {
    btn.innerHTML = descriptionExpanded
      ? 'Read less <i class="fa-solid fa-chevron-up"></i>'
      : 'Read more <i class="fa-solid fa-chevron-down"></i>';
  }
}

/* ─── Features ───────────────────────────────────────────── */
function populateFeatures() {
  const grid = document.getElementById('features-grid');
  if (!grid) return;

  const features = [
    ['fa-solid fa-bed', `${property.bedrooms ?? '—'} Bedrooms`],
    ['fa-solid fa-shower', `${property.bathrooms ?? '—'} Bathrooms`],
    ['fa-solid fa-ruler-combined', `${property.squareFootage ? formatNumber(property.squareFootage) : '—'} sq ft`],
    ['fa-solid fa-calendar', `Built ${property.yearBuilt ?? '—'}`],
    ['fa-solid fa-building', property.propertyType || '—'],
    ['fa-solid fa-location-dot', property.city || '—'],
    ['fa-solid fa-tag', property.listingType === 'rent' ? 'For Rent' : 'For Sale'],
    ['fa-solid fa-dollar-sign', formatPrice(property.price, property.listingType)],
    ['fa-solid fa-key', 'Available Now'],
  ];

  grid.innerHTML = features.map(([icon, label]) => `
    <div class="feature-item">
      <i class="${icon}" aria-hidden="true"></i>
      <span>${label}</span>
    </div>
  `).join('');
}

/* ─── Amenities ──────────────────────────────────────────── */
function populateAmenities() {
  const container = document.getElementById('amenities-list');
  if (!container) return;

  const amenities = property.amenities?.length
    ? property.amenities
    : ['Parking', 'Security', 'Elevator', 'Intercom', 'Storage'];

  const icons = { 'Pool': 'fa-solid fa-water', 'Gym': 'fa-solid fa-dumbbell', 'Concierge': 'fa-solid fa-bell-concierge', 'Parking': 'fa-solid fa-square-parking', 'Pet-Friendly': 'fa-solid fa-paw', 'Smart Home': 'fa-solid fa-house-signal', 'Rooftop': 'fa-solid fa-building', 'Terrace': 'fa-solid fa-umbrella-beach', 'Waterfront': 'fa-solid fa-anchor', 'Wine Cellar': 'fa-solid fa-wine-glass', 'Home Theater': 'fa-solid fa-film', 'Tennis Court': 'fa-solid fa-table-tennis-paddle-ball', 'Helipad': 'fa-solid fa-helicopter', 'Furnished': 'fa-solid fa-couch', 'Solar': 'fa-solid fa-solar-panel' };

  container.innerHTML = amenities.map(a => `
    <div class="amenity-pill">
      <i class="${icons[a] || 'fa-solid fa-check'}" aria-hidden="true"></i>
      ${a}
    </div>
  `).join('');
}

/* ─── Nearby ─────────────────────────────────────────────── */
function populateNearby() {
  const grid = document.getElementById('nearby-grid');
  if (!grid) return;

  const nearby = [
    { icon: 'fa-solid fa-school', name: `${property.city || 'Local'} Academy`, dist: '0.4 mi away' },
    { icon: 'fa-solid fa-hospital', name: 'Regional Medical Center', dist: '1.2 mi away' },
    { icon: 'fa-solid fa-cart-shopping', name: 'Whole Foods Market', dist: '0.8 mi away' },
    { icon: 'fa-solid fa-train', name: `${property.city || ''} Transit Station`, dist: '0.6 mi away' },
    { icon: 'fa-solid fa-utensils', name: 'Fine Dining District', dist: '0.3 mi away' },
    { icon: 'fa-solid fa-tree', name: `${property.city || ''} Central Park`, dist: '0.5 mi away' },
  ];

  grid.innerHTML = nearby.map(n => `
    <div class="nearby-item">
      <div class="nearby-icon"><i class="${n.icon}" aria-hidden="true"></i></div>
      <div>
        <div class="nearby-name">${n.name}</div>
        <div class="nearby-dist">${n.dist}</div>
      </div>
    </div>
  `).join('');
}

/* ─── Sidebar ────────────────────────────────────────────── */
function populateSidebar() {
  const isRent = property.listingType === 'rent';
  const sidePrice = document.getElementById('sidebar-price');
  const sideType = document.getElementById('sidebar-type');
  const applyBtn = document.getElementById('apply-btn');
  const mcCard = document.getElementById('mortgage-card');

  if (sidePrice) sidePrice.innerHTML = `${formatPrice(property.price, property.listingType)}${isRent ? '<span style="font-size:1rem;font-weight:400;opacity:0.6;"> /mo</span>' : ''}`;
  if (sideType) sideType.textContent = isRent ? 'For Rent' : 'For Sale';

  if (isRent) {
    applyBtn?.style.removeProperty('display');
    if (mcCard) mcCard.style.display = 'none';
  } else {
    if (applyBtn) applyBtn.style.display = 'none';
    updateMortgage();
  }
}

/* ─── Agent ──────────────────────────────────────────────── */
function populateAgent() {
  const agent = property.agent;
  if (!agent) return;

  const initials = agent.name.split(' ').map(w => w[0]).join('').slice(0, 2);
  const avatarEl = document.getElementById('agent-avatar');
  const nameEl = document.getElementById('agent-name');
  const starsEl = document.getElementById('agent-stars');
  const ratingEl = document.getElementById('agent-rating');
  const callBtn = document.getElementById('agent-call-btn');

  if (avatarEl) avatarEl.textContent = initials;
  if (nameEl) nameEl.textContent = agent.name;
  if (ratingEl) ratingEl.textContent = agent.rating;
  if (starsEl) starsEl.innerHTML = renderStars(agent.rating);
}

/* ─── Similar Properties ─────────────────────────────────── */
function populateSimilar() {
  const grid = document.getElementById('similar-grid');
  if (!grid) return;
  // No local dummy dataset to draw "similar" from anymore — leave empty
  // until a "similar properties" search-by-zip call is wired up separately.
  grid.innerHTML = '';
}

/* ─── Mortgage Calculator ────────────────────────────────── */
function updateMortgage() {
  if (!property || property.listingType === 'rent') return;

  const dpPct = Number(document.getElementById('down-payment')?.value || 20);
  const years = Number(document.getElementById('loan-term')?.value || 30);
  const rate = Number(document.getElementById('interest-rate')?.value || 6.8);
  const dpLabel = document.getElementById('dp-label');
  const resultEl = document.getElementById('mortgage-amount');

  if (dpLabel) dpLabel.textContent = `${dpPct}%`;

  const principal = property.price * (1 - dpPct / 100);
  const monthly = calculateMortgage(principal, rate, years);
  if (resultEl) resultEl.textContent = `${formatPrice(monthly)}/mo`;
}

/* ─── Action Handlers ────────────────────────────────────── */
function handleTour() {
  sessionStorage.setItem('tour_property', JSON.stringify({
    id: property.id,
    address: property.addressLine1 || property.formattedAddress,
    price: property.price,
    type: property.propertyType,
    image: property.images?.[0] || '',
    listingType: property.listingType,
  }));
  window.location.href = 'tour.html';
}

function handleApply() {
  sessionStorage.setItem('apply_property', JSON.stringify({
    id: property.id,
    address: property.addressLine1 || property.formattedAddress,
    price: property.price,
    type: property.propertyType,
    image: property.images?.[0] || '',
    listingType: property.listingType,
  }));
  window.location.href = 'apply.html';
}

function handleEmail() {
  window.location.href = `mailto:${CONFIG.CONTACT_EMAIL}?subject=Enquiry: ${encodeURIComponent(property.addressLine1 || property.formattedAddress || 'Property')}&body=Hello,%0A%0AI am interested in the property at ${encodeURIComponent(property.formattedAddress || property.addressLine1 || '')} (ID: ${property.id}).%0A%0APlease contact me at your earliest convenience.%0A%0AThank you.`;
}

function handleSaveProperty() {
  const btn = document.getElementById('save-property-btn');
  const icon = btn?.querySelector('i');
  const isSaved = Saved.toggle(property.id);

  if (icon) icon.className = isSaved ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  btn?.classList.toggle('saved', isSaved);
  Toast[isSaved ? 'gold' : 'info'](isSaved ? 'Property Saved' : 'Removed', isSaved ? 'Added to your saved listings.' : 'Removed from saved listings.');
  updateSavedBadge();
}

function handleShare(platform) {
  const url = window.location.href;
  const text = `Check out this ${property.propertyType} at ${property.addressLine1} on Prestige Homes`;

  if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  else if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  else if (platform === 'copy') copyToClipboard(url, 'Link Copied!', 'Share this property with anyone.');
}