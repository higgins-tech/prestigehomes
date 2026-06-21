/* ============================================================
   PRESTIGE HOMES — RENTAL APPLICATION JAVASCRIPT
   ============================================================
   Handles the 6-step questionnaire, validation, and data
   collection. After the user clicks Submit on Step 6:
     1. All form data is stored in sessionStorage
     2. The eligibility decision overlay is shown
     3. The user proceeds to application-payment.html
     4. EmailJS is triggered THERE, after payment confirmation

   This file does NOT send any emails — that is intentional.
   Emails are only sent after the user completes the crypto
   payment workflow on application-payment.html.
   ============================================================ */
'use strict';

let currentStep = 1;
const TOTAL_STEPS = 6;

let applicationData = {
  fullName: '', email: '', phone: '',
  occupants: '', income: '', employment: '', employer: '',
  hasPets: false, petCount: 1, petTypes: '',
  moveInDate: '', leaseDuration: '',
  creditScore: '', bankruptcy: false,
  smoking: false, eviction: false, references: '', notes: '',
};

let applyProperty = null;

/* ─── Init ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  applyProperty = JSON.parse(sessionStorage.getItem('apply_property') || 'null');
  if (!applyProperty) {
    Toast.warning('No Property Selected', 'Please select a property to apply for first.');
    setTimeout(() => window.location.href = 'search.html?type=rent', 1500);
    return;
  }

  renderPropertyStrip();
  updateProgress();

  const dateInput = document.getElementById('f-movein');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
});

function renderPropertyStrip() {
  const el = document.getElementById('apply-property-strip');
  if (!el || !applyProperty) return;
  el.innerHTML = `
    <img src="${applyProperty.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&auto=format'}" alt="Property"/>
    <div class="apply-property-strip-text">
      <div class="apply-property-strip-addr">Applying for: ${applyProperty.address}</div>
      <div class="apply-property-strip-price">${formatPrice(applyProperty.price, applyProperty.listingType)} · ID: ${applyProperty.id}</div>
    </div>
  `;
}

/* ─── Step Navigation ────────────────────────────────────── */
function nextStep(fromStep) {
  if (!validateStep(fromStep)) return;
  saveStepData(fromStep);
  document.getElementById(`step-${fromStep}`).style.display = 'none';
  currentStep = fromStep + 1;
  document.getElementById(`step-${currentStep}`).style.display = 'block';
  if (currentStep === 6) renderReview();
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep(fromStep) {
  document.getElementById(`step-${fromStep}`).style.display = 'none';
  currentStep = fromStep - 1;
  document.getElementById(`step-${currentStep}`).style.display = 'block';
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress() {
  const pct = (currentStep / TOTAL_STEPS) * 100;
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = `${pct}%`;
  for (let i = 1; i <= 7; i++) {
    const label = document.getElementById(`label-${i}`);
    if (label) label.classList.toggle('active', i === currentStep || (currentStep > TOTAL_STEPS && i === 7));
  }
}

/* ─── Validation ─────────────────────────────────────────── */
function validateStep(step) {
  if (step === 1) {
    const name  = document.getElementById('f-name').value.trim();
    const email = document.getElementById('f-email').value.trim();
    const phone = document.getElementById('f-phone').value.trim();
    if (!name)                        { Toast.error('Missing Info', 'Please enter your full name.');          return false; }
    if (!email || !email.includes('@')){ Toast.error('Invalid Email', 'Please enter a valid email address.'); return false; }
    if (!phone)                       { Toast.error('Missing Info', 'Please enter your phone number.');       return false; }
  }
  if (step === 2) {
    if (!document.getElementById('f-occupants').value)  { Toast.error('Missing Info', 'Please select the number of occupants.'); return false; }
    if (!document.getElementById('f-income').value)     { Toast.error('Missing Info', 'Please enter your annual household income.'); return false; }
    if (!document.getElementById('f-employment').value) { Toast.error('Missing Info', 'Please select your employment status.'); return false; }
  }
  if (step === 3) {
    if (!document.getElementById('f-movein').value) { Toast.error('Missing Info', 'Please select your desired move-in date.'); return false; }
    if (!document.getElementById('f-lease').value)  { Toast.error('Missing Info', 'Please select a lease duration.'); return false; }
  }
  if (step === 4) {
    if (!document.getElementById('f-credit').value) { Toast.error('Missing Info', 'Please select your credit score range.'); return false; }
  }
  return true;
}

/* ─── Save Step Data ─────────────────────────────────────── */
function saveStepData(step) {
  if (step === 1) {
    applicationData.fullName = document.getElementById('f-name').value.trim();
    applicationData.email    = document.getElementById('f-email').value.trim();
    applicationData.phone    = document.getElementById('f-phone').value.trim();
  }
  if (step === 2) {
    applicationData.occupants  = document.getElementById('f-occupants').value;
    applicationData.income     = document.getElementById('f-income').value;
    applicationData.employment = document.getElementById('f-employment').value;
    applicationData.employer   = document.getElementById('f-employer')?.value.trim() || '';
    applicationData.petCount   = document.getElementById('f-pet-count')?.value || '0';
    applicationData.petTypes   = document.getElementById('f-pet-types')?.value.trim() || '';
  }
  if (step === 3) {
    applicationData.moveInDate    = document.getElementById('f-movein').value;
    applicationData.leaseDuration = document.getElementById('f-lease').value;
  }
  if (step === 4) {
    applicationData.creditScore = document.getElementById('f-credit').value;
  }
  if (step === 5) {
    applicationData.references = document.getElementById('f-references')?.value.trim() || '';
    applicationData.notes      = document.getElementById('f-notes')?.value.trim()      || '';
  }
}

/* ─── Toggle Helpers ─────────────────────────────────────── */
function toggleEmployer() {
  const val = document.getElementById('f-employment').value;
  const group = document.getElementById('employer-group');
  const needsEmployer = ['Employed Full-Time','Employed Part-Time','Self-Employed','Business Owner'].includes(val);
  if (group) group.style.display = needsEmployer ? 'block' : 'none';
}

function selectPets(hasPets, el) {
  applicationData.hasPets = hasPets;
  document.querySelectorAll('#pets-toggle .option-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  const detail = document.getElementById('pet-details');
  if (detail) detail.style.display = hasPets ? 'block' : 'none';
}

function selectBankruptcy(val, el) {
  applicationData.bankruptcy = val;
  document.querySelectorAll('#bankruptcy-toggle .option-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

function selectToggle(field, val, el) {
  applicationData[field] = val;
  const containerId = field === 'smoking' ? 'smoking-toggle' : 'eviction-toggle';
  document.querySelectorAll(`#${containerId} .option-card`).forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

function changeQty(inputId, delta) {
  const input   = document.getElementById(inputId);
  const display = document.getElementById(inputId + '-display');
  let val = parseInt(input.value || '1') + delta;
  val = Math.max(1, Math.min(10, val));
  input.value = val;
  if (display) display.textContent = val;
}

/* ─── Render Review ──────────────────────────────────────── */
function renderReview() {
  const d   = applicationData;
  const container = document.getElementById('review-content');
  if (!container) return;

  container.innerHTML = `
    <div class="review-section">
      <div class="review-section-title">Personal Information</div>
      <div class="review-row"><span class="label">Full Name</span><span class="value">${d.fullName}</span></div>
      <div class="review-row"><span class="label">Email</span><span class="value">${d.email}</span></div>
      <div class="review-row"><span class="label">Phone</span><span class="value">${d.phone}</span></div>
    </div>
    <div class="review-section">
      <div class="review-section-title">Household Information</div>
      <div class="review-row"><span class="label">Occupants</span><span class="value">${d.occupants}</span></div>
      <div class="review-row"><span class="label">Annual Income</span><span class="value">$${formatNumber(d.income)}</span></div>
      <div class="review-row"><span class="label">Employment</span><span class="value">${d.employment}</span></div>
      ${d.employer ? `<div class="review-row"><span class="label">Employer</span><span class="value">${d.employer}</span></div>` : ''}
      <div class="review-row"><span class="label">Pets</span><span class="value">${d.hasPets ? `Yes — ${d.petCount} (${d.petTypes || 'Not specified'})` : 'No'}</span></div>
    </div>
    <div class="review-section">
      <div class="review-section-title">Lease Details</div>
      <div class="review-row"><span class="label">Move-In Date</span><span class="value">${formatDate(d.moveInDate)}</span></div>
      <div class="review-row"><span class="label">Lease Duration</span><span class="value">${d.leaseDuration}</span></div>
    </div>
    <div class="review-section">
      <div class="review-section-title">Financial Information</div>
      <div class="review-row"><span class="label">Credit Score</span><span class="value">${d.creditScore}</span></div>
      <div class="review-row"><span class="label">Bankruptcy (7yr)</span><span class="value">${d.bankruptcy ? 'Yes' : 'No'}</span></div>
    </div>
    <div class="review-section">
      <div class="review-section-title">Background</div>
      <div class="review-row"><span class="label">Smoker</span><span class="value">${d.smoking ? 'Yes' : 'No'}</span></div>
      <div class="review-row"><span class="label">Previous Eviction</span><span class="value">${d.eviction ? 'Yes' : 'No'}</span></div>
      ${d.references ? `<div class="review-row"><span class="label">References</span><span class="value">${d.references}</span></div>` : ''}
      ${d.notes      ? `<div class="review-row"><span class="label">Notes</span><span class="value">${d.notes}</span></div>` : ''}
    </div>
    <div class="review-section">
      <div class="review-section-title">Property</div>
      <div class="review-row"><span class="label">Address</span><span class="value">${applyProperty.address}</span></div>
      <div class="review-row"><span class="label">Price</span><span class="value">${formatPrice(applyProperty.price, applyProperty.listingType)}</span></div>
      <div class="review-row"><span class="label">Property ID</span><span class="value">${applyProperty.id}</span></div>
    </div>
  `;
}

/* ─── Submit Application ─────────────────────────────────── */
function submitApplication() {
  const confirmed = document.getElementById('apply-confirm')?.checked;
  if (!confirmed) {
    Toast.error('Confirmation Required', 'Please confirm your information is accurate.');
    return;
  }

  // Save all collected data so application-payment.html can send the email
  sessionStorage.setItem('apply_form_data', JSON.stringify(applicationData));
  sessionStorage.setItem('apply_property',  JSON.stringify(applyProperty));

  // Show the eligibility decision overlay
  const overlay = document.getElementById('decision-overlay');
  if (overlay) {
    overlay.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }
}

function goToApplicationPayment() {
  window.location.href = 'application-payment.html';
}
