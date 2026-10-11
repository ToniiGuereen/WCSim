'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/services/api';
import { FinalChatState } from '@/types';
import { Gamepad2, Send, Play, Sparkles, Shield, RefreshCw } from 'lucide-react';

export default function PlayFinalPage() {
  const { lang, triggerRefresh } = useApp();
  const [data, setData] = useState<FinalChatState | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [data?.messageItems]);

  const handleStartFinal = async () => {
    setSending(true);
    setError('');
    try {
      const res = await api.startFinal();
      setData(res);
      triggerRefresh();
    } catch (err: any) {
      setError(err.message || 'Primero debe simularse el Mundial para jugar la Final.');
    } finally {
      setSending(false);
    }
  };

  const handlePlayOption = async (optionIndex: number) => {
    if (sending || !data || data.isFinished) return;
    setSending(true);
    setError('');
    try {
      const res = await api.playFinal(optionIndex);
      setData(res);
      triggerRefresh();
    } catch (err: any) {
      setError(err.message || 'Error al ejecutar jugada');
    } finally {
      setSending(false);
    }
  };

  const handleSendChatText = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim().toLowerCase();
    if (!text || sending || !data || data.isFinished) return;

    setChatInput('');
    // Map text intent to nearest option
    let chosenOption = 1;
    if (text.includes('patear') || text.includes('tirar') || text.includes('rematar') || text.includes('arco') || text.includes('gol')) {
      chosenOption = 2;
    } else if (text.includes('centro') || text.includes('cambio') || text.includes('abrir') || text.includes('banda')) {
      chosenOption = 3;
    } else if (text.includes('esperar') || text.includes('pausa') || text.includes('atras') || text.includes('aguantar') || text.includes('calma')) {
      chosenOption = 4;
    }

    handlePlayOption(chosenOption);
  };

  return (
    <div>
      <section className="card" style={{ padding: '24px' }}>
        <header className="card-header">
          <div className="card-title">
            <Gamepad2 size={24} color="var(--team-accent)" />
            <span>Simulador Interactivo de la Gran Final</span>
          </div>
          {data && (
            <span className={`badge ${data.isFinished ? 'badge-gold' : 'badge-success'}`}>
              {data.isFinished ? 'Finalizada' : `Minuto ${data.minute}'`}
            </span>
          )}
        </header>

        {error && (
          <div
            style={{
              padding: '12px 18px',
              background: 'rgba(255, 71, 87, 0.15)',
              border: '1px solid rgba(255, 71, 87, 0.4)',
              color: '#ff4757',
              borderRadius: '10px',
              marginBottom: '18px',
              fontSize: '13.5px',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Not started view */}
        {!data && (
          <div className="state-box" style={{ padding: '60px 20px' }}>
            <span className="state-icon">⚡</span>
            <h2 className="state-title" style={{ fontSize: '22px' }}>
              La Gran Final está lista para comenzar
            </h2>
            <p className="state-sub" style={{ marginBottom: '24px' }}>
              Tomá el control táctico de cada turno: elegí jugadas ofensivas, cambios de frente, definiciones al arco o ajustes de presión para consagrarte Campeón del Mundo.
            </p>
            <button
              type="button"
              className="btn btn-accent"
              style={{ padding: '14px 32px', fontSize: '16px' }}
              disabled={sending}
              onClick={handleStartFinal}
            >
              {sending ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Iniciando Final...</span>
                </>
              ) : (
                <>
                  <Play size={18} />
                  <span>Comenzar la Gran Final</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Active Match Layout */}
        {data && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* Left column: Feed & Actions */}
            <div>
              <div
                style={{
                  background: 'rgba(10, 19, 36, 0.85)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '18px',
                  height: '380px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  marginBottom: '16px',
                }}
              >
                {data.messageItems.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: msg.type === 'goal' ? 'rgba(46, 213, 115, 0.15)' : msg.type === 'tactical' ? 'rgba(255, 184, 28, 0.12)' : 'rgba(117, 170, 219, 0.08)',
                      borderLeft: `4px solid ${msg.type === 'goal' ? '#2ed573' : msg.type === 'tactical' ? 'var(--team-accent)' : 'var(--team-primary)'}`,
                      fontSize: '13px',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong style={{ color: 'var(--team-primary-light)', marginRight: '6px' }}>
                      {msg.minute}&apos;
                    </strong>
                    <span>{msg.text}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Action buttons */}
              {!data.isFinished && data.options && data.options.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Opciones Tácticas de la Jugada:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {data.options.map((opt) => (
                      <button
                        key={opt.index}
                        type="button"
                        className="btn btn-outline"
                        style={{ textAlign: 'left', justifyContent: 'flex-start', padding: '10px 14px', fontSize: '13px' }}
                        disabled={sending}
                        onClick={() => handlePlayOption(opt.index)}
                      >
                        ⚡ {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Free text input */}
              {!data.isFinished && (
                <form onSubmit={handleSendChatText} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Escribí una orden táctica (ej: patear al arco, centro, pausa)..."
                    value={chatInput}
                    disabled={sending}
                    onChange={(e) => setChatInput(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn btn-primary" disabled={sending || !chatInput.trim()}>
                    <Send size={16} />
                    Enviar
                  </button>
                </form>
              )}

              {data.isFinished && (
                <div
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(255, 184, 28, 0.2) 0%, rgba(13, 24, 44, 0.8) 100%)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color-gold)',
                  }}
                >
                  <span style={{ fontSize: '36px' }}>🏆</span>
                  <h3 style={{ fontSize: '18px', fontWeight: 900, marginTop: '8px' }}>
                    ¡PARTIDO FINALIZADO!
                  </h3>
                  <p style={{ color: 'var(--team-accent)', fontWeight: 700, marginTop: '4px' }}>
                    {data.result || 'Argentina se consagra Campeón'}
                  </p>
                  <button
                    type="button"
                    className="btn btn-accent"
                    style={{ marginTop: '14px' }}
                    onClick={handleStartFinal}
                  >
                    Jugar Nueva Final
                  </button>
                </div>
              )}
            </div>

            {/* Right column: Match telemetry */}
            <div
              style={{
                background: 'rgba(13, 24, 44, 0.75)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '20px',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px', color: 'var(--team-primary-light)' }}>
                Tablero de Control del Partido
              </h3>

              {/* Scoreboard */}
              <div
                style={{
                  background: 'rgba(7, 13, 24, 0.9)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  marginBottom: '18px',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                  Marcador en Vivo
                </div>
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 900,
                    fontFamily: 'Outfit, sans-serif',
                    color: 'var(--team-accent)',
                    margin: '6px 0',
                  }}
                >
                  {data.score}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {data.teamName} vs {data.opponentName}
                </div>
              </div>

              {/* Match telemetry items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(117, 170, 219, 0.08)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Minuto:</span>
                  <strong>{data.minute}&apos;</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(117, 170, 219, 0.08)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Turno:</span>
                  <strong>#{data.turn}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(117, 170, 219, 0.08)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Zona del Balón:</span>
                  <strong style={{ color: 'var(--team-primary-light)' }}>{data.zone}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(117, 170, 219, 0.08)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Posesión Actual:</span>
                  <strong style={{ color: '#2ed573' }}>{data.possession}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
