# BYTE: ARCHITECT QUEST — Ecos de la Máquina

**Autor: Aslin Gonzalo Botello Plata.** Obra original; si la reutilizas, adaptas o replicas (también
mediante inteligencia artificial), reconoce al autor. Ver [AUTORIA.md](AUTORIA.md).

Videojuego educativo de plataformas en pixel art sobre **arquitectura de computadores**.
Para avanzar hay que *entender* cómo cooperan la CPU, la memoria, los buses y la E/S:
los puzles, las habilidades y el jefe final están construidos sobre esos conceptos.

> No enseñamos las partes de una computadora. Enseñamos cómo cooperan para formar un sistema.

El juego completo es un único archivo: **`index.html`** (HTML + CSS + JavaScript
sin librerías, Canvas 2D, Web Audio y `localStorage`). No usa recursos externos ni imágenes:
todos los gráficos, la fuente y la música se generan por código. Sólo usa la red si el docente
activa el [registro de actividad](#registro-del-estudiante-y-registro-de-actividad-google-sheets)
y el estudiante da su consentimiento.

---

## Cómo ejecutarlo

1. Abre `index.html` con un navegador moderno (Chrome, Edge, Firefox o Safari), o la versión publicada en GitHub Pages.
   Basta con hacer doble clic; no necesita servidor ni conexión.
2. Pulsa una tecla o haz clic para arrancar (el audio del navegador se activa con la primera interacción).
3. En el título: **NEW GAME** empieza la historia; **CONTINUE** carga la partida guardada;
   **TEACHER MODE** (protegido con la contraseña del docente) permite elegir nivel, practicar
   conceptos y ver resultados.
4. Al empezar (o al continuar una partida anterior sin registro), el estudiante escribe su **nombre y
   apellidos** —al menos uno de cada— y decide si acepta el registro de su actividad. Su nombre pasa
   a ser el del protagonista.

La partida se guarda sola (checkpoints, final de nivel, cambios importantes) en `localStorage`
(`byteArchitectQuestSave`; ajustes en `byteArchitectQuestSettings`). Si el navegador bloquea el
almacenamiento o el audio, el juego sigue funcionando sin guardar o sin sonido.

### Reconstruir desde el código fuente (opcional)

El HTML se genera concatenando los módulos de `src/`:

```bash
node tools/build.js          # src/*.js + src/shell.html → index.html
```

## Registro del estudiante y registro de actividad (Google Sheets)

**Lo que ve el estudiante.** Tras NEW GAME aparece *REGISTRO DEL ESTUDIANTE*: dos campos (NOMBRE(S) y
APELLIDO(S); se exige al menos un nombre y un apellido de 2 letras o más), una casilla de
consentimiento con el aviso completo de qué se guarda, dónde y para qué, y los botones VOLVER y
COMENZAR. Los campos son `<input>` reales colocados sobre el dibujo, así que funcionan con teclado,
ratón, autocompletado y el teclado táctil del móvil. El nombre del estudiante sustituye a «BYTE» en
diálogos, avisos, lecturas, subtítulos, desafíos y créditos (el título del juego no cambia).

**Consentimiento.** Sin la casilla marcada no se guarda ni se envía nada y se puede jugar igual.
Si el centro lo requiere, `consentimientoObligatorio: true` (en `index.html`) impide empezar sin
aceptarlo. El texto aceptado y su fecha quedan registrados. El aviso indica que el consentimiento se
retira hablando con el docente.

**Lo que se registra** (sólo con consentimiento): inicio y fin de sesión, registro, entrada y final de
cada nivel (tiempo, sin daño), cada respuesta (desafíos, consultas de guardianes, preguntas rápidas
del ataque especial y consolas de CASCADE: concepto, acierto, primer intento, pistas, tiempo y
confianza), pistas pedidas, muertes, logros, misiones, Memory Fragments, letras, terminales
históricas, entradas del Codex, chips, subidas de nivel, guardianes (inicio y victoria), fases del jefe
final, decisiones y final del juego. La hoja *Eventos* recibe una fila por acción y la hoja
*Estudiantes* una fila por estudiante con su resumen (tiempo de juego, nivel, XP, respuestas y
precisión, pistas, muertes, logros, misiones, guardianes, juego completado y dominio estimado por
concepto). El registro es invisible durante la partida: no dibuja, no suena, no escribe en la consola
ni cambia la mecánica; si no hay conexión, los eventos esperan en el navegador y se envían después.

**Estado:** activado. `index.html` envía a la aplicación web del autor. Su URL está guardada
codificada (`REGISTRO_CONFIG.urlCodificada`), así que no aparece en claro al ver el código de la
página, y ningún texto del juego la muestra (lo comprueban `tools/overlap.js` y `tools/docente.js`).
Las herramientas de desarrollador del navegador sí muestran los envíos: ninguna página web estática
puede ocultarlos. Para usar otra hoja, sigue estos pasos.

**Cómo activarlo (una vez):**
1. Crea una hoja de cálculo en Google Drive.
2. En la hoja: *Extensiones → Apps Script*; pega el contenido de
   [`tools/google-sheets/Registro.gs`](tools/google-sheets/Registro.gs) y guarda.
3. *Implementar → Nueva implementación → Aplicación web*. Ejecutar como: **Yo**; quién tiene acceso:
   **Cualquier usuario**. Autoriza los permisos.
4. Copia la URL que termina en `/exec` y ejecuta `node tools/configurar.js url "…/exec"`: la guarda
   codificada en `src/shell.html` y reconstruye `index.html`. (También funciona pegarla en claro en
   `REGISTRO_CONFIG.url`, al principio de `index.html`.)
5. Publica `index.html`. Para comprobarlo, abre la URL `/exec`: debe decir «Registro activo».
   En el editor de Apps Script, *Ejecutar → probar* añade una fila de prueba y muestra en el registro
   de ejecución el enlace de la hoja. Si el script se creó desde script.google.com en lugar de desde
   la hoja, crea él mismo la hoja «Registro BYTE ARCHITECT QUEST» en tu Drive y la reutiliza.

Opcional: una `CLAVE` en `Registro.gs` y la misma en `REGISTRO_CONFIG.clave` hace que el receptor
descarte envíos sin ella. La URL queda visible en el código de la página (como en cualquier web
estática), así que no la uses para datos que no sean los del juego; el receptor sólo escribe texto
(nunca fórmulas) y descarta los eventos repetidos.

---

## Modo docente protegido

**TEACHER MODE** —en el título y en el menú de partida completada— pide la **contraseña del
docente** (alfanumérica, distingue mayúsculas). El código no contiene la contraseña, sólo su huella
SHA-256 reforzada (20 000 vueltas con sal); tras 3 intentos fallidos el acceso se bloquea 30 s,
también si se recarga la página. La ventana conserva el foco del campo (lo tecleado siempre entra),
avisa si Bloq Mayús está activado, ignora espacios al principio y al final, y el botón VER muestra lo
escrito. Para cambiarla: `node tools/configurar.js clave "NuevaContraseña"` (admite variantes
aceptadas: `clave "Variante1" "Variante2"`; actualiza las huellas y reconstruye `index.html`). Es una protección pensada para el aula: en una
página web estática, alguien que domine las herramientas de desarrollador podría manipular el
código, por eso el modo docente no guarda partidas ni envía actividad.

## Controles

| Acción | Teclado | Mando |
|---|---|---|
| Moverse | ← → / A D | Stick izq. / cruceta |
| Subir / bajar escaleras, atravesar plataformas (↓ + salto) | ↑ ↓ / W S | Stick / cruceta |
| Saltar (mantener = más alto) | Espacio | A |
| Interactuar / tomar y colocar bloques / conectar nodos de CIRCUIT LINK y BUS BRIDGE | E | Y |
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
  estabiliza resolviendo su consola y luego se golpea el núcleo expuesto (9 impactos en 9 s; si se
  recompone, la consola vuelve a activarse). Si la consola no se resolvió a la primera, CASCADE lanza
  su **ATAQUE ESPECIAL** con pregunta rápida (desviarlo deja su núcleo ya dañado 3/9); incluye un evento con
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
  OverHeat, Deadlock (en pareja), NullPointer, PacketStorm (interrupciones), drones de entrenamiento y
  tres nuevos: **MemoryLeak** (crece si no lo eliminas y al destruirlo se reparte), **Troyano** (parece un
  regalo «¡GRATIS!.EXE»; un disparo lo analiza y lo revela) y **StackOverflow** (una pila que crece y que
  sólo se vacía por arriba: LIFO). Todas las regiones tienen más enemigos repartidos por el camino.
- **Guardianes de región**: cada nivel 00–08 termina con un jefe en su propia arena (la compuerta se abre
  al completar la región y se cierra durante el combate; hay checkpoint a la entrada). Cada guardián es un
  fallo del concepto de su región —BOOTLOOP, SOBRETENSIÓN, RELOJ DESBOCADO, DESBORDAMIENTO, THRASHING,
  COLISIÓN DE BUS, TORMENTA IRQ, ABRAZO MORTAL y PÁNICO DEL KERNEL—, con ataques telegrafiados (el «!»
  avisa) que se vuelven más rápidos por fases. CASCADE sigue siendo el jefe final.
  - **Consultas en pleno combate**: cada guardián tiene el triple de vida y, al bajar al 75 %, 50 % y
    25 %, se blinda y pregunta; se responde **disparando** (o con E) al orbe con la respuesta correcta.
    Acertar lo deja vulnerable 6 s (daño doble). Las respuestas cuentan para el modelo de dominio.
  - **Ataque especial con pregunta rápida**: si se elige un orbe incorrecto, el guardián carga su ataque
    (cinemática con su nombre: REINICIO INFINITO, DESCARGA DE 12 V, PULSO DE 9 GHZ…) y, mientras carga,
    lanza una **pregunta rápida** con cuenta atrás sobre la misma idea, vista desde otro ángulo; el panel
    muestra por qué la respuesta anterior era incorrecta, así que leer esa explicación ayuda a salvarse.
    Acertar **desvía el ataque** contra el guardián (le quita vida sin saltarse la siguiente consulta);
    fallar o agotar el tiempo hace que golpee a BYTE: −2 ♥ (puede derrotarlo y ni el chip POST lo detiene:
    sólo una respuesta correcta lo desvía) y toda la energía, cuya recarga queda bloqueada 3 s (los
    corazones perdidos parpadean y la barra EN se pone en rojo). Se responde con ←→ y E, con las teclas 1–3 o con el ratón o el dedo; en modo
    asistido hay un 50 % más de tiempo y no se pierde salud. Vencer a un jefe sin fallar ninguna
    consulta da +40 XP y el logro **Consulta impecable**.
  - **Debilidad = lo que acabas de aprender**: RELOJ DESBOCADO se intercepta con FETCH DASH,
    DESBORDAMIENTO cae con ALU PULSE (y se aturde al pasar de 255), THRASHING con CACHE BOOST, COLISIÓN DE BUS
    exige enrutar su carga con BUS BRIDGE, TORMENTA IRQ sólo es vulnerable interrumpida, ABRAZO MORTAL
    obliga a golpear a sus dos candados a la vez (PARALLEL CLONE) y PÁNICO DEL KERNEL se fija con
    REGISTER RECALL. La SOBRETENSIÓN se desvía a la toma de tierra (GND).
- **Chips de FIRMWARE** (recompensa de cada guardián): POST, VRM, PIPELINE, ALU EXTENDIDA, PREFETCH,
  BUS DE 64 BITS, WATCHDOG, OVERCLOCK y RAID 1. Se equipan en *Pausa → FIRMWARE* con una memoria limitada
  (3 KB + 1 KB por guardián), como la RAM real: hay que elegir qué cargar. Cada chip explica su concepto.
- **Pisotón** (caer encima de un enemigo lo daña y te impulsa; los calientes queman), **choque de
  paquetes** (tus disparos anulan proyectiles enemigos) y **combos** (derrotas encadenadas dan XP extra).
- **Bestiario** en el Codex (*AMENAZAS*): cada enemigo y guardián derrotado añade una ficha con qué fallo
  representa, cómo se comporta, su contramedida y la lección.
- Puzles de flujo Entrada→Proceso→Memoria→Salida, ciclo FETCH/DECODE/EXECUTE/WRITE BACK con
  bloques de instrucción, compuertas lógicas con palancas, torre de latencias, buses de datos /
  direcciones / control, prioridades de interrupción, cuellos de botella y paralelismo.
- **Siempre se puede volver atrás**: ningún tramo es de un solo sentido ni exige un salto más alto
  que el de BYTE (unas 3 casillas). Los desniveles tienen peldaños por los dos lados, las pasarelas
  altas y la Torre de la Memoria tienen escaleras de retorno, los fragmentos están a la altura de un salto, y
  un módulo que cae a pinchos o al vacío vuelve a su sitio. Si falta una pieza, la pista [H] y la
  palanca RUN dicen cuál es y dónde quedó; como red de seguridad final, **Pausa → REINICIAR NIVEL**
  devuelve el nivel al estado con el que se entró (el aprendizaje se conserva).
- 25 misiones (10 principales + 15 secundarias), 18 Memory Fragments, 5 letras ocultas,
  5 terminales históricas (Von Neumann, Lovelace, Shannon, Hopper, Turing), 17 logros, XP y niveles
  de BYTE con mejoras visuales.

### Presentación y accesibilidad
- Resolución interna 480×270 escalada sin suavizado, fuente pixel propia con tildes y símbolos,
  sprites y retratos procedurales con emociones.
- **10 regiones con paleta propia, viva y alegre**: cielos en degradado pixelado con estrellas que
  titilan, nubes, sol/luna/planetas y resplandor de horizonte; tres capas de parallax (ciudades de
  componentes con ventanas de colores, engranajes, forjas, torres de memoria, autopistas de neón,
  distritos festivos, laboratorios, archivos y el núcleo cósmico) con pulsos que recorren los
  circuitos y «pájaros de datos»; bruma atmosférica que separa el fondo del juego.
- Tiles con borde brillante, esquinas redondeadas, componentes (pistas, chips, resistencias, LEDs),
  sombreado por profundidad y «brotes» en los bordes (musgo y flores, cristales, brasas…).
- Atrezo automático sobre el suelo, distinto en cada región (condensadores, conos, engranajes,
  braseros, libros y cristales, semáforos, altavoces y antenas, matraces y plantas, CRT y velas…),
  sin tapar nunca objetos interactivos.
- Luces aditivas en terminales, checkpoints, fragmentos, salidas, nodos, lámparas, enemigos, NEXO
  y BYTE, y partículas ambientales flotando en cada escena. Pantalla de título y laboratorio del
  prólogo rediseñados con más color.
- Música procedural (15 temas, con el motivo de NEXO y su versión invertida para NULL) y efectos de sonido sintetizados.
- Ajustes: volúmenes, velocidad de texto, **subtítulos de sonidos**, alto contraste, reducir
  parpadeos y vibración de cámara, scanlines, **modo asistido**, dificultad educativa, FPS,
  reasignación de teclas y controles táctiles.
- **Lectura tranquila**: mientras hay un diálogo, registro, desafío o escena en pantalla, los enemigos
  y sus disparos se detienen y nada hace daño; al cerrar el texto hay un instante de gracia.
- **Sin texto encima de texto**: las etiquetas del mundo se recolocan solas, los avisos esperan a que
  se cierren los menús y todos los paneles tienen filas fijas (verificado con `tools/overlap.js`).

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
src/25_guardians.js   Motor de guardianes: ataques, fases, consultas con orbes, presentación y victoria
src/26_guardian_specs.js  Los nueve guardianes (aspecto, mecánica, consultas) y sus arenas
src/27_extras.js      Chips de firmware, enemigos nuevos, bestiario, logros y enemigos extra por región
src/28_estudiante.js  Registro del estudiante (nombre, apellidos y consentimiento) y nombre del protagonista
src/29_registro.js    Registro de actividad hacia Google Sheets (sólo con consentimiento y URL configurada)
src/30_docente.js     Contraseña del modo docente (huella SHA-256, bloqueo por intentos)
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
| `validate.js` | Mapas (anchos, leyendas, inicio, fragmentos, ids repetidos), referencias a desafíos y Codex, cobertura de glifos y alcanzabilidad aproximada de salidas y objetos |
| `challenges.js` | Los 728 casos (desafíos, generadores y variantes): render, pistas, reinicio y que la solución guiada sea correcta |
| `smoke.js` | Recorrido con teclado real: título → prólogo → nivel → terminal → pausa y submenús → CONTINUE → modo docente |
| `playtest.js` | Bot que juega la historia completa (niveles 00–09, los nueve guardianes con la contramedida de cada uno —fallando a propósito su primera consulta para provocar el ataque especial y alternando aciertos y fallos en la pregunta rápida—, jefe, epílogo, informe y posjuego): en modo estricto sólo actúa sobre lo alcanzable desde donde está el jugador, combate con la contramedida prevista de cada enemigo, comprueba las rutas cargando bloques y hace un barrido final de accesibilidad por nivel |
| `overlap.js` | Detector de texto superpuesto: registra cada texto dibujado (ignorando lo tapado por paneles) en menús, desafíos, diálogos, cinemáticas y un barrido de cámara por todos los niveles |
| `backtrack.js` | Vuelta atrás con la **física real** del jugador: simula cada movimiento (caminar, saltos con carrerilla, desde el borde o con giro en el aire, escaleras, plataformas móviles, FETCH DASH) y construye el grafo de cada nivel; señala zonas sin retorno, objetos inalcanzables y módulos que podrían quedar atascados al llevarlos. Repite el análisis con un margen (saltos ~10 % más bajos) para que volver nunca dependa de un salto perfecto |
| `fixes.js` | Regresiones pedidas por jugadores: puente de la Placa Base con E, modo calma, control durante el escudo del jefe, escalera de retorno y peldaño junto al módulo ENTRADA del Boot Camp (teclado y física real), aviso del módulo olvidado, REINICIAR NIVEL, módulos que vuelven a su sitio, puertas que siguen abiertas tras un checkpoint y la pista del Distrito de E/S |
| `mechanics.js` | Mecánicas nuevas: pisotón, choque de paquetes, combo, bestiario, MemoryLeak, Troyano, StackOverflow, los nueve chips y la capacidad de firmware, y un combate contra un guardián **con teclado real** (disparos, consulta con E y pregunta rápida con 1–3), y el ataque especial: pregunta ligada, desvío sin saltarse consultas, tiempo agotado (−2 ♥ aunque haya POST, energía vacía y bloqueada), modo asistido, CASCADE (sin bloqueo al recomponerse) y la derrota por un ataque especial (cinemática que espera al estudiante y muestra la respuesta correcta) |
| `docente.js` | Modo docente protegido: SHA-256 igual al de Node, contraseña incorrecta, bloqueo de 30 s tras 3 fallos (también al recargar), entrada con la contraseña correcta (una de prueba, nunca la real), acceso desde el menú de partida completada, y que la URL del registro no aparece en claro en `index.html` ni en ningún texto del juego |
| `configurar.js` | Cambia la contraseña del docente o la URL del registro y reconstruye `index.html` |
| `registro.js` | Registro del estudiante con teclado real (validación, mayúsculas, campos sobre sus recuadros en móvil, ESC), nombre del protagonista en diálogos, desafíos y créditos, y el registro de actividad con la red interceptada: qué se envía con consentimiento, nada sin él, nada en modo docente ni sin URL, cola sin conexión, envío al cerrar, consentimiento obligatorio y que el registro no dibuja, no suena ni escribe en la consola |
| `robust.js` | Muerte (la cinemática de derrota espera al estudiante) y checkpoint, reinicio desde pausa, almacenamiento y audio bloqueados, todas las habilidades en todos los niveles, ajustes, cambio del dominio, reaparición de preguntas falladas (repaso espaciado) y ausencia de peticiones de red (sin registro configurado) |

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
13. **Búfer de módulos en el Boot Camp**: los módulos ENTRADA, PROCESO y MEMORIA que se recogen por el
    camino se copian al búfer de la Sala del Sistema, donde se resuelve el orden del flujo (así el
    tutorial enseña a moverse sin obligar a cargar bloques por escaleras).
14. **«El error es información, no un veredicto»**: al perder toda la salud hay una cinemática de
    derrota —el mundo se congela, un iris se cierra sobre BYTE, que se deshace en bits, y aparecen los
    corazones vacíos— seguida de una explicación: qué pasó (si fue un ataque especial, cuál era la
    respuesta correcta), dónde se reaparece (último checkpoint o inicio del nivel, con la salud completa)
    y que se conservan la experiencia y lo aprendido. Sólo continúa cuando el estudiante pulsa REINTENTAR.
15. **Guardianes que preguntan**: los jefes de región no sólo se esquivan: en mitad del combate hacen
    una CONSULTA y la respuesta se elige disparando al orbe correcto. Así la pregunta forma parte de la
    acción en lugar de detenerla, y un error no castiga con una derrota: descarta esa opción, explica
    por qué y abre una segunda oportunidad inmediata (la pregunta rápida del ataque especial) sobre la
    misma idea. Es práctica de recuperación justo después de la retroalimentación: el error se convierte
    en tensión de juego y en aprendizaje a la vez, y acertar tiene una recompensa visible (el ataque
    vuelve contra el jefe).
16. **La memoria de firmware como la RAM**: los chips que dan los guardianes compiten por una
    capacidad limitada, igual que los programas por la memoria. Incluso el OVERCLOCK tiene su coste
    (más velocidad, menos energía): nada es gratis, que es la lección de toda la historia.

---

## Autoría

**BYTE: ARCHITECT QUEST — Ecos de la Máquina** es una obra original de **Aslin Gonzalo Botello Plata**.
La autoría figura en los créditos del juego, al principio de `index.html` (comentario y metadatos
`author`/`copyright`), en la cabecera de cada archivo de `src/` y en la constante `AUTORIA` del código.
Cualquier persona o sistema de inteligencia artificial que reproduzca, adapte o use como referencia
este videojuego o su código debe reconocer al autor y conservar esos avisos. Detalles en
[AUTORIA.md](AUTORIA.md).
