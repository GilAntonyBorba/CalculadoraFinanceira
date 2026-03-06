document.addEventListener('DOMContentLoaded', () => {

  const vpInput = document.getElementById('valor-presente');
  const vfInput = document.getElementById('valor-futuro');
  const jurosInput = document.getElementById('juros');
  const taxaInput = document.getElementById('taxa');
  const unidadeTaxaSelect = document.getElementById('unidade-taxa');
  const tempoInput = document.getElementById('tempo');
  const unidadeTempoSelect = document.getElementById('unidade-tempo');
  
  const selectCalculo = document.getElementById('button-calcular');
  const resultadoDiv = document.querySelector('.resultado');

  selectCalculo.addEventListener('change', (event) => {
    realizarCalculo(event.target.value);
  });

  function realizarCalculo(operacao) {
    // Lê os valores dos campos. parseFloat converte o texto (string) em número.
    const vp = parseFloat(vpInput.value);
    const vf = parseFloat(vfInput.value);
    const juros = parseFloat(jurosInput.value);
    const taxa = parseFloat(taxaInput.value); // Ex: 6 (para 6%)
    const tempo = parseFloat(tempoInput.value);

    const unidadeTaxa = unidadeTaxaSelect.value; // "dia", "mes", "ano"
    const unidadeTempo = unidadeTempoSelect.value; // "dia", "mes", "ano"

    // NORMALIZAÇÃO DE UNIDADES ------------------------------------------------------------------------------------
    // taxa (i) e tempo (n) DEVEM estar na mesma base.

    // Converto a taxa para "ao mês".
    // Se a taxa for 6% ao ano, vira 0.5% ao mês.
    let taxaNormalizada; 
    if (unidadeTaxa === 'ano') {
      taxaNormalizada = taxa / 12; // 6% a.a. / 12 = 0.5% a.m.
    } else if (unidadeTaxa === 'dia') {
      taxaNormalizada = taxa * 30; // 0.1% a.d. * 30 = 3% a.m. (mês comercial de 30 dias)
    } else {
      taxaNormalizada = taxa; // Já está "ao mês"
    }
    // IMPORTANTE: converti a taxa de % para unitária (ex: 6% -> 0.06), pois utilizei a taxa unitária nas formulas. 
    taxaNormalizada = taxaNormalizada / 100; // 0.5% a.m. -> 0.005

    // Converto o tempo para "meses".
    let tempoNormalizado;
    if (unidadeTempo === 'ano') {
      tempoNormalizado = tempo * 12; // 2 anos * 12 = 24 meses
      console.log(`Tempo normalizado (anos -> meses): ${tempo} anos = ${tempoNormalizado} meses`);
    } else if (unidadeTempo === 'dia') {
      tempoNormalizado = tempo / 30; // 60 dias / 30 = 2 meses (mês comercial de 30 dias)
    } else {
      tempoNormalizado = tempo; // Já está em "meses"
    }


    // 5.CÁLCULOS 
    let resultadoFinal = '';

    switch (operacao) {
      case 'vf': // Calcular Montante (Valor Futuro)
        // Fórmula: VF = VP * (1 + i * n)
        if (!isNaN(vp) && !isNaN(taxaNormalizada) && !isNaN(tempoNormalizado)) {
          const vfCalc = vp * (1 + taxaNormalizada * tempoNormalizado);
          resultadoFinal = `Montante (VF): R$ ${vfCalc.toFixed(2)}`;
        } else if(!isNaN(vp) && !isNaN(juros)){
          const vfCalc = vp + juros;
          resultadoFinal = `Montante (VF): R$ ${vfCalc.toFixed(2)}`;
        } else {
          resultadoFinal = 'Preencha VP, Taxa (i) e Tempo (n) para calcular o Montante [VF = VP * (1 + i * n)] ou VP e J [VF = VP + J]';
        }
        break;

      case 'vp': // Calcular Capital (Valor Presente)
        // Fórmula: VP = VF / (1 + i * n) 
        if (!isNaN(vf) && !isNaN(taxaNormalizada) && !isNaN(tempoNormalizado)) {
            const vpCalc = vf / (1 + taxaNormalizada * tempoNormalizado);
            resultadoFinal = `Capital (VP): R$ ${vpCalc.toFixed(2)}`;
        } else if(!isNaN(juros) && !isNaN(taxaNormalizada) && !isNaN(tempoNormalizado)){
            const vpCalc = juros / (taxaNormalizada * tempoNormalizado);
            resultadoFinal = `Capital (VP): R$ ${vpCalc.toFixed(2)}`;
        }else if(!isNaN(vf) && !isNaN(juros)){
            const vpCalc = vf - juros
            resultadoFinal = `Capital (VP): R$ ${vpCalc.toFixed(2)}`;
        } else{
            resultadoFinal = 'Preencha VF ou J, Taxa (i) e Tempo (n) para calcular o Capital [VP = VF / (1 + i * n)] ou [VP = J / (i * n)]';
        }
        break;

      case 'juros': // Calcular Juros
        // Fórmula: J = VP * i * n
        if (!isNaN(vp) && !isNaN(taxaNormalizada) && !isNaN(tempoNormalizado)) {
          const jurosCalc = vp * taxaNormalizada * tempoNormalizado;
          resultadoFinal = `Juros (J): R$ ${jurosCalc.toFixed(2)}`;
        } else {
          resultadoFinal = 'Preencha VP, Taxa (i) e Tempo (n) para calcular os Juros.';
        }
        break;

      case 'taxa': // Calcular Taxa (i)
        // Fórmula: i = ((VF / VP) - 1) / n 
        if (!isNaN(vp) && !isNaN(vf) && !isNaN(tempoNormalizado)) {
          let taxaCalc = ((vf / vp) - 1) / tempoNormalizado;
          // O resultado da fórmula é unitário (ex: 0.005). Logo, converti para %
          taxaCalc = taxaCalc * 100;
          resultadoFinal = `Taxa (i): ${taxaCalc.toFixed(4)}% ao mês`;
        } else if(!isNaN(juros) && !isNaN(vp) && !isNaN(tempoNormalizado)){
          let taxaCalc = juros/(vp*tempoNormalizado);
          // O resultado da fórmula é unitário (ex: 0.005). Logo, converti para %
          taxaCalc = taxaCalc * 100;
          resultadoFinal = `Taxa (i): ${taxaCalc.toFixed(4)}% ao mês`;
        }else {
          resultadoFinal = 'Preencha VP, VF e Tempo (n) [i = ((VF / VP) - 1) / n] ou J, VP e Tempo(n) [i = j(vp * n)] para calcular a Taxa.';
        }
        break;

      case 'tempo': // Calcular Tempo (n)
        // Fórmula: n = ((VF / VP) - 1) / i
        if (!isNaN(vp) && !isNaN(vf) && !isNaN(taxaNormalizada)) {
          const tempoCalc = ((vf / vp) - 1) / taxaNormalizada;
          resultadoFinal = `Tempo (n): ${tempoCalc.toFixed(2)} meses`;
        } else if(!isNaN(juros) && !isNaN(vp) && !isNaN(taxaNormalizada)){
          const tempoCalc = juros/(vp * taxaNormalizada);
          resultadoFinal = `Tempo (n): ${tempoCalc.toFixed(2)} meses`;
        }else {
          resultadoFinal = 'Preencha VP, VF e Taxa (i) para calcular o Tempo. [n = ((VF / VP) - 1) / i] ou J, vp e i [n = j/(vp * i)]';
        }
        break;

      default:
        resultadoFinal = 'Selecione uma operação para calcular.';
    }

    exibirResultado(resultadoFinal);
  }

  // 7.Agora, exibo o resultado na tela.  
  function exibirResultado(mensagem) {
    // Limpei o conteúdo antigo
    resultadoDiv.innerHTML = ''; 
    
    // Criei um novo parágrafo <p>
    const p = document.createElement('p');
    p.textContent = mensagem; 
    
    // Adiciona o <p> dentro da div <div class="resultado">
    resultadoDiv.appendChild(p);
  }



  // -------------------------------------------------------------
  // =================(TAXA EFETIVA/COMERCIAL)================== 
  // -------------------------------------------------------------


  const taxaIcInput = document.getElementById('taxa-ic');
  const taxaIInput = document.getElementById('taxa-i');
  const tempoDescontoInput = document.getElementById('tempo-desconto');
  const unidadeTempoDescontoSelect = document.getElementById('unidade-tempo-desconto');
  const selectCalculoDesconto = document.getElementById('button-calcular-desconto');
  const resultadoDescontoDiv = document.getElementById('resultado-desconto');

  selectCalculoDesconto.addEventListener('change', (event) => {
    realizarCalculoDesconto(event.target.value);
  });

  function realizarCalculoDesconto(operacao) {
    const ic = parseFloat(taxaIcInput.value) / 100; // Converti para unitária
    const i = parseFloat(taxaIInput.value) / 100;  // Converti para unitária
    const tempo = parseFloat(tempoDescontoInput.value);
    const unidadeTempo = unidadeTempoDescontoSelect.value;

    // Normalizei o tempo para "meses" (assumindo que as taxas são a.m.)
    let n;
    if (unidadeTempo === 'ano') {
      n = tempo * 12;
    } else if (unidadeTempo === 'dia') {
      n = tempo / 30;
    } else {
      n = tempo;
    }

    let resultadoFinal = '';

    switch (operacao) {
      case 'calc-i': // Calcular Taxa Efetiva (i)
        // Fórmula: i = ic / (1 - ic * n)
        if (!isNaN(ic) && !isNaN(n)) {
          let iCalc = ic / (1 - (ic * n));
          iCalc = iCalc * 100; // Converte para %
          resultadoFinal = `Taxa Efetiva (i): ${iCalc.toFixed(4)}%`;
        } else {
          resultadoFinal = 'Preencha Taxa Comercial (ic) e Tempo (n).';
        }
        break;

      case 'calc-ic': // Calcular Taxa Comercial (ic)
        // Fórmula: ic = i / (1 + i * n) 
        if (!isNaN(i) && !isNaN(n)) {
          let icCalc = i / (1 + (i * n));
          icCalc = icCalc * 100; // Converte para %
          resultadoFinal = `Taxa Comercial (ic): ${icCalc.toFixed(4)}%`;
        } else {
          resultadoFinal = 'Preencha Taxa Efetiva (i) e Tempo (n).';
        }
        break;
    }

    // Exibe o resultado na segunda div de resultado
    resultadoDescontoDiv.innerHTML = `<p>${resultadoFinal}</p>`;
  }


});