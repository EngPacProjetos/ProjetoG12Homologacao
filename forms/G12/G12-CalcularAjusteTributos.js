function ajustarValorTributo(campo) {

    console.log(campo);

    var index = campo.id.split("___")[1];

    if (campo.value == "" || campo.value == null || campo.value == undefined) {
        return;
    }

    var valorRaw    = campo.value.replace(/\./g, "").replace(",", ".");
    var aliquotaRaw = $("#aliquota___" + index).val().replace(/\./g, "").replace(",", ".");

    var valor    = parseFloat(valorRaw);
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
    var partes       = resultadoStr.split(".");
    var inteiro      = partes[0];
    var decimal      = partes[1] ? partes[1].substring(0, 4).padEnd(4, "0") : "0000";

    var formatado = inteiro + "," + decimal;

    console.log("VALOR FORMATADO:", formatado);

    $("#valorImposto___" + index).val(formatado);

    var inteiroBase  = valorRaw.split(".")[0];
    var decimalBase  = valorRaw.split(".")[1] ? valorRaw.split(".")[1].substring(0, 4).padEnd(4, "0") : "0000";
    $(campo).val(inteiroBase + "," + decimalBase);

    var aliquotaFormatada = aliquotaRaw.split(".")[0] + "," + (aliquotaRaw.split(".")[1] ? aliquotaRaw.split(".")[1].substring(0, 4).padEnd(4, "0") : "0000");
    $("#aliquota___" + index).val(aliquotaFormatada);
}