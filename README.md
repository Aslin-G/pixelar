# BYTE: ARCHITECT QUEST — Ecos de la Máquina

Videojuego educativo de plataformas en pixel art sobre **arquitectura de computadores**.
Para avanzar hay que *entender* cómo cooperan la CPU, la memoria, los buses y la E/S:
los puzles, las habilidades y el jefe final están construidos sobre esos conceptos.

> No enseñamos las partes de una computadora. Enseñamos cómo cooperan para formar un sistema.

El juego completo es un único archivo: **`byte_architect_quest.html`** (HTML + CSS + JavaScript
sin librerías, Canvas 2D, Web Audio y `localStorage`). No usa red, recursos externos ni imágenes:
todos los gráficos, la fuente y la música se generan por código.

---

## Cómo ejecutarlo

1. Abre `byte_architect_quest.html` con un navegador moderno (Chrome, Edge, Firefox o Safari).
   Basta con hacer doble clic; no necesita servidor ni conexión.
2. Pulsa una tecla o haz clic para arrancar (el audio del navegador se activa con la primera interacción).
3. En el título: **NEW GAME** empieza la historia; **CONTINUE** carga la partida guardada;
   **TEACHER MODE** permite elegir nivel, practicar conceptos y ver resultados.

La partida se guarda sola (checkpoints, final de nivel, cambios importantes) en `localStorage`
(`byteArchitectQuestSave`; ajustes en `byteArchitectQuestSettings`). Si el navegador bloquea el
almacenamiento o el audio, el juego sigue funcionando sin guardar o sin sonido.

### Reconstruir desde el código fuente (opcional)

El HTML se genera concatenando los módulos de `src/`:

```bash
node tools/build.js          # src/*.js + src/shell.html → byte_architect_quest.html
```

---

## Controles

| Acción | Teclado | Mando |
|---|---|---|
| Moverse | ← → / A D | Stick izq. / cruceta |
| Subir / bajar escaleras, atravesar plataformas (↓ + salto) | ↑ ↓ / W S | Stick / cruceta |
| Saltar (mantener = más alto) | Espacio | A |
| Interactuar / tomar y colocar bloques | E | Y |
| Ataque **Debug Ping** | J / X | X |
| Usar habilidad seleccionada | Q | RT / LT |
| Cambiar habilidad | Tab / R (o 1–8) | RB / LB |
| Pista (en el mundo y en los desafíos) | H | L3 / R3 |
| Blueprint · Codex · Misiones | B · C · L | Select (Blueprint) |
| Pausa | Esc / P | Start |
| Desafíos: navegar · confirmar · verificar · salir | Flechas · Enter/E · V · Esc | Cruceta · A · — · B |
| Saltar diálogo ya visto · saltar cinemática | Tab · mantener Esc | — |

También se puede jugar con **ratón** (menús y desafíos) y con **controles táctiles** en pantalla
(se activan en *Settings*). Todas las teclas del juego se pueden **reasignar** en *Controls*.

---

## Qué se ha implementado

### Historia (10 regiones + prólogo y epílogo)
- **Prólogo** en el laboratorio: la demo de la mañana, la orden «REDUCIR TODA LATENCIA EVITABLE»,
  el «Confío en ti», el incidente (OBJECTIVE CONFLICT…) y la disolución al mundo digital.
- **00 Boot Camp** · **01 Ciudad de la Placa Base** · **02 Núcleo del Procesador** · **03 Forja ALU** ·
  **04 Torre de la Memoria** · **05 Autopista de los Buses** · **06 Distrito de E/S** ·
  **07 Laboratorio de Rendimiento** · **08 Kernel Perdido** · **09 NULL CORE** (jefe) · **Epílogo**.
- Giros con pistas previas, revelación, reacción, consecuencia y cambio jugable: el comando de BYTE
  (NEXO se marcha y el mundo se enfría; las pistas pasan a darlas el sistema), la división
  NEXO/NULL (firmas NX‑7F3A / NX‑7F3B), la verdad del incidente y la reintegración en **NEXUS**.
- Epílogo con la presentación «Análisis de un fallo sistémico», la **lección final**, la última imagen
  del Blueprint, créditos, escena poscréditos (312 ms) y escena extra si se reúnen las letras N‑E‑X‑U‑S.
- **Jefe CASCADE** en 6 fases (CPU, ALU, caché, buses, interrupciones, rendimiento): cada fase se
  estabiliza resolviendo su consola y luego se golpea el núcleo expuesto; incluye un evento con
  INTERRUPT SHIELD, la decisión DELETE NULL / INTERRUMPIR, un BUS BRIDGE final y un desafío de
  equilibrio con 4 variables acopladas.

### Sistema educativo
- **Modelo de dominio** (0–100) para 15 conceptos, con dificultad adaptativa, repaso espaciado
  (orbes de eco) y detección de concepciones erróneas mediante **confianza declarada**.
- **114 desafíos** redactados + **28 generadores** paramétricos (variantes infinitas), en **11 tipos
  de widget**: elección (con medidores, tablas, registros, código, bits y diagramas), ordenar,
  emparejar, clasificar, circuitos lógicos, aritmética binaria, enrutamiento de buses, simulador
  de jerarquía de memoria, simulador con parámetros, gestión de interrupciones y sincronización con el reloj.
- Ciclo de aprendizaje por desafío: intento → retroalimentación específica + pista gratuita →
  segundo intento → **ejemplo guiado** → **problema similar**. Pistas en 3 niveles (orientación,
  resaltado, solución parcial) que reducen la XP pero nunca bloquean.
- **Codex** (51 entradas en 9 categorías: definición, función, entradas/salidas, conexiones,
  latencia, capacidad, ejemplo, error común y nota de BYTE) y **Blueprint** del sistema con 4 vistas
  (hardware, comunicación, dependencias, flujo de eventos) que se completa al jugar.
- Metacognición: calibración de confianza, notas de «error seguro», informe de resultados con
  conceptos dominados, a reforzar y preguntas que costaron.
- **Modo docente**: elegir cualquier nivel con el estado de historia coherente, practicar un
  concepto concreto, ver resultados y reiniciar el dominio (las sesiones docentes no sobrescriben la partida).

### Jugabilidad
- Plataformas con coyote time, buffer de salto, salto variable, escaleras, plataformas de un
  sentido y móviles (sincronizadas con el reloj), púas, corrupción, bloques rompibles y zonas que colapsan.
- 8 habilidades ligadas a conceptos: **Circuit Link**, **Fetch Dash**, **ALU Pulse**, **Cache Boost**,
  **Bus Bridge**, **Interrupt Shield**, **Parallel Clone**, **Register Recall**; más el ataque **Debug Ping**.
- Enemigos que son conceptos: BitCorrupt (bits erróneos), CacheMiss, BusError (se reenruta),
  OverHeat, Deadlock (en pareja), NullPointer, PacketStorm (interrupciones) y drones de entrenamiento.
- Puzles de flujo Entrada→Proceso→Memoria→Salida, ciclo FETCH/DECODE/EXECUTE/WRITE BACK con
  bloques de instrucción, compuertas lógicas con palancas, torre de latencias, buses de datos /
  direcciones / control, prioridades de interrupción, cuellos de botella y paralelismo.
- 25 misiones (10 principales + 15 secundarias), 18 Memory Fragments, 5 letras ocultas,
  5 terminales históricas (Von Neumann, Lovelace, Shannon, Hopper, Turing), 13 logros, XP y niveles
  de BYTE con mejoras visuales.

### Presentación y accesibilidad
- Resolución interna 480×270 escalada sin suavizado, fuente pixel propia con tildes y símbolos,
  sprites y retratos procedurales con emociones, 10 temas de tiles y fondos con parallax.
- Música procedural (15 temas, con el motivo de NEXO y su versión invertida para NULL) y efectos de sonido sintetizados.
- Ajustes: volúmenes, velocidad de texto, **subtítulos de sonidos**, alto contraste, reducir
  parpadeos y vibración de cámara, scanlines, **modo asistido**, dificultad educativa, FPS,
  reasignación de teclas y controles táctiles.

---

## Arquitectura (resumen)

```
src/shell.html        Documento HTML + CSS; el builder inserta el JS en /*__GAME__*/
src/01_core.js        Constantes, paleta, utilidades, tareas y corrutinas (ScriptRunner)
src/02_font.js        Fuente pixel proporcional con atlas teñido
src/03_sprites.js     Sprites procedurales: BYTE, NEXO/NULL/NEXUS, enemigos, NPC, objetos, retratos
src/04_worldgfx.js    Tiles, temas y fondos parallax
src/05_audio.js       Web Audio: efectos sintetizados, secuenciador musical y subtítulos
src/06_input.js       Teclado, ratón, mando, táctil y reasignación
src/07_save.js        Guardado, migración y ajustes
src/08_learning.js    Modelo de dominio, gestor de preguntas, progresión y logros
src/09_ui.js          Primitivas de interfaz: paneles, botones, barras, avisos
src/10_challenge.js   Estado de desafío (intentos, pistas, confianza, ejemplo guiado, variantes)
src/11_widgets.js     Los 11 tipos de widget interactivo
src/12_challenges.js  Banco de desafíos y generadores
src/13_data.js        Codex, Blueprint, misiones, fragmentos y terminales históricas
src/14_world.js       Mundo: mapa, colisiones, cámara, partículas, habilidades y API de guion
src/15_entities.js    Jugador, NEXO, enemigos y objetos interactivos
src/16_dialogue.js    Diálogos, elecciones y lector de registros
src/17_states.js      Pila de estados: juego, HUD, menús, pausa, Codex/Blueprint, docente…
src/20–23_*.js        Niveles 00–09 (mapas ASCII, leyenda, guiones) y jefe CASCADE
src/24_story.js       Prólogo, epílogo, créditos, informe y registro de niveles
src/99_main.js        Arranque, bucle principal y escalado
```

- **Pila de estados** (`Game.push/pop/replace`) con estados superpuestos (diálogos, desafíos, menús).
- **Guiones como generadores**: `yield* W.say(...)`, `yield* W.challenge(...)`, `yield 1.5`…
  permiten escribir escenas y puzles de forma lineal sin callbacks.
- **Niveles como datos**: cada nivel es un mapa ASCII por secciones + una leyenda que crea entidades,
  con disparadores y funciones de guion.
- **Desafíos como datos**: `{ concept, difficulty, type, prompt, data, hints, explanation }`,
  evaluados por el widget de su tipo; los generadores devuelven el mismo formato.

### Herramientas de verificación (`tools/`, requieren Node y Playwright/Chromium)

| Script | Comprueba |
|---|---|
| `build.js` | Construye el HTML único |
| `validate.js` | Mapas (anchos, leyendas, inicio, fragmentos), referencias a desafíos y Codex, cobertura de glifos y alcanzabilidad aproximada de salidas y objetos |
| `challenges.js` | Los 728 casos (desafíos, generadores y variantes): render, pistas, reinicio y que la solución guiada sea correcta |
| `smoke.js` | Recorrido con teclado real: título → prólogo → nivel → terminal → pausa y submenús → CONTINUE → modo docente |
| `playtest.js` | Bot que juega la historia completa (niveles 00–09, jefe, epílogo, informe y posjuego) |
| `robust.js` | Muerte y checkpoint, reinicio desde pausa, almacenamiento y audio bloqueados, todas las habilidades en todos los niveles y ajustes |

---

## ADAPTACIONES CREATIVAS REALIZADAS

Decisiones propias tomadas al llevar los documentos de diseño a un juego jugable:

1. **Prólogo con tarjeta «02:12 — La noche sigue»**: BYTE, medio dormido, *murmura* algo inaudible a
   NEXO. Es la pista temprana de que la orden la dio BYTE; el registro de voz de la Torre de la
   Memoria (02:12:58) la completa.
2. **Firmas NX‑7F3A / NX‑7F3B** en el registro de auditoría de la Forja ALU: la división de NEXO y NULL
   se insinúa con datos antes de revelarse.
3. **Elecciones con memoria**: en la Forja, BYTE puede exigir a NEXO que diga quién escribió el
   comando («Dímelo.») o dejarlo pasar; si lo pregunta, NEXO responde que no tiene ese registro y en
   la revelación BYTE se lo echa en cara. Encontrar el fragmento «Aunque me duela» añade otro reproche.
   Estas decisiones y la del reencuentro ajustan la confianza entre ambos.
4. **Ausencia de NEXO con cambio jugable**: tras la revelación el mundo se tiñe de frío, la música
   pasa al tema «lonely» y las pistas las da el sistema, sin personalidad. Cuando NEXO vuelve, sus
   pistas se etiquetan como **HIPÓTESIS** para separar hechos de conjeturas.
5. **DELETE NULL como simulación de consecuencias**: elegir borrar a NULL muestra lo que ocurriría
   (contención 0 %, CASCADE sin límite) y se revierte; la única salida es interrumpir el proceso,
   coherente con el tema de las interrupciones.
6. **BUS BRIDGE «LOS TRES»**: la reintegración exige elegir datos + direcciones + control, porque una
   comunicación incompleta fue lo que separó a NEXO y NULL.
7. **Desafío final de equilibrio**: rendimiento, seguridad, integridad y continuidad del usuario
   están acoplados; optimizar una sola variable rompe las demás (el mismo error que causó el incidente).
8. **Fragmento recuperado de la caché en el jefe**: tras la fase de caché, NEXO rescata un recuerdo
   que CASCADE casi borra («Que guarda lo que usas a menudo. — Tus preguntas.»): la mecánica de la
   caché se convierte en un momento de la relación entre BYTE y NEXO.
9. **Terminales históricas** (Von Neumann, Lovelace, Shannon, Hopper, Turing) como lectura opcional
   que desbloquea entradas de HISTORIA en el Codex.
10. **Letras N‑E‑X‑U‑S** escondidas, una por región, con escena extra tras los créditos.
11. **Orbes de eco** como forma diegética del repaso espaciado: aparecen en el mundo cuando un
    concepto debe repasarse.
12. **Menú de posjuego**: al pulsar CONTINUE con la historia terminada se puede volver a ver el
    epílogo, consultar el informe o entrar en práctica y selección de niveles.
13. **«El error es información, no un veredicto»**: la pantalla de apagado tras perder toda la
    energía refuerza el tono del juego; se reaparece en el último checkpoint.
