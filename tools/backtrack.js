#!/usr/bin/env node
// Análisis de VUELTA ATRÁS con la FÍSICA REAL del juego: ¿puede el jugador regresar desde cualquier
// punto al inicio del nivel? Cada movimiento (caminar, saltos con carrerilla o desde el borde, saltos
// verticales con giro en el aire, saltitos, escaleras, bajar por plataformas, subir a plataformas
// móviles, FETCH DASH) se SIMULA con la clase Player del juego y su colisión, con el nivel resuelto
// (puertas abiertas, puentes activos). Se construye el grafo de posiciones de apoyo y se señalan:
//  · zonas SIN RETORNO (se llega, pero ya no se puede volver al inicio),
//  · objetos que no se pueden alcanzar,
//  · módulos transportables que podrían quedar atascados (llevándolos no se usan escaleras).
// Se analiza con las habilidades del INICIO del nivel y, si el nivel da FETCH DASH o ALU PULSE
// (que cambian por dónde se puede pasar), también con ella; y por último con MARGEN (saltos ~10 % más
// bajos y carrera algo más lenta), para que volver nunca dependa de un salto perfecto.
// Uso: node tools/backtrack.js [nivel] [--verbose]
'use strict';
const path = require('path');
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require('/opt/node22/lib/node_modules/playwright'); }
const file = 'file://' + path.resolve(__dirname, '..', 'index.html');
const argLv = process.argv.slice(2).find(a => /^\d+$/.test(a));
const only = argLv != null ? +argLv : null;
const verbose = process.argv.includes('--verbose');

// ---------------------------------------------------------------- dentro de la página ----
function analyze(args) {
  const { lv, abil, margin } = args;
  if (LEVELS[lv].special) return { special: true };
  startTeacherLevel(lv);
  const W = Game.world; W.pending.length = 0;
  PROG.abilities = abil.slice();
  const has = a => PROG.abilities.includes(a);
  // estado «resuelto»: puertas abiertas (salvo la arena del jefe), puentes activos, bloques rotos con ALU PULSE
  for (const e of W.entities) {
    if (e.kind === 'door' && e.p.id !== 'arena') for (const [x, y] of e.p.cells) W.setTile(x, y, T.AIR);
    if (e.kind === 'bridge') for (const [x, y] of e.p.cells) W.setTile(x, y, T.BRIDGE);
  }
  if (has('aluPulse')) for (let i = 0; i < W.tiles.length; i++) if (W.tiles[i] === T.BREAK) W.tiles[i] = T.AIR;
  // entrada simulada y efectos silenciados
  const inp = { dir: 0, jump: false, jumpPress: false, up: false, down: false };
  const saved = { held: Input.held, pressed: Input.pressed, keyPressed: Input.keyPressed, play: AudioSys.play, burst: W.particles.burst, player: W.player, t: W.t };
  Input.held = a => a === 'right' ? inp.dir > 0 : a === 'left' ? inp.dir < 0 : a === 'jump' ? inp.jump : a === 'up' ? inp.up : a === 'down' ? inp.down : false;
  Input.pressed = a => a === 'jump' ? inp.jumpPress : false;
  Input.keyPressed = () => false;
  AudioSys.play = () => {};
  W.particles.burst = () => {};
  const plats = W.platforms = W.entities.filter(e => e.solidTop);
  const cycOf = pl => pl.p.mode === 'tick' ? 2 * (pl.p.period || 1) : pl.p.mode === 'loop' ? Math.hypot(pl.dxp, pl.dyp) / (pl.p.speed || 40) : 2 * pl.dur;
  const maxCyc = plats.length ? Math.max(...plats.map(cycOf)) : 0;
  const DT = 1 / 60, TB = 0.5;
  const setT = t => { W.t = t; for (const pl of plats) pl.preUpdate(W, DT); for (const pl of plats) { pl.mdx = 0; pl.mdy = 0; } };
  const dummyCarry = { w: 16, h: 14, drawAt() {} };
  const touched = new Set();
  const mkP = (carry) => {
    const p = new Player(W, 0, 0);
    p.findInteract = () => null; p.hurt = function () { this._dead = true; }; p.respawnSafe = function () { this._dead = true; };
    p.energy = 999; if (carry) p.carry = dummyCarry;
    W.player = p; return p;
  };
  const step = p => {
    W.t += DT; for (const pl of plats) pl.preUpdate(W, DT);
    p.update(W, DT, true); inp.jumpPress = false;
    // modo MARGEN: un jugador algo «torpe» (más gravedad al subir, algo más lento) para no depender de saltos al píxel
    if (margin && !p.climbing && p.dashT <= 0) { if (p.vy < 0) p.vy += 950 * 0.1 * DT; p.vx = Math.max(-100, Math.min(100, p.vx)); }
    const x0 = Math.floor(p.x / TS), x1 = Math.floor((p.x + p.w - 1) / TS), y0 = Math.floor(p.y / TS), y1 = Math.floor((p.y + p.h - 1) / TS);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) touched.add(x + ',' + y);
  };
  const nodeOf = p => {
    if (p.platform) { const i = plats.indexOf(p.platform); return 'p:' + i + ':' + Math.floor((W.t % cycOf(p.platform)) / TB); }
    return 'g:' + Math.floor(p.cx / TS) + ',' + Math.floor((p.y + p.h - 1) / TS);
  };
  // coloca al jugador en un nodo; devuelve false si ahí no se sostiene
  const place = (p, key, t0) => {
    const [k, a, b] = key.split(':');
    p.vx = 0; p.vy = 0; p.climbing = false; p.jumping = false; p.coyote = 0.1; p.jumpBuf = 0; p.dropT = 0; p._dead = false; p.dashT = 0; p.dashTarget = null; p.cds = {};
    if (k === 'g') {
      // en el centro de la casilla o, si ahí no hay apoyo (borde de un saliente), desplazado hacia él
      const [tx, ty] = a.split(',').map(Number);
      for (const off of [8, 4, 12, 1, 15]) {
        setT(t0 || 0);
        p.x = tx * TS + off - p.w / 2; p.y = (ty + 1) * TS - p.h; p.platform = null; p.vx = 0; p.vy = 0; p._dead = false;
        inp.dir = 0; inp.jump = inp.jumpPress = inp.up = inp.down = false;
        step(p);
        if (p.grounded && !p._dead && nodeOf(p) === key) return true;
      }
      return false;
    } else {
      const pl = plats[+a];
      setT(+b * TB + TB / 2);
      p.x = pl.x + pl.w / 2 - p.w / 2; p.y = pl.y - p.h; p.platform = pl;
    }
    inp.dir = 0; inp.jump = inp.jumpPress = inp.up = inp.down = false;
    step(p);
    return p.grounded && !p._dead;
  };
  // ejecuta un plan de entrada hasta aterrizar; devuelve el nodo destino o null
  const run = (p, plan, maxF = 300) => {
    const st = { air: false, climbed: false };
    for (let f = 0; f < maxF; f++) {
      inp.dir = 0; inp.jump = false; inp.jumpPress = false; inp.up = false; inp.down = false;
      if (plan(f, p, st) === 'stop') return null;
      step(p);
      if (p._dead) return null;
      if (p.climbing) st.climbed = true;
      if (!p.grounded && !p.climbing) st.air = true;
      if (st.end) return st.end === 'node' && p.grounded ? nodeOf(p) : null;
      if (st.air && p.grounded && !p.climbing) return nodeOf(p);
      if (st.climbed && !p.climbing && p.grounded) return nodeOf(p);
      if (st.walk && p.grounded && !p.climbing && Math.floor(p.cx / TS) !== st.tx0) return nodeOf(p);
    }
    return null;
  };
  // ---------- repertorio de movimientos ----------
  const macros = (key, carry) => {
    const L = [];
    const onPlat = key[0] === 'p';
    const spd = 106 * (carry ? 0.9 : 1);
    for (const d of [-1, 1]) {
      // caminar hasta la casilla vecina (o caer y aterrizar), con y sin soltar la dirección al caer
      L.push((f, p, st) => { if (f === 0) { st.walk = true; st.tx0 = Math.floor(p.cx / TS); } inp.dir = d; if (f > 120 && !st.air) return 'stop'; });
      L.push((f, p, st) => { inp.dir = st.air ? 0 : d; if (f > 120 && !st.air) return 'stop'; });
      // salto con carrerilla (salto largo y alto)
      L.push((f, p, st) => { if (f === 0) { p.vx = d * spd; inp.jumpPress = true; } inp.jump = true; inp.dir = d; });
      // correr hasta el borde o la pared y saltar
      L.push((f, p, st) => {
        if (!st.ph) { inp.dir = d; if (f > 0 && (!p.grounded || p.hitWall)) { st.ph = 1; inp.jumpPress = true; inp.jump = true; st.air = false; } else if (f > 150) return 'stop'; else st.air = false; }
        else { inp.dir = d; inp.jump = true; }
      });
      // salto vertical y giro en el aire (para subir a un saliente)
      for (const s of [6, 14, 22]) L.push((f, p, st) => { if (f === 0) inp.jumpPress = true; inp.jump = true; inp.dir = f >= s ? d : 0; });
      // saltito (soltar el salto pronto)
      L.push((f, p, st) => { if (f === 0) { p.vx = d * spd; inp.jumpPress = true; } inp.jump = f < 6; inp.dir = d; });
      // salto largo que se detiene en el aire (para no pasarse de una plataforma estrecha)
      for (const s of [16, 26]) L.push((f, p, st) => { if (f === 0) { p.vx = d * spd; inp.jumpPress = true; } inp.jump = true; inp.dir = f < s ? d : 0; });
      if (!carry) {
        // saltar y agarrarse a una escalera en el aire, luego subir
        L.push((f, p, st) => { if (f === 0) { p.vx = d * spd; inp.jumpPress = true; } inp.jump = !p.climbing; inp.up = true; inp.dir = p.climbing ? 0 : d; });
        L.push((f, p, st) => { if (f === 0) inp.jumpPress = true; inp.jump = !p.climbing; inp.up = true; inp.dir = p.climbing || f < 10 ? 0 : d; });
        // FETCH DASH: desde el suelo o en mitad de un salto
        if (has('fetchDash')) {
          // (tras llegar al marcador se puede seguir en esa dirección o quedarse quieto encima)
          for (const keep of [true, false]) {
            L.push((f, p, st) => { if (f === 0) { p.facing = d; W.ab_fetchDash(p); } inp.dir = keep && f > 10 ? d : 0; if (f > 0 && p.dashT <= 0) st.air = true; });
            for (const s of [10, 20]) L.push((f, p, st) => { if (f === 0) { p.vx = d * spd; inp.jumpPress = true; } inp.jump = true; inp.dir = f < s || (keep && p.dashT <= 0) ? d : 0; if (f === s) { p.facing = d; W.ab_fetchDash(p); } });
          }
        }
      }
    }
    // atravesar una plataforma de un sentido hacia abajo
    for (const d of [-1, 0, 1]) L.push((f, p, st) => { if (f === 0) { if (!p.onOneWay) return 'stop'; inp.jumpPress = true; } inp.down = f < 4; inp.dir = f > 4 ? d : 0; });
    if (!carry) {
      // escaleras: subir hasta arriba, bajar hasta abajo, o saltar a los lados a media escalera
      L.push((f, p, st) => { if (f === 0 && W.ladderAt(p) < 0) return 'stop'; inp.up = true; if (f > 900) return 'stop'; });
      for (const d of [-1, 0, 1]) L.push((f, p, st) => {
        if (f === 0 && W.ladderAt(p) < 0) return 'stop';
        if (!st.ph) { inp.down = true; if (p.climbing && p.grounded) { st.g = (st.g || 0) + 1; if (st.g > 3) { st.ph = 1; inp.down = false; inp.jumpPress = true; inp.dir = d; st.climbed = false; st.air = false; } } if (f > 900) return 'stop'; }
        else inp.dir = d;
      });
      for (let c = 12; c <= 600; c += 12) for (const d of [-1, 1]) L.push((f, p, st) => {
        if (f === 0 && W.ladderAt(p) < 0) return 'stop';
        if (f < c) { inp.up = true; if (f > 2 && !p.climbing) return 'stop'; }
        else if (f === c) { inp.jumpPress = true; inp.dir = d; inp.jump = true; st.climbed = false; }
        else { inp.dir = d; inp.jump = true; }
      });
    }
    // sobre una plataforma móvil: dejarse llevar medio segundo
    if (onPlat) L.push((f, p, st) => { if (f >= 30) st.end = 'node'; });
    return L;
  };
  // ---------- exploración ----------
  const nearPlat = key => {
    if (!plats.length || key[0] !== 'g') return false;
    const [tx, ty] = key.slice(2).split(',').map(Number);
    return plats.some(pl => tx * TS > Math.min(pl.x0, pl.x0 + pl.dxp) - 12 * TS && tx * TS < Math.max(pl.x0, pl.x0 + pl.dxp) + pl.w + 12 * TS && Math.abs(ty * TS - pl.y0) < 10 * TS + Math.abs(pl.dyp));
  };
  const explore = (start, carry) => {
    const adj = new Map(), F = new Set(start), q = [...start];
    const p = mkP(carry);
    while (q.length) {
      const key = q.shift(), out = new Set();
      const times = nearPlat(key) ? Array.from({ length: Math.min(40, Math.ceil(maxCyc / 0.25)) }, (_, i) => i * 0.25) : [0];
      for (const plan of macros(key, carry)) for (const t0 of times) {
        if (!place(p, key, t0)) break;
        const r = run(p, plan);
        if (r && r !== key) out.add(r);
      }
      adj.set(key, out);
      for (const j of out) if (!F.has(j)) { F.add(j); q.push(j); }
    }
    const rev = new Map(); for (const [a, ms] of adj) for (const b of ms) { if (!rev.has(b)) rev.set(b, []); rev.get(b).push(a); }
    const back = goal => { const B = new Set(goal), q2 = [...goal]; while (q2.length) { const k = q2.shift(); for (const a of rev.get(k) || []) if (!B.has(a)) { B.add(a); q2.push(a); } } return B; };
    return { F, back, adj };
  };
  // nodo inicial: dejar caer al jugador desde el punto de aparición
  const p0 = mkP(false); setT(0);
  p0.x = W.spawn.x; p0.y = W.spawn.y; p0.vx = p0.vy = 0;
  let spawnKey = null; for (let f = 0; f < 240 && !spawnKey; f++) { inp.dir = 0; step(p0); if (p0.grounded) spawnKey = nodeOf(p0); }
  const start = [spawnKey];
  const { F, back } = explore(start, false), B = back(start);
  const noRet = [...F].filter(k => !B.has(k) && k[0] === 'g').map(k => k.slice(2));
  // agrupar en zonas
  const zones = [], left = new Set(noRet);
  while (left.size) {
    const s0 = left.values().next().value, comp = [s0]; left.delete(s0);
    for (let i = 0; i < comp.length; i++) { const [x, y] = comp[i].split(',').map(Number); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) { const k = (x + dx) + ',' + (y + dy); if (left.has(k)) { left.delete(k); comp.push(k); } } }
    const xs = comp.map(k => +k.split(',')[0]), ys = comp.map(k => +k.split(',')[1]);
    zones.push({ n: comp.length, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys), cells: comp.sort() });
  }
  // objetos: alcanzables si el cuerpo del jugador llega a tocarlos en algún movimiento
  const reachRect = e => { const x0 = Math.floor((e.x - 6) / TS), x1 = Math.floor((e.x + e.w + 6) / TS), y0 = Math.floor((e.y - 4) / TS), y1 = Math.floor((e.y + e.h + 4) / TS); for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (touched.has(x + ',' + y)) return true; return false; };
  const kinds = ['block', 'socket', 'lever', 'terminal', 'npc', 'fragment', 'letter', 'historic', 'linknode', 'busnode', 'checkpoint', 'exit', 'plate', 'sign'];
  const unreachable = W.entities.filter(e => kinds.includes(e.kind) && !e.dead && !reachRect(e)).map(e => e.kind + (e.id ? '#' + e.id : '') + '@' + Math.floor(e.x / TS) + ',' + Math.floor(e.y / TS));
  // módulos transportables (los del búfer del Boot Camp se copian solos y no se llevan)
  const gF = [...F].filter(k => k[0] === 'g');
  const nodesNear = e => gF.filter(k => { const [x, y] = k.slice(2).split(',').map(Number); return x * TS + 16 > e.x - 10 && x * TS < e.x + e.w + 10 && Math.abs((y + 1) * TS - (e.y + e.h)) <= 10; });
  const sockets = W.entities.filter(e => e.kind === 'socket');
  const carryStuck = [], carried = [];
  for (const b of W.entities.filter(e => e.kind === 'block' && !(e.p.onPick && typeof L0_toBuffer !== 'undefined' && e.p.onPick === L0_toBuffer))) {
    const home = nodesNear(b); if (!home.length) continue;
    const C = explore(home, true);
    const sockNodes = new Set(sockets.flatMap(so => nodesNear(so)));
    const goal = [...C.F].filter(k => sockNodes.has(k));
    carried.push(b.id + '(' + C.F.size + ')');
    const OK = C.back(goal), stuck = [...C.F].filter(k => !OK.has(k) && k[0] === 'g').map(k => k.slice(2));
    if (!goal.length) carryStuck.push(b.id + ': ninguna ranura alcanzable llevándolo');
    else if (stuck.length) carryStuck.push(b.id + ': ' + stuck.length + ' posiciones desde las que ya no se puede llevar a una ranura: ' + stuck.slice(0, 8).join(' '));
  }
  // restaurar
  Object.assign(Input, { held: saved.held, pressed: saved.pressed, keyPressed: saved.keyPressed });
  AudioSys.play = saved.play; W.particles.burst = saved.burst; W.player = saved.player; W.t = saved.t;
  return { name: W.def.name, reach: F.size, noRet: noRet.length, zones, unreachable, carryStuck, carried, spawn: spawnKey };
}

if (require.main === module) (async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(file); await page.waitForTimeout(400);
  const { n, order } = await page.evaluate(() => ({ n: LEVELS.length, order: ABILITY_ORDER }));
  let bad = 0;
  for (let lv = 0; lv < n; lv++) {
    if (only != null && lv !== only) continue;
    // habilidades al empezar el nivel y al terminarlo (la del nivel se gana a mitad)
    const startAb = order.slice(0, Math.max(0, lv - 1)), endAb = order.slice(0, lv);
    const passes = [['inicio', startAb]];
    const gained = endAb.find(a => !startAb.includes(a));
    if (gained === 'fetchDash' || gained === 'aluPulse') passes.push(['con ' + (gained === 'fetchDash' ? 'FETCH DASH' : 'ALU PULSE'), endAb]);
    passes.push(['con margen: salto y carrera algo más cortos', endAb, true]);
    for (const [pi, [label, abil, margin]] of passes.entries()) {
      const last = pi === passes.length - 1;
      const t0 = Date.now();
      const r = await page.evaluate(analyze, { lv, abil, margin: !!margin });
      if (r.special) break;
      console.log(`\n== Nivel ${lv} ${r.name} [${label}]: ${r.reach} posiciones · sin retorno: ${r.noRet} · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
      for (const z of r.zones) console.log(`   ✗ zona sin retorno x ${z.x0}–${z.x1}, y ${z.y0}–${z.y1} (${z.n} posiciones)` + (verbose ? ': ' + z.cells.join(' ') : ''));
      // lo que no se alcanza sin la habilidad del nivel es normal; sólo cuenta el último análisis
      if (r.unreachable.length && last) console.log('   ✗ no alcanzables: ' + r.unreachable.join(' '));
      else if (r.unreachable.length && verbose) console.log('   · aún sin la habilidad: ' + r.unreachable.join(' '));
      if (r.carried.length) console.log('   · módulos transportables comprobados: ' + r.carried.join(' '));
      for (const c of r.carryStuck) console.log('   ✗ módulo que puede quedar atascado: ' + c);
      if (r.zones.length || r.carryStuck.length || (last && r.unreachable.length)) bad++;
    }
  }
  console.log('\n' + (bad ? bad + ' análisis con zonas sin retorno, objetos inalcanzables o módulos atascables' : 'Todos los niveles permiten volver atrás y todo es alcanzable'));
  if (errors.length) console.log('ERRORES: ' + errors.join(' | '));
  await browser.close();
})();
module.exports = { analyze };
