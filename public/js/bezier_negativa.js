// Array global para almacenar y eliminar los puntos resaltados
let highlightedPoints = [];
// Array global para almacenar las líneas que pintan los intervalos negativos
let negativeIntervalLines = [];
// Nuevo array global para almacenar los puntos amarillos de las raíces
let rootPoints = [];

// Asegura que el DOM esté completamente cargado antes de inicializar JXG.JSXGraph
document.addEventListener('DOMContentLoaded', function () {
    // Configuración del renderizador JXG.JSXGraph
    JXG.Options.renderer = "canvas";

    // Inicialización del tablero JXG.JSXGraph
    var brd = JXG.JSXGraph.initBoard('jxgbox', {
        // Bounding box simétrico para centrar los ejes
        boundingbox: [-5, 5, 5, -5], // [left, top, right, bottom]
        keepaspectratio: true,
        axis: true,
        grid: true, // Añadir una cuadrícula para mejor visualización
        showinfobox: false // Deshabilita el infobox con las coordenadas del mouse
    });

    // Arreglo para almacenar los puntos de control de la curva de Bezier
    var p = [];

    // Suspende las actualizaciones del tablero para una inicialización más fluida
    brd.suspendUpdate();

    // Creación de puntos fijos para las líneas verticales (visibles=false)
    var p1 = brd.create('point', [-3, 2], { name: 'A', visible: false });
    var p2 = brd.create('point', [-3, 4], { name: 'B', visible: false });
    var p3 = brd.create('point', [3, 2], { name: 'C', visible: false });
    var p4 = brd.create('point', [3, 4], { name: 'D', visible: false });

    // Creación de líneas verticales invisibles para restringir los "gliders"
    var l1 = brd.create('line', [p1, p2], { visible: false });
    var l2 = brd.create('line', [p3, p4], { visible: false });

    // Creación de los "gliders" (puntos que se deslizan sobre una línea)
    // Estos son los puntos de control externos de la curva de Bezier
    var glider1 = brd.create('glider', [-3, 1.3, l1], { name: 'G', size: 4, color: 'turquoise', fixed: false });
    var glider2 = brd.create('glider', [3, 0.5, l2], { name: 'H', size: 4, color: 'orange', fixed: false }); // Diferente color para distinguirlo

    // Creación de puntos de control internos (puntos P y Q)
    var p5 = brd.create('point', [-1.5, 2.5], { name: 'P', trace: false, size: 3, color: 'green', face: '[]', fixed: false });
    var p6 = brd.create('point', [0.75, 2.5], { name: 'Q', trace: false, size: 3, color: 'green', face: '[]', fixed: false });

    // Añade los puntos al arreglo 'p' en el orden correcto para la curva de Bezier
    p.push(glider1);
    p.push(p5);
    p.push(p6);
    p.push(glider2);

    // Corrige automáticamente los valores Y de los puntos de control
    // para que permanezcan dentro del rango [-4, 4]
    brd.on('update', () => {
        [glider1, glider2, p5, p6].forEach(pt => {
            let y = pt.Y();
            if (y > 4) {
                pt.moveTo([pt.X(), 4]);
            } else if (y < -4) {
                pt.moveTo([pt.X(), -4]);
            }
        });
    });

    // Creación de la curva de Bezier
    var c = brd.create('curve', JXG.Math.Numerics.bezier(p), {
        strokeColor: 'blue',
        strokeOpacity: 0.8, // Un poco más opaca
        strokeWidth: 3, // Ligeramente más gruesa para mejor visibilidad
        needsRegularUpdate: true // Asegura que la curva se actualice al mover los puntos
    });

    /**
     * Resalta los puntos problemáticos en el gráfico.
     * @param {Array<Object>} points - Un array de objetos {x, y} de los puntos a resaltar.
     */
    const highlightProblemPoints = (points) => {
        // Eliminar puntos resaltados de la ejecución anterior
        highlightedPoints.forEach(point => brd.removeObject(point));
        highlightedPoints = [];

        points.forEach(pt => {
            const newPoint = brd.create('point', [pt.x, pt.y], {
                name: '', // No mostrar nombre
                color: 'yellow',
                size: 6,
                face: 'o',
                fixed: true, // No permitir arrastrar
                highlight: false // No resaltar al pasar el mouse
            });
            highlightedPoints.push(newPoint);
        });
        brd.update(); // Forzar la actualización del tablero para mostrar los puntos
    };

    /**
     * Dibuja los intervalos donde la función es negativa en el eje X.
     * @param {Array<Object>} intervals - Array de objetos { start, end } de los intervalos.
     */
    const drawNegativeIntervals = (intervals) => {
        // Eliminar las líneas de intervalos negativos anteriores si existen
        negativeIntervalLines.forEach(line => brd.removeObject(line));
        negativeIntervalLines = [];

        // Si hay intervalos, dibujar los segmentos de línea verdes sobre el eje X
        if (intervals.length > 0) {
            intervals.forEach(interval => {
                const start = interval.start;
                const end = interval.end;

                // Se crean los segmentos solo si los valores de inicio y fin son números válidos
                if (typeof start === 'number' && typeof end === 'number') {
                    const segment = brd.create('segment', [[start, 0], [end, 0]], {
                        strokeColor: 'green',
                        strokeWidth: 5,
                        highlight: false,
                        fixed: true
                    });
                    negativeIntervalLines.push(segment);
                }
            });
        }
        brd.update();
    };

    /**
     * Dibuja los puntos (raíces) donde la función cruza el eje X.
     * @param {Array<number>} roots - Array de valores X de las raíces.
     */
    const drawRootPoints = (roots) => {
        // Eliminar los puntos de raíces anteriores
        rootPoints.forEach(point => brd.removeObject(point));
        rootPoints = [];

        roots.forEach(x => {
            const newPoint = brd.create('point', [x, 0], {
                name: '',
                color: 'yellow',
                size: 5,
                face: 'o',
                fixed: true,
                highlight: false
            });
            rootPoints.push(newPoint);
        });
        brd.update();
    };

    /**
     * Función principal para validar la curva y encontrar sus intervalos negativos.
     */
    window.validarCurva = function () {
        console.log("Validación de curva: Iniciando...");
        const muestrasT = 10000;
        const tolerancia = 0.01;

        // Eliminar puntos resaltados, líneas de intervalos y puntos de raíces anteriores
        highlightedPoints.forEach(point => brd.removeObject(point));
        highlightedPoints = [];
        negativeIntervalLines.forEach(line => brd.removeObject(line));
        negativeIntervalLines = [];
        rootPoints.forEach(point => brd.removeObject(point));
        rootPoints = [];

        // --- 1. Validar si es una función (Prueba de la línea vertical) ---
        const xToYValuesMap = {};
        let nonFunctionPoints = null;

        for (let i = 0; i <= muestrasT; i++) {
            const t = i / muestrasT;
            const xActual = c.X(t);
            const yActual = c.Y(t);
            // Corrección: Usar un redondeo de 3 decimales para la lógica de validación
            // y evitar el conflicto del redondeo a 1 decimal
            const xRedondeada = xActual.toFixed(3);

            if (!xToYValuesMap[xRedondeada]) {
                xToYValuesMap[xRedondeada] = [];
            }
            xToYValuesMap[xRedondeada].push({ x: xActual, y: yActual });
        }

        for (const x in xToYValuesMap) {
            if (xToYValuesMap[x].length > 1) {
                const points = xToYValuesMap[x];
                const minPoint = points.reduce((prev, curr) => (prev.y < curr.y ? prev : curr));
                const maxPoint = points.reduce((prev, curr) => (prev.y > curr.y ? prev : curr));

                if (Math.abs(minPoint.y - maxPoint.y) > tolerancia) {
                    nonFunctionPoints = { first: minPoint, second: maxPoint };
                    break;
                }
            }
        }

        if (nonFunctionPoints) {
            highlightProblemPoints([nonFunctionPoints.first, nonFunctionPoints.second]);
            const mensajeError = `La curva no representa una función. Se encontraron al menos dos puntos diferentes con la misma coordenada X:
                    \nPunto 1: (${nonFunctionPoints.first.x.toFixed(1)}, ${nonFunctionPoints.first.y.toFixed(1)})
                    \nPunto 2: (${nonFunctionPoints.second.x.toFixed(1)}, ${nonFunctionPoints.second.y.toFixed(1)})`;

            swal({
                title: "¡No es una Función!",
                text: mensajeError,
                icon: "error",
                button: "Entendido",
            });
            return;
        }

        // --- 2. Encontrar y pintar intervalos negativos y mostrar alerta ---
        const negativeIntervals = [];
        const roots = []; // Nuevo array para guardar las raíces
        let currentIntervalStart = null;

        const startX = c.X(0);
        let lastY = c.Y(0);

        // Si la función es negativa al inicio, el intervalo comienza en el borde del dominio
        if (lastY < 0) {
            currentIntervalStart = startX;
        }

        for (let i = 1; i <= muestrasT; i++) {
            const t = i / muestrasT;
            const x = c.X(t);
            const y = c.Y(t);
            const prevX = c.X((i - 1) / muestrasT);

            if (y < 0 && lastY >= 0) { // Cruce de arriba hacia abajo
                const zeroCrossingX = prevX - (lastY / (y - lastY)) * (x - prevX);
                currentIntervalStart = zeroCrossingX;
                roots.push(zeroCrossingX); // Guarda la raíz
            } else if (y >= 0 && lastY < 0 && currentIntervalStart !== null) { // Cruce de abajo hacia arriba
                const zeroCrossingX = prevX - (lastY / (y - lastY)) * (x - prevX);
                negativeIntervals.push({ start: currentIntervalStart, end: zeroCrossingX });
                roots.push(zeroCrossingX); // Guarda la raíz
                currentIntervalStart = null;
            }
            lastY = y;
        }

        // Manejar el caso en que la función es negativa al final del dominio
        if (currentIntervalStart !== null) {
            const finalX = c.X(1);
            negativeIntervals.push({ start: currentIntervalStart, end: finalX });
        }

        // Dibuja los intervalos negativos y los puntos de las raíces en el gráfico
        drawNegativeIntervals(negativeIntervals);
        drawRootPoints(roots);

        // Construye el mensaje de alerta para los intervalos negativos
        let negativeMessage = "La curva representa una función.";
        if (negativeIntervals.length > 0) {
            const formattedIntervals = negativeIntervals.map(interval =>
                // REDONDEO A UNA SOLA CIFRA DECIMAL EN EL MENSAJE
                `(${interval.start.toFixed(1)}, ${interval.end.toFixed(1)})`
            ).join(" unión ");
            negativeMessage = `La curva es una función y es negativa en: ${formattedIntervals}`;
        } else {
            negativeMessage = `La curva representa una función y nunca es negativa en el intervalo $[-3, 3]$.`;
        }

        swal({
            title: "¡Éxito!",
            text: negativeMessage,
            icon: "success",
            button: "Entendido",
        });
    };

    // Reanuda las actualizaciones del tablero
    brd.unsuspendUpdate();

    // Crea el botón de validación y lo añade al cuerpo del documento
    const validationButton = document.createElement('button');
    validationButton.textContent = 'Validar';
    validationButton.onclick = window.validarCurva;
    document.body.appendChild(validationButton);
});