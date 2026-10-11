'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Users,
  Briefcase,
  History,
  ShieldAlert,
  Layers,
  MapPin,
  PlayCircle,
  Calendar,
  BarChart3,
  Award,
  Gamepad2,
  Radio,
  Activity,
} from 'lucide-react';

interface NavItemDef {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavSectionDef {
  title: string;
  items: NavItemDef[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { teamName, teamFlag } = useApp();

  const sections: NavSectionDef[] = [
    {
      title: 'Mi Equipo',
      items: [
        { label: 'Plantel', href: '/my-team/squad', icon: <Users size={17} /> },
        { label: 'Cuerpo Técnico', href: '/my-team/coaching', icon: <Briefcase size={17} /> },
        { label: 'Historial del Equipo', href: '/my-team/history', icon: <History size={17} /> },
        { label: 'Rivales Históricos', href: '/my-team/rivals', icon: <ShieldAlert size={17} /> },
      ],
    },
    {
      title: 'El Mundial',
      items: [
        { label: 'Fase de Grupos', href: '/world-cup/groups', icon: <Layers size={17} /> },
        { label: 'Camino del Equipo', href: '/world-cup/journey', icon: <MapPin size={17} /> },
        { label: 'Simular Final', href: '/world-cup/simulate', icon: <PlayCircle size={17} /> },
        { label: 'Partidos', href: '/world-cup/matches', icon: <Calendar size={17} /> },
        { label: 'Estadísticas y Premios', href: '/world-cup/stats', icon: <BarChart3 size={17} /> },
        { label: 'Historial de Mundiales', href: '/world-cup/history', icon: <Award size={17} /> },
      ],
    },
    {
      title: 'La Final',
      items: [
        { label: 'Jugar la Final', href: '/play-final/chat', icon: <Gamepad2 size={17} /> },
        { label: 'Eventos en Vivo', href: '/play-final/live', icon: <Radio size={17} /> },
        { label: 'Estado del Equipo', href: '/play-final/team-state', icon: <Activity size={17} /> },
      ],
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-flag">{teamFlag}</span>
        <div className="sidebar-team-meta">
          <h3>{teamName}</h3>
          <p>Selección Nacional</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sections.map((section, idx) => (
          <div key={idx} className="nav-section">
            <div className="nav-section-title">{section.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
