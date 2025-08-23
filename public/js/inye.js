// Variables del juego
let lives = 3;
let score = 0;

// Variable para el estado del cuestionario
let currentQuestionIndex = 0;
let selectedOption = null;

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
    let esInyectiva = true;
    let intentos = 0;

    do {
        intentos++;

        // Generar posiciones aleatorias para los gliders
        const randomGlider1Y = getRandomCoord(-4, 4);
        const randomGlider2Y = getRandomCoord(-4, 4);

        // Forzar "panza": P5 alto, P6 bajo (o viceversa)
        const randomP5X = getRandomCoord(-2.5, -0.5);
        const randomP6X = getRandomCoord(0.5, 2.5);
        const p5Alto = Math.random() < 0.5;

        const randomP5Y = p5Alto ? getRandomCoord(1.5, 4) : getRandomCoord(-4, -1.5);
        const randomP6Y = p5Alto ? getRandomCoord(-4, -1.5) : getRandomCoord(1.5, 4);

        // Mover los puntos a las nuevas posiciones
        glider1.moveTo([-3, randomGlider1Y]);
        glider2.moveTo([3, randomGlider2Y]);
        p5.moveTo([randomP5X, randomP5Y]);
        p6.moveTo([randomP6X, randomP6Y]);

        brd.update();

        // Comprobar si sigue siendo inyectiva
        esInyectiva = verificarInyectividad();

    } while (esInyectiva && intentos < 3); // límite de intentos por seguridad

    // Habilita la capacidad de arrastrar los puntos de nuevo
    glider1.setAttribute({ fixed: false });
    glider2.setAttribute({ fixed: false });
    p5.setAttribute({ fixed: false });
    p6.setAttribute({ fixed: false });

    // Limpiar puntos resaltados de validaciones anteriores
    highlightedPoints.forEach(point => brd.removeObject(point));
    highlightedPoints = [];
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
            title: "¡Función inyectiva!",
            text: "Has ganado una función inyectiva, necesitas " + (2 - score) + " para ganar.",
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
            text: "Completaste las 3 funciones inyectivas.",
            icon: "success",
            button: "Cuestionario"
        }).then(() => {
            funcionModal();
        });
        // Aquí puedes redirigir al usuario a un cuestionario o a otra página
    } else {
        setRandomInitialPositions();
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

        //Creación de puntos para formar el intervalo de definición de la función
        var p5_line = brd.create('point', [-3, 0], { name: 'E', face: 'square', visible: false });
        var p6_line = brd.create('point', [3, 0], { name: 'F', face: 'square', visible: false });
        // Crear líneas horizontales invisibles para los puntos E y F.
        var l3_horizontal = brd.create('segment', [p5_line, p6_line], { color: '#6fbff9ff', size: 15, strokeWidth: 5, fixed: true, layer: 0, visible: true });


        // Creación de los "gliders" (puntos que se deslizan sobre una línea)
        // Se inicializan con valores temporales, se moverán a posiciones aleatorias después.
        glider1 = brd.create('glider', [-3, 0, l1_left_guide], { name: 'G', size: 4, color: 'blue', highlight: true, fixed: false });
        glider1.catchRadius = 30; // área táctil de 30px para capturar el toque
        glider2 = brd.create('glider', [3, 0, l2_right_guide], { name: 'H', size: 4, color: 'blue', highlight: true, fixed: false }); // Diferente color para distinguirlo
        glider2.catchRadius = 30; // área táctil de 30px para capturar el toque

        // Creación de puntos de control internos (puntos P y Q)
        p5 = brd.create('point', [0, 0], { name: 'P', trace: false, size: 4.5, color: 'purple', face: '[]', highlight: true, fixed: false });
        p5.catchRadius = 50; // área táctil de 30px para capturar el toque
        p6 = brd.create('point', [0, 0], { name: 'Q', trace: false, size: 4.5, color: 'purple', face: '[]', highlight: true, fixed: false });
        p6.catchRadius = 50; // área táctil de 30px para capturar el toque


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
            brd.update(); // Forzar la actualización del tablero para mostrar los puntos
        };

        /**
         * Función principal para validar si la curva es una función y, si lo es,
         * si es inyectiva.
         */
        window.validarCurva = function () {
            brd.suspendUpdate();  // congela el tablero
            // Deshabilita la capacidad de arrastrar los puntos de control
            glider1.setAttribute({ fixed: true });
            glider2.setAttribute({ fixed: true });
            p5.setAttribute({ fixed: true });
            p6.setAttribute({ fixed: true });

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
                const mensajeError = `Se encontraron al menos un par de puntos diferentes con la misma coordenada Y:
                                \nPunto 1: (${nonInjectivePoints.first.x.toFixed(2)}, ${nonInjectivePoints.first.y.toFixed(1)})
                                \nPunto 2: (${nonInjectivePoints.second.x.toFixed(2)}, ${nonInjectivePoints.second.y.toFixed(1)})
                                \nHaz perdido un trébol de la suerte. Te quedan ${lives - 1} tréboles.`;

                swal({
                    title: "¡La gráfica no representa a una función inyectiva!",
                    text: mensajeError,
                    icon: "error",
                    button: "Entendido",
                });
                loseLife();

            } else {
                swal({
                    title: "¡Genial!",
                    text: "La curva representa una función inyectiva.",
                    icon: "success",
                    button: "Entendido",
                });
                winPoint();

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
      buttons: true
    });

    // 4) Esperar a que el modal inserte su DOM (clásico no tiene didOpen)
    requestAnimationFrame(() => {
      // .swal-content es la raíz real del contenido en swal clásico
      const root = document.querySelector('.swal-content');

      // 5) Cargar primero JSConfetti, luego dinamico.js
      $.getScript('https://cdn.jsdelivr.net/npm/js-confetti@latest/dist/js-confetti.browser.js')
        .done(() => {
          // Bust de caché para dinamico.js si vas iterando:
          $.getScript('./js/dinamico.js?v=' + Date.now())
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





