import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import { MatchSquadRulesHelper } from '../../src/match/helper/match-squad-rules.helper';

async function run(): Promise<void> {
  const helper = Object.create(MatchSquadRulesHelper.prototype) as any;
  let capturedFindOptions: any = null;
  helper['matchSquadRepository'] = {
    find: async (options: any) => {
      capturedFindOptions = options;
      return [
        {
          playerId: 'p-1',
          playerName: 'On Field Player',
          position: 'MF',
          shirtNumber: 8,
          age: 27,
          skill: 80,
          attack: 82,
          defense: 75,
          energy: 74,
          isCaptain: false,
        },
      ];
    },
  };

  const players = await helper.getMatchOnFieldPlayers('match-1', 'arg');

  assert.equal(players.length, 1);
  assert.equal(players[0].name, 'On Field Player');
  assert.deepEqual(capturedFindOptions.where, {
    matchId: 'match-1',
    teamId: 'arg',
    isOnField: true,
    redCard: false,
    isInjured: false,
  });

  console.log('OK - squad rules on-field filter guardrail passed.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

