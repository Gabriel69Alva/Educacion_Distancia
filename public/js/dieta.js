
/*  <math> (a_n)_{n\in{\mathbb N}}</math> */

var board;
var seq;
var t;
var n = 0;
var c;
var w;
var txt1;
var f;

board = JXG.JSXGraph.initBoard('box1', { axis: true, boundingbox: [-30, 400, 400, -30] });


var seq_add = function () {
    console.log("c w n : ", c, w, t)
    var imagen = ((c / 40) + ((w - (c / 40)) * (Math.exp(-0.0052 * n))));
    console.log("y: ", imagen, " x: ", n)
    seq.dataX.push(n);
    seq.dataY.push(imagen);
    n++;
};

var TO;

var approx = function () {
    seq_add();
    board.update();
    if (n <= t) {
        TO = setTimeout(approx, 100);
    }
};

var start_approx = function () {
    console.log("entro")
    seq.dataX = [];
    seq.dataY = [];
    approx();
}

var clear_all = function () {
    clearTimeout(TO);
};

function onCalcular() {
    const calorias = document.getElementById("calorias").value;
    const peso = document.getElementById("peso").value;
    const dias = document.getElementById("dias").value;
    console.log("valores: ", calorias, peso, dias)
    //nInicial = parseInt(dias);
    t = parseInt(dias);
    c = parseInt(calorias);
    w = parseInt(peso);
    clear_all();

    board = JXG.JSXGraph.initBoard('box1', { axis: true, boundingbox: [-30, w + 30, t, -30] });
    seq = board.create('curve', [[], []], { strokeColor: 'blue', strokeWidth: 2 });
    txt1 = board.create('text', [3, w-3, function () { return 'n=' + (seq.dataX.length - 1) + ': Peso = ' + seq.dataY[seq.dataY.length - 1]; }], { strokeColor: 'blue' });

    f = board.create('functiongraph', [function (x) { return (x*0) + c/40} , 0, t ], {strokeColor: 'red', dash: 2});
    txt2 = board.create('text', [3, 2+(c/40), function () { return  'límite = ' + c/40; }], { strokeColor: 'red' });
   
    start_approx();

}



