// Variables del juego
let lives = 3;
let score = 0;

// JSXGraph
const brd = JXG.JSXGraph.initBoard('box', {
    boundingbox: [-4, 4, 4, -4],
    axis: true
});

// Puntos iniciales
let glider1 = brd.create('point', [-3, 0], { name: 'A', size: 3 });
let glider2 = brd.create('point', [3, 1], { name: 'B', size: 3 });
let p5 = brd.create('point', [-1.5, 2], { name: 'P', size: 3 });
let p6 = brd.create('point', [1.5, -2], { name: 'Q', size: 3 });

let curve = brd.create('curve', [], { strokeWidth: 2 });

// Función para coordenadas aleatorias
function getRandomCoord(min, max) {
    return Math.random() * (max - min) + min;
}

// Posiciones iniciales aleatorias que no sean inyectivas
function setRandomInitialPositions() {
    let isInjective;
    do {
        glider1.moveTo([-3, getRandomCoord(-4, 4)]);
        glider2.moveTo([3, getRandomCoord(-4, 4)]);
        p5.moveTo([getRandomCoord(-2.5, -0.5), getRandomCoord(-4, 4)]);
        p6.moveTo([getRandomCoord(0.5, 2.5), getRandomCoord(-4, 4)]);

        brd.update();
        isInjective = checkInjective();
    } while (isInjective); // repetir si es inyectiva
}

function checkFunction() {
    // Simulación de validación de función (debes reemplazar por tu código real)
    return Math.random() > 0.2; // 80% probabilidad de que sea función
}

function checkInjective() {
    // Simulación de validación de inyectividad (debes reemplazar por tu código real)
    return Math.random() > 0.5; // 50% probabilidad de que sea inyectiva
}

function loseLife() {
    if (lives > 0) {
        const lifeEl = document.getElementById(`life${lives}`);
        lifeEl.classList.add('blink');
        setTimeout(() => {
            lifeEl.classList.remove('blink');
            lifeEl.classList.add('fall');
        }, 400);

        lives--;
        if (lives === 0) {
            swal({
                title: "¡Juego terminado!",
                text: "Te has quedado sin tréboles.",
                icon: "error",
                button: "Reiniciar"
            }).then(() => {
                location.reload();
            });
        }
    }
}

function winPoint() {
    score++;
    document.getElementById('score').textContent = score;
    if (score === 3) {
        swal({
            title: "¡Ganaste!",
            text: "Completaste las 3 funciones inyectivas.",
            icon: "success",
            button: "Jugar de nuevo"
        }).then(() => {
            location.reload();
        });
    } else {
        setRandomInitialPositions();
    }
}

// Evento de validación (puedes llamarlo desde un botón o al soltar puntos)
function validateGraph() {
    if (!checkFunction()) {
        swal({
            title: "¡No es función!",
            text: "La curva no pasa la prueba de función.",
            icon: "error",
            button: "Entendido"
        });
        loseLife();
        return;
    }
    if (!checkInjective()) {
        swal({
            title: "¡La gráfica no es inyectiva!",
            text: "Se encontraron dos puntos con el mismo valor de Y.",
            icon: "error",
            button: "Entendido"
        });
        loseLife();
        return;
    }
    swal({
        title: "¡Éxito!",
        text: "Has formado una función inyectiva.",
        icon: "success",
        button: "Continuar"
    });
    winPoint();
}

// Inicializar
setRandomInitialPositions();
