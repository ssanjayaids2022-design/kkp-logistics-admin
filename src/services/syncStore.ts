// ─── Shared document store (cross-browser) ───────────────────────────────────
// A tiny key→JSON store that keeps app data (loads, drivers, …) in sync across
// DIFFERENT browsers (Edge ↔ Chrome), exactly like driverLocks.ts does for locks.
//
// Storage strategy (with automatic fallback):
//   1. PRIMARY  — shared HTTP server at :3001 (sync-server.js).
//                 The ONLY way state propagates across different browsers.
//                 Run `node sync-server.js` (or `npm run dev:sync`) alongside Vite.
//   2. FALLBACK — localStorage (same browser only, used when server is offline).

// Use the same host the browser used to reach the app so teammates connecting
// via a LAN IP (e.g. http://192.168.1.5:3000) still reach the right sync server.
const SYNC_URL = `${window.location.protocol}//${window.location.hostname}:3001`;
const LS_PREFIX = 'kkp_doc_';

// Cached availability so we don't ping the server on every call.
let serverAvailable: boolean | null = null;

async function checkServer(): Promise<boolean> {
  try {
    const res = await fetch(`${SYNC_URL}/api/health`, { signal: AbortSignal.timeout(800) });
    return res.ok;
  } catch {
    return false;
  }
}

/** Force a re-check of server availability on the next call. */
export function resetServerAvailability(): void {
  serverAvailable = null;
}

function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function lsSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
  } catch {
    /* quota / private mode — ignore */
  }
}

/** Read a document by key from the best available source. Returns null if absent. */
export async function fetchDoc<T>(key: string): Promise<T | null> {
  if (serverAvailable == null) serverAvailable = await checkServer();
  if (serverAvailable) {
    try {
      const res = await fetch(`${SYNC_URL}/api/data/${key}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const body = await res.json();
        // Server responds { value: <doc|null> }
        return (body?.value ?? null) as T | null;
      }
    } catch {
      serverAvailable = false; // mark offline, retry next cycle
    }
  }
  return lsGet<T>(key);
}

/** Write a document by key to the best available source (and mirror to localStorage). */
export async function saveDoc<T>(key: string, value: T): Promise<void> {
  if (serverAvailable == null) serverAvailable = await checkServer();
  if (serverAvailable) {
    try {
      await fetch(`${SYNC_URL}/api/data/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
        signal: AbortSignal.timeout(1500),
      });
      lsSet(key, value); // mirror so same-tab reads are instant
      return;
    } catch {
      serverAvailable = false;
    }
  }
  lsSet(key, value);
}
