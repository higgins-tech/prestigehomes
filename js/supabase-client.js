/* ============================================================
   PRESTIGE HOMES — SUPABASE CLIENT
   ============================================================
   Real Supabase authentication — no demo mode, no mocks.

   If CONFIG.SUPABASE_URL or CONFIG.SUPABASE_ANON_KEY are not
   set, supabaseClient remains null. Auth helper functions
   check for this and return null / throw meaningful errors
   so calling code can show a proper user-facing message.

   Variable naming: our client is `supabaseClient` (not
   `supabase`) to avoid colliding with the SDK's own global
   `window.supabase` namespace exposed by the CDN script tag.

   SETUP:
   1. https://supabase.com → New project
   2. Project Settings → API → copy Project URL + anon key
   3. Paste both into js/config.js (SUPABASE_URL / SUPABASE_ANON_KEY)
   4. Authentication → URL Configuration → add redirect URLs:
        http://localhost:5500/auth/reset-password.html
        https://your-domain.netlify.app/auth/reset-password.html
   ============================================================ */

'use strict';

let supabaseClient = null;

function initSupabase() {
  if (supabaseClient) return supabaseClient; // already initialized

  const url = CONFIG.SUPABASE_URL;
  const key = CONFIG.SUPABASE_ANON_KEY;

  if (!url || url === 'PASTE_YOUR_SUPABASE_URL_HERE' ||
    !key || key === 'PASTE_YOUR_SUPABASE_ANON_KEY_HERE') {
    console.error('[Supabase] Credentials not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in js/config.js');
    return null;
  }

  if (!window.supabase?.createClient) {
    console.error('[Supabase] SDK not loaded. Ensure the Supabase <script> tag appears before supabase-client.js.');
    return null;
  }

  try {
    supabaseClient = window.supabase.createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
    return supabaseClient;
  } catch (err) {
    console.error('[Supabase] createClient failed:', err);
    return null;
  }
}

/* ─── Auth helpers ───────────────────────────────────────────
   All return null if Supabase is not configured — callers are
   responsible for showing an appropriate error to the user.  */

async function getCurrentUser() {
  if (!supabaseClient) return null;
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
  } catch { return null; }
}

async function getSession() {
  if (!supabaseClient) return null;
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session;
  } catch { return null; }
}

async function requireAuth(redirectTo = '/auth/login.html') {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = redirectTo + '?redirect=' + encodeURIComponent(window.location.href);
    return null;
  }
  return user;
}

async function redirectIfLoggedIn(to = 'index.html') {
  const user = await getCurrentUser();
  if (user) window.location.href = to;
}

// Returns true if both URL and key are filled in
function isSupabaseConfigured() {
  const url = CONFIG.SUPABASE_URL;
  const key = CONFIG.SUPABASE_ANON_KEY;
  return Boolean(
    url && url !== 'PASTE_YOUR_SUPABASE_URL_HERE' &&
    key && key !== 'PASTE_YOUR_SUPABASE_ANON_KEY_HERE'
  );
}

// Returns true if EmailJS is fully configured
function isEmailJSConfigured() {
  return Boolean(
    CONFIG.EMAILJS_PUBLIC_KEY && CONFIG.EMAILJS_PUBLIC_KEY !== 'PASTE_YOUR_EMAILJS_PUBLIC_KEY_HERE' &&
    CONFIG.EMAILJS_SERVICE_ID && CONFIG.EMAILJS_SERVICE_ID !== 'PASTE_YOUR_EMAILJS_SERVICE_ID_HERE'
  );
}

// Returns true if a specific template ID is filled in
function isEmailTemplateConfigured(templateId) {
  return Boolean(templateId && !templateId.startsWith('PASTE_YOUR'));
}

// Initialize immediately (SDK is already loaded by the time this runs)
initSupabase();
