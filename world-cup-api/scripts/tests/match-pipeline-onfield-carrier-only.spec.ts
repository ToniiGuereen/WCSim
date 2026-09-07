import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import { MatchPlayTurnPipelineHelper } from '../../src/match/helper/match-play-turn-pipeline.helper';
import { MatchAction } from '../../src/match/model/match-action.enum';
import { MatchActionOutcome } from '../../src/match/model/match-action-outcome.enum';
import { MatchEventType } from '../../src/match/model/match-event-type.enum';
import { MatchFieldZone } from '../../src/match/model/match-field-zone.enum';
import { MatchPossession } from '../../src/match/model/match-possession.enum';

function player(id: string, name: string) {
  return {
    playerId: id,
    name,
    position: 'MF',
    shirtNumber: 8,
    age: 27,
    skill: 80,
    attack: 82,
    defense: 75,
    energy: 74,
    isCaptain: false,
  };
}

function run(): void {
  const helper = Object.create(MatchPlayTurnPipelineHelper.prototype) as any;
  helper['pickPlayerForAction'] = (players: any[]) => players[0];

  const match = {
    teamId: 'arg',
    opponentId: 'bra',
    possessionTeam: MatchPossession.USER,
    currentZone: MatchFieldZone.MIDFIELD,
    eventType: MatchEventType.BALL_POSSESSION_EVENT,
    ballCarrierTeamId: 'arg',
    ballCarrierName: 'Lionel Messi',
  } as any;

  helper['applyOutcomeTransition']({
    match,
    turnOutcome: {
      actionOutcome: MatchActionOutcome.PASS_SUCCESS_PROGRESS,
      nextPossession: MatchPossession.USER,
      nextZone: MatchFieldZone.ATTACK_THIRD,
      nextEventType: MatchEventType.BALL_POSSESSION_EVENT,
      ballCarrierTeamId: 'arg',
      ballCarrierName: 'Lionel Messi',
      actingPlayer: player('base-messi', 'Lionel Messi'),
      isGoal: false,
      card: null,
      incidents: [],
      messagePayload: {},
    },
    userPlayers: [player('u-1', 'OnField Carrier')],
    baseUserPlayers: [player('base-messi', 'Lionel Messi')],
    opponentPlayers: [player('o-1', 'Opponent One')],
    baseOpponentPlayers: [player('o-2', 'Opponent Base')],
  });

  assert.equal(match.ballCarrierTeamId, 'arg');
  assert.equal(
    match.ballCarrierName,
    'OnField Carrier',
    'Pipeline transition must resolve carrier only from current on-field roster.',
  );

  console.log('OK - pipeline on-field carrier only guardrail passed.');
}

run();

