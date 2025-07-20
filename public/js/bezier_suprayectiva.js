JXG.Options.renderer = "canvas";

var brd = JXG.JSXGraph.initBoard('jxgbox', { boundingbox: [-5, 5, 6, -5], keepaspectratio: true, axis: true });

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

var p5 = brd.create('point', [-1.5, 2.5], { name: 'P', trace: false, size: 3, Color: 'green', face: '[]' });
var p6 = brd.create('point', [0.75, 2.5], { name: 'Q', trace: false, size: 3, Color: 'green', face: '[]' });

p.push(glider1);
p.push(p5);
p.push(p6);
p.push(glider2);

let margenError = 0.02;

// Corrige automáticamente valores fuera del rango Y [-4, 4]
brd.on('update', () => {
    [glider1, glider2, p5, p6].forEach(pt => {
        let y = pt.Y();
        if (y > 4) pt.moveTo([pt.X(), 4]);
        else if (y < -4) pt.moveTo([pt.X(), -4]);
    });
});

var c = brd.create('curve', JXG.Math.Numerics.bezier(p), {
    strokeColor: 'blue',
    strokeOpacity: 0.6,
    strokeWidth: 5,
    needsRegularUpdate: true
});

function validarSuprayectiva() {
    const minY = -4;
    const maxY = 4;
    const muestrasY = 100;
    const muestrasT = 1000;
    let noAlcanzados = [];

    brd.update(); // asegura que la curva esté actualizada

    for (let j = 0; j <= muestrasY; j++) {
        const yObjetivo = minY + (j / muestrasY) * (maxY - minY);
        let encontrado = false;

        for (let i = 0; i <= muestrasT; i++) {
            const t = i / muestrasT;
            const yActual = c.Y(t);

            if (!isNaN(yActual) && Math.abs(yActual - yObjetivo) <= margenError) {
                encontrado = true;
                break;
            }
        }

        if (!encontrado) {
            noAlcanzados.push(yObjetivo);

            brd.create('point', [brd.boundingbox[0] + 0.2, yObjetivo], {
                size: 2,
                color: 'red',
                fixed: true,
                name: '',
                visible: true
            });
        }
    }

    if (noAlcanzados.length === 0) {
        swal({
            title: "Éxito.",
            text: "La curva es suprayectiva: cubre todo el eje Y desde -4 hasta 4.",
            icon: "success",
        });
    } else {
        swal({
            title: "No suprayectiva.",
            text: `La curva no alcanza todos los valores de Y. Ej: Y = ${noAlcanzados[0].toFixed(2)}`,
            icon: "error",
        });
    }
}

brd.unsuspendUpdate();

// Botón HTML para validar suprayectividad
document.body.insertAdjacentHTML('beforeend', `
  <div style="margin-top: 10px;">
    <button onclick="validarSuprayectiva()" style="padding: 8px 16px; font-size: 16px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
      Validar Suprayectividad
    </button>
  </div>
`);


