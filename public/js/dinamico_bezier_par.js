// dinamico.js (SweetAlert clásico)

// EXPONE init para que funcionModal la llame tras cargar el HTML
window.initCuestionario = function (root) {
    if (!root) return;

    // ======== ESTADO (igual patrón) ========
    let currentQuestionIndex = 0;
    let selectedOption = null;

    // Instancia de confetti (asegúrate de cargar js-confetti antes)
    const jsConfetti = new JSConfetti();

    // ======== PREGUNTAS (igual patrón) ========
    const quizQuestions = [
        {
            question: "1. ¿Cuál de las siguientes es una función par?",
            options: [
                "A) $f(x) = x$",
                "B) $f(x) = |x|$",
                "C) $f(x) = (x+1)^5$"
            ],
            correctAnswer: 1
        },
        {
            question: "2. Una función par es simétrica respecto:",
            options: [
                "A) $\\text{Al origen}$",
                "B) $\\text{Al eje X}$",
                "C) $\\text{Al eje Y}$"
            ],
            correctAnswer: 2
        },
        {
            question: "3. Si $f(a) = f(-a)$ implica que la función es:",
            options: [
                "A) $\\text{Inyectiva}$",
                "B) $\\text{Par}$",
                "C) $\\text{Impar}$"
            ],
            correctAnswer: 1
        }
    ];

    // ======== REFERENCIAS AL DOM (DENTRO DEL MODAL) ========
    let questionText = root.querySelector('#question-text');
    let optionsContainer = root.querySelector('#options-container');
    let validateButton = root.querySelector('#validate-quiz-button');
    let nextButton = root.querySelector('#next-question-button');
    let optionButtons = root.querySelectorAll('.option-button');
    let feedback = root.querySelector('#quiz-feedback');


    // Si tu HTML no trae área de feedback, la creamos al vuelo
    if (!feedback) {
        const quizContainer = root.querySelector('#quiz-container') || root;
        feedback = document.createElement('div');
        feedback.id = 'quiz-feedback';
        quizContainer.appendChild(feedback);
    }

    // ======== UTILIDAD: TIPOGRAFÍA MATHJAX ========
    function typesetMath() {
        if (window.MathJax && window.MathJax.Hub) {
            // MathJax v2
            window.MathJax.Hub.Queue(
                ["Typeset", window.MathJax.Hub, root],
                function () { reloadQuizStyles(root); }
            );
        } else if (window.MathJax && window.MathJax.typesetPromise) {
            // MathJax v3
            window.MathJax.typesetPromise([root])
                .then(() => reloadQuizStyles(root))
                .catch(err => console.error(err));
        } else {
            // Si no hay MathJax, aplica estilos igual (no hace daño)
            reloadQuizStyles(root);
        }
    }

    // ======== CARGAR PREGUNTA (igual patrón) ========
    function loadQuestion() {

        if (currentQuestionIndex >= quizQuestions.length) {
            showFinalMessage();
            return;

        }

        const questionData = quizQuestions[currentQuestionIndex];
        questionText.textContent = questionData.question;

        // Pintar opciones
        optionButtons.forEach((button, index) => {
            button.innerHTML = questionData.options[index] ?? '';
            button.classList.remove('selected', 'correct', 'incorrect');
            button.disabled = false;
            button.dataset.option = index; // asegura data-option
        });

        // Reset controles y feedback
        validateButton.disabled = true;
        nextButton.style.display = 'none';
        validateButton.style.display = 'inline-block';
        selectedOption = null;

        if (feedback) {
            feedback.textContent = '';
            feedback.className = 'feedback'; // limpia estilos previos
        }

        // Procesar LaTeX
        typesetMath();
    }

    // ======== SELECCIONAR OPCIÓN (igual patrón) ========
    function selectOption(event) {
        const target = event.target.closest('.option-button');
        if (!target) return;

        optionButtons.forEach(btn => btn.classList.remove('selected'));
        target.classList.add('selected');
        selectedOption = parseInt(target.dataset.option, 10);
        validateButton.disabled = false;
    }

    // ======== VALIDAR RESPUESTA (mismo flujo, sin abrir otro swal) ========
    function validateAnswer() {
        if (selectedOption === null) return;

        const questionData = quizQuestions[currentQuestionIndex];
        const correctOptionIndex = questionData.correctAnswer;

        optionButtons.forEach(button => button.disabled = true);
        validateButton.disabled = true;

        if (selectedOption === correctOptionIndex) {
            optionButtons[selectedOption].classList.add('correct');
            jsConfetti.addConfetti({ confettiRadius: 6, confettiNumber: 500 });

            // Feedback EN EL MISMO MODAL, no abrimos otro swal
            if (feedback) {
                feedback.textContent = "¡Respuesta correcta! ¡Excelente!";
                feedback.className = 'feedback success';
            }

            nextButton.style.display = 'inline-block';
            validateButton.style.display = 'none';

        } else {
            optionButtons[selectedOption].classList.add('incorrect');
            optionButtons[correctOptionIndex].classList.add('correct');

            if (feedback) {
                feedback.textContent = "Respuesta incorrecta. La correcta ha sido marcada en verde.";
                feedback.className = 'feedback error';
            }

            nextButton.style.display = 'inline-block';
            validateButton.style.display = 'none';
        }
    }

    // ======== SIGUIENTE PREGUNTA (igual patrón) ========
    function nextQuestion() {
        currentQuestionIndex++;
        loadQuestion();
    }

    // ======== FINAL DEL CUESTIONARIO ========
    function showFinalMessage() {
        // Si quieres cerrar el modal aquí:
        // swal("¡Cuestionario completado!", "¡Has respondido todas las preguntas!", "success");

        // ...o mostrar el final dentro del mismo modal:
        if (questionText) questionText.textContent = "¡Cuestionario completado!";
        if (optionsContainer) optionsContainer.innerHTML = "";
        if (validateButton) validateButton.style.display = 'none';
        if (nextButton) nextButton.style.display = 'none';
        if (feedback) {
            feedback.textContent = "¡Has respondido todas las preguntas!";
            feedback.className = 'feedback success';
        }

        // Botón para cerrar (opcional)
        let closeBtn = root.querySelector('#finish-quiz-button');
        if (!closeBtn) {
            closeBtn = document.createElement('button');
            closeBtn.id = 'finish-quiz-button';
            closeBtn.textContent = 'Cerrar';
            closeBtn.type = 'button';
            closeBtn.style.marginTop = '12px';
            (root.querySelector('#quiz-container') || root).appendChild(closeBtn);
            closeBtn.addEventListener('click', () => swal.close());
        }
    }

    // ======== ENLACES (igual patrón, idempotentes) ========
    if (optionsContainer && !optionsContainer.dataset.bound) {
        optionsContainer.dataset.bound = '1';
        optionsContainer.addEventListener('click', selectOption);
    }
    if (validateButton && !validateButton.dataset.bound) {
        validateButton.dataset.bound = '1';
        validateButton.addEventListener('click', validateAnswer);
    }
    if (nextButton && !nextButton.dataset.bound) {
        nextButton.dataset.bound = '1';
        nextButton.addEventListener('click', nextQuestion);
    }

    // ======== INICIO ========
    loadQuestion();

};
function reloadQuizStyles(root) {
    const container = root.querySelector('#quiz-container') || root;

    // Elimina el <style> anterior (si existía) para forzar re-aplicación
    const STYLE_ID = 'quiz-math-style';
    const old = container.querySelector('#' + STYLE_ID);
    if (old) old.remove();

    // Crea e inserta el nuevo <style>
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
    #quiz-container .MathJax,
    #quiz-container .MathJax *,
    #quiz-container mjx-container,
    #quiz-container mjx-container * {
      color: #000 !important;
    }
  `;
    container.appendChild(s);
}