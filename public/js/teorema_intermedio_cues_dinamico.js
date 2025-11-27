// Variables del juego
let lives = 3;
let score = 0;

// Variable para el estado del cuestionario
let currentQuestionIndex = 0;
let selectedOption = null;

// Array global para almacenar y eliminar los puntos resaltados
let highlightedPoints = [];
let highlightedPoints2 = [];
// Variable global para almacenar la curva
let curve;
let curve2;
// Referencia al tablero JXG.JSXGraph
let brd;
// Puntos de control para acceso global en la validación
let glider1, glider2, glider3, glider4, glider5, glider6, glider7, p5, p6, p7, p8;;

// Función para obtener una coordenada aleatoria dentro de un rango
function getRandomCoord(min, max) {
    return Math.random() * (max - min) + min;
}

// Función para generar y aplicar posiciones iniciales aleatorias
function setRandomInitialPositions() {
    document.getElementById('validateButton').disabled = false;
    let esInyectiva = true;
    let intentos = 0;

    do {
        intentos++;

        // Generar posiciones aleatorias para los gliders
        const randomGlider1Y = getRandomCoord(-4, 4);
        const randomGlider2Y = getRandomCoord(-4, 4);

        const randomGlider3Y = getRandomCoord(-4, 4);
        const randomGlider4Y = getRandomCoord(-4, 4);

        // Forzar "panza": P5 alto, P6 bajo (o viceversa)
        const randomP5X = getRandomCoord(-2.5, -1);
        const randomP6X = getRandomCoord(-1, -0.5);

        const randomP7X = getRandomCoord(0.5, 1.5);
        const randomP8X = getRandomCoord(1.5, 2.5);

        const p5Alto = Math.random() < 0.5;

        const randomP5Y = p5Alto ? getRandomCoord(1.5, 4) : getRandomCoord(-4, -1.5);
        const randomP6Y = p5Alto ? getRandomCoord(-4, -1.5) : getRandomCoord(1.5, 4);

        const randomP7Y = p5Alto ? getRandomCoord(1.5, 4) : getRandomCoord(-4, -1.5);
        const randomP8Y = p5Alto ? getRandomCoord(-4, -1.5) : getRandomCoord(1.5, 4);

        // Mover los puntos a las nuevas posiciones
        glider1.moveTo([-3, randomGlider1Y]);
        glider2.moveTo([0, randomGlider2Y]);
        glider3.moveTo([0, randomGlider3Y]);
        glider4.moveTo([3, randomGlider4Y]);
        p5.moveTo([randomP5X, randomP5Y]);
        p6.moveTo([randomP6X, randomP6Y]);

        p7.moveTo([randomP7X, randomP7Y]);
        p8.moveTo([randomP8X, randomP8Y]);

        brd.update();

        // Comprobar si sigue siendo inyectiva
        esInyectiva = verificarInyectividad();

    } while (esInyectiva && intentos < 3); // límite de intentos por seguridad

    // Habilita la capacidad de arrastrar los puntos de nuevo
    glider1.setAttribute({ fixed: false });
    glider2.setAttribute({ fixed: false });
    p5.setAttribute({ fixed: false });
    p6.setAttribute({ fixed: false });

    glider3.setAttribute({ fixed: false });
    glider4.setAttribute({ fixed: false });
    p7.setAttribute({ fixed: false });
    p8.setAttribute({ fixed: false });

    // Limpiar puntos resaltados de validaciones anteriores
    highlightedPoints.forEach(point => brd.removeObject(point));
    highlightedPoints = [];
    highlightedPoints2.forEach(point => brd.removeObject(point));
    highlightedPoints2 = [];
    brd.unsuspendUpdate();

}

// Verificación de inyectividad
function verificarInyectividad() {
    const muestras = 100;
    let valoresY = new Map();

    for (let i = 0; i <= muestras; i++) {
        let t = i / muestras;
        let x = curvaX(t);
        let y = curvaY(t);

        let yKey = y.toFixed(2);

        if (valoresY.has(yKey)) {
            return false; // no es inyectiva
        }
        valoresY.set(yKey, x);
    }
    return true; // sí es inyectiva
}

// Bezier cúbica
function curvaX(t) {
    return Math.pow(1 - t, 3) * glider1.X() +
        3 * Math.pow(1 - t, 2) * t * p5.X() +
        3 * (1 - t) * Math.pow(t, 2) * p6.X() +
        Math.pow(t, 3) * glider2.X();
}

function curvaY(t) {
    return Math.pow(1 - t, 3) * glider1.Y() +
        3 * Math.pow(1 - t, 2) * t * p5.Y() +
        3 * (1 - t) * Math.pow(t, 2) * p6.Y() +
        Math.pow(t, 3) * glider2.Y();
}

function loseLife() {

    if (lives > 0) {
        const lifeEl = document.getElementById(`life${lives}`);
        lifeEl.classList.add('blink');
        setTimeout(() => {
            lifeEl.classList.remove('blink');
            lifeEl.classList.add('fall');
        }, 1800);

        lives--;

        if (lives === 0) {
            document.getElementById('validateButton').disabled = true;
            document.getElementById('resetButton').disabled = true;
            swal({
                title: "¡Juego terminado! Debes estudiar más",
                text: "Te has quedado sin tréboles de la suerte.",
                icon: "error",
                button: "Entendido"
            });
        }
    }


}

function winPoint() {
    if (score < 3) {
        // Aquí puedes agregar lógica para manejar el caso en que el jugador gana un punto pero no ha alcanzado 3 puntos aún.
        swal({
            title: "¡Función continua!",
            text: "Has ganado una función continua, necesitas " + (2 - score) + " para ganar.",
            icon: "info",
            button: "Entendido"
        });
    }
    score++;
    document.getElementById('score').textContent = score;
    if (score === 3) {
        document.getElementById('validateButton').disabled = true;
        document.getElementById('resetButton').disabled = true;
        swal({
            title: "¡Ganaste!",
            text: "Completaste las 3 funciones continuas.",
            icon: "success",
            button: "Cuestionario"
        }).then(() => {
            funcionModal();
        });
        // Aquí puedes redirigir al usuario a un cuestionario o a otra página
    }
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
            pan: {
                enabled: false // 🔒 Desactiva arrastre del tablero
            },
            keepaspectratio: true,
            axis: {
                ticks: {
                    majorHeight: -1, // Muestra las marcas de división
                    insertTicks: true, // Asegura que las marcas se dibujen
                    drawLabels: true, // Asegura que los números se dibujen
                    label: {
                        offset: [-10, -10] // Posicionamiento de las etiquetas
                    },
                    majorHeight: -1, // Longitud de la marca de división mayor
                    minorHeight: 0 // Longitud de la marca de división menor
                }
            },
            grid: true, // Añadir una cuadrícula para mejor visualización
            showinfobox: true, // Deshabilita el infobox con las coordenadas del mouse
            showCopyright: false

        });

        // Arreglo para almacenar los puntos de control de la curva de Bezier
        var p = [];
        var r = [];

        // Suspende las actualizaciones del tablero para una inicialización más fluida
        brd.suspendUpdate();

        // Creación de puntos fijos para las líneas verticales (visibles=false)
        var p1_line_left = brd.create('point', [-3, 2], { name: 'A', visible: false });
        var p2_line_left = brd.create('point', [-3, 4], { name: 'B', visible: false });
        var p3_line_right = brd.create('point', [0, 2], { name: 'C', visible: false });
        var p4_line_right = brd.create('point', [0, 4], { name: 'D', visible: false });


        var p3_line_left = brd.create('point', [0, 2], { name: 'N', visible: false });
        var p4_line_left = brd.create('point', [0, 4], { name: 'M', visible: false });
        var p5_line_right = brd.create('point', [3, 2], { name: 'X', visible: false });
        var p6_line_right = brd.create('point', [3, 4], { name: 'Z', visible: false });


        // Creación de líneas verticales invisibles para restringir los "gliders"
        var l1_left_guide = brd.create('line', [p1_line_left, p2_line_left], { visible: false });
        var l2_right_guide = brd.create('line', [p3_line_right, p4_line_right], { visible: false });
        var l2_left_guide = brd.create('line', [p3_line_left, p4_line_left], { visible: false });
        var l3_right_guide = brd.create('line', [p5_line_right, p6_line_right], { visible: false });

        //Creación de puntos para formar el intervalo de definición de la función
        var p5_line = brd.create('point', [-3, 0], { name: 'E', face: 'square', visible: false });
        var p6_line = brd.create('point', [0, 0], { name: 'F', face: 'square', visible: false });

        var p7_line = brd.create('point', [0, 0], { name: 'E', face: 'square', visible: false });
        var p8_line = brd.create('point', [3, 0], { name: 'F', face: 'square', visible: false });
        // Crear líneas horizontales invisibles para los puntos E y F.
        var l3_horizontal = brd.create('segment', [p5_line, p6_line], { color: '#6fbff9ff', size: 15, strokeWidth: 5, fixed: true, layer: 0, visible: true });


        var l3_horizontal = brd.create('segment', [p7_line, p8_line], { color: '#6fbff9ff', size: 15, strokeWidth: 5, fixed: true, layer: 0, visible: true });



        // Creación de los "gliders" (puntos que se deslizan sobre una línea)
        // Se inicializan con valores temporales, se moverán a posiciones aleatorias después.
        glider1 = brd.create('glider', [-3, 0, l1_left_guide], { name: 'G', size: 4, color: 'white', highlight: true, fixed: false });
        glider1.catchRadius = 30; // área táctil de 30px para capturar el toque
        glider2 = brd.create('glider', [0, 0, l2_right_guide], { name: 'H', size: 4, color: 'white', highlight: true, fixed: false }); // Diferente color para distinguirlo
        glider2.catchRadius = 30; // área táctil de 30px para capturar el toque

        glider3 = brd.create('glider', [3, 0, l2_left_guide], { name: 'J', size: 4, color: 'blue', highlight: true, fixed: false }); // Diferente color para distinguirlo
        glider3.catchRadius = 30; // área táctil de 30px para capturar el toque

        glider4 = brd.create('glider', [3, 0, l3_right_guide], { name: 'I', size: 4, color: 'blue', highlight: true, fixed: false }); // Diferente color para distinguirlo
        glider4.catchRadius = 30; // área táctil de 30px para capturar el toque

        glider5 = brd.create('glider', [0, 0, l2_right_guide], { name: 'k', size: 4, color: 'purple', highlight: true, fixed: false }); // Diferente color para distinguirlo
        glider5.catchRadius = 30; // área táctil de 30px para capturar el toque


        glider6 = brd.create('glider', [-3, 0, l1_left_guide], { name: 'k', size: 4, color: 'purple', highlight: true, fixed: false }); // Diferente color para distinguirlo
        glider6.catchRadius = 30; // área táctil de 30px para capturar el toque

        glider7 = brd.create('glider', [3, 0, l3_right_guide], { name: 'k', size: 4, color: 'purple', highlight: true, fixed: false }); // Diferente color para distinguirlo
        glider7.catchRadius = 30; // área táctil de 30px para capturar el toque


        // Creación de puntos de control internos (puntos P y Q)
        p5 = brd.create('point', [-3, 0], { name: 'P', trace: false, size: 4.5, color: 'purple', face: '[]', highlight: true, fixed: false });
        p5.catchRadius = 30; // área táctil de 30px para capturar el toque
        p6 = brd.create('point', [0, 0], { name: 'Q', trace: false, size: 4.5, color: 'purple', face: '[]', highlight: true, fixed: false });
        p6.catchRadius = 30; // área táctil de 30px para capturar el toque


        // Creación de puntos de control internos (puntos P y Q)
        p7 = brd.create('point', [3, 0], { name: 'R', trace: false, size: 4.5, color: 'purple', face: '[]', highlight: true, fixed: false });
        p7.catchRadius = 30; // área táctil de 30px para capturar el toque
        p8 = brd.create('point', [8, 0], { name: 'T', trace: false, size: 4.5, color: 'purple', face: '[]', highlight: true, fixed: false });
        p8.catchRadius = 30; // área táctil de 30px para capturar el toque




        // Añade los puntos al arreglo 'p' en el orden correcto para la curva de Bezier
        p.push(glider1);
        p.push(p5);
        p.push(p6);
        p.push(glider2);
        r.push(glider3);
        r.push(p7);
        r.push(p8);
        r.push(glider4);

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
            strokeColor: 'darkblue',
            strokeOpacity: 0.8, // Un poco más opaca
            strokeWidth: 3, // Ligeramente más gruesa para mejor visibilidad
            needsRegularUpdate: true // Asegura que la curva se actualice al mover los puntos
        });

        curve2 = brd.create('curve', JXG.Math.Numerics.bezier(r), {
            strokeColor: 'darkblue',
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

            points.forEach(pt => {
                if (pt.y === 0) {
                    const newPoint = brd.create('point', [pt.x, pt.y], {
                        name: '', // No mostrar nombre
                        color: 'yellow',
                        size: 3,
                        strokeWidth: 3,
                        face: 'o',
                        fixed: true, // No permitir arrastrar
                        highlight: false // No resaltar al pasar el mouse
                    });
                }


            });

            brd.update(); // Forzar la actualización del tablero para mostrar los puntos
        };



        const highlightProblemPoints2 = (points) => {
            // Eliminar puntos resaltados de la ejecución anterior
            highlightedPoints2.forEach(point => brd.removeObject(point));
            highlightedPoints2 = [];

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
                highlightedPoints2.push(newPoint);
            });
            brd.update(); // Forzar la actualización del tablero para mostrar los puntos
        };



        /**
         * Función principal para validar si la curva es una función y, si lo es,
         * si es inyectiva.
         */
        window.validarCurva = function () {
            document.getElementById('validateButton').disabled = true;
            brd.suspendUpdate();  // congela el tablero
            // Deshabilita la capacidad de arrastrar los puntos de control
            glider1.setAttribute({ fixed: true });
            glider2.setAttribute({ fixed: true });
            p5.setAttribute({ fixed: true });
            p6.setAttribute({ fixed: true });

            glider3.setAttribute({ fixed: true });
            glider4.setAttribute({ fixed: true });
            p7.setAttribute({ fixed: true });
            p8.setAttribute({ fixed: true });

            console.log("Validación de curva: Iniciando...");
            const muestrasT = 10000;
            const tolerancia = 0.01;


            // Eliminar puntos resaltados de la ejecución anterior
            highlightedPoints.forEach(point => brd.removeObject(point));
            highlightedPoints = [];

            highlightedPoints2.forEach(point => brd.removeObject(point));
            highlightedPoints2 = [];

            // --- 1. Validar si es una función (Prueba de la línea vertical) ---
            const xToYValuesMap = {};
            let nonFunctionPoints = null;
            const xToYValuesMap2 = {};
            let nonFunctionPoints2 = null;

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

            for (let i = 0; i <= muestrasT; i++) {
                const t = i / muestrasT;
                const xActual2 = curve2.X(t);
                const yActual2 = curve2.Y(t);
                const xRedondeada2 = xActual2.toFixed(3);

                if (!xToYValuesMap2[xRedondeada2]) {
                    xToYValuesMap2[xRedondeada2] = [];
                }
                xToYValuesMap2[xRedondeada2].push({ x: xActual2, y: yActual2 });
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
            for (const x in xToYValuesMap2) {
                if (xToYValuesMap2[x].length > 1) {
                    const points = xToYValuesMap2[x];
                    // Encontrar los puntos con el y-mínimo y y-máximo
                    const minPoint = points.reduce((prev, curr) => (prev.y < curr.y ? prev : curr));
                    const maxPoint = points.reduce((prev, curr) => (prev.y > curr.y ? prev : curr));

                    // Verificar que los puntos son realmente distintos
                    if (Math.abs(minPoint.y - maxPoint.y) > tolerancia) {
                        nonFunctionPoints2 = { first: minPoint, second: maxPoint };
                        break;
                    }
                }
            }

            // Si no es una función, muestra la alerta y resalta los puntos
            if (nonFunctionPoints) {
                highlightProblemPoints([nonFunctionPoints.first, nonFunctionPoints.second]);
                const mensajeError = `Se encontraron al menos dos puntos diferentes con la misma coordenada en X. Haz perdido un trébol de la suerte. Te quedan ${lives - 1} tréboles.
                                \nPunto 1: (${nonFunctionPoints.first.x.toFixed(2)}, ${nonFunctionPoints.first.y.toFixed(2)})
                                \nPunto 2: (${nonFunctionPoints.second.x.toFixed(2)}, ${nonFunctionPoints.second.y.toFixed(2)})`;

                swal({
                    title: "¡No es una Función!",
                    text: mensajeError,
                    icon: "error",
                    button: "Entendido",
                });

                loseLife();

                return; // Importante: salir de la función
            }

            if (nonFunctionPoints2) {
                highlightProblemPoints2([nonFunctionPoints2.first, nonFunctionPoints2.second]);
                const mensajeError = `Se encontraron al menos dos puntos diferentes con la misma coordenada en X. Haz perdido un trébol de la suerte. Te quedan ${lives - 1} tréboles.
                                \nPunto 1: (${nonFunctionPoints2.first.x.toFixed(2)}, ${nonFunctionPoints2.first.y.toFixed(2)})
                                \nPunto 2: (${nonFunctionPoints2.second.x.toFixed(2)}, ${nonFunctionPoints2.second.y.toFixed(2)})`;

                swal({
                    title: "¡No es una Función!",
                    text: mensajeError,
                    icon: "error",
                    button: "Entendido",
                });

                loseLife();

                return; // Importante: salir de la función
            }

            function approxEqual(a, b, tolerance = 0.04) {
                return Math.abs(a - b) < tolerance;
            }
            
            // --- 2. Validar si es inyectiva (Prueba de la línea horizontal) ---
            // Se ejecuta solo si la curva es una función
            if (((glider1.Y() < 0 && glider4.Y() > 0) || (glider1.Y() > 0 && glider4.Y() < 0)) && (approxEqual(glider2.Y(), glider3.Y()) && approxEqual(glider3.Y(), glider5.Y())) && (approxEqual(glider1.Y(), glider6.Y()) && approxEqual(glider4.Y(), glider7.Y()))) {
                swal({
                    title: "!exito!",
                    text: "La funcion si es continua",
                    icon: "success",
                    button: "Entendido",
                });
            } else {
                if (((glider1.Y() < 0 && glider4.Y() < 0) || (glider1.Y() > 0 && glider4.Y() > 0))) {

                    swal({
                        title: "!Error!",
                        text: "No hay cambio de signo en los extremos del intervalo",
                        icon: "error",
                        button: "Entendido",
                    });
                    loseLife();
                    return;


                }
                if ((!approxEqual(glider2.Y(), glider3.Y()) || !approxEqual(glider3.Y(), glider5.Y())) || (!approxEqual(glider1.Y(), glider6.Y()) || !approxEqual(glider4.Y(), glider7.Y()))) {

                    swal({
                        title: "!Error!",
                        text: "La funcion no es continua",
                        icon: "error",
                        button: "Entendido",
                    });
                    loseLife();
                    return;


                }

            }


            winPoint();

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

function funcionModal() {
    // 1) Cargar el HTML del cuestionario
    $("<div>").load("./cuestionarios/cuestionario.html", function (_resp, status) {
        if (status === "error") {
            swal("Error", "No se pudo cargar el contenido HTML.", "error");
            return;
        }

        // 2) Inyectar el HTML en un contenedor real que pasaremos a swal
        const cont = document.createElement('div');
        cont.innerHTML = $(this).html();

        // 3) Abrir el modal con SweetAlert clásico (usa 'content')
        swal({
            title: "Cuestionario",
            content: cont, // <- OJO: SweetAlert clásico usa 'content', NO 'html'
            buttons: false
        });

        // 4) Esperar a que el modal inserte su DOM (clásico no tiene didOpen)
        requestAnimationFrame(() => {
            // .swal-content es la raíz real del contenido en swal clásico
            const root = document.querySelector('.swal-content');

            // 5) Cargar primero JSConfetti, luego dinamico.js
            $.getScript('https://cdn.jsdelivr.net/npm/js-confetti@latest/dist/js-confetti.browser.js')
                .done(() => {
                    // Bust de caché para dinamico.js si vas iterando:
                    $.getScript('./js/dinamico_intermedio.js?v=' + Date.now())
                        .done(() => {
                            if (typeof window.initCuestionario === 'function') {
                                // 6) Arrancar el cuestionario DENTRO del modal
                                window.initCuestionario(root);
                            } else {
                                console.warn('initCuestionario no encontrado en dinamico.js');
                                swal("Aviso", "No se encontró initCuestionario en dinamico.js", "warning");
                            }
                        })
                        .fail((_jq, _st, ex) => {
                            console.error('Error cargando dinamico.js', ex);
                            swal("Error", "No se pudo cargar dinamico.js", "error");
                        });
                })
                .fail((_jq, _st, ex) => {
                    console.error('Error cargando JSConfetti', ex);
                    swal("Error", "No se pudo cargar JSConfetti", "error");
                });
        });
    });
}





