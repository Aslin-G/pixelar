#!/usr/bin/env node
// Pruebas de robustez: morir y reiniciar desde checkpoint, localStorage bloqueado,
// Web Audio ausente, uso de todas las habilidades, ajustes de accesibilidad y táctil.
// Uso: node tools/robust.js [dir_capturas]
'use strict';
const path = require('path');
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require('/opt/node22/lib/node_modules/playwright'); }
const file = 'file://' + path.resolve(__dirname, '..', 'byte_architect_quest.html');
const shots = process.argv[2];

async function session(browser, init) {
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  if (init) await page.addInitScript(init);
  await page.goto(file);
  await page.waitForTimeout(500);
  return { page, errors };
}
const ok = (c, msg) => console.log((c ? '✓ ' : '✗ ') + msg);

(async () => {
  const browser = await playwright.chromium.launch();

  // 1) Morir y reiniciar
  {
    const { page, errors } = await session(browser);
    await page.evaluate(() => { PROG = newProgress(); PROG.flags.L0_entered = true; Game.stack.length = 0; Game.loadLevel(0); });
    await page.waitForTimeout(400);
    await page.evaluate(() => { const W = Game.world, cp = W.entities.find(e => e.kind === 'checkpoint'); BOT_cp = cp; W.player.x = cp.x; W.player.y = cp.y + cp.h - 15; cp.interact ? cp.interact(W) : null; });
    await page.waitForTimeout(600);
    const cpSaved = await page.evaluate(() => !!PROG.checkpoint);
    // daño letal repetido
    await page.evaluate(() => { const W = Game.world; for (let i = 0; i < 8; i++) { W.player.invuln = 0; W.player.hurt(W, 1, W.player.x, false); } });
    await page.waitForTimeout(1500);
    const st1 = await page.evaluate(() => Game.stack.map(s => s.constructor.name).join('>'));
    if (shots) await page.screenshot({ path: path.join(shots, 'r_gameover.png') });
    await page.waitForTimeout(3500);
    const st2 = await page.evaluate(() => ({ top: Game.top().constructor.name, hp: Game.world.player.hp, x: Math.round(Game.world.player.x), deaths: PROG.stats.deaths }));
    ok(cpSaved, 'checkpoint registrado');
    ok(st1.includes('GameOverState'), 'muerte → GameOverState (' + st1 + ')');
    ok(st2.top === 'GameplayState' && st2.hp > 0 && st2.deaths === 1, 'reinicio desde checkpoint ' + JSON.stringify(st2));
    // reiniciar checkpoint desde el menú de pausa
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    const idx = await page.evaluate(() => Game.top().items.findIndex(i => i.label === 'RESTART CHECKPOINT'));
    await page.evaluate((i) => { Game.top().sel = i; }, idx);
    await page.keyboard.press('Enter'); await page.waitForTimeout(400);
    const st3 = await page.evaluate(() => Game.stack.map(s => s.constructor.name).join('>'));
    if (st3.includes('ConfirmState')) { await page.keyboard.press('ArrowUp'); await page.waitForTimeout(100); await page.keyboard.press('Enter'); await page.waitForTimeout(600); }
    const st4 = await page.evaluate(() => Game.top().constructor.name);
    ok(st4 === 'GameplayState', 'RESTART CHECKPOINT desde pausa (' + st3 + ' → ' + st4 + ')');
    ok(!errors.length, 'sin errores (muerte/reinicio) ' + errors.join(' | '));
    await page.close();
  }

  // 2) localStorage bloqueado + 3) sin Web Audio
  {
    const { page, errors } = await session(browser, () => {
      Object.defineProperty(window, 'localStorage', { get() { throw new Error('bloqueado'); } });
      delete window.AudioContext; delete window.webkitAudioContext;
    });
    await page.keyboard.press('Enter'); await page.waitForTimeout(2600);
    await page.keyboard.press('Enter'); await page.waitForTimeout(800);
    const t = await page.evaluate(() => Game.top().constructor.name);
    await page.evaluate(() => { Game.newGame(); IntroState.prototype.skip.call(Game.top()); });
    await page.waitForTimeout(800);
    const r = await page.evaluate(() => { Game.save(); AudioSys.play('jump'); AudioSys.playMusic('boot'); return { top: Game.top().constructor.name, level: Game.world && Game.world.index, avail: SaveManager.available }; });
    ok(t === 'TitleState' && r.level === 0 && r.avail === false, 'sin localStorage ni audio: arranca y juega ' + JSON.stringify(r));
    ok(!errors.length, 'sin errores (almacenamiento/audio bloqueados) ' + errors.join(' | '));
    await page.close();
  }

  // 4) todas las habilidades en todos los niveles + 5) ajustes
  {
    const { page, errors } = await session(browser);
    for (let lv = 0; lv <= 9; lv++) {
      const res = await page.evaluate((lv) => {
        startTeacherLevel(lv);
        PROG.abilities = ABILITY_ORDER.slice();
        const W = Game.world;
        for (let k = 0; k < 20; k++) Game.update(1 / 60);
        const out = [];
        for (let a = 0; a < PROG.abilities.length; a++) {
          PROG.selAbility = a; W.player.energy = 999; W.player.cds = {};
          try { W.useAbility(); } catch (e) { out.push(PROG.abilities[a] + ': ' + e.message); }
          for (let k = 0; k < 30; k++) { Game.update(1 / 60); if (!(Game.top() instanceof GameplayState)) { const t = Game.top(); if (t.done) t.done(-1); else if (t.exitChallenge) t.exitChallenge(); else Game.pop(); } }
          Game.render();
        }
        W.player.attack(W); for (let k = 0; k < 20; k++) Game.update(1 / 60);
        return out;
      }, lv);
      ok(!res.length, 'habilidades en nivel ' + lv + (res.length ? ': ' + res.join('; ') : ''));
    }
    const s = await page.evaluate(() => {
      const d = Settings.data;
      Object.assign(d, { contrast: true, scanlines: true, reduceFlash: true, reduceShake: true, textSpeed: 3, captions: true, touch: true, showFps: true, assist: true });
      Settings.apply && Settings.apply();
      for (let k = 0; k < 30; k++) { Game.update(1 / 60); Game.render(); }
      return Game.top().constructor.name;
    });
    if (shots) await page.screenshot({ path: path.join(shots, 'r_settings_touch.png') });
    ok(s === 'GameplayState', 'ajustes de accesibilidad y controles táctiles');
    ok(!errors.length, 'sin errores (habilidades/ajustes) ' + errors.slice(0, 5).join(' | '));
    await page.close();
  }
  await browser.close();
})();
