'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/services/api';
import { Player } from '@/types';
import { Search, Filter, Users, Award, Shield } from 'lucide-react';

export default function SquadPage() {
  const { teamId, teamName, lang, refreshKey } = useApp();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    api
      .getPlayers(teamId, lang)
      .then((data) => {
        if (isMounted) setPlayers(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Error al cargar el plantel');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [teamId, lang, refreshKey]);

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchPos = selectedPosition === 'ALL' || p.position === selectedPosition;
      const matchSearch =
        !searchTerm.trim() ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(p.shirtNumber).includes(searchTerm);
      return matchPos && matchSearch;
    });
  }, [players, selectedPosition, searchTerm]);

  const avgAge = useMemo(() => {
    if (!filteredPlayers.length) return 0;
    const total = filteredPlayers.reduce((acc, p) => acc + p.age, 0);
    return (total / filteredPlayers.length).toFixed(1);
  }, [filteredPlayers]);

  return (
    <div>
      <section className="card">
        <header className="card-header">
          <div className="card-title">
            <Users size={20} color="var(--team-primary)" />
            <span>Plantel Oficial</span>
          </div>
          <span className="badge badge-primary">{teamName}</span>
        </header>

        {/* Position Legend */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            Posiciones:
          </span>
          <span className="pos-tag pos-GK">GK · Arquero</span>
          <span className="pos-tag pos-DF">DF · Defensor</span>
          <span className="pos-tag pos-MF">MF · Mediocampista</span>
          <span className="pos-tag pos-FW">FW · Delantero</span>
        </div>

        {/* Search & Filter Row */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por jugador o dorsal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '36px' }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              className="form-control"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
            >
              <option value="ALL">Todas las posiciones</option>
              <option value="GK">Arqueros (GK)</option>
              <option value="DF">Defensores (DF)</option>
              <option value="MF">Mediocampistas (MF)</option>
              <option value="FW">Delanteros (FW)</option>
            </select>
          </div>
        </div>

        {/* Info bar */}
        {!loading && !error && (
          <div
            style={{
              display: 'flex',
              gap: '16px',
              padding: '10px 14px',
              background: 'rgba(117, 170, 219, 0.08)',
              borderRadius: '8px',
              marginBottom: '18px',
              fontSize: '12.5px',
              color: 'var(--text-secondary)',
            }}
          >
            <span>
              👥 <strong>{filteredPlayers.length}</strong> de {players.length} jugadores
            </span>
            <span>•</span>
            <span>
              📊 Edad promedio: <strong>{avgAge} años</strong>
            </span>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="state-box">
            <span className="state-icon">⏳</span>
            <h3 className="state-title">Cargando plantel...</h3>
            <p className="state-sub">Consultando base de datos oficial de la selección</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="state-box">
            <span className="state-icon">⚠️</span>
            <h3 className="state-title">Ocurrió un inconveniente</h3>
            <p className="state-sub">{error}</p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && filteredPlayers.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>Jugador</th>
                  <th>Posición</th>
                  <th>Edad</th>
                  <th>Skill</th>
                  <th>Ataque</th>
                  <th>Defensa</th>
                  <th>Energía</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player) => (
                  <tr key={player.id}>
                    <td>
                      <strong style={{ color: 'var(--team-primary-light)' }}>
                        {player.shirtNumber}
                      </strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {player.name}
                        </span>
                        {player.isCaptain && (
                          <span className="badge badge-gold" title="Capitán del equipo">
                            <Award size={11} /> Capitán
                          </span>
                        )}
                        {player.isOnField && (
                          <span className="badge badge-success" title="En el once inicial">
                            Titular
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`pos-tag pos-${player.position}`}>{player.position}</span>
                    </td>
                    <td>{player.age}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#2ed573' }}>{player.skill}</span>
                    </td>
                    <td>{player.attack}</td>
                    <td>{player.defense}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            flex: 1,
                            height: '6px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            maxWidth: '70px',
                          }}
                        >
                          <div
                            style={{
                              width: `${player.energy}%`,
                              height: '100%',
                              background: player.energy > 80 ? '#2ed573' : '#ffa502',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {player.energy}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty filter results */}
        {!loading && !error && filteredPlayers.length === 0 && (
          <div className="state-box">
            <span className="state-icon">🧭</span>
            <h3 className="state-title">Sin resultados</h3>
            <p className="state-sub">No se encontraron jugadores que coincidan con la búsqueda o filtro aplicado.</p>
          </div>
        )}
      </section>
    </div>
  );
}
