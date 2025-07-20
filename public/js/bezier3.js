

// Configuración del tablero
JXG.Options.renderer = "canvas";
var brd = JXG.JSXGraph.initBoard('jxgbox', { boundingbox: [-3, 5, 10, 0], keepaspectratio: true, axis: true });

let t = 0;
let p = 4;

// Crear el deslizador
let s1 = brd.create('slider', [[3, -3.5], [5, -3.5], [0, 0, 1]], { name: 'delta', color: 'white', strokeColor: 'white', strokewidh: 5, snapWidth: 0.1 });

let q = brd.create('point', [
    function () { return p + s1.Value(); },
    0
], { name: 'D', trace: false, size: 3, strokeColor: 'white', color: 'turquoise', face: 'circle' }
)
let r = brd.create('point', [
    function () { return p - s1.Value(); },
    0
], { name: 'E', trace: false, size: 3, color: 'turquoise', strokecolor:'red' , face: 'circle' }
)
//Se crea el intervalo de radio delta
let l5 = brd.create('segment', [q, r], { visible: true, color: 'green', layer:1, strokeColor: 'green', strokeWidth: 5 });

// Actualizar el valor de delta y mostrarlo en la consola
s1.on('drag', function () {
    actualizarCurva();
});

//Se crean los puntos extremos del intervalo cerrado y también el intervalo
var izq = brd.create('point', [1, 0], { name: 'a', visible: true, color: 'white', face: '[]' });
var der = brd.create('point', [7, 0], { name: 'b', visible: true, color: 'white', face: '[]' });
var l6 = brd.create('segment', [izq, der], { visible: true, color: 'white', strokeWidth: 5, layer: 0, strokeColor: 'white' });



// Crear los puntos de control invisibles para los gliders 
var q1 = brd.create('point', [1, 4], { name: 'A', visible: false });
var q2 = brd.create('point', [1, -4], { name: 'B', visible: false });

var q3 = brd.create('point', [7, 4], { name: 'C', visible: false });
var q4 = brd.create('point', [7, -4], { name: 'D', visible: false });

var l1 = brd.create('line', [q1, q2], { visible: false });
var l2 = brd.create('line', [q3, q4], { visible: false });

var r1 = brd.create('point', [
    function () { return p - s1.Value(); },
    4
], { name: 'I', visible: false });
var r2 = brd.create('point', [
    function () { return p - s1.Value(); },
    -4
], { name: 'J', visible: false });

var r3 = brd.create('point', [
    function () { return p + s1.Value(); },
    4
], { name: 'K', visible: false });
var r4 = brd.create('point', [
    function () { return p + s1.Value(); },
    -4
], { name: 'L', visible: false });

var l3 = brd.create('line', [r1, r2], { visible: true, color: 'blue', dash: 5, layer: 0 });
var l4 = brd.create('line', [r3, r4], { visible: true, color: 'blue', dash: 5, layer: 0 });

// Definir los puntos de control
var glider1 = brd.create('glider', [1, 2, l1], { name: 'G', size: 2 });
var glider2 = brd.create('glider', [7, 1, l2], { name: 'H', size: 2 });
var glider3 = brd.create('glider', [p - s1.Value(), 4, l3], { name: 'P1', size: 3, face: '[]', color: 'green' });
var glider4 = brd.create('glider', [p + s1.Value(), 4, l4], { name: 'P3', size: 3, face: '[]', color: 'green' });

// Función para calcular las coordenadas de la curva de Bézier
function calcularCurvaBezier(glider1, glider3, glider2, glider4, t) {
    var x = Math.pow(1 - t, 2) * glider1.X() + 2 * (1 - t) * t * glider3.X() + Math.pow(t, 2) * glider2.X() + Math.pow(t, 3) * (t - 1) * glider4.X();
    var y = Math.pow(1 - t, 2) * glider1.Y() + 2 * (1 - t) * t * glider3.Y() + Math.pow(t, 2) * glider2.Y() + Math.pow(t, 3) * (t - 1) * glider4.Y();
    return { x: x, y: y };
}

// Crear la curva de Bézier
var bezierCurve = brd.create('curve', [[], []], { strokeWidth: 4, layer: 2, strokeColor: 'purple' });

// Crear la curva en el intervalo delta si es negativa
var bezierCurveNegativa = brd.create('curve', [[], []], { strokeWidth: 4, layer: 2, strokeColor: 'yellow', dash: 2 });

// Función para actualizar la curva
function actualizarCurva() {
    var coordenadas = [];
    for (var t = 0; t <= 1; t += 0.01) {
        coordenadas.push(calcularCurvaBezier(glider1, glider3, glider2, glider4, t));
    }

    // Extraer las coordenadas para JSXGraph
    var xCoords = coordenadas.map(coord => coord.x);
    var yCoords = coordenadas.map(coord => coord.y);

    // Validar si la curva es negativa en el intervalo
    var esNegativa = true;
    var delta = s1.Value();
    var xCoordsNeg = [];
    var yCoordsNeg = [];

    for (var i = 0; i < xCoords.length; i++) {
        if (xCoords[i] >= p - delta && xCoords[i] <= p + delta) {
            if (yCoords[i] >= 0) {
                esNegativa = false;
            } else {
                xCoordsNeg.push(xCoords[i]);
                yCoordsNeg.push(yCoords[i]);
            }
        }
    }

    // Actualizar la curva con las nuevas coordenadas
    bezierCurve.dataX = xCoords;
    bezierCurve.dataY = yCoords;
    brd.update();

    // Actualizar la curva negativa en el intervalo delta si es negativa
    if (esNegativa && xCoordsNeg.length > 0) {
        bezierCurveNegativa.dataX = xCoordsNeg;
        bezierCurveNegativa.dataY = yCoordsNeg;
        bezierCurveNegativa.setAttribute({ visible: true });
    } else {
        bezierCurveNegativa.setAttribute({ visible: false });
    }
    brd.update();
}

// Actualizar la curva al mover los puntos
glider1.on('drag', actualizarCurva);
glider3.on('drag', actualizarCurva);
glider2.on('drag', actualizarCurva);
glider4.on('drag', actualizarCurva);

// Inicializar la curva
actualizarCurva();
