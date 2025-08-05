// Array global para almacenar y eliminar los puntos resaltados
let highlightedPoints = [];

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
        grid: true // Añadir una cuadrícula para mejor visualización
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
                size: 4,
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
            const xActual = c.X(t);
            const yActual = c.Y(t);
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
            const xActual = c.X(t);
            const yActual = c.Y(t);

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

    // Reanuda las actualizaciones del tablero
    brd.unsuspendUpdate();

    // Crea el botón de validación y lo añade al cuerpo del documento
    const validationButton = document.createElement('button');
    validationButton.textContent = 'Validar';
    validationButton.onclick = window.validarCurva;
    document.body.appendChild(validationButton);
});
