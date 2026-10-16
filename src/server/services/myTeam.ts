import { CoachingData, Player, RivalItem, TeamHistoryData, TeamSelectionData } from '@/types';
import { CONFIG } from '../config';
import { Lang } from '../domain';
import { TEAMS, mustTeam, teamName } from '../data/catalog';
import { captainOf, getSquad } from '../data/squads';
import { teamHistorySections } from '../data/history';
import { FORMATIONS, STRATEGIES } from '../data/tactics';
import { coachProfileOf } from '../engine/final';
import { pickLineup, toLive } from '../engine/lines';
import { hashString } from '../rng';
import { LEGENDS } from '../data/legends';
import { chooseTeam, store, teamConfig } from '../engine/state';

export function adminConfig() {
  return { teamId: store().myTeamId, lang: CONFIG.defaultLang };
}

export function getPlayers(teamId: string): Player[] {
  const squad = getSquad(teamId);
  const { onField } = pickLineup(squad.map(toLive), teamConfig(teamId).formation);
  const starters = new Set(onField.map((p) => p.id));
  return squad.map((p) => ({
    id: p.id, name: p.name, shirtNumber: p.shirtNumber, position: p.position, age: p.age,
    skill: p.skill, attack: p.attack, defense: p.defense, energy: p.energy,
    isCaptain: p.isCaptain, isOnField: starters.has(p.id),
  }));
}

const DESCRIPTIONS: Record<string, { es: string; en: string }> = {
  EQUILIBRADO: { es: 'Enfoque táctico flexible, control del juego y adaptación estratégica según el rival.', en: 'Flexible tactical approach, game control and strategic adaptation to each rival.' },
  OFENSIVO: { es: 'Equipo audaz que adelanta líneas y prioriza la búsqueda constante del gol.', en: 'Bold side that pushes its lines up and constantly hunts goals.' },
  DEFENSIVO: { es: 'Bloque compacto, orden sin pelota y solidez para sostener resultados.', en: 'Compact block, off-ball discipline and solidity to protect results.' },
  CONTRAATAQUE: { es: 'Transiciones veloces que castigan los espacios que deja el rival.', en: 'Fast transitions that punish the space left by the opposition.' },
};
const PROFILE_EN: Record<string, string> = {
  EQUILIBRADO: 'Balanced Strategist', OFENSIVO: 'Bold Attacker', DEFENSIVO: 'Defensive Pragmatist', CONTRAATAQUE: 'Transition Specialist',
};
const METRICS = {
  es: ['Adaptabilidad táctica', 'Gestión de vestuario', 'Presión defensiva', 'Intensidad en transiciones'],
  en: ['Tactical adaptability', 'Squad management', 'Defensive pressing', 'Transition intensity'],
};

export function getCoaching(teamId: string, lang: Lang): CoachingData {
  const team = mustTeam(teamId);
  const cfg = teamConfig(teamId);
  const baseStrategy = team.strategy; // el perfil del DT es una característica fija, no cambia con la táctica elegida
  const values =
    teamId === 'arg'
      ? [95, 98, 89, 92]
      : [0, 1, 2, 3].map((i) => Math.max(55, Math.min(97, team.rating - 4 + (hashString(`${teamId}:m${i}`) % 9))));

  return {
    coachName: team.coach,
    coachNationality: team.coachNationality,
    coachAge: team.coachAge,
    coachProfile: lang === 'en' ? PROFILE_EN[baseStrategy] ?? 'Strategist' : coachProfileOf(teamId, baseStrategy) + (teamId === 'arg' ? ' y Ganador' : ''),
    coachProfileDescription:
      teamId === 'arg' && lang === 'es'
        ? 'Enfoque táctico flexible, intensidad en las transiciones, sólida identidad grupal y adaptación estratégica contra rivales de élite.'
        : DESCRIPTIONS[baseStrategy][lang],
    currentStrategy: cfg.strategy,
    currentFormation: cfg.formation,
    availableStrategies: STRATEGIES.map((s) => ({ strategy: s.strategy, description: lang === 'en' ? s.descriptionEn : s.description })),
    availableFormations: FORMATIONS.map((f) => ({ formation: f.formation, description: lang === 'en' ? f.descriptionEn : f.description })),
    metrics: METRICS[lang].map((label, i) => ({ label, value: values[i] })),
  };
}

/** Cambia la estrategia del equipo activo (el frontend no envía teamId en este POST). */
export function updateStrategy(strategy: string): CoachingData {
  const teamId = store().myTeamId;
  teamConfig(teamId).strategy = strategy;
  return getCoaching(teamId, CONFIG.defaultLang);
}

export function updateFormation(formation: string): CoachingData {
  const teamId = store().myTeamId;
  teamConfig(teamId).formation = formation;
  return getCoaching(teamId, CONFIG.defaultLang);
}

export function getTeamHistory(teamId: string, lang: Lang): TeamHistoryData {
  const team = mustTeam(teamId);
  const sections = teamHistorySections(teamId, lang);
  return {
    teamId,
    teamName: teamName(team, lang),
    totalTitles: sections.reduce((sum, s) => sum + s.count, 0),
    sections,
  };
}

const STYLE_LABEL: Record<string, { es: string; en: string }> = {
  EQUILIBRADO: { es: 'Equilibrio Táctico', en: 'Tactical Balance' },
  OFENSIVO: { es: 'Ofensivo', en: 'Attacking' },
  DEFENSIVO: { es: 'Defensivo', en: 'Defensive' },
  CONTRAATAQUE: { es: 'Contraataque Veloz', en: 'Fast Counter-attack' },
};

/** Rivales: hasta 3 de la misma confederación y los mejor rankeados del resto (6 en total). */
export function getRivals(teamId: string, lang: Lang): RivalItem[] {
  const me = mustTeam(teamId);
  const others = TEAMS.filter((t) => t.id !== teamId).sort((a, b) => b.rating - a.rating || a.id.localeCompare(b.id));
  const same = others.filter((t) => t.confederation === me.confederation).slice(0, 3);
  const rest = others.filter((t) => !same.includes(t)).slice(0, 6 - same.length);
  return [...same, ...rest]
    .sort((a, b) => b.rating - a.rating || a.id.localeCompare(b.id))
    .map((t) => {
      const cfg = teamConfig(t.id);
      return {
        id: t.id, teamId: t.id, name: teamName(t, lang), flag: t.flag, confederation: t.confederation,
        overallRating: t.rating, coachName: t.coach, captainName: captainOf(t.id).name,
        formation: cfg.formation, strategyLabel: STYLE_LABEL[cfg.strategy][lang],
      };
    });
}

/** Las 10 selecciones elegibles al inicio de la campaña. */
export function getTeamSelection(lang: Lang): TeamSelectionData {
  const myTeamId = store().myTeamId;
  return {
    myTeamId,
    teams: LEGENDS.map((l) => {
      const t = mustTeam(l.id);
      const cfg = teamConfig(l.id);
      return {
        id: t.id, teamId: t.id, rank: l.rank, name: teamName(t, lang), flag: t.flag, confederation: t.confederation,
        overallRating: t.rating, worldCupTitles: l.titles, worldCupFinals: l.finals, tagline: l.tagline[lang],
        coachName: t.coach, formation: cfg.formation, strategy: cfg.strategy, selected: t.id === myTeamId,
      };
    }),
  };
}

/** Elige la selección. Cambiar de selección reinicia la campaña (torneo nuevo sin simular). */
export function selectMyTeam(teamId: string, lang: Lang): TeamSelectionData {
  chooseTeam(teamId);
  return getTeamSelection(lang);
}
