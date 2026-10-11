'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';

const ROUTE_INFO: Record<string, { title: string; subtitle: string }> = {
  '/my-team/squad': {
    title: 'Plantel de la Selección',
    subtitle: 'Nómina oficial de jugadores, posiciones y atributos',
  },
  '/my-team/coaching': {
    title: 'Cuerpo Técnico y Estrategia',
    subtitle: 'Director técnico, perfil táctico, formaciones y estilo de juego',
  },
  '/my-team/history': {
    title: 'Historia y Títulos del Equipo',
    subtitle: 'Palmarés internacional, copas continentales y mundiales',
  },
  '/my-team/rivals': {
    title: 'Rivales Históricos',
    subtitle: 'Enfrentamientos directos, rating y estadísticas de rivales',
  },
  '/world-cup/groups': {
    title: 'Fase de Grupos',
    subtitle: 'Tablas de posiciones oficiales del Mundial 2026',
  },
  '/world-cup/journey': {
    title: 'Camino del Equipo',
    subtitle: 'Recorrido partido a partido de la selección en el torneo',
  },
  '/world-cup/simulate': {
    title: 'Simulación del Mundial 2026',
    subtitle: 'Ejecutar o consultar el estado de la simulación del torneo',
  },
  '/world-cup/matches': {
    title: 'Detalles de Partidos',
    subtitle: 'Resultados, goleadores, tarjetas y figuras por fase',
  },
  '/world-cup/stats': {
    title: 'Estadísticas y Premios',
    subtitle: 'Podio final, goleadores, asistencias y distinciones individuales',
  },
  '/world-cup/history': {
    title: 'Historial de Copas del Mundo',
    subtitle: 'Ediciones anteriores de la Copa Mundial de la FIFA',
  },
  '/play-final/chat': {
    title: 'Jugar la Gran Final',
    subtitle: 'Simulador interactivo por turnos de la Final del Mundial',
  },
  '/play-final/live': {
    title: 'Eventos en Vivo',
    subtitle: 'Línea de tiempo y minuto a minuto de la Final',
  },
  '/play-final/team-state': {
    title: 'Estado del Equipo en la Final',
    subtitle: 'Alineaciones en cancha, nivel de energía y cambios',
  },
};

export function Topbar() {
  const pathname = usePathname();
  const { teamName } = useApp();

  const current = ROUTE_INFO[pathname] || {
    title: 'Mundial 2026',
    subtitle: 'Aplicación de seguimiento y simulación',
  };

  return (
    <div className="topbar">
      <div className="topbar-titles">
        <h1>{current.title}</h1>
        <p>
          {current.subtitle} · <strong>{teamName}</strong>
        </p>
      </div>
      <div className="topbar-actions" id="topbar-action-slot" />
    </div>
  );
}
