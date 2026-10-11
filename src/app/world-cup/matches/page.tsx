'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/services/api';
import { MatchDetailItem } from '@/types';
import { Calendar, Trophy, Award, Filter } from 'lucide-react';

export default function MatchesPage() {
  const { lang, refreshKey } = useApp();
  const [matches, setMatches] = useState<MatchDetailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStage, setSelectedStage] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    api
      .getMatches(selectedStage === 'ALL' ? undefined : selectedStage, lang)
      .then((data) => {
        if (isMounted) setMatches(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Error al cargar partidos');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedStage, lang, refreshKey]);

  const stages = [
    { code: 'ALL', label: 'Todas las fases' },
    { code: 'GROUPS', label: 'Fase de Grupos' },
    { code: 'ROUND_OF_16', label: 'Octavos de Final' },
    { code: 'QUARTER_FINALS', label: 'Cuartos de Final' },
    { code: 'SEMI_FINALS', label: 'Semifinales' },
    { code: 'FINAL', label: 'Final' },
  ];

  return (
    <div>
      <section className="card">
        <header className="card-header">
          <div className="card-title">
            <Calendar size={22} color="var(--team-primary)" />
            <span>Detalles de Partidos</span>
          </div>
          <span className="badge badge-primary">{matches.length} Partidos</span>
        </header>

        {/* Stage Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '22px' }}>
          {stages.map((st) => (
            <button
              key={st.code}
              type="button"
              className={`btn ${selectedStage === st.code ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '7px 14px', fontSize: '12.5px' }}
              onClick={() => setSelectedStage(st.code)}
            >
              {st.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="state-box">
            <span className="state-icon">⏳</span>
            <h3 className="state-title">Cargando partidos...</h3>
          </div>
        )}

        {!loading && error && (
          <div className="state-box">
            <span className="state-icon">⚠️</span>
            <h3 className="state-title">Error al consultar partidos</h3>
            <p className="state-sub">{error}</p>
          </div>
        )}

        {!loading && !error && matches.length === 0 && (
          <div className="state-box">
            <span className="state-icon">🏟️</span>
            <h3 className="state-title">No hay partidos para esta fase</h3>
            <p className="state-sub">Probá seleccionando otra fase o ejecutando la simulación.</p>
          </div>
        )}

        {!loading && !error && matches.length > 0 && (
          <div className="grid grid-2">
            {matches.map((m) => (
              <article
                key={m.matchId}
                style={{
                  background: 'rgba(13, 24, 44, 0.7)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  transition: 'transform 0.2s',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>
                    {m.matchCode} {m.groupName ? `· ${m.groupName}` : ''}
                  </span>
                  <span className="badge badge-primary">{m.resolutionLabel}</span>
                </div>

                {/* Score row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '20px', marginRight: '6px' }}>{m.homeFlag}</span>
                    <strong style={{ fontSize: '15px' }}>{m.homeTeamName}</strong>
                  </div>

                  <div
                    style={{
                      background: 'rgba(117, 170, 219, 0.15)',
                      border: '1px solid var(--border-color)',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '22px',
                      fontWeight: 900,
                      fontFamily: 'Outfit, sans-serif',
                      color: 'var(--team-primary-light)',
                    }}
                  >
                    {m.scoreLabel}
                  </div>

                  <div style={{ textAlign: 'left' }}>
                    <strong style={{ fontSize: '15px' }}>{m.awayTeamName}</strong>
                    <span style={{ fontSize: '20px', marginLeft: '6px' }}>{m.awayFlag}</span>
                  </div>
                </div>

                {m.penaltyLabel && (
                  <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--team-accent)', fontWeight: 700 }}>
                    {m.penaltyLabel}
                  </p>
                )}

                {/* Footer details */}
                <div
                  style={{
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '12px',
                    fontSize: '12.5px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  {m.winnerTeamName && (
                    <p>
                      🏆 <strong>Ganador:</strong> {m.winnerFlag} {m.winnerTeamName}
                    </p>
                  )}
                  {m.playerOfMatchName && (
                    <p>
                      ⭐ <strong>Figura:</strong> {m.playerOfMatchName}
                    </p>
                  )}
                  {m.goalsSummary && (
                    <p>
                      ⚽ <strong>Goles:</strong> {m.goalsSummary}
                    </p>
                  )}
                  {m.cardsSummary && (
                    <p>
                      🟨 <strong>Tarjetas:</strong> {m.cardsSummary}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
