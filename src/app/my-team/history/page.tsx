'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/services/api';
import { TeamHistoryData } from '@/types';
import { Trophy, History, Star } from 'lucide-react';

export default function TeamHistoryPage() {
  const { teamId, teamName, lang, refreshKey } = useApp();
  const [data, setData] = useState<TeamHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    api
      .getTeamHistory(teamId, lang)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Error al cargar títulos históricos');
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
        <h3 className="state-title">Cargando palmarés histórico...</h3>
        <p className="state-sub">Consultando títulos internacionales y trofeos</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="state-box">
        <span className="state-icon">⚠️</span>
        <h3 className="state-title">Error al consultar títulos</h3>
        <p className="state-sub">{error || 'No se registraron títulos para esta selección.'}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Overview Card */}
      <section className="card">
        <header className="card-header">
          <div className="card-title">
            <Trophy size={22} color="var(--team-accent)" />
            <span>Palmarés Internacional</span>
          </div>
          <span className="badge badge-gold">
            <Star size={12} /> {data.totalTitles} Títulos Oficiales
          </span>
        </header>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Historial oficial de conquistas internacionales de la Selección {teamName} en torneos oficiales FIFA y continentales.
        </p>

        {data.sections.length === 0 ? (
          <div className="state-box">
            <span className="state-icon">📭</span>
            <h3 className="state-title">Sin títulos registrados</h3>
            <p className="state-sub">No se han registrado campeonatos oficiales para esta selección.</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {data.sections.map((section, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(13, 24, 44, 0.65)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '20px',
                  transition: 'transform 0.2s, border-color 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '26px' }}>{section.icon}</span>
                    <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{section.title}</h3>
                  </div>
                  <span className="badge badge-primary">
                    {section.count} {section.count === 1 ? 'Título' : 'Títulos'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {section.chips.map((chip, cIdx) => (
                    <span
                      key={cIdx}
                      style={{
                        padding: '5px 12px',
                        background: 'rgba(255, 184, 28, 0.12)',
                        border: '1px solid var(--border-color-gold)',
                        color: 'var(--team-accent)',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
