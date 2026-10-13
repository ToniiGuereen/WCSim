export const STRATEGIES = [
  { strategy: 'EQUILIBRADO', description: 'Control de balón y presión coordinada.', descriptionEn: 'Ball control and coordinated pressing.' },
  { strategy: 'OFENSIVO', description: 'Líneas adelantadas y búsqueda constante del gol.', descriptionEn: 'High lines and a constant search for goals.' },
  { strategy: 'DEFENSIVO', description: 'Bloque bajo, repliegue ordenado y solidez.', descriptionEn: 'Low block, orderly retreat and solidity.' },
  { strategy: 'CONTRAATAQUE', description: 'Transiciones rápidas aprovechando espacios.', descriptionEn: 'Fast transitions exploiting open space.' },
] as const;

export const FORMATIONS = [
  { formation: '4-3-3', description: 'Tridente ofensivo con extremos desequilibrantes.', descriptionEn: 'Attacking front three with game-changing wingers.' },
  { formation: '4-4-2', description: 'Doble cinco clásico y mayor equilibrio central.', descriptionEn: 'Classic double pivot and central balance.' },
  { formation: '3-5-2', description: 'Carrileros profundos y superioridad en la medular.', descriptionEn: 'Deep wing-backs and midfield superiority.' },
  { formation: '4-2-3-1', description: 'Enganche con mediapuntas y pivotes de contención.', descriptionEn: 'Playmaker with attacking midfielders and holding pivots.' },
] as const;

export const STRATEGY_IDS: string[] = STRATEGIES.map((s) => s.strategy);
export const FORMATION_IDS: string[] = FORMATIONS.map((f) => f.formation);

/** Jugadores de campo por línea (el arquero siempre es 1). */
export const FORMATION_SHAPE: Record<string, { DF: number; MF: number; FW: number }> = {
  '4-3-3': { DF: 4, MF: 3, FW: 3 },
  '4-4-2': { DF: 4, MF: 4, FW: 2 },
  '3-5-2': { DF: 3, MF: 5, FW: 2 },
  '4-2-3-1': { DF: 4, MF: 5, FW: 1 },
};

/** Multiplicadores sobre las líneas del equipo. `tempo` escala el desgaste físico. */
export const STRATEGY_MOD: Record<string, { attack: number; midfield: number; defense: number; tempo: number }> = {
  EQUILIBRADO: { attack: 1, midfield: 1, defense: 1, tempo: 1 },
  OFENSIVO: { attack: 1.07, midfield: 1, defense: 0.94, tempo: 1.12 },
  DEFENSIVO: { attack: 0.93, midfield: 1, defense: 1.07, tempo: 0.92 },
  CONTRAATAQUE: { attack: 1.04, midfield: 0.97, defense: 1, tempo: 0.96 },
};

export const FORMATION_MOD: Record<string, { attack: number; midfield: number; defense: number }> = {
  '4-3-3': { attack: 1.03, midfield: 1, defense: 0.99 },
  '4-4-2': { attack: 1, midfield: 1.01, defense: 1 },
  '3-5-2': { attack: 0.99, midfield: 1.04, defense: 0.97 },
  '4-2-3-1': { attack: 1, midfield: 1.02, defense: 1.01 },
};
