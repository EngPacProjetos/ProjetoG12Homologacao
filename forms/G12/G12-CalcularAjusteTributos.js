function ajustarValorTributo(campo) {

    console.log(campo);

    var index = campo.id.split("___")[1];

    if (campo.value == "" || campo.value == null || campo.value == undefined) {
        return;
    }

    var valorRaw = campo.value.replace(/\./g, "").replace(",", ".");
    console.log("Valor bruto do campo:", valorRaw);

    var $tr = $(campo).closest("tr");
    var $aliquota = $tr.find("input[name^='aliquota']");
    var $valorImposto = $tr.find("input[name^='valorImposto']");

    if ($aliquota.length === 0 || $valorImposto.length === 0) {
        console.warn("PAROU: não achou aliquota ou valorImposto nessa linha");
        return;
    }

    var aliquotaRaw = $aliquota.val().replace(/\./g, "").replace(",", ".");
    console.log("Alíquota bruta do campo:", aliquotaRaw);

    var valor = parseFloat(valorRaw);
    var aliquota = parseFloat(aliquotaRaw) / 100;

    console.log("Valor da base de cálculo:", valor);
    console.log("Valor da alíquota:", aliquota);

    if (isNaN(valor) || isNaN(aliquota)) {
        console.warn("Valor ou alíquota inválidos — abortando cálculo");
        return;
    }

    var resultado = valor * aliquota;
    console.log("RESULTADO FINAL DO CALCULO", resultado);

    var resultadoStr = resultado.toString();
    var partes = resultadoStr.split(".");
    var inteiro = partes[0];
    var decimal = partes[1] ? partes[1].substring(0, 4).padEnd(4, "0") : "0000";
    var formatado = inteiro + "," + decimal;

    console.log("VALOR FORMATADO:", formatado);

    $valorImposto.val(formatado);

    var inteiroBase = valorRaw.split(".")[0];
    var decimalBase = valorRaw.split(".")[1] ? valorRaw.split(".")[1].substring(0, 4).padEnd(4, "0") : "0000";
    $(campo).val(inteiroBase + "," + decimalBase);

    var aliquotaFormatada = aliquotaRaw.split(".")[0] + "," + (aliquotaRaw.split(".")[1] ? aliquotaRaw.split(".")[1].substring(0, 4).padEnd(4, "0") : "0000");
    console.log("ALÍQUOTA FORMATADA", aliquotaFormatada);

    $aliquota.val(aliquotaFormatada);
}