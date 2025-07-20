
JXG.Options.renderer = "canvas";

var brd = JXG.JSXGraph.initBoard('jxgbox', { boundingbox: [-4, 4, 6, -4], keepaspectratio: true, axis: true });
var p = [];

brd.suspendUpdate();

var p1 = brd.create('point', [-3, 2], { name: 'A', visible: false });
var p2 = brd.create('point', [-3, 5], { name: 'B', visible: false });

var p3 = brd.create('point', [3, 2], { name: 'C', visible: false });
var p4 = brd.create('point', [3, 5], { name: 'D', visible: false });


var l1 = brd.create('line', [p1, p2], { visible: false });
var l2 = brd.create('line', [p3, p4], { visible: false });

var glider1 = brd.create('glider', [-3, 1.3, l1], { name: 'G', size: 4, color: 'turquoise' });
var glider2 = brd.create('glider', [3, 0.5, l2], { name: 'H', size: 4 });
// data point

var p5 = brd.create('point', [-1.5, 2.5], { name: 'P', trace: false, size: 3, color: 'green', face: '[]' });   // control point
var p6 = brd.create('point', [0.75, 2.5], { name: 'Q', trace: false, size: 3, color: 'green', face: '[]' });   // control point

p.push(glider1);
p.push(p5);
p.push(p6);
p.push(glider2);

let margenError = 0; // margen de error para la validación de los gliders

var c = brd.create('curve', JXG.Math.Numerics.bezier(p), { strokeColor: 'blue', strokeOpacity: 0.6, strokeWidth: 2 });

console.log("Los elementos del arreglo p son: " + p);
console.log("La primera coordenada del arreglo p es: " + p[0]);
console.log("Las coordenadas de la curva C son: " + JSON.stringify(c));

brd.unsuspendUpdate();

function validarCoordenadasYCurvaC() {
    const n = 100, margen = 0;
    const vistos = [];

    for (let i = 0; i <= n; i++) {
        const y = c.Y(i / n);

        if (vistos.some(v => Math.abs(v - y) < margen)) {
            return false; // Encontramos Y repetida (dentro del margen)
        }
        vistos.push(y);
        console.log("vistos:", vistos);
    }
    return true;
}

function validarInyectiva() {

    if (validarCoordenadasYCurvaC()) {
        swal({
            title: "Exito.",
            text: "Respuesta correcta",
            icon: "success",
        });
    } else {
        swal({
            title: "Error.",
            text: "Respuesta incorrecta",
            icon: "error",
        });
    }
}