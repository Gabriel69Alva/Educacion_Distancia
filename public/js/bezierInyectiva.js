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

var p5 = brd.create('point', [-1.5, 2.5], { name: 'P', trace: false, size: 3, color: 'green', face: '[]' });
var p6 = brd.create('point', [0.75, 2.5], { name: 'Q', trace: false, size: 3, color: 'green', face: '[]' });

p.push(glider1);
p.push(p5);
p.push(p6);
p.push(glider2);

let margenError = 1e-4; // margen para comparación flotante

var c = brd.create('curve', JXG.Math.Numerics.bezier(p), {
    strokeColor: 'blue',
    strokeOpacity: 0.6,
    strokeWidth: 2
});

brd.unsuspendUpdate();
brd.update();

/**
 * Valida si la curva es inyectiva en Y (no repite valores de Y).
 */
function validarCoordenadasYCurvaC() {
    const n = 1000;
    const vistos = new Set();

    for (let i = 0; i <= n; i++) {
        const t = i / n;
        const y = c.Y(t);

        // Redondeamos a cierta precisión para evitar errores flotantes
        const yRedondeado = Math.round(y / margenError) * margenError;

        if (vistos.has(yRedondeado)) {
            return false;
        }
        vistos.add(yRedondeado);
    }
    return true;
}

function validarInyectiva() {
    if (validarCoordenadasYCurvaC()) {
        swal({
            title: "Éxito.",
            text: "La curva es inyectiva (no repite valores en Y).",
            icon: "success",
        });
    } else {
        swal({
            title: "Error.",
            text: "La curva no es inyectiva (hay valores de Y repetidos).",
            icon: "error",
        });
    }
}

