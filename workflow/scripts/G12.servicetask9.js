function servicetask9(attempt, message) {

    /***********************************************************************************************
 * @author      ENOS ROCHA - PROGRAMADOR FULL STACK
 * @data        18/05/2026
 * @Versao RM   12.1.2302.160
 * @Descricao   Carrega dados do contrato G12 via dataset G12-CARREGAR-DADOS
 *              e popula os campos do formulário via hAPI.setCardValue
 ***********************************************************************************************/

    try {
        // Nomes EXATOS que o RM envia — confirmados no log
        var codColigada = String(hAPI.getCardValue('CodColigada'));
        var idMov = String(hAPI.getCardValue('IdMov'));

        hAPI.setCardValue("IdMov", idMov);

        log.info("[G12] CodColigada: " + codColigada);
        log.info("[G12] IdMov: " + idMov);

        loadDsG12(codColigada, idMov);

    } catch (e) {
        throw "Erro servicetask_g12: " + String(e) + " - Linha " + e.lineNumber;
    }
}

function loadDsG12(codColigada, idMov) {
    try {
        var c1 = DatasetFactory.createConstraint("CODCOLIGADA", codColigada, codColigada, ConstraintType.MUST);
        var c2 = DatasetFactory.createConstraint("IDMOV", idMov, idMov, ConstraintType.MUST);

        var dataset = DatasetFactory.getDataset("G12-CARREGAR-DADOS", null, [c1, c2], null);

        if (dataset == null || dataset.rowsCount == 0) {
            log.warn("[G12] Nenhum dado retornado. CodColigada=" + codColigada + " IdMov=" + idMov);
            return;
        }

        // Seção 1 — Identificação e Endereço
        hAPI.setCardValue('coligada', safe(dataset.getValue(0, "COLIGADA")));
        hAPI.setCardValue('filial', safe(dataset.getValue(0, "FILIAL")));
        hAPI.setCardValue('idprj', safe(dataset.getValue(0, "IDPRJ")));
        hAPI.setCardValue('cnpj', safe(dataset.getValue(0, "CNPJ")));
        hAPI.setCardValue('centro_de_custo', safe(dataset.getValue(0, "CENTRO_DE_CUSTO")));
        hAPI.setCardValue('codigo_do_projeto', safe(dataset.getValue(0, "CODIGO_DO_PROJETO")));
        hAPI.setCardValue('descricao_projeto', safe(dataset.getValue(0, "DESCRICAO_PROJETO")));
        hAPI.setCardValue('rua_projeto', safe(dataset.getValue(0, "RUA_PROJETO")));
        hAPI.setCardValue('estado_projeto', safe(dataset.getValue(0, "ESTADO_PROJETO")));
        hAPI.setCardValue('cidade_projeto', safe(dataset.getValue(0, "CIDADE_PROJETO")));
        hAPI.setCardValue('complemento_projeto', safe(dataset.getValue(0, "COMPLEMENTO_PROJETO")));
        hAPI.setCardValue('bairro_projeto', safe(dataset.getValue(0, "BAIRRO_PROJETO")));
        hAPI.setCardValue('numero_endereco_projeto', safe(dataset.getValue(0, "NUMERO_ENDERECO_PROJETO")));

        // Seção 2 — Detalhes do Contrato
        hAPI.setCardValue('numero_contrato', safe(dataset.getValue(0, "NUMERO_CONTRATO")));
        hAPI.setCardValue('tipo_contrato', safe(dataset.getValue(0, "TIPO_CONTRATO")));
        hAPI.setCardValue('numero_licitacao', safe(dataset.getValue(0, "NUMERO_LICITACAO")));
        hAPI.setCardValue('codigo_cliente', safe(dataset.getValue(0, "CODIGO_CLIENTE")));
        hAPI.setCardValue('data_contrato', formatDate(safe(dataset.getValue(0, "DATA_CONTRATO"))));
        hAPI.setCardValue('data_inicio_contrato', formatDate(safe(dataset.getValue(0, "DATA_INICIO_CONTRATO"))));
        hAPI.setCardValue('data_termino', formatDate(safe(dataset.getValue(0, "DATA_TERMINO"))));
        hAPI.setCardValue('periodicidade_medicao', safe(dataset.getValue(0, "PERIODICIDADE_MEDICAO")));
        hAPI.setCardValue('condicao_pagamento', safe(dataset.getValue(0, "CONDICAO_PAGAMENTO")));
        hAPI.setCardValue('nome_produto', safe(dataset.getValue(0, "NOME_PRODUTO")));
        hAPI.setCardValue('codigo_produto', safe(dataset.getValue(0, "CODIGO_PRODUTO")));

        log.info("[G12] Campos preenchidos com sucesso para IdMov=" + idMov);

    } catch (e) {
        throw "Erro loadDsG12: " + String(e) + " - Linha " + e.lineNumber;
    }
}

function safe(valor) {
    if (valor == null || valor == undefined) return "";
    var s = String(valor).trim();
    return (s == "null" || s == "undefined") ? "" : s;
}

function formatDate(rawDate) {
    if (!rawDate || rawDate == "") return "";
    try {
        var inputFormat = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
        var outputFormat = new java.text.SimpleDateFormat("dd/MM/yyyy");
        return outputFormat.format(inputFormat.parse(rawDate));
    } catch (e) {
        return rawDate;
    }
}