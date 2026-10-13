import { TeamDef } from '../domain';

/**
 * Catálogo de las 48 selecciones del simulador (formato Mundial 2026: 12 grupos de 4).
 * Es un universo de simulación: ratings y planteles son referenciales, no datos oficiales FIFA.
 */
export function flagOf(iso: string): string {
  if (iso === 'gb-eng') return '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}';
  if (iso === 'gb-sct') return '\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}';
  return [...iso.toUpperCase()].map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join('');
}

// [id, nombre ES, nombre EN, ISO2, confederación, rating, estrategia, formación]
type Row = [string, string, string, string, string, number, string, string];

const ROWS: Row[] = [
  // CONMEBOL
  ['arg', 'Argentina', 'Argentina', 'ar', 'CONMEBOL', 94, 'EQUILIBRADO', '4-3-3'],
  ['bra', 'Brasil', 'Brazil', 'br', 'CONMEBOL', 92, 'OFENSIVO', '4-2-3-1'],
  ['uru', 'Uruguay', 'Uruguay', 'uy', 'CONMEBOL', 88, 'OFENSIVO', '4-3-3'],
  ['col', 'Colombia', 'Colombia', 'co', 'CONMEBOL', 86, 'OFENSIVO', '4-2-3-1'],
  ['ecu', 'Ecuador', 'Ecuador', 'ec', 'CONMEBOL', 80, 'DEFENSIVO', '4-4-2'],
  ['par', 'Paraguay', 'Paraguay', 'py', 'CONMEBOL', 77, 'DEFENSIVO', '4-4-2'],
  ['chi', 'Chile', 'Chile', 'cl', 'CONMEBOL', 74, 'EQUILIBRADO', '4-3-3'],
  ['per', 'Perú', 'Peru', 'pe', 'CONMEBOL', 70, 'DEFENSIVO', '4-4-2'],
  // UEFA
  ['fra', 'Francia', 'France', 'fr', 'UEFA', 93, 'OFENSIVO', '4-3-3'],
  ['esp', 'España', 'Spain', 'es', 'UEFA', 93, 'EQUILIBRADO', '4-3-3'],
  ['eng', 'Inglaterra', 'England', 'gb-eng', 'UEFA', 90, 'EQUILIBRADO', '4-2-3-1'],
  ['ger', 'Alemania', 'Germany', 'de', 'UEFA', 89, 'OFENSIVO', '4-2-3-1'],
  ['por', 'Portugal', 'Portugal', 'pt', 'UEFA', 89, 'EQUILIBRADO', '4-3-3'],
  ['ned', 'Países Bajos', 'Netherlands', 'nl', 'UEFA', 86, 'OFENSIVO', '3-5-2'],
  ['ita', 'Italia', 'Italy', 'it', 'UEFA', 85, 'EQUILIBRADO', '4-3-3'],
  ['bel', 'Bélgica', 'Belgium', 'be', 'UEFA', 83, 'OFENSIVO', '4-2-3-1'],
  ['cro', 'Croacia', 'Croatia', 'hr', 'UEFA', 82, 'EQUILIBRADO', '4-3-3'],
  ['den', 'Dinamarca', 'Denmark', 'dk', 'UEFA', 79, 'EQUILIBRADO', '4-3-3'],
  ['nor', 'Noruega', 'Norway', 'no', 'UEFA', 79, 'OFENSIVO', '4-3-3'],
  ['sui', 'Suiza', 'Switzerland', 'ch', 'UEFA', 78, 'DEFENSIVO', '3-5-2'],
  ['aut', 'Austria', 'Austria', 'at', 'UEFA', 77, 'OFENSIVO', '4-2-3-1'],
  ['tur', 'Turquía', 'Turkey', 'tr', 'UEFA', 76, 'OFENSIVO', '4-2-3-1'],
  ['srb', 'Serbia', 'Serbia', 'rs', 'UEFA', 75, 'DEFENSIVO', '3-5-2'],
  ['sco', 'Escocia', 'Scotland', 'gb-sct', 'UEFA', 72, 'DEFENSIVO', '3-5-2'],
  // CONCACAF
  ['usa', 'Estados Unidos', 'United States', 'us', 'CONCACAF', 82, 'OFENSIVO', '4-3-3'],
  ['mex', 'México', 'Mexico', 'mx', 'CONCACAF', 80, 'EQUILIBRADO', '4-3-3'],
  ['can', 'Canadá', 'Canada', 'ca', 'CONCACAF', 76, 'OFENSIVO', '4-4-2'],
  ['pan', 'Panamá', 'Panama', 'pa', 'CONCACAF', 70, 'DEFENSIVO', '4-4-2'],
  ['crc', 'Costa Rica', 'Costa Rica', 'cr', 'CONCACAF', 68, 'DEFENSIVO', '4-4-2'],
  ['jam', 'Jamaica', 'Jamaica', 'jm', 'CONCACAF', 66, 'CONTRAATAQUE', '4-4-2'],
  // AFC
  ['jpn', 'Japón', 'Japan', 'jp', 'AFC', 82, 'CONTRAATAQUE', '4-2-3-1'],
  ['kor', 'Corea del Sur', 'South Korea', 'kr', 'AFC', 79, 'CONTRAATAQUE', '4-4-2'],
  ['irn', 'Irán', 'Iran', 'ir', 'AFC', 76, 'DEFENSIVO', '4-4-2'],
  ['aus', 'Australia', 'Australia', 'au', 'AFC', 74, 'EQUILIBRADO', '4-4-2'],
  ['ksa', 'Arabia Saudita', 'Saudi Arabia', 'sa', 'AFC', 70, 'DEFENSIVO', '4-4-2'],
  ['qat', 'Catar', 'Qatar', 'qa', 'AFC', 66, 'EQUILIBRADO', '4-3-3'],
  ['uzb', 'Uzbekistán', 'Uzbekistan', 'uz', 'AFC', 65, 'DEFENSIVO', '4-2-3-1'],
  ['jor', 'Jordania', 'Jordan', 'jo', 'AFC', 64, 'CONTRAATAQUE', '4-4-2'],
  // CAF
  ['mar', 'Marruecos', 'Morocco', 'ma', 'CAF', 83, 'CONTRAATAQUE', '4-3-3'],
  ['sen', 'Senegal', 'Senegal', 'sn', 'CAF', 80, 'EQUILIBRADO', '4-3-3'],
  ['egy', 'Egipto', 'Egypt', 'eg', 'CAF', 76, 'CONTRAATAQUE', '4-3-3'],
  ['civ', 'Costa de Marfil', 'Ivory Coast', 'ci', 'CAF', 76, 'OFENSIVO', '4-3-3'],
  ['alg', 'Argelia', 'Algeria', 'dz', 'CAF', 74, 'EQUILIBRADO', '4-3-3'],
  ['gha', 'Ghana', 'Ghana', 'gh', 'CAF', 72, 'OFENSIVO', '4-2-3-1'],
  ['tun', 'Túnez', 'Tunisia', 'tn', 'CAF', 71, 'DEFENSIVO', '4-3-3'],
  ['cmr', 'Camerún', 'Cameroon', 'cm', 'CAF', 70, 'EQUILIBRADO', '4-4-2'],
  ['rsa', 'Sudáfrica', 'South Africa', 'za', 'CAF', 66, 'EQUILIBRADO', '4-2-3-1'],
  // OFC
  ['nzl', 'Nueva Zelanda', 'New Zealand', 'nz', 'OFC', 62, 'DEFENSIVO', '4-4-2'],
];

// id -> [nombre, nacionalidad, edad]
const COACHES: Record<string, [string, string, number]> = {
  arg: ['Lionel Scaloni', 'Argentina', 48],
  fra: ['Didier Deschamps', 'Francia', 58],
  bra: ['Carlo Ancelotti', 'Italia', 67],
  uru: ['Marcelo Bielsa', 'Argentina', 71],
  ger: ['Julian Nagelsmann', 'Alemania', 39],
  eng: ['Thomas Tuchel', 'Alemania', 53],
  ned: ['Ronald Koeman', 'Países Bajos', 63],
  esp: ['Luis de la Fuente', 'España', 65],
  por: ['Roberto Martínez', 'España', 53],
  ita: ['Gennaro Gattuso', 'Italia', 48],
  usa: ['Mauricio Pochettino', 'Argentina', 54],
  mex: ['Javier Aguirre', 'México', 67],
  can: ['Jesse Marsch', 'Estados Unidos', 52],
  jpn: ['Hajime Moriyasu', 'Japón', 58],
  kor: ['Hong Myung-bo', 'Corea del Sur', 57],
  col: ['Néstor Lorenzo', 'Argentina', 60],
  cro: ['Zlatko Dalić', 'Croacia', 59],
  mar: ['Walid Regragui', 'Marruecos', 51],
  den: ['Brian Riemer', 'Dinamarca', 38],
  sui: ['Murat Yakin', 'Suiza', 52],
  nor: ['Ståle Solbakken', 'Noruega', 58],
  aus: ['Tony Popovic', 'Australia', 53],
  bel: ['Rudi Garcia', 'Francia', 62],
};

export const TEAMS: TeamDef[] = ROWS.map(([id, name, nameEn, iso, confederation, rating, strategy, formation]) => {
  const coach = COACHES[id];
  return {
    id,
    name,
    nameEn,
    flag: flagOf(iso),
    confederation,
    rating,
    strategy,
    formation,
    coach: coach ? coach[0] : `DT de ${name}`,
    coachNationality: coach ? coach[1] : name,
    coachAge: coach ? coach[2] : 50,
  };
});

const BY_ID = new Map(TEAMS.map((t) => [t.id, t]));

export const findTeam = (id: string): TeamDef | undefined => BY_ID.get(id.trim().toLowerCase());

export function mustTeam(id: string): TeamDef {
  const team = findTeam(id);
  if (!team) throw new Error(`Equipo inexistente en el catálogo: ${id}`);
  return team;
}

export const teamName = (team: TeamDef, lang: 'es' | 'en'): string => (lang === 'en' ? team.nameEn : team.name);
