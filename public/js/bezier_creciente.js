JXG.Options.renderer = "canvas";

var brd = JXG.JSXGraph.initBoard('jxgbox', {
    boundingbox: [-4, 4, 6, -4],
    keepaspectratio: true,
    axis: true
});

var p = [];

brd.suspendUpdate();

var p1 = brd.create('point', [-3, 2], { visible: false });
var p2 = brd.create('point', [-3, 5], { visible: false });
var p3 = brd.create('point', [3, 2], { visible: false });
var p4 = brd.create('point', [3, 5], { visible: false });

var l1 = brd.create('line', [p1, p2], { visible: false });
var l2 = brd.create('line', [p3, p4], { visible: false });

var glider1 = brd.create('glider', [-3, 1.3, l1], { name: 'G', size: 2, color: 'turquoise' });
var glider2 = brd.create('glider', [3, 0.5, l2], { name: 'H', size: 2 });

var p5 = brd.create('point', [-1.5, 2.5], {
    name: 'P', size: 3, color: 'green', face: '[]',
    snapToGrid: false
});

var p6 = brd.create('point', [0.75, 2.5], {
    name: 'Q', size: 3, color: 'green', face: '[]',
    snapToGrid: false
});

p.push(glider1);
p.push(p5);
p.push(p6);
p.push(glider2);

let margenError = 1e-4;

var c = brd.create('curve', JXG.Math.Numerics.bezier(p), {
    strokeColor: 'blue',
    strokeOpacity: 0.6,
    strokeWidth: 2
});

// Corrección automática de X de P y Q en cada frame
brd.on('update', () => {
    if (p5.X() > 0) p5.moveTo([0, p5.Y()]);
    if (p6.X() < 0) p6.moveTo([0, p6.Y()]);
});

brd.unsuspendUpdate();
brd.update();

function validarCoordenadasYCurvaC() {

    const n = 1000;
    const vistos = new Set();

    for (let i = 0; i <= n; i++) {
        const t = i / n;
        const y = c.Y(t);
        const yRedondeado = Math.round(y / margenError) * margenError;
        if (vistos.has(yRedondeado)) return false;
        vistos.add(yRedondeado);
    }
    return true;
}

function validarCreciente() {
    if (validarCoordenadasYCurvaC() && glider1.Y() < glider2.Y()) {
        swal({
            title: "Éxito.",
            text: "La curva es creciente.",
            icon: "success",
        });
    } else {
        swal({
            title: "Error.",
            text: "La curva no es creciente.",
            icon: "error",
        });
    }
}

