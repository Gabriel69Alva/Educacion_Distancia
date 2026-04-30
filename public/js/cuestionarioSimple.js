import confetti from 'https://esm.run/canvas-confetti@1';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('launchConfetti').addEventListener('click', () => {
    // Respuestas correctas
  var respuestasCorrectas = ["c", "b", "c"];

  // Puntuación inicial
  var puntuacion = 0;

  // Comprobar las respuestas
  for (var i = 1; i <= 3; i++) {
    var pregunta = document.getElementById("pregunta" + i);
    var respuestaUsuario = document.querySelector('input[name="q' + i + '"]:checked');

    if (respuestaUsuario) {
      if (respuestaUsuario.value === respuestasCorrectas[i - 1]) {
        puntuacion++;
        pregunta.style.color = "green";
      } else {
        pregunta.style.color = "red";
      }
    }
  }

  // Mostrar la puntuación
  var resultado = document.getElementById("puntuacion");
  resultado.innerHTML = puntuacion + " / 3";
  if(puntuacion===3){
    confetti();
  }
  });
});


