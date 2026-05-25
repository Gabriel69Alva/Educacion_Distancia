// ==========================================
// ETAPA 1: LÓGICA DEL JUEGO Y CANVAS
// ==========================================

let arrayRespuestas = [];
let valoresDerecha = [];
let textDerechoObjetos = [];
let canvas;

// Constantes de diseño
const X_IZQ = 190; 
const X_DER = 470; 
const Y_START = 80;
const Y_STEP = 55;

// Variables de Gamificación
let aciertos = 0;
let vidas = 3;
let juegoActivo = true;

function validarCirculo(x, y, h, k) {
  return Math.sqrt(Math.pow(x - h, 2) + Math.pow(y - k, 2)) <= 25;
}

function generarValoresAleatorios() {
  let base = Math.floor(Math.random() * 10) - 5;
  let arr = [];
  while(arr.length < 4) {
    let incremento = Math.floor(Math.random() * 5) + 1;
    base += incremento;
    arr.push(base);
  }
  return arr.sort(() => Math.random() - 0.5);
}

// Variable global auxiliar para rastrear las vidas del turno anterior (ponla al inicio junto a let vidas = 3;)
let vidasAnteriores = 3; 

function actualizarUIGamificacion() {
  document.getElementById('aciertos-text').innerText = `${aciertos} / 3`;
  
  let contenedorVidas = document.getElementById('vidas-text');
  if (!contenedorVidas) return;
  
  // Limpiamos el contenedor para meter los nuevos corazones animados
  contenedorVidas.innerHTML = "";

  // Determinar qué animación aplicar
  let esAcierto = (vidas === vidasAnteriores && aciertos > 0);
  let esError = (vidas < vidasAnteriores);

  for (let i = 0; i < 3; i++) {
    let span = document.createElement("span");
    span.className = "corazon-contenedor";

    if (i < vidas) {
      // Corazones activos (Rojos)
      span.innerText = "❤️";
      if (esAcierto) {
        span.classList.add("corazon-pulso"); // Animación de agrandar si acertó
      }
    } else {
      // Corazones perdidos
      // Si es el corazón que se acaba de perder en ESTE turno, lo hacemos caer
      if (esError && i === vidas) {
        span.innerText = "❤️"; // Nace rojo para que se vea la caída del corazón real
        span.classList.add("corazon-caido");
      } else {
        // Si ya se había perdido en turnos pasados, queda completamente vacío e invisible
        span.innerText = "🖤";
        span.className = "corazon-vacio";
      }
    }
    contenedorVidas.appendChild(span);
  }

  // Guardamos el estado actual de vidas para la siguiente validación
  vidasAnteriores = vidas;
}

function bloquearInteraccion(bloquear) {
  if (!canvas) return;
  canvas.getObjects().forEach(obj => {
    if(obj.type === 'triangle') {
      obj.set('selectable', !bloquear);
      obj.set('evented', !bloquear);
    }
  });
  canvas.renderAll();
}

function inicializarEscenario() {
  // Limpiamos los datos del intento anterior
  arrayRespuestas = [];
  textDerechoObjetos = [];
  valoresDerecha = generarValoresAleatorios();

  if (!canvas) {
    canvas = new fabric.Canvas("myCanvas", { backgroundColor: "#f8f9fa", selection: false });
    fabric.Object.prototype.originX = fabric.Object.prototype.originY = "center";
    fabric.Object.prototype.noScaleCache = true;
  } else {
    canvas.clear();
    canvas.setBackgroundColor("#f8f9fa", canvas.renderAll.bind(canvas));
  }

  const conjuntoA = new fabric.Circle({
    radius: 130, fill: "rgba(59, 130, 246, 0.15)", left: X_IZQ, top: 170,
    stroke: "#3b82f6", strokeWidth: 2, scaleX: 0.65, selectable: false, evented: false
  });

  const conjuntoB = new fabric.Circle({
    radius: 130, fill: "rgba(34, 197, 94, 0.15)", left: X_DER, top: 170,
    stroke: "#22c55e", strokeWidth: 2, scaleX: 0.65, selectable: false, evented: false
  });

  canvas.add(conjuntoA, conjuntoB);

  let puntosIzq = new fabric.Text("...", { left: X_IZQ - 10, top: 275, fontSize: 30, fill: "#6b7280", selectable: false, evented: false });
  let puntosDer = new fabric.Text("...", { left: X_DER, top: 275, fontSize: 30, fill: "#6b7280", selectable: false, evented: false });
  canvas.add(puntosIzq, puntosDer);

  let lblDom = new fabric.Text("Dominio", { left: X_IZQ, top: 25, fontSize: 16, fontWeight: 'bold', fill: '#1f2937', selectable: false });
  let lblCod = new fabric.Text("Imagen", { left: X_DER, top: 25, fontSize: 16, fontWeight: 'bold', fill: '#1f2937', selectable: false });
  canvas.add(lblDom, lblCod);

  for (let i = 0; i < 4; i++) {
    let yPos = Y_START + (i * Y_STEP);
    let valIzq = (i + 1).toString();
    let valDer = valoresDerecha[i].toString();

    let line = new fabric.Line([X_IZQ + 20, yPos, X_IZQ + 50, yPos], {
      fill: "transparent", stroke: "#93c5fd", strokeWidth: 3, selectable: false, evented: false
    });
    canvas.add(line);

    let txtIzq = new fabric.Text(valIzq, { left: X_IZQ - 20, top: yPos, fontSize: 20, fontWeight: '600', fill: "#1e3a8a", selectable: false });
    canvas.add(txtIzq);

    let txtDer = new fabric.Text(valDer, { name: valDer, left: X_DER, top: yPos, fontSize: 20, fontWeight: '600', fill: "#14532d", selectable: false });
    canvas.add(txtDer);
    textDerechoObjetos.push(txtDer);

    let arrow = new fabric.Triangle({
      name: valIzq, left: X_IZQ + 50, top: yPos, width: 14, height: 18,
      fill: "#3b82f6", angle: 90, hasControls: false, hasBorders: false,
      selectable: true, evented: true, hoverCursor: "pointer"
    });
    arrow.line = line;
    canvas.add(arrow);
  }

  canvas.renderAll();
  canvas.off("object:moving"); 
  
  // REACTIVAMOS EL JUEGO AL TERMINAR DE PINTAR
  juegoActivo = true;

  canvas.on("object:moving", function (e) {
    if (!juegoActivo) return;

    let p = e.target;
    if (!p.line) return;

    p.line.set({ x2: p.left, y2: p.top });
    let angulo = (180 / Math.PI) * Math.atan2(p.top - p.line.get("y1"), p.left - p.line.get("x1")) + 90;
    p.set("angle", angulo);

    arrayRespuestas = arrayRespuestas.filter(item => item.valor1 !== parseInt(p.name));

    textDerechoObjetos.forEach(txtObj => {
      if (validarCirculo(p.left, p.top, txtObj.left, txtObj.top)) {
        arrayRespuestas.push({ valor1: parseInt(p.name), valor2: parseInt(txtObj.name) });
        txtObj.set("fill", "#3b82f6"); 
      } else {
        let conectado = arrayRespuestas.some(r => r.valor2 === parseInt(txtObj.name));
        if(!conectado) txtObj.set("fill", "#14532d");
      }
    });
    canvas.renderAll();
  });
}

function validarRespuestas() {
  if (!juegoActivo) return;

  if (arrayRespuestas.length < 4) {
    swal({ title: "Incompleto", text: "Conecta todos los valores del dominio primero.", icon: "warning" });
    return;
  }

  juegoActivo = false;
  bloquearInteraccion(true);
  document.getElementById('btn-validar').classList.add('hidden');

  let esCreciente = true;
  for (let i = 0; i < arrayRespuestas.length; i++) {
    for (let j = 0; j < arrayRespuestas.length; j++) {
      let x = arrayRespuestas[i].valor1;
      let ax = arrayRespuestas[i].valor2;
      let y = arrayRespuestas[j].valor1;
      let ay = arrayRespuestas[j].valor2;

      if (x < y && !(ax < ay)) { esCreciente = false; break; }
    }
    if (!esCreciente) break;
  }

  if (esCreciente) {
    aciertos++;
    actualizarUIGamificacion();
    
    if (aciertos === 3) {
      swal({ title: "¡Nivel 1 Superado! 🎉", text: "Has demostrado dominar las sucesiones gráficas.", icon: "success" });
      document.getElementById('btn-siguiente-nivel').classList.remove('hidden');
    } else {
      swal({ title: "¡Correcto!", text: `Sucesión creciente válida. Te faltan ${3 - aciertos} aciertos.`, icon: "success" });
      document.getElementById('btn-siguiente-ejercicio').classList.remove('hidden');
    }
  } else {
    vidas--;
    actualizarUIGamificacion();
    
    if (vidas === 0) {
      swal({ title: "Game Over 💀", text: "Te has quedado sin vidas. ¡Vuelve a intentarlo!", icon: "error" });
      document.getElementById('btn-reiniciar').classList.remove('hidden');
    } else {
      swal({ title: "Error", text: `Recuerda: si x < y, la imagen de x debe ser menor que la imagen de y. Te quedan ${vidas} vidas.`, icon: "error" });
      document.getElementById('btn-siguiente-ejercicio').classList.remove('hidden');
    }
  }
}

function proximoEjercicio() {
  document.getElementById('btn-siguiente-ejercicio').classList.add('hidden');
  inicializarEscenario();
  setTimeout(() => {
    document.getElementById('btn-validar').classList.remove('hidden');
  }, 150);
}


// ==========================================
// ETAPA 2: CUESTIONARIO TEÓRICO
// ==========================================

function iniciarNivel2() {
  document.getElementById('level-1-container').classList.add('hidden');
  document.getElementById('level-2-container').classList.remove('hidden');
  if (window.MathJax) { 
    MathJax.typesetPromise().catch((err) => console.log('Error en MathJax:', err)); 
  }
}

function evaluarCuestionario() {
  const preguntas = [
    { input: document.querySelector('input[name="q1"]:checked'), block: document.getElementById('block-q1') },
    { input: document.querySelector('input[name="q2"]:checked'), block: document.getElementById('block-q2') },
    { input: document.querySelector('input[name="q3"]:checked'), block: document.getElementById('block-q3') }
  ];

  preguntas.forEach(p => {
    p.block.classList.remove('correct', 'incorrect');
  });

  if (preguntas.some(p => !p.input)) {
    swal({ title: "Cuestionario Incompleto", text: "Responde todas las preguntas antes de evaluar.", icon: "warning" });
    return;
  }

  let correctas = 0;
  preguntas.forEach(p => {
    if (p.input.value === "correcta") {
      correctas++;
      p.block.classList.add('correct'); 
    } else {
      p.block.classList.add('incorrect'); 
    }
  });

  if(document.getElementById('btn-final-restart')) {
      document.getElementById('btn-final-restart').classList.remove('hidden');
  }

  if (correctas === 3) {
    lanzarConfetiMegaDopamina();
    swal({ title: "¡Victoria Total! 🏆", text: "¡Eres un maestro de las sucesiones! Has completado el módulo perfecto.", icon: "success" });
    // Mostramos el botón para avanzar a la última etapa formal
    if(document.getElementById('btn-pasar-nivel-3')) {
        document.getElementById('btn-pasar-nivel-3').classList.remove('hidden');
    }
  } else {
    swal({ title: "Revisa tus respuestas", text: `Tuviste ${correctas} de 3 correctas. Los bloques en rojo indican dónde hubo error. ¡Usa el botón 'Jugar de Nuevo' para limpiar e intentarlo de nuevo!`, icon: "info" });
  }
}

function lanzarConfetiMegaDopamina() {
  var duration = 3.5 * 1000; 
  var end = Date.now() + duration;
  const coloresBrillantes = ['#FF007F', '#00F0FF', '#FF00FF', '#FFD700', '#39FF14', '#FF5500'];

  (function frame() {
    confetti({
      particleCount: 8,
      angle: 55,
      spread: 60,
      origin: { x: 0, y: 0.65 },
      colors: coloresBrillantes,
      scalar: 1.4,
      gravity: 0.8,
      drift: 0.5
    });
    
    confetti({
      particleCount: 8,
      angle: 125,
      spread: 60,
      origin: { x: 1, y: 0.65 },
      colors: coloresBrillantes,
      scalar: 1.4,
      gravity: 0.8,
      drift: -0.5
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

function reiniciarJuegoCompleto() {
  aciertos = 0;
  vidas = 3;
  vidasAnteriores = 3; // Añade esta línea en la función de reiniciar juego
  juegoActivo = true;
  
  document.getElementById('btn-siguiente-nivel').classList.add('hidden');
  document.getElementById('btn-reiniciar').classList.add('hidden');
  document.getElementById('btn-siguiente-ejercicio').classList.add('hidden');
  document.getElementById('btn-validar').classList.remove('hidden');
  
  if(document.getElementById('btn-final-restart')) {
    document.getElementById('btn-final-restart').classList.add('hidden');
  }
  
  document.getElementById('level-1-container').classList.remove('hidden');
  document.getElementById('level-2-container').classList.add('hidden');
  
  const radios = document.querySelectorAll('#level-2-container input[type="radio"]');
  radios.forEach(radio => radio.checked = false);

  const bloquesPreguntas = document.querySelectorAll('.quiz-question');
  bloquesPreguntas.forEach(bloque => {
    bloque.classList.remove('correct', 'incorrect');
  });
  
  actualizarUIGamificacion();
  inicializarEscenario();
}

// ==========================================
// ETAPA 3: DRAG AND DROP FORMAL
// ==========================================

function iniciarNivel3() {
  document.getElementById('level-2-container').classList.add('hidden');
  document.getElementById('level-3-container').classList.remove('hidden');
  if (window.MathJax) { 
    MathJax.typesetPromise().catch((err) => console.log('Error en MathJax:', err)); 
  }
}

// Variables para el Drag and Drop
let draggedItem = null;

// Configurar eventos de arrastre
document.addEventListener("DOMContentLoaded", () => {
  const draggables = document.querySelectorAll('.draggable-word');
  const dropZones = document.querySelectorAll('.drop-zone');
  const banco = document.getElementById('banco-palabras');

  draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', function(e) {
      draggedItem = this;
      setTimeout(() => this.style.opacity = '0.5', 0);
    });

    draggable.addEventListener('dragend', function() {
      setTimeout(() => this.style.opacity = '1', 0);
      draggedItem = null;
    });
  });

  dropZones.forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    
    zone.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('drag-over');
      // Si la zona ya tiene una palabra, la devolvemos al banco
      if (this.hasChildNodes()) {
        banco.appendChild(this.firstChild);
      }
      this.appendChild(draggedItem);
      this.classList.remove('correct', 'incorrect'); // Limpiar colores previos
    });
  });

  // Permitir devolver palabras al banco
  banco.addEventListener('dragover', e => e.preventDefault());
  banco.addEventListener('drop', function(e) {
    e.preventDefault();
    this.appendChild(draggedItem);
  });
});

function evaluarNivel3() {
  const dropZones = document.querySelectorAll('.drop-zone');
  let correctas = 0;
  let todasLlenas = true;

  dropZones.forEach(zone => {
    if (!zone.hasChildNodes()) {
      todasLlenas = false;
    } else {
      let palabra = zone.firstChild;
      let valorEsperado = zone.getAttribute('data-expected');
      let valorPuesto = palabra.getAttribute('data-value');

      if (valorEsperado === valorPuesto) {
        correctas++;
        zone.classList.add('correct');
        zone.classList.remove('incorrect');
      } else {
        zone.classList.add('incorrect');
        zone.classList.remove('correct');
      }
    }
  });

  if (!todasLlenas) {
    swal({ title: "Demostración Incompleta", text: "Llena todos los espacios vacíos primero.", icon: "warning" });
    return;
  }

  if (correctas === 3) {
    lanzarConfetiMegaDopamina(); // ¡Reutilizamos tu confeti neón!
    swal({ title: "¡Maestría Matemática! 🎓", text: "Has demostrado formalmente la sucesión. El rigor matemático es tuyo.", icon: "success" });
  } else {
    swal({ title: "Hay detalles por pulir", text: "Revisa las casillas en rojo. ¡La lógica está casi perfecta!", icon: "error" });
  }
}

// ==========================================
// INICIO AUTOMÁTICO DEL JUEGO
// ==========================================
actualizarUIGamificacion();
inicializarEscenario();