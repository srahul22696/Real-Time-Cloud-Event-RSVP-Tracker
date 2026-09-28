# Gather — Real-Time Cloud-Based Event Planning & RSVP Tracker

A student project exploring event coordination, RSVP integrity, capacity management, attendee check-in, and cloud architecture. The included runnable demo is a polished single-page React app that persists synthetic demo data in the browser. It works without cloud credentials; browser local storage is not a cloud database and the live indicator in this demo reflects local state only.

## Features in this runnable demo

- Organizer and attendee view switcher (demo only; it is not authentication).
- Seeded synthetic events, dashboards, response analytics, activity notices, and sample guests.
- Event creation with input validation for dates/times, capacity bounds, title, and venue.
- RSVP responses for Going, Maybe, and Not going, capacity handling, waitlist count, and response changes.
- Search/filter guest list, CSV export, simulated check-in, and saved state across refreshes.
- Responsive desktop and mobile layouts.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open the URL printed by Vite. Build with `npm run build`; run automated edge-case tests with `npm test`.

## Cloud architecture and production boundary

The deployable client build can be hosted on Vercel as a static Vite site. A production system should use Firebase Authentication, Firestore, and callable Cloud Functions (or a trusted API) for sensitive operations:

```text
Browser (React/Vite) → Firebase Auth → Callable API / Cloud Functions
                                         ├─ Firestore transaction (invite token + RSVP + capacity + waitlist)
                                         ├─ Firestore snapshots (authorized live dashboard)
                                         └─ notification provider (optional)
                               Vercel CDN serves static client assets
```

The current repository does **not** contain a Firebase project binding, deployed API, database security rules, authentication, or server-side RSVP transactions. Do not enter real personal data; use the provided synthetic records. Browser storage and a client-side role switch cannot provide authentication, authorization, global synchronization, or race-safe capacity across users. The RSVP capacity helper demonstrates expected decisions but is not a substitute for a server transaction.

### Secure production RSVP flow

1. Authenticate the organizer with Firebase Auth and check ownership/role in trusted backend code.
2. Generate invite tokens with a cryptographic random generator; store a hash of each token and validate token length/format, event state, expiry/deadline, and one-time/idempotency key server-side.
3. A callable function verifies the invite and validates status enum, integer guest count, `plusOnesAllowed`, and registration deadline.
4. In one Firestore transaction, read event capacity and current invite/RSVP, account for the invite's previous response, allocate the remaining seats, update RSVP/invite and aggregate counts, or queue the invite FIFO. This avoids check-then-write races.
5. Restrict client reads to the event owner and public-safe fields; deny direct client writes to private invites, RSVP aggregates, and check-ins. Validate every request server-side and rate-limit token submissions.
6. Firestore listeners stream authorized aggregate updates. A reconnecting client obtains a fresh snapshot; writes use idempotency keys to make retry safe.

Production invite tokens must never be logged or exposed in analytics. Avoid collecting more attendee contact data than needed. Add rules/functions emulator tests before using real guests.

## Deployment

Vercel can host the static demo: import this repository, set framework preset to Vite, build command `npm run build`, output directory `dist`. No environment variables are needed for the local demo. For production Firebase integration, configure Firebase IDs as Vercel environment variables and add the trusted backend, Firestore rules/indexes, and Firebase app-domain allowlist before deployment. Never put service account keys or admin credentials in frontend variables.

## Edge-case test coverage

The tests cover malformed/unusual capacities, invalid calendar input, reversed event times, whitespace normalization, forged RSVP states, negative/fractional/oversized guest counts, invite allowance, expired deadlines, full capacity, last-seat allocation, and editing an existing Going response.

## Cloud concepts shown in the design

- **SaaS:** hosted event coordination delivered through a browser.
- **PaaS/serverless:** Vercel static hosting and Firebase managed auth/database/functions in the target architecture.
- **Real-time:** Firestore snapshot listeners in the production design; the local demo is browser-local only.
- **REST/API:** callable API boundary for token RSVP and organizer actions.
- **RBAC:** organizer/attendee roles must be enforced by verified claims and backend ownership checks; the demo switch is cosmetic.
- **Scalability and failure handling:** managed static CDN, transactions, idempotency, listener reconnection, bounded retries, and server-side rate limits are planned production controls.

## Repository structure

```text
src/main.jsx       React application and local demo
src/domain.js      Pure event, RSVP, and capacity validation
src/domain.test.js Edge-case tests
src/styles.css     Responsive interface
```

## Limitations and next steps

Connect Firebase Auth, Firestore listeners, transactional Cloud Functions, security rules, invite-token creation/QR generation, real notifications, and authorized staff check-in. Add Functions/emulator integration and end-to-end browser tests before claiming cloud authentication or concurrency safety. Synthetic seeded dates are demonstration content and should be refreshed for a real deployment.

### Attendee demo mode
Use the profile switcher in the lower-left corner to switch to the synthetic attendee view and submit a local Going/Maybe/Not going response. The response is saved only in this browser's local storage; the dashboard is seeded sample data and does not synchronize to other people. This is for interaction demonstration, not real invitations or cloud authentication.
