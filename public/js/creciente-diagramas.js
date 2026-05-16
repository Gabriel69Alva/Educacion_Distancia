let arrayRespuestas = [];
let valoresDerecha = [];
let textDerechoObjetos = [];

// Elementos visuales del canvas
let canvas;
const X_IZQ = 220;
const X_DER = 440;
const Y_START = 80;
const Y_STEP = 60;

function validarCirculo(x, y, h, k) {
  return Math.sqrt(Math.pow(x - h, 2) + Math.pow(y - k, 2)) <= 25;
}

// Genera un arreglo de 4 números aleatorios únicos, ordenados de forma ascendente o variada
function generarValoresAleatorios() {
  let base = Math.floor(Math.random() * 10) + 1;
  let arr = [];
  while(arr.length < 4) {
    let incremento = Math.floor(Math.random() * 5) + 1;
    base += incremento;
    arr.push(base);
  }
  // Desordenamos el array para que el alumno analice cuál corresponde a cada uno
  return arr.sort(() => Math.random() - 0.5);
}

function inicializarEscenario() {
  // Reiniciar variables de control
  arrayRespuestas = [];
  textDerechoObjetos = [];
  valoresDerecha = generarValoresAleatorios();

  // Crear o limpiar canvas
  if (!canvas) {
    canvas = new fabric.Canvas("myCanvas", { 
      backgroundColor: "#fafafa",
      selection: false 
    });
    fabric.Object.prototype.originX = fabric.Object.prototype.originY = "center";
    fabric.Object.prototype.noScaleCache = true;
  } else {
    canvas.clear();
    canvas.setBackgroundColor("#fafafa", canvas.renderAll.bind(canvas));
  }

  // Contenedores / Elipses de conjuntos
  const conjuntoA = new fabric.Circle({
    radius: 110, fill: "#eff6ff", left: 190, top: 180,
    stroke: "#bfdbfe", strokeWidth: 2, scaleX: 0.65,
    selectable: false, evented: false
  });

  const conjuntoB = new fabric.Circle({
    radius: 110, fill: "#f0fdf4", left: 470, top: 180,
    stroke: "#bbf7d0", strokeWidth: 2, scaleX: 0.65,
    selectable: false, evented: false
  });

  canvas.add(conjuntoA, conjuntoB);

  // Agregar Puntos Suspensivos abajo de los conjuntos para indicar infinitud (Sucesión)
  let puntosIzq = new fabric.Text("...", { left: 190, top: 310, fontSize: 26, fill: "#9ca3af", selectable: false, evented: false });
  let puntosDer = new fabric.Text("...", { left: 470, top: 310, fontSize: 26, fill: "#9ca3af", selectable: false, evented: false });
  canvas.add(puntosIzq, puntosDer);

  // Etiquetas de los conjuntos
  let lblDom = new fabric.Text("Dominio (n)", { left: 190, top: 40, fontSize: 14, fontWeight: 'bold', fill: '#6b7280', selectable: false });
  let lblCod = new fabric.Text("Términos a(n)", { left: 470, top: 40, fontSize: 14, fontWeight: 'bold', fill: '#6b7280', selectable: false });
  canvas.add(lblDom, lblCod);

  // Crear elementos de izquierda (Dominio fijo: 1, 2, 3, 4) y derecha (Aleatorios)
  for (let i = 0; i < 4; i++) {
    let yPos = Y_START + (i * Y_STEP);
    let valIzq = (i + 1).toString();
    let valDer = valoresDerecha[i].toString();

    // Línea interactiva
    let line = new fabric.Line([X_IZQ, yPos, X_IZQ + 30, yPos], {
      fill: "transparent", stroke: "#93c5fd", strokeWidth: 3,
      selectable: false, evented: false
    });
    canvas.add(line);

    // Texto Izquierda
    let txtIzq = new fabric.Text(valIzq, {
      left: X_IZQ - 30, top: yPos, fontSize: 18, fontWeight: '500',
      fill: "#1e3a8a", selectable: false
    });
    canvas.add(txtIzq);

    // Texto Derecha (Destinos)
    let txtDer = new fabric.Text(valDer, {
      name: valDer, left: X_DER + 30, top: yPos, fontSize: 18, fontWeight: '500',
      fill: "#14532d", selectable: false
    });
    canvas.add(txtDer);
    textDerechoObjetos.push(txtDer);

    // Punta de la flecha (Triángulo arrastrable)
    let arrow = new fabric.Triangle({
      name: valIzq, left: X_IZQ + 30, top: yPos, width: 12, height: 16,
      fill: "#3b82f6", angle: 90, hasControls: false, hasBorders: false
    });
    arrow.line = line;
    canvas.add(arrow);
  }

  // Evento de arrastre
  canvas.on("object:moving", function (e) {
    let p = e.target;
    if (!p.line) return;

    // Actualizar destino de la línea
    p.line.set({ x2: p.left, y2: p.top });

    // Calcular ángulo de la flecha dinámicamente
    let angulo = (180 / Math.PI) * Math.atan2(p.top - p.line.get("y1"), p.left - p.line.get("x1")) + 90;
    p.set("angle", angulo);

    // Limpiar respuestas previas asociadas a esta flecha
    arrayRespuestas = arrayRespuestas.filter(item => item.valor1 !== p.name);

    // Verificar si colisiona con algún número de la derecha
    textDerechoObjetos.forEach(txtObj => {
      if (validarCirculo(p.left, p.top, txtObj.left, txtObj.top)) {
        arrayRespuestas.push({ valor1: parseInt(p.name), valor2: parseInt(txtObj.name) });
        txtObj.set("fill", "#3b82f6"); // feedback visual azul al conectar
      } else {
        // Si no está tocando este objeto en particular, devolver su color original si no tiene otra conexión
        let conectado = arrayRespuestas.some(r => r.valor2 === parseInt(txtObj.name));
        if(!conectado) txtObj.set("fill", "#14532d");
      }
    });

    canvas.renderAll();
  });
}

function validarRespuestas() {
  // 1. Validar que todas las variables tengan asignación
  if (arrayRespuestas.length < 4) {
    swal({ title: "Incompleto", text: "Por favor, asigna un valor a cada término del dominio.", icon: "warning" });
    return;
  }

  // 2. Validación de Criterio de Sucesión Creciente:
  // Si x < y entonces a(x) < a(y)
  let esCreciente = true;

  for (let i = 0; i < arrayRespuestas.length; i++) {
    for (let j = 0; j < arrayRespuestas.length; j++) {
      let x = arrayRespuestas[i].valor1;
      let ax = arrayRespuestas[i].valor2;
      let y = arrayRespuestas[j].valor1;
      let ay = arrayRespuestas[j].valor2;

      if (x < y && !(ax < ay)) {
        esCreciente = false;
        break;
      }
    }
    if (!esCreciente) break;
  }

  if (esCreciente) {
    swal({ title: "¡Excelente!", text: "¡Criterio matemático correcto! La sucesión es estrictamente creciente.", icon: "success" });
  } else {
    swal({ title: "Revisa de nuevo", text: "No se cumple el criterio matemático. Existe al menos un par donde x < y pero a(x) ≥ a(y).", icon: "error" });
  }
}

function reiniciarEscenario() {
  inicializarEscenario();
}

// Ejecución inicial al cargar la página
window.onload = inicializarEscenario;