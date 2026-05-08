  /*  <math> (a_n)_{n\in{\mathbb N}}</math> */

  var board; 
  var seq;
  var seq1;
  var t;
  var n = 0;
  var n1 = 0;
  var c;
  var w;
  var ej;
  var txt1;

  // This function calculates the value of 'val' based on the values of 'c', 'w', and 'n'.
  // It then pushes the value of 'n' to 'seq.dataX' and 'val' to 'seq.dataY'.
  // Finally, it increments the value of 'n' by 1.

  var seq_add = function () {
      console.log("c w n : ", c, w, t)
      var val = ((c / 40) + ((w-c/40) * (Math.exp(-0.0052 * n ))));
      console.log("y: ", val, " x: ", n)
      seq.dataX.push(n);
      seq.dataY.push(val);
      n++;
  };

  var seq_add1 = function () {
    console.log("c w n : ", c, w, t)
    var val = (((c - ej) / 40) + ((w-(c-ej)/40) * (Math.exp(-0.0052 * n1 ))));
    console.log("y: ", val, " x: ", n1)
    seq1.dataX.push(n1);
    seq1.dataY.push(val);
    n1++;
  };


  var TO;
  var TO1;

  var approx = function () {
      seq_add();
      board.update();
      if (n <= t) {
          TO = setTimeout(approx, 150);
      }
  };
  var approx1 = function () {
    seq_add1();
    board.update();
    if (n1 <= t) {
      TO1 = setTimeout(approx1, 150);
    }
};



  var start_approx = function () {
      console.log("entro")
      seq.dataX = [];
      seq.dataY = [];
      seq1.dataX = [];
      seq1.dataY = [];
      approx();
      approx1();
  }

  var clear_all = function () {
      clearTimeout(TO);
  };

  function onCalcular() {
      const calorias = document.getElementById("calorias").value;
      const peso = document.getElementById("peso").value;
      const dias = document.getElementById("dias").value;
      ej = parseInt(document.getElementById("ejercicio").value);
     
      console.log("valores: ", calorias, peso, dias)
     
      t = parseInt(dias);
      c = parseInt(calorias);
      w = parseInt(peso);
      clear_all();


     board = JXG.JSXGraph.initBoard('box4', { axis: true, boundingbox: [-1, w + 30 , t, -1] });
     seq = board.create('curve', [[], []], { strokeColor: 'red' });
     seq1 = board.create('curve', [[], []], { strokeColor: 'green' });
     txt1 = board.create('text', [8, 6, function () { return 'n=' + (seq.dataX.length - 1) + ': Peso esperado = ' + seq.dataY[seq.dataY.length - 1]; }], { strokeColor: 'red' });

     board.create('text', [8, 2, function () { return 'n=' + (seq1.dataX.length - 1) + ': Peso esperado = ' + seq1.dataY[seq1.dataY.length - 1]; }], { strokeColor: 'green' });

      start_approx();


  }

