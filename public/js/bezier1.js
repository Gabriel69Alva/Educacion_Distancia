
JXG.Options.renderer = "canvas";

var brd = JXG.JSXGraph.initBoard('jxgbox', { boundingbox: [-4, 4, 6, -4], keepaspectratio: true, axis: true });


var p = [];

brd.suspendUpdate();

var p1 = brd.create('point', [-3, 2], {name: 'A', visible: false});
var p2 = brd.create('point', [-3, 5], {name: 'B', visible: false});

var p3 = brd.create('point', [3, 2], {name: 'C', visible: false});
var p4 = brd.create('point', [3, 5], {name: 'D', visible: false});


var l1 = brd.create('line', [p1, p2], {visible: false});
var l2 = brd.create('line', [p3, p4], {visible: false});

var glider1 = brd.create('glider', [-3, 1, l1], {name: 'G', size: 5});
var glider2 = brd.create('glider', [3, 1, l2], {name: 'H', size: 5});
// data point

var p5 =brd.create('point', [-1.5, 2.5], { name: 'P', trace: false, size: 3, Color: 'green', face: '[]' });   // control point
var p6 =brd.create('point', [0.75, 2.5], { name: 'Q', trace: false, size: 3, Color: 'green', face: '[]' });   // control point

    
p.push(glider1);
p.push(p5);
p.push(p6);
p.push(glider2);  


var c = brd.create('curve', JXG.Math.Numerics.bezier(p), { strokeColor: 'blue', strokeOpacity: 0.6, strokeWidth: 5 });


console.log("Los elementos del arreglo p son: " + p);
console.log("La primera coordenada del arreglo p es: " + p[0]);
console.log("Las coordenadas de la curva C son: " + c);

brd.unsuspendUpdate();



