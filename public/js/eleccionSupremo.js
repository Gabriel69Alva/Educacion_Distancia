// ==========================================
// ESTADO Y REGISTRO DE DATOS (TELEMETRÍA)
// ==========================================
let stats = {
    intentosAlpha: 0,
    erroresTeoria: 0,
    intentosPuntoX: 0,
    tiempoInicio: Date.now()
};

var board = JXG.JSXGraph.initBoard("boxSupremoDerecha", {
    boundingbox: [-1, 3, 7, -2],
    axis: true,
    showCopyright: false
});

let puntoFinalSupremo; 
let ultimoLimiteX;
let faseActual = 1; 

function generarConjuntoA() {
    let inicio = 0.5;
    const numIntervalos = Math.floor(Math.random() * 2) + 1; 
    for (let i = 0; i < numIntervalos; i++) {
        let ancho = 1 + Math.random() * 1.5;
        let fin = inicio + ancho;
        if (i === numIntervalos - 1) {
            let p1 = board.create('point', [inicio, 0], {visible: false});
            puntoFinalSupremo = board.create('point', [fin, 0], {visible: false});
            ultimoLimiteX = fin;
            board.create('segment', [p1, puntoFinalSupremo], {
                strokeColor: '#3498db', strokeWidth: 8, name: 'A', withLabel: true
            });
        } else {
            board.create('segment', [[inicio, 0], [fin, 0]], {strokeColor: '#3498db', strokeWidth: 8});
        }
        inicio = fin + 0.8; 
    }
}
generarConjuntoA();

let alpha = board.create('glider', [1, 0, board.create('line', [[0,0], [7,0]], {visible: false})], {
    name: '&alpha;', color: 'green', size: 5, label: {fontWeight: 'bold'}
});

const sliderDelta = board.create('slider', [[1, -1], [4, -1], [0, 0, 1.2]], {
    name: '&delta;', visible: false 
});

let pIzq = board.create('point', [() => alpha.X() - sliderDelta.Value(), 0], {visible: false});
let pDer = board.create('point', [() => alpha.X() + sliderDelta.Value(), 0], {visible: false});
let vecindad = board.create('segment', [pIzq, pDer], {
    strokeColor: 'purple', strokeWidth: 6, opacity: 0.5, visible: false
});

let puntoContradiccion = null;

// ==========================================
// LÓGICA DE FASES Y RECOLECCIÓN
// ==========================================

function validarSupremoDerecha() {
    if (faseActual === 1) faseUbicacion();
    else if (faseActual === 3) faseContradiccion();
}

function faseUbicacion() {
    if (Math.abs(alpha.X() - ultimoLimiteX) > 0.07) {
        stats.intentosAlpha++; // REGISTRO
        Swal.fire('Revisa', '¿Es ese punto el supremo de A?', 'question');
    } else {
        faseActual = 2;
        lanzarPreguntaTeorica();
    }
}

function lanzarPreguntaTeorica() {
    Swal.fire({
        title: 'Ley de Conservación del Signo',
        html: `Si suponemos que <b>f(α) < 0</b> y f es continua en α, entonces:`,
        input: 'radio',
        inputOptions: {
            '1': 'f(x) será positiva en todas las vecindades alrededor de α.',
            '2': 'Existe una vecindad V de α donde f(x) < 0 para todo x ∈ V.',
            '3': 'f(x) será cero en los puntos cercanos a α.'
        },
        confirmButtonText: 'Responder'
    }).then((result) => {
        if (result.value === '2') {
            Swal.fire('¡Correcto!', 'Ahora visualiza la vecindad moviendo el deslizador &delta.', 'success');
            sliderDelta.setAttribute({visible: true});
            vecindad.setAttribute({visible: true});
            faseActual = 3;
            configurarClickContradiccion();
        } else {
            stats.erroresTeoria++; // REGISTRO
            Swal.fire('Incorrecto', 'Revisa la propiedad de conservación de signo.', 'error').then(lanzarPreguntaTeorica);
        }
    });
}

function configurarClickContradiccion() {
    board.on('down', function(e) {
        if (faseActual !== 3 || sliderDelta.Value() < 0.1) return;
        let coords = getMouseCoords(e);
        if (Math.abs(coords.usrCoords[2]) < 0.5 && coords.usrCoords[1] >= pIzq.X() && coords.usrCoords[1] <= pDer.X()) {
            if (puntoContradiccion) board.removeObject(puntoContradiccion);
            puntoContradiccion = board.create('point', [coords.usrCoords[1], 0], {
                name: 'x_0', color: 'red', size: 4
            });
        }
    });
}

function faseContradiccion() {
    if (!puntoContradiccion || puntoContradiccion.X() <= alpha.X()) {
        stats.intentosPuntoX++; // REGISTRO
        Swal.fire('Analiza', 'Necesitas un punto que rompa la cota superior.', 'warning');
        return;
    }

    // Animación y Fin
    alpha.setAttribute({color: 'orange', name: 'α (Supremo invalidado)'});
    puntoFinalSupremo.moveTo([puntoContradiccion.X(), 0], 1800, {effect: '<>'});

    const tiempoFinal = ((Date.now() - stats.tiempoInicio) / 1000).toFixed(1);

    setTimeout(() => {
        Swal.fire({
            title: '¡Demostración Finalizada!',
            html: `
                <div style="text-align: left; background: #f9f9f9; padding: 10px; border-radius: 5px; font-size: 0.8rem;">
                    <b>Reporte para la investigación:</b><br>
                    • Intentos para ubicar α: ${stats.intentosAlpha}<br>
                    • Errores en Ley de Conservación: ${stats.erroresTeoria}<br>
                    • Intentos de punto de contradicción: ${stats.intentosPuntoX}<br>
                    • Tiempo total: ${tiempoFinal} segundos
                </div>
                <br>Has demostrado la contradicción con éxito.`,
            icon: 'success'
        });
    }, 3000);
}

function getMouseCoords(e) {
    let cPos = board.getCoordsTopLeftCorner(e), absPos = JXG.getPosition(e);
    return new JXG.Coords(JXG.COORDS_BY_SCREEN, [absPos[0] - cPos[0], absPos[1] - cPos[1]], board);
}