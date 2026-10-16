'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TEAM_PRESETS } from '@/services/mockData';
import { api } from '@/services/api';

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
    const stored = localStorage.getItem('wc_teamId');
    const savedTeam = stored || 'arg';
    if (!stored) setIsAdminOpen(true); // primera visita: elegir selección
    const savedLang = (localStorage.getItem('wc_lang') as 'es' | 'en') || 'es';
    setTeamIdState(savedTeam.toLowerCase());
    setLangState(savedLang);
    applyTeamPalette(savedTeam.toLowerCase());
    // El servidor recuerda la selección en memoria: la sincronizamos con la guardada en el navegador.
    if (stored) api.selectTeam(savedTeam.toLowerCase(), savedLang).then(() => setRefreshKey((k) => k + 1)).catch(() => { localStorage.removeItem('wc_teamId'); setIsAdminOpen(true); });
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
    api.selectTeam(normalized, lang).catch(() => {}).finally(() => setRefreshKey((k) => k + 1));
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
