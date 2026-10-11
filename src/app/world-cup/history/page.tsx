'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/services/api';
import { HistoricalWorldCupItem } from '@/types';
import { Trophy, Award, Calendar } from 'lucide-react';

export default function WorldCupHistoryPage() {
  const { lang, refreshKey } = useApp();
  const [history, setHistory] = useState<HistoricalWorldCupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    api
      .getWorldCupHistory(lang)
      .then((data) => {
        if (isMounted) setHistory(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Error al cargar historial de mundiales');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lang, refreshKey]);

  if (loading) {
    return (
      <div className="state-box">
        <span className="state-icon">⏳</span>
        <h3 className="state-title">Cargando historial de copas...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-box">
        <span className="state-icon">⚠️</span>
        <h3 className="state-title">Error al consultar historial</h3>
        <p className="state-sub">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <section className="card">
        <header className="card-header">
          <div className="card-title">
            <Trophy size={22} color="var(--team-accent)" />
            <span>Historial de Copas Mundiales de la FIFA</span>
          </div>
          <span className="badge badge-gold">{history.length} Ediciones Registradas</span>
        </header>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Registro histórico de las finales, podios y estadísticas consolidadas en las distintas ediciones de la Copa del Mundo.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {history.map((wc) => (
            <article
              key={wc.edition}
              style={{
                background: 'rgba(13, 24, 44, 0.7)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '14px',
                  marginBottom: '18px',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '19px', fontWeight: 900, color: 'var(--text-primary)' }}>
                    {wc.editionLabel}
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    📍 Sede: {wc.host} · {wc.year}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {wc.finalScoreLabel && (
                    <span
                      style={{
                        padding: '6px 14px',
                        background: 'rgba(117, 170, 219, 0.15)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        fontWeight: 800,
                        fontSize: '15px',
                        color: 'var(--team-primary-light)',
                      }}
                    >
                      Final: {wc.finalScoreLabel}
                    </span>
                  )}
                  <span className="badge badge-gray">{wc.worldCupIdShort}</span>
                </div>
              </div>

              {/* Podium row */}
              <div className="grid grid-4" style={{ marginBottom: '18px' }}>
                <div style={{ padding: '12px', background: 'rgba(255, 184, 28, 0.1)', borderRadius: '10px', border: '1px solid var(--border-color-gold)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--team-accent)', fontWeight: 800 }}>🥇 CAMPEÓN</span>
                  <div style={{ fontSize: '15px', fontWeight: 800, marginTop: '4px' }}>
                    {wc.champion.flag} {wc.champion.teamName}
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'rgba(148, 163, 184, 0.1)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 800 }}>🥈 SUBCAMPEÓN</span>
                  <div style={{ fontSize: '15px', fontWeight: 800, marginTop: '4px' }}>
                    {wc.runnerUp.flag} {wc.runnerUp.teamName}
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'rgba(205, 127, 50, 0.1)', borderRadius: '10px', border: '1px solid rgba(205, 127, 50, 0.3)' }}>
                  <span style={{ fontSize: '11px', color: '#cd7f32', fontWeight: 800 }}>🥉 TERCER PUESTO</span>
                  <div style={{ fontSize: '15px', fontWeight: 800, marginTop: '4px' }}>
                    {wc.thirdPlace.flag} {wc.thirdPlace.teamName}
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'rgba(13, 24, 44, 0.4)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800 }}>4° PUESTO</span>
                  <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '4px' }}>
                    {wc.fourthPlace.flag} {wc.fourthPlace.teamName}
                  </div>
                </div>
              </div>

              {/* Tournament stats summary */}
              <div
                style={{
                  display: 'flex',
                  gap: '18px',
                  fontSize: '12.5px',
                  color: 'var(--text-secondary)',
                  flexWrap: 'wrap',
                }}
              >
                <span>🎯 Partidos: <strong>{wc.totalMatches}</strong></span>
                <span>⚽ Goles: <strong>{wc.totalGoals}</strong> ({wc.avgGoalsPerMatch}/partido)</span>
                <span>🟨 Amarillas: <strong>{wc.yellowCards}</strong></span>
                <span>🟥 Rojas: <strong>{wc.redCards}</strong></span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
