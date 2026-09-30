// =============================================================================
// LOS NUEVE GUARDIANES: aspecto (píxel a píxel), ataques, mecánica de su concepto, consultas y arenas.
// Consultas: o[0] es la respuesta correcta (se barajan al mostrarse). «no» explica cada error.
// =============================================================================
Sprites.buildGuardians = function () {
  const G = {};
  // tres fotogramas: 0-1 animación, 2 aturdido. Dibujados mirando a la IZQUIERDA.
  const mk = (w, h, fn) => [0, 1, 2].map(f => { const p = new PixelArt(w, h); fn(p, f); p.outline(); const r = p.toCanvas(); return { r, l: flipCanvas(r) }; });
  const dizzy = (p, x, y, c) => { p.px(x, y, c); p.px(x + 2, y, c); p.px(x + 1, y + 1, c); p.px(x, y + 2, c); p.px(x + 2, y + 2, c); };
  // BOOTLOOP: monitor con patas y barra de carga eterna
  G.bootloop = mk(34, 27, (p, f) => {
    const B = '#6F7C86', L = '#A9B6BE', D = '#3A444C', S = '#06202A', C = '#45E5FF';
    const k = f === 1 ? 1 : 0;
    [[5, 0], [11, 1], [21, 1], [27, 0]].forEach(([x, o]) => p.rect(x, 22, 2, 4 - ((o + k) % 2), D));
    p.rect(3, 5, 28, 17, B); p.rect(3, 5, 28, 2, L); p.rect(3, 20, 28, 2, D); p.rect(2, 9, 1, 6, D); p.rect(31, 9, 1, 6, D);
    p.rect(6, 8, 22, 10, S);
    if (f === 2) { dizzy(p, 10, 10, C); dizzy(p, 20, 10, C); }
    else { p.rect(9, 10, 4, 3, C); p.rect(20, 10, 4, 3, C); p.px(9 + k, 11, '#FFFFFF'); p.px(20 + k, 11, '#FFFFFF'); p.rect(8, 9, 5, 1, D); p.rect(20, 9, 5, 1, D); }
    p.rect(9, 15, 16, 1, '#123C4A'); p.rect(9, 15, 5 + k * 6, 1, '#71FF9A');
    p.rect(16, 1, 1, 4, L); p.px(16, 0, f === 1 ? '#FF5964' : '#71FF9A');
    p.rect(26, 7, 2, 1, '#FF5964');
  });
  // SOBRETENSIÓN: condensador con brazos de rayos
  G.surge = mk(38, 34, (p, f) => {
    const B = '#3A4DA8', H = '#6E8BFF', T = '#C8D0D8', Y = '#FFD166', D = '#23306E';
    p.rect(11, 6, 16, 22, B); p.rect(13, 7, 2, 20, H); p.rect(11, 3, 16, 4, T); p.rect(12, 2, 14, 1, T);
    p.rect(11, 12, 16, 3, '#8C8FA8'); for (let x = 13; x < 26; x += 4) p.px(x, 13, '#E8F4F7');
    p.rect(14, 28, 2, 5, T); p.rect(22, 28, 2, 5, T); p.rect(11, 26, 16, 2, D);
    if (f === 2) { dizzy(p, 14, 17, '#8C8FA8'); dizzy(p, 21, 17, '#8C8FA8'); }
    else { p.rect(14, 18, 3, 2, Y); p.rect(21, 18, 3, 2, Y); p.px(14, 17, D); p.px(15, 17, D); p.px(22, 17, D); p.px(23, 17, D); p.rect(16, 22, 6, 1, D); }
    if (f !== 2) {
      const z = f ? [[8, 10], [6, 12], [8, 14], [5, 17], [7, 19], [3, 22]] : [[8, 12], [5, 14], [7, 16], [4, 19], [6, 21], [2, 24]];
      z.forEach(([x, y]) => { p.rect(x, y, 3, 1, Y); p.rect(37 - x - 2, y, 3, 1, Y); });
    }
  });
  // RELOJ DESBOCADO: esfera con engranajes (las agujas se dibujan aparte)
  G.overclock = mk(36, 36, (p, f) => {
    const R = '#5A3A20', F = '#F5E3B8', A = '#F1B45C', M = '#8C8FA8';
    p.circle(8, 4, 3, A); p.circle(28, 4, 3, A); p.rect(15, 1, 6, 2, R);
    p.circle(18, 19, 15, R); p.circle(18, 19, 13, F);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; p.px(Math.round(18 + Math.cos(a) * 11), Math.round(19 + Math.sin(a) * 11), R); }
    p.circle(3, 27, 3, M); p.circle(33, 27, 3, M); p.px(3, 23 + f, '#E8F4F7'); p.px(33, 31 - f, '#E8F4F7');
    if (f === 2) { dizzy(p, 12, 13, R); dizzy(p, 22, 13, R); }
    else { p.rect(12, 13, 3, 3, '#1A1A22'); p.rect(22, 13, 3, 3, '#1A1A22'); p.rect(11, 11, 4, 1, R); p.rect(22, 11, 4, 1, R); }
    p.rect(15, 26, 7, 1, R);
    p.rect(12, 33, 3, 3, R); p.rect(22, 33, 3, 3, R);
  });
  // DESBORDAMIENTO: gólem calculadora (el marcador de 8 bits se dibuja aparte)
  G.overflow = mk(42, 38, (p, f) => {
    const B = '#8A4B2A', L = '#A0612F', D = '#5A3A20', K = '#1A0A06', A = '#F1B45C', O = '#D98A3D';
    p.rect(10, 31, 8, 7, D); p.rect(24, 31, 8, 7, D);
    p.rect(6, 8, 30, 24, B); p.rect(6, 8, 30, 2, L); p.rect(11, 1, 20, 8, L); p.rect(11, 1, 20, 1, '#C07A3F');
    if (f === 2) { dizzy(p, 15, 3, A); dizzy(p, 24, 3, A); }
    else { p.rect(15, 4, 4, 2, A); p.rect(24, 4, 4, 2, A); p.rect(14, 3, 5, 1, D); p.rect(24, 3, 5, 1, D); }
    p.rect(9, 11, 24, 8, K);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) p.rect(11 + c * 5, 21 + r * 3, 4, 2, (r + c + f) % 3 ? O : A);
    const a = f === 1 ? 1 : 0;
    p.rect(0, 12 + a, 6, 11, D); p.rect(36, 12 - a, 6, 11, D); p.rect(0, 22 + a, 7, 6, L); p.rect(35, 22 - a, 7, 6, L);
  });
  // THRASHING: núcleo de memoria rodeado de páginas
  G.thrash = mk(40, 34, (p, f) => {
    const C = '#2A2438', V = ['#AA7DFF', '#C7A8FF', '#6E4FB0'], PK = '#FF9ED8';
    const pages = f === 1 ? [[2, 4], [30, 2], [0, 22], [31, 24], [14, 0], [16, 28]] : [[4, 2], [31, 5], [1, 20], [30, 21], [12, 1], [19, 27]];
    pages.forEach(([x, y], i) => { p.rect(x, y, 8, 6, V[i % 3]); p.rect(x + 1, y + 2, 5, 1, '#3E2670'); p.rect(x + 1, y + 4, 4, 1, '#3E2670'); });
    p.rect(11, 9, 18, 16, C); for (let i = 0; i < 4; i++) { p.rect(8, 11 + i * 4, 3, 1, '#8C8FA8'); p.rect(29, 11 + i * 4, 3, 1, '#8C8FA8'); }
    p.rect(12, 10, 16, 2, '#3E3656');
    if (f === 2) { dizzy(p, 14, 15, PK); dizzy(p, 23, 15, PK); }
    else { p.rect(14, 15, 4, 3, PK); p.rect(22, 15, 4, 3, PK); p.px(15, 16, '#FFFFFF'); p.px(23, 16, '#FFFFFF'); }
    p.rect(16, 21, 8, 1, PK);
  });
  // COLISIÓN DE BUS: camión blindado con los tres carriles pintados
  G.busjam = mk(46, 26, (p, f) => {
    const A = '#D98A3D', K = '#1A1A22', G2 = '#6F7C86', W2 = '#E8F4F7';
    p.rect(6, 3, 38, 16, '#F1B45C'); p.rect(6, 3, 38, 2, '#FFE9A8');
    BUS_COL.forEach((c, i) => p.rect(14, 7 + i * 4, 28, 2, c));
    p.rect(1, 5, 11, 14, A); p.rect(3, 7, 6, 5, '#0E3B4A');
    if (f === 2) dizzy(p, 4, 8, W2); else { p.rect(3, 8, 3, 3, W2); p.px(4 - (f ? 0 : 1) + 1, 9, K); }
    p.rect(0, 16, 12, 3, G2); for (let x = 1; x < 11; x += 2) p.px(x, 17, K);
    [[11, 21], [36, 21]].forEach(([x, y]) => { p.circle(x, y, 4, K); p.px(x + (f ? 1 : -1), y, G2); p.px(x, y + (f ? -1 : 1), G2); });
  });
  // TORMENTA IRQ: nube de peticiones con dispositivos
  G.irqstorm = mk(48, 32, (p, f) => {
    const C = '#3E3656', L = '#5A4E7A', R = '#FF5964', Y = '#FFD166', W2 = '#E8F4F7';
    p.circle(12, 14, 9, C); p.circle(24, 10, 11, C); p.circle(36, 14, 9, C); p.rect(6, 14, 36, 9, C);
    p.circle(22, 6, 5, L); p.circle(33, 10, 4, L);
    p.rect(9, 17, 11, 4, W2); for (let x = 10; x < 20; x += 2) p.px(x, 18, C);
    p.rect(31, 16, 5, 6, W2); p.px(33, 17, C);
    if (f === 2) { dizzy(p, 19, 11, '#8C8FA8'); dizzy(p, 27, 11, '#8C8FA8'); }
    else { p.rect(19, 11, 4, 3, R); p.rect(27, 11, 4, 3, R); p.rect(18, 10, 5, 1, '#12061E'); p.rect(27, 10, 5, 1, '#12061E'); }
    if (f !== 2) { const bx = f ? 16 : 30; [[0, 23], [-2, 25], [1, 27], [-1, 29]].forEach(([dx, y]) => p.rect(bx + dx, y, 3, 2, Y)); }
  });
  // ABRAZO MORTAL: dos candados encadenados (A violeta, B ámbar)
  const lock = (body, hi) => mk(24, 28, (p, f) => {
    const G2 = '#8C8FA8', W2 = '#E8F4F7';
    p.rect(6, 0, 12, 2, G2); p.rect(5, 1, 3, 9, G2); p.rect(16, 1, 3, 9, G2);
    p.rect(2, 9, 20, 16, body); p.rect(2, 9, 20, 2, hi); p.rect(3, 12, 2, 11, hi);
    if (f === 2) { dizzy(p, 6, 13, W2); dizzy(p, 15, 13, W2); }
    else { p.rect(6, 13, 3, 3, W2); p.rect(15, 13, 3, 3, W2); p.px(6 + f, 14, '#050709'); p.px(15 + f, 14, '#050709'); }
    p.rect(11, 18, 2, 4, '#12061E'); p.px(10, 18, '#12061E'); p.px(13, 18, '#12061E');
    p.rect(5, 25, 4, 3 - f, '#3A444C'); p.rect(15, 25, 4, 2 + f, '#3A444C');
  });
  G.deadlock = lock('#6E4FB0', '#AA7DFF');
  G.deadlock_b = lock('#B8662A', '#F1B45C');
  // PÁNICO DEL KERNEL: pantalla azul fantasmal
  G.panic = mk(34, 38, (p, f) => {
    const B = '#2A4DB8', D = '#1A2F7A', W2 = '#E8F4F7';
    p.rect(2, 2, 30, 23, D); p.rect(3, 3, 28, 21, B);
    if (f === 2) { dizzy(p, 8, 6, W2); dizzy(p, 13, 6, W2); }
    else { p.rect(8, 6, 2, 2, W2); p.rect(8, 10, 2, 2, W2); p.rect(12, 5, 1, 1, W2); p.rect(11, 6, 1, 6, W2); p.rect(12, 12, 1, 1, W2); }
    for (let i = 0; i < 4; i++) p.rect(17, 6 + i * 3, 10 - (i * 3 + f) % 5, 1, '#9FB8FF');
    p.rect(6, 17, 21, 1, '#9FB8FF'); p.rect(6, 20, 14, 1, '#9FB8FF');
    for (let x = 4; x < 31; x++) { const h = 3 + Math.round(3 + 2 * Math.sin(x * 0.7 + f * 2)); p.rect(x, 25, 1, h, (x + f) % 3 ? B : D); }
    p.rect(14, 0, 6, 2, D);
  });
  Sprites.guardians = G;
};

// ---------------------------------------------------------------- mecánicas especiales ----
// Toma de tierra para la SOBRETENSIÓN (interactuar junto a ella)
class GroundNode extends Ent {
  constructor(cx, cy, p) { super(cx, cy, p, 14, 18); this.kind = 'gndnode'; this.layer = 1; this.interactive = true; }
  get prompt() { const B = Game.world && Game.world.v.guardian; return B && B.over > 0 ? 'Desviar la sobretensión (TOMA DE TIERRA)' : 'Toma de tierra (GND)'; }
  interact(W) {
    const B = W.v.guardian;
    if (!B || !(B.over > 0)) { W.bark(guide(), 'La toma de tierra: si hay una sobretensión, se puede desviar aquí.', 'CURIOUS', 3); return; }
    W.run(function* () {
      const i = yield* W.prompt('¡SOBRECARGA! ¿Adónde desvías la sobretensión?', ['A TIERRA (GND)', 'A LA CPU', 'A LA RAM'], { col: PAL.gold, tag: 'CIRCUIT LINK', sub: 'Un exceso de voltaje debe ir a donde no dañe nada.' });
      if (i < 0 || !(B.over > 0)) return;
      if (i === 0) {
        B.over = 0; B.charge = 0; W.sfx('link'); W.spawnFx('beam', B.cx, B.cy, { x2: W.ent('gnd').cx, y2: W.ent('gnd').y, col: PAL.gold, life: 0.8 });
        LearningModel.record({ concept: 'motherboard', chId: 'guard_surge_gnd', correct: true, firstTry: !B.gndFail, hints: 0, time: 5, expected: 10, conf: null, difficulty: 2, transfer: true, prompt: 'Desviar sobretensión a tierra' });
        B.stun(W, 4.5, '¡DESCARGADA A TIERRA!');
        W.bark(guide(), 'La corriente sobrante se va a tierra, lejos de los componentes. Por eso los equipos llevan toma de tierra.', 'HAPPY', 5);
      } else {
        B.gndFail = true; W.sfx('wrong'); W.player.hurt(W, 1, W.player.cx + 1);
        W.bark(guide(), i === 1 ? '¡A la CPU no! Funciona a ~1 V: una sobretensión la quemaría.' : '¡A la RAM tampoco! Es un componente delicado: la sobretensión la dañaría.', 'AFRAID', 5);
      }
    }, 'gnd');
  }
  render(g, W) {
    const B = W.v.guardian, hot = B && B.over > 0;
    const x = this.x, y = this.y;
    g.fillStyle = '#3A444C'; g.fillRect(x + 5, y + 6, 4, 12); g.fillStyle = '#6F7C86'; g.fillRect(x + 1, y + 2, 12, 5);
    g.fillStyle = hot ? (Math.floor(W.t * 8) % 2 ? PAL.gold : '#6A5020') : '#71FF9A'; g.fillRect(x + 3, y + 3, 8, 3);
    for (let i = 0; i < 3; i++) { g.fillStyle = '#A9B6BE'; g.fillRect(x + 7 - (3 - i) * 2, y + 18 - i * 2 + 2, (3 - i) * 4, 1); }
    W.label('GND', this.cx, y - 12, hot ? PAL.gold : PAL.green, { prio: 2 });
  }
}
GroundNode.prototype.glow = function (W) { const B = W.v.guardian; return [this.cx, this.y + 4, 14, B && B.over > 0 ? '#FFD166' : '#71FF9A', 0.35]; };
ENTITY_TYPES.gndnode = GroundNode;

const BUSJAM_PK = [{ t: '0x3F20', k: 1 }, { t: 'DATO: 77', k: 0 }, { t: 'LEER', k: 2 }, { t: '0x7C00', k: 1 }, { t: 'DATO: "A"', k: 0 }, { t: 'ESCRIBIR', k: 2 }, { t: 'IRQ 3', k: 2 }, { t: '0x0010', k: 1 }];
const gSay = (W, nexo, sys) => (guide() === 'SYS' ? ['SYS', sys] : [guide(), nexo, 'WORRIED']);

// ---------------------------------------------------------------- fichas de los guardianes ----
const GUARDIAN_SPECS = {
  bootloop: {
    id: 'bootloop', name: 'BOOTLOOP', title: 'arranque en bucle', concept: 'hardwareBasics', col: '#45E5FF', shot: '#71FF9A', shotKind: 'bit',
    hp: 16, w: 30, h: 24, mode: 'ground', walk: 30, fan: 3, volleys: 2,
    moves: [['hop', 'spread'], ['hop', 'spread', 'charge'], ['charge', 'hop', 'spread', 'hop']],
    tip: 'Esquiva sus ondas saltando y dispárale con [{A}]. También puedes saltarle encima.',
    qs: [
      { q: '¿Qué etapa va justo después de PROCESO?', o: ['MEMORIA', 'ENTRADA', 'SALIDA'], why: 'Tras procesar, el resultado se guarda en MEMORIA; sólo después sale.', no: { ENTRADA: 'La ENTRADA es el principio: el dato ya entró.', SALIDA: 'Antes de mostrarlo hay que guardarlo en MEMORIA.' } },
      { q: '¿Cuál de estos es un dispositivo de ENTRADA?', o: ['TECLADO', 'MONITOR', 'ALTAVOZ'], why: 'El teclado lleva datos hacia el sistema: es ENTRADA.', no: { MONITOR: 'El monitor muestra resultados: es SALIDA.', ALTAVOZ: 'El altavoz emite sonido: es SALIDA.' } },
      { q: '¿Cuál de estos es SOFTWARE?', o: ['UN DRIVER', 'LA CPU', 'LA RAM'], why: 'Un driver son instrucciones: software. CPU y RAM son hardware.', no: { 'LA CPU': 'La CPU es un chip físico: hardware.', 'LA RAM': 'La RAM es un módulo físico: hardware.' } },
      { q: '¿Qué hace el firmware (BIOS/UEFI) al encender?', o: ['ARRANCAR', 'IMPRIMIR', 'ENFRIAR'], why: 'Comprueba el hardware (POST) y arranca el sistema operativo.', no: { IMPRIMIR: 'Imprimir es cosa de un programa y un driver.', ENFRIAR: 'Enfriar es trabajo de ventiladores y disipadores.' } }
    ],
    intro: W => [['', 'Un monitor con patas bloquea la sala. En su pantalla, una barra de carga que nunca termina.'], ['NEXO', '¡Un BOOTLOOP! Un arranque que se repite sin fin porque falta una etapa del flujo.', 'WORRIED'], ['BYTE', 'Entonces le enseñaremos el orden correcto.', 'determined']],
    outro: W => [['NEXO', 'Arranque completado. Entrada, proceso, memoria, salida... y sin bucles.', 'HAPPY'], ['BYTE', '¿Eso era un chip? Lo guardo.', 'happy']],
    chip: 'post'
  },
  surge: {
    id: 'surge', name: 'SOBRETENSIÓN', title: 'voltaje sin regular', concept: 'motherboard', col: '#FFD166', col2: '#6E8BFF', shot: '#FFD166', rainKind: 'bolt', waveKind: 'spark',
    hp: 20, w: 30, h: 30, mode: 'hover', alt: 100,
    moves: [['wave', 'rain'], ['wave', 'rain', 'orbit'], ['orbit', 'rain', 'wave', 'slam']],
    tip: 'Cuando se SOBRECARGUE, corre a la toma de tierra (GND) y desvía la corriente con [{E}].',
    guard: { open: (W, B) => !(B.over > 0), text: 'SOBRECARGA: DESVÍALA A TIERRA', col: PAL.gold, tip: 'Sobrecargado no se le puede dañar: ve a la toma GND y pulsa [{E}] para desviar la sobretensión.' },
    setup(W, B) { B.charge = 5; B.over = 0; const A = B.A; W.spawnEnt('gndnode', A.x0 + 15 * TS, A.floor - 18, { id: 'gnd', px: A.x0 + 15 * TS + 1, py: A.floor - 18 }); },
    update(W, B, dt) {
      if (B.state !== 'fight') return;
      if (B.over > 0) {
        B.over -= dt;
        if (Math.random() < 0.4) W.particles.spawn({ x: B.x + rand(0, B.w), y: B.y + rand(0, B.h), vx: rand(-40, 40), vy: rand(-40, 40), col: PAL.gold, life: 0.3 });
        if (B.over <= 0) {
          // descarga total por el suelo: sólo se salva quien esté en una plataforma
          W.flash(PAL.gold, 0.3); W.shake(5, 0.5); W.sfx('explosion', '[descarga eléctrica]');
          for (let x = B.A.x0 + 8; x < B.A.x1; x += 22) W.particles.burst(x, B.A.floor - 3, 3, { col: [PAL.gold, PAL.white], max: 70, dir: -Math.PI / 2, spread: 0.8 });
          const p = W.player; if (p.grounded && p.y + p.h >= B.A.floor - 1) p.hurt(W, 1, p.cx + 1, true);
          B.charge = 0;
        }
        return;
      }
      B.charge += dt;
      if (B.charge > 11 && !B.move) { B.over = 6.5; B.move = null; W.sfx('alarm', '[sobrecarga]'); W.bark(guide(), '¡Se está sobrecargando! Desvía la corriente en la toma de tierra (GND) antes de que descargue.', 'AFRAID', 4); }
    },
    draw(g, W, B, x, y) { if (B.over > 0) { Font.draw(g, 'SOBRECARGA ' + Math.ceil(B.over), B.cx, B.y - 26, Math.floor(W.t * 6) % 2 ? PAL.gold : PAL.white, { align: 'center' }); } },
    qs: [
      { q: '¿Qué convierte los 12 V de la fuente en el voltaje de la CPU?', o: ['VRM', 'GPU', 'SSD'], why: 'El VRM, junto al socket, entrega a la CPU un voltaje bajo y estable.', no: { GPU: 'La GPU calcula gráficos; no regula voltaje.', SSD: 'El SSD almacena datos; no regula voltaje.' } },
      { q: '¿Dónde se instala la memoria RAM?', o: ['RANURA DIMM', 'PCIe x16', 'PUERTO SATA'], why: 'Los módulos de RAM van en las ranuras DIMM, junto a la CPU.', no: { 'PCIe x16': 'PCIe x16 es para tarjetas como la GPU.', 'PUERTO SATA': 'SATA conecta discos, no memoria.' } },
      { q: '¿Qué conecta USB, SATA y red con la CPU?', o: ['CHIPSET', 'ALU', 'VRM'], why: 'El chipset es el intercambiador de la placa: conecta periféricos con la CPU.', no: { ALU: 'La ALU está dentro de la CPU y calcula.', VRM: 'El VRM alimenta; no conecta periféricos.' } },
      { q: '¿Por dónde se conecta normalmente una GPU?', o: ['PCIe x16', 'DIMM', 'USB'], why: 'La GPU usa una ranura PCIe x16: 16 carriles en paralelo.', no: { DIMM: 'DIMM es para la RAM.', USB: 'USB es demasiado lento para una GPU interna.' } }
    ],
    intro: W => [['', 'Los condensadores de la plaza chisporrotean. Algo absorbe toda la energía de la ciudad.'], ['NEXO', '¡Una SOBRETENSIÓN! Demasiado voltaje sin regular: puede quemar cualquier componente.', 'AFRAID'], ['BYTE', 'Si no se puede regular... habrá que llevarla a tierra.', 'determined']],
    outro: W => [['NEXO', 'Voltaje estable. El VRM ya puede hacer su trabajo.', 'HAPPY'], ['BYTE', 'Nota mental: la corriente sobrante, siempre a tierra.', 'happy']],
    chip: 'vrm'
  },
  overclock: {
    id: 'overclock', name: 'RELOJ DESBOCADO', title: 'ciclo sin control', concept: 'fetchDecodeExecute', col: '#F1B45C', shot: '#FFD166', noFlip: true,
    hp: 22, w: 32, h: 32, mode: 'hover', alt: 96, fan: 3, volleys: 2,
    spots: [[6, 6], [15, 7], [24, 6], [9, 3], [21, 3]],
    moves: [['warp', 'spread'], ['warp', 'spread', 'beam'], ['warp', 'beam', 'spread', 'rain']],
    tip: 'Se teletransporta en cada «tic»: su fantasma avisa dónde aparecerá. FETCH DASH a través de él hace daño doble.',
    weak: { kind: 'dash', test: (W, B, k) => k === 'dash', text: '¡CICLO INTERCEPTADO!', tip: 'Debilidad: atraviésalo con FETCH DASH [{Q}] (daño doble). Desde una plataforma llegas mejor.' },
    draw(g, W, B, x, y) {
      const cx = x + 18, cy = y + 19, a = W.t * (3 + B.phase * 2), b = W.t * (0.4 + B.phase * 0.3);
      for (let i = 2; i < 10; i++) { g.fillStyle = '#1A1A22'; g.fillRect(Math.round(cx + Math.cos(a) * i), Math.round(cy + Math.sin(a) * i), 1, 1); }
      for (let i = 2; i < 7; i++) { g.fillStyle = '#A02B38'; g.fillRect(Math.round(cx + Math.cos(b) * i), Math.round(cy + Math.sin(b) * i), 2, 2); }
    },
    qs: [
      { q: '¿Qué etapa del ciclo sigue a DECODE?', o: ['EXECUTE', 'FETCH', 'WRITE BACK'], why: 'Primero se decodifica qué hacer; luego se EJECUTA.', no: { FETCH: 'FETCH va antes: trae la instrucción.', 'WRITE BACK': 'WRITE BACK es el último paso: guardar el resultado.' } },
      { q: '¿Qué registro guarda la dirección de la siguiente instrucción?', o: ['PC', 'IR', 'ALU'], why: 'El Contador de Programa (PC) es el marcapáginas del programa.', no: { IR: 'El IR guarda la instrucción actual, no la dirección de la siguiente.', ALU: 'La ALU calcula; no es un registro de direcciones.' } },
      { q: 'En FETCH, ¿qué se trae de la memoria?', o: ['LA INSTRUCCIÓN', 'EL RESULTADO', 'EL RELOJ'], why: 'FETCH trae la instrucción a la que apunta el PC.', no: { 'EL RESULTADO': 'El resultado aún no existe: se calcula después.', 'EL RELOJ': 'El reloj es una señal, no algo que se lea de memoria.' } },
      { q: '¿Qué marca el ritmo de todos los pasos de la CPU?', o: ['EL RELOJ', 'LA RAM', 'EL SSD'], why: 'La señal de reloj sincroniza cada paso: un flanco, un paso.', no: { 'LA RAM': 'La RAM guarda datos; no marca el ritmo.', 'EL SSD': 'El SSD almacena; no sincroniza la CPU.' } }
    ],
    intro: W => [['', 'Un reloj gigante gira sus agujas a una velocidad imposible. En cada tic cambia de sitio.'], ['NEXO', '¡RELOJ DESBOCADO! Alguien forzó la frecuencia: los pasos del ciclo se atropellan.', 'WORRIED'], ['BYTE', 'FETCH, DECODE, EXECUTE, WRITE BACK. Uno detrás de otro. Vamos a recordárselo.', 'determined']],
    outro: W => [['NEXO', 'El ciclo vuelve a su ritmo. Un paso por tic.', 'HAPPY'], ['BYTE', 'Y con esto, mis disparos también irán en cadena.', 'happy']],
    chip: 'pipeline'
  },
  overflow: {
    id: 'overflow', name: 'DESBORDAMIENTO', title: 'suma sin espacio', concept: 'alu', col: '#FF8A3D', shot: '#FFD166', shotKind: 'bit',
    hp: 24, w: 36, h: 34, mode: 'ground', walk: 22, fan: 4, volleys: 2, minion: 'bitcorrupt',
    moves: [['hop', 'spread'], ['hop', 'spread', 'charge'], ['hop', 'charge', 'spread', 'summon']],
    tip: 'Cada ataque suma a su contador de 8 bits: al pasar de 255 se desborda y queda aturdido. ALU PULSE le hace daño doble.',
    weak: { test: (W, B, k) => k === 'pulse', text: '¡XOR! BITS RESTAURADOS', tip: 'Debilidad: ALU PULSE [{Q}] cerca de él hace daño doble.' },
    setup(W, B) { B.cnt = 140; },
    onMove(W, B, n) {
      B.cnt += randi(35, 80);
      if (B.cnt > 255) {
        B.cnt -= 256; B.move = null;
        W.sfx('glitch'); W.shake(3, 0.3);
        W.bark(guide(), '¡OVERFLOW! El contador pasó de 255 y dio la vuelta: con 8 bits no cabe más. Aprovecha.', 'HAPPY', 4);
        B.stun(W, 3.5, 'OVERFLOW: ACARREO PERDIDO');
      }
    },
    draw(g, W, B, x, y) {
      const v = B.cnt | 0;
      for (let i = 0; i < 8; i++) { const bit = (v >> (7 - i)) & 1; g.fillStyle = bit ? '#71FF9A' : '#2A3A30'; g.fillRect(x + 11 + i * 3, y + 13, 2, 4); }
      W.label(v + ' / 255', B.cx, B.y - 26, v > 200 ? PAL.red : PAL.amber, { prio: 3 });
    },
    qs: [
      { q: '1 + 1 en binario es...', o: ['10', '2', '11'], why: 'En base 2 no existe el «2»: 1 + 1 = 10 (se escribe 0 y se lleva 1).', no: { 2: 'El dígito 2 no existe en binario.', 11: '11 en binario es 3.' } },
      { q: '¿Qué compuerta da 1 sólo si AMBAS entradas son 1?', o: ['AND', 'OR', 'XOR'], why: 'AND: las dos a la vez.', no: { OR: 'OR da 1 si al menos una es 1.', XOR: 'XOR da 1 si son distintas.' } },
      { q: '0101 + 0011 =', o: ['1000', '0110', '1111'], why: '5 + 3 = 8, y 8 en binario es 1000.', no: { '0110': '0110 es 6.', 1111: '1111 es 15.' } },
      { q: 'El bit de SUMA de un semisumador es una compuerta...', o: ['XOR', 'AND', 'NOT'], why: 'La suma de un bit es XOR; el acarreo, AND.', no: { AND: 'AND da el acarreo, no la suma.', NOT: 'NOT sólo invierte un bit.' } }
    ],
    intro: W => [['', 'Una calculadora gigante suma sin parar. Su marcador de 8 bits parpadea en rojo.'], ['NEXO', '¡DESBORDAMIENTO! Suma más de lo que cabe en 8 bits... y el resultado se da la vuelta.', 'WORRIED'], ['BYTE', '255 más uno es... cero. Si lo hacemos desbordar, se quedará en blanco.', 'thinking']],
    outro: W => [['NEXO', 'Cuentas cuadradas. Y ningún acarreo perdido.', 'HAPPY'], ['BYTE', 'La ALU no es magia: son compuertas bien puestas.', 'happy']],
    chip: 'alu'
  },
  thrash: {
    id: 'thrash', name: 'THRASHING', title: 'memoria que no para de moverse', concept: 'cache', col: '#C79BFF', shot: '#C7A8FF', shotKind: 'page', rainKind: 'page',
    hp: 24, w: 34, h: 30, mode: 'hover', alt: 90, fan: 3, volleys: 2,
    spots: [[6, 8], [21, 8], [14, 5], [5, 1], [22, 1]],
    moves: [['warp', 'spread'], ['warp', 'rain', 'spread'], ['warp', 'rain', 'orbit', 'spread']],
    tip: 'Con CACHE BOOST activo le haces daño doble. Cuando baja al «SSD» es más lento: aprovecha.',
    weak: { test: (W) => W.player.boostT > 0, text: '¡CACHE HIT!', tip: 'Debilidad: con CACHE BOOST [{Q}] activo le haces daño doble.' },
    update(W, B, dt) { const up = B.A.floor - (B.y + B.h); B.tier = up > 100 ? 'CACHÉ' : up > 40 ? 'RAM' : 'SSD'; },
    draw(g, W, B, x, y) { if (B.tier) W.label('EN ' + B.tier, B.cx, B.y + B.h + 2, B.tier === 'SSD' ? PAL.green : B.tier === 'RAM' ? PAL.amber : PAL.violet, { prio: 3 }); },
    qs: [
      { q: '¿Cuál es la memoria más rápida?', o: ['REGISTROS', 'RAM', 'SSD'], why: 'Los registros están dentro del núcleo: la memoria más rápida y más pequeña.', no: { RAM: 'La RAM es rápida, pero mucho más lenta que registros y caché.', SSD: 'El SSD es el nivel más lento de la jerarquía.' } },
      { q: '¿Qué se pierde al cortar la energía?', o: ['LA RAM', 'EL SSD', 'EL HDD'], why: 'La RAM es volátil: sin energía, se borra.', no: { 'EL SSD': 'El SSD es no volátil: conserva los datos.', 'EL HDD': 'El disco duro conserva los datos sin energía.' } },
      { q: '¿Para qué sirve la caché?', o: ['EVITAR ESPERAS', 'SER PERMANENTE', 'ENFRIAR'], why: 'Guarda cerca lo que se usa a menudo para que la CPU no espere a la RAM.', no: { 'SER PERMANENTE': 'La caché es volátil y pequeña: no es almacenamiento.', ENFRIAR: 'La caché no tiene nada que ver con la temperatura.' } },
      { q: 'Si el dato NO está en la caché, ocurre un...', o: ['CACHE MISS', 'CACHE HIT', 'OVERFLOW'], why: 'Un fallo de caché obliga a buscar el dato en un nivel más lento.', no: { 'CACHE HIT': 'HIT es cuando SÍ está.', OVERFLOW: 'Overflow es un desbordamiento aritmético.' } }
    ],
    intro: W => [['', 'Las páginas de memoria se arremolinan: entran y salen de la caché sin parar.'], ['SYS', 'ALERTA: THRASHING. EL SISTEMA PASA MÁS TIEMPO MOVIENDO PÁGINAS QUE TRABAJANDO.'], ['BYTE', 'Sin NEXO... Bien. Lo que se usa a menudo, cerca. Lo demás, lejos.', 'determined']],
    outro: W => [['SYS', 'MEMORIA ESTABILIZADA. ACCESOS: NORMALES.'], ['BYTE', '...Te habría gustado ver esto, NEXO.', 'sad']],
    chip: 'prefetch'
  },
  busjam: {
    id: 'busjam', name: 'COLISIÓN DE BUS', title: 'cada cosa por cualquier carril', concept: 'buses', col: '#F1B45C', shot: '#45E5FF', minion: 'bitcorrupt',
    hp: 22, w: 42, h: 22, mode: 'ground', walk: 40, fan: 3, volleys: 2,
    moves: [['charge', 'hop'], ['charge', 'spread', 'hop'], ['charge', 'summon', 'charge', 'spread']],
    tip: 'Su carga lo protege: acércate y usa BUS BRIDGE [{Q}] para enrutar el paquete por el bus correcto.',
    guard: { open: (W, B) => B.openT > 0, text: 'CARGA SIN ENRUTAR: USA BUS BRIDGE', col: PAL.amber, tip: 'Protegido por su carga: acércate y usa BUS BRIDGE [{Q}] para enviar el paquete por el bus correcto.' },
    setup(W, B) { B.pk = pick(BUSJAM_PK); B.openT = 0; B.reroute = function* (W2) { yield* busjamReroute(W2, B); }; },
    update(W, B, dt) { B.openT = Math.max(0, B.openT - dt); },
    draw(g, W, B, x, y) {
      if (B.openT > 0) { W.label('ENRUTADO ' + Math.ceil(B.openT), B.cx, B.y - 26, PAL.green, { prio: 3 }); return; }
      W.label('CARGA: ' + B.pk.t, B.cx, B.y - 26, PAL.amber, { prio: 3 });
    },
    qs: [
      { q: '¿Por qué bus viaja una DIRECCIÓN de memoria?', o: ['DIRECCIONES', 'DATOS', 'CONTROL'], why: 'El bus de direcciones indica DÓNDE leer o escribir.', no: { DATOS: 'El bus de datos lleva el valor (el QUÉ).', CONTROL: 'El bus de control lleva órdenes (el CUÁNDO y el CÓMO).' } },
      { q: 'La orden «LEER» viaja por el bus de...', o: ['CONTROL', 'DATOS', 'DIRECCIONES'], why: 'Las órdenes (leer, escribir, reloj, IRQ) van por el bus de control.', no: { DATOS: 'Datos lleva valores, no órdenes.', DIRECCIONES: 'Direcciones lleva posiciones, no órdenes.' } },
      { q: 'El valor 42 que se escribe en la RAM viaja por...', o: ['DATOS', 'CONTROL', 'DIRECCIONES'], why: 'El valor es un dato: bus de datos.', no: { CONTROL: 'Control dice CUÁNDO escribir, no el valor.', DIRECCIONES: 'Direcciones dice DÓNDE, no el valor.' } },
      { q: 'Más carriles en paralelo significa más...', o: ['ANCHO DE BANDA', 'LATENCIA', 'CALOR'], why: 'Más carriles, más datos por segundo: más ancho de banda.', no: { LATENCIA: 'La latencia de cada dato no baja por añadir carriles.', CALOR: 'No es el objetivo de añadir carriles.' } }
    ],
    intro: W => [['', 'Un camión blindado recorre la autopista sin respetar ningún carril.'], gSay(W, '¡COLISIÓN DE BUS! Mezcla datos, direcciones y órdenes en el mismo carril.', 'ALERTA: CONTENCIÓN DE BUS. SEÑALES MEZCLADAS EN TODOS LOS CARRILES.'), ['BYTE', 'Cada cosa por su bus. BUS BRIDGE va a poner orden.', 'determined']],
    outro: W => [['SYS', 'BUSES DESPEJADOS. DATOS, DIRECCIONES Y CONTROL, CADA UNO EN SU CARRIL.'], ['BYTE', 'Y yo me llevo un bus de 64 bits. Dos disparos a la vez.', 'happy']],
    chip: 'bus64'
  },
  irqstorm: {
    id: 'irqstorm', name: 'TORMENTA IRQ', title: 'todos a la vez', concept: 'interrupts', col: '#FF5964', shot: '#FF5964', minion: 'bitcorrupt',
    hp: 20, w: 44, h: 28, mode: 'hover', alt: 104, fan: 4, volleys: 2,
    moves: [['spread', 'rain'], ['spread', 'rain', 'summon'], ['orbit', 'rain', 'spread', 'summon']],
    tip: 'Sólo es vulnerable interrumpido: acércate y usa INTERRUPT SHIELD [{Q}]; luego atácalo.',
    guard: { open: (W, B) => B.freezeT > 0, text: 'SATURADA: INTERRÚMPELA', col: PAL.red, tip: 'La tormenta sólo es vulnerable interrumpida: acércate y usa INTERRUPT SHIELD [{Q}], luego atácala.' },
    qs: [
      { q: 'Si llegan varias IRQ a la vez, ¿cuál se atiende primero?', o: ['LA MÁS PRIORITARIA', 'LA MÁS VIEJA', 'LA MÁS LARGA'], why: 'El controlador de interrupciones atiende primero la de mayor prioridad.', no: { 'LA MÁS VIEJA': 'El orden de llegada no manda: manda la prioridad.', 'LA MÁS LARGA': 'La duración no decide el orden.' } },
      { q: 'Antes de atender una interrupción, la CPU...', o: ['GUARDA SU ESTADO', 'SE APAGA', 'BORRA LA RAM'], why: 'Guardar, atender, restaurar, continuar: sin perder lo que estaba haciendo.', no: { 'SE APAGA': 'Apagarse perdería todo el trabajo.', 'BORRA LA RAM': 'Borrar la RAM destruiría el programa en curso.' } },
      { q: 'Preguntar sin parar a un dispositivo si tiene algo es...', o: ['POLLING', 'DMA', 'CACHÉ'], why: 'Eso es polling (sondeo): gasta CPU preguntando. La interrupción lo evita.', no: { DMA: 'DMA copia datos sin la CPU.', 'CACHÉ': 'La caché es memoria rápida, no una forma de preguntar.' } },
      { q: '¿Qué copia datos a la RAM sin ocupar la CPU?', o: ['DMA', 'ISR', 'ALU'], why: 'El DMA transfiere bloques directamente y avisa al terminar.', no: { ISR: 'La ISR es la rutina que atiende una interrupción.', ALU: 'La ALU calcula; no transfiere bloques.' } }
    ],
    intro: W => [['', 'Una nube de peticiones cubre la estación. Teclado, ratón y disco gritan a la vez.'], gSay(W, '¡TORMENTA IRQ! Tantas interrupciones que la CPU no puede atender ninguna.', 'ALERTA: TORMENTA DE INTERRUPCIONES.'), ['BYTE', 'Pues la interrumpo yo a ella.', 'determined']],
    outro: W => [[guide(), 'Prioridades en orden. Ninguna petición perdida.', 'HAPPY'], ['BYTE', 'Y un WATCHDOG: si algo se cuelga, alguien lo reinicia.', 'happy']],
    chip: 'watchdog'
  },
  deadlock: {
    id: 'deadlock', name: 'ABRAZO MORTAL', title: 'espera circular', concept: 'parallelism', col: '#AA7DFF', col2: '#F1B45C', shot: '#AA7DFF',
    hp: 18, w: 22, h: 26, mode: 'ground', walk: 34, fan: 3, volleys: 1,
    moves: [['hop', 'spread'], ['hop', 'spread', 'charge'], ['charge', 'hop', 'spread']],
    tip: 'Cada candado espera al otro: golpéalos casi a la vez (PARALLEL CLONE [{Q}] u onda ALU PULSE).',
    twin: { w: 22, h: 26 },
    setup(W, B) { B.lastHitA = -9; B.lastHitB = -9; },
    twinUpdate(W, B, T, dt) {
      // el segundo candado se mueve en espejo respecto al centro de la arena
      const mid = (B.A.x0 + B.A.x1) / 2, tx = clamp(2 * mid - B.cx - T.w / 2, B.A.x0 + 4, B.A.x1 - T.w - 4);
      if (B.state === 'fight' || B.state === 'stun' || B.state === 'quiz') {
        if (B.freezeT <= 0 && B.state === 'fight') T.vx = clamp((tx - T.x) * 3, -200, 200); else T.vx = 0;
        if (B.move && B.move.n === 'hop' && B.move.air && T.grounded) { T.vy = -300; }
        T.vy = Math.min((T.vy || 0) + 950 * dt, 360); W.move(T, dt);
        if (T.x < B.A.x0 + 2) T.x = B.A.x0 + 2; if (T.x + T.w > B.A.x1 - 2) T.x = B.A.x1 - 2 - T.w;
      }
    },
    twinHit(W, B, part, dmg, kind) {
      if (B.state === 'stun') { B._fwd = true; const r = B.hit(W, dmg, 0, kind); B._fwd = false; part.flashT = 0.12; return r; }
      if (B.state !== 'fight') { B._fwd = true; const r = B.hit(W, dmg, 0, kind); B._fwd = false; return r; }
      const isA = part === B; if (isA) B.lastHitA = W.t; else B.lastHitB = W.t;
      part.flashT = 0.12;
      if (Math.abs(B.lastHitA - B.lastHitB) < 0.8) {
        B.lastHitA = B.lastHitB = -9;
        floatText(W, (B.cx + B.twin.cx) / 2, B.y - 18, '¡ESPERA CIRCULAR ROTA!', PAL.green);
        B._fwd = true; B.hit(W, 2 * dmg, 0, kind); B._fwd = false; return true;
      }
      if ((B.waitMsgT || 0) < W.t) { B.waitMsgT = W.t + 1; floatText(W, part.cx, part.y - 8, 'ESPERANDO A SU PAR...', PAL.gray); AudioSys.play('ui_back'); W.tip('g_deadlock', gKeys('Cada candado espera al otro: golpéalos casi a la vez (PARALLEL CLONE [{Q}] u onda ALU PULSE).')); }
      return false;
    },
    draw(g, W, B, x, y) {
      const T = B.twin; if (!T) return;
      const n = Math.max(2, Math.round(dist(B.cx, B.cy, T.cx, T.cy) / 5));
      for (let i = 1; i < n; i++) { const f = i / n; g.fillStyle = i % 2 ? '#8C8FA8' : '#5A5C70'; g.fillRect(Math.round(lerp(B.cx, T.cx, f)) - 1, Math.round(lerp(B.cy, T.cy, f) + Math.sin(f * Math.PI) * 10) - 1, 3, 2); }
      W.label('R1', B.cx, B.y - 26, PAL.violet, { prio: 2 }); W.label('R2', T.cx, T.y - 26, PAL.amber, { prio: 2 });
    },
    qs: [
      { q: 'Dos procesos se esperan mutuamente para siempre: es un...', o: ['DEADLOCK', 'OVERFLOW', 'CACHE MISS'], why: 'Interbloqueo: espera circular de recursos. Nadie cede y nadie avanza.', no: { OVERFLOW: 'Overflow es un desbordamiento aritmético.', 'CACHE MISS': 'Un cache miss es un fallo de caché.' } },
      { q: 'Con un 50% de trabajo secuencial, más núcleos nunca pasan de...', o: ['2×', '4×', '10×'], why: 'Ley de Amdahl: 1 / 0,5 = 2×. La parte secuencial pone el techo.', no: { '4×': 'Eso sería con un 25% secuencial.', '10×': 'Con la mitad secuencial es imposible.' } },
      { q: 'El componente que limita todo el sistema es el...', o: ['CUELLO DE BOTELLA', 'VENTILADOR', 'CHIPSET'], why: 'Mejorar otra cosa no sirve: hay que atacar el cuello de botella.', no: { VENTILADOR: 'Puede serlo si hay calor, pero el término es cuello de botella.', CHIPSET: 'No es el limitante por definición.' } },
      { q: 'Si la CPU se calienta demasiado y baja su frecuencia, es...', o: ['THROTTLING', 'OVERCLOCK', 'POLLING'], why: 'Throttling: se frena sola para protegerse del calor.', no: { OVERCLOCK: 'Overclock es subir la frecuencia, lo contrario.', POLLING: 'Polling es sondear dispositivos.' } }
    ],
    intro: W => [['', 'Dos candados enormes avanzan encadenados. Cada uno sujeta lo que el otro necesita.'], gSay(W, '¡ABRAZO MORTAL! Un interbloqueo: ninguno suelta su recurso hasta que el otro suelte el suyo.', 'ALERTA: INTERBLOQUEO DETECTADO.'), ['BYTE', 'Hay que romper la espera circular. Los dos a la vez.', 'determined']],
    outro: W => [[guide(), 'Recursos liberados. Los dos procesos avanzan.', 'HAPPY'], ['BYTE', 'Un OVERCLOCK... con su precio. Nada es gratis, ¿eh?', 'thinking']],
    chip: 'overclock'
  },
  panic: {
    id: 'panic', name: 'PÁNICO DEL KERNEL', title: 'error sin salida', concept: 'io', col: '#6E8BFF', shot: '#9FB8FF', minion: 'nullpointer',
    hp: 24, w: 30, h: 34, mode: 'hover', alt: 96, fan: 3, volleys: 2,
    spots: [[6, 6], [15, 7], [24, 6], [8, 3], [21, 3]],
    moves: [['warp', 'spread'], ['warp', 'beam', 'summon'], ['warp', 'beam', 'spread', 'orbit']],
    tip: 'Se vuelve una dirección nula e invisible. REGISTER RECALL [{Q}] fija su dirección: visible y con daño doble.',
    guard: { open: (W, B) => B.vis || B.pinT > 0, text: 'DIRECCIÓN NULA', col: PAL.violet, tip: 'Invisible no se le puede dañar: usa REGISTER RECALL [{Q}] para fijar su dirección, o espera a que reaparezca.' },
    weak: { test: (W, B) => B.pinT > 0, text: '¡DIRECCIÓN FIJADA!', tip: 'Debilidad: REGISTER RECALL [{Q}] fija su dirección (visible y daño doble).' },
    setup(W, B) { B.vis = true; B.visT = 3.5; B.pinT = 0; B.pinnable = true; B.pin = function (W2) { this.pinT = 5; this.vis = true; floatText(W2, this.cx, this.y - 10, 'DIRECCIÓN FIJADA EN R7', PAL.white); }; },
    update(W, B, dt) {
      B.pinT = Math.max(0, B.pinT - dt);
      if (B.state !== 'fight') { B.vis = true; return; }
      B.visT -= dt;
      if (B.pinT > 0) B.vis = true;
      else if (B.visT <= 0) { B.vis = !B.vis; B.visT = B.vis ? 3.5 : 2.2; W.particles.burst(B.cx, B.cy, 10, { col: [PAL.violet, '#9FB8FF'], kind: 'glitch' }); }
    },
    draw(g, W, B, x, y) { if (B.pinT > 0) W.label('R7 → ' + Math.ceil(B.pinT), B.cx, B.y - 26, PAL.white, { prio: 3 }); },
    qs: [
      { q: '¿Qué parte del sistema operativo reparte la CPU entre procesos?', o: ['EL PLANIFICADOR', 'LA BIOS', 'EL VRM'], why: 'El planificador del kernel decide qué proceso usa la CPU y cuándo.', no: { 'LA BIOS': 'La BIOS arranca el equipo; luego cede el control al SO.', 'EL VRM': 'El VRM regula voltaje.' } },
      { q: 'Un puntero que no apunta a ninguna dirección válida es un...', o: ['PUNTERO NULO', 'BUS DE DATOS', 'REGISTRO PC'], why: 'Un puntero nulo: seguirlo provoca un error.', no: { 'BUS DE DATOS': 'El bus de datos transporta valores.', 'REGISTRO PC': 'El PC apunta a la siguiente instrucción (válida).' } },
      { q: 'Al cambiar de proceso, el kernel guarda y restaura...', o: ['EL CONTEXTO', 'EL SSD', 'LA PANTALLA'], why: 'El contexto: registros y estado del proceso, para seguir donde lo dejó.', no: { 'EL SSD': 'No hace falta tocar el SSD para cambiar de proceso.', 'LA PANTALLA': 'La pantalla no es el estado del proceso.' } },
      { q: '¿Quién gestiona procesos, memoria y dispositivos?', o: ['EL KERNEL', 'LA GPU', 'EL CHIPSET'], why: 'El kernel es el núcleo del sistema operativo: arbitra todo el hardware.', no: { 'LA GPU': 'La GPU calcula gráficos.', 'EL CHIPSET': 'El chipset conecta periféricos, pero no los gestiona.' } }
    ],
    intro: W => [['', 'La pantalla del núcleo se vuelve azul. Un rostro triste parpadea entre errores.'], gSay(W, '¡PÁNICO DEL KERNEL! Un error tan grave que el sistema no sabe cómo seguir.', 'KERNEL PANIC: ESTADO IRRECUPERABLE.'), ['BYTE', 'Sé cómo se siente. Pero esta vez tenemos un punto de restauración.', 'determined']],
    outro: W => [[guide(), 'El kernel se recupera. Todos los procesos, a salvo.', 'HAPPY'], ['BYTE', 'RAID 1: una copia espejo. Por si acaso.', 'happy']],
    chip: 'raid'
  }
};
// La visibilidad del PÁNICO se respeta al dibujar (invisible: sólo un rastro de «0x0000»)
const _gRender = Guardian.prototype.render;
Guardian.prototype.render = function (g, W) {
  if (this.spec.id === 'panic' && this.state === 'fight' && !this.vis && this.pinT <= 0) { if (Math.random() < 0.15) Font.draw(g, '0x0000', this.cx, this.cy, 'rgba(159,184,255,0.45)', { align: 'center' }); return; }
  return _gRender.call(this, g, W);
};
const _gContact = Guardian.prototype.contact;
Guardian.prototype.contact = function (W, safe) { if (this.spec && this.spec.id === 'panic' && !this.vis && !(this.pinT > 0)) return; return _gContact.call(this, W, safe); };
const _gHit = Guardian.prototype.hit;
Guardian.prototype.hit = function (W, dmg, srcX, kind) { if (this.spec.twinHit && !this._fwd) return this.spec.twinHit(W, this, this, dmg, kind); return _gHit.call(this, W, dmg, srcX, kind); };
const _gFrame = Guardian.prototype.frame;
Guardian.prototype.frame = function (W) { if (!Sprites.guardians) Sprites.buildGuardians(); return _gFrame.call(this, W); };
const _gpRender = GuardianPart.prototype.render;
GuardianPart.prototype.render = function (g, W) { if (!Sprites.guardians) Sprites.buildGuardians(); return _gpRender.call(this, g, W); };

function* busjamReroute(W, B) {
  if (B.openT > 0) { W.bark(guide(), 'Su carga ya va por el bus correcto: ¡ataca ahora!', 'HAPPY', 3); return; }
  const pk = B.pk;
  const i = yield* W.prompt('BUS BRIDGE — la carga del guardián es «' + pk.t + '». ¿Por qué bus debe viajar?', BUS_NAME.slice(), { col: PAL.amber, tag: 'BUS BRIDGE' });
  if (i < 0) return;
  if (i === pk.k) {
    W.sfx('bridge'); floatText(W, B.cx, B.y - 12, 'ENRUTADO: ' + BUS_NAME[i], PAL.green);
    LearningModel.record({ concept: 'buses', chId: 'guard_busjam_route', correct: true, firstTry: !B.routeFail, hints: 0, time: 5, expected: 10, conf: null, difficulty: 2, transfer: true, prompt: 'Enrutar la carga del guardián' });
    B.openT = 7; B.stun(W, 2.5, 'CARGA ENRUTADA');
    B.pk = pick(BUSJAM_PK.filter(q => q !== pk));
  } else {
    B.routeFail = true; W.sfx('wrong'); floatText(W, B.cx, B.y - 12, 'BUS INCORRECTO', PAL.red);
    W.bark(guide(), '«' + pk.t + '» ' + ROUTE_EXPLAIN[pk.k].replace(/\*/g, ''), 'WORRIED', 5);
    W.player.hurt(W, 1, B.cx);
  }
}

// ---------------------------------------------------------------- arenas ----
// Añade al final del mapa una sala de 30×13 con compuerta, checkpoint, plataformas y la salida.
function addArena(def, o) {
  const m = def.map, h = m.length, w0 = Math.max(...m.map(r => r.length));
  const F = o.floor || 16, legendE = def.legend && def.legend.E;
  for (let y = 0; y < h; y++) { m[y] = m[y].padEnd(w0, '.'); if (!legendE) m[y] = m[y].replace('E', '.'); }
  // compuerta: se talla en el muro final o se añade una columna de muro
  const lastSolid = [1, 2, 3, 4, 5].every(k => m[F - k][w0 - 1] === '#');
  let gx = w0 - 1;
  if (!lastSolid) { for (let y = 0; y < h; y++) m[y] += y >= F - 5 && y < F ? '.' : '#'; gx = w0; }
  for (let k = 1; k <= 5; k++) m[F - k] = m[F - k].slice(0, gx) + 'Γ' + m[F - k].slice(gx + 1);
  const x0 = m[0].length, W2 = 30;
  for (let y = 0; y < h; y++) {
    let row;
    if (y <= F - 14 || y >= F) row = '#'.repeat(W2 + 1);
    else {
      const r = new Array(W2).fill('.');
      if (y === F - 3) { for (let x = 3; x <= 6; x++) r[x] = '='; for (let x = 23; x <= 26; x++) r[x] = '='; }
      if (y === F - 6) for (let x = 11; x <= 18; x++) r[x] = '=';
      if (y === F - 1) { r[1] = 'C'; r[27] = 'E'; }
      row = r.join('') + '#';
    }
    m[y] += row;
  }
  def.legend = def.legend || {};
  def.legend['Γ'] = { type: 'door', id: 'gate', gate: true, color: '#FF5F6A', icon: '◆', openWhen: (def.exit && def.exit.needs) || null, lockedText: (def.exit && def.exit.lockedText) || 'ACCESO BLOQUEADO: estabiliza la región antes de enfrentarte a su guardián.' };
  def.exit = Object.assign({}, def.exit || {}, { boss: 'G_' + o.id });
  def.guardian = { id: o.id, gate: true, arena: { x0: x0 * TS, x1: (x0 + W2) * TS, top: (F - 13) * TS, floor: F * TS } };
}
addArena(LEVEL0, { id: 'bootloop' });
addArena(LEVEL1, { id: 'surge' });
addArena(LEVEL2, { id: 'overclock' });
addArena(LEVEL3, { id: 'overflow' });
addArena(LEVEL5, { id: 'busjam' });
addArena(LEVEL6, { id: 'irqstorm' });
addArena(LEVEL7, { id: 'deadlock' });
addArena(LEVEL8, { id: 'panic', floor: 14 });
// Torre de la Memoria: el guardián aparece en la sala del SSD tras la revelación (sin compuerta)
LEVEL4.exit = Object.assign({}, LEVEL4.exit, { boss: 'G_thrash' });
LEVEL4.guardian = { id: 'thrash', gate: false, needs: 'L4_reveal', wakeX: 0, arena: { x0: 1 * TS, x1: 29 * TS, top: 88 * TS, floor: 111 * TS } };
// pistas: durante el combate manda la del guardián
for (const L of LEVELS) if (L.guardian && L.hint) { const h0 = L.hint; L.hint = function (W) { return Guardians.hint(W) || (W.v.guardianDone && (!L.exit.needs || W.has(L.exit.needs)) ? { text: 'Guardián vencido: la salida está abierta.' } : h0.call(this, W)); }; }
