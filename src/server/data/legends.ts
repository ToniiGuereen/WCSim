import { Lang } from '../domain';

/**
 * Las 10 selecciones más grandes de la historia entre las 48 del simulador.
 * Criterio: Copas del Mundo ganadas, finales jugadas y ranking histórico Elo.
 * Son las únicas que se pueden elegir como "mi selección".
 */
export interface LegendDef {
  id: string;
  rank: number;
  titles: number;
  finals: number;
  tagline: Record<Lang, string>;
}

export const LEGENDS: LegendDef[] = [
  { id: 'bra', rank: 1, titles: 5, finals: 7, tagline: { es: 'El pentacampeón: el jogo bonito hecho historia.', en: 'The five-time champion: jogo bonito made history.' } },
  { id: 'ger', rank: 2, titles: 4, finals: 8, tagline: { es: 'La máquina: máxima regularidad en mundiales.', en: 'The machine: unmatched World Cup consistency.' } },
  { id: 'ita', rank: 3, titles: 4, finals: 6, tagline: { es: 'La Azzurra: cuatro estrellas y catenaccio.', en: 'The Azzurra: four stars and catenaccio.' } },
  { id: 'arg', rank: 4, titles: 3, finals: 6, tagline: { es: 'Campeón del mundo en 1978, 1986 y 2022.', en: 'World champion in 1978, 1986 and 2022.' } },
  { id: 'fra', rank: 5, titles: 2, finals: 4, tagline: { es: 'Los Bleus: campeón en 1998 y 2018.', en: 'Les Bleus: champions in 1998 and 2018.' } },
  { id: 'uru', rank: 6, titles: 2, finals: 2, tagline: { es: 'La garra charrúa: ganó el primer Mundial y el Maracanazo.', en: 'Charrúa grit: won the first World Cup and the Maracanazo.' } },
  { id: 'esp', rank: 7, titles: 1, finals: 1, tagline: { es: 'La Roja del tiki-taka: campeón en 2010.', en: 'La Roja of tiki-taka: champions in 2010.' } },
  { id: 'eng', rank: 8, titles: 1, finals: 1, tagline: { es: 'Los Tres Leones: campeón en 1966.', en: 'The Three Lions: champions in 1966.' } },
  { id: 'ned', rank: 9, titles: 0, finals: 3, tagline: { es: 'La Naranja Mecánica: tres finales y el Fútbol Total.', en: 'The Clockwork Orange: three finals and Total Football.' } },
  { id: 'por', rank: 10, titles: 0, finals: 0, tagline: { es: 'Eterno candidato: tercero en 1966 y semifinalista en 2006.', en: 'Perennial contender: third in 1966, semi-finalist in 2006.' } },
];

export const LEGEND_IDS = LEGENDS.map((l) => l.id);
export const legendOf = (id: string): LegendDef | undefined => LEGENDS.find((l) => l.id === id);
