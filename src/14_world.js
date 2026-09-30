// =============================================================================
// MUNDO: tilemap, cámara, partículas, colisiones, habilidades, API de scripts
// =============================================================================
const ABILITIES = {
  circuitLink: { n: 'CIRCUIT LINK', cost: 20, cd: 0.6, col: '#71FF9A', d: 'Crea conexiones temporales entre nodos de circuito. Sólo funcionan las conexiones válidas.' },
  fetchDash: { n: 'FETCH DASH', cost: 20, cd: 0.5, col: '#45E5FF', d: 'Desplazamiento rápido hacia un marcador de instrucción (o un tramo corto al frente).' },
  aluPulse: { n: 'ALU PULSE', cost: 25, cd: 0.9, col: '#F1B45C', d: 'Onda lógica: invierte interruptores, rompe bloques corruptos y restaura bits.' },
  cacheBoost: { n: 'CACHE BOOST', cost: 40, cd: 9, col: '#AA7DFF', d: 'Acelera movimiento y acciones durante unos segundos. Anula la latencia de CacheMiss.' },
  busBridge: { n: 'BUS BRIDGE', cost: 30, cd: 1, col: '#F1B45C', d: 'Conecta dos nodos eligiendo origen, destino y tipo de señal. Reencamina a BusError.' },
  interruptShield: { n: 'INTERRUPT SHIELD', cost: 35, cd: 6, col: '#FF5964', d: 'Una interrupción: detiene proyectiles y señales, y congela enemigos cercanos.' },
  parallelClone: { n: 'PARALLEL CLONE', cost: 30, cd: 2, col: '#71FF9A', d: 'Un clon mantiene su posición y replica tus ataques: dos acciones a la vez.' },
  registerRecall: { n: 'REGISTER RECALL', cost: 15, cd: 0.8, col: '#E8F4F7', d: 'Guarda tu posición en un registro; úsala de nuevo para volver. Revela punteros nulos.' }
};
const ABILITY_ORDER = ['circuitLink', 'fetchDash', 'aluPulse', 'cacheBoost', 'busBridge', 'interruptShield', 'parallelClone', 'registerRecall'];

// ---------------------------------------------------------------- CÁMARA ----
class Camera {
  constructor(W0) { this.w0 = W0; this.x = 0; this.y = 0; this.look = 0; this.lockT = null; }
  snap(p) { this.x = p.x + p.w / 2 - W / 2; this.y = p.y + p.h / 2 - H / 2 - 12; this.clamp(); }
  clamp() {
    const mw = this.w0.w * TS, mh = this.w0.h * TS;
    this.x = mw <= W ? (mw - W) / 2 : clamp(this.x, 0, mw - W);
    this.y = mh <= H ? (mh - H) / 2 : clamp(this.y, 0, mh - H);
  }
  update(dt, p) {
    let tx, ty;
    if (this.lockT) { tx = this.lockT.x - W / 2; ty = this.lockT.y - H / 2; }
    else {
      this.look = lerp(this.look, p.facing * 28, 1 - Math.exp(-dt * 2.5));
      tx = p.x + p.w / 2 - W / 2 + this.look;
      ty = p.y + p.h / 2 - H / 2 - 12;
      const dzx = 20, dzy = 26;
      if (Math.abs(tx - this.x) < dzx) tx = this.x; else tx = tx - Math.sign(tx - this.x) * dzx;
      if (Math.abs(ty - this.y) < dzy) ty = this.y; else ty = ty - Math.sign(ty - this.y) * dzy;
    }
    const k = 1 - Math.exp(-dt * (this.lockT ? 3 : 7));
    this.x = lerp(this.x, tx, k); this.y = lerp(this.y, ty, k);
    this.clamp();
  }
}

// ---------------------------------------------------------------- PARTÍCULAS (pool fijo) ----
class Particles {
  constructor(n) { this.pool = new Pool(n, () => ({ active: false })); this.max = n; }
  spawn(o) {
    const p = this.pool.get();
    p.active = true; p.x = o.x; p.y = o.y; p.vx = o.vx || 0; p.vy = o.vy || 0; p.life = p.max = o.life || 0.6;
    p.col = o.col || PAL.white; p.g = o.g == null ? 0 : o.g; p.size = o.size || 1; p.kind = o.kind || 'dot'; p.ch = o.ch || ''; p.drag = o.drag || 0;
    return p;
  }
  burst(x, y, n, o = {}) {
    const lim = Game.lowFx ? Math.ceil(n / 2) : n;
    for (let i = 0; i < lim; i++) {
      const a = o.dir != null ? o.dir + rand(-o.spread || -0.5, o.spread || 0.5) : rand(0, Math.PI * 2);
      const sp = rand(o.min || 20, o.max || 90);
      this.spawn({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(o.lmin || 0.3, o.lmax || 0.8), col: Array.isArray(o.col) ? pick(o.col) : o.col, g: o.g, size: o.size || 1, kind: o.kind, ch: o.kind === 'bit' ? (Math.random() < 0.5 ? '0' : '1') : '', drag: o.drag });
    }
  }
  update(dt) {
    for (const p of this.pool.items) {
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) { p.active = false; continue; }
      p.vy += p.g * dt;
      if (p.drag) { p.vx *= 1 - p.drag * dt; p.vy *= 1 - p.drag * dt; }
      p.x += p.vx * dt; p.y += p.vy * dt;
    }
  }
  render(g, cx, cy) {
    for (const p of this.pool.items) {
      if (!p.active) continue;
      const x = Math.round(p.x), y = Math.round(p.y);
      if (x < cx - 8 || x > cx + W + 8 || y < cy - 8 || y > cy + H + 8) continue;
      const f = p.life / p.max;
      if (p.kind === 'bit') { g.globalAlpha = Math.min(1, f * 2); Font.draw(g, p.ch, x, y - 4, p.col); g.globalAlpha = 1; continue; }
      g.fillStyle = p.col;
      if (p.kind === 'smoke') { g.globalAlpha = f * 0.5; const s = Math.round(p.size + (1 - f) * 4); g.fillRect(x - s / 2, y - s / 2, s, s); g.globalAlpha = 1; }
      else if (p.kind === 'glitch') { g.globalAlpha = f; g.fillRect(x, y, Math.round(4 + p.size * 6), 1); g.globalAlpha = 1; }
      else if (p.kind === 'heal') { g.globalAlpha = f; g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); g.globalAlpha = 1; }
      else { const s = f > 0.5 ? p.size : Math.max(1, p.size - 1); g.fillRect(x, y, s, s); }
    }
  }
}

// ---------------------------------------------------------------- MUNDO ----
const ZONE_TYPES = new Set(['door', 'trigger', 'bridge', 'heat', 'collapse', 'water']);
// distancia de un punto al rectángulo de una entidad (para enemigos grandes como los guardianes)
const rectDist = (x, y, e) => Math.hypot(Math.max(e.x - x, 0, x - (e.x + e.w)), Math.max(e.y - y, 0, y - (e.y + e.h)));
const entDist = (x, y, e) => (e.big ? rectDist(x, y, e) : dist(e.x + e.w / 2, e.y + e.h / 2, x, y));
class World {
  constructor(def, o = {}) {
    this.def = def; this.index = def.id;
    this.theme = getTheme(def.theme);
    this.entities = []; this.byId = {}; this.projectiles = [];
    this.particles = new Particles(420);
    this.scripts = new ScriptRunner();
    this.barks = []; this.tipBox = null; this.t = 0; this.levelTime = 0;
    this.shakeT = 0; this.shakeMag = 0; this.flashT = 0; this.flashCol = '#FFFFFF'; this.glitchT = 0; this.glitchKind = 'null';
    this.lockCount = 0; this.tintMode = def.tint || null; this.darkness = def.darkness || 0;
    this.damageTaken = false; this.echoCd = 40; this.heat = 0; this.levelHud = null;
    this.screenMsgs = {};
    this.labelQ = [];
    this.pending = []; this.ready = false; this.v = {};
    this.parseMap(def);
    this.cam = new Camera(this);
    const cp = o.fromCheckpoint && PROG.checkpoint && PROG.checkpoint.level === def.id ? PROG.checkpoint : null;
    const sx = cp ? cp.x : this.spawn.x, sy = cp ? cp.y : this.spawn.y;
    this.player = new Player(this, sx, sy);
    this.nexo = new Nexo(this);
    if (PROG.flags.nexoAway || def.noNexo) this.nexo.hidden = true;
    this.cam.snap(this.player);
    // enemigos extra del nivel: [tipo, casilla x, casilla y, propiedades]
    for (const [t, x, y, pp] of def.spawns || []) { const e = makeEntity(t, x, y, Object.assign({}, pp || {}), this); if (e) this.addEntity(e); }
    if (def.onLoad) def.onLoad(this, !!cp);
    this.entities.forEach(e => e.init && e.init(this));
    Guardians.setup(this);
    this.depthDirty = true;
    // instantánea para «REINICIAR NIVEL»: al entrar (tras la introducción), salvo al reanudar un nivel que ya la tiene
    // (checkpoint, muerte o partida guardada: aunque no haya checkpoint, se conserva la del inicio)
    this.snapPending = !o.restart && !(o.fromCheckpoint && PROG.levelSnap && PROG.levelSnap.level === def.id);
    this.placeProps();
    this.initAmbient();
    const key = 'L' + def.id + '_entered';
    if (!cp && def.intro && !PROG.flags[key]) { PROG.flags[key] = true; this.run(def.intro, 'intro'); }
    PROG.flags[key] = true;
    PROG.level = def.id;
  }
  // ---------- mapa ----------
  parseMap(def) {
    const rows = def.map;
    this.h = rows.length; this.w = Math.max(...rows.map(r => r.length));
    this.tiles = new Uint8Array(this.w * this.h);
    this.spawn = { x: 32, y: 32 };
    const zones = {};
    let frag = 0, cpn = 0;
    const legend = def.legend || {};
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const ch = rows[y][x] || '.';
      const i = y * this.w + x;
      switch (ch) {
        case '.': case ' ': break;
        case '#': this.tiles[i] = T.SOLID; break;
        case '=': this.tiles[i] = T.ONEWAY; break;
        case '^': this.tiles[i] = T.SPIKE; break;
        case '~': this.tiles[i] = T.POOL; break;
        case 'H': this.tiles[i] = T.LADDER; break;
        case 'X': this.tiles[i] = T.BREAK; break;
        case 'P': this.spawn = { x: x * TS + 3, y: (y + 1) * TS - 15 }; break;
        case 'C': this.addEntity(makeEntity('checkpoint', x, y, { id: 'cp' + (cpn++) }, this)); break;
        case 'E': this.addEntity(makeEntity('exit', x, y, Object.assign({}, def.exit || {}), this)); break;
        case '*': this.addEntity(makeEntity('fragment', x, y, { fid: (def.fragments || [])[frag++] }, this)); break;
        default: {
          const L = legend[ch];
          if (!L) { console.warn('Carácter sin leyenda', ch, def.key); break; }
          if (ZONE_TYPES.has(L.type)) { (zones[ch] = zones[ch] || []).push([x, y]); if (L.type === 'door') this.tiles[i] = T.DOOR; }
          else { const e = makeEntity(L.type, x, y, Object.assign({}, L), this); if (e) this.addEntity(e); }
          if (L.tile) this.tiles[i] = L.tile;
        }
      }
    }
    // agrupar zonas conectadas
    for (const ch in zones) {
      const cells = zones[ch], set = new Set(cells.map(c => c[0] + ',' + c[1])), seen = new Set();
      for (const c of cells) {
        const k = c[0] + ',' + c[1];
        if (seen.has(k)) continue;
        const comp = [], st = [c]; seen.add(k);
        while (st.length) {
          const [cx, cy] = st.pop(); comp.push([cx, cy]);
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const kk = (cx + dx) + ',' + (cy + dy);
            if (set.has(kk) && !seen.has(kk)) { seen.add(kk); st.push([cx + dx, cy + dy]); }
          }
        }
        const L = legend[ch];
        const e = makeEntity(L.type, 0, 0, Object.assign({}, L, { cells: comp }), this);
        if (e) this.addEntity(e);
      }
    }
  }
  addEntity(e) { if (!e) return e; this.entities.push(e); if (e.id) this.byId[e.id] = e; return e; }
  ent(id) { return this.byId[id] || null; }
  tile(tx, ty) {
    if (tx < 0 || tx >= this.w) return T.SOLID;
    if (ty < 0 || ty >= this.h) return T.AIR;
    return this.tiles[ty * this.w + tx];
  }
  setTile(tx, ty, t) { if (tx >= 0 && ty >= 0 && tx < this.w && ty < this.h && this.tiles[ty * this.w + tx] !== t) { this.tiles[ty * this.w + tx] = t; this.depthDirty = true; } }
  solidAt(px, py) { return isSolidT(this.tile(Math.floor(px / TS), Math.floor(py / TS))); }
  rectSolid(x, y, w, h) {
    const x0 = Math.floor(x / TS), x1 = Math.floor((x + w - 0.01) / TS), y0 = Math.floor(y / TS), y1 = Math.floor((y + h - 0.01) / TS);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (isSolidT(this.tile(tx, ty))) return true;
    return false;
  }
  // Movimiento con colisiones AABB contra tiles (sólidos, un sentido, escaleras) y plataformas móviles
  move(e, dt) {
    e.x += e.vx * dt;
    const y0 = Math.floor(e.y / TS), y1 = Math.floor((e.y + e.h - 0.01) / TS);
    if (e.vx > 0) {
      const tx = Math.floor((e.x + e.w - 0.01) / TS);
      for (let ty = y0; ty <= y1; ty++) if (isSolidT(this.tile(tx, ty))) { e.x = tx * TS - e.w; e.vx = 0; e.hitWall = 1; break; }
    } else if (e.vx < 0) {
      const tx = Math.floor(e.x / TS);
      for (let ty = y0; ty <= y1; ty++) if (isSolidT(this.tile(tx, ty))) { e.x = (tx + 1) * TS; e.vx = 0; e.hitWall = -1; break; }
    }
    const prevBottom = e.y + e.h;
    e.y += e.vy * dt;
    e.grounded = false; e.onOneWay = false;
    const x0 = Math.floor(e.x / TS), x1 = Math.floor((e.x + e.w - 0.01) / TS);
    if (e.vy >= 0) {
      const ty = Math.floor((e.y + e.h - 0.01) / TS);
      for (let tx = x0; tx <= x1; tx++) {
        const t = this.tile(tx, ty);
        let land = isSolidT(t);
        if (!land && !e.dropT && prevBottom <= ty * TS + 1) {
          if (isOneWayT(t)) { land = true; e.onOneWay = true; }
          else if (t === T.LADDER && this.tile(tx, ty - 1) !== T.LADDER && !e.climbing) { land = true; e.onOneWay = true; }
        }
        if (land) { e.y = ty * TS - e.h; e.vy = 0; e.grounded = true; break; }
      }
    } else {
      const ty = Math.floor(e.y / TS);
      for (let tx = x0; tx <= x1; tx++) if (isSolidT(this.tile(tx, ty))) { e.y = (ty + 1) * TS; e.vy = 0; e.hitHead = true; break; }
    }
    // plataformas móviles (sólo desde arriba)
    if (e.canRide && e.vy >= 0 && !e.grounded) {
      for (const p of this.platforms || []) {
        if (!p.solidTop) continue;
        if (e.x + e.w > p.x + 1 && e.x < p.x + p.w - 1 && prevBottom <= p.y + 2 + Math.max(0, p.dy || 0) && e.y + e.h >= p.y) {
          e.y = p.y - e.h; e.vy = 0; e.grounded = true; e.platform = p; e.onOneWay = true; break;
        }
      }
    }
  }
  hazardAt(e) {
    const x0 = Math.floor((e.x + 2) / TS), x1 = Math.floor((e.x + e.w - 2.01) / TS), y0 = Math.floor((e.y + 2) / TS), y1 = Math.floor((e.y + e.h - 1.01) / TS);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const t = this.tile(tx, ty);
      if (t === T.SPIKE && e.y + e.h > ty * TS + 8) return true;
      if (t === T.POOL && e.y + e.h > ty * TS + 5) return true;
    }
    return false;
  }
  ladderAt(e) {
    const cx = Math.floor((e.x + e.w / 2) / TS), y0 = Math.floor((e.y + 2) / TS), y1 = Math.floor((e.y + e.h) / TS);
    for (let ty = y0; ty <= y1; ty++) if (this.tile(cx, ty) === T.LADDER) return cx;
    return -1;
  }
  // ---------- API de scripts ----------
  run(gen, name, blocking = true) {
    const fn = typeof gen === 'function' ? gen.bind(null, this) : gen;
    if (!this.ready) { this.pending.push([fn, name, blocking]); return null; }
    return this.scripts.run(fn, { name, blocking });
  }
  *say(lines, o = {}) {
    const sig = Task.signal();
    Game.push(new DialogueState(lines, Object.assign({}, o, { world: this, onDone: r => sig.finish(r) })));
    const r = yield sig;
    return r;
  }
  *challenge(ref, o = {}) {
    let ch = null;
    if (typeof ref === 'object' && ref && ref.type) ch = ref;
    else if (typeof ref === 'string' && QM.get(ref)) ch = QM.get(ref);
    else if (typeof ref === 'string' && CONCEPTS[ref]) ch = QM.pick(ref, o);
    else if (ref && ref.concept) ch = QM.pick(ref.concept, Object.assign({}, o, ref));
    const sig = challengeTask(ch, Object.assign({ source: 'terminal' }, o));
    const r = yield sig;
    return r;
  }
  *prompt(title, options, o = {}) {
    const sig = Task.signal();
    Game.push(new ChoicePromptState(title, options, Object.assign({}, o, { onDone: r => sig.finish(r) })));
    const r = yield sig;
    return r;
  }
  *read(title, text, o = {}) {
    const sig = Task.signal();
    Game.push(new ReaderState(title, text, Object.assign({}, o, { onDone: () => sig.finish() })));
    yield sig;
  }
  bark(s, t, e, dur) {
    this.barks.push({ s, t: Font.norm(t), e, time: 0, dur: dur || clamp(1.6 + Font.count(t) * 0.055, 2, 7) });
    if (s === 'NEXO' && e) this.nexo.emote(e, 3);
  }
  tip(key, text) {
    if (key && PROG.flags['tip_' + key]) return;
    if (key) PROG.flags['tip_' + key] = true;
    this.tipBox = { text, time: 0, dur: 6 };
  }
  flag(k, v = true) { PROG.flags[k] = v; }
  has(k) { return !!PROG.flags[k]; }
  lock() { this.lockCount++; }
  unlock() { this.lockCount = Math.max(0, this.lockCount - 1); }
  *camTo(x, y, dur = 1) { this.cam.lockT = { x, y }; yield dur; }
  camFollow() { this.cam.lockT = null; }
  *walkTo(x, maxT = 4) {
    this.player.auto = x;
    let t = 0;
    while (Math.abs(this.player.x + this.player.w / 2 - x) > 3 && t < maxT) { t += 1 / 60; yield; }
    this.player.auto = null; this.player.vx = 0;
  }
  shake(mag = 3, t = 0.3) { if (Settings.data.reduceShake) mag *= 0.3; this.shakeMag = Math.max(this.shakeMag, mag); this.shakeT = Math.max(this.shakeT, t); }
  flash(col = '#FFFFFF', t = 0.3) { if (Settings.data.reduceFlash) return; this.flashCol = col; this.flashT = t; this.flashMax = t; }
  glitch(t = 0.4, kind = 'null') { this.glitchT = Math.max(this.glitchT, Settings.data.reduceFlash ? t * 0.3 : t); this.glitchKind = kind; }
  sfx(n, cap) { AudioSys.play(n, cap ? { caption: cap } : {}); }
  music(id) { AudioSys.playMusic(id); }
  giveAbility(k) {
    if (PROG.abilities.includes(k)) return;
    PROG.abilities.push(k);
    PROG.selAbility = PROG.abilities.length - 1;
    const a = ABILITIES[k];
    AudioSys.play('levelup');
    UI.toast('HABILIDAD: ' + a.n, a.col);
    this.flash(a.col, 0.4);
    this.particles.burst(this.player.x + 5, this.player.y + 8, 30, { col: [a.col, PAL.white], max: 120, lmax: 1 });
    const nodeHint = k === 'circuitLink' || k === 'busBridge' ? '  Junto a un nodo también puedes pulsar [' + Input.label('interact') + '].' : '';
    this.tip(null, a.n + ': ' + a.d + '  [' + Input.label('ability') + '] usar · [' + Input.label('nextAbility') + '] cambiar.' + nodeHint);
  }
  codex(id, silent) { Codex.unlock(id, silent); }
  blueprint(ids, silent) { Blueprint.reveal(ids, silent); }
  quest(id, st = 'start') { if (st === 'start') Quests.start(id); else Quests.complete(id); }
  xp(n, r) { Progression.addXP(n, r); }
  openDoor(id) { const d = this.ent(id); if (d && d.open) d.open(this); }
  closeDoor(id) { const d = this.ent(id); if (d && d.close) d.close(this); }
  screenMsg(id, text, col, dur) { this.screenMsgs[id] = { text, col: col || PAL.violet, t: 0, dur: dur || 999 }; }
  tint(mode) { this.tintMode = mode; }
  save() { Game.save(); }
  complete() {
    if (this.completed) return;
    this.completed = true;
    Game.completeLevel(this);
  }
  spawnEnt(type, x, y, props = {}) {
    const e = makeEntity(type, Math.floor(x / TS), Math.floor(y / TS), props, this);
    if (e) {
      if (props.px != null) {
        e.x = props.px; e.y = props.py;
        if ('baseY' in e) e.baseY = e.y;
        if ('baseX' in e) e.baseX = e.x;
        if ('homeX' in e) { e.homeX = e.x; e.homeY = e.y; }
      }
      this.addEntity(e); e.init && e.init(this);
    }
    return e;
  }
  enemiesNear(x, y, r) { return this.entities.filter(e => e.enemy && !e.dead && entDist(x, y, e) < r); }

  // ---------- habilidades ----------
  useAbility() {
    const p = this.player;
    const k = PROG.abilities[PROG.selAbility];
    if (!k) { this.tip('noab', 'Aún no tienes habilidades. Se desbloquean reparando cada región.'); return; }
    const a = ABILITIES[k];
    if (p.cds[k] > 0) return;
    if (p.energy < a.cost) { UI.toast('ENERGÍA INSUFICIENTE', PAL.red); AudioSys.play('ui_back'); return; }
    const ok = this['ab_' + k](p, a);
    if (ok !== false) { p.energy -= a.cost; p.cds[k] = a.cd; p.abilityPose = 0.3; }
  }
  nearest(filter, r) {
    const p = this.player, px = p.x + p.w / 2, py = p.y + p.h / 2;
    let best = null, bd = r;
    for (const e of this.entities) { if (e.dead || !filter(e)) continue; const d = dist(px, py, e.x + e.w / 2, e.y + e.h / 2); if (d < bd) { bd = d; best = e; } }
    return best;
  }
  ab_circuitLink(p) {
    const node = this.nearest(e => e.kind === 'linknode', 48);
    if (!node) { UI.toast('No hay nodos de circuito cerca', PAL.gray); return false; }
    this.run(function* (W) { yield* node.linkPrompt(W); }, 'link');
  }
  ab_busBridge(p) {
    const be = this.nearest(e => e.kind === 'buserror' && !e.dead, 72) || this.entities.find(e => e.reroute && e.big && !e.dead && e.state === 'fight' && rectDist(p.cx, p.y + 7, e) < 64);
    if (be) { this.run(function* (W) { yield* be.reroute(W); }, 'reroute'); return; }
    const node = this.nearest(e => e.kind === 'busnode', 48);
    if (!node) { UI.toast('No hay nodos de bus cerca', PAL.gray); return false; }
    this.run(function* (W) { yield* node.bridgePrompt(W); }, 'bridge');
  }
  ab_fetchDash(p) {
    const m = this.nearest(e => e.kind === 'marker' && Math.sign(e.x - p.x) === p.facing && Math.abs(e.y - p.y) < 100 && Math.abs(e.x - p.x) > 12, 160);
    AudioSys.play('dash');
    if (m) p.dashTo(m.x + m.w / 2 - p.w / 2, m.y + m.h / 2 - p.h / 2);
    else p.dash(p.facing);
  }
  ab_aluPulse(p) {
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2, R = 46;
    AudioSys.play('pulse');
    this.spawnFx('ring', cx, cy, { r: R, col: PAL.amber });
    this.shake(2, 0.2);
    for (const e of this.entities) {
      if (e.dead) continue;
      const d = entDist(cx, cy, e);
      if (d > R + 8) continue;
      if (e.enemy) e.hit(this, 2, cx, 'pulse');
      if (e.onPulse) e.onPulse(this);
    }
    if (this.def.onPulse) this.def.onPulse(this, cx, cy, R);
    const r0 = Math.ceil(R / TS);
    const tx0 = Math.floor(cx / TS), ty0 = Math.floor(cy / TS);
    for (let ty = ty0 - r0; ty <= ty0 + r0; ty++) for (let tx = tx0 - r0; tx <= tx0 + r0; tx++) {
      if (this.tile(tx, ty) === T.BREAK && dist(cx, cy, tx * TS + 8, ty * TS + 8) < R + 10) {
        this.setTile(tx, ty, T.AIR);
        this.particles.burst(tx * TS + 8, ty * TS + 8, 10, { col: [PAL.red, PAL.violet, PAL.white], kind: 'bit', max: 70, g: 120 });
      }
    }
  }
  ab_cacheBoost(p) { p.boostT = 5; AudioSys.play('boost'); this.particles.burst(p.x + 5, p.y + 8, 16, { col: PAL.violet }); }
  ab_interruptShield(p) {
    p.shieldT = 3; AudioSys.play('shield', { caption: '[interrupción]' });
    for (const e of this.enemiesNear(p.x + p.w / 2, p.y + p.h / 2, 70)) if (e.interrupt) e.interrupt(this);
  }
  ab_parallelClone(p) {
    if (this.clone) this.clone.dead = true;
    this.clone = this.addEntity(new Clone(this, p.x, p.y, p.facing));
    AudioSys.play('clone');
  }
  ab_registerRecall(p) {
    for (const e of this.entities) if ((e.kind === 'nullpointer' || e.pinnable) && !e.dead && entDist(p.x, p.y, e) < (e.big ? 200 : 160)) e.pin(this);
    if (!p.recall) {
      p.recall = { x: p.x, y: p.y, t: 12 };
      AudioSys.play('tick'); UI.toast('POSICIÓN GUARDADA EN REGISTRO R7', PAL.white);
    } else {
      this.particles.burst(p.x + 5, p.y + 8, 14, { col: PAL.white });
      p.x = p.recall.x; p.y = p.recall.y; p.vx = 0; p.vy = 0; p.recall = null;
      AudioSys.play('recall');
      this.particles.burst(p.x + 5, p.y + 8, 14, { col: PAL.white });
    }
  }
  spawnFx(kind, x, y, o = {}) { this.addEntity(new Fx(kind, x, y, o)); }

  // ---------- actualización ----------
  get controlEnabled() { return !this.scripts.blocking && this.lockCount === 0 && this.hasFocus; }
  update(dt, focus) {
    this.hasFocus = focus;
    if (!this.ready) {
      this.ready = true;
      const pend = this.pending; this.pending = [];
      for (const [fn, name, b] of pend) this.scripts.run(fn, { name, blocking: b });
    }
    this.t += dt; this.levelTime += dt;
    if (this.snapPending && focus && !this.scripts.busy && this.lockCount === 0) { this.snapPending = false; takeLevelSnap(this.index); }
    if (focus) { LearningModel.tick(dt); PROG.stats.time += dt; }
    this.scripts.update(dt);
    // MODO CALMA: mientras se lee (diálogo, registro, desafío, elección o escena bloqueada)
    // los enemigos y sus disparos se detienen y nada hace daño. Al terminar, un instante de gracia.
    const calm = !focus || this.scripts.blocking || this.lockCount > 0;
    if (this.calm && !calm) this.player.graceT = 1; // gracia sin parpadeo al cerrar el texto
    this.calm = calm;
    this.platforms = this.entities.filter(e => e.solidTop);
    for (const pl of this.platforms) pl.preUpdate && pl.preUpdate(this, dt);
    this.player.update(this, dt, this.controlEnabled);
    this.nexo.update(this, dt);
    const cx = this.cam.x, cy = this.cam.y;
    for (const e of this.entities) {
      if (e.dead) continue;
      if (calm && e.enemy) { e.t += dt; e.flashT = Math.max(0, (e.flashT || 0) - dt); continue; }
      if (e.alwaysUpdate || (e.x > cx - 200 && e.x < cx + W + 200 && e.y > cy - 200 && e.y < cy + H + 200)) e.update(this, dt);
    }
    for (const pr of this.projectiles) if (!calm || pr.owner === 'player') pr.update(this, dt);
    this.projectiles = this.projectiles.filter(p => !p.dead);
    this.particles.update(dt);
    if (this.entities.some(e => e.dead)) {
      for (const e of this.entities) if (e.dead && e.id && this.byId[e.id] === e) delete this.byId[e.id];
      this.entities = this.entities.filter(e => !e.dead);
    }
    this.cam.update(dt, this.player);
    // barks y avisos
    if (this.barks.length) { const b = this.barks[0]; b.time += dt; if (b.time > b.dur) this.barks.shift(); }
    if (this.tipBox) { this.tipBox.time += dt; if (this.tipBox.time > this.tipBox.dur) this.tipBox = null; }
    for (const k in this.screenMsgs) { const m = this.screenMsgs[k]; m.t += dt; if (m.t > m.dur) delete this.screenMsgs[k]; }
    this.shakeT = Math.max(0, this.shakeT - dt); if (this.shakeT <= 0) this.shakeMag = 0;
    this.flashT = Math.max(0, this.flashT - dt); this.glitchT = Math.max(0, this.glitchT - dt);
    // repaso espaciado: ECO DE MEMORIA
    if (focus && !this.def.noEcho && !this.scripts.busy) {
      this.echoCd -= dt;
      if (this.echoCd <= 0 && !this.echoOrb) {
        const due = LearningModel.dueReview();
        const p = this.player;
        if (due && p.grounded && !this.enemiesNear(p.x, p.y, 180).length) {
          const x = p.x + p.facing * 40;
          if (!this.rectSolid(x, p.y - 4, 12, 12)) {
            this.echoOrb = this.addEntity(new EchoOrb(this, x, p.y - 6, due.concept));
            this.bark(Voice.speaker() === 'NEXO' ? 'NEXO' : 'SYS', Voice.speaker() === 'NEXO' ? 'Un eco de memoria: algo que conviene repasar. Tócalo cuando quieras.' : 'ECO DE MEMORIA DETECTADO. REPASO OPCIONAL DISPONIBLE.', 'CURIOUS');
          }
        }
        this.echoCd = 20;
      }
    }
    if (this.def.update) this.def.update(this, dt);
  }

  // ---------- render ----------
  render(g) {
    const th = this.theme;
    let sx = 0, sy = 0;
    if (this.shakeT > 0) { sx = Math.round(rand(-1, 1) * this.shakeMag); sy = Math.round(rand(-1, 1) * this.shakeMag); }
    const cx = Math.round(this.cam.x), cy = Math.round(this.cam.y);
    // fondo: cielo+lejos, medio y cerca (parallax), con estrellas y pulsos animados
    this.renderBackdrop(g, cx, cy, sx, sy);
    if (this.def.renderBg) this.def.renderBg(g, this, cx, cy);
    this.renderMotes(g, cx, cy);
    g.save();
    g.translate(-cx + sx, -cy + sy);
    for (const e of this.entities) if (e.layer === 0 && this.visible(e)) e.render(g, this);
    if (this.def.renderBack) this.def.renderBack(g, this);
    this.renderTiles(g, cx, cy);
    this.renderProps(g, cx, cy);
    for (const e of this.entities) if (e.layer === 1 && this.visible(e)) e.render(g, this);
    for (const e of this.entities) if ((e.layer === 2 || e.layer == null) && this.visible(e)) e.render(g, this);
    this.player.render(g, this);
    this.nexo.render(g, this);
    for (const e of this.entities) if (e.layer === 3 && this.visible(e)) e.render(g, this);
    this.renderGlows(g, cx, cy);
    this.flushLabels(g);
    for (const pr of this.projectiles) pr.render(g, this);
    this.particles.render(g, cx, cy);
    if (this.def.renderFg) this.def.renderFg(g, this, cx, cy);
    g.restore();
    // capas de ambiente
    this.renderMood(g);
    if (this.flashT > 0) { g.globalAlpha = clamp(this.flashT / (this.flashMax || 0.3), 0, 1) * 0.6; g.fillStyle = this.flashCol; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
    if (this.glitchT > 0) this.renderGlitch(g);
  }
  // Etiquetas del mundo: se colocan al final evitando que se pisen entre sí
  label(text, x, y, col, o = {}) { this.labelQ.push({ text: String(text), x, y, col, prio: o.prio || 0, back: o.back !== false, shadow: o.shadow, small: o.small, a: o.a == null ? 1 : o.a, noLine: o.noLine }); }
  flushLabels(g) {
    const L = this.labelQ;
    if (!L.length) return;
    L.sort((a, b) => a.prio - b.prio);
    const placed = [];
    for (const l of L) {
      const w = Font.measure(l.text) + (l.back ? 6 : 2), h = 11, x0 = Math.round(l.x - w / 2);
      const hit = yy => placed.some(r => x0 < r.x + r.w && x0 + w > r.x && yy < r.y + r.h && yy + h > r.y);
      let y = Math.round(l.y), k = 0;
      while (hit(y) && k < 6) { y -= 11; k++; }
      placed.push({ x: x0, y, w, h });
      if (y !== Math.round(l.y) && !l.noLine) { g.fillStyle = l.col; g.globalAlpha = 0.5 * l.a; g.fillRect(Math.round(l.x), y + h, 1, Math.round(l.y) - y); g.globalAlpha = 1; }
      if (l.back) { g.globalAlpha = l.a; g.fillStyle = 'rgba(6,10,18,0.62)'; g.fillRect(x0, y + 1, w, h - 1); g.fillStyle = l.col; g.globalAlpha = 0.55 * l.a; g.fillRect(x0, y + h - 1, w, 1); g.globalAlpha = 1; }
      g.globalAlpha = l.a;
      Font.draw(g, l.text, Math.round(l.x), y, l.col, { align: 'center', shadow: l.shadow });
      g.globalAlpha = 1;
    }
    L.length = 0;
  }
  visible(e) { const c = this.cam; return e.x + (e.w || 16) + 40 > c.x && e.x - 40 < c.x + W && e.y + (e.h || 16) + 60 > c.y && e.y - 60 < c.y + H; }
  // ---------- decoración ----------
  computeDepth() {
    const w = this.w, h = this.h, D = this.depth = this.depth || new Uint8Array(w * h);
    const solid = i => { const t = this.tiles[i]; return t === T.SOLID; };
    const q = [];
    for (let i = 0; i < w * h; i++) {
      if (!solid(i)) { D[i] = 0; continue; }
      const x = i % w, y = (i / w) | 0;
      const open = (xx, yy) => xx >= 0 && yy >= 0 && xx < w && yy < h && !solid(yy * w + xx);
      if (open(x, y - 1) || open(x + 1, y) || open(x, y + 1) || open(x - 1, y)) { D[i] = 0; q.push(i); } else D[i] = 9;
    }
    while (q.length) {
      const i = q.shift(), x = i % w, y = (i / w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const j = yy * w + xx; if (D[j] > D[i] + 1) { D[j] = D[i] + 1; q.push(j); }
      }
    }
    this.depthDirty = false;
  }
  placeProps() {
    const th = this.theme, set = th.propSet, list = (th.props || []).filter(n => set[n]);
    this.props = [];
    if (!list.length) return;
    const blocked = this.entities.filter(e => !['trigger', 'heat', 'bridge', 'collapse', 'platform'].includes(e.kind)).map(e => ({ x: e.x - 14, y: e.y - 8, w: (e.w || 16) + 28, h: (e.h || 16) + 16 }));
    blocked.push({ x: this.spawn.x - 28, y: this.spawn.y - 20, w: 64, h: 40 });
    const density = this.def.propDensity != null ? this.def.propDensity : 0.27;
    for (let y = 1; y < this.h - 1; y++) for (let x = 1; x < this.w - 1; x++) {
      const here = this.tile(x, y), below = this.tile(x, y + 1);
      if (here !== T.AIR || !(below === T.SOLID || below === T.ONEWAY)) continue;
      if (this.h <= 24 && y < 4) continue; // tejados junto al borde superior: inalcanzables y bajo el HUD
      if (hash2(x * 7 + 3, y * 13 + 5) > density) continue;
      if ([this.tile(x - 1, y + 1), this.tile(x + 1, y + 1), this.tile(x - 1, y), this.tile(x + 1, y)].some(t => t === T.SPIKE || t === T.POOL)) continue;
      const name = list[Math.floor(hash2(x * 31, y * 17) * list.length)], pr = set[name];
      const pw = pr.frames[0].width, ph = pr.frames[0].height;
      const px = x * TS + Math.round((TS - pw) / 2), py = (y + 1) * TS - ph + 1;
      if (ph > 18 && this.tile(x, y - 1) !== T.AIR) continue;
      if (blocked.some(b => px < b.x + b.w && px + pw > b.x && py < b.y + b.h && py + ph > b.y)) continue;
      if (this.props.some(o => Math.abs(o.x - px) < 14 && Math.abs(o.y - py) < 16)) continue;
      this.props.push({ x: px, y: py, w: pw, h: ph, pr, seed: hash2(x, y) * 10 });
    }
  }
  renderProps(g, cx, cy) {
    for (const o of this.props) {
      if (o.x + o.w < cx - 4 || o.x > cx + W + 4 || o.y + o.h < cy - 4 || o.y > cy + H + 4) continue;
      const fr = o.pr.frames, f = fr.length > 1 ? Math.floor(this.t * o.pr.fps + o.seed) % fr.length : 0;
      g.drawImage(fr[f], o.x, o.y);
    }
  }
  initAmbient() {
    const th = this.theme, rng = mulberry32(this.index * 97 + 13);
    this.motes = [];
    const n = Game.lowFx ? 14 : 34;
    for (let i = 0; i < n; i++) this.motes.push({ x: rng() * W, y: rng() * H, vx: (rng() - 0.5) * 6, vy: -3 - rng() * 7, ph: rng() * 6.28, col: th.pal[i % th.pal.length], d: 0.35 + rng() * 0.5 });
    this.lastRenderT = this.t;
  }
  renderBackdrop(g, cx, cy, sx, sy) {
    const bg = this.theme.bg, BW = bg.w;
    const tall = this.h * TS > H + 40;
    const off = (f) => { let o = -Math.round(cx * f) % BW; if (o > 0) o -= BW; return o; };
    const fx = off(0.12), mx = off(0.35), nx = off(0.62);
    const fy = tall ? 0 : -Math.round(Math.max(0, cy) * 0.05);
    for (let k = 0; k <= 1; k++) g.drawImage(bg.far, fx + k * BW + sx, fy + sy);
    // estrellas que titilan
    const t = this.t;
    if (!Settings.data.reduceFlash) for (const st of bg.stars) {
      const a = 0.5 + 0.5 * Math.sin(t * 2.2 + st.ph);
      if (a < 0.55) continue;
      let x = st.x + fx; if (x < -2) x += BW; if (x < -2 || x > W + 2) continue;
      g.globalAlpha = (a - 0.5) * 1.6; g.fillStyle = st.col; g.fillRect(x + sx, st.y + fy + sy, 1, 1);
      if (st.big) { g.fillRect(x - 1 + sx, st.y + fy + sy, 3, 1); g.fillRect(x + sx, st.y - 1 + fy + sy, 1, 3); }
    }
    g.globalAlpha = 1;
    // pájaros de datos cruzando el cielo (regiones al aire libre)
    if (!tall && !['core', 'kernel', 'tower'].includes(this.theme.key) && !Settings.data.reduceFlash) {
      for (let i = 0; i < 4; i++) {
        const per = 26 + i * 7, ph = (t + i * 9.3) % per;
        if (ph > 14) continue;
        const bx = Math.round(-20 + ph / 14 * (W + 40)), by = 40 + i * 17 + Math.round(Math.sin(t * 2 + i) * 4) + fy;
        const flap = Math.floor(t * 8 + i) % 2, col = this.theme.pal[i % this.theme.pal.length];
        g.fillStyle = mix(col, this.theme.sky[1], 0.3);
        g.fillRect(bx, by, 1, 1); g.fillRect(bx - 2, by - 1 + flap, 2, 1); g.fillRect(bx + 1, by - 1 + flap, 2, 1);
        if (!flap) { g.fillRect(bx - 3, by - 2, 1, 1); g.fillRect(bx + 3, by - 2, 1, 1); }
      }
    }
    const midY = tall ? -Math.round(cy * 0.2) % H : -Math.round(Math.max(0, cy) * 0.12);
    const nearY = tall ? -Math.round(cy * 0.45) % H : -Math.round(Math.max(0, cy) * 0.3) + 18;
    for (let k = 0; k <= 1; k++) for (let j = tall ? 0 : 1; j <= 1; j++) g.drawImage(bg.mid, mx + k * BW + sx, (tall ? midY + j * H : midY) + sy);
    // pulsos que recorren las pistas del fondo
    for (let i = 0; i < bg.traces.length; i++) {
      const tr = bg.traces[i], len = tr.x1 - tr.x0; if (len < 10) continue;
      const lo = tr.layer === 'far' ? fx : mx, ly = tr.layer === 'far' ? fy : (tall ? midY : midY);
      for (let k = 0; k < (tr.fast ? 3 : 2); k++) {
        const p = ((t * (tr.fast ? 60 : 34) + k * len / (tr.fast ? 3 : 2) + i * 37) % len);
        let x = tr.x0 + p + lo; while (x < -4) x += BW; while (x > W + 4) x -= BW;
        g.fillStyle = tr.col; g.fillRect(Math.round(x) + sx - 1, tr.y + ly + sy - 1, 3, 2);
        g.globalAlpha = 0.5; g.fillRect(Math.round(x) + sx - 4, tr.y + ly + sy - 1, 3, 2); g.globalAlpha = 1;
      }
    }
    g.globalAlpha = 0.9;
    for (let k = 0; k <= 1; k++) for (let j = tall ? 0 : 1; j <= 1; j++) g.drawImage(bg.near, nx + k * BW + sx, (tall ? nearY + j * H : nearY) + sy);
    // bruma atmosférica: empuja el fondo hacia atrás para que el juego se lea mejor
    const th = this.theme;
    g.globalAlpha = th.haze || 0.18; g.fillStyle = th.sky[1]; g.fillRect(0, 0, W, H);
    g.globalAlpha = 1;
  }
  renderMotes(g, cx, cy) {
    if (!this.motes || Settings.data.reduceFlash) return;
    const dt = Math.min(0.1, Math.max(0, this.t - (this.lastRenderT || this.t))); this.lastRenderT = this.t;
    const pcx = this.prevCx == null ? cx : this.prevCx, pcy = this.prevCy == null ? cy : this.prevCy; this.prevCx = cx; this.prevCy = cy;
    for (const m of this.motes) {
      m.x += m.vx * dt - (cx - pcx) * m.d; m.y += m.vy * dt - (cy - pcy) * m.d;
      m.x = ((m.x % W) + W) % W; m.y = ((m.y % H) + H) % H;
      const a = 0.45 + 0.35 * Math.sin(this.t * 2 + m.ph);
      const x = Math.round(m.x + Math.sin(this.t * 0.8 + m.ph) * 3), y = Math.round(m.y);
      g.globalAlpha = a * 0.35; g.drawImage(glowSprite(m.col, 4), x - 4, y - 4);
      g.globalAlpha = a; g.fillStyle = m.col; g.fillRect(x, y, 1, 1);
    }
    g.globalAlpha = 1;
  }
  // luces aditivas de objetos, atrezo, jugador y NEXO
  renderGlows(g, cx, cy) {
    if (Game.lowFx) return;
    const k = Settings.data.contrast ? 0.5 : 1;
    g.globalCompositeOperation = 'lighter';
    const L = (x, y, r, col, a) => { if (x + r < cx || x - r > cx + W || y + r < cy || y - r > cy + H) return; g.globalAlpha = a * k; g.drawImage(glowSprite(col, r), Math.round(x - r), Math.round(y - r)); };
    for (const e of this.entities) {
      if (e.dead || !e.glow) continue;
      const gl = e.glow(this); if (!gl) continue;
      L(gl[0], gl[1], gl[2], gl[3], gl[4] == null ? 0.35 : gl[4]);
    }
    for (const o of this.props) if (o.pr.glow) L(o.x + o.w / 2, o.y + 4, o.pr.gr || 12, o.pr.glow, 0.3 + 0.08 * Math.sin(this.t * 3 + o.seed));
    const p = this.player; if (!p.dead) L(p.x + p.w / 2, p.y + 5, 14, '#7FF3FF', 0.16);
    if (this.nexo && !this.nexo.hidden) L(this.nexo.x + 8, this.nexo.y + 9, 18, PROG.flags.nexusBorn ? '#FFD166' : '#45E5FF', 0.3 * (this.nexo.alpha == null ? 1 : this.nexo.alpha));
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  renderTiles(g, cx, cy) {
    const at = this.theme.atlas, tu = this.theme.tufts;
    if (this.depthDirty || !this.depth) this.computeDepth();
    const D = this.depth, tfr = Math.floor(this.t * 2) % 2;
    const x0 = Math.max(0, Math.floor(cx / TS) - 1), x1 = Math.min(this.w - 1, Math.floor((cx + W) / TS) + 1);
    const y0 = Math.max(0, Math.floor(cy / TS) - 1), y1 = Math.min(this.h - 1, Math.floor((cy + H) / TS) + 1);
    const tf = Math.floor(this.t * 3) % 2;
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const t = this.tiles[ty * this.w + tx];
      if (!t || t === T.DOOR) continue;
      const dx = tx * TS, dy = ty * TS;
      if (t === T.SOLID) {
        const open = n => { const tt = this.tile(n[0], n[1]); return !(tt === T.SOLID || tt === T.BREAK); };
        let m = 0;
        if (ty > 0 && open([tx, ty - 1])) m |= 1;
        if (open([tx + 1, ty]) && tx + 1 < this.w) m |= 2;
        if (ty + 1 < this.h && open([tx, ty + 1])) m |= 4;
        if (open([tx - 1, ty]) && tx > 0) m |= 8;
        const hh = hash2(tx, ty), v = Math.floor(hh * 4), dep = D[ty * this.w + tx];
        if (m === 0 && dep >= 1) g.drawImage(at, 0, (4 * Math.min(2, dep) + v) * 16, 16, 16, dx, dy, 16, 16);
        else g.drawImage(at, m * 16, v * 16, 16, 16, dx, dy, 16, 16);
        // brotes decorativos sobre el borde superior
        if ((m & 1) && ty > 0 && this.tiles[(ty - 1) * this.w + tx] === T.AIR && hh < 0.55) g.drawImage(tu, Math.floor(hash2(ty, tx) * 8) * 16, ((tfr + (tx & 1)) % 2) * 8, 16, 8, dx, dy - 7, 16, 8);
      } else if (t === T.ONEWAY) g.drawImage(at, 0, 192, 16, 16, dx, dy, 16, 16);
      else if (t === T.SPIKE) g.drawImage(at, 16, 192, 16, 16, dx, dy, 16, 16);
      else if (t === T.POOL) g.drawImage(at, 32 + tf * 16, 192, 16, 16, dx, dy, 16, 16);
      else if (t === T.LADDER) g.drawImage(at, 64, 192, 16, 16, dx, dy, 16, 16);
      else if (t === T.BREAK) g.drawImage(at, 80 + tf * 16, 192, 16, 16, dx, dy, 16, 16);
      else if (t === T.BRIDGE) { g.globalAlpha = 0.75 + 0.25 * Math.sin(this.t * 10 + tx); g.drawImage(at, 112, 192, 16, 16, dx, dy, 16, 16); g.globalAlpha = 1; }
    }
  }
  renderMood(g) {
    const mode = this.tintMode;
    if (mode === 'cold') {
      g.globalCompositeOperation = 'saturation'; g.globalAlpha = 0.28; g.fillStyle = '#808080'; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'soft-light'; g.globalAlpha = 0.45; g.fillStyle = '#5A7CFF'; g.fillRect(0, 0, W, H);
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    } else if (mode === 'desat') {
      g.globalCompositeOperation = 'saturation'; g.globalAlpha = 0.42; g.fillStyle = '#808080'; g.fillRect(0, 0, W, H);
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.fillStyle = 'rgba(40,24,8,0.06)'; g.fillRect(0, 0, W, H);
    } else if (mode === 'warm') {
      g.globalCompositeOperation = 'soft-light'; g.fillStyle = '#FFD9A0'; g.globalAlpha = 0.35; g.fillRect(0, 0, W, H);
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    } else if (mode === 'alarm') {
      g.fillStyle = 'rgba(255,40,60,' + (0.06 + 0.05 * Math.sin(this.t * 4)) + ')'; g.fillRect(0, 0, W, H);
    }
    if (this.darkness > 0) {
      // oscuridad con halo alrededor del jugador
      const p = this.player, px = Math.round(p.x + p.w / 2 - this.cam.x), py = Math.round(p.y + p.h / 2 - this.cam.y);
      g.fillStyle = 'rgba(0,0,6,' + this.darkness + ')';
      const r = 92;
      g.fillRect(0, 0, W, Math.max(0, py - r)); g.fillRect(0, py + r, W, H);
      g.fillRect(0, py - r, Math.max(0, px - r), r * 2); g.fillRect(px + r, py - r, W, r * 2);
      for (let k = 0; k < r; k += 4) {
        const w = Math.round(Math.sqrt(r * r - k * k));
        g.fillRect(px - r, py - k - 4, r - w, 4); g.fillRect(px + w, py - k - 4, r - w, 4);
        g.fillRect(px - r, py + k, r - w, 4); g.fillRect(px + w, py + k, r - w, 4);
      }
    }
  }
  renderGlitch(g) {
    const n = Game.lowFx ? 3 : 7;
    const col = this.glitchKind === 'cascade' ? PAL.red : this.glitchKind === 'memory' ? PAL.amber : this.glitchKind === 'corrupt' ? PAL.red : PAL.violet;
    for (let i = 0; i < n; i++) {
      const y = randi(0, H - 8), h = randi(2, 10), dx = randi(-12, 12);
      g.drawImage(g.canvas, 0, y, W, h, dx, y, W, h);
      if (Math.random() < 0.4) { g.globalAlpha = 0.35; g.fillStyle = col; g.fillRect(0, y, W, 1); g.globalAlpha = 1; }
    }
  }
}
