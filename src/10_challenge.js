// =============================================================================
// DESAFÍOS — ciclo pedagógico completo:
// ERROR → FEEDBACK → PISTA → SEGUNDO INTENTO → EJEMPLO GUIADO → PROBLEMA SIMILAR → REPASO POSTERIOR
// =============================================================================
const VOICE_LINES = {
  ok: {
    NEXO: ['¡Exacto! Lo viste antes de que te lo dijera.', 'Correcto. Eso ya no es memoria: es comprensión.', 'Bien razonado. El sistema acaba de ganar un poco de orden.', 'Sí. Y ahora sabes por qué, que es lo importante.', '¡Eso es! Registro esto como progreso real.', 'Perfecto. Hasta mis ventiladores se relajaron.'],
    TERMINAL: ['VERIFICACIÓN: CORRECTA.', 'RESULTADO VÁLIDO. MÓDULO ESTABLE.', 'CORRECTO. SIN OBSERVACIONES.'],
    NEXUS: ['Correcto. Y lo dudaste lo justo.', 'Bien. Diagnóstico y comprensión a la vez.']
  },
  bad: {
    NEXO: ['Casi. Mira qué pasó exactamente...', 'No pasa nada: equivocarse aquí es barato; entender por qué, valioso.', 'Mmm. El sistema no respondió como esperabas. ¿Por qué será?', 'Ese resultado nos dice algo. Escuchémoslo.'],
    TERMINAL: ['VERIFICACIÓN FALLIDA.', 'RESULTADO INCOHERENTE. REVISE LA CONFIGURACIÓN.'],
    NEXUS: ['No encaja todavía. Lo que falló es información, no un veredicto.']
  }
};
const Voice = {
  speaker() {
    if (!PROG) return 'NEXO';
    if (PROG.flags.nexusBorn) return 'NEXUS';
    if (PROG.flags.nexoAway) return 'TERMINAL';
    return 'NEXO';
  },
  line(kind) { return pick(VOICE_LINES[kind][this.speaker()]); },
  hintTag() { return PROG && PROG.flags.nexoReturned && !PROG.flags.nexusBorn ? 'HIPÓTESIS' : null; }
};
const TYPE_LABEL = {
  choice: 'ANÁLISIS', order: 'ORDENAMIENTO', match: 'ASOCIACIÓN', classify: 'CLASIFICACIÓN', logic: 'LÓGICA',
  bits: 'ARITMÉTICA BINARIA', route: 'ENRUTAMIENTO', memsim: 'SIMULACIÓN DE MEMORIA', sim: 'SIMULACIÓN',
  interrupts: 'GESTIÓN DE INTERRUPCIONES', timing: 'SINCRONIZACIÓN'
};
const SOURCE_TITLE = {
  terminal: ['TERMINAL', PAL.cyan], review: ['ECO DE MEMORIA', PAL.violet], boss: ['EMERGENCIA', PAL.red],
  teacher: ['PRÁCTICA', PAL.green], counter: ['CONTRAMEDIDA', PAL.amber], quest: ['MISIÓN', PAL.gold], world: ['SISTEMA', PAL.cyan]
};
const EXPECTED_TIME = { choice: 25, order: 35, match: 40, classify: 40, logic: 45, bits: 45, route: 60, memsim: 45, sim: 60, interrupts: 70, timing: 30 };

class ChallengeState {
  constructor(ch, o = {}) {
    this.overlay = true;
    this.ch = ch; this.o = o;
    this.attempt = 1; this.hintLevel = 0; this.paidHints = 0; this.conf = null;
    this.phase = 'play'; this.t = 0; this.shakeT = 0; this.flashT = 0; this.flashCol = PAL.green;
    this.hintText = null; this.msg = null; this.msgT = 0;
    this.resultOk = false; this.feedback = ''; this.misconception = null; this.xpGained = 0;
    this.confSel = 1; this.btnSel = 0;
    this.askConf = !o.noConf && ch.difficulty >= 2 && !['route', 'interrupts', 'timing'].includes(ch.type) && (o.forceConf || Math.random() < 0.55);
    this.startT = 0;
    this.hintBtn = { x: 420, y: 12, w: 46, h: 13 };
    this.resBtn = null; this.guideBtn = null; this.confBtns = [];
    QM.markUsed(ch.id);
    this.w = makeWidget(ch, this);
    this.layout();
  }
  layout() {
    this.promptLines = UI.wrap(this.ch.prompt || '', 444);
    const top = 30 + Math.min(5, this.promptLines.length) * 12 + 4;
    this.area = { x: 18, y: top, w: 444, h: 232 - top };
  }
  enter() { AudioSys.muffle(true); }
  exit() { AudioSys.muffle(false); }
  get speaker() { return Voice.speaker(); }
  toastMsg(t) { this.msg = t; this.msgT = 2.2; }

  useHint() {
    if (this.hintLevel >= 3) { this.toastMsg('No quedan más pistas para este desafío.'); return; }
    this.hintLevel++; this.paidHints++;
    PROG.stats.hints++;
    const h = this.ch.hints || [];
    if (this.hintLevel === 1) this.hintText = h[0] || '¿Qué propiedad del sistema es la que realmente importa aquí?';
    else if (this.hintLevel === 2) { this.w.highlight(); this.hintText = h[1] || 'Mira los elementos resaltados: ahí está la clave.'; }
    else { this.w.partial(); this.hintText = h[2] || 'Te muestro una parte de la solución. Completa el resto.'; }
    AudioSys.play('echo');
  }
  submit() {
    if (this.phase !== 'play') return;
    if (!this.w.isReady()) { this.toastMsg(this.w.notReadyMsg || 'Completa todos los elementos antes de verificar.'); AudioSys.play('ui_back'); return; }
    if (this.askConf && this.attempt === 1 && this.conf === null) { this.phase = 'conf'; this.confSel = 1; AudioSys.play('ui_ok'); return; }
    this.evaluate();
  }
  evaluate() {
    const r = this.w.evaluate();
    this.lastResult = r;
    if (r.ok) {
      AudioSys.play('correct');
      this.flashT = 0.4; this.flashCol = PAL.green;
      this.resultOk = true;
      const ch = this.ch;
      let xp = (10 + 8 * ch.difficulty) * (this.attempt === 1 ? 1 : 0.5) * Math.max(0.25, 1 - 0.25 * this.paidHints) * (this.o.isVariant ? 0.7 : 1) * (this.o.source === 'review' ? 1.25 : 1);
      this.xpGained = Math.round(xp);
      this.record(true);
      this.feedback = ch.explanation || '';
      this.voice = Voice.line('ok');
      this.misconception = null;
      this.lowConfNote = this.conf === 0;
    } else {
      AudioSys.play('wrong');
      this.shakeT = 0.35; this.flashT = 0.4; this.flashCol = PAL.red;
      this.resultOk = false;
      this.w.consequence && this.w.consequence(r);
      this.feedback = (this.w.feedback && this.w.feedback(r)) || this.ch.wrong || 'El resultado no coincide con lo que el sistema necesita.';
      this.voice = Voice.line('bad');
      this.misconception = this.conf === 2 && this.attempt === 1 ? (this.ch.misconception || 'Tenías mucha confianza en una respuesta incorrecta: es una señal de un concepto que conviene revisar con calma.') : null;
      if (this.attempt >= 2) this.record(false);
    }
    this.phase = 'result';
  }
  record(ok) {
    if (this.recorded) return;
    this.recorded = true;
    LearningModel.record({
      concept: this.ch.concept, chId: this.ch.id, correct: ok, firstTry: ok && this.attempt === 1,
      hints: this.paidHints, time: this.t, expected: this.ch.expected || EXPECTED_TIME[this.ch.type] || 40,
      conf: this.conf, difficulty: this.ch.difficulty, transfer: this.o.source === 'review' || this.o.transfer,
      guided: !!this.o.isVariant, misconception: this.conf === 2 && !(ok && this.attempt === 1), prompt: this.ch.prompt
    });
  }
  afterResult() {
    if (this.resultOk) {
      if (this.xpGained) Progression.addXP(this.xpGained, CONCEPTS[this.ch.concept]);
      this.finish({ ok: true, firstTry: this.attempt === 1, attempts: this.attempt, hints: this.paidHints, chId: this.ch.id });
      return;
    }
    if (this.attempt === 1) {
      this.attempt = 2;
      if (this.hintLevel < 1) { this.hintLevel = 1; this.hintText = (this.ch.hints || [])[0] || '¿Qué propiedad del sistema es la que realmente importa aquí?'; }
      this.w.reset();
      this.phase = 'play';
      return;
    }
    // Segundo fallo: ejemplo guiado
    this.phase = 'guided';
    this.w.showSolution();
    this.guidedText = (this.ch.explanation || '') + (this.o.isVariant ? '' : '  Ahora prueba uno parecido tú.');
  }
  afterGuided() {
    if (this.o.isVariant || this.o.noVariant) { this.finish({ ok: true, struggled: true, chId: this.ch.id }); return; }
    const v = QM.variantOf(this.ch);
    if (!v) { this.finish({ ok: true, struggled: true, chId: this.ch.id }); return; }
    const o = Object.assign({}, this.o, { isVariant: true, noConf: true });
    Game.pop();
    Game.push(new ChallengeState(v, o));
    UI.toast('NUEVO PROBLEMA SIMILAR', PAL.violet);
  }
  exitChallenge() {
    if (this.attempt >= 2 && !this.recorded) this.record(false);
    this.finish({ ok: false, exited: true, chId: this.ch.id });
  }
  finish(res) {
    if (Game.top() === this) Game.pop();
    if (this.o.onDone) this.o.onDone(res);
  }

  update(dt) {
    this.t += dt;
    this.shakeT = Math.max(0, this.shakeT - dt); this.flashT = Math.max(0, this.flashT - dt); this.msgT = Math.max(0, this.msgT - dt);
    if (this.phase === 'play') {
      if (Input.pressed('hint')) { this.useHint(); return; }
      if (Input.pressed('cancel') && this.o.allowExit !== false) { AudioSys.play('ui_back'); this.exitChallenge(); return; }
      if (Input.keyPressed('KeyV') && this.w.needsSubmit !== false) { this.submit(); return; }
      if (UI.clicked(this.hintBtn.x, this.hintBtn.y, this.hintBtn.w, this.hintBtn.h)) { this.useHint(); return; }
      this.w.update(dt);
    } else if (this.phase === 'conf') {
      if (Input.nav('left')) { this.confSel = (this.confSel + 2) % 3; AudioSys.play('ui_move'); }
      if (Input.nav('right')) { this.confSel = (this.confSel + 1) % 3; AudioSys.play('ui_move'); }
      const ci = this.confBtns.findIndex(b => UI.clicked(b.x, b.y, b.w, b.h));
      if (ci >= 0) { this.confSel = ci; this.conf = ci; this.evaluate(); return; }
      if (Input.pressed('confirm')) { this.conf = this.confSel; this.evaluate(); }
    } else if (this.phase === 'result') {
      const rb = this.resBtn;
      if (Input.pressed('confirm') || (rb && UI.clicked(rb.x, rb.y, rb.w, rb.h))) { AudioSys.play('ui_ok'); this.afterResult(); }
    } else if (this.phase === 'guided') {
      this.w.update(dt, true);
      const gb = this.guideBtn;
      if (Input.pressed('confirm') || (gb && UI.clicked(gb.x, gb.y, gb.w, gb.h))) { AudioSys.play('ui_ok'); this.afterGuided(); }
    }
  }

  render(g) {
    UI.overlayDim(g, 0.84);
    const ox = this.shakeT > 0 && !Settings.data.reduceShake ? Math.round(Math.sin(this.t * 80) * 3) : 0;
    g.save(); g.translate(ox, 0);
    const [src, scol] = SOURCE_TITLE[this.o.source || 'terminal'] || SOURCE_TITLE.terminal;
    UI.panel(g, 8, 8, 464, 256, { title: this.o.title || src, titleCol: scol });
    // cabecera
    const ch = this.ch;
    let x = 14;
    const cname = CONCEPTS[ch.concept] || ch.concept;
    const cw = Font.measure(cname) + 8;
    g.fillStyle = shade(PAL.cyan, 0.3); g.fillRect(x, 13, cw, 12);
    Font.draw(g, cname, x + 4, 13, PAL.cyan);
    x += cw + 6;
    Font.draw(g, ch.kind || TYPE_LABEL[ch.type] || '', x, 13, PAL.grayL);
    UI.pips(g, 330, 17, ch.difficulty, 5, PAL.amber);
    Font.draw(g, this.o.isVariant ? 'SIMILAR' : 'INTENTO ' + this.attempt, 362, 13, this.attempt > 1 ? PAL.amber : PAL.gray);
    // botón de pista
    this.hintBtn = { x: 420, y: 12, w: 46, h: 13 };
    const hb = this.hintBtn;
    g.fillStyle = UI.hover(hb.x, hb.y, hb.w, hb.h) ? '#2A2A12' : '#161A10'; g.fillRect(hb.x, hb.y, hb.w, hb.h);
    Font.draw(g, 'H ' + this.hintLevel + '/3', hb.x + hb.w / 2, hb.y, this.hintLevel >= 3 ? PAL.gray : PAL.amber, { align: 'center' });
    // enunciado
    Font.drawLines(g, this.promptLines.slice(0, 5), 16, 30, PAL.white, { hl: PAL.amber });
    // área del widget
    const a = this.area;
    const hintH = this.hintText && this.phase === 'play' ? 30 : 0;
    this.w.render(g, { x: a.x, y: a.y, w: a.w, h: a.h - hintH }, this.t);
    // pista
    if (hintH) {
      const hy = a.y + a.h - hintH + 2;
      g.fillStyle = '#16140A'; g.fillRect(14, hy, 452, hintH - 2);
      g.fillStyle = PAL.amber; g.fillRect(14, hy, 2, hintH - 2);
      const spk = Voice.speaker();
      g.drawImage(getPortrait(spk === 'TERMINAL' ? 'SYS' : spk, 'CURIOUS'), 18, hy + 2, 24, 24);
      const tag = Voice.hintTag();
      if (tag) { Font.draw(g, tag, 46, hy, PAL.violet); }
      Font.drawLines(g, UI.wrap(this.hintText, tag ? 356 : 410).slice(0, 2), tag ? 100 : 48, hy + 2, '#F5E3B8', { hl: PAL.white });
    }
    // pie
    if (this.phase === 'play') {
      const items = (this.w.keyHints ? this.w.keyHints() : [['↑↓', 'Mover'], ['E', 'Elegir']]).slice();
      if (this.w.needsSubmit !== false) items.push(['V', 'Verificar']);
      items.push(['H', 'Pista']);
      if (this.o.allowExit !== false) items.push(['ESC', 'Salir']);
      UI.keyHints(g, items, 240, 248, 'center');
    }
    if (this.msgT > 0) {
      const w = Font.measure(this.msg) + 12;
      g.fillStyle = 'rgba(40,10,14,0.95)'; g.fillRect(240 - w / 2, 226, w, 13);
      Font.draw(g, this.msg, 240, 226, PAL.amber, { align: 'center' });
    }
    g.restore();
    if (this.flashT > 0 && !Settings.data.reduceFlash) { g.globalAlpha = this.flashT * 0.4; g.fillStyle = this.flashCol; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
    if (this.phase === 'conf') this.renderConf(g);
    if (this.phase === 'result') this.renderResult(g);
    if (this.phase === 'guided') this.renderGuided(g);
  }
  renderConf(g) {
    UI.overlayDim(g, 0.6);
    UI.panel(g, 90, 84, 300, 96, { title: 'METACOGNICIÓN', titleCol: PAL.violet });
    Font.draw(g, '¿Qué tan seguro estás de tu respuesta?', 240, 96, PAL.white, { align: 'center' });
    const labels = ['POCO', 'MEDIO', 'MUCHO'];
    this.confBtns = [];
    for (let i = 0; i < 3; i++) {
      const bx = 117 + i * 84;
      UI.button(g, bx, 116, 76, 18, labels[i], this.confSel === i, { color: PAL.violet });
      this.confBtns.push({ x: bx, y: 116, w: 76, h: 18 });
    }
    Font.drawLines(g, UI.wrap('No afecta al resultado: te ayuda a detectar ideas confusas.', 280), 100, 142, PAL.gray);
  }
  renderResult(g) {
    const ok = this.resultOk;
    const spk = Voice.speaker();
    const blocks = [];
    const fbLines = UI.wrap(this.feedback || '', 330);
    const misLines = this.misconception ? UI.wrap(this.misconception, 330) : [];
    const lowLines = this.lowConfNote ? UI.wrap('Acertaste con poca confianza: vale la pena repasar por qué funciona.', 330) : [];
    const h = 60 + Math.min(7, fbLines.length) * 12 + (misLines.length ? misLines.length * 12 + 16 : 0) + (lowLines.length ? lowLines.length * 12 + 4 : 0);
    const y = Math.max(20, Math.floor((H - h) / 2));
    UI.panel(g, 50, y, 380, h, { border: ok ? PAL.green : PAL.red, title: ok ? '✓ CORRECTO' : '✗ AÚN NO', titleCol: ok ? PAL.green : PAL.red });
    g.drawImage(getPortrait(spk === 'TERMINAL' ? 'SYS' : spk, ok ? 'HAPPY' : 'WORRIED'), 58, y + 10);
    Font.draw(g, this.voice || '', 96, y + 10, ok ? PAL.green : PAL.amber);
    let ty = y + 26;
    Font.drawLines(g, fbLines.slice(0, 7), 96, ty, PAL.white, { hl: PAL.cyan });
    ty += Math.min(7, fbLines.length) * 12 + 4;
    if (lowLines.length) { Font.drawLines(g, lowLines, 96, ty, PAL.violet); ty += lowLines.length * 12 + 4; }
    if (misLines.length) {
      g.fillStyle = '#2A1030'; g.fillRect(92, ty, 330, misLines.length * 12 + 14);
      Font.draw(g, 'POSIBLE CONCEPTO ERRÓNEO', 96, ty, PAL.magenta);
      Font.drawLines(g, misLines, 96, ty + 12, '#F0D6F5');
      ty += misLines.length * 12 + 16;
    }
    const label = ok ? (this.xpGained ? 'CONTINUAR  +' + this.xpGained + ' XP' : 'CONTINUAR') : this.attempt === 1 ? 'REINTENTAR' : 'VER EJEMPLO GUIADO';
    UI.button(g, 240 - 80, y + h - 22, 160, 16, label, true, { color: ok ? PAL.green : PAL.amber });
    this.resBtn = { x: 160, y: y + h - 22, w: 160, h: 16 };
  }
  renderGuided(g) {
    const lines = UI.wrap(this.guidedText || '', 440);
    const h = 30 + Math.min(4, lines.length) * 12;
    UI.panel(g, 12, H - h - 8, 456, h, { border: PAL.violet, title: 'EJEMPLO GUIADO', titleCol: PAL.violet });
    Font.drawLines(g, lines.slice(0, 4), 20, H - h, PAL.white, { hl: PAL.cyan });
    UI.button(g, 330, H - 26, 130, 14, this.o.isVariant || this.o.noVariant ? 'CONTINUAR' : 'PROBLEMA SIMILAR', true, { color: PAL.violet });
    this.guideBtn = { x: 330, y: H - 26, w: 130, h: 14 };
  }
}

// Atajo para lanzar un desafío como tarea de script
function challengeTask(chOrId, o = {}) {
  const sig = Task.signal();
  let ch = typeof chOrId === 'string' ? QM.get(chOrId) : chOrId;
  if (!ch && o.concept) ch = QM.pick(o.concept);
  if (!ch) { sig.finish({ ok: true, missing: true }); return sig; }
  Game.push(new ChallengeState(ch, Object.assign({}, o, { onDone: r => { if (o.onDone) o.onDone(r); sig.finish(r); } })));
  return sig;
}
