
var MAPA_CAMPOS = {
    "COLIGADA": "coligada",
    "FILIAL": "filial",
    "IDMOV": "IDMOV_numero",
    "IDPRJ": "idprj",
    "CNPJ_CLIENTE": "cnpjCliente",
    "CENTRO_DE_CUSTO": "centro_de_custo",
    "CODIGO_DO_PROJETO": "codigo_do_projeto",
    "DESCRICAO_PROJETO": "descricao_projeto",
    "RUA_PROJETO": "rua_projeto",
    "NUMERO_ENDERECO_PROJETO": "numero_endereco_projeto",
    "BAIRRO_PROJETO": "bairro_projeto",
    "COMPLEMENTO_PROJETO": "complemento_projeto",
    "CIDADE_PROJETO": "cidade_projeto",
    "ESTADO_PROJETO": "estado_projeto",
    "NUMERO_CONTRATO": "numero_contrato",
    "TIPO_CONTRATO": "tipo_contrato",
    "NUMERO_LICITACAO": "numero_licitacao",
    "CODIGO_CLIENTE": "codigo_cliente",
    "DATA_CONTRATO": "data_contrato",
    "DATA_INICIO_CONTRATO": "data_inicio_contrato",
    "DATA_TERMINO": "data_termino",
    "PERIODICIDADE_MEDICAO": "periodicidade_medicao",
    "CONDICAO_PAGAMENTO": "condicao_pagamento",
    "NOME_PRODUTO": "nome_produto",
    "CODIGO_PRODUTO": "codigo_produto",
    "NUMERO_MOVIMENTO":"NumeroMov",
    "CNPJ_EMPRESA":"cnpj"
};

function preencherFormulario(ds) {
    if (!ds || ds.rowsCount === 0) {
        mostrarErro("Dataset retornou vazio. Verifique IDMOV e CodColigada.");
        return;
    }

    for (var coluna in MAPA_CAMPOS) {
        var idCampo = MAPA_CAMPOS[coluna];
        var valor = ds.getValue(0, coluna);
        $("#" + idCampo).val(valor || "");
    }
}

function mostrarErro(msg) {
    $("#loadingDados").hide();
    $("#msgErro").text(msg);
    $("#erroDados").show();
}

function carregarDadosContrato(codColigada, idMov) {
    $("#loadingDados").show();
    $("#erroDados").hide();

    try {
        var constraints = [
            DatasetFactory.createConstraint("CODCOLIGADA", codColigada, codColigada, ConstraintType.MUST),
            DatasetFactory.createConstraint("IDMOV", idMov, idMov, ConstraintType.MUST)
        ];

        var ds = DatasetFactory.getDataset("G12-CARREGAR-DADOS", null, constraints, null);

        $("#loadingDados").hide();

        if (ds && ds.getValue(0, "ERROR") != null && ds.getValue(0, "ERROR") != "") {
            mostrarErro(ds.getValue(0, "ERROR"));
            return;
        }

        preencherFormulario(ds);

    } catch (e) {
        mostrarErro("Erro ao chamar dataset: " + String(e));
    }
}


function onLoad() {

    var idMov = $("#IdMov").val();
    var codColigada = $("#CodColigada").val();

    console.log("[G12] onLoad - IdMov: " + idMov + " | CodColigada: " + codColigada);

    if (!idMov || !codColigada || idMov.trim() === "" || codColigada.trim() === "") {
        mostrarErro(
            "IdMov ou CodColigada não foram recebidos pelo formulário. " +
            "Verifique se o startProcess() está passando esses valores corretamente."
        );
        return;
    }

    carregarDadosContrato(codColigada, idMov);
}


function onLoadView() {
    console.log("[G12] onLoadView - formulário em modo visualização.");
}

