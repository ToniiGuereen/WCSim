'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/services/api';
import { CoachingData } from '@/types';
import { Briefcase, Sliders, CheckCircle2, Shield, Flame } from 'lucide-react';

export default function CoachingPage() {
  const { teamId, teamName, lang, refreshKey } = useApp();
  const [data, setData] = useState<CoachingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingStrategy, setSavingStrategy] = useState(false);
  const [savingFormation, setSavingFormation] = useState(false);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    api
      .getCoaching(teamId, lang)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Error al cargar el cuerpo técnico');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [teamId, lang, refreshKey]);

  const handleStrategyChange = async (newStrategy: string) => {
    if (!data || savingStrategy) return;
    setSavingStrategy(true);
    try {
      const updated = await api.updateStrategy(newStrategy);
      setData((prev) => (prev ? { ...prev, currentStrategy: newStrategy } : updated));
      showNotify(`Estrategia actualizada a ${newStrategy}`);
    } catch {
      showNotify('Error al guardar estrategia');
    } finally {
      setSavingStrategy(false);
    }
  };

  const handleFormationChange = async (newFormation: string) => {
    if (!data || savingFormation) return;
    setSavingFormation(true);
    try {
      const updated = await api.updateFormation(newFormation);
      setData((prev) => (prev ? { ...prev, currentFormation: newFormation } : updated));
      showNotify(`Formación actualizada a ${newFormation}`);
    } catch {
      showNotify('Error al guardar formación');
    } finally {
      setSavingFormation(false);
    }
  };

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  if (loading) {
    return (
      <div className="state-box">
        <span className="state-icon">⏳</span>
        <h3 className="state-title">Cargando cuerpo técnico...</h3>
        <p className="state-sub">Consultando cuerpo técnico y configuraciones tácticas</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="state-box">
        <span className="state-icon">⚠️</span>
        <h3 className="state-title">Error al cargar datos</h3>
        <p className="state-sub">{error || 'No se encontró información del cuerpo técnico.'}</p>
      </div>
    );
  }

  return (
    <div>
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '28px',
            background: 'linear-gradient(135deg, var(--team-primary), var(--team-primary-dark))',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
            zIndex: 1000,
          }}
        >
          <CheckCircle2 size={18} />
          {notification}
        </div>
      )}

      <div className="grid grid-2">
        {/* Coach profile card */}
        <section className="card">
          <header className="card-header">
            <div className="card-title">
              <Briefcase size={20} color="var(--team-primary)" />
              <span>Perfil del Entrenador</span>
            </div>
            <span className="badge badge-primary">{teamName}</span>
          </header>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(117, 170, 219, 0.15)',
                border: '2px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
              }}
            >
              🧑‍💼
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{data.coachName}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                {data.coachNationality} · {data.coachAge} años
              </p>
              <span className="badge badge-gold" style={{ marginTop: '6px' }}>
                {data.coachProfile}
              </span>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: 1.6, marginBottom: '22px' }}>
            {data.coachProfileDescription}
          </p>

          <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Métricas de Gestión Táctica
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.metrics.map((metric, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{metric.label}</span>
                  <strong style={{ color: 'var(--team-primary-light)' }}>{metric.value}/100</strong>
                </div>
                <div style={{ height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${metric.value}%`,
                      background: 'linear-gradient(90deg, var(--team-primary), var(--team-accent))',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tactical board & Controls */}
        <section className="card">
          <header className="card-header">
            <div className="card-title">
              <Sliders size={20} color="var(--team-accent)" />
              <span>Configuración y Disposición Táctica</span>
            </div>
            <span className="badge badge-gold">En Tiempo Real</span>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '22px' }}>
            <div style={{ padding: '14px', background: 'rgba(117, 170, 219, 0.08)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Estrategia Activa
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--team-primary-light)', marginTop: '4px' }}>
                {data.currentStrategy}
              </h3>
            </div>

            <div style={{ padding: '14px', background: 'rgba(255, 184, 28, 0.08)', borderRadius: '10px', border: '1px solid var(--border-color-gold)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Formación en Cancha
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--team-accent)', marginTop: '4px' }}>
                {data.currentFormation}
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                Modificar Estrategia:
              </label>
              <select
                className="form-control"
                style={{ width: '100%' }}
                value={data.currentStrategy}
                disabled={savingStrategy}
                onChange={(e) => handleStrategyChange(e.target.value)}
              >
                {data.availableStrategies.map((st) => (
                  <option key={st.strategy} value={st.strategy}>
                    {st.strategy} — {st.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                Modificar Formación:
              </label>
              <select
                className="form-control"
                style={{ width: '100%' }}
                value={data.currentFormation}
                disabled={savingFormation}
                onChange={(e) => handleFormationChange(e.target.value)}
              >
                {data.availableFormations.map((f) => (
                  <option key={f.formation} value={f.formation}>
                    {f.formation} — {f.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Virtual pitch representation */}
          <div
            style={{
              marginTop: '24px',
              height: '140px',
              borderRadius: '12px',
              border: '2px dashed rgba(117, 170, 219, 0.3)',
              background: 'radial-gradient(ellipse at center, rgba(46, 213, 115, 0.15) 0%, rgba(13, 24, 44, 0.8) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '26px' }}>⚽</span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#2ed573' }}>
              Pizarra Táctica {data.currentFormation}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Estilo de juego: {data.currentStrategy}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
