
// Array global para almacenar y eliminar los puntos resaltados
let highlightedPoints = [];
let curve;
let brd;
let glider1, glider2, p5, p6;

function getRandomCoord(min, max) {
    return Math.random() * (max - min) + min;
}

function setRandomInitialPositions() {
    const randomGlider1Y = getRandomCoord(-4, 4);
    const randomGlider2Y = getRandomCoord(-4, 4);
    const randomP5X = getRandomCoord(-2.5, -0.5);
    const randomP5Y = getRandomCoord(-4, 4);
    const randomP6X = getRandomCoord(0.5, 2.5);
    const randomP6Y = getRandomCoord(-4, 4);

    glider1.moveTo([-3, randomGlider1Y]);
    glider2.moveTo([3, randomGlider2Y]);
    p5.moveTo([randomP5X, randomP5Y]);
    p6.moveTo([randomP6X, randomP6Y]);

    highlightedPoints.forEach(point => brd.removeObject(point));
    highlightedPoints = [];
    brd.update();
}

document.addEventListener('DOMContentLoaded', function () {
    try {
        JXG.Options.renderer = "canvas";
        brd = JXG.JSXGraph.initBoard('jxgbox', {
            boundingbox: [-5, 5, 5, -5],
            keepaspectratio: true,
            axis: true,
            grid: true,
            showinfobox: false
        });

        let p = [];
        brd.suspendUpdate();

        let p1_line_left = brd.create('point', [-3, 2], { visible: false });
        let p2_line_left = brd.create('point', [-3, 4], { visible: false });
        let p3_line_right = brd.create('point', [3, 2], { visible: false });
        let p4_line_right = brd.create('point', [3, 4], { visible: false });

        let l1_left_guide = brd.create('line', [p1_line_left, p2_line_left], { visible: false });
        let l2_right_guide = brd.create('line', [p3_line_right, p4_line_right], { visible: false });

        glider1 = brd.create('glider', [-3, 0, l1_left_guide], { size: 4, color: 'turquoise' });
        glider2 = brd.create('glider', [3, 0, l2_right_guide], { size: 4, color: 'orange' });

        p5 = brd.create('point', [0, 0], { size: 3, color: 'green' });
        p6 = brd.create('point', [0, 0], { size: 3, color: 'green' });

        p.push(glider1, p5, p6, glider2);

        brd.on('update', () => {
            [glider1, glider2, p5, p6].forEach(pt => {
                let y = pt.Y();
                if (y > 4) pt.moveTo([pt.X(), 4]);
                else if (y < -4) pt.moveTo([pt.X(), -4]);
            });
        });

        curve = brd.create('curve', JXG.Math.Numerics.bezier(p), {
            strokeColor: 'blue',
            strokeOpacity: 0.8,
            strokeWidth: 3,
            needsRegularUpdate: true
        });

        const highlightProblemPoints = (points) => {
            highlightedPoints.forEach(point => brd.removeObject(point));
            highlightedPoints = [];
            points.forEach(pt => {
                const newPoint = brd.create('point', [pt.x, pt.y], {
                    color: 'yellow',
                    size: 3,
                    fixed: true,
                    highlight: false
                });
                highlightedPoints.push(newPoint);
            });
            brd.update();
        };

        window.validarCurva = function () {
            const muestrasT = 10000;
            const tolerancia = 0.01;

            highlightedPoints.forEach(point => brd.removeObject(point));
            highlightedPoints = [];

            const xToYValuesMap = {};
            let nonFunctionPoints = null;

            for (let i = 0; i <= muestrasT; i++) {
                const t = i / muestrasT;
                const xActual = curve.X(t);
                const yActual = curve.Y(t);
                const xRedondeada = xActual.toFixed(3);
                if (!xToYValuesMap[xRedondeada]) xToYValuesMap[xRedondeada] = [];
                xToYValuesMap[xRedondeada].push({ x: xActual, y: yActual });
            }

            for (const x in xToYValuesMap) {
                if (xToYValuesMap[x].length > 1) {
                    const points = xToYValuesMap[x];
                    const minPoint = points.reduce((a, b) => (a.y < b.y ? a : b));
                    const maxPoint = points.reduce((a, b) => (a.y > b.y ? a : b));
                    if (Math.abs(minPoint.y - maxPoint.y) > tolerancia) {
                        nonFunctionPoints = { first: minPoint, second: maxPoint };
                        break;
                    }
                }
            }

            if (nonFunctionPoints) {
                highlightProblemPoints([nonFunctionPoints.first, nonFunctionPoints.second]);
                swal({
                    title: "¡No es una Función!",
                    text: `Punto 1: (${nonFunctionPoints.first.x.toFixed(2)}, ${nonFunctionPoints.first.y.toFixed(2)})\nPunto 2: (${nonFunctionPoints.second.x.toFixed(2)}, ${nonFunctionPoints.second.y.toFixed(2)})`,
                    icon: "error",
                    button: "Entendido",
                });
                return;
            }

            let curveMinY = Infinity;
            let curveMaxY = -Infinity;
            const minYCodominio = -4;
            const maxYCodominio = 4;

            for (let i = 0; i <= muestrasT; i++) {
                const t = i / muestrasT;
                const yActual = curve.Y(t);
                if (!isNaN(yActual)) {
                    if (yActual < curveMinY) curveMinY = yActual;
                    if (yActual > curveMaxY) curveMaxY = yActual;
                }
            }

            let isSuprayectiva = curveMinY <= minYCodominio && curveMaxY >= maxYCodominio;
            let errorMessage = "La curva no es suprayectiva.";

            if (!isSuprayectiva) {
                if (curveMinY > minYCodominio) errorMessage += ` Mínimo (${curveMinY.toFixed(2)}) > ${minYCodominio}.`;
                if (curveMaxY < maxYCodominio) errorMessage += ` Máximo (${curveMaxY.toFixed(2)}) < ${maxYCodominio}.`;
            }

            swal({
                title: isSuprayectiva ? "¡Éxito!" : "¡No Suprayectiva!",
                text: isSuprayectiva ? "La curva cubre todo el eje Y desde -4 hasta 4." : errorMessage,
                icon: isSuprayectiva ? "success" : "error",
                button: "Entendido",
            });
        };

        brd.unsuspendUpdate();
        document.getElementById('validateButton').onclick = window.validarCurva;
        document.getElementById('resetButton').onclick = setRandomInitialPositions;
        setRandomInitialPositions();
    } catch (e) {
        console.error("Error al inicializar:", e);
        swal({
            title: "Error al cargar la gráfica",
            text: "Hubo un problema: " + e.message,
            icon: "error",
            button: "Entendido",
        });
    }
});

