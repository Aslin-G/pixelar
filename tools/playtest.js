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
    // Alcanzabilidad «en vivo»: BFS de plataformas sobre el estado ACTUAL del mundo
    // (puertas cerradas, puentes inactivos, habilidades realmente obtenidas).
    BOT.reachFrom = (px, py) => {
      const W = Game.world, w = W.w, h = W.h;
      const has = a => PROG.abilities.includes(a);
      const raw = (x, y) => (x < 0 || x >= w) ? T.SOLID : (y < 0 || y >= h ? T.AIR : W.tiles[y * w + x]);
      const extra = new Set();
      for (const e of W.entities) if (e.kind === 'platform') {
        for (let k = 0; k <= 16; k++) { const X = e.x0 + (e.dxp || 0) * k / 16, Y = e.y0 + (e.dyp || 0) * k / 16; for (let tx = Math.floor(X / TS); tx <= Math.floor((X + e.w - 1) / TS); tx++) extra.add(tx + ',' + Math.floor(Y / TS)); }
      }
      const solid = (x, y) => { const t = raw(x, y); return t === T.SOLID || t === T.DOOR || (t === T.BREAK && !has('aluPulse')); };
      const hazard = (x, y) => { const t = raw(x, y); return t === T.SPIKE || t === T.POOL; };
      const free = (x, y) => y >= -2 && !solid(x, y) && !hazard(x, y);
      const ground = (x, y) => { const t = raw(x, y); return t === T.SOLID || t === T.DOOR || t === T.BREAK || t === T.ONEWAY || t === T.BRIDGE || t === T.LADDER || extra.has(x + ',' + y); };
      const ladder = (x, y) => raw(x, y) === T.LADDER;
      const stand = (x, y) => free(x, y) && (ground(x, y + 1) || ladder(x, y));
      const dash = has('fetchDash') ? 3 : 0, HJ = [4 + dash, 4 + dash, 3 + dash, 2 + dash];
      const seen = new Set(), air = new Set(), q = [];
      const addS = (x, y) => { const k = x + ',' + y; if (!seen.has(k)) { seen.add(k); q.push([x, y]); } };
      const fall = (x, y) => { const st = [[x, y]]; while (st.length) { const [fx, fy] = st.pop(); if (fy > h + 2) continue; const k = fx + ',' + fy; if (air.has(k)) continue; air.add(k); if (stand(fx, fy)) { addS(fx, fy); continue; } for (const dx of [0, -1, 1]) if (free(fx + dx, fy + 1) && free(fx + dx, fy)) st.push([fx + dx, fy + 1]); } };
      fall(Math.floor(px / TS), Math.floor(py / TS));
      const markers = W.entities.filter(e => e.kind === 'marker');
      while (q.length) {
        const [x, y] = q.shift();
        for (const d of [-1, 1]) if (free(x + d, y)) fall(x + d, y);
        if (ladder(x, y) || ladder(x, y + 1)) { if (free(x, y - 1) && (ladder(x, y - 1) || ladder(x, y))) addS(x, y - 1); if (ladder(x, y + 1)) addS(x, y + 1); }
        const tb = raw(x, y + 1);
        if ((tb === T.ONEWAY || tb === T.BRIDGE || (tb === T.BREAK && has('aluPulse'))) && free(x, y + 2)) fall(x, y + 2);
        for (let k = 0; k <= 3; k++) {
          let okUp = true;
          for (let u = 1; u <= k; u++) if (solid(x, y - u) || hazard(x, y - u)) { okUp = false; break; }
          if (!okUp) break;
          const ty = y - k;
          if (k > 0 && stand(x, ty)) addS(x, ty);
          for (const d of [-1, 1]) for (let s2 = 1; s2 <= HJ[k]; s2++) { if (!free(x + d * s2, ty)) break; if (stand(x + d * s2, ty)) addS(x + d * s2, ty); else fall(x + d * s2, ty); }
        }
        if (has('fetchDash')) for (const m of markers) { const mx = Math.floor((m.x + 5) / TS), my = Math.floor((m.y + 5) / TS); if (Math.sign(mx - x) !== 0 && Math.abs(mx - x) * TS < 160 && Math.abs(my - y) * TS < 100) fall(mx, my); }
      }
      return { seen, air };
    };
    BOT.canReach = (e) => {
      const W = Game.world, p = W.player;
      const R = BOT.reachFrom(p.x + p.w / 2, p.y + p.h - 4);
      const x0 = Math.floor((e.x - 8) / TS), x1 = Math.floor((e.x + e.w + 8) / TS), y0 = Math.floor((e.y - 6) / TS), y1 = Math.floor((e.y + e.h + 6) / TS);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const k = x + ',' + y; if (R.seen.has(k) || R.air.has(k)) return true; }
      return false;
    };
    BOT.checkReach = (e, what) => {
      if (!BOT.checkOn || !e) return;
      if (!BOT.canReach(e)) { const p = Game.world.player; BOT.warn.push((what || e.constructor.name + (e.id ? '#' + e.id : '')) + ' @' + Math.floor(e.x / TS) + ',' + Math.floor(e.y / TS) + ' desde ' + Math.floor(p.x / TS) + ',' + Math.floor(p.y / TS)); }
    };
    BOT.warn = []; BOT.checkOn = true;
    // Combate «honesto»: usa la contramedida prevista para cada enemigo y ataques reales
    BOT.fight = (e) => {
      const W = Game.world, p = W.player;
      if (!e || e.dead) return 'ok';
      const use = k => { const i = PROG.abilities.indexOf(k); if (i < 0) return false; PROG.selAbility = i; p.energy = 999; p.cds[k] = 0; W.useAbility(); return true; };
      const mate = e.kind === 'deadlock' ? W.ent(e.p.pair) : null;
      let rerouting = false;
      for (let f = 0; f < 1500 && !e.dead; f++) {
        if (!(Game.top() instanceof GameplayState)) { Game.update(1 / 60); continue; }
        p.invuln = 1; p.hp = Math.max(p.hp, 2);
        {
          // mantenerse junto al enemigo (en el aire si flota: equivale a saltar y disparar en el ápice)
          const cands = mate && !mate.dead ? [(e.cx + mate.cx) / 2] : [e.cx - 34, e.cx + 34, e.cx - 22, e.cx + 22, e.cx];
          const py = e.y + e.h - p.h;
          const tx = cands.find(cx => cx - p.w / 2 >= 0 && cx + p.w / 2 <= W.w * TS && !W.rectSolid(cx - p.w / 2, py, p.w, p.h));
          if (tx != null && (f % 20 === 0 || e.kind === 'packetstorm')) { p.x = tx - p.w / 2; p.y = py; p.vx = 0; p.vy = 0; }
        }
        p.facing = e.cx > p.cx ? 1 : -1;
        if (f % 45 === 0) {
          if (e.kind === 'cachemiss' && p.boostT <= 0) use('cacheBoost');
          if (e.kind === 'packetstorm' && e.freezeT <= 0) use('interruptShield');
          if (e.kind === 'nullpointer' && !e.vis) use('registerRecall');
          if (e.kind === 'deadlock') { if (!use('aluPulse')) use('parallelClone'); }
          if (e.kind === 'overheat' && e.cooledT <= 0) { const fans = W.entities.filter(x => x.kind === 'fan' && dist(x.cx, x.cy, e.cx, e.cy) < 96); if (!fans.some(x => x.on)) for (const fan of fans) { fan.interact(W); if (fan.on) break; } }
          if (e.kind === 'buserror' && !rerouting && Game.top() instanceof GameplayState) { rerouting = true; BOT.pq.push(e.pk.k); W.run(function* (W2) { yield* e.reroute(W2); rerouting = false; }, 'botreroute'); }
        }
        if (f % 16 === 0) p.attack(W);
        Game.update(1 / 60);
      }
      return e.dead ? 'ok' : 'NO (' + e.kind + (e.kind === 'overheat' ? ' ventiladores cerca: ' + W.entities.filter(x => x.kind === 'fan' && dist(x.cx, x.cy, e.cx, e.cy) < 96).length : '') + ')';
    };
    BOT.W = () => Game.world;
    BOT.idle = () => { const W = Game.world, st = Game.top(); return !!W && st instanceof GameplayState && !W.scripts.busy && W.lockCount === 0 && !W.player.dead; };
    BOT.tp = (x, y) => { const p = Game.world.player; p.x = x; p.y = y; p.vx = 0; p.vy = 0; p.climbing = false; p.dashT = 0; };
    BOT.tpEnt = (e) => { BOT.checkReach(e); BOT.tp(e.x + e.w / 2 - 5, e.y + e.h - 15); };
    BOT.bid = 0;
    BOT.ents = () => Game.world.entities.map((e) => ({ enemy: !!e.enemy && e.kind !== 'boss', i: e.__bid || (e.__bid = ++BOT.bid), id: e.id || null, n: e.constructor.name, kind: e.kind, x: e.x, y: e.y, w: e.w, h: e.h, inter: !!e.interactive, dead: !!e.dead }));
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
      const order = ents.filter(e => !e.dead && (e.kind === 'trigger' || e.inter || e.enemy || ['socket', 'linknode', 'busnode', 'lever', 'block', 'fragment', 'letter', 'historic', 'checkpoint'].includes(e.kind)))
        .sort((a, b) => (info.h > 40 ? a.y - b.y : a.x - b.x));
      for (const e of order) {
        if (e.n === 'Exit' || e.n === 'Block' || e.n === 'Socket' || e.n === 'Lever' || e.n === 'Plate') continue;
        if (solver && solver.skip && solver.skip(e)) continue;
        await act(`
          const e = Game.world.entities.find(x => x.__bid === arg.i); if (!e || e.dead) return;
          const W = Game.world;
          if (e.enemy) { if (W.def.id === 9) return; BOT.checkReach(e, 'enemigo ' + e.kind); const r = BOT.fight(e); if (r !== 'ok') BOT.warn.push('enemigo no derrotado: ' + e.kind + (e.id ? '#' + e.id : '') + ' ' + r); return; }
          if (e.kind === 'trigger') { BOT.checkReach(e, 'trigger ' + e.p.id); BOT.tp(e.x + e.w / 2 - 5, e.y + e.h - 15); return; }
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
    const sweep = await page.evaluate(() => {
      const W = Game.world, p = W.player, R = BOT.reachFrom(W.spawn.x + 5, W.spawn.y + 11), out = [];
      for (const e of W.entities) {
        if (!['Fragment', 'Letter', 'Historic', 'NPC', 'Sign', 'Terminal', 'Checkpoint', 'Exit', 'Socket', 'Lever', 'LinkNode', 'BusNode'].includes(e.constructor.name) || e.dead) continue;
        const x0 = Math.floor((e.x - 8) / TS), x1 = Math.floor((e.x + e.w + 8) / TS), y0 = Math.floor((e.y - 6) / TS), y1 = Math.floor((e.y + e.h + 6) / TS);
        let ok = false;
        for (let y = y0; y <= y1 && !ok; y++) for (let x = x0; x <= x1; x++) { const k = x + ',' + y; if (R.seen.has(k) || R.air.has(k)) { ok = true; break; } }
        if (!ok) out.push(e.constructor.name + (e.id ? '#' + e.id : '') + '@' + Math.floor(e.x / TS) + ',' + Math.floor(e.y / TS));
      }
      for (const d of W.entities) if (d.kind === 'door' && !d.opened) out.push('[puerta cerrada ' + d.id + ' @' + d.tx0 + ',' + d.ty0 + (d.p.flag ? ' flag ' + d.p.flag : '') + ']');
      return out;
    });
    if (sweep.length) console.log('   ⚠ BARRIDO FINAL (desde el inicio, nivel resuelto): ' + sweep.join(' '));
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
    const warns = await page.evaluate(() => { const l = BOT.warn.slice(); BOT.warn.length = 0; return l; });
    if (warns.length) console.log('   ⚠ inalcanzable (según estado actual):\n     ' + warns.join('\n     '));
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
  7: {
    run: async (page, act) => {
      // PARALLEL CLONE: el clon pisa una placa y BYTE la otra
      const r = await page.evaluate(() => {
        const W = Game.world, p = W.player, a = W.ent('pl1'), b = W.ent('pl2');
        BOT.tpEnt(a); p.y = a.y + a.h - p.h; const i = PROG.abilities.indexOf('parallelClone'); if (i < 0) return 'sin clon';
        PROG.selAbility = i; p.energy = 999; p.cds.parallelClone = 0; W.useAbility();
        for (let k = 0; k < 10; k++) Game.update(1 / 60);
        BOT.tpEnt(b); p.y = b.y + b.h - p.h;
        for (let k = 0; k < 90; k++) Game.update(1 / 60);
        return 'placas ' + a.pressed + '/' + b.pressed + ' puerta d4 ' + (W.ent('d4') ? W.ent('d4').opened : '?');
      });
      console.log('   L7:', r);
    }
  },
  8: {
    run: async (page, act) => {
      // bóveda: palanca → puerta d2; se sale rompiendo el bloque X con ALU PULSE y subiendo la escalera
      await act(levers, [['lv', true]]);
      const r = await page.evaluate(() => {
        const W = Game.world;
        let bx = -1, by = -1; for (let y = 0; y < W.h; y++) for (let xx = 0; xx < W.w; xx++) if (W.tile(xx, y) === T.BREAK) { bx = xx; by = y; }
        const lv = W.ent('lv'), d2 = W.ent('d2');
        const R = BOT.reachFrom(lv.x + 8, lv.y + 10);
        let esc = false; for (let y = d2.ty0; y <= d2.ty1; y++) for (const xx of [d2.tx0 - 1, d2.tx0, d2.tx1 + 1]) if (R.seen.has(xx + ',' + y) || R.air.has(xx + ',' + y)) esc = true;
        return 'd2 ' + d2.opened + (bx >= 0 ? ' bloque X en ' + bx + ',' + by : ' sin bloques X') + ' · salida de la bóveda hasta d2: ' + (esc ? 'SÍ' : 'NO');
      });
      console.log('   L8:', r);
    }
  },
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
      // recoger los módulos del camino (se copian al búfer de la sala) y luego colocarlos
      await act(`const W = Game.world; for (const id of arg) { const b = W.ent(id); BOT.tpEnt(b); if (b.canInteract(W)) b.interact(W); if (W.player.carry === b) W.player.dropCarry(W); }`, ['bIn', 'bProc', 'bMem']);
      console.log('   L0 búfer:', await page.evaluate(() => ['bIn', 'bProc', 'bMem', 'bOut'].map(id => { const b = Game.world.ent(id); return id + '@' + Math.floor(b.x / TS); }).join(' ')));
      await act(place(), [['bIn', 'so1'], ['bProc', 'so2'], ['bMem', 'so3'], ['bOut', 'so4']]);
      await act(`const W = Game.world, lv = W.ent('run'); BOT.tpEnt(lv); if (!lv.on) lv.interact(W);`);
      await page.waitForTimeout(300);
      await act(`const W = Game.world, t = W.ent('t_fail'); BOT.tpEnt(t); t.interact(W);`);
      console.log('   L0:', await page.evaluate(() => { const W = Game.world; return [1, 2, 3, 4].map(i => { const s = W.ent('so' + i); return s.item ? s.item.id : '-'; }).join(',') + ' run=' + W.ent('run').on + ' flow=' + W.has('L0_flow') + ' exit=' + W.has('L0_exit'); }));
    }
  }
};
