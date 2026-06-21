# Prestige Homes — Complete Setup & Deployment Guide

This is the single reference document for getting Prestige Homes from your computer onto the live internet, with every external service properly connected. Follow these steps in order.

---

## Part 1 — Project Structure Overview

```
prestige-homes/
├── index.html              ← Home page
├── search.html             ← Search results page
├── property.html           ← Property details page
├── tour.html                ← Tour booking + crypto payment
├── apply.html               ← Rental application (multi-step)
├── application-payment.html ← Application fee crypto payment
├── saved.html               ← Saved listings
├── dashboard.html           ← User dashboard
├── applications.html        ← Application history
├── tours.html               ← Tour history
├── terms.html / privacy.html / accessibility.html / sitemap.html / careers.html
├── 404.html
├── netlify.toml             ← Deployment config
├── robots.txt
├── EMAILJS_SETUP.md          ← EmailJS template setup guide
├── auth/
│   ├── login.html
│   ├── signup.html
│   ├── forgot-password.html
│   └── reset-password.html
├── css/   (10 files — design system, components, pages)
└── js/
    ├── config.js            ← ALL API keys & constants live here
    ├── utils.js              ← Toast, formatters, helpers
    ├── components.js         ← Navbar/footer injection
    ├── supabase-client.js    ← Auth client
    ├── home.js / search.js / property.js / apply.js
```

**The only file you need to edit to connect real services is `js/config.js`.**

---

## Part 2 — Supabase Setup (Authentication)

### 2.1 Create Your Account & Project

1. Go to **https://supabase.com**
2. Click **Start your project** → sign in with GitHub
3. Click **New Project**
   - **Name:** `prestige-homes`
   - **Database Password:** generate a strong one — save it in a password manager, you won't need it for this project but Supabase requires it
   - **Region:** choose the region closest to your target users
4. Click **Create new project** — wait 1-2 minutes for provisioning

### 2.2 Get Your API Keys

1. In your project, click the **gear icon (Project Settings)** in the left sidebar
2. Click **API**
3. You'll see two values you need:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **Project API keys → anon public** (a long string starting with `eyJ...`)
4. Open `js/config.js` in your code editor and replace:

```javascript
SUPABASE_URL:      'https://abcdefgh.supabase.co',
SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
```

### 2.3 Configure Email Authentication

1. In the left sidebar, click **Authentication**
2. Click **Providers**
3. Confirm **Email** is enabled (it is by default)
4. Click **Authentication → Email Templates**
   - You can customize "Confirm signup" and "Reset Password" templates here if desired, or leave the defaults

### 2.4 Configure Redirect URLs

1. Click **Authentication → URL Configuration**
2. Under **Site URL**, enter your eventual production URL (you'll update this after Netlify deployment, e.g. `https://prestige-homes-demo.netlify.app`)
3. Under **Redirect URLs**, click **Add URL** and add BOTH of these:
   - `http://localhost:5500/auth/reset-password.html` (for local testing with Live Server)
   - `https://prestige-homes-demo.netlify.app/auth/reset-password.html` (your production URL — update after deployment)

### 2.5 Test It

1. Open `auth/signup.html` in your browser (via Live Server)
2. Create a test account with a real email you can access
3. Check your inbox for a confirmation email from Supabase
4. Click the confirmation link
5. Go to `auth/login.html` and sign in with your test account
6. You should see your name appear in the navbar (top right)

**Common issue:** If signup seems to succeed but no email arrives, check your spam folder. Supabase's default email sender sometimes lands there for new projects.

---

## Part 3 — RealtyAPI Setup (Live Property Data)

This is **optional**. The site works perfectly with the built-in dummy property data (`CONFIG.DUMMY_PROPERTIES` in `js/config.js`). Connect a real API only if you want live listings.

### 3.1 Create a RapidAPI Account

1. Go to **https://rapidapi.com**
2. Click **Sign Up** (free)
3. Search for **"Realty Mole Property API"** or **"Realty in US"**
4. Click on the API, then click **Subscribe to Test**
5. Choose the **Free / Basic** tier (usually 50-150 requests/month)
6. Click **Subscribe**

### 3.2 Get Your API Key

1. On the API's dashboard page, find the **X-RapidAPI-Key** value in the code snippets section
2. Copy it

### 3.3 Update config.js

```javascript
REALTY_API_KEY:  'your-rapidapi-key-here',
REALTY_API_HOST: 'realty-mole-property-api.p.rapidapi.com', // or whichever host the API you chose uses
```

### 3.4 How the Rate Limiting Protection Works

Because free API tiers have strict limits, `js/search.js` and `js/utils.js` include several protections:

- **`ApiTracker`** limits each browser session to `CONFIG.API_MAX_CALLS_PER_SESSION` (default: 20) calls
- **`Cache`** stores API responses in `localStorage` for 30 minutes (`CONFIG.CACHE_DURATION_MS`) — repeated searches for the same location won't hit the API again
- **Debounced search** (`CONFIG.SEARCH_DEBOUNCE_MS` = 600ms) prevents API calls on every keystroke
- If the API key is left as the placeholder, or the session limit is reached, the site **automatically falls back to dummy data** — so the demo never breaks

---

## Part 4 — EmailJS Setup (Real Application Emails)

Full instructions are in **`EMAILJS_SETUP.md`** in the project root. Summary:

1. Sign up at https://www.emailjs.com (free, 200 emails/month)
2. Connect your Gmail/Outlook as an Email Service → copy the **Service ID**
3. Create a template named "Rental Application" using the HTML provided in `EMAILJS_SETUP.md` → copy the **Template ID**
4. Copy your **Public Key** from Account → General
5. Paste all three into `js/config.js`:

```javascript
EMAILJS_PUBLIC_KEY:           'your-public-key',
EMAILJS_SERVICE_ID:           'service_xxxxxxx',
EMAILJS_TEMPLATE_APPLICATION: 'template_xxxxxxx',
```

Until you do this, the application form runs in **demo mode** — it simulates the send and logs the data to the browser console, so the full flow still works for presentations.

---

## Part 5 — Update Your Contact Email & Wallet Addresses

Open `js/config.js`:

```javascript
CONTACT_EMAIL: 'contact@prestigehomes-demo.com',  // ← change to your real email
SUPPORT_EMAIL: 'support@prestigehomes-demo.com',
PHONE:         '+1 (800) 555-0199',               // ← change to your real number

WALLETS: {
  BTC: '1PrEstiGeHmSzP9f4vK8UwcqJTHNuBd2xA',  // ← replace with your real wallet for production
  ETH: '0x3A9f8B2dC1eF05a7892E4b6D3c1F0A9e7C2D4B8e',
  BNB: 'bnb1pqs0ar5p0x9r8mk2g7e3f4l6n1d2h8k3j5w7m',
},
```

**Important:** These wallet addresses are realistic-looking placeholders for the demo. Before going live with real payments, replace them with wallets you control, and consider integrating a real payment processor (Coinbase Commerce, BTCPay Server, NOWPayments) which all offer free tiers for low-volume use.

---

## Part 6 — Local Testing with VS Code Live Server

1. Open the `prestige-homes` folder in VS Code
2. Install the **Live Server** extension (by Ritwick Dey) from the Extensions marketplace
3. Right-click `index.html` → **Open with Live Server**
4. Your browser opens at `http://127.0.0.1:5500`
5. Test every page:
   - Home page → hero search → search results
   - Click a property → property details → mortgage calculator
   - Click "Book a Private Tour" → fill form → payment → confirmation
   - Click "Apply to Rent" (on a rental property) → fill 6-step form → submit → decision → payment
   - Sign up for an account → check email → sign in
   - Save a property (heart icon) → check Saved Listings page

---

## Part 7 — Push to GitHub

```bash
cd prestige-homes
git init
git add .
git commit -m "Initial commit: Prestige Homes complete build"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/prestige-homes.git
git push -u origin main
```

If you haven't created the GitHub repo yet:
1. Go to **https://github.com/new**
2. Repository name: `prestige-homes`
3. Visibility: **Public** (required for Netlify free tier... actually Netlify free tier supports private repos too, but public is simpler)
4. Do NOT initialize with a README (you already have files)
5. Click **Create repository**, then run the commands above

---

## Part 8 — Deploy to Netlify

### 8.1 Connect Your Repository

1. Go to **https://app.netlify.com**
2. Sign up / log in with GitHub
3. Click **Add new site → Import an existing project**
4. Choose **GitHub** → authorize Netlify to access your repos
5. Select your `prestige-homes` repository
6. Build settings:
   - **Build command:** leave empty
   - **Publish directory:** `.` (a single period — this is the root)
7. Click **Deploy site**

Netlify will give you a random URL like `https://chimerical-unicorn-12345.netlify.app`. Wait ~30 seconds for the first deploy.

### 8.2 Set a Custom Site Name (Free)

1. Go to **Site configuration → General → Site details**
2. Click **Change site name**
3. Enter something like `prestige-homes-demo`
4. Your new URL: `https://prestige-homes-demo.netlify.app`

### 8.3 Update Supabase Redirect URLs

Now that you have your real Netlify URL:

1. Go back to Supabase → **Authentication → URL Configuration**
2. Update **Site URL** to `https://prestige-homes-demo.netlify.app`
3. Add to **Redirect URLs**: `https://prestige-homes-demo.netlify.app/auth/reset-password.html`

### 8.4 Update config.js Site URL

In `js/config.js`:

```javascript
SITE_URL: 'https://prestige-homes-demo.netlify.app',
```

Commit and push this change — Netlify will automatically redeploy.

### 8.5 (Optional) Custom Domain

1. In Netlify, go to **Domain management → Add a domain**
2. Follow the instructions to point your domain's DNS to Netlify (usually adding a CNAME or A record at your domain registrar — e.g., Namecheap, GoDaddy, Hostinger)
3. Netlify provides free HTTPS certificates automatically via Let's Encrypt — no extra steps needed

---

## Part 9 — Final Pre-Presentation Checklist

- [ ] Home page hero loads with background image and search bar works
- [ ] Search results page shows properties, filters work, sorting works
- [ ] Property details page shows gallery, mortgage calculator, similar properties
- [ ] "Book a Private Tour" flow completes end-to-end (all 3 steps)
- [ ] "Apply to Rent" flow completes end-to-end (6 steps + decision + payment)
- [ ] Sign up creates an account and sends a confirmation email
- [ ] Sign in works after email confirmation
- [ ] Forgot password sends a reset email and reset-password page works
- [ ] Saving a property (heart icon) persists and shows on Saved Listings page
- [ ] Mobile responsive: test on a phone or Chrome DevTools mobile view
- [ ] All footer links work (Terms, Privacy, Accessibility, Sitemap, Careers)
- [ ] Newsletter signup shows success toast
- [ ] Contact form on home page shows success toast
- [ ] Welcome popup appears on first visit, dismissible
- [ ] Offer banner dismissible
- [ ] Back-to-top button appears on scroll

---

## Part 10 — Common Issues & Fixes

| Issue | Fix |
|---|---|
| Fonts/icons not loading | Check internet connection — Google Fonts & Font Awesome are loaded via CDN |
| Navbar not appearing | Check browser console for errors; ensure `config.js` loads before `utils.js` before `components.js` |
| "Failed to fetch" on signup | Supabase keys not set, or project paused (free tier pauses after 1 week of inactivity — just visit the Supabase dashboard to wake it up) |
| Emails not sending | Check `EMAILJS_SETUP.md` troubleshooting section |
| Search shows no results | Check active filters aren't too restrictive; click "Clear All Filters" |
| 404 page not showing on Netlify | Ensure `netlify.toml` is in the project root and was pushed to GitHub |
| Crypto QR codes are placeholders | This is intentional for the demo — see "Add Real QR Codes" below |

---

## Part 11 — Optional Enhancement: Real QR Codes

To replace the QR placeholder icons with real scannable QR codes (still free, no backend needed):

In `tour.html` and `application-payment.html`, replace the `.qr-placeholder` div with:

```html
<img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=WALLET_ADDRESS_HERE"
     alt="Payment QR Code" style="width:160px;height:160px;border-radius:var(--radius-xl);border:2px solid var(--border-color);"/>
```

Replace `WALLET_ADDRESS_HERE` dynamically via JavaScript using `CONFIG.WALLETS[selectedCrypto]`. This uses the free `api.qrserver.com` service — no API key required, no rate limits for reasonable use.

---

## You're Done! 🎉

Prestige Homes is now a fully functional, deployed, luxury real estate demo platform — built entirely on free tiers, ready to impress your client.
