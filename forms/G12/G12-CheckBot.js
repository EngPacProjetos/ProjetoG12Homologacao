function checkAllInfo() {
    var divProjeto = $("#identificacaoProjetoDiv");
    var inputs = divProjeto.find('input');
    var divContrato = $("#detalhesContrato");
    var inputsContrato = divContrato.find('input');
    var divCheck = $("#inforChecagem");
    var atividade = $("#atividade").val();
    var cnoPB = $("#CNOPB").val();
    var cno = $("#cno").val();
    var centroDeCusto = $("#centro_de_custo").val();
    var mensagens = "<h5>🟥 Campos não preenchidos:</h5>";

    var centrosParaiba = [
        "02.01.01.01.001"
        , "02.01.01.01.003"
        , "02.01.01.01.004"
        , "02.01.01.01.008"
        , "02.01.01.01.010"
        , "02.01.01.01.011"
        , "02.01.01.01.012"
        , "02.01.01.02.001"
        , "02.01.01.02.003"
        , "02.01.01.02.004"
        , "02.01.01.02.005"
        , "02.01.01.02.007"

    ]

    inputs.each(function () {
        var campo = $(this);

        if (campo.val() === "") {
            var idCampo = campo.attr('id');
            var label = $("label[for='" + idCampo + "']");
            var valorLabel = label.length ? label.text() : idCampo;

            console.log(valorLabel)

            mensagens += "<h5>❌  " + valorLabel + "</h5>";
        }
    });

    inputsContrato.each(function () {
        var campo = $(this);

        if (campo.val() === "") {
            var idCampo = campo.attr('id');
            var label = $("label[for='" + idCampo + "']");
            var valorLabel = label.length ? label.text() : idCampo;

            console.log(valorLabel)

            mensagens += "<h5>❌  " + valorLabel + "</h5>";
        }
    });


    if (atividade == 173) {
        if (centrosParaiba.indexOf(centroDeCusto) !== -1) {
            if (cno == "" && cnoPB == "") {
                mensagens += "<h5>❌  CNO PB </h5>";
            }
        }
    }




    setTimeout(() => {
        var tabelaTributos = $("#tabelaTributosNacionais");
        var linhasTributos = tabelaTributos.find('tbody tr');

        linhasTributos.each(function () {
            var linha = $(this);
            var celulas = linha.find('td');

            var codigo = celulas.eq(0).text().trim();

            var valor = celulas.eq(1).text().trim();

            var aliquota = celulas.eq(2).text().trim();

            var baseCalculo = celulas.eq(3).text().trim();


            if (valor === "" || aliquota === "" || baseCalculo === "" || valor === "-" || aliquota === "-" || baseCalculo === "-" || valor == "0.0000" || aliquota == "0.0000" || baseCalculo == "0.0000") {
                if (mensagens.indexOf("Tributos com campos vazios ou zerados") !== -1) {

                } else {
                    mensagens += "<h5 style='margin-top: 20px'>🟥 Tributos com campos vazios ou zerados:</h5>";
                }
                mensagens += "<h5>❌  " + codigo; + "</h5>"
            }


        })

        var tabelaTributosMunicipais = $("#tabelaTributosMunicipais");
        var linhasTributosMunicipais = tabelaTributosMunicipais.find('tbody tr');

        linhasTributosMunicipais.each(function () {
            var linha = $(this);
            var celulas = linha.find('td');

            var codigo = celulas.eq(0).text().trim();
            var aliquota = celulas.eq(1).text().trim();
            var baseReducao = celulas.eq(2).text().trim();

            if (
                aliquota === "" || aliquota === "-" || aliquota === "—" || aliquota === "0.0000"
                || baseReducao === "" || baseReducao === "-" || baseReducao === "—" || baseReducao === "0.0000"
            ) {
                mensagens += "<h5>❌  " + codigo + "</h5>";
            }
        });

        divCheck.html(mensagens);
    }, 1000);

    divCheck.html(mensagens);
}