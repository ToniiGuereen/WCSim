'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TEAM_PRESETS } from '@/services/mockData';
import { X, Check, Globe, Shield } from 'lucide-react';

export function AdminModal() {
  const { teamId, lang, isAdminOpen, closeAdmin, setTeam, setLang } = useApp();
  const [customInput, setCustomInput] = useState(teamId);

  if (!isAdminOpen) return null;

  const handleSelectPreset = (id: string) => {
    setCustomInput(id);
    setTeam(id);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      setTeam(customInput.trim().toLowerCase());
      closeAdmin();
    }
  };

  return (
    <div className="modal-overlay" onClick={closeAdmin}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="var(--team-primary)" />
            Configuración de Selección
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
          Seleccioná tu equipo asignado para personalizar los colores del sistema, el escudo y los datos de las vistas:
        </p>

        {/* Preset teams */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '22px' }}>
          {Object.entries(TEAM_PRESETS).map(([id, info]) => {
            const isSelected = teamId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleSelectPreset(id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 8px',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid var(--team-primary)' : '1px solid var(--border-color)',
                  background: isSelected ? 'rgba(117, 170, 219, 0.2)' : 'rgba(13, 24, 44, 0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: '#fff',
                }}
              >
                <span style={{ fontSize: '26px' }}>{info.flag}</span>
                <span style={{ fontSize: '12px', fontWeight: 700 }}>{info.name}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{id.toUpperCase()}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Team ID Form */}
        <form onSubmit={handleSaveCustom} style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
            O ingresar ID de equipo personalizado:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-control"
              style={{ flex: 1 }}
              placeholder="ej: arg, bra, ita, usa..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              Aplicar
            </button>
          </div>
        </form>

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
