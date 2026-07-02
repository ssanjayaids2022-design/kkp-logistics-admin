// ─── IN-MEMORY SAMPLE-DATA BACKEND ───────────────────────────────────────────
// Powers the entire admin dashboard with no server, so `npm run dev` works
// out of the box. Every apiService call resolves here.
//
// State lives in module-level arrays, so changes persist for the browser
// session (until refresh) — long enough to walk through a full flow.
//
// To connect a real backend later, implement the same methods against your API
// and export that object as `apiService` in apiService.ts.

import type { Load, Driver, Bid } from '../types';
import { loads as seedLoads, drivers as seedDrivers, bids as seedBids } from '../data/mockData';
import type { CreateLoadInput, CreateDriverInput, CandidatesResult, LoadPricingPatch } from './apiService';

// Mutable working copies (deep-ish) so mutations survive the 8s polling refresh.
let loads: Load[] = seedLoads.map(l => ({ ...l }));
let drivers: Driver[] = seedDrivers.map(d => ({ ...d, documentsStatus: { ...d.documentsStatus } }));
const bids: Bid[] = seedBids.map(b => ({ ...b }));

let loadSeq = 1000 + loads.length;
let driverSeq = drivers.length;

// Simulate a little network latency so loading states are visible.
const delay = <T>(value: T): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(value), 180));

export const mockBackend = {
  async fetchLoads(): Promise<Load[]> {
    return delay(loads.map(l => ({ ...l })));
  },

  async createLoad(input: CreateLoadInput): Promise<Load> {
    loadSeq += 1;
    const newLoad: Load = {
      id: `LD-${loadSeq}`,
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
    return delay({ ...newLoad });
  },

  async updateLoadPricing(id: string, patch: LoadPricingPatch): Promise<Load> {
    loads = loads.map(l => (l.id === id ? { ...l, ...patch } : l));
    return delay({ ...(loads.find(l => l.id === id)!) });
  },

  async cancelLoad(id: string): Promise<Load> {
    loads = loads.map(l => (l.id === id ? { ...l, status: 'cancelled' as const, assignedDriver: undefined } : l));
    return delay({ ...(loads.find(l => l.id === id)!) });
  },

  async fetchDrivers(): Promise<Driver[]> {
    return delay(drivers.map(d => ({ ...d })));
  },

  async createDriver(input: CreateDriverInput): Promise<Driver> {
    driverSeq += 1;
    const docOf = (k: 'license' | 'insurance' | 'registration' | 'aadhar') =>
      input.documents?.[k] ? ('pending' as const) : ('missing' as const);
    const newDriver: Driver = {
      id: `DR-${String(driverSeq).padStart(3, '0')}`,
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
    return delay({ ...newDriver });
  },

  async verifyDriver(id: string, status: 'verified' | 'rejected' = 'verified'): Promise<Driver> {
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
    return delay({ ...(drivers.find(d => d.id === id)!) });
  },

  async verifyDocument(
    id: string,
    kind: 'license' | 'insurance' | 'registration' | 'aadhar',
    status: 'verified' | 'rejected' = 'verified',
  ): Promise<Driver> {
    drivers = drivers.map(d =>
      d.id === id ? { ...d, documentsStatus: { ...d.documentsStatus, [kind]: status } } : d
    );
    return delay({ ...(drivers.find(d => d.id === id)!) });
  },

  async fetchBids(loadId: string): Promise<Bid[]> {
    return delay(bids.filter(b => b.loadId === loadId).map(b => ({ ...b })));
  },

  async fetchCandidates(loadId: string): Promise<CandidatesResult> {
    const load = loads.find(l => l.id === loadId);
    if (!load) return delay({ loadId, assignedDriverId: null, candidates: [] });
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
    return delay({ loadId, assignedDriverId: load.assignedDriver ?? null, candidates });
  },

  async assignDriver(loadId: string, driverId: string, _viaQuote = false): Promise<void> {
    loads = loads.map(l =>
      l.id === loadId ? { ...l, assignedDriver: driverId, status: 'in_transit' as const } : l
    );
    return delay(undefined);
  },

  async unassignLoad(loadId: string): Promise<void> {
    loads = loads.map(l =>
      l.id === loadId ? { ...l, assignedDriver: undefined, status: 'active' as const } : l
    );
    return delay(undefined);
  },

  async reassignDriver(loadId: string, driverId: string, _viaQuote = false): Promise<void> {
    loads = loads.map(l =>
      l.id === loadId ? { ...l, assignedDriver: driverId, status: 'in_transit' as const } : l
    );
    return delay(undefined);
  },

  async moveDriverToLoad(driverId: string, fromLoadId: string, toLoadId: string): Promise<void> {
    loads = loads.map(l => {
      if (l.id === fromLoadId) return { ...l, assignedDriver: undefined, status: 'active' as const };
      if (l.id === toLoadId) return { ...l, assignedDriver: driverId, status: 'in_transit' as const };
      return l;
    });
    return delay(undefined);
  },
};
