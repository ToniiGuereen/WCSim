'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/services/api';
import { GroupData } from '@/types';
import { Layers } from 'lucide-react';

export default function GroupsPage() {
  const { teamId, lang, refreshKey } = useApp();
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    api
      .getGroups(lang)
      .then((data) => {
        if (isMounted) setGroups(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Error al cargar grupos');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lang, refreshKey]);

  return (
    <div>
      <section className="card">
        <header className="card-header">
          <div className="card-title">
            <Layers size={22} color="var(--team-primary)" />
            <span>Tablas de Posiciones — Fase de Grupos</span>
          </div>
          <span className="badge badge-primary">Mundial FIFA 2026</span>
        </header>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '22px' }}>
          Clasificación oficial de cada zona. Los dos primeros de cada grupo y los mejores terceros avanzan a la fase de eliminación directa.
        </p>

        {loading && (
          <div className="state-box">
            <span className="state-icon">⏳</span>
            <h3 className="state-title">Cargando fase de grupos...</h3>
            <p className="state-sub">Consultando tablas de posiciones oficiales</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-box">
            <span className="state-icon">⚠️</span>
            <h3 className="state-title">Error al consultar grupos</h3>
            <p className="state-sub">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-2">
            {groups.map((group) => (
              <div
                key={group.groupName}
                style={{
                  background: 'rgba(13, 24, 44, 0.65)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '12px 18px',
                    background: 'linear-gradient(90deg, rgba(117, 170, 219, 0.15) 0%, transparent 100%)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Grupo {group.groupName}</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>4 Selecciones</span>
                </div>

                <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>POS</th>
                        <th>EQUIPO</th>
                        <th style={{ textAlign: 'center' }}>PJ</th>
                        <th style={{ textAlign: 'center' }}>PG</th>
                        <th style={{ textAlign: 'center' }}>PE</th>
                        <th style={{ textAlign: 'center' }}>PP</th>
                        <th style={{ textAlign: 'center' }}>PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.teams.map((t, idx) => {
                        const isSelectedTeam = t.isMyTeam || t.teamId.toLowerCase() === teamId.toLowerCase();
                        return (
                          <tr
                            key={t.teamId}
                            style={{
                              background: isSelectedTeam ? 'rgba(117, 170, 219, 0.14)' : undefined,
                              borderLeft: isSelectedTeam ? '3px solid var(--team-primary)' : undefined,
                            }}
                          >
                            <td style={{ fontWeight: 700, color: idx < 2 ? '#2ed573' : 'var(--text-muted)' }}>
                              {idx + 1}
                            </td>
                            <td>
                              <span style={{ fontWeight: isSelectedTeam ? 800 : 600, color: isSelectedTeam ? 'var(--team-primary-light)' : 'var(--text-primary)' }}>
                                {t.teamName}
                              </span>
                              {isSelectedTeam && (
                                <span className="badge badge-primary" style={{ marginLeft: '6px', fontSize: '9px', padding: '2px 6px' }}>
                                  Mi Equipo
                                </span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>{t.played}</td>
                            <td style={{ textAlign: 'center' }}>{t.wins}</td>
                            <td style={{ textAlign: 'center' }}>{t.draws}</td>
                            <td style={{ textAlign: 'center' }}>{t.losses}</td>
                            <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--team-accent)' }}>
                              {t.points}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
