'use strict';
/* =============================================================================
   BYTE: ARCHITECT QUEST — Ecos de la Máquina
   Motor propio: Canvas 2D + JavaScript Vanilla + Web Audio. Sin assets externos.
   Todo el código vive en un único HTML; internamente se organiza en módulos.
   ============================================================================= */

// ---------- Constantes globales ----------
const W = 480, H = 270, TS = 16;
const SAVE_VERSION = 1;

const PAL = {
  bg: '#071018', navy: '#102434', tech: '#1D5C7A', cyan: '#45E5FF', green: '#71FF9A',
  amber: '#F1B45C', red: '#FF5964', violet: '#AA7DFF', white: '#E8F4F7', gray: '#6F7C86', black: '#050709',
  cyanD: '#1F8FA8', greenD: '#2E9A5C', amberD: '#A8702C', redD: '#A02B38', violetD: '#5E3F9E',
  gold: '#FFD166', grayD: '#3A444C', grayL: '#A9B6BE', magenta: '#FF4FA3', orange: '#FF8A3D',
  panel: '#0B1620', panelL: '#132634', panelB: '#1D3A4F', ink: '#050709', blue: '#3D7BFF'
};
// Colores de buses: datos, direcciones, control
const BUS_COL = ['#45E5FF', '#F1B45C', '#71FF9A'];
const BUS_NAME = ['DATOS', 'DIRECCIONES', 'CONTROL'];

// ---------- Utilidades matemáticas ----------
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const approach = (v, t, d) => (v < t ? Math.min(v + d, t) : Math.max(v - d, t));
const sign = v => (v > 0 ? 1 : v < 0 ? -1 : 0);
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const easeOut = t => 1 - (1 - t) * (1 - t) * (1 - t);
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
function shuffleNotIdentity(arr) {
  if (arr.length < 2) return arr.slice();
  let a;
  let tries = 0;
  do { a = shuffle(arr); tries++; } while (tries < 20 && a.every((v, i) => v === arr[i]));
  return a;
}
function mulberry32(seed) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash2(x, y) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
function fmtTime(s) {
  s = Math.floor(s);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  const p = n => (n < 10 ? '0' + n : '' + n);
  return h > 0 ? h + ':' + p(m) + ':' + p(ss) : p(m) + ':' + p(ss);
}
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r, g, b) {
  return '#' + ((1 << 24) | (clamp(r | 0, 0, 255) << 16) | (clamp(g | 0, 0, 255) << 8) | clamp(b | 0, 0, 255)).toString(16).slice(1);
}
function shade(hex, f) { // f < 1 oscurece, f > 1 aclara
  const [r, g, b] = hexToRgb(hex);
  if (f <= 1) return rgbToHex(r * f, g * f, b * f);
  const k = f - 1;
  return rgbToHex(r + (255 - r) * k, g + (255 - g) * k, b + (255 - b) * k);
}
function mix(h1, h2, t) {
  const a = hexToRgb(h1), b = hexToRgb(h2);
  return rgbToHex(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t));
}

// ---------- Canvas ----------
function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0);
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  return { c, g };
}

// ---------- Tareas para el sistema de scripts (corutinas con generadores) ----------
const Task = {
  wait(t) { let e = 0; return { update(dt) { e += dt; }, done() { return e >= t; } }; },
  frame() { let n = 0; return { update() { n++; }, done() { return n >= 1; } }; },
  until(fn) { return { update() {}, done: fn }; },
  signal() {
    return {
      _d: false, result: undefined,
      update() {}, done() { return this._d; },
      finish(r) { this._d = true; this.result = r; }
    };
  }
};

class ScriptRunner {
  constructor() { this.threads = []; }
  run(genFn, opts = {}) {
    const it = typeof genFn === 'function' ? genFn() : genFn;
    const th = { it, wait: null, blocking: opts.blocking !== false, done: false, name: opts.name || '' };
    this.threads.push(th);
    this.step(th);
    return th;
  }
  step(th) {
    let guard = 0;
    while (!th.done && guard++ < 500) {
      if (th.wait && !th.wait.done()) return;
      let r;
      try {
        r = th.it.next(th.wait ? th.wait.result : undefined);
      } catch (e) {
        console.error('Script error', th.name, e);
        th.done = true;
        return;
      }
      th.wait = null;
      if (r.done) { th.done = true; return; }
      const v = r.value;
      if (v && typeof v.done === 'function') th.wait = v;
      else if (typeof v === 'number') th.wait = Task.wait(v);
      else th.wait = Task.frame();
    }
  }
  update(dt) {
    for (let i = 0; i < this.threads.length; i++) {
      const th = this.threads[i];
      if (th.wait && th.wait.update) th.wait.update(dt);
      this.step(th);
    }
    if (this.threads.some(t => t.done)) this.threads = this.threads.filter(t => !t.done);
  }
  get blocking() { return this.threads.some(t => t.blocking && !t.done); }
  get busy() { return this.threads.length > 0; }
  clear() { this.threads.length = 0; }
}

// ---------- Pool genérico ----------
class Pool {
  constructor(n, make) { this.items = []; for (let i = 0; i < n; i++) this.items.push(make()); this.next = 0; }
  get() {
    for (let k = 0; k < this.items.length; k++) {
      const i = (this.next + k) % this.items.length;
      if (!this.items[i].active) { this.next = (i + 1) % this.items.length; return this.items[i]; }
    }
    const it = this.items[this.next]; this.next = (this.next + 1) % this.items.length; return it;
  }
}

// ---------- Registro de eventos sencillo ----------
const Events = {
  map: {},
  on(k, fn) { (this.map[k] = this.map[k] || []).push(fn); },
  emit(k, a, b) { const l = this.map[k]; if (l) for (const fn of l) { try { fn(a, b); } catch (e) { console.error(e); } } }
};

// Nombres visibles de los conceptos del modelo de dominio
const CONCEPTS = {
  hardwareBasics: 'FUNDAMENTOS', motherboard: 'PLACA BASE', cpu: 'CPU', fetchDecodeExecute: 'CICLO DE INSTRUCCIÓN',
  alu: 'ALU', registers: 'REGISTROS', cache: 'CACHÉ', ram: 'RAM', storage: 'ALMACENAMIENTO', buses: 'BUSES',
  io: 'ENTRADA/SALIDA', interrupts: 'INTERRUPCIONES', performance: 'RENDIMIENTO', parallelism: 'PARALELISMO',
  bottlenecks: 'CUELLOS DE BOTELLA'
};
const CONCEPT_KEYS = Object.keys(CONCEPTS);
// «1 ciclo» / «N ciclos» con separador de miles en español
const cyc = n => n.toLocaleString('es') + (n === 1 ? ' ciclo' : ' ciclos');
