// PAINEL "HISTORICO DOS MOVIMENTOS": monta a tabela de status a partir dos campos
// IDMOV_numero (2.1.01, valor unico) e historico2102 / historico2201 (2.1.02 / 2.2.01,
// listas separadas por virgula). Nao depende de integracao - e apenas leitura/derivacao
// dos campos que ja existem no card.

function parseListaHistorico(valor) {
    if (!valor) return [];
    return String(valor)
        .split(",")
        .map(function (item) { return item.trim(); })
        .filter(function (item) {
            return item !== "" && item.toLowerCase() !== "null" && item.toLowerCase() !== "undefined";
        });
}

function statusLabelHistorico(status) {
    if (status === "faturado") return "Faturado";
    if (status === "a-faturar") return "A faturar";
    return "Cancelado";
}

function montarLinhasHistoricoMovimentos() {
    var idmov101 = $("#IDMOV_numero").val();
    var lista2102 = parseListaHistorico($("#historico2102").val());
    var lista2201 = parseListaHistorico($("#historico2201").val());

    var linhas = [];

    // 2.1.01: faturado assim que existir qualquer 2.1.02 gerado a partir dele.
    if (idmov101 != null && String(idmov101).trim() !== "") {
        var status101 = lista2102.length > 0 ? "faturado" : "a-faturar";
        linhas.push({ tipo: "2.1.01", numero: String(idmov101).trim(), status: status101 });
    }

    // 2.1.02: todos menos o ultimo sao sempre cancelados (foram substituidos).
    // O ultimo fica "a faturar" se surgiu um 2.1.02 novo sem 2.2.01 correspondente ainda
    // (mais numeros em historico2102 do que em historico2201); caso contrario, faturado.
    if (lista2102.length > 0) {
        var statusUltimo2102 = lista2102.length > lista2201.length ? "a-faturar" : "faturado";
        for (var i = 0; i < lista2102.length; i++) {
            var ultimo2102 = i === lista2102.length - 1;
            linhas.push({ tipo: "2.1.02", numero: lista2102[i], status: ultimo2102 ? statusUltimo2102 : "cancelado" });
        }
    }

    // 2.2.01: mesma regra de "so o ultimo importa". O ultimo e cancelado quando um novo
    // 2.1.02 apareceu depois dele (2.1.02 a mais que 2.2.01), pois um novo 2.2.01 sera gerado.
    if (lista2201.length > 0) {
        var statusUltimo2201 = lista2102.length > lista2201.length ? "cancelado" : "faturado";
        for (var j = 0; j < lista2201.length; j++) {
            var ultimo2201 = j === lista2201.length - 1;
            linhas.push({ tipo: "2.2.01", numero: lista2201[j], status: ultimo2201 ? statusUltimo2201 : "cancelado" });
        }
    }

    return linhas;
}

function renderizarHistoricoMovimentos() {
    var linhas = montarLinhasHistoricoMovimentos();
    var corpo = $("#tblHistoricoMovimentosBody");

    if (!corpo.length) return;

    corpo.empty();

    if (linhas.length === 0) {
        corpo.append('<tr><td colspan="3" class="text-center">Nenhum movimento encontrado</td></tr>');
        return;
    }

    linhas.forEach(function (linha) {
        var tr = $("<tr></tr>");
        tr.append($("<td></td>").text(linha.tipo));
        tr.append($("<td></td>").text(linha.numero));
        tr.append(
            $("<td></td>").append(
                $("<span></span>")
                    .addClass("historico-status historico-status-" + linha.status)
                    .text(statusLabelHistorico(linha.status))
            )
        );
        corpo.append(tr);
    });
}
