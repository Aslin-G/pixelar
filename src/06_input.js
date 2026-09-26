// =============================================================================
// INPUT — teclado (reasignable), gamepad opcional, puntero y controles táctiles
// =============================================================================
const DEFAULT_BINDINGS = {
  left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'], up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'],
  jump: ['Space'], interact: ['KeyE'], ability: ['KeyQ'], attack: ['KeyJ', 'KeyX'], nextAbility: ['Tab', 'KeyR'],
  blueprint: ['KeyB'], codex: ['KeyC'], hint: ['KeyH'], pause: ['Escape', 'KeyP'],
  confirm: ['Enter', 'Space', 'KeyE'], cancel: ['Escape', 'Backspace'], submit: ['KeyV'], skip: ['Tab'],
  quests: ['KeyL']
};
const ACTION_LABELS = {
  left: 'Izquierda', right: 'Derecha', up: 'Arriba / subir', down: 'Abajo / bajar', jump: 'Saltar', interact: 'Interactuar',
  ability: 'Habilidad', attack: 'Ataque (Debug Ping)', nextAbility: 'Cambiar habilidad', blueprint: 'Blueprint', codex: 'Codex',
  hint: 'Pista', pause: 'Pausa'
};
const REMAPPABLE = ['left', 'right', 'up', 'down', 'jump', 'interact', 'ability', 'attack', 'nextAbility', 'blueprint', 'codex', 'hint', 'pause'];

const Input = {
  bind: JSON.parse(JSON.stringify(DEFAULT_BINDINGS)),
  keys: new Set(), pressedKeys: new Set(), repeatKeys: new Set(),
  pad: { held: {}, prev: {}, pressed: {} },
  pointer: { x: 0, y: 0, down: false, clicked: false, moved: false, active: false },
  touch: { enabled: false, held: {}, pressed: {}, ids: new Map() },
  anyPressed: false, lastKey: null, captureCb: null, usingPad: false,
  init(canvas) {
    this.canvas = canvas;
    window.addEventListener('keydown', e => {
      if (this.captureCb) { e.preventDefault(); const cb = this.captureCb; this.captureCb = null; cb(e.code); return; }
      const block = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Backspace'];
      if (block.includes(e.code)) e.preventDefault();
      if (!e.repeat) { this.keys.add(e.code); this.pressedKeys.add(e.code); this.anyPressed = true; this.lastKey = e.code; }
      this.repeatKeys.add(e.code);
      this.usingPad = false;
      AudioSys.unlock();
    });
    window.addEventListener('keyup', e => { this.keys.delete(e.code); });
    window.addEventListener('blur', () => { this.keys.clear(); });
    const toLocal = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
    };
    canvas.addEventListener('pointerdown', e => {
      AudioSys.unlock();
      const p = toLocal(e);
      if (e.pointerType === 'touch') {
        this.touch.enabled = true;
        const b = this.touchButtonAt(p.x, p.y);
        if (b) { this.touch.ids.set(e.pointerId, b); this.touch.held[b] = true; this.touch.pressed[b] = true; e.preventDefault(); return; }
      }
      this.pointer.x = p.x; this.pointer.y = p.y; this.pointer.down = true; this.pointer.clicked = true; this.pointer.active = true;
      this.anyPressed = true;
    });
    canvas.addEventListener('pointermove', e => {
      const p = toLocal(e);
      if (e.pointerType === 'touch' && this.touch.ids.has(e.pointerId)) {
        const old = this.touch.ids.get(e.pointerId), b = this.touchButtonAt(p.x, p.y);
        if (b !== old) { this.touch.held[old] = false; if (b) { this.touch.held[b] = true; this.touch.pressed[b] = true; this.touch.ids.set(e.pointerId, b); } }
        return;
      }
      if (Math.abs(p.x - this.pointer.x) > 0.5 || Math.abs(p.y - this.pointer.y) > 0.5) this.pointer.moved = true;
      this.pointer.x = p.x; this.pointer.y = p.y; this.pointer.active = true;
    });
    const up = e => {
      if (this.touch.ids.has(e.pointerId)) { this.touch.held[this.touch.ids.get(e.pointerId)] = false; this.touch.ids.delete(e.pointerId); return; }
      this.pointer.down = false;
    };
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  },
  // Botones táctiles en coordenadas internas
  TOUCH_BTNS: [
    { id: 'left', x: 8, y: 214, w: 40, h: 44, label: '◀' }, { id: 'right', x: 52, y: 214, w: 40, h: 44, label: '▶' },
    { id: 'up', x: 30, y: 168, w: 40, h: 40, label: '▲' },
    { id: 'jump', x: 428, y: 214, w: 44, h: 44, label: 'SALTO' }, { id: 'attack', x: 380, y: 222, w: 40, h: 36, label: 'PING' },
    { id: 'interact', x: 428, y: 170, w: 44, h: 38, label: 'E' }, { id: 'ability', x: 380, y: 178, w: 40, h: 36, label: 'Q' },
    { id: 'nextAbility', x: 380, y: 140, w: 40, h: 30, label: 'HAB' }, { id: 'pause', x: 436, y: 4, w: 40, h: 22, label: 'II' },
    { id: 'hint', x: 392, y: 4, w: 40, h: 22, label: 'H' }
  ],
  touchButtonAt(x, y) {
    if (!this.touch.enabled || !this.touchGameplay) return null;
    for (const b of this.TOUCH_BTNS) if (x >= b.x && y >= b.y && x < b.x + b.w && y < b.y + b.h) return b.id;
    return null;
  },
  pollPad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = pads && Array.from(pads).find(p => p && p.connected);
    const prev = this.pad.held; const held = {};
    if (gp) {
      const b = i => gp.buttons[i] && gp.buttons[i].pressed;
      const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
      held.left = ax < -0.5 || b(14); held.right = ax > 0.5 || b(15); held.up = ay < -0.5 || b(12); held.down = ay > 0.5 || b(13);
      held.jump = b(0); held.confirm = b(0); held.cancel = b(1); held.attack = b(2); held.interact = b(3);
      held.nextAbility = b(5) || b(4); held.ability = b(7) || b(6); held.pause = b(9); held.blueprint = b(8); held.hint = b(10) || b(11);
      if (Object.values(held).some(Boolean)) { this.usingPad = true; AudioSys.unlock(); }
    }
    const pressed = {};
    for (const k in held) if (held[k] && !prev[k]) { pressed[k] = true; this.anyPressed = true; }
    this.pad.held = held; this.pad.pressed = pressed;
  },
  held(a) {
    const ks = this.bind[a];
    if (ks) for (const k of ks) if (this.keys.has(k)) return true;
    return !!(this.pad.held[a] || this.touch.held[a]);
  },
  pressed(a) {
    const ks = this.bind[a];
    if (ks) for (const k of ks) if (this.pressedKeys.has(k)) return true;
    if (a === 'confirm' && this.touch.pressed.jump) return true;
    return !!(this.pad.pressed[a] || this.touch.pressed[a]);
  },
  // Navegación de menús con autorepetición
  nav(a) {
    const ks = this.bind[a];
    if (ks) for (const k of ks) if (this.repeatKeys.has(k)) return true;
    return !!(this.pad.pressed[a] || this.touch.pressed[a]);
  },
  keyPressed(code) { return this.pressedKeys.has(code); },
  endFrame() {
    this.pressedKeys.clear(); this.repeatKeys.clear(); this.anyPressed = false;
    this.pointer.clicked = false; this.pointer.moved = false;
    this.touch.pressed = {};
  },
  keyName(code) {
    if (!code) return '?';
    const map = { Space: 'ESPACIO', Escape: 'ESC', Enter: 'ENTER', Tab: 'TAB', Backspace: 'RETROCESO', ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', ShiftLeft: 'SHIFT', ShiftRight: 'SHIFT', ControlLeft: 'CTRL' };
    if (map[code]) return map[code];
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    return code.toUpperCase();
  },
  label(a) { return this.keyName((this.bind[a] || [])[0]); },
  remap(action, code) {
    // el código nuevo pasa a ser el primario; se elimina de otras acciones de juego para evitar choques
    for (const k of REMAPPABLE) if (k !== action) this.bind[k] = this.bind[k].filter(c => c !== code);
    const rest = this.bind[action].filter(c => c !== code);
    this.bind[action] = [code].concat(rest.slice(0, 1));
  },
  resetBindings() { this.bind = JSON.parse(JSON.stringify(DEFAULT_BINDINGS)); }
};
