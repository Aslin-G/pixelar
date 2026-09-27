// =============================================================================
// DIÁLOGOS, PROMPTS DE HABILIDAD Y LECTOR DE REGISTROS
// =============================================================================
const SPEAKERS = {
  BYTE: { name: 'BYTE', col: PAL.cyan, pitch: 560 },
  NEXO: { name: 'NEXO', col: PAL.green, pitch: 780 },
  NULL: { name: 'N.U.L.L.', col: PAL.violet, pitch: 170 },
  NEXUS: { name: 'NEXUS', col: PAL.gold, pitch: 440 },
  SYS: { name: 'SISTEMA', col: PAL.grayL, pitch: 980 },
  TERMINAL: { name: 'TERMINAL', col: PAL.grayL, pitch: 980, portrait: 'SYS' },
  LOG: { name: 'REGISTRO', col: PAL.amber, pitch: 300 },
  VOZ: { name: 'VOZ GRABADA — BYTE', col: PAL.amber, pitch: 240, portrait: 'LOG' },
  ARCHIVO: { name: 'ARCHIVO', col: '#C8B890', pitch: 260 },
  REG: { name: 'REG', col: PAL.amber, pitch: 1100 },
  CACHE: { name: 'CACHE', col: '#8FB3DE', pitch: 620 },
  BUS: { name: 'BUS', col: PAL.cyan, pitch: 500 },
  IO: { name: 'IO', col: PAL.violet, pitch: 700 },
  VOLT: { name: 'VOLT', col: PAL.gold, pitch: 380 },
  CASCADE: { name: 'CASCADE', col: PAL.red, pitch: 90 },
  '': { name: '', col: PAL.grayL, pitch: 0 }
};
function normLine(L) {
  if (Array.isArray(L)) { const o = Object.assign({}, L[3] || {}); o.s = L[0]; o.t = L[1]; if (L[2]) o.e = L[2]; return o; }
  return Object.assign({}, L);
}

class DialogueState {
  constructor(lines, o = {}) {
    this.overlay = true; this.updateBelow = true;
    this.lines = lines.map(normLine); this.o = o; this.W = o.world;
    this.i = 0; this.result = -1; this.t = 0;
    this.seen = o.id && PROG && PROG.seenDialogues.includes(o.id);
    this.start();
  }
  start() {
    const L = this.lines[this.i];
    this.L = L; this.chars = 0; this.blipC = 0;
    L.t = Font.norm(L.t || '');
    this.full = Font.count(L.t);
    const noPortrait = L.s === '' || L.s === '*';
    this.wrapped = UI.wrap(L.t, noPortrait ? 440 : 372);
    this.pause = L.p || 0; this.choiceSel = 0;
    const W = this.W;
    if (W) {
      if (L.fx === 'shake') W.shake(L.mag || 4, 0.4);
      if (L.fx === 'glitch') W.glitch(0.5, L.gk || 'null');
      if (L.fx === 'flash') W.flash(L.fcol || '#FFFFFF', 0.4);
      if (L.s === 'NEXO' && L.e) W.nexo.emote(L.e, L.ep ? 0 : 6);
    }
    if (L.sfx) AudioSys.play(L.sfx, L.cap ? { caption: L.cap } : {});
    else if (L.cap) UI.caption(L.cap);
    if (L.flag) PROG.flags[L.flag] = true;
    if (L.do) L.do(W);
    if (Settings.data.textSpeed === 3) this.chars = this.full;
  }
  enter() {}
  update(dt) {
    this.t += dt;
    const L = this.L;
    if (this.seen && Input.pressed('skip')) { this.skipAll(); return; }
    if (this.pause > 0) { this.pause -= dt; if (Input.pressed('confirm')) this.pause = 0; return; }
    if (this.chars < this.full) {
      const before = Math.floor(this.chars);
      this.chars = Math.min(this.full, this.chars + Settings.textCps * (L.sp || 1) * dt);
      if (Math.floor(this.chars) !== before) {
        this.blipC++;
        const spk = SPEAKERS[L.s] || SPEAKERS.SYS;
        if (spk.pitch && this.blipC % 2 === 0) AudioSys.play('blip', { f: spk.pitch + randi(-30, 30) });
      }
      if (Input.pressed('confirm') || UI.clicked(0, H - 90, W, 90)) this.chars = this.full;
      return;
    }
    if (L.ch) {
      if (Input.nav('up')) { this.choiceSel = (this.choiceSel + L.ch.length - 1) % L.ch.length; AudioSys.play('ui_move'); }
      if (Input.nav('down')) { this.choiceSel = (this.choiceSel + 1) % L.ch.length; AudioSys.play('ui_move'); }
      const r = this.choiceRects && this.choiceRects.findIndex(b => UI.clicked(b.x, b.y, b.w, b.h));
      if (r != null && r >= 0) { this.choiceSel = r; this.choose(); return; }
      if (Input.pressed('confirm')) this.choose();
      return;
    }
    if (L.auto != null) { this.autoT = (this.autoT || 0) + dt; if (this.autoT > L.auto) { this.autoT = 0; this.next(); } return; }
    if (Input.pressed('confirm') || UI.clicked(0, H - 90, W, 90)) { AudioSys.play('ui_move'); this.next(); }
  }
  choose() { this.result = this.choiceSel; AudioSys.play('ui_ok'); if (this.L.onChoose) this.L.onChoose(this.choiceSel, this.W); this.next(); }
  skipAll() {
    for (let k = this.i; k < this.lines.length; k++) {
      const L = this.lines[k];
      if (L.flag) PROG.flags[L.flag] = true;
      if (L.ch) { this.i = k; this.start(); this.chars = this.full; this.pause = 0; return; }
    }
    this.finish();
  }
  next() { this.i++; if (this.i >= this.lines.length) this.finish(); else this.start(); }
  finish() {
    if (Game.top() === this) Game.pop();
    if (this.o.id && PROG && !PROG.seenDialogues.includes(this.o.id)) PROG.seenDialogues.push(this.o.id);
    if (this.o.onDone) this.o.onDone(this.result);
  }
  render(g) {
    const L = this.L;
    const spk = SPEAKERS[L.s] || { name: L.s, col: PAL.white };
    const bx = 6, by = H - 80, bw = W - 12, bh = 74;
    const narr = L.s === '' || L.s === '*';
    UI.panel(g, bx, by, bw, bh, { fill: 'rgba(8,16,24,0.96)', border: narr ? PAL.grayD : shade(spk.col, 0.8) });
    let tx = bx + 10;
    if (!narr) {
      const pid = spk.portrait || L.s;
      const emo = L.e || (L.s === 'NEXO' ? 'NEUTRAL' : undefined);
      g.fillStyle = '#000'; g.fillRect(bx + 6, by + 6, 68, 62);
      const img = getPortrait(pid, emo);
      let px = bx + 8, py = by + 5;
      if (L.s === 'NULL' && Math.random() < 0.12) px += randi(-2, 2);
      g.drawImage(img, px, py, 64, 64);
      if (L.s === 'NULL' || L.gl) { g.fillStyle = 'rgba(170,125,255,0.12)'; g.fillRect(px, py + (Math.floor(this.t * 60) % 64), 64, 2); }
      tx = bx + 84;
      const nw = Font.measure(spk.name) + 10;
      g.fillStyle = shade(spk.col, 0.35); g.fillRect(tx - 2, by - 7, nw, 12);
      g.fillStyle = spk.col; g.fillRect(tx - 2, by + 4, nw, 1);
      Font.draw(g, spk.name, tx + 3, by - 8, spk.col);
    }
    if (this.pause > 0) {
      Font.draw(g, '.'.repeat(1 + Math.floor(this.t * 3) % 3), tx, by + 10, PAL.gray);
    } else {
      Font.drawLines(g, this.wrapped.slice(0, 5), tx, by + 8, narr ? PAL.grayL : PAL.white, { max: Math.floor(this.chars), hl: spk.col === PAL.white ? PAL.amber : PAL.amber });
    }
    if (this.chars >= this.full && this.pause <= 0 && !L.ch && L.auto == null) {
      const b = Math.floor(this.t * 3) % 2;
      Font.draw(g, '▼', bx + bw - 12, by + bh - 13 + b, spk.col || PAL.white);
    }
    if (this.seen) Font.draw(g, '[TAB] omitir', bx + bw - 8, by + 3, PAL.grayD, { align: 'right' });
    if (L.ch && this.chars >= this.full && this.pause <= 0) {
      const cw = Math.max(...L.ch.map(c => Font.measure(c))) + 30;
      const ch = L.ch.length * 16 + 10;
      const cx = W - cw - 12, cy = by - ch - 12;
      UI.panel(g, cx, cy, cw, ch, { border: PAL.cyan });
      this.choiceRects = [];
      L.ch.forEach((c, k) => {
        const yy = cy + 5 + k * 16;
        const foc = k === this.choiceSel;
        if (foc) { g.fillStyle = '#15384A'; g.fillRect(cx + 3, yy, cw - 6, 15); Font.draw(g, '▶', cx + 6, yy + 1, PAL.cyan); }
        Font.draw(g, c, cx + 18, yy + 1, foc ? PAL.white : PAL.grayL);
        this.choiceRects.push({ x: cx, y: yy, w: cw, h: 15 });
      });
    }
  }
}

// Selector compacto para habilidades (Circuit Link, Bus Bridge, BusError...)
class ChoicePromptState {
  constructor(title, options, o = {}) {
    this.overlay = true; this.updateBelow = false;
    this.title = title; this.options = options; this.o = o; this.sel = 0; this.t = 0;
    this.lines = UI.wrap(title, 380);
  }
  update(dt) {
    this.t += dt;
    const n = this.options.length;
    if (Input.nav('up')) { this.sel = (this.sel + n - 1) % n; AudioSys.play('ui_move'); }
    if (Input.nav('down')) { this.sel = (this.sel + 1) % n; AudioSys.play('ui_move'); }
    const r = this.rects && this.rects.findIndex(b => UI.clicked(b.x, b.y, b.w, b.h));
    if (r != null && r >= 0) { this.sel = r; this.done(r); return; }
    if (Input.pressed('confirm')) { this.done(this.sel); return; }
    if (Input.pressed('cancel')) this.done(-1);
  }
  done(i) { AudioSys.play(i >= 0 ? 'ui_ok' : 'ui_back'); if (Game.top() === this) Game.pop(); if (this.o.onDone) this.o.onDone(i); }
  render(g) {
    UI.overlayDim(g, 0.82);
    const col = this.o.col || PAL.cyan;
    const h = 36 + this.lines.length * 12 + this.options.length * 16 + (this.o.sub ? 12 : 0);
    const x = 40, y = Math.floor((H - h) / 2), w = 400;
    UI.panel(g, x, y, w, h, { border: col, title: this.o.tag || 'ELECCIÓN', titleCol: col });
    Font.drawLines(g, this.lines, x + 10, y + 8, PAL.white, { hl: col });
    let yy = y + 10 + this.lines.length * 12;
    if (this.o.sub) { Font.draw(g, UI.fit(this.o.sub, w - 20), x + 10, yy, PAL.gray); yy += 12; }
    this.rects = [];
    this.options.forEach((op, i) => {
      const foc = i === this.sel;
      g.fillStyle = foc ? shade(col, 0.3) : '#0D1C26'; g.fillRect(x + 8, yy, w - 16, 14);
      if (foc) { g.fillStyle = col; g.fillRect(x + 8, yy, 2, 14); }
      Font.draw(g, UI.fit(op, w - 36), x + 16, yy + 1, foc ? PAL.white : PAL.grayL);
      this.rects.push({ x: x + 8, y: yy, w: w - 16, h: 14 });
      yy += 16;
    });
    UI.keyHints(g, [['↑↓', 'Elegir'], ['E', 'Confirmar'], ['ESC', 'Cancelar']], W / 2, y + h - 15, 'center');
  }
}

// Lector de registros, memorias y archivos
class ReaderState {
  constructor(title, text, o = {}) {
    this.overlay = true; this.updateBelow = false; this.title = title; this.o = o; this.t = 0; this.chars = 0; this.scroll = 0;
    this.lines = UI.wrap(Font.norm(text), 420);
    this.full = this.lines.reduce((s, l) => s + Font.count(l), 0);
    const st = o.style || 'log';
    this.col = st === 'memory' ? PAL.gold : st === 'archive' ? '#C8B890' : st === 'null' ? PAL.magenta : st === 'voice' ? PAL.amber : PAL.cyan;
    this.textCol = st === 'memory' ? '#FFF1D0' : st === 'archive' ? '#E8DDB8' : st === 'null' ? '#F0D6F5' : PAL.white;
    if (st === 'memory') AudioSys.play('echo');
  }
  update(dt) {
    this.t += dt;
    this.chars = Math.min(this.full, this.chars + Settings.textCps * 2.5 * dt);
    const maxVis = 12;
    if (this.lines.length > maxVis) {
      if (Input.nav('down')) this.scroll = Math.min(this.lines.length - maxVis, this.scroll + 1);
      if (Input.nav('up')) this.scroll = Math.max(0, this.scroll - 1);
    }
    if (Input.pressed('confirm') || Input.pressed('cancel') || UI.clicked(0, 0, W, H)) {
      if (this.chars < this.full) { this.chars = this.full; return; }
      if (this.lines.length > maxVis && this.scroll < this.lines.length - maxVis && !Input.pressed('cancel')) { this.scroll = this.lines.length - maxVis; return; }
      AudioSys.play('ui_back');
      if (Game.top() === this) Game.pop();
      if (this.o.onDone) this.o.onDone();
    }
  }
  render(g) {
    UI.overlayDim(g, 0.7);
    const maxVis = 12;
    const vis = this.lines.slice(this.scroll, this.scroll + maxVis);
    const h = 40 + vis.length * 12;
    const y = Math.floor((H - h) / 2);
    UI.panel(g, 20, y, 440, h, { border: this.col, title: this.title, titleCol: this.col, fill: this.o.style === 'memory' ? '#1A1408' : this.o.style === 'archive' ? '#14120A' : undefined });
    if (this.o.style === 'memory') { g.fillStyle = 'rgba(241,180,92,0.06)'; for (let yy = y + 4; yy < y + h - 4; yy += 3) g.fillRect(24, yy, 432, 1); }
    let before = this.lines.slice(0, this.scroll).reduce((s, l) => s + Font.count(l), 0);
    Font.drawLines(g, vis, 30, y + 12, this.textCol, { max: Math.max(0, Math.floor(this.chars) - before), hl: this.col });
    if (this.lines.length > maxVis) Font.draw(g, (this.scroll + 1) + '-' + Math.min(this.lines.length, this.scroll + maxVis) + '/' + this.lines.length, 452, y + h - 13, PAL.gray, { align: 'right' });
    if (this.chars >= this.full) Font.draw(g, '[E] cerrar', 452, y + 3, PAL.grayD, { align: 'right' });
  }
}
