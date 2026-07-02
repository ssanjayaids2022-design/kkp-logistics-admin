// ─── API surface for the KKP Admin Dashboard ─────────────────────────────────
// Standalone build: every call is served by the in-memory sample-data backend
// (mockBackend) so `npm run dev` runs with NO server and NO external services.
//
// To connect a real backend later, implement an object with the same method
// signatures as `mockBackend` (see the types below) and export it as
// `apiService` instead of the mock.

import { mockBackend } from './mockBackend';

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
  handling?: string;    // fragile / special handling instruction
  truckLength?: string; // required truck body length (feet)
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

// ─── Ranked match candidate ──────────────────────────────────────────────────
export interface MatchCandidate {
  driverId: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  region: string;
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
export const apiService = mockBackend;
