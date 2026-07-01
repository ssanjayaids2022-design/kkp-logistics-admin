# Implementation Plan: Local Backend Integration for KKP and 6Ways

This plan connects the **New KKP (Admin Dashboard)** with the **6Ways (Driver App) Express backend** running locally, so admins can see real drivers/loads/bids instead of static mock arrays.

> **Scope correction (read first).** A review of the live code found that **most of the backend already exists**. The 6Ways `admin` router already implements load creation, driver verification, quote approval, assignment, and cancellation. The stores already implement `listQuotes()` and `listInterests()`. The genuinely new backend work is small: **two store methods + four GET routes**. The bulk of the real effort is on the **client**, and specifically in a **data-adapter layer** that translates between two data models that share almost no field names or status enums.

---

## User Review Required

> [!IMPORTANT]
> The two systems model the same concepts differently (field names, status enums, id formats, `number` vs `string` weights). We will introduce a translation layer in the KKP client rather than change either schema. We will point KKP at `http://localhost:4000` instead of `localStorage`/mock arrays.
>
> In local **MOCK** mode the backend store is **in-memory**: it re-seeds on boot and loses all created data on restart. This is acceptable for a demo but means KKP will show seeded loads/agents and nothing persists across server restarts.

---

## The core problem: two incompatible data models

The single biggest risk in this integration is **shape mismatch**. The adapter layer (§2.1) is the load-bearing piece — without it every screen renders blanks or crashes.

### Load
| Concept | KKP (`src/types.ts`) | 6Ways store |
|---|---|---|
| id | `"LD-1001"` | `"load_1"` / `"id_ab12cd34"` |
| weight | `number` (`8500`) | `string` (`"12 tons"`) or `null` |
| price | `budget` / `fixedAmount` / `ratePerTon` + `priceType` | `postedAmount` (number\|null) + `mode: 'priced'\|'unpriced'` |
| status | `pending\|active\|in_transit\|delivered\|completed\|cancelled\|delayed` | `open\|assigned\|delivered\|cancelled` |
| assigned driver | `assignedDriver` (name) | `assignedDriverId` (id) |
| extra server fields | — | `region`, `agentId`, `distanceKm`, `specialInstructions` |
| missing on KKP side | `region` (server **requires** it on create) | — |

### Driver
KKP `Driver` expects `name, phone, email, vehicleType, vehicleNumber, licenseNumber, rating, totalTrips, status (pending_approval\|approved\|rejected\|suspended), documentsStatus{license,insurance,registration,aadhar}, joinedDate`.

The actual server driver doc (from `/me`) has: `id, phone, name, vehicleType, vehicleNumber, vehicleCapacity, region, preferredLanguage, documents{license|rc|insurance:{url,status,expiry}}, verificationStatus (unverified\|pending\|verified\|rejected), ratingAvg, ratingCount, createdAt, simConsent`.

Mismatches to resolve in the adapter: no `email`; `licenseNumber` → `documents.license`; `rating` → `ratingAvg`; no real `totalTrips` (approximate with `ratingCount` or show `—`); document set differs (`rc` vs `registration`, no `aadhar`); status enum differs.

### Bid / Quote
KKP `Bid` expects `driverName, driverRating, vehicleType, vehicleNumber, price, eta, distance, status (pending\|accepted\|rejected), submittedAt, totalTrips`.

A server quote is only `{loadId, driverId, amount, status (submitted\|approved\|rejected\|withdrawn), createdAt, updatedAt}` — **no driver identity**. The client must **join** each quote against `GET /admin/drivers` to fill name/rating/vehicle, and map `eta`/`distance` from the load (the quote has neither).

---

## 1. Server changes (`6Ways-/server`) — small

### [MODIFY] `src/store/memoryStore.js`
Add two listing methods (everything else needed already exists):
* `listDrivers()` → `[...drivers.values()].map(d => ({ ...d }))`
* `listAllLoads()` → `[...loads.values()].map(l => ({ ...l }))`

### [MODIFY] `src/store/firestoreStore.js`
Add the same two for non-MOCK parity (these are **not** present today):
* `listDrivers()` → query the `drivers` collection.
* `listAllLoads()` → query the `loads` collection.

(`listQuotes` and `listInterests` already exist in both stores — do **not** re-add.)

### [MODIFY] `src/routes/admin.js`
Expose four **GET** routes (all the POST routes below already exist — see §3):
* `GET /admin/loads` → `store.listAllLoads()`
* `GET /admin/drivers` → `store.listDrivers()`
* `GET /admin/loads/:id/quotes` → `store.listQuotes(id)`
* `GET /admin/loads/:id/interests` → `store.listInterests(id)`

---

## 2. Client changes (`New kkp/src`) — the bulk of the work

### 2.1 [NEW] `src/services/apiService.ts` — client + adapters
Two responsibilities in one module:

**(a) Transport.** Base URL from env (`import.meta.env.VITE_API_URL ?? 'http://localhost:4000'`) — wire it through the existing `.env.example`/`loadEnv` setup rather than hardcoding. Send `x-admin-key` from `VITE_ADMIN_KEY` when present (the server's `adminMiddleware` only enforces it if `ADMIN_API_KEY` is set; leave both unset locally so routes are open). Centralize JSON parsing + error throwing.

Methods: `fetchLoads()`, `createLoad()`, `cancelLoad(id)`, `fetchDrivers()`, `verifyDriver(id, status)`, `fetchQuotes(loadId)`, `fetchInterests(loadId)`, `approveQuote(loadId, driverId)`, `assignDriver(loadId, driverId)`.

**(b) Adapters** (the critical part):
* `toLoad(serverLoad): Load` — `LD-`-less id passthrough; parse `weight` string → number; map `postedAmount`→`budget`; map status `open→active`, `assigned→in_transit`, keep `delivered/cancelled`; `assignedDriverId`→resolve name via driver cache or leave id.
* `fromLoadForm(form): serverPayload` — **supply `region`** (see §2.3), map `priceType/fixedAmount/ratePerTon`→`postedAmount` (+ `mode`), pass `pickupDate/vehicleType/weight`.
* `toDriver(serverDriver): Driver` — map `verificationStatus`→`status` (`unverified|pending→pending_approval`, `verified→approved`, `rejected→rejected`), `ratingAvg→rating`, `documents.*`→`documentsStatus`, fill absent fields (`email`, `totalTrips`) with sensible defaults/`—`.
* `toBid(quote, driver, load): Bid` — join driver fields, take `amount→price`, derive `distance` from `load.distanceKm`, `eta` from `load.pickupDate` (or `—`), map status `submitted→pending`, `approved→accepted`, `rejected→rejected`.

### 2.2 [MODIFY] `src/context/LoadsContext.tsx`
Replace `localStorage` + mock seed with live queries. **This changes the public API of the context — update all consumers:**
* `addLoad` becomes **async** and returns `Promise<Load>`. Update [LoadPostingScreen.tsx:44](src/pages/LoadPostingScreen.tsx#L44) (currently uses the sync return value).
* Rename `deleteLoad`→`cancelLoad` (async, calls `POST /admin/loads/:id/cancel`). Update [LoadListScreen.tsx:216](src/pages/LoadListScreen.tsx#L216).
* `loads` now starts empty and fills after `fetchLoads()`. Add `loading`/`error` state; [AppLayout.tsx:50](src/layouts/AppLayout.tsx#L50) reads `loads` and must tolerate the empty initial render.
* Since there is no realtime (see Verification), add a manual refresh and/or a polling interval (e.g. 5–10s) so KKP reflects driver-app activity.

### 2.3 [MODIFY] `src/pages/LoadPostingScreen.tsx`
The server **rejects** load creation without `region` (returns 400). The current form has no region field. Add a `region` input (or derive it from source state) and pass it through `fromLoadForm`. Map the price fields to `postedAmount`/`mode`.

### 2.4 [MODIFY] `src/pages/DriverApprovalScreen.tsx`
* Load via `apiService.fetchDrivers()` → `toDriver`. Seeded data has **no drivers**, so this tab is empty until a driver onboards in the driver app (matches the manual test flow).
* Approve → `apiService.verifyDriver(id, 'verified')`; optionally support reject (`'rejected'`).

### 2.5 [MODIFY] `src/pages/BidComparisonScreen.tsx`
* Fetch `fetchQuotes(loadId)` (priced loads) and/or `fetchInterests(loadId)` (unpriced raise-hand), plus `fetchDrivers()` for the join → `toBid`.
* Assign via `approveQuote(loadId, driverId)` (priced) or `assignDriver(loadId, driverId)` (raise-hand). Note the backend rule: **assignment is always an explicit human action**, never auto lowest-wins.

---

## 3. Endpoints that ALREADY EXIST (no work — for reference)
`POST /admin/loads`, `POST /admin/loads/:id/assign`, `POST /admin/loads/:id/quotes/:driverId/approve`, `POST /admin/loads/:id/cancel`, `POST /admin/drivers/:id/verify`. CORS is `*` by default; default port `4000`; KKP dev server runs on `3000`; driver app on `5173`.

---

## Verification Plan

### Server
* `npm run dev` in `6Ways-/server`; confirm `GET /health` returns `{ ok: true, mode: "mock" }`.
* `curl http://localhost:4000/admin/loads` and `/admin/drivers` return JSON arrays (loads seeded, drivers empty).

### Manual end-to-end
1. Driver app (`:5173`): sign in with `Bearer mock:<uid>`, complete onboarding (creates the driver doc).
2. KKP (`:3000`) **Drivers** tab → new driver appears (after refresh/poll — **not** instant; there is no websocket). Click **Approve**.
3. Driver app: verification gate lifts, load board visible.
4. KKP: post a load (with **region**) → appears on the driver board after the driver's next fetch.
5. Driver app: submit a bid → appears in KKP **Bid Comparison** (joined with driver name/rating) → assign the driver.

> [!NOTE]
> Every "appears" above is **poll/refresh-bound**, not realtime. If true instant updates are required, that is a separate piece of work (SSE/WebSocket on the server) and out of scope here.
