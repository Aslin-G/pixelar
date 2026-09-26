// =============================================================================
// SISTEMA PEDAGÓGICO: modelo de dominio, repaso espaciado, gestor de desafíos,
// progresión (XP / nivel) y logros.
// =============================================================================
let PROG = null; // progreso de la partida actual (se asigna en Game)

const LearningModel = {
  blank() {
    const c = {};
    for (const k of CONCEPT_KEYS) c[k] = { m: 0, att: 0, cor: 0, first: 0, hints: 0, streak: 0, last: 0, misc: 0 };
    return { c, review: [], log: [], playTime: 0, misconceptions: [] };
  },
  fix(l) {
    if (!l || !l.c) return this.blank();
    const b = this.blank();
    for (const k of CONCEPT_KEYS) if (!l.c[k]) l.c[k] = b.c[k];
    l.review = l.review || []; l.log = l.log || []; l.misconceptions = l.misconceptions || []; l.playTime = l.playTime || 0;
    return l;
  },
  L() { return PROG.learning; },
  get(k) { return this.L().c[k] || { m: 0 }; },
  mastery(k) { return Math.round(this.get(k).m); },
  allowedDifficulty(k) {
    const m = this.get(k).m;
    let d = m < 20 ? 2 : m < 45 ? 3 : m < 70 ? 4 : 5;
    const ed = Settings.data.eduDifficulty;
    if (ed === 0) d -= 1; else if (ed === 2) d += 1;
    return clamp(d, 1, 5);
  },
  tick(dt) { if (PROG) this.L().playTime += dt; },
  now() { return this.L().playTime; },
  record(res) {
    const c = this.get(res.concept);
    const L = this.L();
    const diff = res.difficulty || 1, hints = res.hints || 0, conf = res.conf;
    c.att++; c.last = L.playTime; c.hints += hints;
    let delta;
    if (res.firstTry) {
      c.cor++; c.first++; c.streak++;
      delta = 6 + 3 * diff;
      delta *= Math.max(0.35, 1 - 0.22 * hints);
      const exp = res.expected || 30;
      if (res.time < exp * 0.6) delta *= 1.1; else if (res.time > exp * 2.5) delta *= 0.9;
      if (conf === 2) delta *= 1.15; else if (conf === 0) delta *= 0.8;
      if (res.transfer) delta *= 1.3;
      delta *= (1 - c.m / 130);
    } else if (res.correct) {
      c.cor++; c.streak = 0;
      delta = (2 + diff) * Math.max(0.3, 1 - 0.2 * hints) * (res.guided ? 0.5 : 1) * (1 - c.m / 130);
      delta -= conf === 2 ? 3 : 1;
    } else {
      c.streak = 0;
      delta = -(2 + diff * 0.5) - (conf === 2 ? 3 : 0);
    }
    if (res.misconception) {
      c.misc++;
      L.misconceptions.push({ concept: res.concept, id: res.chId, t: Math.round(L.playTime) });
    }
    const before = c.m;
    c.m = clamp(c.m + delta, 0, 100);
    if (!res.firstTry) this.scheduleReview(res.concept, res.chId);
    L.log.push({ t: Math.round(L.playTime), concept: res.concept, id: res.chId, ok: !!res.firstTry, d: Math.round((c.m - before) * 10) / 10 });
    if (L.log.length > 400) L.log.shift();
    // estadísticas globales
    const st = PROG.stats;
    st.answered++;
    if (res.firstTry) { st.correct++; st.firstTry++; }
    else if (!st.failed.some(f => f.id === res.chId)) st.failed.push({ id: res.chId, concept: res.concept, prompt: (res.prompt || '').slice(0, 90) });
    if (hints === 0 && res.firstTry) st.noHintStreak++; else st.noHintStreak = 0;
    if ((res.firstTry && conf === 2) || (!res.firstTry && conf === 0)) st.calibrated++;
    Achievements.check();
    return c.m - before;
  },
  scheduleReview(concept, chId) {
    const L = this.L();
    if (L.review.some(r => r.concept === concept)) return;
    L.review.push({ concept, chId, due: L.playTime + randi(150, 280) });
  },
  dueReview() {
    const L = this.L();
    return L.review.find(r => r.due <= L.playTime) || null;
  },
  completeReview(concept, ok) {
    const L = this.L();
    L.review = L.review.filter(r => r.concept !== concept);
    if (!ok) L.review.push({ concept, due: L.playTime + 200 });
  },
  group(keys) { return Math.round(keys.reduce((s, k) => s + this.get(k).m, 0) / keys.length); },
  groups() {
    return [
      ['FUNDAMENTOS', ['hardwareBasics', 'motherboard']],
      ['CPU', ['cpu', 'fetchDecodeExecute', 'registers']],
      ['ALU', ['alu']],
      ['MEMORIA', ['cache', 'ram', 'storage']],
      ['BUSES', ['buses']],
      ['E/S', ['io', 'interrupts']],
      ['RENDIMIENTO', ['performance', 'parallelism', 'bottlenecks']]
    ].map(([n, ks]) => ({ name: n, keys: ks, value: this.group(ks) }));
  }
};

// ---------------------------------------------------------------- Gestor de desafíos ----
const QM = {
  byId: {}, byConcept: {}, gens: {}, genCount: 0,
  register(list) {
    for (const ch of list) {
      this.byId[ch.id] = ch;
      (this.byConcept[ch.concept] = this.byConcept[ch.concept] || []).push(ch);
    }
  },
  registerGen(concept, fn) { (this.gens[concept] = this.gens[concept] || []).push(fn); },
  used() { return new Set(PROG.usedChallenges); },
  markUsed(id) { if (!PROG.usedChallenges.includes(id)) PROG.usedChallenges.push(id); },
  get(id) { return this.byId[id] || null; },
  generate(concept, diff) {
    const gens = this.gens[concept];
    if (!gens || !gens.length) return null;
    const fn = pick(gens);
    const ch = fn(clamp(diff || 2, 1, 5));
    ch.id = ch.id || ('gen_' + concept + '_' + (++this.genCount) + '_' + Math.floor(Math.random() * 1e6));
    ch.concept = ch.concept || concept;
    ch.generated = true;
    this.byId[ch.id] = ch;
    return ch;
  },
  pick(concept, o = {}) {
    const allowed = o.maxDiff || LearningModel.allowedDifficulty(concept);
    const used = this.used();
    const all = (this.byConcept[concept] || []).filter(ch => !ch.noPick && !(o.types && !o.types.includes(ch.type)));
    let pool = all.filter(ch => !used.has(ch.id) && ch.difficulty <= allowed && (!o.minDiff || ch.difficulty >= o.minDiff));
    if (!pool.length) {
      const g = this.generate(concept, allowed);
      if (g && (!o.types || o.types.includes(g.type))) return g;
      pool = all.filter(ch => ch.difficulty <= allowed + 1);
      if (!pool.length) pool = all;
    }
    if (!pool.length) return this.generate(concept, allowed);
    // preferir la dificultad más alta permitida, con algo de azar
    pool = shuffle(pool).sort((a, b) => Math.abs(allowed - a.difficulty) - Math.abs(allowed - b.difficulty));
    return pool[0];
  },
  variantOf(ch) {
    const used = this.used();
    if (ch.retryVariant && ch.retryVariant !== 'gen') {
      const v = this.byId[ch.retryVariant];
      if (v && !used.has(v.id)) return v;
    }
    const g = this.generate(ch.concept, Math.max(1, ch.difficulty - 1));
    if (g) return g;
    const alt = (this.byConcept[ch.concept] || []).filter(c => c.id !== ch.id && !used.has(c.id) && !c.noPick);
    return alt.length ? pick(alt) : null;
  }
};

// ---------------------------------------------------------------- Progresión ----
const Progression = {
  levelFor(xp) { let l = 1, need = 100; while (xp >= need && l < 20) { l++; need += 100 + (l - 1) * 60; } return l; },
  nextAt(level) { let need = 100; for (let l = 2; l <= level; l++) need += 100 + (l - 1) * 60; return need; },
  prevAt(level) { return level <= 1 ? 0 : this.nextAt(level - 1); },
  upgFor(level) { return level >= 8 ? 3 : level >= 6 ? 2 : level >= 4 ? 1 : 0; },
  addXP(n, reason) {
    if (!PROG || n <= 0) return;
    n = Math.round(n);
    PROG.xp += n;
    if (typeof UI !== 'undefined') UI.toast('+' + n + ' XP' + (reason ? '  ' + reason : ''), PAL.green, 'xp');
    const l = this.levelFor(PROG.xp);
    if (l > PROG.playerLevel) {
      const oldU = this.upgFor(PROG.playerLevel);
      PROG.playerLevel = l;
      AudioSys.play('levelup');
      if (typeof UI !== 'undefined') UI.toast('NIVEL ' + l + ' — capacidad de energía mejorada', PAL.gold);
      const u = this.upgFor(l);
      if (u !== oldU) { Sprites.buildByte(u); if (typeof UI !== 'undefined') UI.toast('Mejora visual desbloqueada', PAL.cyan); }
    }
  },
  maxEnergy() { return 100 + (PROG ? (PROG.playerLevel - 1) * 8 : 0); }
};

// ---------------------------------------------------------------- Logros ----
const ACHIEVEMENTS = [
  { id: 'boot', n: 'Primer arranque', d: 'Completa el Boot Camp.' },
  { id: 'nohint10', n: 'Sin muletas', d: 'Resuelve 10 desafíos seguidos al primer intento y sin pistas.' },
  { id: 'echo5', n: 'Cazador de ecos', d: 'Completa 5 repasos de ECO.' },
  { id: 'frags', n: 'Arqueología personal', d: 'Encuentra todos los Memory Fragments.' },
  { id: 'nexus', n: 'N-E-X-U-S', d: 'Reúne las cinco letras ocultas.' },
  { id: 'history', n: 'Historia viva', d: 'Lee las cinco terminales históricas.' },
  { id: 'calib', n: 'Metacognición', d: 'Calibra tu confianza correctamente 10 veces.' },
  { id: 'bits', n: 'Restaurador de bits', d: 'Restaura 15 enemigos corruptos.' },
  { id: 'sides', n: 'Mantenimiento completo', d: 'Completa todas las misiones secundarias.' },
  { id: 'integrate', n: 'Integración', d: 'Restaura ARQUITECTURA-01.' },
  { id: 'master', n: 'Arquitecto', d: 'Alcanza 70% de dominio estimado en todos los conceptos.' },
  { id: 'nodmg', n: 'Sistema estable', d: 'Completa un nivel sin perder HP.' },
  { id: 'teacher', n: 'Explorador curioso', d: 'Desbloquea 20 entradas del Codex.' }
];
const Achievements = {
  unlock(id) {
    if (!PROG || PROG.achievements.includes(id)) return;
    PROG.achievements.push(id);
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (a && typeof UI !== 'undefined') UI.toast('LOGRO: ' + a.n, PAL.gold, 'ach');
    AudioSys.play('pickup');
  },
  check() {
    if (!PROG) return;
    const st = PROG.stats;
    if (st.noHintStreak >= 10) this.unlock('nohint10');
    if (st.reviews >= 5) this.unlock('echo5');
    if (st.calibrated >= 10) this.unlock('calib');
    if (st.enemies >= 15) this.unlock('bits');
    if (PROG.letters.length >= 5) this.unlock('nexus');
    if (PROG.historic.length >= 5) this.unlock('history');
    if (PROG.codex.length >= 20) this.unlock('teacher');
    if (typeof TOTAL_FRAGMENTS !== 'undefined' && PROG.fragments.length >= TOTAL_FRAGMENTS) this.unlock('frags');
    if (typeof SIDE_QUEST_IDS !== 'undefined' && SIDE_QUEST_IDS.every(id => PROG.quests[id] && PROG.quests[id].state === 'done')) this.unlock('sides');
    if (CONCEPT_KEYS.every(k => LearningModel.get(k).m >= 70)) this.unlock('master');
  }
};
