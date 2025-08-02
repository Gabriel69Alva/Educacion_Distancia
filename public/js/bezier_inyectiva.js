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
     * Función principal para validar si la curva es una función y, si lo es,
     * si es inyectiva.
     * Una función es inyectiva si cada valor Y en el rango corresponde a un
     * único valor X.
     * Una curva es una función si cada valor X en el dominio corresponde a
     * un único valor Y.
     */
    window.validarCurva = function () {
        console.log("Validación de curva: Iniciando...");

        const muestrasT = 10000; // Número de muestras a lo largo de la curva
        const yToPointMap = {}; // Mapa para la validación de inyectividad
        const xToPointMap = {}; // Mapa para la validación de la función
        let isFunction = true;
        let isNonInjective = false;
        let nonFunctionPoints = null;
        let nonInjectivePoints = null;
        const tolerancia = 0.01; // Pequeña tolerancia para manejar errores de punto flotante

        // --- 1. Validar si es una función (Prueba de la línea vertical) ---
        for (let i = 0; i <= muestrasT; i++) {
            const t = i / muestrasT;
            const xActual = c.X(t);
            const yActual = c.Y(t);

            const xRedondeada = xActual.toFixed(3);

            // Verifica si el valor X ya ha sido visto
            if (xToPointMap[xRedondeada] !== undefined) {
                const firstPoint = xToPointMap[xRedondeada];
                // Si el valor Y es diferente para el mismo X, no es una función
                if (Math.abs(firstPoint.y - yActual) > tolerancia) {
                    isFunction = false;
                    nonFunctionPoints = {
                        first: firstPoint,
                        second: { x: xActual, y: yActual }
                    };
                    break;
                }
            } else {
                xToPointMap[xRedondeada] = { x: xActual, y: yActual };
            }
        }

        // Si no es una función, muestra la alerta y termina.
        if (!isFunction) {
            const mensajeError = `La curva no representa una función. Se encontró al menos un par de puntos diferentes con la misma coordenada X:
                    \nPunto 1: (${nonFunctionPoints.first.x.toFixed(2)}, ${nonFunctionPoints.first.y.toFixed(2)})
                    \nPunto 2: (${nonFunctionPoints.second.x.toFixed(2)}, ${nonFunctionPoints.second.y.toFixed(2)})`;

            try {
                swal({
                    title: "¡No es una Función!",
                    text: mensajeError,
                    icon: "error",
                    button: "Entendido",
                });
            } catch (error) {
                console.error("Error al mostrar SweetAlert de no función:", error);
                alert("¡No es una Función! " + mensajeError);
            }
            return; // Importante: salir de la función
        }

        // --- 2. Validar si es inyectiva (Prueba de la línea horizontal) ---
        // Se ejecuta solo si la curva es una función
        for (let i = 0; i <= muestrasT; i++) {
            const t = i / muestrasT;
            const xActual = c.X(t);
            const yActual = c.Y(t);

            const yRedondeada = yActual.toFixed(3);

            if (yToPointMap[yRedondeada] !== undefined) {
                const firstPoint = yToPointMap[yRedondeada];
                // Condición de inyectividad: x1 != x2 y f(x1) = f(x2)
                if (Math.abs(firstPoint.x - xActual) > tolerancia) {
                    isNonInjective = true;
                    nonInjectivePoints = {
                        first: firstPoint,
                        second: { x: xActual, y: yActual }
                    };
                    break;
                }
            } else {
                yToPointMap[yRedondeada] = { x: xActual, y: yActual };
            }
        }

        // Mostrar el resultado de la validación
        if (isNonInjective) {
            const mensajeError = `La curva no es inyectiva. Se encontró al menos un par de puntos diferentes con la misma coordenada Y:
                    \nPunto 1: (${nonInjectivePoints.first.x.toFixed(2)}, ${nonInjectivePoints.first.y.toFixed(2)})
                    \nPunto 2: (${nonInjectivePoints.second.x.toFixed(2)}, ${nonInjectivePoints.second.y.toFixed(2)})`;

            try {
                swal({
                    title: "¡No Inyectiva!",
                    text: mensajeError,
                    icon: "error",
                    button: "Entendido",
                });
            } catch (error) {
                console.error("Error al mostrar SweetAlert de no inyectiva:", error);
                alert("¡No Inyectiva! " + mensajeError);
            }
        } else {
            try {
                swal({
                    title: "¡Éxito!",
                    text: "La curva representa una función inyectiva.",
                    icon: "success",
                    button: "Entendido",
                });
            } catch (error) {
                console.error("Error al mostrar SweetAlert de éxito:", error);
                alert("¡Éxito! La curva es una función inyectiva.");
            }
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
