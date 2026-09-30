// =============================================================================
// UI — primitivas Pixel Art: paneles, botones, barras, toasts y subtítulos
// =============================================================================
const UI = {
  toasts: [], captions: [], wrapCache: new Map(), time: 0,
  hc() { return Settings.data.contrast; },
  panel(g, x, y, w, h, o = {}) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    const hc = this.hc();
    const fill = o.fill || (hc ? '#000000' : PAL.panel), border = o.border || (hc ? '#FFFFFF' : PAL.panelB);
    g.fillStyle = fill; g.fillRect(x + 1, y + 1, w - 2, h - 2);
    g.fillStyle = border;
    g.fillRect(x + 2, y, w - 4, 1); g.fillRect(x + 2, y + h - 1, w - 4, 1);
    g.fillRect(x, y + 2, 1, h - 4); g.fillRect(x + w - 1, y + 2, 1, h - 4);
    g.fillRect(x + 1, y + 1, 1, 1); g.fillRect(x + w - 2, y + 1, 1, 1); g.fillRect(x + 1, y + h - 2, 1, 1); g.fillRect(x + w - 2, y + h - 2, 1, 1);
    if (!o.flat) { g.fillStyle = o.inner || (hc ? '#000000' : PAL.panelL); g.fillRect(x + 2, y + 1, w - 4, 1); }
    if (o.title) {
      const tw = Font.measure(o.title) + 10;
      g.fillStyle = border; g.fillRect(x + 6, y - 5, tw, 11);
      g.fillStyle = fill; g.fillRect(x + 7, y - 4, tw - 2, 9);
      Font.draw(g, o.title, x + 11, y - 5, o.titleCol || PAL.cyan);
    }
  },
  inRect(px, py, x, y, w, h) { return px >= x && py >= y && px < x + w && py < y + h; },
  hover(x, y, w, h) { const p = Input.pointer; return p.active && this.inRect(p.x, p.y, x, y, w, h); },
  clicked(x, y, w, h) { const p = Input.pointer; return p.clicked && this.inRect(p.x, p.y, x, y, w, h); },
  button(g, x, y, w, h, label, focused, o = {}) {
    const hov = this.hover(x, y, w, h);
    const on = focused || hov;
    const col = o.color || PAL.cyan;
    const dis = o.disabled;
    g.fillStyle = dis ? '#0A1016' : on ? shade(col, 0.35) : PAL.panelL; g.fillRect(x, y, w, h);
    g.fillStyle = dis ? PAL.grayD : on ? col : PAL.panelB;
    g.fillRect(x, y, w, 1); g.fillRect(x, y + h - 1, w, 1); g.fillRect(x, y, 1, h); g.fillRect(x + w - 1, y, 1, h);
    if (on && !dis) { g.fillStyle = col; g.fillRect(x - 3, y + Math.floor(h / 2) - 1, 2, 3); }
    Font.draw(g, label, x + Math.floor(w / 2), y + Math.floor((h - 12) / 2) + 1, dis ? PAL.gray : on ? PAL.white : PAL.grayL, { align: 'center' });
    return hov && Input.pointer.clicked && !dis;
  },
  bar(g, x, y, w, h, v, col, bg) {
    v = clamp(v, 0, 1);
    g.fillStyle = bg || '#0A141C'; g.fillRect(x, y, w, h);
    g.fillStyle = col; g.fillRect(x, y, Math.round(w * v), h);
    g.fillStyle = 'rgba(255,255,255,0.18)'; if (h > 2) g.fillRect(x, y, Math.round(w * v), 1);
  },
  keycap(g, x, y, label, col) {
    const w = Font.measure(label) + 6;
    g.fillStyle = '#1B2A36'; g.fillRect(x, y, w, 11);
    g.fillStyle = col || PAL.grayL; g.fillRect(x, y + 10, w, 1);
    Font.draw(g, label, x + 3, y - 1, PAL.white);
    return w;
  },
  // Línea de ayuda de teclas: [['E','Elegir'],['H','Pista']]
  keyHints(g, items, x, y, align = 'left') {
    let total = 0;
    const parts = items.map(([k, l]) => { const w = Font.measure(k) + 6 + 3 + Font.measure(l) + 10; total += w; return w; });
    let cx = align === 'right' ? x - total : align === 'center' ? x - total / 2 : x;
    items.forEach(([k, l], i) => {
      const kw = this.keycap(g, Math.round(cx), y, k);
      Font.draw(g, l, Math.round(cx) + kw + 3, y, PAL.grayL);
      cx += parts[i];
    });
  },
  wrap(text, w, s = 1) {
    const key = w + '|' + s + '|' + text;
    let r = this.wrapCache.get(key);
    if (!r) {
      r = Font.wrap(text, w, s);
      if (this.wrapCache.size > 600) this.wrapCache.clear();
      this.wrapCache.set(key, r);
    }
    return r;
  },
  // recorta un texto para que quepa en maxW (añade puntos suspensivos)
  fit(text, maxW, s = 1) {
    text = Font.norm(text);
    if (Font.measure(text, s) <= maxW) return text;
    while (text.length > 1 && Font.measure(text + '...', s) > maxW) text = text.slice(0, -1);
    return text.trimEnd() + '...';
  },
  textBlock(g, text, x, y, w, col, o = {}) {
    const lines = this.wrap(text, w, o.s || 1);
    Font.drawLines(g, lines, x, y, col || PAL.white, o);
    return lines.length * (o.lh || 12) * (o.s || 1);
  },
  pips(g, x, y, n, of, col) {
    for (let i = 0; i < of; i++) { g.fillStyle = i < n ? col : PAL.grayD; g.fillRect(x + i * 5, y, 4, 4); }
  },
  toast(text, col, kind) {
    if (kind === 'xp') {
      const ex = this.toasts.find(t => t.kind === 'xp' && t.t < 1.2);
      if (ex) { const m = /\+(\d+)/.exec(ex.text), n = /\+(\d+)/.exec(text); if (m && n) { ex.text = ex.text.replace(m[0], '+' + (+m[1] + +n[1])); ex.t = 0; return; } }
    }
    this.toasts.push({ text, col: col || PAL.cyan, t: 0, kind });
    if (this.toasts.length > 10) this.toasts.shift();
  },
  caption(text) {
    if (!Settings.data.captions) return;
    this.captions.push({ text, t: 0 });
    if (this.captions.length > 3) this.captions.shift();
  },
  update(dt) {
    this.time += dt;
    // sólo 3 avisos visibles a la vez; el resto espera su turno (más rápido si hay cola)
    const fast = this.toasts.length > 3 ? 1.6 : 1;
    // los avisos esperan mientras hay un menú, texto o desafío abierto (no se dibujan encima)
    if (this.toastsPaused) return this.tickCaptions(dt);
    for (let i = 0; i < Math.min(3, this.toasts.length); i++) this.toasts[i].t += dt * fast;
    this.toasts = this.toasts.filter(t => t.t < 3.2);
    this.tickCaptions(dt);
  },
  tickCaptions(dt) {
    for (const c of this.captions) c.t += dt;
    this.captions = this.captions.filter(c => c.t < 2.6);
  },
  drawToasts(g) {
    if (this.toastsPaused) { this.toastTop = 0; return; }
    let y = Math.max(60, this.toastTop || 0);
    this.toastTop = 0;
    for (const t of this.toasts.slice(0, 3)) {
      const a = t.t < 0.2 ? t.t / 0.2 : t.t > 2.7 ? (3.2 - t.t) / 0.5 : 1;
      const w = Font.measure(t.text) + 12;
      g.globalAlpha = clamp(a * 3, 0, 1); // el fondo se vuelve opaco enseguida: nada se ve a través
      g.fillStyle = 'rgba(5,7,9,0.9)'; g.fillRect(W / 2 - w / 2, y, w, 13);
      g.globalAlpha = clamp(a, 0, 1);
      g.fillStyle = t.col; g.fillRect(W / 2 - w / 2, y + 12, w, 1);
      Font.draw(g, t.text, W / 2, y, t.col, { align: 'center' });
      g.globalAlpha = 1;
      y += 15;
    }
  },
  drawCaptions(g) {
    let y = H - 16;
    for (let i = this.captions.length - 1; i >= 0; i--) {
      const c = this.captions[i];
      const w = Font.measure(c.text) + 8;
      g.fillStyle = 'rgba(0,0,0,0.88)'; g.fillRect(6, y, w, 12);
      Font.draw(g, c.text, 10, y - 1, PAL.grayL);
      y -= 13;
    }
  },
  // Lista vertical navegable genérica (menús)
  menuNav(state, n, o = {}) {
    if (Input.nav('up')) { state.sel = (state.sel - 1 + n) % n; AudioSys.play('ui_move'); }
    if (Input.nav('down')) { state.sel = (state.sel + 1) % n; AudioSys.play('ui_move'); }
  },
  overlayDim(g, a = 0.75) { g.fillStyle = `rgba(3,6,9,${a})`; g.fillRect(0, 0, W, H); }
};
