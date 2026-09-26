#!/usr/bin/env node
// Validador de niveles y datos: carga cada nivel en Chromium y comprueba
//  - filas del mapa con el mismo ancho, caracteres sin leyenda, fragmentos
//  - referencias a desafíos, disparadores y códex inexistentes
//  - cobertura de glifos de la fuente para todos los textos del juego
//  - alcanzabilidad aproximada (BFS de plataformas) de salidas, terminales y objetos
// Uso: node tools/validate.js [nivel]
'use strict';
const fs = require('fs');
const path = require('path');
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require('/opt/node22/lib/node_modules/playwright'); }

const root = path.resolve(__dirname, '..');
const file = 'file://' + path.join(root, 'byte_architect_quest.html');
const only = process.argv[2] != null ? +process.argv[2] : null;

// referencias estáticas en el código fuente
const src = fs.readdirSync(path.join(root, 'src')).filter(f => f.endsWith('.js')).map(f => fs.readFileSync(path.join(root, 'src', f), 'utf8')).join('\n');
const chRefs = new Set();
for (const m of src.matchAll(/(?:challenge\(|challengeTask\(|\bch:\s*)'([a-zA-Z]+\d+[a-z]?)'/g)) chRefs.add(m[1]);
const codexRefs = new Set();
for (const m of src.matchAll(/(?:\.codex\(|Codex\.unlock\(|codex:\s*)'([a-zA-Z0-9_]+)'/g)) codexRefs.add(m[1]);
for (const m of src.matchAll(/codex:\s*\[([^\]]*)\]/g)) for (const k of m[1].matchAll(/'([a-zA-Z0-9_]+)'/g)) codexRefs.add(k[1]);
const strings = new Set();
for (const m of src.matchAll(/'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`|"((?:[^"\\\n]|\\.)*)"/g)) strings.add(m[1] || m[2] || m[3] || '');

(async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const logs = [];
  page.on('pageerror', e => logs.push('pageerror: ' + e.message + '\n' + e.stack));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
  await page.goto(file);
  await page.waitForTimeout(400);

  const data = await page.evaluate(({ chRefs, codexRefs, strings }) => {
    const out = { missingCh: [], missingCodex: [], badGlyphs: {} };
    for (const id of chRefs) if (!QM.get(id)) out.missingCh.push(id);
    for (const id of codexRefs) if (!CODEX_BY_ID[id]) out.missingCodex.push(id);
    for (const s of strings) {
      const t = Font.norm(s);
      for (const ch of t) {
        if (ch === '\n' || ch === '*' || ch === ' ' || ch.charCodeAt(0) < 32) continue;
        if (!Font.has(ch)) (out.badGlyphs[ch] = out.badGlyphs[ch] || []).push(s.slice(0, 40));
      }
    }
    for (const k in out.badGlyphs) out.badGlyphs[k] = out.badGlyphs[k].length + ' e.g. ' + JSON.stringify(out.badGlyphs[k][0]);
    out.challenges = Object.keys(QM.byId).length;
    return out;
  }, { chRefs: [...chRefs], codexRefs: [...codexRefs], strings: [...strings] });
  console.log('Desafíos registrados:', data.challenges);
  console.log('Desafíos referenciados inexistentes:', data.missingCh.join(', ') || '—');
  console.log('Códex referenciado inexistente:', data.missingCodex.join(', ') || '—');
  console.log('Glifos sin soporte:', Object.keys(data.badGlyphs).length ? JSON.stringify(data.badGlyphs, null, 1) : '—');

  const n = await page.evaluate(() => LEVELS.length);
  for (let i = 0; i < n; i++) {
    if (only != null && i !== only) continue;
    logs.length = 0;
    const r = await page.evaluate((i) => {
      const def = LEVELS[i];
      const res = { i, key: def.key || def.name, issues: [], unreach: [] };
      if (def.special) { res.special = true; return res; }
      const widths = new Set(def.map.map(r => r.length));
      if (widths.size > 1) {
        const w0 = def.map[0].length;
        def.map.forEach((r, y) => { if (r.length !== w0) res.issues.push('fila ' + y + ' ancho ' + r.length + ' (esperado ' + w0 + ')'); });
      }
      const stars = def.map.join('').split('*').length - 1;
      if (stars !== (def.fragments || []).length) res.issues.push('fragmentos: ' + stars + ' "*" vs ' + (def.fragments || []).length + ' ids');
      const ps = def.map.join('').split('P').length - 1;
      if (ps !== 1) res.issues.push('spawns P: ' + ps);
      startTeacherLevel(i);
      const W = Game.world;
      res.size = W.w + 'x' + W.h;
      // ids repetidos (p. ej. un carácter de leyenda con id usado dos veces, o una puerta partida en dos)
      const idc = {};
      for (const e of W.entities) if (e.id) idc[e.id] = (idc[e.id] || 0) + 1;
      for (const k in idc) if (idc[k] > 1) res.issues.push('id repetido: ' + k + ' ×' + idc[k]);
      // referencias
      for (const e of W.entities) {
        if (e.kind === 'trigger' && !(def.triggers && def.triggers[e.p.id])) res.issues.push('trigger sin script: ' + e.p.id);
        if (e.constructor.name === 'Terminal' && e.p.ch && !QM.get(e.p.ch) && typeof e.p.ch === 'string') res.issues.push('terminal ch inexistente: ' + e.p.ch);
      }
      // ---------- BFS de alcanzabilidad optimista ----------
      const w = W.w, h = W.h;
      const has = a => PROG.abilities.includes(a) || ABILITY_ORDER.slice(0, i).includes(a);
      const raw = (x, y) => (x < 0 || x >= w) ? T.SOLID : (y < 0 ? T.AIR : (y >= h ? T.AIR : W.tiles[y * w + x]));
      const extraGround = new Set();
      for (const e of W.entities) {
        if (e.kind === 'platform') {
          const steps = 12;
          for (let k = 0; k <= steps; k++) {
            const px = e.x0 + (e.dxp || 0) * k / steps, py = e.y0 + (e.dyp || 0) * k / steps;
            const ty = Math.floor(py / TS);
            for (let tx = Math.floor(px / TS); tx <= Math.floor((px + e.w - 1) / TS); tx++) extraGround.add(tx + ',' + ty);
          }
        }
        if (e.kind === 'bridge' || e.kind === 'collapse') for (const [x, y] of e.p.cells) extraGround.add(x + ',' + y);
      }
      const block = (x, y) => { const t = raw(x, y); return t === T.SOLID; }; // puertas/rompibles abiertos (optimista)
      const hazard = (x, y) => { const t = raw(x, y); return t === T.SPIKE || t === T.POOL; };
      const free = (x, y) => y >= -2 && !block(x, y) && !hazard(x, y);
      const ground = (x, y) => { const t = raw(x, y); return t === T.SOLID || t === T.ONEWAY || t === T.BRIDGE || t === T.LADDER || t === T.BREAK || t === T.DOOR || extraGround.has(x + ',' + y); };
      const ladder = (x, y) => raw(x, y) === T.LADDER;
      const stand = (x, y) => free(x, y) && (ground(x, y + 1) || ladder(x, y));
      const HJ = has('fetchDash') ? 7 : 4, VJ = 3;
      const seen = new Set(), air = new Set(), q = [];
      const addS = (x, y) => { const k = x + ',' + y; if (!seen.has(k)) { seen.add(k); q.push([x, y]); } };
      const fall = (x, y) => {
        const st = [[x, y]];
        while (st.length) {
          const [fx, fy] = st.pop();
          if (fy > h + 2) continue;
          const k = fx + ',' + fy; if (air.has(k)) continue; air.add(k);
          if (stand(fx, fy)) { addS(fx, fy); continue; }
          for (const dx of [0, -1, 1]) if (free(fx + dx, fy + 1) && free(fx + dx, fy)) st.push([fx + dx, fy + 1]);
        }
      };
      const sx = Math.floor((W.spawn.x + 5) / TS), sy = Math.floor((W.spawn.y + 8) / TS);
      fall(sx, sy);
      while (q.length) {
        const [x, y] = q.shift();
        for (const d of [-1, 1]) if (free(x + d, y)) fall(x + d, y);
        if (ladder(x, y) || ladder(x, y + 1)) { if (free(x, y - 1) && (ladder(x, y - 1) || ladder(x, y))) addS(x, y - 1); if (ladder(x, y + 1)) addS(x, y + 1); }
        // atravesar plataformas de un sentido
        const tb = raw(x, y + 1);
        if ((tb === T.ONEWAY || tb === T.BRIDGE || (tb === T.BREAK && has('aluPulse'))) && free(x, y + 2)) fall(x, y + 2);
        // saltos: subir k, desplazarse horizontalmente, caer
        for (let k = 0; k <= VJ; k++) {
          let okUp = true;
          for (let u = 1; u <= k; u++) { const t = raw(x, y - u); if (t === T.SOLID || t === T.BREAK || hazard(x, y - u)) { okUp = false; break; } }
          if (!okUp) break;
          const ty = y - k;
          for (const d of [-1, 1]) {
            for (let s = 1; s <= HJ; s++) {
              if (!free(x + d * s, ty)) break;
              fall(x + d * s, ty);
              if (stand(x + d * s, ty)) addS(x + d * s, ty);
            }
          }
          if (k > 0 && stand(x, ty)) addS(x, ty);
        }
        // marcadores FETCH (dash dirigido)
        if (has('fetchDash')) for (const e of W.entities) if (e.kind === 'marker') {
          const mx = Math.floor((e.x + 5) / TS), my = Math.floor((e.y + 5) / TS);
          if (Math.abs(mx - x) * TS < 160 && Math.abs(my - y) * TS < 100) fall(mx, my);
        }
      }
      const reach = (tx, ty) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const k = (tx + dx) + ',' + (ty + dy); if (seen.has(k) || air.has(k)) return true; } return false; };
      const skip = new Set(['platform', 'trigger', 'bridge', 'collapse', 'heat', 'marker', 'deco', 'door', 'screen', 'fan']);
      const counts = {};
      for (const e of W.entities) {
        const nm = e.constructor.name;
        counts[nm] = (counts[nm] || 0) + 1;
        if (skip.has(e.kind) || e.enemy || nm === 'Deco' || nm === 'Screen' || nm === 'Nexo' || nm === 'Player') continue;
        const tx = Math.floor((e.x + e.w / 2) / TS), ty = Math.floor((e.y + e.h / 2) / TS);
        if (!reach(tx, ty)) res.unreach.push(nm + (e.id ? '#' + e.id : '') + '@' + tx + ',' + ty);
      }
      res.counts = counts;
      res.reachCells = seen.size;
      return res;
    }, i);
    await page.waitForTimeout(250);
    // avanzar unos frames para ejecutar el intro
    await page.waitForTimeout(600);
    console.log(`\n== Nivel ${r.i} ${r.key} ${r.special ? '(especial)' : r.size}`);
    if (r.issues.length) console.log('  PROBLEMAS:\n   - ' + r.issues.join('\n   - '));
    if (r.unreach && r.unreach.length) console.log('  NO ALCANZABLES (heurística): ' + r.unreach.join(' '));
    if (r.counts) console.log('  entidades: ' + Object.entries(r.counts).map(([k, v]) => k + ':' + v).join(' '));
    if (logs.length) console.log('  LOGS:\n   ' + logs.join('\n   '));
  }
  await browser.close();
})();
