
let board = JXG.JSXGraph.initBoard('edvi', { boundingbox: [-1, 10, 6, -2.7], axis: true });
let f = function (x) {
    return (Math.pow(x, 2) + 1);
};
let graph = board.create('functiongraph', [f], { strokeColor: '#0000ff', strokeWidth: 2 });

/* Comienza el escenario animado*/

let epsilon = 0;
let p = 0;
let a = 0;
//let b = 0;
let limite = 0;
const colorElegido = "orange";
let bandera = false;
let gliders = [];
let glidersDelete = [];
let points = [];
let pointsDelta = [];
let centro = [];

let inputDelta = 1;
let bandera2 = false;



/* Crea el centro de la vecindad de radio delta*/


function validarPunto_x() {
    let inputNumber = document.getElementById("inputPunto").value;
    // Hacer algo con el número ingresado
    console.log("El número ingresado es: " + inputNumber);

    if (inputNumber === "1" || inputNumber === "1.5" || inputNumber === "2") {
        // Llamar a una función y pasarle el número como argumento

        swal({
            title: "De acuerdo",
            text: "El límite a analizar es en el punto " + inputNumber + " del dominio de la función",
            icon: "success"
        });
        //console.log("El límite es: " + parseFloat(numero));

        creaPunto();
    } else {
        swal({
            title: "¡Ups! Revisa el punto a analizar",
            text: "El valor del punto " + inputNumber + " no es correcto",
            icon: "error"

        });
    }
}




function creaPunto() {
    p = parseFloat(document.getElementById("inputPunto").value);
    centro = board.create('point', [
        function () { return p; },
        0
    ], { name: ' ', trace: false, size: 1, Color: 'red' }
    );
    console.log("El valor de p es: " + p);
    console.log("El valor de f(p) es: " + f(p));
    console.log("El centro de la vecindad es: " + centro.X() + " , " + centro.Y());
    return centro.X();
}



function funcionLeerValor() {
    let inputNumber = document.getElementById("inputLimite").value;
    // Hacer algo con el número ingresado
    console.log("El número ingresado es: " + inputNumber);
    // Llamar a una función y pasarle el número como argumento
    funcionValidarLimite(inputNumber);
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


function funcionValidarLimite(numero) {
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
        ], { name: 'límite de la función', trace: false, size: 1, Color: 'red' }
        );


        //Dibuja rectángulo. Sirve para declarar las variables con valores iniciales (comienza con una línea a la altura del valor del límite)

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
            color: "lightgrey"
        });
        p4_epsilon = board.create('point', [7, limite], {
            name: '',
            fixed: true,
            color: "lightgrey"
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
        strokeColor: "green",
        fixed: true
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


    animaLimite();

}

/**
 * This function is responsible for creating a polygon that represents the epsilon value of the limit.
 * It also updates the epsilon value of the limit and the text of the HTML elements with the IDs 'epsilonChange1' and 'epsilonChange2'.
 * @param {void}
 * @return {void}
 */

function changeEpsilon() {
    console.log("hola");

    if (bandera) {
        board.create('polygon', [p1_epsilon, p3_epsilon, p4_epsilon, p2_epsilon], {
            borders: {
                strokeColor: 'blue', // Color of the border of the polygon
                dash: 2 // Dashed line style
            },
            fillOpacity: 0.2, // Opacity of the polygon
            layer: 0, // Layer of the polygon
            fillColor: "purple" // Color of the polygon
        });

        board.create("line", [p1_epsilon, p2_epsilon], {
            straightFirst: false,
            straightLast: false,
            strokeWidth: 6,                 // Grosor de la linea que representa la vecindad de radio épsilon
            strokeColor: "pink",
            fixed: true         // Color de la línea punteada de la franja de radio épsilon
        });

        epsilon = document.getElementById('inputEpsilon').value;

        epsilon = epsilon / 100;
        console.log("epsilon: ", epsilon)


        animaRegion();

    } else {
        limpiarGrafica();

    }
}


//-------------------------Se contruye la vecindad delta-------------------


let s1 = board.create('slider', [[0, -1.5], [2, -1.5], [0, 0, 1]], { name: 'delta' });


let q = board.create('point', [
    function () { return p+s1.Value(); },
    0
], {  name: 'D', trace: false, size: 2, strokeColor: 'violet', color: 'green', face: '[]' }
)
let r = board.create('point', [
    function () { return p-s1.Value(); },
    0
], { name: 'E', trace: false, size: 2, Color: 'green', face: '[]' }
)

let line = board.create('segment', [q, r], { trace: false, size: 4, strokeColor: 'green', dash: 0, layer:1, strokeWidth: 5 })



/*function animaIntervaloDelta(deltaIzq, deltaDer) {

    incX = parseFloat(p) + parseFloat(inputDelta);
    decX = parseFloat(p) - parseFloat(inputDelta);
    deltaIzq.moveTo([decX, 0], 250);      // 250 es la duración en milisegundos de la animación
    deltaDer.moveTo([incX, 0], 250);

    console.log('deltaIzq: ', deltaIzq);

    board.create('segment', [deltaIzq, deltaDer], { trace: false, straightFirst: false, straightLast: false, size: 4, Color: 'green', dash: 0, strokeWidth: 6, strokeColor: "pink", layer: 1 })

};
*/

/*

function changeDelta() {
    //se crean los puntos en el eje X del intervalo de radio delta
    deltaIzq = board.create('point', [p,
        0
    ], { name: ' ', trace: false, size: 1, strokeColor: 'violet', color: 'purple', face: 'o', fixed: true }
    )
    deltaDer = board.create('point', [p,
        0
    ], { name: ' ', trace: false, size: 1, Color: 'purple', face: 'o', fixed: true }
    )

    if (pointsDelta.length > 0) {
        deletePoints(pointsDelta);
        board.unsuspendUpdate();

    }

    pointsDelta = [];
    pointsDelta.push(deltaIzq)
    pointsDelta.push(deltaDer)

    let getInputDelta = document.getElementById('inputDelta');
    inputDelta = parseFloat(getInputDelta.value) / 100;
    console.log("getInputDelta: ", inputDelta)
    console.log("El punto deltaIzq vale exactamente: ", deltaIzq)
    console.log("delta vale: ", inputDelta)

    animaIntervaloDelta(deltaIzq, deltaDer);

}

*/

/* Crea los puntos aleatorios en el eje X dentro de la vecindad de radio delta*/

function reload() {

    //points = []; // empty array to store the points
    //gliders = [];
    //glidersDelete = []

    //board.suspendUpdate();


    minX = p - s1.Value(); // minimum x-coordinate value
    maxX = p + s1.Value(); // maximum x-coordinate value



    for (let i = 0; i < 3; i++) {
        const randomX = Math.random() * (maxX - minX) + minX;
        let nameX = randomX.toFixed(2);

        const point1 = board.create('point', [randomX, 0], { name: nameX, visible: true, color: "yellow", size: 1, withLabel: false, fixed: true, layer: 2 });
        const point2 = board.create('point', [randomX, f(randomX)], { visible: false, size: 1, withLabel: false, fixed: true });
        const point3 = board.create('point', [0, f(randomX)], { visible: false, size: .5, withLabel: false, fixed: true });
        points.push(point1); // add the point to the array
        console.log(point1.X());
        console.log("El valor de i es: " + i);
        crearGliders(point1, point2, point3);
        //crearGliders(point1, point2);
        // point1.setAttribute({size: 1});


        point1.setAttribute({
            labelOffset: [0, -20]  // Ajusta la posición de la etiqueta para moverla hacia abajo
        });
        board.update();
    }

    board.unsuspendUpdate();


}


function crearGliders(p1, p2, p3) {

    var segmentY = board.create('segment', [p1, p2], { visible: false, trace: false, size: 4, strokeColor: 'violet', dash: 0, strokeWidth: 3, fixed: true })
    var segmentX = board.create('segment', [p2, p3], { visible: false, trace: false, size: 4, strokeColor: 'violet', dash: 0, strokeWidth: 3, fixed: true, })

    // Crea un punto A que se puede mover a lo largo del eje x y crea un punto B que se puede mover a lo largo del eje y.
    const A = board.create('glider', [p1.X(), p1.Y(), segmentY], { size: 1, visible: true, withLabel: false, fixed: true, });
    const B = board.create('glider', [p2.X(), p2.Y(), segmentX], { size: 1, visible: false, withLabel: false, fixed: true, });
    gliders.push({ A: A, p2: p2, B: B, p3: p3 });
    glidersDelete.push(A)
    glidersDelete.push(B)
    glidersDelete.push(p2)
    glidersDelete.push(p3)
    //A.on('down', iniciarAnimation(A, B));
}

board.on('down', function (e) {
    // Obtiene las coordenadas del clic en términos del sistema de coordenadas del tablero
    var coords = board.getUsrCoordsOfMouse(e);
    let coordenadasX1 = coords[0];

    let coordenadasY1 = coords[1];
    margen = .05;
    gliders.map(item => {

        if ((coordenadasX1 <= (item.A.X() + margen) && coordenadasX1 >= (item.A.X() - margen)) && (coordenadasY1 <= (item.A.Y() + margen) && coordenadasY1 >= (item.A.Y() - margen))) {
            console.log(item.A.X(), ' === ', coordenadasX1, ' && ', item.A.Y(), ' === ', coordenadasY1)
            iniciarAnimationPuntos(item.A, item.p2, item.B, item.p3);
        }

    })
});




let iniciarAnimationPuntos = (A, p2, B, p3) => {
    animatePointA(A, p2).then((message) => {
        console.log(message); // Se imprime cuando la animación ha terminado
        B.setAttribute({ visible: true });
        A.setAttribute({ visible: false });
        animatePointB(B, p3).then((message) => {
            console.log(message); // Se imprime cuando la animación ha terminado
            B.setAttribute({ visible: true });
            A.setAttribute({ visible: false });

        });
    });

}




// Función para animar el punto A a la posición de B
let animatePointA = (A, p2) => {
    return new Promise((resolve, reject) => {
        console.log('Coordenadas del punto A:', A.X(), A.Y());

        // Iniciar la animación
        A.moveTo([p2.X(), p2.Y()], 3000);

        // Resolver la promesa después de 3000 milisegundos (duración de la animación)
        setTimeout(() => {
            board.update();
            resolve("Animación completada");
        }, 3000);
    });
};

let animatePointB = (B, p3) => {
    return new Promise((resolve, reject) => {
        console.log('Coordenadas del punto B:', B.X(), B.Y());
        console.log('Coordenadas del punto p3:', p3.X(), p3.Y());
        // Iniciar la animación
        B.moveTo([p3.X(), p3.Y()], 3000);

        // Resolver la promesa después de 3000 milisegundos (duración de la animación)
        setTimeout(() => {
            board.update();
            resolve("Animación completada");
        }, 3000);
    });
};

function limpiarGrafica() {
    while (board.objects.length > 0) {
        board.removeObject(board.objects[0]); // Elimina el primer objeto en cada iteración
    }
    board.update(); // Actualiza el tablero
}

function deletePoints(params) {
    params.forEach(element => {
        board.removeObject(element);
    });

}

/*
function nuevaDelta() {

    const inputNuevaDelta = document.getElementById('inputDelta');
    inputNuevaDelta.value = '0';

    console.log("points: ", points);
    inputNuevaDelta

    deletePoints(points);
    deletePoints(pointsDelta);

    console.log("glidersDelete: ", glidersDelete);
    deletePoints(glidersDelete);
    //board.update();
    board.unsuspendUpdate();
    board.update();

}
*/
