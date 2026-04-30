// ==========================================
// CONFIGURACIÓN Y ESTADO
// ==========================================
const GAME_CONFIG = {
  maxScore: 3,
  maxMistakes: 3,
  boundingBox: [-5, 5, 5, -5],
  tolerance: 0.07 
};

let state = {
  score: 0,
  mistakes: 0,
  gameActive: true,
  currentFunction: null,
  selectedCandidate: null
};

var board = JXG.JSXGraph.initBoard("box", {
  boundingbox: GAME_CONFIG.boundingBox,
  axis: true,
  showCopyright: false
});

initLevel();

// ==========================================
// GENERADOR DE FUNCIONES (INCLUYE POR PARTES)
// ==========================================
function generateFunction() {
  const choice = Math.random();
  let f;

  if (choice < 0.5) {
    // Caso 1: Cuadrática con raíces visibles
    let r1 = getRandomInt(-4, -1), r2 = getRandomInt(1, 4);
    f = (x) => 0.4 * (x - r1) * (x - r2);
  } else {
    // Caso 2: FUNCIÓN POR PARTES
    // Izquierda: Recta ascendente | Derecha: Parábola desplazada
    const b = getRandomInt(-2, 1);
    f = (x) => {
      if (x < 0) return x + b; 
      return Math.pow(x - 2, 2) - 2.5;
    };
  }
  return { f };
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ==========================================
// RENDERIZADO DEL ESCENARIO
// ==========================================
function initLevel() {
  board.clearTraces();
  Object.values(board.objects).forEach(obj => {
    if (obj.getAttribute('isDynamic')) board.removeObject(obj);
  });

  state.currentFunction = generateFunction();
  state.selectedCandidate = null;
  const f = state.currentFunction.f;

  // Gráfica base
  board.create('functiongraph', [f], { 
    strokeColor: '#8f0dece2', strokeWidth: 3, isDynamic: true 
  });

  // Ayudas visuales (Distractores y Guías)
  // 1. Sobre la curva (Cian)
  board.create('functiongraph', [(x) => f(x) < 0 ? f(x) : NaN], {
    strokeColor: '#00ffff', strokeWidth: 5, opacity: 0.5, isDynamic: true
  });

  // 2. Sobre Eje Y (Amarillo)
  board.create('segment', [[0, -5], [0, 0]], {
    strokeColor: 'yellow', strokeWidth: 6, opacity: 0.35, isDynamic: true
  });

  // 3. Sobre Eje X (Verde muy tenue para no regalar la respuesta)
  for (let x = -5; x <= 5; x += 0.1) {
    if (f(x) < 0) {
      board.create('segment', [[x, 0], [x + 0.1, 0]], {
        strokeColor: '#00ff00', strokeWidth: 4, opacity: 0.15, isDynamic: true
      });
    }
  }
}

// ==========================================
// MANEJO DE INTERACCIÓN
// ==========================================
board.on('down', function(e) {
  if (!state.gameActive) return;
  let coords = getMouseCoords(e);
  let x = coords.usrCoords[1], y = coords.usrCoords[2];

  // LOGICA DE RETROALIMENTACIÓN INDIRECTA
  if (Math.abs(y) > GAME_CONFIG.tolerance) {
    Swal.fire({
      title: 'Analiza la definición',
      text: 'Observa nuevamente cómo está definido el conjunto A. ¿Qué tipo de objetos contiene?',
      icon: 'question',
      confirmButtonColor: '#8f0dece2'
    });
    return;
  }

  if (state.selectedCandidate) board.removeObject(state.selectedCandidate);
  state.selectedCandidate = board.create('point', [x, 0], {
    name: 'x?', color: 'orange', size: 4, isDynamic: true
  });
});

function getMouseCoords(e) {
  let cPos = board.getCoordsTopLeftCorner(e),
      absPos = JXG.getPosition(e),
      dx = absPos[0] - cPos[0], dy = absPos[1] - cPos[1];
  return new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], board);
}

function validar() {
  if (!state.selectedCandidate || !state.gameActive) return;

  let x = state.selectedCandidate.X();
  let fVal = state.currentFunction.f(x);

  if (fVal < 0) {
    state.score++;
    state.selectedCandidate.setAttribute({color: 'green', name: '✔'});
    Swal.fire({ icon: 'success', title: '¡Logrado!', text: 'Este valor de x cumple con la condición f(x) < 0.', timer: 1500 });
  } else {
    state.mistakes++;
    state.selectedCandidate.setAttribute({color: 'red', name: '✘'});
    Swal.fire({ icon: 'error', title: 'Revisa el punto', text: '¿Seguro que f(x) es menor que cero en esta posición?' });
  }

  document.getElementById('score').innerText = state.score;
  document.getElementById('mistakes').innerText = state.mistakes;
  
  setTimeout(() => {
    if (state.score >= GAME_CONFIG.maxScore) endGame(true);
    else if (state.mistakes >= GAME_CONFIG.maxMistakes) endGame(false);
    else initLevel();
  }, 1600);
}

function endGame(win) {
  state.gameActive = false;
  Swal.fire({
    title: win ? '¡Excelente análisis!' : 'Sigue practicando',
    text: win ? 'Has identificado los valores del dominio correctamente.' : 'Recuerda: el conjunto A está formado por elementos x.',
    icon: win ? 'success' : 'error',
    confirmButtonText: 'Reiniciar'
  }).then(reiniciarJuego);
}

function reiniciarJuego() {
  state.score = 0; state.mistakes = 0; state.gameActive = true;
  document.getElementById('score').innerText = "0";
  document.getElementById('mistakes').innerText = "0";
  initLevel();
}