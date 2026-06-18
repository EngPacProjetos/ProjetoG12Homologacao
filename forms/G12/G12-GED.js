function GED() {

    var infoGed = $("#gedInfo").val();
    var arrayGed = infoGed.split(";");

    var periodosContrato = String($("#periodosContrato").val() || "")
        .split("|")
        .map(function (item) { return item.trim(); })
        .filter(function (item) { return item !== ""; });

    console.log("PERIODOS ENCONTRADOS NO FINAL", periodosContrato);

    $("#gedAnexos").empty();

    var htmlFinal = "<div class='ged-wrapper'>";

    for (var index = 0; index < periodosContrato.length; index++) {
        var periodoAtual = periodosContrato[index];
        console.log("PERIODO DA VEZ ->", periodoAtual);

        var linhasPeriodo = "";
        var totalAnexos = 0;

        for (var j = 0; j < arrayGed.length; j++) {

            var partes = arrayGed[j].split("|");
            var codigoPasta = String(partes[0] || "");
            var codDocumentFolder = String(partes[1] || "");
            var documentDescription = String(partes[2] || "");

            if (codigoPasta.indexOf(periodoAtual) !== -1) {

                console.log("CODIGO DA PASTA", codigoPasta, "-> MATCH com periodo", periodoAtual);
                console.log("CODIGO DO DOCUMENTO", codDocumentFolder);
                console.log("DESCRICAO DO DOCUMENTO", documentDescription);

                var urlVisualizacao = "https://gennesisengenharia160517.fluig.cloudtotvs.com.br:1650/portal/p/1/ecmnavigation?app_ecm_navigation_doc=" + codDocumentFolder;

                console.log("URL VISUALIZACAO ->", urlVisualizacao);

                totalAnexos++;

                linhasPeriodo += "" +
                    "<div class='ged-item'>" +
                        "<div class='ged-item-icon'><i class='fa fa-file-text-o'></i></div>" +
                        "<div class='ged-item-nome' title='" + documentDescription + "'>" + documentDescription + "</div>" +
                        "<a href='" + urlVisualizacao + "' target='_blank' class='ged-item-btn'>" +
                            "<i class='fa fa-eye'></i> Visualizar Documento GED" +
                        "</a>" +
                    "</div>";
            }
        }

        var temAnexos = totalAnexos > 0;

        htmlFinal += "<div class='ged-card" + (temAnexos ? "" : " ged-card-vazio") + "'>";
        htmlFinal += "" +
            "<div class='ged-card-header'>" +
                "<span class='ged-card-titulo'><i class='fa fa-folder-open-o'></i> Período " + periodoAtual + "</span>" +
                "<span class='ged-card-badge'>" + totalAnexos + (totalAnexos === 1 ? " anexo" : " anexos") + "</span>" +
            "</div>";

        if (temAnexos) {
            htmlFinal += "<div class='ged-card-body'>" + linhasPeriodo + "</div>";
        } else {
            htmlFinal += "" +
                "<div class='ged-card-body ged-card-body-vazio'>" +
                    "<i class='fa fa-info-circle'></i> Nenhum anexo encontrado para este período." +
                "</div>";
        }

        htmlFinal += "</div>";
    }

    htmlFinal += "</div>";

    $("#gedAnexos").html(htmlFinal);
}

$(document).ready(function () {
    setTimeout(GED, 1000);
});