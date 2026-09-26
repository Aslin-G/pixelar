// =============================================================================
// SPRITES PROCEDURALES — todo se genera con código, píxel a píxel.
// =============================================================================
class PixelArt {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Array(w * h).fill(null); }
  px(x, y, c) { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = c; }
  get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.d[y * this.w + x] : null; }
  rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c); }
  circle(cx, cy, r, c) {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) this.px(cx + x, cy + y, c);
  }
  rows(x, y, rows, pal) {
    for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) {
      const ch = rows[j][i];
      if (ch !== '.' && ch !== ' ' && pal[ch]) this.px(x + i, y + j, pal[ch]);
    }
  }
  outline(col = PAL.ink) {
    const add = [];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.get(x, y)) continue;
      if (this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1)) add.push(x, y);
    }
    for (let i = 0; i < add.length; i += 2) this.px(add[i], add[i + 1], col);
    return this;
  }
  toCanvas() {
    const { c, g } = makeCanvas(this.w, this.h);
    const img = g.createImageData(this.w, this.h);
    const cache = {};
    for (let i = 0; i < this.d.length; i++) {
      const col = this.d[i];
      if (!col) continue;
      const rgb = cache[col] || (cache[col] = hexToRgb(col));
      img.data[i * 4] = rgb[0]; img.data[i * 4 + 1] = rgb[1]; img.data[i * 4 + 2] = rgb[2]; img.data[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c;
  }
}
function flipCanvas(src) {
  const { c, g } = makeCanvas(src.width, src.height);
  g.translate(src.width, 0); g.scale(-1, 1); g.drawImage(src, 0, 0);
  return c;
}
function silhouette(src, color) {
  const { c, g } = makeCanvas(src.width, src.height);
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = color; g.fillRect(0, 0, c.width, c.height);
  return c;
}

const Sprites = {};

// ---------------------------------------------------------------- BYTE ----
const BYTE_COL = {
  hair: '#3B2A4A', hairHi: '#5C4775', skin: '#F2C7A0', skinSh: '#D69B7B', hood: '#1E7F9C', hoodSh: '#145A70',
  hoodHi: '#2FB3D1', trim: '#45E5FF', pants: '#26314A', pantsSh: '#1A2236', shoe: '#E8F4F7', shoeSh: '#9FB3BD',
  visor: '#45E5FF', visorD: '#0E5D6E', eye: '#E8F4F7', glow: '#71FF9A', gold: '#FFD166', circuit: '#71FF9A'
};
const ARM_MODES = {
  down: [[0, 0], [0, 1], [0, 2], [0, 3, 1]], hang: [[0, 1], [0, 2], [0, 3], [0, 4, 1]],
  swingF: [[0, 0], [1, 1], [1, 2], [2, 3, 1]], swingB: [[0, 0], [-1, 1], [-1, 2], [-2, 3, 1]],
  up: [[0, 0], [0, -1], [1, -2], [1, -3, 1]], fwd: [[0, 0], [1, 0], [2, 0], [3, 0, 1]],
  visor: [[0, 0], [1, -1], [2, -2], [2, -3, 1]]
};
function drawByte(p, o, upg, low) {
  const C = BYTE_COL;
  const by = (o.by || 0), hx = (o.hx || 0), hy = (o.hy || 0) + (low ? 1 : 0);
  const bl = o.bl || {}, fl = o.fl || {};
  const armBack = low && (!o.ba || o.ba === 'down') ? 'hang' : (o.ba || 'down');
  const armFront = low && (!o.fa || o.fa === 'down') ? 'hang' : (o.fa || 'down');
  const arm = (sx, sy, mode, col, hand) => {
    const pts = ARM_MODES[mode] || ARM_MODES.down;
    for (const pt of pts) {
      const c = pt[2] ? hand : col;
      if (mode === 'fwd') { p.px(sx + pt[0], sy + pt[1], c); p.px(sx + pt[0], sy + pt[1] + 1, c); }
      else { p.px(sx + pt[0], sy + pt[1], c); p.px(sx + pt[0] + 1, sy + pt[1], c); }
    }
  };
  const leg = (x, lift, front) => {
    const shoeY = 19 - (lift || 0);
    const col = front ? C.pants : C.pantsSh;
    for (let y = 15 + by; y < shoeY; y++) { p.px(x, y, col); p.px(x + 1, y, col); }
    p.px(x, shoeY, front ? C.shoeSh : C.shoeSh); p.px(x + 1, shoeY, C.shoe); p.px(x + 2, shoeY, C.shoe);
  };
  // brazo trasero
  arm(6, 10 + by, armBack, C.hoodSh, C.skinSh);
  // pierna trasera
  leg(6 + (bl.dx || 0), bl.lift, false);
  // torso (sudadera)
  p.rect(5, 9 + by, 6, 6 - (by > 1 ? 1 : 0), C.hood);
  p.rect(5, 9 + by, 1, 6, C.hoodSh);
  p.px(10, 9 + by, C.hoodHi); p.px(10, 10 + by, C.hoodHi);
  p.px(9, 10 + by, C.trim); p.px(9, 11 + by, C.trim);
  p.rect(5, 14 + by, 6, 1, C.hoodSh);
  if (upg >= 1) { p.rect(5, 14 + by, 6, 1, C.trim); }
  if (upg >= 2) { p.px(6, 11 + by, C.circuit); p.px(7, 11 + by, C.circuit); p.px(7, 12 + by, C.circuit); }
  // capucha tras el cuello
  p.rect(4, 8 + by, 3, 2, C.hoodSh);
  // pierna delantera
  leg(8 + (fl.dx || 0), fl.lift, true);
  // cabeza
  const hx0 = 5 + hx, hy0 = 2 + by + hy;
  p.rect(hx0 + 1, hy0, 5, 1, C.hair);
  p.rect(hx0, hy0 + 1, 7, 1, C.hair);
  p.px(hx0 + 2, hy0 - 1, C.hair); p.px(hx0 + 3, hy0 - 1, C.hairHi); p.px(hx0 + 5, hy0 - 1, C.hair);
  p.px(hx0 + 3, hy0, C.hairHi);
  p.rect(hx0, hy0 + 2, 3, 1, C.hair); p.rect(hx0 + 3, hy0 + 2, 4, 1, C.skin);
  p.px(hx0, hy0 + 3, C.hair); p.px(hx0 + 1, hy0 + 3, C.visorD);
  const vcol = upg >= 3 ? C.gold : (o.visorGlow ? C.glow : C.visor);
  p.rect(hx0 + 2, hy0 + 3, 5, 1, C.visorD); p.px(hx0 + 7, hy0 + 3, vcol); p.px(hx0 + 6, hy0 + 3, vcol);
  p.px(hx0 + 5, hy0 + 3, o.visorGlow ? C.eye : C.visor);
  p.px(hx0, hy0 + 4, C.hair); p.rect(hx0 + 1, hy0 + 4, 6, 1, C.skin); p.px(hx0 + 2, hy0 + 4, C.skinSh);
  p.rect(hx0 + 1, hy0 + 5, 6, 1, C.skin); p.px(hx0 + 5, hy0 + 5, low ? C.skinSh : C.skinSh);
  p.rect(hx0 + 2, hy0 + 6, 4, 1, C.skin); p.px(hx0 + 2, hy0 + 6, C.skinSh);
  // brazo delantero
  arm(8, 10 + by, armFront, C.hoodHi, C.skin);
  if (o.glow) { p.px(12, 10 + by, C.glow); p.px(13, 9 + by, C.glow); p.px(13, 11 + by, C.glow); }
}
const BYTE_ANIMS = {
  idle: { fps: 2, loop: true, f: [{}, { by: 1 }] },
  walk: { fps: 10, loop: true, f: [
    { bl: { dx: -2 }, fl: { dx: 2 }, ba: 'swingF', fa: 'swingB' },
    { bl: { dx: 0, lift: 1 }, fl: { dx: 0 }, by: 1 },
    { bl: { dx: 2 }, fl: { dx: -2 }, ba: 'swingB', fa: 'swingF' },
    { bl: { dx: 0 }, fl: { dx: 0, lift: 1 }, by: 1 }] },
  run: { fps: 14, loop: true, f: [
    { bl: { dx: -3 }, fl: { dx: 3, lift: 1 }, ba: 'swingF', fa: 'swingB', hx: 1 },
    { bl: { dx: -1, lift: 2 }, fl: { dx: 1 }, by: 1, hx: 1 },
    { bl: { dx: 3, lift: 1 }, fl: { dx: -3 }, ba: 'swingB', fa: 'swingF', hx: 1 },
    { bl: { dx: 1 }, fl: { dx: -1, lift: 2 }, by: 1, hx: 1 }] },
  jump: { fps: 1, loop: true, f: [{ bl: { dx: -1, lift: 2 }, fl: { dx: 2, lift: 3 }, ba: 'up', fa: 'swingF' }] },
  fall: { fps: 1, loop: true, f: [{ bl: { dx: -1 }, fl: { dx: 1, lift: 1 }, ba: 'up', fa: 'up' }] },
  land: { fps: 12, loop: false, f: [{ by: 2, bl: { dx: -2 }, fl: { dx: 2 } }, { by: 1 }] },
  hurt: { fps: 1, loop: true, f: [{ hx: -1, ba: 'up', fa: 'swingB', bl: { dx: -2 }, fl: { dx: 2, lift: 1 } }] },
  interact: { fps: 6, loop: true, f: [{ fa: 'fwd' }, { fa: 'fwd', by: 1 }] },
  celebrate: { fps: 5, loop: true, f: [{ ba: 'up', fa: 'up' }, { ba: 'up', fa: 'up', by: 1, bl: { lift: 1 }, fl: { lift: 1 } }] },
  analyze: { fps: 3, loop: true, f: [{ fa: 'visor', visorGlow: true }, { fa: 'visor' }] },
  ability: { fps: 1, loop: true, f: [{ fa: 'fwd', glow: true }] },
  climb: { fps: 6, loop: true, f: [{ ba: 'up', fa: 'down', bl: { lift: 1 } }, { ba: 'down', fa: 'up', fl: { lift: 1 } }] },
  dash: { fps: 1, loop: true, f: [{ hx: 1, bl: { dx: -3 }, fl: { dx: 2 }, ba: 'swingB', fa: 'fwd' }] },
  carry: { fps: 2, loop: true, f: [{ ba: 'up', fa: 'up' }, { ba: 'up', fa: 'up', by: 1 }] },
  carryWalk: { fps: 10, loop: true, f: [
    { bl: { dx: -2 }, fl: { dx: 2 }, ba: 'up', fa: 'up' }, { bl: { lift: 1 }, by: 1, ba: 'up', fa: 'up' },
    { bl: { dx: 2 }, fl: { dx: -2 }, ba: 'up', fa: 'up' }, { fl: { lift: 1 }, by: 1, ba: 'up', fa: 'up' }] }
};
Sprites.buildByte = function (upg = 0) {
  const sheets = {};
  for (const posture of ['normal', 'low']) {
    const sh = {};
    for (const k in BYTE_ANIMS) {
      sh[k] = BYTE_ANIMS[k].f.map(fr => {
        const p = new PixelArt(18, 21);
        const q = new PixelArt(18, 21);
        drawByte(p, fr, upg, posture === 'low');
        // desplazar 1px para dejar margen al contorno
        for (let y = 0; y < 20; y++) for (let x = 0; x < 17; x++) { const c = p.get(x, y); if (c) q.px(x + 1, y + 1, c); }
        q.outline();
        const r = q.toCanvas();
        return { r, l: flipCanvas(r) };
      });
    }
    sheets[posture] = sh;
  }
  Sprites.byte = sheets;
};

// ---------------------------------------------------------------- NEXO / NULL / NEXUS ----
function drawShell(p, pal, broken) {
  const cx = 8, cy = 9;
  p.circle(cx, cy, 6, pal.shell);
  // sombreado inferior derecho y brillo superior izquierdo
  for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) {
    if (!p.get(cx + x, cy + y)) continue;
    if (x + y > 5) p.px(cx + x, cy + y, pal.sh);
    else if (x + y < -6) p.px(cx + x, cy + y, pal.hi);
  }
  // pantalla (cara)
  p.rect(cx - 4, cy - 3, 9, 6, pal.screen);
  p.rect(cx - 3, cy - 4, 7, 1, pal.screen);
  p.rect(cx - 3, cy + 3, 7, 1, pal.screen);
  // aletas
  p.rect(cx - 8, cy - 1, 2, 3, pal.fin); p.rect(cx + 7, cy - 1, 2, 3, pal.fin);
  // antena en "Y" (símbolo compartido)
  if (!broken) {
    p.px(cx, cy - 7, pal.ant); p.px(cx, cy - 8, pal.ant);
    p.px(cx - 1, cy - 9, pal.ant); p.px(cx + 1, cy - 9, pal.ant); p.px(cx - 1, cy - 10, pal.tip); p.px(cx + 1, cy - 10, pal.tip);
  } else {
    p.px(cx + 1, cy - 7, pal.ant); p.px(cx + 1, cy - 8, pal.ant);
    p.px(cx + 2, cy - 9, pal.ant); p.px(cx, cy - 9, pal.ant); p.px(cx + 3, cy - 10, pal.tip);
    // fracturas
    const holes = [[-5, -2], [-6, 0], [-5, 1], [4, 4], [5, 3], [2, 5], [-2, -6], [6, -2], [-4, 4]];
    for (const [x, y] of holes) p.px(cx + x, cy + y, null);
    p.px(cx - 6, cy + 2, pal.crack); p.px(cx + 5, cy - 4, pal.crack); p.px(cx - 3, cy + 5, pal.crack);
  }
  // propulsor
  p.px(cx - 1, cy + 7, pal.fin); p.px(cx, cy + 7, pal.fin); p.px(cx + 1, cy + 7, pal.fin);
}
const NEXO_PAL = { shell: '#2FB3D1', hi: '#9FF6FF', sh: '#1D5C7A', screen: '#06202A', fin: '#1F8FA8', ant: '#6F7C86', tip: '#71FF9A' };
const NEXO_DIM = { shell: '#257F96', hi: '#5FB9C8', sh: '#123C52', screen: '#041419', fin: '#175F72', ant: '#4A545C', tip: '#2E9A5C' };
const NEXO_ANGRY = { shell: '#3A9DB8', hi: '#FFB1B8', sh: '#5A2A38', screen: '#1A0A10', fin: '#A02B38', ant: '#6F7C86', tip: '#FF5964' };
const NULL_PAL = { shell: '#7E57C9', hi: '#C7A8FF', sh: '#3E2670', screen: '#12061E', fin: '#5E3F9E', ant: '#5A4A70', tip: '#FF4FA3', crack: '#FF4FA3' };
const NEXUS_PAL = { shell: '#2FB3D1', hi: '#FFE9A8', sh: '#5E3F9E', screen: '#0A0A1A', fin: '#FFD166', ant: '#FFD166', tip: '#FFD166' };
Sprites.buildCompanions = function () {
  const mk = (pal, broken) => { const p = new PixelArt(17, 20); drawShell(p, pal, broken); p.outline(); return p.toCanvas(); };
  Sprites.nexo = { normal: mk(NEXO_PAL), dim: mk(NEXO_DIM), angry: mk(NEXO_ANGRY) };
  Sprites.null = mk(NULL_PAL, true);
  // NEXUS: mitad cian, mitad violeta, costura dorada
  const p = new PixelArt(17, 20);
  drawShell(p, NEXUS_PAL, false);
  for (let y = 0; y < 20; y++) for (let x = 9; x < 17; x++) {
    const c = p.get(x, y);
    if (c === NEXUS_PAL.shell) p.px(x, y, '#8A63D9');
    else if (c === NEXUS_PAL.hi) p.px(x, y, '#C7A8FF');
  }
  for (let y = 3; y < 16; y++) if (p.get(8, y) && p.get(8, y) !== NEXUS_PAL.screen) p.px(8, y, '#FFD166');
  p.outline();
  Sprites.nexus = p.toCanvas();
};
// Ojos de NEXO según emoción (dibujados en vivo). ox, oy: esquina del sprite.
function drawNexoEyes(g, ox, oy, emo, t, look, blink, color) {
  const cx = ox + 8, cy = oy + 9;
  const c = color || '#9FF6FF';
  const lx = Math.round(look ? look.x : 0), ly = Math.round(look ? look.y : 0);
  g.fillStyle = c;
  const e = (x, y, w, h) => g.fillRect(cx + x + lx, cy + y + ly, w, h);
  if (blink && emo !== 'HAPPY') { e(-3, 0, 2, 1); e(1, 0, 2, 1); return; }
  switch (emo) {
    case 'HAPPY': e(-3, 0, 1, 1); e(-2, -1, 1, 1); e(-1, 0, 1, 1); e(1, 0, 1, 1); e(2, -1, 1, 1); e(3, 0, 1, 1); break;
    case 'CURIOUS': e(-3, -1, 2, 2); e(1, -2, 3, 3); break;
    case 'WORRIED': e(-3, 0, 2, 2); e(1, 0, 2, 2); g.fillStyle = shade(c, 0.7); e(-3, -2, 1, 1); e(-2, -3, 1, 1); e(2, -3, 1, 1); e(3, -2, 1, 1); break;
    case 'AFRAID': { const j = Math.sin(t * 40) > 0 ? 1 : 0; e(-3 + j, 0, 1, 1); e(3 - j, 0, 1, 1); break; }
    case 'GUILTY': e(-4, 1, 2, 1); e(0, 1, 2, 1); break;
    case 'ANGRY': g.fillStyle = '#FF5964'; e(-3, 0, 2, 1); e(1, 0, 2, 1); e(-3, -2, 1, 1); e(-2, -1, 1, 1); e(2, -1, 1, 1); e(3, -2, 1, 1); break;
    case 'SAD': e(-3, 0, 1, 1); e(-2, 1, 1, 1); e(2, 1, 1, 1); e(3, 0, 1, 1); break;
    case 'HOPEFUL': e(-3, -1, 2, 2); e(1, -1, 2, 2); g.fillStyle = '#FFFFFF'; e(-3, -1, 1, 1); e(1, -1, 1, 1); break;
    default: e(-3, -1, 2, 2); e(1, -1, 2, 2);
  }
}
function drawNullEye(g, ox, oy, t, col) {
  const cx = ox + 8, cy = oy + 9;
  g.fillStyle = col || '#FF4FA3';
  g.fillRect(cx - 4, cy, 9, 1);
  g.fillStyle = '#FFFFFF';
  g.fillRect(cx - 4 + Math.floor((Math.sin(t * 2) * 0.5 + 0.5) * 8), cy, 1, 1);
}

// ---------------------------------------------------------------- ENEMIGOS ----
Sprites.buildEnemies = function () {
  const E = {};
  const mk = (w, h, fn) => [0, 1].map(f => { const p = new PixelArt(w, h); fn(p, f); p.outline(); const r = p.toCanvas(); return { r, l: flipCanvas(r) }; });
  // BitCorrupt: bloque dentado de bits
  E.bitcorrupt = mk(16, 14, (p, f) => {
    const R = '#FF5964', D = '#A02B38', V = '#AA7DFF', W = '#E8F4F7';
    p.rect(2, 2 + f, 12, 8, D); p.rect(3, 3 + f, 10, 6, R);
    p.px(2, 1 + f, D); p.px(5, 1 + f, D); p.px(9, 1 + f, D); p.px(13, 1 + f, D); p.px(7, 0 + f, R);
    p.rect(9, 4 + f, 2, 2, W); p.px(10, 5 + f, '#050709');
    p.px(4, 5 + f, V); p.px(4, 6 + f, V); p.px(4, 7 + f, V); p.px(6, 5 + f, V); p.px(6, 7 + f, V); p.px(7, 5 + f, V); p.px(7, 6 + f, V); p.px(7, 7 + f, V);
    p.rect(4, 11, 2, 2 - f, D); p.rect(10, 11, 2, 1 + f, D);
  });
  // CacheMiss: fantasma con reloj de arena
  E.cachemiss = mk(16, 16, (p, f) => {
    const B = '#6E8BFF', D = '#3A4DA8', W = '#E8F4F7', A = '#F1B45C';
    p.circle(8, 6, 5, B); p.rect(3, 6, 11, 6, B);
    for (let x = 3; x < 14; x++) if ((x + f) % 3 === 0) p.px(x, 12, B); else p.px(x, 12, null);
    p.rect(3, 10, 11, 1, D);
    p.rect(5, 4, 2, 2, W); p.rect(9, 4, 2, 2, W);
    p.px(7, 7, A); p.px(8, 7, A); p.px(9, 7, A); p.px(8, 8, A); p.px(7, 9, A); p.px(8, 9, A); p.px(9, 9, A);
  });
  // BusError: camioneta de señal con franjas
  E.buserror = mk(20, 13, (p, f) => {
    const A = '#F1B45C', K = '#1A1A22', R = '#FF5964', W = '#E8F4F7';
    p.rect(1, 2, 16, 7, A);
    for (let x = 1; x < 17; x += 4) { p.px(x, 8, K); p.px(x + 1, 8, K); }
    p.rect(13, 3, 3, 3, '#0E3B4A'); p.px(14, 4, W);
    p.px(4, 4, R); p.px(5, 3, R); p.px(6, 4, R); p.px(5, 5, R); p.px(9, 5, R); p.px(10, 6, R); p.px(11, 5, R); p.px(10, 4, R);
    p.rect(3, 10, 3, 2, K); p.rect(12, 10, 3, 2, K); p.px(4 + f, 10, '#6F7C86'); p.px(13 + f, 10, '#6F7C86');
  });
  // OverHeat: chip ardiente
  E.overheat = mk(16, 16, (p, f) => {
    const O = '#FF8A3D', R = '#FF5964', Y = '#FFD166', K = '#3A1A10';
    p.rect(3, 4, 10, 10, K); p.rect(4, 5, 8, 8, R); p.rect(6, 7, 4, 4, O); p.rect(7, 8, 2, 2, Y);
    for (let i = 0; i < 4; i++) { p.px(2, 5 + i * 2, '#6F7C86'); p.px(13, 5 + i * 2, '#6F7C86'); }
    p.px(5 + f, 2, O); p.px(8 - f, 1, Y); p.px(11 + f, 2, O); p.px(7, 3, R);
  });
  E.overheatCool = mk(16, 16, (p, f) => {
    const B = '#45E5FF', D = '#1D5C7A', K = '#0B1A24';
    p.rect(3, 4, 10, 10, K); p.rect(4, 5, 8, 8, D); p.rect(6, 7, 4, 4, B);
    for (let i = 0; i < 4; i++) { p.px(2, 5 + i * 2, '#6F7C86'); p.px(13, 5 + i * 2, '#6F7C86'); }
    p.px(6 + f, 2, '#E8F4F7');
  });
  // Deadlock: candado con ojos
  E.deadlock = mk(16, 16, (p, f) => {
    const G = '#8C8FA8', D = '#4A4C66', V = '#AA7DFF', W = '#E8F4F7';
    p.rect(5, 1, 6, 1, G); p.rect(4, 2, 2, 5, G); p.rect(10, 2, 2, 5, G);
    p.rect(2, 6, 12, 9, D); p.rect(3, 7, 10, 7, G);
    p.rect(5, 9, 2, 2, W); p.rect(9, 9, 2, 2, W); p.px(6 - f, 10, '#050709'); p.px(10 - f, 10, '#050709');
    p.px(7, 12, V); p.px(8, 12, V); p.px(8, 13, V);
  });
  // NullPointer: cursor sin destino
  E.nullpointer = mk(14, 16, (p, f) => {
    const W = '#E8F4F7', V = '#AA7DFF', M = '#FF4FA3';
    const rows = ['#.........', '##........', '#w#.......', '#ww#......', '#www#.....', '#wwww#....', '#wwwww#...', '#wwwwww#..', '#www####..', '#w#w#.....', '##.#w#....', '#...#w#...', '.....##...'];
    p.rows(2, 1, rows, { '#': V, w: f ? W : '#C7A8FF' });
    p.px(10, 13, M); p.px(12, 13, M);
  });
  // PacketStorm: nube de paquetes
  E.packetstorm = mk(22, 16, (p, f) => {
    const K = '#2A2438', D = '#3E3656', C = ['#45E5FF', '#F1B45C', '#71FF9A', '#FF5964'];
    p.circle(7, 7, 5, D); p.circle(13, 6, 6, D); p.circle(17, 9, 4, D); p.rect(4, 8, 16, 5, D);
    p.rect(5, 9, 14, 3, K);
    for (let i = 0; i < 6; i++) p.rect(4 + i * 3, 3 + ((i + f) % 3) * 2, 2, 2, C[i % 4]);
    p.rect(8, 13, 6, 2, K); p.px(10 + f, 14, '#FF5964');
  });
  // Dron de entrenamiento
  E.drone = mk(14, 12, (p, f) => {
    const G = '#6F7C86', C = '#45E5FF', D = '#3A444C';
    p.circle(7, 6, 4, G); p.rect(5, 5, 5, 3, D); p.px(7, 6, C);
    p.rect(0, 2 + f, 4, 1, D); p.rect(10, 2 + f, 4, 1, D); p.px(2, 3, G); p.px(11, 3, G);
  });
  Sprites.enemies = E;
};

// ---------------------------------------------------------------- NPCs ----
Sprites.buildNPCs = function () {
  const N = {};
  const mk = (w, h, fn) => [0, 1].map(f => { const p = new PixelArt(w, h); fn(p, f); p.outline(); const r = p.toCanvas(); return { r, l: flipCanvas(r) }; });
  N.REG = mk(14, 16, (p, f) => {
    const A = '#F1B45C', D = '#A8702C', K = '#1A1206', W = '#E8F4F7';
    p.rect(2, 3 + f, 10, 8, A); p.rect(2, 10 + f, 10, 1, D);
    for (let i = 0; i < 4; i++) { p.px(1, 4 + i * 2 + f, D); p.px(12, 4 + i * 2 + f, D); }
    p.rect(4, 5 + f, 2, 2, W); p.rect(8, 5 + f, 2, 2, W); p.px(5, 6 + f, K); p.px(9, 6 + f, K);
    p.rect(5, 8 + f, 4, 1, K);
    p.rect(4, 12, 1, 3, D); p.rect(9, 12, 1, 3, D); p.px(3 + f, 15, D); p.px(10 - f, 15, D);
  });
  N.CACHE = mk(16, 20, (p, f) => {
    const G = '#5E7FA3', D = '#3A5270', W = '#E8F4F7', A = '#F1B45C';
    p.rect(3, 6, 10, 12, G); for (let i = 0; i < 3; i++) { p.rect(4, 7 + i * 4, 8, 3, D); p.px(8, 8 + i * 4, A); }
    p.rect(4, 1, 8, 5, G); p.rect(5, 2, 6, 3, '#0B1620'); p.rect(6, 3, 2, 1, W); p.rect(9, 2, 2, 2, A); p.px(10, 3, W);
    p.rect(3, 18, 3, 2, D); p.rect(10, 18, 3, 2, D); p.px(2, 9 + f, G); p.px(13, 9 - f, G);
  });
  N.BUS = mk(16, 20, (p, f) => {
    const B = '#2E86AB', D = '#1B4F66', C = '#F1B45C', S = '#E8F4F7', K = '#050709';
    p.rect(4, 1, 8, 2, C); p.rect(3, 3, 11, 1, C);
    p.rect(4, 4, 8, 6, '#9FB3BD'); p.rect(5, 5, 6, 3, '#0B1620'); p.px(6, 6, '#45E5FF'); p.px(9, 6, '#45E5FF');
    p.rect(4, 10, 8, 6, B); p.rect(11, 11, 3, 4, '#A8702C'); p.rect(4, 15, 8, 1, D);
    p.rect(5, 16, 2, 3 - f, D); p.rect(9, 16, 2, 2 + f, D); p.px(5, 19 - f, K); p.px(9, 18 + f, K); p.px(2, 11, S);
  });
  N.IO = mk(16, 20, (p, f) => {
    const P = '#7A5BA8', D = '#4A3A6A', A = '#71FF9A', W = '#E8F4F7';
    p.px(8, 0, A); p.rect(8, 1, 1, 2, '#6F7C86');
    p.rect(4, 3, 8, 6, '#9FB3BD'); p.rect(5, 4, 6, 4, '#0B1620'); p.rect(6, 5, 1, 1 + f, A); p.rect(9, 5, 1, 1 + f, A);
    p.rect(3, 4, 1, 4, '#3A444C'); p.rect(12, 4, 1, 4, '#3A444C'); p.px(11, 8, '#3A444C');
    p.rect(4, 9, 8, 7, P); p.rect(5, 11, 6, 2, D); p.px(6, 11, A); p.px(8, 11, '#FF5964'); p.px(10, 11, '#F1B45C');
    p.rect(5, 16, 2, 4, D); p.rect(9, 16, 2, 4, D); p.px(2 + f, 10, W);
  });
  N.VOLT = mk(16, 20, (p, f) => {
    const Y = '#FFD166', O = '#A8702C', G = '#3A5A40', W = '#E8F4F7';
    p.rect(3, 2, 10, 3, Y); p.rect(2, 4, 12, 1, Y);
    p.rect(4, 5, 8, 5, '#C9A27E'); p.rect(5, 6, 2, 1, '#050709'); p.rect(9, 6, 2, 1, '#050709'); p.rect(6, 8, 4, 1, O);
    p.rect(3, 10, 10, 6, G); p.px(7, 11, Y); p.px(8, 12, Y); p.px(7, 13, Y); p.px(8, 14, Y);
    p.rect(4, 16, 3, 4, '#2A3A30'); p.rect(9, 16, 3, 4, '#2A3A30'); p.px(2, 11 + f, W);
  });
  N.PROC = ['#45E5FF', '#71FF9A', '#F1B45C', '#AA7DFF', '#FF8A3D'].map(col => mk(10, 12, (p, f) => {
    p.rect(2, 1 + f, 6, 8, col); p.rect(2, 1 + f, 6, 1, shade(col, 1.3)); p.px(3, 3 + f, '#050709'); p.px(6, 3 + f, '#050709');
    p.rect(3, 9, 1, 2, shade(col, 0.6)); p.rect(6, 9, 1, 2, shade(col, 0.6));
  }));
  Sprites.npcs = N;
};

// ---------------------------------------------------------------- OBJETOS ----
Sprites.buildObjects = function () {
  const O = {};
  const one = (w, h, fn, noOutline) => { const p = new PixelArt(w, h); fn(p); if (!noOutline) p.outline(); return p.toCanvas(); };
  O.terminal = one(16, 18, p => {
    p.rect(1, 1, 14, 11, '#3A444C'); p.rect(2, 2, 12, 9, '#0B1620');
    p.rect(6, 12, 4, 3, '#3A444C'); p.rect(3, 15, 10, 2, '#6F7C86'); p.rect(3, 15, 10, 1, '#A9B6BE');
  });
  O.checkpoint = one(12, 26, p => {
    p.rect(3, 8, 6, 16, '#3A444C'); p.rect(4, 8, 1, 16, '#6F7C86'); p.rect(2, 22, 8, 3, '#6F7C86'); p.rect(1, 24, 10, 2, '#3A444C');
    p.rect(2, 6, 8, 2, '#6F7C86'); p.rect(3, 1, 6, 5, '#0B1620');
  });
  O.fragment = [0, 1, 2].map(f => one(10, 12, p => {
    const w = [3, 2, 1][f];
    for (let y = 0; y < 10; y++) {
      const hw = y < 5 ? Math.ceil((y + 1) * w / 3) : Math.ceil((10 - y) * w / 3);
      for (let x = -hw; x <= hw - 1; x++) p.px(5 + x, y + 1, x < 0 ? '#F1B45C' : '#FFD166');
    }
    p.px(5 - Math.max(0, w - 2), 3, '#FFFFFF');
  }));
  O.lever = [0, 1].map(on => one(10, 14, p => {
    p.rect(1, 10, 8, 3, '#3A444C'); p.rect(2, 10, 6, 1, '#6F7C86');
    const tipx = on ? 7 : 2;
    for (let i = 0; i < 6; i++) p.px(Math.round(lerp(5, tipx, i / 5)), 9 - i, '#A9B6BE');
    p.rect(tipx - 1, 2, 3, 2, on ? '#71FF9A' : '#FF5964');
  }));
  O.plate = [0, 1].map(on => one(18, 6, p => {
    p.rect(1, 3, 16, 2, '#3A444C'); p.rect(3, on ? 2 : 1, 12, on ? 1 : 2, on ? '#71FF9A' : '#A9B6BE');
  }));
  O.linknode = one(12, 16, p => {
    p.rect(4, 5, 4, 10, '#3A444C'); p.rect(2, 13, 8, 2, '#6F7C86'); p.circle(6, 4, 3, '#1D5C7A'); p.rect(5, 3, 2, 2, '#0B1620');
  });
  O.fan = [0, 1, 2].map(f => one(18, 18, p => {
    p.circle(9, 9, 7, '#3A444C'); p.circle(9, 9, 6, '#0B1620');
    const a0 = f * Math.PI / 6;
    for (let k = 0; k < 3; k++) {
      const a = a0 + k * Math.PI * 2 / 3;
      for (let r = 1; r < 6; r++) { p.px(9 + Math.round(Math.cos(a) * r), 9 + Math.round(Math.sin(a) * r), '#A9B6BE'); p.px(9 + Math.round(Math.cos(a + 0.35) * r), 9 + Math.round(Math.sin(a + 0.35) * r), '#6F7C86'); }
    }
    p.px(9, 9, '#45E5FF');
  }));
  O.socket = one(20, 10, p => {
    p.rect(0, 4, 20, 6, '#3A444C'); p.rect(1, 4, 18, 1, '#6F7C86'); p.rect(4, 2, 12, 3, '#0B1620'); p.rect(5, 3, 10, 1, '#1D5C7A');
  });
  O.block = { INPUT: '#45E5FF', PROCESS: '#71FF9A', MEMORY: '#AA7DFF', OUTPUT: '#F1B45C', INSTR: '#FFD166', DIMM: '#71FF9A', PACKET: '#45E5FF', LOG: '#F1B45C' };
  O.blockSprites = {};
  for (const k in O.block) {
    const col = O.block[k];
    O.blockSprites[k] = one(16, 14, p => {
      p.rect(1, 1, 14, 12, shade(col, 0.45)); p.rect(2, 2, 12, 10, shade(col, 0.7)); p.rect(2, 2, 12, 1, col);
      // iconos
      const I = (rows) => p.rows(4, 4, rows, { '#': col, w: '#E8F4F7' });
      if (k === 'INPUT') I(['########', '#w#w#w##', '########', '..####..']);
      else if (k === 'PROCESS') I(['.######.', '##w##w##', '.######.', '##w##w##', '.######.']);
      else if (k === 'MEMORY') I(['########', '#w#w#w##', '########', '#.#.#.#.']);
      else if (k === 'OUTPUT') I(['########', '#wwwwww#', '#wwwwww#', '########', '...##...']);
      else if (k === 'INSTR') I(['##.#.##.', '.#.#.#..', '##.#.##.', '.#.#.#..']);
      else if (k === 'DIMM') I(['########', '#w#w#w##', '#w#w#w##', '#.#.#.#.']);
      else if (k === 'PACKET') I(['########', '#w....w#', '#.w..w.#', '########']);
      else I(['#wwwww..', '#.......', '#wwww...', '#.......', '#www....']);
    });
  }
  O.historic = one(16, 20, p => {
    p.rect(1, 2, 14, 12, '#5A4A3A'); p.rect(2, 3, 12, 10, '#0B1206'); p.rect(0, 14, 16, 5, '#5A4A3A'); p.rect(1, 15, 14, 1, '#8A7A5A');
    for (let i = 0; i < 5; i++) p.px(3 + i * 2, 17, '#2A2218');
  });
  Sprites.objects = O;
};

// ---------------------------------------------------------------- RETRATOS (32x32) ----
const PORTRAIT_CACHE = new Map();
function portraitByte(p, emo) {
  const C = BYTE_COL;
  p.rect(0, 0, 32, 32, '#0E2230');
  // cuello y sudadera
  p.rect(6, 26, 20, 6, C.hood); p.rect(6, 26, 20, 1, C.hoodHi); p.rect(15, 27, 2, 5, C.trim); p.rect(8, 25, 16, 2, C.hoodSh);
  // cara
  p.rect(9, 9, 14, 15, C.skin); p.rect(10, 24, 12, 1, C.skinSh); p.rect(9, 20, 1, 4, C.skinSh);
  p.rect(7, 13, 2, 4, C.skinSh); p.rect(23, 13, 2, 4, C.skinSh);
  // pelo
  p.rect(8, 3, 16, 7, C.hair); p.rect(7, 5, 2, 10, C.hair); p.rect(23, 5, 2, 9, C.hair);
  p.px(11, 2, C.hair); p.px(12, 2, C.hairHi); p.px(16, 1, C.hair); p.px(17, 2, C.hair); p.px(21, 2, C.hair);
  p.rect(10, 4, 6, 1, C.hairHi); p.rect(9, 10, 5, 2, C.hair); p.rect(18, 10, 3, 1, C.hair);
  // visor subido en la frente
  p.rect(8, 7, 16, 3, C.visorD); p.rect(9, 8, 14, 1, C.visor); p.px(20, 8, '#FFFFFF');
  // ojos según emoción
  const eye = (x, y, open) => { if (open === 2) { p.rect(x, y, 3, 3, '#FFFFFF'); p.rect(x + 1, y + 1, 2, 2, '#1A1A2E'); } else if (open) { p.rect(x, y, 3, 2, '#FFFFFF'); p.rect(x + 1, y, 2, 2, '#1A1A2E'); } else p.rect(x, y + 1, 3, 1, '#1A1A2E'); };
  const brow = (x, y, tilt) => { p.px(x, y + (tilt > 0 ? 1 : 0), C.hair); p.px(x + 1, y, C.hair); p.px(x + 2, y + (tilt < 0 ? 1 : 0), C.hair); };
  const mouth = (kind) => {
    const K = '#7A3B3B';
    if (kind === 'smile') { p.px(13, 20, K); p.rect(14, 21, 4, 1, K); p.px(18, 20, K); }
    else if (kind === 'open') { p.rect(14, 20, 4, 3, K); p.rect(15, 21, 2, 1, '#E8F4F7'); }
    else if (kind === 'frown') { p.px(13, 22, K); p.rect(14, 21, 4, 1, K); p.px(18, 22, K); }
    else if (kind === 'flat') p.rect(14, 21, 4, 1, K);
    else if (kind === 'small') p.rect(15, 21, 2, 1, K);
    else p.rect(14, 21, 3, 1, K);
  };
  switch (emo) {
    case 'happy': eye(12, 15, 0); eye(18, 15, 0); p.px(12, 15, '#1A1A2E'); p.px(14, 15, '#1A1A2E'); p.px(18, 15, '#1A1A2E'); p.px(20, 15, '#1A1A2E'); mouth('smile'); break;
    case 'laugh': eye(12, 15, 0); eye(18, 15, 0); mouth('open'); break;
    case 'surprised': eye(12, 14, 2); eye(18, 14, 2); brow(12, 12, 0); brow(18, 12, 0); mouth('open'); break;
    case 'sad': eye(12, 16, 1); eye(18, 16, 1); brow(12, 14, 1); brow(18, 14, -1); mouth('frown'); break;
    case 'guilty': eye(12, 17, 0); eye(18, 17, 0); brow(12, 14, 1); brow(18, 14, -1); mouth('small'); break;
    case 'angry': eye(12, 15, 1); eye(18, 15, 1); brow(12, 13, -1); brow(18, 13, 1); mouth('frown'); break;
    case 'determined': eye(12, 15, 1); eye(18, 15, 1); brow(12, 13, -1); brow(18, 13, 1); mouth('flat'); break;
    case 'worried': eye(12, 15, 1); eye(18, 15, 1); brow(12, 13, 1); brow(18, 13, -1); mouth('small'); break;
    case 'thinking': eye(12, 15, 1); eye(18, 14, 1); brow(18, 12, 0); mouth('flat'); break;
    default: eye(12, 15, 1); eye(18, 15, 1); mouth('');
  }
}
function portraitShell(p, pal, broken, scale) {
  p.rect(0, 0, 32, 32, broken ? '#140A1E' : '#08202A');
  const cx = 16, cy = 17;
  p.circle(cx, cy, 12, pal.shell);
  for (let y = -12; y <= 12; y++) for (let x = -12; x <= 12; x++) {
    if (!p.get(cx + x, cy + y) || p.get(cx + x, cy + y) !== pal.shell) continue;
    if (x + y > 11) p.px(cx + x, cy + y, pal.sh); else if (x + y < -13) p.px(cx + x, cy + y, pal.hi);
  }
  p.rect(cx - 8, cy - 6, 17, 12, pal.screen); p.rect(cx - 7, cy - 7, 15, 1, pal.screen); p.rect(cx - 7, cy + 6, 15, 1, pal.screen);
  if (!broken) { p.rect(cx, 1, 1, 4, pal.ant); p.px(cx - 1, 1, pal.tip); p.px(cx + 1, 1, pal.tip); p.px(cx - 2, 0, pal.tip); p.px(cx + 2, 0, pal.tip); }
  else {
    p.rect(cx + 2, 1, 1, 4, pal.ant); p.px(cx + 4, 0, pal.tip);
    const holes = [[-11, -3], [-12, 0], [-11, 2], [-10, 3], [9, 8], [10, 6], [4, 11], [-4, -12], [12, -3], [-8, 9], [7, -10]];
    for (const [x, y] of holes) { p.px(cx + x, cy + y, null); p.px(cx + x + 1, cy + y, pal.crack); }
  }
}
function portraitEyes(p, emo, col) {
  const cx = 16, cy = 17;
  const e = (x, y, w, h, c) => p.rect(cx + x, cy + y, w, h, c || col);
  switch (emo) {
    case 'HAPPY': e(-6, 0, 2, 2); e(-4, -2, 2, 2); e(-2, 0, 2, 2); e(2, 0, 2, 2); e(4, -2, 2, 2); e(6, 0, 2, 2); break;
    case 'CURIOUS': e(-6, -2, 4, 4); e(2, -4, 5, 6); break;
    case 'WORRIED': e(-6, 0, 4, 3); e(2, 0, 4, 3); e(-6, -3, 2, 1); e(-4, -4, 2, 1); e(4, -4, 2, 1); e(6, -3, 1, 1); break;
    case 'AFRAID': e(-6, 0, 2, 2); e(5, 0, 2, 2); break;
    case 'GUILTY': e(-7, 2, 4, 2); e(1, 2, 4, 2); break;
    case 'ANGRY': e(-6, 0, 4, 2, '#FF5964'); e(2, 0, 4, 2, '#FF5964'); e(-6, -3, 2, 1, '#FF5964'); e(-4, -2, 2, 1, '#FF5964'); e(4, -2, 2, 1, '#FF5964'); e(6, -3, 2, 1, '#FF5964'); break;
    case 'SAD': e(-6, 0, 2, 1); e(-4, 1, 2, 1); e(4, 1, 2, 1); e(6, 0, 2, 1); break;
    case 'HOPEFUL': e(-6, -2, 4, 4); e(2, -2, 4, 4); e(-6, -2, 1, 1, '#FFFFFF'); e(2, -2, 1, 1, '#FFFFFF'); break;
    default: e(-6, -2, 4, 4); e(2, -2, 4, 4);
  }
}
function portraitNPC(p, id) {
  const bgc = { REG: '#2A1E08', CACHE: '#101C2A', BUS: '#0C1C24', IO: '#1A1026', VOLT: '#1A1A08' }[id] || '#101820';
  p.rect(0, 0, 32, 32, bgc);
  const spr = { REG: ['#F1B45C', '#A8702C'], CACHE: ['#5E7FA3', '#3A5270'], BUS: ['#2E86AB', '#F1B45C'], IO: ['#7A5BA8', '#71FF9A'], VOLT: ['#3A5A40', '#FFD166'] }[id] || ['#6F7C86', '#E8F4F7'];
  p.rect(6, 8, 20, 18, spr[0]); p.rect(6, 24, 20, 2, shade(spr[0], 0.6));
  p.rect(9, 12, 5, 5, '#E8F4F7'); p.rect(18, 12, 5, 5, '#E8F4F7'); p.rect(11, 14, 2, 2, '#050709'); p.rect(20, 14, 2, 2, '#050709');
  p.rect(12, 20, 8, 2, shade(spr[0], 0.4));
  if (id === 'REG') { for (let i = 0; i < 5; i++) { p.rect(3, 9 + i * 3, 3, 1, spr[1]); p.rect(26, 9 + i * 3, 3, 1, spr[1]); } }
  if (id === 'CACHE') { p.rect(17, 11, 7, 7, spr[1]); p.rect(18, 12, 5, 5, '#E8F4F7'); p.rect(20, 14, 2, 2, '#050709'); p.rect(6, 4, 20, 4, spr[1]); }
  if (id === 'BUS') { p.rect(5, 4, 22, 5, spr[1]); p.rect(3, 8, 26, 2, spr[1]); }
  if (id === 'IO') { p.rect(15, 1, 2, 7, '#6F7C86'); p.rect(14, 0, 4, 2, spr[1]); p.rect(3, 12, 3, 8, '#3A444C'); p.rect(26, 12, 3, 8, '#3A444C'); }
  if (id === 'VOLT') { p.rect(4, 4, 24, 5, spr[1]); p.rect(2, 8, 28, 2, spr[1]); p.px(15, 22, spr[1]); p.px(16, 23, spr[1]); }
}
function portraitTerminal(p, label, col) {
  p.rect(0, 0, 32, 32, '#060C10');
  p.rect(3, 4, 26, 20, '#3A444C'); p.rect(5, 6, 22, 16, '#02080A');
  p.rect(8, 26, 16, 3, '#3A444C');
  for (let y = 7; y < 22; y += 2) p.rect(5, y, 22, 1, '#051418');
  p.rect(7, 16, 4, 2, col); p.rect(12, 16, 2, 2, col);
}
function getPortrait(id, emo) {
  const key = id + ':' + (emo || '');
  if (PORTRAIT_CACHE.has(key)) return PORTRAIT_CACHE.get(key);
  const p = new PixelArt(32, 32);
  let eyesAfter = null;
  switch (id) {
    case 'BYTE': portraitByte(p, emo || 'neutral'); break;
    case 'NEXO': {
      const pal = emo === 'ANGRY' ? NEXO_ANGRY : (emo === 'SAD' || emo === 'GUILTY') ? NEXO_DIM : NEXO_PAL;
      portraitShell(p, pal, false); portraitEyes(p, emo || 'NEUTRAL', '#9FF6FF'); break;
    }
    case 'NULL': portraitShell(p, NULL_PAL, true); p.rect(8, 17, 17, 2, '#FF4FA3'); p.rect(20, 17, 2, 2, '#FFFFFF'); break;
    case 'NEXUS': {
      portraitShell(p, NEXUS_PAL, false);
      for (let y = 0; y < 32; y++) for (let x = 17; x < 32; x++) { const c = p.get(x, y); if (c === NEXUS_PAL.shell) p.px(x, y, '#8A63D9'); else if (c === NEXUS_PAL.hi) p.px(x, y, '#C7A8FF'); }
      for (let y = 6; y < 29; y++) if (p.get(16, y) && p.get(16, y) !== NEXUS_PAL.screen) p.px(16, y, '#FFD166');
      p.rect(9, 15, 4, 4, '#9FF6FF'); p.rect(18, 17, 7, 1, '#FF4FA3');
      if (emo === 'HAPPY') { p.rect(9, 15, 4, 4, NEXUS_PAL.screen); p.rect(9, 17, 1, 1, '#9FF6FF'); p.rect(10, 16, 2, 1, '#9FF6FF'); p.rect(12, 17, 1, 1, '#9FF6FF'); }
      break;
    }
    case 'SYS': portraitTerminal(p, '>', '#71FF9A'); break;
    case 'TERMINAL': portraitTerminal(p, '>', '#A9B6BE'); break;
    case 'LOG': portraitTerminal(p, '>', '#F1B45C'); break;
    case 'ARCHIVO': portraitTerminal(p, '>', '#C8B890'); break;
    case 'CASCADE': {
      p.rect(0, 0, 32, 32, '#12040A');
      for (let i = 0; i < 40; i++) { const x = (i * 7) % 30, y = (i * 11) % 30; p.rect(x, y, 3, 2, ['#FF5964', '#AA7DFF', '#E8F4F7'][i % 3]); }
      break;
    }
    default: portraitNPC(p, id);
  }
  p.outline('#000000');
  const c = p.toCanvas();
  PORTRAIT_CACHE.set(key, c);
  return c;
}
Sprites.init = function () {
  Sprites.buildByte(0);
  Sprites.buildCompanions();
  Sprites.buildEnemies();
  Sprites.buildNPCs();
  Sprites.buildObjects();
};
