#!/usr/bin/env node
// Análisis de VUELTA ATRÁS: ¿puede el jugador regresar desde cualquier punto al inicio del nivel?
// Construye el grafo de movimientos entre posiciones de apoyo (caminar, saltar, caer, escaleras,
// atravesar plataformas, FETCH DASH) con el nivel resuelto (puertas abiertas, puentes activos) y
// las habilidades disponibles al terminarlo, y señala las zonas SIN RETORNO y qué objetos quedan
// detrás de ellas. Además comprueba cada módulo transportable (sin escaleras mientras se lleva):
// no debe poder dejarse en un sitio desde el que ya no se pueda llevar a una ranura.
// Uso: node tools/backtrack.js [nivel]
'use strict';
const path = require('path');
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require('/opt/node22/lib/node_modules/playwright'); }
const file = 'file://' + path.resolve(__dirname, '..', 'index.html');
const only = process.argv[2] != null ? +process.argv[2] : null;

(async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(file); await page.waitForTimeout(400);
  const n = await page.evaluate(() => LEVELS.length);
  let bad = 0;
  for (let lv = 0; lv < n; lv++) {
    if (only != null && lv !== only) continue;
    const r = await page.evaluate((lv) => {
      if (LEVELS[lv].special) return { special: true };
      startTeacherLevel(lv);
      const W = Game.world; W.pending.length = 0;
      PROG.abilities = ABILITY_ORDER.slice(0, lv); // incluye la habilidad que se gana en este nivel
      // estado «resuelto»: puertas abiertas, puentes activos, bloques rotos si hay ALU PULSE
      for (const e of W.entities) {
        if (e.kind === 'door' && e.p.id !== 'arena') for (const [x, y] of e.p.cells) W.setTile(x, y, T.AIR);
        if (e.kind === 'bridge') for (const [x, y] of e.p.cells) W.setTile(x, y, T.BRIDGE);
      }
      const w = W.w, h = W.h, has = a => PROG.abilities.includes(a);
      const raw = (x, y) => (x < 0 || x >= w) ? T.SOLID : (y < 0 ? T.AIR : (y >= h ? T.AIR : W.tiles[y * w + x]));
      const extra = new Set();
      for (const e of W.entities) if (e.kind === 'platform') for (let k = 0; k <= 16; k++) { const X = e.x0 + (e.dxp || 0) * k / 16, Y = e.y0 + (e.dyp || 0) * k / 16; for (let tx = Math.floor(X / TS); tx <= Math.floor((X + e.w - 1) / TS); tx++) extra.add(tx + ',' + Math.floor(Y / TS)); }
      for (const e of W.entities) if (e.kind === 'collapse') for (const [x, y] of e.p.cells) extra.add(x + ',' + y);
      const solid = (x, y) => { const t = raw(x, y); return t === T.SOLID || t === T.DOOR || (t === T.BREAK && !has('aluPulse')); };
      const hazard = (x, y) => { const t = raw(x, y); return t === T.SPIKE || t === T.POOL; };
      const free = (x, y) => y >= -2 && !solid(x, y) && !hazard(x, y);
      const ground = (x, y) => { const t = raw(x, y); return t === T.SOLID || t === T.DOOR || t === T.BREAK || t === T.ONEWAY || t === T.BRIDGE || t === T.LADDER || extra.has(x + ',' + y); };
      const ladder = (x, y) => raw(x, y) === T.LADDER;
      const stand = (x, y) => free(x, y) && (ground(x, y + 1) || ladder(x, y));
      const dash = has('fetchDash') ? 3 : 0, HJ = [4 + dash, 4 + dash, 3 + dash, 2 + dash];
      const markers = W.entities.filter(e => e.kind === 'marker');
      const K = (x, y) => x + ',' + y;
      // caída con deriva lateral → posiciones de apoyo alcanzables
      const mkFall = (standF) => {
        const cache = new Map();
        return (x, y) => {
          const key = K(x, y); if (cache.has(key)) return cache.get(key);
          const out = new Set(), seen = new Set(), st = [[x, y]];
          while (st.length) { const [fx, fy] = st.pop(); if (fy > h + 2) continue; const k = K(fx, fy); if (seen.has(k)) continue; seen.add(k); if (standF(fx, fy)) { out.add(k); continue; } for (const dx of [0, -1, 1]) if (free(fx + dx, fy + 1) && free(fx + dx, fy)) st.push([fx + dx, fy + 1]); }
          cache.set(key, out); return out;
        };
      };
      const standC = (x, y) => free(x, y) && ground(x, y + 1) && !ladder(x, y);
      const fallN = mkFall(stand), fallC = mkFall(standC);
      const fall = fallN, HC = [3, 3, 3, 2];
      // carry=true: llevando un módulo no se puede usar escaleras ni dash (estimación prudente)
      const moves = (x, y, carry) => {
        const out = new Set(); const add = s => s.forEach(k => out.add(k));
        const fall = carry ? fallC : fallN, stand1 = carry ? standC : stand;
        for (const d of [-1, 1]) if (free(x + d, y)) add(fall(x + d, y));
        if (!carry && (ladder(x, y) || ladder(x, y + 1))) { if (free(x, y - 1) && (ladder(x, y - 1) || ladder(x, y))) out.add(K(x, y - 1)); if (ladder(x, y + 1)) out.add(K(x, y + 1)); }
        const tb = raw(x, y + 1);
        if ((tb === T.ONEWAY || tb === T.BRIDGE || (tb === T.BREAK && has('aluPulse'))) && free(x, y + 2)) add(fall(x, y + 2));
        for (let k = 0; k <= 3; k++) {
          let ok = true; for (let u = 1; u <= k; u++) if (solid(x, y - u) || hazard(x, y - u)) { ok = false; break; }
          if (!ok) break;
          const ty = y - k;
          if (k > 0 && stand1(x, ty)) out.add(K(x, ty));
          for (const d of [-1, 1]) for (let s = 1; s <= (carry ? HC : HJ)[k]; s++) { if (!free(x + d * s, ty)) break; if (stand1(x + d * s, ty)) out.add(K(x + d * s, ty)); else add(fall(x + d * s, ty)); }
        }
        if (has('fetchDash') && !carry) for (const m of markers) { const mx = Math.floor((m.x + 5) / TS), my = Math.floor((m.y + 5) / TS); if (mx !== x && Math.abs(mx - x) * TS < 160 && Math.abs(my - y) * TS < 100) add(fall(mx, my)); }
        out.delete(K(x, y));
        return out;
      };
      // grafo desde el inicio
      // alcance hacia delante desde «start» y conjunto de posiciones desde las que se vuelve a «goal»
      const explore = (start, carry) => {
        const adj = new Map(), q = [...start], F = new Set(start);
        while (q.length) { const k = q.shift(); const [x, y] = k.split(',').map(Number); const m = moves(x, y, carry); adj.set(k, m); for (const j of m) if (!F.has(j)) { F.add(j); q.push(j); } }
        const rev = new Map(); for (const [a, ms] of adj) for (const b of ms) { if (!rev.has(b)) rev.set(b, []); rev.get(b).push(a); }
        const back = goal => { const B = new Set(goal), q2 = [...goal]; while (q2.length) { const k = q2.shift(); for (const a of rev.get(k) || []) if (!B.has(a)) { B.add(a); q2.push(a); } } return B; };
        return { F, back };
      };
      const start = [...fall(Math.floor((W.spawn.x + 5) / TS), Math.floor((W.spawn.y + 8) / TS))];
      const { F, back } = explore(start, false), B = back(start);
      const noRet = [...F].filter(k => !B.has(k));
      // módulos transportables: ¿se pueden atascar en algún sitio del que ya no se puedan llevar a una ranura?
      const cellsNear = (e, S) => { const out = []; const x0 = Math.floor((e.x - 8) / TS), x1 = Math.floor((e.x + e.w + 8) / TS), y0 = Math.floor((e.y - 6) / TS), y1 = Math.floor((e.y + e.h + 6) / TS); for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (S.has(K(x, y))) out.push(K(x, y)); return out; };
      const sockets = W.entities.filter(e => e.kind === 'socket');
      const carryStuck = [], carried = [];
      for (const b of W.entities.filter(e => e.kind === 'block' && !(e.p.onPick && typeof L0_toBuffer !== 'undefined' && e.p.onPick === L0_toBuffer))) {
        const home = [...new Set(cellsNear(b, F).flatMap(k => { const [x, y] = k.split(',').map(Number); return [...fallC(x, y)]; }))];
        if (!home.length) continue;
        const C = explore(home, true); carried.push(b.id + '(' + C.F.size + ')');
        const goal = sockets.flatMap(so => cellsNear(so, C.F));
        const OK = C.back(goal), stuck = [...C.F].filter(k => !OK.has(k));
        if (!goal.length || stuck.length) carryStuck.push(b.id + (goal.length ? ': ' + stuck.length + ' posiciones sin vuelta (p.ej. ' + stuck.slice(0, 3).join(' ') + ')' : ': ninguna ranura alcanzable llevándolo'));
      }
      // agrupar en zonas
      const zones = [], left = new Set(noRet);
      while (left.size) {
        const s0 = left.values().next().value, comp = [s0]; left.delete(s0);
        for (let i = 0; i < comp.length; i++) { const [x, y] = comp[i].split(',').map(Number); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) { const k = K(x + dx, y + dy); if (left.has(k)) { left.delete(k); comp.push(k); } } }
        const xs = comp.map(k => +k.split(',')[0]), ys = comp.map(k => +k.split(',')[1]);
        zones.push({ n: comp.length, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) });
      }
      // objetos importantes y alcanzabilidad
      const near = (e, S) => { const x0 = Math.floor((e.x - 8) / TS), x1 = Math.floor((e.x + e.w + 8) / TS), y0 = Math.floor((e.y - 6) / TS), y1 = Math.floor((e.y + e.h + 6) / TS); for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (S.has(K(x, y))) return true; return false; };
      const kinds = ['block', 'socket', 'lever', 'terminal', 'npc', 'fragment', 'letter', 'historic', 'linknode', 'busnode', 'checkpoint', 'exit', 'plate', 'sign'];
      const unreachable = W.entities.filter(e => kinds.includes(e.kind) && !e.dead && !near(e, F)).map(e => e.kind + (e.id ? '#' + e.id : '') + '@' + Math.floor(e.x / TS) + ',' + Math.floor(e.y / TS));
      return { name: W.def.name, reach: F.size, noRet: noRet.length, zones, unreachable, carryStuck, carried };
    }, lv);
    if (r.special) continue;
    const big = r.zones.filter(z => z.n >= 2);
    console.log(`\n== Nivel ${lv} ${r.name}: ${r.reach} posiciones alcanzables · sin retorno: ${r.noRet}`);
    for (const z of big) console.log(`   ✗ zona sin retorno x ${z.x0}–${z.x1}, y ${z.y0}–${z.y1} (${z.n} posiciones)`);
    if (r.unreachable.length) console.log('   · no alcanzables (heurística): ' + r.unreachable.join(' '));
    if (r.carried.length) console.log('   · módulos transportables comprobados: ' + r.carried.join(' '));
    for (const c of r.carryStuck) console.log('   ✗ módulo que puede quedar atascado: ' + c);
    if (big.length || r.carryStuck.length) bad++;
  }
  console.log('\n' + (bad ? bad + ' nivel(es) con zonas sin retorno o módulos atascables' : 'Todos los niveles permiten volver atrás'));
  if (errors.length) console.log('ERRORES: ' + errors.join(' | '));
  await browser.close();
})();
