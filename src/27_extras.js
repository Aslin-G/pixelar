// =============================================================================
// EXTRAS DE JUEGO: chips de FIRMWARE (recompensa de los guardianes, con memoria limitada),
// enemigos nuevos (MemoryLeak, Troyano, StackOverflow), BESTIARIO educativo y logros nuevos.
// =============================================================================

// ---------------------------------------------------------------- FIRMWARE ----
// Como en la RAM real, la memoria de firmware es limitada: hay que elegir qué cargar.
const CHIPS = {
  post: { n: 'POST', kb: 2, lv: 0, d: 'Al entrar en un nivel o activar un checkpoint, un escudo absorbe el siguiente golpe.', why: 'El POST (Power-On Self-Test) comprueba el hardware al arrancar para empezar desde un estado seguro.' },
  vrm: { n: 'VRM ESTABLE', kb: 1, lv: 1, d: 'La energía de las habilidades se regenera un 60 % más rápido.', why: 'Un VRM entrega un voltaje estable: más energía útil y menos desperdicio.' },
  pipeline: { n: 'PIPELINE', kb: 2, lv: 2, d: 'DEBUG PING dispara un 60 % más rápido.', why: 'La segmentación solapa etapas: más instrucciones terminadas por segundo.' },
  alu: { n: 'ALU EXTENDIDA', kb: 2, lv: 3, d: 'Los disparos llegan un 40 % más lejos y atraviesan a un enemigo.', why: 'Una ALU más ancha opera con más bits en un solo paso.' },
  prefetch: { n: 'PREFETCH', kb: 1, lv: 4, d: 'Flechas en el borde de la pantalla señalan fragmentos, letras y ecos cercanos.', why: 'La precarga trae a la caché lo que probablemente vas a necesitar pronto.' },
  bus64: { n: 'BUS DE 64 BITS', kb: 3, lv: 5, d: 'DEBUG PING dispara dos proyectiles en paralelo.', why: 'Un bus más ancho transporta más bits en cada transferencia.' },
  watchdog: { n: 'WATCHDOG', kb: 3, lv: 6, d: 'Una vez por nivel, si te quedas sin ♥, te reinicia con 2 ♥.', why: 'Un temporizador watchdog reinicia el sistema cuando deja de responder.' },
  overclock: { n: 'OVERCLOCK', kb: 1, lv: 7, d: '+15 % de velocidad de carrera, pero la energía se regenera un 30 % más despacio.', why: 'Más frecuencia implica más consumo y calor: nada es gratis.' },
  raid: { n: 'RAID 1', kb: 3, lv: 8, d: '+1 ♥ máximo.', why: 'RAID 1 guarda una copia espejo: si una falla, queda la otra.' }
};
const CHIP_ORDER = ['post', 'vrm', 'pipeline', 'alu', 'prefetch', 'bus64', 'watchdog', 'overclock', 'raid'];
const Chips = {
  owned(id) { return !!(PROG && PROG.chips && PROG.chips.includes(id)); },
  on(id) { return !!(PROG && PROG.equip && PROG.equip.includes(id)); },
  cap() { return 3 + (PROG && PROG.chips ? PROG.chips.length : 0); },
  used() { return ((PROG && PROG.equip) || []).reduce((s, k) => s + (CHIPS[k] ? CHIPS[k].kb : 0), 0); },
  maxHp() { return PROG.maxHp + (this.on('raid') ? 1 : 0); },
  grant(id) {
    PROG.chips = PROG.chips || []; PROG.equip = PROG.equip || [];
    if (!PROG.chips.includes(id)) PROG.chips.push(id);
    const c = CHIPS[id];
    if (!PROG.equip.includes(id) && this.used() + c.kb <= this.cap()) { PROG.equip.push(id); UI.toast('CHIP ' + c.n + ' EQUIPADO', PAL.gold); this.apply(id, true); }
    else UI.toast('CHIP ' + c.n + ' — equípalo en PAUSA → FIRMWARE', PAL.gold);
    Achievements.check();
  },
  toggle(id) {
    const c = CHIPS[id];
    if (!this.owned(id)) return false;
    if (this.on(id)) { PROG.equip = PROG.equip.filter(k => k !== id); this.apply(id, false); return true; }
    if (this.used() + c.kb > this.cap()) return false;
    PROG.equip.push(id); this.apply(id, true); return true;
  },
  apply(id, on) {
    const W = Game.world, p = W && W.player;
    if (!p) return;
    if (id === 'raid') { if (on) p.hp = Math.min(this.maxHp(), p.hp + 1); else p.hp = Math.min(this.maxHp(), p.hp); }
    if (id === 'post') p.postShield = on;
  }
};

class FirmwareState {
  constructor() { this.overlay = true; this.sel = 0; this.t = 0; }
  update(dt) {
    this.t += dt;
    const n = CHIP_ORDER.length;
    if (Input.nav('up')) { this.sel = (this.sel + n - 1) % n; AudioSys.play('ui_move'); }
    if (Input.nav('down')) { this.sel = (this.sel + 1) % n; AudioSys.play('ui_move'); }
    const r = this.rects && this.rects.findIndex(b => UI.clicked(b.x, b.y, b.w, b.h));
    if (r != null && r >= 0) { this.sel = r; this.act(); return; }
    if (Input.pressed('confirm')) { this.act(); return; }
    if (Input.pressed('cancel')) { AudioSys.play('ui_back'); Game.pop(); }
  }
  act() {
    const id = CHIP_ORDER[this.sel];
    if (!Chips.owned(id)) { AudioSys.play('ui_back'); return; }
    if (Chips.toggle(id)) { AudioSys.play(Chips.on(id) ? 'link' : 'ui_back'); Game.save(); }
    else { AudioSys.play('wrong'); UI.toast('MEMORIA INSUFICIENTE: quita otro chip primero', PAL.red); }
  }
  render(g) {
    UI.overlayDim(g, 0.86);
    const x = 16, y = 10, w = 448, h = 250;
    UI.panel(g, x, y, w, h, { title: 'FIRMWARE — CHIPS', titleCol: PAL.gold });
    const cap = Chips.cap(), used = Chips.used();
    Font.draw(g, 'MEMORIA DE FIRMWARE', x + 10, y + 7, PAL.grayL);
    for (let i = 0; i < 12; i++) { const bx = x + 134 + i * 12; g.fillStyle = i < used ? PAL.gold : i < cap ? '#3A3020' : '#101418'; g.fillRect(bx, y + 11, 10, 6); if (i < cap) { g.fillStyle = i < used ? '#FFE9A8' : '#5A4A20'; g.fillRect(bx, y + 11, 10, 1); } }
    Font.draw(g, used + ' / ' + cap + ' KB', x + w - 12, y + 7, used >= cap ? PAL.amber : PAL.gold, { align: 'right' });
    this.rects = [];
    CHIP_ORDER.forEach((id, i) => {
      const c = CHIPS[id], own = Chips.owned(id), on = Chips.on(id), foc = i === this.sel, yy = y + 26 + i * 16;
      if (foc) { g.fillStyle = '#2A2410'; g.fillRect(x + 8, yy, w - 16, 15); g.fillStyle = PAL.gold; g.fillRect(x + 8, yy, 2, 15); }
      g.fillStyle = own ? (on ? PAL.gold : '#5A4A20') : '#1A1E22'; g.fillRect(x + 16, yy + 3, 9, 9);
      if (on) Font.draw(g, '✓', x + 20, yy + 1, '#1A1206', { align: 'center' });
      if (own) {
        Font.draw(g, c.n, x + 32, yy + 1, foc ? PAL.white : on ? '#FFE9A8' : PAL.grayL);
        Font.draw(g, c.kb + ' KB', x + 150, yy + 1, PAL.gray);
        Font.draw(g, UI.fit(c.d, 250), x + 186, yy + 1, on ? PAL.grayL : PAL.gray);
      } else Font.draw(g, UI.fit('???  lo guarda el guardián de ' + LEVELS[c.lv].name, 400), x + 32, yy + 1, PAL.grayD);
      this.rects.push({ x: x + 8, y: yy, w: w - 16, h: 15 });
    });
    const id = CHIP_ORDER[this.sel], c = CHIPS[id];
    let ty = y + 26 + CHIP_ORDER.length * 16 + 6;
    g.fillStyle = PAL.panelB; g.fillRect(x + 10, ty - 3, w - 20, 1);
    if (Chips.owned(id)) {
      for (const l of UI.wrap(c.d, w - 24).slice(0, 2)) { Font.draw(g, l, x + 12, ty, PAL.white); ty += 12; }
      for (const l of UI.wrap('Concepto: ' + c.why, w - 24).slice(0, 2)) { Font.draw(g, l, x + 12, ty, PAL.cyan); ty += 12; }
    } else UI.textBlock(g, 'Vence al guardián de ' + LEVELS[c.lv].name + ' para obtener este chip. La capacidad crece 1 KB por cada guardián.', x + 12, ty, w - 24, PAL.gray);
    UI.keyHints(g, [['↑↓', 'Elegir'], [Input.label('interact'), 'Equipar / quitar'], ['ESC', 'Volver']], W / 2, y + h - 14, 'center');
  }
}

// ---------------------------------------------------------------- ENEMIGOS NUEVOS ----
// MemoryLeak: memoria reservada que nunca se libera; crece con el tiempo y al destruirla se reparte.
class MemoryLeakEnemy extends Enemy {
  constructor(cx, cy, p) {
    super(cx, cy, p, 14, 10, p.small ? 1 : (p.hp || 2));
    this.kind = 'memoryleak'; this.speed = p.small ? 38 : 22; this.growT = 5; this.kb = p.small ? 4 : 8; this.xp = p.small ? 3 : 9; this.stompable = true;
    if (p.small) { this.w = 10; this.h = 8; this.y += 2; this.x += 2; }
  }
  behave(W, dt) {
    this.walk(W, dt);
    if (this.p.small) return;
    this.growT -= dt;
    if (this.growT <= 0 && this.maxHp < 5) { this.growT = 6; this.maxHp++; this.hp++; this.kb *= 2; floatText(W, this.cx, this.y - 10, '+' + this.kb + ' KB SIN LIBERAR', PAL.magenta); }
  }
  die(W) {
    super.die(W);
    if (this.p.small) return;
    for (const d of [-1, 1]) { const e = W.spawnEnt('memoryleak', this.cx, this.y, { small: true, px: this.cx - 5 + d * 4, py: this.y + this.h - 8, dir: d }); if (e) { e.vy = -160; if (this.gMinion) e.gMinion = true; } }
    floatText(W, this.cx, this.y - 14, 'free() — PERO QUEDAN FRAGMENTOS', PAL.gray);
  }
  render(g, W) {
    const s = 1 + (this.maxHp - 2) * 0.12, cx = this.cx, by = this.y + this.h;
    const w = Math.round(this.w * s), h = Math.round(this.h * s + Math.sin(this.t * 6) * 1.5);
    const col = this.flashT > 0 ? '#FFFFFF' : '#C44DB0', dk = '#6A1F5E';
    g.fillStyle = PAL.ink; g.fillRect(Math.round(cx - w / 2) - 1, Math.round(by - h) - 1, w + 2, h + 1);
    g.fillStyle = dk; g.fillRect(Math.round(cx - w / 2), Math.round(by - h), w, h);
    g.fillStyle = col; g.fillRect(Math.round(cx - w / 2) + 1, Math.round(by - h), w - 2, h - 2);
    g.fillStyle = '#FF9ED8'; g.fillRect(Math.round(cx - w / 2) + 2, Math.round(by - h) + 1, Math.max(1, w / 3), 1);
    const ex = this.dir > 0 ? 2 : -2;
    g.fillStyle = '#FFFFFF'; g.fillRect(Math.round(cx - 3 + ex), Math.round(by - h * 0.62), 2, 2); g.fillRect(Math.round(cx + 2 + ex), Math.round(by - h * 0.62), 2, 2);
    for (let i = 0; i < 2; i++) { const dx = ((this.t * 14 + i * 9) % w) - w / 2; g.fillStyle = dk; g.fillRect(Math.round(cx + dx), Math.round(by) - 1, 2, 2); }
    if (!this.p.small) W.label(this.kb + ' KB', cx, this.y - 14 - (s - 1) * 10, '#FF9ED8', { prio: 1, back: false, shadow: '#000000' });
    if (this.freezeT > 0) { g.fillStyle = 'rgba(255,89,100,0.3)'; g.fillRect(Math.round(cx - w / 2) - 1, Math.round(by - h) - 1, w + 2, h + 2); }
  }
}
// Troyano: parece un regalo inofensivo; al acercarse (o al analizarlo con un disparo) revela lo que es.
class TrojanEnemy extends Enemy {
  constructor(cx, cy, p) { super(cx, cy, p, 14, 12, p.hp || 3); this.kind = 'trojan'; this.hidden = true; this.harmless = true; this.revealT = 0; this.xp = 14; this.stompable = true; this.jumpT = 1; }
  reveal(W) {
    if (!this.hidden) return;
    this.hidden = false; this.revealT = 0.6; this.harmless = true;
    W.glitch(0.25, 'corrupt'); AudioSys.play('glitch');
    floatText(W, this.cx, this.y - 12, '¡TROYANO!', PAL.red);
    W.particles.burst(this.cx, this.cy, 14, { col: [PAL.red, PAL.gold], kind: 'glitch' });
    if (!W.has('tip_trojan')) W.tip('trojan', 'TROYANO: malware disfrazado de algo útil. Consejo de seguridad: analiza (dispara) antes de «abrir» regalos de origen desconocido.');
  }
  behave(W, dt) {
    const p = W.player;
    if (this.hidden) { if (dist(p.cx, p.y, this.cx, this.cy) < 40) this.reveal(W); this.vy = Math.min(this.vy + 900 * dt, 300); this.vx = 0; W.move(this, dt); return; }
    if (this.revealT > 0) { this.revealT -= dt; if (this.revealT <= 0) this.harmless = false; this.vx = 0; this.vy = Math.min(this.vy + 900 * dt, 300); W.move(this, dt); return; }
    this.dir = p.cx > this.cx ? 1 : -1;
    this.jumpT -= dt;
    if (this.grounded && this.jumpT <= 0) { this.jumpT = rand(0.9, 1.5); this.vy = -210; this.vx = this.dir * 70; }
    if (this.grounded && this.jumpT > 0.2) this.vx = 0;
    this.vy = Math.min(this.vy + 900 * dt, 300); this.hitWall = 0; W.move(this, dt);
    if (this.p.range) { const home = this.home || (this.home = this.x); if (Math.abs(this.x - home) > this.p.range * TS) { this.x = clamp(this.x, home - this.p.range * TS, home + this.p.range * TS); this.vx = 0; } }
  }
  hit(W, dmg, srcX, kind) {
    if (this.hidden) { this.reveal(W); floatText(W, this.cx, this.y - 22, 'ANALIZADO', PAL.cyan); return true; }
    return super.hit(W, dmg, srcX, kind);
  }
  render(g, W) {
    const x = Math.round(this.x), y = Math.round(this.y), fl = this.flashT > 0;
    if (this.hidden) {
      const tell = Math.floor(W.t * 10 + this.x) % 37 === 0;
      g.fillStyle = PAL.ink; g.fillRect(x - 1, y - 1, 16, 14);
      g.fillStyle = tell ? PAL.red : '#F1B45C'; g.fillRect(x, y, 14, 12);
      g.fillStyle = '#FF5FA3'; g.fillRect(x + 6, y, 2, 12); g.fillRect(x, y + 4, 14, 2);
      g.fillStyle = '#FFE9A8'; g.fillRect(x + 1, y + 1, 4, 1);
      g.fillStyle = '#FF5FA3'; g.fillRect(x + 4, y - 3, 3, 3); g.fillRect(x + 8, y - 3, 3, 3);
      W.label('¡GRATIS!.EXE', this.cx, y - 18, PAL.gold, { prio: 1 });
      return;
    }
    const open = this.revealT > 0 ? 3 : 4 + Math.round(Math.sin(this.t * 10));
    g.fillStyle = PAL.ink; g.fillRect(x - 1, y - open - 1, 16, 14 + open);
    g.fillStyle = fl ? '#FFFFFF' : '#A02B38'; g.fillRect(x, y + 2, 14, 10);
    g.fillStyle = fl ? '#FFFFFF' : '#C43A48'; g.fillRect(x, y - open, 14, 3);
    g.fillStyle = '#FFFFFF'; for (let i = 0; i < 4; i++) { g.fillRect(x + 1 + i * 3, y + 2, 2, 2); g.fillRect(x + 2 + i * 3, y - open + 3, 2, 1); }
    g.fillStyle = PAL.gold; g.fillRect(x + 3, y + 6, 2, 2); g.fillRect(x + 9, y + 6, 2, 2);
    g.fillStyle = '#3A1A20'; g.fillRect(x + 2, y + 12, 2, 2); g.fillRect(x + 10, y + 12, 2, 2);
  }
}
// StackOverflow: una pila que crece; cada golpe desapila el marco de ARRIBA (LIFO).
class StackOverflowEnemy extends Enemy {
  constructor(cx, cy, p) {
    super(cx, cy, p, 16, 12, 2);
    this.kind = 'stack'; this.frames = 2; this.pushT = 2.6; this.bottom = this.y + this.h; this.xp = 12; this.stompable = true;
    this.names = ['main', 'f()', 'g()', 'h()', 'k()', 'r()'];
    this.fit();
  }
  fit() { this.h = Math.max(12, this.frames * 6); this.y = this.bottom - this.h; this.hp = this.maxHp = this.frames; } // (mínimo 12 px: el último marco debe poder recibir un disparo)
  behave(W, dt) {
    this.pushT -= dt;
    if (this.pushT <= 0) {
      this.pushT = 2.6;
      if (this.frames < 6) { this.frames++; this.fit(); floatText(W, this.cx, this.y - 8, 'PUSH ' + this.names[this.frames - 1], PAL.amber); AudioSys.play('tick'); }
      else {
        // desbordamiento de pila: se derrumba lanzando marcos
        floatText(W, this.cx, this.y - 10, '¡STACK OVERFLOW!', PAL.red); AudioSys.play('glitch'); W.shake(2, 0.2);
        for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * 0.7; const pr = new Projectile(this.cx, this.y, Math.cos(a) * 90, Math.sin(a) * 90 - 20, { owner: 'enemy', col: PAL.amber, life: 2 }); W.projectiles.push(pr); }
        this.frames = 2; this.fit();
        if (!W.has('tip_stack')) W.tip('stack', 'STACK OVERFLOW: una pila sólo crece por arriba y sólo se vacía por arriba (LIFO). Cada golpe desapila el último marco; no la dejes llegar a 6.');
      }
    }
  }
  hit(W, dmg, srcX, kind) {
    if (this.dead) return false;
    const n = Math.min(this.frames, kind === 'pulse' ? 2 : 1);
    floatText(W, this.cx, this.y - 8, 'POP ' + this.names[this.frames - 1], PAL.green);
    this.frames -= n; this.flashT = 0.15; AudioSys.play('hit');
    W.particles.burst(this.cx, this.y, 8, { col: [PAL.amber, PAL.white], max: 60 });
    if (this.frames <= 0) { this.hp = 0; this.die(W); return true; }
    this.fit(); this.pushT = Math.max(this.pushT, 1.2);
    return true;
  }
  render(g, W) {
    const x = Math.round(this.x);
    for (let i = 0; i < this.frames; i++) {
      const y = Math.round(this.bottom - (i + 1) * 6), top = i === this.frames - 1;
      g.fillStyle = PAL.ink; g.fillRect(x - 1, y - 1, 18, 8);
      g.fillStyle = this.flashT > 0 && top ? '#FFFFFF' : i % 2 ? '#8A4B2A' : '#A0612F'; g.fillRect(x, y, 16, 6);
      g.fillStyle = top ? PAL.gold : '#D98A3D'; g.fillRect(x, y, 16, 1);
    }
    const top = Math.round(this.bottom - this.frames * 6);
    g.fillStyle = '#FFFFFF'; g.fillRect(x + 4, top + 2, 2, 2); g.fillRect(x + 10, top + 2, 2, 2);
    W.label(this.names[this.frames - 1] + ' ▲', this.cx, top - 14, this.frames >= 5 ? PAL.red : PAL.amber, { prio: 1, back: false, shadow: '#000000' });
  }
}
ENTITY_TYPES.memoryleak = MemoryLeakEnemy;
ENTITY_TYPES.trojan = TrojanEnemy;
ENTITY_TYPES.stack = StackOverflowEnemy;
MemoryLeakEnemy.prototype.glow = function () { return [this.cx, this.cy, 12, '#FF6FD8', 0.25]; };
TrojanEnemy.prototype.glow = function () { return this.hidden ? [this.cx, this.cy, 14, '#FFD166', 0.35] : [this.cx, this.cy, 12, '#FF4F7A', 0.25]; };
StackOverflowEnemy.prototype.glow = function () { return [this.cx, this.y + 4, 12, '#F1B45C', 0.22]; };

// ---------------------------------------------------------------- BESTIARIO (Codex «AMENAZAS») ----
// Cada amenaza es un fallo real del sistema; su contramedida es el concepto que lo resuelve.
const THREATS = [
  ['bitcorrupt', 'BitCorrupt (bit corrupto)', 'Un bit que cambió de valor por error: un 0 que debía ser 1, o al revés.', 'Patrulla y daña al contacto.', 'DEBUG PING restaura un bit; ALU PULSE (XOR) restaura varios de golpe.', 'Los errores de bit existen de verdad: por eso hay bits de paridad y memoria ECC.', 'Casi todas las regiones.'],
  ['drone', 'Dron de entrenamiento', 'Un blanco de práctica del Boot Camp.', 'Flota sin atacar.', 'Cualquier disparo.', 'Practicar sin riesgo también es aprender.', 'Boot Camp.'],
  ['cachemiss', 'CacheMiss', 'Un fallo de caché: el dato no estaba cerca y hay que ir a buscarlo lejos.', 'Te persigue y te ralentiza (latencia).', 'CACHE BOOST: con acceso rápido, sus golpes aciertan.', 'Un fallo de caché cuesta cientos de ciclos: la localidad importa.', 'Torre de la Memoria, NULL CORE.'],
  ['buserror', 'BusError', 'Un paquete enviado por el bus equivocado.', 'Los disparos no le afectan: sólo cambia de carril.', 'BUS BRIDGE: enruta su paquete por el bus correcto (datos, direcciones o control).', 'Cada señal tiene su bus: el QUÉ, el DÓNDE y el CUÁNDO.', 'Autopista de los Buses.'],
  ['overheat', 'OverHeat', 'Un componente trabajando por encima de su límite térmico.', 'Sube la temperatura a su alrededor y disipa los ataques.', 'Enfriarlo con un ventilador y luego atacar.', 'Sin refrigeración no hay rendimiento: el calor provoca throttling.', 'Laboratorio de Rendimiento.'],
  ['deadlock', 'Deadlock', 'Dos procesos que se esperan mutuamente: espera circular.', 'Ignora los golpes sueltos.', 'Golpear a los dos casi a la vez (PARALLEL CLONE o ALU PULSE).', 'Para romper un interbloqueo hay que romper la espera circular.', 'Laboratorio de Rendimiento.'],
  ['nullpointer', 'NullPointer', 'Un puntero a la dirección 0x0000: no apunta a nada válido.', 'Aparece y desaparece.', 'REGISTER RECALL fija su dirección y lo hace visible.', 'Seguir un puntero nulo es uno de los errores más comunes en programación.', 'Kernel Perdido.'],
  ['packetstorm', 'PacketStorm', 'Una avalancha de solicitudes que satura el sistema.', 'Dispara ráfagas de paquetes; ignora los ataques.', 'INTERRUPT SHIELD lo interrumpe; entonces es vulnerable.', 'Las interrupciones permiten atender lo urgente sin perder lo que estabas haciendo.', 'Distrito de E/S.'],
  ['memoryleak', 'MemoryLeak (fuga de memoria)', 'Memoria que un programa reserva y nunca libera.', 'Crece con el tiempo; al destruirlo se reparte en fragmentos.', 'Eliminarlo pronto, antes de que crezca; el pisotón también funciona.', 'Una fuga pequeña, repetida miles de veces, acaba agotando la RAM.', 'Torre de la Memoria, Kernel Perdido.'],
  ['trojan', 'Troyano', 'Malware disfrazado de algo útil o gratuito.', 'Parece un regalo; cuando te acercas, ataca a saltos.', 'Analizarlo a distancia (un disparo lo revela) antes de acercarte.', 'No ejecutes programas de origen desconocido, por muy tentadores que parezcan.', 'Placa Base, Distrito de E/S, Kernel Perdido.'],
  ['stack', 'StackOverflow', 'Una pila de llamadas que crece sin control (por ejemplo, una recursión sin fin).', 'Apila un marco cada pocos segundos; al llegar a 6 se desborda.', 'Cada golpe desapila el último marco (LIFO); ALU PULSE desapila dos.', 'La pila es LIFO: lo último que entra es lo primero que sale.', 'Núcleo del Procesador, Forja ALU, Kernel Perdido.']
];
for (const [k, name, def, func, inp, out, conn] of THREATS) CODEX.push({ id: 'en_' + k, cat: 'AMENAZAS', name, concept: null, def, func, inp, out, conn, lat: 0, cap: 0, labels: ['QUÉ REPRESENTA', 'COMPORTAMIENTO', 'CONTRAMEDIDA', 'LECCIÓN', 'DÓNDE APARECE'] });
for (const id in GUARDIAN_SPECS) {
  const s = GUARDIAN_SPECS[id], lv = LEVELS.findIndex(L => L.guardian && L.guardian.id === id);
  CODEX.push({ id: 'g_' + id, cat: 'AMENAZAS', name: 'Guardián: ' + s.name, concept: s.concept, def: 'Guardián de ' + (LEVELS[lv] ? LEVELS[lv].name : 'la región') + ': ' + s.title + '.', func: s.tip.replace(/\s*\[\{[AQE]\}\]/g, ''), inp: s.weak ? s.weak.tip.replace(/\s*\[\{[AQE]\}\]/g, '') : (s.guard ? s.guard.tip.replace(/\s*\[\{[AQE]\}\]/g, '') : 'Esquivar, disparar y responder bien sus consultas.'), out: s.qs.map(q => q.why).slice(0, 2).join(' '), conn: 'Recompensa: chip ' + CHIPS[s.chip].n + ' (' + CHIPS[s.chip].d + ')', lat: 0, cap: 0, labels: ['QUÉ REPRESENTA', 'CÓMO VENCERLO', 'CLAVE', 'LECCIÓN', 'RECOMPENSA'] });
}
for (const e of CODEX) CODEX_BY_ID[e.id] = e;

// ---------------------------------------------------------------- LOGROS NUEVOS ----
ACHIEVEMENTS.push(
  { id: 'guardians', n: 'Guardián de guardianes', d: 'Vence a los nueve guardianes de región.' },
  { id: 'combo5', n: 'Multihilo', d: 'Encadena un combo de 5 enemigos.' },
  { id: 'bestiary', n: 'Analista de amenazas', d: 'Completa el bestiario de amenazas comunes.' }
);
const _achCheck = Achievements.check;
Achievements.check = function () {
  _achCheck.call(this);
  if (!PROG) return;
  if (Object.keys(GUARDIAN_SPECS).every(id => PROG.flags['G_' + id])) this.unlock('guardians');
  if (THREATS.every(t => PROG.codex.includes('en_' + t[0]))) this.unlock('bestiary');
};

// ---------------------------------------------------------------- RADAR (chip PREFETCH) ----
function drawPrefetchRadar(g, W) {
  if (!Chips.on('prefetch')) return;
  const c = W.cam;
  for (const e of W.entities) {
    if (e.dead || !(e.kind === 'fragment' || e.kind === 'letter' || e.kind === 'echo')) continue;
    const sx = e.x + (e.w || 10) / 2 - c.x, sy = e.y + (e.h || 10) / 2 - c.y;
    if (sx > 0 && sx < W_HUD_R && sy > 0 && sy < H) continue;
    if (Math.abs(sx - W_HUD_R / 2) > 900 || Math.abs(sy - H / 2) > 500) continue;
    const ex = clamp(sx, 10, W_HUD_R - 10), ey = clamp(sy, 50, H - 24);
    const col = e.kind === 'fragment' ? PAL.gold : e.kind === 'letter' ? '#FFE9A8' : PAL.violet;
    const a = Math.atan2(sy - ey, sx - ex);
    g.globalAlpha = 0.6 + 0.3 * Math.sin(W.t * 5);
    g.fillStyle = col; g.fillRect(Math.round(ex) - 2, Math.round(ey) - 2, 5, 5);
    g.fillRect(Math.round(ex + Math.cos(a) * 5), Math.round(ey + Math.sin(a) * 5), 2, 2);
    g.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------- MÁS ENEMIGOS POR REGIÓN ----
// [tipo, casilla x, casilla y (donde se apoya), propiedades]. Lejos del inicio, de terminales y puzles.
LEVEL0.spawns = [['bitcorrupt', 23, 15, { hp: 2, range: 3, bits: '101' }], ['bitcorrupt', 61, 15, { hp: 2, range: 3, bits: '011' }], ['bitcorrupt', 90, 15, { hp: 3, range: 4 }]];
// (en las regiones con bloques que se llevan en brazos, los enemigos quedan fuera de esos caminos:
//  cargando no se puede disparar)
LEVEL1.spawns = [['bitcorrupt', 18, 15, { hp: 3, range: 4 }], ['trojan', 35, 15, { range: 5 }], ['bitcorrupt', 82, 15, { hp: 3, range: 5 }], ['bitcorrupt', 93, 12, { hp: 2, range: 3 }]];
LEVEL2.spawns = [['bitcorrupt', 111, 15, { hp: 3, range: 2 }], ['stack', 125, 15, {}]];
LEVEL3.spawns = [['stack', 34, 15, {}], ['bitcorrupt', 51, 15, { hp: 4, range: 5 }], ['bitcorrupt', 96, 15, { hp: 4, range: 5 }], ['stack', 150, 15, {}]];
LEVEL4.spawns = [['memoryleak', 18, 14, { range: 5 }], ['memoryleak', 16, 62, { range: 6 }], ['memoryleak', 11, 86, { range: 5 }]];
LEVEL5.spawns = [['bitcorrupt', 72, 15, { hp: 3, range: 4 }], ['memoryleak', 84, 15, { range: 4 }], ['bitcorrupt', 96, 15, { hp: 4, range: 4 }]];
LEVEL6.spawns = [['trojan', 30, 15, { range: 5 }], ['bitcorrupt', 57, 15, { hp: 3, range: 3 }], ['trojan', 98, 15, { range: 5 }], ['memoryleak', 130, 15, { range: 6 }], ['bitcorrupt', 148, 15, { hp: 4, range: 5 }]];
LEVEL7.spawns = [['memoryleak', 18, 15, { range: 5 }], ['bitcorrupt', 87, 15, { hp: 4, range: 5 }], ['stack', 128, 15, {}]];
LEVEL8.spawns = [['memoryleak', 59, 12, { range: 3 }], ['trojan', 87, 15, { range: 5 }], ['stack', 47, 18, {}], ['memoryleak', 150, 13, { range: 4 }]];
