// Array global para almacenar y eliminar los puntos resaltados
let highlightedPoints = [];
// Variable global para almacenar la curva
let curve;
// Referencia al tablero JXG.JSXGraph
let brd;
// Puntos de control para acceso global en la validación
let glider1, glider2, p5, p6;

// Función para obtener una coordenada aleatoria dentro de un rango
function getRandomCoord(min, max) {
    return Math.random() * (max - min) + min;
}

// Función para generar y aplicar posiciones iniciales aleatorias
function setRandomInitialPositions() {
    // Generar posiciones aleatorias para los gliders
    const randomGlider1Y = getRandomCoord(-4, 4);
    const randomGlider2Y = getRandomCoord(-4, 4);

    // Generar posiciones aleatorias para los puntos de control P y Q
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
        curve = brd.create('curve', JXG.Math.Numerics.bezier(p), {
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
                    size: 3,
                    strokeWidth: 3,
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
         * si es inyectiva.
         */
        window.validarCurva = function () {
            console.log("Validación de curva: Iniciando...");
            const muestrasT = 10000;
            const tolerancia = 0.01;

            // Eliminar puntos resaltados de la ejecución anterior
            highlightedPoints.forEach(point => brd.removeObject(point));
            highlightedPoints = [];

            // --- 1. Validar si es una función (Prueba de la línea vertical) ---
            const xToYValuesMap = {};
            let nonFunctionPoints = null;

            for (let i = 0; i <= muestrasT; i++) {
                const t = i / muestrasT;
                const xActual = curve.X(t);
                const yActual = curve.Y(t);
                const xRedondeada = xActual.toFixed(3);

                if (!xToYValuesMap[xRedondeada]) {
                    xToYValuesMap[xRedondeada] = [];
                }
                xToYValuesMap[xRedondeada].push({ x: xActual, y: yActual });
            }

            // Buscar el primer conjunto de puntos que fallan la prueba de la línea vertical
            for (const x in xToYValuesMap) {
                if (xToYValuesMap[x].length > 1) {
                    const points = xToYValuesMap[x];
                    // Encontrar los puntos con el y-mínimo y y-máximo
                    const minPoint = points.reduce((prev, curr) => (prev.y < curr.y ? prev : curr));
                    const maxPoint = points.reduce((prev, curr) => (prev.y > curr.y ? prev : curr));

                    // Verificar que los puntos son realmente distintos
                    if (Math.abs(minPoint.y - maxPoint.y) > tolerancia) {
                        nonFunctionPoints = { first: minPoint, second: maxPoint };
                        break;
                    }
                }
            }

            // Si no es una función, muestra la alerta y resalta los puntos
            if (nonFunctionPoints) {
                highlightProblemPoints([nonFunctionPoints.first, nonFunctionPoints.second]);
                const mensajeError = `La curva no representa una función. Se encontraron al menos dos puntos diferentes con la misma coordenada X:
                                \nPunto 1: (${nonFunctionPoints.first.x.toFixed(2)}, ${nonFunctionPoints.first.y.toFixed(2)})
                                \nPunto 2: (${nonFunctionPoints.second.x.toFixed(2)}, ${nonFunctionPoints.second.y.toFixed(2)})`;

                swal({
                    title: "¡No es una Función!",
                    text: mensajeError,
                    icon: "error",
                    button: "Entendido",
                });
                return; // Importante: salir de la función
            }

            // --- 2. Validar si es inyectiva (Prueba de la línea horizontal) ---
            // Se ejecuta solo si la curva es una función
            const yToXValuesMap = {};
            let nonInjectivePoints = null;

            for (let i = 0; i <= muestrasT; i++) {
                const t = i / muestrasT;
                const xActual = curve.X(t);
                const yActual = curve.Y(t);

                const yRedondeada = yActual.toFixed(3);

                if (!yToXValuesMap[yRedondeada]) {
                    yToXValuesMap[yRedondeada] = [];
                }
                yToXValuesMap[yRedondeada].push({ x: xActual, y: yActual });
            }

            // Buscar el primer conjunto de puntos que fallan la prueba de la línea horizontal
            for (const y in yToXValuesMap) {
                if (yToXValuesMap[y].length > 1) {
                    const points = yToXValuesMap[y];
                    // Encontrar los puntos con el x-mínimo y x-máximo
                    const minPoint = points.reduce((prev, curr) => (prev.x < curr.x ? prev : curr));
                    const maxPoint = points.reduce((prev, curr) => (prev.x > curr.x ? prev : curr));

                    // Verificar que los puntos son realmente distintos
                    if (Math.abs(minPoint.x - maxPoint.x) > tolerancia) {
                        nonInjectivePoints = { first: minPoint, second: maxPoint };
                        break;
                    }
                }
            }

            // Mostrar el resultado de la validación de inyectividad
            if (nonInjectivePoints) {
                highlightProblemPoints([nonInjectivePoints.first, nonInjectivePoints.second]);
                const mensajeError = `La curva no es inyectiva. Se encontró al menos un par de puntos diferentes con la misma coordenada Y:
                                \nPunto 1: (${nonInjectivePoints.first.x.toFixed(2)}, ${nonInjectivePoints.first.y.toFixed(2)})
                                \nPunto 2: (${nonInjectivePoints.second.x.toFixed(2)}, ${nonInjectivePoints.second.y.toFixed(2)})`;

                swal({
                    title: "¡No Inyectiva!",
                    text: mensajeError,
                    icon: "error",
                    button: "Entendido",
                });
            } else {
                swal({
                    title: "¡Éxito!",
                    text: "La curva representa una función inyectiva.",
                    icon: "success",
                    button: "Entendido",
                });
            }
        };

        // Asocia las funciones a los botones
        document.getElementById('validateButton').onclick = window.validarCurva;
        document.getElementById('resetButton').onclick = setRandomInitialPositions;

        // Reanuda las actualizaciones del tablero y establece la posición inicial aleatoria
        brd.unsuspendUpdate();
        setRandomInitialPositions(); // Establecer la posición inicial aleatoria al cargar
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

const toggleButton = document.querySelector('.hint-toggle');
  const hintsList = document.querySelector('.hints');

  toggleButton.addEventListener('click', () => {
    hintsList.classList.toggle('visible');
    const isVisible = hintsList.classList.contains('visible');
    toggleButton.setAttribute('aria-expanded', isVisible);
  });