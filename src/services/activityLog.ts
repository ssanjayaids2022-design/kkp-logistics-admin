// ─── Activity / audit event log ──────────────────────────────────────────────
// A tiny localStorage-backed event log so operational actions (posting a load,
// cancelling, assigning a driver, …) show up live in the dashboard's Recent
// Activity feed AND the Audit Logs page. Emits an in-tab event + rides the
// cross-tab `storage` event so open screens refresh immediately.

import { useEffect, useState } from 'react';
import type { Role } from '../types';

export type ActivityType =
  | 'load_posted' | 'load_cancelled' | 'driver_assigned' | 'driver_added'
  | 'payment_processed' | 'security';

export type AuditActionType =
  | 'LOAD_ACTION' | 'BID_ACTION' | 'PAYMENT_ACTION' | 'DRIVER_ACTION' | 'SECURITY_ACTION';

export interface ActivityEntry {
  id: string;
  at: string;          // ISO timestamp
  type: ActivityType;
  message: string;     // short summary (dashboard feed)
  description: string; // full text (audit log)
  user: string;        // acting admin name
  role: Role;
  actionType: AuditActionType;
}

const KEY = 'kkp_activity';
const EVENT = 'kkp:activity';
const MAX = 200;

export function getActivities(): ActivityEntry[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function logActivity(e: Omit<ActivityEntry, 'id' | 'at'> & { at?: string }): void {
  const entry: ActivityEntry = {
    id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    at: e.at || new Date().toISOString(),
    type: e.type,
    message: e.message,
    description: e.description,
    user: e.user,
    role: e.role,
    actionType: e.actionType,
  };
  const next = [entry, ...getActivities()].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVENT));
}

/** Live list of activity entries (newest first), auto-refreshing on new events. */
export function useActivities(): ActivityEntry[] {
  const [items, setItems] = useState<ActivityEntry[]>(getActivities);
  useEffect(() => {
    const refresh = () => setItems(getActivities());
    const onStorage = (ev: StorageEvent) => { if (ev.key === KEY) refresh(); };
    window.addEventListener(EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  return items;
}

/** "just now" / "5 min ago" / "3 hr ago" / date — for the dashboard feed. */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 45) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)} min ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)} hr ago`;
  return new Date(iso).toLocaleDateString('en-GB');
}
