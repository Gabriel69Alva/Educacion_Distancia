
//Cuestionario dinámico 1

document.addEventListener('DOMContentLoaded', function () {
    // Función a ejecutar cuando se haya cargado el HTML
    crearFormularioMultipleA(1);
});

let preguntas = [
    ["$ \\text{Si una recta vertical intersecta a una gráfica en más de un punto, entonces la gráfica:}$"],
    ["$ \\text{Si una recta horizontal intersecta a una gráfica en más de un punto, entonces la gráfica:}$"],
    ["$ \\text{¿Qué recta utilizarías para decidir si una función es inyectiva en } \\([-3, 3]\\)?$"]

];

let formulario = [
    [" $ \\text{No representa a una función inyectiva}$", " $\\text{No representa a una función}$", " $\\text{Representa a una función suprayectiva}$"],
    [" $ \\text{No representa a una función inyectiva}$", " $\\text{No representa a una función}$", " $\\text{Representa a una función suprayectiva}$"],
    ["$y=k$", "$x=k$", "$y=0$"]

];


let opcionesCorrectas = ["opcion3", "opcion2"];

function preguntaSiguenteA(element) {

    let preguntaData = 1 + parseInt(element.getAttribute('data-pregunta'));

    console.log("pregunta: ", preguntaData);
    obtenerValoresA();
    crearFormularioMultipleA(preguntaData);
    element.setAttribute('data-pregunta', preguntaData);
}


function crearFormularioMultipleA(numPregunta) {
    console.log("numPregunta: ", parseInt(numPregunta));
    let form = document.getElementById("formMultipleDinamicoA");

    let html = "";
    index0 = 1;

    formulario.forEach(element => {
        console.log("sin entrar: ", parseInt(numPregunta), index0);
        if (parseInt(numPregunta) === index0) {
            console.log("parseInt(numPregunta): ", parseInt(numPregunta), index0);
            console.log("index0: ", index0)

            html = html + '<h5>   '+index0+ '. ' + preguntas[parseInt(numPregunta) - 1] + '</h5>';
            label = "";
            index = 1;


            element.forEach(element1 => {

                label = label + '<label> <input type="radio" name=" pregunta ' + index0 + '" value="opcion' + index + '" /> ' + element1 + '</label>'
                index++;
            });
            html = html + label;
        }
        index0++;
    });
    console.log("Html: ", html);
    form.innerHTML = html;

}


let valoresSeleccionados = [];
function obtenerValoresA() {
    var formulario = document.getElementById("formMultipleDinamicoA");
    var elementos = formulario.querySelectorAll("input[type='radio']");

    elementos.forEach(function (elemento) {
        if (elemento.checked) {
            valoresSeleccionados.push(elemento.value);
        }
    });


}

function validarFormA() {
    console.log("valoresSeleccionados: ", valoresSeleccionados)

    let contador = 0;
    let valoresCorrectos = [];
    valoresSeleccionados.forEach(elemento => {
        if (opcionesCorrectas[contador] === elemento) {
            valoresCorrectos.push(elemento);
        }
        contador++;
    });

    console.log(valoresCorrectos);
    if (valoresCorrectos.length === 2) {
        swal({
            title: "Correcto!",
            text: "Tus respuestas al cuestionario son correctas",
            icon: "success",
        });
    } else {
        swal({
            title: "Incorrecto!",
            text: "Tu respuesta es incorrecta",
            icon: "error",
        });
    }
}



