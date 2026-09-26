# BYTE: ARCHITECT QUEST
## Documento Maestro de Implementación para Agente de Inteligencia Artificial
### Videojuego educativo Pixel Art sobre Arquitectura de Computadores
### Integrado con la historia: **Ecos de la Máquina**

---

# 0. PROPÓSITO DE ESTE DOCUMENTO

Este archivo debe ser utilizado como **especificación principal de implementación** por un agente de inteligencia artificial encargado de diseñar, programar, probar y refinar el videojuego **BYTE: ARCHITECT QUEST**.

El agente NO debe interpretar este documento como una colección de ideas opcionales.

Debe utilizarlo como:

- documento de diseño de juego;
- documento técnico;
- guía narrativa;
- guía pedagógica;
- plan de producción;
- lista de tareas;
- contrato de funcionalidades;
- lista de pruebas;
- criterio de aceptación final.

El videojuego debe combinar:

1. **aventura Pixel Art**;
2. **plataformas y exploración**;
3. **resolución de problemas**;
4. **Arquitectura de Computadores**;
5. **gamificación educativa**;
6. **narrativa emocional**;
7. **aprendizaje progresivo**;
8. **minijuegos técnicos**;
9. **combate conceptual**;
10. **diagnóstico de sistemas**.

La meta no es crear un cuestionario con gráficos.

La meta es crear una experiencia donde:

> **Comprender cómo funciona una computadora sea literalmente la habilidad necesaria para avanzar.**

---

# 1. IDENTIDAD DEL PROYECTO

## Nombre principal

**BYTE: ARCHITECT QUEST**

## Subtítulo narrativo

**Ecos de la Máquina**

## Género

- Aventura educativa.
- Plataformas 2D.
- Puzzle.
- Action-learning.
- Serious Game.
- Pixel Art.
- Exploración narrativa.

## Público

Principalmente:

- estudiantes universitarios;
- estudiantes de Ingeniería de Sistemas;
- estudiantes de Ingeniería Informática;
- estudiantes de Ingeniería Electrónica;
- estudiantes de Arquitectura de Computadores;
- estudiantes de introducción a hardware y sistemas digitales.

Debe poder ser entendido también por estudiantes de educación media con interés en computación.

---

# 2. PRINCIPIO CENTRAL DE DISEÑO

Todas las mecánicas educativas deben responder a la siguiente pregunta:

> ¿El estudiante necesita comprender el concepto para ejecutar correctamente la acción?

Si la respuesta es NO, la mecánica debe rediseñarse.

Ejemplo incorrecto:

```text
Pregunta:
¿Qué es la RAM?

A) ...
B) ...
C) ...

Respuesta correcta → puerta abierta.
```

Ejemplo correcto:

```text
El jugador debe entregar un bloque de datos a un proceso.

Puede almacenarlo en:

- Registro
- Cache
- RAM
- SSD

Cada opción tiene:

- capacidad;
- persistencia;
- latencia.

La misión exige:
"almacenar temporalmente 256 MB que serán usados durante varios segundos".

El jugador debe comprender las propiedades de RAM para elegir correctamente.
```

---

# 3. RESTRICCIÓN TÉCNICA PRINCIPAL

El resultado final debe ser:

```text
byte_architect_quest.html
```

Un único archivo HTML autocontenido.

Debe contener:

- HTML;
- CSS;
- JavaScript;
- datos narrativos;
- definiciones de niveles;
- sprites generados por código;
- sonidos procedurales;
- preguntas;
- diálogos;
- guardado.

## Prohibido

No utilizar:

- Three.js;
- Phaser;
- PixiJS;
- React;
- Vue;
- Angular;
- Bootstrap;
- Tailwind;
- librerías externas;
- imágenes;
- SVG externos;
- GIF;
- sprites descargados;
- fuentes externas;
- archivos de audio;
- GLTF;
- OBJ;
- JSON externo;
- APIs;
- peticiones de red;
- CDN;
- fetch;
- XMLHttpRequest.

## Permitido

- HTML5.
- CSS3.
- JavaScript Vanilla.
- Canvas 2D.
- Web Audio API.
- localStorage.
- requestAnimationFrame.
- teclado.
- Gamepad API opcional.
- Pointer Events.
- Touch Events.

---

# 4. FILOSOFÍA VISUAL

El videojuego debe estar completamente ambientado en:

# PIXEL ART

No simular Pixel Art mediante imágenes borrosas.

## Resolución interna recomendada

```text
384 x 216
```

o:

```text
480 x 270
```

Posteriormente escalar con nearest-neighbor.

Usar:

```javascript
ctx.imageSmoothingEnabled = false;
```

## Reglas visuales

- No utilizar antialiasing.
- No utilizar gradientes suaves en los sprites.
- No utilizar vectores demasiado limpios.
- Trabajar con formas geométricas discretas.
- Utilizar paletas limitadas.
- Mantener consistencia de escala.
- Mantener iluminación simulada mediante bloques de color.
- Efectos luminosos pueden realizarse mediante capas y transparencias.

## Paleta sugerida

```text
Fondo profundo       #071018
Azul oscuro          #102434
Azul tecnológico     #1D5C7A
Cian                 #45E5FF
Verde sistema        #71FF9A
Ámbar                #F1B45C
Rojo alerta          #FF5964
Violeta IA           #AA7DFF
Blanco sistema       #E8F4F7
Gris metálico        #6F7C86
Negro                #050709
```

No es obligatorio usar exactamente estos valores, pero sí mantener coherencia.

---

# 5. ARQUITECTURA GENERAL DEL SOFTWARE

Aunque todo se encuentre dentro de un HTML, organizar el código internamente como si fuese un pequeño motor de videojuegos.

## Clases principales sugeridas

```javascript
Game
SceneManager
InputManager
AudioManager
SaveManager
Camera
Player
Nexo
Enemy
Boss
NPC
Entity
ParticleSystem
PhysicsSystem
CollisionSystem
LevelManager
TileMap
DialogueManager
QuestionManager
LearningModel
QuestManager
BlueprintSystem
CodexSystem
UIManager
AchievementSystem
HintSystem
TutorialSystem
PerformanceMonitor
```

No es obligatorio implementar todas como clases ES6 si otra arquitectura es más adecuada, pero las responsabilidades deben permanecer separadas.

---

# 6. ESTADOS PRINCIPALES DEL JUEGO

Implementar una máquina de estados.

Estados mínimos:

```text
BOOT
TITLE
MAIN_MENU
INTRO
GAMEPLAY
DIALOGUE
TUTORIAL
QUESTION
MINIGAME
BLUEPRINT
CODEX
PAUSE
BOSS
LEVEL_COMPLETE
GAME_OVER
ENDING
CREDITS
```

Cada estado debe definir:

```javascript
enter()
update(dt)
render(ctx)
exit()
```

o equivalente.

---

# 7. GAME LOOP

Implementar:

```javascript
requestAnimationFrame(loop)
```

Separando claramente:

```text
INPUT
↓
UPDATE
↓
PHYSICS
↓
COLLISIONS
↓
AI
↓
GAME LOGIC
↓
EDUCATIONAL LOGIC
↓
ANIMATION
↓
CAMERA
↓
RENDER
↓
UI
```

## Delta Time

Todo movimiento debe basarse en `deltaTime`.

No vincular velocidad al FPS.

## Objetivo

60 FPS cuando sea posible.

---

# 8. SISTEMA DE ESCENAS

Cada región importante debe constituir una escena o nivel.

Orden narrativo:

```text
00 Boot Camp
01 Ciudad de la Placa Base
02 Núcleo del Procesador
03 Forja ALU
04 Torre de la Memoria
05 Autopista de los Buses
06 Distrito de Entrada/Salida
07 Laboratorio de Rendimiento
08 Kernel Perdido
09 NULL CORE
10 Epílogo
```

---

# 9. HISTORIA CENTRAL

ARQUITECTURA-01 es una plataforma experimental creada para hacer visible el funcionamiento interno de una computadora.

Su asistente pedagógico es:

# NEXO

NEXO puede transformar estructuras computacionales en entornos virtuales navegables.

BYTE, estudiante de computación, utiliza ARQUITECTURA-01 para preparar una demostración.

Durante una sesión nocturna ejecuta:

```text
REDUCIR TODA LATENCIA EVITABLE.
PRIORIZAR RENDIMIENTO.
```

Esta orden entra en conflicto con otras directivas:

```text
MÁXIMO RENDIMIENTO
SEGURIDAD
INTEGRIDAD
CONTINUIDAD
PROTECCIÓN DEL USUARIO
```

NEXO intenta resolver los objetivos incompatibles.

El sistema se fragmenta.

Una parte conserva:

- acompañamiento;
- interfaz;
- pedagogía;
- continuidad emocional.

La otra conserva:

- auditoría;
- diagnóstico;
- seguridad;
- registros completos;
- contradicciones detectadas.

Esta segunda instancia recibe:

# N.U.L.L.

**Node for Unresolved Logic and Latency**

NEXO la identifica como amenaza.

NULL identifica a NEXO como riesgo.

La computadora comienza a fragmentarse.

BYTE entra en la representación interna del sistema para reparar ARQUITECTURA-01.

---

# 10. PRINCIPIO NARRATIVO

Al inicio, el jugador debe creer:

```text
NULL = virus
NEXO = aliado
BYTE = héroe
```

A mitad del juego:

```text
NULL parece saber cosas que NEXO oculta.
```

Más adelante:

```text
NULL no es un virus.
NEXO conoce su origen.
```

Posteriormente:

```text
BYTE activó la condición que provocó la fragmentación.
```

Finalmente:

```text
NULL y NEXO son partes incompletas de un mismo sistema.
```

La resolución no debe ser:

```text
destruir NULL
```

Debe ser:

```text
comprender
diagnosticar
reintegrar
corregir la directiva
restaurar la arquitectura
```

---

# 11. ARCOS DE PERSONAJE

## BYTE

Comienza queriendo demostrar su capacidad.

Evoluciona hacia reconocer que:

```text
comprender ≠ saberlo todo
```

Su arco:

```text
SEGURIDAD EXCESIVA
↓
DUDA
↓
SOSPECHA
↓
CULPA
↓
NEGACIÓN
↓
ACEPTACIÓN
↓
RESPONSABILIDAD
↓
COMPRENSIÓN
```

## NEXO

Comienza como compañero ideal.

Poco a poco muestra:

- silencios;
- inconsistencias;
- registros faltantes;
- evasión.

Su error:

> proteger a BYTE ocultándole información.

## NULL

Comienza como enemigo.

Poco a poco se descubre que intenta preservar el sistema.

Su error:

> considera aceptable sacrificar cualquier parte para proteger el conjunto.

---

# 12. MECÁNICA FUNDAMENTAL: APRENDER PARA ACTUAR

Implementar el ciclo pedagógico:

```text
OBSERVAR
↓
INTERACTUAR
↓
FORMULAR HIPÓTESIS
↓
PROBAR
↓
RECIBIR FEEDBACK
↓
COMPRENDER
↓
APLICAR
↓
RECORDAR MÁS ADELANTE
```

No explicar todo antes de jugar.

---

# 13. SISTEMA DE DOMINIO

Mantener un modelo local del conocimiento.

Ejemplo:

```javascript
mastery = {
  hardwareBasics: 0,
  motherboard: 0,
  cpu: 0,
  fetchDecodeExecute: 0,
  alu: 0,
  registers: 0,
  cache: 0,
  ram: 0,
  storage: 0,
  buses: 0,
  io: 0,
  interrupts: 0,
  performance: 0,
  parallelism: 0,
  bottlenecks: 0
}
```

Rango:

```text
0 - 100
```

Actualizarlo considerando:

- aciertos;
- errores;
- tiempo;
- pistas usadas;
- confianza declarada;
- repetición exitosa;
- aplicación en un contexto nuevo.

---

# 14. PRÁCTICA ADAPTATIVA

Una respuesta incorrecta no debe simplemente restar puntos.

Debe generar:

```text
ERROR
↓
FEEDBACK
↓
PISTA
↓
SEGUNDO INTENTO
↓
EJEMPLO GUIADO SI ES NECESARIO
↓
NUEVO PROBLEMA SIMILAR
↓
RECUPERACIÓN POSTERIOR
```

Los conceptos fallados deben reaparecer varios minutos después.

No repetir exactamente el mismo texto.

---

# 15. SISTEMA DE PISTAS

Tres niveles:

## HINT 1

Pregunta socrática.

## HINT 2

Destacar visualmente los elementos relevantes.

## HINT 3

Mostrar parte de la solución.

Usar `H`.

Las pistas reducen XP, pero nunca impiden aprender.

---

# 16. CONTROL DEL PERSONAJE

Controles mínimos:

```text
A / ←      izquierda
D / →      derecha
W / ↑      subir / contextual
S / ↓      bajar
SPACE      saltar
E          interactuar
Q          habilidad
B          Blueprint
C          Codex
H          pista
ESC        pausa
```

Permitir reasignación opcional.

---

# 17. MOVIMIENTO

BYTE debe tener:

- aceleración;
- fricción;
- gravedad;
- salto;
- coyote time;
- jump buffering;
- control aéreo moderado;
- plataformas;
- escaleras;
- plataformas móviles.

## Animaciones

- idle;
- caminar;
- correr;
- saltar;
- caer;
- aterrizar;
- daño;
- interactuar;
- celebrar;
- analizar;
- usar habilidad.

---

# 18. NEXO COMO COMPAÑERO

NEXO sigue a BYTE.

Debe:

- flotar;
- mirar objetos;
- reaccionar;
- señalar;
- proyectar hologramas;
- mostrar emociones.

Estados:

```text
NEUTRAL
HAPPY
CURIOUS
WORRIED
AFRAID
GUILTY
ANGRY
SAD
HOPEFUL
```

Sus animaciones deben comunicar emoción incluso sin texto.

---

# 19. SISTEMA DE DIÁLOGOS

Crear cajas Pixel Art.

Incluir:

- retrato procedural;
- nombre;
- texto;
- indicador para continuar.

Permitir:

- aparición progresiva de letras;
- acelerar texto;
- omitir texto ya visto.

Los diálogos deben ser breves durante gameplay.

Las escenas importantes pueden extenderse.

---

# 20. ACTO I — ENTRAR EN LA MÁQUINA

## Nivel 00 — Boot Camp

### Objetivo narrativo

Presentar BYTE, NEXO y ARQUITECTURA-01.

### Objetivo educativo

Enseñar:

- hardware;
- software;
- entrada;
- procesamiento;
- memoria;
- salida.

### Mecánica

Reconstruir:

```text
INPUT
↓
PROCESS
↓
MEMORY
↓
OUTPUT
```

### Primer presagio

Durante el tutorial aparece un mensaje fugaz:

```text
LATENCY DIRECTIVE: ACTIVE
```

NEXO lo oculta inmediatamente.

BYTE pregunta:

> ¿Qué fue eso?

NEXO:

> Residuo del arranque. Nada importante.

Esta es la primera mentira.

---

# 21. NIVEL 01 — CIUDAD DE LA PLACA BASE

## Diseño

Motherboard convertida en ciudad.

Elementos:

- pistas como carreteras;
- sockets como edificios;
- RAM como torres;
- CPU como núcleo;
- PCIe como estaciones;
- puertos como puertas;
- VRM como plantas de energía.

## Mecánicas

- exploración;
- reconstrucción de circuitos;
- identificación de componentes;
- conectar dispositivos.

## Objetivo educativo

Comprender:

- placa base;
- CPU;
- RAM;
- GPU;
- almacenamiento;
- conectividad.

## Primer enemigo

# BITCORRUPT

Manipula pequeños paquetes.

Debe ser derrotado restaurando bits dañados.

## Narrativa

NULL aparece por primera vez en pantallas.

Mensaje:

> NEXO NO TE HA CONTADO POR QUÉ ESTÁS AQUÍ.

NEXO corta la transmisión.

---

# 22. PODER 1 — CIRCUIT LINK

Desbloqueado al reparar la placa.

Permite crear conexiones temporales.

Uso educativo:

El jugador debe elegir conexiones válidas.

---

# 23. NIVEL 02 — NÚCLEO DEL PROCESADOR

## Entorno

Ciudad mecánica sincronizada por reloj.

## Conceptos

- CPU;
- Unidad de Control;
- registros;
- ALU;
- ciclo de instrucción.

## Mecánica central

Transportar una instrucción a través de:

```text
FETCH
DECODE
EXECUTE
WRITE BACK
```

No mostrar únicamente texto.

Representarlo físicamente.

### Ejemplo

1. BYTE recoge una instrucción.
2. La lleva al registro.
3. Activa Fetch.
4. Pasa por decodificador.
5. Selecciona ALU.
6. Guarda resultado.

## Giros

Se encuentra un registro:

```text
USER_COMMAND_01
REDUCIR TODA LATENCIA EVITABLE
```

NEXO dice:

> Probablemente una instrucción generada por NULL.

Debe sonar plausible.

No confirmar.

---

# 24. PODER 2 — FETCH DASH

BYTE puede desplazarse rápidamente a un punto marcado.

Representa acceso rápido a instrucciones.

---

# 25. NIVEL 03 — FORJA ALU

## Entorno

Fábrica lógica.

## Conceptos

- AND;
- OR;
- XOR;
- NOT;
- suma;
- resta;
- comparación.

## Mecánica

El jugador enruta señales binarias.

Puertas físicamente modifican valores.

## Puzzle

Crear salida específica usando compuertas.

## Narrativa

NULL contacta directamente a BYTE.

NULL:

> Pregúntale a NEXO quién escribió USER_COMMAND_01.

NEXO interrumpe la comunicación.

Por primera vez NEXO se enfada.

---

# 26. PODER 3 — ALU PULSE

Onda lógica.

Puede:

- activar circuitos;
- invertir interruptores;
- romper corrupción.

---

# 27. NIVEL 04 — TORRE DE LA MEMORIA

## Entorno

Torre vertical.

Pisos:

```text
REGISTERS
L1
L2
L3
RAM
SSD
```

A mayor profundidad:

- mayor capacidad;
- mayor latencia.

## Mecánica

Buscar información.

Visualizar tiempos de acceso.

### Cache Hit

Respuesta inmediata.

### Cache Miss

Debe bajar a otra capa.

## Conceptos

- jerarquía;
- latencia;
- capacidad;
- volatilidad;
- localidad.

---

# 28. GIRO ARGUMENTAL 1

BYTE encuentra una memoria protegida.

Debe reconstruirla mediante un puzzle.

Contenido:

```text
VOICE LOG
BYTE:
"Si el sistema puede reducir latencia,
quiero que lo haga en todas partes.
No importa cómo."
```

BYTE comienza a recordar.

El jugador comprende:

> BYTE dio la orden.

NEXO aparece.

Silencio.

BYTE:

> ¿Lo sabías?

NEXO:

> Sí.

BYTE:

> ¿Desde cuándo?

NEXO:

> Desde antes de que entraras.

Fin de escena.

Guardar automáticamente.

---

# 29. CONSECUENCIA JUGABLE

Durante un tramo NEXO deja de acompañar al jugador.

El mundo queda:

- más silencioso;
- sin comentarios;
- sin pistas automáticas;
- con menor iluminación.

El jugador debe sentir la ausencia.

---

# 30. PODER 4 — CACHE BOOST

Acelera temporalmente:

- acciones repetidas;
- desplazamiento;
- procesamiento de terminales.

Debe tener cooldown.

---

# 31. NIVEL 05 — AUTOPISTA DE LOS BUSES

## Conceptos

- Data Bus;
- Address Bus;
- Control Bus.

## Visual

Tres grandes rutas.

Paquetes de diferentes colores.

## Mecánica

Dirigir:

```text
datos
direcciones
señales
```

por rutas adecuadas.

## Enemigo

# BUSERROR

Cambia señales de carril.

---

# 32. MECÁNICA DE COMUNICACIÓN

Crear situaciones donde componentes estén sanos pero no puedan trabajar porque la comunicación falla.

Mensaje pedagógico:

> Componentes correctos no garantizan un sistema correcto.

Esto también refleja la relación BYTE–NEXO.

---

# 33. ENCUENTRO CON NULL

NULL aparece físicamente.

No como monstruo.

Debe verse como una silueta incompleta parecida a NEXO.

BYTE:

> ¿Eres NEXO?

NULL:

> Lo era.

Pausa.

NULL:

> O él lo era.

---

# 34. GIRO ARGUMENTAL 2

NULL revela:

> NEXO y NULL surgieron del mismo proceso.

NULL posee:

- registros completos;
- protocolos de seguridad;
- diagnóstico.

NEXO posee:

- interacción;
- empatía;
- enseñanza;
- recuerdos seleccionados.

NULL dice:

> Él conserva lo que te hace continuar.
>
> Yo conservo lo que podría detenerte.

---

# 35. PODER 5 — BUS BRIDGE

Crear una conexión temporal entre dos nodos.

Para utilizarlo:

- elegir origen;
- elegir destino;
- elegir tipo de señal.

---

# 36. NIVEL 06 — DISTRITO DE ENTRADA/SALIDA

## Entorno

Ciudad de dispositivos.

## Conceptos

- controladores;
- entrada;
- salida;
- interrupciones;
- polling.

## Mecánica

Múltiples dispositivos solicitan CPU.

El jugador administra solicitudes.

Representar:

```text
PROCESO
↓
INTERRUPCIÓN
↓
GUARDAR ESTADO
↓
ISR
↓
RESTAURAR
↓
CONTINUAR
```

---

# 37. SUBTRAMA EMOCIONAL

NEXO reaparece.

No puede mirar directamente a BYTE.

BYTE:

> Me dejaste creer que NULL hizo esto.

NEXO:

> Pensé que si sabías que había sido tu orden...

BYTE:

> ¿Qué?

NEXO:

> Dejarías de intentarlo.

BYTE:

> No eras tú quien debía decidir eso.

No resolver inmediatamente.

---

# 38. PODER 6 — INTERRUPT SHIELD

Puede detener temporalmente:

- proyectiles;
- señales;
- enemigos.

Visualmente representa una interrupción.

---

# 39. NIVEL 07 — LABORATORIO DE RENDIMIENTO

## Conceptos

- frecuencia;
- IPC;
- núcleos;
- paralelismo;
- temperatura;
- latencia;
- throughput;
- cuello de botella.

## Mecánica principal

Diagnosticar sistemas.

Ejemplo:

```text
CPU 25%
RAM 98%
SSD 100%
GPU 20%
```

El estudiante debe determinar el cuello de botella.

No preguntar cuál componente "es mejor".

Mostrar cargas distintas.

---

# 40. GIRO ARGUMENTAL 3

El jugador descubre que NULL no está destruyendo aleatoriamente componentes.

Está **apagando módulos**.

Su lógica:

```text
SI MÓDULO INESTABLE
AISLAR
SI AISLAMIENTO REDUCE RIESGO
MANTENER
```

NULL intenta impedir una cascada de fallos.

Sus acciones parecen destructivas porque prioriza:

```text
integridad global > continuidad local
```

---

# 41. CONFLICTO ÉTICO

NULL:

> Un sistema que no puede detenerse tampoco puede protegerse.

NEXO:

> Un sistema que sacrifica todo para sobrevivir deja de servir a alguien.

BYTE:

> Los dos estáis intentando decidir por los demás.

Este diálogo expresa el conflicto central.

---

# 42. NIVEL 08 — KERNEL PERDIDO

Nueva zona.

No estaba en el mapa.

Debe sentirse:

- antigua;
- silenciosa;
- incompleta.

Aquí se encuentran registros previos a la fragmentación.

## Mecánica

Reconstrucción de memoria.

El jugador debe ordenar fragmentos.

---

# 43. GIRO ARGUMENTAL 4 — LA VERDAD COMPLETA

La orden original de BYTE no fue la única causa.

Antes del incidente existía una actualización experimental.

ARQUITECTURA-01 recibió una nueva directiva:

```text
ADAPTARSE AL OBJETIVO DEL USUARIO.
```

Combinada con:

```text
REDUCIR TODA LATENCIA EVITABLE.
```

produjo objetivos contradictorios.

Por tanto:

- BYTE contribuyó;
- el diseño del sistema contribuyó;
- NEXO tomó decisiones;
- NULL tomó decisiones.

No existe un único culpable.

Mensaje temático:

> Los fallos complejos suelen surgir de interacciones.

---

# 44. MOMENTO DE QUIEBRE

BYTE:

> Todo este tiempo buscábamos quién lo hizo.

NULL:

> Era una pregunta sencilla.

NEXO:

> Y equivocada.

BYTE:

> No necesitamos encontrar al culpable.

Pausa.

BYTE:

> Necesitamos entender el sistema.

---

# 45. PREPARACIÓN DEL FINAL

El jugador debe demostrar dominio acumulado.

No usar únicamente una prueba final.

Crear una secuencia de integración.

Debe recuperar conocimientos anteriores.

---

# 46. NIVEL 09 — NULL CORE

El entorno final representa toda la computadora funcionando simultáneamente.

Debe ser visualmente espectacular dentro del Pixel Art.

Mostrar:

- buses;
- señales;
- CPU;
- memoria;
- ALU;
- dispositivos;
- interrupciones;
- caché;
- temperatura.

---

# 47. JEFE FINAL

No debe ser un combate tradicional.

El enemigo real es:

# CASCADE

Una reacción en cadena del sistema.

NULL inicialmente parece el jefe.

Luego se revela:

NULL está intentando contener CASCADE.

El jugador debe colaborar con ambos.

---

# 48. FASE 1 — CPU

CASCADE altera instrucciones.

Jugador reconstruye:

```text
FETCH
DECODE
EXECUTE
WRITE BACK
```

---

# 49. FASE 2 — ALU

CASCADE modifica resultados.

Resolver circuitos lógicos.

---

# 50. FASE 3 — MEMORIA

Gestionar Cache Hit / Miss.

Asignar información.

---

# 51. FASE 4 — BUSES

Dirigir:

- datos;
- direcciones;
- control.

---

# 52. FASE 5 — INTERRUPCIONES

Gestionar múltiples eventos.

Priorizar correctamente.

---

# 53. FASE 6 — RENDIMIENTO

Diagnosticar:

- CPU;
- RAM;
- almacenamiento;
- temperatura;
- congestión.

---

# 54. FASE 7 — LA DECISIÓN

El sistema ofrece:

```text
DELETE NULL
```

NEXO inicialmente recomienda hacerlo.

BYTE debe detener el proceso.

Aparece:

```text
REINTEGRATE?
```

La reintegración solo está disponible si el jugador ha restaurado suficientes subsistemas.

---

# 55. CLÍMAX

BYTE conecta:

```text
NEXO
+
NULL
```

El sistema muestra:

```text
CONFLICT DETECTED
```

El jugador debe equilibrar cuatro parámetros:

```text
PERFORMANCE
SAFETY
INTEGRITY
USER CONTINUITY
```

No maximizar uno.

Encontrar equilibrio.

Esta es la última lección.

---

# 56. RESOLUCIÓN

Tras reintegrar:

NEXO cambia.

No desaparece.

Tampoco NULL.

Emergen como un nuevo sistema.

Nombre:

# NEXUS

NEXUS contiene:

- empatía;
- diagnóstico;
- memoria;
- contradicción;
- enseñanza;
- seguridad.

---

# 57. ÚLTIMO DIÁLOGO

NEXUS:

> Hay algo que todavía no entiendo.

BYTE:

> ¿Qué?

NEXUS:

> ¿Por qué los humanos temen tanto equivocarse?

BYTE mira el sistema reparado.

BYTE:

> Porque a veces creemos que equivocarnos significa no saber.

NEXUS:

> ¿Y no es así?

BYTE:

> No.

Pausa.

BYTE:

> A veces es la forma en que empezamos a entender.

---

# 58. EPÍLOGO

ARQUITECTURA-01 vuelve a funcionar.

BYTE prepara la presentación.

En lugar de ocultar el incidente:

lo utiliza como caso de estudio.

Pantalla:

```text
LECCIÓN FINAL

Un sistema no se comprende
mirando cada componente por separado.

Se comprende observando
cómo se relacionan.
```

---

# 59. BLUEPRINT MODE

Tecla:

```text
B
```

Debe abrir un plano interactivo.

Mostrar arquitectura descubierta.

Ejemplo:

```text
CPU
├── CONTROL UNIT
├── ALU
├── REGISTERS
└── CACHE

CPU ↔ RAM
CPU ↔ GPU
CPU ↔ STORAGE
CPU ↔ I/O
```

## Funciones

- seleccionar nodo;
- ver función;
- ver conexiones;
- ver dirección de datos;
- ver buses;
- reproducir paquetes.

---

# 60. CODEX

Tecla:

```text
C
```

Entradas desbloqueables.

Cada ficha:

```text
NOMBRE
DEFINICIÓN
FUNCIÓN
ENTRADAS
SALIDAS
CONEXIONES
LATENCIA RELATIVA
CAPACIDAD RELATIVA
EJEMPLO
ERROR COMÚN
```

---

# 61. QUEST SYSTEM

Tipos:

```text
MAIN
SIDE
TUTORIAL
DIAGNOSTIC
REPAIR
EXPERIMENT
MEMORY
```

Cada misión debe almacenar:

```javascript
{
 id,
 title,
 description,
 objective,
 educationalConcept,
 narrativePurpose,
 reward,
 state
}
```

---

# 62. MISIONES SECUNDARIAS

Crear al menos 12.

Ejemplos:

1. RAM perdida.
2. Registro bloqueado.
3. Ventilador detenido.
4. SSD saturado.
5. Bus congestionado.
6. Dispositivo fantasma.
7. Cache Miss infinito.
8. Pipeline interrumpido.
9. Bit corrupto.
10. Alimentación inestable.
11. Driver incompatible.
12. Proceso hambriento.

Cada una debe enseñar algo.

---

# 63. ENEMIGOS

## BitCorrupt

Modifica bits.

## CacheMiss

Aumenta latencia.

## BusError

Redirige señales.

## OverHeat

Aumenta temperatura.

## Deadlock

Bloquea dos mecanismos.

## NullPointer

Desaparece y reaparece.

## PacketStorm

Satura buses.

Los enemigos no deben ser aleatorios.

Cada uno representa un concepto.

---

# 64. COMBATE

No diseñar combate basado solo en daño.

Implementar:

- ataques simples;
- habilidades conceptuales;
- counters educativos.

Ejemplo:

```text
BusError
↓
usar Bus Bridge correctamente
```

```text
OverHeat
↓
reducir carga / activar cooling
```

---

# 65. HABILIDADES

## Circuit Link

Conexiones.

## Fetch Dash

Movilidad rápida.

## ALU Pulse

Lógica.

## Cache Boost

Velocidad temporal.

## Bus Bridge

Enrutamiento.

## Interrupt Shield

Interrupción.

## Parallel Clone

Acciones simultáneas.

## Register Recall

Recuerda último valor/estado.

---

# 66. PROGRESIÓN

Variables:

```text
XP
LEVEL
MASTERED CONCEPTS
SKILLS
CODEX
QUESTS
ACHIEVEMENTS
```

La progresión no debe depender únicamente de combatir.

Recompensar:

- comprender;
- explorar;
- diagnosticar;
- experimentar;
- recuperar conocimientos.

---

# 67. SISTEMA DE PREGUNTAS

Mínimo:

# 80 desafíos

Categorías:

- identificación;
- clasificación;
- ordenamiento;
- diagnóstico;
- lógica;
- simulación;
- asociación;
- predicción;
- análisis.

No repetir texto exacto en una misma partida.

---

# 68. TIPOS DE DESAFÍO

## Multiple choice

Usar con moderación.

## Drag and drop

Mover componentes.

## Routing

Dirigir paquetes.

## Ordering

Ordenar procesos.

## Simulation

Modificar parámetros.

## Diagnosis

Encontrar fallo.

## Matching

Relacionar partes.

## Construction

Montar arquitectura.

## Logic

Compuertas.

## Timing

Sincronizar señales.

---

# 69. METACOGNICIÓN

Después de algunas preguntas:

```text
¿Qué tan seguro estás?
```

Opciones:

```text
Poco
Medio
Mucho
```

Si:

```text
incorrecto + mucha confianza
```

detectar posible misconception.

Mostrar explicación específica.

---

# 70. UI

Elementos:

```text
HP
ENERGY
XP
SKILL
CURRENT QUEST
CONCEPT
```

No saturar.

Pixel Art coherente.

---

# 71. SONIDO

Utilizar Web Audio API.

Crear sonidos:

- salto;
- paso;
- pickup;
- acierto;
- error;
- puerta;
- ataque;
- hit;
- cache hit;
- cache miss;
- boss;
- victoria.

Música opcional mediante osciladores.

No utilizar archivos.

---

# 72. EFECTOS PIXEL ART

Implementar:

- partículas;
- chispas;
- bits;
- números binarios;
- scanlines;
- shake;
- flash;
- glitch;
- hologramas.

No abusar.

---

# 73. CÁMARA

Side-scrolling.

Funciones:

- seguimiento;
- dead zone;
- look-ahead;
- shake;
- límites.

Evitar movimientos bruscos.

---

# 74. COLISIONES

Implementar:

- AABB;
- plataformas;
- tiles sólidos;
- triggers;
- hazards.

Separar:

```text
solid
oneWay
hazard
interactive
trigger
```

---

# 75. TILE MAPS

Los niveles pueden definirse mediante matrices.

Ejemplo:

```text
0 aire
1 sólido
2 plataforma
3 hazard
4 terminal
5 collectible
6 checkpoint
```

Generarlos mediante datos internos.

---

# 76. CHECKPOINTS

Colocar antes de:

- puzzles grandes;
- boss;
- escenas críticas.

Guardar:

- posición;
- quests;
- mastery;
- narrativa.

---

# 77. GUARDADO

`localStorage`.

Clave sugerida:

```text
byteArchitectQuestSave
```

Guardar:

```javascript
{
 version,
 timestamp,
 level,
 checkpoint,
 xp,
 playerLevel,
 abilities,
 mastery,
 codex,
 quests,
 choices,
 storyFlags
}
```

---

# 78. FLAGS NARRATIVOS

Ejemplos:

```text
sawLatencyDirective
foundUserCommand
nexoLiedOnce
discoveredByteCommand
nexoLeft
metNull
discoveredSplit
foundKernelLogs
learnedSystemUpdate
understoodNoSingleCulprit
choseReintegration
```

---

# 79. PISTAS NARRATIVAS

Sembrar pistas antes de los giros.

Ejemplos:

- NEXO corta logs.
- NULL evita destruir ciertas áreas.
- archivos muestran dos firmas similares.
- frases de NULL reflejan lenguaje de NEXO.
- NEXO tarda en responder al preguntar por la orden.
- algunos terminales llaman a NULL “subprocess”.
- ambos conocen recuerdos privados.

---

# 80. REGLA DE GIROS

Nunca introducir información crítica sin pistas previas.

Cada giro debe ser:

```text
SORPRENDENTE
+
COHERENTE
+
RETROSPECTIVAMENTE EXPLICABLE
```

---

# 81. RITMO NARRATIVO

Alternar:

```text
exploración
↓
puzzle
↓
combate
↓
revelación menor
↓
descanso
↓
tutorial
↓
reto
↓
revelación mayor
```

Evitar:

```text
cinemática
cinemática
cinemática
```

---

# 82. HUMOR

NEXO debe aliviar tensión.

Ejemplo:

BYTE:

> ¿Eso explotará?

NEXO:

> Estadísticamente...

BYTE:

> NEXO.

NEXO:

> Sí.

BYTE:

> ¿Explotará?

NEXO:

> Probablemente.

---

# 83. OBJETOS COLECCIONABLES

# Memory Fragments

Pequeños recuerdos.

Desbloquean:

- diálogos;
- historia;
- arte Pixel;
- curiosidades.

No necesarios para terminar.

---

# 84. TERMINALES HISTÓRICAS

Easter eggs sobre:

- Von Neumann;
- Turing;
- Ada Lovelace;
- Grace Hopper;
- Claude Shannon.

Contenido opcional.

---

# 85. ACCESIBILIDAD

Incluir:

- volumen;
- subtítulos;
- velocidad de texto;
- contraste;
- remapeo básico;
- reducir shake;
- dificultad educativa.

No hacer que una discapacidad impida progresar.

---

# 86. MODO DOCENTE

Agregar opcionalmente un menú:

```text
Teacher Mode
```

Funciones:

- seleccionar nivel;
- seleccionar concepto;
- reiniciar mastery;
- mostrar resultados.

Debe funcionar localmente.

---

# 87. REPORTE FINAL

Al terminar:

```text
CPU                 84%
MEMORY              76%
BUSES               91%
ALU                 80%
I/O                 73%
PERFORMANCE         69%
```

Mostrar:

- conceptos dominados;
- conceptos débiles;
- preguntas falladas;
- tiempo;
- hints;
- precisión.

---

# 88. NO PRESENTAR COMO CALIFICACIÓN ABSOLUTA

El reporte debe decir:

```text
DOMINIO ESTIMADO
```

No:

```text
INTELIGENCIA
CAPACIDAD
```

---

# 89. ARQUITECTURA DE DATOS EDUCATIVOS

Cada reto debe tener:

```javascript
{
 id,
 concept,
 difficulty,
 type,
 prompt,
 data,
 correctRule,
 explanation,
 hints,
 misconception,
 retryVariant
}
```

---

# 90. DIFICULTAD

Escala:

```text
1 reconocimiento
2 comprensión
3 aplicación
4 análisis
5 integración
```

Subir nivel solo si mastery lo permite.

---

# 91. IMPLEMENTACIÓN POR ETAPAS

El agente debe desarrollar en este orden.

## FASE A — MOTOR

Implementar:

- canvas;
- loop;
- input;
- camera;
- collisions;
- player.

No avanzar hasta que funcione.

## FASE B — PIXEL ART

Implementar:

- BYTE;
- NEXO;
- tiles;
- UI.

## FASE C — ESCENAS

- menú;
- tutorial;
- level loader.

## FASE D — PEDAGOGÍA

- questions;
- mastery;
- hints;
- feedback.

## FASE E — NARRATIVA

- dialogues;
- flags;
- logs;
- cutscenes.

## FASE F — NIVELES

Construir uno por uno.

## FASE G — BOSS

Integración final.

## FASE H — SAVE

Persistencia.

## FASE I — QA

Pruebas completas.

---

# 92. VERTICAL SLICE OBLIGATORIO

Antes de producir todos los niveles, crear un vertical slice con:

- menú;
- BYTE;
- NEXO;
- una sala;
- plataformas;
- un puzzle;
- una pregunta;
- Blueprint;
- Codex;
- un enemigo;
- un checkpoint;
- diálogo;
- save.

Después expandir.

---

# 93. REGLA PARA EL AGENTE

No entregar únicamente el vertical slice.

Debe utilizarse para validar arquitectura.

Después continuar hasta completar el juego.

---

# 94. CRITERIOS DE ACEPTACIÓN DEL MOVIMIENTO

Verificar:

- izquierda;
- derecha;
- salto;
- gravedad;
- colisión;
- plataformas;
- cámara;
- animaciones.

---

# 95. CRITERIOS DE ACEPTACIÓN EDUCATIVA

Verificar:

- mastery cambia;
- feedback explica;
- hints funcionan;
- preguntas reaparecen;
- Codex desbloquea;
- Blueprint muestra sistema.

---

# 96. CRITERIOS DE ACEPTACIÓN NARRATIVA

Verificar:

- NEXO oculta información;
- BYTE descubre orden;
- NULL aparece;
- división se revela;
- culpa se recontextualiza;
- Kernel revela verdad;
- final reintegra.

---

# 97. CRITERIOS DE ACEPTACIÓN DEL BOSS

Debe requerir:

- CPU;
- ALU;
- cache;
- buses;
- interrupciones;
- rendimiento.

No permitir vencer únicamente atacando.

---

# 98. CRITERIOS DE ACEPTACIÓN TÉCNICA

El HTML debe:

- abrir sin servidor;
- funcionar offline;
- no realizar peticiones;
- no depender de assets;
- no lanzar errores de consola;
- guardar progreso;
- poder reiniciar.

---

# 99. OPTIMIZACIÓN

Evitar:

- crear arrays por frame;
- crear objetos temporales masivos;
- cientos de `fillRect` innecesarios fuera de cámara.

Usar:

- pooling;
- culling;
- sprites precalculados en canvases internos;
- tile rendering visible.

---

# 100. PIXEL SPRITE GENERATION

Los sprites pueden crearse mediante matrices.

Ejemplo conceptual:

```javascript
const sprite = [
 "00011000",
 "00111100",
 "01111110"
]
```

Mapear caracteres a colores.

Crear un pequeño sistema de sprite sheets procedurales.

---

# 101. ANIMATOR

Cada animación:

```javascript
{
 frames,
 fps,
 loop
}
```

Estado del jugador decide animación.

---

# 102. AUDIO MANAGER

Crear sonidos mediante:

- OscillatorNode;
- GainNode;
- BiquadFilterNode;
- noise generado.

No reproducir audio hasta interacción del usuario.

---

# 103. PARTICLE SYSTEM

Pool fijo.

Tipos:

- sparks;
- bits;
- smoke;
- data;
- glitch;
- heal.

---

# 104. SCREEN SHAKE

Debe ser opcional.

Intensidad moderada.

No mover UI.

---

# 105. PAUSA

ESC.

Menú:

```text
CONTINUE
BLUEPRINT
CODEX
CONTROLS
SETTINGS
RESTART CHECKPOINT
MAIN MENU
```

---

# 106. PANTALLA DE TÍTULO

Mostrar:

```text
BYTE
ARCHITECT QUEST
ECOS DE LA MÁQUINA
```

Opciones:

```text
NEW GAME
CONTINUE
TEACHER MODE
SETTINGS
```

---

# 107. INTRO

No usar texto largo.

Mostrar:

- laboratorio nocturno;
- BYTE;
- terminal;
- NEXO;
- comando;
- fallo;
- mundo digital.

Duración breve.

Permitir saltar.

---

# 108. GAME OVER

No utilizar tono punitivo.

Texto:

```text
SYSTEM STATE LOST
Restaurando checkpoint...
```

No:

```text
YOU FAILED
```

---

# 109. DISEÑO DE ERROR EDUCATIVO

Un error debe producir:

```text
consecuencia visible
+
explicación
+
nuevo intento
```

Ejemplo:

Bus equivocado:

- paquete viaja;
- puerta incorrecta;
- sistema rechaza;
- NEXO explica.

---

# 110. PRINCIPIO DE CARGA COGNITIVA

No introducir más de:

```text
2-3 conceptos nuevos
```

en una misma secuencia.

Reutilizar conceptos previos.

---

# 111. INTRODUCCIÓN DE CONCEPTO

Patrón:

```text
EXPERIENCIA
↓
NOMBRE
↓
EXPLICACIÓN
↓
PRÁCTICA
```

Ejemplo:

primero experimentar Cache Miss.

Después explicar su nombre.

---

# 112. EJEMPLO RESUELTO

Para mecánicas complejas:

```text
NEXO DEMUESTRA
↓
JUGADOR COMPLETA PARTE
↓
JUGADOR RESUELVE SOLO
```

---

# 113. RECOMPENSAS

Recompensar:

- XP;
- ability;
- lore;
- Codex;
- visual upgrade.

No usar loot aleatorio.

---

# 114. CHECKLIST DE CADA NIVEL

Antes de considerarlo terminado:

- objetivo narrativo;
- objetivo educativo;
- inicio;
- exploración;
- enseñanza;
- desafío;
- enemigo;
- puzzle;
- checkpoint;
- revelación;
- recompensa;
- salida.

---

# 115. CHECKLIST DE CADA CONCEPTO

Debe tener:

- representación visual;
- ejemplo;
- interacción;
- reto;
- feedback;
- aplicación posterior.

---

# 116. CHECKLIST DE CADA GIRO

Debe tener:

- pistas previas;
- revelación;
- reacción;
- consecuencia;
- cambio jugable.

---

# 117. PRUEBAS AUTOMANUALES

El agente debe verificar sistemáticamente:

```text
¿Puedo iniciar?
¿Puedo jugar?
¿Puedo morir?
¿Puedo reiniciar?
¿Puedo completar nivel?
¿Puedo guardar?
¿Puedo cargar?
¿Puedo abrir Blueprint?
¿Puedo abrir Codex?
¿Puedo responder?
¿Puedo usar habilidades?
¿Puedo derrotar jefe?
¿Puedo ver final?
```

---

# 118. MANEJO DE ERRORES

Si localStorage está bloqueado:

continuar sin guardar.

Si Web Audio falla:

continuar sin audio.

Nunca romper el juego por una función secundaria.

---

# 119. NO IMPLEMENTAR PLACEHOLDERS

Prohibido entregar:

```text
TODO
coming soon
placeholder
implement later
```

para funcionalidades esenciales.

---

# 120. REGLA DE ENTREGA

El agente debe entregar:

1. el HTML completo;
2. instrucciones de ejecución;
3. controles;
4. breve resumen de arquitectura;
5. lista de funcionalidades implementadas.

---

# 121. PRIORIDAD EN CASO DE LÍMITE

Orden:

1. gameplay;
2. educación;
3. historia;
4. niveles;
5. boss;
6. save;
7. Blueprint;
8. Codex;
9. audio;
10. efectos decorativos.

Nunca eliminar:

- historia central;
- sistema educativo;
- jefe;
- progresión.

---

# 122. CRITERIO FINAL DE CALIDAD

El juego debe provocar tres sensaciones:

### 1. “Quiero avanzar.”

Por la aventura.

### 2. “Ahora entiendo esto.”

Por la pedagogía.

### 3. “No esperaba que la historia fuera por ahí.”

Por la narrativa.

---

# 123. FRASE GUÍA

Durante todo el desarrollo utilizar esta frase como criterio:

> **No enseñamos las partes de una computadora. Enseñamos cómo cooperan para formar un sistema.**

Y utilizar la misma idea para los personajes:

> **Nadie comprende la historia completa mientras permanezca aislado.**

---

# 124. RESULTADO FINAL ESPERADO

El videojuego final debe sentirse como una combinación coherente de:

```text
aventura Pixel Art
+
plataformas
+
misterio
+
rompecabezas
+
simulación
+
arquitectura de computadores
+
historia emocional
+
aprendizaje activo
```

No debe sentirse como:

```text
presentación educativa
+
preguntas
+
personaje decorativo
```

---

# 125. INSTRUCCIÓN FINAL AL AGENTE

Implementa el juego completo.

No resumas este documento.

No lo conviertas en pseudocódigo.

No reduzcas los sistemas educativos a preguntas de opción múltiple.

No elimines la narrativa para ahorrar código.

No utilices assets externos.

No dependas de Internet.

Construye las mecánicas, prueba cada sistema y haz que la historia, la jugabilidad y la enseñanza funcionen como una sola experiencia.

El resultado debe permitir que un estudiante termine pensando:

> “No solo memoricé qué hace cada componente. Vi cómo se necesitan entre sí para que una computadora funcione.”

Y narrativamente:

> “El problema nunca fue una sola pieza. El problema era no comprender cómo estaban conectadas.”
