/* ============================================================
   PRESTIGE HOMES — HOME PAGE JAVASCRIPT
   ============================================================
   Builds and populates every section of the home page.
   Depends on: config.js, utils.js, components.js
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   MAIN INIT
   ───────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize EmailJS for the contact form
  if (window.emailjs && CONFIG.EMAILJS_PUBLIC_KEY !== 'PASTE_YOUR_EMAILJS_PUBLIC_KEY_HERE') {
    emailjs.init(CONFIG.EMAILJS_PUBLIC_KEY);
  }

  buildHero();
  buildTrustBar();
  buildFeaturedListings();
  buildHowItWorks();
  buildTrendingProperties();
  buildNewsSection();
  buildTestimonials();
  buildWhyUs();
  buildFAQ();
  buildNewsletter();
  buildContact();

  // After DOM is built, init scroll reveal on new elements
  setTimeout(initScrollReveal, 100);
});

/* ─────────────────────────────────────────────────────────────
   HERO SECTION
   ───────────────────────────────────────────────────────────── */

function buildHero() {
  const section = document.getElementById('hero');
  if (!section) return;

  section.innerHTML = `
    <!-- Background Image with parallax -->
    <div class="hero-bg" aria-hidden="true">
      <img
        src="https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=1920&auto=format&q=80"
        alt="Luxury estate exterior"
        fetchpriority="high"
      />
    </div>
    <div class="hero-overlay" aria-hidden="true"></div>

    <!-- Content -->
    <div class="hero-content">

      <!-- Eyebrow -->
      <div class="hero-eyebrow">
        <i class="fa-solid fa-star" aria-hidden="true"></i>
        America's Premier Luxury Real Estate Platform
      </div>

      <!-- Headline -->
      <h1 class="hero-headline">
        Find Your <span class="headline-gold">Perfect</span><br/>
        Luxury Property
      </h1>

      <!-- Subheadline -->
      <p class="hero-subheadline">
        Over 4,200 curated luxury listings. Trusted by investors, families, 
        and discerning buyers across North America.
      </p>

      <!-- Search Box -->
      <div class="hero-search-box">
        <!-- Buy / Rent Tabs -->
        <div class="search-tabs" role="tablist" aria-label="Listing type">
          <button class="search-tab active" role="tab" aria-selected="true"
                  data-type="buy" id="tab-buy" onclick="switchSearchTab('buy')">
            <i class="fa-solid fa-tag" aria-hidden="true"></i> Buy
          </button>
          <button class="search-tab" role="tab" aria-selected="false"
                  data-type="rent" id="tab-rent" onclick="switchSearchTab('rent')">
            <i class="fa-solid fa-key" aria-hidden="true"></i> Rent
          </button>
        </div>

        <!-- Search Panel -->
        <div class="search-panel" role="tabpanel">
          <!-- Location -->
          <div class="search-field">
            <span class="search-field-label">Location</span>
            <div class="search-input-wrap">
              <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
              <input
                type="text"
                class="search-input"
                id="hero-location"
                placeholder="City, ZIP, or Address"
                autocomplete="off"
                aria-label="Search location"
              />
            </div>
          </div>

          <!-- Property Type -->
          <div class="search-field">
            <span class="search-field-label">Property Type</span>
            <div class="search-input-wrap">
              <i class="fa-solid fa-building" aria-hidden="true"></i>
              <select class="search-input" id="hero-type" aria-label="Property type" style="padding-left:2.5rem;">
                <option value="">Any Type</option>
                <option value="Single Family">Single Family</option>
                <option value="Condo">Condo / Apartment</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Villa">Villa</option>
                <option value="Estate">Estate</option>
              </select>
            </div>
          </div>

          <!-- Price Range -->
          <div class="search-field">
            <span class="search-field-label" id="price-label">Max Price</span>
            <div class="search-input-wrap">
              <i class="fa-solid fa-dollar-sign" aria-hidden="true"></i>
              <select class="search-input" id="hero-price" aria-label="Maximum price" aria-labelledby="price-label" style="padding-left:2.5rem;">
                <option value="">Any Price</option>
                <option value="500000">Up to $500K</option>
                <option value="1000000">Up to $1M</option>
                <option value="2000000">Up to $2M</option>
                <option value="5000000">Up to $5M</option>
                <option value="10000000">Up to $10M</option>
                <option value="99999999">$10M+</option>
              </select>
            </div>
          </div>

          <!-- Search Button -->
          <button class="search-btn" onclick="runHeroSearch()" aria-label="Search properties">
            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            Search
          </button>
        </div>

        <!-- Quick Links -->
        <div class="hero-quick-links" aria-label="Popular searches">
          <span class="hero-quick-link-label">Popular:</span>
          <a href="search.html?q=Manhattan+NY&type=buy" class="hero-quick-link">Manhattan, NY</a>
          <a href="search.html?q=Beverly+Hills+CA&type=buy" class="hero-quick-link">Beverly Hills, CA</a>
          <a href="search.html?q=Miami+Beach+FL&type=buy" class="hero-quick-link">Miami Beach, FL</a>
          <a href="search.html?propertyType=Penthouse&type=rent" class="hero-quick-link">Penthouses</a>
          <a href="search.html?propertyType=Estate&type=buy" class="hero-quick-link">Estates</a>
        </div>
      </div>

    </div>

    <!-- Scroll Indicator -->
    <div class="hero-scroll" onclick="document.getElementById('trust-bar').scrollIntoView({behavior:'smooth'})" aria-hidden="true">
      <div class="hero-scroll-mouse">
        <div class="hero-scroll-dot"></div>
      </div>
      <span>Scroll</span>
    </div>
  `;
}

/* ─────────────────────────────────────────────────────────────
   HERO SEARCH LOGIC
   ───────────────────────────────────────────────────────────── */

let currentSearchType = 'buy';

function switchSearchTab(type) {
  currentSearchType = type;
  document.querySelectorAll('.search-tab').forEach(tab => {
    const isActive = tab.dataset.type === type;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  // Update price label for rent context
  const priceLabel = document.getElementById('price-label');
  const priceSelect = document.getElementById('hero-price');
  if (type === 'rent') {
    if (priceLabel) priceLabel.textContent = 'Max Rent/mo';
    if (priceSelect) {
      priceSelect.innerHTML = `
        <option value="">Any Price</option>
        <option value="3000">Up to $3K/mo</option>
        <option value="5000">Up to $5K/mo</option>
        <option value="10000">Up to $10K/mo</option>
        <option value="20000">Up to $20K/mo</option>
        <option value="50000">Up to $50K/mo</option>
      `;
    }
  } else {
    if (priceLabel) priceLabel.textContent = 'Max Price';
    if (priceSelect) {
      priceSelect.innerHTML = `
        <option value="">Any Price</option>
        <option value="500000">Up to $500K</option>
        <option value="1000000">Up to $1M</option>
        <option value="2000000">Up to $2M</option>
        <option value="5000000">Up to $5M</option>
        <option value="10000000">Up to $10M</option>
        <option value="99999999">$10M+</option>
      `;
    }
  }
}

function runHeroSearch() {
  const location = document.getElementById('hero-location')?.value?.trim() || '';
  const propType = document.getElementById('hero-type')?.value || '';
  const price = document.getElementById('hero-price')?.value || '';

  const params = new URLSearchParams();
  params.set('type', currentSearchType);
  if (location) params.set('q', location);
  if (propType) params.set('propertyType', propType);
  if (price) params.set('maxPrice', price);

  window.location.href = `search.html?${params.toString()}`;
}

// Allow pressing Enter in location input to search
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement?.id === 'hero-location') {
      runHeroSearch();
    }
  });
});

/* ─────────────────────────────────────────────────────────────
   TRUST BAR
   ───────────────────────────────────────────────────────────── */

function buildTrustBar() {
  const section = document.getElementById('trust-bar');
  if (!section) return;

  const stats = [
    { icon: 'fa-solid fa-building', value: 4200, suffix: '+', label: 'Luxury Listings' },
    { icon: 'fa-solid fa-handshake', value: 2800, suffix: '+', label: 'Deals Closed' },
    { icon: 'fa-solid fa-star', value: 98, suffix: '%', label: 'Client Satisfaction' },
    { icon: 'fa-solid fa-trophy', value: 17, suffix: ' yrs', label: 'Avg. Agent Experience' },
  ];

  section.innerHTML = `
    <div class="trust-bar-inner">
      ${stats.map((s, i) => `
        <div class="trust-stat reveal delay-${i * 100}" aria-label="${s.value}${s.suffix} ${s.label}">
          <div class="trust-stat-icon" aria-hidden="true">
            <i class="${s.icon}"></i>
          </div>
          <div class="trust-stat-text">
            <div class="trust-stat-value" data-count="${s.value}" data-suffix="${s.suffix}">0</div>
            <div class="trust-stat-label">${s.label}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Animate counters when trust bar enters viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        section.querySelectorAll('[data-count]').forEach(el => {
          const target = parseInt(el.dataset.count);
          const suffix = el.dataset.suffix || '';
          animateCount(el, 0, target, 1800, suffix);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(section);
}

/* ─────────────────────────────────────────────────────────────
   FEATURED LISTINGS
   ───────────────────────────────────────────────────────────── */

function buildFeaturedListings() {
  const section = document.getElementById('featured');
  if (!section) return;

  const featured = CONFIG.DUMMY_PROPERTIES.filter(p => p.featured).slice(0, 3);

  section.innerHTML = `
    <div class="container">
      <div class="section-header-row">
        <div class="section-titles reveal">
          <span class="section-eyebrow">Hand-Picked For You</span>
          <h2>Featured Properties</h2>
          <p class="section-subtitle">Our curated selection of the most exceptional listings available right now.</p>
        </div>
        <a href="search.html?featured=true" class="section-view-all reveal">
          View All <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
        </a>
      </div>
      <div class="property-grid" id="featured-grid">
        ${featured.map((p, i) => renderPropertyCard(p, { delay: i * 100 })).join('')}
      </div>
    </div>
  `;
}

/* ─────────────────────────────────────────────────────────────
   HOW IT WORKS
   ───────────────────────────────────────────────────────────── */

function buildHowItWorks() {
  const section = document.getElementById('how-it-works');
  if (!section) return;

  const steps = [
    {
      number: '01',
      icon: 'fa-solid fa-magnifying-glass',
      title: 'Search & Discover',
      desc: 'Browse thousands of curated luxury listings filtered by your exact criteria — location, price, size, and amenities.',
    },
    {
      number: '02',
      icon: 'fa-solid fa-calendar-check',
      title: 'Book a Private Tour',
      desc: 'Schedule an exclusive private viewing at your convenience. Our agents prepare a bespoke experience for every tour.',
    },
    {
      number: '03',
      icon: 'fa-solid fa-file-signature',
      title: 'Apply or Make an Offer',
      desc: 'Submit your rental application or purchase offer through our seamless digital platform — done in minutes.',
    },
    {
      number: '04',
      icon: 'fa-solid fa-house-circle-check',
      title: 'Move Into Your Dream Home',
      desc: 'Our concierge team handles every detail from paperwork to keys — ensuring a flawless transition to your new home.',
    },
  ];

  section.innerHTML = `
    <div class="container">
      <div class="section-header center reveal">
        <span class="section-eyebrow">Simple Process</span>
        <h2>From Search to Keys<br/>in Four Steps</h2>
        <p class="section-subtitle">
          We've streamlined the entire real estate journey so you can focus on 
          what matters — finding the perfect property.
        </p>
      </div>

      <div class="steps-grid">
        ${steps.map((step, i) => `
          <div class="step-card reveal delay-${i * 150}">
            <div class="step-number" aria-hidden="true">${step.number}</div>
            <div class="step-icon-wrap" aria-hidden="true">
              <i class="${step.icon}"></i>
            </div>
            <h3 class="step-title">${step.title}</h3>
            <p class="step-desc">${step.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ─────────────────────────────────────────────────────────────
   TRENDING PROPERTIES
   ───────────────────────────────────────────────────────────── */

function buildTrendingProperties() {
  const section = document.getElementById('trending');
  if (!section) return;

  const trending = CONFIG.DUMMY_PROPERTIES.filter(p => p.trending).slice(0, 4);

  section.innerHTML = `
    <div class="container">
      <div class="section-header-row">
        <div class="section-titles reveal">
          <span class="section-eyebrow">High Demand</span>
          <h2>Trending Right Now</h2>
          <p class="section-subtitle">Properties receiving the most attention from qualified buyers this week.</p>
        </div>
        <a href="search.html?trending=true" class="section-view-all reveal">
          View All <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
        </a>
      </div>
      <div class="property-grid-4" id="trending-grid">
        ${trending.map((p, i) => renderPropertyCard(p, { delay: i * 100 })).join('')}
      </div>
    </div>
  `;
}

/* ─────────────────────────────────────────────────────────────
   NEWS SECTION
   ───────────────────────────────────────────────────────────── */

function buildNewsSection() {
  const section = document.getElementById('news');
  if (!section) return;

  section.innerHTML = `
    <div class="container">
      <div class="section-header center reveal">
        <span class="section-eyebrow">Stay Informed</span>
        <h2>Market Insights</h2>
        <p class="section-subtitle">Expert analysis and trends from America's luxury real estate market.</p>
      </div>
      <div class="news-grid">
        ${CONFIG.NEWS.map((article, i) => `
          <a href="#" class="news-card reveal delay-${i * 100}" aria-label="${article.title}">
            <div class="news-card-image">
              <img src="${article.image}" alt="${article.title}" loading="lazy" />
            </div>
            <div class="news-card-body">
              <div class="news-card-meta">
                <span class="news-card-category">${article.category}</span>
                <span class="news-card-date">${article.date}</span>
                <span class="news-card-read-time"><i class="fa-regular fa-clock" aria-hidden="true"></i> ${article.readTime}</span>
              </div>
              <h3 class="news-card-title">${article.title}</h3>
              <p class="news-card-excerpt">${article.excerpt}</p>
              <span class="news-card-link">
                Read Article <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </span>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

/* ─────────────────────────────────────────────────────────────
   TESTIMONIALS
   ───────────────────────────────────────────────────────────── */

function buildTestimonials() {
  const section = document.getElementById('testimonials');
  if (!section) return;

  section.innerHTML = `
    <div class="container">
      <div class="section-header center reveal">
        <span class="section-eyebrow">Client Stories</span>
        <h2>Words From Our Clients</h2>
        <p class="section-subtitle" style="color:rgba(255,255,255,0.50);">
          Join thousands of satisfied clients who found their perfect home through Prestige Homes.
        </p>
      </div>
      <div class="testimonials-grid">
        ${CONFIG.TESTIMONIALS.map((t, i) => `
          <div class="testimonial-card reveal delay-${(i % 2) * 200}">
            <div class="testimonial-quote-icon" aria-hidden="true">
              <i class="fa-solid fa-quote-left"></i>
            </div>
            <p class="testimonial-text">${t.text}</p>
            <div class="testimonial-footer">
              <div class="testimonial-avatar" style="background:${t.avatarColor};" aria-hidden="true">
                ${t.avatar}
              </div>
              <div class="testimonial-info">
                <div class="testimonial-name">${t.name}</div>
                <div class="testimonial-role">${t.role} · ${t.location}</div>
              </div>
              ${renderStars(t.rating)}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ─────────────────────────────────────────────────────────────
   WHY CHOOSE US
   ───────────────────────────────────────────────────────────── */

function buildWhyUs() {
  const section = document.getElementById('about');
  if (!section) return;

  const benefits = [
    {
      icon: 'fa-solid fa-crown',
      title: 'Top 5% Properties Only',
      desc: 'Every listing is rigorously vetted against our 47-point quality checklist. We never compromise on standards.',
    },
    {
      icon: 'fa-solid fa-user-tie',
      title: 'Expert Local Agents',
      desc: 'Our agents average 17 years of experience in luxury markets and carry relationships with the most exclusive sellers.',
    },
    {
      icon: 'fa-solid fa-shield-halved',
      title: 'Verified Listings',
      desc: 'Every property is independently verified. You\'ll never encounter ghost listings or outdated information on our platform.',
    },
    {
      icon: 'fa-solid fa-clock',
      title: '24/7 Concierge Support',
      desc: 'Your dedicated property advisor is available around the clock — because the perfect home doesn\'t keep business hours.',
    },
    {
      icon: 'fa-solid fa-globe',
      title: 'International Reach',
      desc: 'Serving clients across 40+ countries. Expert guidance on cross-border purchases, visas, and international mortgages.',
    },
    {
      icon: 'fa-solid fa-chart-line',
      title: 'Market Intelligence',
      desc: 'Proprietary data and analytics give our clients an information edge. Know the right price before you make an offer.',
    },
  ];

  section.innerHTML = `
    <div class="container">
      <div class="section-header center reveal">
        <span class="section-eyebrow">The Prestige Difference</span>
        <h2>Why Discerning Clients<br/>Choose Us</h2>
        <p class="section-subtitle">
          Not all real estate agencies are created equal. Here's what sets Prestige Homes apart.
        </p>
      </div>
      <div class="benefits-grid">
        ${benefits.map((b, i) => `
          <div class="benefit-card reveal delay-${(i % 3) * 150}">
            <div class="benefit-icon" aria-hidden="true"><i class="${b.icon}"></i></div>
            <h3 class="benefit-title">${b.title}</h3>
            <p class="benefit-desc">${b.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ─────────────────────────────────────────────────────────────
   FAQ ACCORDION
   ───────────────────────────────────────────────────────────── */

function buildFAQ() {
  const section = document.getElementById('faq');
  if (!section) return;

  section.innerHTML = `
    <div class="container">
      <div class="faq-layout">

        <!-- Sidebar -->
        <div class="faq-sidebar reveal">
          <span class="section-eyebrow">Got Questions?</span>
          <h2>Frequently Asked Questions</h2>
          <p class="section-subtitle mt-4">
            Everything you need to know about buying, renting, and touring 
            properties through Prestige Homes.
          </p>
          <div class="faq-sidebar-cta">
            <h4>Still have questions?</h4>
            <p>Our property advisors are available 24/7 to help you with anything you need.</p>
            <a href="#contact" class="btn btn-primary" onclick="document.getElementById('contact').scrollIntoView({behavior:'smooth'}); return false;">
              <i class="fa-solid fa-comments" aria-hidden="true"></i>
              Speak to an Advisor
            </a>
          </div>
        </div>

        <!-- Accordion -->
        <div class="faq-list reveal delay-200" id="faq-list">
          ${CONFIG.FAQ.map((item, i) => `
            <div class="faq-item" id="faq-${i}">
              <button
                class="faq-question"
                onclick="toggleFAQ(${i})"
                aria-expanded="false"
                aria-controls="faq-answer-${i}"
              >
                <span>${item.q}</span>
                <span class="faq-toggle" aria-hidden="true">
                  <i class="fa-solid fa-chevron-down"></i>
                </span>
              </button>
              <div class="faq-answer" id="faq-answer-${i}" role="region">
                <div class="faq-answer-inner">${item.a}</div>
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    </div>
  `;

  // Open first item by default
  setTimeout(() => toggleFAQ(0), 300);
}

function toggleFAQ(index) {
  const allItems = document.querySelectorAll('.faq-item');
  allItems.forEach((item, i) => {
    const btn = item.querySelector('.faq-question');
    if (i === index) {
      const isOpen = item.classList.toggle('open');
      btn?.setAttribute('aria-expanded', String(isOpen));
    } else {
      item.classList.remove('open');
      item.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ─────────────────────────────────────────────────────────────
   NEWSLETTER CTA
   ───────────────────────────────────────────────────────────── */

function buildNewsletter() {
  const section = document.getElementById('newsletter');
  if (!section) return;

  section.innerHTML = `
    <div class="container">
      <div class="newsletter-inner">
        <span class="section-eyebrow">Stay Connected</span>
        <h2>Never Miss an Exclusive Listing</h2>
        <p class="section-subtitle">
          Join 24,000+ subscribers receiving weekly market reports, 
          off-market opportunities, and curated listings before anyone else.
        </p>
        <form class="newsletter-cta-form" id="newsletter-cta-form" novalidate>
          <label for="newsletter-email-cta" class="sr-only">Email address</label>
          <input
            type="email"
            id="newsletter-email-cta"
            class="newsletter-cta-input"
            placeholder="Enter your email address"
            autocomplete="email"
            required
            aria-required="true"
          />
          <button type="submit" class="btn btn-primary btn-lg">
            Subscribe <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
          </button>
        </form>
        <p class="newsletter-cta-note">
          <i class="fa-solid fa-lock" aria-hidden="true"></i>
          No spam, ever. Unsubscribe with one click at any time.
        </p>
      </div>
    </div>
  `;

  document.getElementById('newsletter-cta-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const btn = e.target.querySelector('button[type="submit"]');
    const email = input?.value?.trim();

    if (!email || !email.includes('@')) {
      Toast.error('Invalid Email', 'Please enter a valid email address.');
      input?.focus();
      return;
    }

    btn.classList.add('loading');
    btn.disabled = true;

    // Newsletter subscriptions are stored locally for the demo.
    // Wire to Mailchimp / ConvertKit / Supabase in production.
    await new Promise(r => setTimeout(r, 500));

    btn.classList.remove('loading');
    btn.disabled = false;
    if (input) input.value = '';

    Toast.gold("You're subscribed!", 'Welcome to Prestige Homes. Check your inbox for a confirmation.');
    localStorage.setItem('newsletter_subscribed', '1');
  });
}

/* ─────────────────────────────────────────────────────────────
   CONTACT SECTION
   ───────────────────────────────────────────────────────────── */

function buildContact() {
  const section = document.getElementById('contact');
  if (!section) return;

  section.innerHTML = `
    <div class="container">
      <div class="contact-layout">

        <!-- Info side -->
        <div class="contact-info reveal">
          <span class="section-eyebrow">Get In Touch</span>
          <h2 class="contact-info-title">
            Let's Find Your<br/><span>Perfect Property</span>
          </h2>
          <p class="contact-info-desc">
            Whether you're buying, selling, or simply exploring your options — 
            our expert advisors are ready to guide you every step of the way.
          </p>

          <div class="contact-channels">
            <a href="tel:${CONFIG.PHONE}" class="contact-channel">
              <div class="contact-channel-icon"><i class="fa-solid fa-phone" aria-hidden="true"></i></div>
              <div>
                <div class="contact-channel-label">Call Us</div>
                <div class="contact-channel-value">${CONFIG.PHONE}</div>
              </div>
              <i class="fa-solid fa-chevron-right" style="color:var(--gray-300); margin-left:auto;" aria-hidden="true"></i>
            </a>
            <a href="mailto:${CONFIG.CONTACT_EMAIL}" class="contact-channel">
              <div class="contact-channel-icon"><i class="fa-solid fa-envelope" aria-hidden="true"></i></div>
              <div>
                <div class="contact-channel-label">Email Us</div>
                <div class="contact-channel-value">${CONFIG.CONTACT_EMAIL}</div>
              </div>
              <i class="fa-solid fa-chevron-right" style="color:var(--gray-300); margin-left:auto;" aria-hidden="true"></i>
            </a>
            <div class="contact-channel">
              <div class="contact-channel-icon"><i class="fa-regular fa-clock" aria-hidden="true"></i></div>
              <div>
                <div class="contact-channel-label">Office Hours</div>
                <div class="contact-channel-value">Mon–Sat, 8AM – 9PM EST</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form side -->
        <div class="contact-form-card reveal delay-200">
          <h3 class="contact-form-title">Send a Message</h3>
          <form id="contact-form" novalidate>
            <div style="display:flex;flex-direction:column;gap:var(--space-4);">
              <div class="contact-form-row">
                <div class="form-group">
                  <label class="form-label" for="contact-name">Full Name <span class="required" aria-hidden="true">*</span></label>
                  <input type="text" class="form-input" id="contact-name" placeholder="Your full name" required autocomplete="name" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="contact-email">Email <span class="required" aria-hidden="true">*</span></label>
                  <input type="email" class="form-input" id="contact-email" placeholder="your@email.com" required autocomplete="email" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="contact-interest">I'm Interested In</label>
                <select class="form-select" id="contact-interest">
                  <option value="">Select an option</option>
                  <option value="buy">Buying a Property</option>
                  <option value="rent">Renting a Property</option>
                  <option value="invest">Investment Opportunities</option>
                  <option value="sell">Selling My Property</option>
                  <option value="other">General Enquiry</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="contact-message">Message <span class="required" aria-hidden="true">*</span></label>
                <textarea class="form-input form-textarea" id="contact-message" placeholder="Tell us what you're looking for..." required rows="4"></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-lg btn-full" id="contact-submit-btn">
                <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
                Send Message
              </button>
              <p style="font-size:var(--text-xs);color:var(--gray-400);text-align:center;">
                We respond within 2 business hours. Your data is never shared.
              </p>
            </div>
          </form>
        </div>

      </div>
    </div>
  `;

  document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('contact-submit-btn');
    const name = document.getElementById('contact-name')?.value?.trim();
    const email = document.getElementById('contact-email')?.value?.trim();
    const interest = document.getElementById('contact-interest')?.value || 'Not specified';
    const msg = document.getElementById('contact-message')?.value?.trim();

    if (!name || !email || !msg) {
      Toast.error('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    if (!window.emailjs || !isEmailJSConfigured()) {
      Toast.error(
        'Email Service Unavailable',
        'The contact form is not yet configured. Please email us directly at ' + CONFIG.CONTACT_EMAIL
      );
      return;
    }

    btn.classList.add('loading');
    btn.disabled = true;

    try {
      await emailjs.send(CONFIG.EMAILJS_SERVICE_ID, CONFIG.EMAILJS_TEMPLATE_CONTACT, {
        from_name: name,
        from_email: email,
        interest,
        message: msg,
      });

      e.target.reset();
      Toast.success('Message Sent!', `Thank you, ${name.split(' ')[0]}. We'll be in touch within 2 hours.`);

    } catch (err) {
      console.error('[Contact Form] EmailJS error:', err);
      Toast.error(
        'Message Not Sent',
        'There was a problem sending your message. Please email us directly at ' + CONFIG.CONTACT_EMAIL
      );
    } finally {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  });
}
