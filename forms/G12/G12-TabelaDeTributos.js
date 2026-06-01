function dispararTributosTimeOut() {
    setTimeout(CarregarTabelasDeTriutos, 1000);
}

function CarregarTabelasDeTriutos() {


    var rawNac = $("#tributosNacionais").val();
    var rawMun = $("#tributosMunicipais").val();
    var natureza = $("#naturezaOrcamentaria").val();
    var irrf = $("#irrfDoItem").val();
    var inss = $("#inssDoItem").val();

    $("#irrfDisplay").text(irrf);
    $("#inssDisplay").text(inss);


    var $nat = $("#naturezaOrcamentariaDisplay");
    if ($nat.length) $nat.text(natureza || "NATUREZA ORÇAMENTÁRIA NÃO INFORMADA");

    var tributosNac = parseTributosNacionais(rawNac);
    var $cNac = $("#tabelaTributosNacionais");
    if ($cNac.length) {
        if (!tributosNac.length) {
            $cNac.html("<p class='text-muted'>Nenhum tributo nacional registrado.</p>");
        } else {
            var h = "<table class='table table-bordered table-condensed table-hover'>";
            h += "<thead><tr><th>Código</th><th>Valor</th><th>Alíquota</th><th>Base de Cálculo</th></tr></thead><tbody>";
            for (var i = 0; i < tributosNac.length; i++) {
                var t = tributosNac[i];
                h += "<tr><td>" + (t.codigo || "—") + "</td><td>" + (t.valor || "—") +
                    "</td><td>" + (t.aliquota || "—") + "</td><td>" + (t.base || "—") + "</td></tr>";
            }
            h += "</tbody></table>";
            $cNac.html(h);
        }
    }

    var tributosMun = parseTributosMunicipais(rawMun);
    var $cMun = $("#tabelaTributosMunicipais");
    if ($cMun.length) {
        if (!tributosMun.length) {
            $cMun.html("<p class='text-muted'>Nenhum tributo municipal registrado.</p>");
        } else {
            var hm = "<table class='table table-bordered table-condensed table-hover'>";
            hm += "<thead><tr><th>Código</th><th>Alíquota</th><th>Fator ISS Municipal</th></tr></thead><tbody>";
            for (var j = 0; j < tributosMun.length; j++) {
                var tm = tributosMun[j];
                hm += "<tr><td>" + (tm.codigo || "—") + "</td><td>" + (tm.aliquota || "—") +
                    "</td><td>" + (tm.fator || "—") + "</td></tr>";
            }
            hm += "</tbody></table>";
            $cMun.html(hm);
        }
    }
}