JXG.Options.board.minimizeReflow = 'none'

var board = JXG.JSXGraph.initBoard('edvi', {
	boundingbox: [-1, 4, 20, -1], //xmin,ymax,xmax,ymin			
	keepaspectratio: false,
	axis: false,
	grid: false,
	showCopyright: false,
	zoomX: 1.2,  //En PC y iPad 1.5 es suficiente
	zoomY: 1.2,  //En PC y iPad 1.5 es suficiente
	showNavigation: true,
	needsRegularUpdate: false,
	fixed: true,
	numberPointsLow: 100,
	numberPointsHigh: 100,
	pan: {
		needShift: false,
		needTwoFingers: false,
		enabled: false
	},
	zoom: {
		factorX: 1,
		factorY: 1,
		wheel: false,
	}
});

//-----------------------------Dibuja ejes----------------------//

var ejeX = board.create('axis', [[0, 0], [1, 0]], {

	ticks: {
		drawZero: false,
		ticksDistance: 0.5,
		minorTicks: 5,
		majorHeight: 10,
		label: { offset: [-5, -15] }
	}

});

ejeX.removeAllTicks();

board.create('ticks', [ejeX, 1], { // The number here is the distance between Major ticks
	grid: false,
	strokeColor: '#ccc',
	majorHeight: 12, // Need this because the JXG.Options one doesn't apply
	drawLabels: true, // Needed, and only works for equidistant ticks
	label: { offset: [-4, -15] },
	minorTicks: 0, // The NUMBER of small ticks between each Major tick
	drawZero: false
}
);

var ejeY = board.create('axis', [[0, 0], [0, 1]], {

	ticks: {
		minorTicks: 5,
		ticksDistance: 0.1,
		majorHeight: 20,
		label: { offset: [-30, -1] },
		drawZero: false
	}

});

/* Comienza el escenario animado*/

var epsilon = 0;

lim=0;

/*limite= document.getElementById('limiteSucesion').value;
console.log("valor de l:", l); */

var colorElegido = "orange";

//---------------------------Dibuja rectángulo --------------------//

var p1_epsilon = board.create('point', [0, lim], {
	name: '',
	fixed: true,
	color: "lightgrey",
	size: 3,
});
var p2_epsilon = board.create('point', [0, lim], {
	name: '',
	fixed: true,
	color: "lightgrey",
	size: 3,
});

var p3_epsilon = board.create('point', [30, lim], {
	name: '',
	fixed: true,
	color: "#ffffff"
});
var p4_epsilon = board.create('point', [30, lim], {
	name: '',
	fixed: true,
	color: "#ffffff"
});

function animaLimite() {
	console.log("entro anima limite");     // Anima la línea del límite L=1
	board.create("line", [[0, lim], [30, lim]], {
		straightFirst: false,
		straightLast: false,
		strokeWidth: 1,
		strokeColor: "green"
	});
}

//--------------------------Anima la sucesión---------------------//

function animaSucesion() {
	console.log("anima sucesion");

	(async () => {
		for (let i = 1; i < 18; i++) {
			await new Promise(resolve => setTimeout(() => {
				board.create('point', [i, function (x) {
					return 1 / i ;
				}], { name: ' ', color: colorElegido, strokeWidth: 1 });      // name es para ponerle nombre a los puntos de la sucesión
				resolve();
			}, 300));     // velocidad de la animación
		}
	})();

}

//-------------------------Anima la región-------------------//

function animaRegion() {
	incY = parseFloat(lim) + parseFloat(epsilon);
	decY = parseFloat(lim) - parseFloat(epsilon);
	p1_epsilon.moveTo([0, incY], 250);      // 250 es la duración en milisegundos de la animación
	p2_epsilon.moveTo([0, decY], 250);
	p3_epsilon.moveTo([30, incY], 250);      // 250 es la duración en milisegundos de la animación
	p4_epsilon.moveTo([30, decY], 250);


	board.create("line", [[0, incY], [0, decY]], {
		straightFirst: false,
		straightLast: false,
		strokeWidth: 4,                 // Grosor de la linea que representa la vecindad de radio épsilon
		strokeColor: "#0b0eb3"          // Color de la línea punteada de la franja de radio épsilon
	});
	animaLimite();
}

function changeEpsilon() {

	board.create('polygon', [p1_epsilon, p3_epsilon, p4_epsilon,  p2_epsilon], {
		borders: {
			strokeColor: 'blue',
			dash: 2,
	
		},
		fillOpacity: 0.5,
		fillColor: "purple",   // Color de la franja de radio épsilon
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

}

function ejecutarSucesion() {
	
	animaSucesion();
	MathJax.typeset();
}

function ejecutarValidacionN() {
	var valida_N= document.getElementById("inputVerificaN");
    let NInicio = parseInt(valida_N.value); 
	var valorValidar = (1 / epsilon);
	console.log(valorValidar);
	
	if (valorValidar < parseFloat(valida_N.value)) {
		
		swal({
			title: "Muy bien!",
			text: "El valor " + valida_N.value + " es correcto.",
			icon: "success"
		});
        //Coordenadas del polígono gris cuyo inicio es el valor de N en eje x.
		incy = parseFloat(lim) + parseFloat(epsilon);
		decy = parseFloat(lim) - parseFloat(epsilon);
		board.create('polygon', [[NInicio , decy], [NInicio, incy], [30, incy], [30, decy]], {
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


function limpiarGrafica() {
	while (board.objects.length > 0) {
		board.removeObject(board.objects[0]); // Elimina el primer objeto en cada iteración
	}
	board.update(); // Actualiza el tablero
}

