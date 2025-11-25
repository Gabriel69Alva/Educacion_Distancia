// Inicialización de la librería de íconos Lucide
lucide.createIcons();

// -----------------------------------------------------------
// 1. DATOS DEL QUIZ (Preguntas, Opciones, Respuestas, Explicaciones)
// -----------------------------------------------------------

const quizData = [
    {
        question: "Una función es par si:",
        options: ["A) $f(x)=f(x+c)$", "B) $f(x)=-f(-x)$", "C) $f(x)=f(-x)$", "D) $-f(x)=f(x)$"],
        correctAnswer: "C) $f(x)=f(-x)$",
        explanation: "Ser par significa que la función satisface la igualdad f(x)=f(-x) para cualquier valor de x. Es decir, es simétrica con respecto al eje Y."
    },
    {
        question: "¿Qué propiedad cumplen las funciones impares",
        options: ["A) $f(x)=f(-x)$", "B) $f(x)=-f(-x)$", "C) $-f(x)=f(x)$", "D) $f(x)=f(x+c)$"],
        correctAnswer: "B) $f(x)=-f(-x)$",
        explanation: "Ser impar significa que la función satisface la igualdad f(x)=-f(-x) para cualquier valor de x. Es decir, es simétrica con respecto al origen."
    },
    {
        question: "Una función $f(x)$ es inyectiva si:",
        options: ["A) $f(a) \\neq f(b)$ entonces a \\neq b$", "B) $f(a)=f(b)$ entonces a=b$", "C) a=b, entoces $f(a)=f(b)$", "D) $f$ es impar"],
        correctAnswer: "B) $f(a)=f(b)$ entonces a=b$",
        explanation: "Una función es inyectiva si la imagen de cualquier elemento de su dominio es única."
    },
    {
        question: "Una función es superyectiva si:",
        options: ["A) $f(a) \\neq f(b)$ entonces a \\neq b$", "B) $f(a)=f(b)$ entonces a=b$", "C) para todo y en el contradominio, existe un x en el dominio tal que f(x)=y", "D) $f$ es par"],
        correctAnswer: "C) para todo y en el contradominio, existe un x en el dominio tal que f(x)=y",
        explanation: "una función suprayectiva no tiene elementos sueltos en el contradominio"
    },
    {
        question: "Una función se dice biyectiva si:",
        options: ["A) es par e impar a la vez", "B) es impar e inyectiva", "C) es creciente e impar", "D) es inyectiva y suprayectiva"],
        correctAnswer: "D) es inyectiva y suprayectiva",
        explanation: "Una función es biyectiva si es inyectiva y suprayectiva."
    }
];

// -----------------------------------------------------------
// 2. VARIABLES GLOBALES DE ESTADO
// -----------------------------------------------------------

let currentQuestionIndex = 0;
let attemptsRemaining = 3; // Intentos incorrectos globales (vidas)
let totalScore = 0;
let isCardFlipped = false;
let isGameDisabled = false;

// -----------------------------------------------------------
// 3. REFERENCIAS DEL DOM
// -----------------------------------------------------------

const card = document.getElementById('quiz-card');
const cardBack = document.getElementById('card-back');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextButton = document.getElementById('next-button');
const attemptsDisplay = document.querySelector('#attempts-display span');
const currentQDisplay = document.getElementById('current-q');
const totalQDisplay = document.getElementById('total-q');
const gameOverMessage = document.getElementById('game-over-message');
const finalStatus = document.getElementById('final-status');
const scoreSummary = document.getElementById('score-summary');

// Inicializar el número total de preguntas
totalQDisplay.textContent = quizData.length;

// -----------------------------------------------------------
// 4. FUNCIONES PRINCIPALES
// -----------------------------------------------------------

/**
 * Carga la pregunta actual en la tarjeta.
 */
function loadQuestion() {
    // Verificar si el juego terminó por completar todas las preguntas
    if (currentQuestionIndex >= quizData.length) {
        endGame();
        return;
    }

    // Si el juego está deshabilitado por falta de intentos, no cargar nada.
    if (isGameDisabled) return;

    const currentQ = quizData[currentQuestionIndex];

    // 1. Resetear el estado de la tarjeta y botones
    card.classList.remove('is-flipped');
    cardBack.className = 'card-face card-back'; // Limpiar clases de color
    nextButton.classList.add('hidden');
    isCardFlipped = false;

    // 2. Actualizar texto de la pregunta y contador
    questionText.textContent = currentQ.question;
    currentQDisplay.textContent = currentQuestionIndex + 1;

    // 3. Generar opciones de respuesta
    optionsContainer.innerHTML = '';
    currentQ.options.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.textContent = option;
        optionDiv.className = 'answer-option hover:shadow-md';
        optionDiv.onclick = () => handleAnswerClick(option, currentQ, optionDiv);
        optionsContainer.appendChild(optionDiv);
    });
}

/**
 * Maneja el clic en una opción de respuesta.
 * @param {string} selectedOption - La opción seleccionada por el usuario.
 * @param {Object} currentQ - El objeto de la pregunta actual.
 * @param {HTMLElement} selectedDiv - El div de la opción seleccionada.
 */
function handleAnswerClick(selectedOption, currentQ, selectedDiv) {
    if (isCardFlipped || isGameDisabled) return; // Evitar doble clic o si el juego está inhabilitado

    // Marcar la opción como seleccionada temporalmente
    Array.from(optionsContainer.children).forEach(div => {
        div.style.pointerEvents = 'none'; // Deshabilitar clic en todas las opciones
        if (div === selectedDiv) {
            div.classList.add('selected');
        }
    });

    const isCorrect = selectedOption === currentQ.correctAnswer;

    // 1. Manejo de Intentos
    if (!isCorrect) {
        attemptsRemaining--;
        attemptsDisplay.textContent = attemptsRemaining;
    } else {
        totalScore++; // Sumar puntaje si es correcto
    }

    // 2. Girar la tarjeta (animación 3D)
    setTimeout(() => {
        flipCard(isCorrect, currentQ);
    }, 300); // Pequeña pausa para mostrar la selección antes de girar

    // 3. Verificar Fin del Juego por agotamiento de intentos
    if (attemptsRemaining <= 0) {
        isGameDisabled = true;
        setTimeout(endGame, 1500); // Finalizar juego después de la animación de giro
    }
    // NOTA: Si quedan intentos, el juego NO termina, solo espera el clic en "Siguiente Pregunta"
}

/**
 * Gira la tarjeta y muestra el resultado en el reverso.
 * @param {boolean} isCorrect - Indica si la respuesta fue correcta.
 * @param {Object} qData - Los datos de la pregunta.
 */
function flipCard(isCorrect, qData) {
    isCardFlipped = true;
    card.classList.add('is-flipped');

    // Solo mostrar el botón de siguiente si el juego no está deshabilitado por intentos.
    if (!isGameDisabled) {
        nextButton.classList.remove('hidden');
    }

    const resultIconContainer = document.getElementById('result-icon-container');
    const resultMessage = document.getElementById('result-message');
    const explanationText = document.getElementById('explanation-text');
    const correctAnswerText = document.getElementById('correct-answer-text');

    // Limpiar iconos anteriores
    resultIconContainer.innerHTML = '';

    // 1. Establecer el color y el icono
    if (isCorrect) {
        cardBack.classList.add('correct');
        resultIconContainer.innerHTML = '<i data-lucide="check-circle" class="lucide-icon text-white"></i>';
        resultMessage.textContent = '¡Respuesta Correcta!';
    } else {
        cardBack.classList.add('incorrect');
        resultIconContainer.innerHTML = '<i data-lucide="x-circle" class="lucide-icon text-white"></i>';
        resultMessage.textContent = '¡Respuesta Incorrecta!';
    }

    // Crear los iconos si no existen (necesario después de modificar innerHTML)
    lucide.createIcons();

    // 2. Establecer la retroalimentación
    correctAnswerText.textContent = qData.correctAnswer;
    explanationText.textContent = qData.explanation;
}

/**
 * Avanza a la siguiente pregunta.
 */
function nextQuestion() {
    if (isGameDisabled) return; // Seguridad extra: si ya está deshabilitado, no hacer nada.
    currentQuestionIndex++;
    loadQuestion();
}

/**
 * Finaliza el juego y muestra el resultado final.
 */
function endGame() {
    isGameDisabled = true;
    card.style.display = 'none';
    document.getElementById('game-info').style.display = 'none';
    nextButton.style.display = 'none';
    gameOverMessage.classList.remove('hidden');

    const totalQuestions = quizData.length;

    if (attemptsRemaining > 0) {
        // El juego terminó por completar todas las preguntas
        finalStatus.textContent = '¡Juego Completado!';
        finalStatus.classList.add('text-green-400');
        finalStatus.classList.remove('text-red-400');
        scoreSummary.textContent = `Puntuación Final: ${totalScore} de ${totalQuestions} correctas. ¡Felicidades!`;
    } else {
        // El juego terminó por falta de intentos
        finalStatus.textContent = '¡Juego Deshabilitado!';
        finalStatus.classList.add('text-red-400');
        finalStatus.classList.remove('text-green-400');
        scoreSummary.textContent = `Puntuación Final: ${totalScore} de ${totalQuestions}. El juego se detuvo por exceder el límite de 3 respuestas incorrectas.`;
    }
}

/**
 * Reinicia el estado del juego.
 */
function restartGame() {
    currentQuestionIndex = 0;
    attemptsRemaining = 3;
    totalScore = 0;
    isGameDisabled = false;

    card.style.display = 'block';
    document.getElementById('game-info').style.display = 'flex';
    attemptsDisplay.textContent = attemptsRemaining;
    gameOverMessage.classList.add('hidden');

    loadQuestion();
}

// -----------------------------------------------------------
// 5. INICIALIZACIÓN
// -----------------------------------------------------------

// Cargar la primera pregunta al cargar la página
window.onload = loadQuestion;