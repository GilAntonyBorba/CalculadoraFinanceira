document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // AMORTIZAÇÃO SAF / PRICE
  // ==========================================
  const btnCalcularPrice = document.getElementById('btn-calcular-price');
  const resultadoPriceDiv = document.getElementById('tabela-container');

  btnCalcularPrice.addEventListener('click', () => {
    const vp = parseFloat(document.getElementById('valor-financiamento').value);
    const taxa = parseFloat(document.getElementById('taxa-price').value) / 100;
    const n = parseInt(document.getElementById('tempo-price').value);

    if (isNaN(vp) || isNaN(taxa) || isNaN(n)) {
      resultadoPriceDiv.innerHTML = '<p style="color: red;">Preencha VP, Taxa e Tempo corretamente.</p>';
      return;
    }

    let pmt = 0;
    let linhas = [];
    let totalJuros = 0;
    let totalAmort = 0;
    let saldo = vp;


    linhas.push({ t: 0, pmt: 0, juros: 0, amort: 0, saldo: saldo });

    if (taxa === 0) {
        pmt = vp / n; 
    } else {
        // Fórmula Price: PMT = VP * [ i(1+i)^n ] / [ (1+i)^n - 1 ]
        pmt = vp * (Math.pow(1 + taxa, n) * taxa) / (Math.pow(1 + taxa, n) - 1);
    }


    for (let t = 1; t <= n; t++) {
        let juros = saldo * taxa;
        let amortizacao = pmt - juros;
        saldo -= amortizacao;

        // Ajuste da última parcela (evita que sobrem centavos no final)
        if (t === n && Math.abs(saldo) > 0.0001) {
            amortizacao += saldo;
            saldo = 0;
        }

        linhas.push({ t: t, pmt: pmt, juros: juros, amort: amortizacao, saldo: Math.abs(saldo) });
        totalJuros += juros;
        totalAmort += amortizacao;
    }

    let totalPmt = pmt * n;


    let html = `
      <table class="tabela-price">
        <thead>
          <tr>
            <th>Mês</th>
            <th>Prestação (PMT)</th>
            <th>Juros</th>
            <th>Amortização</th>
            <th>Saldo Devedor</th>
          </tr>
        </thead>
        <tbody>
    `;


    let htmlLinhas = "";
    for (let i = 0; i < linhas.length; i++) {
        let l = linhas[i];
        if(l.t === 0) {
            htmlLinhas += `<tr><td>${l.t}</td><td>-</td><td>-</td><td>-</td><td>R$ ${l.saldo.toFixed(2)}</td></tr>`;
        } else {
            htmlLinhas += `<tr>
                <td>${l.t}</td>
                <td>R$ ${l.pmt.toFixed(2)}</td>
                <td>R$ ${l.juros.toFixed(2)}</td>
                <td>R$ ${l.amort.toFixed(2)}</td>
                <td>R$ ${l.saldo.toFixed(2)}</td>
            </tr>`;
        }
    }
    
    html += htmlLinhas;

    html += `
        <tr style="font-weight: bold; background-color: #222;">
            <td>TOTAL</td>
            <td>R$ ${totalPmt.toFixed(2)}</td>
            <td>R$ ${totalJuros.toFixed(2)}</td>
            <td>R$ ${totalAmort.toFixed(2)}</td>
            <td>-</td>
        </tr>
        </tbody>
      </table>
    `;

    resultadoPriceDiv.innerHTML = html;
  });


  // ==========================================
  // VALOR PRESENTE LÍQUIDO (VPL)
  // ==========================================
  const btnCalcularVpl = document.getElementById('btn-calcular-vpl');
  const resultadoVplDiv = document.getElementById('resultado-vpl');

  btnCalcularVpl.addEventListener('click', () => {
    const inv = parseFloat(document.getElementById('investimento-vpl').value);
    const taxaK = parseFloat(document.getElementById('taxa-vpl').value) / 100;
    const fluxosStr = document.getElementById('fluxos-vpl').value;
    const valorResidual = parseFloat(document.getElementById('valor-residual').value) || 0;
    const periodoResidual = parseInt(document.getElementById('periodo-residual').value) || 0;

    if (isNaN(inv) || isNaN(taxaK) || !fluxosStr) {
        resultadoVplDiv.innerHTML = '<p style="color: red;">Preencha Investimento, Taxa e Fluxos corretamente.</p>';
        return;
    }


    let fluxos = fluxosStr.split(',').map(f => parseFloat(f.trim()));

    if (fluxos.some(isNaN)) {
        resultadoVplDiv.innerHTML = '<p style="color: red;">Certifique-se de usar apenas números separados por vírgula nos fluxos de caixa</p>';
        return;
    }


    if (valorResidual > 0 && periodoResidual > 0) {
        while (fluxos.length < periodoResidual) {
            fluxos.push(0);
        }
        fluxos[periodoResidual - 1] += valorResidual;
    }

    // Cálculo do VPL = -Inv + Soma( FC / (1+k)^t )
    let vpl = -inv;
    for (let t = 0; t < fluxos.length; t++) {
        vpl += fluxos[t] / Math.pow((1 + taxaK), t + 1);
    }


    let veredito = "";
    let cor = "";
    if (vpl > 0) {
        veredito = "Aceito / Viável (Gera Lucro)";
        cor = "#4caf50"; 
    } else if (vpl < 0) {
        veredito = "Rejeitado / Inviável (Gera Prejuízo)";
        cor = "#f44336"; 
    } else {
        veredito = "Indiferente (Não gera nem lucro nem prejuízo)";
        cor = "#ffeb3b"; 
    }

    resultadoVplDiv.innerHTML = `
        <h2>Resultado VPL</h2>
        <p style="font-size: 1.5em; margin-top: 1em;">VPL Calculado: <strong>R$ ${vpl.toFixed(2)}</strong></p>
        <p style="font-size: 1.2em; color: ${cor};">>>> <strong>${veredito}</strong></p>
    `;
  });

});