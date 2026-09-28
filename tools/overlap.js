#!/usr/bin/env node
// Detector de TEXTO SUPERPUESTO: registra cada texto dibujado (Font.trace) y avisa cuando dos
// textos distintos se pisan en pantalla. Recorre menús, desafíos, HUD, diálogos, cinemáticas
// y barre la cámara por todos los niveles.
// Uso: node tools/overlap.js [dir_capturas]  (con capturas guarda una imagen de cada conflicto)
'use strict';
const path = require('path');
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require('/opt/node22/lib/node_modules/playwright'); }
const file = 'file://' + path.resolve(__dirname, '..', 'index.html');
const shots = process.argv[2];

(async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(file);
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    const OV = window.OV = { found: [], seen: new Set(), scenes: 0 };
    OV.capture = (name) => {
      const recs = [], rects = [];
      let order = 0;
      const G = Game.g, fr = G.fillRect, di = G.drawImage;
      const alphaOf = st => { if (typeof st !== 'string') return 1; const m = /rgba\([^)]*,\s*([0-9.]+)\)/.exec(st); return m ? +m[1] : 1; };
      // rectángulos opacos: tapan el texto dibujado antes que ellos
      G.fillRect = function (x, y, w, h) {
        if (w * h >= 40 && G.globalAlpha * alphaOf(G.fillStyle) >= 0.8 && G.globalCompositeOperation === 'source-over') {
          const m = G.getTransform(); rects.push({ x: m.a * x + m.e, y: m.d * y + m.f, w: w * m.a, h: h * m.d, o: order++ });
        }
        return fr.apply(G, arguments);
      };
      Font.trace = (g, text, x, y, w, h) => {
        if (g !== Game.g || g.globalAlpha < 0.3) return;
        const m = g.getTransform(), s = h / Font.ROWS;
        const X = m.a * x + m.e, Y = m.d * y + m.f;
        if (X > W + 2 || Y > H + 2 || X + w < -2 || Y + h < -2) return;
        recs.push({ text, x: X, y: Y + 2 * s, w, h: 7 * s, s, o: order++ });
      };
      try { Game.render(); } finally { Font.trace = null; G.fillRect = fr; }
      const covered = (bx, by, bw, bh, o1, o2) => rects.some(r => r.o > o1 && (o2 == null || r.o < o2) && r.x <= bx + 0.5 && r.y <= by + 0.5 && r.x + r.w >= bx + bw - 0.5 && r.y + r.h >= by + bh - 0.5);
      OV.scenes++;
      const out = [];
      for (let i = 0; i < recs.length; i++) for (let j = i + 1; j < recs.length; j++) {
        const a = recs[i], b = recs[j];
        const ix = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const iy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        if (ix <= 1 || iy <= 1) continue;
        if (a.text === b.text && Math.abs(a.x - b.x) <= 6 && Math.abs(a.y - b.y) <= 6 * a.s) continue; // sombra/relieve del mismo texto (intencionado)
        const bx = Math.max(a.x, b.x), by = Math.max(a.y, b.y);
        const first = a.o < b.o ? a : b, second = a.o < b.o ? b : a;
        if (covered(bx, by, ix, iy, first.o, second.o) || covered(bx, by, ix, iy, second.o)) continue; // uno de los dos queda tapado por un panel
        out.push('«' + a.text.slice(0, 40) + '» × «' + b.text.slice(0, 40) + '» @' + Math.round(Math.max(a.x, b.x)) + ',' + Math.round(Math.max(a.y, b.y)));
      }
      for (const o of out) { const k = name.replace(/\d+/g, '#') + '|' + o.replace(/@.*/, ''); if (!OV.seen.has(k)) { OV.seen.add(k); OV.found.push(name + ': ' + o); } }
      return out.length;
    };
    OV.frames = (n, dt = 1 / 60) => { for (let k = 0; k < n; k++) Game.update(dt); };
    OV.reset = (st) => { Game.stack.length = 0; if (st) Game.push(st); };
    OV.fullProg = () => {
      PROG = newProgress();
      PROG.abilities = ABILITY_ORDER.slice(); PROG.selAbility = 3;
      PROG.codex = CODEX.map(c => c.id);
      PROG.blueprint = Object.keys(BP_NODES); PROG.bpTabs = BP_TABS.map(t => t.id);
      for (const k of Object.keys(QUESTS)) PROG.quests[k] = Math.random() < 0.5 ? 'done' : 'active';
      PROG.fragments = Object.keys(FRAGMENTS); PROG.letters = ['N', 'E', 'X', 'U', 'S'];
      PROG.historic = Object.keys(HISTORIC); PROG.achievements = ACHIEVEMENTS.slice(0, 7).map(a => a.id);
      PROG.xp = 4000; PROG.playerLevel = Progression.levelFor(PROG.xp);
      for (const k of CONCEPT_KEYS) LearningModel.record({ concept: k, chId: 'x', correct: Math.random() < 0.6, firstTry: true, hints: 0, time: 10, expected: 20, conf: 1, difficulty: 2, prompt: 'Pregunta de prueba bastante larga sobre ' + CONCEPTS[k] + ' para ver el ajuste' });
      PROG.stats.failed = [{ prompt: 'La CPU necesita un dato que no está en caché: ¿qué nivel se consulta después de la caché L3?' }, { prompt: 'Clasifica cada señal según el bus por el que viaja' }, { prompt: '¿Qué ocurre con la RAM cuando se corta la energía?' }];
    };
  });

  const run = async (label, fn, arg) => {
    try { const n = await page.evaluate(fn, arg); return n; }
    catch (e) { errors.push(label + ': ' + e.message.split('\n')[0]); return 0; }
  };

  // ---------- menús fuera del juego ----------
  await run('menus', () => {
    OV.fullProg();
    OV.reset(new TitleState()); OV.frames(40); OV.capture('Título');
    for (let i = 0; i < 4; i++) { Game.top().sel = i; OV.capture('Título sel' + i); }
    Game.push(new SettingsState()); for (let i = 0; i < 16; i++) { Game.top().sel = i; OV.capture('Ajustes sel' + i); } Game.pop();
    Game.push(new ControlsState()); for (let i = 0; i < 16; i++) { Game.top().sel = i; OV.capture('Controles sel' + i); } Game.pop();
    Game.push(new TeacherState()); OV.capture('Docente');
    const T = Game.top(); T.items[0].fn(); for (let i = 0; i < 13; i++) { Game.top().sel = i; OV.capture('Docente niveles sel' + i); } Game.pop();
    T.items[1].fn(); for (let i = 0; i < 17; i++) { Game.top().sel = i; OV.capture('Docente conceptos sel' + i); } Game.pop();
    Game.push(new ReportState({ teacher: true })); OV.frames(120); OV.capture('Informe docente'); Game.pop();
    Game.push(new ConfirmState('¿Empezar de nuevo? Se sobrescribirá la partida.', () => {})); OV.capture('Confirmar'); Game.pop();
    Game.push(new ChoicePromptState('PARTIDA COMPLETADA', ['VER EL EPÍLOGO', 'INFORME DE RESULTADOS', 'PRÁCTICA Y NIVELES (MODO DOCENTE)', 'VOLVER'], { col: PAL.gold, sub: 'NEXUS está en línea. ¿Qué quieres hacer?' })); OV.capture('Posjuego');
    return 0;
  });

  // ---------- menús dentro del juego ----------
  await run('pausa', () => {
    OV.fullProg();
    startTeacherLevel(3); PROG.abilities = ABILITY_ORDER.slice(); PROG.codex = CODEX.map(c => c.id); PROG.blueprint = Object.keys(BP_NODES); PROG.bpTabs = BP_TABS.map(t => t.id);
    PROG.fragments = Object.keys(FRAGMENTS); for (const k of Object.keys(QUESTS)) PROG.quests[k] = 'active';
    Game.world.pending.length = 0; OV.frames(30);
    const gp = Game.top();
    Game.push(new PauseState(gp)); for (let i = 0; i < 10; i++) { Game.top().sel = i; OV.capture('Pausa sel' + i); } Game.pop();
    const bp = new BlueprintState(); Game.push(bp);
    for (let t = 0; t < bp.tabs.length; t++) { bp.tab = t; bp.pickDefault(); OV.frames(10); OV.capture('Blueprint ' + bp.tabs[t].id);
      const ids = (BP_TAB_NODES[bp.tabs[t].id] || []); for (const id of ids) { bp.sel = id; OV.capture('Blueprint ' + bp.tabs[t].id + ' nodo ' + id); } }
    Game.pop();
    const cx = new CodexState(); Game.push(cx);
    for (let i = 0; i < cx.list.length; i++) { cx.sel = i; cx.dscroll = 0; OV.capture('Codex ' + cx.list[i].id); cx.dscroll = 99; OV.frames(1); OV.capture('Codex ' + cx.list[i].id + ' desplazado'); }
    Game.pop();
    const ql = new QuestLogState(); Game.push(ql); for (let i = 0; i < ql.ids.length; i++) { ql.sel = i; OV.capture('Misiones ' + ql.ids[i]); } Game.pop();
    for (const k of Object.keys(QUESTS)) PROG.quests[k] = 'done';
    const ql2 = new QuestLogState(); Game.push(ql2); for (let i = 0; i < ql2.ids.length; i++) { ql2.sel = i; OV.capture('Misiones hechas ' + ql2.ids[i]); } Game.pop();
    const pr = new ProgressState(); Game.push(pr); OV.frames(60); pr.page = 0; OV.capture('Progreso p0'); pr.page = 1; OV.capture('Progreso p1'); Game.pop();
    const me = new MemoriesState(); Game.push(me); for (let i = 0; i < me.ids.length; i++) { me.sel = i; OV.capture('Memorias ' + me.ids[i]); } Game.pop();
    for (const id of Object.keys(FRAGMENTS)) { const f = FRAGMENTS[id]; const r = new ReaderState('MEMORY FRAGMENT — ' + f.title, f.text, { style: 'memory' }); r.chars = 1e9; Game.push(r); OV.capture('Lector ' + id); r.scroll = 99; OV.capture('Lector ' + id + ' fin'); Game.pop(); }
    for (const id of Object.keys(HISTORIC)) { const hh = HISTORIC[id]; const r = new ReaderState(hh.title || hh.name || id, hh.text || '', { style: 'archive' }); r.chars = 1e9; Game.push(r); OV.capture('Histórico ' + id); Game.pop(); }
    Game.push(new LevelCompleteState(Game.world)); OV.frames(120); OV.capture('Nivel completado'); Game.pop();
    Game.push(new GameOverState(Game.world)); OV.frames(60); OV.capture('Game over'); Game.pop();
    Game.push(new ReportState({ ending: true })); OV.frames(120); OV.capture('Informe final'); Game.pop();
    return 0;
  });

  // ---------- diálogos, avisos y elecciones (peor caso) ----------
  await run('dialogos', () => {
    const W = Game.world;
    const long = 'Esta es una línea de diálogo deliberadamente larga para comprobar que el texto se ajusta dentro del cuadro sin salirse ni pisar el retrato ni el nombre del personaje que habla en ese momento.';
    for (const spk of Object.keys(SPEAKERS)) {
      const d = new DialogueState([[spk, long, spk === 'BYTE' ? 'happy' : 'NEUTRAL']], { world: W }); d.chars = d.full; Game.push(d); OV.capture('Diálogo ' + spk); Game.pop();
    }
    const d2 = new DialogueState([['BYTE', '¿Qué hago ahora?', 'thinking', { ch: ['«Dímelo.»', '«Da igual. Sigamos, que hay compuertas por reparar en toda la forja.»', 'Una tercera opción bastante larga para ver el ajuste de las elecciones'] }]], { world: W });
    d2.chars = d2.full; Game.push(d2); OV.capture('Diálogo con elecciones'); Game.pop();
    Game.push(new ChoicePromptState('BUS BRIDGE — origen «CPU (DIRECCIÓN)». La CPU indica al controlador la posición 0x1F40 que quiere leer. ¿Qué tipo de señal es 0x1F40?', ['BUS DE DATOS', 'BUS DE DIRECCIONES', 'BUS DE CONTROL', 'LOS TRES: DATOS + DIRECCIONES + CONTROL'], { col: PAL.amber, sub: 'CPU (DIRECCIÓN) → CONTROLADOR DE MEMORIA' })); OV.capture('Elección larga'); Game.pop();
    W.bark('NEXO', long, 'HAPPY', 9); UI.toast('LOGRO: Explorador curioso', PAL.gold); UI.toast('+50 XP  historia', PAL.green); UI.toast('LETRA OCULTA «X» (3/5)', PAL.gold); W.tip(null, long);
    for (let k = 0; k < 8; k++) { OV.frames(20); OV.capture('HUD con aviso, toasts y consejo t' + k); }
    return 0;
  });

  // ---------- desafíos ----------
  const nCh = await run('desafios', () => {
    let n = 0;
    const phases = (ch, tag) => {
      const cs = new ChallengeState(ch, { source: 'terminal', noConf: true, title: 'TERMINAL DE PRUEBA' });
      Game.stack.length = 0; Game.push(cs);
      OV.capture(tag + ' juego');
      for (let k = 0; k < 3; k++) { cs.useHint(); cs.w.update(0.016); OV.capture(tag + ' pista' + (k + 1)); }
      cs.phase = 'conf'; OV.capture(tag + ' confianza');
      cs.phase = 'result'; cs.resultOk = false; cs.feedback = ch.wrong || 'El resultado no coincide con lo que el sistema necesita.'; cs.voice = Voice.line('bad'); cs.misconception = ch.misconception || 'Tenías mucha confianza en una respuesta incorrecta: es una señal de un concepto que conviene revisar con calma.'; OV.capture(tag + ' fallo');
      cs.phase = 'result'; cs.resultOk = true; cs.feedback = ch.explanation || ''; cs.voice = Voice.line('ok'); cs.misconception = null; cs.xpGained = 40; cs.lowConfNote = true; OV.capture(tag + ' acierto');
      cs.w.showSolution(); cs.phase = 'guided'; cs.guidedText = (ch.explanation || '') + '  Ahora prueba uno parecido tú.'; OV.capture(tag + ' guiado');
      n++;
    };
    for (const id in QM.byId) phases(QM.byId[id], 'Desafío ' + id);
    for (const c in QM.gens) for (const fn of QM.gens[c]) for (let d = 1; d <= 5; d += 2) { const ch = fn(d); if (ch) phases(ch, 'Generado ' + c + ' d' + d); }
    return n;
  });

  // ---------- niveles: barrido de cámara ----------
  for (let lv = 0; lv < 10; lv++) {
    await run('nivel ' + lv, (lv) => {
      startTeacherLevel(lv); PROG.abilities = ABILITY_ORDER.slice();
      const W = Game.world; W.pending.length = 0; OV.frames(5);
      const stepX = 200, stepY = 120;
      for (let y = 0; y <= Math.max(0, W.h * TS - H); y += stepY) for (let x = 0; x <= Math.max(0, W.w * TS - W_HUD_R); x += stepX) {
        W.player.x = x + 240; W.player.y = y + 120; W.player.vx = W.player.vy = 0;
        W.cam.x = x; W.cam.y = y; W.cam.lockT = null;
        OV.frames(1);
        W.cam.x = x; W.cam.y = y;
        OV.capture('Nivel ' + lv + ' cámara ' + x + ',' + y);
      }
      return 0;
    }, lv);
  }

  // ---------- cinemáticas ----------
  await run('intro', () => {
    PROG = newProgress(); OV.reset(new IntroState());
    for (let k = 0; k < 90; k++) { OV.frames(20); const t = Game.top(); if (t.constructor.name === 'DialogueState') { t.chars = t.full; OV.capture('Prólogo diálogo ' + k); t.pause = 0; t.next(); } else OV.capture('Prólogo t' + k); if (Game.world) break; }
    return 0;
  });
  await run('final', () => {
    OV.fullProg(); OV.reset(new EndingState());
    for (let k = 0; k < 400; k++) { OV.frames(12); const t = Game.top(); if (t.constructor.name === 'DialogueState') { t.chars = t.full; OV.capture('Epílogo diálogo ' + k); t.pause = 0; t.next(); } else OV.capture('Epílogo ' + (Game.stack[0].mode || '') + ' ' + k); if (t.constructor.name === 'ReportState') break; }
    return 0;
  });

  const res = await page.evaluate(() => ({ found: OV.found, scenes: OV.scenes }));
  console.log('Escenas analizadas: ' + res.scenes + ' · desafíos: ' + nCh);
  console.log('Textos superpuestos (' + res.found.length + '):');
  for (const f of res.found) console.log('  ' + f);
  console.log(errors.length ? 'ERRORES:\n  ' + errors.slice(0, 20).join('\n  ') : 'SIN ERRORES');
  await browser.close();
})();
