'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TEAM_PRESETS } from '@/services/mockData';

interface AppContextValue {
  teamId: string;
  teamName: string;
  teamFlag: string;
  lang: 'es' | 'en';
  isAdminOpen: boolean;
  refreshKey: number;
  openAdmin: () => void;
  closeAdmin: () => void;
  setTeam: (id: string) => void;
  setLang: (l: 'es' | 'en') => void;
  triggerRefresh: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [teamId, setTeamIdState] = useState<string>('arg');
  const [lang, setLangState] = useState<'es' | 'en'>('es');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Load persisted state or defaults
    const savedTeam = localStorage.getItem('wc_teamId') || 'arg';
    const savedLang = (localStorage.getItem('wc_lang') as 'es' | 'en') || 'es';
    setTeamIdState(savedTeam.toLowerCase());
    setLangState(savedLang);
    applyTeamPalette(savedTeam.toLowerCase());
  }, []);

  const applyTeamPalette = (id: string) => {
    const preset = TEAM_PRESETS[id] || TEAM_PRESETS.arg;
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--team-primary', preset.primary);
      root.style.setProperty('--team-secondary', preset.secondary);
      root.style.setProperty('--team-accent', preset.accent);
      root.style.setProperty('--team-dark', preset.dark);
    }
  };

  const setTeam = (id: string) => {
    const normalized = id.trim().toLowerCase();
    setTeamIdState(normalized);
    localStorage.setItem('wc_teamId', normalized);
    applyTeamPalette(normalized);
    setRefreshKey((k) => k + 1);
  };

  const setLang = (l: 'es' | 'en') => {
    setLangState(l);
    localStorage.setItem('wc_lang', l);
    setRefreshKey((k) => k + 1);
  };

  const triggerRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const activePreset = TEAM_PRESETS[teamId] || {
    name: teamId.toUpperCase(),
    flag: '⚽',
  };

  return (
    <AppContext.Provider
      value={{
        teamId,
        teamName: activePreset.name,
        teamFlag: activePreset.flag,
        lang,
        isAdminOpen,
        refreshKey,
        openAdmin: () => setIsAdminOpen(true),
        closeAdmin: () => setIsAdminOpen(false),
        setTeam,
        setLang,
        triggerRefresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
