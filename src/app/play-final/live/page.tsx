'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/services/api';
import { LiveEventItem } from '@/types';
import { Radio, Flame, ShieldAlert, Award, Clock } from 'lucide-react';

export default function LiveEventsPage() {
  const { refreshKey } = useApp();
  const [events, setEvents] = useState<LiveEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    api
      .getLiveEvents()
      .then((data) => {
        if (isMounted) setEvents(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Error al cargar eventos en vivo');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const getEventBadge = (tipo: string) => {
    switch (tipo.toUpperCase()) {
      case 'GOL':
        return <span className="badge badge-success">⚽ GOL</span>;
      case 'TARJETA':
        return <span className="badge badge-gold">🟨 TARJETA</span>;
      case 'CAMBIO':
        return <span className="badge badge-primary">🔄 CAMBIO</span>;
      case 'ATAJADA':
        return <span className="badge badge-primary">🧤 ATAJADA</span>;
      default:
        return <span className="badge badge-gray">{tipo}</span>;
    }
  };

  return (
    <div>
      <section className="card">
        <header className="card-header">
          <div className="card-title">
            <Radio size={22} color="#ff4757" />
            <span>Eventos en Vivo — Minuto a Minuto</span>
          </div>
          <span className="badge badge-danger">Línea de Tiempo</span>
        </header>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '22px' }}>
          Seguimiento en tiempo real de todas las incidencias clave y momentos determinantes de la Gran Final.
        </p>

        {loading && (
          <div className="state-box">
            <span className="state-icon">⏳</span>
            <h3 className="state-title">Cargando eventos de la final...</h3>
          </div>
        )}

        {!loading && error && (
          <div className="state-box">
            <span className="state-icon">⚠️</span>
            <h3 className="state-title">Aviso de eventos</h3>
            <p className="state-sub">{error}</p>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="state-box">
            <span className="state-icon">🏟️</span>
            <h3 className="state-title">Sin eventos registrados</h3>
            <p className="state-sub">Los eventos se actualizarán conforme avance el partido.</p>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {events.map((ev, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(13, 24, 44, 0.65)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    background: 'rgba(117, 170, 219, 0.15)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    textAlign: 'center',
                    minWidth: '60px',
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--team-primary-light)' }}>
                    {ev.minuto}&apos;
                  </span>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    {getEventBadge(ev.tipo)}
                    {ev.equipo && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                        {ev.equipo}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {ev.descripcion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
