#!/usr/bin/env node
// Prueba de humo con Playwright/Chromium usando SOLO el teclado (como un jugador):
// arranque → título → prólogo → Nivel 00 → movimiento → terminal → pistas → pausa y menús
// → recarga y CONTINUE → modo docente. Guarda capturas en el directorio indicado.
// Uso: node tools/smoke.js [directorio_de_capturas]
'use strict';
const path = require('path');
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require('/opt/node22/lib/node_modules/playwright'); }

const out = process.argv[2] || path.resolve(__dirname, '..', 'shots');
require('fs').mkdirSync(out, { recursive: true });
const file = 'file://' + path.resolve(__dirname, '..', 'index.html');

(async () => {
  const browser = await playwright.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message + '\n' + e.stack));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  await page.goto(file);
  const shot = async (n) => page.screenshot({ path: path.join(out, n + '.png') });
  const key = async (k, ms = 70) => { await page.keyboard.down(k); await page.waitForTimeout(ms); await page.keyboard.up(k); await page.waitForTimeout(50); };
  const top = () => page.evaluate(() => Game.top() && Game.top().constructor.name);
  const step = (msg) => console.log('·', msg);

  await page.waitForTimeout(700); await shot('s01_boot');
  await key('Enter'); await page.waitForTimeout(2600);
  await key('Enter'); await page.waitForTimeout(900); await shot('s02_title');
  step('título: ' + await top());
  await key('Enter'); await page.waitForTimeout(1200);
  step('tras NEW GAME: ' + await top());
  // prólogo: avanzar diálogos con Enter hasta llegar al nivel 0
  let n = 0;
  for (let i = 0; i < 260; i++) {
    const t = await top();
    if (t === 'GameplayState') break;
    if (i === 6 || i === 40 || i === 80) await shot('s03_intro_' + (n++));
    await key('Enter', 40);
    await page.waitForTimeout(160);
  }
  step('tras prólogo: ' + await top() + ' nivel ' + await page.evaluate(() => Game.world && Game.world.index));
  // diálogo inicial del nivel 0
  for (let i = 0; i < 40; i++) { if (await page.evaluate(() => Game.top() instanceof GameplayState && Game.world.controlEnabled)) break; await key('Enter', 40); await page.waitForTimeout(150); }
  await shot('s04_level0');
  // movimiento real
  const x0 = await page.evaluate(() => Game.world.player.x);
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(700); await key('Space', 220); await page.waitForTimeout(500); await page.keyboard.up('ArrowRight');
  await page.waitForTimeout(400);
  const x1 = await page.evaluate(() => Game.world.player.x);
  step('movimiento: x ' + Math.round(x0) + ' → ' + Math.round(x1));
  for (let i = 0; i < 12; i++) { if (await page.evaluate(() => Game.top() instanceof GameplayState)) break; await key('Enter', 40); await page.waitForTimeout(150); }
  await shot('s05_move');
  // ir a la terminal de inventario y abrir su desafío con E
  await page.evaluate(() => { const W = Game.world, t = W.ent('t_hw'); W.player.x = t.cx - 5; W.player.y = t.y + t.h - 15; });
  await page.waitForTimeout(300);
  await key('KeyE'); await page.waitForTimeout(700);
  for (let i = 0; i < 10 && (await top()) === 'DialogueState'; i++) { await key('Enter', 40); await page.waitForTimeout(150); }
  step('terminal: ' + await top());
  await shot('s06_challenge');
  await key('KeyH'); await page.waitForTimeout(250); await key('KeyH'); await page.waitForTimeout(300); await shot('s07_hints');
  await key('Escape'); await page.waitForTimeout(400);
  step('tras salir del desafío: ' + await top());
  for (let i = 0; i < 6 && (await top()) !== 'GameplayState'; i++) { await key('Enter', 40); await page.waitForTimeout(150); }
  // menú de pausa y submenús
  await key('Escape'); await page.waitForTimeout(400); await shot('s08_pause'); step('pausa: ' + await top());
  const items = await page.evaluate(() => Game.top().items ? Game.top().items.map(i => i.label) : []);
  step('opciones de pausa: ' + items.join(', '));
  for (let k = 1; k <= 7; k++) {
    await page.evaluate((k) => { Game.top().sel = k; }, k);
    await key('Enter'); await page.waitForTimeout(450);
    await shot('s09_menu_' + k); step('  submenú ' + k + ': ' + await top());
    await key('Escape'); await page.waitForTimeout(300);
  }
  await key('Escape'); await page.waitForTimeout(300);
  step('tras cerrar pausa: ' + await top());
  // habilidad sin habilidades, ataque
  await key('KeyJ'); await key('KeyQ'); await page.waitForTimeout(200);
  // recargar y CONTINUE
  await page.evaluate(() => Game.save());
  await page.reload(); await page.waitForTimeout(700);
  await key('Enter'); await page.waitForTimeout(2600); await key('Enter'); await page.waitForTimeout(900);
  await shot('s10_title_continue');
  step('recarga: ' + await top() + ' sel=' + await page.evaluate(() => Game.top().sel));
  await key('Enter'); await page.waitForTimeout(1500);
  step('CONTINUE: ' + await top() + ' nivel ' + await page.evaluate(() => Game.world && Game.world.index));
  // modo docente
  await page.evaluate(() => { Game.stack.length = 0; Game.push(new TitleState()); });
  await page.waitForTimeout(300);
  await page.evaluate(() => { Game.top().sel = 2; });
  await key('Enter'); await page.waitForTimeout(600);
  await shot('s11_teacher'); step('docente: ' + await top());
  await key('ArrowDown'); await key('ArrowDown'); await key('ArrowDown');
  await page.waitForTimeout(300); await shot('s12_teacher_nav');
  await key('Escape'); await page.waitForTimeout(300);
  step('fin: ' + await top());
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  await browser.close();
})();
