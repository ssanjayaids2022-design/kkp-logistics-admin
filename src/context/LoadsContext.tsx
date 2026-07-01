import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Load } from '../types';
import { apiService, type CreateLoadInput, type LoadPricingPatch } from '../services/apiService';
import { useAuth } from './AuthContext';
import { logActivity } from '../services/activityLog';

interface LoadsContextType {
  loads: Load[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addLoad: (input: CreateLoadInput) => Promise<Load>;
  cancelLoad: (id: string) => Promise<void>;
  updatePricing: (id: string, patch: LoadPricingPatch) => Promise<void>;
}

const LoadsContext = createContext<LoadsContextType | undefined>(undefined);

const POLL_INTERVAL_MS = 8000;

export function LoadsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const actor = () => ({ user: user?.name || 'Admin', role: user?.role || 'MANAGER' as const });

  const refresh = useCallback(async () => {
    try {
      const data = await apiService.fetchLoads();
      setLoads(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load loads');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + lightweight polling (no realtime channel on the backend).
  // Polling pauses while the tab is hidden so the page can reach idle and we
  // don't waste network/battery in the background (System Design §6 P0/P3).
  useEffect(() => {
    refresh();
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (timer == null) timer = setInterval(refresh, POLL_INTERVAL_MS);
    };
    const stop = () => {
      if (timer != null) { clearInterval(timer); timer = null; }
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else { refresh(); start(); }
    };
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [refresh]);

  const addLoad = async (input: CreateLoadInput): Promise<Load> => {
    const created = await apiService.createLoad(input);
    setLoads(prev => [created, ...prev]);
    logActivity({
      ...actor(),
      type: 'load_posted',
      actionType: 'LOAD_ACTION',
      message: `Posted load ${created.id} (${created.source} → ${created.destination})`,
      description: `Created new shipment load ${created.id} (${created.source} → ${created.destination})`,
    });
    return created;
  };

  const cancelLoad = async (id: string): Promise<void> => {
    const updated = await apiService.cancelLoad(id);
    setLoads(prev => prev.map(l => (l.id === id ? updated : l)));
    logActivity({
      ...actor(),
      type: 'load_cancelled',
      actionType: 'LOAD_ACTION',
      message: `Cancelled load ${id}`,
      description: `Cancelled shipment load ${id}`,
    });
  };

  const updatePricing = async (id: string, patch: LoadPricingPatch): Promise<void> => {
    // Optimistic local update so the table reflects edits immediately.
    setLoads(prev => prev.map(l => (l.id === id ? { ...l, ...patch } : l)));
    const updated = await apiService.updateLoadPricing(id, patch);
    setLoads(prev => prev.map(l => (l.id === id ? updated : l)));
  };

  return (
    <LoadsContext.Provider value={{ loads, loading, error, refresh, addLoad, cancelLoad, updatePricing }}>
      {children}
    </LoadsContext.Provider>
  );
}

export function useLoads(): LoadsContextType {
  const context = useContext(LoadsContext);
  if (!context) {
    throw new Error('useLoads must be used within a LoadsProvider');
  }
  return context;
}
