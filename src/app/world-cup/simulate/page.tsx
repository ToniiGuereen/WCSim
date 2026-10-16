'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { api } from '@/services/api';
import { SimulationData } from '@/types';
import { PlayCircle, Trophy, MapPin, Gamepad2, Sparkles, RefreshCw } from 'lucide-react';

export default function SimulatePage() {
  const { lang, refreshKey, triggerRefresh } = useApp();
  const [simulation, setSimulation] = useState<SimulationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    api
      .getSimulation(lang)
      .then((data) => {
        if (isMounted) setSimulation(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Error al consultar simulación');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lang, refreshKey]);

  const handleSimulate = async () => {
    if (simulating) return;
    setSimulating(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.runSimulation(lang);
      setSimulation(res);
      setSuccessMsg(res.message || '¡Simulación completada con éxito!');
      triggerRefresh();
    } catch (err: any) {
      setError(err.message || 'No se pudo ejecutar la simulación del Mundial.');
    } finally {
      setSimulating(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'READY_FOR_FINAL':
        return <span className="badge badge-success">Lista para la Final</span>;
      case 'FINAL_ACTIVE':
        return <span className="badge badge-primary">Final en Juego</span>;
      case 'ENDED':
        return <span className="badge badge-gold">Mundial Finalizado</span>;
      default:
        return <span className="badge badge-gray">Pendiente</span>;
    }
  };

  return (
    <div>
      <section className="card">
        <header className="card-header">
          <div className="card-title">
            <PlayCircle size={22} color="var(--team-accent)" />
            <span>Simulador de Torneo — Mundial 2026</span>
          </div>
          <div>{getStatusBadge(simulation?.status)}</div>
        </header>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '22px' }}>
          Ejecutá el motor de simulación para procesar los grupos y todas las fases eliminatorias hasta determinar los finalistas de la Copa del Mundo.
        </p>

        {/* Action bar */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '26px' }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '12px 24px', fontSize: '15px' }}
            disabled={simulating}
            onClick={handleSimulate}
          >
            {simulating ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Simulando fases del torneo...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Simular Mundial 2026</span>
              </>
            )}
          </button>

          {simulation?.status === 'READY_FOR_FINAL' && (
            <Link href="/play-final/chat" className="btn btn-accent" style={{ padding: '12px 24px', fontSize: '15px' }}>
              <Gamepad2 size={18} />
              <span>Ir a Jugar la Final</span>
            </Link>
          )}
        </div>

        {(successMsg || (simulation && simulation.status !== 'PENDING' && simulation.message)) && (
          <div
            style={{
              padding: '12px 18px',
              background: 'rgba(46, 213, 115, 0.15)',
              border: '1px solid rgba(46, 213, 115, 0.4)',
              color: '#2ed573',
              borderRadius: '10px',
              fontWeight: 700,
              marginBottom: '20px',
            }}
          >
            {successMsg || simulation?.message}
          </div>
        )}

        {loading && (
          <div className="state-box">
            <span className="state-icon">⏳</span>
            <h3 className="state-title">Cargando estado de la simulación...</h3>
          </div>
        )}

        {!loading && error && (
          <div className="state-box">
            <span className="state-icon">⚠️</span>
            <h3 className="state-title">Aviso de simulación</h3>
            <p className="state-sub">{error}</p>
          </div>
        )}

        {!loading && simulation && (
          <div>
            {/* Stadium & Event info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 22px',
                background: 'rgba(117, 170, 219, 0.08)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={20} color="var(--team-accent)" />
                <div>
                  <strong style={{ fontSize: '15px' }}>{simulation.stadium}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>
                    {simulation.city} · Sede Oficial de la Final
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={20} color="var(--team-accent)" />
                <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--team-accent)' }}>
                  Edición {simulation.edition}
                </span>
              </div>
            </div>

            {/* Final Match Duel Card */}
            <div
              style={{
                background: 'radial-gradient(circle at center, rgba(13, 24, 44, 0.9) 0%, rgba(6, 12, 24, 0.95) 100%)',
                border: '1px solid var(--border-color-gold)',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: 'var(--shadow-gold)',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <span className="badge badge-gold" style={{ fontSize: '12px', padding: '6px 14px' }}>
                  GRAN FINAL DEL MUNDIAL 2026
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  alignItems: 'center',
                  gap: '24px',
                }}
              >
                {/* Home Finalist */}
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '54px', display: 'block', marginBottom: '8px' }}>
                    {simulation.finalHomeTeam.flag}
                  </span>
                  <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)' }}>
                    {simulation.finalHomeTeam.name}
                  </h2>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.6 }}>
                    <p>🧑‍💼 DT: <strong>{simulation.finalHomeTeam.coach}</strong></p>
                    <p>📐 {simulation.finalHomeTeam.formation} · {simulation.finalHomeTeam.strategy}</p>
                  </div>
                </div>

                {/* VS Badge */}
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: 'rgba(255, 184, 28, 0.18)',
                      border: '2px solid var(--border-color-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '18px',
                      color: 'var(--team-accent)',
                    }}
                  >
                    VS
                  </div>
                </div>

                {/* Away Finalist */}
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '54px', display: 'block', marginBottom: '8px' }}>
                    {simulation.finalAwayTeam.flag}
                  </span>
                  <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)' }}>
                    {simulation.finalAwayTeam.name}
                  </h2>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.6 }}>
                    <p>🧑‍💼 DT: <strong>{simulation.finalAwayTeam.coach}</strong></p>
                    <p>📐 {simulation.finalAwayTeam.formation} · {simulation.finalAwayTeam.strategy}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
