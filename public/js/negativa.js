

// las soluciones son x=0 y x=0.66

let resultMaximo = [-0.10, 0.10];
let resultMini = [0.64, 0.68];

let board = JXG.JSXGraph.initBoard('box', { boundingbox: [-2.3, 2.3, 2.6, -2.9], axis: true });
var f = function (x) {
    return (x * x * x) - x;
};
let graph = board.create('functiongraph', [f], { strokeColor: '#0000ff', strokeWidth: 2 });


let s1 = board.create('slider', [[-1, -1.5], [2, -1.5], [-2, -0.7, 2]], { name: 'A' });
let s2 = board.create('slider', [[-1, -1.8], [2, -1.8], [-1.5, -0.2, 1.5]], { name: 'B' });
let s3 = board.create('slider', [[-1, -2.1], [2, -2.1], [-1.5, 0.3, 1.5]], { name: 'C' });
let s4 = board.create('slider', [[-1, -2.4], [2, -2.4], [-1.5, .8, 1.5]], { name: 'D' });

//var c1 = board.create('curve', [function (t) { return t }, function (t) { return t * t * t; }]);

/*
var g1 = board.create('glider', [
    function () { return s3.Value(); },
    function () { return f(s3.Value()); },
    graph], { name: 'Q', trace: false, size: 3, Color: 'red' });
var t1 = board.create('tangent', [g1], { trace: false, size: 4, strokeColor: 'red', color: 'orange', strokeWidth: 3 });

var p1 = board.create('point', [
    function () { return s1.Value(); },
    function () { return f(s1.Value()); }
], { trace: false, size: 4, strokeColor: 'violet', color: 'violet' }
)
var p2 = board.create('point', [
    function () { return s2.Value(); },
    function () { return f(s2.Value()); }
], { trace: false, size: 4, Color: 'violet' }
)
*/

let p1 = board.create('point', [
    function () { return s1.Value(); },
    0
], {  name: 'A', trace: false, size: 2, strokeColor: 'violet', color: 'green', face: '[]' }
)
let p2 = board.create('point', [
    function () { return s2.Value(); },
    0
], { name: 'B', trace: false, size: 2, Color: 'green', face: '[]' }
)

let p3 = board.create('point', [
    function () { return s3.Value(); },
    0
], { name: 'C', trace: false, size: 2, Color: 'green', face: '[]' }
)

let p4 = board.create('point', [
    function () { return s4.Value(); },
    0
], { name: 'D', trace: false, size: 2, Color: 'green', face: '[]' }
)


let line1 = board.create('segment', [p1, p2], { trace: false, size: 4, strokeColor: 'green', dash: 0, strokeWidth: 5 })

let line2 = board.create('segment', [p3, p4], { trace: false, size: 4, strokeColor: 'green', dash: 0, strokeWidth: 5 })


//let l = board.create('line', [p1, p2], { trace: false, size: 4, strokeColor: 'violet', dash: 9, strokeWidth: 3 })

/*
s3.on('drag', function () {
    console.log("entra al evento slider3:", t1.getSlope());
    console.log("line:", l.getSlope());

});
*/

function validar() {

    let p1x = p1.X().toFixed(1);
    let p2x = p2.X().toFixed(1);
    let p3x = p3.X().toFixed(1);
    let p4x = p4.X().toFixed(1);
    console.log('abscisa P1: ', p1x)
    console.log('abscisa P2: ', p2x)
    console.log('ordenada P3: ', p3x)
    console.log('ordenadas P4: ', p4x)
    /*
    let pendiente = parseFloat(t1.getSlope().toFixed(1))
    let m1 = parseFloat(((p2y - p1y) / (p2x - p1x)).toFixed(1));
    console.log("La pendiente m1 es: ", pendiente, m1);
    */

    if ((p1x == -1.5) && (p2x == -1.0) && (p3x == 0.0) && (p4x == 1.0)) {
        swal({
            title: "Muy bien!",
            text: "Esos son los intervalos en donde la función es negativa",
            icon: "success"
        });
    } else {
        swal({
            title: "Algo anda mal!",
            text: "Esa unión de intervalos no es correcta",
            icon: "error"
        });
    }
}
