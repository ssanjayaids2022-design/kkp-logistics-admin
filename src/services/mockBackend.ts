// ─── SHARED SAMPLE-DATA BACKEND ───────────────────────────────────────────────
// Powers the entire admin dashboard with no real server, so `npm run dev` works
// out of the box. Every apiService call resolves here.
//
// State is kept in module-level arrays AND mirrored to a shared store
// (syncStore) so changes made by one agent show up for another agent — even in
// a DIFFERENT browser (Edge ↔ Chrome). That cross-browser sync requires the
// sync server: run `npm run dev:sync` (or `node sync-server.js`) alongside Vite.
// When the server is offline it degrades to localStorage (same browser only).
//
// To connect a real backend later, implement the same methods against your API
// and export that object as `apiService` in apiService.ts.

import type { Load, Driver, Bid } from '../types';
import { loads as seedLoads, drivers as seedDrivers, bids as seedBids } from '../data/mockData';
import type { CreateLoadInput, CreateDriverInput, CandidatesResult, LoadPricingPatch } from './apiService';
import { fetchDoc, saveDoc } from './syncStore';

// Local working cache, seeded from mock data. Kept in sync with the shared store.
let loads: Load[] = seedLoads.map(l => ({ ...l }));
let drivers: Driver[] = seedDrivers.map(d => ({ ...d, documentsStatus: { ...d.documentsStatus } }));
const bids: Bid[] = seedBids.map(b => ({ ...b }));

// Simulate a little network latency so loading states are visible.
const delay = <T>(value: T): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(value), 120));

// ── Shared-store sync ─────────────────────────────────────────────────────────
// pull(): refresh local cache from the shared store (what another agent wrote).
// push(): publish the local cache so other agents/browsers pick it up.
// The very first pull seeds the shared store so all clients start identical.

let seeded = false;

async function pull(): Promise<void> {
  const [remoteLoads, remoteDrivers] = await Promise.all([
    fetchDoc<Load[]>('loads'),
    fetchDoc<Driver[]>('drivers'),
  ]);

  if (Array.isArray(remoteLoads)) loads = remoteLoads;
  if (Array.isArray(remoteDrivers)) drivers = remoteDrivers;

  // Store is empty (fresh server / first run) → publish our seed once.
  if (!seeded && !Array.isArray(remoteLoads) && !Array.isArray(remoteDrivers)) {
    seeded = true;
    await push();
  }
  seeded = true;
}

async function push(): Promise<void> {
  await Promise.all([saveDoc('loads', loads), saveDoc('drivers', drivers)]);
}

// Next numeric id for a prefix, derived from current data so concurrent agents
// don't collide on `LD-1001` / `DR-001`.
function nextNum(items: { id: string }[], base: number): number {
  const max = items.reduce((m, it) => {
    const n = parseInt(String(it.id).replace(/\D/g, ''), 10);
    return Number.isNaN(n) ? m : Math.max(m, n);
  }, base);
  return max + 1;
}

export const mockBackend = {
  async fetchLoads(): Promise<Load[]> {
    await pull();
    return loads.map(l => ({ ...l }));
  },

  async createLoad(input: CreateLoadInput): Promise<Load> {
    await pull();
    const newLoad: Load = {
      id: `LD-${nextNum(loads, 1000)}`,
      source: input.source,
      destination: input.destination,
      pickupDate: input.pickupDate,
      vehicleType: input.vehicleType,
      weight: input.weight,
      budget: input.budget,
      status: 'active',
      bidsCount: 0,
      postedDate: new Date().toLocaleDateString('en-GB'),
      notes: input.notes,
      handling: input.handling,
      truckLength: input.truckLength,
      quotedAmount: input.budget,
      kkpPrice: input.budget,
      bidAmount: null,
      offeredAmount: 0,
      amountVisible: true,
    };
    loads = [newLoad, ...loads];
    await push();
    return { ...newLoad };
  },

  async updateLoadPricing(id: string, patch: LoadPricingPatch): Promise<Load> {
    await pull();
    loads = loads.map(l => (l.id === id ? { ...l, ...patch } : l));
    await push();
    return { ...(loads.find(l => l.id === id)!) };
  },

  async cancelLoad(id: string): Promise<Load> {
    await pull();
    loads = loads.map(l => (l.id === id ? { ...l, status: 'cancelled' as const, assignedDriver: undefined } : l));
    await push();
    return { ...(loads.find(l => l.id === id)!) };
  },

  async fetchDrivers(): Promise<Driver[]> {
    await pull();
    return drivers.map(d => ({ ...d }));
  },

  async createDriver(input: CreateDriverInput): Promise<Driver> {
    await pull();
    const docOf = (k: 'license' | 'insurance' | 'registration' | 'aadhar') =>
      input.documents?.[k] ? ('pending' as const) : ('missing' as const);
    const newDriver: Driver = {
      id: `DR-${String(nextNum(drivers, 0)).padStart(3, '0')}`,
      name: input.name,
      phone: input.phone,
      email: '',
      vehicleType: input.vehicleType,
      vehicleNumber: input.vehicleNumber,
      licenseNumber: '—',
      totalTrips: 0,
      status: 'pending_approval',
      documentsStatus: {
        license: docOf('license'), insurance: docOf('insurance'),
        registration: docOf('registration'), aadhar: docOf('aadhar'),
      },
      joinedDate: new Date().toLocaleDateString('en-GB'),
      region: input.region,
      location: input.location,
      documentUrls: { ...input.documents },
    };
    drivers = [newDriver, ...drivers];
    await push();
    return { ...newDriver };
  },

  async verifyDriver(id: string, status: 'verified' | 'rejected' = 'verified'): Promise<Driver> {
    await pull();
    if (status === 'verified') {
      const d = drivers.find(x => x.id === id);
      const docs = d?.documentsStatus;
      const allVerified = docs && (['license', 'insurance', 'registration', 'aadhar'] as const).every(k => docs[k] === 'verified');
      if (!allVerified) {
        throw new Error('Cannot approve: all 4 documents must be verified first');
      }
    }
    const mapped: Driver['status'] = status === 'verified' ? 'approved' : 'rejected';
    drivers = drivers.map(d => (d.id === id ? { ...d, status: mapped } : d));
    await push();
    return { ...(drivers.find(d => d.id === id)!) };
  },

  async verifyDocument(
    id: string,
    kind: 'license' | 'insurance' | 'registration' | 'aadhar',
    status: 'verified' | 'rejected' = 'verified',
  ): Promise<Driver> {
    await pull();
    drivers = drivers.map(d =>
      d.id === id ? { ...d, documentsStatus: { ...d.documentsStatus, [kind]: status } } : d
    );
    await push();
    return { ...(drivers.find(d => d.id === id)!) };
  },

  async fetchBids(loadId: string): Promise<Bid[]> {
    return delay(bids.filter(b => b.loadId === loadId).map(b => ({ ...b })));
  },

  async fetchCandidates(loadId: string): Promise<CandidatesResult> {
    await pull();
    const load = loads.find(l => l.id === loadId);
    if (!load) return { loadId, assignedDriverId: null, candidates: [] };
    // Every driver who raised a hand / quoted for this load.
    const bidByDriver = new Map(bids.filter(b => b.loadId === loadId).map(b => [b.driverId, b]));
    const candidates = drivers
      // Verified drivers who either match the vehicle type OR raised a hand for
      // THIS load (so all raise-hand drivers show, even a different vehicle).
      .filter(d => d.status === 'approved' && (d.vehicleType === load.vehicleType || bidByDriver.has(d.id)))
      .map(d => {
        const reasons: string[] = ['verified', d.vehicleType];
        let score = 0;
        const bid = bidByDriver.get(d.id);
        const engaged = bid ? ('quote' as const) : null;
        if (engaged) { score += 30; reasons.push('raised hand'); }
        if (d.vehicleType === load.vehicleType) { score += 10; } else { reasons.push('other vehicle'); }
        if (d.totalTrips > 0) { score += Math.round(Math.min(d.totalTrips, 50) / 5); reasons.push(`${d.totalTrips} trips`); }
        return {
          driverId: d.id, name: d.name, phone: d.phone,
          vehicleType: d.vehicleType, vehicleNumber: d.vehicleNumber,
          region: d.region ?? '—', trips: d.totalTrips,
          engaged, quoteAmount: bid ? bid.price : null, score, reasons,
          isAssigned: load.assignedDriver === d.id,
        };
      })
      .sort((a, b) => b.score - a.score);
    return { loadId, assignedDriverId: load.assignedDriver ?? null, candidates };
  },

  async assignDriver(loadId: string, driverId: string, _viaQuote = false, assignedBy?: { id: string; name: string }): Promise<void> {
    await pull();
    const at = new Date().toISOString();
    loads = loads.map(l =>
      l.id === loadId
        ? { ...l, assignedDriver: driverId, status: 'in_transit' as const, assignedById: assignedBy?.id, assignedByName: assignedBy?.name, assignedAt: at }
        : l
    );
    await push();
  },

  async unassignLoad(loadId: string): Promise<void> {
    await pull();
    loads = loads.map(l =>
      l.id === loadId ? { ...l, assignedDriver: undefined, status: 'active' as const, assignedById: undefined, assignedByName: undefined, assignedAt: undefined } : l
    );
    await push();
  },

  async reassignDriver(loadId: string, driverId: string, _viaQuote = false, assignedBy?: { id: string; name: string }): Promise<void> {
    await pull();
    const at = new Date().toISOString();
    loads = loads.map(l =>
      l.id === loadId
        ? { ...l, assignedDriver: driverId, status: 'in_transit' as const, assignedById: assignedBy?.id, assignedByName: assignedBy?.name, assignedAt: at }
        : l
    );
    await push();
  },

  async moveDriverToLoad(driverId: string, fromLoadId: string, toLoadId: string): Promise<void> {
    await pull();
    loads = loads.map(l => {
      if (l.id === fromLoadId) return { ...l, assignedDriver: undefined, status: 'active' as const };
      if (l.id === toLoadId) return { ...l, assignedDriver: driverId, status: 'in_transit' as const };
      return l;
    });
    await push();
  },
};
