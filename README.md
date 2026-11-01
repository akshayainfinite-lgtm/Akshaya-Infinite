# Akshaya Infinite — production-oriented starter

This project is a Next.js + Supabase starter for Akshaya Infinite's custom tailoring business.

## Included
- Luxury cream-and-gold responsive website
- Ladies', boys' and girls' collections
- Server-validated custom order submission using a server-only Supabase service-role client
- Supabase/PostgreSQL schema for orders, profiles, measurements, quote line items and order events
- Role-based owner/staff dashboard with status updates
- Login page using Supabase Auth
- Order tracking endpoint scaffold
- Quote calculation and validation utilities
- AI measurement provider interface and integration plan
- WhatsApp handoff to **+91 9391411796** (configurable via `AKSHAYA_WHATSAPP_NUMBER`)

## Important: not yet a live production deployment
The code cannot accept real orders until you configure Supabase, run the SQL migration, create authorised users, deploy the app, and verify all workflows. The AI body scan is intentionally not implemented. The current tracking endpoint must be security-reviewed and changed to use a server-side RPC or equivalent that verifies the order code and phone securely without exposing order records to public queries.

## Local setup
1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local`.
3. Create a Supabase project.
4. Fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Set `AKSHAYA_WHATSAPP_NUMBER=919391411796` in `.env.local` (digits only).
6. Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` for server-only API routes. Never expose it to the browser.
7. Run `supabase/migrations/001_initial.sql` in the Supabase SQL Editor.
8. Create the first user through Supabase Auth.
9. Assign that user the owner role. From the Supabase SQL editor, replace `YOUR_AUTH_USER_UUID` with the user ID:
   `insert into public.profiles (id, display_name, role) values ('YOUR_AUTH_USER_UUID', 'Akshaya Infinite Owner', 'owner');`
10. Run `npm install`, then `npm run dev`.
11. Visit `http://localhost:3000`.

## Required production hardening before public launch
- Add distributed rate limiting (for example, a managed edge/WAF or Redis-backed limiter) to public order and tracking endpoints. The current app has no distributed rate limiter.
- The tracking endpoint uses a server-only elevated query and checks the supplied phone before returning only a status label. Add rate limiting, abuse monitoring, generic error handling and security testing before launch. Do not grant public order SELECT access.
- Review and test RLS policies, including the first-owner bootstrap procedure. Supabase policies cannot safely rely on arbitrary client-provided role values.
- Add CSRF/origin controls and rate limiting to public forms.
- Add audit logging for price changes, payment confirmations, and status updates.
- Add customer-facing quotation approval and owner quote editing forms.
- Configure email/WhatsApp notification process if desired.
- Add privacy notice, terms, consent withdrawal, data deletion/export, retention rules, backups, monitoring, and incident response.
- Add image upload only through private storage with short-lived signed URLs and strict content/size validation.
- Run dependency audits, accessibility tests, mobile tests, and security review.
- Do not deploy using a service-role key in client code.

## AI measurement integration plan
1. Shortlist vendors or models that support your garment types, camera requirements, units and body-size range.
2. Verify accuracy independently with a tailor across different poses, clothing, lighting and devices; do not accept vendor claims without testing.
3. Confirm privacy terms, processing location, retention, deletion, and safeguards for minors. Obtain parent/guardian consent for child profiles.
4. Build a consent screen and guided capture page with instructions. Prefer in-memory or private temporary capture and avoid saving raw images by default.
5. Upload images via short-lived signed URLs; invoke the provider only from a server route.
6. Store estimates with provider/version, timestamps and confidence metadata; never label AI output as verified.
7. Require manual correction and tailor approval before garment cutting.
8. Provide a manual-only route if the provider fails or a customer declines scanning.
9. Delete raw images promptly and support profile deletion.
10. Test measurement accuracy and garment fit before enabling the feature for customers.

## Pricing logic
`lib/validation.ts` validates the quote components and calculates:
base stitching + fabric + extra material + (labour hours × labour rate) + custom work + workload surcharge + express surcharge + delivery.
Treat the result as a draft estimate. The owner should review and approve the final quote. The quote utility is not yet wired into the admin dashboard.

## Notes
This is a foundation, not a substitute for production security review. Test thoroughly with non-sensitive sample data before launch.


## AI Trial Fit starter (new)
- Customer page: `/trial-fit` with manual body measurements, owner-published garment selection, own-photo preview and explicit temporary-processing consent.
- Owner catalogue: `/admin/trial-fit` for authenticated owners to publish garment reference images for Ladies, Boys and Girls and Male/Female/Unisex model categories.
- Run `supabase/migrations/002_trial_fit.sql` after the initial migration.
- The customer photo is currently previewed locally in the browser only. It is not uploaded to Supabase or sent to an AI provider.
- Live camera body measurement and image-to-image virtual try-on are intentionally not represented as active. Select, contract-review, implement and accuracy-test dedicated providers before enabling those features. The generate API currently returns a clear not-configured response and does not transmit images.
- The catalogue bucket contains owner garment assets only; do not upload customer photographs to it.


## Dual-mode virtual fitting update
- `/trial-fit` now offers two customer experiences: photo-based AI try-on preparation and an adjustable illustrative avatar studio.
- The avatar controls height, chest, waist and hip proportions and displays the selected owner garment label. It is a responsive SVG illustration, not a true WebGL/physics-based 3D garment simulation.
- Photo-based generation remains disabled until a privacy-reviewed image-to-image try-on provider and server adapter are configured. The current API returns a not-configured response and does not transmit customer photos.
- The avatar preview is a visual sizing aid only; it does not calculate verified garment drape, size recommendation or tailoring measurements.
- Camera body measurement remains a planned integration. Manual measurements are available now.
- Before production, select and contract with both an image try-on provider and (if required) a 3D avatar/garment simulation provider, then test garment fidelity, body-size coverage, security, retention and deletion.
