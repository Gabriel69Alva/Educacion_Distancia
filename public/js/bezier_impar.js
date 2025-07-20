JXG.Options.renderer = "canvas";

var brd = JXG.JSXGraph.initBoard('jxgbox', { boundingbox: [-6, 5, 6, -4], keepaspectratio: true, axis: true });

var p = [];

brd.suspendUpdate();

var p1 = brd.create('point', [-3, 2], { name: 'A', visible: false });
var p2 = brd.create('point', [-3, 5], { name: 'B', visible: false });

var p3 = brd.create('point', [3, 2], { name: 'C', visible: false });
var p4 = brd.create('point', [3, 5], { name: 'D', visible: false });

var l1 = brd.create('line', [p1, p2], { visible: false });
var l2 = brd.create('line', [p3, p4], { visible: false });

var glider1 = brd.create('glider', [-3, 1.3, l1], { name: 'G', size: 3, color: 'turquoise' });
var glider2 = brd.create('glider', [3, 0.5, l2], { name: 'H', size: 3 });

var p5 = brd.create('point', [-1.5, 2.5], { name: 'P', trace: false, size: 3, Color: 'green', face: '[]' });
var p6 = brd.create('point', [0.75, 2.5], { name: 'Q', trace: false, size: 3, Color: 'green', face: '[]' });

p.push(glider1);
p.push(p5);
p.push(p6);
p.push(glider2);

let margenError = 0.02;

var c = brd.create('curve', JXG.Math.Numerics.bezier(p), { strokeColor: 'blue', strokeOpacity: 0.6, strokeWidth: 3 });

console.log("Los elementos del arreglo p son: " + p);
console.log("La primera coordenada del arreglo p es: " + p[0]);
console.log("Las coordenadas de la curva C son: " + c);

function validarGlidersY() {
    const yG = p[0].Y();
    const yH = p[3].Y();

    const valido = (yG >= 0 && yH <= 0) || (yG <= 0 && yH >= 0);
    const esCero = Math.abs(Math.abs(yG) - Math.abs(yH));

    console.log(`Y de G: ${yG}, Y de H: ${yH}`);
    console.log(`¿Gliders en lados opuestos del eje Y? ${valido}`);
    console.log("calculo cero: ", esCero);
    console.log(`¿Gliders en la misma posición en el eje Y? ${esCero}`);

    return valido && esCero <= margenError;
}

function validarPuntosPQ() {
    const xP = Math.abs(p[1].X());
    const yP = Math.abs(p[1].Y());
    const xQ = Math.abs(p[2].X());
    const yQ = Math.abs(p[2].Y());

    const diferenciaX = Math.abs(xP - xQ);
    const diferenciaY = Math.abs(yP - yQ);

    console.log(`|P|: (${xP}, ${yP}), |Q|: (${xQ}, ${yQ}), Dif X: ${diferenciaX}, Dif Y: ${diferenciaY}`);
    return diferenciaX <= margenError && diferenciaY <= margenError;
}

function validacionImpar() {
    const sonValidos = validarGlidersY() && validarPuntosPQ();
    console.log("Validando pares de gliders y puntos...", sonValidos);

    if (sonValidos) {
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

brd.unsuspendUpdate();
