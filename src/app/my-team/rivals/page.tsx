'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/services/api';
import { RivalItem } from '@/types';
import { Swords, ShieldAlert, Award, User, Flame } from 'lucide-react';

export default function RivalsPage() {
  const { teamId, teamName, lang, refreshKey } = useApp();
  const [rivals, setRivals] = useState<RivalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    api
      .getRivals(teamId, lang)
      .then((data) => {
        if (isMounted) setRivals(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Error al cargar rivales históricos');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [teamId, lang, refreshKey]);

  return (
    <div>
      <section className="card">
        <header className="card-header">
          <div className="card-title">
            <Swords size={22} color="var(--team-accent)" />
            <span>Rivales Históricos</span>
          </div>
          <span className="badge badge-primary">
            {rivals.length} Selecciones Rivalizadas
          </span>
        </header>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '22px' }}>
          Análisis de los principales adversarios clásicos y rivales de gran peso competitivo frente a la Selección {teamName}.
        </p>

        {loading && (
          <div className="state-box">
            <span className="state-icon">⏳</span>
            <h3 className="state-title">Cargando rivales históricos...</h3>
            <p className="state-sub">Consultando historial de rivalidades internacionales</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-box">
            <span className="state-icon">⚠️</span>
            <h3 className="state-title">Error al consultar rivales</h3>
            <p className="state-sub">{error}</p>
          </div>
        )}

        {!loading && !error && rivals.length === 0 && (
          <div className="state-box">
            <span className="state-icon">🛡️</span>
            <h3 className="state-title">Sin rivales registrados</h3>
            <p className="state-sub">No se registran rivales clásicos directos para esta selección.</p>
          </div>
        )}

        {!loading && !error && rivals.length > 0 && (
          <div className="grid grid-3">
            {rivals.map((rival) => (
              <article
                key={rival.id}
                style={{
                  background: 'rgba(13, 24, 44, 0.7)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'transform 0.2s, border-color 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '32px' }}>{rival.flag}</span>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: 800 }}>{rival.name}</h3>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {rival.confederation}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'rgba(255, 184, 28, 0.15)',
                      border: '1px solid var(--border-color-gold)',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
                      RATING
                    </span>
                    <strong style={{ fontSize: '16px', color: 'var(--team-accent)', fontWeight: 800 }}>
                      {rival.overallRating}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '12.5px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <p>
                    🧑‍💼 <strong>DT:</strong> {rival.coachName}
                  </p>
                  <p>
                    👑 <strong>Capitán:</strong> {rival.captainName}
                  </p>
                  <p>
                    📐 <strong>Formación:</strong> {rival.formation}
                  </p>
                  <p>
                    ⚡ <strong>Estrategia:</strong> {rival.strategyLabel}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
