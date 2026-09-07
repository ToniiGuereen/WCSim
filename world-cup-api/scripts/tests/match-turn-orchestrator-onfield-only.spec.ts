import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import { MatchTurnOrchestratorHelper } from '../../src/match/helper/match-turn-orchestrator.helper';
import { MatchAction } from '../../src/match/model/match-action.enum';
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
  let capturedPlayers: any[] | null = null;
  let pickCalls = 0;
  const selectionHelper = {
    pickPlayerForAction: (players: any[]) => {
      pickCalls += 1;
      capturedPlayers = players;
      return players[0];
    },
  } as any;

  const helper = new MatchTurnOrchestratorHelper(selectionHelper);
  const match = {
    teamId: 'arg',
    teamName: 'Argentina',
    minute: 1,
    turn: 1,
    maxTurns: 10,
    scoreTeam: 0,
    scoreOpponent: 0,
    ballCarrierName: 'Lionel Messi',
  } as any;

  {
    const onFieldUserPlayers = [player('u-1', 'OnField A')];
    const baseUserPlayers = [player('u-2', 'Bench/Legacy B')];
    helper.buildTurnAdvance({
      match,
      selectedAction: MatchAction.PASS,
      rawEventType: MatchEventType.BALL_POSSESSION_EVENT,
      possession: MatchPossession.USER,
      zone: MatchFieldZone.MIDFIELD,
      userPlayers: onFieldUserPlayers,
      baseUserPlayers,
      opponentPlayers: [player('o-1', 'Opponent One')],
      baseOpponentPlayers: [player('o-2', 'Opponent Base')],
    });

    assert.equal(pickCalls, 1);
    assert.equal(capturedPlayers, onFieldUserPlayers, 'Selection must use on-field roster only.');
  }

  {
    capturedPlayers = null;
    pickCalls = 0;
    const result = helper.buildTurnAdvance({
      match,
      selectedAction: MatchAction.PASS,
      rawEventType: MatchEventType.BALL_POSSESSION_EVENT,
      possession: MatchPossession.USER,
      zone: MatchFieldZone.MIDFIELD,
      userPlayers: [],
      baseUserPlayers: [player('u-2', 'Bench/Legacy B')],
      opponentPlayers: [player('o-1', 'Opponent One')],
      baseOpponentPlayers: [player('o-2', 'Opponent Base')],
    });

    assert.equal(pickCalls, 0, 'When no on-field players are available, it must not pick from base roster.');
    assert.equal(
      result.turnContext.actingPlayer.name,
      'Lionel Messi',
      'Fallback acting player should be a neutral placeholder based on current carrier name.',
    );
  }

  console.log('OK - turn orchestrator on-field-only guardrails passed.');
}

run();

