/* ============================================================
   PRESTIGE HOMES — CONFIGURATION
   ============================================================
   This file holds all project-wide constants and configuration.
   
   IMPORTANT: This is a DEMO project. API keys shown here are
   placeholders. Replace them before going live.
   
   For production: move secret keys to environment variables
   and use a backend server — NEVER expose real secrets in
   client-side JavaScript.
   ============================================================ */

const CONFIG = {

  /* ──────────────────────────────────────────────────────────
     SITE
     ────────────────────────────────────────────────────────── */

  SITE_NAME: 'Prestige Homes',
  SITE_TAGLINE: 'Luxury Real Estate',
  SITE_URL: 'https://prestige-homes-demo.netlify.app',  // Update after deployment

  // NOTE: The crypto payment workflow is the ONLY demonstrative
  // system in this project. All other integrations (Supabase Auth,
  // Realty API, EmailJS) are real and must have valid credentials.
  CRYPTO_PAYMENT_IS_DEMO: true,

  CONTACT_EMAIL: 'prestigehomerents@gmail.com',
  SUPPORT_EMAIL: 'prestigehomerents@gmail.com',
  PHONE: '+1 (800) 555-0199',

  /* ──────────────────────────────────────────────────────────
     SUPABASE AUTH
     Replace these with your real values from supabase.com
     ────────────────────────────────────────────────────────── */

  SUPABASE_URL: 'https://toskdcvtrdilfvgwshde.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvc2tkY3Z0cmRpbGZ2Z3dzaGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MDUxNzIsImV4cCI6MjA5Njk4MTE3Mn0.KNj40HT-F0_2Dp64hoXEmgJO5kCbp7YNXa121FqFLDM',


  REALTY_API_KEY: '16c7bfd387msh7f7ffb970df941dp16c228jsncfb93753dc67',
  REALTY_API_HOST: 'realty-in-us.p.rapidapi.com',

  // How long to cache API results in localStorage (milliseconds)
  CACHE_DURATION_MS: 1000 * 60 * 30,  // 30 minutes

  // Maximum API calls per session (prevents burning through free tier)
  API_MAX_CALLS_PER_SESSION: 20,

  /* ──────────────────────────────────────────────────────────
     EMAILJS
     Register at: https://www.emailjs.com
     ────────────────────────────────────────────────────────── */

  /* ──────────────────────────────────────────────────────────
     EMAILJS
     All three IDs below must be filled in for email to work.
     See EMAILJS_SETUP.md for step-by-step instructions.
     Tour and Application emails are sent AFTER the user clicks
     "I Have Made Payment" on the respective payment pages.
     ────────────────────────────────────────────────────────── */

  EMAILJS_PUBLIC_KEY: 'ClROSptatzh81S1CH',
  EMAILJS_SERVICE_ID: 'service_do2yjd8',
  EMAILJS_TEMPLATE_TOUR: 'template_h5zgaw8',
  EMAILJS_TEMPLATE_APPLICATION: 'template_tjpvfsd',


  WALLETS: {
    BTC: 'bc1qxydjdsd49kwtjdjv73g4925xfvfn4j4dz78tes',
    ETH: '0xc2A3830B244A716Da75cdEE4c950aEedC92d9114',
    BNB: '0xc2A3830B244A716Da75cdEE4c950aEedC92d9114',
  },

  /* ──────────────────────────────────────────────────────────
     TOUR & APPLICATION FEE
     ────────────────────────────────────────────────────────── */

  TOUR_FEE_USD: 90,
  TOUR_FEE_BTC: '0.0014',
  TOUR_FEE_ETH: '0.052',
  TOUR_FEE_BNB: '0.15',

  APPLICATION_FEE_USD: 100,
  APPLICATION_FEE_BTC: '0.0016',
  APPLICATION_FEE_ETH: '0.058',
  APPLICATION_FEE_BNB: '0.17',

  // Countdown timer duration for payment pages (minutes)
  PAYMENT_TIMER_MINUTES: 30,

  /* ──────────────────────────────────────────────────────────
     PROPERTY SEARCH DEFAULTS
     ────────────────────────────────────────────────────────── */

  DEFAULT_LOCATION: 'New York, NY',
  DEFAULT_LISTING_TYPE: 'buy',           // 'buy' or 'rent'
  RESULTS_PER_PAGE: 12,

  // Debounce delay for search input (ms)
  SEARCH_DEBOUNCE_MS: 600,

  /* ──────────────────────────────────────────────────────────
     DUMMY PROPERTY DATA (used as fallback when API is down)
     ────────────────────────────────────────────────────────── */

  DUMMY_PROPERTIES: [
    {
      id: 'prop_001',
      formattedAddress: '14 Kensington Manor, Upper East Side, New York, NY 10065',
      addressLine1: '14 Kensington Manor',
      city: 'New York',
      state: 'NY',
      zipCode: '10065',
      propertyType: 'Condo',
      listingType: 'buy',
      price: 4750000,
      bedrooms: 4,
      bathrooms: 3.5,
      squareFootage: 3200,
      yearBuilt: 2019,
      description: "A rare opportunity to own a magnificent four-bedroom residence in one of Manhattan's most coveted addresses. Featuring soaring ceilings, bespoke finishes, and panoramic skyline views from every room. The chef's kitchen boasts imported Italian marble countertops and professional-grade appliances. The primary suite offers a private spa bathroom with heated floors.",
      amenities: ['Concierge', 'Rooftop Terrace', 'Fitness Center', 'Wine Cellar', 'Smart Home', 'Private Garage'],
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format',
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&auto=format',
        'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=1200&auto=format',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format',
      ],
      agent: { name: 'Victoria Hartwell', phone: '+1 (212) 555-0147', rating: 4.9 },
      featured: true,
      trending: false,
      new: true,
    },
    {
      id: 'prop_002',
      formattedAddress: '380 Pinnacle Drive, Beverly Hills, CA 90210',
      addressLine1: '380 Pinnacle Drive',
      city: 'Beverly Hills',
      state: 'CA',
      zipCode: '90210',
      propertyType: 'Single Family',
      listingType: 'buy',
      price: 8900000,
      bedrooms: 6,
      bathrooms: 7,
      squareFootage: 7800,
      yearBuilt: 2021,
      description: "An architectural masterpiece perched atop the hills of Beverly Hills, offering unobstructed views of the Los Angeles basin. This ultra-luxury estate features a resort-style pool, home theater, and fully equipped wellness center. The grounds are meticulously landscaped with native California flora.",
      amenities: ['Infinity Pool', 'Home Theater', 'Wine Cellar', 'Gym', 'Guest House', '8-Car Garage', 'Smart Home', 'Solar'],
      images: [
        'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=1200&auto=format',
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format',
      ],
      agent: { name: 'James Ashford', phone: '+1 (310) 555-0193', rating: 5.0 },
      featured: true,
      trending: true,
      new: false,
    },
    {
      id: 'prop_003',
      formattedAddress: '22 Lakefront Circle, Chicago, IL 60611',
      addressLine1: '22 Lakefront Circle',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60611',
      propertyType: 'Penthouse',
      listingType: 'rent',
      price: 18500,
      bedrooms: 3,
      bathrooms: 3,
      squareFootage: 2650,
      yearBuilt: 2020,
      description: "Spectacular penthouse offering 270-degree views of Lake Michigan and the Chicago skyline. This fully furnished residence features floor-to-ceiling windows, a wraparound terrace, and bespoke interior design by a Chicago-based award-winning firm.",
      amenities: ['Wraparound Terrace', 'Concierge', 'Valet Parking', 'Furnished', 'Lake Views', 'Gym', 'Pool'],
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format',
        'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=1200&auto=format',
        'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200&auto=format',
        'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=1200&auto=format',
      ],
      agent: { name: 'Sophia Chen', phone: '+1 (312) 555-0128', rating: 4.8 },
      featured: true,
      trending: true,
      new: false,
    },
    {
      id: 'prop_004',
      formattedAddress: '9 Harborview Crescent, Miami Beach, FL 33139',
      addressLine1: '9 Harborview Crescent',
      city: 'Miami Beach',
      state: 'FL',
      zipCode: '33139',
      propertyType: 'Villa',
      listingType: 'buy',
      price: 6200000,
      bedrooms: 5,
      bathrooms: 5.5,
      squareFootage: 5400,
      yearBuilt: 2022,
      description: "A stunning waterfront villa featuring direct ocean access and its own private dock. The open-plan design flows effortlessly from the gourmet kitchen to the covered terrace and infinity pool. Smart home automation controls every aspect of this magnificent property.",
      amenities: ['Private Dock', 'Infinity Pool', 'Smart Home', 'Home Theater', 'Ocean View', 'Guest Suite'],
      images: [
        'https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=1200&auto=format',
        'https://images.unsplash.com/photo-1527030280862-64139fba04ca?w=1200&auto=format',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&auto=format',
      ],
      agent: { name: 'Marcus Rivera', phone: '+1 (305) 555-0174', rating: 4.7 },
      featured: false,
      trending: true,
      new: true,
    },
    {
      id: 'prop_005',
      formattedAddress: '7 Willow Glen, Napa Valley, CA 94558',
      addressLine1: '7 Willow Glen Estate',
      city: 'Napa',
      state: 'CA',
      zipCode: '94558',
      propertyType: 'Estate',
      listingType: 'buy',
      price: 12500000,
      bedrooms: 7,
      bathrooms: 9,
      squareFootage: 11200,
      yearBuilt: 2018,
      description: "Set on 12 private acres in the heart of Napa Valley, this extraordinary estate features its own vineyard, wine cave, and a fully equipped winery. The main residence showcases cathedral ceilings, stone fireplaces, and hand-hewn wood beams throughout.",
      amenities: ['Private Vineyard', 'Wine Cave', 'Heated Pool', 'Tennis Court', 'Caretaker Cottage', 'Helipad'],
      images: [
        'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200&auto=format',
        'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=1200&auto=format',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&auto=format',
      ],
      agent: { name: 'Eleanor Whitfield', phone: '+1 (707) 555-0161', rating: 5.0 },
      featured: true,
      trending: false,
      new: false,
    },
    {
      id: 'prop_006',
      formattedAddress: '31 Park Avenue South, Midtown, New York, NY 10010',
      addressLine1: '31 Park Avenue South, Apt 4201',
      city: 'New York',
      state: 'NY',
      zipCode: '10010',
      propertyType: 'Condo',
      listingType: 'rent',
      price: 12000,
      bedrooms: 2,
      bathrooms: 2,
      squareFootage: 1450,
      yearBuilt: 2017,
      description: "Ultra-modern two-bedroom condo in the heart of Midtown Manhattan. Floor-to-ceiling windows offer sweeping views of the Empire State Building. The open-concept living space features custom millwork and integrated smart home technology throughout.",
      amenities: ['Doorman', 'Gym', 'Rooftop Lounge', 'Bike Storage', 'Package Room', 'Pet-Friendly'],
      images: [
        'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=1200&auto=format',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&auto=format',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format',
        'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=1200&auto=format',
      ],
      agent: { name: 'David Park', phone: '+1 (212) 555-0188', rating: 4.6 },
      featured: false,
      trending: false,
      new: true,
    },
  ],

  /* ──────────────────────────────────────────────────────────
     TESTIMONIALS (Dummy data)
     ────────────────────────────────────────────────────────── */

  TESTIMONIALS: [
    {
      id: 1,
      name: 'Alexandra Pemberton',
      role: 'Property Investor',
      location: 'New York, NY',
      rating: 5,
      text: "Prestige Homes completely transformed my property investment journey. Their team identified opportunities I never would have found on my own, and the process was seamless from start to finish. I've now acquired three properties through them.",
      avatar: 'AP',
      avatarColor: '#D4AF37',
    },
    {
      id: 2,
      name: 'William Thornton III',
      role: 'Tech Executive',
      location: 'San Francisco, CA',
      rating: 5,
      text: "After years of working with traditional agents, Prestige Homes was a revelation. Their digital-first approach, combined with genuine expertise in luxury markets, made finding our dream home a pleasure rather than a chore.",
      avatar: 'WT',
      avatarColor: '#0F172A',
    },
    {
      id: 3,
      name: 'Isabelle Fontaine',
      role: 'Interior Designer',
      location: 'Miami, FL',
      rating: 5,
      text: "The level of personalization Prestige Homes provides is unmatched. They listened to exactly what I needed and presented only properties that truly fit my criteria. I closed on my beachfront villa in under three weeks.",
      avatar: 'IF',
      avatarColor: '#334155',
    },
    {
      id: 4,
      name: 'Michael Okonkwo',
      role: 'Investment Banker',
      location: 'Chicago, IL',
      rating: 5,
      text: "I've worked with real estate agencies across four continents, and Prestige Homes sets the global standard. Their market intelligence, negotiation skills, and white-glove service are simply incomparable.",
      avatar: 'MO',
      avatarColor: '#1E293B',
    },
  ],

  /* ──────────────────────────────────────────────────────────
     FAQ DATA
     ────────────────────────────────────────────────────────── */

  FAQ: [
    {
      q: 'How do I schedule a property tour?',
      a: 'Click the "Book Tour" button on any property listing page. You\'ll be guided through our premium tour booking experience, which includes flexible scheduling options and a tour fee to confirm your booking. Our team will contact you within 2 hours to confirm all details.',
    },
    {
      q: 'Is the tour fee refundable?',
      a: 'The tour booking fee of $90 is fully credited toward your purchase or first month\'s rent if you proceed with the property. If you decide not to proceed, the fee is non-refundable but covers our agent\'s time, property preparation, and travel costs.',
    },
    {
      q: 'What documents do I need to apply for a rental?',
      a: 'Our online application collects all necessary information digitally. You\'ll need proof of income (recent pay stubs or bank statements), employment verification, and references. Our system processes applications within 24 hours.',
    },
    {
      q: 'Do you handle international buyers?',
      a: 'Absolutely. We specialize in serving international clientele and have extensive experience with cross-border transactions, foreign buyer regulations, and currency considerations. We offer multilingual support and can connect you with international mortgage specialists.',
    },
    {
      q: 'How is Prestige Homes different from other agencies?',
      a: 'We curate only the top 5% of available properties in each market, ensuring every listing meets our premium standards. Our agents average 15+ years of luxury market experience, and we provide concierge-level support throughout every transaction.',
    },
    {
      q: 'What cryptocurrencies do you accept for fees?',
      a: 'We accept Bitcoin (BTC), Ethereum (ETH), and Binance Coin (BNB) for tour booking and application processing fees. All crypto transactions are processed securely, and you\'ll receive confirmation within the standard network confirmation time.',
    },
  ],

  /* ──────────────────────────────────────────────────────────
     NEWS / MARKET INSIGHTS
     ────────────────────────────────────────────────────────── */

  NEWS: [
    {
      id: 1,
      category: 'Market Insight',
      title: 'Manhattan Luxury Market Sees Record Q3 Sales',
      excerpt: 'Properties above $5M saw a 23% increase in transaction volume this quarter, driven by returning international buyers and strong domestic demand.',
      date: 'Nov 2024',
      readTime: '4 min',
      image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&auto=format',
    },
    {
      id: 2,
      category: 'Investment',
      title: 'Miami Beach Waterfront Properties: A Decade of Growth',
      excerpt: 'Waterfront properties in Miami-Dade County have appreciated an average of 182% over the past decade, outperforming all other Florida luxury segments.',
      date: 'Oct 2024',
      readTime: '6 min',
      image: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=600&auto=format',
    },
    {
      id: 3,
      category: 'Lifestyle',
      title: 'The Rise of Smart Home Features in Luxury Real Estate',
      excerpt: 'Buyers in the $2M+ segment now consider integrated smart home systems a baseline expectation rather than a premium feature.',
      date: 'Sep 2024',
      readTime: '3 min',
      image: 'https://images.unsplash.com/photo-1558002038-1055e2dae1d7?w=600&auto=format',
    },
  ],

};

// Lock CONFIG so nothing can accidentally overwrite it
Object.freeze(CONFIG);
Object.freeze(CONFIG.WALLETS);
