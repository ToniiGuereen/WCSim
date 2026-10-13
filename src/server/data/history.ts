import { HistoricalWorldCupItem, TeamHistorySection } from '@/types';
import { Lang } from '../domain';

interface WcTitle {
  year: number;
  host: string;
}

/** Copas del Mundo ganadas (datos históricos oficiales). */
export const WC_TITLES: Record<string, WcTitle[]> = {
  arg: [{ year: 1978, host: 'Argentina' }, { year: 1986, host: 'México' }, { year: 2022, host: 'Catar' }],
  bra: [{ year: 1958, host: 'Suecia' }, { year: 1962, host: 'Chile' }, { year: 1970, host: 'México' }, { year: 1994, host: 'Estados Unidos' }, { year: 2002, host: 'Corea del Sur y Japón' }],
  ger: [{ year: 1954, host: 'Suiza' }, { year: 1974, host: 'Alemania Occidental' }, { year: 1990, host: 'Italia' }, { year: 2014, host: 'Brasil' }],
  ita: [{ year: 1934, host: 'Italia' }, { year: 1938, host: 'Francia' }, { year: 1982, host: 'España' }, { year: 2006, host: 'Alemania' }],
  fra: [{ year: 1998, host: 'Francia' }, { year: 2018, host: 'Rusia' }],
  uru: [{ year: 1930, host: 'Uruguay' }, { year: 1950, host: 'Brasil' }],
  eng: [{ year: 1966, host: 'Inglaterra' }],
  esp: [{ year: 2010, host: 'Sudáfrica' }],
};

/** Otros títulos oficiales (solo cargados para Argentina). */
export const OTHER_SECTIONS: Record<string, { es: string; en: string; icon: string; chips: string[] }[]> = {
  arg: [
    {
      es: 'Copa América',
      en: 'Copa América',
      icon: '\u{1F30E}',
      chips: ['1921', '1925', '1927', '1929', '1937', '1941', '1945', '1946', '1947', '1955', '1957', '1959', '1991', '1993', '2021', '2024'],
    },
    {
      es: 'Copa de Campeones Conmebol-UEFA (Finalissima)',
      en: 'CONMEBOL–UEFA Cup of Champions (Finalissima)',
      icon: '\u{1F947}',
      chips: ['1993 (vs Dinamarca)', '2022 (vs Italia)'],
    },
    { es: 'Copa Confederaciones', en: 'Confederations Cup', icon: '\u{2B50}', chips: ['1992 (Arabia Saudita)'] },
    { es: 'Juegos Olímpicos (Medalla de Oro)', en: 'Olympic Games (Gold Medal)', icon: '\u{1F3C5}', chips: ['Atenas 2004', 'Pekín 2008'] },
  ],
};

export function teamHistorySections(teamId: string, lang: Lang): TeamHistorySection[] {
  const titles = WC_TITLES[teamId] ?? [];
  const sections: TeamHistorySection[] = [
    {
      title: lang === 'en' ? 'FIFA World Cups' : 'Copas del Mundo FIFA',
      icon: '\u{1F3C6}',
      count: titles.length,
      chips: titles.map((t) => `${t.year} (${t.host})`),
    },
  ];
  for (const extra of OTHER_SECTIONS[teamId] ?? []) {
    sections.push({ title: lang === 'en' ? extra.en : extra.es, icon: extra.icon, count: extra.chips.length, chips: extra.chips });
  }
  return sections;
}

/** Ediciones previas ya jugadas. La edición 2026 se arma dinámicamente con el torneo simulado. */
export const PAST_EDITIONS: HistoricalWorldCupItem[] = [
  {
    edition: 22, year: 2022, host: 'Catar', worldCupIdShort: 'WC2022', editionLabel: 'Mundial FIFA 2022',
    finalPlayedAt: '2022-12-18', finalScoreLabel: '3 - 3 (4-2 pen)',
    champion: { teamName: 'Argentina', flag: '\u{1F1E6}\u{1F1F7}', hasData: true },
    runnerUp: { teamName: 'Francia', flag: '\u{1F1EB}\u{1F1F7}', hasData: true },
    thirdPlace: { teamName: 'Croacia', flag: '\u{1F1ED}\u{1F1F7}', hasData: true },
    fourthPlace: { teamName: 'Marruecos', flag: '\u{1F1F2}\u{1F1E6}', hasData: true },
    totalMatches: 64, totalGoals: 172, avgGoalsPerMatch: 2.69, yellowCards: 227, redCards: 4,
  },
  {
    edition: 21, year: 2018, host: 'Rusia', worldCupIdShort: 'WC2018', editionLabel: 'Mundial FIFA 2018',
    finalPlayedAt: '2018-07-15', finalScoreLabel: '4 - 2',
    champion: { teamName: 'Francia', flag: '\u{1F1EB}\u{1F1F7}', hasData: true },
    runnerUp: { teamName: 'Croacia', flag: '\u{1F1ED}\u{1F1F7}', hasData: true },
    thirdPlace: { teamName: 'Bélgica', flag: '\u{1F1E7}\u{1F1EA}', hasData: true },
    fourthPlace: { teamName: 'Inglaterra', flag: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', hasData: true },
    totalMatches: 64, totalGoals: 169, avgGoalsPerMatch: 2.64, yellowCards: 219, redCards: 4,
  },
];
