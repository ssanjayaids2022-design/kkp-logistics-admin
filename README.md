# KKP Transports — Admin Dashboard

A logistics operations dashboard for **KKP Transports** — post loads, match them to drivers who raise their hands, verify drivers, track vehicles live, and manage payments. Built as a fast, self-contained single-page app that runs on sample data out of the box.

> **Standalone / demo mode:** this branch ships with an in-memory mock backend (`USE_MOCK = true`), so `npm run dev` "just works" with realistic sample data — no server, database, or API keys required.

---

## ✨ Features

- **Dashboard** — Loads Ledger with editable pricing (Quoted / KKP Price / Offered / Final), assignment status, and "show to driver" toggles.
- **Load Management** — list, filter, search (by load no. / route), post new loads, CSV export.
- **Match Load**
  - Compact list of loads with a live count of drivers who **raised their hands**.
  - Filter: **Unassigned / Assigned / All** loads.
  - Open a load to its own page showing **every driver who raised a hand** (with quote amount, rating, match score) — handles 20+ candidates cleanly.
  - **Assign / Change / Unassign** (cancel & re-match).
  - **Add driver manually** by name or ID (with a not-verified warning).
  - A driver already on an active load can't be double-booked (shows "Already assigned to LD-…").
- **Live Tracking** — SIM-based location readout for vehicles on the road: current coordinates, speed, ETA, route progress, and consent status (simulated feed in demo mode).
- **Driver Approvals** — approval gated on 4 verified documents (license, insurance, registration, aadhar); document upload & review.
- **Payments Ledger** — filters, date range, overdue notifications, outside-payment handling.
- **Administration** — admin management, audit logs, access matrix, login-time tracking, password reset requests.
- **Analytics** — financial, predictive, load, driver, and trip views.
- **Platform** — role-based access (Chairman / Manager / Load Admin), dark mode, multi-language, live clock, and global search.

---

## 🛠 Tech Stack

- **React 19** + **TypeScript**
- **Vite 6** (dev server & build)
- **Ant Design 6** (UI)
- **React Router** (routing)
- Context-based state (Auth, Loads, Theme, Notifications, Language)

---

## 🚀 Getting Started

```bash
# install dependencies
npm install

# start the dev server
npm run dev

# type-check
npm run lint

# production build
npm run build
```

Then open the URL Vite prints (usually http://localhost:5173).

---

## 🔌 Connecting a Real Backend

The app talks to a single `apiService` layer:

- `src/services/apiService.ts` — set `USE_MOCK = false` to switch from the in-memory mock to the live HTTP client.
- `src/services/mockBackend.ts` — sample-data implementation used in demo mode.

When wired to the real backend, driver raise-hands, tracking, and pricing come from live endpoints instead of the simulated feed.

---

## 📁 Project Structure

```
src/
├── pages/          # screens (Dashboard, Match, Tracking, Drivers, Payments, …)
├── layouts/        # app shell, header, sidebar nav
├── components/     # shared UI (StatusTag, LiveClock, PageHeader, …)
├── context/        # Auth, Loads, Theme, Notifications, Language
├── services/       # apiService + mockBackend
├── data/           # sample data (demo mode)
└── utils/          # helpers (CSV export, …)
```

---

## 📝 Notes

- Environment files (`.env*`) are gitignored; only `.env.example` is committed.
- Live Tracking uses a **simulated** SIM feed in demo mode; production requires the backend plus a telecom/tracking provider.
