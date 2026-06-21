/* ============================================================
   PRESTIGE HOMES — COMPONENTS INJECTOR
   ============================================================
   This file builds the Navbar and Footer HTML dynamically
   and injects them into every page.

   Why do it this way?
   - Write the navbar and footer HTML exactly once
   - Every page automatically gets updates
   - No copy-pasting HTML across 10+ files
   - Auth state (logged in / logged out) changes the navbar

   This file also handles:
   - Navbar scroll behavior (transparent → solid)
   - Mobile hamburger menu toggle
   - User dropdown menu
   - Active link highlighting
   - Keyboard accessibility for dropdowns
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   NAVBAR HTML TEMPLATE
   ───────────────────────────────────────────────────────────── */

function buildNavbar(user = null) {
  const authButtons = user
    ? `
      <!-- Saved listings icon -->
      <a href="saved.html" class="nav-icon-btn" aria-label="Saved Listings" title="Saved Listings">
        <i class="fa-regular fa-heart" aria-hidden="true"></i>
        <span class="nav-badge hidden" id="saved-count-badge">0</span>
      </a>

      <!-- User dropdown -->
      <div class="nav-user" id="nav-user-menu">
        <button class="nav-user-btn" id="nav-user-btn" aria-haspopup="true" aria-expanded="false">
          <div class="avatar avatar-sm" aria-hidden="true">
            ${user.email ? user.email[0].toUpperCase() : 'U'}
          </div>
          <span class="nav-user-name">${user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Account'}</span>
          <i class="fa-solid fa-chevron-down nav-user-chevron" aria-hidden="true"></i>
        </button>
        <div class="nav-user-menu" role="menu">
          <div class="user-menu-header">
            <div class="user-menu-name">${user.user_metadata?.full_name || 'Welcome back'}</div>
            <div class="user-menu-email">${user.email || ''}</div>
          </div>
          <a href="dashboard.html" class="user-menu-item" role="menuitem">
            <i class="fa-regular fa-user" aria-hidden="true"></i> My Profile
          </a>
          <a href="saved.html" class="user-menu-item" role="menuitem">
            <i class="fa-regular fa-heart" aria-hidden="true"></i> Saved Listings
          </a>
          <a href="applications.html" class="user-menu-item" role="menuitem">
            <i class="fa-regular fa-file-lines" aria-hidden="true"></i> My Applications
          </a>
          <a href="tours.html" class="user-menu-item" role="menuitem">
            <i class="fa-regular fa-calendar" aria-hidden="true"></i> Booked Tours
          </a>
          <div class="user-menu-divider"></div>
          <button class="user-menu-item danger" id="logout-btn" role="menuitem">
            <i class="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i> Sign Out
          </button>
        </div>
      </div>
    `
    : `
      <!-- Saved listings icon (not logged in — shows tooltip) -->
      <a href="auth/login.html" class="nav-icon-btn" aria-label="Saved Listings" title="Sign in to save listings">
        <i class="fa-regular fa-heart" aria-hidden="true"></i>
        <span class="nav-badge hidden" id="saved-count-badge">0</span>
      </a>

      <!-- Auth buttons -->
      <a href="auth/login.html" class="btn btn-ghost-light btn-sm">Sign In</a>
      <a href="auth/signup.html" class="btn btn-primary btn-sm">Get Started</a>
    `;

  return `
    <nav class="navbar" id="site-navbar" role="navigation" aria-label="Main navigation">
      <div class="navbar-inner">

        <!-- Logo -->
        <a href="index.html" class="navbar-logo" aria-label="Prestige Homes – Home">
          <div class="navbar-logo-icon" aria-hidden="true">
            <i class="fa-solid fa-building-columns"></i>
          </div>
          <div class="navbar-logo-text">
            <span class="navbar-logo-name">Prestige Homes</span>
            <span class="navbar-logo-tagline">Luxury Real Estate</span>
          </div>
        </a>

        <!-- Desktop Nav Links -->
        <ul class="navbar-nav" role="list">
          <li>
            <a href="index.html" class="nav-link" data-page="home">
              <i class="fa-solid fa-house" aria-hidden="true"></i>
              Home
            </a>
          </li>
          <li>
            <a href="search.html?type=buy" class="nav-link" data-page="buy">
              Buy
            </a>
          </li>
          <li>
            <a href="search.html?type=rent" class="nav-link" data-page="rent">
              Rent
            </a>
          </li>

          <!-- Dropdown: Explore -->
          <li class="nav-dropdown" id="nav-explore-dropdown">
            <button class="nav-link" aria-haspopup="true" aria-expanded="false" id="explore-dropdown-btn">
              Explore
              <i class="fa-solid fa-chevron-down" style="font-size:0.6rem; margin-left:2px;" aria-hidden="true"></i>
            </button>
            <div class="nav-dropdown-menu" role="menu">
              <a href="search.html?type=buy&propertyType=Luxury" class="nav-dropdown-item" role="menuitem">
                <i class="fa-solid fa-crown" aria-hidden="true"></i>
                Luxury Collection
              </a>
              <a href="search.html?type=buy&propertyType=Investment" class="nav-dropdown-item" role="menuitem">
                <i class="fa-solid fa-chart-line" aria-hidden="true"></i>
                Investment Properties
              </a>
              <a href="search.html?type=buy&propertyType=Penthouse" class="nav-dropdown-item" role="menuitem">
                <i class="fa-solid fa-building-columns" aria-hidden="true"></i>
                Penthouses
              </a>
              <a href="search.html?type=buy&propertyType=Waterfront" class="nav-dropdown-item" role="menuitem">
                <i class="fa-solid fa-water" aria-hidden="true"></i>
                Waterfront Homes
              </a>
              <a href="search.html?type=rent&featured=true" class="nav-dropdown-item" role="menuitem">
                <i class="fa-solid fa-star" aria-hidden="true"></i>
                Featured Rentals
              </a>
            </div>
          </li>

          <li>
            <a href="#about" class="nav-link" data-page="about">About</a>
          </li>
        </ul>

        <!-- Right: Auth / User -->
        <div class="navbar-actions">
          ${authButtons}
          <!-- Mobile hamburger -->
          <button class="navbar-hamburger" id="hamburger-btn" aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobile-menu">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
        </div>

      </div>
    </nav>

    <!-- Mobile Menu Drawer -->
    <div class="mobile-menu" id="mobile-menu" aria-hidden="true" role="dialog" aria-label="Mobile navigation">
      <div class="mobile-menu-inner">
        <a href="index.html" class="mobile-nav-link" data-page="home">
          <i class="fa-solid fa-house" aria-hidden="true"></i> Home
        </a>
        <a href="search.html?type=buy" class="mobile-nav-link" data-page="buy">
          <i class="fa-solid fa-tag" aria-hidden="true"></i> Buy Property
        </a>
        <a href="search.html?type=rent" class="mobile-nav-link" data-page="rent">
          <i class="fa-solid fa-key" aria-hidden="true"></i> Rent Property
        </a>
        <a href="search.html?type=buy&propertyType=Luxury" class="mobile-nav-link">
          <i class="fa-solid fa-crown" aria-hidden="true"></i> Luxury Collection
        </a>
        <a href="search.html?type=buy&propertyType=Investment" class="mobile-nav-link">
          <i class="fa-solid fa-chart-line" aria-hidden="true"></i> Investments
        </a>
        <div class="mobile-nav-divider"></div>
        ${user
      ? `
            <a href="dashboard.html" class="mobile-nav-link">
              <i class="fa-regular fa-user" aria-hidden="true"></i> My Profile
            </a>
            <a href="saved.html" class="mobile-nav-link">
              <i class="fa-regular fa-heart" aria-hidden="true"></i> Saved Listings
            </a>
            <a href="applications.html" class="mobile-nav-link">
              <i class="fa-regular fa-file-lines" aria-hidden="true"></i> My Applications
            </a>
            <div class="mobile-nav-divider"></div>
            <div class="mobile-nav-actions">
              <button class="btn btn-ghost btn-full" id="mobile-logout-btn">
                <i class="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
              </button>
            </div>
          `
      : `
            <div class="mobile-nav-actions">
              <a href="auth/login.html" class="btn btn-ghost-light btn-full">Sign In</a>
              <a href="auth/signup.html" class="btn btn-primary btn-full">Create Free Account</a>
            </div>
          `
    }
      </div>
    </div>
  `;
}

/* ─────────────────────────────────────────────────────────────
   FOOTER HTML TEMPLATE
   ───────────────────────────────────────────────────────────── */

function buildFooter() {
  const year = new Date().getFullYear();

  return `
    <footer class="site-footer" role="contentinfo">

      <!-- Main Link Columns -->
      <div class="footer-main">

        <!-- Brand Column -->
        <div class="footer-brand">
          <a href="index.html" class="footer-logo" aria-label="Prestige Homes – Home">
            <div class="footer-logo-icon" aria-hidden="true">
              <i class="fa-solid fa-building-columns"></i>
            </div>
            <div class="footer-logo-text">
              <span class="footer-logo-name">Prestige Homes</span>
              <span class="footer-logo-tagline">Luxury Real Estate</span>
            </div>
          </a>

          <p class="footer-description">
            Curating the finest residential properties across North America. 
            Where every listing meets an unwavering standard of excellence.
          </p>

          <!-- Social Icons -->
          <div class="footer-social" aria-label="Social media links">
            <a href="#" class="social-icon" aria-label="Instagram" title="Instagram">
              <i class="fa-brands fa-instagram" aria-hidden="true"></i>
            </a>
            <a href="#" class="social-icon" aria-label="Facebook" title="Facebook">
              <i class="fa-brands fa-facebook-f" aria-hidden="true"></i>
            </a>
            <a href="#" class="social-icon" aria-label="X (Twitter)" title="X">
              <i class="fa-brands fa-x-twitter" aria-hidden="true"></i>
            </a>
            <a href="#" class="social-icon" aria-label="LinkedIn" title="LinkedIn">
              <i class="fa-brands fa-linkedin-in" aria-hidden="true"></i>
            </a>
            <a href="#" class="social-icon" aria-label="YouTube" title="YouTube">
              <i class="fa-brands fa-youtube" aria-hidden="true"></i>
            </a>
          </div>

          <!-- Trust Badges -->
          <div class="footer-trust">
            <div class="trust-badge">
              <i class="fa-solid fa-shield-halved" aria-hidden="true"></i>
              <span>Verified Listings</span>
            </div>
            <div class="trust-badge">
              <i class="fa-solid fa-award" aria-hidden="true"></i>
              <span>Top Rated 2024</span>
            </div>
            <div class="trust-badge">
              <i class="fa-solid fa-lock" aria-hidden="true"></i>
              <span>Secure Platform</span>
            </div>
          </div>
        </div>

        <!-- Properties Column -->
        <div class="footer-col">
          <h3 class="footer-col-title">Properties</h3>
          <ul class="footer-links">
            <li><a href="search.html?type=buy" class="footer-link">
              <i class="fa-solid fa-chevron-right footer-link-arrow" aria-hidden="true"></i>
              Homes for Sale
            </a></li>
            <li><a href="search.html?type=rent" class="footer-link">
              <i class="fa-solid fa-chevron-right footer-link-arrow" aria-hidden="true"></i>
              Properties for Rent
            </a></li>
            <li><a href="search.html?type=buy&propertyType=Luxury" class="footer-link">
              <i class="fa-solid fa-chevron-right footer-link-arrow" aria-hidden="true"></i>
              Luxury Collection
            </a></li>
            <li><a href="search.html?type=buy&propertyType=Penthouse" class="footer-link">
              <i class="fa-solid fa-chevron-right footer-link-arrow" aria-hidden="true"></i>
              Penthouses
            </a></li>
            <li><a href="search.html?type=buy&propertyType=Investment" class="footer-link">
              <i class="fa-solid fa-chevron-right footer-link-arrow" aria-hidden="true"></i>
              Investment Properties
            </a></li>
            <li><a href="search.html?featured=true" class="footer-link">
              <i class="fa-solid fa-chevron-right footer-link-arrow" aria-hidden="true"></i>
              Featured Listings
            </a></li>
          </ul>
        </div>

        <!-- Company Column -->
        <div class="footer-col">
          <h3 class="footer-col-title">Company</h3>
          <ul class="footer-links">
            <li><a href="index.html#about" class="footer-link">
              <i class="fa-solid fa-chevron-right footer-link-arrow" aria-hidden="true"></i>
              About Us
            </a></li>
            <li><a href="index.html#how-it-works" class="footer-link">
              <i class="fa-solid fa-chevron-right footer-link-arrow" aria-hidden="true"></i>
              How It Works
            </a></li>
            <li><a href="index.html#testimonials" class="footer-link">
              <i class="fa-solid fa-chevron-right footer-link-arrow" aria-hidden="true"></i>
              Client Testimonials
            </a></li>
            <li><a href="index.html#news" class="footer-link">
              <i class="fa-solid fa-chevron-right footer-link-arrow" aria-hidden="true"></i>
              Market Insights
            </a></li>
            <li><a href="careers.html" class="footer-link">
              <i class="fa-solid fa-chevron-right footer-link-arrow" aria-hidden="true"></i>
              Careers
            </a></li>
            <li><a href="index.html#contact" class="footer-link">
              <i class="fa-solid fa-chevron-right footer-link-arrow" aria-hidden="true"></i>
              Contact
            </a></li>
          </ul>
        </div>

        <!-- Support Column -->
        <div class="footer-col">
          <h3 class="footer-col-title">Support</h3>
          <ul class="footer-links">
            <li><a href="index.html#faq" class="footer-link">
              <i class="fa-solid fa-chevron-right footer-link-arrow" aria-hidden="true"></i>
              FAQ
            </a></li>
            <li><a href="auth/login.html" class="footer-link">
              <i class="fa-solid fa-chevron-right footer-link-arrow" aria-hidden="true"></i>
              Sign In
            </a></li>
            <li><a href="auth/signup.html" class="footer-link">
              <i class="fa-solid fa-chevron-right footer-link-arrow" aria-hidden="true"></i>
              Create Account
            </a></li>
            <li><a href="dashboard.html" class="footer-link">
              <i class="fa-solid fa-chevron-right footer-link-arrow" aria-hidden="true"></i>
              My Dashboard
            </a></li>
            <li><a href="mailto:${CONFIG.CONTACT_EMAIL}" class="footer-link">
              <i class="fa-solid fa-chevron-right footer-link-arrow" aria-hidden="true"></i>
              Email Support
            </a></li>
            <li><a href="tel:${CONFIG.PHONE}" class="footer-link">
              <i class="fa-solid fa-chevron-right footer-link-arrow" aria-hidden="true"></i>
              ${CONFIG.PHONE}
            </a></li>
          </ul>
        </div>

      </div>

      <!-- Newsletter Section -->
      <div class="footer-newsletter-section">
        <div>
          <h3 class="newsletter-heading">
            Stay ahead of the <span>market.</span>
          </h3>
          <p class="newsletter-sub">
            Get exclusive listings, market insights, and investment opportunities delivered weekly. 
            Join 24,000+ subscribers.
          </p>
        </div>
        <div>
          <form class="newsletter-form" id="footer-newsletter-form" novalidate>
            <label for="footer-email" class="sr-only">Email address</label>
            <input
              type="email"
              id="footer-email"
              class="newsletter-input"
              placeholder="Your email address"
              autocomplete="email"
              required
              aria-required="true"
            />
            <button type="submit" class="btn btn-primary">
              Subscribe
              <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </button>
          </form>
          <p style="font-size: var(--text-xs); color: rgba(255,255,255,0.25); margin-top: 10px;">
            No spam. Unsubscribe at any time. We respect your privacy.
          </p>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="footer-stats" aria-label="Company statistics">
        <div class="footer-stat">
          <div class="footer-stat-value">4,200+</div>
          <div class="footer-stat-label">Properties Listed</div>
        </div>
        <div class="footer-stat">
          <div class="footer-stat-value">$2.8B</div>
          <div class="footer-stat-label">In Transactions</div>
        </div>
        <div class="footer-stat">
          <div class="footer-stat-value">98%</div>
          <div class="footer-stat-label">Client Satisfaction</div>
        </div>
        <div class="footer-stat">
          <div class="footer-stat-value">17 yrs</div>
          <div class="footer-stat-label">Avg. Agent Experience</div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom">
        <p class="footer-copyright">
          &copy; ${year} Prestige Homes. All rights reserved.
        </p>
        <ul class="footer-legal">
          <li><a href="privacy.html">Privacy Policy</a></li>
          <li><a href="terms.html">Terms of Service</a></li>
          <li><a href="accessibility.html">Accessibility</a></li>
          <li><a href="sitemap.html">Sitemap</a></li>
        </ul>
      </div>

    </footer>
  `;
}

/* ─────────────────────────────────────────────────────────────
   INJECT NAVBAR & FOOTER INTO THE PAGE
   ───────────────────────────────────────────────────────────── */

async function injectComponents() {
  // Check for a logged-in Supabase user (if Supabase is configured).
  // initSupabase() and getCurrentUser() are defined in supabase-client.js,
  // which must load BEFORE components.js. If Supabase isn't configured,
  // getCurrentUser() safely returns null and the navbar shows Sign In / Get Started.
  let currentUser = null;
  if (typeof initSupabase === 'function') initSupabase();
  if (typeof getCurrentUser === 'function') {
    currentUser = await getCurrentUser();
  }

  // Inject Navbar
  const navbarContainer = document.getElementById('navbar-container');
  if (navbarContainer) {
    navbarContainer.innerHTML = buildNavbar(currentUser);
    initNavbarBehavior();
  }

  // Inject Footer
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    footerContainer.innerHTML = buildFooter();
    initFooter();
  }

  // Set active nav link based on current page
  setActiveNavLink();

  // Set solid navbar on non-hero pages
  setNavbarStyle();
}

/* ─────────────────────────────────────────────────────────────
   NAVBAR BEHAVIOR
   ───────────────────────────────────────────────────────────── */

function initNavbarBehavior() {
  const navbar = document.getElementById('site-navbar');
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const userMenu = document.getElementById('nav-user-menu');
  const userBtn = document.getElementById('nav-user-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
  const exploreBtn = document.getElementById('explore-dropdown-btn');
  const exploreDropdown = document.getElementById('nav-explore-dropdown');

  if (!navbar) return;

  // ── Scroll: transparent → solid ──────────────────────────────
  const onScroll = throttle(() => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, 100);

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once on load

  // ── Hamburger / Mobile Menu ───────────────────────────────────
  if (hamburger && mobileMenu) {
    function toggleMobileMenu() {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      document.body.classList.toggle('modal-open', isOpen);
    }

    hamburger.addEventListener('click', toggleMobileMenu);

    // Close on any link click inside mobile menu
    mobileMenu.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('click', () => {
        if (mobileMenu.classList.contains('open')) toggleMobileMenu();
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        toggleMobileMenu();
        hamburger.focus();
      }
    });
  }

  // ── User Dropdown ──────────────────────────────────────────────
  if (userMenu && userBtn) {
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = userMenu.classList.toggle('open');
      userBtn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!userMenu.contains(e.target)) {
        userMenu.classList.remove('open');
        userBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── Explore Dropdown ──────────────────────────────────────────
  if (exploreBtn && exploreDropdown) {
    exploreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      exploreDropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!exploreDropdown.contains(e.target)) {
        exploreDropdown.classList.remove('open');
      }
    });
  }

  // ── Sign Out ──────────────────────────────────────────────────
  async function handleLogout() {
    Toast.info('Signing out…', '');

    try {
      if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        await supabaseClient.auth.signOut();
      }
    } catch (err) {
      console.warn('[Logout] signOut error:', err);
    }

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 600);
  }

  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
}

/* ─────────────────────────────────────────────────────────────
   SET ACTIVE NAV LINK
   Highlights the correct nav link based on the current URL
   ───────────────────────────────────────────────────────────── */

function setActiveNavLink() {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');

  // Determine which page we're on
  let activePage = 'home';
  if (path.includes('search')) {
    activePage = type === 'rent' ? 'rent' : 'buy';
  } else if (path.includes('property')) {
    activePage = 'property';
  } else if (path.includes('about')) {
    activePage = 'about';
  }

  // Highlight desktop nav link
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    if (link.dataset.page === activePage) {
      link.classList.add('active');
    }
  });

  // Highlight mobile nav link
  document.querySelectorAll('.mobile-nav-link[data-page]').forEach(link => {
    if (link.dataset.page === activePage) {
      link.classList.add('active');
    }
  });
}

/* ─────────────────────────────────────────────────────────────
   SET NAVBAR STYLE
   Pages without a hero get a solid navy navbar immediately.
   Pages with a hero (home page) get the transparent navbar.
   ───────────────────────────────────────────────────────────── */

function setNavbarStyle() {
  const path = window.location.pathname;
  const navbar = document.getElementById('site-navbar');
  if (!navbar) return;

  const HERO_PAGES = ['/', 'index.html', ''];

  const isHeroPage = HERO_PAGES.some(p =>
    path === p || path.endsWith('index.html') || path === ''
  );

  if (!isHeroPage) {
    navbar.classList.add('solid');
  }
}

/* ─────────────────────────────────────────────────────────────
   FOOTER BEHAVIOR
   ───────────────────────────────────────────────────────────── */

function initFooter() {
  const form = document.getElementById('footer-newsletter-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('input[type="email"]');
    const btn = form.querySelector('button[type="submit"]');
    const email = emailInput?.value?.trim();

    if (!email || !email.includes('@')) {
      Toast.error('Invalid Email', 'Please enter a valid email address.');
      emailInput?.focus();
      return;
    }

    btn.classList.add('loading');
    btn.disabled = true;

    // Newsletter subscriptions are stored locally and displayed to the demo client.
    // Wire this to Mailchimp / ConvertKit / Supabase in production.
    await new Promise(r => setTimeout(r, 600));

    btn.classList.remove('loading');
    btn.disabled = false;
    emailInput.value = '';

    Toast.gold(
      "You're on the list!",
      'Welcome to Prestige Homes. Expect exclusive insights in your inbox.'
    );

    localStorage.setItem('newsletter_subscribed', '1');
  });
}

/* ─────────────────────────────────────────────────────────────
   MAIN ENTRY POINT
   Runs when the DOM is ready
   ───────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  injectComponents();
});
