// =============================================================================
// TILES Y FONDOS PROCEDURALES POR TEMA
// =============================================================================
const T = { AIR: 0, SOLID: 1, ONEWAY: 2, SPIKE: 3, LADDER: 4, BREAK: 5, POOL: 6, DOOR: 7, BRIDGE: 8 };
const isSolidT = t => t === T.SOLID || t === T.BREAK || t === T.DOOR;
const isOneWayT = t => t === T.ONEWAY || t === T.BRIDGE;
const isHazardT = t => t === T.SPIKE || t === T.POOL;

const THEMES = {
  boot:   { sky: ['#07131d', '#0a1a27', '#0c2030', '#0e2739'], far: '#11283a', mid: '#173650', base: '#1D5C7A', dark: '#123C52', light: '#45E5FF', accent: '#71FF9A', deco: 'boot' },
  board:  { sky: ['#04100b', '#061610', '#081d15', '#0a241a'], far: '#0c2c20', mid: '#10392a', base: '#1F6B47', dark: '#123D2A', light: '#71FF9A', accent: '#F1B45C', deco: 'board' },
  cpu:    { sky: ['#080a14', '#0b0e1c', '#0e1226', '#121731'], far: '#161b35', mid: '#1f2648', base: '#3A4470', dark: '#252C4D', light: '#45E5FF', accent: '#F1B45C', deco: 'cpu' },
  forge:  { sky: ['#140806', '#1a0b07', '#220f09', '#2c140b'], far: '#2e160c', mid: '#3c1d10', base: '#6B3A1F', dark: '#40220F', light: '#F1B45C', accent: '#FF8A3D', deco: 'forge' },
  tower:  { sky: ['#07091a', '#0a0d20', '#0d1128', '#111632'], far: '#161c38', mid: '#1c2448', base: '#2D3B6B', dark: '#1B2446', light: '#AA7DFF', accent: '#45E5FF', deco: 'tower' },
  bus:    { sky: ['#05080f', '#070b14', '#090f1a', '#0c1321'], far: '#0f1729', mid: '#141f3a', base: '#2A3550', dark: '#1A2238', light: '#45E5FF', accent: '#F1B45C', deco: 'bus' },
  io:     { sky: ['#0e0914', '#120c1a', '#171021', '#1d1429'], far: '#211733', mid: '#2b1d40', base: '#4A3A6A', dark: '#2E2446', light: '#F1B45C', accent: '#71FF9A', deco: 'io' },
  lab:    { sky: ['#0a1010', '#0c1414', '#0f1818', '#121d1d'], far: '#162323', mid: '#1f3030', base: '#4A5F63', dark: '#2C3A3D', light: '#E8F4F7', accent: '#FF5964', deco: 'lab' },
  kernel: { sky: ['#09090a', '#0c0c0e', '#0f0f12', '#131316'], far: '#18181b', mid: '#222226', base: '#44444A', dark: '#2A2A2E', light: '#9A9AA2', accent: '#C8B890', deco: 'kernel' },
  core:   { sky: ['#04050a', '#06060e', '#090814', '#0c0a1b'], far: '#120a24', mid: '#1a1036', base: '#2B2150', dark: '#1A1433', light: '#45E5FF', accent: '#AA7DFF', deco: 'core' }
};
const ThemeCache = {};

function buildTileAtlas(th) {
  const { c, g } = makeCanvas(16 * 16, 16 * 5);
  const rng = mulberry32(th.base.length * 977 + th.light.charCodeAt(1));
  const px = (x, y, col) => { g.fillStyle = col; g.fillRect(x, y, 1, 1); };
  const r = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const base = th.base, dark = th.dark, light = th.light, darker = shade(th.dark, 0.7), mid = mix(th.base, th.dark, 0.5);
  for (let v = 0; v < 4; v++) for (let m = 0; m < 16; m++) {
    const ox = m * 16, oy = v * 16;
    r(ox, oy, 16, 16, base);
    // patrón interior: pistas de circuito
    const seed = v * 31 + 7;
    r(ox + 1, oy + 1, 14, 14, mix(base, dark, 0.25));
    if (v === 0) { r(ox + 3, oy + 7, 7, 1, mid); r(ox + 9, oy + 7, 1, 5, mid); px(ox + 9, oy + 12, light); }
    if (v === 1) { r(ox + 5, oy + 3, 1, 8, mid); r(ox + 5, oy + 10, 6, 1, mid); px(ox + 11, oy + 10, th.accent); }
    if (v === 2) { r(ox + 4, oy + 4, 3, 3, mid); r(ox + 10, oy + 9, 2, 2, mid); px(ox + 5, oy + 5, dark); }
    if (v === 3) { for (let i = 0; i < 4; i++) px(ox + 3 + ((seed * (i + 1)) % 10), oy + 3 + ((seed * (i + 3)) % 10), mid); }
    // bordes expuestos
    if (m & 1) { r(ox, oy, 16, 1, light); r(ox, oy + 1, 16, 1, mix(base, light, 0.35)); r(ox, oy + 2, 16, 1, mix(base, dark, 0.1)); }
    else r(ox, oy, 16, 1, mix(base, dark, 0.35));
    if (m & 2) r(ox + 15, oy, 1, 16, darker);
    if (m & 4) r(ox, oy + 15, 16, 1, darker);
    if (m & 8) r(ox, oy, 1, 16, mix(base, light, 0.15));
    if ((m & 1) && (m & 8)) px(ox, oy, light);
    if ((m & 1) && (m & 2)) px(ox + 15, oy, light);
  }
  const oy = 64;
  // 0: plataforma de un sentido
  r(0, oy, 16, 5, base); r(0, oy, 16, 1, light); r(0, oy + 4, 16, 1, darker); r(2, oy + 5, 2, 3, dark); r(12, oy + 5, 2, 3, dark);
  // 1: púas
  for (let i = 0; i < 4; i++) {
    const x0 = 16 + i * 4;
    for (let y = 0; y < 7; y++) { const hw = Math.floor(y / 3.5); r(x0 + 2 - hw, oy + 9 + y, hw * 2 + 1 > 4 ? 4 : hw * 2 + 1, 1, y < 2 ? '#FFB1B8' : '#FF5964'); }
    px(x0 + 2, oy + 8, '#FFFFFF');
  }
  r(16, oy + 15, 16, 1, '#A02B38');
  // 2-3: charco de corrupción (2 cuadros)
  for (let f = 0; f < 2; f++) {
    const x0 = 32 + f * 16;
    r(x0, oy + 3, 16, 13, '#5A1030'); r(x0, oy + 3, 16, 2, '#FF4FA3');
    for (let i = 0; i < 5; i++) px(x0 + ((i * 5 + f * 3) % 16), oy + 6 + ((i * 7) % 9), '#AA7DFF');
    px(x0 + 3 + f * 6, oy + 2, '#FF4FA3');
  }
  // 4: escalera
  r(64 + 2, oy, 2, 16, dark); r(64 + 12, oy, 2, 16, dark); r(64 + 3, oy, 1, 16, light);
  for (let y = 2; y < 16; y += 4) r(64 + 2, oy + y, 12, 2, mix(base, light, 0.3));
  // 5-6: bloque corrupto rompible
  for (let f = 0; f < 2; f++) {
    const x0 = 80 + f * 16;
    r(x0, oy, 16, 16, '#3A0F24'); r(x0 + 1, oy + 1, 14, 14, '#5A1030');
    for (let i = 0; i < 14; i++) { px(x0 + 1 + i, oy + 1 + i, '#FF5964'); px(x0 + 14 - i, oy + 1 + i, '#FF5964'); }
    r(x0 + 6 + f, oy + 6, 4, 4, '#AA7DFF'); px(x0 + 2 + f * 9, oy + 12, '#FFFFFF');
  }
  // 7: puente de energía (Circuit Link / Bus Bridge)
  r(112, oy, 16, 3, light); r(112, oy + 1, 16, 1, '#FFFFFF'); for (let i = 0; i < 16; i += 4) px(112 + i, oy + 3, light);
  return c;
}

// ---------- Fondos (capas de parallax) ----------
function buildBackground(th, key) {
  const BW = 512;
  const far = makeCanvas(BW, H), mid = makeCanvas(BW, H);
  const rng = mulberry32(key.length * 7919 + 17);
  const F = far.g, M = mid.g;
  const R = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  // cielo en bandas (sin degradados suaves)
  const bands = th.sky;
  for (let i = 0; i < bands.length; i++) R(F, 0, Math.floor(i * H / bands.length), BW, Math.ceil(H / bands.length) + 1, bands[i]);
  const farC = th.far, midC = th.mid, lightDim = mix(th.light, th.far, 0.55), accDim = mix(th.accent, th.far, 0.5);
  const circle = (g, cx, cy, rad, col) => { for (let y = -rad; y <= rad; y++) { const w = Math.floor(Math.sqrt(rad * rad - y * y)); R(g, cx - w, cy + y, w * 2 + 1, 1, col); } };
  const ring = (g, cx, cy, rad, col) => { for (let a = 0; a < 360; a += 2) { const r2 = a * Math.PI / 180; R(g, cx + Math.cos(r2) * rad, cy + Math.sin(r2) * rad, 1, 1, col); } };
  switch (th.deco) {
    case 'boot': {
      for (let x = 0; x < BW; x += 16) R(F, x, 0, 1, H, mix(bands[2], th.light, 0.06));
      for (let y = 0; y < H; y += 16) R(F, 0, y, BW, 1, mix(bands[2], th.light, 0.06));
      for (let i = 0; i < 8; i++) { const x = rng() * BW, w = 30 + rng() * 60, h = 40 + rng() * 90; R(F, x, H - 60 - h, w, h + 60, farC); R(F, x + 3, H - 56 - h, w - 6, 1, lightDim); }
      for (let i = 0; i < 6; i++) { const x = rng() * BW; R(M, x, 60 + rng() * 60, 6, H, midC); R(M, x + 2, 64 + rng() * 40, 2, 2, th.light); }
      break;
    }
    case 'board': {
      for (let i = 0; i < 14; i++) {
        const w = 24 + rng() * 50, h = 40 + rng() * 110, x = rng() * BW, y = H - 50 - h;
        R(F, x, y, w, h + 50, farC);
        for (let py = y + 4; py < y + h; py += 6) { R(F, x - 2, py, 2, 2, lightDim); R(F, x + w, py, 2, 2, lightDim); }
        for (let k = 0; k < 6; k++) R(F, x + 3 + rng() * (w - 6), y + 4 + rng() * (h - 8), 2, 1, rng() < 0.5 ? accDim : lightDim);
      }
      for (let i = 0; i < 12; i++) {
        const y = 120 + rng() * 140, x = rng() * BW, len = 40 + rng() * 120;
        R(M, x, y, len, 2, midC); R(M, x + len, y - 20, 2, 22, midC); circle(M, x, y + 1, 2, th.accent);
      }
      for (let i = 0; i < 6; i++) { const x = rng() * BW, h = 18 + rng() * 14; R(M, x, H - 40 - h, 10, h, midC); R(M, x, H - 40 - h, 10, 2, mix(midC, th.light, 0.3)); }
      break;
    }
    case 'cpu': {
      for (let i = 0; i < 6; i++) {
        const cx = rng() * BW, cy = 60 + rng() * 150, rad = 18 + rng() * 30;
        circle(F, cx, cy, rad, farC); circle(F, cx, cy, rad * 0.35, bands[1]);
        for (let a = 0; a < 12; a++) { const an = a * Math.PI / 6; R(F, cx + Math.cos(an) * (rad + 2) - 3, cy + Math.sin(an) * (rad + 2) - 3, 6, 6, farC); }
      }
      R(F, 240, 30, 40, H, farC); circle(F, 260, 60, 14, mix(farC, th.accent, 0.3)); circle(F, 260, 60, 12, bands[0]); R(F, 259, 50, 2, 10, th.accent); R(F, 260, 59, 8, 2, th.accent);
      for (let i = 0; i < 5; i++) { const y = 100 + i * 34; R(M, 0, y, BW, 3, midC); R(M, 0, y + 1, BW, 1, mix(midC, th.light, 0.2)); }
      for (let i = 0; i < 8; i++) { const x = rng() * BW; R(M, x, 90 + rng() * 60, 8, H, midC); R(M, x + 2, 120, 4, 6, lightDim); }
      break;
    }
    case 'forge': {
      for (let i = 0; i < 9; i++) {
        const w = 30 + rng() * 40, h = 60 + rng() * 120, x = rng() * BW;
        R(F, x, H - h, w, h, farC); R(F, x + w / 3, H - h - 30, 8, 30, farC);
        for (let k = 0; k < 3; k++) R(F, x + 6 + k * 10, H - h + 12, 6, 8, mix(th.accent, farC, 0.3));
      }
      R(F, 0, 40, BW, 6, mix(bands[2], '#3a1a10', 0.5));
      for (let i = 0; i < 5; i++) { const y = 110 + rng() * 120; R(M, 0, y, BW, 4, midC); for (let x = 0; x < BW; x += 24) R(M, x, y + 4, 3, 10, midC); }
      for (let i = 0; i < 5; i++) { const x = rng() * BW, y = 60 + rng() * 80; R(M, x, y, 18, 12, midC); R(M, x + 2, y + 2, 14, 8, mix(midC, th.light, 0.25)); R(M, x + 5, y + 5, 8, 2, midC); }
      break;
    }
    case 'tower': {
      for (let x = 0; x < BW; x += 20) for (let y = 0; y < H; y += 14) { R(F, x + 2, y + 2, 16, 10, farC); if (rng() < 0.15) R(F, x + 4, y + 5, 4, 2, rng() < 0.5 ? lightDim : accDim); }
      for (let i = 0; i < 6; i++) { const x = rng() * BW; R(M, x, 0, 10, H, midC); R(M, x + 4, 0, 2, H, mix(midC, th.light, 0.15)); }
      break;
    }
    case 'bus': {
      for (let i = 0; i < 10; i++) { const x = i * 52 + rng() * 10; R(F, x, 70, 8, H, farC); R(F, x - 10, 70, 28, 4, farC); }
      for (let k = 0; k < 3; k++) { const y = 90 + k * 26; R(F, 0, y, BW, 3, mix(BUS_COL[k], farC, 0.6)); R(F, 0, y + 1, BW, 1, mix(BUS_COL[k], farC, 0.35)); }
      for (let i = 0; i < 4; i++) { const y = 150 + i * 28; R(M, 0, y, BW, 5, midC); for (let x = 0; x < BW; x += 64) R(M, x + rng() * 20, y + 5, 6, 40, midC); }
      break;
    }
    case 'io': {
      for (let i = 0; i < 10; i++) {
        const x = rng() * BW, t = i % 4, base = H - 40;
        if (t === 0) { R(F, x, base - 100, 60, 70, farC); R(F, x + 4, base - 96, 52, 58, mix(farC, th.light, 0.12)); R(F, x + 26, base - 30, 8, 40, farC); }
        else if (t === 1) { R(F, x, base - 30, 90, 30, farC); for (let k = 0; k < 8; k++) R(F, x + 4 + k * 11, base - 26, 8, 6, mix(farC, th.accent, 0.15)); }
        else if (t === 2) { R(F, x + 10, base - 150, 4, 150, farC); R(F, x, base - 150, 24, 3, farC); R(F, x + 11, base - 156, 2, 4, th.accent); }
        else { R(F, x, base - 60, 50, 60, farC); R(F, x + 6, base - 70, 38, 10, farC); R(F, x + 8, base - 40, 34, 4, mix(farC, th.light, 0.2)); }
      }
      for (let i = 0; i < 6; i++) { const x = rng() * BW, y = 70 + rng() * 60; for (let k = 0; k < 60; k++) R(M, x + k, y + Math.sin(k / 60 * Math.PI) * 14, 1, 1, midC); }
      break;
    }
    case 'lab': {
      for (let i = 0; i < 12; i++) {
        const x = i * 44 + rng() * 8, h = 100 + rng() * 60;
        R(F, x, H - h, 32, h, farC);
        for (let y = H - h + 6; y < H - 10; y += 8) { R(F, x + 3, y, 26, 5, mix(farC, '#000000', 0.3)); if (rng() < 0.5) R(F, x + 5 + rng() * 20, y + 2, 2, 1, rng() < 0.3 ? th.accent : th.light); }
      }
      for (let i = 0; i < 4; i++) { const x = rng() * BW; R(M, x, 60, 10, 130, midC); R(M, x + 3, 80, 4, 100, mix(th.accent, midC, 0.5)); circle(M, x + 5, 195, 8, midC); circle(M, x + 5, 195, 5, mix(th.accent, midC, 0.4)); }
      break;
    }
    case 'kernel': {
      for (let i = 0; i < 7; i++) {
        const x = rng() * BW, w = 20 + rng() * 30, h = 60 + rng() * 120;
        R(F, x, H - h, w, h, farC); R(F, x + w * 0.3, H - h - 6, w * 0.4, 6, farC);
        if (rng() < 0.6) R(F, x + 4, H - h + 10, w - 8, 12, mix(farC, th.accent, 0.08));
      }
      for (let i = 0; i < 5; i++) { const x = rng() * BW, y = 60 + rng() * 120; R(M, x, y, 30, 2, midC); R(M, x, y, 2, 24, midC); R(M, x + 28, y + 6, 2, 14, midC); }
      break;
    }
    case 'core': {
      for (let k = 0; k < 6; k++) ring(F, 256, 135, 30 + k * 26, mix([th.light, th.accent, '#F1B45C'][k % 3], farC, 0.55));
      for (let a = 0; a < 16; a++) { const an = a * Math.PI / 8; for (let r2 = 20; r2 < 260; r2 += 3) R(F, 256 + Math.cos(an) * r2, 135 + Math.sin(an) * r2, 1, 1, mix(BUS_COL[a % 3], farC, 0.6)); }
      circle(F, 256, 135, 16, mix(th.accent, farC, 0.3)); circle(F, 256, 135, 10, mix('#FFD166', farC, 0.3));
      for (let i = 0; i < 10; i++) { const y = 100 + rng() * 160, x = rng() * BW, len = 30 + rng() * 80; R(M, x, y, len, 2, midC); circle(M, x + len, y + 1, 2, pick([th.light, th.accent, '#F1B45C'])); }
      break;
    }
  }
  return { far: far.c, mid: mid.c, w: BW };
}

function getTheme(key) {
  if (ThemeCache[key]) return ThemeCache[key];
  const th = Object.assign({ key }, THEMES[key] || THEMES.boot);
  th.atlas = buildTileAtlas(th);
  th.bg = buildBackground(th, key);
  ThemeCache[key] = th;
  return th;
}
