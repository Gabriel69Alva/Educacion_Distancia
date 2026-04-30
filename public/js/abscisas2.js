
// ==========================================
// CONFIGURACIÓN Y ESTADO DEL JUEGO
// ==========================================
const GAME_CONFIG = {
  maxScore: 3,
  maxMistakes: 3,
  boundingBox: [-5, 5, 5, -5], // [x1, y1, x2, y2]
  toleranceY: 0.5 // Tolerancia para considerar clic en eje X
};

let state = {
  score: 0,
  mistakes: 0,
  gameActive: true,
  currentFunction: null,
  selectedCandidate: null // Punto seleccionado por el usuario antes de validar
};

// ==========================================
// INICIALIZACIÓN DEL TABLERO
// ==========================================

// Configuración global de estilos para asegurar visibilidad en fondo negro
JXG.Options.axis.strokeColor = 'white';
JXG.Options.axis.ticks.strokeColor = 'white';
JXG.Options.axis.label.strokeColor = 'white';
JXG.Options.text.strokeColor = 'white';
JXG.Options.text.fontSize = 14;

var board = JXG.JSXGraph.initBoard("box", {
  boundingbox: GAME_CONFIG.boundingBox,
  axis: false, // Desactivamos el eje automático para crearlo manualmente con estilo
  showCopyright: false,
  keepaspectratio: false
});

// Crear ejes manualmente para asegurar color blanco
var xaxis = board.create('axis', [[0, 0], [1, 0]], {
  name: 'x',
  withLabel: true,
  label: { position: 'rt', offset: [-15, 20], strokeColor: 'white' },
  strokeColor: 'white',
  ticks: { strokeColor: 'white', label: { strokeColor: 'white' } }
});

var yaxis = board.create('axis', [[0, 0], [0, 1]], {
  name: 'y',
  withLabel: true,
  label: { position: 'rt', offset: [-20, 0], strokeColor: 'white' },
  strokeColor: 'white',
  ticks: { strokeColor: 'white', label: { strokeColor: 'white' } }
});

// Limpiar el tablero y generar primera función
initLevel();

// ==========================================
// LÓGICA DE GENERACIÓN DE FUNCIONES
// ==========================================
function generateFunction() {
  const types = ['quadratic', 'cubic', 'rational'];
  const type = types[Math.floor(Math.random() * types.length)];

  let funcObj = { type: type, f: null, def: '' };

  if (type === 'quadratic') {
    let r1 = getRandomInt(-4, 4);
    let r2 = getRandomInt(-4, 4);
    while (r1 === r2) r2 = getRandomInt(-4, 4);
    let a = Math.random() > 0.5 ? 0.5 : -0.5;

    funcObj.f = function (x) { return a * (x - r1) * (x - r2); };
    funcObj.def = `Quadratic (Roots: ${r1}, ${r2})`;

  } else if (type === 'cubic') {
    let r1 = getRandomInt(-3, 3);
    let r2 = getRandomInt(-3, 3);
    let r3 = getRandomInt(-3, 3);
    let a = 0.2 * (Math.random() > 0.5 ? 1 : -1);

    funcObj.f = function (x) { return a * (x - r1) * (x - r2) * (x - r3); };
    funcObj.def = `Cubic (Roots: ${r1}, ${r2}, ${r3})`;

  } else { // rational
    let h = getRandomInt(-2, 2);
    let k = getRandomInt(-2, 2);
    let a = (Math.random() > 0.5 ? 1 : -1) * getRandomInt(1, 2);

    funcObj.asymptote = h;
    funcObj.f = function (x) {
      if (Math.abs(x - h) < 0.05) return NaN;
      return a / (x - h) + k;
    };
    funcObj.def = `Rational (Asymp: ${h})`;

    // Dibujar asíntota
    board.create('line', [[h, 0], [h, 1]], { dash: 2, strokeColor: 'gray', strokeWidth: 1, fixed: true, isDynamic: true });
  }

  return funcObj;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ==========================================
// CONTROL DEL NIVEL
// ==========================================
function initLevel() {
  // Limpiar estado de selección
  state.selectedCandidate = null;

  // Limpiar elementos dinámicos por etiqueta
  let objectsToRemove = [];
  for (let el in board.objects) {
    let obj = board.objects[el];
    if (obj.getAttribute('isDynamic')) {
      objectsToRemove.push(obj);
    }
  }

  objectsToRemove.forEach(obj => {
    board.removeObject(obj);
  });

  // Generar nueva función
  state.currentFunction = generateFunction();

  // Dibujar gráfica con tag isDynamic
  board.create('functiongraph', [state.currentFunction.f], {
    strokeColor: '#8f0dece2',
    strokeWidth: 3,
    isDynamic: true
  });
}

// ==========================================
// INTERACCIÓN (SELECCIÓN)
// ==========================================
function getMouseCoords(e, i) {
  var cPos = board.getCoordsTopLeftCorner(e, i),
    absPos = JXG.getPosition(e, i),
    dx = absPos[0] - cPos[0],
    dy = absPos[1] - cPos[1];

  return new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], board);
}

function downHandler(e) {
  if (!state.gameActive) return;

  var i, coords;
  if (e[JXG.touchProperty]) {
    i = 0;
  }
  coords = getMouseCoords(e, i);

  let x = coords.usrCoords[1];
  let y = coords.usrCoords[2];

  // Verificar que el clic sea cercano al Eje X
  if (Math.abs(y) > GAME_CONFIG.toleranceY) {
    Swal.fire({
      icon: 'info',
      title: 'Atención',
      text: 'Debes hacer clic sobre el Eje X, no sobre la gráfica.',
      timer: 1500,
      showConfirmButton: false
    });
    return;
  }

  // Actualizar o crear punto candidato
  if (state.selectedCandidate) {
    // Mover existente
    state.selectedCandidate.setPosition(JXG.COORDS_BY_USER, [x, 0]);
  } else {
    // Crear nuevo (Punto ROJO o NARANJA indicando "Selección")
    state.selectedCandidate = board.create('point', [x, 0], {
      name: '?',
      color: 'orange',
      size: 4,
      fixed: false, // Permitir arrastre fino si se desea
      isDynamic: true
    });
  }
}

// ==========================================
// VALIDACIÓN (BOTÓN)
// ==========================================
function validar() {
  if (!state.gameActive) return;

  if (!state.selectedCandidate) {
    Swal.fire({
      icon: 'warning',
      title: '¡Espera!',
      text: 'Primero debes hacer clic en el eje X para seleccionar un punto.',
    });
    return;
  }

  let x = state.selectedCandidate.X();
  let f = state.currentFunction.f;
  let val = f(x);

  // Chequeo de seguridad
  if (isNaN(val) || !isFinite(val)) {
    return;
  }

  if (val < 0) {
    handleCorrect();
  } else {
    handleIncorrect();
  }
}

function handleCorrect() {
  state.score++;
  updateHUD();

  state.selectedCandidate.setAttribute({ color: 'green', name: '✔' });

  Swal.fire({
    icon: 'success',
    title: '¡Correcto!',
    text: 'La función es negativa en este punto.',
    timer: 1500,
    showConfirmButton: false
  }).then(() => {
    checkGameStatus(true);
  });
}

function handleIncorrect() {
  state.mistakes++;
  updateHUD();

  state.selectedCandidate.setAttribute({ color: 'red', name: '✘' });

  Swal.fire({
    icon: 'error',
    title: 'Incorrecto',
    text: 'Aquí la función es positiva (f(x) > 0).',
    timer: 1500,
    showConfirmButton: false
  }).then(() => {
    checkGameStatus(false);
  });
}

function checkGameStatus(roundWin) {
  if (state.score >= GAME_CONFIG.maxScore) {
    endGame(true);
  } else if (state.mistakes >= GAME_CONFIG.maxMistakes) {
    endGame(false);
  } else {
    // Pasar al siguiente nivel (Nueva función)
    initLevel();
  }
}


// ==========================================
// UI & GAME LOOP
// ==========================================
function updateHUD() {
  document.getElementById('score').innerText = state.score;
  document.getElementById('mistakes').innerText = state.mistakes;
}

function endGame(win) {
  state.gameActive = false;
  let title = win ? "¡Felicidades!" : "Juego Terminado";
  let text = win ? "Has completado los 3 desafíos." : "Has acumulado 3 errores.";
  let icon = win ? "success" : "error";

  Swal.fire({
    title: title,
    text: text,
    icon: icon,
    confirmButtonText: 'Reiniciar'
  }).then((result) => {
    if (result.isConfirmed) {
      reiniciarJuego();
    }
  });
}

function reiniciarJuego() {
  state.score = 0;
  state.mistakes = 0;
  state.gameActive = true;
  updateHUD();
  initLevel();
}

// ==========================================
// EVENT LISTENER
// ==========================================
board.on('down', downHandler);
