// ─── Backend client + adapters ───────────────────────────────────────────────
// Talks to the 6Ways Express backend (admin routes) and translates between the
// server's data model and the KKP frontend types. The two systems share almost
// no field names / status enums, so EVERY server payload is normalised here.

import type { Load, Driver, Bid, DocumentStatus, LoadStatus, DriverStatus, BidStatus } from '../types';
import { mockBackend } from './mockBackend';

// Standalone mode: serve in-memory sample data so `npm run dev` runs with no
// backend. Set to false (and run the 6Ways server) to connect a real backend.
const USE_MOCK = true;

const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:4000';
const ADMIN_KEY = (import.meta as any).env?.VITE_ADMIN_KEY ?? '';

// ─── Server-side shapes (loose; only the fields we read) ─────────────────────
interface ServerLoad {
  id: string;
  source: string;
  destination: string;
  pickupDate: string;
  vehicleType: string;
  weight: string | null;
  mode: 'priced' | 'unpriced';
  postedAmount: number | null;
  status: 'open' | 'assigned' | 'delivered' | 'cancelled';
  assignedDriverId: string | null;
  distanceKm?: number;
  region?: string;
  specialInstructions?: string;
  createdAt?: string;
  quotedAmount?: number | null;
  kkpPrice?: number | null;
  bidAmount?: number | null;
  offeredAmount?: number | null;
  amountVisible?: boolean;
}

interface ServerDriver {
  id: string;
  name?: string;
  phone?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  region?: string;
  location?: string;
  documents?: Record<string, { url: string; status: string; expiry: string | null }>;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected' | 'suspended';
  ratingAvg?: number;
  ratingCount?: number;
  createdAt?: string;
}

interface ServerQuote {
  loadId: string;
  driverId: string;
  amount: number;
  status: 'submitted' | 'approved' | 'rejected' | 'withdrawn';
  createdAt?: string;
}

interface ServerInterest {
  loadId: string;
  driverId: string;
  createdAt?: string;
}

// ─── Transport ───────────────────────────────────────────────────────────────
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (ADMIN_KEY) headers['x-admin-key'] = ADMIN_KEY;
  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers: { ...headers, ...init?.headers } });
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json())?.error ?? ''; } catch { /* ignore */ }
    throw new Error(`${res.status} ${res.statusText}${detail ? ` — ${detail}` : ''}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Mapping helpers ─────────────────────────────────────────────────────────
const fmtDate = (iso?: string): string =>
  iso ? new Date(iso).toLocaleDateString('en-GB') : '';

const parseWeight = (w: string | null): number => {
  if (!w) return 0;
  const n = parseFloat(String(w).replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const LOAD_STATUS: Record<ServerLoad['status'], LoadStatus> = {
  open: 'active',
  assigned: 'in_transit',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

const DRIVER_STATUS: Record<ServerDriver['verificationStatus'], DriverStatus> = {
  unverified: 'pending_approval',
  pending: 'pending_approval',
  verified: 'approved',
  rejected: 'rejected',
  suspended: 'suspended',
};

const QUOTE_STATUS: Record<ServerQuote['status'], BidStatus> = {
  submitted: 'pending',
  approved: 'accepted',
  rejected: 'rejected',
  withdrawn: 'rejected',
};

const docStatus = (s?: string): DocumentStatus =>
  s === 'verified' || s === 'pending' || s === 'rejected' ? s : 'missing';

// ─── Adapters ────────────────────────────────────────────────────────────────
export function toLoad(s: ServerLoad): Load {
  return {
    id: s.id,
    source: s.source,
    destination: s.destination,
    pickupDate: s.pickupDate,
    vehicleType: s.vehicleType,
    weight: parseWeight(s.weight),
    budget: s.postedAmount ?? 0,
    status: LOAD_STATUS[s.status] ?? 'active',
    bidsCount: 0, // per-load bid count is fetched lazily on the Bids screen
    postedDate: fmtDate(s.createdAt),
    assignedDriver: s.assignedDriverId ?? undefined,
    notes: s.specialInstructions || undefined,
    distance: s.distanceKm != null ? `${s.distanceKm} km` : undefined,
    priceType: s.mode === 'priced' ? 'fixed' : undefined,
    fixedAmount: s.mode === 'priced' ? s.postedAmount ?? undefined : undefined,
    // Pricing worksheet — default missing fields from the posted amount.
    quotedAmount: s.quotedAmount ?? s.postedAmount ?? 0,
    kkpPrice: s.kkpPrice ?? s.postedAmount ?? 0,
    bidAmount: s.bidAmount ?? null,
    offeredAmount: s.offeredAmount ?? 0,
    amountVisible: s.amountVisible !== false,
  };
}

export function toDriver(s: ServerDriver): Driver {
  const docs = s.documents || {};
  return {
    id: s.id,
    name: s.name || '—',
    phone: s.phone || '',
    email: '',
    vehicleType: s.vehicleType || '—',
    vehicleNumber: s.vehicleNumber || '—',
    licenseNumber: docs.license?.url || '—',
    rating: s.ratingAvg ?? 0,
    totalTrips: s.ratingCount ?? 0,
    status: DRIVER_STATUS[s.verificationStatus] ?? 'pending_approval',
    documentsStatus: {
      license: docStatus(docs.license?.status),
      insurance: docStatus(docs.insurance?.status),
      registration: docStatus(docs.rc?.status),
      aadhar: docStatus(docs.aadhar?.status),
    },
    joinedDate: fmtDate(s.createdAt),
    region: s.region,
    location: s.location,
    documentUrls: {
      license: docs.license?.url,
      insurance: docs.insurance?.url,
      registration: docs.rc?.url,
      aadhar: docs.aadhar?.url,
    },
  };
}

function toBid(q: ServerQuote, driver?: ServerDriver, load?: ServerLoad): Bid {
  return {
    id: `${q.loadId}:${q.driverId}`,
    loadId: q.loadId,
    driverId: q.driverId,
    driverName: driver?.name || q.driverId,
    driverRating: driver?.ratingAvg ?? 0,
    vehicleType: driver?.vehicleType || '—',
    vehicleNumber: driver?.vehicleNumber || '—',
    price: q.amount,
    eta: load?.pickupDate || '—',
    distance: load?.distanceKm != null ? `${load.distanceKm} km` : '—',
    status: QUOTE_STATUS[q.status] ?? 'pending',
    submittedAt: fmtDate(q.createdAt),
    totalTrips: driver?.ratingCount ?? 0,
  };
}

// Raise-hand interests have no price; surface them as zero-price bid cards.
function interestToBid(i: ServerInterest, driver?: ServerDriver, load?: ServerLoad): Bid {
  return {
    ...toBid({ ...i, amount: 0, status: 'submitted' }, driver, load),
  };
}

// ─── Input shape from the KKP load form ──────────────────────────────────────
export interface CreateLoadInput {
  source: string;
  destination: string;
  pickupDate: string;   // 'YYYY-MM-DD'
  vehicleType: string;
  weight: number;       // tons
  region: string;
  budget: number;       // computed total (₹)
  notes?: string;
}

// ─── Pricing worksheet patch ──────────────────────────────────────────────────
export interface LoadPricingPatch {
  quotedAmount?: number;
  kkpPrice?: number;
  bidAmount?: number | null;
  offeredAmount?: number;
  amountVisible?: boolean;
}

// ─── Input shape from the KKP "Add Driver" form ───────────────────────────────
export type DriverDocKind = 'license' | 'insurance' | 'registration' | 'aadhar';
export interface CreateDriverInput {
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  region: string;
  location?: string;
  documents?: Partial<Record<DriverDocKind, string>>; // kind -> data URL
}

// ─── Ranked match candidate (System Design §4.2) ─────────────────────────────
export interface MatchCandidate {
  driverId: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  region: string;
  rating: number;
  trips: number;
  engaged: 'quote' | 'interest' | null;
  quoteAmount: number | null;
  score: number;
  reasons: string[];
  isAssigned: boolean;
}
export interface CandidatesResult {
  loadId: string;
  assignedDriverId: string | null;
  candidates: MatchCandidate[];
}

// ─── Public API ──────────────────────────────────────────────────────────────
const liveApiService = {
  async fetchLoads(): Promise<Load[]> {
    const data = await request<ServerLoad[]>('/admin/loads');
    return data.map(toLoad);
  },

  async createLoad(input: CreateLoadInput): Promise<Load> {
    const payload = {
      source: input.source,
      destination: input.destination,
      pickupDate: input.pickupDate,
      vehicleType: input.vehicleType,
      region: input.region,
      weight: input.weight ? `${input.weight} tons` : null,
      postedAmount: input.budget ?? null,
      specialInstructions: input.notes || '',
    };
    const created = await request<ServerLoad>('/admin/loads', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return toLoad(created);
  },

  async cancelLoad(id: string): Promise<Load> {
    const updated = await request<ServerLoad>(`/admin/loads/${id}/cancel`, { method: 'POST' });
    return toLoad(updated);
  },

  async updateLoadPricing(id: string, patch: LoadPricingPatch): Promise<Load> {
    const updated = await request<ServerLoad>(`/admin/loads/${id}/pricing`, {
      method: 'POST',
      body: JSON.stringify(patch),
    });
    return toLoad(updated);
  },

  async fetchDrivers(): Promise<Driver[]> {
    const data = await request<ServerDriver[]>('/admin/drivers');
    return data.map(toDriver);
  },

  // Admin-registered driver. Lands as 'pending' so it still flows through the
  // normal verification queue on the Driver Approvals screen.
  async createDriver(input: CreateDriverInput): Promise<Driver> {
    // Map UI doc kinds -> server kinds (registration -> rc) and attach uploads.
    const kindMap: Record<DriverDocKind, string> = {
      license: 'license', insurance: 'insurance', registration: 'rc', aadhar: 'aadhar',
    };
    const documents: Record<string, { url: string; status: string; expiry: null }> = {};
    for (const k of Object.keys(kindMap) as DriverDocKind[]) {
      const url = input.documents?.[k];
      if (url) documents[kindMap[k]] = { url, status: 'pending', expiry: null };
    }
    const payload = {
      name: input.name,
      phone: input.phone,
      vehicleType: input.vehicleType,
      vehicleNumber: input.vehicleNumber,
      region: input.region,
      location: input.location || '',
      verificationStatus: 'pending',
      documents,
    };
    const created = await request<ServerDriver>('/admin/drivers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return toDriver(created);
  },

  async verifyDriver(id: string, status: 'verified' | 'rejected' = 'verified'): Promise<Driver> {
    const updated = await request<ServerDriver>(`/admin/drivers/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
    return toDriver(updated);
  },

  // Verify/reject one of a driver's 4 documents. Approval is blocked server-side
  // until all four are verified.
  async verifyDocument(
    id: string,
    kind: 'license' | 'insurance' | 'registration' | 'aadhar',
    status: 'verified' | 'rejected' = 'verified',
  ): Promise<Driver> {
    const serverKind = kind === 'registration' ? 'rc' : kind;
    const updated = await request<ServerDriver>(`/admin/drivers/${id}/documents/${serverKind}/verify`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
    return toDriver(updated);
  },

  // Ranked drivers for matching a load (verified + vehicle hard filters,
  // region/rating/raise-hand soft scores). Returns reasons for each candidate.
  async fetchCandidates(loadId: string): Promise<CandidatesResult> {
    return request<CandidatesResult>(`/admin/loads/${loadId}/candidates`);
  },

  // Fetches quotes (priced) + interests (raise-hand) for a load and joins driver
  // identity onto each, returning unified Bid cards.
  async fetchBids(loadId: string): Promise<Bid[]> {
    const [quotes, interests, drivers, load] = await Promise.all([
      request<ServerQuote[]>(`/admin/loads/${loadId}/quotes`).catch((): ServerQuote[] => []),
      request<ServerInterest[]>(`/admin/loads/${loadId}/interests`).catch((): ServerInterest[] => []),
      request<ServerDriver[]>('/admin/drivers').catch((): ServerDriver[] => []),
      request<ServerLoad[]>('/admin/loads')
        .then(ls => ls.find(l => l.id === loadId))
        .catch((): ServerLoad | undefined => undefined),
    ]);
    const byId = new Map(drivers.map(d => [d.id, d]));
    return [
      ...quotes
        .filter(q => q.status !== 'withdrawn')
        .map(q => toBid(q, byId.get(q.driverId), load)),
      ...interests.map(i => interestToBid(i, byId.get(i.driverId), load)),
    ];
  },

  // Priced loads -> approve the winning quote (also assigns). Raise-hand -> assign.
  async assignDriver(loadId: string, driverId: string, viaQuote: boolean): Promise<void> {
    const path = viaQuote
      ? `/admin/loads/${loadId}/quotes/${driverId}/approve`
      : `/admin/loads/${loadId}/assign`;
    await request(path, {
      method: 'POST',
      body: viaQuote ? undefined : JSON.stringify({ driverId }),
    });
  },

  // Clears the current driver, returning the load to 'open' so it can be re-matched.
  async unassignLoad(loadId: string): Promise<void> {
    await request(`/admin/loads/${loadId}/unassign`, { method: 'POST' });
  },

  // "Fix match": drop the existing driver, then assign the corrected one.
  async reassignDriver(loadId: string, driverId: string, viaQuote: boolean): Promise<void> {
    await liveApiService.unassignLoad(loadId).catch(() => { /* may already be open */ });
    await liveApiService.assignDriver(loadId, driverId, viaQuote);
  },

  // "Re-match": move a driver off their current load onto another available
  // load (admin override — no bid required). The old load returns to the pool.
  async moveDriverToLoad(driverId: string, fromLoadId: string, toLoadId: string): Promise<void> {
    await liveApiService.unassignLoad(fromLoadId).catch(() => { /* may already be open */ });
    await liveApiService.assignDriver(toLoadId, driverId, false);
  },
};

// Swap between the in-memory sample data and the real backend with one flag.
export const apiService = USE_MOCK ? mockBackend : liveApiService;
