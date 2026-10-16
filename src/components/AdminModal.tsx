'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/services/api';
import { SelectableTeam } from '@/types';
import { X, Globe, Shield } from 'lucide-react';

export function AdminModal() {
  const { teamId, lang, isAdminOpen, closeAdmin, setTeam, setLang } = useApp();
  const [teams, setTeams] = useState<SelectableTeam[]>([]);

  useEffect(() => {
    if (!isAdminOpen) return;
    api.getTeamSelection(lang).then((d) => setTeams(d.teams)).catch(() => setTeams([]));
  }, [isAdminOpen, lang, teamId]);

  if (!isAdminOpen) return null;

  const handleSelectPreset = (id: string) => {
    setTeam(id);
    closeAdmin();
  };

  return (
    <div className="modal-overlay" onClick={closeAdmin}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="var(--team-primary)" />
            Elegí tu selección
          </h2>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '4px 8px', borderRadius: '50%' }}
            onClick={closeAdmin}
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Elegí una de las 10 mejores selecciones de la historia. Solo vas a poder jugar la Gran Final si tu selección llega hasta ahí. Cambiar de selección reinicia el torneo.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '22px' }}>
          {teams.map((t) => {
            const isSelected = teamId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectPreset(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  textAlign: 'left',
                  border: isSelected ? '2px solid var(--team-primary)' : '1px solid var(--border-color)',
                  background: isSelected ? 'rgba(117, 170, 219, 0.2)' : 'rgba(13, 24, 44, 0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: '#fff',
                }}
              >
                <span style={{ fontSize: '28px' }}>{t.flag}</span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800 }}>#{t.rank} {t.name}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {t.worldCupTitles} {t.worldCupTitles === 1 ? 'título' : 'títulos'} · Rating {t.overallRating}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Language selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(117, 170, 219, 0.08)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} color="var(--team-primary)" />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Idioma de datos:</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className={`btn ${lang === 'es' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '4px 12px', fontSize: '12px' }}
              onClick={() => setLang('es')}
            >
              Español
            </button>
            <button
              type="button"
              className={`btn ${lang === 'en' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '4px 12px', fontSize: '12px' }}
              onClick={() => setLang('en')}
            >
              English
            </button>
          </div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button type="button" className="btn btn-outline" onClick={closeAdmin}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
