// Array global para almacenar y eliminar los puntos resaltados
let highlightedPoints = [];
// Variable global para almacenar la curva
let curve;
// Referencia al tablero JXG.JSXGraph
let brd;
// Puntos de control para acceso global en la validación
let glider1, glider2, p5, p6;

// Global array for pre-calculated curve points, sorted by X
let sampledCurvePoints = [];
const MUESTRAS_VALIDACION = 10000; // Número de muestras para la validación de la curva

// Función para obtener una coordenada aleatoria dentro de un rango
function getRandomCoord(min, max) {
    return Math.random() * (max - min) + min;
}

// Función para pre-calcular los puntos de la curva para búsquedas rápidas
// Movida al ámbito global
const populateSampledCurvePoints = () => {
    sampledCurvePoints = []; // Limpia datos anteriores
    for (let i = 0; i <= MUESTRAS_VALIDACION; i++) {
        const t = i / MUESTRAS_VALIDACION;
        const xVal = curve.X(t);
        const yVal = curve.Y(t);
        if (typeof xVal === 'number' && typeof yVal === 'number' && !isNaN(xVal) && !isNaN(yVal)) {
            sampledCurvePoints.push({ x: xVal, y: yVal });
        } else {
            console.warn("Coordenada inválida encontrada durante el muestreo:", xVal, yVal, "en t =", t);
        }
    }
    // Ordenar por X para permitir búsqueda binaria eficiente
    sampledCurvePoints.sort((a, b) => a.x - b.x);
};

// Función para generar y aplicar posiciones iniciales aleatorias
// Asegúrate de que esta función se defina antes de ser llamada en DOMContentLoaded
function setRandomInitialPositions() {
    const randomGlider1Y = getRandomCoord(-4, 4);
    const randomGlider2Y = getRandomCoord(-4, 4);
    const randomP5X = getRandomCoord(-2.5, -0.5);
    const randomP5Y = getRandomCoord(-4, 4);
    const randomP6X = getRandomCoord(0.5, 2.5);
    const randomP6Y = getRandomCoord(-4, 4);

    // Mover los puntos a las nuevas posiciones aleatorias
    glider1.moveTo([-3, randomGlider1Y]);
    glider2.moveTo([3, randomGlider2Y]);
    p5.moveTo([randomP5X, randomP5Y]);
    p6.moveTo([randomP6X, randomP6Y]);

    // Limpiar cualquier punto resaltado de una validación anterior
    highlightedPoints.forEach(point => brd.removeObject(point));
    highlightedPoints = [];

    // Asegurarse de que la curva se actualice después de mover los puntos
    brd.update();
    populateSampledCurvePoints(); // Vuelve a popular los puntos muestreados
}


// Asegura que el DOM esté completamente cargado antes de inicializar JXG.JSXGraph
document.addEventListener('DOMContentLoaded', function () {
    try {
        // Configuración del renderizador JXG.JSXGraph
        JXG.Options.renderer = "canvas";

        // Inicialización del tablero JXG.JSXGraph
        brd = JXG.JSXGraph.initBoard('jxgbox', {
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
        var p1_line_left = brd.create('point', [-3, 2], { name: 'A', visible: false });
        var p2_line_left = brd.create('point', [-3, 4], { name: 'B', visible: false });
        var p3_line_right = brd.create('point', [3, 2], { name: 'C', visible: false });
        var p4_line_right = brd.create('point', [3, 4], { name: 'D', visible: false });

        // Creación de líneas verticales invisibles para restringir los "gliders"
        var l1_left_guide = brd.create('line', [p1_line_left, p2_line_left], { visible: false });
        var l2_right_guide = brd.create('line', [p3_line_right, p4_line_right], { visible: false });

        // Creación de los "gliders" (puntos que se deslizan sobre una línea)
        // Se inicializan con valores temporales, se moverán a posiciones aleatorias después.
        glider1 = brd.create('glider', [-3, 0, l1_left_guide], { name: 'G', size: 4, color: 'turquoise', fixed: false });
        glider2 = brd.create('glider', [3, 0, l2_right_guide], { name: 'H', size: 4, color: 'orange', fixed: false }); // Diferente color para distinguirlo

        // Creación de puntos de control internos (puntos P y Q)
        p5 = brd.create('point', [0, 0], { name: 'P', trace: false, size: 3, color: 'green', face: '[]', fixed: false });
        p6 = brd.create('point', [0, 0], { name: 'Q', trace: false, size: 3, color: 'green', face: '[]', fixed: false });

        // Añade los puntos al arreglo 'p' en el orden correcto para la curva de Bezier
        p.push(glider1);
        p.push(p5);
        p.push(p6);
        p.push(glider2);

        // Corrige automáticamente los valores Y de los puntos de control
        // para que permanezcan dentro del rango [-4, 4]
        const checkBounds = () => {
            [glider1, glider2, p5, p6].forEach(pt => {
                let y = pt.Y();
                if (y > 4) {
                    pt.moveTo([pt.X(), 4]);
                } else if (y < -4) {
                    pt.moveTo([pt.X(), -4]);
                }
            });
        };

        // Creación de la curva de Bezier
        curve = brd.create('curve', JXG.Math.Numerics.bezier(p), {
            strokeColor: 'blue',
            strokeOpacity: 0.8, // Un poco más opaca
            strokeWidth: 3, // Ligeramente más gruesa para mejor visibilidad
            needsRegularUpdate: true // Asegura que la curva se actualice al mover los puntos
        });

        // Función para encontrar el valor Y de la curva para un X dado utilizando búsqueda binaria
        const getYAtSpecificX = (targetX, samples, tolerance = 0.005) => { // Tolerancia ajustada para búsqueda
            let low = 0;
            let high = samples.length - 1;
            let closestY = null;
            let minDiff = Infinity;

            while (low <= high) {
                let mid = Math.floor((low + high) / 2);
                let currentX = samples[mid].x;

                if (Math.abs(currentX - targetX) < tolerance) {
                    return samples[mid].y; // Encontrado un X suficientemente cercano
                }

                if (currentX < targetX) {
                    low = mid + 1;
                } else {
                    high = mid - 1;
                }

                // Mantener un registro del punto más cercano encontrado hasta ahora
                if (Math.abs(currentX - targetX) < minDiff) {
                    minDiff = Math.abs(currentX - targetX);
                    closestY = samples[mid].y;
                }
            }
            // Si no se encuentra una coincidencia exacta dentro de la tolerancia,
            // devolver Y del punto más cercano si está razonablemente cerca.
            return (minDiff < tolerance * 5) ? closestY : null;
        };

        // Evento global para monitorear cualquier actualización en el tablero.
        brd.on('update', () => {
            checkBounds(); // Mantiene los puntos de control dentro de los límites
            populateSampledCurvePoints(); // Vuelve a popular los puntos muestreados en cada actualización
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
         * Función principal para validar si la curva es una función y, si lo es,
         * si es una función impar.
         */
        window.validarCurva = function () {
            console.log("Validación de curva: Iniciando...");
            const toleranciaFuncion = 0.01; // Tolerancia estricta para la prueba de la función
            const toleranciaImparidad = 0.2; // Tolerancia para la imparidad (redondeo a 1 decimal) - AUMENTADA

            // Limpia elementos de validación anteriores (puntos amarillos)
            highlightedPoints.forEach(point => brd.removeObject(point));
            highlightedPoints = [];

            // --- 1. Validar si es una función (Prueba de la línea vertical) ---
            const xToYValuesMap = {};
            let nonFunctionPoints = null;

            for (let i = 0; i <= MUESTRAS_VALIDACION; i++) {
                const t = i / MUESTRAS_VALIDACION;
                const xActual = curve.X(t);
                const yActual = curve.Y(t);
                // Usar un redondeo de 3 decimales para la lógica de validación de función
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

                    if (Math.abs(minPoint.y - maxPoint.y) > toleranciaFuncion) {
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

            // --- 2. Validar si es una función impar (simetría de la curva) ---
            let isOddFunction = true;
            let problematicPairs = []; // Almacena todos los pares (x, y) y (-x, y') de la curva que fallan

            // Iterar a través de los puntos muestreados para verificar la imparidad
            for (let i = 0; i < sampledCurvePoints.length; i++) {
                const point = sampledCurvePoints[i];
                const xTest = point.x;
                const yPositive = point.y; // Esto es f(xTest)

                // Evitar el punto central x=0 para la comparación f(x) = -f(-x)
                if (Math.abs(xTest) < 0.001) {
                    // Para x=0, f(0) debe ser 0 para una función impar.
                    if (Math.abs(yPositive) > toleranciaImparidad) {
                        isOddFunction = false;
                        problematicPairs.push([
                            { x: xTest, y: yPositive },
                            { x: -xTest, y: -yPositive } // El punto que debería existir
                        ]);
                        // No romper aquí para poder seleccionar un punto aleatorio
                    }
                    continue;
                }

                const yNegativeOfNegativeX = getYAtSpecificX(-xTest, sampledCurvePoints, 0.05); // Buscar f(-xTest)

                // Si se encontró f(-xTest) y f(x) no es igual a -f(-x) (dentro de la tolerancia)
                if (yNegativeOfNegativeX !== null && Math.abs(yPositive - (-yNegativeOfNegativeX)) > toleranciaImparidad) {
                    isOddFunction = false;
                    problematicPairs.push([
                        { x: xTest, y: yPositive },
                        { x: -xTest, y: yNegativeOfNegativeX }
                    ]);
                }
            }

            // Mostrar el resultado de la validación de función impar
            if (isOddFunction) {
                swal({
                    title: "¡Éxito!",
                    text: "La curva representa una función impar.",
                    icon: "success",
                    button: "Entendido",
                });
            } else {
                // Seleccionar un par de puntos problemáticos aleatoriamente
                let selectedProblemPair = [];
                if (problematicPairs.length > 0) {
                    const randomIndex = Math.floor(Math.random() * problematicPairs.length);
                    selectedProblemPair = problematicPairs[randomIndex];
                } else {
                    // Fallback si por alguna razón no se encontraron pares (debería ser raro)
                    selectedProblemPair = [{ x: 0, y: 0 }, { x: 0, y: 0 }];
                }

                highlightProblemPoints(selectedProblemPair); // Resalta los puntos de la curva
                let mensajeError = `La curva es una función, pero no es impar.`;
                if (selectedProblemPair.length === 2) {
                    mensajeError += `\nSe encontró al menos un par de puntos en la gráfica que no cumplen la simetría:`;
                    mensajeError += `\n(${selectedProblemPair[0].x.toFixed(1)}, ${selectedProblemPair[0].y.toFixed(1)}) y `;
                    mensajeError += `(${selectedProblemPair[1].x.toFixed(1)}, ${selectedProblemPair[1].y.toFixed(1)})`;
                    mensajeError += `\nRecuerda que para ser impar, si tienes un punto (x, y), también debes tener un punto (-x, -y).`;
                } else {
                    mensajeError += `\nNo se pudo encontrar un par de puntos exactos en la gráfica para demostrar la no imparidad con la tolerancia actual. Intenta ajustar la curva.`;
                }

                swal({
                    title: "¡No es Función Impar!",
                    text: mensajeError,
                    icon: "error",
                    button: "Entendido",
                });
            }
        };

        // Función para reinicializar el escenario
        window.resetScenario = setRandomInitialPositions; // Ahora llama a la función que genera y aplica posiciones aleatorias

        // Reanuda las actualizaciones del tablero
        brd.unsuspendUpdate();

        // Asocia las funciones a los botones
        document.getElementById('validateButton').onclick = window.validarCurva;
        document.getElementById('resetButton').onclick = window.resetScenario;

        // Inicializa los puntos muestreados al cargar la página con posiciones aleatorias
        setRandomInitialPositions();

    } catch (e) {
        console.error("Error durante la inicialización de JXG.JSXGraph:", e);
        swal({
            title: "Error al cargar la gráfica",
            text: "Hubo un problema al inicializar el escenario. Por favor, inténtalo de nuevo. Detalles: " + e.message,
            icon: "error",
            button: "Entendido",
        });
    }
});