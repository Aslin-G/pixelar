#!/usr/bin/env node
// Pruebas de las mecánicas nuevas: pisotón, choque de paquetes, combo, bestiario, enemigos nuevos
// (MemoryLeak, Troyano, StackOverflow), chips de FIRMWARE y un combate con teclado real contra
// un guardián (disparos y consulta respondida acercándose al orbe y pulsando E).
// Uso: node tools/mechanics.js [dir_capturas]
'use strict';
const path = require('path');
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require('/opt/node22/lib/node_modules/playwright'); }
const file = 'file://' + path.resolve(__dirname, '..', 'index.html');
const shots = process.argv[2];
let fails = 0;
const ok = (c, m) => { if (!c) fails++; console.log((c ? '✓ ' : '✗ ') + m); };

(async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(file); await page.waitForTimeout(500);
  const R = await page.evaluate(() => {
    const out = {};
    const fresh = (lv) => { startTeacherLevel(lv); const W = Game.world; W.pending.length = 0; for (let k = 0; k < 5; k++) Game.update(1 / 60); for (const e of W.entities) if (e.enemy && !e.big) e.dead = true; for (let k = 0; k < 2; k++) Game.update(1 / 60); return W; };
    const steps = n => { for (let k = 0; k < n; k++) Game.update(1 / 60); };
    let W = fresh(0), p = W.player;
    const gx = W.spawn.x + 60, gy = W.spawn.y + 15; // suelo cerca del inicio
    // 1) pisotón: caer encima de un BitCorrupt lo daña y rebota, sin recibir daño
    let e = W.spawnEnt('bitcorrupt', gx, gy - 12, { px: gx, py: gy - 12, hp: 3 });
    p.x = e.cx - 5; p.y = e.y - 30; p.vx = 0; p.vy = 120; p.invuln = 0; p.graceT = 0;
    const hp0 = p.hp; let bounced = false;
    for (let k = 0; k < 30 && !bounced; k++) { steps(1); if (p.vy < -150) bounced = true; }
    out.stomp = { enemyHp: e.hp, bounced, hp: p.hp, hp0 };
    // 2) pisar un OverHeat caliente quema
    e.dead = true; steps(1);
    const oh = W.spawnEnt('overheat', gx, gy - 14, { px: gx, py: gy - 14 });
    p.x = oh.cx - 5; p.y = oh.y - 30; p.vy = 120; p.invuln = 0; p.graceT = 0; const hp1 = p.hp;
    steps(30); out.hot = { hp: p.hp, hp1 }; oh.dead = true; p.hp = Chips.maxHp(); p.invuln = 0; steps(2);
    // 3) choque de paquetes: un disparo anula un proyectil enemigo
    p.x = gx - 80; p.y = gy - 15; p.vx = p.vy = 0; p.facing = 1;
    const enemyShot = new Projectile(p.cx + 60, p.y + 7, -60, 0, { owner: 'enemy', life: 3 }); W.projectiles.push(enemyShot);
    p.attackCd = 0; p.attack(W); steps(20);
    out.clash = { enemyShotDead: enemyShot.dead, playerShots: W.projectiles.filter(q => q.owner === 'player').length };
    // 4) combo y bestiario: tres derrotas seguidas
    W.combo = 0; const xp0 = PROG.xp;
    for (let i = 0; i < 3; i++) { const b = W.spawnEnt('bitcorrupt', gx + i * 20, gy - 12, { px: gx + i * 20, py: gy - 12, hp: 1 }); b.hit(W, 1, b.cx, 'ping'); steps(3); }
    out.combo = { combo: W.combo, xp: PROG.xp - xp0, bestiary: PROG.codex.includes('en_bitcorrupt') };
    // 5) MemoryLeak crece y al destruirlo se reparte en dos
    const ml = W.spawnEnt('memoryleak', gx, gy - 10, { px: gx, py: gy - 10 }); const mh0 = ml.maxHp;
    steps(60 * 6); const mh1 = ml.maxHp; ml.hp = 1; ml.hit(W, 1, ml.cx, 'ping'); steps(2);
    out.leak = { grew: mh1 > mh0, children: W.entities.filter(x => x.kind === 'memoryleak' && !x.dead && x.p.small).length, codex: PROG.codex.includes('en_memoryleak') };
    for (const x of W.entities) if (x.enemy) x.dead = true; steps(1);
    // 6) Troyano: parece un regalo; un disparo lo analiza y lo revela
    const tj = W.spawnEnt('trojan', gx + 100, gy - 12, { px: gx + 100, py: gy - 12 }); const hid = tj.hidden, harm0 = tj.harmless;
    p.x = gx - 20; p.facing = 1; p.attackCd = 0; p.attack(W); steps(40);
    out.trojan = { hid, harm0, revealed: !tj.hidden };
    tj.dead = true; steps(1);
    // 7) StackOverflow: crece por arriba y cada golpe desapila el último marco (LIFO)
    const st = W.spawnEnt('stack', gx, gy - 12, { px: gx, py: gy - 12 }); steps(60 * 3); const f1 = st.frames; st.hit(W, 1, st.cx, 'ping'); const f2 = st.frames;
    out.stack = { grew: f1 > 2, popped: f2 === f1 - 1 };
    st.dead = true; steps(1);
    // 8) chips de firmware
    PROG.chips = CHIP_ORDER.slice(); PROG.equip = [];
    const cap0 = Chips.cap();
    const tog = id => Chips.toggle(id);
    out.chips = {};
    out.chips.cap = cap0;
    tog('pipeline'); p.attackCd = 0; p.attack(W); out.chips.pipelineCd = p.attackCd; tog('pipeline');
    tog('bus64'); const n0 = W.projectiles.length; p.attackCd = 0; p.attack(W); out.chips.bus64 = W.projectiles.length - n0; tog('bus64');
    tog('alu'); p.attackCd = 0; p.attack(W); out.chips.aluPierce = W.projectiles[W.projectiles.length - 1].pierce; tog('alu');
    const mh = Chips.maxHp(); tog('raid'); out.chips.raid = Chips.maxHp() - mh; tog('raid');
    tog('post'); p.postShield = true; p.invuln = 0; p.graceT = 0; const h2 = p.hp; p.hurt(W, 1, p.cx + 5); out.chips.post = { absorbed: p.hp === h2, shieldGone: !p.postShield }; tog('post');
    tog('watchdog'); W.v.watchdogUsed = false; p.invuln = 0; p.hp = 1; p.hurt(W, 1, p.cx + 5); out.chips.watchdog = { alive: !p.dead, hp: p.hp }; tog('watchdog');
    p.invuln = 0; p.hp = Chips.maxHp();
    const run = () => { p.x = gx - 100; p.y = gy - 15; p.vx = 0; p.vy = 0; const x0 = p.x; Input.keys.add('ArrowRight'); for (let k = 0; k < 30; k++) { p.update(W, 1 / 60, true); } Input.keys.delete('ArrowRight'); return p.x - x0; };
    const d0 = run(); tog('overclock'); const d1 = run(); tog('overclock'); out.chips.overclock = d1 / d0;
    const regen = () => { p.energy = 0; for (let k = 0; k < 60; k++) p.update(W, 1 / 60, false); return p.energy; };
    const e0 = regen(); tog('vrm'); const e1 = regen(); tog('vrm'); out.chips.vrm = e1 / e0;
    // capacidad: no se puede equipar por encima de la memoria
    PROG.equip = []; let n = 0; for (const id of CHIP_ORDER) if (tog(id)) n++;
    out.chips.capacity = { equipped: n, used: Chips.used(), cap: Chips.cap() };
    return out;
  });
  ok(R.stomp.enemyHp === 2 && R.stomp.bounced && R.stomp.hp === R.stomp.hp0, 'pisotón: daña al enemigo, rebota y no hace daño ' + JSON.stringify(R.stomp));
  ok(R.hot.hp < R.hot.hp1, 'pisar un OverHeat caliente quema ' + JSON.stringify(R.hot));
  ok(R.clash.enemyShotDead, 'choque de paquetes: el disparo anula un proyectil enemigo ' + JSON.stringify(R.clash));
  ok(R.combo.combo === 3 && R.combo.xp > 0 && R.combo.bestiary, 'combo ×3 con XP extra y ficha en el bestiario ' + JSON.stringify(R.combo));
  ok(R.leak.grew && R.leak.children === 2 && R.leak.codex, 'MemoryLeak crece y se reparte en dos al destruirlo ' + JSON.stringify(R.leak));
  ok(R.trojan.hid && R.trojan.harm0 && R.trojan.revealed, 'Troyano: disfrazado e inofensivo hasta que un disparo lo revela ' + JSON.stringify(R.trojan));
  ok(R.stack.grew && R.stack.popped, 'StackOverflow: apila y desapila por arriba (LIFO) ' + JSON.stringify(R.stack));
  const c = R.chips;
  ok(c.pipelineCd < 0.2 && c.bus64 === 2 && c.aluPierce === 1 && c.raid === 1, 'chips PIPELINE, BUS 64, ALU y RAID ' + JSON.stringify({ pipelineCd: c.pipelineCd, bus64: c.bus64, alu: c.aluPierce, raid: c.raid }));
  ok(c.post.absorbed && c.post.shieldGone && c.watchdog.alive && c.watchdog.hp === 2, 'chips POST y WATCHDOG ' + JSON.stringify({ post: c.post, watchdog: c.watchdog }));
  ok(c.overclock > 1.1 && c.vrm > 1.4, 'chips OVERCLOCK (+velocidad) y VRM (+energía) ' + JSON.stringify({ overclock: c.overclock.toFixed(2), vrm: c.vrm.toFixed(2) }));
  ok(c.capacity.used <= c.capacity.cap && c.capacity.equipped < 9, 'la memoria de firmware limita los chips equipados ' + JSON.stringify(c.capacity));

  // ---------- guardián con teclado real: disparos, consulta con E, victoria ----------
  await page.evaluate(() => {
    Settings.data.assist = true; // la prueba mide el flujo, no la destreza
    startTeacherLevel(0); const W = Game.world; W.pending.length = 0;
    W.flag('L0_exit'); W.flag('G_seen_bootloop'); W.flag('tip_guardians');
    for (let k = 0; k < 5; k++) Game.update(1 / 60);
    const A = W.def.guardian.arena, p = W.player; p.x = A.x0 + 2 * TS; p.y = A.floor - 15; W.cam.snap(p);
  });
  await page.waitForTimeout(400);
  const hold = async (k, ms) => { await page.keyboard.down(k); await page.waitForTimeout(ms); await page.keyboard.up(k); };
  await hold('ArrowRight', 900);
  await page.waitForFunction(() => Game.world.v.guardian.state === 'fight', null, { timeout: 15000 }).catch(() => {});
  const g0 = await page.evaluate(() => ({ state: Game.world.v.guardian.state, gate: Game.world.ent('gate').opened }));
  if (shots) await page.screenshot({ path: path.join(shots, 'm_guardian_fight.png') });
  let quizSeen = false, answered = 0, last = null;
  for (let i = 0; i < 400; i++) {
    const st = await page.evaluate(() => {
      const W = Game.world, B = W.v.guardian, p = W.player;
      if (!B || B.dead) return { done: true };
      const Q = W.v.gQuiz, o = Q && Q.orbs.find(x => x.ok && !x.dead);
      return { state: B.state, bx: B.cx, px: p.cx, orb: o ? o.cx : null, near: p.near ? p.near.kind : null, hp: B.hp, top: Game.top().constructor.name };
    });
    last = st;
    if (st.done) break;
    if (st.top !== 'GameplayState') { await page.keyboard.press('Enter'); await page.waitForTimeout(80); continue; }
    if (st.state === 'quiz' && st.orb != null) {
      quizSeen = true;
      if (shots && answered === 0) await page.screenshot({ path: path.join(shots, 'm_guardian_quiz.png') });
      if (Math.abs(st.orb - st.px) > 6) { await hold(st.orb > st.px ? 'ArrowRight' : 'ArrowLeft', Math.min(400, Math.abs(st.orb - st.px) * 8)); continue; }
      await hold('KeyE', 60); answered++; await page.waitForTimeout(200); continue;
    }
    // mirar hacia el guardián y disparar
    await hold(st.bx > st.px ? 'ArrowRight' : 'ArrowLeft', 40);
    await hold('KeyJ', 50);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(2500);
  for (let k = 0; k < 20; k++) { const t = await page.evaluate(() => Game.top().constructor.name); if (t === 'GameplayState') break; await page.keyboard.press('Enter'); await page.waitForTimeout(150); }
  const g1 = await page.evaluate(() => { const W = Game.world; return { flag: W.has('G_bootloop'), exit: W.entities.find(e => e.kind === 'exit').isOpen(W), gate: W.ent('gate').opened, chip: Chips.owned('post'), learning: (PROG.learning.log || []).some(l => /guard_bootloop/.test(l.id)) }; });
  if (shots) await page.screenshot({ path: path.join(shots, 'm_guardian_after.png') });
  ok(g0.state === 'fight' && !g0.gate, 'al entrar en la arena la compuerta se cierra y empieza el combate ' + JSON.stringify(g0));
  ok(quizSeen && answered >= 1, 'consulta respondida con [E] junto al orbe correcto (' + answered + ')');
  ok(g1.flag && g1.exit && g1.gate && g1.chip && g1.learning, 'guardián vencido con teclado: salida y compuerta abiertas, chip POST y aprendizaje registrado ' + JSON.stringify(g1) + ' último estado ' + JSON.stringify(last));
  ok(!errors.length, 'sin errores ' + errors.slice(0, 3).join(' | '));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
