import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import { MatchSquadRulesHelper } from '../../src/match/helper/match-squad-rules.helper';
import { MatchEventType } from '../../src/match/model/match-event-type.enum';
import { MatchStrategy } from '../../src/match/model/match-strategy.enum';

type SquadRow = {
  squadId: string;
  matchId: string;
  teamId: string;
  playerId: string;
  playerName: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  shirtNumber: number;
  age: number;
  skill: number;
  attack: number;
  defense: number;
  energy: number;
  isCaptain: boolean;
  isStarter: boolean;
  isOnField: boolean;
  yellowCards: number;
  redCard: boolean;
  isInjured: boolean;
};

function compareValues(a: unknown, b: unknown): number {
  if (a === b) {
    return 0;
  }
  if (a === undefined || a === null) {
    return -1;
  }
  if (b === undefined || b === null) {
    return 1;
  }
  return a > b ? 1 : -1;
}

function matchesWhere(row: Record<string, unknown>, where: Record<string, unknown>): boolean {
  return Object.entries(where).every(([key, value]) => row[key] === value);
}

function createInMemorySquadRepository(initialRows: SquadRow[]) {
  const rows = initialRows;

  return {
    rows,
    async find(options?: { where?: Record<string, unknown>; order?: Record<string, 'ASC' | 'DESC'> }) {
      let result = rows;
      if (options?.where) {
        result = result.filter((row) => matchesWhere(row as Record<string, unknown>, options.where!));
      }

      if (options?.order) {
        const entries = Object.entries(options.order);
        result = [...result].sort((left, right) => {
          for (const [field, direction] of entries) {
            const cmp = compareValues(
              (left as Record<string, unknown>)[field],
              (right as Record<string, unknown>)[field],
            );
            if (cmp !== 0) {
              return direction === 'DESC' ? -cmp : cmp;
            }
          }
          return 0;
        });
      }

      return result;
    },
    async save(input: SquadRow | SquadRow[]) {
      const entities = Array.isArray(input) ? input : [input];
      for (const entity of entities) {
        const index = rows.findIndex((row) => row.squadId === entity.squadId);
        if (index >= 0) {
          rows[index] = entity;
        } else {
          rows.push(entity);
        }
      }
      return input;
    },
    async count(options?: { where?: Record<string, unknown> }) {
      if (!options?.where) {
        return rows.length;
      }
      return rows.filter((row) => matchesWhere(row as Record<string, unknown>, options.where!)).length;
    },
  };
}

async function run(): Promise<void> {
  const rows: SquadRow[] = [
    {
      squadId: 'arg-gk',
      matchId: 'm1',
      teamId: 'arg',
      playerId: 'arg-gk',
      playerName: 'User GK',
      position: 'GK',
      shirtNumber: 1,
      age: 30,
      skill: 80,
      attack: 55,
      defense: 90,
      energy: 70,
      isCaptain: false,
      isStarter: true,
      isOnField: true,
      yellowCards: 0,
      redCard: false,
      isInjured: false,
    },
    {
      squadId: 'arg-cap',
      matchId: 'm1',
      teamId: 'arg',
      playerId: 'arg-cap',
      playerName: 'User Captain',
      position: 'MF',
      shirtNumber: 8,
      age: 29,
      skill: 88,
      attack: 88,
      defense: 80,
      energy: 75,
      isCaptain: true,
      isStarter: true,
      isOnField: true,
      yellowCards: 0,
      redCard: false,
      isInjured: false,
    },
    {
      squadId: 'arg-low',
      matchId: 'm1',
      teamId: 'arg',
      playerId: 'arg-low',
      playerName: 'Low Energy Mid',
      position: 'MF',
      shirtNumber: 14,
      age: 31,
      skill: 86,
      attack: 84,
      defense: 78,
      energy: 20,
      isCaptain: false,
      isStarter: true,
      isOnField: true,
      yellowCards: 0,
      redCard: false,
      isInjured: false,
    },
    {
      squadId: 'arg-fresh',
      matchId: 'm1',
      teamId: 'arg',
      playerId: 'arg-fresh',
      playerName: 'Fresh But Weak Mid',
      position: 'MF',
      shirtNumber: 19,
      age: 22,
      skill: 40,
      attack: 40,
      defense: 40,
      energy: 99,
      isCaptain: false,
      isStarter: false,
      isOnField: false,
      yellowCards: 0,
      redCard: false,
      isInjured: false,
    },
    {
      squadId: 'arg-strong',
      matchId: 'm1',
      teamId: 'arg',
      playerId: 'arg-strong',
      playerName: 'Strong Mid',
      position: 'MF',
      shirtNumber: 20,
      age: 26,
      skill: 98,
      attack: 96,
      defense: 88,
      energy: 70,
      isCaptain: false,
      isStarter: false,
      isOnField: false,
      yellowCards: 0,
      redCard: false,
      isInjured: false,
    },
    {
      squadId: 'uru-cap',
      matchId: 'm1',
      teamId: 'uru',
      playerId: 'uru-cap',
      playerName: 'Opponent Captain',
      position: 'MF',
      shirtNumber: 10,
      age: 28,
      skill: 84,
      attack: 82,
      defense: 80,
      energy: 72,
      isCaptain: true,
      isStarter: true,
      isOnField: true,
      yellowCards: 0,
      redCard: false,
      isInjured: false,
    },
  ];

  const squadRepo = createInMemorySquadRepository(rows);
  const helper = new MatchSquadRulesHelper(
    squadRepo as any,
    {
      create: (input: any) => input,
      save: async (_input: any) => _input,
    } as any,
    {
      t: (key: string, lang: string, payload: Record<string, string>) => {
        if (key === 'match.timeline.substitution' || key === 'match.timeline.substitution.entersField') {
          return `${payload.teamName} substitution: ${payload.incomingPlayerName} replaces ${payload.outgoingPlayerName}.`;
        }
        if (key === 'match.timeline.captainChange') {
          return `${payload.teamName} captain: ${payload.playerName}.`;
        }
        if (key === 'match.timeline.injury') {
          return `${payload.playerName} injured.`;
        }
        return `${lang}:${key}`;
      },
    } as any,
  ) as any;

  helper.randomInt = () => 0;
  helper.chance = () => false;

  const match = {
    matchId: 'm1',
    turn: 6,
    minute: 30,
    teamId: 'arg',
    teamName: 'Argentina',
    opponentId: 'uru',
    opponentName: 'Uruguay',
    maxSubstitutions: 5,
    teamSubstitutionsUsed: 0,
    opponentSubstitutionsUsed: 0,
  } as any;

  await helper.applyFatigueAndSquadRules(match, {
    minute: 30,
    actingPlayerId: 'arg-cap',
    eventType: MatchEventType.BALL_POSSESSION_EVENT,
  });

  const afterFatigueFresh = rows.find((row) => row.playerId === 'arg-fresh');
  const afterFatigueLow = rows.find((row) => row.playerId === 'arg-low');
  assert.equal(afterFatigueFresh?.isOnField, true, 'Auto-sub should bring fresh player on field.');
  assert.equal(afterFatigueLow?.isOnField, false, 'Low-energy player should be subbed out.');

  const tacticalIncidents = await helper.applyTacticalSubstitutionsForTeam(match, {
    teamId: 'arg',
    teamName: 'Argentina',
    strategy: MatchStrategy.ATTACK,
    isUserTeam: true,
    minute: 30,
    eventType: MatchEventType.BALL_POSSESSION_EVENT,
    maxChanges: 2,
  });

  const afterTacticalFresh = rows.find((row) => row.playerId === 'arg-fresh');
  const afterTacticalLow = rows.find((row) => row.playerId === 'arg-low');
  assert.equal(
    afterTacticalFresh?.isOnField,
    true,
    'Player that entered this turn cannot be substituted out in the same turn.',
  );
  assert.equal(
    afterTacticalLow?.isOnField,
    false,
    'Player substituted out this turn cannot re-enter in the same turn.',
  );
  assert.equal(
    tacticalIncidents.some((incident: any) => incident.en.includes('replaces Fresh But Weak Mid')),
    false,
    'No tactical incident should substitute out the just-entered player in the same turn.',
  );

  console.log('OK - same-turn substitution guardrail passed.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
