import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { loads as initialLoads } from '../data/mockData';
import type { Load } from '../types';

interface LoadsContextType {
  loads: Load[];
  addLoad: (load: Omit<Load, 'id' | 'postedDate' | 'bidsCount' | 'status'>) => Load;
}

const LoadsContext = createContext<LoadsContextType | undefined>(undefined);

export function LoadsProvider({ children }: { children: ReactNode }) {
  const [loads, setLoads] = useState<Load[]>(() => {
    const saved = localStorage.getItem('kkp_loads');
    return saved ? JSON.parse(saved) : initialLoads;
  });

  useEffect(() => {
    localStorage.setItem('kkp_loads', JSON.stringify(loads));
  }, [loads]);

  const addLoad = (data: Omit<Load, 'id' | 'postedDate' | 'bidsCount' | 'status'>): Load => {
    const newLoad: Load = {
      ...data,
      id: `LD-${1000 + loads.length + 1}`,
      postedDate: new Date().toLocaleDateString('en-GB'),
      bidsCount: 0,
      status: 'pending',
    };
    setLoads(prev => [newLoad, ...prev]);
    return newLoad;
  };

  return (
    <LoadsContext.Provider value={{ loads, addLoad }}>
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
