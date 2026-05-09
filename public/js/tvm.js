

// las soluciones son x=0 y x=0.66

let resultMaximo = [-0.10, 0.10];
let resultMini = [0.64, 0.68];

var board = JXG.JSXGraph.initBoard('box', { boundingbox: [-2.3, 2.3, 2.3, -2.3], axis: true });
var f = function (x) {
    return (x * x * x) - x + .5;
};
var graph = board.create('functiongraph', [f], { strokeColor: '#0000ff', strokeWidth: 2 });


var s1 = board.create('slider', [[-1, -1.5], [2, -1.5], [-1.5, 1, 1.5]], { name: 'D' });
var s2 = board.create('slider', [[-1, -1.8], [2, -1.8], [-1.5, 0.5, 1.5]], { name: 'E' });
var s3 = board.create('slider', [[-1, -2.1], [2, -2.1], [-1.5, 1, 1.5]], { name: '&omega;' });

//var c1 = board.create('curve', [function (t) { return t }, function (t) { return t * t * t; }]);
var g1 = board.create('glider', [
    function () { return s3.Value(); },
    function () { return f(s3.Value()); },
    graph], { trace: false, size: 3, Color: 'red' });
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

var p3 = board.create('point', [
    function () { return s1.Value(); },
    0
], {  name: 'D', trace: false, size: 2, strokeColor: 'violet', color: 'green', face: '[]' }
)
var p4 = board.create('point', [
    function () { return s2.Value(); },
    0
], { name: 'E', trace: false, size: 2, Color: 'green', face: '[]' }
)

var p5 = board.create('point', [
    function () { return s3.Value(); },
    0
], { name: '&omega;', trace: false, size: 3, Color: 'red' }
)

var line = board.create('segment', [p3, p4], { trace: false, size: 4, strokeColor: 'green', dash: 0, strokeWidth: 5 })

var lineVertical = board.create('segment', [g1, p5], { trace: false, size: 4, strokeColor: 'red', dash: 2, strokeWidth: 2 })


var l = board.create('line', [p1, p2], { trace: false, size: 4, strokeColor: 'violet', dash: 9, strokeWidth: 3 })


s3.on('drag', function () {
    console.log("entra al evento slider3:", t1.getSlope());
    console.log("line:", l.getSlope());

});


function validar() {

    let p1x = p1.X().toFixed(2);
    let p2x = p2.X().toFixed(2);
    let p1y = p1.Y().toFixed(2);
    let p2y = p2.Y().toFixed(2);
    console.log('abscisa P1: ', p1x)
    console.log('abscisa P2: ', p2x)
    console.log('ordenada P1: ', p1y)
    console.log('ordenadas P2: ', p2y)
    let pendiente = parseFloat(t1.getSlope().toFixed(1))
    let m1 = parseFloat(((p2y - p1y) / (p2x - p1x)).toFixed(1));
    console.log("La pendiente m1 es: ", pendiente, m1);

    if (pendiente === m1) {
        swal({
            title: "Muy bien!",
            text: "Las rectas son paralelas",
            icon: "success"
        });
    } else {
        swal({
            title: "Algo anda mal!",
            text: "Las rectas no son paralelas",
            icon: "error"
        });
    }
}
