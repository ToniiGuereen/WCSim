// Prueba end-to-end del backend. Uso: node scripts/e2e.mjs [baseUrl]   (el servidor debe estar corriendo, ideal con WC_UPSTREAM=off)
const BASE = process.argv[2] || process.env.BASE_URL || 'http://localhost:3101';
let passed = 0;
const failures = [];

const check = (cond, msg) => {
  if (cond) passed++;
  else failures.push(msg);
};

async function call(method, path, body, raw) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : raw ? body : JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json, data: json && json.data !== undefined ? json.data : json };
}
const get = (p) => call('GET', p);
const post = (p, b) => call('POST', p, b);

async function expectStatus(label, p, status, method = 'GET', body, raw) {
  const r = await call(method, p, body, raw);
  check(r.status === status, `${label}: esperaba ${status}, recibió ${r.status} (${JSON.stringify(r.json)?.slice(0, 120)})`);
  if (status >= 400) check(r.json && r.json.success === false && typeof r.json.message === 'string', `${label}: error sin envelope {success:false,message}`);
  return r;
}

function validateTournament(m, groups, stats, tag) {
  const byStage = (s) => m.filter((x) => x.stage === s);
  check(m.length >= 103, `${tag}: partidos < 103 (${m.length})`);
  check(byStage('GROUPS').length === 72, `${tag}: grupos != 72`);
  check(byStage('ROUND_OF_32').length === 16, `${tag}: R32 != 16`);
  check(byStage('ROUND_OF_16').length === 8, `${tag}: R16 != 8`);
  check(byStage('QUARTER_FINALS').length === 4, `${tag}: QF != 4`);
  check(byStage('SEMI_FINALS').length === 2, `${tag}: SF != 2`);
  check(byStage('THIRD_PLACE').length === 1, `${tag}: 3er puesto != 1`);

  const ids = new Set();
  groups.forEach((g) => g.teams.forEach((t) => ids.add(t.teamId)));
  check(groups.length === 12 && groups.every((g) => g.teams.length === 4), `${tag}: estructura de grupos`);
  check(ids.size === 48, `${tag}: equipos únicos != 48 (${ids.size})`);
  groups.forEach((g) => {
    g.teams.forEach((t) => {
      check(t.played === 3 && t.wins + t.draws + t.losses === 3, `${tag}: PJ/PG/PE/PP grupo ${g.groupName} ${t.teamId}`);
      check(t.points === t.wins * 3 + t.draws, `${tag}: puntos ${t.teamId}`);
      check(t.goalDifference === t.goalsFor - t.goalsAgainst, `${tag}: DG ${t.teamId}`);
    });
    const sorted = g.teams.every((t, i) => i === 0 || g.teams[i - 1].points >= t.points);
    check(sorted, `${tag}: grupo ${g.groupName} sin ordenar por puntos`);
    const gf = g.teams.reduce((s, t) => s + t.goalsFor, 0);
    const ga = g.teams.reduce((s, t) => s + t.goalsAgainst, 0);
    check(gf === ga, `${tag}: GF != GA en grupo ${g.groupName}`);
  });

  m.filter((x) => x.stage !== 'GROUPS').forEach((x) => {
    check(x.homeTeamId !== x.awayTeamId, `${tag}: ${x.matchCode} equipo contra sí mismo`);
    check(!!x.winnerTeamName, `${tag}: ${x.matchCode} eliminatoria sin ganador`);
    if (x.homeScore === x.awayScore) check(!!x.penaltyLabel, `${tag}: ${x.matchCode} empate sin penales`);
  });
  const finalists = new Set();
  byStage('SEMI_FINALS').forEach((x) => { finalists.add(x.homeTeamId); finalists.add(x.awayTeamId); });
  check(finalists.size === 4, `${tag}: semifinalistas distintos != 4`);

  const goalsFromMatches = m.reduce((s, x) => s + x.homeScore + x.awayScore, 0);
  check(stats.totalGoals === goalsFromMatches, `${tag}: totalGoals ${stats.totalGoals} != suma de partidos ${goalsFromMatches}`);
  check(stats.totalMatches === m.length, `${tag}: totalMatches`);
  check(stats.topScorers.length > 0 && stats.topScorers.every((s, i) => i === 0 || stats.topScorers[i - 1].value >= s.value), `${tag}: goleadores mal ordenados`);
  check(stats.awards.length === 5, `${tag}: premios != 5 (${stats.awards.length})`);
}

async function main() {
  // ── validaciones y estado inicial
  await expectStatus('lang inválido', '/api/world-cup/groups?lang=xx', 400);
  await expectStatus('teamId inexistente', '/api/my-team/players?teamId=zzz', 404);
  await expectStatus('stage inválido', '/api/world-cup/matches?stage=NOPE', 400);
  await expectStatus('estrategia inválida', '/api/my-team/coaching/strategy', 400, 'POST', { strategy: 'LOCA' });
  await expectStatus('formación inválida', '/api/my-team/coaching/formation', 400, 'POST', { formation: '9-9-9' });
  await expectStatus('JSON inválido', '/api/final-match/play', 400, 'POST', '{no-json', true);
  await expectStatus('opción inválida', '/api/final-match/play', 400, 'POST', { selectedOption: 9 });
  await expectStatus('final sin iniciar (team-state)', '/api/final-match/team-state', 409);
  await expectStatus('final sin simular (start)', '/api/final-match/start', 409, 'POST');
  const empty = await get('/api/final-match/eventos-geniales-api');
  check(empty.status === 200 && Array.isArray(empty.data) && empty.data.length === 0, 'eventos vacíos antes de iniciar');

  const cfg = await get('/api/admin/config');
  check(cfg.status === 200 && cfg.data.teamId && cfg.data.lang, 'admin/config');
  let cur = await get('/api/world-cup/current?lang=es');
  check(cur.data.status === 'PENDING', `estado inicial PENDING (fue ${cur.data.status})`);

  // ── mi equipo
  for (const team of ['arg', 'bra', 'esp', 'nzl']) {
    const pl = await get(`/api/my-team/players?teamId=${team}&lang=es`);
    check(pl.status === 200 && pl.data.length === 18, `${team}: plantel de 18`);
    check(pl.data.filter((p) => p.isOnField).length === 11, `${team}: 11 titulares`);
    check(pl.data.filter((p) => p.isCaptain).length === 1, `${team}: un capitán`);
    check(pl.data.filter((p) => p.isOnField && p.position === 'GK').length === 1, `${team}: un arquero titular`);
    check(new Set(pl.data.map((p) => p.shirtNumber)).size === 18, `${team}: dorsales únicos`);
    const co = await get(`/api/my-team/coaching?teamId=${team}&lang=en`);
    check(co.status === 200 && co.data.availableStrategies.length === 4 && co.data.availableFormations.length === 4 && co.data.metrics.length === 4, `${team}: coaching`);
    const hi = await get(`/api/my-team/history?teamId=${team}&lang=es`);
    check(hi.status === 200 && Array.isArray(hi.data.sections), `${team}: historial`);
    const ri = await get(`/api/my-team/rivals?teamId=${team}&lang=es`);
    check(ri.status === 200 && ri.data.length === 6 && ri.data.every((r) => r.teamId !== team), `${team}: 6 rivales sin incluirse`);
  }
  const argHist = await get('/api/my-team/history?teamId=arg&lang=es');
  check(argHist.data.sections[0].count === 3 && argHist.data.totalTitles === 24, `Argentina: 3 mundiales / 24 títulos (fue ${argHist.data.totalTitles})`);

  await get('/api/my-team/players?teamId=arg&lang=es'); // fija equipo activo
  const s1 = await post('/api/my-team/coaching/strategy', { strategy: 'ofensivo' });
  check(s1.status === 200 && s1.data.currentStrategy === 'OFENSIVO', 'cambiar estrategia');
  const f1 = await post('/api/my-team/coaching/formation', { formation: '4-4-2' });
  check(f1.status === 200 && f1.data.currentFormation === '4-4-2', 'cambiar formación');
  const co2 = await get('/api/my-team/coaching?teamId=arg&lang=es');
  check(co2.data.currentStrategy === 'OFENSIVO' && co2.data.currentFormation === '4-4-2', 'táctica persiste');
  const pl442 = await get('/api/my-team/players?teamId=arg&lang=es');
  check(pl442.data.filter((p) => p.isOnField && p.position === 'DF').length === 4 && pl442.data.filter((p) => p.isOnField && p.position === 'FW').length === 2, '4-4-2 refleja 4 DF y 2 FW titulares');
  await post('/api/my-team/coaching/strategy', { strategy: 'EQUILIBRADO' });
  await post('/api/my-team/coaching/formation', { formation: '4-3-3' });

  // ── selección de selección (top 10 históricas)
  const LEGENDS = ['bra', 'ger', 'ita', 'arg', 'fra', 'uru', 'esp', 'eng', 'ned', 'por'];
  const sel = await get('/api/my-team/select?lang=es');
  check(sel.status === 200 && sel.data.teams.length === 10 && sel.data.teams.map((t) => t.teamId).join() === LEGENDS.join(), 'select: 10 selecciones históricas en orden');
  check(sel.data.teams.every((t) => t.name && t.flag && t.tagline && t.rank >= 1), 'select: datos completos');
  check(sel.data.teams.filter((t) => t.selected).length === 1, 'select: exactamente 1 seleccionada');
  await expectStatus('select: equipo fuera del top 10', '/api/my-team/select', 400, 'POST', { teamId: 'nzl' });
  await expectStatus('select: equipo inexistente', '/api/my-team/select', 404, 'POST', { teamId: 'zzz' });
  await expectStatus('select: sin teamId', '/api/my-team/select', 400, 'POST', {});
  const pick = await post('/api/my-team/select', { teamId: 'BRA', lang: 'en' });
  check(pick.status === 200 && pick.data.myTeamId === 'bra' && pick.data.teams.find((t) => t.selected).teamId === 'bra', 'select: elegir Brasil');
  check((await get('/api/admin/config')).data.teamId === 'bra', 'select: admin/config refleja la selección');
  check((await get('/api/world-cup/current?lang=es')).data.status === 'PENDING', 'select: cambiar de selección deja el torneo sin simular');

  // ── simulación completa, varias veces (hasta ver varias finales jugadas y varias como espectador)
  const RUNS = Number(process.env.RUNS || 12);
  const champions = new Set();
  let finalsPlayed = 0;
  let spectated = 0;
  const outcomes = new Set();
  for (let run = 1; run <= 600 && (finalsPlayed < RUNS || spectated < RUNS); run++) {
    const me = LEGENDS[run % LEGENDS.length];
    await post('/api/my-team/select', { teamId: me });
    const sim = await post('/api/world-cup/simulate?lang=es');
    const inFinal = sim.data.userInFinal === true;
    check(sim.status === 200 && sim.data.myTeamId === me, `run ${run}: simulate con ${me}`);
    check(inFinal === [sim.data.finalHomeTeam.teamId, sim.data.finalAwayTeam.teamId].includes(me), `run ${run}: userInFinal coherente con finalistas`);
    check(sim.data.status === (inFinal ? 'READY_FOR_FINAL' : 'ENDED'), `run ${run}: estado ${sim.data.status} (userInFinal=${inFinal})`);
    check(typeof sim.data.message === 'string' && sim.data.message.length > 10, `run ${run}: mensaje de campaña`);
    outcomes.add(sim.data.userOutcome);
    const [groups, matches, stats] = await Promise.all([
      get('/api/world-cup/groups?lang=es'),
      get('/api/world-cup/matches?lang=es'),
      get('/api/world-cup/stats-awards?lang=es'),
    ]);
    validateTournament(matches.data, groups.data, stats.data, `run ${run}`, inFinal);
    const jr = await get(`/api/world-cup/journey?teamId=${me}&lang=es`);
    check(jr.data.matchesPlayed >= 3 && jr.data.matches.length === jr.data.matchesPlayed, `run ${run}: journey`);
    const fh = sim.data.finalHomeTeam;
    const fa = sim.data.finalAwayTeam;
    check(fh.teamId && fa.teamId && fh.teamId !== fa.teamId, `run ${run}: finalistas válidos`);

    if (!inFinal) {
      // ── espectador: la final se juega sola y NO se puede jugar
      spectated++;
      check(['ELIMINATED', 'THIRD', 'FOURTH'].includes(sim.data.userOutcome), `run ${run}: resultado de campaña sin final (${sim.data.userOutcome})`);
      check(!!sim.data.champion && [fh.teamId, fa.teamId].includes(sim.data.champion.teamId), `run ${run}: campeón entre los finalistas`);
      const st = await post('/api/final-match/start');
      check(st.status === 409 && /no llegó|eliminado|cuarto|tercer/i.test(st.json?.message || ''), `run ${run}: start final => 409 explicativo (${st.status} ${st.json?.message})`);
      await expectStatus(`run ${run}: play sin final`, '/api/final-match/play', 409, 'POST', { selectedOption: 1 });
      await expectStatus(`run ${run}: team-state sin final`, '/api/final-match/team-state', 409);
      const fin = (await get('/api/world-cup/matches?stage=FINAL&lang=es')).data;
      check(fin.length === 1 && fin[0].winnerTeamName && ![fin[0].homeTeamId, fin[0].awayTeamId].includes(me), `run ${run}: final auto-jugada sin mi equipo`);
      check((await get('/api/world-cup/matches?lang=es')).data.length === 104, `run ${run}: 104 partidos`);
      const stats2 = await get('/api/world-cup/stats-awards?lang=es');
      check(stats2.data.totalMatches === 104 && stats2.data.podium.length === 3 && stats2.data.podium[0].teamName === fin[0].winnerTeamName, `run ${run}: podio == ganador de la final auto-jugada`);
      const hs = await get('/api/world-cup/history?lang=es');
      check(hs.data.length === 3 && hs.data[0].champion.teamName === fin[0].winnerTeamName, `run ${run}: historial incluye 2026`);
      if (sim.data.userOutcome === 'ELIMINATED') {
        const last = jr.data.matches[jr.data.matches.length - 1];
        check(/Eliminado|Eliminated/i.test(jr.data.stageReachedLabel), `run ${run}: journey marca eliminación`);
        check(!!last, `run ${run}: journey con partidos`);
      }
      champions.add(fin[0].winnerTeamName);
      // cambiar de selección después de simular reinicia
      if (spectated === 1) {
        await post('/api/my-team/select', { teamId: me === 'bra' ? 'ger' : 'bra' });
        check((await get('/api/world-cup/current?lang=es')).data.status === 'PENDING', 'cambio de selección post-simulación reinicia torneo');
        check((await get('/api/world-cup/matches?lang=es')).data.length === 0, 'cambio de selección: sin partidos');
      }
      continue;
    }

    // ── mi selección llegó: se juega la Gran Final por turnos
    finalsPlayed++;
    const hs0 = await get('/api/world-cup/history?lang=es');
    check(hs0.data.length === 2, `run ${run}: sin final, historial = solo ediciones pasadas`);
    const start = await post('/api/final-match/start');
    check(start.status === 200 && start.data.options.length === 4 && start.data.isFinished === false, `run ${run}: start final`);
    const ts0 = await get('/api/final-match/team-state');
    check(ts0.status === 200 && ts0.data.team.onField.length === 11 && ts0.data.opponent.onField.length === 11, `run ${run}: 11 vs 11`);
    if (finalsPlayed === 1) {
      const st = await post('/api/final-match/strategy', { strategy: 'DEFENSIVO' });
      check(st.status === 200 && st.data.messageItems.some((m) => /DEFENSIVO/.test(m.text)), 'cambio de estrategia en la final');
      const fo = await post('/api/final-match/formation', { formation: '3-5-2' });
      check(fo.status === 200, 'cambio de formación en la final');
      const ts = await get('/api/final-match/team-state');
      check(ts.data.team.formation === '3-5-2' && ts.data.team.strategy === 'DEFENSIVO' && ts.data.team.onField.length === 11, 'team-state refleja tácticas');
    }
    let state = start.data;
    let turns = 0;
    let lastMinute = state.minute;
    while (!state.isFinished && turns < 200) {
      const opt = 1 + Math.floor(Math.random() * 4);
      const r = await post('/api/final-match/play', { selectedOption: opt });
      check(r.status === 200, `run ${run}: play turno ${turns} (${r.status})`);
      if (r.status !== 200) break;
      check(r.data.minute >= lastMinute && r.data.minute <= 120, `run ${run}: minuto monótono ${lastMinute}->${r.data.minute}`);
      lastMinute = r.data.minute;
      check(!r.data.isFinished ? r.data.options.length === 4 : r.data.options.length === 0, `run ${run}: opciones coherentes`);
      state = r.data;
      turns++;
    }
    check(state.isFinished && !!state.result, `run ${run}: la final termina (${turns} turnos)`);
    await expectStatus('jugar tras terminar', '/api/final-match/play', 409, 'POST', { selectedOption: 1 });

    const after = await get('/api/world-cup/matches?stage=FINAL&lang=es');
    check(after.data.length === 1, `run ${run}: final registrada en el torneo`);
    const fin = after.data[0];
    check(!!fin.winnerTeamName && [fin.homeTeamId, fin.awayTeamId].includes(fh.teamId) && [fin.homeTeamId, fin.awayTeamId].includes(fa.teamId), `run ${run}: final entre los finalistas`);
    check([fin.homeTeamId, fin.awayTeamId].includes(me), `run ${run}: mi selección jugó la final`);
    const nums = state.score.match(/(\d+) - (\d+)/);
    check(nums && Number(nums[1]) === fin.homeScore && Number(nums[2]) === fin.awayScore, `run ${run}: marcador del chat == partido registrado (${state.score} vs ${fin.homeScore}-${fin.awayScore})`);
    const goalsEvents = (await get('/api/final-match/eventos-geniales-api')).data.filter((e) => e.tipo === 'GOL').length;
    check(goalsEvents === fin.homeScore + fin.awayScore, `run ${run}: eventos GOL (${goalsEvents}) == goles de la final`);

    const stats2 = await get('/api/world-cup/stats-awards?lang=es');
    check(stats2.data.totalMatches === 104 && stats2.data.podium.length === 3, `run ${run}: 104 partidos y podio de 3`);
    const goals2 = (await get('/api/world-cup/matches?lang=es')).data.reduce((s, x) => s + x.homeScore + x.awayScore, 0);
    check(stats2.data.totalGoals === goals2, `run ${run}: goles totales consistentes con la final`);
    check(stats2.data.podium[0].teamName === fin.winnerTeamName, `run ${run}: campeón del podio == ganador de la final`);
    champions.add(fin.winnerTeamName);
    const hs2 = await get('/api/world-cup/history?lang=es');
    check(hs2.data.length === 3 && hs2.data[0].year === 2026 && hs2.data[0].champion.teamName === fin.winnerTeamName, `run ${run}: historial incluye Mundial 2026 con el campeón`);
    cur = await get('/api/world-cup/current?lang=es');
    check(cur.data.status === 'ENDED' && ['CHAMPION', 'RUNNER_UP'].includes(cur.data.userOutcome), `run ${run}: estado ENDED y resultado ${cur.data.userOutcome}`);
    outcomes.add(cur.data.userOutcome);

    // reiniciar la final no duplica el partido
    if (finalsPlayed === 2) {
      const again = await post('/api/final-match/start');
      check(again.status === 200 && !again.data.isFinished, 'reiniciar final');
      check((await get('/api/world-cup/matches?stage=FINAL&lang=es')).data.length === 0, 'al reiniciar se limpia la final previa');
      cur = await get('/api/world-cup/current?lang=es');
      check(cur.data.status === 'FINAL_ACTIVE', 'estado FINAL_ACTIVE');
    }
  }
  check(finalsPlayed >= RUNS && spectated >= RUNS, `cobertura: ${finalsPlayed} finales jugadas, ${spectated} como espectador`);
  console.log(`Finales jugadas: ${finalsPlayed} | como espectador: ${spectated} | resultados: ${[...outcomes].join(', ')}`);
  check(champions.size >= 2, `varios campeones distintos en ${RUNS} torneos (${[...champions].join(', ')})`);

  // ── idioma inglés
  const en = await get('/api/world-cup/groups?lang=en');
  check(en.data.some((g) => g.teams.some((t) => t.teamName === 'Spain')), 'lang=en traduce selecciones');
  const hen = await get('/api/world-cup/history?lang=en');
  check(hen.data[hen.data.length - 1].champion.teamName === 'France' || hen.data[hen.data.length - 1].editionLabel.includes('World Cup'), 'historial en inglés');

  console.log(`\n${passed} checks OK, ${failures.length} fallas`);
  if (failures.length) {
    const unique = [...new Set(failures)];
    unique.slice(0, 40).forEach((f) => console.log(' ✗', f));
    process.exit(1);
  }
  console.log('Distintos campeones en la muestra:', [...champions].join(', '));
}

main().catch((e) => {
  console.error('Error fatal en la prueba:', e);
  process.exit(1);
});
