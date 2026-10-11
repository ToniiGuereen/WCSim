'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/services/api';
import { StatsAwardsData } from '@/types';
import { BarChart3, Trophy, Medal, Award, Flame, Star } from 'lucide-react';

export default function StatsPage() {
  const { lang, refreshKey } = useApp();
  const [data, setData] = useState<StatsAwardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    api
      .getStatsAwards(lang)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Error al cargar estadísticas');
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
        <h3 className="state-title">Cargando estadísticas y premios...</h3>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="state-box">
        <span className="state-icon">⚠️</span>
        <h3 className="state-title">Error al consultar estadísticas</h3>
        <p className="state-sub">{error || 'No hay estadísticas disponibles todavía.'}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Overview Stats */}
      <section className="card">
        <header className="card-header">
          <div className="card-title">
            <BarChart3 size={22} color="var(--team-primary)" />
            <span>Métricas Generales del Torneo</span>
          </div>
          <span className="badge badge-primary">Mundial 2026</span>
        </header>

        <div className="grid grid-4" style={{ marginBottom: '28px' }}>
          <div className="stat-box">
            <div className="stat-value">{data.totalMatches}</div>
            <div className="stat-label">Partidos Jugados</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{data.totalGoals}</div>
            <div className="stat-label">Goles Totales</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{data.avgGoalsPerMatch}</div>
            <div className="stat-label">Promedio / Partido</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{ color: '#ffb81c' }}>
              {data.totalYellowCards}
            </div>
            <div className="stat-label">Tarjetas Amarillas</div>
          </div>
        </div>

        {/* Podium */}
        {data.podium && data.podium.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={18} color="var(--team-accent)" />
              Podio Oficial de la Copa
            </h3>

            <div className="grid grid-3">
              {data.podium.map((p) => (
                <div
                  key={p.place}
                  style={{
                    background: p.place === 1 ? 'linear-gradient(135deg, rgba(255, 184, 28, 0.2) 0%, rgba(13, 24, 44, 0.8) 100%)' : 'rgba(13, 24, 44, 0.65)',
                    border: p.place === 1 ? '2px solid var(--border-color-gold)' : '1px solid var(--border-color)',
                    borderRadius: '14px',
                    padding: '20px',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '40px', display: 'block', marginBottom: '6px' }}>
                    {p.medal}
                  </span>
                  <span className="badge badge-gold" style={{ marginBottom: '8px' }}>
                    {p.placeLabel}
                  </span>
                  <h3 style={{ fontSize: '20px', fontWeight: 900 }}>
                    {p.flag} {p.teamName}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scorers & Assists */}
        <div className="grid grid-2" style={{ marginBottom: '32px' }}>
          {/* Top Scorers */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px' }}>
              👟 Goleadores del Torneo
            </h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Jugador</th>
                    <th>Equipo</th>
                    <th style={{ textAlign: 'center' }}>Goles</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topScorers.map((s) => (
                    <tr key={s.rank}>
                      <td style={{ fontWeight: 800, color: s.rank === 1 ? 'var(--team-accent)' : 'inherit' }}>
                        {s.rank}
                      </td>
                      <td style={{ fontWeight: 600 }}>{s.playerName}</td>
                      <td>{s.teamName}</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--team-primary-light)' }}>
                        {s.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Assists */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px' }}>
              🎯 Líderes en Asistencias
            </h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Jugador</th>
                    <th>Equipo</th>
                    <th style={{ textAlign: 'center' }}>Asistencias</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topAssists.map((a) => (
                    <tr key={a.rank}>
                      <td style={{ fontWeight: 800, color: a.rank === 1 ? 'var(--team-accent)' : 'inherit' }}>
                        {a.rank}
                      </td>
                      <td style={{ fontWeight: 600 }}>{a.playerName}</td>
                      <td>{a.teamName}</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#2ed573' }}>
                        {a.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Individual Awards */}
        {data.awards && data.awards.length > 0 && (
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="var(--team-accent)" />
              Distinciones y Premios Individuales
            </h3>

            <div className="grid grid-3">
              {data.awards.map((award, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(13, 24, 44, 0.7)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{award.icon}</span>
                    <strong style={{ fontSize: '15px', color: 'var(--team-accent)' }}>
                      {award.title}
                    </strong>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800 }}>{award.winnerName}</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{award.teamName}</span>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {award.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
