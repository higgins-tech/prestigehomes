/* ============================================================
   PRESTIGE HOMES — SEARCH PAGE JAVASCRIPT
   ============================================================
   Real Realty API only. No dummy data, no fallback properties.

   Search flow:
   1. Page loads → shows a "enter location to search" prompt
   2. User types location and clicks Search (or presses Enter)
   3. API is called with debounce protection
   4. Results render, or a clear error message is shown

   Error states (shown instead of fake data):
   - API key not configured  → "Property service unavailable"
   - API rate-limited / 429  → "Request limit reached…"
   - API any other error     → "Search unavailable…"
   - No results returned     → "No properties found" empty state
   ============================================================ */

'use strict';

/* ─── State ──────────────────────────────────────────────── */
let filteredResults = [];
let currentPage = 1;
const PAGE_SIZE = CONFIG.RESULTS_PER_PAGE;

const activeFilters = {
  type: 'buy',
  query: '',
  minPrice: '',
  maxPrice: '',
  beds: 'any',
  baths: 'any',
  types: [],
  amenities: [],
  sqft: '',
  sort: 'newest',
};

/* ─── Init ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderFilterCheckboxes();
  readURLParams();

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeSearch();
    });
  }

  // If a query came in via URL params, run the search immediately.
  // Otherwise show the prompt state and wait for user input.
  if (activeFilters.query) {
    loadProperties();
  } else {
    showPromptState();
  }
});

/* ─── Render Filter Checkboxes ───────────────────────────── */
function renderFilterCheckboxes() {
  const propTypes = ['Single Family', 'Condo', 'Penthouse', 'Townhouse', 'Villa', 'Estate'];
  const amenities = ['Pool', 'Gym', 'Concierge', 'Parking', 'Pet-Friendly', 'Waterfront', 'Smart Home'];

  const propContainer = document.getElementById('property-type-filters');
  if (propContainer) {
    propContainer.innerHTML = propTypes.map(t => `
      <label class="filter-checkbox">
        <input type="checkbox" value="${t}" class="prop-type-cb"/>
        <span>${t}</span>
      </label>
    `).join('');
  }

  const amenContainer = document.getElementById('amenities-filters');
  if (amenContainer) {
    amenContainer.innerHTML = amenities.map(a => `
      <label class="filter-checkbox">
        <input type="checkbox" value="${a}" class="amenity-cb"/>
        <span>${a}</span>
      </label>
    `).join('');
  }
}

/* ─── Prompt State (before first search) ────────────────── */
function showPromptState() {
  const grid = document.getElementById('results-grid');
  const count = document.getElementById('result-number');
  const lmWrap = document.getElementById('load-more-wrap');
  const empty = document.getElementById('empty-state');

  if (grid) grid.innerHTML = '';
  if (count) count.textContent = '0';
  if (lmWrap) lmWrap.style.display = 'none';
  if (empty) hide(empty);

  const prompt = document.getElementById('search-prompt');
  if (prompt) show(prompt);
}

/* ─── Read URL Params ────────────────────────────────────── */
function readURLParams() {
  const p = getParams();
  if (p.type) { activeFilters.type = p.type; setListingType(p.type, false); }
  if (p.q && /^\d{5}$/.test(p.q)) {
    activeFilters.query = p.q;
    const inp = document.getElementById('search-input');
    if (inp) inp.value = p.q;
  }
  if (p.propertyType) {
    activeFilters.types = [p.propertyType];
    // Check the matching checkbox once DOM is ready
    setTimeout(() => {
      document.querySelectorAll('.prop-type-cb').forEach(cb => {
        if (cb.value === p.propertyType) cb.checked = true;
      });
    }, 0);
  }
  if (p.maxPrice) {
    activeFilters.maxPrice = p.maxPrice;
    const el = document.getElementById('filter-max-price');
    if (el) el.value = p.maxPrice;
  }
}

/* ─── Load Properties (calls real API) ──────────────────── */
async function loadProperties() {
  if (!activeFilters.query.trim()) {
    showPromptState();
    return;
  }

  if (!/^\d{5}$/.test(activeFilters.query.trim())) {
    showServiceError(
      'Invalid search',
      'Please search using a 5-digit ZIP code.'
    );
    return;
  }

  // Check API key before even attempting a request
  const apiKey = CONFIG.REALTY_API_KEY;
  if (!apiKey || apiKey === 'PASTE_YOUR_RAPIDAPI_KEY_HERE') {
    showServiceError(
      'Property service unavailable.',
      'The property search service has not been configured. Please contact the administrator.'
    );
    return;
  }

  showSkeletons('results-grid', 6);
  hide(document.getElementById('search-prompt'));
  hide(document.getElementById('service-error'));

  try {
    const results = await fetchFromRealtyAPI();
    console.log('Normalized results count:', results.length);
    filteredResults = applyClientFilters(results);
    console.log('After client filters:', filteredResults.length);
    currentPage = 1;
    renderResults();
    updateActiveFilterTags();
    updateFilterBadge();
  } catch (err) {
    console.error('[Search] API error:', err);
    showServiceError(
      'Search temporarily unavailable.',
      err.userMessage || 'The property search service encountered an error. Please try again in a moment.'
    );
  }
}

/* ─── Realty API Fetch ───────────────────────────────────── */
async function fetchFromRealtyAPI() {
  const cacheKey = `search_${activeFilters.type}_${activeFilters.query}`;
  const cached = Cache.get(cacheKey);
  if (cached) return cached;

  if (!ApiTracker.canCall()) {
    const err = new Error('API call limit reached for this session.');
    err.userMessage = 'You have reached the search limit for this session. Please wait a few minutes before searching again.';
    throw err;
  }

  ApiTracker.increment();

  const url = `https://${CONFIG.REALTY_API_HOST}/properties/v3/list`;

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': CONFIG.REALTY_API_HOST,
        'x-rapidapi-key': CONFIG.REALTY_API_KEY,
      },
      body: JSON.stringify({
        limit: 20,
        offset: 0,
        postal_code: activeFilters.query,
        status: activeFilters.type === 'rent'
          ? ['for_rent']
          : ['for_sale', 'ready_to_build'],
        sort: { direction: 'desc', field: 'list_date' },
      }),
    });
  } catch (networkErr) {
    const err = new Error('Network error');
    err.userMessage = 'Unable to connect to the property service. Please check your connection and try again.';
    throw err;
  }

  if (res.status === 401 || res.status === 403) {
    const err = new Error(`API auth error: ${res.status}`);
    err.userMessage = 'Property service unavailable. The API key may be invalid. Please contact the administrator.';
    throw err;
  }

  if (res.status === 429) {
    const err = new Error('API rate limited');
    err.userMessage = 'Request limit reached. Please wait a few minutes before searching again.';
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
    console.log('RAW API RESPONSE:', raw);
  } catch {
    const err = new Error('Invalid API response');
    err.userMessage = 'The property service returned an unexpected response. Please try again.';
    throw err;
  }

  const data = normalizeRealtyData(raw);
  Cache.set(cacheKey, data);
  return data;
}

/* ─── Normalize API Response ─────────────────────────────── */
function normalizeRealtyData(raw) {
  const list = raw?.data?.home_search?.results || [];
  const normalized = list.map((p, i) => ({
    id: p.property_id || `prop_${i}_${Date.now()}`,
    formattedAddress: p.location?.address?.line || '',
    addressLine1: p.location?.address?.line || '',
    city: p.location?.address?.city || '',
    state: p.location?.address?.state_code || '',
    zipCode: p.location?.address?.postal_code || '',
    propertyType: p.description?.type || 'Property',
    listingType: activeFilters.type,
    price: p.list_price || p.last_sold_price || null,
    bedrooms: p.description?.beds ?? null,
    bathrooms: p.description?.baths ?? null,
    squareFootage: p.description?.sqft || null,
    yearBuilt: p.description?.year_built || null,
    description: p.description?.text || '',
    amenities: [],
    images: p.primary_photo?.href ? [p.primary_photo.href] : [],
    agent: {
      name: p.advertisers?.[0]?.name || 'Agent',
      phone: p.advertisers?.[0]?.phone || CONFIG.PHONE,
      rating: 4.8
    },
    featured: i < 3,
    trending: false,
    new: p.flags?.is_new_listing || false,
  }));

  // Cache each property individually so the details page can find it by ID
  normalized.forEach(p => Cache.set(`prop_${p.id}`, p));

  return normalized;
}

/* ─── Client-side Filters ────────────────────────────────── */
function applyClientFilters(results) {
  let r = [...results];

  if (activeFilters.minPrice) r = r.filter(p => p.price && p.price >= Number(activeFilters.minPrice));
  if (activeFilters.maxPrice) r = r.filter(p => p.price && p.price <= Number(activeFilters.maxPrice));
  if (activeFilters.beds !== 'any') r = r.filter(p => (p.bedrooms || 0) >= Number(activeFilters.beds));
  if (activeFilters.baths !== 'any') r = r.filter(p => (p.bathrooms || 0) >= Number(activeFilters.baths));
  if (activeFilters.types.length) r = r.filter(p => activeFilters.types.includes(p.propertyType));
  if (activeFilters.sqft) r = r.filter(p => (p.squareFootage || 0) >= Number(activeFilters.sqft));

  return sortArray(r, activeFilters.sort);
}

/* ─── Sort ───────────────────────────────────────────────── */
function sortArray(arr, sort) {
  return [...arr].sort((a, b) => {
    if (sort === 'price-asc') return (a.price || 0) - (b.price || 0);
    if (sort === 'price-desc') return (b.price || 0) - (a.price || 0);
    if (sort === 'beds-desc') return (b.bedrooms || 0) - (a.bedrooms || 0);
    if (sort === 'sqft-desc') return (b.squareFootage || 0) - (a.squareFootage || 0);
    return 0;
  });
}

function sortResults(val) {
  activeFilters.sort = val;
  filteredResults = sortArray(filteredResults, val);
  currentPage = 1;
  renderResults();
}

/* ─── Render Results ─────────────────────────────────────── */
function renderResults() {
  const grid = document.getElementById('results-grid');
  const empty = document.getElementById('empty-state');
  const lmWrap = document.getElementById('load-more-wrap');
  const lmTxt = document.getElementById('load-more-text');
  const count = document.getElementById('result-number');
  const prompt = document.getElementById('search-prompt');
  const errBox = document.getElementById('service-error');

  hide(prompt);
  hide(errBox);

  if (!grid) return;

  if (filteredResults.length === 0) {
    grid.innerHTML = '';
    show(empty);
    hide(lmWrap);
    if (count) count.textContent = '0';
    return;
  }

  hide(empty);
  if (count) count.textContent = filteredResults.length;

  const page = filteredResults.slice(0, currentPage * PAGE_SIZE);
  grid.innerHTML = page.map((p, i) => renderPropertyCard(p, { delay: (i % 6) * 80 })).join('');

  const remaining = filteredResults.length - page.length;
  if (remaining > 0) {
    show(lmWrap);
    if (lmTxt) lmTxt.textContent = `Showing ${page.length} of ${filteredResults.length} properties`;
  } else {
    hide(lmWrap);
  }

  setTimeout(initScrollReveal, 50);
}

/* ─── Service Error State ─────────────────────────────────── */
function showServiceError(title, message) {
  const grid = document.getElementById('results-grid');
  const errBox = document.getElementById('service-error');
  const prompt = document.getElementById('search-prompt');
  const lmWrap = document.getElementById('load-more-wrap');
  const count = document.getElementById('result-number');

  if (grid) grid.innerHTML = '';
  if (count) count.textContent = '0';
  hide(lmWrap);
  hide(prompt);
  hide(document.getElementById('empty-state'));

  if (errBox) {
    errBox.querySelector('.service-error-title').textContent = title;
    errBox.querySelector('.service-error-msg').textContent = message;
    show(errBox);
  }
}

/* ─── Execute Search ─────────────────────────────────────── */
function executeSearch() {
  const val = document.getElementById('search-input')?.value?.trim() || '';
  if (!val) {
    Toast.warning('Location Required', 'Please enter a city, ZIP code, or address to search.');
    document.getElementById('search-input')?.focus();
    return;
  }
  if (!/^\d{5}$/.test(val)) {
    Toast.warning('ZIP Code Required', 'Please enter a valid 5-digit ZIP code (e.g. 90004).');
    document.getElementById('search-input')?.focus();
    return;
  }
  activeFilters.query = val;
  setParams({ q: val, type: activeFilters.type }, true);
  loadProperties();
}

/* ─── Apply Filters (re-runs client-side sort/filter on cached data) */
function applyFilters() {
  // Read current filter UI state
  const minP = document.getElementById('filter-min-price')?.value || '';
  const maxP = document.getElementById('filter-max-price')?.value || '';
  const sqft = document.getElementById('filter-sqft')?.value || '';

  activeFilters.minPrice = minP;
  activeFilters.maxPrice = maxP;
  activeFilters.sqft = sqft;

  // If we have a query, reload from cache / API
  if (activeFilters.query) {
    loadProperties();
  }
}

/* ─── Load More ──────────────────────────────────────────── */
function loadMoreResults() {
  currentPage++;
  const btn = document.getElementById('load-more-btn');
  if (btn) { btn.classList.add('loading'); btn.disabled = true; }
  setTimeout(() => {
    renderResults();
    if (btn) { btn.classList.remove('loading'); btn.disabled = false; }
  }, 400);
}

/* ─── Listing Type Toggle ────────────────────────────────── */
function setListingType(type, reapply = true) {
  activeFilters.type = type;
  document.getElementById('type-buy')?.classList.toggle('active', type === 'buy');
  document.getElementById('type-rent')?.classList.toggle('active', type === 'rent');
  document.getElementById('type-buy')?.setAttribute('aria-pressed', String(type === 'buy'));
  document.getElementById('type-rent')?.setAttribute('aria-pressed', String(type === 'rent'));
  if (reapply && activeFilters.query) loadProperties();
}

/* ─── Filter Helpers ─────────────────────────────────────── */
function setFilter(filterName, val, btn) {
  if (filterName === 'beds') activeFilters.beds = val;
  if (filterName === 'baths') activeFilters.baths = val;
  const stepperId = filterName === 'beds' ? 'bed-stepper' : 'bath-stepper';
  document.querySelectorAll(`#${stepperId} .stepper-btn`).forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (activeFilters.query) loadProperties();
}

function clearAllFilters() {
  activeFilters.minPrice = '';
  activeFilters.maxPrice = '';
  activeFilters.beds = 'any';
  activeFilters.baths = 'any';
  activeFilters.types = [];
  activeFilters.amenities = [];
  activeFilters.sqft = '';

  const fields = ['filter-min-price', 'filter-max-price', 'filter-sqft'];
  fields.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.querySelectorAll('.prop-type-cb, .amenity-cb').forEach(cb => { cb.checked = false; });
  document.querySelectorAll('#bed-stepper .stepper-btn, #bath-stepper .stepper-btn').forEach((b, i) => {
    b.classList.toggle('active', i === 0);
  });

  if (activeFilters.query) {
    loadProperties();
    Toast.info('Filters Cleared', 'Showing all results for your search.');
  }
  updateFilterBadge();
}

/* ─── Active Filter Tags ─────────────────────────────────── */
function updateActiveFilterTags() {
  const container = document.getElementById('active-filters');
  if (!container) return;
  const tags = [];
  if (activeFilters.minPrice) tags.push({ label: `Min $${formatNumber(+activeFilters.minPrice)}`, clear: () => { activeFilters.minPrice = ''; const e = document.getElementById('filter-min-price'); if (e) e.value = ''; loadProperties(); } });
  if (activeFilters.maxPrice) tags.push({ label: `Max $${formatNumber(+activeFilters.maxPrice)}`, clear: () => { activeFilters.maxPrice = ''; const e = document.getElementById('filter-max-price'); if (e) e.value = ''; loadProperties(); } });
  if (activeFilters.beds !== 'any') tags.push({ label: `${activeFilters.beds}+ Beds`, clear: () => { activeFilters.beds = 'any'; document.querySelectorAll('#bed-stepper .stepper-btn').forEach((b, i) => b.classList.toggle('active', i === 0)); loadProperties(); } });
  if (activeFilters.baths !== 'any') tags.push({ label: `${activeFilters.baths}+ Baths`, clear: () => { activeFilters.baths = 'any'; document.querySelectorAll('#bath-stepper .stepper-btn').forEach((b, i) => b.classList.toggle('active', i === 0)); loadProperties(); } });
  activeFilters.types.forEach(t => tags.push({ label: t, clear: () => { activeFilters.types = activeFilters.types.filter(x => x !== t); document.querySelectorAll('.prop-type-cb').forEach(cb => { if (cb.value === t) cb.checked = false; }); loadProperties(); } }));
  container.innerHTML = tags.map((tag, i) => `
    <button class="active-filter-tag" onclick="filterTagClear(${i})" aria-label="Remove filter: ${tag.label}">
      ${tag.label} <i class="fa-solid fa-xmark" aria-hidden="true"></i>
    </button>
  `).join('');
  window._filterTagClears = tags.map(t => t.clear);
}

function filterTagClear(i) {
  if (window._filterTagClears?.[i]) window._filterTagClears[i]();
}

document.addEventListener('change', (e) => {
  if (e.target.classList.contains('prop-type-cb')) {
    if (e.target.checked) { if (!activeFilters.types.includes(e.target.value)) activeFilters.types.push(e.target.value); }
    else activeFilters.types = activeFilters.types.filter(t => t !== e.target.value);
    if (activeFilters.query) loadProperties();
  }
  if (e.target.classList.contains('amenity-cb')) {
    if (e.target.checked) { if (!activeFilters.amenities.includes(e.target.value)) activeFilters.amenities.push(e.target.value); }
    else activeFilters.amenities = activeFilters.amenities.filter(a => a !== e.target.value);
    if (activeFilters.query) loadProperties();
  }
});

/* ─── Filter Badge Count ─────────────────────────────────── */
function updateFilterBadge() {
  let count = 0;
  if (activeFilters.minPrice) count++;
  if (activeFilters.maxPrice) count++;
  if (activeFilters.beds !== 'any') count++;
  if (activeFilters.baths !== 'any') count++;
  count += activeFilters.types.length + activeFilters.amenities.length;
  if (activeFilters.sqft) count++;
  const badge = document.getElementById('filter-count-badge');
  if (!badge) return;
  badge.textContent = count;
  count > 0 ? show(badge) : hide(badge);
}

/* ─── Toggle Sidebar ─────────────────────────────────────── */
function toggleFilters() {
  const layout = document.getElementById('search-layout');
  const sidebar = document.getElementById('filters-sidebar');
  const btn = document.getElementById('filter-toggle-btn');
  const isHidden = layout?.classList.toggle('sidebar-hidden');
  sidebar?.classList.toggle('hidden', isHidden);
  btn?.classList.toggle('active', !isHidden);
  btn?.setAttribute('aria-expanded', String(!isHidden));
}
