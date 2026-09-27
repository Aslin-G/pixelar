#!/usr/bin/env node
// Pruebas de regresión de los arreglos pedidos por el jugador (sólo teclado donde es posible):
//  1) Puente de la Placa Base: E junto al nodo → elegir la conexión correcta → puente activo
//  2) Modo calma: un enemigo pegado al jugador no hace daño mientras hay un diálogo
//  3) Escudo del jefe: el jugador recupera el control durante el evento de INTERRUPT SHIELD
// Uso: node tools/fixes.js [dir_capturas]
'use strict';
const path = require('path');
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require('/opt/node22/lib/node_modules/playwright'); }
const file = 'file://' + path.resolve(__dirname, '..', 'byte_architect_quest.html');
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
  ok(!errors.length, 'sin errores ' + errors.slice(0, 3).join(' | '));
  await browser.close();
})();
