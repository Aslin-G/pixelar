// =============================================================================
// GUARDIANES DE REGIÓN — un jefe al final de cada nivel (00–08). CASCADE sigue siendo el jefe final.
// · Cada guardián encarna un FALLO del concepto de su región y tiene patrones telegrafiados.
// · CONSULTA: al perder vida se blinda y pregunta; se responde DISPARANDO (o con E) al orbe correcto.
//   Acertar lo deja VULNERABLE (daño doble); fallar sólo elimina ese orbe y explica por qué.
// · DEBILIDAD: la habilidad aprendida en la región (como en Mega Man, pero con sentido: el concepto
//   que acabas de entender es lo que desmonta el fallo).
// · Arena al final del nivel: la compuerta se abre al completar la región, se cierra durante el
//   combate y vuelve a abrirse al vencer. Checkpoint en la entrada; la salida exige la victoria.
// =============================================================================
// «[{A}]», «[{Q}]», «[{E}]» → teclas actuales de ataque, habilidad e interacción
const gKeys = t => String(t || '').replace(/\{A\}/g, Input.label('attack')).replace(/\{Q\}/g, Input.label('ability')).replace(/\{E\}/g, Input.label('interact'));
const Guardians = {
  byLevel: {},
  quizShown(W) { const B = W && W.v.guardian; return !!(B && B.state === 'quiz' && W.v.gQuiz); },
  active(W) { const B = W && W.v.guardian; return !!(B && !B.dead && ['intro', 'fight', 'quiz', 'stun', 'dying'].includes(B.state)); },
  flag(spec) { return 'G_' + spec.id; },
  // se llama al crear el mundo de un nivel con guardián
  setup(W) {
    const def = W.def, G = def.guardian; if (!G) return;
    const spec = GUARDIAN_SPECS[G.id];
    if (!spec) return;
    if (W.has(this.flag(spec))) { W.v.guardianDone = true; return; }
    const A = G.arena;
    const x = A.x0 + (spec.mode === 'hover' ? (A.x1 - A.x0) * 0.62 : (A.x1 - A.x0) * 0.72) - spec.w / 2;
    const y = spec.mode === 'hover' ? A.floor - spec.h - (spec.alt || 96) : A.floor - spec.h;
    const B = new Guardian(spec, x, y, A, G);
    W.addEntity(B); W.v.guardian = B;
    if (spec.twin) { const T = new GuardianPart(B, spec.twin); B.twin = T; W.addEntity(T); }
    if (spec.setup) spec.setup(W, B);
  },
  // pista contextual durante el combate
  hint(W) {
    const B = W.v.guardian; if (!B || !this.active(W)) return null;
    if (B.state === 'quiz') { const q = W.v.gQuiz; const ok = q && q.orbs.find(o => !o.dead && o.ok); return { text: 'Consulta del guardián: dispara (o pulsa [' + Input.label('interact') + ']) al orbe con la respuesta correcta.', x: ok ? ok.cx : null, y: ok ? ok.y : null }; }
    return { text: gKeys(B.spec.tip), x: B.cx, y: B.y };
  },
  // HUD: barra de vida, consulta y cartel de presentación
  drawHUD(g, W) {
    const B = W.v.guardian;
    if (W.v.gCard) {
      const c = W.v.gCard; c.t += 1 / 60;
      if (c.t > 3) W.v.gCard = null;
      // entra y sale deslizándose (sin transparencia: nada se ve a través del cartel)
      const y = 128 + Math.round((c.t < 0.25 ? (0.25 - c.t) * 160 : 0) + (c.t > 2.75 ? (c.t - 2.75) * 400 : 0)), tw = Math.max(Font.measure(c.name, 2), Font.measure(c.sub)) + 40;
      g.fillStyle = 'rgba(8,4,12,0.9)'; g.fillRect(W_HUD_R / 2 - tw / 2, y, tw, 58);
      g.fillStyle = c.col; g.fillRect(W_HUD_R / 2 - tw / 2, y, tw, 2); g.fillRect(W_HUD_R / 2 - tw / 2, y + 56, tw, 2);
      Font.draw(g, 'GUARDIÁN DE LA REGIÓN', W_HUD_R / 2, y + 3, PAL.gray, { align: 'center' });
      Font.draw(g, c.name, W_HUD_R / 2, y + 14, c.col, { align: 'center', s: 2 });
      Font.draw(g, c.sub, W_HUD_R / 2, y + 42, PAL.grayL, { align: 'center' });
      g.globalAlpha = 1;
    }
    if (!B || B.dead || !['fight', 'quiz', 'stun'].includes(B.state)) return;
    const sp = B.spec, x = 142, w = 184, y = 4;
    g.fillStyle = 'rgba(8,5,12,0.9)'; g.fillRect(x, y, w, 24);
    g.fillStyle = sp.col; g.fillRect(x, y + 23, w, 1);
    Font.draw(g, UI.fit(sp.name, w - 60), x + 4, y, sp.col);
    const st = B.state === 'quiz' ? 'CONSULTA' : B.state === 'stun' ? '¡DAÑO ×2!' : B.guardOpen(W, null) ? '' : 'BLINDADO';
    if (st) Font.draw(g, st, x + w - 4, y, B.state === 'stun' ? PAL.gold : B.state === 'quiz' ? PAL.cyan : PAL.gray, { align: 'right' });
    const bx = x + 4, bw = w - 8, by = y + 14;
    g.fillStyle = '#1A0A12'; g.fillRect(bx, by, bw, 6);
    const f = clamp(B.shownHp / B.maxHp, 0, 1), f2 = clamp(B.hp / B.maxHp, 0, 1);
    g.fillStyle = '#FFE9A8'; g.fillRect(bx, by, Math.round(bw * f), 6);
    g.fillStyle = B.state === 'stun' ? PAL.gold : sp.col; g.fillRect(bx, by, Math.round(bw * f2), 6);
    g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(bx, by, Math.round(bw * f2), 1);
    for (const th of B.thresholds) { g.fillStyle = '#050709'; g.fillRect(bx + Math.round(bw * th) - 1, by - 1, 2, 8); }
    // consulta
    const q = W.v.gQuiz;
    if (B.state === 'quiz' && q) {
      const lines = UI.wrap('CONSULTA: ' + q.q.q, 398).slice(0, 2);
      const h = lines.length * 12 + 4, qx = W_HUD_R / 2 - 206, qy = 42;
      g.fillStyle = 'rgba(4,14,20,0.92)'; g.fillRect(qx, qy, 412, h);
      g.fillStyle = PAL.cyan; g.fillRect(qx, qy, 2, h);
      Font.drawLines(g, lines, qx + 7, qy, PAL.white, { hl: PAL.cyan });
      UI.toastTop = Math.max(UI.toastTop || 0, qy + h + 4);
    }
  }
};

// ---------------------------------------------------------------- orbes de respuesta ----
class AnswerOrb extends Ent {
  constructor(W, x, y, text, ok, idx) {
    super(0, 0, {}, 16, 16);
    this.x = x - 8; this.y = y - 8; this.baseY = this.y; this.text = text; this.ok = ok; this.idx = idx;
    this.kind = 'answer'; this.layer = 2; this.interactive = true; this.alwaysUpdate = true; this.pop = 0;
  }
  get prompt() { return 'Elegir «' + this.text + '»'; }
  update(W, dt) { this.t += dt; this.pop = Math.min(1, this.pop + dt * 3); this.y = this.baseY + Math.sin(this.t * 2.4 + this.idx) * 2; }
  onPing(W) { this.choose(W); return true; }
  interact(W) { this.choose(W); }
  choose(W) {
    const q = W.v.gQuiz, B = W.v.guardian;
    if (this.dead || !q || !B || B.state !== 'quiz') return;
    B.answer(W, this);
  }
  render(g, W) {
    const cx = Math.round(this.cx), cy = Math.round(this.cy), s = this.pop;
    const col = ['#45E5FF', '#FFD166', '#71FF9A', '#FF9ED8'][this.idx % 4];
    g.fillStyle = shade(col, 0.35); g.globalAlpha = 0.5; g.fillRect(cx - 9, cy - 9, 18, 18); g.globalAlpha = 1;
    const r = Math.round(7 * s);
    for (let yy = -r; yy <= r; yy++) { const ww = Math.round(Math.sqrt(r * r - yy * yy)); g.fillStyle = yy < -r / 3 ? '#FFFFFF' : col; g.fillRect(cx - ww, cy + yy, ww * 2, 1); }
    g.fillStyle = shade(col, 0.5); g.fillRect(cx - 2, cy - 2, 4, 4);
    W.label(this.text, cx, this.y - 15, col, { prio: 6 });
  }
}
AnswerOrb.prototype.glow = function () { return [this.cx, this.cy, 16, '#9FF6FF', 0.4]; };

// ---------------------------------------------------------------- repertorio de ataques ----
// Cada ataque: aviso (telegrafiado) → acción → recuperación. update devuelve true al terminar.
const gShot = (W, B, x, y, vx, vy, o) => { const p = new Projectile(x, y, vx, vy, Object.assign({ owner: 'enemy', col: B.spec.shot || B.spec.col, life: 3.2 }, o)); p.src = B; W.projectiles.push(p); return p; };
const gWave = (W, B, x, dir, o) => gShot(W, B, x, B.A.floor - 6, dir * ((o && o.spd) || 120), 0, Object.assign({ kind: 'wave', life: 4 }, o));
const GMOVES = {
  // salto hacia el jugador; al caer, ondas por el suelo (se esquivan saltando)
  hop: {
    start(W, B, m) { m.tele = 0.45; },
    update(W, B, m, dt) {
      if (m.tele > 0) { m.tele -= dt; B.squash = 1; if (m.tele <= 0) { const dx = W.player.cx - B.cx; B.vx = clamp(dx / 0.9, -170, 170) * B.speedK; B.vy = -320; B.grounded = false; m.air = true; AudioSys.play('jump'); } return false; }
      if (m.air && B.grounded) { m.air = false; m.land = 0.3; W.shake(3, 0.25); AudioSys.play('land'); gWave(W, B, B.cx - 10, -1); gWave(W, B, B.cx + 10, 1); B.vx = 0; }
      if (m.land != null) { m.land -= dt; return m.land <= 0; }
      return false;
    }
  },
  // abanico de disparos apuntados
  spread: {
    start(W, B, m) { m.tele = 0.5; m.k = B.spec.volleys || 2; m.gap = 0; },
    update(W, B, m, dt) {
      if (m.tele > 0) { m.tele -= dt; return false; }
      m.gap -= dt;
      if (m.gap <= 0 && m.k > 0) {
        m.k--; m.gap = 0.38;
        const n = B.spec.fan || 3, p = W.player, ox = B.cx, oy = B.y + B.h * 0.45;
        const a0 = Math.atan2(p.y + 7 - oy, p.cx - ox);
        for (let i = 0; i < n; i++) { const a = a0 + (i - (n - 1) / 2) * 0.22; gShot(W, B, ox, oy, Math.cos(a) * 120 * B.speedK, Math.sin(a) * 120 * B.speedK, { kind: B.spec.shotKind }); }
        AudioSys.play('attack');
      }
      return m.k <= 0 && m.gap <= 0;
    }
  },
  // lluvia desde el techo sobre marcas visibles en el suelo
  rain: {
    start(W, B, m) {
      m.tele = 0.85; m.xs = [];
      const n = 4 + B.phase, px = W.player.cx;
      for (let i = 0; i < n; i++) m.xs.push(clamp(px + (i - (n - 1) / 2) * 44 + rand(-10, 10), B.A.x0 + 12, B.A.x1 - 12));
      B.marks = m.xs; AudioSys.play('alarm');
    },
    update(W, B, m, dt) {
      if (m.tele > 0) { m.tele -= dt; if (m.tele <= 0) { for (const x of m.xs) gShot(W, B, x, B.A.top + 6, 0, 165, { kind: B.spec.rainKind || 'bolt', life: 3 }); B.marks = null; m.rec = 0.6; } return false; }
      m.rec -= dt; return m.rec <= 0;
    }
  },
  // embestida horizontal por el suelo (se esquiva saltando por encima o desde una plataforma)
  charge: {
    start(W, B, m) { m.tele = 0.65; m.dir = W.player.cx > B.cx ? 1 : -1; B.face = m.dir; AudioSys.play('alarm'); },
    update(W, B, m, dt) {
      if (m.tele > 0) { m.tele -= dt; B.vx = -m.dir * 12; B.squash = 1; return false; }
      if (!m.go) { m.go = true; AudioSys.play('dash'); }
      B.vx = m.dir * 235 * B.speedK;
      if (Math.random() < 0.5) W.particles.spawn({ x: B.cx - m.dir * B.w / 2, y: B.y + B.h - 2, vx: -m.dir * 40, vy: -20, col: PAL.grayL, life: 0.3, kind: 'smoke', size: 2 });
      if ((m.dir > 0 && B.x + B.w >= B.A.x1 - 6) || (m.dir < 0 && B.x <= B.A.x0 + 6)) { B.vx = 0; W.shake(4, 0.3); AudioSys.play('land'); B.face = -m.dir; return true; }
      return false;
    }
  },
  // rayo horizontal a la altura del jugador: aviso con una línea, luego el rayo
  beam: {
    start(W, B, m) { m.tele = 0.9; m.y = clamp(W.player.y + 8, B.A.top + 10, B.A.floor - 6); m.on = 0; AudioSys.play('glitch'); },
    update(W, B, m, dt) {
      B.beam = { y: m.y, on: m.tele <= 0, t: m.tele };
      if (m.tele > 0) { m.tele -= dt; return false; }
      m.on += dt;
      const p = W.player;
      if (p.y < m.y + 3 && p.y + p.h > m.y - 3) p.hurt(W, 1, B.cx);
      if (m.on > 0.4) { B.beam = null; return true; }
      return false;
    }
  },
  // proyectiles en órbita que después salen disparados
  orbit: {
    start(W, B, m) { m.t = 0; m.ps = []; for (let i = 0; i < 6; i++) m.ps.push(gShot(W, B, B.cx, B.cy, 0, 0, { life: 6, kind: B.spec.shotKind })); AudioSys.play('shield'); },
    update(W, B, m, dt) {
      m.t += dt;
      const r = Math.max(B.w, B.h) * 0.5 + 14;
      m.ps.forEach((p, i) => { if (p.dead || p.free) return; const a = m.t * 3 + i * Math.PI / 3; p.x = B.cx + Math.cos(a) * r; p.y = B.cy + Math.sin(a) * r; p.vx = 0; p.vy = 0; });
      if (m.t > 1.6) { m.ps.forEach(p => { if (p.dead) return; const a = Math.atan2(p.y - B.cy, p.x - B.cx); p.vx = Math.cos(a) * 110; p.vy = Math.sin(a) * 110; p.free = true; }); AudioSys.play('attack'); return true; }
      return false;
    }
  },
  // invoca esbirros del concepto (máximo 3 a la vez)
  summon: {
    start(W, B, m) { m.tele = 0.6; },
    update(W, B, m, dt) {
      if (m.tele > 0) { m.tele -= dt; return false; }
      const alive = W.entities.filter(e => e.gMinion && !e.dead).length;
      for (let i = 0; i < Math.min(2, 3 - alive); i++) {
        const x = clamp(B.cx + (i ? 60 : -60), B.A.x0 + 24, B.A.x1 - 24);
        const t = B.spec.minion || 'bitcorrupt', fly = t === 'packetstorm' || t === 'cachemiss';
        const e = W.spawnEnt(t, x, B.A.floor - 16, { px: x, py: fly ? B.A.top + 50 : B.A.floor - 14, hp: t === 'bitcorrupt' ? 2 : undefined, range: 6 });
        if (e) { e.gMinion = true; W.particles.burst(e.cx, e.cy, 12, { col: [B.spec.col, PAL.white], kind: 'bit' }); }
      }
      AudioSys.play('glitch');
      return true;
    }
  },
  // teletransporte: aparece un «fantasma» en el destino antes de saltar allí
  warp: {
    start(W, B, m) {
      m.t = 0; const sp = B.spec.spots;
      let s = sp ? pick(sp.filter(q => Math.abs(B.A.x0 + q[0] * TS - B.x) > 40)) : null;
      m.to = s ? { x: B.A.x0 + s[0] * TS - B.w / 2, y: B.A.floor - B.h - s[1] * TS } : { x: clamp(W.player.cx + rand(-120, 120), B.A.x0 + 8, B.A.x1 - B.w - 8) - B.w / 2, y: B.homeY };
      B.ghost = m.to; AudioSys.play('tick');
    },
    update(W, B, m, dt) {
      m.t += dt;
      if (m.t > 0.55 / B.speedK && !m.done) { m.done = true; W.particles.burst(B.cx, B.cy, 14, { col: [B.spec.col, PAL.white], kind: 'glitch' }); B.x = m.to.x; B.y = m.to.y; B.homeY = m.to.y; B.ghost = null; W.particles.burst(B.cx, B.cy, 14, { col: [B.spec.col, PAL.white] }); AudioSys.play('blip'); }
      return m.t > 0.8 / B.speedK;
    }
  },
  // chispas que recorren el suelo en serie
  wave: {
    start(W, B, m) { m.tele = 0.5; m.k = 3 + (B.phase > 1 ? 1 : 0); m.gap = 0; m.dir = W.player.cx > B.cx ? 1 : -1; },
    update(W, B, m, dt) {
      if (m.tele > 0) { m.tele -= dt; return false; }
      m.gap -= dt;
      if (m.gap <= 0 && m.k > 0) { m.k--; m.gap = 0.42; gWave(W, B, B.cx, m.dir, { kind: B.spec.waveKind || 'wave', spd: 130 * B.speedK }); AudioSys.play('pulse'); }
      return m.k <= 0 && m.gap <= 0;
    }
  },
  // (flotantes) se coloca sobre el jugador y cae en picado; ondas al tocar el suelo
  slam: {
    start(W, B, m) { m.ph = 0; m.t = 0; },
    update(W, B, m, dt) {
      m.t += dt;
      if (m.ph === 0) { const tx = clamp(W.player.cx - B.w / 2, B.A.x0 + 6, B.A.x1 - B.w - 6); B.x = lerp(B.x, tx, 1 - Math.exp(-dt * 6)); B.y = lerp(B.y, B.A.floor - B.h - 120, 1 - Math.exp(-dt * 6)); if (m.t > 0.75) { m.ph = 1; m.t = 0; AudioSys.play('alarm'); } return false; }
      if (m.ph === 1) { B.squash = 1; if (m.t > 0.35) { m.ph = 2; m.t = 0; } return false; }
      if (m.ph === 2) { B.y += 430 * dt; if (B.y + B.h >= B.A.floor) { B.y = B.A.floor - B.h; m.ph = 3; m.t = 0; W.shake(5, 0.3); AudioSys.play('land'); gWave(W, B, B.cx - 12, -1); gWave(W, B, B.cx + 12, 1); } return false; }
      if (m.ph === 3) { if (m.t > 0.45) { m.ph = 4; m.t = 0; } return false; }
      B.y = lerp(B.y, B.homeY, 1 - Math.exp(-dt * 4));
      return m.t > 0.7;
    }
  }
};

// ---------------------------------------------------------------- el guardián ----
class Guardian extends Ent {
  constructor(spec, x, y, A, G) {
    super(0, 0, { id: 'guardian' }, spec.w, spec.h);
    this.spec = spec; this.A = A; this.G = G; this.x = x; this.y = y; this.homeX = x; this.homeY = y;
    this.id = 'guardian'; this.kind = 'guardian'; this.enemy = true; this.big = true; this.layer = 2; this.alwaysUpdate = true;
    this.hp = this.maxHp = spec.hp; this.shownHp = spec.hp; this.state = 'hidden'; this.alpha = 0;
    this.flashT = 0; this.stunT = 0; this.freezeT = 0; this.vx = 0; this.vy = 0; this.face = -1; this.squash = 0;
    this.idleT = 1.2; this.move = null; this.moveIx = 0; this.phase = 0; this.grounded = spec.mode !== 'hover';
    this.nQuiz = Math.min(2, (spec.qs || []).length);
    this.thresholds = this.nQuiz === 2 ? [2 / 3, 1 / 3] : this.nQuiz === 1 ? [0.5] : [];
    this.quizzesDone = 0; this.usedQ = []; this.marks = null; this.beam = null; this.ghost = null;
  }
  get speedK() { return 1 + this.phase * 0.16; }
  // ¿puede recibir daño ahora mismo? (mecánica de su concepto)
  guardOpen(W, kind) { return !this.spec.guard || this.spec.guard.open(W, this, kind); }
  wake(W) {
    if (this.state !== 'hidden') return;
    this.state = 'intro';
    const self = this;
    W.run(function* () { yield* G_intro(W, self); }, 'guardian_intro');
  }
  update(W, dt) {
    this.t += dt; this.flashT = Math.max(0, this.flashT - dt); this.squash = Math.max(0, this.squash - dt * 4);
    this.shownHp = approach(this.shownHp, this.hp, dt * this.maxHp * 0.4);
    if (this.state === 'hidden') {
      const p = W.player, G = this.G;
      const inside = p.x > this.A.x0 + (G.wakeX || 4) * TS && p.x < this.A.x1 && p.y > this.A.top - 8 && p.y < this.A.floor;
      if (inside && (!G.needs || W.has(G.needs)) && W.controlEnabled && !W.scripts.busy && !p.dead) this.wake(W);
      return;
    }
    if (this.state === 'intro' || this.state === 'dying') return; // los anima su guion
    const sp = this.spec;
    if (sp.update) sp.update(W, this, dt);
    if (this.freezeT > 0) { this.freezeT -= dt; this.physics(W, dt, true); return; }
    if (this.state === 'stun') { this.stunT -= dt; this.physics(W, dt, true); this.contact(W, true); if (this.stunT <= 0) { this.state = 'fight'; this.idleT = 0.6; } return; }
    if (this.state === 'quiz') { this.physics(W, dt, true); if (sp.mode === 'hover') { this.x = lerp(this.x, (this.A.x0 + this.A.x1) / 2 - this.w / 2, 1 - Math.exp(-dt * 2)); this.y = lerp(this.y, this.A.floor - this.h - 116 + Math.sin(this.t * 2) * 3, 1 - Math.exp(-dt * 2)); } return; }
    // combate
    if (this.move) {
      if (GMOVES[this.move.n].update(W, this, this.move, dt)) { this.move = null; this.idleT = rand(0.65, 1.2) / this.speedK; }
    } else {
      this.idle(W, dt);
      this.idleT -= dt;
      if (this.idleT <= 0) this.startMove(W);
    }
    this.physics(W, dt, false);
    this.contact(W);
    // FETCH DASH a través del guardián (debilidad del ciclo)
    const p = W.player;
    if (p.dashT > 0 && !p.gDash && overlap(p, this)) { p.gDash = true; if (sp.weak && sp.weak.kind === 'dash') this.hit(W, 1, p.cx, 'dash'); }
    if (p.dashT <= 0) p.gDash = false;
  }
  idle(W, dt) {
    const p = W.player, sp = this.spec;
    this.face = p.cx > this.cx ? 1 : -1;
    if (sp.mode === 'hover') {
      const tx = clamp(p.cx - this.w / 2 - this.face * 70, this.A.x0 + 6, this.A.x1 - this.w - 6);
      this.x = lerp(this.x, tx, 1 - Math.exp(-dt * 0.9));
      this.y = lerp(this.y, this.homeY + Math.sin(this.t * 1.7) * 6, 1 - Math.exp(-dt * 3));
    } else if (Math.abs(p.cx - this.cx) > 50) this.vx = this.face * (sp.walk || 26) * this.speedK;
    else this.vx = 0;
  }
  startMove(W) {
    const sp = this.spec, list = sp.moves[Math.min(this.phase, sp.moves.length - 1)];
    let n = list[this.moveIx % list.length]; this.moveIx++;
    if (Math.random() < 0.3) n = pick(list);
    if (n === 'summon' && W.entities.filter(e => e.gMinion && !e.dead).length >= 2) n = list.find(k => k !== 'summon') || n;
    this.move = { n }; GMOVES[n].start(W, this, this.move);
    if (sp.onMove) sp.onMove(W, this, n);
  }
  physics(W, dt, still) {
    if (this.spec.mode === 'hover') { if (still && this.state === 'stun') { this.y = Math.min(this.A.floor - this.h, this.y + 120 * dt); } return; }
    if (still) this.vx = approach(this.vx, 0, 600 * dt);
    this.vy = Math.min(this.vy + 950 * dt, 360);
    this.hitWall = 0;
    W.move(this, dt);
    if (this.x < this.A.x0 + 2) { this.x = this.A.x0 + 2; this.vx = 0; }
    if (this.x + this.w > this.A.x1 - 2) { this.x = this.A.x1 - 2 - this.w; this.vx = 0; }
  }
  contact(W, safe) {
    const p = W.player;
    if (!overlap(p, this) || p.dead) return;
    // pisotón: caer encima rebota (y daña si no está blindado)
    if (p.vy > 20 && (p.prevY == null || p.prevY + p.h <= this.y + 5)) {
      p.vy = Input.held('jump') ? -300 : -240; p.jumping = true; p.grounded = false; p.invuln = Math.max(p.invuln, 0.25);
      if (!this.hit(W, 1, p.cx, 'stomp')) AudioSys.play('land');
      return;
    }
    if (!safe) p.hurt(W, 1, this.cx);
  }
  hit(W, dmg, srcX, kind) {
    if (this.dead || this.state === 'hidden' || this.state === 'intro' || this.state === 'dying') return false;
    if (this.state === 'quiz') { floatText(W, this.cx, this.y - 8, 'BLINDADO: RESPONDE LA CONSULTA', PAL.cyan); AudioSys.play('ui_back'); return false; }
    const sp = this.spec;
    if (this.state !== 'stun' && !this.guardOpen(W, kind)) {
      if ((this.guardMsgT || 0) < W.t) { this.guardMsgT = W.t + 1.2; floatText(W, this.cx, this.y - 8, sp.guard.text, PAL.gray); AudioSys.play('ui_back'); if (sp.guard.tip) W.tip('g_' + sp.id, gKeys(sp.guard.tip)); }
      return false;
    }
    let m = 1;
    if (this.state === 'stun') m *= 2;
    if (sp.weak && sp.weak.test(W, this, kind)) { m *= 2; if ((this.weakMsgT || 0) < W.t) { this.weakMsgT = W.t + 1.5; floatText(W, this.cx, this.y - 18, sp.weak.text, PAL.gold); } }
    this.damage(W, dmg * m);
    return true;
  }
  damage(W, n) {
    const before = this.hp / this.maxHp;
    this.hp = Math.max(0, this.hp - n); this.flashT = 0.12;
    AudioSys.play('hit'); W.particles.burst(this.cx, this.cy, 8 + n * 3, { col: [PAL.white, this.spec.col], max: 90 });
    floatText(W, this.cx + rand(-8, 8), this.y - 4, '-' + n, n > 1 ? PAL.gold : PAL.white);
    if (this.hp <= 0) { this.defeat(W); return; }
    const after = this.hp / this.maxHp;
    for (let i = this.quizzesDone; i < this.thresholds.length; i++) {
      if (before > this.thresholds[i] && after <= this.thresholds[i]) { this.phase = i + 1; this.startQuiz(W); break; }
    }
  }
  stun(W, t, text) {
    this.state = 'stun'; this.stunT = t; this.move = null; this.beam = null; this.marks = null; this.ghost = null;
    floatText(W, this.cx, this.y - 16, text || '¡VULNERABLE!', PAL.gold);
    W.particles.burst(this.cx, this.y, 16, { col: [PAL.gold, PAL.white], max: 80 });
  }
  interrupt(W) { if (this.state !== 'fight' && this.state !== 'stun') return; this.freezeT = 3.2; this.interrupted = W.t; floatText(W, this.cx, this.y - 8, 'INTERRUMPIDO', PAL.red); }
  // ---------- consulta ----------
  startQuiz(W) {
    const sp = this.spec;
    this.state = 'quiz'; this.move = null; this.beam = null; this.marks = null; this.ghost = null; this.vx = 0;
    for (const p of W.projectiles) if (p.owner !== 'player') p.dead = true;
    const pool = sp.qs.map((q, i) => i).filter(i => !this.usedQ.includes(i));
    const qi = pick(pool.length ? pool : sp.qs.map((q, i) => i)); this.usedQ.push(qi);
    const q = sp.qs[qi];
    const order = q.o.map((t, i) => i).sort(() => Math.random() - 0.5);
    const A = this.A, xs = [0.18, 0.42, 0.66];
    if (sp.mode !== 'hover') { this.x = clamp(this.x, A.x0 + (A.x1 - A.x0) * 0.8, A.x1 - this.w - 4); }
    const orbs = order.map((oi, k) => W.addEntity(new AnswerOrb(W, A.x0 + (A.x1 - A.x0) * xs[k], A.floor - 14, q.o[oi], oi === 0, k)));
    W.v.gQuiz = { q, qi, orbs, wrong: 0, t0: W.t };
    AudioSys.play('echo');
    W.bark(guide(), (sp.quizLine || 'El guardián se blinda y hace una consulta.') + ' Dispara (o pulsa [' + Input.label('interact') + ']) al orbe correcto.', 'CURIOUS', 5);
  }
  answer(W, orb) {
    const Q = W.v.gQuiz;
    if (orb.ok) {
      for (const o of Q.orbs) if (!o.dead) { o.dead = true; W.particles.burst(o.cx, o.cy, o === orb ? 24 : 8, { col: o === orb ? [PAL.green, PAL.white] : [PAL.gray], max: 90 }); }
      W.sfx('correct');
      LearningModel.record({ concept: this.spec.concept, chId: 'guard_' + this.spec.id + '_' + Q.qi, correct: true, firstTry: Q.wrong === 0, hints: 0, time: W.t - Q.t0, expected: 12, conf: null, difficulty: 2, transfer: true, prompt: 'Consulta de ' + this.spec.name + ': ' + Q.q.q });
      if (Q.wrong === 0) Progression.addXP(12, 'consulta');
      W.bark(guide(), '✓ ' + Q.q.why, 'HAPPY', 5);
      W.v.gQuiz = null; this.quizzesDone++;
      this.stun(W, 5, '¡CORRECTO! VULNERABLE');
    } else {
      Q.wrong++; orb.dead = true;
      W.sfx('wrong'); W.shake(2, 0.2);
      W.particles.burst(orb.cx, orb.cy, 16, { col: [PAL.red, PAL.amber], max: 90 });
      for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * 0.6; gShot(W, this, orb.cx, orb.cy, Math.cos(a) * 70, Math.sin(a) * 70, { life: 1.6 }); }
      const why = (Q.q.no && Q.q.no[orb.text]) || ('«' + orb.text + '» no es la respuesta.');
      W.bark(guide(), '✗ ' + why, 'WORRIED', 5);
    }
  }
  defeat(W) {
    if (this.state === 'dying') return;
    this.state = 'dying'; this.dieT = 2; this.move = null; this.beam = null; this.marks = null;
    if (W.v.gQuiz) { for (const o of W.v.gQuiz.orbs) o.dead = true; W.v.gQuiz = null; }
    const self = this;
    W.run(function* () { yield* G_defeat(W, self); }, 'guardian_defeat');
  }
  // ---------- dibujo ----------
  render(g, W) {
    if (this.state === 'hidden' || this.alpha <= 0) return;
    const sp = this.spec;
    // avisos en el suelo (lluvia) y rayo
    if (this.marks) for (const x of this.marks) { g.fillStyle = Math.floor(W.t * 10) % 2 ? PAL.red : PAL.amber; g.fillRect(Math.round(x) - 5, this.A.floor - 2, 10, 2); Font.draw(g, '!', Math.round(x), this.A.floor - 14, PAL.red, { align: 'center' }); }
    if (this.beam) {
      const b = this.beam;
      if (!b.on) { g.globalAlpha = 0.35 + 0.3 * Math.sin(W.t * 30); g.fillStyle = sp.col; g.fillRect(this.A.x0, Math.round(b.y), this.A.x1 - this.A.x0, 1); g.globalAlpha = 1; }
      else { g.fillStyle = sp.col; g.fillRect(this.A.x0, Math.round(b.y) - 3, this.A.x1 - this.A.x0, 6); g.fillStyle = PAL.white; g.fillRect(this.A.x0, Math.round(b.y) - 1, this.A.x1 - this.A.x0, 2); }
    }
    if (this.ghost) { g.globalAlpha = 0.3 + 0.2 * Math.sin(W.t * 20); g.drawImage(silhouetteCache(this.frame(W)), Math.round(this.ghost.x + this.w / 2 - this.frame(W).width / 2), Math.round(this.ghost.y + this.h - this.frame(W).height)); g.globalAlpha = 1; }
    g.globalAlpha = this.alpha * (this.state === 'dying' ? clamp(this.dieT / 2, 0, 1) : 1);
    const c = this.frame(W);
    const sq = this.squash > 0 ? 1 : 0;
    const x = Math.round(this.x + this.w / 2 - c.width / 2 + (this.state === 'dying' ? rand(-2, 2) : 0)), y = Math.round(this.y + this.h - c.height + sq);
    g.drawImage(this.flashT > 0 ? silhouetteCache(c) : c, x, y);
    if (sp.draw) sp.draw(g, W, this, x, y);
    g.globalAlpha = 1;
    // estados
    if (this.state === 'quiz') { this.ring(g, W, PAL.cyan); W.label('?', this.cx, this.y - 14 + Math.round(Math.sin(W.t * 5) * 2), PAL.cyan, { prio: 5, back: false, shadow: '#000000' }); }
    else if (this.state === 'stun') { for (let i = 0; i < 3; i++) { const a = W.t * 5 + i * 2.1; Font.draw(g, '★', this.cx + Math.cos(a) * 12, this.y - 8 + Math.sin(a) * 3, PAL.gold, { align: 'center' }); } }
    else if (this.state === 'fight' && !this.guardOpen(W, null)) this.ring(g, W, sp.guard.col || PAL.gray);
    if (this.freezeT > 0) { g.fillStyle = 'rgba(255,89,100,0.28)'; g.fillRect(this.x - 2, this.y - 2, this.w + 4, this.h + 4); Font.draw(g, 'IRQ', this.cx, this.y - 14, PAL.red, { align: 'center' }); }
    if (this.move && (this.move.tele > 0) && Math.floor(W.t * 12) % 2) W.label('!', this.cx, this.y - 14, PAL.red, { prio: 5, back: false, shadow: '#000000' });
  }
  ring(g, W, col) {
    const r = Math.max(this.w, this.h) * 0.62 + 2;
    g.fillStyle = col; g.globalAlpha = 0.55 + 0.25 * Math.sin(W.t * 8);
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
      const a2 = a + Math.PI / 3, n = 8;
      for (let k = 0; k < n; k++) { const f = k / n; g.fillRect(Math.round(this.cx + lerp(Math.cos(a), Math.cos(a2), f) * r), Math.round(this.cy + lerp(Math.sin(a), Math.sin(a2), f) * r), 2, 2); }
    }
    g.globalAlpha = 1;
  }
  frame(W) {
    const fr = Sprites.guardians[this.spec.id];
    const k = this.state === 'stun' ? fr.length - 1 : Math.floor(this.t * (this.spec.fps || 5)) % Math.max(1, fr.length - 1);
    const f = fr[k];
    return this.face > 0 && !this.spec.noFlip ? f.l : f.r;
  }
}
Guardian.prototype.glow = function () { return this.state === 'hidden' ? null : [this.cx, this.cy, Math.max(this.w, this.h) * 0.8, this.state === 'stun' ? '#FFD166' : this.spec.col, this.state === 'dying' ? 0.6 : 0.3]; };

// Segundo cuerpo (ABRAZO MORTAL): recibe golpes y los reenvía al guardián
class GuardianPart extends Ent {
  constructor(B, o) { super(0, 0, {}, o.w, o.h); this.B = B; this.o = o; this.kind = 'guardianpart'; this.enemy = true; this.big = true; this.layer = 2; this.alwaysUpdate = true; this.x = B.x - 90; this.y = B.y; this.flashT = 0; this.vx = 0; this.vy = 0; }
  update(W, dt) {
    this.t += dt; this.flashT = Math.max(0, this.flashT - dt);
    const B = this.B;
    if (B.dead || B.state === 'hidden') return;
    if (B.spec.twinUpdate) B.spec.twinUpdate(W, B, this, dt);
    if (B.state === 'fight' && B.freezeT <= 0) this.contact(W);
  }
  contact(W) { Guardian.prototype.contact.call(this, W); }
  hit(W, dmg, srcX, kind) { return this.B.spec.twinHit(W, this.B, this, dmg, kind); }
  interrupt(W) { this.B.interrupt(W); }
  get state() { return this.B.state; }
  render(g, W) {
    const B = this.B; if (B.state === 'hidden' || B.alpha <= 0) return;
    const fr = Sprites.guardians[B.spec.id + '_b'], f = fr[Math.floor(this.t * 5) % fr.length], c = W.player.cx > this.cx ? f.l : f.r;
    g.globalAlpha = B.alpha * (B.state === 'dying' ? clamp(B.dieT / 2, 0, 1) : 1);
    const x = Math.round(this.x + this.w / 2 - c.width / 2), y = Math.round(this.y + this.h - c.height);
    g.drawImage(this.flashT > 0 ? silhouetteCache(c) : c, x, y);
    g.globalAlpha = 1;
    if (B.state === 'stun') Font.draw(g, '★', this.cx, this.y - 8, PAL.gold, { align: 'center' });
    if (B.freezeT > 0) { g.fillStyle = 'rgba(255,89,100,0.28)'; g.fillRect(this.x - 2, this.y - 2, this.w + 4, this.h + 4); }
  }
}
GuardianPart.prototype.glow = function () { return this.B.state === 'hidden' ? null : [this.cx, this.cy, 22, this.B.spec.col2 || this.B.spec.col, 0.3]; };

// ---------------------------------------------------------------- guiones de presentación y victoria ----
function* G_intro(W, B) {
  const sp = B.spec, G = B.G;
  W.lock();
  W.player.vx = 0;
  if (G.gate) { W.closeDoor('gate'); W.sfx('door', '[la compuerta se cierra]'); }
  W.projectiles.length = 0;
  AudioSys.playMusic('guardian');
  yield* W.camTo(B.cx, B.cy - 10, 0.7);
  W.glitch(0.5, 'corrupt'); W.shake(3, 0.5); W.sfx('boss', '[aparece ' + sp.name + ']');
  W.particles.burst(B.cx, B.cy, 40, { col: [sp.col, PAL.white], kind: 'bit', max: 120, lmax: 1.2 });
  // (durante el guion el mundo está en calma: la aparición se anima aquí)
  for (let t = 0; t < 0.9; t += 1 / 60) { B.alpha = t / 0.9; if (Math.random() < 0.3) W.particles.spawn({ x: B.x + rand(0, B.w), y: B.y + rand(0, B.h), vy: -30, col: sp.col, life: 0.5, kind: 'glitch' }); yield; }
  B.alpha = 1;
  W.v.gCard = { t: 0, name: sp.name, sub: 'Concepto: ' + CONCEPTS[sp.concept] + ' · ' + sp.title, col: sp.col };
  const seen = W.has('G_seen_' + sp.id);
  if (!seen) {
    W.flag('G_seen_' + sp.id);
    yield 1.4;
    yield* W.say(sp.intro(W), { id: 'G_intro_' + sp.id });
  } else yield 1.6;
  W.camFollow();
  B.state = 'fight'; B.alpha = 1; B.idleT = 0.8;
  W.unlock();
  if (!W.has('tip_guardians')) W.tip('guardians', 'GUARDIÁN: esquiva sus ataques (el «!» avisa), dispárale con [' + Input.label('attack') + '] o salta encima. Al perder vida hará una CONSULTA: dispara al orbe con la respuesta correcta.');
  else if (sp.weak && sp.weak.tip) W.tip('gw_' + sp.id, gKeys(sp.weak.tip));
}
function* G_defeat(W, B) {
  const sp = B.spec, G = B.G;
  W.lock();
  for (const p of W.projectiles) if (p.owner !== 'player') p.dead = true;
  for (const e of W.entities) if (e.gMinion && !e.dead) { e.dead = true; W.particles.burst(e.cx, e.cy, 10, { col: [PAL.green, PAL.white], kind: 'bit' }); }
  W.sfx('explosion', '[el guardián se desintegra]'); W.shake(6, 1.6); W.flash(sp.col, 0.4);
  W.cam.lockT = { x: B.cx, y: B.cy };
  for (let t = 0; t < 2; t += 1 / 60) {
    B.dieT = 2 - t;
    if (Math.random() < 0.45) { const bx = B.x + rand(0, B.w), by = B.y + rand(0, B.h); W.particles.burst(bx, by, 7, { col: [sp.col, PAL.white, PAL.gold], max: 110 }); if (Math.random() < 0.2) AudioSys.play('hit'); }
    yield;
  }
  W.flash('#FFFFFF', 0.5); W.sfx('victory');
  W.particles.burst(B.cx, B.cy, 70, { col: [sp.col, PAL.gold, PAL.white, PAL.green], kind: 'bit', max: 160, lmax: 1.6 });
  B.dead = true; if (B.twin) B.twin.dead = true;
  W.v.guardianDone = true;
  W.flag(Guardians.flag(sp));
  PROG.stats.guardians = (PROG.stats.guardians || 0) + 1;
  Codex.unlock('g_' + sp.id, true);
  if (G.gate) W.openDoor('gate');
  AudioSys.playMusic(W.def.musicFn ? W.def.musicFn() : W.def.music);
  yield 0.8;
  W.camFollow();
  Progression.addXP(60, 'guardián');
  if (sp.outro) yield* W.say(sp.outro(W), { id: 'G_outro_' + sp.id });
  if (sp.chip && !Chips.owned(sp.chip)) {
    Chips.grant(sp.chip);
    const c = CHIPS[sp.chip];
    yield* W.read('CHIP DE FIRMWARE: ' + c.n, c.d + '\n\nConcepto: ' + c.why + '\n\nCoste: ' + c.kb + ' KB de memoria de firmware. Se equipa en PAUSA → FIRMWARE. La capacidad crece con cada guardián vencido (ahora ' + Chips.cap() + ' KB).', { style: 'memory' });
  }
  Achievements.check();
  Game.save();
  W.unlock();
}
