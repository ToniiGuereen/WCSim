'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/services/api';
import { TeamStateData, TeamSideState } from '@/types';
import { Activity, Shield, Users, Battery } from 'lucide-react';

export default function TeamStatePage() {
  const { refreshKey } = useApp();
  const [data, setData] = useState<TeamStateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    api
      .getTeamState()
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Error al cargar estado del equipo');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const renderTeamPanel = (team: TeamSideState, isMyTeam = false) => (
    <article
      style={{
        background: 'rgba(13, 24, 44, 0.7)',
        border: isMyTeam ? '2px solid var(--border-color)' : '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '32px' }}>{team.flag}</span>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 900 }}>{team.name}</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              DT: {team.coachName} ({team.coachProfile})
            </span>
          </div>
        </div>
        <span className="badge badge-primary">
          {team.formation} · {team.strategy}
        </span>
      </div>

      {/* Tactical Line breakdown */}
      <div>
        <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Líneas Tácticas Efectivas
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <div style={{ padding: '8px', background: 'rgba(117, 170, 219, 0.08)', borderRadius: '6px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ATAQUE</span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#ff4757' }}>
              {team.tacticalBreakdown.effectiveTeamLine.attack}
            </div>
          </div>
          <div style={{ padding: '8px', background: 'rgba(117, 170, 219, 0.08)', borderRadius: '6px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MEDIO</span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#2ed573' }}>
              {team.tacticalBreakdown.effectiveTeamLine.midfield}
            </div>
          </div>
          <div style={{ padding: '8px', background: 'rgba(117, 170, 219, 0.08)', borderRadius: '6px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>DEFENSA</span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#75aadb' }}>
              {team.tacticalBreakdown.effectiveTeamLine.defense}
            </div>
          </div>
        </div>
      </div>

      {/* On Field players */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Titulares en Cancha ({team.onField.length})
          </h4>
          <span style={{ fontSize: '11px', color: 'var(--team-accent)', fontWeight: 700 }}>
            Cambios: {team.substitutionsUsed}/{team.maxSubstitutions}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
          {team.onField.map((p) => (
            <div
              key={p.shirtNumber}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 12px',
                background: 'rgba(10, 19, 36, 0.6)',
                borderRadius: '6px',
                fontSize: '12.5px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ color: 'var(--team-primary-light)', minWidth: '18px' }}>
                  {p.shirtNumber}
                </strong>
                <span>{p.name}</span>
                <span className={`pos-tag pos-${p.position}`}>{p.position}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <Battery size={14} color="#2ed573" />
                <span>{p.energyLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bench players */}
      <div>
        <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Suplentes Disponibles ({team.bench.length})
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {team.bench.map((b) => (
            <span
              key={b.shirtNumber}
              style={{
                padding: '4px 8px',
                background: 'rgba(117, 170, 219, 0.08)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '11.5px',
              }}
            >
              #{b.shirtNumber} {b.name} ({b.position})
            </span>
          ))}
        </div>
      </div>
    </article>
  );

  return (
    <div>
      <section className="card">
        <header className="card-header">
          <div className="card-title">
            <Activity size={22} color="var(--team-primary)" />
            <span>Estado Táctico y Físico del Equipo</span>
          </div>
          {data && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <span className="badge badge-primary">Minuto {data.minute}&apos;</span>
              <span className="badge badge-gold">{data.score}</span>
            </div>
          )}
        </header>

        {loading && (
          <div className="state-box">
            <span className="state-icon">⏳</span>
            <h3 className="state-title">Cargando estado físico y táctico...</h3>
          </div>
        )}

        {!loading && error && (
          <div className="state-box">
            <span className="state-icon">⚠️</span>
            <h3 className="state-title">Aviso de estado del equipo</h3>
            <p className="state-sub">{error}</p>
          </div>
        )}

        {!loading && !error && data && (
          <div className="grid grid-2">
            {renderTeamPanel(data.team, true)}
            {renderTeamPanel(data.opponent, false)}
          </div>
        )}
      </section>
    </div>
  );
}
