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
    //UTILIZANDO EQUIVALÊNCIA DE TAXAS COMPOSTAS
    // i = (1 + i)^n - 1
    // i = (1 + i)^(1/n) - 1

    
    let taxaUnitaria;
    // IMPORTANTE: converti a taxa de % para unitária (ex: 6% -> 0.06), pois utilizei a taxa unitária nas formulas. 
    taxaUnitaria = taxa / 100;

    let taxaNormalizada;
    if(unidadeTaxa === unidadeTempo){
      taxaNormalizada = taxaUnitaria;
      console.log(`Unidade de taxa: ${unidadeTaxa} e unidade de tempo: ${unidadeTempo} já estão na mesma base. Não é necessário normalizar.`);
    }
    //unidade da taxa > unidade do tempo
    else if(unidadeTaxa === 'ano' && unidadeTempo === 'mes'){
      taxaNormalizada = (1 + taxaUnitaria)**(1/12) - 1; // Converto a taxa anual para mensal usando a fórmula de equivalência de taxas compostas
    }else if(unidadeTaxa === 'ano' && unidadeTempo === 'dia'){
      taxaNormalizada = (1 + taxaUnitaria)**(1/360) - 1; 
    }else if(unidadeTaxa === 'mes' && unidadeTempo === 'dia'){
      taxaNormalizada = (1 + taxaUnitaria)**(1/30) - 1;
    }
    //unidade da taxa < unidade do 
    else if(unidadeTaxa === 'dia' && unidadeTempo === 'mes'){
      taxaNormalizada = (1 + taxaUnitaria)**30 - 1;
    }else if(unidadeTaxa === 'dia' && unidadeTempo === 'ano'){
      taxaNormalizada = (1 + taxaUnitaria)**360 - 1;
    }else if(unidadeTaxa === 'mes' && unidadeTempo === 'ano'){
      taxaNormalizada = (1 + taxaUnitaria)**12 - 1;
    }


    // .CÁLCULOS 
    let resultadoFinal = '';

    switch (operacao) {
      case 'vf': // Calcular Montante (Valor Futuro)
        // Fórmula: VF = VP * (1 + i) ** n
        if (!isNaN(vp) && !isNaN(taxaNormalizada) && !isNaN(tempo)) {
          const vfCalc = vp * (1 + taxaNormalizada)**tempo;
          resultadoFinal = `Montante (VF): R$ ${vfCalc.toFixed(2)}`;
        } else if(!isNaN(vp) && !isNaN(juros)){
          const vfCalc = vp + juros;
          resultadoFinal = `Montante (VF): R$ ${vfCalc.toFixed(2)}`;
        } else {
          resultadoFinal = 'Preencha VP, Taxa (i) e Tempo (n) para calcular o Montante [VF = VP * (1 + i) ** n] ou VP e J [VF = VP + J]';
        }
        break;

      case 'vp': // Calcular Capital (Valor Presente)
        // Fórmula: VP = VF / (1 + i) ** n 
        if (!isNaN(vf) && !isNaN(taxaNormalizada) && !isNaN(tempo)) {
            const vpCalc = vf / (1 + taxaNormalizada) ** tempo;
            resultadoFinal = `Capital (VP): R$ ${vpCalc.toFixed(2)}`;
        } else if(!isNaN(juros) && !isNaN(taxaNormalizada) && !isNaN(tempo)){
            const vpCalc = juros / ((1 + taxaNormalizada) ** tempo - 1);
            resultadoFinal = `Capital (VP): R$ ${vpCalc.toFixed(2)}`;
        }else if(!isNaN(vf) && !isNaN(juros)){
            const vpCalc = vf - juros;
            resultadoFinal = `Capital (VP): R$ ${vpCalc.toFixed(2)}`;
        } else{
            resultadoFinal = 'Preencha VF ou J, Taxa (i) e Tempo (n) para calcular o Capital [VP = VF / (1 + i) ** n ] ou [VP = J / ((1 + i) ** n - 1)] ou [VP = VF - J]';
        }
        break;

      case 'juros': // Calcular Juros
        // Fórmula: J = VP * ((1 + i) ** n - 1)
        if (!isNaN(vp) && !isNaN(taxaNormalizada) && !isNaN(tempo)) {
          const jurosCalc = vp * ((1 + taxaNormalizada) ** tempo - 1);
          resultadoFinal = `Juros (J): R$ ${jurosCalc.toFixed(2)}`;
        } else if(!isNaN(vf) && !isNaN(vp)){
          const jurosCalc = vf - vp;
          resultadoFinal = `Juros (J): R$ ${jurosCalc.toFixed(2)}`;
        } else {
          resultadoFinal = 'Preencha VP e VF, ou VP Taxa (i) e Tempo (n) para calcular os Juros. [ J = VP * ((1 + i) ** n - 1)] ou [J = VF - VP]';
        }
        break;

      case 'taxa': // Calcular Taxa (i)
        // Fórmula: i = (VF / VP) ** (1/n) - 1
        if (!isNaN(vp) && !isNaN(vf) && !isNaN(tempo)) {
          let taxaCalc = ((vf / vp) ** (1/tempo)) - 1;
          // O resultado da fórmula é unitário (ex: 0.005). Logo, converti para %
          taxaCalc = taxaCalc * 100;
          resultadoFinal = `Taxa (i): ${taxaCalc.toFixed(4)}% ao mês`;
        } else {
          resultadoFinal = 'Preencha VP, VF e Tempo (n) [i = (VF / VP) ** (1/n) - 1] para calcular a Taxa.';
        }
        break;

      case 'tempo': // Calcular Tempo (n)
        // Fórmula: n = log(VF / VP) / log(1 + i)
        if (!isNaN(vp) && !isNaN(vf) && !isNaN(taxaNormalizada)) {
          const tempoCalc = Math.log(vf / vp) / Math.log(1 + taxaNormalizada);
          if (unidadeTempo === 'ano') {
            let inteiro = Math.floor(tempoCalc);
            let decimal = tempoCalc - inteiro;
            let meses = decimal * 12;
            resultadoFinal = `Tempo (n): ${inteiro} anos e ${meses.toFixed(2)} meses`;
          }else if (unidadeTempo === 'dia') {
            resultadoFinal = `Tempo (n): ${tempoCalc.toFixed(2)} dias`;
          }else {
            resultadoFinal = `Tempo (n): ${tempoCalc.toFixed(2)} meses`;
          }
          
        }else {
          resultadoFinal = 'Preencha VP, VF e Taxa (i) para calcular o Tempo. [ n = log(VF / VP) / log(1 + i)]';
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
  // =================(CONVERSÃO NOMINAL / EFETIVA)================== 
  // -------------------------------------------------------------

  const taxaValorInput = document.getElementById('taxa-valor');
  const fatorKInput = document.getElementById('fator-k');
  const tipoCalculoSelect = document.getElementById('tipo-calculo-taxa');
  const resultadoTaxasDiv = document.getElementById('resultado-taxas');

  tipoCalculoSelect.addEventListener('change', (event) => {
    const operacao = event.target.value;
    if (operacao) {
      calcularTaxaNominal(operacao);
      event.target.value = ""; 
    }
  });

  function calcularTaxaNominal(operacao) {
    const taxa = parseFloat(taxaValorInput.value);
    const k = parseFloat(fatorKInput.value);

    if (isNaN(taxa) || isNaN(k) || k === 0) {
      resultadoTaxasDiv.innerHTML = "<p>Preencha a Taxa e o Fator k (diferente de zero).</p>";
      return;
    }

    let taxaUnitaria;
    // IMPORTANTE: converti a taxa de % para unitária (ex: 6% -> 0.06), pois utilizei a taxa unitária nas formulas. 
    taxaUnitaria = taxa / 100;

    let resultado = 0;
    let resultadoParcial = 0;
    let texto = "";

    if (operacao === 'nominal-para-efetiva') {
      resultadoParcial = taxaUnitaria / k;
      resultado = (1 + resultadoParcial)**k - 1;
      resultado = resultado * 100; 
      texto = `Taxa Efetiva (Proporcional): ${resultado.toFixed(4)}% por período`;

      
    } else if (operacao === 'efetiva-para-nominal') {
      resultadoParcial = (1 + taxaUnitaria)**(1/k) - 1;
      resultado = resultadoParcial * k;
      resultado = resultado * 100; 
      texto = `Taxa Nominal (ik): ${resultado.toFixed(4)}%`;
    }

    resultadoTaxasDiv.innerHTML = `<p>${texto}</p>`;
  }


  // -------------------------------------------------------------
  // =================(TAXAS EQUIVALENTES)================== 
  // -------------------------------------------------------------

  const taxaEqInput = document.getElementById('taxa-eq-valor');
  const periodoInformadoSelect = document.getElementById('periodo-informado');
  const periodoSolicitadoSelect = document.getElementById('periodo-solicitado');
  const btnCalcularEq = document.getElementById('btn-calcular-eq'); // Note que criei um ID novo pro botão
  const resultadoEqDiv = document.getElementById('resultado-eq');

  // Evento de clique no botão
  btnCalcularEq.addEventListener('click', (event) => {
    event.preventDefault();
    calcularTaxaEquivalente();
  });

  function calcularTaxaEquivalente() {
    const taxa = parseFloat(taxaEqInput.value);
    const periodoOrigem = periodoInformadoSelect.value;
    const periodoDestino = periodoSolicitadoSelect.value;

    if (isNaN(taxa)) {
      resultadoEqDiv.innerHTML = "<p>Preencha o valor da taxa corretamente.</p>";
      return;
    }

    // Tabela de dias (Base Comercial 360)
    // Isso permite calcular a proporção exata entre quaisquer unidades
    const dias = {
      'dia': 1,
      'mes': 30,
      'trimestre': 90,
      'semestre': 180,
      'ano': 360
    };

    const diasOrigem = dias[periodoOrigem];
    const diasDestino = dias[periodoDestino];

    // Cálculo do expoente (n)
    // Se for Mês(30) -> Ano(360): expoente = 360/30 = 12 (Potência)
    // Se for Ano(360) -> Mês(30): expoente = 30/360 = 0.0833 (Raiz)
    const expoente = diasDestino / diasOrigem;

    const taxaUnitaria = taxa / 100;

    // Fórmula Equivalência: (1+i)^n - 1
    const resultado = (1 + taxaUnitaria) ** expoente - 1;
    
    const resultadoPorcentagem = resultado * 100;

    const nomes = { 
      'dia': 'Dia', 'mes': 'Mês', 'trimestre': 'Trimestre', 
      'semestre': 'Semestre', 'ano': 'Ano' 
    };

    resultadoEqDiv.innerHTML = `
      <p><strong>Taxa Equivalente:</strong></p>
      <p style="font-size: 1.3em;">
        ${taxa}% ao ${nomes[periodoOrigem]} = 
        <strong>${resultadoPorcentagem.toFixed(4)}% ao ${nomes[periodoDestino]}</strong>
      </p>
    `;
  }
});