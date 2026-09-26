#!/usr/bin/env node
// Partida automatizada de QA: recorre la historia completa (niveles 0-9 + epílogo) con un «bot»
// que responde diálogos y desafíos, visita disparadores, usa interactivos, resuelve puzles
// de bloques/enlaces y llega a cada salida. Informa errores, bloqueos y el estado final.
// Uso: node tools/playtest.js [nivel_inicial] [nivel_final] [dir_capturas]
'use strict';
const path = require('path');
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require('/opt/node22/lib/node_modules/playwright'); }
const file = 'file://' + path.resolve(__dirname, '..', 'byte_architect_quest.html');
const from = +(process.argv[2] || 0), to = +(process.argv[3] || 9);
const shots = process.argv[4];

(async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const logs = [];
  page.on('pageerror', e => logs.push('pageerror: ' + e.message + '\n' + e.stack));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
  await page.goto(file);
  await page.waitForTimeout(500);
  await page.evaluate(({ from }) => {
    const BOT = window.BOT = { dq: [], pq: [], log: [], speed: 4, seenStates: {}, auto: true };
    const origUpdate = Game.update.bind(Game);
    Game.update = function (dt) { for (let k = 0; k < BOT.speed; k++) { try { botStep(); } catch (e) { console.error('BOT ' + e.message + ' ' + e.stack); } origUpdate(dt); } };
    function botStep() {
      if (!BOT.auto) return;
      const st = Game.top(); if (!st) return;
      const n = st.constructor.name;
      BOT.seenStates[n] = (BOT.seenStates[n] || 0) + 1;
      if (n === 'DialogueState') {
        st.pause = 0; st.chars = st.full;
        if (st.L.ch) { st.choiceSel = BOT.dq.length ? BOT.dq.shift() : 0; BOT.log.push('dlg-choice ' + st.choiceSel + ': ' + st.L.ch[st.choiceSel]); st.choose(); }
        else if (st.L.auto == null) st.next();
      } else if (n === 'ChoicePromptState') {
        const i = BOT.pq.length ? BOT.pq.shift() : 0; BOT.log.push('prompt ' + i + ': ' + st.title); st.done(i);
      } else if (n === 'ChallengeState') {
        if (st.phase === 'play' || st.phase === 'conf') { BOT.log.push('challenge ' + st.ch.id); st.resultOk = true; st.xpGained = 6; st.record(true); st.phase = 'result'; st.afterResult(); }
      } else if (n === 'ReaderState') { Game.pop(); if (st.o.onDone) st.o.onDone(); }
      else if (['BlueprintState', 'CodexState', 'QuestLogState', 'MemoriesState', 'ProgressState'].includes(n)) { st.__botT = (st.__botT || 0) + 1; if (st.__botT > 30) { BOT.log.push('cerrar ' + n); Game.pop(); } }
      else if (n === 'LevelCompleteState') { if (st.t > 0.3) { BOT.log.push('LEVEL COMPLETE ' + st.W.index); BOT.completed = st.W.index; const next = st.W.def.next != null ? st.W.def.next : st.W.index + 1; Game.pop(); Game.loadLevel(next); } }
    }
    const oi = Block.prototype.interact; Block.prototype.interact = function (W) { if (BOT.traceBlocks) console.warn('Block.interact ' + this.id + ' ' + new Error().stack.split('\n').slice(2, 5).join(' <- ')); return oi.call(this, W); };
    BOT.traceBlocks = false;
    BOT.W = () => Game.world;
    BOT.idle = () => { const W = Game.world, st = Game.top(); return !!W && st instanceof GameplayState && !W.scripts.busy && W.lockCount === 0 && !W.player.dead; };
    BOT.tp = (x, y) => { const p = Game.world.player; p.x = x; p.y = y; p.vx = 0; p.vy = 0; p.climbing = false; p.dashT = 0; };
    BOT.tpEnt = (e) => { BOT.tp(e.x + e.w / 2 - 5, e.y + e.h - 15); };
    BOT.bid = 0;
    BOT.ents = () => Game.world.entities.map((e) => ({ i: e.__bid || (e.__bid = ++BOT.bid), id: e.id || null, n: e.constructor.name, kind: e.kind, x: e.x, y: e.y, w: e.w, h: e.h, inter: !!e.interactive, dead: !!e.dead }));
    // arranque de partida nueva real (no modo docente)
    PROG = newProgress();
    if (from > 0) { const pre = LEVEL_PRESETS[from] || {}; PROG.abilities = (pre.abilities || []).slice(); PROG.selAbility = Math.max(0, PROG.abilities.length - 1); Object.assign(PROG.flags, pre.flags || {}); PROG.blueprint = (pre.bp || ['cpu']).slice(); PROG.bpTabs = (pre.tabs || ['hw']).slice(); PROG.xp = pre.xp || 0; PROG.playerLevel = Progression.levelFor(PROG.xp); }
    Game.stack.length = 0;
    Game.loadLevel(from);
  }, { from });

  const waitIdle = async (ms = 12000) => {
    try { await page.waitForFunction(() => window.BOT.idle(), null, { timeout: ms, polling: 50 }); return true; }
    catch (e) {
      const info = await page.evaluate(() => { const W = Game.world; return { top: Game.top() && Game.top().constructor.name, scripts: W ? W.scripts.threads.filter(t => !t.done).map(t => t.name) : null, lock: W && W.lockCount, dead: W && W.player.dead }; });
      console.log('   ! timeout esperando inactividad', JSON.stringify(info));
      return false;
    }
  };
  const act = async (fnSrc, arg) => { await page.evaluate(new Function('arg', fnSrc), arg); await page.waitForTimeout(120); await waitIdle(); };
  const shot = async (name) => { if (shots) await page.screenshot({ path: path.join(shots, name + '.png') }); };

  for (let lv = from; lv <= to; lv++) {
    await page.waitForFunction((lv) => Game.world && Game.world.index === lv && Game.top() instanceof GameplayState || (Game.top() && Game.top().constructor.name === 'DialogueState'), lv, { timeout: 20000 }).catch(() => {});
    await waitIdle(30000);
    const t0 = Date.now();
    const info = await page.evaluate(() => ({ idx: Game.world.index, name: Game.world.def.name, w: Game.world.w, h: Game.world.h }));
    console.log(`\n=== NIVEL ${info.idx}: ${info.name} (${info.w}x${info.h})`);
    await shot('lv' + lv + '_start');
    const solver = SOLVERS[lv];
    // pasadas genéricas
    for (let pass = 0; pass < 3; pass++) {
      const ents = await page.evaluate(() => BOT.ents());
      const order = ents.filter(e => !e.dead && (e.kind === 'trigger' || e.inter || ['socket', 'linknode', 'busnode', 'lever', 'block', 'fragment', 'letter', 'historic', 'checkpoint'].includes(e.kind)))
        .sort((a, b) => (info.h > 40 ? b.y - a.y : a.x - b.x));
      for (const e of order) {
        if (e.n === 'Exit' || e.n === 'Block' || e.n === 'Socket' || e.n === 'Lever' || e.n === 'Plate') continue;
        if (solver && solver.skip && solver.skip(e)) continue;
        await act(`
          const e = Game.world.entities.find(x => x.__bid === arg.i); if (!e || e.dead) return;
          const W = Game.world;
          if (e.kind === 'trigger') { BOT.tp(e.x + e.w / 2 - 5, e.y + e.h - 15); return; }
          BOT.tpEnt(e);
          if (e.kind === 'linknode') { const k = (e.p.links || []).findIndex(l => l.ok); if (k < 0 || e.linked) return; BOT.pq.push(k); W.run(function* (W) { yield* e.linkPrompt(W); }, 'botlink'); return; }
          if (e.kind === 'busnode') { const ds = (e.p.dests || []); const k = ds.findIndex(d => !d.wrongDest && !(d.flag && W.has(d.flag))); if (k < 0) return; BOT.pq.push(k, ds[k].bus); W.run(function* (W) { yield* e.bridgePrompt(W); }, 'botbridge'); return; }
          if (e.interactive && (!e.canInteract || e.canInteract(W))) e.interact(W);
        `, { i: e.i });
        await page.waitForTimeout(40);
      }
      if (solver && solver.run) await solver.run(page, act, pass);
      const done = await page.evaluate(() => { const ex = Game.world.entities.find(e => e.constructor.name === 'Exit'); return !ex || !ex.p.needs || Game.world.has(ex.p.needs); });
      if (done) break;
    }
    await shot('lv' + lv + '_end');
    // salida
    const exitRes = await page.evaluate(() => {
      const W = Game.world; const ex = W.entities.find(e => e.constructor.name === 'Exit');
      if (!ex) return { noExit: true };
      const need = ex.p.needs; const ok = !need || W.has(need);
      BOT.tpEnt(ex);
      return { need, ok, flags: Object.keys(PROG.flags).filter(k => k.startsWith('L' + W.index)).join(',') };
    });
    console.log('   salida:', JSON.stringify(exitRes));
    // pulsar interactuar sobre la salida (algunas requieren E) y esperar a que el nivel cambie
    for (let k = 0; k < 20; k++) {
      const st = await page.evaluate((lv) => { const W = Game.world; if (!W || W.index !== lv) return 'changed'; if (BOT.idle()) { const ex = W.entities.find(e => e.constructor.name === 'Exit'); if (ex) { BOT.tpEnt(ex); if (ex.interactive && (!ex.canInteract || ex.canInteract(W))) ex.interact(W); } } return Game.top().constructor.name; }, lv);
      if (st === 'changed') break;
      await page.waitForTimeout(400);
    }
    const after = await page.evaluate(() => ({ idx: Game.world && Game.world.index, top: Game.top() && Game.top().constructor.name, completed: BOT.completed }));
    console.log('   tras salida:', JSON.stringify(after), ((Date.now() - t0) / 1000).toFixed(1) + 's');
    const blog = await page.evaluate(() => { const l = BOT.log.slice(); BOT.log.length = 0; return l; });
    console.log('   bot:', blog.filter(s => !s.startsWith('challenge')).slice(0, 30).join(' | '));
    console.log('   desafíos:', blog.filter(s => s.startsWith('challenge')).map(s => s.slice(10)).join(' '));
    if (logs.length) { console.log('   LOGS:\n    ' + logs.slice(0, 20).join('\n    ')); logs.length = 0; }
    if (after.top === 'EndingState') console.log('   ✓ JEFE SUPERADO → EPÍLOGO');
    else if (after.completed !== lv) { console.log('   ✗ NIVEL NO COMPLETADO'); if (!SOLVERS.force) break; }
    else console.log('   ✓ NIVEL COMPLETADO');
  }
  // epílogo: dejar correr la cinemática (a velocidad x4) con capturas periódicas
  if (await page.evaluate(() => Game.top() && Game.top().constructor.name === 'EndingState')) {
    let prev = '', n = 0;
    for (let k = 0; k < 600; k++) {
      const st = await page.evaluate(() => { const t = Game.top(); if (t.constructor.name === 'ReportState' && t.t > 1) { t.__n = (t.__n || 0) + 1; if (t.__n > 3) Input.__fake = true; } const below = Game.stack.find(x => x.constructor.name === 'EndingState'); return t.constructor.name + (below ? ':' + below.mode + ':' + (below.st.card || '') : ''); });
      if (st !== prev) { console.log('   epílogo:', st); prev = st; await shot('end_' + (n++)); }
      if (st.startsWith('TitleState')) {
        // CONTINUE sobre una partida completada abre el menú de posjuego
        await page.evaluate(() => { BOT.auto = false; }); await page.waitForTimeout(600); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
        console.log('   título tras el final → CONTINUE:', await page.evaluate(() => Game.top().constructor.name + ' ' + (Game.top().title || '')));
        await shot('end_postgame');
        break;
      }
      if (st.startsWith('ReportState')) { await page.waitForTimeout(1500); await shot('end_report'); await page.evaluate(() => { BOT.speed = 1; }); await page.keyboard.press('Enter'); await page.waitForTimeout(300); }
      await page.waitForTimeout(500);
    }
  }
  const fin = await page.evaluate(() => ({ top: Game.top() && Game.top().constructor.name, states: BOT.seenStates, prog: { xp: PROG.xp, lvl: PROG.playerLevel, abilities: PROG.abilities, frags: PROG.fragments.length, letters: PROG.letters.join(''), achievements: PROG.achievements, flags: Object.keys(PROG.flags).length } }));
  console.log('\nFINAL', JSON.stringify(fin, null, 1));
  await shot('final');
  await browser.close();
})();

// Soluciones específicas de puzles por nivel (lo genérico no puede deducirlas)
const place = (pairs) => `
  const W = Game.world;
  for (const [bid, sid] of arg) {
    const b = W.ent(bid), so = W.ent(sid);
    if (!b || !so || so.item === b) continue;
    if (so.item) { console.warn('place: socket ocupado ' + sid); continue; }
    BOT.tpEnt(b); W.player.carry = null;
    if (b.canInteract(W)) b.interact(W); else console.warn('place: no se puede tomar ' + bid + ' carried=' + b.carried + ' inSocket=' + (b.inSocket && b.inSocket.id));
    BOT.tpEnt(so);
    if (so.canInteract(W)) so.interact(W); else console.warn('place: no se puede colocar en ' + sid + ' locked=' + so.locked);
  }`;
const levers = `
  const W = Game.world;
  for (const [id, want] of arg) { const lv = W.ent(id); if (!lv) { console.warn('lever? ' + id); continue; } BOT.tpEnt(lv); if (!!lv.on !== want) { if (lv.canInteract && !lv.canInteract(W)) console.warn('lever bloqueada ' + id); else lv.interact(W); } }`;
const pulseAt = `const W = Game.world, e = W.ent(arg); BOT.tpEnt(e); W.player.y -= 2; W.ab_aluPulse(W.player);`;
const SOLVERS = {
  9: {
    run: async (page, act) => {
      await page.evaluate(() => { BOT.pq.length = 0; BOT.pq.push(0, 1, 0, 3); });
      await act(`const W = Game.world, z = W.entities.find(e => e.kind === 'trigger' && e.p.id === 'fight'); if (z && !W.has('bossStarted')) BOT.tp(z.x + 4, z.y + z.h - 15);`);
      let last = '';
      for (let k = 0; k < 900; k++) {
        const st = await page.evaluate(() => {
          const W = Game.world; if (!W || W.index !== 9) return 'left';
          const top = Game.top(); if (!(top instanceof GameplayState) && !(top.constructor.name === 'DialogueState' || top.constructor.name === 'ChoicePromptState' || top.constructor.name === 'ChallengeState')) return 'top:' + top.constructor.name;
          const B = W.v.boss; if (!B) return 'noboss';
          if (B.shieldEvent) { const nf = W.v.nullFig, p = W.player; p.shieldT = 2; p.x = nf.x + 5; p.y = nf.y + 5; return 'shield'; }
          if (!BOT.idle()) return 'busy:' + B.state + B.phase;
          if (!B.active) return 'inactive';
          if (B.state === 'console') { const c = B.console; BOT.tpEnt(c); if (c.interactive) c.interact(W); return 'console' + B.phase; }
          if (B.state === 'core') { const C = W.v.cascade; if (C.exposed > 0) C.tryHit(W, C.x, C.coreY, 4); return 'core' + B.phase + ' ' + C.hits + '/' + C.hitsNeed; }
          return B.state + B.phase;
        });
        if (st !== last) { console.log('     boss:', st); last = st; }
        if (st === 'left' || st.startsWith('top:')) break;
        await page.waitForTimeout(150);
      }
    }
  },
  3: {
    run: async (page, act) => {
      await act(levers, [['la', true], ['lb', true], ['lc', false]]);
      await act(pulseAt, 'lf');
      await act(levers, [['lnull', true]]);
    }
  },
  2: {
    run: async (page, act) => {
      for (const so of ['sF', 'sD', 'sX', 'sW']) await act(place(), [['i4', so]]);
    }
  },
  0: {
    run: async (page, act) => {
      await act(place(), [['bIn', 'so1'], ['bProc', 'so2'], ['bMem', 'so3'], ['bOut', 'so4']]);
      await act(`const W = Game.world, lv = W.ent('run'); BOT.tpEnt(lv); if (!lv.on) lv.interact(W);`);
      await page.waitForTimeout(300);
      await act(`const W = Game.world, t = W.ent('t_fail'); BOT.tpEnt(t); t.interact(W);`);
      console.log('   L0:', await page.evaluate(() => { const W = Game.world; return [1, 2, 3, 4].map(i => { const s = W.ent('so' + i); return s.item ? s.item.id : '-'; }).join(',') + ' run=' + W.ent('run').on + ' flow=' + W.has('L0_flow') + ' exit=' + W.has('L0_exit'); }));
    }
  }
};
