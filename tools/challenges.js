#!/usr/bin/env node
// Verifica la coherencia de todos los desafíos: para cada uno (y variantes generadas)
// se crea el widget, se renderiza, se usan las 3 pistas, se muestra la solución
// guiada y se comprueba que la solución evalúa como correcta.
// Uso: node tools/challenges.js [directorio_de_capturas]
'use strict';
const path = require('path');
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require('/opt/node22/lib/node_modules/playwright'); }
const file = 'file://' + path.resolve(__dirname, '..', 'index.html');
const shots = process.argv[2];

(async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const logs = [];
  page.on('pageerror', e => logs.push('pageerror: ' + e.message + '\n' + e.stack));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
  await page.goto(file);
  await page.waitForTimeout(400);
  const res = await page.evaluate(() => {
    PROG = newProgress();
    const cv = document.createElement('canvas'); cv.width = 480; cv.height = 270;
    const g = cv.getContext('2d');
    const out = { n: 0, fail: [], errors: [], types: {} };
    const test = (ch, tag) => {
      out.n++;
      out.types[ch.type] = (out.types[ch.type] || 0) + 1;
      try {
        const cs = new ChallengeState(ch, { source: 'terminal', noConf: true });
        cs.render(g);
        for (let k = 0; k < 3; k++) { cs.useHint(); cs.w.update(0.016); cs.render(g); }
        cs.w.reset(); cs.render(g);
        cs.w.showSolution(); cs.w.update(0.016, true); cs.render(g);
        const ready = cs.w.isReady();
        const r = cs.w.evaluate();
        const live = cs.w.needsSubmit === false && ch.type !== 'sim';
        if (!live && (!ready || !r.ok)) out.fail.push(tag + ' ' + ch.id + ' [' + ch.type + '] ready=' + ready + ' ok=' + r.ok);
        cs.phase = 'result'; cs.resultOk = r.ok; cs.feedback = ch.explanation || ''; cs.render(g);
        cs.phase = 'guided'; cs.guidedText = 'x'; cs.render(g);
        // una respuesta vacía no debe ser correcta
        const cs2 = new ChallengeState(ch, { source: 'terminal', noConf: true });
        if (cs2.w.needsSubmit !== false && cs2.w.isReady() && cs2.w.evaluate().ok) out.fail.push(tag + ' ' + ch.id + ' [' + ch.type + '] ' + ch.concept + ' correcto sin responder');
      } catch (e) { out.errors.push(tag + ' ' + ch.id + ': ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')); }
    };
    for (const id in QM.byId) test(QM.byId[id], 'AUT');
    for (const c in QM.gens) for (const fn of QM.gens[c]) for (let d = 1; d <= 5; d++) for (let k = 0; k < 4; k++) {
      let ch; try { ch = fn(d); } catch (e) { out.errors.push('GEN ' + c + ' d' + d + ': ' + e.message); continue; }
      if (ch) test(ch, 'GEN' + d);
    }
    // variantes de los autores
    for (const id in QM.byId) { const v = QM.variantOf(QM.byId[id]); if (v) test(v, 'VAR'); }
    return out;
  });
  console.log('Probados:', res.n, JSON.stringify(res.types));
  console.log('Fallos (' + res.fail.length + '):\n  ' + res.fail.join('\n  '));
  console.log('Errores (' + res.errors.length + '):\n  ' + res.errors.slice(0, 40).join('\n  '));
  if (shots) {
    // capturas de una muestra de widgets
    const ids = await page.evaluate(() => { const seen = {}; for (const id in QM.byId) { const t = QM.byId[id].type; if (!seen[t]) seen[t] = id; } return seen; });
    for (const [t, id] of Object.entries(ids)) {
      await page.evaluate((id) => { Game.stack.length = 0; Game.push(new ChallengeState(QM.get(id), { source: 'terminal', noConf: true })); }, id);
      await page.waitForTimeout(250);
      await page.screenshot({ path: path.join(shots, 'ch_' + t + '.png') });
    }
  }
  console.log(logs.length ? 'LOGS:\n' + logs.slice(0, 30).join('\n') : 'SIN LOGS');
  await browser.close();
})();
