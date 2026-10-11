'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Settings, Globe } from 'lucide-react';

export function AppHeader() {
  const { teamName, teamFlag, lang, setLang, openAdmin } = useApp();

  return (
    <header className="app-header">
      <Link href="/my-team/squad" className="app-logo">
        <span className="logo-icon">🏆</span>
        <span>
          MUNDIAL <span className="logo-accent">2026</span>
        </span>
      </Link>

      <div className="header-team-badge">
        <span>{teamFlag}</span>
        <span>Selección: <strong>{teamName}</strong></span>
      </div>

      <div className="header-right">
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: '6px 12px', fontSize: '12px' }}
          onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
          title="Cambiar idioma"
        >
          <Globe size={15} />
          <span>{lang.toUpperCase()}</span>
        </button>

        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: '6px 12px', fontSize: '12px' }}
          onClick={openAdmin}
          title="Configuración de Selección"
        >
          <Settings size={15} />
          <span>Config</span>
        </button>
      </div>
    </header>
  );
}
