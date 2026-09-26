// =============================================================================
// BANCO DE DESAFÍOS (80+ escritos a mano) + GENERADORES PARAMÉTRICOS
// Esquema: { id, concept, difficulty, type, prompt, data, explanation, hints[3],
//            misconception, retryVariant, wrong, hl, kind }
// =============================================================================
const O = (t, ok, why) => ({ t, ok: !!ok, why });
const CH = [];
const addCh = (...list) => CH.push(...list);

// ---------------------------------------------------------------- FUNDAMENTOS ----
addCh(
  { id: 'hw01', concept: 'hardwareBasics', difficulty: 1, type: 'classify', kind: 'CLASIFICACIÓN',
    prompt: 'El módulo de arranque mezcló sus inventarios. Clasifica cada elemento: ¿es *HARDWARE* o *SOFTWARE*?',
    data: { bins: ['HARDWARE', 'SOFTWARE'], items: [{ t: 'Teclado', b: 0 }, { t: 'Sistema operativo', b: 1 }, { t: 'Memoria RAM', b: 0 }, { t: 'Navegador web', b: 1 }, { t: 'Procesador (CPU)', b: 0 }, { t: 'Driver de la impresora', b: 1 }, { t: 'Unidad SSD', b: 0 }, { t: 'Videojuego instalado', b: 1 }] },
    explanation: 'El *hardware* es físico: se puede tocar, ocupa espacio y consume energía. El *software* son instrucciones y datos que viven DENTRO del hardware y le dicen qué hacer. Un driver es software aunque controle un dispositivo físico.',
    hints: ['¿Podrías sostenerlo en la mano, o sólo existe como instrucciones guardadas?', 'Fíjate en los elementos que «controlan» algo físico: ¿son objetos o programas?', 'Te coloco algunos. El resto sigue la misma lógica.'],
    misconception: 'El sistema operativo o un driver parecen «parte de la máquina», pero son software: se instalan, se borran y se actualizan sin tocar un tornillo.', retryVariant: 'gen' },
  { id: 'hw02', concept: 'hardwareBasics', difficulty: 1, type: 'classify', kind: 'CLASIFICACIÓN',
    prompt: 'Todo sistema sigue un flujo *ENTRADA → PROCESO → MEMORIA → SALIDA*. ¿Qué papel cumple cada componente?',
    data: { bins: ['ENTRADA', 'PROCESO', 'MEMORIA', 'SALIDA'], items: [{ t: 'Teclado', b: 0 }, { t: 'Micrófono', b: 0 }, { t: 'CPU', b: 1 }, { t: 'GPU (cálculo gráfico)', b: 1 }, { t: 'RAM', b: 2 }, { t: 'SSD', b: 2 }, { t: 'Monitor', b: 3 }, { t: 'Altavoz', b: 3 }] },
    explanation: 'La entrada captura información, el proceso la transforma, la memoria la conserva mientras (o después de) usarla, y la salida la devuelve al mundo. Ninguna etapa tiene sentido sola.',
    hints: ['Sigue el camino de un dato: ¿dónde entra, dónde cambia, dónde espera y por dónde sale?', 'Los resaltados son los que más se confunden.', 'Te fijo algunos componentes.'], retryVariant: 'gen' },
  { id: 'hw03', concept: 'hardwareBasics', difficulty: 2, type: 'order', kind: 'ORDENAMIENTO',
    prompt: 'Pulsas la tecla *A* en un editor de texto. Ordena lo que ocurre hasta que la letra aparece en pantalla.',
    data: { items: ['Pulsas la tecla A (ENTRADA)', 'El controlador del teclado envía un código a la CPU', 'La CPU procesa el evento del editor', 'El carácter se guarda en la memoria del documento', 'La GPU dibuja la A en el monitor (SALIDA)'] },
    explanation: 'Incluso una tecla recorre todo el sistema: entrada, comunicación, proceso, memoria y salida. Cada componente depende del anterior.',
    hints: ['¿Puede dibujarse algo que todavía no se ha procesado?', 'Los pasos resaltados están fuera de lugar.', 'Te fijo los primeros pasos.'], retryVariant: 'hw06' },
  { id: 'hw04', concept: 'hardwareBasics', difficulty: 2, type: 'choice', kind: 'PREDICCIÓN',
    prompt: 'Un programa está haciendo un cálculo largo y alguien desconecta el monitor. ¿Qué ocurre con el cálculo?',
    data: { options: [O('Continúa: el sistema sólo pierde la salida visual.', 1, 'Exacto: la CPU no necesita el monitor para calcular. El sistema pierde una capacidad, pero el resto sigue funcionando.'), O('Se detiene: la CPU necesita el monitor para trabajar.', 0, 'La CPU calcula con sus registros y la memoria; el monitor sólo muestra resultados.'), O('La RAM se borra al instante.', 0, 'La RAM se borra si se corta SU energía, no si se desconecta un periférico.'), O('El programa se cierra automáticamente.', 0, 'Nada obliga al programa a cerrarse: simplemente no ves lo que hace.')] },
    explanation: 'Cuando una parte falla, las demás pueden seguir funcionando. El sistema queda *incompleto*, no necesariamente detenido. Recuerda esta idea: volverá.',
    hints: ['¿Qué componente hace realmente el cálculo?', 'Piensa en qué función cumple el monitor en el flujo.', 'Descarto opciones imposibles.'], misconception: 'Es común pensar que un sistema falla por completo si falla una pieza; en realidad muchas partes siguen operando de forma independiente.' },
  { id: 'hw05', concept: 'hardwareBasics', difficulty: 3, type: 'choice', kind: 'IDENTIFICACIÓN',
    prompt: 'El BIOS/UEFI está guardado en un chip soldado a la placa base y arranca antes que el sistema operativo. ¿Qué es?',
    data: { options: [O('Software grabado en un chip no volátil (firmware).', 1, 'Correcto: es software; el chip es hardware, pero lo que contiene son instrucciones.'), O('Hardware, porque está soldado a la placa.', 0, 'El chip es hardware, pero el BIOS son instrucciones que ese chip guarda: software.'), O('Un tipo de memoria RAM.', 0, 'La RAM es volátil; el firmware debe sobrevivir sin energía.'), O('Una parte interna de la CPU.', 0, 'Vive en la placa base, no dentro del procesador.')] },
    explanation: 'El *firmware* es software que vive en memoria no volátil de un dispositivo. Muestra que la frontera hardware/software está en QUÉ es algo, no en DÓNDE está.',
    hints: ['Distingue el recipiente del contenido.', 'La clave está en «guardado en un chip».', 'Descarto dos opciones.'], misconception: 'Estar soldado a la placa no convierte algo en hardware: el firmware se puede actualizar porque es software.' },
  { id: 'hw06', concept: 'hardwareBasics', difficulty: 1, type: 'match', kind: 'ASOCIACIÓN',
    prompt: 'Une cada componente con su función principal.',
    data: { pairs: [['Teclado', 'Introduce información (entrada)'], ['Monitor', 'Muestra resultados (salida)'], ['CPU', 'Ejecuta las instrucciones'], ['RAM', 'Guarda datos mientras se usan'], ['SSD', 'Guarda datos de forma permanente']] },
    explanation: 'Cada componente cumple una función, pero ninguno produce un sistema útil por sí solo.', hints: ['¿Cuál de ellos «piensa», cuál «recuerda» y cuál «comunica»?', 'Mira la conexión resaltada.', 'Te uno la mitad.'], retryVariant: 'gen' },
  { id: 'hw07', concept: 'hardwareBasics', difficulty: 2, type: 'choice', kind: 'ANÁLISIS',
    prompt: 'Un micrófono capta tu voz y el altavoz la reproduce con eco añadido. ¿Qué parte del sistema *añade* el eco?',
    data: { options: [O('El proceso: la CPU aplica un algoritmo a los datos de audio.', 1, 'Sí: la transformación ocurre en la etapa de proceso.'), O('El micrófono, al capturar la voz.', 0, 'El micrófono sólo convierte sonido en datos (entrada).'), O('El altavoz, al reproducir.', 0, 'El altavoz sólo convierte datos en sonido (salida).'), O('El cable que los une.', 0, 'El cable transporta la señal, no la transforma.')] },
    explanation: 'Entrada y salida convierten entre el mundo físico y los datos; el *proceso* es donde los datos cambian.', hints: ['¿Dónde cambian los datos, no sólo se mueven?', 'Separa convertir de transformar.', 'Descarto dos opciones.'] },
  { id: 'hw08', concept: 'hardwareBasics', difficulty: 2, type: 'choice', kind: 'ANÁLISIS',
    prompt: 'Según el modelo entrada–proceso–memoria–salida, ¿una calculadora de bolsillo es una computadora?',
    data: { options: [O('Sí: teclas (entrada), chip (proceso), memoria y pantalla (salida).', 1, 'Correcto: cumple el modelo, aunque sea muy especializada.'), O('No: le falta sistema operativo.', 0, 'El sistema operativo no es lo que define a una computadora.'), O('No: es demasiado pequeña.', 0, 'El tamaño no importa: importa la estructura.'), O('Sólo si tiene conexión a internet.', 0, 'La red no forma parte del modelo básico.')] },
    explanation: 'Lo que define a una computadora es la cooperación entre entrada, proceso, memoria y salida, no su tamaño ni su software.', hints: ['Busca las cuatro etapas en la calculadora.', '¿Tiene cada una de las etapas?', 'Descarto dos opciones.'] }
);

// ---------------------------------------------------------------- PLACA BASE ----
addCh(
  { id: 'mb01', concept: 'motherboard', difficulty: 2, type: 'match', kind: 'CONSTRUCCIÓN',
    prompt: 'Reconstruye la placa base: conecta cada componente en la ranura o conector correcto.',
    data: { pairs: [['CPU', 'Socket (zócalo) del procesador'], ['Módulo de RAM', 'Ranura DIMM'], ['Tarjeta gráfica', 'Ranura PCIe x16'], ['SSD NVMe', 'Ranura M.2'], ['Fuente de alimentación', 'Conector ATX de 24 pines'], ['Disco SATA', 'Puerto SATA']] },
    explanation: 'Cada conector está diseñado para un tipo de comunicación: el socket une la CPU a todo, la DIMM a la RAM, PCIe a expansiones de alto ancho de banda, M.2 a almacenamiento rápido.',
    hints: ['Piensa en la forma: ¿qué pieza es larga y fina, cuál es cuadrada, cuál es una tarjeta?', 'Mira la conexión resaltada.', 'Te conecto la mitad.'], retryVariant: 'gen' },
  { id: 'mb02', concept: 'motherboard', difficulty: 1, type: 'match', kind: 'ASOCIACIÓN',
    prompt: 'Cada «edificio» de la Ciudad de la Placa Base cumple una función. Asócialos.',
    data: { pairs: [['CPU', 'Ejecuta las instrucciones de los programas'], ['RAM', 'Memoria de trabajo volátil'], ['GPU', 'Procesa gráficos y cálculos en paralelo'], ['SSD', 'Almacenamiento persistente'], ['VRM', 'Regula el voltaje que recibe la CPU'], ['Chipset', 'Coordina periféricos y comunicaciones']] },
    explanation: 'La placa base es la ciudad que conecta todo: aporta energía (VRM), caminos (pistas y buses) y coordinación (chipset).',
    hints: ['¿Cuál «piensa», cuál «recuerda», cuál «dibuja» y cuál «alimenta»?', 'Mira la conexión resaltada.', 'Te uno la mitad.'], retryVariant: 'gen' },
  { id: 'mb03', concept: 'motherboard', difficulty: 2, type: 'choice', kind: 'ANÁLISIS',
    prompt: 'La fuente entrega *12 V*, pero la CPU necesita alrededor de *1,2 V* muy estables. ¿Quién hace la conversión?',
    data: { options: [O('El VRM (módulo regulador de voltaje) de la placa base.', 1, 'Sí: el VRM convierte y estabiliza la energía junto al socket.'), O('El chipset.', 0, 'El chipset coordina comunicaciones, no la energía de la CPU.'), O('La RAM.', 0, 'La RAM consume energía, no la regula para la CPU.'), O('La propia CPU, internamente.', 0, 'La CPU necesita recibir ya el voltaje correcto y limpio.')] },
    explanation: 'Sin energía estable no hay cómputo: el VRM es la central eléctrica de la ciudad. Un VRM débil provoca inestabilidad y throttling.', hints: ['Busca el componente cuyo nombre incluye «voltaje».', '¿Quién está pegado al socket de la CPU?', 'Descarto dos opciones.'] },
  { id: 'mb04', concept: 'motherboard', difficulty: 3, type: 'choice', kind: 'ANÁLISIS',
    prompt: 'La tarjeta gráfica se conecta en *PCIe x16* y no en una ranura *x1*. ¿Por qué importa?',
    data: { options: [O('x16 son 16 carriles en paralelo: mucho más ancho de banda para los datos gráficos.', 1, 'Correcto: más carriles, más datos por segundo.'), O('x16 es sólo más largo para sujetar mejor la tarjeta.', 0, 'La longitud existe porque hay más contactos: más carriles de datos.'), O('x16 es una versión más antigua y compatible.', 0, 'El número indica carriles, no antigüedad.'), O('Da igual: la GPU funciona igual en cualquiera.', 0, 'Funcionaría, pero limitada por el ancho de banda.')] },
    explanation: 'Un carril PCIe es un enlace serie; x16 agrupa 16. El ancho de banda crece con el número de carriles: la comunicación también es rendimiento.', hints: ['¿Qué significa el número después de la «x»?', 'Piensa en carreteras con más carriles.', 'Descarto dos opciones.'], misconception: 'El número de PCIe no es la versión ni el tamaño físico: indica cuántos carriles de datos hay.' },
  { id: 'mb05', concept: 'motherboard', difficulty: 3, type: 'choice', kind: 'DIAGNÓSTICO',
    prompt: 'El equipo enciende y los ventiladores giran, pero no hay imagen y la placa emite pitidos. Este es el registro de arranque:',
    data: { visual: 'log', log: ['POST: CPU ............ OK', 'POST: VRM ............ OK', 'POST: MEMORIA ........ ERROR', 'POST: VIDEO .......... (no alcanzado)', 'BEEP  BEEP  BEEP'], options: [O('RAM mal insertada o defectuosa.', 1, 'Sí: el POST se detiene en la prueba de memoria.'), O('La tarjeta gráfica está rota.', 0, 'El POST ni siquiera llegó a probar el vídeo.'), O('El SSD está vacío.', 0, 'Sin sistema operativo verías un mensaje, no pitidos del POST.'), O('El teclado está desconectado.', 0, 'El teclado no bloquea el POST de esta forma.')] },
    hl: [2], explanation: 'El POST (Power-On Self-Test) prueba cada subsistema en orden. Leer DÓNDE se detiene es diagnosticar.', hints: ['¿En qué línea se detiene el registro?', 'Mira la línea resaltada.', 'Descarto dos opciones.'] },
  { id: 'mb06', concept: 'motherboard', difficulty: 2, type: 'classify', kind: 'CLASIFICACIÓN',
    prompt: 'Algunos cables llevan *energía* y otros *datos*. Clasifica cada conexión.',
    data: { bins: ['ENERGÍA', 'DATOS'], items: [{ t: 'Conector ATX de 24 pines', b: 0 }, { t: 'Cable SATA de datos', b: 1 }, { t: 'Conector EPS 8 pines de la CPU', b: 0 }, { t: 'Carriles PCIe', b: 1 }, { t: 'Conector de 8 pines de la GPU', b: 0 }, { t: 'Pistas del bus de memoria', b: 1 }] },
    explanation: 'La placa base reparte dos cosas: energía (para que todo funcione) y comunicación (para que todo coopere).', hints: ['¿El cable transporta información o potencia?', 'Los resaltados están mal clasificados.', 'Te coloco algunos.'] },
  { id: 'mb07', concept: 'motherboard', difficulty: 2, type: 'choice', kind: 'PREDICCIÓN',
    prompt: 'La CPU y la RAM funcionan perfectamente, pero una pista de la placa entre ambas está cortada. ¿Qué ocurre?',
    data: { options: [O('El sistema falla: sin comunicación, componentes sanos no pueden cooperar.', 1, 'Exacto. Componentes correctos no garantizan un sistema correcto.'), O('Nada: si ambos están sanos, todo funciona.', 0, 'Sanos pero incomunicados: la CPU no puede leer ni escribir memoria.'), O('La CPU usa el SSD en lugar de la RAM automáticamente.', 0, 'La CPU no reemplaza la RAM por el SSD de forma transparente.'), O('La RAM se comunica por Wi-Fi.', 0, 'No existe tal mecanismo.')] },
    explanation: 'Un sistema es componentes MÁS relaciones. Si falla la relación, falla el sistema.', hints: ['¿Qué necesita la CPU de la RAM en cada instrucción?', 'Piensa en el camino, no en los extremos.', 'Descarto dos opciones.'] }
);

// ---------------------------------------------------------------- CPU ----
addCh(
  { id: 'cpu01', concept: 'cpu', difficulty: 1, type: 'match', kind: 'ASOCIACIÓN',
    prompt: 'El Núcleo del Procesador tiene varios distritos. Asocia cada uno con su trabajo.',
    data: { pairs: [['Unidad de Control', 'Busca, decodifica y coordina'], ['ALU', 'Hace operaciones aritméticas y lógicas'], ['Registros', 'Guardan datos inmediatos dentro de la CPU'], ['Reloj', 'Marca el ritmo de cada paso'], ['Caché', 'Copia rápida de datos recientes']] },
    explanation: 'La CPU es un equipo: la Unidad de Control dirige, la ALU calcula, los registros sostienen los datos y el reloj sincroniza a todos.', hints: ['¿Quién dirige y quién ejecuta?', 'Mira la conexión resaltada.', 'Te uno la mitad.'], retryVariant: 'gen' },
  { id: 'cpu02', concept: 'cpu', difficulty: 2, type: 'choice', kind: 'CÁLCULO',
    prompt: 'Una CPU funciona a *3 GHz*. ¿Cuántos ciclos de reloj completa en un segundo?',
    data: { options: [O('3.000 millones', 1), O('3.000', 0, 'Eso serían 3 kHz.'), O('3 millones', 0, 'Eso serían 3 MHz.'), O('300', 0, 'Giga significa mil millones.')] },
    explanation: '1 GHz = mil millones de ciclos por segundo. A 3 GHz, cada ciclo dura unos 0,33 nanosegundos.', hints: ['¿Qué significa el prefijo «giga»?', 'Hercio = ciclos por segundo.', 'Descarto dos opciones.'], retryVariant: 'gen' },
  { id: 'cpu03', concept: 'cpu', difficulty: 2, type: 'choice', kind: 'ANÁLISIS',
    prompt: 'La Unidad de Control no realiza cálculos. Entonces, ¿cuál es su trabajo?',
    data: { options: [O('Interpretar las instrucciones y generar las señales que coordinan a la ALU, registros y memoria.', 1), O('Guardar los programas cuando se apaga el equipo.', 0, 'Eso lo hace el almacenamiento.'), O('Enfriar la CPU.', 0, 'Eso es tarea del disipador y el ventilador.'), O('Mostrar los resultados en pantalla.', 0, 'Eso es la salida (GPU y monitor).')] },
    explanation: 'La Unidad de Control es la directora de orquesta: no toca instrumentos, pero sin ella nadie sabría cuándo tocar.', hints: ['Si no calcula, ¿qué hace con las instrucciones?', 'Piensa en «control» como «coordinación».', 'Descarto dos opciones.'] },
  { id: 'cpu04', concept: 'cpu', difficulty: 1, type: 'timing', kind: 'SINCRONIZACIÓN',
    prompt: 'Los registros sólo capturan datos en el *flanco de subida* del reloj. Pulsa E (o ESPACIO) justo cuando cada flanco cruce la línea de captura.',
    data: { edges: 8, need: 6, period: 0.95, data: '10110010' },
    explanation: 'El reloj sincroniza toda la CPU: entre flancos la lógica calcula; en el flanco, los registros guardan el resultado. Más frecuencia = más flancos por segundo.', hints: ['No pulses cuando veas el 1: pulsa cuando la señal SUBE.', 'Los flancos próximos se iluminan.', 'Ralentizo el reloj para que practiques.'] },
  { id: 'cpu05', concept: 'cpu', difficulty: 3, type: 'choice', kind: 'ANÁLISIS',
    prompt: 'En la arquitectura de *Von Neumann*, instrucciones y datos comparten la misma memoria y el mismo bus. ¿Qué problema provoca?',
    data: { options: [O('Un cuello de botella: la CPU espera porque instrucciones y datos compiten por el mismo camino.', 1), O('Los programas no pueden modificarse.', 0, 'Al contrario: guardar programas en memoria los hace fáciles de cambiar.'), O('La CPU no puede hacer sumas.', 0, 'La ALU sigue sumando; el problema es el acceso a memoria.'), O('Ninguno: es la arquitectura perfecta.', 0, 'Es una arquitectura brillante, pero tiene este límite conocido.')] },
    explanation: 'El «cuello de botella de Von Neumann» es la razón de existir de cachés, buses más anchos y arquitecturas tipo Harvard en las cachés L1.', hints: ['¿Qué pasa cuando dos cosas usan un único camino?', 'Piensa en el bus compartido.', 'Descarto dos opciones.'] },
  { id: 'cpu06', concept: 'cpu', difficulty: 3, type: 'choice', kind: 'IDENTIFICACIÓN',
    prompt: 'Mientras una instrucción se está decodificando, ¿dónde está guardada?',
    data: { options: [O('En el Registro de Instrucción (IR).', 1), O('En el Contador de Programa (PC).', 0, 'El PC guarda la DIRECCIÓN de la siguiente instrucción, no la instrucción.'), O('En el SSD.', 0, 'Demasiado lejos y lento: la instrucción ya está dentro de la CPU.'), O('En la ALU.', 0, 'La ALU ejecuta operaciones; no almacena la instrucción actual.')] },
    explanation: 'IR = qué estoy haciendo; PC = dónde está lo siguiente. Confundirlos es el error más común del ciclo de instrucción.', hints: ['¿Qué registro contiene la instrucción en sí, no su dirección?', 'Distingue «dirección» de «contenido».', 'Descarto dos opciones.'], misconception: 'El PC no contiene instrucciones: contiene la dirección de memoria donde está la próxima.' },
  { id: 'cpu07', concept: 'cpu', difficulty: 3, type: 'timing', kind: 'SINCRONIZACIÓN',
    prompt: 'El reloj se aceleró. Captura al menos 7 de 9 flancos de subida para estabilizar el registro.',
    data: { edges: 9, need: 7, period: 0.65, window: 0.12, data: '01101001' },
    explanation: 'A mayor frecuencia, menos tiempo entre flancos: la lógica debe terminar antes del siguiente, o el resultado se captura incompleto. Por eso no se puede subir la frecuencia sin límite.', hints: ['Anticípate: el ritmo es constante.', 'Los flancos próximos se iluminan.', 'Ralentizo el reloj.'] }
);

// ---------------------------------------------------------------- CICLO DE INSTRUCCIÓN ----
addCh(
  { id: 'fde01', concept: 'fetchDecodeExecute', difficulty: 1, type: 'order', kind: 'ORDENAMIENTO',
    prompt: 'Una instrucción recorre el procesador en cuatro etapas. Ordénalas.',
    data: { items: ['FETCH — traer la instrucción de memoria', 'DECODE — interpretar qué pide', 'EXECUTE — realizar la operación', 'WRITE BACK — guardar el resultado'] },
    explanation: 'Buscar, decodificar, ejecutar, escribir. El ciclo se repite miles de millones de veces por segundo.', hints: ['¿Puedes interpretar algo que aún no has traído?', 'Los resaltados están fuera de lugar.', 'Te fijo los primeros.'], retryVariant: 'gen' },
  { id: 'fde02', concept: 'fetchDecodeExecute', difficulty: 3, type: 'order', kind: 'ORDENAMIENTO',
    prompt: 'Ahora con más detalle. Ordena los micro-pasos que ejecuta la CPU para una instrucción ADD.',
    data: { items: ['PC → MAR (dirección de la instrucción)', 'Memoria → MDR (se lee la instrucción)', 'MDR → IR (la instrucción entra al registro)', 'PC = PC + 1', 'La Unidad de Control decodifica el IR', 'La ALU suma los operandos', 'Resultado → registro destino'] },
    explanation: 'FETCH son los tres primeros pasos más el incremento del PC; luego DECODE, EXECUTE y WRITE BACK. Los registros MAR y MDR son la «ventanilla» entre CPU y memoria.', hints: ['El PC dice DÓNDE; el MAR lleva esa dirección a memoria.', 'Los resaltados están fuera de lugar.', 'Te fijo los primeros pasos.'] },
  { id: 'fde03', concept: 'fetchDecodeExecute', difficulty: 2, type: 'choice', kind: 'ANÁLISIS',
    prompt: 'Tras traer una instrucción (FETCH), ¿qué registro se incrementa para apuntar a la siguiente?',
    data: { options: [O('El Contador de Programa (PC).', 1), O('El Registro de Instrucción (IR).', 0, 'El IR guarda la instrucción actual; no se incrementa.'), O('El acumulador.', 0, 'El acumulador guarda resultados de la ALU.'), O('Ninguno: la memoria avanza sola.', 0, 'La memoria no sabe qué instrucción sigue; eso lo lleva la CPU.')] },
    explanation: 'El PC es el marcapáginas del programa: tras cada FETCH avanza a la siguiente instrucción (salvo que un salto lo cambie).', hints: ['¿Qué registro sabe «dónde voy»?', 'Contador... de programa.', 'Descarto dos opciones.'] },
  { id: 'fde04', concept: 'fetchDecodeExecute', difficulty: 3, type: 'choice', kind: 'ANÁLISIS',
    prompt: '*LOAD R1, [0x40]* copia en R1 el dato de la dirección 0x40. ¿En qué etapa se accede a esa dirección de DATOS?',
    data: { options: [O('En EXECUTE: la operación de esta instrucción es justamente leer memoria.', 1), O('En FETCH.', 0, 'En FETCH se lee la INSTRUCCIÓN, no el dato 0x40.'), O('En DECODE.', 0, 'Decodificar sólo interpreta; aún no accede a memoria.'), O('En WRITE BACK.', 0, 'Write back guarda en R1 el dato ya leído.')] },
    explanation: 'Una misma instrucción puede tocar la memoria dos veces: en FETCH (para leerse a sí misma) y en EXECUTE (para leer el dato que pide).', hints: ['Distingue leer la instrucción de leer el dato.', 'Separa FETCH de EXECUTE.', 'Descarto dos opciones.'], misconception: 'FETCH trae la instrucción; el dato que la instrucción pide se obtiene después.' },
  { id: 'fde05', concept: 'fetchDecodeExecute', difficulty: 2, type: 'choice', kind: 'DECODIFICACIÓN',
    prompt: 'Decodifica la instrucción *0010 0001 0010* usando la tabla de códigos de operación. Formato: OPCODE | REG A | REG B.',
    data: { visual: 'table', table: { cols: ['OPCODE', 'INSTRUCCIÓN', 'UNIDAD'], rows: [['0001', 'LOAD', 'Memoria'], ['0010', 'ADD', 'ALU'], ['0011', 'STORE', 'Memoria'], ['0100', 'JUMP', 'Unidad de Control']] }, options: [O('ADD: la ALU sumará R1 y R2.', 1), O('LOAD: se leerá memoria en R1.', 0, 'LOAD es 0001; aquí el opcode es 0010.'), O('JUMP: el programa saltará a R2.', 0, 'JUMP es 0100.'), O('STORE: se escribirá R1 en memoria.', 0, 'STORE es 0011.')] },
    hl: [1], explanation: 'Decodificar es traducir bits a acciones: los primeros bits (opcode) eligen la operación y la unidad; los siguientes, los operandos.', hints: ['Mira sólo los 4 primeros bits.', 'Busca 0010 en la tabla.', 'Descarto dos opciones.'], retryVariant: 'gen' },
  { id: 'fde06', concept: 'fetchDecodeExecute', difficulty: 4, type: 'choice', kind: 'ANÁLISIS',
    prompt: 'En un *pipeline*, la instrucción 2 necesita R1 antes de que la 1 termine de escribirlo. ¿Qué evita la espera sin cambiar el resultado?',
    data: { visual: 'code', code: ['ADD R1, R2, R3', 'SUB R4, R1, R5', 'MUL R6, R7, R8'], options: [O('Mover la instrucción 3 (independiente) entre la 1 y la 2.', 1, 'Correcto: se rellena el hueco con trabajo útil que no depende de R1.'), O('Ejecutar la 2 antes que la 1.', 0, 'Cambiaría el resultado: SUB usaría un R1 antiguo.'), O('Eliminar la instrucción 3.', 0, 'Quitar trabajo no evita la espera.'), O('Instalar más RAM.', 0, 'Es una dependencia entre registros, no un problema de memoria.')] },
    hl: [0, 1], explanation: 'Un *riesgo de datos* ocurre cuando una instrucción depende del resultado de otra que aún no ha terminado. Reordenar instrucciones independientes es lo que hacen compiladores y CPUs modernas.', hints: ['¿Qué instrucción no usa R1?', 'Mira las instrucciones resaltadas: ¿qué comparten?', 'Descarto dos opciones.'] },
  { id: 'fde07', concept: 'fetchDecodeExecute', difficulty: 2, type: 'choice', kind: 'PREDICCIÓN',
    prompt: 'Se ejecuta la instrucción *JUMP 0x80*. ¿Qué cambia?',
    data: { options: [O('El PC pasa a valer 0x80: el próximo FETCH trae la instrucción de esa dirección.', 1), O('Se copia el dato de 0x80 a un registro.', 0, 'Eso sería un LOAD.'), O('La ALU suma 0x80 al acumulador.', 0, 'Eso sería un ADD inmediato.'), O('Se borra la memoria a partir de 0x80.', 0, 'Un salto no borra nada.')] },
    explanation: 'Los saltos cambian el flujo del programa modificando el PC. Así existen bucles, condiciones y funciones.', hints: ['¿Qué registro decide cuál es la próxima instrucción?', 'Piensa en el marcapáginas.', 'Descarto dos opciones.'] }
);

// ---------------------------------------------------------------- ALU ----
const TT2 = [[0, 0], [0, 1], [1, 0], [1, 1]];
addCh(
  { id: 'alu01', concept: 'alu', difficulty: 1, type: 'logic', kind: 'LÓGICA',
    prompt: 'La compuerta de la Forja es *AND* y la cerradura se abre con salida *1*. Configura las entradas.',
    data: { inputs: [{ n: 'A', v: 0, edit: true }, { n: 'B', v: 0, edit: true }], gates: [{ id: 'g0', type: 'AND', in: ['A', 'B'], col: 0, row: 0.5 }], out: 'g0', target: 1, solution: { A: 1, B: 1 } },
    explanation: 'AND sólo da 1 si TODAS sus entradas son 1. Es la lógica del «y»: puerta abierta si hay llave Y código.', hints: ['AND: ¿cuántas entradas deben estar en 1?', 'Las entradas resaltadas están en 0.', 'Te fijo una entrada.'], retryVariant: 'gen' },
  { id: 'alu02', concept: 'alu', difficulty: 2, type: 'logic', kind: 'TABLA DE VERDAD',
    prompt: 'Elige la compuerta que produce exactamente esta tabla de verdad (OBJ).',
    data: { inputs: [{ n: 'A', v: 0 }, { n: 'B', v: 0 }], gates: [{ id: 'g0', edit: true, opts: ['AND', 'OR', 'XOR', 'NAND'], in: ['A', 'B'], col: 0, row: 0.5 }], out: 'g0', table: TT2, targets: [0, 1, 1, 0], solution: { g0: 'XOR' } },
    explanation: 'XOR (o exclusivo) da 1 cuando las entradas son DISTINTAS. Es la base de la suma binaria: 1+1 da 0 (y lleva 1).', hints: ['¿Qué pasa en la fila 1,1?', 'Compara la fila (1,1) con OR.', 'Te coloco la compuerta.'], retryVariant: 'gen' },
  { id: 'alu03', concept: 'alu', difficulty: 1, type: 'logic', kind: 'TABLA DE VERDAD',
    prompt: 'Elige la compuerta que produce esta tabla de verdad.',
    data: { inputs: [{ n: 'A', v: 0 }, { n: 'B', v: 0 }], gates: [{ id: 'g0', edit: true, opts: ['AND', 'OR', 'XOR', 'NOR'], in: ['A', 'B'], col: 0, row: 0.5 }], out: 'g0', table: TT2, targets: [0, 1, 1, 1], solution: { g0: 'OR' } },
    explanation: 'OR da 1 si AL MENOS una entrada es 1.', hints: ['¿Cuándo da 0?', 'Mira la única fila con 0.', 'Te coloco la compuerta.'], retryVariant: 'gen' },
  { id: 'alu04', concept: 'alu', difficulty: 3, type: 'logic', kind: 'CIRCUITO',
    prompt: 'Construye una compuerta *NAND* combinando dos compuertas. La tabla objetivo es 1,1,1,0.',
    data: { inputs: [{ n: 'A', v: 0 }, { n: 'B', v: 0 }], gates: [{ id: 'g0', edit: true, opts: ['AND', 'OR', 'XOR'], in: ['A', 'B'], col: 0, row: 0.5 }, { id: 'g1', edit: true, opts: ['NOT', 'BUF'], in: ['g0'], col: 1, row: 0.5 }], out: 'g1', table: TT2, targets: [1, 1, 1, 0], solution: { g0: 'AND', g1: 'NOT' } },
    explanation: 'NAND = NOT(AND). Es «universal»: con NAND se puede construir cualquier otra compuerta, y por eso abunda en los chips reales.', hints: ['La tabla es justo la inversa de una compuerta conocida.', 'Invierte la tabla objetivo: ¿qué compuerta queda?', 'Te coloco una compuerta.'] },
  { id: 'alu05', concept: 'alu', difficulty: 3, type: 'logic', kind: 'CIRCUITO',
    prompt: 'B está fijado a 1 por el horno. Configura A y C para que la salida sea *1*.',
    data: { inputs: [{ n: 'A', v: 1, edit: true }, { n: 'B', v: 1 }, { n: 'C', v: 0, edit: true }], gates: [{ id: 'g0', type: 'XOR', in: ['A', 'B'], col: 0, row: 0.33 }, { id: 'g1', type: 'AND', in: ['g0', 'C'], col: 1, row: 0.5 }], out: 'g1', target: 1, solution: { A: 0, C: 1 } },
    explanation: 'XOR con una entrada fija en 1 actúa como un NOT: invierte la otra. Por eso A debe ser 0 para que g0 valga 1, y C debe ser 1 para el AND.', hints: ['¿Qué necesita el AND final en sus dos entradas?', 'Fíjate en el XOR con B = 1.', 'Te fijo una entrada.'] },
  { id: 'alu06', concept: 'alu', difficulty: 2, type: 'bits', kind: 'SUMA BINARIA',
    prompt: 'La ALU debe sumar *0101 + 0011*. Escribe el resultado en binario (incluido el acarreo final).',
    data: { op: 'ADD', a: '0101', b: '0011' },
    explanation: 'Se suma columna a columna de derecha a izquierda: 1+1 = 10 → se escribe 0 y se lleva 1. 5 + 3 = 8 = 01000.', hints: ['Empieza por la derecha. ¿Cuánto es 1+1 en binario?', 'Mira la fila de acarreos.', 'Te completo los bits de la derecha.'], retryVariant: 'gen' },
  { id: 'alu07', concept: 'alu', difficulty: 2, type: 'bits', kind: 'MÁSCARA',
    prompt: 'Aplica la máscara: *10110110 AND 00001111*. (Una máscara conserva sólo algunos bits.)',
    data: { op: 'AND', a: '10110110', b: '00001111' },
    explanation: 'AND con 1 conserva el bit; AND con 0 lo apaga. Las máscaras aíslan partes de un dato, como el nibble bajo.', hints: ['¿Qué ocurre con un bit cuando haces AND con 0?', 'Mira las columnas marcadas.', 'Te completo la mitad derecha.'], retryVariant: 'gen' },
  { id: 'alu08', concept: 'alu', difficulty: 3, type: 'bits', kind: 'LÓGICA BIT A BIT',
    prompt: 'Calcula *1100 XOR 1010*.',
    data: { op: 'XOR', a: '1100', b: '1010' },
    explanation: 'XOR da 1 donde los bits son distintos. Sirve para comparar, alternar bits y cifrados sencillos.', hints: ['Compara columna a columna: ¿iguales o distintos?', 'Mira las columnas marcadas.', 'Te completo la mitad derecha.'], retryVariant: 'gen' },
  { id: 'alu09', concept: 'alu', difficulty: 4, type: 'bits', kind: 'RESTA BINARIA',
    prompt: 'Calcula *0110 − 0011* en 4 bits (complemento a dos).',
    data: { op: 'SUB', a: '0110', b: '0011' },
    explanation: 'La ALU no tiene un circuito de resta: suma el complemento a dos. 6 − 3 = 6 + (−3) = 0110 + 1101 = 1|0011 → se descarta el acarreo final: 0011.', hints: ['6 − 3 en decimal, ¿cuánto es?', 'Restar = sumar el complemento a dos del sustraendo.', 'Te completo la mitad derecha.'], retryVariant: 'gen' },
  { id: 'alu10', concept: 'alu', difficulty: 3, type: 'choice', kind: 'COMPARACIÓN',
    prompt: 'Para comparar A y B, la ALU calcula *A − B* y observa sus banderas. Si se activa la bandera *Z* (cero), ¿qué significa?',
    data: { visual: 'bits', bits: { rows: [['A', '0111', 7], ['B', '0111', 7], ['A−B', '0000', 0]] }, options: [O('A y B son iguales.', 1), O('A es mayor que B.', 0, 'Si A > B, la resta sería positiva y distinta de cero.'), O('A es menor que B.', 0, 'Eso lo indicaría la bandera de signo o de acarreo.'), O('Hubo un error de la ALU.', 0, 'Z = 1 es un resultado normal.')] },
    explanation: 'Las comparaciones son restas cuyo resultado se descarta: sólo importan las banderas (Z, N, C, V). Así funcionan los «if».', hints: ['¿Cuándo es cero una resta?', 'Mira el resultado A−B.', 'Descarto dos opciones.'] },
  { id: 'alu11', concept: 'alu', difficulty: 2, type: 'bits', kind: 'PARIDAD',
    prompt: 'Calcula el *bit de paridad par* para el dato *1011001* (el total de unos debe quedar par).',
    data: { op: 'PARITY', a: '1011001' },
    explanation: 'Hay 4 unos: ya es par, así que P = 0. Si un bit se corrompe durante el viaje, la paridad deja de cuadrar y el error se detecta.', hints: ['Cuenta los unos del dato.', 'Si ya es par, ¿hace falta otro 1?', 'Te completo el bit.'], retryVariant: 'gen' },
  { id: 'alu12', concept: 'alu', difficulty: 1, type: 'bits', kind: 'INVERSIÓN',
    prompt: 'Calcula *NOT 1010*.', data: { op: 'NOT', a: '1010' },
    explanation: 'NOT invierte cada bit: los 1 pasan a 0 y los 0 a 1.', hints: ['Cambia cada bit por su contrario.', 'Mira las columnas marcadas.', 'Te completo la mitad.'], retryVariant: 'gen' },
  { id: 'alu13', concept: 'alu', difficulty: 2, type: 'choice', kind: 'PREDICCIÓN',
    prompt: 'Aplicas *A XOR A* (un valor con él mismo). ¿Cuál es el resultado para cualquier A?',
    data: { options: [O('Siempre 0.', 1, 'Cada bit se compara consigo mismo: siempre iguales, siempre 0.'), O('Siempre A.', 0, 'Eso sería A AND A o A OR A.'), O('Siempre todos 1.', 0, 'XOR da 1 sólo si los bits son distintos.'), O('Depende del valor de A.', 0, 'Nunca depende: los bits siempre coinciden.')] },
    explanation: 'XOR de algo consigo mismo es 0. Los compiladores lo usan para poner un registro a cero rápidamente (XOR R1, R1).', hints: ['XOR compara bits: ¿pueden ser distintos si son el mismo?', 'Piensa bit a bit.', 'Descarto dos opciones.'] }
);

// ---------------------------------------------------------------- REGISTROS ----
addCh(
  { id: 'reg01', concept: 'registers', difficulty: 2, type: 'match', kind: 'ASOCIACIÓN',
    prompt: 'REG te presenta a sus compañeros. Une cada registro con lo que guarda.',
    data: { pairs: [['PC', 'Dirección de la próxima instrucción'], ['IR', 'Instrucción que se está ejecutando'], ['ACC / R0', 'Resultado de la última operación'], ['MAR', 'Dirección de memoria a la que se accede'], ['MDR', 'Dato que viene o va a memoria']] },
    explanation: 'Cada registro es una «mesa de trabajo» especializada. MAR y MDR son la ventanilla con la memoria; PC e IR, la brújula del programa.', hints: ['«Address» = dirección, «Data» = dato.', 'Mira la conexión resaltada.', 'Te uno la mitad.'], retryVariant: 'gen' },
  { id: 'reg02', concept: 'registers', difficulty: 2, type: 'choice', kind: 'ANÁLISIS',
    prompt: '¿Por qué los registros son tan rápidos y, a la vez, hay tan pocos?',
    data: { options: [O('Están dentro de la CPU junto a la ALU; son rapidísimos pero caros en espacio y energía.', 1), O('Porque son antiguos y nadie los mejoró.', 0, 'Los registros evolucionan con cada generación de CPU.'), O('Porque guardan datos de forma permanente.', 0, 'Son volátiles; se pierden sin energía.'), O('Porque están en el SSD.', 0, 'Están dentro del núcleo, lo más cerca posible de la ALU.')] },
    explanation: 'Velocidad, capacidad y coste compiten entre sí. La jerarquía de memoria existe porque ninguna tecnología es a la vez rápida, grande y barata.', hints: ['¿Dónde están físicamente?', 'Piensa en el precio del espacio junto a la ALU.', 'Descarto dos opciones.'] },
  { id: 'reg03', concept: 'registers', difficulty: 3, type: 'choice', kind: 'ANÁLISIS',
    prompt: 'REG «olvida» todo al cambiar de contexto. El sistema operativo pasa del navegador al editor: ¿qué hace con los registros del navegador?',
    data: { options: [O('Los guarda en memoria para restaurarlos cuando el navegador vuelva a ejecutarse.', 1), O('Los borra: el navegador empezará de cero.', 0, 'Entonces cada cambio de programa reiniciaría las aplicaciones.'), O('Los deja: el editor usa otros registros físicos.', 0, 'Todos los procesos comparten los mismos registros del núcleo.'), O('Los envía al monitor.', 0, 'No tiene relación con la salida.')] },
    explanation: 'Un *cambio de contexto* guarda y restaura el estado (registros, PC). Es lo mismo que hace una interrupción: guardar, atender, restaurar.', hints: ['Si otro programa usa los mismos registros, ¿qué pasa con los valores antiguos?', 'Piensa en guardar la partida.', 'Descarto dos opciones.'] },
  { id: 'reg04', concept: 'registers', difficulty: 2, type: 'classify', kind: 'CLASIFICACIÓN',
    prompt: '¿Esta propiedad describe a los *REGISTROS* o a la *RAM*?',
    data: { bins: ['REGISTROS', 'RAM'], items: [{ t: 'Acceso en ~1 ciclo', b: 0 }, { t: 'Capacidad de gigabytes', b: 1 }, { t: 'Dentro del núcleo de la CPU', b: 0 }, { t: 'Módulos en la placa base', b: 1 }, { t: 'Se nombran en la instrucción (R1, R2)', b: 0 }, { t: 'Se accede mediante direcciones', b: 1 }, { t: 'Unas pocas decenas por núcleo', b: 0 }, { t: 'Guarda el programa mientras corre', b: 1 }] },
    explanation: 'Los registros son pocos, internos y rapidísimos; la RAM es grande, externa y más lenta. Trabajan juntos: los datos suben de la RAM a los registros para operar.', hints: ['¿Qué es pequeño y cercano, y qué es grande y lejano?', 'Los resaltados están mal clasificados.', 'Te coloco algunos.'] },
  { id: 'reg05', concept: 'registers', difficulty: 3, type: 'choice', kind: 'ANÁLISIS',
    prompt: 'Una CPU es «de 64 bits». ¿Qué significa principalmente?',
    data: { options: [O('Sus registros generales y operaciones enteras manejan 64 bits a la vez.', 1), O('Tiene 64 núcleos.', 0, 'El número de núcleos es independiente.'), O('Tiene 64 GB de RAM.', 0, 'La RAM instalada no define la arquitectura.'), O('Funciona a 64 GHz.', 0, 'Ninguna CPU comercial funciona a esa frecuencia.')] },
    explanation: 'El tamaño de palabra marca cuántos bits procesa la CPU de una vez y cuántas direcciones puede manejar con comodidad.', hints: ['¿Qué tamaño tienen los registros?', 'Piensa en «ancho» de los datos.', 'Descarto dos opciones.'] }
);

// ---------------------------------------------------------------- CACHÉ ----
addCh(
  { id: 'ca01', concept: 'cache', difficulty: 1, type: 'memsim', kind: 'SIMULACIÓN',
    prompt: 'La CPU necesita el dato de *0x2A40*. Búscalo nivel por nivel en la Torre de la Memoria.',
    data: { addr: '0x2A40', found: 4, q: 'Ahora la CPU pide *0x2A44*, la dirección contigua. ¿Qué ocurrirá?', options: [O('HIT en L1: al traer 0x2A40 se copió toda la línea de caché contigua.', 1, 'Exacto: la caché trae bloques (líneas) de ~64 bytes, no bytes sueltos.'), O('MISS de nuevo hasta la RAM.', 0, 'La línea completa ya se copió a las cachés.'), O('Habrá que leer del SSD.', 0, 'El dato está incluso en caché.'), O('HIT en los registros.', 0, 'Los registros sólo guardan lo que el programa carga explícitamente.')] },
    hl: [1], explanation: 'Tras un *miss*, el dato sube por la jerarquía junto a sus vecinos. *Localidad espacial*: si usas una dirección, probablemente usarás las cercanas.', hints: ['¿Qué se copió exactamente al subir el dato?', 'Mira el nivel resaltado.', 'Descarto opciones.'], retryVariant: 'gen' },
  { id: 'ca02', concept: 'cache', difficulty: 2, type: 'memsim', kind: 'PREDICCIÓN',
    prompt: 'Nueva solicitud: *0x7F00*. Búscala y luego calcula el coste.',
    data: { addr: '0x7F00', found: 2, q: '¿Cuántos ciclos costó en total este acceso?', options: [O('17 ciclos (1 + 4 + 12).', 1, 'Se consultaron registros, L1 (miss) y L2 (hit): las latencias se acumulan.'), O('12 ciclos.', 0, 'Olvidas el coste de los niveles consultados antes.'), O('200 ciclos.', 0, 'No hizo falta llegar a la RAM.'), O('4 ciclos.', 0, 'L1 falló.')] },
    hl: [0, 1, 2], explanation: 'Cada miss añade la latencia de consultar el siguiente nivel. Por eso importa tanto acertar pronto.', hints: ['Suma las latencias de cada nivel consultado.', 'Mira los niveles resaltados.', 'Descarto opciones.'], retryVariant: 'gen' },
  { id: 'ca03', concept: 'cache', difficulty: 2, type: 'choice', kind: 'ANÁLISIS',
    prompt: 'CACHE, el archivista, insiste: «Yo no reemplazo a la RAM». Entonces, ¿para qué sirve la caché?',
    data: { options: [O('Guarda copias de los datos más usados cerca de la CPU para no esperar a la RAM cada vez.', 1), O('Sustituye a la RAM en equipos modernos.', 0, 'La caché es muy pequeña: los programas viven en RAM.'), O('Guarda los datos al apagar el equipo.', 0, 'Es volátil, como la RAM.'), O('Acelera el SSD guardando archivos para siempre.', 0, 'La caché de CPU trabaja con la RAM, no con archivos permanentes.')] },
    explanation: '«La caché no reemplaza la RAM: evita que la CPU tenga que esperarla todo el tiempo.» Es una copia, no un sustituto.', hints: ['¿Qué tamaño tiene una caché comparada con la RAM?', 'Piensa en «copia cercana».', 'Descarto dos opciones.'], misconception: 'La caché no es memoria extra para programas: sólo guarda copias temporales de datos que ya están en RAM.' },
  { id: 'ca04', concept: 'cache', difficulty: 3, type: 'classify', kind: 'CLASIFICACIÓN',
    prompt: 'La caché funciona gracias a la *localidad*. ¿Qué tipo de localidad aprovecha cada patrón?',
    data: { bins: ['TEMPORAL', 'ESPACIAL'], items: [{ t: 'Un contador usado en cada vuelta de un bucle', b: 0 }, { t: 'Recorrer un array elemento a elemento', b: 1 }, { t: 'Leer instrucciones consecutivas', b: 1 }, { t: 'Consultar la misma variable muchas veces', b: 0 }, { t: 'Procesar una imagen fila por fila', b: 1 }, { t: 'Llamar a la misma función repetidamente', b: 0 }] },
    explanation: 'Temporal: lo usado recientemente se volverá a usar. Espacial: lo cercano a lo usado se usará pronto.', hints: ['¿Se repite el MISMO dato o se avanza a datos VECINOS?', 'Los resaltados están mal clasificados.', 'Te coloco algunos.'] },
  { id: 'ca05', concept: 'cache', difficulty: 3, type: 'choice', kind: 'DIAGNÓSTICO',
    prompt: 'Misión «Cache Miss infinito»: dos datos muy usados se asignan al mismo conjunto de caché y se expulsan mutuamente una y otra vez.',
    data: { visual: 'meters', meters: [{ n: 'TASA DE MISS', v: 92 }, { n: 'USO DE CPU', v: 35 }, { n: 'ESPERA A RAM', v: 88 }], options: [O('Thrashing: misses constantes; la caché trabaja sin aprovecharse.', 1), O('La caché está demasiado vacía.', 0, 'Está llena... de datos que se expulsan entre sí.'), O('La CPU es demasiado rápida.', 0, 'La CPU espera: no le sobra velocidad, le faltan datos.'), O('El SSD está lleno.', 0, 'El problema ocurre entre caché y RAM.')] },
    hl: [0, 2], explanation: 'El *thrashing* aparece cuando el patrón de acceso choca con la organización de la caché. Se resuelve con más asociatividad o cambiando el orden de acceso.', hints: ['¿Qué indica una tasa de miss tan alta?', 'Mira los medidores resaltados.', 'Descarto dos opciones.'] },
  { id: 'ca06', concept: 'cache', difficulty: 4, type: 'sim', kind: 'SIMULACIÓN',
    prompt: 'Diseña la caché: una más grande acierta más, pero tarda más en consultarse. Consigue un tiempo medio de acceso (AMAT) de *15 ciclos o menos*.',
    data: {
      params: [{ k: 'size', n: 'TAMAÑO DE CACHÉ', min: 64, max: 512, step: 64, v: 64, unit: ' KB' }],
      compute: p => { const hr = 0.8 + 0.18 * (1 - Math.exp(-p.size / 96)); const ht = 2 + Math.pow(p.size / 64, 1.2); return { hr: hr * 100, ht, amat: ht + (1 - hr) * 200 }; },
      outputs: [{ k: 'hr', n: 'TASA DE ACIERTO', unit: '%', min: 80, max: 100, dec: 1 }, { k: 'ht', n: 'TIEMPO DE ACIERTO', unit: ' c', min: 0, max: 20, dec: 1 }, { k: 'amat', n: 'AMAT', unit: ' c', min: 0, max: 40, dec: 1, goal: { op: '<=', v: 15 } }],
      solution: { size: 256 }, hlParams: ['size']
    },
    explanation: 'AMAT = tiempo de acierto + tasa de fallos × penalización. Ni la caché más pequeña ni la más grande es la mejor: hay un punto de equilibrio.', hints: ['¿Qué pasa con el AMAT en los extremos?', 'Prueba valores intermedios.', 'Te coloco el tamaño.'] },
  { id: 'ca07', concept: 'cache', difficulty: 1, type: 'choice', kind: 'IDENTIFICACIÓN',
    prompt: 'En el registro de la Torre aparece *CACHE HIT*. ¿Qué significa?',
    data: { options: [O('El dato buscado estaba en la caché.', 1), O('La caché se rompió.', 0, 'Hit es un acierto, no un golpe.'), O('El dato tuvo que traerse del SSD.', 0, 'Eso sería un miss hasta el almacenamiento.'), O('La caché se vació.', 0, 'Nada se vacía en un acierto.')] },
    explanation: 'Hit = acierto (dato encontrado en caché, respuesta rápida). Miss = fallo (hay que bajar al siguiente nivel).', hints: ['«Hit» en inglés significa acertar.', 'Piensa en el tiempo de respuesta.', 'Descarto dos opciones.'] },
  { id: 'ca08', concept: 'cache', difficulty: 3, type: 'memsim', kind: 'SIMULACIÓN',
    prompt: 'Solicitud *0x9C00*: un dato que nadie usó desde hace mucho. Síguelo.',
    data: { addr: '0x9C00', found: 5, q: '¿Por qué este acceso fue tan lento?', options: [O('El dato no estaba ni en caché ni en RAM: hubo que traerlo del SSD.', 1, 'Sí: bajar al almacenamiento cuesta cientos de miles de ciclos.'), O('La CPU es lenta.', 0, 'La CPU esperaba; no era ella la lenta.'), O('La caché L1 es demasiado grande.', 0, 'El dato ni siquiera estaba en caché.'), O('Los registros estaban llenos.', 0, 'Los registros no participan en la búsqueda.')] },
    hl: [5], explanation: 'Un acceso al almacenamiento es tan lento que el sistema operativo suele cambiar a otro proceso mientras espera.', hints: ['¿En qué nivel apareció el dato?', 'Mira el nivel resaltado.', 'Descarto opciones.'] }
);

// ---------------------------------------------------------------- RAM ----
const MEMTABLE = { cols: ['ALMACÉN', 'CAPACIDAD', 'PERSISTE', 'LATENCIA'], rows: [['Registro', '~1 KB', 'No', '1 ciclo'], ['Caché L1', '64 KB', 'No', '4 ciclos'], ['RAM', '16 GB', 'No', '~200 ciclos'], ['SSD', '1 TB', 'Sí', '~100.000 ciclos']] };
addCh(
  { id: 'ram01', concept: 'ram', difficulty: 2, type: 'choice', kind: 'DECISIÓN',
    prompt: 'Misión: almacenar *temporalmente 256 MB* que un proceso usará durante varios segundos. ¿Dónde los guardas?',
    data: { visual: 'table', table: MEMTABLE, options: [O('Registro', 0, 'NO CABE: 256 MB son cientos de miles de veces más que todos los registros juntos.'), O('Caché L1', 0, 'NO CABE: 64 KB frente a 256 MB. Además, la caché la gestiona el hardware, no tú.'), O('RAM', 1, 'Capacidad de sobra, rápida y pensada exactamente para datos de trabajo temporales.'), O('SSD', 0, 'Funcionaría, pero cada acceso sería cientos de veces más lento y no necesitas persistencia.')] },
    hl: [2], explanation: 'Elegir memoria es equilibrar capacidad, persistencia y latencia. Datos grandes y temporales = RAM.', hints: ['Revisa la columna CAPACIDAD: ¿dónde caben 256 MB?', 'Mira la fila resaltada y compara su latencia con la del SSD.', 'Descarto dos opciones.'], retryVariant: 'ram06' },
  { id: 'ram02', concept: 'ram', difficulty: 1, type: 'choice', kind: 'PREDICCIÓN',
    prompt: 'Se corta la energía un instante en la Torre. ¿Qué datos sobreviven?',
    data: { options: [O('Los del SSD; los de la RAM se pierden porque es volátil.', 1), O('Los de la RAM, porque es más rápida.', 0, 'La velocidad no tiene que ver: la RAM necesita energía constante.'), O('Todos sobreviven.', 0, 'La RAM, la caché y los registros son volátiles.'), O('Ninguno, ni siquiera los del SSD.', 0, 'El SSD usa memoria flash no volátil.')] },
    explanation: 'Volátil = necesita energía para conservar datos. «¿Viste cómo desapareció al cortar energía? Eso es lo importante.»', hints: ['¿Qué memoria necesita energía constante?', 'Volátil vs persistente.', 'Descarto dos opciones.'] },
  { id: 'ram03', concept: 'ram', difficulty: 3, type: 'choice', kind: 'DIAGNÓSTICO',
    prompt: 'Un equipo con poca RAM abre muchos programas: el disco trabaja sin parar y todo va lento. ¿Qué ocurre?',
    data: { options: [O('La RAM se llenó y el sistema mueve páginas al SSD (memoria virtual), mucho más lento.', 1), O('El SSD está roto.', 0, 'Trabaja mucho porque lo usan como RAM de emergencia, no porque esté roto.'), O('La CPU está sobrecalentada.', 0, 'El síntoma principal es actividad de disco, no temperatura.'), O('Hay demasiada caché.', 0, 'La caché nunca provoca actividad de disco.')] },
    explanation: 'La *memoria virtual* usa el almacenamiento como extensión de la RAM. Funciona, pero cada acceso es miles de veces más lento.', hints: ['¿Por qué trabajaría el disco si sólo abres programas?', 'Piensa en qué pasa cuando la RAM no alcanza.', 'Descarto dos opciones.'] },
  { id: 'ram04', concept: 'ram', difficulty: 1, type: 'classify', kind: 'CLASIFICACIÓN',
    prompt: '¿Es memoria *VOLÁTIL* (se borra sin energía) o *NO VOLÁTIL*?',
    data: { bins: ['VOLÁTIL', 'NO VOLÁTIL'], items: [{ t: 'RAM', b: 0 }, { t: 'Registros', b: 0 }, { t: 'Caché L2', b: 0 }, { t: 'SSD', b: 1 }, { t: 'Disco duro (HDD)', b: 1 }, { t: 'Memoria USB', b: 1 }, { t: 'Firmware UEFI (flash)', b: 1 }] },
    explanation: 'Lo rápido suele ser volátil; lo persistente suele ser lento. Por eso los programas se cargan del almacenamiento a la RAM.', hints: ['¿Qué pasa con cada uno al desenchufar?', 'Los resaltados están mal clasificados.', 'Te coloco algunos.'], retryVariant: 'gen' },
  { id: 'ram05', concept: 'ram', difficulty: 3, type: 'choice', kind: 'ANÁLISIS',
    prompt: 'Tienes 32 GB de RAM y tus programas usan 6 GB. ¿Acelerará mucho pasar a 64 GB?',
    data: { options: [O('No: la RAM que sobra no aporta; el límite está en otra parte.', 1), O('Sí: más RAM siempre es más rápido.', 0, 'Más RAM sólo ayuda si te faltaba.'), O('Sí: duplica la velocidad de la CPU.', 0, 'La RAM no cambia la frecuencia de la CPU.'), O('No, porque la RAM no sirve para nada.', 0, 'Es esencial; simplemente ya tienes suficiente.')] },
    explanation: 'Mejorar un componente que no limita no mejora el sistema. Primero hay que encontrar el cuello de botella.', hints: ['¿Estaba la RAM llena?', 'Compara 6 GB usados con 32 GB disponibles.', 'Descarto dos opciones.'] },
  { id: 'ram06', concept: 'ram', difficulty: 2, type: 'choice', kind: 'DECISIÓN',
    prompt: 'Misión: guardar el informe final para entregarlo *mañana*, aunque se apague el equipo. ¿Dónde?',
    data: { visual: 'table', table: MEMTABLE, options: [O('Registro', 0, 'Se perdería al apagar y además no cabe.'), O('Caché L1', 0, 'Volátil: desaparece al apagar.'), O('RAM', 0, 'Volátil: al apagar el equipo el informe desaparece.'), O('SSD', 1, 'Persistente: el único que conserva datos sin energía.')] },
    hl: [3], explanation: 'Si el requisito es persistir, sólo sirve almacenamiento no volátil, aunque sea más lento.', hints: ['Revisa la columna PERSISTE.', 'Mira la fila resaltada.', 'Descarto dos opciones.'] }
);

// ---------------------------------------------------------------- ALMACENAMIENTO ----
addCh(
  { id: 'st01', concept: 'storage', difficulty: 1, type: 'choice', kind: 'COMPARACIÓN',
    prompt: 'Comparado con la RAM, un SSD es...',
    data: { options: [O('Más lento, persistente y con mucha más capacidad.', 1), O('Más rápido y volátil.', 0, 'Es al revés.'), O('Igual de rápido pero más caro.', 0, 'El SSD es mucho más lento que la RAM.'), O('Más pequeño y volátil.', 0, 'Suele tener mucha más capacidad y no es volátil.')] },
    explanation: 'Almacenamiento = capacidad y persistencia. Memoria = velocidad para trabajar.', hints: ['Piensa en la Torre: ¿qué hay más abajo?', 'Más abajo = más grande y más lento.', 'Descarto dos opciones.'] },
  { id: 'st02', concept: 'storage', difficulty: 2, type: 'order', kind: 'ORDENAMIENTO',
    prompt: 'Ordena los pisos de la Torre de la Memoria del *más rápido* al *más lento*.',
    data: { items: ['Registros', 'Caché L1', 'Caché L2', 'Caché L3', 'RAM', 'SSD', 'Disco duro (HDD)'] },
    explanation: 'A más profundidad, más capacidad y más latencia. Cada nivel sirve de «caché» del siguiente.', hints: ['¿Cuál está dentro del núcleo?', 'Los resaltados están fuera de lugar.', 'Te fijo los primeros.'], retryVariant: 'st05' },
  { id: 'st03', concept: 'storage', difficulty: 3, type: 'choice', kind: 'DIAGNÓSTICO',
    prompt: 'Misión «SSD saturado». El sistema tarda muchísimo al cambiar de programa. Medidores:',
    data: { visual: 'meters', meters: [{ n: 'CPU', v: 18 }, { n: 'RAM', v: 97 }, { n: 'SSD', v: 100 }, { n: 'GPU', v: 5 }], options: [O('Falta RAM: el sistema intercambia páginas con el SSD constantemente.', 1), O('El SSD es defectuoso.', 0, 'Trabaja al 100% porque la RAM está llena, no porque falle.'), O('La CPU es demasiado lenta.', 0, 'La CPU está casi ociosa esperando.'), O('La GPU limita.', 0, 'La GPU está al 5%.')] },
    hl: [1, 2], explanation: 'Dos medidores altos a la vez cuentan una historia: la RAM llena provoca que el SSD trabaje como memoria virtual.', hints: ['¿Cuál de los dos altos es causa y cuál consecuencia?', 'Mira los medidores resaltados juntos.', 'Descarto dos opciones.'] },
  { id: 'st04', concept: 'storage', difficulty: 3, type: 'choice', kind: 'ANÁLISIS',
    prompt: '¿Por qué la CPU no ejecuta los programas directamente desde el SSD?',
    data: { options: [O('Es demasiado lento: primero se cargan en RAM, que es mucho más rápida.', 1), O('Porque el SSD no puede guardar programas.', 0, 'Los programas se guardan precisamente allí.'), O('Porque el SSD está apagado mientras trabaja la CPU.', 0, 'El SSD funciona todo el tiempo.'), O('Porque la CPU sólo lee de la GPU.', 0, 'No existe esa restricción.')] },
    explanation: 'Cargar un programa = copiarlo del almacenamiento a la RAM. Por eso abrir una aplicación tarda más que usarla.', hints: ['Compara latencias: ~200 ciclos frente a ~100.000.', 'Piensa en cuántas instrucciones por segundo necesita la CPU.', 'Descarto dos opciones.'] },
  { id: 'st05', concept: 'storage', difficulty: 2, type: 'order', kind: 'ORDENAMIENTO',
    prompt: 'Ordena de *menor* a *mayor* capacidad típica.',
    data: { items: ['Registros', 'Caché L1', 'Caché L3', 'RAM', 'SSD'] },
    explanation: 'Capacidad y velocidad van en sentidos opuestos en la jerarquía.', hints: ['¿Cuál mide kilobytes y cuál terabytes?', 'Los resaltados están fuera de lugar.', 'Te fijo los primeros.'] },
  { id: 'st06', concept: 'storage', difficulty: 2, type: 'choice', kind: 'ANÁLISIS',
    prompt: 'Un disco duro mecánico (HDD) es mucho más lento que un SSD. ¿Por qué?',
    data: { options: [O('Tiene piezas mecánicas: el plato debe girar y el cabezal moverse hasta el dato.', 1), O('Porque guarda menos datos.', 0, 'Los HDD suelen tener mucha capacidad.'), O('Porque es volátil.', 0, 'No lo es.'), O('Porque usa el bus de control.', 0, 'Ambos usan buses; la diferencia es física.')] },
    explanation: 'El tiempo de búsqueda mecánico (milisegundos) es eterno para una CPU (nanosegundos).', hints: ['¿Qué se mueve dentro de un HDD?', 'Piensa en un tocadiscos.', 'Descarto dos opciones.'] }
);

// ---------------------------------------------------------------- BUSES ----
addCh(
  { id: 'bus01', concept: 'buses', difficulty: 1, type: 'route', kind: 'ENRUTAMIENTO',
    prompt: 'La Autopista de los Buses está colapsada. Envía cada paquete por su bus: *DATOS*, *DIRECCIONES* o *CONTROL*.',
    data: { level: 1, packets: [{ t: 'DATO: 42', k: 0 }, { t: '0x1F40', k: 1 }, { t: 'LEER', k: 2 }, { t: 'DATO: 1011', k: 0 }, { t: '0x0008', k: 1 }, { t: 'ESCRIBIR', k: 2 }] },
    explanation: 'Direcciones = DÓNDE. Datos = QUÉ. Control = CUÁNDO y CÓMO. Toda lectura de memoria usa los tres buses a la vez.', hints: ['¿El paquete es un valor, un lugar o una orden?', 'Aparece una leyenda con ejemplos.', 'Marco el carril correcto de los próximos paquetes.'], retryVariant: 'gen' },
  { id: 'bus02', concept: 'buses', difficulty: 1, type: 'classify', kind: 'CLASIFICACIÓN',
    prompt: 'BUS siempre pregunta: «¿Dato, dirección o control?». Clasifica cada señal.',
    data: { bins: ['DATOS', 'DIRECC.', 'CONTROL'], items: [{ t: 'El valor 255 que se guardará', b: 0 }, { t: 'La posición 0xA000', b: 1 }, { t: 'La señal de reloj', b: 2 }, { t: 'La orden ESCRIBIR', b: 2 }, { t: 'La letra «A» leída del teclado', b: 0 }, { t: 'El número de puerto de un dispositivo', b: 1 }, { t: 'Petición de interrupción (IRQ)', b: 2 }] },
    explanation: 'Un mismo número puede ser dato o dirección: depende del bus por el que viaja y de para qué se usa.', hints: ['¿Indica un lugar, transporta un valor o da una orden?', 'Los resaltados están mal clasificados.', 'Te coloco algunos.'], retryVariant: 'gen' },
  { id: 'bus03', concept: 'buses', difficulty: 3, type: 'choice', kind: 'CÁLCULO',
    prompt: 'Un bus de direcciones de *16 bits* puede señalar...',
    data: { options: [O('2^16 = 65.536 posiciones distintas.', 1), O('16 posiciones.', 0, 'Cada bit duplica las combinaciones.'), O('32.768 posiciones.', 0, 'Eso es 2^15.'), O('16 millones de posiciones.', 0, 'Eso es aproximadamente 2^24.')] },
    explanation: 'n líneas de dirección → 2^n posiciones. Por eso las CPUs de 32 bits estaban limitadas a 4 GB (2^32 bytes).', hints: ['¿Cuántas combinaciones hay con 1 bit? ¿Y con 2?', 'Cada bit duplica.', 'Descarto dos opciones.'], retryVariant: 'gen' },
  { id: 'bus04', concept: 'buses', difficulty: 3, type: 'choice', kind: 'ANÁLISIS',
    prompt: '¿Qué bus es normalmente *unidireccional*, saliendo de la CPU hacia memoria y dispositivos?',
    data: { options: [O('El de direcciones: la CPU indica dónde leer o escribir.', 1), O('El de datos.', 0, 'Los datos van y vienen: se leen y se escriben.'), O('El de control.', 0, 'Tiene señales en ambos sentidos: la CPU ordena y los dispositivos piden interrupciones.'), O('Todos son bidireccionales.', 0, 'El de direcciones suele salir sólo de la CPU (o del controlador DMA).')] },
    explanation: 'La CPU decide a dónde acceder; por eso las direcciones fluyen desde ella. Los datos, en cambio, viajan en ambos sentidos.', hints: ['¿Quién decide DÓNDE leer?', 'Piensa en quién pregunta y quién responde.', 'Descarto dos opciones.'] },
  { id: 'bus05', concept: 'buses', difficulty: 3, type: 'choice', kind: 'DIAGNÓSTICO',
    prompt: 'CPU y RAM están sanas, pero una línea del bus de datos está cortada y siempre lee 0. ¿Qué pasará?',
    data: { options: [O('Los datos llegarán corruptos: un bit siempre fijo, aunque ambos extremos funcionen.', 1), O('Nada: la CPU corrige el bit automáticamente.', 0, 'Sin un mecanismo de detección, el error pasa inadvertido.'), O('El sistema irá más rápido con menos líneas.', 0, 'Menos líneas funcionales = datos incorrectos.'), O('La RAM enviará los datos por el bus de control.', 0, 'Cada bus tiene su función.')] },
    explanation: '«Componentes correctos no garantizan un sistema correcto.» El canal es parte del sistema.', hints: ['¿Qué valor tendrá siempre ese bit?', 'Piensa en el canal, no en los extremos.', 'Descarto dos opciones.'] },
  { id: 'bus06', concept: 'buses', difficulty: 3, type: 'route', kind: 'ENRUTAMIENTO URGENTE',
    prompt: 'Tráfico intenso y con temporizador. Cuidado: un número en hexadecimal no siempre es una dirección.',
    data: { timed: 4, allowed: 1, packets: [{ t: 'DATO: -7', k: 0 }, { t: '0x7FFF', k: 1 }, { t: 'RELOJ', k: 2 }, { t: 'IRQ 3', k: 2 }, { t: '0x0004', k: 1 }, { t: 'DATO: 0x0F', k: 0 }, { t: 'RESET', k: 2 }, { t: 'DATO: "Z"', k: 0 }, { t: '0xC000', k: 1 }] },
    explanation: 'Lo que define un paquete es su PAPEL, no su formato: «DATO: 0x0F» es un valor escrito en hexadecimal.', hints: ['Lee la etiqueta completa, no sólo el número.', 'Aparece una leyenda con ejemplos.', 'Marco el carril de los próximos paquetes.'], retryVariant: 'gen' },
  { id: 'bus07', concept: 'buses', difficulty: 4, type: 'choice', kind: 'CÁLCULO',
    prompt: 'Un bus de *64 bits* a *100 MHz* transfiere un dato por ciclo. ¿Cuál es su ancho de banda?',
    data: { options: [O('800 MB/s (8 bytes × 100 millones por segundo).', 1), O('6.400 MB/s.', 0, '64 bits son 8 bytes, no 64.'), O('100 MB/s.', 0, 'Olvidas que cada ciclo transporta 8 bytes.'), O('64 MB/s.', 0, 'Mezclas bits con millones.')] },
    explanation: 'Ancho de banda = ancho del bus × frecuencia × transferencias por ciclo.', hints: ['¿Cuántos bytes son 64 bits?', 'Multiplica por los ciclos por segundo.', 'Descarto dos opciones.'], retryVariant: 'gen' },
  { id: 'bus08', concept: 'buses', difficulty: 2, type: 'order', kind: 'ORDENAMIENTO',
    prompt: 'Ordena cómo la CPU lee un dato de la RAM usando los tres buses.',
    data: { items: ['La CPU pone la dirección en el BUS DE DIRECCIONES', 'Activa la señal LEER en el BUS DE CONTROL', 'La RAM localiza la posición', 'La RAM coloca el dato en el BUS DE DATOS', 'La CPU captura el dato en un registro'] },
    explanation: 'Una lectura es una conversación coordinada entre tres buses. Si uno falla, falla la lectura.', hints: ['¿Qué necesita saber la RAM primero?', 'Los resaltados están fuera de lugar.', 'Te fijo los primeros.'] }
);

// ---------------------------------------------------------------- ENTRADA / SALIDA ----
addCh(
  { id: 'io01', concept: 'io', difficulty: 1, type: 'classify', kind: 'CLASIFICACIÓN',
    prompt: 'Distrito de E/S: clasifica cada dispositivo según la dirección de sus datos.',
    data: { bins: ['ENTRADA', 'SALIDA', 'AMBAS'], items: [{ t: 'Teclado', b: 0 }, { t: 'Monitor', b: 1 }, { t: 'Pantalla táctil', b: 2 }, { t: 'Impresora', b: 1 }, { t: 'Micrófono', b: 0 }, { t: 'Tarjeta de red', b: 2 }, { t: 'Altavoz', b: 1 }, { t: 'Disco externo', b: 2 }] },
    explanation: 'Entrada lleva datos hacia el sistema; salida, hacia fuera; muchos dispositivos hacen ambas cosas.', hints: ['¿Los datos entran, salen o las dos cosas?', 'Los resaltados están mal clasificados.', 'Te coloco algunos.'], retryVariant: 'gen' },
  { id: 'io02', concept: 'io', difficulty: 2, type: 'choice', kind: 'ANÁLISIS',
    prompt: '¿Qué papel cumple un *driver* (controlador de software)?',
    data: { options: [O('Traduce las órdenes genéricas del sistema operativo al «idioma» concreto del dispositivo.', 1), O('Da energía al dispositivo.', 0, 'La energía llega por cables y reguladores.'), O('Es un cable especial.', 0, 'Es software, no un cable.'), O('Acelera la CPU.', 0, 'Un driver no cambia la velocidad de la CPU.')] },
    explanation: 'Gracias a los drivers, el sistema operativo puede usar miles de dispositivos distintos con la misma interfaz.', hints: ['¿Cómo sabe el SO manejar una impresora concreta?', 'Piensa en un intérprete.', 'Descarto dos opciones.'] },
  { id: 'io03', concept: 'io', difficulty: 2, type: 'match', kind: 'ASOCIACIÓN',
    prompt: 'Cada dispositivo habla con la CPU a través de un controlador. Asócialos.',
    data: { pairs: [['Teclado', 'Controlador USB (HID)'], ['SSD', 'Controlador NVMe'], ['Monitor', 'Controlador de pantalla de la GPU'], ['Red', 'Controlador Ethernet / Wi-Fi'], ['Altavoces', 'Controlador de audio (códec)']] },
    explanation: 'Los controladores descargan trabajo de la CPU y adaptan protocolos físicos distintos.', hints: ['¿Por dónde se conecta cada dispositivo?', 'Mira la conexión resaltada.', 'Te uno la mitad.'], retryVariant: 'gen' },
  { id: 'io04', concept: 'io', difficulty: 4, type: 'choice', kind: 'ANÁLISIS',
    prompt: 'Hay que copiar un archivo enorme del SSD a la RAM sin que la CPU mueva cada byte. ¿Qué mecanismo lo permite?',
    data: { options: [O('DMA: un controlador transfiere directamente a memoria y avisa con una interrupción al terminar.', 1), O('Polling: la CPU copia byte a byte.', 0, 'Eso ocupa a la CPU todo el tiempo.'), O('Aumentar la caché L1.', 0, 'La caché no transfiere archivos.'), O('Usar el bus de control para los datos.', 0, 'Los datos van por el bus de datos.')] },
    explanation: 'El *DMA* (acceso directo a memoria) libera a la CPU: ella ordena la transferencia y sigue trabajando.', hints: ['¿Quién podría mover los datos en lugar de la CPU?', 'Directo... a memoria.', 'Descarto dos opciones.'] },
  { id: 'io05', concept: 'io', difficulty: 2, type: 'choice', kind: 'ANÁLISIS',
    prompt: 'Con *polling*, la CPU...',
    data: { options: [O('pregunta una y otra vez al dispositivo si tiene algo, aunque no haya nada.', 1), O('espera a que el dispositivo la interrumpa.', 0, 'Eso son las interrupciones.'), O('apaga el dispositivo.', 0, 'Polling es consultar, no apagar.'), O('copia datos sin intervenir.', 0, 'Eso es DMA.')] },
    explanation: 'Polling es simple pero desperdicia tiempo de CPU; las interrupciones avisan sólo cuando hace falta.', hints: ['«Poll» significa sondear o preguntar.', '¿Quién toma la iniciativa en el polling?', 'Descarto dos opciones.'] },
  { id: 'io06', concept: 'io', difficulty: 3, type: 'choice', kind: 'DIAGNÓSTICO',
    prompt: 'Misión «Driver incompatible»: conectas una impresora nueva. El sistema la detecta pero no imprime. En otro equipo funciona.',
    data: { options: [O('Falta el driver correcto: el sistema no sabe hablar con ese dispositivo.', 1), O('La impresora está rota.', 0, 'Funciona en otro equipo.'), O('Falta RAM.', 0, 'No hay síntomas de memoria.'), O('La CPU es incompatible con imprimir.', 0, 'Cualquier CPU puede enviar datos a una impresora con el driver adecuado.')] },
    explanation: 'Hardware sano + software de comunicación incorrecto = sistema que no funciona.', hints: ['¿Qué cambia entre un equipo y el otro?', 'Detectar no es lo mismo que saber hablar.', 'Descarto dos opciones.'] }
);

// ---------------------------------------------------------------- INTERRUPCIONES ----
addCh(
  { id: 'irq01', concept: 'interrupts', difficulty: 1, type: 'order', kind: 'ORDENAMIENTO',
    prompt: 'Ordena lo que ocurre cuando un dispositivo interrumpe a la CPU.',
    data: { items: ['Proceso en ejecución', 'Llega la interrupción', 'Guardar estado', 'Ejecutar la ISR', 'Restaurar estado', 'Continuar el proceso'] },
    explanation: 'Una interrupción es una pausa ordenada: se guarda el estado, se atiende, se restaura y se continúa como si nada.', hints: ['¿Qué hay que hacer antes de atender algo nuevo?', 'Los resaltados están fuera de lugar.', 'Te fijo los primeros.'] },
  { id: 'irq02', concept: 'interrupts', difficulty: 2, type: 'interrupts', kind: 'GESTIÓN',
    prompt: 'Opera la estación: atiende cada interrupción con la secuencia correcta sin perder el estado de EDITOR.',
    data: { events: [{ dev: 'TECLADO', p: 2, at: 1.0 }, { dev: 'DISCO', p: 1, at: 3.5 }] },
    explanation: 'Guardar → ISR → Restaurar → Continuar. Si te saltas el guardado, el proceso interrumpido pierde su estado.', hints: ['¿Qué pasaría si la ISR usa los registros de EDITOR?', 'El dispositivo más prioritario se resalta.', 'Resalto el siguiente paso correcto.'], retryVariant: 'gen' },
  { id: 'irq03', concept: 'interrupts', difficulty: 3, type: 'interrupts', kind: 'PRIORIDADES',
    prompt: 'Varias solicitudes llegan casi a la vez. Atiende siempre primero la de *mayor prioridad*.',
    data: { events: [{ dev: 'RATÓN', p: 3, at: 0.8 }, { dev: 'DISCO', p: 1, at: 1.0 }, { dev: 'TIMER', p: 2, at: 1.2 }, { dev: 'RED', p: 2, at: 7 }] },
    explanation: 'Las prioridades garantizan que lo urgente (disco, temporizador) no espere detrás de lo trivial (un movimiento de ratón).', hints: ['¿Qué dispositivo tiene prioridad ALTA?', 'El más prioritario se resalta.', 'Resalto el siguiente paso.'], retryVariant: 'gen' },
  { id: 'irq04', concept: 'interrupts', difficulty: 2, type: 'choice', kind: 'ANÁLISIS',
    prompt: '¿Por qué hay que guardar el estado antes de ejecutar la rutina de servicio (ISR)?',
    data: { options: [O('La ISR usará registros: sin guardarlos, el proceso interrumpido perdería sus datos.', 1), O('Para que la ISR vaya más rápido.', 0, 'Guardar cuesta tiempo; se hace por corrección, no por velocidad.'), O('Para apagar el dispositivo.', 0, 'No tiene relación.'), O('No hace falta guardar nada.', 0, 'Sin guardar, volver al proceso sería imposible.')] },
    explanation: 'La CPU sólo tiene un juego de registros por núcleo: compartirlos exige guardar y restaurar.', hints: ['¿Qué usa la ISR para trabajar?', 'Piensa en los registros compartidos.', 'Descarto dos opciones.'] },
  { id: 'irq05', concept: 'interrupts', difficulty: 3, type: 'sim', kind: 'SIMULACIÓN',
    prompt: 'Configura cómo atiende la CPU al teclado: la latencia debe ser *≤ 2 ms* y la CPU desperdiciada *≤ 10%*.',
    data: {
      params: [{ k: 'mode', n: 'MÉTODO', min: 0, max: 1, step: 1, v: 0, labels: ['POLLING', 'INTERRUPCIONES'] }, { k: 'rate', n: 'FRECUENCIA DE SONDEO', min: 10, max: 1000, step: 10, v: 100, unit: ' Hz' }],
      compute: p => p.mode === 1 ? { waste: 1, lat: 0.2 } : { waste: Math.min(100, p.rate * 0.08), lat: 1000 / p.rate / 2 },
      outputs: [{ k: 'waste', n: 'CPU DESPERDICIADA', unit: '%', min: 0, max: 100, goal: { op: '<=', v: 10 } }, { k: 'lat', n: 'LATENCIA', unit: ' ms', min: 0, max: 50, dec: 1, goal: { op: '<=', v: 2 } }],
      solution: { mode: 1 }, hlParams: ['mode'],
      why: (p, o) => p.mode === 0 ? 'Con polling, sondear más rápido reduce la latencia pero dispara la CPU desperdiciada; sondear menos hace lo contrario. No existe un valor que cumpla ambos objetivos.' : null
    },
    explanation: 'Las interrupciones ganan porque la CPU no pregunta: el dispositivo avisa sólo cuando hay algo. Optimizar un parámetro no basta si el método es el equivocado.', hints: ['¿Existe una frecuencia de sondeo que cumpla ambas metas?', 'Mira el parámetro resaltado.', 'Te coloco el método.'] },
  { id: 'irq06', concept: 'interrupts', difficulty: 3, type: 'choice', kind: 'DIAGNÓSTICO',
    prompt: 'Misión «Dispositivo fantasma»: un ratón averiado activa su IRQ miles de veces por segundo sin enviar datos.',
    data: { visual: 'meters', meters: [{ n: 'CPU EN ISR', v: 94 }, { n: 'IRQ/SEG', v: 100, unit: 'k', max: 100 }, { n: 'DATOS ÚTILES', v: 0 }], options: [O('Tormenta de interrupciones: la CPU pasa el tiempo atendiendo ISRs inútiles.', 1), O('El ratón es demasiado preciso.', 0, 'No hay datos: sólo solicitudes vacías.'), O('La CPU está en modo ahorro.', 0, 'Está al 94% en rutinas de servicio.'), O('Falta RAM.', 0, 'No hay síntomas de memoria.')] },
    hl: [0, 1], explanation: 'Las interrupciones son eficientes... salvo cuando llegan sin control. Los sistemas limitan o deshabilitan las fuentes defectuosas.', hints: ['¿En qué gasta la CPU su tiempo?', 'Mira los medidores resaltados.', 'Descarto dos opciones.'] },
  { id: 'irq07', concept: 'interrupts', difficulty: 2, type: 'choice', kind: 'DECISIÓN',
    prompt: 'Llegan a la vez la interrupción del *temporizador del sistema* (ALTA) y la del *teclado* (BAJA). ¿Qué hace la CPU?',
    data: { options: [O('Atiende primero el temporizador; el teclado espera un instante.', 1), O('Atiende primero el teclado porque el usuario es importante.', 0, 'Un instante de espera es imperceptible; el temporizador sostiene todo el sistema.'), O('Ignora las dos.', 0, 'Entonces las interrupciones no servirían.'), O('Las atiende a la vez en el mismo núcleo.', 0, 'Un núcleo ejecuta una ISR cada vez.')] },
    explanation: 'Priorizar no es ignorar: es decidir el orden para que el sistema completo funcione.', hints: ['¿Qué significa prioridad ALTA?', 'Un núcleo, una ISR a la vez.', 'Descarto dos opciones.'] }
);

// ---------------------------------------------------------------- RENDIMIENTO ----
addCh(
  { id: 'perf01', concept: 'performance', difficulty: 2, type: 'choice', kind: 'COMPARACIÓN',
    prompt: 'CPU A: *4 GHz, IPC 1*. CPU B: *3 GHz, IPC 2*. ¿Cuál ejecuta más instrucciones por segundo?',
    data: { options: [O('B: 3 × 2 = 6.000 millones frente a 4 × 1 = 4.000 millones.', 1), O('A, porque tiene más GHz.', 0, 'Los GHz sólo cuentan ciclos; importa cuántas instrucciones hace en cada ciclo.'), O('Son iguales.', 0, 'Multiplica frecuencia por IPC.'), O('No se puede saber.', 0, 'Con frecuencia e IPC se puede estimar.')] },
    explanation: 'Instrucciones por segundo ≈ frecuencia × IPC. La frecuencia sola engaña.', hints: ['¿Qué significa IPC?', 'Multiplica frecuencia por IPC.', 'Descarto dos opciones.'], misconception: 'Más GHz no significa siempre más rendimiento: la cantidad de trabajo por ciclo (IPC) importa igual.', retryVariant: 'gen' },
  { id: 'perf02', concept: 'performance', difficulty: 3, type: 'sim', kind: 'SIMULACIÓN',
    prompt: 'Overclock en el Laboratorio: consigue *≥ 5,5 GIPS* sin superar *80 °C* ni *95 W*, con el sistema *estable*. Subir un valor empeora otro.',
    data: {
      params: [{ k: 'f', n: 'FRECUENCIA', min: 2, max: 5, step: 0.25, v: 5, unit: ' GHz', dec: 2 }, { k: 'v', n: 'VOLTAJE', min: 0.9, max: 1.4, step: 0.05, v: 1.0, unit: ' V', dec: 2 }, { k: 'fan', n: 'VENTILADOR', min: 20, max: 100, step: 10, v: 30, unit: '%' }],
      compute: p => {
        const need = 0.8 + 0.1 * p.f, stable = p.v + 1e-6 >= need;
        const power = 20 + 12 * p.f * p.v * p.v;
        const temp = 30 + power * 0.6 - p.fan * 0.15;
        let gips = p.f * 1.5 * (stable ? 1 : 0.3);
        if (temp > 90) gips *= 0.6;
        return { gips, temp, power, stab: stable ? 100 : 40 };
      },
      outputs: [{ k: 'gips', n: 'RENDIMIENTO', unit: ' GIPS', min: 0, max: 8, dec: 2, goal: { op: '>=', v: 5.5 } }, { k: 'temp', n: 'TEMPERATURA', unit: ' °C', min: 30, max: 110, goal: { op: '<=', v: 80 } }, { k: 'power', n: 'CONSUMO', unit: ' W', min: 20, max: 150, goal: { op: '<=', v: 95 } }, { k: 'stab', n: 'ESTABILIDAD', unit: '%', min: 0, max: 100, goal: { op: '>=', v: 99 } }],
      solution: { f: 4, v: 1.2, fan: 70 }, hlParams: ['f', 'v'],
      why: (p, o) => o.stab < 99 ? 'El voltaje no alcanza para esa frecuencia: el sistema es inestable (cálculos erróneos, bloqueos).' : o.power > 95 ? 'Más frecuencia y voltaje disparan el consumo: la potencia crece con el cuadrado del voltaje.' : o.temp > 80 ? 'Demasiado calor: sube la ventilación o baja la potencia.' : 'Rendimiento insuficiente: necesitas más frecuencia (con el voltaje justo).'
    },
    explanation: 'Optimizar una métrica empeora otra: más frecuencia exige más voltaje, más voltaje dispara consumo y temperatura. La solución es un equilibrio, no un máximo.', hints: ['¿Qué voltaje necesita cada frecuencia para ser estable?', 'Mira los parámetros resaltados.', 'Te coloco un parámetro.'] },
  { id: 'perf03', concept: 'performance', difficulty: 2, type: 'choice', kind: 'ANÁLISIS',
    prompt: 'Un servidor completa *10.000 peticiones por segundo*, pero cada una tarda *2 segundos* en responderse. ¿Cómo se describe?',
    data: { options: [O('Alto throughput (rendimiento total) y alta latencia (espera por petición).', 1), O('Bajo throughput y baja latencia.', 0, '10.000 por segundo es mucho trabajo total.'), O('Throughput y latencia son lo mismo.', 0, 'Uno mide cantidad por tiempo; el otro, tiempo por unidad.'), O('Baja latencia porque atiende muchas.', 0, 'Cada petición espera 2 s: eso es alta latencia.')] },
    explanation: 'Throughput = cuánto trabajo por segundo. Latencia = cuánto espera cada trabajo. Se pueden mejorar por separado... y a veces uno a costa del otro.', hints: ['Separa «cuánto en total» de «cuánto cada uno».', 'Una autopista ancha puede tener atascos largos.', 'Descarto dos opciones.'], misconception: 'Latencia y throughput no son lo mismo: un sistema puede procesar muchísimo y aun así hacer esperar a cada petición.' },
  { id: 'perf04', concept: 'performance', difficulty: 2, type: 'choice', kind: 'DIAGNÓSTICO',
    prompt: 'Misión «Demasiado caliente»: el juego va fluido 5 minutos y luego cae de 60 a 35 FPS. Medidores:',
    data: { visual: 'meters', meters: [{ n: 'TEMP CPU', v: 98, unit: '°C', max: 110 }, { n: 'FRECUENCIA', v: 42, unit: '%' }, { n: 'VENTILADOR', v: 100 }], options: [O('Thermal throttling: la CPU baja su frecuencia para no sobrecalentarse.', 1), O('El juego tiene un error.', 0, 'El patrón (bien y luego mal, con 98 °C) apunta a temperatura.'), O('Falta RAM.', 0, 'La RAM no depende del tiempo de juego así.'), O('El monitor es lento.', 0, 'El monitor no cambia de rendimiento con el tiempo.')] },
    hl: [0, 1], explanation: 'La temperatura es una restricción de rendimiento: sin disipación suficiente, la CPU se protege reduciendo su velocidad.', hints: ['¿Qué cambia con el tiempo de uso?', 'Mira los medidores resaltados.', 'Descarto dos opciones.'] },
  { id: 'perf05', concept: 'performance', difficulty: 4, type: 'choice', kind: 'ANÁLISIS',
    prompt: 'Un benchmark de *un solo hilo* da el mismo resultado en una CPU de 4 núcleos y en otra de 16 (misma arquitectura y frecuencia). ¿Por qué?',
    data: { options: [O('Una tarea de un hilo sólo usa un núcleo: los demás no aportan.', 1), O('El benchmark está roto.', 0, 'Es exactamente lo esperado.'), O('Los 16 núcleos son más lentos.', 0, 'Misma arquitectura y frecuencia.'), O('La RAM limita a 4 núcleos.', 0, 'No es un límite de RAM.')] },
    explanation: 'Más núcleos sólo ayudan si el trabajo se puede dividir. El rendimiento depende de la tarea, no sólo del hardware.', hints: ['¿Cuántos núcleos puede usar un solo hilo?', 'Piensa en una única fila de trabajo.', 'Descarto dos opciones.'] },
  { id: 'perf06', concept: 'performance', difficulty: 3, type: 'choice', kind: 'ANÁLISIS',
    prompt: 'Una directiva exige: «*Reducir toda latencia evitable. No importa cómo.*» ¿Qué riesgo tiene optimizar sin límites una única métrica?',
    data: { options: [O('Puede disparar consumo y temperatura, y comprometer estabilidad y seguridad.', 1), O('Ninguno: menos latencia siempre es mejor.', 0, 'Cada mejora tiene un coste en otra parte del sistema.'), O('Sólo que el equipo haga más ruido.', 0, 'El ruido es el menor de los problemas.'), O('Que la latencia aumente.', 0, 'El riesgo está en las OTRAS métricas.')] },
    explanation: 'Los sistemas reales equilibran objetivos: rendimiento, seguridad, integridad, continuidad. Maximizar uno suele romper otro.', hints: ['¿Qué otras métricas existen además de la latencia?', 'Piensa en el laboratorio de overclock.', 'Descarto dos opciones.'] }
);

// ---------------------------------------------------------------- PARALELISMO ----
addCh(
  { id: 'par01', concept: 'parallelism', difficulty: 3, type: 'sim', kind: 'SIMULACIÓN',
    prompt: 'El 75% de la tarea es paralelizable. Consigue una aceleración de *al menos 2,5×* sin superar *70 unidades de energía* (10 por núcleo).',
    data: {
      params: [{ k: 'n', n: 'NÚCLEOS', min: 1, max: 16, step: 1, v: 1 }],
      compute: p => ({ sp: 1 / (0.25 + 0.75 / p.n), en: p.n * 10 }),
      outputs: [{ k: 'sp', n: 'ACELERACIÓN', unit: '×', min: 1, max: 4, dec: 2, goal: { op: '>=', v: 2.5 } }, { k: 'en', n: 'ENERGÍA', unit: '', min: 0, max: 160, goal: { op: '<=', v: 70 } }],
      solution: { n: 6 }, hlParams: ['n']
    },
    explanation: 'Ley de Amdahl: la parte secuencial (25%) limita la aceleración máxima a 4×. Cada núcleo extra aporta menos que el anterior.', hints: ['¿Crece la aceleración igual con cada núcleo?', 'Prueba 4, 6 y 8 núcleos.', 'Te coloco un valor.'], retryVariant: 'gen' },
  { id: 'par02', concept: 'parallelism', difficulty: 2, type: 'classify', kind: 'CLASIFICACIÓN',
    prompt: '¿Se puede repartir entre varios núcleos (*PARALELO*) o cada paso depende del anterior (*SECUENCIAL*)?',
    data: { bins: ['PARALELO', 'SECUENCIAL'], items: [{ t: 'Aplicar un filtro a cada píxel', b: 0 }, { t: 'Cada paso usa el resultado anterior', b: 1 }, { t: 'Renderizar fotogramas independientes', b: 0 }, { t: 'Sumar dos listas elemento a elemento', b: 0 }, { t: 'Una cadena de instrucciones dependientes', b: 1 }, { t: 'Atender a usuarios distintos', b: 0 }, { t: 'Leer un flujo comprimido en orden', b: 1 }] },
    explanation: 'La clave del paralelismo es la *independencia*: tareas que no esperan resultados de otras.', hints: ['¿Una parte necesita el resultado de otra?', 'Los resaltados están mal clasificados.', 'Te coloco algunos.'], retryVariant: 'gen' },
  { id: 'par03', concept: 'parallelism', difficulty: 3, type: 'choice', kind: 'DIAGNÓSTICO',
    prompt: 'Misión «Proceso hambriento»: el planificador siempre elige procesos de alta prioridad, y uno de baja prioridad nunca llega a ejecutarse.',
    data: { options: [O('Inanición (starvation): hay que envejecer su prioridad o repartir turnos.', 1), O('Deadlock: dos procesos se esperan mutuamente.', 0, 'Aquí nadie espera a nadie: uno simplemente nunca recibe turno.'), O('Thermal throttling.', 0, 'No es un problema de temperatura.'), O('Cache miss.', 0, 'No es un problema de memoria.')] },
    explanation: 'Un buen planificador equilibra prioridad y justicia. Priorizar sin límites deja partes del sistema abandonadas.', hints: ['¿Qué le pasa al proceso de baja prioridad?', 'Piensa en «hambre».', 'Descarto dos opciones.'] },
  { id: 'par04', concept: 'parallelism', difficulty: 2, type: 'choice', kind: 'ANÁLISIS',
    prompt: '¿Por qué una GPU es tan buena procesando gráficos?',
    data: { options: [O('Tiene miles de núcleos simples que aplican la misma operación a muchos datos a la vez.', 1), O('Tiene más GHz que cualquier CPU.', 0, 'Suele tener menos frecuencia que una CPU.'), O('Porque guarda los gráficos en el SSD.', 0, 'No tiene relación.'), O('Porque tiene un único núcleo muy potente.', 0, 'Es justo lo contrario.')] },
    explanation: 'Los gráficos son trabajo masivamente paralelo (millones de píxeles independientes). La GPU apuesta por cantidad; la CPU, por versatilidad.', hints: ['¿Cuántos píxeles tiene una pantalla?', 'Piensa en muchos trabajadores sencillos.', 'Descarto dos opciones.'] },
  { id: 'par05', concept: 'parallelism', difficulty: 3, type: 'choice', kind: 'DIAGNÓSTICO',
    prompt: 'El hilo A tiene el recurso 1 y espera el 2. El hilo B tiene el 2 y espera el 1. ¿Qué ocurre?',
    data: { options: [O('Interbloqueo (deadlock): espera circular, ninguno avanza.', 1), O('Inanición: uno nunca recibe turno.', 0, 'Aquí ambos tienen turno, pero se bloquean mutuamente.'), O('Condición de carrera.', 0, 'Una carrera produce resultados erróneos, no un bloqueo permanente.'), O('Nada: el sistema lo resuelve solo.', 0, 'Sin intervención, esperan para siempre.')] },
    explanation: 'Deadlock = espera circular. Se evita pidiendo los recursos siempre en el mismo orden o interrumpiendo a uno de ellos.', hints: ['¿Puede alguno avanzar?', 'Dibuja las flechas de espera.', 'Descarto dos opciones.'] },
  { id: 'par06', concept: 'parallelism', difficulty: 4, type: 'choice', kind: 'CÁLCULO',
    prompt: 'Una tarea es *90%* paralelizable. ¿Cuál es la aceleración máxima teórica con infinitos núcleos?',
    data: { options: [O('10×, porque el 10% secuencial nunca se acelera.', 1), O('Infinita.', 0, 'La parte secuencial pone un techo.'), O('90×.', 0, 'Confunde porcentaje con aceleración.'), O('9×.', 0, 'El límite es 1 / 0,10.')] },
    explanation: 'Amdahl: aceleración máxima = 1 / fracción secuencial.', hints: ['¿Qué parte nunca se acelera?', 'Máximo = 1 / (parte secuencial).', 'Descarto dos opciones.'], retryVariant: 'gen' }
);

// ---------------------------------------------------------------- CUELLOS DE BOTELLA ----
addCh(
  { id: 'bn01', concept: 'bottlenecks', difficulty: 2, type: 'choice', kind: 'DIAGNÓSTICO',
    prompt: 'El sistema va lento. No preguntes qué componente es «mejor»: mira las cargas y encuentra el cuello de botella.',
    data: { visual: 'meters', meters: [{ n: 'CPU', v: 25 }, { n: 'RAM', v: 98 }, { n: 'SSD', v: 100 }, { n: 'GPU', v: 20 }], options: [O('RAM insuficiente: el sistema pagina al SSD y todo espera.', 1), O('La CPU es demasiado lenta.', 0, 'Está al 25%: espera datos.'), O('La GPU limita.', 0, 'Está al 20%.'), O('Hay que cambiar el monitor.', 0, 'No aparece en el problema.')] },
    hl: [1, 2], explanation: 'El cuello de botella es el componente que hace esperar a los demás. Aquí la RAM llena obliga al SSD a trabajar como memoria.', hints: ['¿Qué componentes están saturados y cuáles esperan?', 'Mira los medidores resaltados.', 'Descarto dos opciones.'], retryVariant: 'gen' },
  { id: 'bn02', concept: 'bottlenecks', difficulty: 2, type: 'choice', kind: 'DIAGNÓSTICO',
    prompt: 'Un videojuego va a 40 FPS. Estas son las cargas:',
    data: { visual: 'meters', meters: [{ n: 'CPU', v: 45 }, { n: 'GPU', v: 100 }, { n: 'RAM', v: 40 }, { n: 'VRAM', v: 60 }], options: [O('La GPU limita: es el cuello de botella gráfico.', 1), O('La CPU limita.', 0, 'Está al 45%: podría hacer más.'), O('Falta RAM.', 0, 'Está al 40%.'), O('El SSD limita.', 0, 'Ni siquiera aparece saturado.')] },
    hl: [1], explanation: 'Un componente al 100% mientras los demás esperan es la señal clásica de cuello de botella.', hints: ['¿Cuál está al 100%?', 'Mira el medidor resaltado.', 'Descarto dos opciones.'], retryVariant: 'gen' },
  { id: 'bn03', concept: 'bottlenecks', difficulty: 3, type: 'choice', kind: 'DIAGNÓSTICO',
    prompt: 'La CPU marca sólo 26% de uso total, pero el programa va lento. Mira los núcleos:',
    data: { visual: 'meters', meters: [{ n: 'NÚCLEO 1', v: 100 }, { n: 'NÚCLEO 2', v: 4 }, { n: 'NÚCLEO 3', v: 3 }, { n: 'NÚCLEO 4', v: 5 }, { n: 'RAM', v: 35 }, { n: 'GPU', v: 10 }], options: [O('Programa de un solo hilo: un núcleo saturado aunque el total parezca bajo.', 1), O('La CPU está ociosa: el problema es la GPU.', 0, 'Un núcleo está al 100%.'), O('Falta RAM.', 0, 'Está al 35%.'), O('Los núcleos 2 a 4 están averiados.', 0, 'Simplemente no tienen trabajo.')] },
    hl: [0], explanation: 'Los promedios esconden detalles: un 26% total puede ser un núcleo al 100% y tres parados.', hints: ['¿El uso está repartido?', 'Mira el medidor resaltado.', 'Descarto dos opciones.'] },
  { id: 'bn04', concept: 'bottlenecks', difficulty: 3, type: 'choice', kind: 'DIAGNÓSTICO',
    prompt: 'Una descarga de actualizaciones va lentísima. Cargas:',
    data: { visual: 'meters', meters: [{ n: 'CPU', v: 8 }, { n: 'RAM', v: 30 }, { n: 'SSD', v: 3 }, { n: 'RED', v: 100 }], options: [O('La conexión de red es el límite.', 1), O('El SSD es lento.', 0, 'Está al 3%: espera datos.'), O('La CPU limita.', 0, 'Al 8%.'), O('Falta RAM.', 0, 'Al 30%.')] },
    hl: [3], explanation: 'El cuello de botella puede estar fuera de la caja: la red también es parte del sistema.', hints: ['¿Qué recurso usa una descarga?', 'Mira el medidor resaltado.', 'Descarto dos opciones.'] },
  { id: 'bn05', concept: 'bottlenecks', difficulty: 3, type: 'choice', kind: 'DIAGNÓSTICO',
    prompt: 'Misión «Ventilador detenido». La CPU está al 100% pero rinde como la mitad. Medidores:',
    data: { visual: 'meters', meters: [{ n: 'CPU', v: 100 }, { n: 'FRECUENCIA', v: 30 }, { n: 'TEMPERATURA', v: 99, unit: '°C', max: 110 }, { n: 'VENTILADOR', v: 0, unit: ' rpm', col: '#FF5964' }], options: [O('Ventilador detenido: la CPU se sobrecalienta y reduce su frecuencia.', 1), O('La CPU es defectuosa.', 0, 'Se está protegiendo del calor.'), O('Falta RAM.', 0, 'No aparece en los medidores.'), O('El programa es de un solo hilo.', 0, 'El dato clave es la frecuencia baja con temperatura extrema.')] },
    hl: [2, 3], explanation: 'Un fallo pequeño (un ventilador) puede degradar todo el sistema. Diagnosticar es seguir la cadena de causas.', hints: ['¿Por qué bajaría la frecuencia?', 'Mira los medidores resaltados.', 'Descarto dos opciones.'] },
  { id: 'bn06', concept: 'bottlenecks', difficulty: 2, type: 'choice', kind: 'PREDICCIÓN',
    prompt: 'En su juego, la CPU de un amigo va al 100% y la GPU al 40%. Se compra una GPU el doble de potente. ¿Qué pasará?',
    data: { options: [O('Casi no mejorará: el cuello de botella era la CPU.', 1), O('Irá el doble de rápido.', 0, 'La GPU ya esperaba a la CPU.'), O('Irá más lento.', 0, 'No empeora; simplemente no mejora.'), O('La CPU bajará al 50%.', 0, 'La CPU seguirá saturada.')] },
    explanation: 'Mejorar lo que no limita no acelera el sistema. Primero diagnostica, luego invierte.', hints: ['¿Quién hace esperar a quién?', 'Compara 100% con 40%.', 'Descarto dos opciones.'] },
  { id: 'bn07', concept: 'bottlenecks', difficulty: 4, type: 'choice', kind: 'DIAGNÓSTICO',
    prompt: 'Un servidor de base de datos responde lento. Cargas:',
    data: { visual: 'meters', meters: [{ n: 'CPU', v: 30 }, { n: 'RAM', v: 55 }, { n: 'SSD', v: 100 }, { n: 'COLA DE DISCO', v: 95 }, { n: 'LECTURAS ALEATORIAS', v: 90 }], options: [O('El almacenamiento: demasiadas lecturas aleatorias. Ayuda más RAM como caché o un SSD más rápido.', 1), O('La CPU: hay que duplicar núcleos.', 0, 'Al 30% espera al disco.'), O('La red.', 0, 'No aparece saturada.'), O('La GPU.', 0, 'No participa.')] },
    hl: [2, 3, 4], explanation: 'Aquí la RAM libre podría servir como caché de disco: un componente puede aliviar el cuello de botella de otro.', hints: ['¿Dónde se forma la cola?', 'Mira los medidores resaltados.', 'Descarto dos opciones.'] }
);

// =============================================================================
// GENERADORES PARAMÉTRICOS (variantes nuevas: nunca repiten texto exacto)
// =============================================================================
const rb = n => { let s = ''; for (let i = 0; i < n; i++) s += Math.random() < 0.5 ? '0' : '1'; return s; };
function numOptions(correct, distractors, fmt = x => x) {
  const set = new Set([correct]);
  const opts = [O(fmt(correct), 1)];
  for (const d of distractors) if (!set.has(d) && opts.length < 4) { set.add(d); opts.push(O(fmt(d), 0)); }
  return opts;
}
const GEN = {
  alu: [
    diff => {
      const w = diff >= 4 ? 8 : 4;
      const op = pick(diff >= 3 ? ['ADD', 'SUB', 'XOR', 'AND', 'OR'] : ['ADD', 'AND', 'OR', 'NOT']);
      let a = rb(w), b = rb(w);
      if (op === 'SUB' && parseInt(a, 2) < parseInt(b, 2)) { const t = a; a = b; b = t; }
      const names = { ADD: 'la suma', SUB: 'la resta (complemento a dos)', XOR: 'el XOR', AND: 'el AND', OR: 'el OR', NOT: 'el NOT' };
      return { type: 'bits', difficulty: op === 'SUB' ? 4 : diff, kind: 'ARITMÉTICA BINARIA', prompt: 'La ALU recibe *' + a + '*' + (op === 'NOT' ? '' : ' y *' + b + '*') + '. Calcula ' + names[op] + ' en ' + w + ' bits.',
        data: { op, a, b }, explanation: op === 'ADD' ? 'Suma columna a columna con acarreo: 1+1 = 10 (escribes 0, llevas 1).' : op === 'SUB' ? 'Restar es sumar el complemento a dos y descartar el acarreo final.' : 'Las operaciones lógicas actúan bit a bit, columna por columna.',
        hints: ['Trabaja de derecha a izquierda, columna por columna.', 'Mira las columnas marcadas.', 'Te completo la mitad derecha.'] };
    },
    diff => {
      const gates = ['AND', 'OR', 'XOR', 'NAND', 'NOR'];
      const gt = pick(diff <= 1 ? ['AND', 'OR'] : gates);
      const targets = TT2.map(([a, b]) => gateEval(gt, a, b));
      const opts = shuffle(gates.filter(x => x !== gt)).slice(0, 3).concat([gt]);
      return { type: 'logic', difficulty: Math.min(diff, 3), kind: 'TABLA DE VERDAD', prompt: 'Identifica la compuerta de esta tabla de verdad (salida objetivo: ' + targets.join(', ') + ').',
        data: { inputs: [{ n: 'A', v: 0 }, { n: 'B', v: 0 }], gates: [{ id: 'g0', edit: true, opts: shuffle(opts), in: ['A', 'B'], col: 0, row: 0.5 }], out: 'g0', table: TT2, targets, solution: { g0: gt } },
        explanation: 'AND: todas en 1. OR: al menos una. XOR: distintas. NAND y NOR: las inversas de AND y OR.', hints: ['Mira la fila (1,1) y la fila (0,0).', 'Compara con las tablas que conoces.', 'Te coloco la compuerta.'] };
    },
    diff => {
      const a = rb(7);
      return { type: 'bits', difficulty: 2, kind: 'PARIDAD', prompt: 'Un paquete trae el dato *' + a + '*. Calcula su bit de paridad PAR.', data: { op: 'PARITY', a },
        explanation: 'El bit de paridad hace que el total de unos sea par. Si un bit se corrompe, la paridad lo delata.', hints: ['Cuenta los unos.', 'Par + 0 = par; impar + 1 = par.', 'Te completo el bit.'] };
    }
  ],
  hardwareBasics: [
    diff => {
      const pool = [['Teclado', 0], ['Procesador', 0], ['Ratón', 0], ['Tarjeta gráfica', 0], ['Placa base', 0], ['Fuente de alimentación', 0], ['Hoja de cálculo', 1], ['Antivirus', 1], ['Compilador', 1], ['Reproductor de música', 1], ['Sistema operativo', 1], ['Driver de red', 1], ['Módulo de RAM', 0], ['Aplicación de chat', 1]];
      const items = shuffle(pool).slice(0, 7).map(([t, b]) => ({ t, b }));
      if (!items.some(i => i.b === 0)) items[0] = { t: 'Monitor', b: 0 };
      if (!items.some(i => i.b === 1)) items[1] = { t: 'Editor de texto', b: 1 };
      return { type: 'classify', difficulty: 1, kind: 'CLASIFICACIÓN', prompt: 'Nuevo lote del inventario: ¿*HARDWARE* o *SOFTWARE*?', data: { bins: ['HARDWARE', 'SOFTWARE'], items },
        explanation: 'Hardware = físico. Software = instrucciones y datos que el hardware ejecuta.', hints: ['¿Se puede tocar?', 'Los resaltados están mal.', 'Te coloco algunos.'] };
    },
    diff => {
      const pool = [['Escáner', 0], ['Cámara web', 0], ['Joystick', 0], ['CPU', 1], ['GPU (cálculo)', 1], ['RAM', 2], ['SSD', 2], ['Memoria USB', 2], ['Impresora', 3], ['Proyector', 3], ['Auriculares', 3], ['Micrófono', 0]];
      const items = shuffle(pool).slice(0, 7).map(([t, b]) => ({ t, b }));
      return { type: 'classify', difficulty: 2, kind: 'CLASIFICACIÓN', prompt: 'Asigna cada componente a su etapa del flujo.', data: { bins: ['ENTRADA', 'PROCESO', 'MEMORIA', 'SALIDA'], items },
        explanation: 'Entrada captura, proceso transforma, memoria conserva, salida entrega.', hints: ['Sigue el camino de un dato.', 'Los resaltados están mal.', 'Te coloco algunos.'] };
    }
  ],
  motherboard: [
    diff => {
      const pool = [['CPU', 'Ejecuta instrucciones'], ['RAM', 'Memoria de trabajo volátil'], ['GPU', 'Procesa gráficos en paralelo'], ['SSD', 'Almacenamiento persistente'], ['VRM', 'Regula el voltaje de la CPU'], ['Chipset', 'Coordina periféricos'], ['BIOS/UEFI', 'Firmware de arranque'], ['Pila CMOS', 'Mantiene la hora y la configuración'], ['PCIe', 'Ranura de expansión de alta velocidad']];
      return { type: 'match', difficulty: 1, kind: 'ASOCIACIÓN', prompt: 'Asocia cada elemento de la placa base con su función.', data: { pairs: shuffle(pool).slice(0, 5) },
        explanation: 'La placa base conecta, alimenta y coordina a todos los componentes.', hints: ['¿Quién alimenta, quién guarda, quién calcula?', 'Mira la conexión resaltada.', 'Te uno la mitad.'] };
    },
    diff => {
      const pool = [['CPU', 'Socket'], ['RAM', 'Ranura DIMM'], ['GPU', 'PCIe x16'], ['SSD NVMe', 'Ranura M.2'], ['Fuente', 'Conector ATX 24 pines'], ['Disco SATA', 'Puerto SATA'], ['Ventilador', 'Conector FAN'], ['Tarjeta Wi-Fi', 'PCIe x1']];
      return { type: 'match', difficulty: 2, kind: 'CONSTRUCCIÓN', prompt: 'Otra placa por montar: une cada componente con su conector.', data: { pairs: shuffle(pool).slice(0, 5) },
        explanation: 'Cada conector define forma, energía y ancho de banda de la comunicación.', hints: ['Piensa en la forma de cada pieza.', 'Mira la conexión resaltada.', 'Te uno la mitad.'] };
    }
  ],
  cpu: [
    diff => {
      const f = pick([2, 2.5, 3, 3.5, 4, 5]), ms = pick([1, 2, 5, 10]);
      const total = Math.round(f * 1e9 * ms / 1000);
      return { type: 'choice', difficulty: 2, kind: 'CÁLCULO', prompt: 'Una CPU a *' + String(f).replace('.', ',') + ' GHz*, ¿cuántos ciclos completa en *' + ms + ' ms*?',
        data: { options: numOptions(total, [total / 1000, total * 1000, total / 10], cyc) },
        explanation: 'Ciclos = frecuencia × tiempo. 1 GHz = 10^9 ciclos/s; 1 ms = 10^-3 s.', hints: ['Convierte GHz a ciclos por segundo.', 'Multiplica por el tiempo en segundos.', 'Descarto opciones.'] };
    },
    diff => {
      const pool = [['Unidad de Control', 'Coordina y decodifica'], ['ALU', 'Calcula (aritmética y lógica)'], ['Registros', 'Datos inmediatos'], ['Reloj', 'Sincroniza los pasos'], ['Caché L1', 'Copia rapidísima de datos'], ['Contador de Programa', 'Próxima instrucción'], ['Decodificador', 'Traduce el opcode']];
      return { type: 'match', difficulty: 1, kind: 'ASOCIACIÓN', prompt: 'Asocia cada parte del núcleo con su función.', data: { pairs: shuffle(pool).slice(0, 5) },
        explanation: 'La CPU funciona porque sus partes cooperan en cada ciclo.', hints: ['¿Quién dirige y quién ejecuta?', 'Mira la conexión resaltada.', 'Te uno la mitad.'] };
    }
  ],
  fetchDecodeExecute: [
    diff => {
      const table = [['0001', 'LOAD', 'Memoria'], ['0010', 'ADD', 'ALU'], ['0011', 'STORE', 'Memoria'], ['0100', 'JUMP', 'Unidad de Control'], ['0101', 'SUB', 'ALU'], ['0110', 'AND', 'ALU']];
      const row = pick(table);
      const r1 = randi(1, 7), r2 = randi(1, 7);
      const bin = n => n.toString(2).padStart(4, '0');
      const desc = { LOAD: 'LOAD: leer memoria hacia R' + r1 + '.', ADD: 'ADD: la ALU sumará R' + r1 + ' y R' + r2 + '.', STORE: 'STORE: escribir R' + r1 + ' en memoria.', JUMP: 'JUMP: el PC cambiará de valor.', SUB: 'SUB: la ALU restará R' + r2 + ' a R' + r1 + '.', AND: 'AND: la ALU hará un AND bit a bit.' };
      const others = shuffle(table.filter(t => t !== row)).slice(0, 3);
      return { type: 'choice', difficulty: 2, kind: 'DECODIFICACIÓN', prompt: 'Decodifica *' + row[0] + ' ' + bin(r1) + ' ' + bin(r2) + '* (OPCODE | REG A | REG B).',
        data: { visual: 'table', table: { cols: ['OPCODE', 'INSTRUCCIÓN', 'UNIDAD'], rows: table }, options: [O(desc[row[1]], 1)].concat(others.map(o => O(desc[o[1]], 0, o[1] + ' tiene el opcode ' + o[0] + '.'))) },
        hl: [table.indexOf(row)], explanation: 'Los primeros bits (opcode) eligen la operación; los siguientes, los registros.', hints: ['Mira sólo el opcode.', 'Busca la fila resaltada.', 'Descarto opciones.'] };
    },
    diff => ({ type: 'order', difficulty: 2, kind: 'ORDENAMIENTO', prompt: 'Una instrucción STORE R3, [0x20] recorre el ciclo. Ordena las etapas.',
      data: { items: ['FETCH: traer STORE de memoria', 'DECODE: identificar STORE, R3 y 0x20', 'EXECUTE: preparar la escritura en 0x20', 'WRITE BACK: el valor de R3 queda en memoria'] },
      explanation: 'Todas las instrucciones pasan por el mismo ciclo, aunque cada etapa haga cosas distintas.', hints: ['Primero hay que traer la instrucción.', 'Los resaltados están fuera de lugar.', 'Te fijo los primeros.'] })
  ],
  registers: [
    diff => {
      const pool = [['PC', 'Dirección de la próxima instrucción'], ['IR', 'Instrucción actual'], ['MAR', 'Dirección de memoria en uso'], ['MDR', 'Dato hacia/desde memoria'], ['ACC', 'Resultado de la ALU'], ['SP', 'Cima de la pila'], ['FLAGS', 'Banderas Z, N, C, V']];
      return { type: 'match', difficulty: 2, kind: 'ASOCIACIÓN', prompt: 'Asocia cada registro con lo que guarda.', data: { pairs: shuffle(pool).slice(0, 5) },
        explanation: 'Los registros especiales sostienen el funcionamiento del ciclo de instrucción.', hints: ['Address = dirección, Data = dato.', 'Mira la conexión resaltada.', 'Te uno la mitad.'] };
    }
  ],
  cache: [
    diff => {
      const found = randi(1, 4), addr = '0x' + randi(4096, 65535).toString(16).toUpperCase();
      const total = MEM_LEVELS.slice(0, found + 1).reduce((s, l) => s + l.lat, 0);
      return { type: 'memsim', difficulty: 2, kind: 'PREDICCIÓN', prompt: 'Solicitud *' + addr + '*. Recorre la jerarquía hasta encontrarla.',
        data: { addr, found, q: '¿Cuántos ciclos costó el acceso completo?', options: numOptions(total, [MEM_LEVELS[found].lat, total * 2, total + 200, Math.max(1, total - MEM_LEVELS[found].lat)], cyc) },
        hl: [found], explanation: 'Cada nivel consultado añade su latencia; el total es la suma hasta el nivel del acierto.', hints: ['Suma las latencias de todos los niveles consultados.', 'Mira el nivel resaltado.', 'Descarto opciones.'] };
    },
    diff => {
      const ht = pick([1, 2, 4]), mr = pick([2, 5, 10, 20]), pen = pick([100, 200]);
      const amat = ht + mr / 100 * pen;
      return { type: 'choice', difficulty: 4, kind: 'CÁLCULO', prompt: 'Caché con tiempo de acierto *' + ht + ' ciclos*, tasa de fallos *' + mr + '%* y penalización de *' + pen + ' ciclos*. ¿AMAT?',
        data: { options: numOptions(amat, [ht + mr, pen * mr / 100, ht * pen / 10, amat + pen / 10], n => String(Math.round(n * 10) / 10).replace('.', ',') + ' ciclos') },
        explanation: 'AMAT = tiempo de acierto + tasa de fallos × penalización.', hints: ['Convierte el porcentaje a fracción.', 'Multiplica fallos por penalización y suma el acierto.', 'Descarto opciones.'] };
    }
  ],
  ram: [
    diff => {
      const sc = pick([
        ['los fotogramas de un vídeo que se está editando ahora mismo (4 GB)', 2, 'Datos grandes de trabajo temporal: RAM.'],
        ['las fotos de las vacaciones para conservarlas años', 3, 'Persistencia a largo plazo: SSD.'],
        ['el contador del bucle que la ALU usa en cada instrucción', 0, 'Uso inmediato y constante: registro.'],
        ['la configuración del usuario para el próximo arranque', 3, 'Debe sobrevivir al apagado: SSD.'],
        ['una tabla de 512 MB que un programa consulta durante la sesión', 2, 'Grande y temporal: RAM.']
      ]);
      const names = ['Registro', 'Caché L1', 'RAM', 'SSD'];
      return { type: 'choice', difficulty: 2, kind: 'DECISIÓN', prompt: 'Misión de almacenamiento: guardar ' + sc[0] + '. ¿Dónde?',
        data: { visual: 'table', table: MEMTABLE, options: names.map((n, i) => O(n, i === sc[1], i === sc[1] ? sc[2] : 'Revisa capacidad, persistencia y latencia de ' + n + '.')) },
        hl: [sc[1]], explanation: 'Elegir memoria es equilibrar capacidad, persistencia y latencia. ' + sc[2], hints: ['¿Necesita sobrevivir al apagado? ¿Cuánto ocupa?', 'Mira la fila resaltada.', 'Descarto dos opciones.'] };
    },
    diff => {
      const pool = [['RAM', 0], ['Caché L3', 0], ['Registros', 0], ['VRAM de la GPU', 0], ['SSD', 1], ['HDD', 1], ['Tarjeta SD', 1], ['Memoria flash del firmware', 1], ['Disco óptico', 1]];
      return { type: 'classify', difficulty: 1, kind: 'CLASIFICACIÓN', prompt: '¿VOLÁTIL o NO VOLÁTIL?', data: { bins: ['VOLÁTIL', 'NO VOLÁTIL'], items: shuffle(pool).slice(0, 6).map(([t, b]) => ({ t, b })) },
        explanation: 'Volátil = se borra sin energía.', hints: ['¿Qué pasa al desenchufar?', 'Los resaltados están mal.', 'Te coloco algunos.'] };
    }
  ],
  storage: [
    diff => {
      const order = ['Registros', 'Caché L1', 'Caché L2', 'Caché L3', 'RAM', 'SSD', 'HDD'];
      const start = randi(0, 2), items = order.slice(start, start + 5);
      return { type: 'order', difficulty: 2, kind: 'ORDENAMIENTO', prompt: 'Ordena del más rápido al más lento.', data: { items },
        explanation: 'Más cerca de la CPU = más rápido y más pequeño.', hints: ['¿Cuál está más cerca de la ALU?', 'Los resaltados están fuera de lugar.', 'Te fijo los primeros.'] };
    }
  ],
  buses: [
    diff => {
      const data = ['DATO: ' + randi(0, 255), 'DATO: ' + rb(4), 'DATO: "' + pick(['A', 'K', 'Q', 'x']) + '"', 'DATO: -' + randi(1, 99), 'DATO: 0x' + randi(1, 255).toString(16).toUpperCase()];
      const addr = () => '0x' + randi(256, 65535).toString(16).toUpperCase().padStart(4, '0');
      const ctrl = ['LEER', 'ESCRIBIR', 'RELOJ', 'IRQ ' + randi(1, 9), 'RESET', 'ACK'];
      const n = diff >= 3 ? 8 : 6;
      const packets = [];
      for (let i = 0; i < n; i++) { const k = i % 3; packets.push({ t: k === 0 ? pick(data) : k === 1 ? addr() : pick(ctrl), k }); }
      return { type: 'route', difficulty: Math.min(3, diff), kind: 'ENRUTAMIENTO', prompt: 'Nuevo tráfico en la autopista. Enruta cada paquete a su bus.', data: { packets, timed: diff >= 3 ? 5 : 0, level: diff <= 1 ? 1 : 2 },
        explanation: 'Dato = qué; dirección = dónde; control = cuándo/cómo.', hints: ['¿Valor, lugar u orden?', 'Aparece una leyenda.', 'Marco los próximos carriles.'] };
    },
    diff => {
      const n = pick([8, 10, 12, 16, 20, 24]);
      const v = Math.pow(2, n);
      return { type: 'choice', difficulty: 3, kind: 'CÁLCULO', prompt: '¿Cuántas posiciones puede direccionar un bus de direcciones de *' + n + ' bits*?',
        data: { options: numOptions(v, [n, v / 2, n * n, v * 2], x => x.toLocaleString('es')) },
        explanation: 'n bits → 2^n combinaciones.', hints: ['Cada bit duplica las posiciones.', '2 elevado al número de bits.', 'Descarto opciones.'] };
    },
    diff => {
      const w = pick([8, 16, 32, 64]), f = pick([50, 100, 200, 400]);
      const mb = w / 8 * f;
      return { type: 'choice', difficulty: 4, kind: 'CÁLCULO', prompt: 'Bus de *' + w + ' bits* a *' + f + ' MHz*, una transferencia por ciclo. ¿Ancho de banda?',
        data: { options: numOptions(mb, [w * f, f, mb * 2], x => x.toLocaleString('es') + ' MB/s') },
        explanation: 'Ancho de banda = bytes por transferencia × transferencias por segundo.', hints: ['Pasa bits a bytes.', 'Multiplica por la frecuencia.', 'Descarto opciones.'] };
    }
  ],
  io: [
    diff => {
      const pool = [['Teclado', 0], ['Escáner', 0], ['Cámara web', 0], ['Monitor', 1], ['Impresora', 1], ['Altavoz', 1], ['Pantalla táctil', 2], ['Tarjeta de red', 2], ['Unidad USB', 2], ['Auriculares con micrófono', 2]];
      return { type: 'classify', difficulty: 1, kind: 'CLASIFICACIÓN', prompt: 'Clasifica los dispositivos del distrito.', data: { bins: ['ENTRADA', 'SALIDA', 'AMBAS'], items: shuffle(pool).slice(0, 7).map(([t, b]) => ({ t, b })) },
        explanation: 'La dirección del flujo de datos define el tipo de dispositivo.', hints: ['¿Los datos entran, salen o ambas?', 'Los resaltados están mal.', 'Te coloco algunos.'] };
    }
  ],
  interrupts: [
    diff => {
      const devs = shuffle(['TECLADO', 'RATÓN', 'DISCO', 'RED', 'TIMER', 'AUDIO']).slice(0, diff >= 3 ? 4 : 3);
      const events = devs.map((d, i) => ({ dev: d, p: randi(1, 3), at: 0.8 + i * (diff >= 3 ? 0.3 : 2.2) }));
      return { type: 'interrupts', difficulty: Math.min(3, diff), kind: 'GESTIÓN', prompt: 'Nueva ronda de solicitudes en la estación de E/S. Atiende por prioridad y con la secuencia correcta.', data: { events },
        explanation: 'Prioridad primero; luego guardar, ISR, restaurar, continuar.', hints: ['¿Cuál es la más prioritaria?', 'El más prioritario se resalta.', 'Resalto el siguiente paso.'] };
    }
  ],
  performance: [
    diff => {
      const fa = pick([3, 3.5, 4, 4.5, 5]), ia = pick([1, 1.5, 2]), fb = pick([2.5, 3, 3.5, 4]), ib = pick([1.5, 2, 2.5, 3]);
      const pa = fa * ia, pb = fb * ib;
      if (Math.abs(pa - pb) < 0.01) return GEN.performance[0](diff);
      const s = x => String(x).replace('.', ',');
      const win = pa > pb ? 'A' : 'B';
      return { type: 'choice', difficulty: 2, kind: 'COMPARACIÓN', prompt: 'CPU A: *' + s(fa) + ' GHz, IPC ' + s(ia) + '*. CPU B: *' + s(fb) + ' GHz, IPC ' + s(ib) + '*. ¿Cuál ejecuta más instrucciones por segundo?',
        data: { options: [O('A (' + s(pa) + ' mil millones/s)', win === 'A'), O('B (' + s(pb) + ' mil millones/s)', win === 'B'), O('La de más GHz, siempre.', 0, 'La frecuencia sola no basta: hay que multiplicar por el IPC.'), O('Son iguales.', 0, 'Multiplica y compara.')] },
        explanation: 'Instrucciones/s ≈ frecuencia × IPC.', hints: ['Multiplica GHz por IPC para cada una.', 'Compara los productos.', 'Descarto opciones.'] };
    }
  ],
  parallelism: [
    diff => {
      const p = pick([0.5, 0.6, 0.75, 0.8, 0.9, 0.95]), n = pick([2, 4, 8, 16]);
      const sp = 1 / ((1 - p) + p / n);
      const f = x => String(Math.round(x * 100) / 100).replace('.', ',') + '×';
      return { type: 'choice', difficulty: 3, kind: 'CÁLCULO', prompt: 'Tarea ' + Math.round(p * 100) + '% paralelizable ejecutada en *' + n + ' núcleos*. ¿Aceleración según Amdahl?',
        data: { options: numOptions(Math.round(sp * 100) / 100, [n, Math.round(p * n * 100) / 100, Math.round(1 / (1 - p) * 100) / 100, Math.round((sp + 1) * 100) / 100], f) },
        explanation: 'Aceleración = 1 / ((1 − p) + p / n). La parte secuencial limita el beneficio.', hints: ['Identifica la parte secuencial (1 − p).', 'Divide sólo la parte paralela entre los núcleos.', 'Descarto opciones.'] };
    }
  ],
  bottlenecks: [
    diff => {
      const cases = [
        { m: [['CPU', 99], ['GPU', 35], ['RAM', 40], ['SSD', 5]], ok: 'La CPU está saturada: es el cuello de botella.', hl: [0] },
        { m: [['CPU', 30], ['GPU', 100], ['RAM', 45], ['SSD', 3]], ok: 'La GPU está saturada: limita el rendimiento gráfico.', hl: [1] },
        { m: [['CPU', 20], ['GPU', 10], ['RAM', 97], ['SSD', 95]], ok: 'Falta RAM: el sistema pagina al SSD.', hl: [2, 3] },
        { m: [['CPU', 12], ['GPU', 5], ['RAM', 35], ['RED', 100]], ok: 'La red limita la tarea.', hl: [3] }
      ];
      const c = pick(cases);
      const wrongs = shuffle(cases.filter(x => x !== c)).slice(0, 3).map(x => O(x.ok, 0, 'Los medidores no muestran esa saturación.'));
      return { type: 'choice', difficulty: 2, kind: 'DIAGNÓSTICO', prompt: 'Diagnóstico rápido: ¿dónde está el cuello de botella?',
        data: { visual: 'meters', meters: c.m.map(([n, v]) => ({ n, v: clamp(v + randi(-3, 0), 0, 100) })), options: [O(c.ok, 1)].concat(wrongs) },
        hl: c.hl, explanation: 'El cuello de botella es el recurso saturado mientras los demás esperan.', hints: ['¿Qué está al máximo?', 'Mira los medidores resaltados.', 'Descarto opciones.'] };
    }
  ]
};
QM.register(CH);
for (const k in GEN) GEN[k].forEach(fn => QM.registerGen(k, fn));
