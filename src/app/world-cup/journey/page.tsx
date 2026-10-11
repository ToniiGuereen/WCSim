'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/services/api';
import { JourneyData } from '@/types';
import { MapPin, Trophy, Calendar } from 'lucide-react';

export default function JourneyPage() {
  const { teamId, teamName, lang, refreshKey } = useApp();
  const [journey, setJourney] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    api
      .getJourney(teamId, lang)
      .then((data) => {
        if (isMounted) setJourney(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Error al cargar el camino del equipo');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [teamId, lang, refreshKey]);

  if (loading) {
    return (
      <div className="state-box">
        <span className="state-icon">⏳</span>
        <h3 className="state-title">Cargando camino del equipo...</h3>
        <p className="state-sub">Consultando fixture y resultados fase por fase</p>
      </div>
    );
  }

  if (error || !journey) {
    return (
      <div className="state-box">
        <span className="state-icon">⚠️</span>
        <h3 className="state-title">Error al consultar recorrido</h3>
        <p className="state-sub">{error || 'No se registraron partidos para este equipo.'}</p>
      </div>
    );
  }

  return (
    <div>
      <section className="card">
        <header className="card-header">
          <div className="card-title">
            <MapPin size={22} color="var(--team-primary)" />
            <span>Camino de {teamName} en la Copa</span>
          </div>
          <span className="badge badge-gold">
            <Trophy size={12} /> {journey.stageReachedLabel}
          </span>
        </header>

        {/* Summary box */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(117, 170, 219, 0.12) 0%, rgba(13, 24, 44, 0.6) 100%)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '26px',
          }}
        >
          <div style={{ maxWidth: '580px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--team-primary-light)' }}>
              {journey.teamName}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '4px' }}>
              {journey.summary}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '14px' }}>
            <div className="stat-box" style={{ minWidth: '120px' }}>
              <div className="stat-value">{journey.matchesPlayed}</div>
              <div className="stat-label">Partidos</div>
            </div>
            <div className="stat-box" style={{ minWidth: '140px' }}>
              <div className="stat-value" style={{ fontSize: '20px', color: 'var(--team-accent)' }}>
                {journey.stageReachedLabel}
              </div>
              <div className="stat-label">Fase Alcanzada</div>
            </div>
          </div>
        </div>

        {/* Timeline matches */}
        <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>
          Línea de Partidos Disputados
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {journey.matches.map((match, idx) => (
            <article
              key={idx}
              style={{
                background: 'rgba(13, 24, 44, 0.6)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                transition: 'transform 0.2s',
              }}
            >
              <div style={{ minWidth: '180px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  {match.stageLabel}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '22px' }}>{match.opponentFlag}</span>
                  <strong style={{ fontSize: '15px' }}>vs {match.opponentTeamName}</strong>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    fontFamily: 'Outfit, sans-serif',
                    color: 'var(--text-primary)',
                    letterSpacing: '1px',
                  }}
                >
                  {match.scoreLabel}
                </span>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {match.resolutionLabel}
                </span>
              </div>

              <div>
                <span
                  className={`badge ${
                    match.resultStyle === 'WIN'
                      ? 'badge-success'
                      : match.resultStyle === 'LOSS'
                      ? 'badge-danger'
                      : 'badge-gray'
                  }`}
                >
                  {match.resultLabel}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
