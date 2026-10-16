import {
  Player,
  CoachingData,
  TeamHistoryData,
  RivalItem,
  GroupData,
  JourneyData,
  SimulationData,
  MatchDetailItem,
  StatsAwardsData,
  HistoricalWorldCupItem,
  FinalChatState,
  LiveEventItem,
  TeamStateData
} from '../types';

export const TEAM_PRESETS: Record<string, { name: string; flag: string; primary: string; secondary: string; accent: string; dark: string }> = {
  arg: { name: 'Argentina', flag: '🇦🇷', primary: '#75AADB', secondary: '#FFFFFF', accent: '#FFB81C', dark: '#060c18' },
  bra: { name: 'Brasil', flag: '🇧🇷', primary: '#009C3B', secondary: '#FEDD00', accent: '#FEDD00', dark: '#001A0D' },
  uru: { name: 'Uruguay', flag: '🇺🇾', primary: '#5B9BD5', secondary: '#FFFFFF', accent: '#7FB2E5', dark: '#0A1628' },
  esp: { name: 'España', flag: '🇪🇸', primary: '#AA151B', secondary: '#F1BF00', accent: '#F1BF00', dark: '#2A0004' },
  fra: { name: 'Francia', flag: '🇫🇷', primary: '#002395', secondary: '#FFFFFF', accent: '#ED2939', dark: '#000A30' },
  ger: { name: 'Alemania', flag: '🇩🇪', primary: '#2A2A2A', secondary: '#FFFFFF', accent: '#DD0000', dark: '#111111' },
  ita: { name: 'Italia', flag: '🇮🇹', primary: '#0066CC', secondary: '#FFFFFF', accent: '#4CC38A', dark: '#00152E' },
  ned: { name: 'Países Bajos', flag: '🇳🇱', primary: '#F36C21', secondary: '#FFFFFF', accent: '#FFB27A', dark: '#2A1200' },
  por: { name: 'Portugal', flag: '🇵🇹', primary: '#C8102E', secondary: '#006600', accent: '#FFCC00', dark: '#240008' },
  eng: { name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', primary: '#CF081F', secondary: '#FFFFFF', accent: '#E6E9F0', dark: '#2A0005' },
};

export const MOCK_SQUAD: Player[] = [
  { id: '1', name: 'Emiliano Martínez', shirtNumber: 23, position: 'GK', age: 33, skill: 91, attack: 15, defense: 94, energy: 95, isCaptain: false, isOnField: true },
  { id: '2', name: 'Gerónimo Rulli', shirtNumber: 1, position: 'GK', age: 34, skill: 81, attack: 10, defense: 83, energy: 100, isCaptain: false, isOnField: false },
  { id: '3', name: 'Nahuel Molina', shirtNumber: 26, position: 'DF', age: 28, skill: 84, attack: 76, defense: 83, energy: 92, isCaptain: false, isOnField: true },
  { id: '4', name: 'Cristian Romero', shirtNumber: 13, position: 'DF', age: 28, skill: 90, attack: 45, defense: 93, energy: 88, isCaptain: false, isOnField: true },
  { id: '5', name: 'Nicolás Otamendi', shirtNumber: 19, position: 'DF', age: 38, skill: 85, attack: 48, defense: 88, energy: 78, isCaptain: false, isOnField: true },
  { id: '6', name: 'Nicolás Tagliafico', shirtNumber: 3, position: 'DF', age: 33, skill: 83, attack: 70, defense: 84, energy: 85, isCaptain: false, isOnField: true },
  { id: '7', name: 'Gonzalo Montiel', shirtNumber: 4, position: 'DF', age: 29, skill: 80, attack: 71, defense: 81, energy: 95, isCaptain: false, isOnField: false },
  { id: '8', name: 'Lisandro Martínez', shirtNumber: 25, position: 'DF', age: 28, skill: 88, attack: 55, defense: 90, energy: 90, isCaptain: false, isOnField: false },
  { id: '9', name: 'Rodrigo De Paul', shirtNumber: 7, position: 'MF', age: 32, skill: 87, attack: 81, defense: 84, energy: 86, isCaptain: false, isOnField: true },
  { id: '10', name: 'Enzo Fernández', shirtNumber: 24, position: 'MF', age: 25, skill: 88, attack: 84, defense: 82, energy: 94, isCaptain: false, isOnField: true },
  { id: '11', name: 'Alexis Mac Allister', shirtNumber: 20, position: 'MF', age: 27, skill: 89, attack: 85, defense: 80, energy: 91, isCaptain: false, isOnField: true },
  { id: '12', name: 'Leandro Paredes', shirtNumber: 5, position: 'MF', age: 31, skill: 83, attack: 79, defense: 81, energy: 93, isCaptain: false, isOnField: false },
  { id: '13', name: 'Giovani Lo Celso', shirtNumber: 16, position: 'MF', age: 30, skill: 82, attack: 83, defense: 72, energy: 90, isCaptain: false, isOnField: false },
  { id: '14', name: 'Lionel Messi', shirtNumber: 10, position: 'FW', age: 38, skill: 94, attack: 96, defense: 40, energy: 82, isCaptain: true, isOnField: true },
  { id: '15', name: 'Julián Álvarez', shirtNumber: 9, position: 'FW', age: 26, skill: 89, attack: 91, defense: 68, energy: 96, isCaptain: false, isOnField: true },
  { id: '16', name: 'Lautaro Martínez', shirtNumber: 22, position: 'FW', age: 28, skill: 90, attack: 92, defense: 55, energy: 89, isCaptain: false, isOnField: true },
  { id: '17', name: 'Nicolás González', shirtNumber: 15, position: 'FW', age: 28, skill: 82, attack: 82, defense: 65, energy: 95, isCaptain: false, isOnField: false },
  { id: '18', name: 'Alejandro Garnacho', shirtNumber: 17, position: 'FW', age: 21, skill: 83, attack: 86, defense: 42, energy: 98, isCaptain: false, isOnField: false }
];

export const MOCK_COACHING: CoachingData = {
  coachName: 'Lionel Scaloni',
  coachNationality: 'Argentina',
  coachAge: 48,
  coachProfile: 'Líder Pragmático y Ganador',
  coachProfileDescription: 'Enfoque táctico flexible, intensidad en las transiciones, sólida identidad grupal y adaptación estratégica contra rivales de élite.',
  currentStrategy: 'EQUILIBRADO',
  currentFormation: '4-3-3',
  availableStrategies: [
    { strategy: 'EQUILIBRADO', description: 'Control de balón y presión coordinada.' },
    { strategy: 'OFENSIVO', description: 'Líneas adelantadas y búsqueda constante del gol.' },
    { strategy: 'DEFENSIVO', description: 'Bloque bajo, repliegue ordenado y solidez.' },
    { strategy: 'CONTRAATAQUE', description: 'Transiciones rápidas aprovechando espacios.' }
  ],
  availableFormations: [
    { formation: '4-3-3', description: 'Tridente ofensivo con extremos desequilibrantes.' },
    { formation: '4-4-2', description: 'Doble cinco clásico y mayor equilibrio central.' },
    { formation: '3-5-2', description: 'Carrileros profundos y superioridad en la medular.' },
    { formation: '4-2-3-1', description: 'Enganche con mediapuntas y pivotes de contención.' }
  ],
  metrics: [
    { label: 'Adaptabilidad táctica', value: 95 },
    { label: 'Gestión de vestuario', value: 98 },
    { label: 'Presión defensiva', value: 89 },
    { label: 'Intensidad en transiciones', value: 92 }
  ]
};

export const MOCK_TEAM_HISTORY: TeamHistoryData = {
  teamId: 'arg',
  teamName: 'Argentina',
  totalTitles: 23,
  sections: [
    {
      title: 'Copas del Mundo FIFA',
      icon: '🏆',
      count: 3,
      chips: ['1978 (Argentina)', '1986 (México)', '2022 (Catar)']
    },
    {
      title: 'Copa América',
      icon: '🌎',
      count: 16,
      chips: ['1921', '1925', '1927', '1929', '1937', '1941', '1945', '1946', '1947', '1955', '1957', '1959', '1991', '1993', '2021', '2024']
    },
    {
      title: 'Copa de Campeones Conmebol-UEFA (Finalissima)',
      icon: '🥇',
      count: 2,
      chips: ['1993 (vs Dinamarca)', '2022 (vs Italia)']
    },
    {
      title: 'Copa Confederaciones',
      icon: '⭐',
      count: 1,
      chips: ['1992 (Arabia Saudita)']
    },
    {
      title: 'Juegos Olímpicos (Medalla de Oro)',
      icon: '🏅',
      count: 2,
      chips: ['Atenas 2004', 'Pekín 2008']
    }
  ]
};

export const MOCK_RIVALS: RivalItem[] = [
  { id: '1', teamId: 'bra', name: 'Brasil', flag: '🇧🇷', confederation: 'CONMEBOL', overallRating: 92, coachName: 'Dorival Júnior', captainName: 'Marquinhos', formation: '4-2-3-1', strategyLabel: 'Ofensivo Clásico' },
  { id: '2', teamId: 'uru', name: 'Uruguay', flag: '🇺🇾', confederation: 'CONMEBOL', overallRating: 88, coachName: 'Marcelo Bielsa', captainName: 'Federico Valverde', formation: '4-3-3', strategyLabel: 'Presión Alta' },
  { id: '3', teamId: 'fra', name: 'Francia', flag: '🇫🇷', confederation: 'UEFA', overallRating: 93, coachName: 'Didier Deschamps', captainName: 'Kylian Mbappé', formation: '4-3-3', strategyLabel: 'Velocidad y Pegada' },
  { id: '4', teamId: 'ger', name: 'Alemania', flag: '🇩🇪', confederation: 'UEFA', overallRating: 89, coachName: 'Julian Nagelsmann', captainName: 'Joshua Kimmich', formation: '4-2-3-1', strategyLabel: 'Posesión Dinámica' },
  { id: '5', teamId: 'eng', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation: 'UEFA', overallRating: 90, coachName: 'Thomas Tuchel', captainName: 'Harry Kane', formation: '4-2-3-1', strategyLabel: 'Directo y Contundente' },
  { id: '6', teamId: 'ned', name: 'Países Bajos', flag: '🇳🇱', confederation: 'UEFA', overallRating: 86, coachName: 'Ronald Koeman', captainName: 'Virgil van Dijk', formation: '3-4-3', strategyLabel: 'Fútbol Total' }
];

export const MOCK_GROUPS: GroupData[] = [
  {
    groupName: 'A',
    teams: [
      { teamId: 'arg', teamName: 'Argentina', played: 3, wins: 3, draws: 0, losses: 0, goalsFor: 8, goalsAgainst: 1, goalDifference: 7, points: 9, isMyTeam: true },
      { teamId: 'can', teamName: 'Canadá', played: 3, wins: 1, draws: 1, losses: 1, goalsFor: 3, goalsAgainst: 4, goalDifference: -1, points: 4 },
      { teamId: 'chi', teamName: 'Chile', played: 3, wins: 1, draws: 0, losses: 2, goalsFor: 2, goalsAgainst: 4, goalDifference: -2, points: 3 },
      { teamId: 'per', teamName: 'Perú', played: 3, wins: 0, draws: 1, losses: 2, goalsFor: 1, goalsAgainst: 5, goalDifference: -4, points: 1 }
    ]
  },
  {
    groupName: 'B',
    teams: [
      { teamId: 'fra', teamName: 'Francia', played: 3, wins: 2, draws: 1, losses: 0, goalsFor: 7, goalsAgainst: 2, goalDifference: 5, points: 7 },
      { teamId: 'den', teamName: 'Dinamarca', played: 3, wins: 2, draws: 0, losses: 1, goalsFor: 4, goalsAgainst: 3, goalDifference: 1, points: 6 },
      { teamId: 'aus', teamName: 'Australia', played: 3, wins: 1, draws: 0, losses: 2, goalsFor: 3, goalsAgainst: 5, goalDifference: -2, points: 3 },
      { teamId: 'tun', teamName: 'Túnez', played: 3, wins: 0, draws: 1, losses: 2, goalsFor: 1, goalsAgainst: 5, goalDifference: -4, points: 1 }
    ]
  },
  {
    groupName: 'C',
    teams: [
      { teamId: 'bra', teamName: 'Brasil', played: 3, wins: 3, draws: 0, losses: 0, goalsFor: 9, goalsAgainst: 1, goalDifference: 8, points: 9 },
      { teamId: 'sui', teamName: 'Suiza', played: 3, wins: 1, draws: 1, losses: 1, goalsFor: 4, goalsAgainst: 4, goalDifference: 0, points: 4 },
      { teamId: 'srb', teamName: 'Serbia', played: 3, wins: 1, draws: 0, losses: 2, goalsFor: 3, goalsAgainst: 6, goalDifference: -3, points: 3 },
      { teamId: 'cmr', teamName: 'Camerún', played: 3, wins: 0, draws: 1, losses: 2, goalsFor: 2, goalsAgainst: 7, goalDifference: -5, points: 1 }
    ]
  },
  {
    groupName: 'D',
    teams: [
      { teamId: 'esp', teamName: 'España', played: 3, wins: 2, draws: 1, losses: 0, goalsFor: 8, goalsAgainst: 2, goalDifference: 6, points: 7 },
      { teamId: 'ger', teamName: 'Alemania', played: 3, wins: 2, draws: 0, losses: 1, goalsFor: 6, goalsAgainst: 4, goalDifference: 2, points: 6 },
      { teamId: 'jpn', teamName: 'Japón', played: 3, wins: 1, draws: 0, losses: 2, goalsFor: 3, goalsAgainst: 5, goalDifference: -2, points: 3 },
      { teamId: 'crc', teamName: 'Costa Rica', played: 3, wins: 0, draws: 1, losses: 2, goalsFor: 1, goalsAgainst: 7, goalDifference: -6, points: 1 }
    ]
  }
];

export const MOCK_JOURNEY: JourneyData = {
  teamId: 'arg',
  teamName: 'Argentina',
  stageReachedLabel: 'Finalista',
  matchesPlayed: 7,
  summary: 'Paso invicto con 6 victorias en tiempo reglamentario y una emocionante semifinal definida con autoridad.',
  matches: [
    { stage: 'GROUPS_1', stageLabel: 'Fase de Grupos · Fecha 1', opponentTeamId: 'can', opponentTeamName: 'Canadá', opponentFlag: '🇨🇦', scoreLabel: '2 - 0', resultLabel: 'Victoria', resultStyle: 'WIN', resolutionLabel: 'Tiempo Reglamentario' },
    { stage: 'GROUPS_2', stageLabel: 'Fase de Grupos · Fecha 2', opponentTeamId: 'chi', opponentTeamName: 'Chile', opponentFlag: '🇨🇱', scoreLabel: '3 - 1', resultLabel: 'Victoria', resultStyle: 'WIN', resolutionLabel: 'Tiempo Reglamentario' },
    { stage: 'GROUPS_3', stageLabel: 'Fase de Grupos · Fecha 3', opponentTeamId: 'per', opponentTeamName: 'Perú', opponentFlag: '🇵🇪', scoreLabel: '3 - 0', resultLabel: 'Victoria', resultStyle: 'WIN', resolutionLabel: 'Tiempo Reglamentario' },
    { stage: 'ROUND_OF_32', stageLabel: '16avos de Final', opponentTeamId: 'aus', opponentTeamName: 'Australia', opponentFlag: '🇦🇺', scoreLabel: '2 - 0', resultLabel: 'Victoria', resultStyle: 'WIN', resolutionLabel: 'Tiempo Reglamentario' },
    { stage: 'ROUND_OF_16', stageLabel: 'Octavos de Final', opponentTeamId: 'den', opponentTeamName: 'Dinamarca', opponentFlag: '🇩🇰', scoreLabel: '2 - 1', resultLabel: 'Victoria', resultStyle: 'WIN', resolutionLabel: 'Tiempo Reglamentario' },
    { stage: 'QUARTER_FINALS', stageLabel: 'Cuartos de Final', opponentTeamId: 'ned', opponentTeamName: 'Países Bajos', opponentFlag: '🇳🇱', scoreLabel: '2 - 2 (4-3 pen)', resultLabel: 'Victoria', resultStyle: 'WIN', resolutionLabel: 'Definición por Penales' },
    { stage: 'SEMI_FINALS', stageLabel: 'Semifinales', opponentTeamId: 'bra', opponentTeamName: 'Brasil', opponentFlag: '🇧🇷', scoreLabel: '2 - 0', resultLabel: 'Victoria', resultStyle: 'WIN', resolutionLabel: 'Tiempo Reglamentario' },
  ]
};

export const MOCK_SIMULATION: SimulationData = {
  edition: 2026,
  status: 'READY_FOR_FINAL',
  stadium: 'MetLife Stadium',
  city: 'New York / New Jersey',
  finalHomeTeam: {
    teamId: 'arg',
    name: 'Argentina',
    flag: '🇦🇷',
    coach: 'Lionel Scaloni',
    formation: '4-3-3',
    strategy: 'EQUILIBRADO'
  },
  finalAwayTeam: {
    teamId: 'fra',
    name: 'Francia',
    flag: '🇫🇷',
    coach: 'Didier Deschamps',
    formation: '4-3-3',
    strategy: 'OFENSIVO'
  }
};

export const MOCK_MATCHES: MatchDetailItem[] = [
  {
    matchId: 'm1',
    matchCode: 'M-01',
    stage: 'GROUPS',
    groupName: 'Grupo A',
    homeTeamId: 'arg',
    homeTeamName: 'Argentina',
    homeFlag: '🇦🇷',
    awayTeamId: 'can',
    awayTeamName: 'Canadá',
    awayFlag: '🇨🇦',
    homeScore: 2,
    awayScore: 0,
    scoreLabel: '2 - 0',
    resolutionLabel: 'Finalizado',
    winnerTeamName: 'Argentina',
    winnerFlag: '🇦🇷',
    playerOfMatchName: 'Lionel Messi',
    goalsSummary: 'J. Álvarez 49\', L. Martínez 88\'',
    cardsSummary: 'De Paul (A), Davies (A)'
  },
  {
    matchId: 'm2',
    matchCode: 'M-02',
    stage: 'GROUPS',
    groupName: 'Grupo B',
    homeTeamId: 'fra',
    homeTeamName: 'Francia',
    homeFlag: '🇫🇷',
    awayTeamId: 'aus',
    awayTeamName: 'Australia',
    awayFlag: '🇦🇺',
    homeScore: 4,
    awayScore: 1,
    scoreLabel: '4 - 1',
    resolutionLabel: 'Finalizado',
    winnerTeamName: 'Francia',
    winnerFlag: '🇫🇷',
    playerOfMatchName: 'Kylian Mbappé',
    goalsSummary: 'Mbappé 22\', 68\', Giroud 35\', Dembélé 75\'',
    cardsSummary: 'Rabiot (A)'
  },
  {
    matchId: 'm3',
    matchCode: 'M-16',
    stage: 'ROUND_OF_16',
    homeTeamId: 'arg',
    homeTeamName: 'Argentina',
    homeFlag: '🇦🇷',
    awayTeamId: 'den',
    awayTeamName: 'Dinamarca',
    awayFlag: '🇩🇰',
    homeScore: 2,
    awayScore: 1,
    scoreLabel: '2 - 1',
    resolutionLabel: 'Finalizado',
    winnerTeamName: 'Argentina',
    winnerFlag: '🇦🇷',
    playerOfMatchName: 'Enzo Fernández',
    goalsSummary: 'Messi 35\', Enzo F. 79\' · Eriksen 62\'',
    cardsSummary: 'Romero (A)'
  },
  {
    matchId: 'm4',
    matchCode: 'M-QF1',
    stage: 'QUARTER_FINALS',
    homeTeamId: 'arg',
    homeTeamName: 'Argentina',
    homeFlag: '🇦🇷',
    awayTeamId: 'ned',
    awayTeamName: 'Países Bajos',
    awayFlag: '🇳🇱',
    homeScore: 2,
    awayScore: 2,
    scoreLabel: '2 - 2 (4-3 pen)',
    resolutionLabel: 'Penales',
    penaltyLabel: 'Penales: 4 - 3 a favor de Argentina',
    winnerTeamName: 'Argentina',
    winnerFlag: '🇦🇷',
    playerOfMatchName: 'Emiliano Martínez',
    goalsSummary: 'Molina 35\', Messi 73\' · Weghorst 83\', 90+11\'',
    cardsSummary: 'Acuña (A), Timber (A)'
  },
  {
    matchId: 'm5',
    matchCode: 'M-SF1',
    stage: 'SEMI_FINALS',
    homeTeamId: 'arg',
    homeTeamName: 'Argentina',
    homeFlag: '🇦🇷',
    awayTeamId: 'bra',
    awayTeamName: 'Brasil',
    awayFlag: '🇧🇷',
    homeScore: 2,
    awayScore: 0,
    scoreLabel: '2 - 0',
    resolutionLabel: 'Finalizado',
    winnerTeamName: 'Argentina',
    winnerFlag: '🇦🇷',
    playerOfMatchName: 'Julián Álvarez',
    goalsSummary: 'J. Álvarez 28\', 61\'',
    cardsSummary: 'Casemiro (A), Otamendi (A)'
  },
  {
    matchId: 'm6',
    matchCode: 'M-FINAL',
    stage: 'FINAL',
    homeTeamId: 'arg',
    homeTeamName: 'Argentina',
    homeFlag: '🇦🇷',
    awayTeamId: 'fra',
    awayTeamName: 'Francia',
    awayFlag: '🇫🇷',
    homeScore: 3,
    awayScore: 2,
    scoreLabel: '3 - 2',
    resolutionLabel: 'Tiempo Suplementario',
    winnerTeamName: 'Argentina',
    winnerFlag: '🇦🇷',
    playerOfMatchName: 'Lionel Messi',
    goalsSummary: 'Messi 23\' (p), 108\', Di María 36\' · Mbappé 80\', 81\'',
    cardsSummary: 'De Paul (A), Giroud (A)'
  }
];

export const MOCK_STATS_AWARDS: StatsAwardsData = {
  totalMatches: 104,
  totalGoals: 284,
  avgGoalsPerMatch: 2.73,
  totalYellowCards: 342,
  totalRedCards: 14,
  podium: [
    { place: 1, placeLabel: 'Campeón', teamName: 'Argentina', medal: '🥇', flag: '🇦🇷' },
    { place: 2, placeLabel: 'Subcampeón', teamName: 'Francia', medal: '🥈', flag: '🇫🇷' },
    { place: 3, placeLabel: 'Tercer Puesto', teamName: 'Brasil', medal: '🥉', flag: '🇧🇷' }
  ],
  topScorers: [
    { rank: 1, playerName: 'Kylian Mbappé', teamName: 'Francia', value: 8 },
    { rank: 2, playerName: 'Lionel Messi', teamName: 'Argentina', value: 7 },
    { rank: 3, playerName: 'Julián Álvarez', teamName: 'Argentina', value: 5 },
    { rank: 4, playerName: 'Vinicius Jr', teamName: 'Brasil', value: 4 },
    { rank: 5, playerName: 'Harry Kane', teamName: 'Inglaterra', value: 4 }
  ],
  topAssists: [
    { rank: 1, playerName: 'Lionel Messi', teamName: 'Argentina', value: 5 },
    { rank: 2, playerName: 'Antoine Griezmann', teamName: 'Francia', value: 4 },
    { rank: 3, playerName: 'Bruno Fernandes', teamName: 'Portugal', value: 3 },
    { rank: 4, playerName: 'Rodrigo De Paul', teamName: 'Argentina', value: 3 }
  ],
  awards: [
    { icon: '🏆', title: 'Balón de Oro', winnerName: 'Lionel Messi', teamName: 'Argentina', reason: 'Mejor jugador indiscutido del torneo' },
    { icon: '👟', title: 'Bota de Oro', winnerName: 'Kylian Mbappé', teamName: 'Francia', reason: 'Máximo goleador con 8 tantos' },
    { icon: '🧤', title: 'Guante de Oro', winnerName: 'Emiliano Martínez', teamName: 'Argentina', reason: 'Atajadas decisivas y vallas invictas' },
    { icon: '🌟', title: 'Mejor Jugador Joven', winnerName: 'Alejandro Garnacho', teamName: 'Argentina', reason: 'Revelación y desequilibrio ofensivo' },
    { icon: '🕊️', title: 'Premio Fair Play', winnerName: 'Japón', teamName: 'Japón', reason: 'Menor cantidad de infracciones y tarjetas' }
  ]
};

export const MOCK_WC_HISTORY: HistoricalWorldCupItem[] = [
  {
    edition: 23,
    year: 2026,
    host: 'USA, Canadá y México',
    worldCupIdShort: 'WC2026',
    editionLabel: 'Mundial FIFA 2026',
    finalPlayedAt: '2026-07-19',
    finalScoreLabel: '3 - 2',
    champion: { teamName: 'Argentina', flag: '🇦🇷', hasData: true },
    runnerUp: { teamName: 'Francia', flag: '🇫🇷', hasData: true },
    thirdPlace: { teamName: 'Brasil', flag: '🇧🇷', hasData: true },
    fourthPlace: { teamName: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', hasData: true },
    totalMatches: 104,
    totalGoals: 284,
    avgGoalsPerMatch: 2.73,
    yellowCards: 342,
    redCards: 14
  },
  {
    edition: 22,
    year: 2022,
    host: 'Catar',
    worldCupIdShort: 'WC2022',
    editionLabel: 'Mundial FIFA 2022',
    finalPlayedAt: '2022-12-18',
    finalScoreLabel: '3 - 3 (4-2 pen)',
    champion: { teamName: 'Argentina', flag: '🇦🇷', hasData: true },
    runnerUp: { teamName: 'Francia', flag: '🇫🇷', hasData: true },
    thirdPlace: { teamName: 'Croacia', flag: '🇭🇷', hasData: true },
    fourthPlace: { teamName: 'Marruecos', flag: '🇲🇦', hasData: true },
    totalMatches: 64,
    totalGoals: 172,
    avgGoalsPerMatch: 2.69,
    yellowCards: 227,
    redCards: 4
  },
  {
    edition: 21,
    year: 2018,
    host: 'Rusia',
    worldCupIdShort: 'WC2018',
    editionLabel: 'Mundial FIFA 2018',
    finalPlayedAt: '2018-07-15',
    finalScoreLabel: '4 - 2',
    champion: { teamName: 'Francia', flag: '🇫🇷', hasData: true },
    runnerUp: { teamName: 'Croacia', flag: '🇭🇷', hasData: true },
    thirdPlace: { teamName: 'Bélgica', flag: '🇧🇪', hasData: true },
    fourthPlace: { teamName: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', hasData: true },
    totalMatches: 64,
    totalGoals: 169,
    avgGoalsPerMatch: 2.64,
    yellowCards: 219,
    redCards: 4
  }
];

export const INITIAL_FINAL_CHAT: FinalChatState = {
  isFinished: false,
  minute: 12,
  turn: 1,
  score: 'ARG 0 - 0 FRA',
  zone: 'MEDIOCAMPO',
  possession: 'ARGENTINA',
  teamName: 'Argentina',
  opponentName: 'Francia',
  messageItems: [
    { minute: 1, text: '¡Arranca la Gran Final del Mundial 2026 en el MetLife Stadium! Clima electrizante.', type: 'narrative' },
    { minute: 7, text: 'Rodrigo De Paul recupera la pelota con una barrida limpia en el círculo central.', type: 'narrative' },
    { minute: 12, text: 'Lionel Messi recibe perfilado hacia adelante y observa desmarques en ataque.', type: 'tactical' }
  ],
  options: [
    { index: 1, label: 'Pase filtrado a Julián Álvarez', actionCode: 'PASS' },
    { index: 2, label: 'Remate potente desde media distancia', actionCode: 'SHOOT' },
    { index: 3, label: 'Cambio de frente hacia el extremo', actionCode: 'CROSS' },
    { index: 4, label: 'Aguantar la pelota y pausar el juego', actionCode: 'HOLD' }
  ]
};

export const MOCK_LIVE_EVENTS: LiveEventItem[] = [
  { minuto: 1, tipo: 'INICIO', descripcion: 'Pitazo inicial del árbitro central. Comienza la final.', equipo: 'FIFA' },
  { minuto: 14, tipo: 'JUGADA', descripcion: 'Gran asociación entre Enzo Fernández y Mac Allister en zona media.', equipo: 'Argentina', jugador: 'Enzo Fernández' },
  { minuto: 23, tipo: 'GOL', descripcion: '¡GOOOOOL DE ARGENTINA! Lionel Messi define con clase al palo izquierdo.', equipo: 'Argentina', jugador: 'Lionel Messi' },
  { minuto: 34, tipo: 'TARJETA', descripcion: 'Tarjeta amarilla para Rabiot tras una dura entrada sobre De Paul.', equipo: 'Francia', jugador: 'Adrien Rabiot' },
  { minuto: 45, tipo: 'DESCANSO', descripcion: 'Final del primer tiempo. Argentina 1 - 0 Francia.', equipo: 'FIFA' },
  { minuto: 68, tipo: 'CAMBIO', descripcion: 'Ingresa Lautaro Martínez en reemplazo de Julián Álvarez.', equipo: 'Argentina', jugador: 'Lautaro Martínez' },
  { minuto: 79, tipo: 'GOL', descripcion: 'Gol de Francia. Kylian Mbappé empata el encuentro tras un desborde veloz.', equipo: 'Francia', jugador: 'Kylian Mbappé' },
  { minuto: 88, tipo: 'ATAJADA', descripcion: '¡Milagro en el área! Emiliano Martínez despeja un mano a mano providencial.', equipo: 'Argentina', jugador: 'Emiliano Martínez' }
];

export const MOCK_TEAM_STATE: TeamStateData = {
  minute: 74,
  turn: 9,
  score: 'ARG 1 - 1 FRA',
  team: {
    name: 'Argentina',
    flag: '🇦🇷',
    formation: '4-3-3',
    strategy: 'EQUILIBRADO',
    coachName: 'Lionel Scaloni',
    coachProfile: 'Líder Pragmático',
    tacticalBreakdown: {
      effectiveTeamLine: { attack: 88, midfield: 86, defense: 89 }
    },
    substitutionsUsed: 2,
    maxSubstitutions: 5,
    onField: [
      { shirtNumber: 23, name: 'E. Martínez', position: 'GK', energyLabel: '92%' },
      { shirtNumber: 26, name: 'N. Molina', position: 'DF', energyLabel: '74%' },
      { shirtNumber: 13, name: 'C. Romero', position: 'DF', energyLabel: '79%' },
      { shirtNumber: 19, name: 'N. Otamendi', position: 'DF', energyLabel: '68%' },
      { shirtNumber: 3, name: 'N. Tagliafico', position: 'DF', energyLabel: '71%' },
      { shirtNumber: 7, name: 'R. De Paul', position: 'MF', energyLabel: '70%' },
      { shirtNumber: 24, name: 'E. Fernández', position: 'MF', energyLabel: '78%' },
      { shirtNumber: 20, name: 'A. Mac Allister', position: 'MF', energyLabel: '75%' },
      { shirtNumber: 10, name: 'L. Messi', position: 'FW', energyLabel: '73%' },
      { shirtNumber: 22, name: 'L. Martínez', position: 'FW', energyLabel: '92%' },
      { shirtNumber: 17, name: 'A. Garnacho', position: 'FW', energyLabel: '88%' }
    ],
    bench: [
      { shirtNumber: 1, name: 'G. Rulli', position: 'GK', energyLabel: '100%' },
      { shirtNumber: 4, name: 'G. Montiel', position: 'DF', energyLabel: '100%' },
      { shirtNumber: 25, name: 'L. Martínez', position: 'DF', energyLabel: '100%' },
      { shirtNumber: 5, name: 'L. Paredes', position: 'MF', energyLabel: '100%' },
      { shirtNumber: 16, name: 'G. Lo Celso', position: 'MF', energyLabel: '100%' }
    ]
  },
  opponent: {
    name: 'Francia',
    flag: '🇫🇷',
    formation: '4-3-3',
    strategy: 'OFENSIVO',
    coachName: 'Didier Deschamps',
    coachProfile: 'Estratégico Campeón',
    tacticalBreakdown: {
      effectiveTeamLine: { attack: 92, midfield: 84, defense: 87 }
    },
    substitutionsUsed: 3,
    maxSubstitutions: 5,
    onField: [
      { shirtNumber: 16, name: 'M. Maignan', position: 'GK', energyLabel: '90%' },
      { shirtNumber: 5, name: 'J. Koundé', position: 'DF', energyLabel: '75%' },
      { shirtNumber: 4, name: 'D. Upamecano', position: 'DF', energyLabel: '72%' },
      { shirtNumber: 17, name: 'W. Saliba', position: 'DF', energyLabel: '81%' },
      { shirtNumber: 22, name: 'T. Hernández', position: 'DF', energyLabel: '69%' },
      { shirtNumber: 8, name: 'A. Tchouaméni', position: 'MF', energyLabel: '77%' },
      { shirtNumber: 14, name: 'A. Rabiot', position: 'MF', energyLabel: '65%' },
      { shirtNumber: 7, name: 'A. Griezmann', position: 'MF', energyLabel: '70%' },
      { shirtNumber: 11, name: 'O. Dembélé', position: 'FW', energyLabel: '72%' },
      { shirtNumber: 10, name: 'K. Mbappé', position: 'FW', energyLabel: '84%' },
      { shirtNumber: 9, name: 'M. Thuram', position: 'FW', energyLabel: '78%' }
    ],
    bench: [
      { shirtNumber: 1, name: 'B. Samba', position: 'GK', energyLabel: '100%' },
      { shirtNumber: 2, name: 'B. Pavard', position: 'DF', energyLabel: '100%' },
      { shirtNumber: 6, name: 'E. Camavinga', position: 'MF', energyLabel: '100%' },
      { shirtNumber: 12, name: 'R. Kolo Muani', position: 'FW', energyLabel: '100%' }
    ]
  }
};
