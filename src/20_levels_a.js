// =============================================================================
// NIVELES — ACTO I: 00 Boot Camp · 01 Ciudad de la Placa Base · 02 Núcleo del Procesador
// Mapa: '#' sólido · '=' un sentido · '^' púas · '~' corrupción · 'H' escalera · 'X' bloque corrupto
//       'P' inicio · 'C' checkpoint · 'E' salida · '*' Memory Fragment · resto: leyenda del nivel
// =============================================================================
function joinSecs(...parts) {
  const rows = [];
  for (let r = 0; r < parts[0].length; r++) rows.push(parts.map(p => p[r]).join(''));
  return rows;
}
const G32 = '#'.repeat(32), D32 = '.'.repeat(32);
const nexoHere = () => !PROG.flags.nexoAway;
const guide = () => (PROG.flags.nexusBorn ? 'NEXUS' : nexoHere() ? 'NEXO' : 'SYS');
function ejectBlock(W, socket, b, why) {
  socket.item = null; b.inSocket = null;
  b.x = socket.cx - b.w / 2 - 22; b.y = socket.y - 26; b.vy = -80;
  AudioSys.play('wrong'); W.shake(2, 0.2);
  W.particles.burst(socket.cx, socket.y, 12, { col: [PAL.red, PAL.amber] });
  if (why) W.bark(guide(), why, 'WORRIED', 5);
}
function blockPos(W, id) { const e = W.ent(id); return e ? { x: e.cx, y: e.y } : null; }

// ---------------------------------------------------------------- NIVEL 00 — BOOT CAMP ----
const L0_EXPECT = ['INPUT', 'PROCESS', 'MEMORY', 'OUTPUT'];
const L0_NAMES = { INPUT: 'ENTRADA', PROCESS: 'PROCESO', MEMORY: 'MEMORIA', OUTPUT: 'SALIDA' };
const L0_WHY = {
  INPUT: 'Todo empieza por la ENTRADA: sin un dato que entre, no hay nada que procesar.',
  PROCESS: 'Sin PROCESO, el dato llega intacto a los siguientes módulos: nadie lo transforma.',
  MEMORY: 'El resultado debe quedar en MEMORIA antes de mostrarse; si no, se pierde entre pasos.',
  OUTPUT: 'La SALIDA va al final: sólo se puede mostrar lo que ya se procesó y se guardó.'
};
// Los módulos recogidos por el camino se copian al búfer de la Sala del Sistema: allí se ordena
// el flujo. (Llevarlos a mano por escaleras y pasarelas de un sentido no sería posible.)
const L0_RACK = { bMem: 113, bIn: 115, bProc: 116 };
function L0_rackPlace(W, b) {
  b.x = L0_RACK[b.id] * TS; b.y = 16 * TS - b.h; b.vy = 0; b.home = { x: b.x, y: b.y };
}
// módulos que aún no se han recogido (siguen en su sitio original por el camino)
function L0_missing(W) { return ['bIn', 'bProc', 'bMem'].map(id => W.ent(id)).filter(b => b && !W.has('L0_buf_' + b.p.item) && !b.carried && !b.inSocket); }
function L0_toBuffer(W, b) {
  if (W.has('L0_buf_' + b.p.item)) return;
  W.player.carry = null; b.carried = false;
  W.particles.burst(b.cx, b.cy, 18, { col: [PAL.cyan, PAL.white], kind: 'bit', max: 90 });
  L0_rackPlace(W, b);
  W.flag('L0_buf_' + b.p.item);
  AudioSys.play('link');
  UI.toast('MÓDULO ' + b.p.label + ' → BÚFER DE LA SALA DEL SISTEMA', PAL.cyan);
  if (!W.has('L0_bufTold')) { W.flag('L0_bufTold'); W.bark('NEXO', 'Módulo copiado al búfer. Lo encontrarás en la Sala del Sistema, junto a las ranuras.', 'HAPPY', 4); }
}
const LEVEL0 = {
  id: 0, key: 'boot', name: 'BOOT CAMP', theme: 'boot', music: 'boot', concepts: ['hardwareBasics'],
  reward: 'Habilidad base: DEBUG PING', exit: { needs: 'L0_exit', lockedText: 'SALIDA BLOQUEADA: el flujo del sistema no está verificado.', onEnter: function* (W) { W.quest('m0', 'done'); } },
  fragments: ['f0'],
  map: joinSecs(
    [ // A: despertar
      '#' + '.'.repeat(23), '#' + '.'.repeat(23), '#' + '.'.repeat(23), '#' + '.'.repeat(23), '#' + '.'.repeat(23), '#' + '.'.repeat(23),
      '#' + '.'.repeat(23), '#' + '.'.repeat(23), '#' + '.'.repeat(23), '#' + '.'.repeat(23), '#' + '.'.repeat(23), '#' + '.'.repeat(23),
      '#' + '.'.repeat(23),
      '#.............JJ........',
      '#.............JJ........',
      '#..P.....v...wJJ##......',
      '#'.repeat(24), '#'.repeat(24), '#'.repeat(24), '#'.repeat(24)
    ],
    [ // B: salto y bloque ENTRADA (peldaños a ambos lados: se puede volver a subir desde la derecha)
      '.'.repeat(24), '.'.repeat(24), '.'.repeat(24), '.'.repeat(24), '.'.repeat(24), '.'.repeat(24),
      '.'.repeat(24), '.'.repeat(24), '.'.repeat(24), '.'.repeat(24), '.'.repeat(24),
      '..............i.........',
      '............######......',
      '............######......',
      '.........##.######.##...',
      '.........##.######.##...',
      '####...#################',
      '####...#################',
      '####^^^#################',
      '#'.repeat(24)
    ],
    [ // C: escalera, pasarela de un sentido, bloque PROCESO
      '.'.repeat(24), '.'.repeat(24),
      '...................#....',
      '.............*.....#....',
      '...........====....#....',
      '...................#....',
      '...............p.OO#....',
      '...H####==========H#....',
      '...H####..........H.....', '...H####..........H.....', '...H####..........H.....', '...H####..........H.....', '...H####..........H.....',
      '.LLH####..........H.....', '.LLH####..........H.....', '.LLH####..........H.....',
      '#'.repeat(24), '#'.repeat(24), '#'.repeat(24), '#'.repeat(24)
    ],
    [ // D: dron de entrenamiento, bloque MEMORIA, primera anomalía
      '.'.repeat(24), '.'.repeat(24), '.'.repeat(24), '.'.repeat(24), '.'.repeat(24), '.'.repeat(24), '.'.repeat(24), '.'.repeat(24), '.'.repeat(24),
      '..............s.........',
      '.'.repeat(24), '.'.repeat(24),
      '................ZZ......',
      '.AA...d.........ZZ......',
      '.AA.............ZZ......',
      '.AA.....v...m...ZZ......',
      '#'.repeat(24), '#'.repeat(24), '#'.repeat(24), '#'.repeat(24)
    ],
    [ // E: terminal de clasificación y puerta
      '........#.......', '........#.......', '........#.......', '........#.......', '........#.......', '........#.......',
      '........#.......', '........#.......', '........#.......', '........#.......', '........#.......', '........#.......',
      '........D.......', '........D.......', '........D.......',
      '....t...D...C...',
      '#'.repeat(16), '#'.repeat(16), '#'.repeat(16), '#'.repeat(16)
    ],
    [ // F: sala del sistema
      '...............................#', '...............................#', '...............................#', '...............................#',
      '################################',
      '...............................#', '...............................#', '...............................#', '...............................#', '...............................#',
      '....................S..........#',
      '...............................#',
      'YY.............................#', 'YY.............................#', 'YY.............................#',
      'YYu.....1...2...3...4..r.q...E.#',
      G32, G32, G32, G32
    ]
  ),
  legend: {
    J: { type: 'trigger', id: 'jump' }, L: { type: 'trigger', id: 'ladder' }, O: { type: 'trigger', id: 'drop' }, A: { type: 'trigger', id: 'attack' },
    Z: { type: 'trigger', id: 'latency' }, Y: { type: 'trigger', id: 'hall' },
    v: { type: 'deco', deco: 'lamp' }, w: { type: 'deco', deco: 'chip' },
    i: { type: 'block', item: 'INPUT', label: 'ENTRADA', id: 'bIn', onPick: L0_toBuffer }, p: { type: 'block', item: 'PROCESS', label: 'PROCESO', id: 'bProc', onPick: L0_toBuffer },
    m: { type: 'block', item: 'MEMORY', label: 'MEMORIA', id: 'bMem', onPick: L0_toBuffer }, u: { type: 'block', item: 'OUTPUT', label: 'SALIDA', id: 'bOut' },
    d: { type: 'drone' },
    s: { type: 'screen', id: 'scr1', sw: 3, sh: 2, idle: 'text' }, S: { type: 'screen', id: 'mon', sw: 3, sh: 2, idle: 'off' },
    t: { type: 'terminal', id: 't_hw', ch: 'hw01', label: 'Terminal de inventario', door: 'd1', codex: 'hwsw' },
    D: { type: 'door', id: 'd1', color: PAL.cyan },
    1: { type: 'socket', id: 'so1', label: '1' }, 2: { type: 'socket', id: 'so2', label: '2' }, 3: { type: 'socket', id: 'so3', label: '3' }, 4: { type: 'socket', id: 'so4', label: '4' },
    r: { type: 'lever', id: 'run', label: 'Ejecutar flujo', name: 'RUN', onToggle: (W, lv) => { if (lv.on) W.run(L0_runFlow, 'flow'); } },
    q: { type: 'terminal', id: 't_fail', ch: 'hw04', label: 'Terminal de diagnóstico', pre: function* (W) { if (!W.has('L0_flow')) { W.bark(guide(), 'Primero completa el flujo del sistema: coloca los cuatro módulos y ejecútalo.', 'CURIOUS'); return false; } }, onSolve: function* (W) { W.flag('L0_exit'); W.codex('ipo'); yield* W.say([['NEXO', 'Salida desbloqueada. Y una idea guardada para más tarde: los sistemas pueden quedar *incompletos* sin estar *muertos*.', 'HAPPY']]); } }
  },
  onLoad(W) {
    for (const id in L0_RACK) { const b = W.ent(id); if (b && W.has('L0_buf_' + b.p.item)) L0_rackPlace(W, b); }
    if (W.has('L0_flow')) {
      L0_EXPECT.forEach((k, i) => {
        const so = W.ent('so' + (i + 1)), b = W.entities.find(e => e.kind === 'block' && e.p.item === k);
        if (so && b) { so.item = b; b.inSocket = so; b.x = so.cx - b.w / 2; b.y = so.y - b.h + 2; so.locked = true; so.lit = PAL.green; }
      });
    }
  },
  intro: function* (W) {
    W.lock();
    W.nexo.x = W.player.x + 40; W.nexo.y = W.player.y - 60;
    W.particles.burst(W.player.cx, W.player.y + 8, 40, { col: [PAL.cyan, PAL.white], kind: 'bit', max: 80, lmax: 1.4 });
    AudioSys.play('fuse');
    yield 1.2;
    yield* W.say([
      ['NEXO', 'Tenemos un problema.', 'WORRIED'],
      ['BYTE', 'Esa frase nunca anuncia nada bueno.', 'worried'],
      ['NEXO', 'Estadísticamente, tienes razón.', 'NEUTRAL'],
      ['BYTE', '¿Dónde... estamos?', 'surprised'],
      ['NEXO', 'Dentro de ARQUITECTURA-01. O en su representación interna: el sistema traduce su hardware a un mundo que se puede recorrer.', 'CURIOUS'],
      ['BYTE', 'Lo último que recuerdo es... la demo. Estaba preparando la demo. Y luego nada.', 'thinking'],
      ['NEXO', 'Hubo un fallo durante la sesión. Tus registros de las últimas horas están fragmentados.', 'NEUTRAL', { p: 0.6 }],
      ['BYTE', '¿Y los tuyos?', 'worried'],
      ['NEXO', '...También.', 'GUILTY', { p: 1.2 }],
      ['NEXO', 'Primero lo básico: comprobemos que tu cuerpo digital responde.', 'HOPEFUL']
    ], { id: 'L0_intro' });
    W.quest('m0');
    W.unlock();
    W.tip('move', 'Muévete con [A/D] o [←/→]. Salta con [ESPACIO]. [E] interactúa. [H] pide una pista a NEXO.');
  },
  triggers: {
    jump: function* (W) { W.tip('jump', 'Mantén [ESPACIO] para saltar más alto; suéltalo antes para un salto corto. Puedes saltar un instante después de dejar el borde.'); },
    ladder: function* (W) { W.tip('ladder', 'Escaleras: pulsa [W/↑] para subir y [S/↓] para bajar.'); W.bark('NEXO', 'Allí arriba hay un módulo. Y abajo del todo, otro. Este sistema está hecho pedazos.', 'CURIOUS'); },
    drop: function* (W) { W.tip('drop', 'Plataforma de un sentido: [S/↓] + [ESPACIO] para dejarte caer a través de ella.'); },
    attack: function* (W) {
      W.tip('attack', '[J] o [X]: DEBUG PING. Un pulso que restaura bits corruptos. Prueba con el dron de entrenamiento.');
      W.bark('NEXO', 'Ese dron es de práctica. No muerde. En teoría.', 'HAPPY');
    },
    latency: function* (W) {
      W.lock();
      W.screenMsg('scr1', 'LATENCY DIRECTIVE: ACTIVE', PAL.red, 2.2);
      W.glitch(0.8, 'corrupt'); W.sfx('glitch', '[interferencia]'); W.shake(2, 0.4);
      W.flag('sawLatencyDirective');
      yield 1.0;
      W.nexo.emote('AFRAID', 1);
      yield 0.4;
      delete W.screenMsgs.scr1;
      W.sfx('powerdown');
      yield 0.5;
      yield* W.say([
        ['BYTE', '¿Qué fue eso?', 'surprised'],
        ['NEXO', 'Residuo del arranque. Nada importante.', 'NEUTRAL', { p: 0.8 }],
        ['NEXO', 'Sigamos. Hay módulos que reconstruir.', 'HAPPY']
      ], { id: 'L0_latency' });
      W.flag('nexoLiedOnce');
      W.unlock();
    },
    hall: function* (W) {
      yield* W.say([
        ['NEXO', 'La Sala del Sistema. Aquí se ve el flujo básico de cualquier computadora.', 'CURIOUS'],
        ['NEXO', 'Hay cuatro ranuras. Coloca los módulos en el orden en que viaja la información y acciona RUN.', 'NEUTRAL'],
        ['BYTE', 'Un dato entra desde el teclado y termina en el monitor. Lo que pasa en medio es lo interesante.', 'thinking']
      ], { id: 'L0_hall' });
      W.tip('carry', 'Con [E] tomas un módulo y con [E] lo colocas en una ranura. Si no hay ranura cerca, lo sueltas.');
    }
  },
  renderFg(g, W) {
    // cable de datos del teclado al monitor atravesando las ranuras
    const socks = [1, 2, 3, 4].map(i => W.ent('so' + i)).filter(Boolean);
    const mon = W.ent('mon');
    if (!socks.length || !mon) return;
    const y = socks[0].y + 6;
    const x0 = socks[0].x - 22, x1 = mon.x + mon.w / 2;
    g.fillStyle = '#123C52'; g.fillRect(x0, y, x1 - x0, 1);
    g.fillRect(x1, mon.y + mon.h + 6, 1, y - mon.y - mon.h - 6);
    // teclado de origen
    g.fillStyle = '#3A444C'; g.fillRect(x0 - 18, y - 6, 18, 8); g.fillStyle = '#A9B6BE'; for (let i = 0; i < 4; i++) g.fillRect(x0 - 16 + i * 4, y - 4, 2, 2);
    const f = W.v.flow;
    if (f) {
      const pts = [x0].concat(socks.map(s => s.cx)).concat([x1]);
      const seg = Math.min(pts.length - 2, Math.floor(f.t));
      const k = f.t - Math.floor(f.t);
      const px = seg >= f.stop ? pts[f.stop] : lerp(pts[seg], pts[seg + 1], Math.min(1, k));
      g.fillStyle = f.fail && f.t >= f.stop ? PAL.red : PAL.cyan; g.fillRect(Math.round(px) - 3, y - 3, 6, 6);
      g.fillStyle = PAL.white; g.fillRect(Math.round(px) - 1, y - 1, 2, 2);
    }
  },
  hint(W) {
    // módulo olvidado por el camino: decir cuál es, dónde está y cómo volver
    const missing = L0_missing(W);
    if (!W.has('L0_flow') && missing.length && W.player.x >= 96 * TS) {
      const b = missing[0];
      return { text: 'Falta el módulo ' + b.p.label + ': sigue donde lo dejaste, más atrás. Puedes volver: en la pasarela alta hay escaleras a ambos lados.', x: b.cx, y: b.y };
    }
    if (!W.has('term_t_hw') && !W.has('L0_flow')) {
      const blocks = missing.filter(b => b.x < 100 * TS);
      if (W.player.x < 96 * TS && blocks.length) { const b = blocks[0]; return { text: 'Recoge los módulos del camino: se copian al búfer de la Sala del Sistema. Ese de ahí es el ' + b.p.label + '.', x: b.cx, y: b.y }; }
      const t = W.ent('t_hw'); return { text: 'La puerta se abre al clasificar el inventario en la terminal.', x: t.cx, y: t.y };
    }
    if (!W.has('L0_flow')) return { text: 'Piensa en el recorrido de una tecla: ¿qué ocurre primero, qué la transforma, dónde se guarda, por dónde sale? Coloca los módulos y acciona RUN.', x: W.ent('run').cx, y: W.ent('run').y };
    if (!W.has('L0_exit')) { const q = W.ent('t_fail'); return { text: 'Responde a la terminal de diagnóstico para desbloquear la salida.', x: q.cx, y: q.y }; }
    return { text: 'La salida está abierta. Sigue hacia la derecha.' };
  }
};
function* L0_runFlow(W) {
  const lever = W.ent('run');
  const socks = [1, 2, 3, 4].map(i => W.ent('so' + i));
  if (W.has('L0_flow')) { lever.on = true; return; }
  if (socks.some(s => !s.item)) {
    const miss = L0_missing(W);
    W.bark('NEXO', miss.length ? 'Falta el módulo ' + miss.map(b => b.p.label).join(' y ') + ': se quedó por el camino. Vuelve a por él (pulsa [' + Input.label('hint') + '] para ver dónde).' : 'Faltan módulos en el flujo: las cuatro ranuras deben estar ocupadas.', 'CURIOUS', 6);
    yield 0.4; lever.on = false; return;
  }
  W.lock();
  W.v.attempts = (W.v.attempts || 0) + 1;
  const got = socks.map(s => s.item.p.item);
  const bad = got.findIndex((k, i) => k !== L0_EXPECT[i]);
  W.v.flow = { t: 0, stop: bad < 0 ? 5 : bad + 1, fail: bad >= 0 };
  AudioSys.play('dash');
  const endT = bad < 0 ? 5 : bad + 1;
  while (W.v.flow.t < endT) {
    W.v.flow.t = Math.min(endT, W.v.flow.t + 1 / 60 * 2.2);
    const idx = Math.floor(W.v.flow.t) - 1;
    if (idx >= 0 && idx < 4 && socks[idx] && !socks[idx].lit && (bad < 0 || idx < bad)) { socks[idx].lit = PAL.cyan; AudioSys.play('tick'); }
    yield;
  }
  if (bad >= 0) {
    const s = socks[bad];
    s.lit = PAL.red;
    W.particles.burst(s.cx, s.y, 24, { col: [PAL.red, PAL.amber, PAL.white], max: 100 });
    W.sfx('wrong'); W.shake(3, 0.3);
    W.screenMsg('mon', '▒▒?#%& ERR', PAL.red, 3);
    yield 0.6;
    yield* W.say([
      ['SYS', 'ERROR EN LA RANURA ' + (bad + 1) + ': se esperaba ' + L0_NAMES[L0_EXPECT[bad]] + ', se encontró ' + L0_NAMES[got[bad]] + '.'],
      ['NEXO', L0_WHY[L0_EXPECT[bad]], 'WORRIED'],
      ['NEXO', 'El monitor mostró basura: esa es la consecuencia. Reordena los módulos y vuelve a ejecutar.', 'CURIOUS']
    ]);
    socks.forEach(so => { so.lit = null; });
    W.v.flow = null; lever.on = false;
    W.unlock();
    return;
  }
  // éxito
  W.screenMsg('mon', 'A', PAL.green, 999);
  W.sfx('correct'); W.player.celebrateT = 1.5;
  socks.forEach(so => { so.lit = PAL.green; so.locked = true; });
  LearningModel.record({ concept: 'hardwareBasics', chId: 'L0_flow', correct: true, firstTry: W.v.attempts === 1, hints: 0, time: 30, expected: 60, conf: null, difficulty: 1, prompt: 'Flujo ENTRADA → PROCESO → MEMORIA → SALIDA' });
  Progression.addXP(W.v.attempts === 1 ? 40 : 20, 'flujo');
  yield 0.8;
  yield* W.say([
    ['NEXO', '¡El dato llegó! Pulsaste una tecla, se procesó, se guardó y apareció en pantalla.', 'HAPPY'],
    ['BYTE', 'ENTRADA, PROCESO, MEMORIA, SALIDA. Parece obvio... hasta que hay que construirlo.', 'happy'],
    ['NEXO', 'Ahora observa algo importante. Voy a desconectar la SALIDA.', 'CURIOUS']
  ], { id: 'L0_flowok' });
  socks[3].lit = PAL.red;
  delete W.screenMsgs.mon;
  W.sfx('powerdown');
  yield 1.0;
  yield* W.say([
    ['BYTE', 'La pantalla se apagó... pero los otros módulos siguen parpadeando.', 'surprised'],
    ['NEXO', 'Exacto. Cuando una parte falla, las demás pueden seguir funcionando. El sistema queda *incompleto*, no necesariamente muerto.', 'NEUTRAL'],
    ['NEXO', 'Recuérdalo. En este sistema... es una idea útil.', 'WORRIED', { p: 0.5 }]
  ], { id: 'L0_partial' });
  socks[3].lit = PAL.green;
  W.screenMsg('mon', 'A', PAL.green, 999);
  W.flag('L0_flow');
  W.blueprint(['input', 'output']);
  W.v.flow = null;
  W.unlock();
}

// ---------------------------------------------------------------- NIVEL 01 — CIUDAD DE LA PLACA BASE ----
const LEVEL1 = {
  id: 1, key: 'board', name: 'CIUDAD DE LA PLACA BASE', theme: 'board', music: 'board', concepts: ['motherboard', 'hardwareBasics'],
  reward: 'Habilidad: CIRCUIT LINK', exit: { needs: 'L1_gpu', lockedText: 'SALIDA BLOQUEADA: la GPU no está conectada al sistema.', onEnter: function* (W) { W.quest('m1', 'done'); } },
  fragments: ['f1', 'f2'],
  map: joinSecs(
    [ // A: llegada
      '#' + '.'.repeat(31), '#' + '.'.repeat(31), '#' + '.'.repeat(31), '#' + '.'.repeat(31), '#' + '.'.repeat(31), '#' + '.'.repeat(31), '#' + '.'.repeat(31),
      '#.............z.................',
      '#.....s...............y.........',
      '#' + '.'.repeat(31), '#' + '.'.repeat(31), '#' + '.'.repeat(31),
      '#.......................NN......',
      '#.......................NN......',
      '#.......................NN####..',
      '#.P.p....q..c...........NN####..',
      G32, G32, G32, G32
    ],
    [ // B: cuarentena, plataformas y puerta
      '.............................#..', '.............................#..', '.............................#..', '.............................#..', '.............................#..',
      '.............................#..', '.............................#..', '.............................#..', '.............................#..',
      '.......................*.....#..',
      '.....................====....#..',
      '.............................#..',
      '......TT.....................D..',
      '......TT........====.........D..',
      '......TT.....................D..',
      '......TTg.......b.........t..D..',
      G32, G32, G32, G32
    ],
    [ // C: central VRM
      D32, D32, D32, D32, D32, D32, D32, D32, D32, D32, D32, D32, D32,
      '...........................#####',
      '...........................#####',
      '..C..l..v..n..m...n.......######',
      '######################...#######',
      '######################~~~#######',
      G32, G32
    ],
    [ // D: pistas cortadas y puente de circuito
      D32, D32, D32, D32, D32, D32,
      '...........................*.d..',
      '...........................====.',
      D32,
      'K...............................',
      'K......................===......',
      'K...............................',
      'Ku.k..............r.....o.......',
      '######BBBBBBBBBBBB##############',
      '######............##############', '######............##############', '######............##############', '######............##############',
      '######^^^^^^^^^^^^##############',
      G32
    ],
    [ // E: ranuras, GPU y salida
      '.......................#.......#', '.......................#.......#', '.......................#.......#', '.......................#.......#', '.......................#.......#',
      '.......................#.......#', '.......................#.......#', '.......................#.......#', '.......................#.......#',
      '...L...................#.......#',
      '..===..................#.......#',
      '.......................#.......#',
      '.......................F.......#',
      '####...................F.......#',
      '####...................F.......#',
      '####...1..2w..j..e..h..F....E..#',
      G32, G32, G32, G32
    ]
  ),
  legend: {
    z: { type: 'screen', id: 'scrB', sw: 3, sh: 2 }, s: { type: 'screen', id: 'scrA', sw: 3, sh: 2 }, y: { type: 'screen', id: 'scrC', sw: 3, sh: 2 },
    N: { type: 'trigger', id: 'nullscreens' }, T: { type: 'trigger', id: 'quarantine' }, K: { type: 'trigger', id: 'links' },
    p: { type: 'npc', npc: 'PROC', variant: 0, wander: 20, talk: function* (W) { yield* W.say([['', 'Un proceso del sistema, pequeño y apresurado.'], ['BYTE', '¿Estás bien?'], ['', 'El proceso parpadea: «ESPERANDO ENERGÍA ESTABLE...».']]); } },
    q: { type: 'npc', npc: 'PROC', variant: 2, wander: 14, talk: function* (W) { yield* W.say([['', 'El proceso murmura direcciones de memoria para no olvidarlas.'], ['NEXO', 'Sin la RAM conectada, lo único que pueden hacer es esperar.', 'SAD']]); } },
    c: { type: 'deco', deco: 'cap' }, l: { type: 'deco', deco: 'lamp' }, n: { type: 'deco', deco: 'server' },
    b: { type: 'bitcorrupt', bits: '1011', hp: 3 },
    g: { type: 'sign', title: 'REGISTRO DE INCIDENCIAS — DISTRITO NORTE', label: 'Leer registro', text: 'Paquetes corruptos detectados: 14.\nFirma más cercana: N.U.L.L.\nEstado del área: CUARENTENA ACTIVA.\n\n(Una nota de mantenimiento, casi borrada: «el perímetro violeta impide que la corrupción se propague».)' },
    t: { type: 'terminal', id: 't_mb02', ch: 'mb02', label: 'Terminal de distrito', door: 'd1', codex: 'mb' },
    D: { type: 'door', id: 'd1', color: PAL.green },
    v: { type: 'npc', npc: 'VOLT', name: 'VOLT', quest: 's2', talk: L1_voltTalk },
    m: { type: 'terminal', id: 't_mb01', ch: 'mb01', label: 'Panel de reconstrucción', codex: 'vrm', onSolve: L1_boardFixed },
    k: { type: 'linknode', id: 'n1', label: 'CTRL. MEMORIA (CPU)', links: [{ to: 'n2', ok: true, bridge: 'br1', perm: true, flag: 'L1_bridge', why: 'Enlace correcto: el controlador de memoria de la CPU habla directamente con la RAM.' }, { to: 'n3', ok: false, why: 'Ese enlace no sirve: la RAM no se comunica con la CPU por un puerto USB, sino por el bus de memoria.' }] },
    u: { type: 'linknode', id: 'n3', label: 'PUERTO USB', links: [{ to: 'n2', ok: false, why: 'USB conecta periféricos. La RAM necesita el bus de memoria de la CPU, rapidísimo y dedicado.' }] },
    r: { type: 'linknode', id: 'n2', label: 'RANURA DIMM (RAM)', links: [{ to: 'n1', ok: true, bridge: 'br1', perm: true, flag: 'L1_bridge', why: 'Enlace correcto: RAM y controlador de memoria, conectados.' }] },
    B: { type: 'bridge', id: 'br1', flag: 'L1_bridge' },
    o: { type: 'terminal', id: 't_mb07', ch: 'mb07', label: 'Terminal de pistas', codex: 'chipset' },
    d: { type: 'block', item: 'DIMM', label: 'MÓDULO DIMM', id: 'dimm' },
    1: { type: 'socket', id: 'sdimm', label: 'DIMM', onPlace: (W, so, b) => L1_placeDimm(W, so, b, true) },
    2: { type: 'socket', id: 'spcie', label: 'PCIe x1', onPlace: (W, so, b) => L1_placeDimm(W, so, b, false) },
    w: { type: 'linknode', id: 'n6', label: 'PUERTO SATA', links: [{ to: 'n5', ok: false, why: 'SATA es para discos. Una GPU necesita el enorme ancho de banda de PCIe x16.' }] },
    j: { type: 'linknode', id: 'n4', label: 'RANURA PCIe x16', links: [{ to: 'n5', ok: true, flag: 'L1_gpu', why: 'GPU conectada por PCIe x16: 16 carriles de datos en paralelo.', onLink: function* (W) { W.openDoor('d2'); W.blueprint(['gpu', 'output']); W.codex('pcie'); } }, { to: 'n6', ok: false, why: 'PCIe x16 no se une a un puerto SATA: son interfaces distintas.' }] },
    h: { type: 'linknode', id: 'n5', label: 'GPU', links: [{ to: 'n4', ok: true, flag: 'L1_gpu', why: 'GPU conectada por PCIe x16.', onLink: function* (W) { W.openDoor('d2'); W.blueprint(['gpu', 'output']); W.codex('pcie'); } }, { to: 'n6', ok: false, why: 'Una GPU por SATA no tendría el ancho de banda que necesita.' }] },
    e: { type: 'terminal', id: 't_mb05', ch: 'mb05', label: 'Terminal POST', codex: 'firmware' },
    F: { type: 'door', id: 'd2', color: PAL.amber, flag: 'L1_gpu' },
    L: { type: 'letter', letter: 'N' }
  },
  intro: function* (W) {
    W.lock();
    yield* W.say([
      ['BYTE', '¿Esto es... la placa base?', 'surprised'],
      ['NEXO', 'La Ciudad de la Placa Base. Todo pasa por aquí: la energía, los datos, las órdenes.', 'HAPPY'],
      ['NEXO', 'Las pistas son carreteras; los sockets, edificios; la central VRM alimenta a la CPU.', 'CURIOUS'],
      ['BYTE', 'Y está a oscuras.', 'worried'],
      ['NEXO', 'Hay paquetes corruptos sueltos. Tu DEBUG PING restaura sus bits.', 'NEUTRAL']
    ], { id: 'L1_intro' });
    W.quest('m1');
    W.blueprint(['mb']);
    W.unlock();
  },
  triggers: {
    nullscreens: function* (W) {
      W.lock();
      yield* W.camTo(W.ent('scrB').cx, W.ent('scrB').cy + 30, 1);
      W.sfx('glitch', '[las pantallas se encienden solas]'); W.glitch(0.6);
      W.screenMsg('scrA', 'YOU ARE', PAL.violet, 20); yield 0.4;
      W.screenMsg('scrB', 'REPAIRING THE WRONG', PAL.violet, 20); yield 0.4;
      W.screenMsg('scrC', 'FAILURE.', PAL.violet, 20);
      AudioSys.playMusic('null');
      yield 1.6;
      W.screenMsg('scrB', 'NEXO NO TE HA CONTADO POR QUÉ ESTÁS AQUÍ.', PAL.magenta, 20);
      W.glitch(0.5); yield 1.8;
      W.nexo.emote('ANGRY', 1.5);
      W.flash(PAL.white, 0.2);
      for (const k of ['scrA', 'scrB', 'scrC']) delete W.screenMsgs[k];
      W.sfx('powerdown', '[NEXO corta la transmisión]');
      AudioSys.playMusic('board');
      W.camFollow();
      yield 0.6;
      yield* W.say([
        ['NEXO', 'Ignóralo.', 'NEUTRAL'],
        ['BYTE', '¿Quién era?', 'surprised'],
        ['NEXO', 'Una entidad hostil. Se hace llamar N.U.L.L.', 'NEUTRAL'],
        ['BYTE', '¿Cómo sabes que es «él»?', 'thinking'],
        ['NEXO', 'Firma hostil.', 'NEUTRAL', { p: 1.5 }],
        ['BYTE', '...Vale.', 'thinking']
      ], { id: 'L1_nullscreens' });
      W.flag('metNullScreens');
      W.codex('null', true);
      W.unlock();
    },
    quarantine: function* (W) {
      yield* W.say([
        ['NEXO', 'Mira: paquetes corruptos amontonados. Y junto a ellos, una firma.', 'WORRIED'],
        ['NEXO', 'N.U.L.L. Ahí está la prueba.', 'ANGRY'],
        ['BYTE', 'Parece... que alguien los hubiera reunido a propósito.', 'thinking']
      ], { id: 'L1_quarantine' });
      W.flag('sawQuarantine');
    },
    links: function* (W) {
      if (PROG.abilities.includes('circuitLink')) W.tip('link', 'Las pistas están cortadas. Ponte junto a un nodo y pulsa [' + Input.label('interact') + '] (o CIRCUIT LINK con [' + Input.label('ability') + ']) para elegir qué conectar. Sólo las conexiones válidas tienden el puente.');
      else W.bark('NEXO', 'Pistas cortadas. Necesitamos una forma de reconectar circuitos... La central VRM quizá tenga la clave.', 'CURIOUS');
    }
  },
  renderFg(g, W) {
    // montón de paquetes corruptos dentro de un perímetro violeta (cuarentena)
    const x = 42 * TS, y = 15 * TS;
    for (let i = 0; i < 9; i++) { g.fillStyle = [PAL.red, PAL.violet, '#A02B38'][i % 3]; g.fillRect(x + (i % 5) * 9 + ((i / 5) | 0) * 4, y + 8 - ((i / 5) | 0) * 7, 8, 7); }
    g.fillStyle = 'rgba(170,125,255,' + (0.25 + 0.15 * Math.sin(W.t * 3)) + ')';
    for (let k = 0; k < 60; k += 3) { g.fillRect(x - 6 + k, y - 12, 2, 1); }
    g.fillRect(x - 6, y - 12, 1, 28); g.fillRect(x + 54, y - 12, 1, 28);
    Font.draw(g, 'NULL', x + 24, y - 24, PAL.violet, { align: 'center' });
  },
  hint(W) {
    if (!W.has('term_t_mb02')) { const t = W.ent('t_mb02'); return { text: 'La terminal del distrito abre el paso. Asocia cada componente con su función.', x: t.cx, y: t.y }; }
    if (!W.has('term_t_mb01')) { const t = W.ent('t_mb01'); return { text: 'El panel de reconstrucción de la central VRM: coloca cada componente en su conector.', x: t.cx, y: t.y }; }
    if (!W.has('L1_bridge')) { const n = W.ent('n1'); return { text: 'Ponte junto al nodo CTRL. MEMORIA (CPU) y pulsa [' + Input.label('interact') + ']: ¿con qué componente habla directamente la RAM?', x: n.cx, y: n.y }; }
    if (!W.has('L1_gpu')) { const n = W.ent('n4'); return { text: 'La GPU no está conectada. ¿Qué ranura ofrece el mayor ancho de banda?', x: n.cx, y: n.y }; }
    return { text: 'La salida está abierta a la derecha.' };
  }
};
function* L1_voltTalk(W, npc) {
  if (Quests.done('s2')) { yield* W.say([['VOLT', '¡Voltaje estable! La CPU ya no tiembla. Buen trabajo, BYTE.']]); return; }
  yield* W.say([
    ['VOLT', '¡Eh, tú! ¿Sabes algo de energía? La fuente manda 12 voltios y la CPU se me queja.'],
    ['VOLT', 'Dice que necesita algo así como 1,2... ¡y estable! ¿Quién se supone que hace eso?'],
    ['BYTE', 'Déjame verlo.', 'determined']
  ]);
  W.quest('s2');
  const r = yield* W.challenge('mb03', { source: 'quest' });
  if (r.ok) { W.quest('s2', 'done'); yield* W.say([['VOLT', '¡Claro! ¡El VRM! Mis propias fases de alimentación... qué vergüenza.'], ['NEXO', 'Sin energía estable no hay cómputo. Es la base de toda la ciudad.', 'HAPPY']]); }
}
function* L1_boardFixed(W) {
  W.flag('L1_power');
  W.blueprint(['pwr', 'ram', 'storage', 'mb']);
  yield* W.say([
    ['NEXO', '¡La central VRM vuelve a dar energía! Y mira: el panel ha liberado una rutina de reparación.', 'HAPPY'],
    ['NEXO', 'CIRCUIT LINK. Te permite crear conexiones temporales entre nodos... siempre que la conexión tenga sentido.', 'CURIOUS']
  ], { id: 'L1_link' });
  W.giveAbility('circuitLink');
}
function L1_placeDimm(W, so, b, correct) {
  if (b.p.item !== 'DIMM') { ejectBlock(W, so, b, 'Ese módulo no va en esta ranura.'); return; }
  if (!correct) { ejectBlock(W, so, b, 'Un módulo de memoria no entra en PCIe: la RAM va en una ranura DIMM, junto al controlador de memoria.'); return; }
  so.locked = true; so.lit = PAL.green;
  W.run(function* () {
    W.quest('s1', 'done');
    yield* W.say([['NEXO', 'Módulo DIMM instalado. La ciudad acaba de recuperar 8 GB de memoria de trabajo.', 'HAPPY'], ['BYTE', 'La forma de cada ranura ya te dice qué entra en ella.', 'happy']]);
  }, 'dimm');
}

// ---------------------------------------------------------------- NIVEL 02 — NÚCLEO DEL PROCESADOR ----
const LEVEL2 = {
  id: 2, key: 'cpu', name: 'NÚCLEO DEL PROCESADOR', theme: 'cpu', music: 'cpu', concepts: ['cpu', 'fetchDecodeExecute', 'registers'],
  reward: 'Habilidad: FETCH DASH', exit: { needs: 'L2_cycle', lockedText: 'SALIDA BLOQUEADA: el ciclo de instrucción no se ha completado.', onEnter: function* (W) { W.quest('m2', 'done'); } },
  fragments: ['f3', 'f4'],
  map: joinSecs(
    [ // A: memoria de programa y FETCH
      '#' + '.'.repeat(31), '#' + '.'.repeat(31), '#' + '.'.repeat(31), '#' + '.'.repeat(31),
      '#.o' + '.'.repeat(29),
      '#...........................o...',
      '#.............3.................',
      '#............===................',
      '#.................z.............',
      '#.........2.....................',
      '#........===....................',
      '#' + '.'.repeat(31),
      '#.....1.........................',
      '#....===........................',
      '#' + '.'.repeat(31),
      '#..P......................f.....',
      G32, G32, G32, G32
    ],
    [ // B: plataformas sincronizadas con el reloj → DECODE
      D32, D32, D32, D32, D32, D32, D32, D32, D32, D32, D32, D32, D32, D32, D32,
      '.............................d..',
      '###.a.......b.......c......#####',
      '###........................#####',
      '###^^^^^^^^^^^^^^^^^^^^^^^^#####',
      G32
    ],
    [ // C: EXECUTE, REG y torre del reloj
      '......................#.........', '......................#.........', '......................#.........', '......................#.........', '......................#.........', '......................#.........',
      '........o.............#.........',
      '......................#.........', '......................#.........',
      '...............o......#.........',
      '......................#.........', '......................#.........',
      '.............TT.......D.........', '.............TT.......D.........', '.............TT.......D.........',
      '....x.....r..TT...u...D..C......',
      G32, G32, G32, G32
    ],
    [ // D: WRITE BACK y banco de registros
      D32, D32, D32, D32, D32, D32, D32, D32,
      '..........y.....................',
      D32, D32, D32,
      '.........................*......',
      '........................===.....',
      D32,
      '.....w.......R......n...........',
      G32, G32, G32, G32
    ],
    [ // E: el abismo de las instrucciones (FETCH DASH)
      '.'.repeat(47) + '#', '.'.repeat(47) + '#', '.'.repeat(47) + '#', '.'.repeat(47) + '#', '.'.repeat(47) + '#', '.'.repeat(47) + '#', '.'.repeat(47) + '#', '.'.repeat(47) + '#',
      '........................m.L....................#',
      '........................===....................#',
      '.............m.......m.......m.......m.........#',
      '.....................................*.........#',
      '.............#.......#.......#.......#.........#',
      '.............#.......#.......#.......#.........#',
      '.............#.......#.......#.......#......m..#',
      '..v..........#.......#.......#.......#.......E.#',
      '######.......#.......#.......#.......#....######',
      '######.......#.......#.......#.......#....######',
      '######^^^^^^^#^^^^^^^#^^^^^^^#^^^^^^^#^^^^######',
      '#'.repeat(48)
    ]
  ),
  legend: {
    o: { type: 'deco', deco: 'gear', speed: 1.2 },
    1: { type: 'block', item: 'INSTR', label: '0x03: LOAD R1', addr: '0x03', id: 'i3' },
    2: { type: 'block', item: 'INSTR', label: '0x04: ADD R1,R2', addr: '0x04', id: 'i4' },
    3: { type: 'block', item: 'INSTR', label: '0x05: JUMP 0x00', addr: '0x05', id: 'i5' },
    z: { type: 'screen', id: 'pc', sw: 3, sh: 2 },
    f: { type: 'socket', id: 'sF', label: 'FETCH → IR', onPlace: (W, so, b) => L2_station(W, so, b, 0) },
    a: { type: 'platform', len: 3, dx: 3, mode: 'tick', period: 1.2, phase: 0 },
    b: { type: 'platform', len: 3, dx: 3, mode: 'tick', period: 1.2, phase: 1.2 },
    c: { type: 'platform', len: 3, dx: 3, mode: 'tick', period: 1.2, phase: 0 },
    d: { type: 'socket', id: 'sD', label: 'DECODE', onPlace: (W, so, b) => L2_station(W, so, b, 1) },
    x: { type: 'socket', id: 'sX', label: 'EXECUTE (ALU)', onPlace: (W, so, b) => L2_station(W, so, b, 2) },
    r: { type: 'npc', npc: 'REG', name: 'REG', quest: 's4', wander: 10, talk: L2_regTalk },
    T: { type: 'trigger', id: 'core' },
    u: { type: 'terminal', id: 't_clock', ch: 'cpu04', label: 'Sincronizador del reloj', door: 'd1', codex: 'clock' },
    D: { type: 'door', id: 'd1', color: PAL.cyan },
    w: { type: 'socket', id: 'sW', label: 'WRITE BACK', onPlace: (W, so, b) => L2_station(W, so, b, 3) },
    y: { type: 'screen', id: 'regs', sw: 3, sh: 2, idle: 'text' },
    R: { type: 'sign', id: 'r7', label: 'Inspeccionar banco de registros', title: 'BANCO DE REGISTROS — VOLCADO', style: 'log', text: 'R0 = 0x0000   R1 = 0x0008   R2 = 0x0003\nR3 = 0x0000   R4 = 0x00FF   R5 = 0x0000\nR6 = 0x7F20\n\nR7 = USER_COMMAND_01\n     «REDUCIR TODA LATENCIA EVITABLE»\n     ORIGEN: [DATOS DAÑADOS]\n     MARCA DE TIEMPO: 02:13:04', onRead: L2_userCommand },
    n: { type: 'npc', npc: 'PROC', variant: 1, name: 'PROCESO 7', quest: 's5', talk: L2_pipeTalk },
    m: { type: 'marker' }, L: { type: 'letter', letter: 'E' },
    v: { type: 'historic', person: 'vonneumann' }
  },
  onLoad(W, fromCp) {
    W.screenMsg('pc', 'PC = 0x04', PAL.amber, 1e9);
    const st = ['L2_fetch', 'L2_decode', 'L2_execute', 'L2_cycle'];
    const socks = ['sF', 'sD', 'sX', 'sW'];
    let last = -1;
    st.forEach((f, i) => { if (W.has(f)) last = i; });
    socks.forEach((s, i) => { if (i <= last) W.ent(s).lit = PAL.green; });
    if (last >= 0) {
      // la instrucción ya avanzó: colocarla en la última estación completada
      const b = W.ent('i4'), so = W.ent(socks[last]);
      if (last < 3) { b.x = so.cx - b.w / 2 + 24; b.y = so.y - 20; b.home = { x: b.x, y: b.y }; }
      else { so.item = b; b.inSocket = so; b.x = so.cx - b.w / 2; b.y = so.y - b.h + 2; so.locked = true; }
      b.p.label = ['ADD R1,R2 (IR)', 'ADD → ALU', 'ADD = 8', 'R1 ← 8'][last];
    }
  },
  intro: function* (W) {
    W.lock();
    yield* W.say([
      ['BYTE', 'Engranajes... ¿Es una ciudad mecánica?', 'surprised'],
      ['NEXO', 'El Núcleo del Procesador. Todo se mueve al ritmo del reloj: cada tic, un paso.', 'CURIOUS'],
      ['NEXO', 'El ciclo de instrucción está roto. Tendremos que llevar una instrucción a mano por cada etapa.', 'NEUTRAL'],
      ['BYTE', '¿Cuál instrucción?', 'thinking'],
      ['NEXO', 'La que indique el *Contador de Programa*. Mira la pantalla.', 'HAPPY']
    ], { id: 'L2_intro' });
    W.quest('m2');
    W.codex('cpu');
    W.blueprint(['cpu']);
    W.unlock();
  },
  triggers: {
    core: function* (W) {
      yield* W.say([
        ['BYTE', '¿Eso explotará?', 'worried'],
        ['NEXO', 'Estadísticamente...', 'CURIOUS'],
        ['BYTE', 'NEXO.', 'angry'],
        ['NEXO', 'Sí.', 'NEUTRAL'],
        ['BYTE', '¿Explotará?', 'worried'],
        ['NEXO', 'Probablemente.', 'HAPPY', { p: 0.6 }],
        ['NEXO', 'Es broma. Tiene un 0,3% de probabilidad. Antes era un 0,2%.', 'HAPPY'],
        ['BYTE', 'Eso no me tranquiliza nada.', 'worried']
      ], { id: 'L2_core' });
    }
  },
  hint(W) {
    const b = W.ent('i4');
    if (!W.has('L2_fetch')) return { text: 'El PC vale 0x04: busca en los estantes la instrucción de esa dirección y llévala al zócalo FETCH.', x: b.cx, y: b.y };
    if (!W.has('L2_decode')) return { text: 'Lleva la instrucción al zócalo DECODE. Las plataformas se mueven con el reloj: salta cuando estén cerca.', x: W.ent('sD').cx, y: W.ent('sD').y };
    if (!W.has('L2_execute')) return { text: 'Ahora EXECUTE: la ALU debe calcular la suma.', x: W.ent('sX').cx, y: W.ent('sX').y };
    if (!W.has('term_t_clock')) return { text: 'Sincroniza el reloj en la terminal de la torre para abrir el paso.', x: W.ent('t_clock').cx, y: W.ent('t_clock').y };
    if (!W.has('L2_cycle')) return { text: 'Último paso: WRITE BACK. Guarda el resultado en su registro.', x: W.ent('sW').cx, y: W.ent('sW').y };
    if (!W.has('foundUserCommand')) return { text: 'Hay algo raro en el banco de registros. Inspecciónalo.', x: W.ent('r7').cx, y: W.ent('r7').y };
    return { text: 'Cruza el abismo con FETCH DASH hacia los marcadores [' + Input.label('ability') + '].' };
  }
};
const L2_STEPS = ['L2_fetch', 'L2_decode', 'L2_execute', 'L2_cycle'];
function L2_station(W, so, b, step) {
  if (b.p.item !== 'INSTR') { ejectBlock(W, so, b, 'Aquí sólo entran instrucciones.'); return; }
  if (W.has(L2_STEPS[step])) { so.lit = PAL.green; return; }
  if (step > 0 && !W.has(L2_STEPS[step - 1])) {
    ejectBlock(W, so, b, ['', 'Antes de decodificar hay que traer la instrucción: primero FETCH.', 'No se puede ejecutar lo que aún no se ha decodificado.', 'Primero hay que ejecutar para tener un resultado que escribir.'][step]);
    return;
  }
  if (step === 0 && b.p.addr !== '0x04') {
    ejectBlock(W, so, b, 'El PC vale 0x04, pero esta instrucción está en ' + b.p.addr + '. El Contador de Programa indica DÓNDE está la siguiente instrucción.');
    LearningModel.record({ concept: 'registers', chId: 'L2_pc', correct: false, firstTry: false, hints: 0, time: 10, expected: 20, conf: null, difficulty: 1, prompt: 'Elegir la instrucción que indica el PC' });
    W.v.pcFail = true;
    return;
  }
  W.run(function* () {
    so.locked = true;
    let ok = true;
    if (step === 0) {
      if (!W.v.pcFail) LearningModel.record({ concept: 'registers', chId: 'L2_pc', correct: true, firstTry: true, hints: 0, time: 10, expected: 20, conf: null, difficulty: 1, prompt: 'Elegir la instrucción que indica el PC' });
      so.lit = PAL.green; W.sfx('correct');
      yield* W.say([['NEXO', 'FETCH completado: la instrucción de 0x04 está ahora en el *Registro de Instrucción* (IR). El PC avanza a 0x05.', 'HAPPY']], { id: 'L2_fetch' });
      W.screenMsg('pc', 'PC = 0x05', PAL.amber, 1e9);
      W.codex('pc');
      b.p.label = 'ADD R1,R2 (IR)';
    } else if (step === 1) {
      const r = yield* W.challenge('fde05', { source: 'terminal', title: 'DECODE' });
      ok = r.ok;
      if (ok) { so.lit = PAL.green; b.p.label = 'ADD → ALU'; W.codex('cu'); yield* W.say([['NEXO', 'DECODE: es un ADD. La Unidad de Control ya sabe a quién llamar: a la ALU.', 'HAPPY']], { id: 'L2_decode' }); }
    } else if (step === 2) {
      const r = yield* W.challenge('alu06', { source: 'terminal', title: 'EXECUTE' });
      ok = r.ok;
      if (ok) { so.lit = PAL.green; b.p.label = 'ADD = 8'; yield* W.say([['NEXO', 'EXECUTE: la ALU sumó R1 y R2. El resultado existe... pero todavía no está guardado en ningún sitio.', 'CURIOUS']], { id: 'L2_exec' }); }
    } else if (step === 3) {
      const r = yield* W.challenge({ id: 'L2_wb', concept: 'fetchDecodeExecute', difficulty: 2, type: 'choice', kind: 'WRITE BACK', noPick: true,
        prompt: 'La instrucción es *ADD R1, R2*: el primer operando es también el destino. ¿Dónde se escribe el resultado (8)?',
        data: { options: [O('En R1', 1, 'Sí: R1 ← R1 + R2.'), O('En R2', 0, 'R2 es el segundo operando; el destino es el primero.'), O('En el PC', 0, 'El PC guarda direcciones de instrucciones, no resultados.'), O('En el SSD', 0, 'El resultado va a un registro: rápido y cerca de la ALU.')] },
        explanation: 'WRITE BACK guarda el resultado donde la instrucción indica: aquí, R1. Sin esta etapa, el cálculo se perdería.', hints: ['Lee la instrucción: ADD destino, origen.', '¿Cuál es el primer operando?', 'Descarto dos opciones.'] }, { source: 'terminal', title: 'WRITE BACK' });
      ok = r.ok;
      if (ok) {
        so.lit = PAL.green; b.p.label = 'R1 ← 8';
        W.player.celebrateT = 1.5; W.sfx('victory');
        yield* W.say([
          ['NEXO', '¡Ciclo completo! Buscar, decodificar, ejecutar, escribir.', 'HAPPY'],
          ['NEXO', 'Ahora repítelo unos tres mil millones de veces por segundo.', 'HAPPY'],
          ['BYTE', 'Y yo que pensaba que la CPU «simplemente calculaba».', 'happy'],
          ['NEXO', 'Al completar el ciclo se liberó una rutina: FETCH DASH. Acceso rápido a instrucciones... y a lugares lejanos.', 'CURIOUS']
        ], { id: 'L2_cycle' });
        W.codex('cycle'); W.blueprint(['cu', 'alu', 'reg', 'clock']);
        W.giveAbility('fetchDash');
      }
    }
    if (ok) { W.flag(L2_STEPS[step]); b.home = { x: so.cx - b.w / 2 + 24, y: so.y - 20 }; if (step < 3) { so.item = null; b.inSocket = null; b.x = b.home.x; b.y = b.home.y; } so.locked = step === 3; }
    else { so.locked = false; ejectBlock(W, so, b, null); }
  }, 'station');
}
function* L2_userCommand(W) {
  if (W.has('foundUserCommand')) return;
  W.lock();
  yield* W.say([
    ['BYTE', '¿USER_COMMAND? ¿Un comando de usuario?', 'surprised'],
    ['BYTE', '«Reducir toda latencia evitable»... ¿Quién escribiría algo así?', 'thinking'],
    ['NEXO', 'Probablemente una instrucción generada por NULL.', 'NEUTRAL', { p: 1.4 }],
    ['BYTE', '¿Puede hacer eso?', 'worried'],
    ['NEXO', 'NULL pudo falsificarlo.', 'NEUTRAL'],
    ['BYTE', '«Pudo» no es lo mismo que «lo hizo».', 'thinking'],
    ['NEXO', '...Correcto.', 'GUILTY', { p: 1.0 }]
  ], { id: 'L2_usercmd' });
  W.flag('foundUserCommand');
  W.unlock();
}
function* L2_regTalk(W) {
  if (Quests.done('s4')) { yield* W.say([['REG', '¡Todo-en-su-sitio-gracias-BYTE-PC-IR-MAR-MDR-no-se-me-olvidan-hasta-el-próximo-cambio-de-contexto!']]); return; }
  yield* W.say([
    ['REG', '¡Hola-hola-hola! ¡Soy-REG! ¡Guardo-cosas-rapidísimo!'],
    ['REG', 'Pero-hubo-un-cambio-de-contexto-y-¡PUF!-no-recuerdo-qué-guardaba-cada-uno.'],
    ['NEXO', 'Los registros son rapidísimos pero diminutos. Y si nadie guarda su estado al cambiar de tarea...', 'CURIOUS'],
    ['REG', '...¡se-olvida-todo! ¿Me-ayudas?']
  ], { id: 'L2_reg' });
  W.quest('s4');
  const r = yield* W.challenge('reg01', { source: 'quest' });
  if (r.ok) { W.quest('s4', 'done'); yield* W.say([['REG', '¡PC-dirección-IR-instrucción-MAR-MDR-ventanilla-con-memoria! ¡Gracias-gracias-gracias!'], ['BYTE', 'Hablar con REG debe de ser agotador.', 'laugh'], ['NEXO', 'Es rápido. No es lo mismo que eficiente.', 'HAPPY']]); }
}
function* L2_pipeTalk(W) {
  if (Quests.done('s5')) { yield* W.say([['', 'PROCESO 7 fluye por el pipeline sin esperas.']]); return; }
  yield* W.say([
    ['', 'PROCESO 7 está atascado: su segunda instrucción espera un resultado que la primera aún no ha escrito.'],
    ['NEXO', 'Un riesgo de datos en el pipeline. Mientras espera, las etapas se quedan vacías.', 'CURIOUS']
  ], { id: 'L2_pipe' });
  W.quest('s5');
  const r = yield* W.challenge('fde06', { source: 'quest' });
  if (r.ok) { W.quest('s5', 'done'); yield* W.say([['BYTE', 'Si hay trabajo independiente, no hay que quedarse mirando.', 'happy']]); }
}
