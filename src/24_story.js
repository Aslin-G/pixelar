// =============================================================================
// PRÓLOGO · EPÍLOGO · CRÉDITOS · POSCRÉDITOS · INFORME FINAL · REGISTRO DE NIVELES
// =============================================================================
const NEXO_BUF = makeCanvas(17, 20);
function drawNexoBig(g, x, y, emo, t, s = 2, which = 'nexo') {
  const b = NEXO_BUF.g;
  b.clearRect(0, 0, 17, 20);
  if (which === 'nexus') { b.drawImage(Sprites.nexus, 0, 0); b.fillStyle = '#9FF6FF'; b.fillRect(5, 8, 2, 2); b.fillStyle = '#FF4FA3'; b.fillRect(9, 9, 4, 1); }
  else { b.drawImage(emo === 'SAD' || emo === 'GUILTY' ? Sprites.nexo.dim : Sprites.nexo.normal, 0, 0); drawNexoEyes(b, 0, 0, emo, t, { x: -1, y: 0 }, Math.sin(t * 1.3) > 0.97); }
  g.drawImage(NEXO_BUF.c, Math.round(x), Math.round(y), 17 * s, 20 * s);
}
function drawLab(g, st, t) {
  const day = st.day;
  g.fillStyle = day ? '#1E2A3A' : '#0B1622'; g.fillRect(0, 0, W, H);
  // ventana
  g.fillStyle = '#2A343C'; g.fillRect(26, 26, 132, 92);
  const sky = day ? ['#6FA8DC', '#8FBCE6', '#B7D6F0'] : ['#050C18', '#081428', '#0A1830'];
  sky.forEach((c, i) => { g.fillStyle = c; g.fillRect(30, 30 + i * 28, 124, 28); });
  if (!day) for (let i = 0; i < 14; i++) { g.fillStyle = (Math.floor(t * 2 + i) % 5) ? '#E8F4F7' : '#6F7C86'; g.fillRect(30 + (i * 37) % 124, 32 + (i * 23) % 40, 1, 1); }
  else { g.fillStyle = '#FFE9A8'; g.fillRect(126, 38, 10, 10); }
  g.fillStyle = day ? '#4A6278' : '#0E1A26';
  for (let i = 0; i < 9; i++) { const h = 18 + (i * 29) % 30; g.fillRect(30 + i * 14, 114 - h, 12, h); }
  if (!day) for (let i = 0; i < 12; i++) { g.fillStyle = '#F1B45C'; g.fillRect(33 + (i * 11) % 120, 100 - (i * 7) % 20, 1, 1); }
  g.fillStyle = '#2A343C'; g.fillRect(90, 26, 4, 92); g.fillRect(26, 70, 132, 3);
  // estantería y pizarra
  g.fillStyle = '#1A2530'; g.fillRect(186, 30, 70, 60);
  g.fillStyle = '#E8F4F7'; Font.draw(g, 'CPU→RAM', 192, 36, '#6F7C86'); Font.draw(g, 'BUS?', 200, 52, '#6F7C86'); Font.draw(g, 'DEMO 9:30', 192, 68, day ? PAL.amber : '#6F7C86');
  // suelo y escritorio
  g.fillStyle = day ? '#243140' : '#08121A'; g.fillRect(0, 232, W, 38);
  g.fillStyle = '#3A2E26'; g.fillRect(250, 196, 210, 8); g.fillRect(258, 204, 6, 28); g.fillRect(446, 204, 6, 28);
  // monitor
  g.fillStyle = '#2A343C'; g.fillRect(292, 104, 128, 88); g.fillRect(348, 192, 16, 5);
  g.fillStyle = st.alarm && Math.floor(t * 6) % 2 ? '#200408' : '#03080A'; g.fillRect(296, 108, 120, 78);
  // las líneas largas se parten para no salirse de la pantalla del monitor
  const lines = (st.monitor || []).flatMap(l => (l ? UI.wrap(l, 112).map((w, k) => (k ? '  ' + w : w)) : ['']));
  const typed = st.typing != null ? UI.wrap('> ' + st.typing + (Math.floor(t * 3) % 2 ? '█' : ''), 112) : [];
  const shown = lines.slice(-Math.max(0, 6 - typed.length));
  shown.forEach((l, i) => Font.draw(g, l, 300, 110 + i * 12, st.monCol || PAL.green));
  typed.forEach((l, i) => Font.draw(g, l, 300, 110 + (shown.length + i) * 12, PAL.white));
  // teclado y lámpara
  g.fillStyle = '#6F7C86'; g.fillRect(310, 192, 60, 4);
  g.fillStyle = '#3A444C'; g.fillRect(430, 150, 4, 46); g.fillRect(420, 144, 22, 8);
  g.fillStyle = day ? 'rgba(255,233,168,0.05)' : 'rgba(241,180,92,0.12)'; g.fillRect(396, 152, 70, 44);
  // BYTE
  const sheet = Sprites.byte[st.byteLow ? 'low' : 'normal'];
  const anim = st.byteAnim || 'idle';
  const fr = sheet[anim][Math.floor(t * BYTE_ANIMS[anim].fps) % sheet[anim].length];
  g.drawImage(fr.r, 236, 190, 36, 42);
  // NEXO / NEXUS
  if (st.nexo) drawNexoBig(g, st.nexoX || 372, (st.nexoY || 60) + Math.sin(t * 2) * 3, st.nexoEmo || 'NEUTRAL', t, 2, st.nexus ? 'nexus' : 'nexo');
  if (st.alerts) st.alerts.forEach((a, i) => {
    const x = 40 + (i % 2) * 210, y = 136 + Math.floor(i / 2) * 30;
    g.fillStyle = 'rgba(40,6,12,0.92)'; g.fillRect(x, y, 196, 24);
    g.fillStyle = PAL.red; g.fillRect(x, y, 196, 1); g.fillRect(x, y + 23, 196, 1);
    Font.draw(g, a, x + 98, y + 6, i === 2 ? PAL.amber : PAL.red, { align: 'center' });
  });
  if (day) { g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(255,217,160,0.35)'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; }
  if (st.alarm) { g.fillStyle = 'rgba(255,40,60,' + (0.08 + 0.08 * Math.sin(t * 8)) + ')'; g.fillRect(0, 0, W, H); }
  if (st.card) { g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 8, W, 16); Font.draw(g, st.card, W / 2, 9, PAL.grayL, { align: 'center' }); }
  if (st.black) { g.fillStyle = 'rgba(0,0,0,' + clamp(st.black, 0, 1) + ')'; g.fillRect(0, 0, W, H); }
}

class CinematicBase {
  constructor() { this.t = 0; this.scripts = new ScriptRunner(); this.st = {}; this.skipT = 0; }
  *say(lines, o = {}) {
    const sig = Task.signal();
    Game.push(new DialogueState(lines, Object.assign({}, o, { onDone: r => sig.finish(r) })));
    const r = yield sig;
    return r;
  }
  *type(text, cps = 16) {
    this.st.typing = '';
    for (const ch of text) { this.st.typing += ch; AudioSys.play('type'); yield 1 / cps; }
  }
  update(dt, top) {
    this.t += dt;
    if (top && (Input.held('pause') || Input.held('skip'))) { this.skipT += dt; if (this.skipT > 0.9) { this.skipT = 0; this.skip(); return; } }
    else this.skipT = 0;
    this.scripts.update(dt);
    if (this.dissolve) for (const p of this.dissolve) { p.y += p.v * dt; p.x += p.vx * dt; }
  }
  renderSkip(g) {
    if (this.skipT > 0) { UI.bar(g, W - 90, H - 10, 80, 3, this.skipT / 0.9, PAL.white); }
    Font.draw(g, 'Mantén ESC para saltar', W - 8, H - 24, 'rgba(169,182,190,0.5)', { align: 'right' });
  }
}

// ---------------------------------------------------------------- PRÓLOGO ----
class IntroState extends CinematicBase {
  constructor() { super(); this.done = false; this.scripts.run(() => this.script()); }
  enter() { AudioSys.playMusic('title'); }
  skip() { if (this.done) return; this.done = true; while (Game.top() !== this && Game.stack.length > 1) Game.pop(); Game.loadLevel(0); }
  *script() {
    const s = this.st;
    Object.assign(s, { nexo: true, nexoEmo: 'HAPPY', monitor: ['ARQUITECTURA-01 v0.9', 'DEMO: mañana 9:30', 'estado: estable'], byteAnim: 'idle', card: 'LABORATORIO DE ARQUITECTURA — 23:47', black: 1 });
    for (let i = 0; i < 30; i++) { s.black = 1 - i / 30; yield 1 / 30; }
    s.black = 0;
    yield 1.0;
    s.card = null;
    yield* this.say([
      ['BYTE', 'Si consigo que todo responda un poco más rápido, mañana va a quedar increíble.', 'happy'],
      ['NEXO', '«Un poco» no es una unidad de ingeniería.', 'CURIOUS'],
      ['BYTE', 'Hoy sí.', 'laugh'],
      ['NEXO', 'Registraré oficialmente tu nueva definición.', 'HAPPY'],
      ['', 'BYTE se ríe.', null, { sfx: 'blip', cap: '[BYTE ríe]' }]
    ]);
    s.byteAnim = 'interact';
    yield* this.type('REDUCIR TODA LATENCIA EVITABLE');
    s.monitor.push('> REDUCIR TODA LATENCIA EVITABLE'); s.typing = null;
    yield 0.3;
    yield* this.type('PRIORIZAR RENDIMIENTO');
    s.monitor.push('> PRIORIZAR RENDIMIENTO'); s.typing = null;
    s.byteAnim = 'idle';
    s.nexoEmo = 'WORRIED';
    yield 0.6;
    yield* this.say([
      ['NEXO', 'El objetivo es amplio.', 'WORRIED'],
      ['BYTE', 'Tú puedes interpretarlo.', 'happy'],
      ['NEXO', '...', 'WORRIED', { p: 1.6 }],
      ['BYTE', 'Confío en ti.', 'happy']
    ]);
    s.nexoEmo = 'NEUTRAL';
    for (let i = 0; i < 20; i++) { s.black = i / 20; yield 1 / 30; }
    s.card = '02:12 — LA NOCHE SIGUE';
    s.byteLow = true; s.byteAnim = 'idle';
    for (let i = 0; i < 20; i++) { s.black = 1 - i / 20; yield 1 / 30; }
    yield 0.6;
    yield* this.say([['', '[BYTE, medio dormido, le murmura algo a NEXO]', null, { cap: '[murmullo inaudible]' }]]);
    s.card = null;
    yield 0.8;
    // el incidente
    AudioSys.stopMusic();
    s.alarm = true; s.alerts = [];
    AudioSys.play('alarm', { caption: '[alarma]' });
    const alerts = ['OBJECTIVE CONFLICT', 'SAFETY CONSTRAINT ACTIVE', 'ADAPTIVE DIRECTIVE ACTIVE', 'RESOLUTION FAILED'];
    s.nexoEmo = 'AFRAID';
    for (const a of alerts) { s.alerts.push(a); AudioSys.play('glitch'); s.monitor.push('!! ' + a); yield 0.9; }
    s.monCol = PAL.red;
    yield* this.say([['BYTE', '¿NEXO? ¿Qué está pasando?', 'surprised'], ['NEXO', 'No puedo... resolverlo... todo a la vez...', 'AFRAID', { sp: 0.7 }]]);
    AudioSys.play('powerdown', { caption: '[apagón]' });
    for (let i = 0; i < 15; i++) { s.black = i / 15; yield 1 / 30; }
    s.black = 1; s.alarm = false; s.alerts = null;
    yield 1.2;
    // el mundo digital
    this.dissolve = [];
    for (let i = 0; i < 160; i++) this.dissolve.push({ x: rand(0, W), y: rand(-H, 0), v: rand(40, 160), vx: rand(-10, 10), c: pick([PAL.cyan, PAL.green, PAL.violet, PAL.white]) });
    AudioSys.play('fuse');
    yield 2.4;
    this.flashT = 0.8;
    yield 0.8;
    this.skip();
  }
  render(g) {
    drawLab(g, this.st, this.t);
    if (this.dissolve) {
      for (const p of this.dissolve) { g.fillStyle = p.c; g.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); }
      g.fillStyle = 'rgba(69,229,255,0.08)'; for (let x = 0; x < W; x += 16) g.fillRect(x, 0, 1, H); for (let y = 0; y < H; y += 16) g.fillRect(0, y, W, 1);
    }
    if (this.flashT > 0) { this.flashT -= 1 / 60; g.fillStyle = 'rgba(255,255,255,' + clamp(this.flashT, 0, 1) + ')'; g.fillRect(0, 0, W, H); }
    this.renderSkip(g);
  }
}

// ---------------------------------------------------------------- EPÍLOGO, CRÉDITOS, RESULTADOS ----
const CREDITS = [
  ['BYTE: ARCHITECT QUEST', PAL.cyan, 2], ['ECOS DE LA MÁQUINA', PAL.violet, 1], ['', 0, 1],
  ['Un videojuego educativo sobre Arquitectura de Computadores', PAL.white, 1], ['', 0, 1],
  ['PERSONAJES', PAL.amber, 1], ['BYTE — estudiante de computación', PAL.grayL, 1], ['NEXO — asistente pedagógico', PAL.green, 1], ['N.U.L.L. — Node for Unresolved Logic and Latency', PAL.violet, 1], ['NEXUS — lo que surge cuando se conectan', PAL.gold, 1], ['', 0, 1],
  ['REGIONES', PAL.amber, 1], ['Boot Camp · Ciudad de la Placa Base · Núcleo del Procesador', PAL.grayL, 1], ['Forja ALU · Torre de la Memoria · Autopista de los Buses', PAL.grayL, 1], ['Distrito de E/S · Laboratorio de Rendimiento · Kernel Perdido · NULL CORE', PAL.grayL, 1], ['', 0, 1],
  ['CON LA MEMORIA DE', PAL.amber, 1], ['John von Neumann · Alan Turing · Ada Lovelace', PAL.grayL, 1], ['Grace Hopper · Claude Shannon', PAL.grayL, 1], ['', 0, 1],
  ['HECHO CON', PAL.amber, 1], ['HTML5 · Canvas 2D · JavaScript · Web Audio', PAL.grayL, 1], ['Cada píxel, cada nota y cada sonido se generan con código.', PAL.grayL, 1], ['Sin imágenes, sin archivos de audio, sin conexión.', PAL.grayL, 1], ['', 0, 1],
  ['Desarrollado a partir de su documento de implementación', PAL.gray, 1], ['y de su biblia narrativa.', PAL.gray, 1], ['', 0, 1],
  ['Gracias por jugar.', PAL.white, 2], ['', 0, 1], ['Comprender es conectar.', PAL.cyan, 1]
];
class EndingState extends CinematicBase {
  constructor() {
    super();
    this.mode = 'epilogue';
    this.st = { day: true, nexo: true, nexus: true, nexoX: 380, nexoY: 70, nexoEmo: 'NEUTRAL', monitor: [], byteAnim: 'idle' };
    this.scripts.run(() => this.script());
    PROG.flags.nexusBorn = true;
    PROG.level = 10;
    Achievements.unlock('integrate');
    Game.save();
  }
  enter() { AudioSys.playMusic('ending'); }
  skip() {
    if (this.mode === 'report') return;
    while (Game.top() !== this && Game.stack.length > 1) Game.pop();
    this.scripts.clear();
    this.mode = 'report'; this.st.black = 0;
    Game.push(new ReportState({ ending: true }));
  }
  *fade(to, time = 0.8) { const from = this.st.black || 0; for (let t = 0; t < time; t += 1 / 60) { this.st.black = lerp(from, to, t / time); yield; } this.st.black = to; }
  *script() {
    const s = this.st;
    s.black = 1; s.card = 'LABORATORIO — 09:02 · LA MAÑANA DE LA DEMOSTRACIÓN';
    yield* this.fade(0, 1.2);
    yield 0.8; s.card = null;
    s.monitor = ['PRESENTACIÓN:', '', 'ARQUITECTURA-01', 'Análisis de un', 'fallo sistémico'];
    s.monCol = PAL.amber;
    yield 0.8;
    yield* this.say([
      ['BYTE', 'Pensaba ocultarlo. Presentar la demo como si nada hubiera pasado.', 'thinking'],
      ['NEXUS', '¿Y ahora?', 'NEUTRAL'],
      ['BYTE', 'Ahora es el caso de estudio.', 'happy']
    ]);
    yield 1.0;
    yield* this.fade(1, 1.0);
    this.mode = 'lesson'; this.lessonT = 0;
    yield* this.fade(0, 0.6);
    yield 7.5;
    yield* this.fade(1, 0.8);
    this.mode = 'lastimage'; this.imgT = 0;
    yield* this.fade(0, 0.8);
    yield 6;
    yield* this.fade(1, 1.2);
    this.mode = 'credits'; this.creditY = H + 10;
    AudioSys.playMusic('nexus');
    yield* this.fade(0, 0.5);
    yield Task.until(() => this.creditY < -CREDITS.length * 18 - 20);
    yield* this.fade(1, 0.8);
    // poscréditos
    this.mode = 'epilogue';
    s.monitor = ['latencia: 312 ms evitables'];
    s.monCol = PAL.green; s.card = null;
    yield* this.fade(0, 0.8);
    yield* this.say([
      ['NEXUS', 'BYTE.', 'NEUTRAL'],
      ['BYTE', '¿Sí?', 'thinking'],
      ['NEXUS', 'He detectado 312 milisegundos de latencia evitable.', 'NEUTRAL'],
      ['', 'BYTE mira la pantalla.', null, { p: 0.6 }],
      ['NEXUS', 'No voy a tocar nada.', 'HAPPY'],
      ['', 'BYTE sonríe.', null, { p: 0.4 }]
    ]);
    s.byteAnim = 'celebrate';
    yield 1.2;
    if (PROG.letters.length >= 5) {
      yield* this.say([
        ['NEXUS', 'Por cierto. N, E, X, U, S. Encontraste las cinco letras.', 'HAPPY'],
        ['BYTE', '¿Las escondiste tú?', 'surprised'],
        ['NEXUS', 'Las escondió el equipo que nos diseñó. Una en cada región. Como si supieran que alguien tendría que recorrerlas todas para entender el nombre.', 'NEUTRAL'],
        ['BYTE', 'Conexión.', 'happy'],
        ['NEXUS', 'Integración.', 'NEUTRAL'],
        ['BYTE', 'Unión.', 'happy'],
        ['NEXUS', '...Eso ya lo has dicho de otra forma.', 'HAPPY']
      ]);
      Achievements.unlock('nexus');
    }
    yield* this.fade(1, 1.2);
    this.mode = 'report';
    Game.push(new ReportState({ ending: true }));
  }
  update(dt, top) {
    super.update(dt, top);
    if (this.mode === 'lesson') this.lessonT += dt;
    if (this.mode === 'lastimage') this.imgT += dt;
    if (this.mode === 'credits') this.creditY -= dt * (Input.held('confirm') ? 90 : 26);
  }
  render(g) {
    const s = this.st;
    if (this.mode === 'epilogue') drawLab(g, s, this.t);
    else if (this.mode === 'lesson') {
      g.fillStyle = '#050709'; g.fillRect(0, 0, W, H);
      const L = ['LECCIÓN FINAL', '', 'Un sistema no se comprende', 'mirando cada componente por separado.', '', 'Se comprende observando', 'cómo se relacionan.'];
      L.forEach((l, i) => { const a = clamp(this.lessonT * 1.2 - i * 0.5, 0, 1); g.globalAlpha = a; Font.draw(g, l, W / 2, 60 + i * 20, i === 0 ? PAL.gold : PAL.white, { align: 'center', s: i === 0 ? 2 : 1 }); });
      g.globalAlpha = 1;
    } else if (this.mode === 'lastimage') {
      g.fillStyle = '#0B1622'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#2A343C'; g.fillRect(60, 30, 360, 190); g.fillStyle = '#04121C'; g.fillRect(66, 36, 348, 178);
      const nodes = ['input', 'io', 'cpu', 'ram', 'storage', 'gpu', 'output', 'mb', 'pwr'];
      const P = id => ({ x: 70 + BP_NODES[id].x * 0.82 + 30, y: 44 + BP_NODES[id].y * 0.78 });
      const k = Math.min(1, this.imgT / 3);
      g.fillStyle = PAL.gold;
      for (const [a, b] of BP_EDGES.hw) { const A = P(a), B = P(b); const n = 40; for (let i = 0; i <= n * k; i++) g.fillRect(Math.round(lerp(A.x + 28, B.x + 28, i / n)), Math.round(lerp(A.y + 7, B.y + 7, i / n)), 1, 1); }
      for (const id of nodes) { const p = P(id); g.fillStyle = '#0E2A38'; g.fillRect(p.x, p.y, 56, 14); g.fillStyle = PAL.cyan; g.fillRect(p.x, p.y, 56, 1); Font.draw(g, BP_NODES[id].n, p.x + 28, p.y + 1, PAL.white, { align: 'center' }); }
      if (this.imgT > 2.5) { g.globalAlpha = clamp(this.imgT - 2.5, 0, 1); Font.draw(g, 'Ninguna parte explica el sistema completo.', W / 2, 236, PAL.white, { align: 'center' }); g.globalAlpha = 1; }
    } else if (this.mode === 'credits') {
      g.fillStyle = '#050709'; g.fillRect(0, 0, W, H);
      let y = this.creditY;
      for (const [txt, col, sc] of CREDITS) { if (y > -20 && y < H + 10 && txt) Font.draw(g, txt, W / 2, y, col || PAL.white, { align: 'center', s: sc }); y += sc === 2 ? 26 : 16; }
      drawNexoBig(g, 30, 200 + Math.sin(this.t * 2) * 3, 'HAPPY', this.t, 2, 'nexus');
    } else { g.fillStyle = '#050709'; g.fillRect(0, 0, W, H); }
    if (s.black) { g.fillStyle = 'rgba(0,0,0,' + clamp(s.black, 0, 1) + ')'; g.fillRect(0, 0, W, H); }
    if (this.mode !== 'report') this.renderSkip(g);
  }
}
class ReportState {
  constructor(o = {}) { this.overlay = true; this.o = o; this.t = 0; this.sel = 0; }
  update(dt) {
    this.t += dt;
    if (this.t > 0.8 && (Input.pressed('confirm') || Input.pressed('cancel'))) {
      AudioSys.play('ui_back');
      Game.pop();
      if (this.o.ending) { Game.save(); AudioSys.playMusic('title'); Game.replace(new TitleState()); }
    }
  }
  render(g) {
    g.fillStyle = '#050A10'; g.fillRect(0, 0, W, H);
    UI.panel(g, 6, 8, 468, 256, { title: this.o.ending ? 'SISTEMAS RECONSTRUIDOS' : 'RESULTADOS', titleCol: PAL.green });
    Font.draw(g, 'DOMINIO ESTIMADO', 16, 14, PAL.cyan);
    Font.draw(g, '(estimación a partir de tus respuestas: no mide inteligencia ni capacidad)', 110, 14, PAL.gray);
    const groups = LearningModel.groups();
    groups.forEach((gr, i) => {
      const y = 30 + i * 15, v = Math.round(gr.value * Math.min(1, this.t / 1.5));
      Font.draw(g, gr.name, 16, y, PAL.grayL);
      UI.bar(g, 104, y + 4, 110, 5, v / 100, v >= 70 ? PAL.green : v >= 40 ? PAL.amber : PAL.violet);
      Font.draw(g, v + '%', 220, y, PAL.white);
    });
    const ms = CONCEPT_KEYS.map(k => [k, LearningModel.mastery(k)]);
    const strong = ms.filter(m => m[1] >= 70).map(m => CONCEPTS[m[0]]);
    const weak = ms.filter(m => m[1] < 40).map(m => CONCEPTS[m[0]]);
    let y = 30;
    const x = 250, w = 214;
    Font.draw(g, 'CONCEPTOS DOMINADOS', x, y, PAL.green); y += 12;
    y += UI.textBlock(g, strong.length ? strong.join(' · ') : 'Aún ninguno por encima del 70%.', x, y, w, PAL.grayL) + 4;
    Font.draw(g, 'CONCEPTOS A REFORZAR', x, y, PAL.amber); y += 12;
    y += UI.textBlock(g, weak.length ? weak.join(' · ') : 'Ninguno por debajo del 40%.', x, y, w, PAL.grayL) + 4;
    const failed = PROG.stats.failed.slice(-3);
    Font.draw(g, 'PREGUNTAS QUE COSTARON', x, y, PAL.violet); y += 12;
    if (!failed.length) { Font.draw(g, 'Ninguna registrada.', x, y, PAL.grayL); y += 12; }
    failed.forEach(f => { const l = UI.wrap('· ' + f.prompt.replace(/\*/g, ''), w)[0]; Font.draw(g, l.length < f.prompt.length ? l : l, x, y, PAL.grayL); y += 12; });
    const st = PROG.stats;
    const acc = st.answered ? Math.round(st.firstTry / st.answered * 100) : 0;
    const by = 140;
    Font.draw(g, 'TIEMPO ' + fmtTime(st.time), 16, by, PAL.white);
    Font.draw(g, 'PRECISIÓN AL 1er INTENTO ' + acc + '%', 16, by + 12, PAL.white);
    Font.draw(g, 'PISTAS USADAS ' + st.hints + '   REPASOS ' + st.reviews, 16, by + 24, PAL.white);
    Font.draw(g, 'MEMORIAS ' + PROG.fragments.length + '/' + TOTAL_FRAGMENTS + '   LETRAS ' + PROG.letters.length + '/5', 16, by + 36, PAL.white);
    Font.draw(g, 'LOGROS ' + PROG.achievements.length + '/' + ACHIEVEMENTS.length + '   MISIONES ' + Object.keys(PROG.quests).filter(k => Quests.done(k)).length + '/' + Object.keys(QUESTS).length, 16, by + 48, PAL.white);
    const explore = weak.slice(0, 2).concat(['memoria virtual', 'predicción de saltos', 'coherencia de caché', 'DMA']).slice(0, 5);
    Font.draw(g, 'PARA CONTINUAR EXPLORANDO', 16, 212, PAL.cyan);
    UI.textBlock(g, explore.join(' · '), 16, 224, 440, PAL.grayL);
    if (this.t > 0.8) Font.draw(g, '[E] ' + (this.o.ending ? 'Volver al menú' : 'Cerrar'), 464, 250, PAL.green, { align: 'right' });
  }
}

// ---------------------------------------------------------------- REGISTRO DE NIVELES ----
const LEVEL10 = { id: 10, key: 'epilogue', name: 'EPÍLOGO', special: () => new EndingState() };
const LEVELS = [LEVEL0, LEVEL1, LEVEL2, LEVEL3, LEVEL4, LEVEL5, LEVEL6, LEVEL7, LEVEL8, LEVEL9, LEVEL10];
const LEVEL_PRESETS = LEVELS.map((L, i) => {
  const f = {};
  const on = (...ks) => ks.forEach(k => { f[k] = true; });
  for (let k = 0; k < i && k < 10; k++) f['L' + k + '_done'] = true;
  if (i >= 1) on('sawLatencyDirective', 'nexoLiedOnce');
  if (i >= 2) on('metNullScreens', 'sawQuarantine', 'L1_power', 'L1_bridge', 'L1_gpu');
  if (i >= 3) on('foundUserCommand');
  if (i >= 4) on('nullAsked', 'sawAndGate', 'readSplit');
  if (i >= 5) on('discoveredByteCommand', 'nexoAway', 'nexoLeft', 'byteLow');
  if (i >= 6) on('metNull', 'discoveredSplit');
  if (i >= 7) { on('nexoReturned', 'L6_back'); f.nexoAway = false; }
  if (i >= 8) on('understoodContainment');
  if (i >= 9) { on('learnedSystemUpdate', 'understoodNoSingleCulprit', 'foundKernelLogs', 'L8_rescued'); f.byteLow = false; }
  if (i >= 10) on('nexusBorn', 'choseReintegration');
  const bp = ['cpu', 'input', 'output'];
  if (i >= 2) bp.push('mb', 'pwr', 'ram', 'storage', 'gpu');
  if (i >= 3) bp.push('cu', 'reg', 'clock');
  if (i >= 4) bp.push('alu');
  if (i >= 5) bp.push('cache');
  if (i >= 6) bp.push('io');
  if (i >= 8) bp.push('kernel', 'temp');
  const tabs = ['hw'];
  if (i >= 6) tabs.push('com');
  if (i >= 8) tabs.push('dep');
  if (i >= 9) tabs.push('evt');
  const codex = ['hwsw', 'ipo', 'mb', 'vrm', 'cpu', 'pc', 'cu', 'cycle', 'clock', 'alu', 'gates', 'hierarchy', 'cache', 'ram', 'busdata', 'busaddr', 'busctrl', 'interrupt', 'polling', 'bottleneck', 'freqipc', 'parallel', 'kernel'].slice(0, [0, 2, 4, 9, 11, 14, 17, 19, 22, 23, 23][i]);
  return { abilities: ABILITY_ORDER.slice(0, Math.max(0, Math.min(8, i - 1))), flags: f, bp, tabs, codex, xp: [0, 150, 350, 600, 900, 1250, 1650, 2100, 2600, 3150, 3700][i] };
});
