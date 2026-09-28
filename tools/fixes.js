#!/usr/bin/env node
// Pruebas de regresión de los arreglos pedidos por el jugador (sólo teclado donde es posible):
//  1) Puente de la Placa Base: E junto al nodo → elegir la conexión correcta → puente activo
//  2) Modo calma: un enemigo pegado al jugador no hace daño mientras hay un diálogo
//  3) Escudo del jefe: el jugador recupera el control durante el evento de INTERRUPT SHIELD
//  4) Boot Camp: tras bajar de la pasarela alta se puede volver atrás (escalera de retorno y peldaño
//     a la derecha del bloque del módulo ENTRADA), con física real y teclado
//  5) Módulo olvidado: la pista y la palanca RUN dicen cuál falta y cómo volver
//  6) REINICIAR NIVEL (menú de pausa): deshace lo hecho en el nivel y vuelve al inicio sin repetir la introducción
//  7) Un módulo que cae a pinchos o al vacío vuelve a su sitio
// Uso: node tools/fixes.js [dir_capturas]
'use strict';
const path = require('path');
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require('/opt/node22/lib/node_modules/playwright'); }
const file = 'file://' + path.resolve(__dirname, '..', 'index.html');
const shots = process.argv[2];
const ok = (c, m) => console.log((c ? '✓ ' : '✗ ') + m);

(async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(file); await page.waitForTimeout(500);
  const key = async (k, ms = 60) => { await page.keyboard.down(k); await page.waitForTimeout(ms); await page.keyboard.up(k); await page.waitForTimeout(90); };
  // termina la introducción del nivel: pasa los diálogos y espera a que el guion suelte el control
  const finishIntro = async () => { for (let i = 0; i < 400; i++) { const st = await page.evaluate(() => ({ top: Game.top().constructor.name, busy: Game.world.scripts.busy || Game.world.lockCount > 0 })); if (st.top === 'GameplayState' && !st.busy) return; if (st.top === 'GameplayState') await page.waitForTimeout(120); else await key('Enter', 40); } };
  const clearDialogs = async () => { for (let i = 0; i < 60; i++) { const t = await page.evaluate(() => Game.top().constructor.name); if (t === 'GameplayState') return; await key('Enter', 40); } };

  // 1) puente
  await page.evaluate(() => { startTeacherLevel(1); PROG.abilities = ['circuitLink']; });
  await clearDialogs();
  await page.evaluate(() => { const W = Game.world, n = W.ent('n1'); W.player.x = n.cx - 5; W.player.y = n.y + n.h - 15; W.player.vx = 0; });
  await page.waitForTimeout(300);
  const near = await page.evaluate(() => { const p = Game.world.player; return p.near ? (p.near.id + ' · ' + p.near.prompt) : null; });
  if (shots) await page.screenshot({ path: path.join(shots, 'f1_nodo.png') });
  await key('KeyE'); await page.waitForTimeout(300);
  const prompt = await page.evaluate(() => { const t = Game.top(); return t.constructor.name === 'ChoicePromptState' ? t.options : null; });
  if (shots) await page.screenshot({ path: path.join(shots, 'f1_prompt.png') });
  const idx = prompt ? prompt.findIndex(o => o.includes('RANURA DIMM')) : -1;
  for (let i = 0; i < idx; i++) await key('ArrowDown');
  await key('Enter'); await page.waitForTimeout(800);
  const bridge = await page.evaluate(() => ({ flag: Game.world.has('L1_bridge'), active: Game.world.ent('br1').active }));
  ok(near && near.startsWith('n1'), 'junto al nodo aparece la acción: ' + near);
  ok(!!prompt, 'E abre CIRCUIT LINK: ' + JSON.stringify(prompt));
  ok(bridge.flag && bridge.active, 'el puente se construye con la conexión correcta ' + JSON.stringify(bridge));
  if (shots) { await clearDialogs(); await page.evaluate(() => { const W = Game.world; W.cam.x = W.ent('br1').x - 120; }); await page.waitForTimeout(400); await page.screenshot({ path: path.join(shots, 'f1_puente.png') }); }

  // 2) modo calma
  const calm = await page.evaluate(() => {
    const W = Game.world, p = W.player;
    const e = W.spawnEnt('bitcorrupt', p.x, p.y + p.h - 12, { hp: 3 });
    const hp0 = p.hp; p.invuln = 0;
    W.run(function* (W2) { yield* W2.say([['NEXO', 'Prueba de lectura tranquila.', 'NEUTRAL'], ['BYTE', 'Leyendo sin prisa.', 'thinking']]); }, 'calmtest');
    for (let k = 0; k < 240; k++) Game.update(1 / 60);
    const during = p.hp, stack = Game.top().constructor.name;
    return { hp0, during, stack, ex: Math.round(e.x), px: Math.round(p.x) };
  });
  ok(calm.stack === 'DialogueState' && calm.during === calm.hp0, 'sin daño durante el diálogo ' + JSON.stringify(calm));

  // 3) escudo del jefe
  const shield = await page.evaluate(() => {
    startTeacherLevel(9);
    const W = Game.world;
    for (let k = 0; k < 300; k++) { const t = Game.top(); if (t.constructor.name === 'DialogueState') { t.chars = t.full; t.pause = 0; t.L.ch ? t.choose() : t.next(); } Game.update(1 / 60); }
    BOSS_spawnNull(W).alpha = 1;
    W.run(function* (W2) { yield* BOSS_afterPhase(W2, 4); }, 'after');
    let evt = false, control = false;
    for (let k = 0; k < 600 && !evt; k++) { const t = Game.top(); if (t.constructor.name === 'DialogueState') { t.chars = t.full; t.pause = 0; t.next(); } Game.update(1 / 60); if (W.v.boss.shieldEvent) { evt = true; control = W.controlEnabled; } }
    return { evt, control };
  });
  ok(shield.evt && shield.control, 'durante el evento del escudo el jugador tiene el control ' + JSON.stringify(shield));

  // 4) Boot Camp: vuelta atrás por la escalera de retorno (física real, teclado)
  const cell = () => page.evaluate(() => { const p = Game.world.player; return { tx: Math.floor((p.x + 5) / TS), ty: Math.floor((p.y + 14) / TS) }; });
  const hold = async (k, ms) => { await page.keyboard.down(k); await page.waitForTimeout(ms); await page.keyboard.up(k); await page.waitForTimeout(200); };
  await page.evaluate(() => { startTeacherLevel(0); });
  await finishIntro(); await page.waitForTimeout(200);
  await page.evaluate(() => { const W = Game.world, p = W.player; p.x = 66 * TS + 3; p.y = 16 * TS - 15; p.vx = p.vy = 0; W.cam.snap(p); });
  await page.waitForTimeout(200);
  await hold('ArrowUp', 2600); const up = await cell();
  await hold('ArrowLeft', 2600); await hold('ArrowDown', 2600); const back = await cell();
  ok(up.ty <= 6 && back.tx <= 51 && back.ty >= 14, 'Boot Camp: se sube por la escalera de retorno y se vuelve al lado izquierdo ' + JSON.stringify({ up, back }));
  // …y desde ahí se vuelve a subir al bloque del módulo ENTRADA por el peldaño de la derecha (izquierda + saltos)
  await page.evaluate(() => { const W = Game.world, p = W.player; p.x = 47 * TS + 3; p.y = 16 * TS - 15; p.vx = p.vy = 0; p.facing = -1; W.cam.snap(p); });
  await page.waitForTimeout(200);
  const onTop = [];
  await page.keyboard.down('ArrowLeft');
  for (let i = 0; i < 8; i++) {
    await page.keyboard.down('Space'); await page.waitForTimeout(260); await page.keyboard.up('Space');
    for (let k = 0; k < 3; k++) { await page.waitForTimeout(50); const c = await page.evaluate(() => { const p = Game.world.player; return p.grounded ? Math.floor((p.x + 5) / TS) + ',' + Math.floor((p.y + 14) / TS) : null; }); if (c) onTop.push(c); }
    if (onTop.some(c => c.endsWith(',11'))) break;
  }
  await page.keyboard.up('ArrowLeft'); await page.waitForTimeout(200);
  if (shots) await page.screenshot({ path: path.join(shots, 'f4_peldano.png') });
  const top = onTop.find(c => c.endsWith(',11'));
  ok(onTop.some(c => c.endsWith(',13')) && !!top, 'Boot Camp: desde la derecha se sube por el peldaño al bloque de ENTRADA ' + JSON.stringify([...new Set(onTop)]));

  // 5) módulo olvidado
  const miss = await page.evaluate(() => {
    const W = Game.world, p = W.player;
    const b = W.ent('bProc'); for (const x of W.entities) if (x.kind === 'block' && x !== b && x.id !== 'bOut') L0_toBuffer(W, x);
    p.x = 110 * TS; p.y = 16 * TS - 15; p.vx = p.vy = 0;
    const h = W.def.hint(W);
    W.v.barkTxt = null; const bark0 = W.bark; let said = '';
    W.bark = (who, txt) => { said = txt; };
    W.run(L0_runFlow, 'runtest'); for (let k = 0; k < 60; k++) Game.update(1 / 60);
    W.bark = bark0;
    return { hint: h && h.text, tx: h && Math.floor(h.x / TS), bx: Math.floor(b.cx / TS), said };
  });
  ok(miss.hint && miss.hint.includes('PROCESO') && miss.tx === miss.bx && miss.said.includes('PROCESO'), 'la pista y RUN señalan el módulo olvidado ' + JSON.stringify(miss));

  // 6) REINICIAR NIVEL desde el menú de pausa
  const before = await page.evaluate(() => ({ snap: PROG.levelSnap && PROG.levelSnap.level, bufProc: Game.world.has('L0_buf_PROCESS'), bufIn: Game.world.has('L0_buf_INPUT') }));
  await key('Escape'); await page.waitForTimeout(200);
  const items = await page.evaluate(() => Game.top().items.map(i => i.label));
  for (let i = 0; i < items.indexOf('REINICIAR NIVEL'); i++) await key('ArrowDown');
  await key('Enter'); await page.waitForTimeout(200);
  if (shots) await page.screenshot({ path: path.join(shots, 'f6_confirm.png') });
  await key('ArrowUp'); await key('Enter'); await page.waitForTimeout(600);
  const after = await page.evaluate(() => {
    const W = Game.world, p = W.player;
    return { top: Game.top().constructor.name, level: PROG.level, bufIn: W.has('L0_buf_INPUT'), atSpawn: Math.abs(p.x - W.spawn.x) < 24, intro: W.scripts.busy };
  });
  if (shots) await page.screenshot({ path: path.join(shots, 'f6_reiniciado.png') });
  ok(before.snap === 0 && before.bufIn && after.top === 'GameplayState' && after.level === 0 && !after.bufIn && after.atSpawn && !after.intro, 'REINICIAR NIVEL deshace el nivel y vuelve al inicio ' + JSON.stringify({ before, after }));

  // 7) módulo en pinchos → vuelve a su sitio
  const home = await page.evaluate(() => {
    const W = Game.world, b = W.ent('bIn'), hx = b.home.x, hy = b.home.y;
    const tx = Math.floor(b.cx / TS) + 3, ty = Math.floor((b.y + b.h + 1) / TS);
    W.setTile(tx, ty, T.SPIKE); b.x = tx * TS + 1; b.y = ty * TS - b.h - 4; b.vy = 0;
    for (let k = 0; k < 40; k++) Game.update(1 / 60);
    const r = { back: Math.abs(b.x - hx) < 1 && Math.abs(b.y - hy) < 2 };
    b.x = hx; b.y = W.h * TS + 20; for (let k = 0; k < 5; k++) Game.update(1 / 60);
    r.fromVoid = Math.abs(b.x - hx) < 1 && Math.abs(b.y - hy) < 2;
    return r;
  });
  ok(home.back && home.fromVoid, 'un módulo en pinchos o en el vacío vuelve a su sitio ' + JSON.stringify(home));
  ok(!errors.length, 'sin errores ' + errors.slice(0, 3).join(' | '));
  await browser.close();
})();
