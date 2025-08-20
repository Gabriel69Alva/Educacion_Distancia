// Variables para el estado del cuestionario
let currentQuestionIndex = 0;
let selectedOption = null;

// Instancia de JS-Confetti
const jsConfetti = new JSConfetti();

// Array de preguntas y respuestas. Usa notación LaTeX para las expresiones matemáticas.
const quizQuestions = [
    {
        question: "1. ¿Cuál de las siguientes es una función inyectiva?",
        options: [
            "A) $f(x) = x^2$",
            "B) $f(x) = |x|$",
            "C) $f(x) = x^3$"
        ],
        correctAnswer: 2
    },
    {
        question: "2. La prueba de la línea horizontal se usa para determinar si una función es:",
        options: [
            "A) Surayectiva",
            "B) Inyectiva",
            "C) Biyectiva"
        ],
        correctAnswer: 1
    },
    {
        question: "3. Si $f(a) = f(b)$ implica que $a = b$, la función es:",
        options: [
            "A) Inyectiva",
            "B) Par",
            "C) Impar"
        ],
        correctAnswer: 0
    }
];

// Referencias a los elementos del DOM
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const validateButton = document.getElementById('validate-quiz-button');
const nextButton = document.getElementById('next-question-button');
const optionButtons = document.querySelectorAll('.option-button');

// Función para cargar una pregunta en la interfaz
function loadQuestion() {
    // Si no hay más preguntas, se muestra un mensaje final
    if (currentQuestionIndex >= quizQuestions.length) {
        showFinalMessage();
        return;
    }

    const questionData = quizQuestions[currentQuestionIndex];
    questionText.textContent = questionData.question;

    // Reinicia el estado de los botones
    optionButtons.forEach((button, index) => {
        button.innerHTML = questionData.options[index];
        button.classList.remove('selected', 'correct', 'incorrect');
        button.disabled = false; // Asegura que los botones estén habilitados
    });

    // Reinicia el estado de los botones de control
    validateButton.disabled = true;
    nextButton.style.display = 'none';
    selectedOption = null;

    // Vuelve a procesar las expresiones LaTeX
    if (window.MathJax) {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, "quiz-container"]);
    }
}

// Función para manejar la selección de una opción
function selectOption(event) {
    if (event.target.classList.contains('option-button')) {
        optionButtons.forEach(btn => btn.classList.remove('selected'));
        event.target.classList.add('selected');
        selectedOption = parseInt(event.target.dataset.option);
        validateButton.disabled = false;
    }
}

// Función para validar la respuesta seleccionada
function validateAnswer() {
    if (selectedOption === null) return;

    const questionData = quizQuestions[currentQuestionIndex];
    const correctOptionIndex = questionData.correctAnswer;
    
    // Deshabilitar todos los botones de opciones para evitar cambios
    optionButtons.forEach(button => button.disabled = true);
    validateButton.disabled = true;

    if (selectedOption === correctOptionIndex) {
        optionButtons[selectedOption].classList.add('correct');
        // Lanzar la animación de confeti 🎉
        jsConfetti.addConfetti({
            confettiRadius: 6,
            confettiNumber: 500,
        });

        swal.fire({
            title: "¡Respuesta correcta!",
            text: "¡Excelente! Has respondido bien.",
            icon: "success",
            confirmButtonText: "Siguiente"
        }).then(() => {
            nextButton.style.display = 'inline-block';
            validateButton.style.display = 'none';
        });
    } else {
        optionButtons[selectedOption].classList.add('incorrect');
        optionButtons[correctOptionIndex].classList.add('correct');

        swal.fire({
            title: "Respuesta incorrecta",
            text: "¡Sigue intentándolo! La respuesta correcta ha sido marcada en verde.",
            icon: "error",
            confirmButtonText: "Entendido"
        }).then(() => {
            nextButton.style.display = 'inline-block';
            validateButton.style.display = 'none';
        });
    }
}

// Función para avanzar a la siguiente pregunta
function nextQuestion() {
    currentQuestionIndex++;
    validateButton.style.display = 'inline-block';
    loadQuestion();
}

// Mensaje final cuando se completa el cuestionario
function showFinalMessage() {
    swal.fire({
        title: "¡Cuestionario completado!",
        text: "¡Has respondido todas las preguntas correctamente!",
        icon: "success",
        confirmButtonText: "Finalizar"
    }).then(() => {
        // Puedes agregar aquí la lógica para, por ejemplo, redirigir a otra página
        // o mostrar un mensaje final.
    });
}

// Asignar los eventos a los botones
optionsContainer.addEventListener('click', selectOption);
validateButton.addEventListener('click', validateAnswer);
nextButton.addEventListener('click', nextQuestion);

// Inicia el cuestionario al cargar la página
window.onload = loadQuestion;