

let board = JXG.JSXGraph.initBoard('edvi', { boundingbox: [-1, 7.5, 6, -2.7], axis: true });
let f = function (x) {
    return (Math.pow(x,2)+1 );
};
let graph = board.create('functiongraph', [f], { strokeColor: '#0000ff', strokeWidth: 2 });

/* Comienza el escenario animado*/

let epsilon = 0;
let p = 0;
let a=0;
let b=0;
let limite = 0;
const colorElegido = "orange";
let bandera = false;

/* Crea el centro de la vecindad de radio delta*/

function creaPunto() {
    p = parseFloat(document.getElementById("inputPunto").value);  
    a = board.create('point', [
        function () { return p; },
        0
    ], { name: 'x_0', trace: false, size: 1, Color: 'red' }
    );
    console.log("El valor de p es: " + p);
    console.log("El valor de f(p) es: " + f(p));
}

function funcionLeerValor() {
    let inputNumber = document.getElementById("inputLimite").value;
    // Hacer algo con el número ingresado
    console.log("El número ingresado es: " + inputNumber);
    // Llamar a una función y pasarle el número como argumento
    funcionValidar(inputNumber);
}


//--------------------------- Dibuja rectángulo inicial de área cero (sobre el eje X)--------------------//

var p1_epsilon = board.create('point', [0, 0], {
    name: '',
    fixed: true,
    color: "lightgrey",
    size: 3,
});
var p2_epsilon = board.create('point', [0, 0], {
    name: '',
    fixed: true,
    color: "lightgrey",
    size: 3,
});

var p3_epsilon = board.create('point', [7, 0], {
    name: '',
    fixed: true,
    color: "#ffffff"
});
var p4_epsilon = board.create('point', [7, 0], {
    name: '',
    fixed: true,
    color: "#ffffff"
});


function funcionValidar(numero) {
    // Hacer algo con el número recibido
   
    limite = f(p);
    console.log("El valor del límite es: " + limite);
    console.log("El valor del f(p) es: " + f(p));

    if (limite === parseFloat(numero)) {

        bandera = true;

        console.log("bandera: ", bandera);

        b = board.create('point', [
            function () { return p; },
            f(p)
        ], { name: 'límite', trace: false, size: 1, Color: 'red' }
        );
        

        //---------------------------Dibuja rectángulo (comienza con una línea a la altura del valor del límite) --------------------//

        p1_epsilon = board.create('point', [0, limite], {
            name: '',
            fixed: true,
            color: "lightgrey",
            size: 3,
        });
        p2_epsilon = board.create('point', [0, limite], {
            name: '',
            fixed: true,
            color: "lightgrey",
            size: 3,
        });

        p3_epsilon = board.create('point', [7, limite], {
            name: '',
            fixed: true,
            color: "#ffffff"
        });
        p4_epsilon = board.create('point', [7, limite], {
            name: '',
            fixed: true,
            color: "#ffffff"
        });

        swal({
            title: "Muy bien!",
            text: "El límite " + limite + " es correcto.",
            icon: "success"
        });
        console.log("El límite es: " + parseFloat(numero));

    } else {
        swal({
            title: "Ups! Revisa tus cálculos!",
            text: "El valor del límite " + parseFloat(numero) + " no es correcto.",
            icon: "error"

        });
        limite = 0;
        limpiarGrafica();

    }

}

function animaLimite() {
    console.log("entro anima limite");     // Anima la línea del límite L=1
    board.create("line", [[0, limite], [7, limite]], {
        straightFirst: false,
        straightLast: false,
        strokeWidth: 1,
        strokeColor: "green"
    });

}

//-------------------------Anima la región-------------------//

function animaRegion() {

    incY = parseFloat(limite) + parseFloat(epsilon);
    decY = parseFloat(limite) - parseFloat(epsilon);
    p1_epsilon.moveTo([0, incY], 250);      // 250 es la duración en milisegundos de la animación
    p2_epsilon.moveTo([0, decY], 250);
    p3_epsilon.moveTo([7, incY], 250);      // 250 es la duración en milisegundos de la animación
    p4_epsilon.moveTo([7, decY], 250);

    board.create("line", [[0, incY], [0, decY]], {
        straightFirst: false,
        straightLast: false,
        strokeWidth: 4,                 // Grosor de la linea que representa la vecindad de radio épsilon
        strokeColor: "#0b0eb3"          // Color de la línea punteada de la franja de radio épsilon
    });
    animaLimite();

}

//-------------------------Se crea el polígono-------------------//
function changeEpsilon() {
    console.log("hola");

    if (bandera) {
        board.create('polygon', [p1_epsilon, p3_epsilon, p4_epsilon, p2_epsilon], {
            borders: {
                strokeColor: 'blue',
                dash: 2,

            },
            fillOpacity: 0.2,
            layer: 0,
            fillColor: "lightgrey",   // Color de la franja de radio épsilon
        });

        var inputE = document.getElementById('inputEpsilon').value;
        epsilon = document.getElementById('inputEpsilon').value;
        console.log("epsilon: ", inputE)

        var epsilonChange1 = document.getElementById('epsilonChange1');
        var epsilonChange2 = document.getElementById('epsilonChange2');

        if (epsilonChange1 && epsilonChange2) {
            epsilonChange1.innerHTML = inputE;
            epsilonChange2.innerHTML = inputE;
        } else {
            console.error("No se encontró el elemento con el id 'epsilonChange1'.");
        }
        animaRegion();

    } else {
        limpiarGrafica();

    }
}

let slider = board.create('slider', [[0.5, -1.5], [3, -1.5], [0, 0, 2.0]], { name: '&delta;' });

let puntoRadio1 = board.create('point', [
    function () { return p+slider.Value(); },
    0
], { name: 'p+&delta;', trace: false, size: 1, Color: 'red' }
);

let puntoRadio2 = board.create('point', [
    function () { return p-slider.Value(); },
    0
], { name: 'p-&delta;', trace: false, size: 1, Color: 'red' }
);

let g1 = board.create('glider', [
    function () { return p+slider.Value(); },
    function () { return f(p+slider.Value()); },
    graph], { name: 'R', trace: false, size: 1, Color: 'red' }
);

let g2 = board.create('glider', [
    function () { return p-slider.Value(); },
    function () { return f(p-slider.Value()); },
    graph], { name: 'Q', trace: false, size: 1, Color: 'red' }
);

let lineaVertical1 = board.create('segment', [puntoRadio1,g1], { trace: false, size: 1, strokeColor: 'red', dash: 2, strokeWidth: 1 });
let lineaVertical2 = board.create('segment', [puntoRadio2,g2], { trace: false, size: 1, strokeColor: 'red', dash: 2, strokeWidth: 1 });


/*-------------------------Se crea las rectas horizontales a la altura  f(p+&delta); y f(p-&delta);-------------------*/
let punto1 = board.create('point', [
      0,
    function () { return f(p+slider.Value());}
], { name: '', trace: false, size: 1, Color: 'red' }
);

let punto2 = board.create('point', [
    0,
  function () { return f(p-slider.Value());}
], { name: '', trace: false, size: 1, Color: 'red' }
);

let lineaVertical3 = board.create('segment', [g1,punto1], { trace: false, size: 1, strokeColor: 'red', dash: 2, strokeWidth: 1 });
let lineaVertical4 = board.create('segment', [g2,punto2], { trace: false, size: 1, strokeColor: 'red', dash: 2, strokeWidth: 1 });

/* Se crea el poligono que representa la vecindad de radio &delta; */
let poligono = board.create('polygon', [punto1, punto2, g2, puntoRadio2, puntoRadio1, g1], {
    borders: {
    strokeColor: 'pink',
    dash: 2},
    fillOpacity: 0.7,
    layer: 1,
    fillColor: "purple",   // Color de la franja de radio épsilon

});


function ejecutarValidacionN() {
    if (bandera) {
        var valida_N = document.getElementById("inputVerificaN");
        let NInicio = parseInt(valida_N.value);
        var valorValidar = ((1-epsilon) / epsilon);
        console.log(valorValidar);

        if (valorValidar < parseFloat(valida_N.value)) {

            swal({
                title: "Muy bien!",
                text: "El valor " + valida_N.value + " es correcto.",
                icon: "success"
            });
            //Coordenadas del polígono gris cuyo inicio es el valor de N en eje x.
            incy = parseFloat(limite) + parseFloat(epsilon);
            decy = parseFloat(limite) - parseFloat(epsilon);
            board.create('polygon', [[NInicio, decy], [NInicio, incy], [30, incy], [30, decy]], {
                borders: {
                    strokeColor: 'black',
                    dash: 2,
                },
                fillOpacity: 0.5,
                fillColor: "pink",
                vertices: { visible: false }
            });


        } else {
            swal({
                title: "Ups! Revisa tus cálculos!",
                text: "El valor " + valida_N.value + " no es correcto.",
                icon: "error"
            });
        }
        limpiarGrafica();

    }

}

function limpiarGrafica() {
    while (board.objects.length > 0) {
        board.removeObject(board.objects[0]); // Elimina el primer objeto en cada iteración
    }
    board.update(); // Actualiza el tablero
}
// Haz una función que sume dos números

