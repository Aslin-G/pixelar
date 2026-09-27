// =============================================================================
// TILES, DECORACIÓN Y FONDOS PROCEDURALES POR TEMA (pixel art colorido)
//  · cielo en degradado con tramado ordenado (Bayer), estrellas, nubes y astros
//  · 3 capas de parallax (lejos / medio / cerca) con ventanas y luces de colores
//  · tiles con bordes brillantes, componentes, profundidad y «brotes» decorativos
//  · atrezo automático sobre el suelo y sprites de brillo aditivo
// =============================================================================
const T = { AIR: 0, SOLID: 1, ONEWAY: 2, SPIKE: 3, LADDER: 4, BREAK: 5, POOL: 6, DOOR: 7, BRIDGE: 8 };
const isSolidT = t => t === T.SOLID || t === T.BREAK || t === T.DOOR;
const isOneWayT = t => t === T.ONEWAY || t === T.BRIDGE;
const isHazardT = t => t === T.SPIKE || t === T.POOL;

// sky: 4 colores de arriba al horizonte · pal: colores alegres para luces, ventanas y atrezo
const THEMES = {
  boot:   { haze: 0.16, sky: ['#1B2A6B', '#2D4F9E', '#3A86C8', '#8FE3F0'], far: '#2A4A8C', mid: '#2F66A0', near: '#24507E', base: '#2E86B0', dark: '#1B557A', light: '#9DF7FF', accent: '#FFD166', top: '#7FF0FF', trace: '#FFD166', pal: ['#FF6FA8', '#FFD166', '#71FF9A', '#9DF7FF', '#C79BFF'], deco: 'boot', sun: null, clouds: '#CFF6FF', stars: 0.5, tuft: 'nub', props: ['cone', 'arrow', 'crate', 'bulb', 'bulb', 'flower'] },
  board:  { haze: 0.16, sky: ['#0F3550', '#1D6668', '#3AA07E', '#F4D98A'], far: '#1D5A58', mid: '#237262', near: '#1B5A4A', base: '#2FA36A', dark: '#1B6E48', light: '#C2FFB8', accent: '#FFD166', top: '#E6FF8A', trace: '#F6C85C', pal: ['#FF5E7A', '#FFD166', '#6FD6FF', '#B6FF8A', '#FF9F4A'], deco: 'board', sun: '#FFE9A8', clouds: '#E8FFE0', stars: 0.2, tuft: 'moss', props: ['capacitor', 'resistor', 'bulb', 'chip', 'crystal', 'tree', 'flower'] },
  cpu:    { haze: 0.2, sky: ['#1E1452', '#3B2A8C', '#7050CC', '#F6A8D6'], far: '#3A2E86', mid: '#4B3CA4', near: '#342A7A', base: '#5A62CC', dark: '#383C8C', light: '#D2DAFF', accent: '#FFD166', top: '#FFE59A', trace: '#FFD166', pal: ['#FFD166', '#7FF3FF', '#FF7AC8', '#9DFF8A', '#FFFFFF'], deco: 'cpu', sun: null, clouds: '#F2D6FF', stars: 0.6, tuft: 'bolt', props: ['gear', 'gear', 'orb', 'cabinet', 'bulb', 'crystal'] },
  forge:  { haze: 0.16, sky: ['#3A0F2E', '#7E213C', '#DA583A', '#FFC060'], far: '#6A2238', mid: '#8A3036', near: '#62202A', base: '#C06A32', dark: '#7E3E1E', light: '#FFE0A0', accent: '#FF7A3D', top: '#FFE08A', trace: '#FFB84A', pal: ['#FFD166', '#FF7A3D', '#FF4F6A', '#FFF0B0', '#7FF3FF'], deco: 'forge', sun: '#FFD27A', clouds: '#FFB08A', stars: 0.3, tuft: 'ember', props: ['anvil', 'brazier', 'ingot', 'crate', 'crystal', 'brazier'] },
  tower:  { sky: ['#120E36', '#271C62', '#46308C', '#9A58B8'], far: '#2A2066', mid: '#3A2E80', near: '#2A225E', haze: 0.3, base: '#6050B8', dark: '#3A2E7A', light: '#EAD2FF', accent: '#7FF3FF', top: '#F4B8FF', trace: '#7FF3FF', pal: ['#7FF3FF', '#FF9BE8', '#FFD166', '#B39BFF', '#9DFF8A'], deco: 'tower', sun: '#FFF0D0', clouds: '#D8B8FF', stars: 0.9, tuft: 'crystal', props: ['books', 'crystal', 'lantern', 'crystal', 'orb'] },
  bus:    { haze: 0.2, sky: ['#0C1A3A', '#1D306C', '#4A3F9C', '#FF8A9A'], far: '#23306A', mid: '#2E3E86', near: '#222E66', base: '#3E5CAC', dark: '#26386E', light: '#C4E4FF', accent: '#FFD166', top: '#9FE8FF', trace: '#45E5FF', pal: ['#45E5FF', '#FFB14E', '#71FF9A', '#FF6FA8', '#FFFFFF'], deco: 'bus', sun: '#FFB0B8', clouds: '#9FA8FF', stars: 0.8, tuft: 'stud', props: ['cone', 'trafficlight', 'sign', 'bollard', 'bulb'] },
  io:     { haze: 0.18, sky: ['#2A0F46', '#5C1E7C', '#B4409C', '#FFC46A'], far: '#4A1E6A', mid: '#62308A', near: '#46205E', base: '#8C4CBA', dark: '#5A2E80', light: '#FFDDF6', accent: '#FFD166', top: '#FFB8E8', trace: '#FFD166', pal: ['#FFD166', '#71FF9A', '#45E5FF', '#FF6FA8', '#FF9F4A'], deco: 'io', sun: '#FFE0A0', clouds: '#FFB8D8', stars: 0.5, tuft: 'grass', props: ['speaker', 'antenna', 'joystick', 'flower', 'bulb'] },
  lab:    { haze: 0.14, sky: ['#1C4C5E', '#2F7E8A', '#66BCB2', '#EEF8D4'], far: '#2E6C78', mid: '#3A828A', near: '#2A6068', base: '#4AA6AC', dark: '#2E7078', light: '#EAFFFB', accent: '#FF6F7A', top: '#B8FFF0', trace: '#FF9FA8', pal: ['#FF6F7A', '#FFD166', '#71FF9A', '#45E5FF', '#C79BFF'], deco: 'lab', sun: '#FFFBE0', clouds: '#FFFFFF', stars: 0, tuft: 'leaf', props: ['flask', 'flask', 'plant', 'microscope', 'plant', 'beaker'] },
  kernel: { haze: 0.18, sky: ['#2A2032', '#4C3A4C', '#8E6E5C', '#EACB92'], far: '#4A3A4A', mid: '#5C4A54', near: '#40323C', base: '#8E7C6C', dark: '#5A4E46', light: '#FAEBCB', accent: '#FFB45C', top: '#EEDDB0', trace: '#FFB45C', pal: ['#FFB45C', '#FFE9A8', '#7FF3FF', '#C8B890', '#FF9F7A'], deco: 'kernel', sun: '#FFE7B0', clouds: '#E8C8A8', stars: 0.4, tuft: 'dust', props: ['crt', 'scrolls', 'candle', 'crate', 'scrolls'] },
  core:   { haze: 0.22, sky: ['#0A0628', '#200F56', '#4C228E', '#2BD6E8'], far: '#2A1A60', mid: '#3A2680', near: '#2A1C62', base: '#4E3EA8', dark: '#2E226A', light: '#A8F8FF', accent: '#FF6FD8', top: '#C0B0FF', trace: '#45E5FF', pal: ['#45E5FF', '#FF6FD8', '#FFD166', '#9DFF8A', '#FFFFFF'], deco: 'core', sun: '#C8F8FF', clouds: '#8A6CFF', stars: 1, tuft: 'crystal', props: ['crystal', 'crystal', 'pylon', 'orb'] }
};
const ThemeCache = {};
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x, y) => BAYER4[(y & 3) * 4 + (x & 3)] / 16;

// ---------- primitivas de dibujo sobre un lienzo ----------
function painter(g) {
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const P = (x, y, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
  const disc = (cx, cy, r, col) => { for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y)); R(cx - w, cy + y, w * 2 + 1, 1, col); } };
  const ring = (cx, cy, r, col) => { for (let a = 0; a < 360; a += 1.5) { const q = a * Math.PI / 180; P(cx + Math.cos(q) * r, cy + Math.sin(q) * r, col); } };
  // disco con halo tramado
  const glowDisc = (cx, cy, r, col, halo) => {
    const steps = Math.max(1, Math.ceil(halo / 2));
    for (let k = steps; k >= 1; k--) { g.globalAlpha = 0.22 * (1 - (k - 1) / steps); disc(cx, cy, r + Math.round(k * halo / steps), col); }
    g.globalAlpha = 1; disc(cx, cy, r, col);
  };
  const cloud = (x, y, w, col, shadowCol) => {
    const h = Math.max(6, Math.round(w / 4));
    for (let i = 0; i < 5; i++) { const cx = x + (i + 0.5) * w / 5, r = Math.round(h * (0.55 + 0.45 * Math.sin((i + 0.3) * 1.1))); disc(cx, y - r * 0.4, r, col); }
    R(x, y - 1, w, Math.round(h * 0.5), col);
    if (shadowCol) for (let xx = x; xx < x + w; xx++) if (bayer(xx, y) < 0.5) P(xx, y + Math.round(h * 0.5) - 1, shadowCol);
  };
  // edificio con borde iluminado y ventanas de colores
  const building = (x, baseY, w, h, col, pal, rng, o = {}) => {
    R(x, baseY - h, w, h, col);
    R(x, baseY - h, w, 1, mix(col, '#FFFFFF', 0.28)); R(x, baseY - h, 1, h, mix(col, '#FFFFFF', 0.14)); R(x + w - 1, baseY - h, 1, h, mix(col, '#000000', 0.2));
    if (o.roof === 'dome') { disc(x + w / 2, baseY - h, Math.floor(w / 3), col); P(x + w / 2, baseY - h - Math.floor(w / 3) - 2, pal[0]); }
    else if (o.roof === 'antenna') { R(x + w / 2, baseY - h - 12, 1, 12, col); P(x + w / 2, baseY - h - 13, pal[1 % pal.length]); }
    else if (o.roof === 'stack') { R(x + 3, baseY - h - 10, 5, 10, col); R(x + 2, baseY - h - 11, 7, 2, mix(col, '#FFFFFF', 0.2)); }
    const ww = o.win || 2, gap = o.gap || 4;
    for (let yy = baseY - h + 4; yy < baseY - 4; yy += gap + 1) for (let xx = x + 3; xx < x + w - 3; xx += gap) {
      if (rng() < (o.lit == null ? 0.42 : o.lit)) R(xx, yy, ww, 2, pick(pal));
      else R(xx, yy, ww, 2, mix(col, '#000000', 0.18));
    }
  };
  const gear = (cx, cy, r, col, hole, teeth = 10) => {
    disc(cx, cy, r, col);
    for (let k = 0; k < teeth; k++) { const a = k * Math.PI * 2 / teeth; R(cx + Math.cos(a) * (r + 1) - 2, cy + Math.sin(a) * (r + 1) - 2, 4, 4, col); }
    disc(cx, cy, Math.max(2, Math.floor(r * 0.35)), hole);
    ring(cx, cy, r - 1, mix(col, '#FFFFFF', 0.2));
  };
  const trace = (pts, col, pad) => {
    for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; if (y0 === y1) R(Math.min(x0, x1), y0, Math.abs(x1 - x0) + 1, 2, col); else R(x0, Math.min(y0, y1), 2, Math.abs(y1 - y0) + 1, col); }
    if (pad) for (const [x, y] of [pts[0], pts[pts.length - 1]]) { disc(x + 1, y + 1, 2, pad); P(x + 1, y + 1, '#FFFFFF'); }
  };
  const crystal = (x, baseY, h, col) => {
    const w = Math.max(3, Math.round(h / 3));
    for (let y = 0; y < h; y++) { const ww = y < w ? Math.round((y / w) * w) : w; R(x - ww / 2, baseY - h + y, Math.max(1, ww), 1, y % 5 === 0 ? mix(col, '#FFFFFF', 0.4) : col); }
    R(x - 1, baseY - h + 2, 1, h - 4, mix(col, '#FFFFFF', 0.55));
  };
  return { g, R, P, disc, ring, glowDisc, cloud, building, gear, trace, crystal };
}

// ---------- ATLAS DE TILES ----------
// filas 0-3: profundidad 0 (expuesto), 4 variantes × 16 máscaras de vecinos
// filas 4-7: profundidad 1 (interior) · filas 8-11: profundidad 2+ (núcleo)
// fila 12: plataforma, púas, charco(2), escalera, bloque corrupto(2), puente
function buildTileAtlas(th) {
  const { c, g } = makeCanvas(16 * 16, 16 * 13);
  const D = painter(g), R = D.R, P = D.P;
  const rng = mulberry32(th.base.charCodeAt(1) * 977 + th.light.charCodeAt(2));
  const base = th.base, dark = th.dark, light = th.light, top = th.top;
  const hi = mix(base, light, 0.22), lo = mix(base, dark, 0.35), darker = mix(dark, '#000000', 0.25);
  const texture = (ox, oy, b, a, d) => {
    R(ox, oy, 16, 16, b);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const r = rng(); if (r < 0.07) P(ox + x, oy + y, a); else if (r < 0.13) P(ox + x, oy + y, d); }
  };
  const decal = (ox, oy, v, faint) => {
    const k = faint ? 0.5 : 0;
    if (v === 0) { // pista de circuito con pads
      const tc = mix(th.trace, base, 0.25 + k);
      R(ox + 2, oy + 9, 9, 1, tc); R(ox + 10, oy + 9, 1, 4, tc); R(ox + 1, oy + 8, 2, 2, mix(tc, '#FFFFFF', 0.3)); P(ox + 10, oy + 13, mix(tc, '#FFFFFF', 0.5));
    } else if (v === 1) { // chip con patas
      R(ox + 4, oy + 6, 7, 5, mix('#16202A', base, 0.25 + k)); for (let i = 0; i < 3; i++) { P(ox + 5 + i * 2, oy + 5, mix(light, base, 0.4 + k)); P(ox + 5 + i * 2, oy + 11, mix(light, base, 0.4 + k)); }
      if (!faint) P(ox + 5, oy + 7, pick(th.pal));
    } else if (v === 2) { // remaches y rejilla
      for (const [x, y] of [[3, 5], [12, 5], [3, 12], [12, 12]]) { R(ox + x, oy + y, 2, 2, lo); P(ox + x, oy + y, hi); }
      for (let i = 0; i < 3; i++) R(ox + 6, oy + 7 + i * 2, 4, 1, lo);
    } else { // componente: resistencia con bandas de colores o LED
      if (rng() < 0.5 || faint) { R(ox + 3, oy + 8, 10, 3, mix('#E8D2A0', base, 0.35 + k)); const bands = th.pal; for (let i = 0; i < 3; i++) R(ox + 5 + i * 2, oy + 8, 1, 3, faint ? lo : bands[i % bands.length]); R(ox + 1, oy + 9, 2, 1, lo); R(ox + 13, oy + 9, 2, 1, lo); }
      else { D.disc(ox + 8, oy + 9, 2, pick(th.pal)); P(ox + 7, oy + 8, '#FFFFFF'); }
    }
  };
  for (let v = 0; v < 4; v++) for (let m = 0; m < 16; m++) {
    const ox = m * 16, oy = v * 16;
    texture(ox, oy, base, hi, lo);
    if ((v + m * 3) % 5 < 3) decal(ox, oy, (v * 3 + m) % 4, false);
    // bordes expuestos: franja superior brillante, laterales con luz/sombra, base oscura
    if (m & 1) {
      R(ox, oy, 16, 1, mix(top, '#FFFFFF', 0.45)); R(ox, oy + 1, 16, 2, top); R(ox, oy + 3, 16, 1, mix(top, base, 0.55)); R(ox, oy + 4, 16, 1, lo);
      for (let x = 0; x < 16; x += 5) P(ox + x + (v % 3), oy + 2, mix(top, '#FFFFFF', 0.6));
    }
    if (m & 8) { R(ox, oy + ((m & 1) ? 4 : 0), 1, 16, mix(base, light, 0.35)); R(ox + 1, oy + ((m & 1) ? 4 : 0), 1, 16, hi); }
    if (m & 2) { R(ox + 15, oy, 1, 16, darker); R(ox + 14, oy + ((m & 1) ? 4 : 0), 1, 12, lo); }
    if (m & 4) { R(ox, oy + 15, 16, 1, darker); R(ox, oy + 14, 16, 1, lo); for (let x = 1; x < 16; x += 4) P(ox + x + (v & 1), oy + 15, dark); }
    // esquinas redondeadas (aspecto más amable)
    if ((m & 1) && (m & 8)) { g.clearRect(ox, oy, 1, 1); P(ox + 1, oy, top); P(ox, oy + 1, top); }
    if ((m & 1) && (m & 2)) { g.clearRect(ox + 15, oy, 1, 1); P(ox + 14, oy, top); P(ox + 15, oy + 1, mix(top, dark, 0.3)); }
    if ((m & 4) && (m & 8)) g.clearRect(ox, oy + 15, 1, 1);
    if ((m & 4) && (m & 2)) g.clearRect(ox + 15, oy + 15, 1, 1);
  }
  // profundidad 1 y 2 (sólo máscara 0: rodeados de sólido)
  for (let d = 1; d <= 2; d++) for (let v = 0; v < 4; v++) {
    const ox = 0, oy = (4 * d + v) * 16;
    const b = mix(base, dark, d === 1 ? 0.38 : 0.7);
    texture(ox, oy, b, mix(b, light, 0.08), mix(b, '#000000', 0.18));
    if (d === 1) { if (v !== 3) decal(ox, oy, v, true); }
    else { // núcleo: patrón de celdas hexagonales tenue
      for (let y = 2; y < 16; y += 7) for (let x = (y % 2) * 4 + 2; x < 16; x += 8) { R(ox + x, oy + y, 4, 1, mix(b, light, 0.1)); R(ox + x - 1, oy + y + 1, 1, 3, mix(b, light, 0.06)); }
    }
  }
  const oy = 12 * 16;
  // 0: plataforma de un sentido (tablón con franja de color y remaches)
  R(0, oy, 16, 6, mix(base, light, 0.1)); R(0, oy, 16, 1, mix(top, '#FFFFFF', 0.45)); R(0, oy + 1, 16, 1, top); R(0, oy + 5, 16, 1, darker);
  R(0, oy + 3, 16, 1, th.pal[0]); for (let x = 2; x < 16; x += 6) P(x, oy + 2, '#FFFFFF');
  R(2, oy + 6, 2, 4, dark); R(12, oy + 6, 2, 4, dark); P(2, oy + 6, hi); P(12, oy + 6, hi);
  // 1: púas brillantes
  for (let i = 0; i < 4; i++) {
    const x0 = 16 + i * 4;
    for (let y = 0; y < 8; y++) { const hw = Math.floor(y / 3.2); R(x0 + 2 - hw, oy + 8 + y, Math.min(4, hw * 2 + 1), 1, y < 2 ? '#FFFFFF' : y < 4 ? '#FFB8C8' : '#FF4F7A'); }
  }
  R(16, oy + 15, 16, 1, '#B02850');
  // 2-3: charco de corrupción burbujeante
  for (let f = 0; f < 2; f++) {
    const x0 = 32 + f * 16;
    R(x0, oy + 3, 16, 13, '#6A1240'); R(x0, oy + 3, 16, 2, '#FF5FB0'); R(x0, oy + 5, 16, 1, '#C0308A');
    for (let i = 0; i < 6; i++) P(x0 + ((i * 5 + f * 3) % 16), oy + 7 + ((i * 7 + f) % 8), i % 2 ? '#C79BFF' : '#FF9BD8');
    D.disc(x0 + 4 + f * 7, oy + 2, 1, '#FF9BD8');
  }
  // 4: escalera con barrotes de color
  R(64 + 2, oy, 2, 16, dark); R(64 + 12, oy, 2, 16, dark); R(64 + 3, oy, 1, 16, light); R(64 + 13, oy, 1, 16, hi);
  for (let y = 2; y < 16; y += 4) { R(64 + 2, oy + y, 12, 2, th.pal[1]); R(64 + 2, oy + y, 12, 1, mix(th.pal[1], '#FFFFFF', 0.4)); }
  // 5-6: bloque corrupto rompible
  for (let f = 0; f < 2; f++) {
    const x0 = 80 + f * 16;
    R(x0, oy, 16, 16, '#3A0F2E'); R(x0 + 1, oy + 1, 14, 14, '#6A1648');
    for (let i = 0; i < 14; i++) { P(x0 + 1 + i, oy + 1 + i, '#FF5F8A'); P(x0 + 14 - i, oy + 1 + i, '#FF5F8A'); }
    R(x0 + 6 + f, oy + 6, 4, 4, '#C79BFF'); P(x0 + 2 + f * 9, oy + 12, '#FFFFFF'); P(x0 + 12 - f * 8, oy + 3, '#7FF3FF');
  }
  // 7: puente de energía
  R(112, oy, 16, 4, light); R(112, oy + 1, 16, 1, '#FFFFFF'); R(112, oy + 3, 16, 1, th.accent);
  for (let i = 0; i < 16; i += 4) { P(112 + i, oy + 4, light); P(112 + i + 2, oy + 5, mix(light, base, 0.5)); }
  return c;
}

// ---------- brotes sobre el borde superior (8 variantes × 2 cuadros, 16x8) ----------
function buildTufts(th) {
  const { c, g } = makeCanvas(16 * 8, 16);
  const D = painter(g), R = D.R, P = D.P;
  const rng = mulberry32(th.top.charCodeAt(2) * 131 + 7);
  for (let v = 0; v < 8; v++) for (let f = 0; f < 2; f++) {
    const ox = v * 16, oy = f * 8, by = oy + 7;
    const c1 = th.pal[v % th.pal.length], c2 = th.pal[(v + 2) % th.pal.length];
    switch (th.tuft) {
      case 'moss': case 'grass': case 'leaf': {
        const gcol = th.tuft === 'grass' ? mix(th.top, '#71FF9A', 0.3) : th.tuft === 'leaf' ? '#5FD88A' : mix(th.top, '#71FF9A', 0.4);
        for (let x = 1; x < 15; x += 2) { const h = 1 + Math.floor(rng() * 3) + (f && x % 4 === 1 ? 1 : 0); R(ox + x, by - h + 1, 1, h, gcol); }
        if (v % 2 === 0) { const fx = ox + 3 + (v * 3) % 9; R(fx, by - 4, 1, 4, '#3FAF6A'); D.disc(fx, by - 5, 1, c1); P(fx, by - 5, '#FFFFFF'); }
        if (th.tuft === 'leaf' && v % 3 === 1) { R(ox + 9, by - 3, 1, 3, '#3FAF6A'); R(ox + 7, by - 4, 2, 1, '#6FE89A'); R(ox + 10, by - 5, 2, 1, '#6FE89A'); }
        break;
      }
      case 'nub': case 'stud': case 'bolt': {
        for (let x = 2; x < 15; x += 6) { R(ox + x, by - 1, 3, 2, mix(th.top, th.base, 0.3)); P(ox + x + 1, by - 2, (f + x) % 12 < 6 ? c1 : mix(c1, '#000000', 0.4)); }
        if (th.tuft === 'bolt' && v % 2) { R(ox + 7, by - 3, 2, 3, th.accent); P(ox + 7, by - 3, '#FFFFFF'); }
        break;
      }
      case 'ember': {
        for (let i = 0; i < 3; i++) { const x = ox + 2 + ((v * 5 + i * 5) % 12), y = by - ((f * 2 + i + v) % 4); P(x, y, i % 2 ? '#FFD166' : '#FF7A3D'); }
        if (v % 2 === 0) D.crystal(ox + 8, by + 1, 5, c1);
        break;
      }
      case 'crystal': {
        D.crystal(ox + 4 + (v % 3) * 3, by + 1, 4 + (v % 3) * 2, c1);
        if (v % 2) D.crystal(ox + 11, by + 1, 4, c2);
        if (f) P(ox + 3 + v % 9, by - 5, '#FFFFFF');
        break;
      }
      case 'dust': {
        for (let x = 1; x < 15; x += 3) R(ox + x, by, 2, 1, mix(th.top, '#5A8A4A', 0.45));
        if (v % 3 === 0) { R(ox + 6, by - 2, 4, 2, '#D8C8A0'); R(ox + 6, by - 3, 4, 1, '#F0E0B8'); }
        break;
      }
    }
  }
  return c;
}

// ---------- ATREZO (objetos decorativos sobre el suelo) ----------
function buildProps(th) {
  const out = {};
  const mk = (name, w, h, frames, draw, o = {}) => {
    const fr = [];
    for (let f = 0; f < frames; f++) {
      const { c, g } = makeCanvas(w, h);
      draw(painter(g), f, w, h);
      fr.push(outlined(c));
    }
    out[name] = Object.assign({ name, w, h, frames: fr, fps: o.fps || 4 }, o);
  };
  const pal = th.pal;
  mk('bulb', 8, 16, 2, (D, f) => { D.R(3, 8, 2, 8, '#6F7C86'); D.disc(4, 5, 3, f ? pal[0] : mix(pal[0], '#FFFFFF', 0.3)); D.P(3, 4, '#FFFFFF'); D.R(2, 8, 4, 1, '#A9B6BE'); }, { glow: pal[0], gr: 10 });
  mk('flower', 10, 12, 2, (D, f) => { D.R(4, 5, 1, 7, '#3FAF6A'); D.R(2, 8, 2, 1, '#6FE89A'); D.R(5, 7, 2, 1, '#6FE89A'); const c = pal[2 % pal.length]; D.disc(4, 3, 2, c); D.P(4, 3, f ? '#FFFFFF' : '#FFD166'); });
  mk('crystal', 12, 16, 2, (D, f) => { D.crystal(6, 16, 13, pal[1 % pal.length]); D.crystal(3, 16, 7, pal[3 % pal.length]); D.crystal(9, 16, 8, pal[0]); if (f) D.P(6, 4, '#FFFFFF'); }, { glow: pal[1 % pal.length], gr: 12 });
  mk('orb', 12, 16, 2, (D, f) => { D.R(3, 12, 6, 4, '#3A444C'); D.R(2, 11, 8, 1, '#6F7C86'); D.glowDisc(6, 6, 3, f ? pal[1] : mix(pal[1], '#FFFFFF', 0.35), 2); D.P(5, 5, '#FFFFFF'); }, { glow: pal[1], gr: 14 });
  mk('crate', 14, 12, 1, (D) => { D.R(0, 0, 14, 12, '#8A5A34'); D.R(1, 1, 12, 10, '#B07A48'); D.R(1, 5, 12, 2, '#8A5A34'); D.R(6, 1, 2, 10, '#8A5A34'); D.R(1, 1, 12, 1, '#D8A870'); D.R(3, 3, 2, 1, pal[0]); });
  mk('cone', 10, 12, 1, (D) => { for (let y = 0; y < 10; y++) { const w = 2 + Math.floor(y * 0.7); D.R(5 - w / 2, y, w, 1, y % 4 === 2 ? '#FFFFFF' : '#FF8A3D'); } D.R(0, 10, 10, 2, '#FF8A3D'); D.R(0, 10, 10, 1, '#FFB070'); });
  mk('arrow', 14, 16, 2, (D, f) => { D.R(6, 6, 2, 10, '#6F7C86'); D.R(0, 0, 14, 7, '#16202A'); D.R(1, 1, 12, 5, f ? pal[3 % pal.length] : mix(pal[3 % pal.length], '#FFFFFF', 0.25)); for (let i = 0; i < 3; i++) D.R(4 + i, 2 + (i === 2 ? 1 : 0), 1, i === 2 ? 1 : 3, '#16202A'); D.R(4, 3, 5, 1, '#16202A'); }, { glow: pal[3 % pal.length], gr: 10 });
  mk('capacitor', 10, 16, 1, (D) => { D.R(1, 2, 8, 14, '#3A6ED8'); D.R(1, 2, 8, 1, '#8AB0FF'); D.R(1, 2, 2, 14, '#5A8AF0'); D.R(7, 2, 2, 14, '#2A4EA8'); D.R(3, 4, 1, 10, '#DDE8FF'); D.R(2, 0, 6, 2, '#A9B6BE'); D.P(4, 7, '#FFFFFF'); });
  mk('resistor', 16, 10, 1, (D) => { D.R(0, 6, 16, 1, '#A9B6BE'); D.R(3, 3, 10, 6, '#E8D2A0'); D.R(3, 3, 10, 1, '#FFF0CC'); for (let i = 0; i < 4; i++) D.R(5 + i * 2, 3, 1, 6, [pal[0], pal[1], pal[4 % pal.length], '#FFD166'][i]); D.R(1, 7, 1, 3, '#A9B6BE'); D.R(14, 7, 1, 3, '#A9B6BE'); });
  mk('chip', 16, 10, 2, (D, f) => { D.R(1, 2, 14, 7, '#1A2230'); D.R(1, 2, 14, 1, '#3A4A5E'); for (let i = 0; i < 6; i++) { D.R(2 + i * 2, 0, 1, 2, '#C8D2DA'); D.R(2 + i * 2, 9, 1, 1, '#C8D2DA'); } D.P(3, 4, f ? pal[2] : '#3A4A5E'); D.R(6, 5, 6, 1, '#3A4A5E'); });
  mk('tree', 16, 24, 2, (D, f) => { D.R(7, 12, 2, 12, '#B07A48'); D.R(4, 16, 3, 1, '#B07A48'); D.R(9, 14, 3, 1, '#B07A48'); D.disc(8, 8, 7, '#3FAF6A'); D.disc(5, 10, 4, '#4FC87A'); D.disc(11, 9, 4, '#4FC87A'); for (let i = 0; i < 5; i++) D.P(3 + ((i * 7) % 11), 3 + ((i * 5) % 10), (i + f) % 2 ? pal[0] : pal[1]); }, { glow: pal[0], gr: 12 });
  mk('gear', 16, 16, 2, (D, f) => { D.gear(8, 8, 5, f ? th.accent : mix(th.accent, '#FFFFFF', 0.2), '#2A2450', 8); });
  mk('cabinet', 12, 20, 2, (D, f) => { D.R(0, 0, 12, 20, '#2A2E5A'); D.R(1, 1, 10, 18, '#3A3E7A'); for (let i = 0; i < 4; i++) { D.R(2, 3 + i * 4, 8, 2, '#1E2248'); D.P(3 + ((i + f) % 3) * 3, 3 + i * 4, pal[(i + f) % pal.length]); } D.R(0, 0, 12, 1, '#6A6ED0'); });
  mk('anvil', 16, 10, 1, (D) => { D.R(2, 0, 12, 3, '#5A6470'); D.R(0, 0, 4, 2, '#5A6470'); D.R(2, 0, 12, 1, '#A9B6BE'); D.R(5, 3, 6, 3, '#46505A'); D.R(3, 6, 10, 4, '#3A424A'); D.R(3, 6, 10, 1, '#6F7C86'); });
  mk('brazier', 12, 16, 3, (D, f) => { D.R(2, 10, 8, 4, '#5A3A2A'); D.R(1, 9, 10, 1, '#8A5A3A'); D.R(3, 14, 1, 2, '#5A3A2A'); D.R(8, 14, 1, 2, '#5A3A2A'); const fl = ['#FFD166', '#FF9F4A', '#FF5F4A']; for (let i = 0; i < 3; i++) { const h = 5 + ((f + i) % 3) * 2; D.R(3 + i * 2, 9 - h, 2, h, fl[i]); } D.P(5, 2 + f, '#FFFFFF'); }, { glow: '#FF9F4A', gr: 18, fps: 8 });
  mk('ingot', 14, 8, 1, (D) => { D.R(1, 4, 12, 4, '#D8A030'); D.R(3, 1, 8, 3, '#F0C050'); D.R(3, 1, 8, 1, '#FFF0A0'); D.R(1, 4, 12, 1, '#FFE070'); });
  mk('books', 16, 18, 1, (D) => { D.R(0, 16, 16, 2, '#5A4632'); const cols = [pal[0], pal[1], pal[2], pal[3 % pal.length], '#FFFFFF']; let x = 1; for (let i = 0; i < 6; i++) { const w = 2, h = 8 + ((i * 5) % 7); D.R(x, 16 - h, w, h, cols[i % cols.length]); D.R(x, 16 - h, w, 1, '#FFFFFF'); x += w + 0; } D.R(x + 1, 10, 2, 6, pal[1]); });
  mk('lantern', 10, 18, 2, (D, f) => { D.R(4, 0, 2, 4, '#6F7C86'); D.R(1, 4, 8, 10, '#3A2A5A'); D.R(2, 5, 6, 8, f ? '#FFE9A8' : '#FFD166'); D.R(1, 4, 8, 1, '#A9B6BE'); D.R(1, 14, 8, 2, '#3A2A5A'); D.R(4, 16, 2, 2, '#6F7C86'); }, { glow: '#FFD98A', gr: 16 });
  mk('trafficlight', 8, 24, 3, (D, f) => { D.R(3, 12, 2, 12, '#6F7C86'); D.R(0, 0, 8, 13, '#1A2030'); const cols = ['#FF5F6A', '#FFD166', '#71FF9A']; for (let i = 0; i < 3; i++) D.disc(4, 2 + i * 4, 1, i === f ? cols[i] : mix(cols[i], '#000000', 0.6)); }, { glow: '#FFD166', gr: 10, fps: 1 });
  mk('sign', 16, 18, 1, (D) => { D.R(7, 8, 2, 10, '#6F7C86'); D.R(0, 0, 16, 9, '#1A2030'); D.R(1, 1, 14, 7, pal[0]); D.R(3, 4, 10, 1, '#1A2030'); D.R(10, 2, 1, 5, '#1A2030'); D.R(11, 3, 1, 3, '#1A2030'); });
  mk('bollard', 6, 12, 1, (D) => { D.R(1, 0, 4, 12, '#DDE3EA'); D.R(1, 3, 4, 2, '#FF5F6A'); D.R(1, 7, 4, 2, '#FF5F6A'); D.R(1, 0, 4, 1, '#FFFFFF'); });
  mk('speaker', 12, 18, 2, (D, f) => { D.R(0, 0, 12, 18, '#2A1E3A'); D.R(0, 0, 12, 1, '#6A4E8A'); D.disc(6, 5, 3 + (f ? 0 : 1) * 0, '#12091E'); D.disc(6, 5, 1, pal[0]); D.disc(6, 13, 4 - f, '#12091E'); D.disc(6, 13, 2, pal[3 % pal.length]); });
  mk('antenna', 12, 24, 2, (D, f) => { D.R(5, 6, 2, 18, '#A9B6BE'); D.R(2, 10, 8, 1, '#A9B6BE'); D.R(3, 15, 6, 1, '#A9B6BE'); D.disc(6, 3, 2, f ? pal[1] : mix(pal[1], '#000000', 0.4)); D.R(3, 22, 6, 2, '#6F7C86'); }, { glow: pal[1], gr: 10, fps: 2 });
  mk('joystick', 12, 12, 1, (D) => { D.R(0, 7, 12, 5, '#2A1E3A'); D.R(0, 7, 12, 1, '#6A4E8A'); D.R(5, 2, 2, 5, '#A9B6BE'); D.disc(6, 2, 2, pal[3 % pal.length]); D.P(9, 9, pal[0]); D.P(2, 9, pal[2]); });
  mk('flask', 12, 16, 3, (D, f) => { D.R(4, 0, 4, 5, '#CFF6FF'); D.R(3, 0, 6, 1, '#FFFFFF'); for (let y = 5; y < 16; y++) { const w = Math.min(12, 4 + (y - 5) * 2); D.R(6 - w / 2, y, w, 1, y > 8 ? pal[(y > 12 ? 1 : 0)] : '#CFF6FF'); } D.P(4 + f * 2, 11 - f, '#FFFFFF'); D.P(7 - f, 13 - (f % 2) * 2, '#FFFFFF'); }, { glow: pal[0], gr: 12, fps: 5 });
  mk('beaker', 10, 12, 2, (D, f) => { D.R(1, 0, 8, 12, '#CFF6FF'); D.R(2, 5, 6, 7, pal[2 % pal.length]); D.R(2, 5, 6, 1, mix(pal[2 % pal.length], '#FFFFFF', 0.4)); D.P(4, 9 - f * 2, '#FFFFFF'); });
  mk('plant', 14, 18, 2, (D, f) => { D.R(3, 12, 8, 6, '#D0704A'); D.R(2, 12, 10, 2, '#E88A5A'); D.R(6, 5, 2, 7, '#3FAF6A'); D.disc(4, 6 - f, 3, '#4FC87A'); D.disc(10, 5, 3, '#4FC87A'); D.disc(7, 2, 2, '#6FE89A'); D.P(4, 5 - f, '#B8FFD0'); });
  mk('microscope', 12, 16, 1, (D) => { D.R(1, 14, 10, 2, '#46505A'); D.R(6, 6, 2, 8, '#6F7C86'); D.R(3, 1, 3, 9, '#DDE3EA'); D.R(2, 0, 5, 2, '#A9B6BE'); D.R(1, 10, 8, 2, '#A9B6BE'); D.P(4, 3, pal[0]); });
  mk('crt', 16, 14, 2, (D, f) => { D.R(0, 0, 16, 12, '#8A7A60'); D.R(2, 2, 12, 8, '#1E2A22'); for (let i = 0; i < 3; i++) D.R(3, 3 + i * 2, 4 + ((i * 3 + f) % 6), 1, '#9DFF8A'); D.R(4, 12, 8, 2, '#6A5E4A'); D.P(13, 10, f ? '#FFB45C' : '#6A5E4A'); }, { glow: '#9DFF8A', gr: 12 });
  mk('scrolls', 16, 10, 1, (D) => { for (let i = 0; i < 3; i++) { D.R(1 + i * 5, 3 - (i % 2) * 2, 5, 7 + (i % 2) * 2, '#F0E0B8'); D.R(1 + i * 5, 3 - (i % 2) * 2, 5, 1, '#FFFFFF'); D.R(1 + i * 5, 6, 5, 1, '#C8A870'); } });
  mk('candle', 8, 14, 3, (D, f) => { D.R(2, 6, 4, 8, '#F0E6D0'); D.R(2, 6, 4, 1, '#FFFFFF'); D.R(1, 13, 6, 1, '#C8A870'); D.R(3, 2 + (f === 1 ? 1 : 0), 2, 3, '#FFD166'); D.P(3, 1 + (f === 2 ? 1 : 0), '#FFF0B0'); }, { glow: '#FFD98A', gr: 14, fps: 6 });
  mk('pylon', 12, 28, 2, (D, f) => { D.R(4, 6, 4, 22, '#2E226A'); D.R(5, 6, 2, 22, pal[0]); D.R(2, 24, 8, 4, '#3A2E7A'); D.glowDisc(6, 4, 3, f ? pal[1] : pal[0], 2); }, { glow: pal[0], gr: 18, fps: 2 });
  return out;
}
// contorno oscuro de 1 px para que el atrezo se lea sobre cualquier fondo
function outlined(src) {
  const w = src.width + 2, h = src.height + 2;
  const { c, g } = makeCanvas(w, h);
  const sil = makeCanvas(src.width, src.height);
  sil.g.drawImage(src, 0, 0); sil.g.globalCompositeOperation = 'source-in'; sil.g.fillStyle = 'rgba(10,8,20,0.85)'; sil.g.fillRect(0, 0, src.width, src.height);
  for (const [dx, dy] of [[0, 1], [2, 1], [1, 0], [1, 2]]) g.drawImage(sil.c, dx, dy);
  g.drawImage(src, 1, 1);
  return c;
}

// ---------- FONDOS (cielo + 3 capas de parallax) ----------
function buildSky(th, BW) {
  const { c, g } = makeCanvas(BW, H);
  const img = g.createImageData(BW, H), d = img.data;
  const keys = th.sky.map(hexToRgb);
  const colAt = y => { const t = clamp(y / (H - 1), 0, 1) * (keys.length - 1), i = Math.min(keys.length - 2, Math.floor(t)), f = t - i; return [0, 1, 2].map(k => keys[i][k] + (keys[i + 1][k] - keys[i][k]) * f); };
  const BAND = 6;
  for (let y = 0; y < H; y++) {
    const b = Math.floor(y / BAND), a = colAt(b * BAND), n = colAt((b + 1) * BAND), f = (y % BAND) / BAND;
    for (let x = 0; x < BW; x++) {
      const cc = bayer(x, y) < f ? n : a, o = (y * BW + x) * 4;
      d[o] = cc[0]; d[o + 1] = cc[1]; d[o + 2] = cc[2]; d[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return { c, g };
}
function buildBackground(th, key) {
  const BW = 512;
  const sky = buildSky(th, BW);
  const far = makeCanvas(BW, H), mid = makeCanvas(BW, H), near = makeCanvas(BW, H);
  const rng = mulberry32(key.length * 7919 + key.charCodeAt(0) * 31 + 17);
  const S = painter(sky.g), F = painter(far.g), M = painter(mid.g), N = painter(near.g);
  const pal = th.pal, stars = [], traces = [];
  const horizon = th.sky[3];
  // estrellas (fijas + lista para centellear)
  const nStars = Math.round(70 * th.stars);
  for (let i = 0; i < nStars; i++) {
    const x = Math.floor(rng() * BW), y = Math.floor(rng() * H * 0.55), big = rng() < 0.12;
    const col = rng() < 0.7 ? '#FFFFFF' : pick(pal);
    S.P(x, y, mix(col, th.sky[0], 0.35));
    if (big) { S.P(x - 1, y, mix(col, th.sky[1], 0.6)); S.P(x + 1, y, mix(col, th.sky[1], 0.6)); S.P(x, y - 1, mix(col, th.sky[1], 0.6)); S.P(x, y + 1, mix(col, th.sky[1], 0.6)); }
    if (rng() < 0.45) stars.push({ x, y, col, ph: rng() * 6.28, big });
  }
  // astro (sol / luna / planeta)
  if (th.sun) {
    const sx = 90 + rng() * 300, sy = key === 'core' || key === 'tower' ? 50 + rng() * 30 : 150 + rng() * 25;
    S.glowDisc(sx, sy, key === 'core' ? 14 : 20, th.sun, 10);
    if (key === 'bus' || key === 'io') for (let k = 0; k < 5; k++) S.R(sx - 22, sy + 4 + k * 4, 45, 1 + (k >> 1), th.sky[2]); // sol retro con franjas
    if (key === 'core' || key === 'tower') { S.ring(sx, sy, 24, mix(th.sun, th.sky[1], 0.4)); S.ring(sx, sy, 26, mix(th.sun, th.sky[1], 0.6)); }
  }
  // nubes alegres
  if (th.clouds) for (let i = 0; i < 7; i++) {
    const w = 40 + rng() * 70, x = rng() * BW, y = 30 + rng() * 110;
    const col = mix(th.clouds, th.sky[1], 0.35 + rng() * 0.25);
    S.cloud(x, y, w, col, mix(col, th.sky[2], 0.4));
    if (x + w > BW) S.cloud(x - BW, y, w, col, mix(col, th.sky[2], 0.4));
  }
  // resplandor del horizonte
  for (let k = 0; k < 11; k++) { sky.g.globalAlpha = 0.03 + k * 0.022; S.R(0, H - 110 + k * 10, BW, 10, mix(horizon, '#FFFFFF', 0.25)); }
  sky.g.globalAlpha = 1;

  const farC = th.far, midC = th.mid, nearC = th.near;
  const wrapDraw = (fn, x, w) => { fn(x); if (x + w > BW) fn(x - BW); };
  switch (th.deco) {
    case 'boot': {
      for (let i = 0; i < 11; i++) { const w = 26 + rng() * 44, h = 50 + rng() * 90, x = rng() * BW; wrapDraw(xx => F.building(xx, H - 30, w, h, farC, pal, rng, { roof: rng() < 0.4 ? 'dome' : rng() < 0.5 ? 'antenna' : null, lit: 0.35 }), x, w); }
      for (let i = 0; i < 7; i++) { const x = rng() * BW, h = 70 + rng() * 60; M.R(x, H - 40 - h, 8, h + 40, midC); M.R(x, H - 40 - h, 8, 1, mix(midC, '#FFFFFF', 0.3)); for (let y = H - 30 - h; y < H - 40; y += 10) M.P(x + 3 + (y % 20 ? 0 : 1), y, pick(pal)); const sc = pick(pal); M.R(x - 12, H - 40 - h + 14, 32, 16, '#16224A'); M.R(x - 12, H - 40 - h + 14, 32, 1, mix(sc, '#FFFFFF', 0.3)); M.R(x - 10, H - 40 - h + 16, 28, 12, mix(sc, midC, 0.2)); for (let k = 0; k < 3; k++) M.R(x - 7, H - 40 - h + 18 + k * 3, 8 + ((k * 7 + i * 5) % 14), 1, mix(sc, '#FFFFFF', 0.55)); }
      for (let i = 0; i < 5; i++) { const y = 120 + rng() * 80; const x0 = rng() * BW, len = 60 + rng() * 120; M.trace([[x0, y], [x0 + len, y]], mix(th.trace, midC, 0.35), th.trace); traces.push({ layer: 'mid', y: y + 1, x0, x1: x0 + len, col: th.trace }); }
      for (let i = 0; i < 6; i++) { const x = rng() * BW; N.R(x, 150, 5, H, nearC); N.R(x - 6, 150, 17, 4, nearC); for (let k = 0; k < 4; k++) N.P(x + 2, 160 + k * 18, pick(pal)); }
      break;
    }
    case 'board': {
      // ciudad de componentes: chips, condensadores y resistencias gigantes
      for (let i = 0; i < 12; i++) {
        const t = i % 3, x = rng() * BW;
        if (t === 0) { const w = 40 + rng() * 40, h = 40 + rng() * 60; wrapDraw(xx => { F.building(xx, H - 30, w, h, farC, pal, rng, { lit: 0.3, gap: 5 }); for (let k = 0; k < w - 4; k += 5) { F.R(xx + 2 + k, H - 30 - h - 3, 2, 3, mix(farC, '#FFFFFF', 0.25)); } }, x, w); }
        else if (t === 1) { const r = 10 + rng() * 8, h = 60 + rng() * 60; wrapDraw(xx => { F.R(xx, H - 30 - h, r * 2, h, mix(farC, '#3A6ED8', 0.25)); F.disc(xx + r, H - 30 - h, r, mix(farC, '#3A6ED8', 0.3)); F.R(xx + 3, H - 30 - h, 2, h, mix(farC, '#FFFFFF', 0.18)); for (let y = H - 26 - h; y < H - 34; y += 7) F.R(xx + r - 1, y, 3, 2, pick(pal)); }, x, r * 2); }
        else { const w = 60 + rng() * 30; wrapDraw(xx => { F.R(xx, H - 70, w, 26, mix(farC, '#E8D2A0', 0.22)); for (let k = 0; k < 4; k++) F.R(xx + 10 + k * 12, H - 70, 5, 26, mix(pick(pal), farC, 0.45)); }, x, w); }
      }
      for (let i = 0; i < 9; i++) {
        const y = 110 + rng() * 120, x = rng() * BW, len = 60 + rng() * 140, up = rng() < 0.5;
        const pts = [[x, y], [x + len * 0.6, y], [x + len * 0.6, y + (up ? -24 : 24)], [x + len, y + (up ? -24 : 24)]];
        M.trace(pts, mix(th.trace, midC, 0.2), th.trace);
        traces.push({ layer: 'mid', y: y + 1, x0: x, x1: x + len * 0.6, col: th.trace });
      }
      for (let i = 0; i < 8; i++) { const x = rng() * BW, h = 22 + rng() * 26; M.R(x, H - 36 - h, 12, h + 36, midC); M.R(x, H - 36 - h, 12, 2, mix(midC, '#FFFFFF', 0.3)); M.P(x + 5, H - 30 - h, pick(pal)); M.P(x + 5, H - 24 - h, pick(pal)); }
      for (let i = 0; i < 9; i++) { const x = rng() * BW, w = 22 + rng() * 26, h = 18 + rng() * 20; N.R(x, H - 40 - h, w, h + 40, nearC); N.R(x, H - 40 - h, w, 1, mix(nearC, th.top, 0.4)); for (let k = 2; k < w - 2; k += 4) N.R(x + k, H - 42 - h, 2, 2, mix(nearC, '#C8D2DA', 0.35)); N.P(x + 3, H - 36 - h, pick(pal)); }
      break;
    }
    case 'cpu': {
      for (let i = 0; i < 6; i++) { const cx = rng() * BW, cy = 70 + rng() * 120, r = 16 + rng() * 26; wrapDraw(xx => F.gear(xx, cy, r, mix(farC, th.accent, 0.12 + rng() * 0.1), th.sky[1], 12), cx, r); }
      // torre del reloj
      F.R(236, 40, 40, H, farC); F.R(236, 40, 40, 1, mix(farC, '#FFFFFF', 0.3)); F.disc(256, 70, 15, mix(farC, th.accent, 0.4)); F.disc(256, 70, 12, th.sky[3]); F.R(255, 59, 2, 11, '#3A2A6A'); F.R(256, 69, 9, 2, '#3A2A6A'); F.P(256, 70, th.accent);
      for (let k = 0; k < 6; k++) F.R(240 + k * 6, 100, 3, 6, pick(pal));
      for (let i = 0; i < 5; i++) { const y = 105 + i * 30; M.R(0, y, BW, 3, midC); M.R(0, y, BW, 1, mix(midC, '#FFFFFF', 0.2)); traces.push({ layer: 'mid', y: y + 1, x0: 0, x1: BW, col: pick(pal) }); }
      for (let i = 0; i < 8; i++) { const x = rng() * BW; M.R(x, 90 + rng() * 40, 10, H, midC); M.R(x + 2, 120, 6, 8, mix(pick(pal), midC, 0.3)); M.R(x, 90, 10, 1, mix(midC, '#FFFFFF', 0.25)); }
      for (let i = 0; i < 5; i++) { const cx = rng() * BW, r = 12 + rng() * 14; wrapDraw(xx => N.gear(xx, H - 20 + rng() * 10, r, nearC, mix(nearC, '#000000', 0.3), 10), cx, r); }
      break;
    }
    case 'forge': {
      for (let i = 0; i < 9; i++) {
        const w = 34 + rng() * 44, h = 50 + rng() * 100, x = rng() * BW;
        wrapDraw(xx => { F.building(xx, H - 20, w, h, farC, ['#FFD166', '#FF9F4A', '#FF7A3D'], rng, { roof: 'stack', lit: 0.5, win: 3, gap: 6 }); F.R(xx + 3, H - 20 - h - 16, 5, 6, mix(th.sky[2], '#FFFFFF', 0.2)); }, x, w);
      }
      for (let x = 0; x < BW; x++) for (let y = H - 34; y < H; y++) if (bayer(x, y) < (y - (H - 34)) / 34) F.P(x, y, mix('#FF7A3D', farC, 0.3));
      for (let i = 0; i < 5; i++) { const y = 100 + rng() * 120; M.R(0, y, BW, 4, midC); M.R(0, y, BW, 1, mix(midC, '#FFB84A', 0.4)); for (let x = 0; x < BW; x += 24) M.R(x, y + 4, 3, 10, midC); traces.push({ layer: 'mid', y: y + 1, x0: 0, x1: BW, col: '#FFB84A' }); }
      for (let i = 0; i < 6; i++) { const x = rng() * BW, y = 50 + rng() * 60; for (let k = 0; k < 8; k++) M.R(x + 2, y + k * 5, 2, 3, mix(midC, '#A9B6BE', 0.3)); M.R(x - 3, y + 40, 12, 10, midC); M.R(x - 1, y + 42, 8, 6, '#FFB84A'); }
      for (let i = 0; i < 7; i++) { const x = rng() * BW, h = 30 + rng() * 40; N.R(x, H - h, 16, h, nearC); N.R(x, H - h, 16, 2, mix(nearC, '#FFB84A', 0.5)); N.R(x + 5, H - h + 6, 6, 5, '#FF9F4A'); }
      break;
    }
    case 'tower': {
      for (let x = 0; x < BW; x += 32) for (let y = 8; y < H; y += 20) {
        if (rng() < 0.3) continue;
        F.R(x + 3, y, 26, 14, farC); F.R(x + 3, y, 26, 1, mix(farC, '#FFFFFF', 0.12));
        for (let k = 0; k < 6; k++) if (rng() < 0.5) F.R(x + 5 + k * 4, y + 4, 2, 8, mix(pick(pal), farC, 0.62));
      }
      for (let i = 0; i < 7; i++) { const x = rng() * BW; M.R(x, 0, 12, H, midC); M.R(x + 5, 0, 2, H, mix(midC, th.light, 0.2)); for (let y = 10; y < H; y += 26) { M.disc(x + 6, y, 3, mix(pick(pal), midC, 0.2)); M.P(x + 6, y, '#FFFFFF'); } }
      for (let i = 0; i < 12; i++) M.crystal(rng() * BW, 60 + rng() * 200, 8 + rng() * 14, mix(pick(pal), midC, 0.35));
      for (let i = 0; i < 6; i++) { const x = rng() * BW; N.R(x, 0, 16, H, nearC); N.R(x + 2, 0, 2, H, mix(nearC, th.light, 0.12)); }
      break;
    }
    case 'bus': {
      for (let i = 0; i < 14; i++) { const w = 22 + rng() * 34, h = 50 + rng() * 100, x = rng() * BW; wrapDraw(xx => F.building(xx, H - 40, w, h, farC, pal, rng, { roof: rng() < 0.3 ? 'antenna' : null, lit: 0.5 }), x, w); }
      for (let k = 0; k < 3; k++) { const y = 150 + k * 22; F.R(0, y, BW, 4, mix(BUS_COL[k], farC, 0.55)); F.R(0, y, BW, 1, mix(BUS_COL[k], '#FFFFFF', 0.2)); traces.push({ layer: 'far', y: y + 2, x0: 0, x1: BW, col: BUS_COL[k], fast: true }); }
      for (let i = 0; i < 6; i++) { const x = i * 88 + rng() * 20; M.R(x, 120, 8, H, midC); M.R(x - 14, 118, 36, 4, midC); M.R(x - 14, 118, 36, 1, mix(midC, '#FFFFFF', 0.3)); }
      for (let i = 0; i < 4; i++) { const y = 170 + i * 26; M.R(0, y, BW, 5, midC); M.R(0, y, BW, 1, mix(midC, pal[i % 3], 0.5)); }
      for (let i = 0; i < 8; i++) { const x = rng() * BW; N.R(x, 120, 3, H, nearC); N.R(x - 4, 118, 11, 3, nearC); N.glowDisc(x + 1, 116, 2, '#FFE9A8', 2); }
      break;
    }
    case 'io': {
      for (let i = 0; i < 12; i++) {
        const x = rng() * BW, t = i % 4, b = H - 36;
        if (t === 0) wrapDraw(xx => { F.building(xx, b, 56, 80, farC, pal, rng, { lit: 0.25 }); F.R(xx + 6, b - 72, 44, 30, mix(pick(pal), farC, 0.45)); F.R(xx + 6, b - 72, 44, 1, '#FFFFFF'); }, x, 56);
        else if (t === 1) wrapDraw(xx => { F.R(xx, b - 36, 30, 36, farC); F.disc(xx + 15, b - 24, 9, mix(farC, '#000000', 0.25)); F.disc(xx + 15, b - 24, 4, pick(pal)); }, x, 30);
        else if (t === 2) wrapDraw(xx => { F.R(xx + 10, b - 150, 3, 150, farC); for (let k = 0; k < 4; k++) F.R(xx + 2 + k, b - 150 + k * 20, 20 - k * 2, 2, farC); F.glowDisc(xx + 11, b - 154, 2, pick(pal), 2); }, x, 24);
        else wrapDraw(xx => F.building(xx, b, 44, 60 + rng() * 40, farC, pal, rng, { roof: 'antenna', lit: 0.45 }), x, 44);
      }
      // guirnaldas de bombillas
      for (let i = 0; i < 6; i++) { const x = rng() * BW, y = 60 + rng() * 70, len = 90 + rng() * 60; for (let k = 0; k < len; k++) { const yy = y + Math.sin(k / len * Math.PI) * 16; M.P(x + k, yy, midC); if (k % 10 === 5) { M.disc(x + k, yy + 3, 1, pal[(k / 10 | 0) % pal.length]); } } }
      for (let i = 0; i < 6; i++) { const x = rng() * BW, h = 26 + rng() * 30; N.R(x, H - h, 18, h, nearC); N.disc(x + 9, H - h + 9, 5, mix(nearC, '#000000', 0.3)); N.P(x + 9, H - h + 9, pick(pal)); }
      break;
    }
    case 'lab': {
      for (let i = 0; i < 10; i++) { const x = i * 52 + rng() * 10, h = 70 + rng() * 70; wrapDraw(xx => { F.building(xx, H - 30, 40, h, farC, ['#EAFFFB', '#B8FFF0', '#FFE9A8'], rng, { roof: rng() < 0.4 ? 'dome' : null, win: 4, gap: 7, lit: 0.6 }); }, x, 40); }
      for (let i = 0; i < 5; i++) { const x = rng() * BW; M.R(x, 70, 10, 130, midC); M.R(x + 3, 90, 4, 100, mix(th.accent, midC, 0.35)); M.disc(x + 5, 200, 9, midC); M.disc(x + 5, 200, 6, mix(pick(pal), midC, 0.25)); for (let k = 0; k < 4; k++) M.P(x + 4, 110 + k * 20, '#FFFFFF'); }
      for (let i = 0; i < 4; i++) { const y = 80 + i * 40; M.R(0, y, BW, 3, midC); M.R(0, y, BW, 1, mix(midC, '#FFFFFF', 0.3)); traces.push({ layer: 'mid', y: y + 1, x0: 0, x1: BW, col: pick(pal) }); }
      for (let i = 0; i < 8; i++) { const x = rng() * BW, h = 20 + rng() * 26; N.R(x + 6, H - h, 3, h, '#2E7A4A'); N.disc(x + 7, H - h, 8, mix('#3FAF6A', nearC, 0.3)); N.disc(x + 2, H - h + 6, 5, mix('#4FC87A', nearC, 0.35)); }
      break;
    }
    case 'kernel': {
      for (let i = 0; i < 9; i++) { const x = rng() * BW, w = 26 + rng() * 34, h = 60 + rng() * 110; wrapDraw(xx => { F.building(xx, H - 20, w, h, farC, ['#FFB45C', '#FFE9A8'], rng, { lit: 0.22, win: 3, gap: 7 }); F.R(xx + w * 0.3, H - 20 - h - 8, w * 0.4, 8, farC); }, x, w); }
      for (let i = 0; i < 6; i++) { const x = rng() * BW, y = 60 + rng() * 100; M.R(x, y, 34, 3, midC); M.R(x, y, 3, 30, midC); M.R(x + 31, y, 3, 30, midC); M.R(x + 8, y + 4, 18, 20, mix('#F0E0B8', midC, 0.55)); for (let k = 0; k < 4; k++) M.R(x + 10, y + 8 + k * 4, 14, 1, mix('#8A6A4A', midC, 0.3)); }
      for (let i = 0; i < 5; i++) { const x = rng() * BW, y = 40 + rng() * 60; M.R(x + 3, y, 1, 20, midC); M.R(x, y + 20, 7, 6, midC); M.R(x + 1, y + 21, 5, 4, '#FFD98A'); }
      for (let i = 0; i < 7; i++) { const x = rng() * BW, h = 40 + rng() * 60; N.R(x, H - h, 20, h, nearC); for (let y = H - h + 4; y < H; y += 6) N.R(x + 2, y, 16, 3, mix(nearC, '#F0E0B8', 0.12)); }
      break;
    }
    case 'core': {
      for (let k = 0; k < 7; k++) F.ring(256, 135, 30 + k * 24, mix([th.light, th.accent, '#FFD166'][k % 3], th.sky[1], 0.45));
      for (let a = 0; a < 18; a++) { const an = a * Math.PI / 9; for (let r2 = 24; r2 < 280; r2 += 3) F.P(256 + Math.cos(an) * r2, 135 + Math.sin(an) * r2, mix(BUS_COL[a % 3], th.sky[1], 0.5)); }
      F.glowDisc(256, 135, 12, mix(th.accent, '#FFFFFF', 0.3), 8); F.disc(256, 135, 6, '#FFFFFF');
      for (let i = 0; i < 14; i++) M.crystal(rng() * BW, 80 + rng() * 180, 10 + rng() * 18, mix(pick(pal), midC, 0.25));
      for (let i = 0; i < 10; i++) { const y = 100 + rng() * 150, x = rng() * BW, len = 30 + rng() * 80; M.R(x, y, len, 2, midC); M.disc(x + len, y + 1, 2, pick(pal)); traces.push({ layer: 'mid', y: y + 1, x0: x, x1: x + len, col: pick(pal) }); }
      for (let i = 0; i < 6; i++) { const x = rng() * BW; N.R(x, 90, 6, H, nearC); N.R(x + 2, 90, 2, H, mix(nearC, th.light, 0.25)); N.glowDisc(x + 3, 88, 3, pick(pal), 2); }
      break;
    }
  }
  // el cielo y la capa lejana se funden en un solo lienzo
  sky.g.drawImage(far.c, 0, 0);
  return { far: sky.c, mid: mid.c, near: near.c, w: BW, stars, traces };
}

// ---------- brillos (sprites de luz aditiva) ----------
const GlowCache = new Map();
function glowSprite(col, r) {
  const key = col + '|' + r;
  let c = GlowCache.get(key);
  if (c) return c;
  const s = r * 2;
  const cv = makeCanvas(s, s), g = cv.g;
  const [cr, cg, cb] = hexToRgb(col);
  const img = g.createImageData(s, s), d = img.data;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const dd = Math.hypot(x + 0.5 - r, y + 0.5 - r) / r;
    const a = dd >= 1 ? 0 : Math.pow(1 - dd, 2);
    const q = Math.round(a * 4) / 4; // cuantizado en anillos: aspecto pixel art
    const o = (y * s + x) * 4; d[o] = cr; d[o + 1] = cg; d[o + 2] = cb; d[o + 3] = Math.round(q * 255);
  }
  g.putImageData(img, 0, 0);
  c = cv.c; GlowCache.set(key, c);
  return c;
}

function getTheme(key) {
  if (ThemeCache[key]) return ThemeCache[key];
  const th = Object.assign({ key }, THEMES[key] || THEMES.boot);
  th.atlas = buildTileAtlas(th);
  th.tufts = buildTufts(th);
  th.propSet = buildProps(th);
  th.bg = buildBackground(th, key);
  ThemeCache[key] = th;
  return th;
}
