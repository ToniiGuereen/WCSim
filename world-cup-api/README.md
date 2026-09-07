# TP - World Cup API

## Overview
`world-cup-api` is the external API used by the TP.

It provides:
- Team catalogs and tactical configuration.
- World Cup simulation lifecycle (`READY_FOR_FINAL`, `FINAL_ACTIVE`, `ENDED`).
- Stateful final match engine (turn-based).
- Match telemetry (timeline, stats, squads, lineups).
- Educational dictionaries for football/game terms.

Important:
- Students should consume this API from their backend (BFF), not directly from the final frontend.
- Default base URL is `http://localhost:5101/worldCup`.

---

## Modules 
- `health`
- `teams`
- `world-cup`
- `match`
- `reference`

---

## Quick Start
1. Install dependencies:
```bash
npm install
```

2. Create local env file:
```bash
cp .env.example .env
```

3. Run API:
```bash
npm run start:dev
```

Notes:
- `start`, `start:dev`, `start:debug`, and `start:prod` run `db:seed` automatically before boot.
- If you want to seed manually:
```bash
npm run db:seed
```

4. Open Swagger:
- `http://localhost:5101/worldCup/api`

---

## Runtime Scripts
- `npm run build`
- `npm run start:dev`
- `npm run start:debug`
- `npm run start:prod`
- `npm run smoke:test`

Match/engine test scripts:
- `npm run test:action-transition`
- `npm run test:duel`
- `npm run test:match-options-matrix`
- `npm run test:turn-coherence`
- `npm run test:turn-flow-state-alignment`
- `npm run test:turn-context-persistence`
- `npm run test:turn-outcome-guardrails`
- `npm run test:last-play-penalty-goalkeeper`
- `npm run test:recovery-role-coherence`
- `npm run test:zone-receiver-coherence`

Mass simulation utility:
```bash
node scripts/tests/run-random-finals.mjs 100
```
- Optional env: `WC_API_BASE` (default `http://127.0.0.1:5101/worldCup`)
- Reports are written to `scripts/tests/reports/`

---

## API Base Path and Swagger
Global prefix comes from `APP_BASE_PATH` (default: `worldCup`).

So routes are exposed as:
- `/{APP_BASE_PATH}/health`
- `/{APP_BASE_PATH}/teams/...`
- `/{APP_BASE_PATH}/world-cup/...`
- `/{APP_BASE_PATH}/match/...`
- `/{APP_BASE_PATH}/reference/...`

Swagger:
- `/{APP_BASE_PATH}/api`

---

## Response Envelope and Errors
All controllers return the same envelope (`ResponseObject<T>`):

```json
{
  "serverTime": "2026-05-05T12:00:00.000Z",
  "success": true,
  "responseMessage": {
    "messageCode": "0000",
    "message": "OK"
  },
  "data": {}
}
```

Errors are normalized by `AllExceptionsFilter` and follow the same envelope with `success=false`.

---

## Environment Variables

### App / Swagger
| Variable | Default | Description |
|---|---|---|
| `APP_PORT` | `5101` | HTTP port |
| `APP_BASE_PATH` | `worldCup` | Global route prefix |
| `APP_LOG_LEVEL` | `log` | `error`, `warn`, `log`, `debug`, `verbose` |
| `CORS_ALLOWED_ORIGIN` | `http://localhost:5300` | Allowed frontend origin |
| `SWAGGER_APP_TITLE` | `World Cup API` | Swagger title |
| `SWAGGER_APP_DESCRIPTION` | `World Cup API for Programacion III TP` | Swagger description |
| `SWAGGER_APP_VERSION` | `1.0.0` | Swagger version label |
| `SWAGGER_THEME` | `dark` | Swagger theme (`classic`, `dark`) |

### Database / World Cup
| Variable | Default | Description |
|---|---|---|
| `DB_TYPE` | `sqlite` | Only `sqlite` is supported |
| `DB_DATABASE` | `./database/world_cup_api.db` | SQLite file path |
| `WORLD_CUP_EDITION` | `2026` | Edition label returned by world cup simulation |

### Match Engine (runtime tuning)
| Variable | Default | Description |
|---|---|---|
| `MAX_TURNS_PER_MATCH` | `10` (example) | Engine normalizes to an even number and enforces minimum floor (`>=5`, odd values are rounded up) |
| `MAX_MESSAGES_PER_TURN` | `15` | Clamped between `2` and `20` |
| `MAX_MATCH_SUBSTITUTIONS_PER_TEAM` | `5` | Max substitutions per team |
| `AUTO_ADJUST_FORMATION_ON_STRATEGY_CHANGE` | `true` | Auto-adjust formation if incompatible after strategy change |
| `OPPONENT_TACTICS_ONLY_SECOND_HALF_ENABLED` | `true` | Opponent AI switches tactics only after halftime |
| `OPPONENT_TACTICS_COOLDOWN_TURNS` | `1` | Cooldown turns between AI tactical changes |
| `OPPONENT_MAX_STRATEGY_CHANGES_PER_MATCH` | `5` | Max AI strategy switches per match |
| `COACH_FORMATION_STYLE_STRICTNESS` | `6` | Coach style influence (`0..10`) when selecting compatible formations |

---

### `start-final` behavior
- If there is already an active final, the endpoint returns that match (after syncing tactical state).
- If no active final exists:
  - It uses the pending finalists from the current world cup (`READY_FOR_FINAL`), or
  - Auto-simulates a new world cup when current tournament is missing/ended and `teamId` is provided.
- If `teamId` is provided, it must be one of the two finalists.
- If world cup is `FINAL_ACTIVE`, re-simulation is blocked until final is closed.

---

## Smoke / Stability
- Local smoke e2e:
```bash
npm run smoke:test
```
- Engine consistency checks are available under `scripts/tests/*.spec.ts`.
