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

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let errorDetail = `Error ${res.status}`;
    try {
      const errObj = await res.json();
      errorDetail = errObj.message || errObj.error || errorDetail;
    } catch {}
    throw new Error(errorDetail);
  }

  const json = await res.json();
  return (json && json.data !== undefined) ? json.data : json;
}

export const api = {
  // Admin & Context
  async getAdminConfig() {
    return fetchJson<{ teamId: string; lang: string }>(`${API_BASE}/admin/config`);
  },

  // My Team
  async getPlayers(teamId = 'arg', lang = 'es'): Promise<Player[]> {
    return fetchJson<Player[]>(`${API_BASE}/my-team/players?teamId=${teamId}&lang=${lang}`);
  },

  async getCoaching(teamId = 'arg', lang = 'es'): Promise<CoachingData> {
    return fetchJson<CoachingData>(`${API_BASE}/my-team/coaching?teamId=${teamId}&lang=${lang}`);
  },

  async updateStrategy(strategy: string): Promise<CoachingData> {
    return fetchJson<CoachingData>(`${API_BASE}/my-team/coaching/strategy`, {
      method: 'POST',
      body: JSON.stringify({ strategy }),
    });
  },

  async updateFormation(formation: string): Promise<CoachingData> {
    return fetchJson<CoachingData>(`${API_BASE}/my-team/coaching/formation`, {
      method: 'POST',
      body: JSON.stringify({ formation }),
    });
  },

  async getTeamHistory(teamId = 'arg', lang = 'es'): Promise<TeamHistoryData> {
    return fetchJson<TeamHistoryData>(`${API_BASE}/my-team/history?teamId=${teamId}&lang=${lang}`);
  },

  async getRivals(teamId = 'arg', lang = 'es'): Promise<RivalItem[]> {
    return fetchJson<RivalItem[]>(`${API_BASE}/my-team/rivals?teamId=${teamId}&lang=${lang}`);
  },

  // World Cup
  async getGroups(lang = 'es'): Promise<GroupData[]> {
    return fetchJson<GroupData[]>(`${API_BASE}/world-cup/groups?lang=${lang}`);
  },

  async getJourney(teamId = 'arg', lang = 'es'): Promise<JourneyData> {
    return fetchJson<JourneyData>(`${API_BASE}/world-cup/journey?teamId=${teamId}&lang=${lang}`);
  },

  async getSimulation(lang = 'es'): Promise<SimulationData> {
    return fetchJson<SimulationData>(`${API_BASE}/world-cup/current?lang=${lang}`);
  },

  async runSimulation(lang = 'es'): Promise<SimulationData> {
    return fetchJson<SimulationData>(`${API_BASE}/world-cup/simulate?lang=${lang}`, {
      method: 'POST',
    });
  },

  async getMatches(stage?: string, lang = 'es'): Promise<MatchDetailItem[]> {
    const query = stage ? `?stage=${stage}&lang=${lang}` : `?lang=${lang}`;
    return fetchJson<MatchDetailItem[]>(`${API_BASE}/world-cup/matches${query}`);
  },

  async getStatsAwards(lang = 'es'): Promise<StatsAwardsData> {
    return fetchJson<StatsAwardsData>(`${API_BASE}/world-cup/stats-awards?lang=${lang}`);
  },

  async getWorldCupHistory(lang = 'es'): Promise<HistoricalWorldCupItem[]> {
    return fetchJson<HistoricalWorldCupItem[]>(`${API_BASE}/world-cup/history?lang=${lang}`);
  },

  // Final Match
  async startFinal(): Promise<FinalChatState> {
    return fetchJson<FinalChatState>(`${API_BASE}/final-match/start`, {
      method: 'POST',
    });
  },

  async playFinal(selectedOption: number): Promise<FinalChatState> {
    return fetchJson<FinalChatState>(`${API_BASE}/final-match/play`, {
      method: 'POST',
      body: JSON.stringify({ selectedOption }),
    });
  },

  async changeFinalStrategy(strategy: string): Promise<FinalChatState> {
    return fetchJson<FinalChatState>(`${API_BASE}/final-match/strategy`, {
      method: 'POST',
      body: JSON.stringify({ strategy }),
    });
  },

  async changeFinalFormation(formation: string): Promise<FinalChatState> {
    return fetchJson<FinalChatState>(`${API_BASE}/final-match/formation`, {
      method: 'POST',
      body: JSON.stringify({ formation }),
    });
  },

  async getTeamState(): Promise<TeamStateData> {
    return fetchJson<TeamStateData>(`${API_BASE}/final-match/team-state`);
  },

  async getLiveEvents(): Promise<LiveEventItem[]> {
    return fetchJson<LiveEventItem[]>(`${API_BASE}/final-match/eventos-geniales-api`);
  },
};
