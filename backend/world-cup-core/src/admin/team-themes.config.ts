export interface TeamTheme {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  textLight: string;
  textDark: string;
}

export const GENERIC_THEME: TeamTheme = {
  primary: '#455A64',
  secondary: '#607D8B',
  accent: '#90A4AE',
  dark: '#263238',
  textLight: '#FFFFFF',
  textDark: '#212121',
};

export function getTeamTheme(teamId: string): TeamTheme {
  return GENERIC_THEME;
}
