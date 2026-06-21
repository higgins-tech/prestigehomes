/* ============================================================
   PRESTIGE HOMES — UTILITY FUNCTIONS
   ============================================================
   This file provides the core JavaScript toolkit used by
   every other script on the site. Load it SECOND, after
   config.js and before everything else.

   Contents:
   - Toast notification system
   - LocalStorage caching helpers
   - Currency and number formatters
   - Debounce and throttle
   - Scroll-reveal (IntersectionObserver)
   - Date helpers
   - Clipboard copy
   - URL query parameter helpers
   - Countdown timer
   - API call tracker
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   TOAST NOTIFICATION SYSTEM
   
   Usage:
     Toast.success('Title', 'Message')
     Toast.error('Title', 'Message')
     Toast.warning('Title', 'Message')
     Toast.info('Title', 'Message')
     Toast.gold('Title', 'Message')   ← luxury gold style
   
   Each call returns a dismiss function:
     const dismiss = Toast.success('Done!', 'Saved.')
     dismiss() // manually close it
   ───────────────────────────────────────────────────────────── */

const Toast = (() => {
  const ICONS = {
    success: 'fa-solid fa-check',
    error: 'fa-solid fa-xmark',
    warning: 'fa-solid fa-triangle-exclamation',
    info: 'fa-solid fa-circle-info',
    gold: 'fa-solid fa-star',
  };

  const DURATIONS = {
    success: 4000,
    error: 6000,
    warning: 5000,
    info: 4000,
    gold: 5000,
  };

  function show(type, title, message, duration) {
    const container = document.getElementById('toast-container');
    if (!container) return () => { };

    const ms = duration || DURATIONS[type];
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.id = id;

    toast.innerHTML = `
      <div class="toast-icon">
        <i class="${ICONS[type]}" aria-hidden="true"></i>
      </div>
      <div class="toast-body">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close" aria-label="Close notification">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="toast-progress" style="animation-duration: ${ms}ms;"></div>
    `;

    container.appendChild(toast);

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => dismiss(toast));

    // Auto-dismiss
    const timer = setTimeout(() => dismiss(toast), ms);

    function dismiss(el) {
      clearTimeout(timer);
      if (!el || !el.parentNode) return;
      el.classList.add('toast-removing');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }

    return () => dismiss(toast);
  }

  return {
    success: (title, msg, ms) => show('success', title, msg, ms),
    error: (title, msg, ms) => show('error', title, msg, ms),
    warning: (title, msg, ms) => show('warning', title, msg, ms),
    info: (title, msg, ms) => show('info', title, msg, ms),
    gold: (title, msg, ms) => show('gold', title, msg, ms),
  };
})();

/* ─────────────────────────────────────────────────────────────
   LOCALSTORAGE CACHE HELPERS
   
   Usage:
     Cache.set('key', data)                  // stores with timestamp
     Cache.get('key')                         // returns data or null if expired
     Cache.remove('key')                      // deletes one key
     Cache.clear('prestige_')                 // deletes all keys with prefix
   ───────────────────────────────────────────────────────────── */

const Cache = (() => {
  const PREFIX = 'prestige_';
  const TTL = CONFIG.CACHE_DURATION_MS;

  function set(key, data, customTtl) {
    try {
      const entry = {
        data,
        timestamp: Date.now(),
        ttl: customTtl || TTL,
      };
      localStorage.setItem(PREFIX + key, JSON.stringify(entry));
      return true;
    } catch (e) {
      console.warn('[Cache] write failed:', e.message);
      return false;
    }
  }

  function get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (!raw) return null;
      const entry = JSON.parse(raw);
      if (Date.now() - entry.timestamp > entry.ttl) {
        localStorage.removeItem(PREFIX + key);
        return null;
      }
      return entry.data;
    } catch (e) {
      return null;
    }
  }

  function remove(key) {
    localStorage.removeItem(PREFIX + key);
  }

  function clear(pattern) {
    const prefix = pattern ? PREFIX + pattern : PREFIX;
    Object.keys(localStorage)
      .filter(k => k.startsWith(prefix))
      .forEach(k => localStorage.removeItem(k));
  }

  return { set, get, remove, clear };
})();

/* ─────────────────────────────────────────────────────────────
   SAVED LISTINGS (Heart / Bookmark)
   Persists in localStorage across sessions.
   
   Usage:
     Saved.toggle('prop_001')   → returns true if now saved
     Saved.isSaved('prop_001')  → boolean
     Saved.getAll()             → array of IDs
     Saved.count()              → number
   ───────────────────────────────────────────────────────────── */

const Saved = (() => {
  const KEY = 'saved_listings';

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function save(ids) {
    localStorage.setItem(KEY, JSON.stringify(ids));
  }

  function isSaved(id) {
    return getAll().includes(String(id));
  }

  function toggle(id) {
    const all = getAll();
    const sid = String(id);
    const idx = all.indexOf(sid);
    if (idx === -1) {
      all.push(sid);
      save(all);
      return true;   // now saved
    } else {
      all.splice(idx, 1);
      save(all);
      return false;  // now unsaved
    }
  }

  function count() { return getAll().length; }

  return { getAll, isSaved, toggle, count };
})();

/* ─────────────────────────────────────────────────────────────
   RECENTLY VIEWED PROPERTIES
   ───────────────────────────────────────────────────────────── */

const RecentlyViewed = (() => {
  const KEY = 'recently_viewed';
  const MAX = 6;

  function add(property) {
    const all = getAll();
    // Remove if already exists (will re-add at front)
    const filtered = all.filter(p => p.id !== property.id);
    filtered.unshift(property);
    const trimmed = filtered.slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  }

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  return { add, getAll };
})();

/* ─────────────────────────────────────────────────────────────
   CURRENCY FORMATTER
   
   Usage:
     formatPrice(4750000)           → "$4,750,000"
     formatPrice(18500, 'rent')     → "$18,500/mo"
     formatPriceShort(4750000)      → "$4.75M"
   ───────────────────────────────────────────────────────────── */

function formatPrice(amount, listingType) {
  if (!amount && amount !== 0) return 'Price on Request';
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
  return listingType === 'rent' ? `${formatted}/mo` : formatted;
}

function formatPriceShort(amount) {
  if (!amount) return 'POA';
  if (amount >= 1_000_000) {
    const val = (amount / 1_000_000).toFixed(2).replace(/\.?0+$/, '');
    return `$${val}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

function formatNumber(n) {
  return new Intl.NumberFormat('en-US').format(n);
}

function formatSqft(sqft) {
  if (!sqft) return 'N/A';
  return `${formatNumber(sqft)} sqft`;
}

/* ─────────────────────────────────────────────────────────────
   DATE HELPERS
   ───────────────────────────────────────────────────────────── */

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(dateStr);
}

/* ─────────────────────────────────────────────────────────────
   DEBOUNCE & THROTTLE
   
   Debounce: delays execution until input pauses.
     Useful for: search inputs, resize handlers
   
   Throttle: limits execution to once per interval.
     Useful for: scroll events, mousemove
   ───────────────────────────────────────────────────────────── */

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, interval) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

/* ─────────────────────────────────────────────────────────────
   URL QUERY PARAMETERS
   
   Usage:
     getParam('q')            → value or null
     setParams({ q: 'NYC' })  → updates URL without reload
     getParams()              → plain object of all params
   ───────────────────────────────────────────────────────────── */

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function getParams() {
  const result = {};
  new URLSearchParams(window.location.search).forEach((v, k) => { result[k] = v; });
  return result;
}

function setParams(params, replace = false) {
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([k, v]) => {
    if (v === null || v === undefined || v === '') {
      url.searchParams.delete(k);
    } else {
      url.searchParams.set(k, v);
    }
  });
  const method = replace ? 'replaceState' : 'pushState';
  history[method]({}, '', url.toString());
}

/* ─────────────────────────────────────────────────────────────
   CLIPBOARD COPY
   
   Usage:
     copyToClipboard('text to copy', 'Copied!', 'Optional message')
   ───────────────────────────────────────────────────────────── */

async function copyToClipboard(text, toastTitle = 'Copied!', toastMsg = '') {
  try {
    await navigator.clipboard.writeText(text);
    Toast.success(toastTitle, toastMsg || `Copied to clipboard`);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      el.remove();
      Toast.success(toastTitle, toastMsg);
      return true;
    } catch {
      Toast.error('Copy Failed', 'Please copy the text manually.');
      return false;
    }
  }
}

/* ─────────────────────────────────────────────────────────────
   COUNTDOWN TIMER
   
   Usage:
     const timer = new CountdownTimer({
       minutes: 30,
       onTick: ({ minutes, seconds, totalSeconds }) => { ... },
       onExpire: () => { ... },
     });
     timer.start();
     timer.stop();
   ───────────────────────────────────────────────────────────── */

class CountdownTimer {
  constructor({ minutes, seconds = 0, onTick, onExpire }) {
    this.totalSeconds = (minutes * 60) + seconds;
    this.remaining = this.totalSeconds;
    this.onTick = onTick || (() => { });
    this.onExpire = onExpire || (() => { });
    this._interval = null;
    this._expired = false;
  }

  get minutes() { return Math.floor(this.remaining / 60); }
  get seconds() { return this.remaining % 60; }

  get formattedTime() {
    const m = String(this.minutes).padStart(2, '0');
    const s = String(this.seconds).padStart(2, '0');
    return `${m}:${s}`;
  }

  get percentRemaining() {
    return (this.remaining / this.totalSeconds) * 100;
  }

  start() {
    if (this._interval) return;
    this.onTick({ minutes: this.minutes, seconds: this.seconds, totalSeconds: this.remaining });
    this._interval = setInterval(() => {
      this.remaining--;
      if (this.remaining <= 0) {
        this.remaining = 0;
        this.stop();
        this._expired = true;
        this.onExpire();
      } else {
        this.onTick({ minutes: this.minutes, seconds: this.seconds, totalSeconds: this.remaining });
      }
    }, 1000);
  }

  stop() {
    clearInterval(this._interval);
    this._interval = null;
  }

  reset() {
    this.stop();
    this.remaining = this.totalSeconds;
    this._expired = false;
  }

  get isExpired() { return this._expired; }
}

/* ─────────────────────────────────────────────────────────────
   API CALL TRACKER
   Prevents burning through API rate limits during demo.
   ───────────────────────────────────────────────────────────── */

const ApiTracker = (() => {
  const KEY = 'api_call_count';
  const SESSION_KEY = 'api_session_start';
  const MAX = CONFIG.API_MAX_CALLS_PER_SESSION;

  function getCount() {
    return parseInt(sessionStorage.getItem(KEY) || '0', 10);
  }

  function canCall() {
    return getCount() < MAX;
  }

  function increment() {
    const count = getCount() + 1;
    sessionStorage.setItem(KEY, String(count));
    if (count >= MAX * 0.8) {
      console.warn(`[ApiTracker] ${count}/${MAX} API calls used this session.`);
    }
  }

  function getRemaining() { return Math.max(0, MAX - getCount()); }

  return { canCall, increment, getRemaining, getCount };
})();

/* ─────────────────────────────────────────────────────────────
   SCROLL REVEAL (IntersectionObserver)
   
   Automatically observes elements with classes:
     .reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade
   
   When they enter the viewport, adds class .revealed
   which triggers the CSS transitions in animations.css
   ───────────────────────────────────────────────────────────── */

function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: just show everything
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade')
      .forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // Animate only once
        }
      });
    },
    {
      threshold: 0.12,      // 12% of element must be visible
      rootMargin: '0px 0px -40px 0px', // Trigger slightly before element enters
    }
  );

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade')
    .forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────────────────────
   BACK TO TOP BUTTON
   ───────────────────────────────────────────────────────────── */

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  const onScroll = throttle(() => {
    if (window.scrollY > 400) {
      btn.classList.remove('hidden');
    } else {
      btn.classList.add('hidden');
    }
  }, 150);

  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─────────────────────────────────────────────────────────────
   OFFER BANNER
   ───────────────────────────────────────────────────────────── */

function initOfferBanner() {
  const banner = document.getElementById('offer-banner');
  const closeBtn = document.getElementById('banner-close-btn');
  if (!banner || !closeBtn) return;

  // Check if user dismissed it this session
  if (sessionStorage.getItem('banner_dismissed')) {
    banner.classList.add('hidden');
    return;
  }

  closeBtn.addEventListener('click', () => {
    banner.classList.add('hidden');
    sessionStorage.setItem('banner_dismissed', '1');
  });
}

/* ─────────────────────────────────────────────────────────────
   WELCOME POPUP
   Shows once per day (resets every 24 hours)
   ───────────────────────────────────────────────────────────── */

function initWelcomePopup() {
  const popup = document.getElementById('welcome-popup');
  const closeBtn = document.getElementById('popup-close-btn');
  const dismissBtn = document.getElementById('popup-dismiss-btn');
  if (!popup) return;

  // Only show on home page
  const isHomePage = window.location.pathname === 'index.html'
    || window.location.pathname.endsWith('index.html')
    || window.location.pathname === '';

  if (!isHomePage) {
    popup.classList.add('hidden');
    return;
  }

  // Don't show if dismissed in the last 24h
  const dismissedAt = localStorage.getItem('popup_dismissed_at');
  const ONE_DAY = 1000 * 60 * 60 * 24;
  if (dismissedAt && Date.now() - parseInt(dismissedAt) < ONE_DAY) {
    popup.classList.add('hidden');
    return;
  }

  // Show after a short delay
  setTimeout(() => {
    popup.classList.remove('hidden');
  }, 1500);

  function dismissPopup() {
    popup.classList.add('hidden');
    localStorage.setItem('popup_dismissed_at', String(Date.now()));
  }

  if (closeBtn) closeBtn.addEventListener('click', dismissPopup);
  if (dismissBtn) dismissBtn.addEventListener('click', dismissPopup);

  // Click outside to close
  popup.addEventListener('click', (e) => {
    if (e.target === popup) dismissPopup();
  });
}

/* ─────────────────────────────────────────────────────────────
   GENERATE STAR RATING HTML
   
   Usage:
     renderStars(4.5) → HTML string of star icons
   ───────────────────────────────────────────────────────────── */

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  let html = '<div class="stars" aria-label="Rating: ' + rating + ' out of 5">';
  for (let i = 0; i < full; i++) html += '<i class="fa-solid fa-star"></i>';
  if (half) html += '<i class="fa-solid fa-star-half-stroke"></i>';
  for (let i = 0; i < empty; i++) html += '<i class="fa-regular fa-star star-empty"></i>';
  html += '</div>';
  return html;
}

/* ─────────────────────────────────────────────────────────────
   PROPERTY TYPE ICON MAPPER
   ───────────────────────────────────────────────────────────── */

function getPropertyTypeIcon(type) {
  const map = {
    'Single Family': 'fa-solid fa-house',
    'Condo': 'fa-solid fa-building',
    'Townhouse': 'fa-solid fa-house-flag',
    'Penthouse': 'fa-solid fa-building-columns',
    'Villa': 'fa-solid fa-umbrella-beach',
    'Estate': 'fa-solid fa-landmark',
    'Apartment': 'fa-solid fa-city',
    'Land': 'fa-solid fa-mountain',
    'Commercial': 'fa-solid fa-store',
  };
  return map[type] || 'fa-solid fa-house';
}

/* ─────────────────────────────────────────────────────────────
   PROPERTY CARD RENDERER
   
   Usage:
     const html = renderPropertyCard(property, { showBadges: true })
     container.innerHTML = cards.map(renderPropertyCard).join('')
   ───────────────────────────────────────────────────────────── */

function renderPropertyCard(property, options = {}) {
  const {
    showBadges = true,
    animate = true,
    delay = 0,
  } = options;

  const isSaved = Saved.isSaved(property.id);
  const image = property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format';
  const price = formatPrice(property.price, property.listingType);
  const priceShort = formatPriceShort(property.price);
  const city = property.city || 'Location TBD';
  const state = property.state || '';
  const type = property.propertyType || 'Property';

  const badges = [];
  if (property.featured) badges.push('<span class="badge badge-gold"><i class="fa-solid fa-star"></i> Featured</span>');
  if (property.new) badges.push('<span class="badge badge-navy">New</span>');
  if (property.trending) badges.push('<span class="badge badge-gold"><i class="fa-solid fa-fire"></i> Trending</span>');

  const animClass = animate ? 'reveal' : '';
  const delayClass = delay ? `delay-${delay}` : '';

  return `
    <article class="property-card card hover-lift ${animClass} ${delayClass}" 
             data-id="${property.id}"
             onclick="window.location.href='property.html?id=${property.id}'"
             role="button"
             tabindex="0"
             aria-label="${type} in ${city} for ${price}">
      
      <!-- Image -->
      <div class="property-card-image img-zoom-wrapper">
        <img
          src="${image}"
          alt="${type} at ${property.addressLine1 || city}"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format'"
        />

        <!-- Overlay badges -->
        ${showBadges && badges.length ? `
          <div class="property-card-badges">
            ${badges.join('')}
          </div>
        ` : ''}

        <!-- Listing type pill -->
        <div class="property-listing-type property-listing-type-${property.listingType || 'buy'}">
          ${property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
        </div>

        <!-- Save / Heart button -->
        <button
          class="property-save-btn ${isSaved ? 'saved' : ''}"
          onclick="event.stopPropagation(); toggleSaveProperty('${property.id}', this)"
          aria-label="${isSaved ? 'Remove from saved' : 'Save property'}"
          title="${isSaved ? 'Saved' : 'Save'}"
        >
          <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>

        <!-- Quick actions on hover -->
        <div class="property-overlay-actions">
          <button class="property-quick-action" onclick="event.stopPropagation(); quickView('${property.id}')" aria-label="Quick view">
            <i class="fa-regular fa-eye"></i>
            <span>Quick View</span>
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="property-card-body">
        <!-- Price -->
        <div class="property-price">
          ${price}
          ${property.listingType === 'rent' ? '<span class="property-price-period">per month</span>' : ''}
        </div>

        <!-- Address -->
        <h3 class="property-address">
          ${property.addressLine1 || property.formattedAddress || 'Address on Request'}
        </h3>
        <p class="property-location">
          <i class="fa-solid fa-location-dot"></i>
          ${city}${state ? `, ${state}` : ''}
        </p>

        <!-- Stats Row -->
        <div class="property-stats">
          <div class="property-stat">
            <i class="fa-solid fa-bed"></i>
            <span>${property.bedrooms ?? '—'}</span>
            <span class="property-stat-label">Bed${property.bedrooms !== 1 ? 's' : ''}</span>
          </div>
          <div class="property-stat-divider"></div>
          <div class="property-stat">
            <i class="fa-solid fa-shower"></i>
            <span>${property.bathrooms ?? '—'}</span>
            <span class="property-stat-label">Bath${property.bathrooms !== 1 ? 's' : ''}</span>
          </div>
          <div class="property-stat-divider"></div>
          <div class="property-stat">
            <i class="fa-solid fa-ruler-combined"></i>
            <span>${property.squareFootage ? formatNumber(property.squareFootage) : '—'}</span>
            <span class="property-stat-label">sqft</span>
          </div>
        </div>

        <!-- Type & Agent -->
        <div class="property-card-footer">
          <span class="property-type-tag">
            <i class="${getPropertyTypeIcon(type)}"></i>
            ${type}
          </span>
          ${property.agent ? `
            <span class="property-agent">
              <div class="property-agent-avatar">${property.agent.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
              <span>${property.agent.name.split(' ')[0]}</span>
            </span>
          ` : ''}
        </div>
      </div>
    </article>
  `;
}

/* ─────────────────────────────────────────────────────────────
   SAVE / UNSAVE PROPERTY (Heart button handler)
   ───────────────────────────────────────────────────────────── */

function toggleSaveProperty(id, btn) {
  const isSaved = Saved.toggle(id);
  const icon = btn.querySelector('i');

  if (isSaved) {
    icon.className = 'fa-solid fa-heart';
    btn.classList.add('saved');
    Toast.gold('Property Saved', 'Added to your saved listings.');
  } else {
    icon.className = 'fa-regular fa-heart';
    btn.classList.remove('saved');
    Toast.info('Removed', 'Property removed from saved listings.');
  }

  // Update saved count badge in navbar
  updateSavedBadge();
}

function updateSavedBadge() {
  const badge = document.getElementById('saved-count-badge');
  if (!badge) return;
  const count = Saved.count();
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

/* ─────────────────────────────────────────────────────────────
   QUICK VIEW (placeholder — full modal in Phase 5)
   ───────────────────────────────────────────────────────────── */

function quickView(id) {
  window.location.href = `property.html?id=${id}`;
}

/* ─────────────────────────────────────────────────────────────
   SKELETON LOADER HELPERS
   ───────────────────────────────────────────────────────────── */

function renderPropertyCardSkeleton() {
  return `
    <div class="property-card card">
      <div class="skeleton skeleton-image"></div>
      <div class="property-card-body">
        <div class="skeleton skeleton-text" style="width:40%; height:1.5rem; margin-bottom: 8px;"></div>
        <div class="skeleton skeleton-text" style="width:80%;"></div>
        <div class="skeleton skeleton-text" style="width:55%;"></div>
        <div class="skeleton skeleton-text" style="width:70%; height: 0.875rem;"></div>
      </div>
    </div>
  `;
}

function showSkeletons(containerId, count = 6) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = Array(count).fill(renderPropertyCardSkeleton()).join('');
}

/* ─────────────────────────────────────────────────────────────
   MORTGAGE CALCULATOR HELPER
   ───────────────────────────────────────────────────────────── */

function calculateMortgage(principal, annualRate, years) {
  const monthlyRate = annualRate / 100 / 12;
  const n = years * 12;
  if (monthlyRate === 0) return principal / n;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  return Math.round(payment);
}

/* ─────────────────────────────────────────────────────────────
   DOM HELPERS
   ───────────────────────────────────────────────────────────── */

// Shorthand selectors
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// Show / hide
function show(el) { if (el) el.classList.remove('hidden'); }
function hide(el) { if (el) el.classList.add('hidden'); }
function toggle(el) { if (el) el.classList.toggle('hidden'); }

// Add/remove classes safely
function addClass(el, ...cls) { if (el) el.classList.add(...cls); }
function removeClass(el, ...cls) { if (el) el.classList.remove(...cls); }

/* ─────────────────────────────────────────────────────────────
   ANIMATE COUNTING NUMBERS
   Usage: animateCount(el, 0, 1500, 2000)
   ───────────────────────────────────────────────────────────── */

function animateCount(el, from, to, duration = 1500, suffix = '') {
  const start = performance.now();
  const range = to - from;

  function step(timestamp) {
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(from + range * eased);
    el.textContent = formatNumber(current) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = formatNumber(to) + suffix;
  }

  requestAnimationFrame(step);
}

/* ─────────────────────────────────────────────────────────────
   GLOBAL INIT — Runs on every page
   ───────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initBackToTop();
  initOfferBanner();
  initWelcomePopup();
  updateSavedBadge();
});
