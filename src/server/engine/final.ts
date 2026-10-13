import { FinalChatMessage, FinalChatState, FinalOption, LiveEventItem, TeamSideState, TeamStateData } from '@/types';
import { CardEvent, GoalEvent, MatchRecord } from '../domain';
import { CONFIG } from '../config';
import { mustTeam } from '../data/catalog';
import { STRATEGY_MOD } from '../data/tactics';
import { badRequest, conflict } from '../errors';
import { Rng, clamp, createRng } from '../rng';
import { surname } from '../services/labels';
import { MAX_SUBS, LivePlayer, Side, buildSide, penaltyProbability, pickLineup, roundLines, runShootout, teamLines } from './lines';
import { pickAssist, pickCardPlayer, pickScorer } from './matchSim';

/**
 * Simulador interactivo de la Gran Final, por turnos.
 * Convención: el usuario controla siempre a `user` (local); `opp` lo maneja el motor.
 * El campo se mide desde el punto de vista del usuario: 0 = su área, 4 = el área rival.
 */
type Who = 'USER' | 'OPP';
type Kind = FinalChatMessage['type'];

const ZONES = ['ÁREA_PROPIA', 'DEFENSA', 'MEDIOCAMPO', 'TRES_CUARTOS', 'ÁREA_RIVAL'] as const;
const SHOT_BASE = [0.03, 0.06, 0.12, 0.22, 0.38];
const pr = (base: number, diff: number, k = 0.006) => clamp(base + diff * k, 0.05, 0.95);
const other = (w: Who): Who => (w === 'USER' ? 'OPP' : 'USER');

export interface FinalSession {
  rng: Rng;
  user: Side;
  opp: Side;
  userGk: { id: string; name: string };
  oppGk: { id: string; name: string };
  minute: number;
  turn: number;
  period: 'REGULATION' | 'EXTRA_TIME';
  score: Record<Who, number>;
  zone: number;
  possession: Who;
  messages: FinalChatMessage[];
  events: LiveEventItem[];
  goals: GoalEvent[];
  cards: CardEvent[];
  penalties?: Record<Who, number>;
  finished: boolean;
  result?: string;
  winner?: Who;
  initialOppStrategy: string;
  bufMessages: FinalChatMessage[];
  bufEvents: LiveEventItem[];
}

const sideOf = (s: FinalSession, w: Who): Side => (w === 'USER' ? s.user : s.opp);
const tn = (s: FinalSession, w: Who): string => mustTeam(sideOf(s, w).teamId).name;
const scoreText = (s: FinalSession) => `${s.user.teamId.toUpperCase()} ${s.score.USER} - ${s.score.OPP} ${s.opp.teamId.toUpperCase()}`;
const star = (side: Side): string => {
  const p = side.onField.filter((x) => x.position !== 'GK').sort((a, b) => b.attack - a.attack)[0];
  return p ? surname(p.name) : 'el delantero';
};
const keeperOf = (side: Side) => side.onField.find((p) => p.position === 'GK');

function say(s: FinalSession, minute: number, text: string, type: Kind = 'narrative') {
  s.bufMessages.push({ minute, text, type });
}
function event(s: FinalSession, minute: number, tipo: string, descripcion: string, equipo?: string, jugador?: string) {
  s.bufEvents.push({ minuto: minute, tipo, descripcion, equipo, jugador });
}
function flush(s: FinalSession) {
  s.messages.push(...s.bufMessages.sort((a, b) => a.minute - b.minute));
  s.events.push(...s.bufEvents.sort((a, b) => a.minuto - b.minuto));
  s.bufMessages = [];
  s.bufEvents = [];
}

export function createSession(
  userId: string,
  oppId: string,
  userCfg: { strategy: string; formation: string },
  oppCfg: { strategy: string; formation: string },
  seed: number
): FinalSession {
  const rng = createRng(seed);
  const user = buildSide(userId, userCfg.formation, userCfg.strategy);
  const opp = buildSide(oppId, oppCfg.formation, oppCfg.strategy);
  const gk = (side: Side) => {
    const k = keeperOf(side)!;
    return { id: k.id, name: k.name };
  };
  const s: FinalSession = {
    rng, user, opp, userGk: gk(user), oppGk: gk(opp),
    minute: rng.int(8, 14), turn: 1, period: 'REGULATION',
    score: { USER: 0, OPP: 0 }, zone: 2, possession: 'USER',
    messages: [], events: [], goals: [], cards: [],
    finished: false, initialOppStrategy: oppCfg.strategy, bufMessages: [], bufEvents: [],
  };

  const userName = tn(s, 'USER');
  const oppName = tn(s, 'OPP');
  say(s, 1, `¡Arranca la Gran Final del Mundial ${CONFIG.edition} en el ${CONFIG.stadium}! ${userName} y ${oppName} salen a escena.`);
  event(s, 1, 'INICIO', 'Pitazo inicial del árbitro central. Comienza la final.', 'FIFA');
  const mid = user.onField.find((p) => p.position === 'MF') ?? user.onField[1];
  say(s, Math.min(s.minute - 1, rng.int(4, 7)), `${mid.name} recupera la pelota en el círculo central con una barrida limpia.`);
  say(s, s.minute, `${star(user)} recibe perfilado hacia adelante y observa desmarques en ataque.`, 'tactical');
  flush(s);
  return s;
}

export function optionsFor(s: FinalSession): FinalOption[] {
  if (s.finished) return [];
  const fw = star(s.user);
  const o = (index: number, label: string, actionCode: string): FinalOption => ({ index, label, actionCode });
  if (s.possession === 'USER') {
    if (s.zone <= 1) {
      return [o(1, 'Salir jugando desde el fondo con pases cortos', 'PASS'), o(2, `Pelotazo largo buscando a ${fw}`, 'LONG'), o(3, 'Abrir la pelota por la banda', 'CROSS'), o(4, 'Aguantar la pelota y pausar el juego', 'HOLD')];
    }
    if (s.zone === 2) {
      return [o(1, `Pase filtrado a ${fw}`, 'PASS'), o(2, 'Remate potente desde media distancia', 'SHOOT'), o(3, 'Cambio de frente hacia el extremo', 'CROSS'), o(4, 'Aguantar la pelota y pausar el juego', 'HOLD')];
    }
    if (s.zone === 3) {
      return [o(1, `Pase en profundidad para ${fw}`, 'PASS'), o(2, 'Remate cruzado al segundo palo', 'SHOOT'), o(3, 'Desborde y centro al área', 'CROSS'), o(4, 'Pausar y reiniciar el ataque', 'HOLD')];
    }
    return [o(1, 'Pared y definición ante el arquero', 'PASS'), o(2, 'Disparo directo al arco', 'SHOOT'), o(3, 'Centro al punto penal', 'CROSS'), o(4, 'Pausar y buscar un mejor ángulo', 'HOLD')];
  }
  return [o(1, 'Presionar alto para recuperar la pelota', 'PRESS'), o(2, 'Falta táctica para frenar el avance', 'TACKLE'), o(3, 'Replegar y cerrar los espacios', 'BLOCK'), o(4, 'Apostar al contraataque', 'COUNTER')];
}

// ───────────────────────── incidencias ─────────────────────────

function goal(s: FinalSession, who: Who, minute: number, kind: 'goal' | 'penalty', how: string) {
  const att = sideOf(s, who);
  const scorer = pickScorer(s.rng, att.onField);
  const assist = kind === 'goal' && s.rng.chance(0.7) ? pickAssist(s.rng, att.onField, scorer) : undefined;
  s.score[who]++;
  s.goals.push({ minute, teamId: att.teamId, scorerId: scorer.id, scorer: scorer.name, assistId: assist?.id, assist: assist?.name, kind });

  const team = tn(s, who);
  const tail = `${assist ? ` tras el pase de ${surname(assist.name)}` : kind === 'penalty' ? ' desde los doce pasos' : ''}. ${scoreText(s)}`;
  say(
    s, minute,
    who === 'USER' ? `¡¡¡GOOOOOOL DE ${team.toUpperCase()}!!! ${scorer.name} ${how}${tail}` : `Gol de ${team}. ${scorer.name} ${how}${tail}`,
    'goal'
  );
  event(s, minute, 'GOL', `¡GOL de ${team}! ${scorer.name} ${how}.`, team, scorer.name);
  s.possession = other(who);
  s.zone = 2;
}

function shot(s: FinalSession, who: Who, zAtt: number, bonus: number, minute: number, how: string) {
  const att = sideOf(s, who);
  const def = sideOf(s, other(who));
  const a = teamLines(att);
  const d = teamLines(def);
  const q = clamp(SHOT_BASE[zAtt] + bonus + (a.attack - (0.55 * d.defense + 0.45 * d.gk)) / 260, 0.01, 0.6);
  const r = s.rng.next();
  const shooter = star(att);

  if (r < q) return goal(s, who, minute, 'goal', how);

  const keeper = keeperOf(def);
  if (r < q + 0.32) {
    event(s, minute, 'ATAJADA', `¡Atajada de ${keeper?.name ?? 'el arquero'} ante el remate de ${shooter}!`, tn(s, other(who)), keeper?.name);
    if (s.rng.chance(0.28)) {
      s.possession = who;
      s.zone = who === 'USER' ? 4 : 0;
      say(s, minute, `${keeper?.name ?? 'El arquero'} desvía al córner el remate de ${shooter}. Pelota parada peligrosa.`);
    } else {
      s.possession = other(who);
      s.zone = who === 'USER' ? 3 : 1;
      say(s, minute, `¡Atajadón de ${keeper?.name ?? 'el arquero'}! Le negó el gol a ${shooter}.`);
    }
    return;
  }
  s.possession = other(who);
  s.zone = who === 'USER' ? 3 : 1;
  say(s, minute, `${shooter} dispara y la pelota se va por encima del travesaño. Saque de arco para ${tn(s, other(who))}.`);
}

function giveCard(s: FinalSession, who: Who, minute: number, direct = false) {
  const side = sideOf(s, who);
  const p = pickCardPlayer(s.rng, side.onField.filter((x) => x.position !== 'GK'));
  if (!p) return;
  const team = tn(s, who);
  const secondYellow = p.yellows >= 1;
  p.yellows += 1;

  if (!direct && !secondYellow) {
    s.cards.push({ minute, teamId: side.teamId, playerId: p.id, player: p.name, color: 'Y' });
    say(s, minute, `Tarjeta amarilla para ${p.name} (${team}) por una infracción.`, 'card');
    event(s, minute, 'TARJETA', `Tarjeta amarilla para ${p.name} (${team}).`, team, p.name);
    return;
  }
  if (secondYellow && !direct) s.cards.push({ minute, teamId: side.teamId, playerId: p.id, player: p.name, color: 'Y' });
  s.cards.push({ minute, teamId: side.teamId, playerId: p.id, player: p.name, color: 'R' });
  side.onField = side.onField.filter((x) => x !== p);
  side.out.push(p);
  say(s, minute, `¡Expulsado ${p.name}! ${team} queda con ${side.onField.length} jugadores.`, 'card');
  event(s, minute, 'TARJETA', `Tarjeta roja para ${p.name} (${team}). Se queda con ${side.onField.length}.`, team, p.name);
}

// ───────────────────────── resolución de jugadas ─────────────────────────

function userAttack(s: FinalSession, code: string, m: number) {
  const rng = s.rng;
  const u = teamLines(s.user);
  const o = teamLines(s.opp);
  const z = s.zone;
  const fw = star(s.user);
  const team = tn(s, 'USER');
  const opp = tn(s, 'OPP');

  switch (code) {
    case 'PASS': {
      if (z === 4) return shot(s, 'USER', 4, 0.07, m, 'define tras una pared dentro del área');
      const diff = z < 3 ? u.midfield - o.midfield : u.attack - o.defense;
      if (rng.chance(pr(0.72 - 0.03 * z, diff))) {
        s.zone = Math.min(4, z + (rng.chance(0.2) ? 2 : 1));
        say(s, m, `${team} asocia con pases rápidos y gana terreno. ${fw} se ofrece como opción.`);
      } else {
        s.possession = 'OPP';
        say(s, m, `Pase impreciso de ${team}: ${opp} recupera y sale rápido.`);
      }
      return;
    }
    case 'LONG': {
      const ok = rng.chance(pr(0.5, u.attack - o.defense));
      s.zone = Math.min(4, z + 2);
      if (ok) say(s, m, `Pelotazo largo que ${fw} baja de pecho. ${team} aparece en campo rival.`);
      else {
        s.possession = 'OPP';
        say(s, m, `El pelotazo largo lo gana la defensa de ${opp}.`);
      }
      return;
    }
    case 'CROSS': {
      if (z < 3) {
        if (rng.chance(pr(0.6, u.attack - o.defense))) {
          s.zone = Math.min(4, z + 1 + (rng.chance(0.25) ? 1 : 0));
          say(s, m, `Cambio de frente de ${team}: el extremo gana la espalda de la defensa.`);
        } else {
          s.possession = 'OPP';
          say(s, m, `El pase a la banda se va largo y ${opp} saca el lateral.`);
        }
        return;
      }
      const q = clamp(0.14 + (u.attack - (0.55 * o.defense + 0.45 * o.gk)) / 260 + (z === 4 ? 0.04 : 0), 0.03, 0.45);
      const r = rng.next();
      if (r < q) return goal(s, 'USER', m, 'goal', 'conecta de cabeza al centro');
      if (r < q + 0.3) {
        if (rng.chance(0.35)) {
          s.possession = 'USER';
          s.zone = 4;
          say(s, m, `Centro peligroso: la defensa rechaza al córner.`);
        } else {
          s.possession = 'OPP';
          s.zone = 3;
          say(s, m, `El centro lo despeja la defensa de ${opp}.`);
        }
        return;
      }
      s.possession = 'OPP';
      s.zone = 3;
      say(s, m, `Centro largo que nadie alcanza. Saque de arco para ${opp}.`);
      return;
    }
    case 'SHOOT':
      return shot(s, 'USER', z, 0, m, 'define con un remate certero');
    case 'HOLD':
    default:
      if (rng.chance(0.88)) say(s, m, `${team} pausa el juego y mueve la pelota con tranquilidad.`, 'tactical');
      else {
        s.possession = 'OPP';
        say(s, m, `${opp} presiona y le roba la pelota a ${team}.`);
      }
  }
}

function advanceOpp(s: FinalSession, m: number, bonus = 0) {
  if (s.zone === 0) {
    shot(s, 'OPP', 4, bonus, m, 'define dentro del área');
  } else {
    s.zone -= 1;
    say(s, m, `${tn(s, 'OPP')} avanza con la pelota hacia el área de ${tn(s, 'USER')}.`);
  }
}

function userDefend(s: FinalSession, code: string, m: number) {
  const rng = s.rng;
  const u = teamLines(s.user);
  const o = teamLines(s.opp);
  const z = s.zone;
  const team = tn(s, 'USER');
  const opp = tn(s, 'OPP');

  switch (code) {
    case 'PRESS':
      if (rng.chance(pr(0.46, u.midfield - o.midfield + 3))) {
        s.possession = 'USER';
        say(s, m, `Presión alta de ${team}: recupera la pelota en campo rival.`, 'tactical');
      } else {
        say(s, m, `${opp} supera la presión con un pase quebrando líneas.`);
        advanceOpp(s, m);
      }
      return;
    case 'TACKLE':
      if (rng.chance(pr(0.5, u.defense - o.attack))) {
        s.possession = 'USER';
        say(s, m, `Corte providencial de ${team}: la pelota vuelve a manos propias.`);
        return;
      }
      if (rng.chance(0.4)) {
        say(s, m, `Falta táctica de ${team} para frenar el avance de ${opp}.`);
        giveCard(s, 'USER', m, rng.chance(0.05));
        if (z === 0 && rng.chance(0.35)) {
          const pk = clamp(0.76 + (o.attack - u.gk) / 400, 0.6, 0.88);
          if (rng.chance(pk)) return goal(s, 'OPP', m, 'penalty', 'cambia el penal por gol');
          const keeper = keeperOf(s.user);
          event(s, m, 'ATAJADA', `¡${keeper?.name ?? 'El arquero'} ataja el penal!`, team, keeper?.name);
          say(s, m, `¡${keeper?.name ?? 'El arquero'} ataja el penal! ${team} respira.`, 'tactical');
          s.possession = 'USER';
          s.zone = 1;
          return;
        }
        if (z <= 1) return shot(s, 'OPP', 4, -0.02, m, 'define de tiro libre');
      }
      advanceOpp(s, m);
      return;
    case 'BLOCK':
      if (rng.chance(pr(0.4, o.attack - u.defense))) {
        say(s, m, `${opp} encuentra un espacio entre líneas.`);
        if (s.zone === 0) shot(s, 'OPP', 4, -0.04, m, 'define dentro del área');
        else s.zone -= 1;
      } else if (rng.chance(0.45)) {
        s.possession = 'USER';
        say(s, m, `${team} cierra los espacios y recupera la pelota.`, 'tactical');
      } else {
        say(s, m, `${opp} no encuentra huecos y sostiene la posesión.`);
      }
      return;
    case 'COUNTER':
    default:
      if (rng.chance(pr(0.3, u.attack - o.defense))) {
        s.possession = 'USER';
        s.zone = Math.min(4, z + 2);
        say(s, m, `¡Contragolpe de ${team}! Recupera y sale a toda velocidad.`, 'tactical');
        if (rng.chance(0.5)) shot(s, 'USER', s.zone, 0.04, m, 'define a la carrera');
      } else {
        say(s, m, `${team} se descuida y ${opp} aprovecha los espacios.`);
        advanceOpp(s, m, 0.04);
      }
  }
}

// ───────────────────────── avance del reloj ─────────────────────────

const nextBoundary = (s: FinalSession): number =>
  s.period === 'REGULATION' ? (s.minute < 45 ? 45 : 90) : s.minute < 105 ? 105 : 120;

function fatigue(s: FinalSession, minutes: number) {
  for (const w of ['USER', 'OPP'] as Who[]) {
    const side = sideOf(s, w);
    const tempo = (STRATEGY_MOD[side.strategy] ?? STRATEGY_MOD.EQUILIBRADO).tempo;
    for (const p of side.onField) {
      const rate = p.position === 'GK' ? 0.12 : 0.3 + 0.1 * s.rng.next();
      p.energyNow = Math.max(20, p.energyNow - minutes * rate * tempo);
    }
  }
}

function autoSubs(s: FinalSession) {
  if (s.minute < 55) return;
  for (const w of ['USER', 'OPP'] as Who[]) {
    const side = sideOf(s, w);
    if (side.subsUsed >= MAX_SUBS) continue;
    const tired = side.onField.filter((p) => p.position !== 'GK' && p.energyNow < 62).sort((a, b) => a.energyNow - b.energyNow)[0];
    if (!tired) continue;
    const incoming = side.bench.filter((p) => p.position === tired.position).sort((a, b) => b.skill - a.skill)[0];
    if (!incoming || incoming.energyNow <= tired.energyNow) continue;

    side.onField = side.onField.map((p) => (p === tired ? incoming : p));
    side.bench = side.bench.filter((p) => p !== incoming);
    side.out.push(tired);
    side.subsUsed++;
    const team = tn(s, w);
    say(s, s.minute, `Cambio en ${team}: ingresa ${incoming.name} por ${tired.name}.`, 'tactical');
    event(s, s.minute, 'CAMBIO', `Ingresa ${incoming.name} en reemplazo de ${tired.name}.`, team, incoming.name);
  }
}

function adaptOpponent(s: FinalSession) {
  if (s.minute < 65 || s.period !== 'REGULATION') return;
  const diff = s.score.OPP - s.score.USER;
  const target = diff < 0 ? 'OFENSIVO' : diff > 0 ? 'DEFENSIVO' : s.initialOppStrategy;
  if (s.opp.strategy !== target) {
    s.opp.strategy = target;
    say(s, s.minute, `${tn(s, 'OPP')} cambia su planteo: ahora juega ${target}.`, 'tactical');
  }
}

function shootout(s: FinalSession): Who {
  const keeperUser = keeperOf(s.user);
  const keeperOpp = keeperOf(s.opp);
  const res = runShootout(s.rng, penaltyProbability(s.user.onField, keeperOpp), penaltyProbability(s.opp.onField, keeperUser));
  s.penalties = { USER: res.home, OPP: res.away };
  const text = `Definición por penales: ${s.user.teamId.toUpperCase()} ${res.home} - ${res.away} ${s.opp.teamId.toUpperCase()}`;
  say(s, 120, text);
  event(s, 120, 'PENALES', text, 'FIFA');
  return res.home > res.away ? 'USER' : 'OPP';
}

function finish(s: FinalSession, winner: Who) {
  s.finished = true;
  s.winner = winner;
  const champion = tn(s, winner);
  const how =
    s.penalties
      ? `${scoreText(s)} (${s.penalties.USER}-${s.penalties.OPP} en los penales)`
      : s.period === 'EXTRA_TIME'
        ? `${scoreText(s)} tras el tiempo suplementario`
        : `${scoreText(s)} en el tiempo reglamentario`;
  s.result = `¡${champion} se consagra Campeón del Mundo! Resultado final: ${how}.`;
  say(s, s.minute, `¡Final del partido! ${champion} es el nuevo Campeón del Mundo. ${how}.`, 'narrative');
  event(s, s.minute, 'FIN', `Final del partido. ${champion} campeón del mundo (${how}).`, 'FIFA');
}

function handleBoundary(s: FinalSession) {
  const diff = s.score.USER - s.score.OPP;
  const winner = (): Who => (diff > 0 ? 'USER' : 'OPP');

  if (s.period === 'REGULATION' && s.minute === 45) {
    say(s, 45, `Final del primer tiempo. ${scoreText(s)}.`, 'tactical');
    event(s, 45, 'DESCANSO', `Final del primer tiempo. ${scoreText(s)}.`, 'FIFA');
    for (const w of ['USER', 'OPP'] as Who[]) sideOf(s, w).onField.forEach((p) => (p.energyNow = Math.min(100, p.energyNow + 6)));
    s.possession = 'OPP';
    s.zone = 2;
  } else if (s.period === 'REGULATION' && s.minute === 90) {
    if (diff !== 0) return finish(s, winner());
    s.period = 'EXTRA_TIME';
    say(s, 90, `Termina el tiempo reglamentario con empate. ¡Habrá tiempo suplementario!`, 'tactical');
    event(s, 90, 'FIN', `Fin del tiempo reglamentario. ${scoreText(s)}. Se juega tiempo suplementario.`, 'FIFA');
    s.possession = s.possession === 'USER' ? 'OPP' : 'USER';
    s.zone = 2;
  } else if (s.period === 'EXTRA_TIME' && s.minute === 105) {
    say(s, 105, `Descanso del suplementario. ${scoreText(s)}.`, 'tactical');
    event(s, 105, 'DESCANSO', `Final del primer suplementario. ${scoreText(s)}.`, 'FIFA');
  } else if (s.period === 'EXTRA_TIME' && s.minute === 120) {
    if (diff !== 0) return finish(s, winner());
    say(s, 120, 'Sigue el empate tras 120 minutos. ¡Todo se define desde los doce pasos!', 'tactical');
    finish(s, shootout(s));
  }
}

/** Ejecuta un turno con la opción elegida (1-4). */
export function play(s: FinalSession, option: number): void {
  if (s.finished) throw conflict('La final ya terminó. Iniciá una nueva para volver a jugar.');
  const chosen = optionsFor(s).find((o) => o.index === option);
  if (!chosen) throw badRequest('Opción inválida: elegí un número entre 1 y 4.');

  const rng = s.rng;
  const prev = s.minute;
  const hold = chosen.actionCode === 'HOLD';
  const next = Math.min(nextBoundary(s), prev + (hold ? rng.int(3, 5) : rng.int(4, 8)));
  const at = () => rng.int(prev + 1, next);

  s.turn += 1;
  if (s.possession === 'USER') userAttack(s, chosen.actionCode ?? 'HOLD', at());
  else userDefend(s, chosen.actionCode ?? 'BLOCK', at());

  for (const w of ['USER', 'OPP'] as Who[]) if (rng.chance(0.05)) giveCard(s, w, at());

  fatigue(s, next - prev);
  s.minute = next;
  handleBoundary(s);
  if (!s.finished) {
    adaptOpponent(s);
    autoSubs(s);
  }
  flush(s);
}

// ───────────────────────── tácticas en vivo ─────────────────────────

export function setStrategy(s: FinalSession, strategy: string): void {
  if (s.finished) throw conflict('La final ya terminó.');
  s.user.strategy = strategy;
  say(s, s.minute, `Modificación táctica: Estrategia cambiada a ${strategy}`, 'tactical');
  flush(s);
}

export function setFormation(s: FinalSession, formation: string): void {
  if (s.finished) throw conflict('La final ya terminó.');
  const squad = [...s.user.onField, ...s.user.bench];
  const { onField, bench } = pickLineup(squad, formation);
  s.user.formation = formation;
  s.user.onField = onField;
  s.user.bench = bench;
  say(s, s.minute, `Modificación táctica: Formación ajustada a ${formation}`, 'tactical');
  flush(s);
}

// ───────────────────────── vistas ─────────────────────────

export function toChatState(s: FinalSession): FinalChatState {
  return {
    isFinished: s.finished,
    result: s.finished ? s.result : undefined,
    minute: s.minute,
    turn: s.turn,
    score: scoreText(s),
    zone: ZONES[s.zone],
    possession: tn(s, s.possession).toUpperCase(),
    teamName: tn(s, 'USER'),
    opponentName: tn(s, 'OPP'),
    messageItems: s.messages.map((m) => ({ ...m })),
    options: optionsFor(s),
  };
}

const abbreviate = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0][0]}. ${parts.slice(1).join(' ')}` : name;
};

export const coachProfileOf = (teamId: string, strategy: string): string => {
  if (teamId === 'arg') return 'Líder Pragmático';
  if (teamId === 'fra') return 'Estratégico Campeón';
  const byStrategy: Record<string, string> = {
    EQUILIBRADO: 'Estratega Equilibrado',
    OFENSIVO: 'Ofensivo Audaz',
    DEFENSIVO: 'Pragmático Defensivo',
    CONTRAATAQUE: 'Especialista en Transiciones',
  };
  return byStrategy[strategy] ?? 'Estratega';
};

function sideState(s: FinalSession, w: Who): TeamSideState {
  const side = sideOf(s, w);
  const team = mustTeam(side.teamId);
  const view = (p: LivePlayer) => ({
    shirtNumber: p.shirtNumber,
    name: abbreviate(p.name),
    position: p.position,
    energyLabel: `${Math.round(p.energyNow)}%`,
  });
  return {
    name: team.name,
    flag: team.flag,
    formation: side.formation,
    strategy: side.strategy,
    coachName: team.coach,
    coachProfile: coachProfileOf(team.id, side.strategy),
    tacticalBreakdown: { effectiveTeamLine: roundLines(teamLines(side)) },
    onField: side.onField.map(view),
    bench: side.bench.map(view),
    substitutionsUsed: side.subsUsed,
    maxSubstitutions: MAX_SUBS,
  };
}

export function toTeamState(s: FinalSession): TeamStateData {
  return { minute: s.minute, turn: s.turn, score: scoreText(s), team: sideState(s, 'USER'), opponent: sideState(s, 'OPP') };
}

export const toLiveEvents = (s: FinalSession): LiveEventItem[] => s.events.map((e) => ({ ...e }));

/** Registro del partido para integrarlo al torneo (estadísticas, historial, premios). */
export function toMatchRecord(s: FinalSession, number: number): MatchRecord {
  if (!s.finished || !s.winner) throw conflict('La final todavía no terminó.');
  const winnerSide = sideOf(s, s.winner);
  const pool = [...winnerSide.onField, ...winnerSide.out];
  const contrib = new Map<string, number>();
  for (const g of s.goals) {
    contrib.set(g.scorerId, (contrib.get(g.scorerId) ?? 0) + 3);
    if (g.assistId) contrib.set(g.assistId, (contrib.get(g.assistId) ?? 0) + 2);
  }
  const best =
    pool.filter((p) => contrib.has(p.id)).sort((a, b) => (contrib.get(b.id) ?? 0) - (contrib.get(a.id) ?? 0) || b.skill - a.skill)[0] ??
    [...pool].filter((p) => p.position !== 'GK').sort((a, b) => b.skill - a.skill)[0];

  return {
    number,
    stage: 'FINAL',
    homeId: s.user.teamId,
    awayId: s.opp.teamId,
    homeScore: s.score.USER,
    awayScore: s.score.OPP,
    resolution: s.penalties ? 'PENALTIES' : s.period === 'EXTRA_TIME' ? 'EXTRA_TIME' : 'REGULAR',
    penalties: s.penalties ? { home: s.penalties.USER, away: s.penalties.OPP } : undefined,
    winnerId: winnerSide.teamId,
    motmId: best?.id,
    motm: best?.name,
    goals: [...s.goals].sort((a, b) => a.minute - b.minute),
    cards: [...s.cards].sort((a, b) => a.minute - b.minute),
    homeGkId: s.userGk.id,
    homeGk: s.userGk.name,
    awayGkId: s.oppGk.id,
    awayGk: s.oppGk.name,
  };
}
