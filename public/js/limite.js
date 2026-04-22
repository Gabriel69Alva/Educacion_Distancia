


let board = JXG.JSXGraph.initBoard('edvi', { boundingbox: [-1, 10, 6, -2.7], axis: true });
let f = function (x) {
    return (Math.pow(x, 2) + 1);
};
let graph = board.create('functiongraph', [f], { strokeColor: '#0000ff', strokeWidth: 2 });

/* Comienza el escenario animado*/

let epsilon = 0;
let p = 0;
let a = 0;
let b = 0;
let limite = 0;
const colorElegido = "orange";
let bandera = false;
let gliders = [];

let inputDelta = 1;

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
    board.create('point', [
        function () { return p; },
        0
    ], { name: ' ', trace: false, size: 1, Color: 'red' }
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
        strokeWidth: 6,                 // Grosor de la linea que representa la vecindad de radio épsilon
        strokeColor: "pink"          // Color de la línea punteada de la franja de radio épsilon
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


function delta() {
    const button = document.getElementById('dibujadelta'); // Botón para dibujar el intervalo de radio delta
    button.style.display = 'none'; // hide the button when it is clicked

    const getInputDelta = document.getElementById('inputVerificaDelta');
    inputDelta = parseFloat(getInputDelta.value)
    console.log("getInputDelta: ", inputDelta)

    const minX = p - inputDelta; // minimum x-coordinate value
    const maxX = p + inputDelta; // maximum x-coordinate value

    //Se crean los puntos en el eje X del intervalo de radio delta

    var p3 = board.create('point', [minX,
        0
    ], { name: ' ', trace: false, size: 1, strokeColor: 'violet', color: 'green', face: 'o' }
    )
    var p4 = board.create('point', [maxX,
        0
    ], { name: ' ', trace: false, size: 1, Color: 'green', face: 'o' }
    )

    board.create('segment', [p3, p4], { trace: false, size: 4, Color: 'green', dash: 0, strokeWidth: 5 })


};


/* Crea los puntos aleatorios en el eje X dentro de la vecindad de radio delta*/

function reload() {
    const button = document.getElementById('boton'); // replace 'myButton' with the actual ID of your button
    button.style.display = 'none'; // hide the button when it is clicked

    board.suspendUpdate();


    const getInputDelta = document.getElementById('inputVerificaDelta');
    inputDelta = parseFloat(getInputDelta.value)
    console.log("getInputDelta: ", inputDelta)

    const minX = p - inputDelta; // minimum x-coordinate value
    const maxX = p + inputDelta; // maximum x-coordinate value


    const points = []; // empty array to store the points
    gliders = [];


    for (let i = 0; i < 3; i++) {
        const randomX = Math.random() * (maxX - minX) + minX;
        let nameX = randomX.toFixed(2);

        const point1 = board.create('point', [randomX, 0], { name: nameX, visible: true, color: "yellow", size: 1, withLabel: false });
        const point2 = board.create('point', [randomX, f(randomX)], { visible: false, size: 1, withLabel: false });
        const point3 = board.create('point', [0, f(randomX)], { visible: false, size: .5, withLabel: false });
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

    // You can now use the 'points' array for further processing
    for (let i = 0; i < points.length; i++) {
        // Perform processing on each point in the 'points' array
        console.log("Processing point at index " + i + ": " + points[i].X());

    }

}

function crearGliders(p1, p2, p3) {

    var segmentY = board.create('segment', [p1, p2], { visible: false, trace: false, size: 4, strokeColor: 'violet', dash: 0, strokeWidth: 3 })
    var segmentX = board.create('segment', [p2, p3], { visible: false, trace: false, size: 4, strokeColor: 'violet', dash: 0, strokeWidth: 3 })

    // Crea un punto A que se puede mover a lo largo de la curva
    const A = board.create('glider', [p1.X(), p1.Y(), segmentY], { size: 1, visible: true, withLabel: false });
    const B = board.create('glider', [p2.X(), p2.Y(), segmentX], { size: 1, visible: false, withLabel: false });
    gliders.push({ A: A, p2: p2, B: B, p3: p3 });
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
