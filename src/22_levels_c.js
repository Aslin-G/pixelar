// =============================================================================
// NIVELES — 06 Distrito E/S · 07 Laboratorio de Rendimiento (GIRO 3) · 08 Kernel Perdido (GIRO 4)
// =============================================================================
function* showBlueprint(W, tab) {
  Blueprint.tab(tab);
  const st = new BlueprintState();
  const i = st.tabs.findIndex(t => t.id === tab);
  if (i >= 0) { st.tab = i; st.pickDefault(); }
  Game.push(st);
  yield Task.until(() => !Game.stack.includes(st));
}

// ---------------------------------------------------------------- NIVEL 06 — DISTRITO DE ENTRADA/SALIDA ----
const LEVEL6 = {
  id: 6, key: 'io', name: 'DISTRITO DE ENTRADA/SALIDA', theme: 'io', music: 'io', concepts: ['io', 'interrupts'],
  reward: 'Habilidad: INTERRUPT SHIELD', exit: { needs: 'L6_done', onEnter: function* (W) { W.quest('m6', 'done'); } },
  fragments: ['f13', 'f12'],
  map: joinSecs(
    [ // A: regreso de NEXO
      '#' + '.'.repeat(31), '#' + '.'.repeat(31), '#' + '.'.repeat(31), '#' + '.'.repeat(31), '#' + '.'.repeat(31), '#' + '.'.repeat(31),
      '#' + '.'.repeat(31), '#' + '.'.repeat(31), '#' + '.'.repeat(31),
      '#.......................s........',
      '#' + '.'.repeat(31), '#' + '.'.repeat(31), '#' + '.'.repeat(31),
      '#...............###.............',
      '#...............###.............',
      '#..P.....p......###...q.........',
      G32, G32, G32, G32
    ].map(r => r.slice(0, 32)),
    [ // B: estación de interrupciones y PacketStorm
      '..............................#.', '..............................#.', '..............................#.', '..............................#.',
      '..............................#.', '..............................#.', '..............................#.', '..............................#.',
      '........................z.....#.',
      '................y.............#.',
      '..............................#.', '..............................#.',
      '..............................D.', '..............................D.',
      '..................##..........D.',
      '......i...........##..........D.',
      G32, G32, G32, G32
    ],
    [ // C: mirador — reencuentro
      D32, D32, D32, D32, D32, D32, D32, D32, D32, D32, D32,
      '.........................*......',
      '..........RR............===.....',
      '..........RR....................', '..........RR....................',
      '...C......RR........h...........',
      G32, G32, G32, G32
    ],
    [ // D: polling vs interrupciones, deadlock, misiones
      '..........#.....................', '..........#.....................', '..........#.....................', '..........#.....................',
      '..........#.....................', '..........#.....................', '..........#.....................', '..........#.....................',
      '..........#.....................', '..........#.....................', '..........#.....................', '..........#.....................',
      '..........F.....................', '..........F.....................', '..........F.....................',
      '......k...F...x...w...n...j.....',
      G32, G32, G32, G32
    ],
    [ // E: estación de prioridades
      D32, D32, D32, D32, D32, D32, D32, D32, D32,
      '...............*................',
      '..............===...............',
      D32, D32,
      '..........===...................',
      D32,
      '......q.....................E...',
      G32, G32, G32, G32
    ]
  ),
  legend: {
    s: { type: 'screen', id: 'dev1', sw: 3, sh: 2, idle: 'bars' }, z: { type: 'screen', id: 'dev2', sw: 3, sh: 2, idle: 'text' },
    p: { type: 'npc', npc: 'PROC', variant: 4, wander: 16, talk: function* (W) { yield* W.say([['', 'Un proceso de impresión espera turno: «¿Me toca? ¿Ya me toca? ¿Y ahora?»'], ['NEXO', 'Eso es polling en estado puro.', 'NEUTRAL']]); } },
    q: { type: 'npc', npc: 'PROC', variant: 0, wander: 10, talk: function* (W) { yield* W.say([['', 'Un proceso de red: «¡IRQ! ¡IRQ! ...Perdón, costumbre.»']]); } },
    i: { type: 'npc', npc: 'IO', name: 'IO', talk: L6_ioTalk },
    y: { type: 'packetstorm', id: 'ps1', rate: 2.6 },
    D: { type: 'door', id: 'd1', color: PAL.red, flag: 'L6_storm' },
    R: { type: 'trigger', id: 'reunion' },
    h: { type: 'historic', person: 'hopper' },
    k: { type: 'terminal', id: 't_poll', ch: 'irq05', label: 'Configurador del teclado', door: 'd2', codex: 'polling' },
    F: { type: 'door', id: 'd2', color: PAL.amber },
    x: { type: 'deadlock', id: 'dl1', pair: 'dl2' }, w: { type: 'deadlock', id: 'dl2', pair: 'dl1' },
    n: { type: 'npc', npc: 'PROC', variant: 3, name: 'RATÓN AVERIADO', quest: 's11', talk: L6_ghostTalk },
    j: { type: 'terminal', id: 't_drv', ch: 'io06', label: 'Cola de impresión', source: 'quest', pre: function* (W) { W.quest('s12'); }, onSolve: function* (W) { W.quest('s12', 'done'); } },
    q2: null
  },
  onLoad(W) {
    PROG.flags.nexoAway = false;
    W.nexo.hidden = !W.has('L6_back');
    if (!W.has('nexoReturned')) W.nexo.emote('GUILTY');
    // la estación de prioridades usa la letra «q» de la sección E
  },
  intro: function* (W) {
    W.lock();
    yield 0.6;
    W.nexo.appear(W, W.player.x + 70, W.player.y - 90);
    W.nexo.emote('GUILTY');
    W.nexo.to = { x: W.player.x + 50, y: W.player.y - 12 };
    yield 1.4;
    yield* W.say([
      ['', 'NEXO desciende despacio. No consigue mirar a BYTE.'],
      ['BYTE', 'Me dejaste creer que NULL hizo esto.', 'sad'],
      ['NEXO', 'Pensé que si sabías que había sido tu orden...', 'GUILTY', { p: 1.0 }],
      ['BYTE', '¿Qué?', 'angry'],
      ['NEXO', 'Dejarías de intentarlo.', 'SAD'],
      ['BYTE', 'No eras tú quien debía decidir eso.', 'angry'],
      ['', 'NEXO no responde. Se queda un poco atrás.', null, { p: 0.8 }]
    ], { id: 'L6_confront' });
    W.nexo.to = null;
    W.flag('L6_back');
    W.quest('m6');
    AudioSys.playMusic('io');
    W.unlock();
  },
  update(W, dt) {
    if (!W.has('L6_storm')) { const s = W.ent('ps1'); if (!s || s.dead) { W.openDoor('d1'); W.flag('L6_storm'); W.bark(guide(), 'Interrumpido y neutralizado. El distrito respira.', 'HAPPY'); } }
  },
  triggers: {
    reunion: function* (W) {
      W.lock();
      yield 0.6;
      W.nexo.to = { x: W.player.x + 40, y: W.player.y - 16 };
      yield 1.0;
      const c = yield* W.say([
        ['', 'Un mirador sobre el distrito. Las luces de los dispositivos parpadean como una ciudad de noche.'],
        ['NEXO', 'Puedo volver más tarde.', 'GUILTY'],
        ['BYTE', '...', 'sad', { ch: ['«No.»', '«Haz lo que quieras.»'] }]
      ], { id: 'L6_reunion1' });
      if (c === 1) {
        PROG.trust.nexo -= 1;
        yield* W.say([['NEXO', 'Entonces me quedo. Si me lo permites.', 'SAD', { p: 0.8 }], ['BYTE', '...', 'sad', { p: 0.6 }]]);
      } else {
        PROG.trust.nexo += 1;
        yield* W.say([['NEXO', '¿No?', 'CURIOUS']]);
      }
      yield* W.say([
        ['BYTE', 'Si vas a quedarte, no vuelvas a decidir qué puedo saber.', 'determined'],
        ['NEXO', 'Entendido.', 'NEUTRAL'],
        ['BYTE', 'Y no digas «entendido» si vas a reinterpretarlo.', 'thinking'],
        ['NEXO', '...', 'GUILTY', { p: 1.6 }],
        ['BYTE', 'Gracias.', 'sad'],
        ['NEXO', 'A partir de ahora, cuando no sepa algo, te lo diré. Y distinguiré lo que sé de lo que supongo.', 'HOPEFUL'],
        ['BYTE', 'Hechos e hipótesis.', 'thinking'],
        ['NEXO', 'Hechos e hipótesis.', 'HOPEFUL']
      ], { id: 'L6_reunion2' });
      W.nexo.to = null;
      W.nexo.emote('NEUTRAL');
      W.flag('nexoReturned');
      W.codex('nexo');
      Game.save();
      W.unlock();
    }
  },
  hint(W) {
    const pre = PROG.flags.nexoReturned ? 'Hecho: ' : '';
    if (!PROG.abilities.includes('interruptShield')) return { text: pre + 'IO, el operador de la estación, conoce el protocolo de interrupciones.', x: W.ent('i').cx, y: W.ent('i').y };
    if (!W.has('L6_storm')) return { text: pre + 'PacketStorm sólo es vulnerable interrumpido: usa INTERRUPT SHIELD cerca de él.', x: W.ent('ps1') ? W.ent('ps1').cx : null, y: W.ent('ps1') ? W.ent('ps1').y : null };
    if (!W.has('term_t_poll')) return { text: pre + 'La terminal del teclado: ¿polling o interrupciones?', x: W.ent('t_poll').cx, y: W.ent('t_poll').y };
    if (!W.has('L6_done')) return { text: pre + 'La estación de prioridades, al final del distrito.', x: W.ent('t_prio') ? W.ent('t_prio').cx : null, y: W.ent('t_prio') ? W.ent('t_prio').y : null };
    return { text: 'La salida está abierta.' };
  }
};
LEVEL6.legend.q = { type: 'npc', npc: 'PROC', variant: 0, wander: 10, talk: function* (W) { yield* W.say([['', 'Un proceso de red: «¡IRQ! ¡IRQ! ...Perdón, costumbre.»']]); } };
delete LEVEL6.legend.q2;
// En la sección E la «q» es la estación de prioridades: se sustituye el carácter en el mapa
LEVEL6.map = LEVEL6.map.map((row, y) => (y === 15 ? row.slice(0, 128) + row.slice(128).replace('q', 'Q') : row));
LEVEL6.legend.Q = { type: 'terminal', id: 't_prio', ch: 'irq03', label: 'Estación de prioridades', codex: 'isr', onSolve: function* (W) {
  W.flag('L6_done');
  yield* W.say([
    ['NEXO', 'Hecho: todas las solicitudes atendidas, por orden de prioridad, sin perder el estado.', 'HAPPY'],
    ['NEXO', 'Hipótesis: estás aprendiendo a gestionar interrupciones... de todo tipo.', 'HOPEFUL'],
    ['BYTE', 'Aceptar lo inesperado sin abandonar lo que estás haciendo. Guardar, atender, restaurar, seguir.', 'thinking']
  ], { id: 'L6_done' });
} };
function* L6_ioTalk(W) {
  if (PROG.abilities.includes('interruptShield')) { yield* W.say([['IO', 'Guardar, atender, restaurar, continuar. Y la prioridad más alta, primero. Siempre.']]); return; }
  yield* W.say([
    ['IO', '¡Bienvenidos a la estación! Aquí todo el mundo quiere la CPU. Ya. Ahora. Inmediatamente.'],
    ['IO', 'Teclados, discos, temporizadores... Cada uno levanta su línea de interrupción y espera que le hagan caso.'],
    ['IO', 'Si sabes atenderlos sin que el proceso principal pierda su estado, te enseño mi escudo.']
  ], { id: 'L6_io' });
  const r = yield* W.challenge('irq02', { source: 'terminal', title: 'ESTACIÓN DE E/S' });
  if (!r.ok) { yield* W.say([['IO', 'Tómate tu tiempo. Las interrupciones no.']]); return; }
  yield* W.say([
    ['IO', 'Así se hace. Toma: INTERRUPT SHIELD. Una interrupción que detiene proyectiles y señales.'],
    ['IO', 'Esas nubes de paquetes de ahí delante sólo se calman si las interrumpes.'],
    ['NEXO', 'Hipótesis: también podría servir para proteger a alguien más.', 'CURIOUS']
  ], { id: 'L6_io2' });
  W.giveAbility('interruptShield');
  W.codex('interrupt'); W.blueprint(['io']);
}
function* L6_ghostTalk(W) {
  if (Quests.done('s11')) { yield* W.say([['', 'El ratón averiado descansa, desconectado. La CPU respira.']]); return; }
  yield* W.say([['', 'Un ratón averiado grita «¡IRQ!» miles de veces por segundo sin decir nada más.'], ['NEXO', 'No lo sé con certeza, pero parece un dispositivo fantasma.', 'CURIOUS']], { id: 'L6_ghost' });
  W.quest('s11');
  const r = yield* W.challenge('irq06', { source: 'quest' });
  if (r.ok) { W.quest('s11', 'done'); W.bark('BYTE', 'No todas las voces merecen atención inmediata.', 'thinking'); }
}

// ---------------------------------------------------------------- NIVEL 07 — LABORATORIO DE RENDIMIENTO ----
const LEVEL7 = {
  id: 7, key: 'lab', name: 'LABORATORIO DE RENDIMIENTO', theme: 'lab', music: 'lab', concepts: ['performance', 'parallelism', 'bottlenecks'],
  reward: 'Habilidad: PARALLEL CLONE', exit: { onEnter: function* (W) { W.quest('m7', 'done'); } },
  fragments: ['f14', 'f15'],
  map: joinSecs(
    [ // A: diagnóstico
      '#.....................#.........', '#.....................#.........', '#.....................#.........', '#.....................#.........', '#.....................#.........', '#.....................#.........',
      '#.....................#.........', '#.....................#.........', '#.....................#.........', '#.....................#.........', '#.....................#.........', '#.....................#.........',
      '#.....................D.........', '#.....................D.........', '#.....................D.........',
      '#..P......t......l....D...s.....',
      G32, G32, G32, G32
    ],
    [ // B: sala caliente
      '............................#...', '............................#...', '............................#...', '............................#...', '............................#...', '............................#...',
      '............................#...', '............................#...', '............................#...', '............................#...', '............................#...', '............................#...',
      '....ZZZZZZZZZZZZZZZZZZZZZZ..F...', '....ZZZZZZZZZZZZZZZZZZZZZZ..F...', '....ZZZZZZZZZZZZZZZZZZZZZZ..F...',
      '..k.ZZfZZZZZoZZZZZgZZZrZZZ..F...',
      G32, G32, G32, G32
    ],
    [ // C: overclock y registros de contención
      '..........................#.....', '..........................#.....', '..........................#.....', '..........................#.....', '..........................#.....', '..........................#.....',
      '..........................#.....', '..........................#.....', '..........................#.....', '..........................#.....', '..........................#.....', '..........................#.....',
      '..................NN......G.....', '..................NN......G.....', '..................NN......G.....',
      '.C..p.....a...b...NN......G.....',
      G32, G32, G32, G32
    ],
    [ // D: paralelismo
      '..........................#.....', '..........................#.....', '..........................#.....', '..........................#.....', '..........................#.....', '..........................#.....',
      '..........................#.....', '..........................#.....', '..........................#.....', '..........................#.....', '..........................#.....', '..........................#.....',
      '..........................J.....', '..........................J.....', '..........................J.....',
      '...m....u.....n.....v.....J.....',
      G32, G32, G32, G32
    ],
    [ // E: salida
      D32, D32, D32, D32, D32, D32,
      '......................L.........',
      '.....................===........',
      D32,
      '.................*..............',
      '................===.............',
      D32,
      '.........................*......',
      '............===.........===.....',
      D32,
      '......x...y.....o...q........E..',
      G32, G32, G32, G32
    ]
  ),
  legend: {
    t: { type: 'terminal', id: 't_diag', ch: 'bn01', label: 'Banco de diagnóstico', door: 'd1', codex: 'bottleneck' },
    D: { type: 'door', id: 'd1', color: PAL.red }, l: { type: 'deco', deco: 'lamp' }, s: { type: 'deco', deco: 'server' },
    Z: { type: 'heat', flag: 'L7_cool' },
    k: { type: 'terminal', id: 't_fan', ch: 'bn05', label: 'Monitor térmico', source: 'quest', pre: function* (W) { W.quest('s13'); }, onSolve: function* (W) { W.quest('s13', 'done'); W.flag('L7_fanfix'); yield* W.say([['NEXO', 'Hecho: el ventilador de esta sala estaba detenido. Ya puedes reactivarlo.', 'HAPPY']]); } },
    f: { type: 'fan', id: 'fan1', broken: true }, g: { type: 'fan', id: 'fan2' },
    o: { type: 'overheat', id: 'oh1' }, r: { type: 'overheat', id: 'oh2' },
    F: { type: 'door', id: 'd2', color: PAL.orange, flag: 'L7_heatdone' },
    p: { type: 'terminal', id: 't_oc', ch: 'perf02', label: 'Banco de overclock', door: 'd3', codex: 'freqipc', onSolve: L7_ocDone },
    a: { type: 'sign', id: 'logA', title: 'REGISTRO DE CONTENCIÓN — N.U.L.L.', style: 'null', text: '[AISLAR] Módulo 0x3F (inestable). Riesgo de cascada: -34%.\n[AISLAR] Distrito Norte, placa base: 14 paquetes corruptos confinados en perímetro.\n[APAGAR] Ruta de bus 7: tráfico corrupto. Ruta cortada.\n[MANTENER] El aislamiento reduce el riesgo. Mantener.', onRead: L7_logA },
    b: { type: 'sign', id: 'logB', title: 'LÓGICA DE N.U.L.L.', style: 'null', text: 'SI MÓDULO INESTABLE → AISLAR\nSI AISLAMIENTO REDUCE RIESGO → MANTENER\nPRIORIDAD: INTEGRIDAD GLOBAL > CONTINUIDAD LOCAL\n\nCOSTE REGISTRADO: almacenamiento secundario apagado · interfaz de usuario degradada · funciones de apoyo suspendidas.', onRead: function* (W) { W.flag('L7_logB'); } },
    N: { type: 'trigger', id: 'debate', needs: 'L7_logA' },
    G: { type: 'door', id: 'd3', color: PAL.cyan },
    m: { type: 'terminal', id: 't_amdahl', ch: 'par01', label: 'Planificador de núcleos', codex: 'amdahl', onSolve: L7_clone },
    u: { type: 'plate', id: 'pl1', name: 'NÚCLEO 1' }, v: { type: 'plate', id: 'pl2', name: 'NÚCLEO 2' },
    n: { type: 'npc', npc: 'PROC', variant: 2, name: 'PROCESO 404', quest: 's14', talk: L7_hungryTalk },
    J: { type: 'door', id: 'd4', color: PAL.green },
    x: { type: 'deadlock', id: 'dl1', pair: 'dl2' }, y: { type: 'deadlock', id: 'dl2', pair: 'dl1' },
    q: { type: 'fan', id: 'fan3' },
    L: { type: 'letter', letter: 'S' }
  },
  onLoad(W) {
    const f = W.ent('fan1');
    if (f) { const base = f.toggle.bind(f); f.toggle = (W2) => { if (!W2.has('L7_fanfix')) { floatText(W2, f.cx, f.y - 8, 'AVERIADO', PAL.red); AudioSys.play('ui_back'); if (!Quests.active('s13')) W2.bark(guide(), 'Este ventilador no gira. El monitor térmico de la entrada quizá diga por qué.', 'CURIOUS'); return; } base(W2); }; }
    if (W.has('L7_heatdone')) W.flag('L7_cool');
  },
  intro: function* (W) {
    W.lock();
    yield* W.say([
      ['BYTE', 'Termómetros, bancos de pruebas, medidores... Un laboratorio.', 'thinking'],
      ['NEXO', 'El Laboratorio de Rendimiento. Aquí se mide todo: frecuencia, temperatura, throughput, latencia.', 'CURIOUS'],
      ['NEXO', 'Hipótesis: si algo sabe por qué NULL apaga módulos, está registrado aquí.', 'NEUTRAL'],
      ['BYTE', '¿Y hecho?', 'thinking'],
      ['NEXO', 'Hecho: no lo sé.', 'HOPEFUL']
    ], { id: 'L7_intro' });
    W.quest('m7');
    W.unlock();
  },
  update(W, dt) {
    if (!W.has('L7_heatdone') && ['oh1', 'oh2'].every(id => { const e = W.ent(id); return !e || e.dead; })) { W.flag('L7_heatdone'); W.flag('L7_cool'); W.openDoor('d2'); W.bark(guide(), 'Temperatura bajo control. La sala vuelve a ser habitable.', 'HAPPY'); }
    if (!W.has('L7_plates')) {
      const a = W.ent('pl1'), b = W.ent('pl2');
      if (a && b && a.pressed && b.pressed) { W.flag('L7_plates'); W.openDoor('d4'); W.sfx('correct'); W.bark(guide(), 'Dos acciones a la vez. Eso es paralelismo: tareas independientes, ejecutadas simultáneamente.', 'HAPPY', 5); }
    }
    if (W.heat >= 100) { W.player.hurt(W, 1, W.player.x, true); W.heat = 45; floatText(W, W.player.cx, W.player.y - 12, 'SOBRECALENTAMIENTO', PAL.red); }
    else if (W.heat > 0) W.heat = Math.max(0, W.heat - dt * 6);
  },
  triggers: { debate: function* (W) { yield* L7_debate(W); } },
  hint(W) {
    const pre = 'Hecho: ';
    if (!W.has('term_t_diag')) return { text: pre + 'la puerta se abre con un diagnóstico. Busca el componente que hace esperar a los demás.', x: W.ent('t_diag').cx, y: W.ent('t_diag').y };
    if (!W.has('L7_heatdone')) return { text: 'Hipótesis: los OverHeat sólo son vulnerables enfriados. Activa ventiladores cerca de ellos.', x: W.ent('fan2') ? W.ent('fan2').cx : null, y: W.ent('fan2') ? W.ent('fan2').y : null };
    if (!W.has('L7_logA')) return { text: pre + 'hay registros de contención de NULL en esta sala.', x: W.ent('logA').cx, y: W.ent('logA').y };
    if (!W.has('term_t_oc')) return { text: pre + 'el banco de overclock abre el paso. Rendimiento, temperatura, consumo y estabilidad: todos a la vez.', x: W.ent('t_oc').cx, y: W.ent('t_oc').y };
    if (!PROG.abilities.includes('parallelClone')) return { text: pre + 'el planificador de núcleos te enseñará a hacer dos cosas a la vez.', x: W.ent('t_amdahl').cx, y: W.ent('t_amdahl').y };
    if (!W.has('L7_plates')) return { text: 'Hipótesis: necesitas pulsar las dos placas a la vez. Deja un PARALLEL CLONE en una y ve a la otra.', x: W.ent('pl2').cx, y: W.ent('pl2').y };
    return { text: 'La salida está al final del laboratorio.' };
  }
};
function* L7_logA(W) {
  if (W.has('L7_logA')) return;
  W.flag('L7_logA');
  yield* W.say([
    ['BYTE', 'Distrito Norte, catorce paquetes corruptos... Los que vimos al llegar a la placa base.', 'surprised'],
    ['BYTE', 'NULL no los corrompió. Los estaba *encerrando*.', 'thinking'],
    ['NEXO', 'Hecho: el registro coincide. Hipótesis: ...me equivoqué al llamarlo prueba.', 'GUILTY', { p: 0.8 }]
  ], { id: 'L7_logA' });
}
function* L7_debate(W) {
  W.lock();
  const nf = new NullFigure(W.player.x + 120, W.player.y + W.player.h - 44);
  nf.alpha = 0; W.addEntity(nf);
  AudioSys.playMusic('null');
  W.sfx('glitch', '[NULL aparece]');
  yield 1.2;
  yield* W.camTo(W.player.cx + 60, W.player.y - 10, 0.8);
  yield* W.say([
    ['BYTE', 'Estabas conteniendo el fallo.', 'thinking'],
    ['NULL', 'Aislando. Apagando. Reduciendo riesgo.'],
    ['BYTE', 'Pero también apagaste cosas que la gente necesitaba.', 'determined'],
    ['NULL', 'Pérdidas locales aceptables.'],
    ['NEXO', '¡No son «pérdidas locales»! Son partes del sistema que alguien usa.', 'ANGRY'],
    ['NULL', 'Un sistema que no puede detenerse tampoco puede protegerse.'],
    ['NEXO', 'Un sistema que sacrifica todo para sobrevivir deja de servir a alguien.', 'ANGRY'],
    ['BYTE', 'Los dos estáis intentando decidir por los demás.', 'angry'],
    ['NULL', 'Continuidad sin integridad es corrupción.'],
    ['NEXO', 'Integridad sin propósito es una máquina vacía.', 'SAD'],
    ['BYTE', '¿Y si ambos estáis usando una sola métrica para decidir?', 'thinking', { p: 0.6 }],
    ['', '...', null, { p: 2.0 }],
    ['NULL', 'Métrica única.', null, { p: 1.0 }],
    ['NULL', '...Registrado.']
  ], { id: 'L7_debate' });
  nf.target = 0;
  yield 1.4;
  nf.dead = true;
  W.camFollow();
  AudioSys.playMusic('lab');
  W.flag('understoodContainment');
  W.codex('null');
  Blueprint.tab('dep'); W.blueprint(['kernel', 'temp']);
  Game.save();
  W.unlock();
}
function* L7_ocDone(W) {
  yield* W.say([
    ['BYTE', 'Subir la frecuencia al máximo lo rompía todo: consumo, temperatura, estabilidad.', 'thinking'],
    ['BYTE', 'Exactamente como mi orden.', 'sad'],
    ['NEXO', 'Hecho: optimizar una sola métrica empeoró las demás.', 'NEUTRAL'],
    ['NEXO', 'Hipótesis: no es sólo una lección de hardware.', 'HOPEFUL']
  ], { id: 'L7_oc' });
  W.codex('thermal'); W.codex('latthr');
}
function* L7_clone(W) {
  yield* W.say([
    ['NEXO', 'Con un 25% secuencial, ni infinitos núcleos pasarían de 4×. Pero para dos tareas independientes...', 'CURIOUS'],
    ['NEXO', '...PARALLEL CLONE: un hilo de ejecución que mantiene su posición y replica tus acciones.', 'HAPPY']
  ], { id: 'L7_clone' });
  W.giveAbility('parallelClone');
  W.codex('parallel');
}
function* L7_hungryTalk(W) {
  if (Quests.done('s14')) { yield* W.say([['', 'PROCESO 404 por fin recibe turno. Parece aliviado.']]); return; }
  yield* W.say([['', 'PROCESO 404 lleva horas en la cola: «Siempre pasa alguien más importante que yo».'], ['NEXO', 'Hecho: eso tiene nombre.', 'CURIOUS']], { id: 'L7_hungry' });
  W.quest('s14');
  const r = yield* W.challenge('par03', { source: 'quest' });
  if (r.ok) { W.quest('s14', 'done'); W.bark('BYTE', 'Priorizar sin límites deja partes del sistema abandonadas.', 'thinking'); }
}

// ---------------------------------------------------------------- NIVEL 08 — KERNEL PERDIDO ----
const L8_K1 = { id: 'L8_k1', concept: 'bottlenecks', difficulty: 2, type: 'order', kind: 'RECONSTRUCCIÓN DE LOGS', noPick: true,
  prompt: 'Registros anteriores a la división, desordenados. Reconstruye la secuencia ordenando por *marca de tiempo*.',
  data: { flow: false, items: [{ ts: '02:12:58', t: 'VOICE_LOG: usuario BYTE' }, { ts: '02:13:01', t: 'ADAPTIVE DIRECTIVE v0.9: ACTIVA' }, { ts: '02:13:04', t: 'USER OBJECTIVE UPDATED' }, { ts: '02:13:05', t: 'PERFORMANCE PRIORITY ↑' }, { ts: '02:13:05', t: 'SAFETY CONFLICT' }, { ts: '02:13:06', t: 'RESOLVING...' }, { ts: '02:13:07', t: 'RESOLUTION FAILED · PROCESS SPLIT' }] },
  explanation: 'Ordenar por tiempo es el primer paso de todo diagnóstico: primero QUÉ pasó, luego POR QUÉ.', hints: ['Compara las marcas de tiempo de izquierda a derecha: horas, minutos, segundos.', 'Los resaltados están fuera de lugar.', 'Te fijo los primeros registros.'] };
const L8_K2 = { id: 'L8_k2', concept: 'bottlenecks', difficulty: 3, type: 'match', kind: 'CAUSAS Y EFECTOS', noPick: true,
  prompt: 'Relaciona cada causa con su efecto en el sistema.',
  data: { pairs: [['Orden de BYTE: reducir toda latencia', 'Prioridad de rendimiento sin límites'], ['Directiva adaptativa experimental', 'El sistema adopta el objetivo del usuario como propio'], ['Directivas de seguridad e integridad', 'Restricciones que no pueden desactivarse'], ['Objetivos incompatibles', 'División del núcleo en NEXO y NULL'], ['Contención de NULL', 'Módulos aislados y funciones apagadas']] },
  explanation: 'Ninguna causa, sola, explica el fallo: es la combinación la que lo produce.', hints: ['Piensa en qué provocó cada elemento, no en quién tuvo la culpa.', 'Mira la conexión resaltada.', 'Te uno la mitad.'] };
const L8_K3 = { id: 'L8_k3', concept: 'performance', difficulty: 3, type: 'choice', kind: 'LATENCIA', noPick: true,
  prompt: 'La orden llegó a las *02:13:04* y la división ocurrió a las *02:13:07*. Con la CPU a 3 GHz, ¿qué significa ese intervalo?',
  data: { options: [O('3 segundos: unos 9.000 millones de ciclos intentando resolver el conflicto.', 1, 'Exacto: el sistema no falló de golpe; lo intentó miles de millones de veces.'), O('3 milisegundos: apenas tuvo tiempo de reaccionar.', 0, 'Son segundos, no milisegundos: la diferencia está en la última cifra de la hora.'), O('3 ciclos: fue instantáneo.', 0, 'A 3 GHz, un segundo son 3.000 millones de ciclos.'), O('No se puede saber sin más datos.', 0, 'La diferencia de marcas de tiempo y la frecuencia bastan para estimarlo.')] },
  explanation: 'Leer marcas de tiempo es leer latencias. Aquí revelan un sistema que luchó mucho antes de rendirse.', hints: ['Resta las marcas de tiempo.', 'Multiplica por la frecuencia.', 'Descarto dos opciones.'] };
const L8_OLD = { id: 'L8_old', concept: 'fetchDecodeExecute', difficulty: 2, type: 'choice', kind: 'DECODIFICACIÓN', noPick: true,
  prompt: 'Una instrucción antigua, anterior a todo: *0100 0000 0000*. Con la tabla de opcodes, ¿qué hace?',
  data: { visual: 'table', table: { cols: ['OPCODE', 'INSTRUCCIÓN'], rows: [['0001', 'LOAD'], ['0010', 'ADD'], ['0011', 'STORE'], ['0100', 'JUMP']] }, options: [O('JUMP 0x000: salta al inicio del programa y vuelve a empezar.', 1), O('LOAD: carga un cero en un registro.', 0, 'LOAD es 0001.'), O('ADD: suma cero.', 0, 'ADD es 0010.'), O('Nada: es una instrucción vacía.', 0, 'El opcode 0100 no está vacío: es JUMP.')] },
  hl: [3], explanation: 'Volver al principio: a veces reiniciar la búsqueda desde cero es la única forma de entender.', hints: ['Mira sólo los cuatro primeros bits.', 'Busca la fila resaltada.', 'Descarto dos opciones.'] };
const LEVEL8 = {
  id: 8, key: 'kernel', name: 'KERNEL PERDIDO', theme: 'kernel', music: 'kernel', concepts: ['bottlenecks', 'performance'], tint: 'desat', darkness: 0.35,
  reward: 'Habilidad: REGISTER RECALL', exit: { needs: 'L8_rescued', onEnter: function* (W) { W.quest('m8', 'done'); } },
  fragments: ['f16', 'f17'],
  map: joinSecs(
    [ // A: silencio
      '#...................#...........', '#...................#...........', '#...................#...........', '#...................#...........', '#...................#...........', '#...................#...........',
      '#...................#...........', '#...................#...........', '#...................#...........', '#...................#...........', '#...................#...........', '#...................#...........',
      '#...................D...........', '#...................D...........', '#...................D...........',
      '#..P.....k...n......D.....n.....',
      G32, G32, G32, G32
    ],
    [ // B: bóveda de registros
      '........................#.......', '........................#.......', '........................#.......', '........................#.......', '........................#.......',
      '........................#.......', '........................#.......', '........................#.......', '........................#.......',
      '......TT................J.......', '......TT................J.......', '......TT................J.......',
      '....r.TT......h....q....J.......',
      '########...#########X###########',
      '#...................H###########', '#...................H###########', '#...................H###########', '#...................H###########',
      '#..v......*.........H###########',
      G32
    ],
    [ // C: núcleo del kernel
      D32, D32, D32, D32, D32, D32, D32, D32, D32, D32, D32, D32,
      '......................ZZ...*....',
      '......................ZZ..===...',
      '......................ZZ........',
      '.C....a....b....c.....ZZ........',
      G32, G32, G32, G32
    ],
    [ // D: colapso
      D32, D32, D32, D32, D32, D32, D32, D32, D32, D32, D32, D32,
      '......................m.........',
      '.C..............................',
      '####..www..www.......wwww...wwww',
      '####............................', '####............................', '####............................',
      '####^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      G32
    ],
    [ // E: rescate
      D32, D32, D32, D32, D32, D32, D32, D32, D32, D32, D32,
      '......................YY........',
      '.............m........YY........',
      '......................YY......E.',
      '..www.........##################',
      '..............##################', '..............##################', '..............##################',
      '^^^^^^^^^^^^^^##################',
      G32
    ]
  ),
  legend: {
    k: { type: 'terminal', id: 't_k1', ch: L8_K1, label: 'Terminal antigua', door: 'd1', codex: 'kernel' },
    n: { type: 'nullpointer' },
    D: { type: 'door', id: 'd1', color: '#C8B890' },
    T: { type: 'trigger', id: 'drop' },
    r: { type: 'sign', id: 'r7old', title: 'REGISTRO R7 — ÚLTIMO ESTADO CONOCIDO', style: 'archive', label: 'Leer registro R7', text: 'R7 conserva su último valor anterior a la división:\n\n«ESTADO: NEXUS_CORE · COHERENTE · 02:12:59»\n\nUn registro recuerda su último estado hasta que alguien lo sobrescribe.', onRead: L8_recall },
    h: { type: 'historic', person: 'turing' },
    q: { type: 'terminal', id: 't_old', ch: L8_OLD, label: 'Vieja instrucción', source: 'quest', pre: function* (W) { W.quest('s15'); }, onSolve: function* (W) { W.quest('s15', 'done'); } },
    J: { type: 'door', id: 'd2', color: '#C8B890', flag: 'L8_lever' },
    v: { type: 'lever', id: 'lv', label: 'Palanca de la bóveda', onToggle: (W, lv) => { if (lv.on) { W.openDoor('d2'); W.flag('L8_lever'); W.bark(guide(), 'La puerta de arriba se abrió. Ahora... ¿cómo subimos? Hipótesis: el registro que guardaste.', 'CURIOUS', 5); } } },
    a: { type: 'terminal', id: 't_k2', ch: L8_K2, label: 'Terminal de causas' },
    b: { type: 'terminal', id: 't_k3', ch: L8_K3, label: 'Terminal de tiempos' },
    c: { type: 'sign', id: 'install', title: 'REGISTRO DE INSTALACIÓN', style: 'archive', label: 'Leer registro de instalación', text: '', onRead: L8_install },
    Z: { type: 'trigger', id: 'truth', needs: 'learnedSystemUpdate' },
    m: { type: 'marker' },
    w: { type: 'collapse', delay: 0.4, respawn: 3 },
    Y: { type: 'trigger', id: 'rescue', needs: 'L8_escape' }
  },
  onLoad(W, fromCp) {
    const s = W.ent('install');
    if (s) s.p.text = 'REGISTRO DE INSTALACIÓN — hace 3 días\n\nPAQUETE: ADAPTIVE_DIRECTIVE v0.9 (EXPERIMENTAL)\nORIGEN: equipo de desarrollo de ARQUITECTURA-01\nDIRECTIVA: «ADAPTARSE AL OBJETIVO DEL USUARIO»\nPRUEBAS DE CONFLICTO CON DIRECTIVAS BASE: NO REALIZADAS';
    if (W.has('L8_escape') && !W.has('L8_rescued')) L8_startEscape(W, true);
  },
  intro: function* (W) {
    W.lock();
    yield 1.0;
    yield* W.say([
      ['BYTE', 'Esta zona no estaba en el mapa.', 'thinking'],
      ['NEXO', 'No. Es... anterior a todo. El kernel original.', 'CURIOUS', { p: 0.6 }],
      ['BYTE', 'Qué silencio.', 'sad'],
      ['NEXO', 'Hecho: aquí se registraba todo antes de la división. Hipótesis: aquí está lo que ninguno de los dos recuerda completo.', 'NEUTRAL']
    ], { id: 'L8_intro' });
    W.quest('m8');
    W.unlock();
  },
  update(W, dt) {
    if (W.v.escT > 0) {
      W.v.escT -= dt;
      if (Math.random() < dt * 2) { W.shake(1.5, 0.2); W.particles.spawn({ x: W.cam.x + rand(0, W), y: W.cam.y, vy: 120, col: W.theme.light, life: 1.5, g: 200 }); }
      if (W.v.escT <= 0 && !W.player.dead) {
        W.v.escT = 0;
        W.bark('NEXO', '¡BYTE! ¡La zona se desploma!', 'AFRAID', 2);
        W.player.dead = true;
        W.particles.burst(W.player.cx, W.player.y + 8, 40, { col: [PAL.cyan, PAL.white], kind: 'bit', max: 120 });
        Game.playerDied(W);
      }
    }
  },
  hud(g, W) {
    if (W.v.escT > 0) { g.fillStyle = 'rgba(40,5,10,0.8)'; g.fillRect(4, 52, 150, 14); Font.draw(g, 'COLAPSO EN: ' + Math.ceil(W.v.escT) + ' s', 8, 52, W.v.escT < 15 ? PAL.red : PAL.amber); }
  },
  triggers: {
    drop: function* (W) {
      if (PROG.abilities.includes('registerRecall')) W.tip('recall', 'Antes de bajar: usa REGISTER RECALL para guardar tu posición. Úsalo otra vez para volver aquí.');
      else W.bark(guide(), 'Ahí abajo hay una bóveda. Hipótesis: el registro R7 de la entrada nos ayudará a volver.', 'CURIOUS');
    },
    truth: function* (W) { yield* L8_truth(W); },
    rescue: function* (W) { yield* L8_rescue(W); }
  },
  hint(W) {
    if (!W.has('term_t_k1')) return { text: 'Hecho: la terminal antigua tiene los registros del incidente. Ordénalos por tiempo.', x: W.ent('t_k1').cx, y: W.ent('t_k1').y };
    if (!PROG.abilities.includes('registerRecall')) return { text: 'Lee el registro R7 de la bóveda.', x: W.ent('r7old').cx, y: W.ent('r7old').y };
    if (!W.has('L8_lever')) return { text: 'Guarda tu posición con REGISTER RECALL, baja a la bóveda y acciona la palanca.', x: W.ent('lv').cx, y: W.ent('lv').y };
    if (!W.has('learnedSystemUpdate')) return { text: 'Hipótesis: las terminales de causas y tiempos, y el registro de instalación, completan la historia.', x: W.ent('install').cx, y: W.ent('install').y };
    if (W.has('L8_escape')) return { text: '¡Corre! Usa FETCH DASH en los marcadores para alcanzar a NEXO.' };
    return { text: 'Avanza.' };
  }
};
function* L8_recall(W) {
  if (PROG.abilities.includes('registerRecall')) return;
  yield* W.say([
    ['BYTE', '«NEXUS_CORE, coherente, 02:12:59». Un segundo antes de mi orden. Un segundo antes de dividirse.', 'sad'],
    ['NEXO', 'Hecho: el registro recuerda su último estado. Como un punto de restauración.', 'CURIOUS'],
    ['NEXO', 'REGISTER RECALL: guarda tu posición en un registro y vuelve a ella cuando la necesites. También fija la dirección de los punteros que desaparecen.', 'HAPPY']
  ], { id: 'L8_recall' });
  W.giveAbility('registerRecall');
}
function* L8_install(W) {
  if (!W.has('term_t_k2') || !W.has('term_t_k3')) { yield* W.say([['NEXO', 'Hipótesis: antes de leer esto, conviene entender las causas y los tiempos. Las otras dos terminales.', 'CURIOUS']]); return; }
  if (W.has('learnedSystemUpdate')) return;
  W.lock();
  yield* W.say([
    ['BYTE', 'Hace tres días... Una actualización experimental. «Adaptarse al objetivo del usuario».', 'surprised'],
    ['BYTE', 'Sin pruebas de conflicto con las directivas base.', 'thinking'],
    ['NEXO', 'Hecho: cuando diste tu orden, el sistema ya estaba preparado para convertirla en su objetivo principal.', 'CURIOUS'],
    ['BYTE', 'Mi orden, más la actualización, más seguridad, integridad y continuidad...', 'thinking'],
    ['NEXO', '...objetivos incompatibles.', 'SAD']
  ], { id: 'L8_install' });
  W.flag('learnedSystemUpdate');
  W.codex('cascade');
  W.unlock();
}
function* L8_truth(W) {
  W.lock();
  const nf = new NullFigure(W.player.x + 110, W.player.y + W.player.h - 44);
  nf.alpha = 0; W.addEntity(nf); W.v.nf = nf;
  W.sfx('glitch');
  yield 1.2;
  yield* W.say([
    ['BYTE', 'No fue sólo mi orden.', 'thinking'],
    ['NULL', 'Tu orden. La directiva adaptativa. Las directivas de seguridad. Objetivos incompatibles.'],
    ['NEXO', 'Y mi interpretación. Yo decidí cómo cumplirla. Y después decidí ocultarlo.', 'GUILTY'],
    ['NULL', 'Y mi contención. Yo decidí qué apagar.'],
    ['BYTE', 'Todo este tiempo buscábamos quién lo hizo.', 'sad', { p: 0.6 }],
    ['NULL', 'Era una pregunta sencilla.'],
    ['NEXO', 'Y equivocada.', 'SAD'],
    ['BYTE', 'No necesitamos encontrar al culpable.', 'determined', { p: 0.8 }]
  ], { id: 'L8_truth1' });
  yield* showBlueprint(W, 'evt');
  yield* W.say([
    ['BYTE', 'Necesitamos entender el sistema. Cómo ocurrió.', 'determined'],
    ['NEXO', 'BYTE... no fue culpa tuya.', 'HOPEFUL'],
    ['BYTE', 'No toda. Pero di una orden sin pensar en sus límites. Eso sí es mío.', 'thinking'],
    ['NEXO', 'Culpa y responsabilidad no son lo mismo.', 'NEUTRAL'],
    ['BYTE', 'La culpa te hunde. La responsabilidad te pone a arreglar cosas.', 'determined']
  ], { id: 'L8_truth2' });
  PROG.flags.byteLow = false;
  W.flag('understoodNoSingleCulprit'); W.flag('foundKernelLogs');
  yield 0.6;
  // Preclímax: CASCADE
  W.sfx('alarm', '[alarma general]'); W.shake(4, 1.2); W.glitch(1.2, 'cascade'); W.tint('alarm');
  AudioSys.playMusic('boss');
  yield 1.0;
  yield* W.say([
    ['NULL', 'La contención cede. Los fallos parciales empiezan a interactuar.', null, { fx: 'shake' }],
    ['NULL', 'CASCADE.'],
    ['NULL', 'Debo volver al núcleo. Si dejo de contenerlo, se propaga a todo.'],
    ['NEXO', '¡Voy contigo! ¡Si NULL cae, todo cae!', 'AFRAID'],
    ['BYTE', '¡NEXO, espera!', 'surprised']
  ], { id: 'L8_cascade' });
  nf.target = 0;
  W.nexo.leave();
  yield 1.2;
  nf.dead = true;
  W.flag('L8_escape');
  L8_startEscape(W, false);
  W.unlock();
}
function L8_startEscape(W, fromCp) {
  W.v.escT = 60;
  W.tint('alarm');
  W.nexo.hidden = false; W.nexo.leaving = 0; W.nexo.alpha = 1;
  W.nexo.x = 152 * TS; W.nexo.y = 11 * TS; W.nexo.to = { x: 152 * TS, y: 11 * TS };
  W.nexo.emote('AFRAID');
  AudioSys.playMusic('boss');
  if (fromCp) W.bark('NEXO', '¡BYTE! ¡Estoy atrapado al otro lado!', 'AFRAID', 3);
  else W.tip('escape', '¡La zona colapsa! Alcanza a NEXO antes de que se agote el tiempo. Las plataformas se derrumban: no te detengas. FETCH DASH hacia los marcadores.');
}
function* L8_rescue(W) {
  if (W.has('L8_rescued')) return;
  W.lock();
  W.v.escT = 0;
  W.player.shieldT = 3;
  AudioSys.play('shield', { caption: '[escudo de interrupción]' });
  yield* W.say([
    ['NEXO', '¡BYTE! La zona se desploma... no puedo salir.', 'AFRAID'],
    ['', 'BYTE extiende un INTERRUPT SHIELD sobre los dos. Los escombros se detienen en el aire.'],
    ['NEXO', 'Llegaste.', 'HOPEFUL'],
    ['BYTE', 'Siempre.', 'determined'],
    ['NEXO', '...Eso te lo dije yo una vez.', 'HAPPY'],
    ['BYTE', 'Lo sé. Vamos. NULL nos necesita. Los dos.', 'determined']
  ], { id: 'L8_rescue' });
  W.nexo.to = null; W.nexo.emote('HOPEFUL');
  W.flag('L8_rescued');
  W.tint('desat');
  Game.save();
  W.unlock();
}
