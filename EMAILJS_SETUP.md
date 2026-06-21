# EmailJS Setup Guide — Prestige Homes

Two real email templates are required:
1. **Tour Request** — sent after the user completes tour payment
2. **Rental Application** — sent after the user completes application payment

Both are triggered by real `emailjs.send()` calls. If either template is
missing or EmailJS is misconfigured, the user sees a clear error and the
system does NOT fake success.

---

## Step 1: Create Your EmailJS Account

1. Go to **https://www.emailjs.com**
2. Click **Sign Up** (free, no credit card required)
3. Verify your email address

---

## Step 2: Connect an Email Service

1. Dashboard → **Email Services** → **Add New Service**
2. Choose **Gmail** (recommended) or Outlook/Yahoo/SMTP
3. Click **Connect Account** → authorize Gmail
4. Once connected you'll see a **Service ID** like `service_a1b2c3d`
5. Copy it — you'll paste it into `js/config.js` as `EMAILJS_SERVICE_ID`

---

## Step 3A: Create the Tour Request Template

1. Dashboard → **Email Templates** → **Create New Template**
2. Name: `Tour Request`
3. Subject field:
```
New Tour Request — {{property_address}}
```
4. Switch body to **Code editor** (`</>`) and paste:

```html
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F8FAFC;padding:24px;">

  <div style="background:#0F172A;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="color:#D4AF37;font-size:24px;margin:0;">Prestige Homes</h1>
    <p style="color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:4px 0 0;">New Tour Request</p>
  </div>

  <div style="background:#ffffff;padding:24px;border-radius:0 0 12px 12px;border:1px solid #E2E8F0;">

    <h2 style="color:#0F172A;font-size:18px;border-bottom:2px solid #D4AF37;padding-bottom:8px;">Property Details</h2>
    <table style="width:100%;font-size:14px;color:#334155;">
      <tr><td style="padding:4px 0;color:#64748B;width:40%;">Property:</td><td style="padding:4px 0;font-weight:bold;">{{property_name}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Address:</td><td style="padding:4px 0;">{{property_address}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Price:</td><td style="padding:4px 0;">{{property_price}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Type:</td><td style="padding:4px 0;">{{property_type}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Listing:</td><td style="padding:4px 0;">{{listing_type}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Property ID:</td><td style="padding:4px 0;">{{property_id}}</td></tr>
    </table>

    <h2 style="color:#0F172A;font-size:18px;border-bottom:2px solid #D4AF37;padding-bottom:8px;margin-top:24px;">Applicant Details</h2>
    <table style="width:100%;font-size:14px;color:#334155;">
      <tr><td style="padding:4px 0;color:#64748B;width:40%;">Full Name:</td><td style="padding:4px 0;font-weight:bold;">{{applicant_name}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Email:</td><td style="padding:4px 0;">{{applicant_email}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Phone:</td><td style="padding:4px 0;">{{applicant_phone}}</td></tr>
    </table>

    <h2 style="color:#0F172A;font-size:18px;border-bottom:2px solid #D4AF37;padding-bottom:8px;margin-top:24px;">Tour Details</h2>
    <table style="width:100%;font-size:14px;color:#334155;">
      <tr><td style="padding:4px 0;color:#64748B;width:40%;">Preferred Date:</td><td style="padding:4px 0;font-weight:bold;">{{tour_date}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Preferred Time:</td><td style="padding:4px 0;font-weight:bold;">{{tour_time}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Notes:</td><td style="padding:4px 0;">{{tour_notes}}</td></tr>
    </table>

    <h2 style="color:#0F172A;font-size:18px;border-bottom:2px solid #D4AF37;padding-bottom:8px;margin-top:24px;">Payment Information</h2>
    <table style="width:100%;font-size:14px;color:#334155;">
      <tr><td style="padding:4px 0;color:#64748B;width:40%;">Cryptocurrency:</td><td style="padding:4px 0;">{{crypto_currency}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Payment Time:</td><td style="padding:4px 0;">{{payment_timestamp}}</td></tr>
    </table>

    <div style="margin-top:24px;padding-top:16px;border-top:1px solid #E2E8F0;font-size:12px;color:#94A3B8;">
      Submitted: {{submitted_at}}
    </div>
  </div>
</div>
```

5. **To Email** field: enter where you want to receive tour requests
6. Click **Save** → copy the **Template ID** (e.g. `template_abc1234`)
7. Paste into `js/config.js` as `EMAILJS_TEMPLATE_TOUR`

---

## Step 3B: Create the Rental Application Template

1. **Email Templates** → **Create New Template**
2. Name: `Rental Application`
3. Subject:
```
New Rental Application — {{property_name}}
```
4. Body (Code editor):

```html
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F8FAFC;padding:24px;">

  <div style="background:#0F172A;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="color:#D4AF37;font-size:24px;margin:0;">Prestige Homes</h1>
    <p style="color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:4px 0 0;">New Rental Application</p>
  </div>

  <div style="background:#ffffff;padding:24px;border-radius:0 0 12px 12px;border:1px solid #E2E8F0;">

    <h2 style="color:#0F172A;font-size:18px;border-bottom:2px solid #D4AF37;padding-bottom:8px;">Property Details</h2>
    <table style="width:100%;font-size:14px;color:#334155;">
      <tr><td style="padding:4px 0;color:#64748B;width:40%;">Property:</td><td style="padding:4px 0;font-weight:bold;">{{property_name}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Address:</td><td style="padding:4px 0;">{{property_address}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Price:</td><td style="padding:4px 0;">{{property_price}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Type:</td><td style="padding:4px 0;">{{property_type}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Listing:</td><td style="padding:4px 0;">{{listing_type}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Property ID:</td><td style="padding:4px 0;">{{property_id}}</td></tr>
    </table>

    <h2 style="color:#0F172A;font-size:18px;border-bottom:2px solid #D4AF37;padding-bottom:8px;margin-top:24px;">Applicant Information</h2>
    <table style="width:100%;font-size:14px;color:#334155;">
      <tr><td style="padding:4px 0;color:#64748B;width:40%;">Full Name:</td><td style="padding:4px 0;font-weight:bold;">{{applicant_name}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Email:</td><td style="padding:4px 0;">{{applicant_email}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Phone:</td><td style="padding:4px 0;">{{applicant_phone}}</td></tr>
    </table>

    <h2 style="color:#0F172A;font-size:18px;border-bottom:2px solid #D4AF37;padding-bottom:8px;margin-top:24px;">Household Information</h2>
    <table style="width:100%;font-size:14px;color:#334155;">
      <tr><td style="padding:4px 0;color:#64748B;width:40%;">Occupants:</td><td style="padding:4px 0;">{{occupants}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Annual Income:</td><td style="padding:4px 0;">{{income}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Employment:</td><td style="padding:4px 0;">{{employment}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Employer:</td><td style="padding:4px 0;">{{employer}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Pets:</td><td style="padding:4px 0;">{{pets}}</td></tr>
    </table>

    <h2 style="color:#0F172A;font-size:18px;border-bottom:2px solid #D4AF37;padding-bottom:8px;margin-top:24px;">Lease Details</h2>
    <table style="width:100%;font-size:14px;color:#334155;">
      <tr><td style="padding:4px 0;color:#64748B;width:40%;">Move-In Date:</td><td style="padding:4px 0;">{{move_in_date}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Lease Duration:</td><td style="padding:4px 0;">{{lease_duration}}</td></tr>
    </table>

    <h2 style="color:#0F172A;font-size:18px;border-bottom:2px solid #D4AF37;padding-bottom:8px;margin-top:24px;">Financial & Background</h2>
    <table style="width:100%;font-size:14px;color:#334155;">
      <tr><td style="padding:4px 0;color:#64748B;width:40%;">Credit Score:</td><td style="padding:4px 0;">{{credit_score}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Bankruptcy:</td><td style="padding:4px 0;">{{bankruptcy}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Smoker:</td><td style="padding:4px 0;">{{smoking}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Prior Eviction:</td><td style="padding:4px 0;">{{eviction}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">References:</td><td style="padding:4px 0;">{{references}}</td></tr>
    </table>

    <h2 style="color:#0F172A;font-size:18px;border-bottom:2px solid #D4AF37;padding-bottom:8px;margin-top:24px;">Additional Notes</h2>
    <p style="font-size:14px;color:#334155;line-height:1.6;">{{additional_notes}}</p>

    <h2 style="color:#0F172A;font-size:18px;border-bottom:2px solid #D4AF37;padding-bottom:8px;margin-top:24px;">Payment Information</h2>
    <table style="width:100%;font-size:14px;color:#334155;">
      <tr><td style="padding:4px 0;color:#64748B;width:40%;">Cryptocurrency:</td><td style="padding:4px 0;">{{crypto_currency}}</td></tr>
      <tr><td style="padding:4px 0;color:#64748B;">Payment Time:</td><td style="padding:4px 0;">{{payment_timestamp}}</td></tr>
    </table>

    <div style="margin-top:24px;padding-top:16px;border-top:1px solid #E2E8F0;font-size:12px;color:#94A3B8;">
      Submitted: {{submitted_at}}
    </div>
  </div>
</div>
```

5. **To Email** field: where you want to receive applications
6. **Save** → copy **Template ID**
7. Paste into `js/config.js` as `EMAILJS_TEMPLATE_APPLICATION`

---

## Step 4: Get Your Public Key

1. Dashboard → **Account** → **General**
2. Copy **Public Key** (looks like `AbCdEfGhIjKlMnOp`)
3. Paste into `js/config.js` as `EMAILJS_PUBLIC_KEY`

---

## Step 5: Final config.js Values

```javascript
EMAILJS_PUBLIC_KEY:            'AbCdEfGhIjKlMnOp',
EMAILJS_SERVICE_ID:            'service_a1b2c3d',
EMAILJS_TEMPLATE_TOUR:         'template_xyz1234',   // Tour requests
EMAILJS_TEMPLATE_APPLICATION:  'template_abc5678',   // Rental applications
```

---

## When Emails Are Sent

| Action | Trigger |
|---|---|
| Tour Request | After user clicks "I Have Made Payment" on `tour.html` |
| Rental Application | After user clicks "I Have Made Payment" on `application-payment.html` |

**Both flows:** If EmailJS fails, the user sees a clear error message with a Retry button. The system never fakes a success response.

---

## Troubleshooting

**"Email service unavailable" error on the site**
→ One or more config values are still set to `PASTE_YOUR_...`. Check all four values in `js/config.js`.

**"Submission Failed" after clicking retry**
→ Open DevTools → Console → look for the EmailJS error object. Common causes:
- Template variable mismatch: template uses `{{property_name}}` but the JS sends `property_address` — variable names must match exactly
- Service disconnected: go to EmailJS → Email Services → reconnect Gmail
- Daily send limit reached (200/month on free tier)

**Emails go to spam**
→ Normal for the first few sends from a new EmailJS service. Ask your recipient to mark as "Not Spam". For production, use a custom domain sender in EmailJS settings.

**Want to test without real sends?**
→ Leave config values as `PASTE_YOUR_...`. When the system detects unconfigured credentials, it shows "Email service unavailable" rather than faking success — which is the correct production-safe behavior.
