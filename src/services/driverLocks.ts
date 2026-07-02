// ─── Driver contact locks ────────────────────────────────────────────────────
// When an agent clicks "Lock" on a driver in Match, the driver is locked to that
// agent so no other agent can lock/assign them until released or assigned.
//
// Storage strategy (with automatic fallback):
//   1. PRIMARY  — shared HTTP server at :3001 (sync-server.js).
//                 This is the ONLY way locks propagate across different browsers
//                 (Edge ↔ Chrome etc.). Run `node sync-server.js` alongside Vite.
//   2. FALLBACK — localStorage (same browser only, used when server is offline).
//
// The hook polls the active source every 2 seconds so the UI stays live.

import { useEffect, useState } from 'react';

export interface DriverLock {
  agentId: string;
  agentName: string;
  loadId: string;
  at: string;
}
type LockMap = Record<string, DriverLock>;

// ── Constants ────────────────────────────────────────────────────────────────
const LS_KEY    = 'kkp_driver_locks';
const LS_EVENT  = 'kkp:driverlocks';
// Same host the browser used — so LAN teammates hit the right sync server.
const SYNC_URL  = `${window.location.protocol}//${window.location.hostname}:3001`;
const POLL_MS   = 2000;

// ── Server availability ──────────────────────────────────────────────────────
// Cached so we don't ping the server on every call. Re-checked each poll cycle.
let serverAvailable: boolean | null = null;

async function checkServer(): Promise<boolean> {
  try {
    const res = await fetch(`${SYNC_URL}/api/health`, { signal: AbortSignal.timeout(800) });
    return res.ok;
  } catch {
    return false;
  }
}

// ── localStorage helpers (fallback) ──────────────────────────────────────────
function lsGet(): LockMap {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
}

function lsSave(map: LockMap): void {
  localStorage.setItem(LS_KEY, JSON.stringify(map));
  window.dispatchEvent(new CustomEvent(LS_EVENT));
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Fetch all current locks from the best available source. */
export async function fetchLocks(): Promise<LockMap> {
  if (serverAvailable == null) serverAvailable = await checkServer();
  if (serverAvailable) {
    try {
      const res = await fetch(`${SYNC_URL}/api/locks`, { signal: AbortSignal.timeout(1000) });
      if (res.ok) return res.json();
    } catch {
      serverAvailable = false; // mark offline, will retry next poll
    }
  }
  return lsGet();
}

/** Synchronous read — localStorage only (for initial render). */
export function getLocks(): LockMap {
  return lsGet();
}

export async function lockDriver(driverId: string, lock: DriverLock): Promise<void> {
  if (serverAvailable == null) serverAvailable = await checkServer();
  if (serverAvailable) {
    try {
      await fetch(`${SYNC_URL}/api/locks/${driverId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lock),
        signal: AbortSignal.timeout(1000),
      });
      // Also mirror to localStorage so same-tab state is instant
      const m = lsGet(); m[driverId] = lock; lsSave(m);
      return;
    } catch {
      serverAvailable = false;
    }
  }
  // Fallback: localStorage only
  const m = lsGet(); m[driverId] = lock; lsSave(m);
}

export async function unlockDriver(driverId: string): Promise<void> {
  if (serverAvailable == null) serverAvailable = await checkServer();
  if (serverAvailable) {
    try {
      await fetch(`${SYNC_URL}/api/locks/${driverId}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(1000),
      });
      const m = lsGet(); delete m[driverId]; lsSave(m);
      return;
    } catch {
      serverAvailable = false;
    }
  }
  const m = lsGet(); delete m[driverId]; lsSave(m);
}

/** Live map of driver locks — polls every 2 s and listens to in-tab events. */
export function useDriverLocks(): LockMap {
  const [locks, setLocks] = useState<LockMap>(lsGet);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      const latest = await fetchLocks();
      if (!cancelled) setLocks(latest);
    };

    const onLsEvent = () => setLocks(lsGet());
    const onStorage = (e: StorageEvent) => { if (e.key === LS_KEY) setLocks(lsGet()); };

    // In-tab instant updates
    window.addEventListener(LS_EVENT, onLsEvent);
    window.addEventListener('storage', onStorage);

    // Periodic poll (catches cross-browser updates via the sync server)
    refresh();
    const poll = setInterval(refresh, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(poll);
      window.removeEventListener(LS_EVENT, onLsEvent);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return locks;
}
