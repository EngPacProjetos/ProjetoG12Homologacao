/**
 * @Author ENOS ROCHA - PROGRAMADOR FULL STACK
 * @CRIACAO 18/05/2026
 * @PURPOSE CRIA UM DATASET RESPONSAVEL POR EXTRAIR TODAS AS INFORMACOES DE UMA CONSULTA SQL NO TOTVS RM
 *          E CARREGAR OS DADOS DIRETO DENTRO DO FORMULARIO FLUIG
 * @CONSULTA G12FORMULARIO (cod 2) — Retorna dados de contrato/projeto por CODCOLIGADA, IDMOV
 */
function createDataset(fields, constraints, sortFields) {

    var dataset = DatasetBuilder.newDataset();

    var NOME_SERVICO = "WSCONSSQL";
    var CAMINHO_SERVICO = "com.totvs.WsConsultaSQL";

    var CODCOLIGADA;
    var IDMOV;

    // Colunas alinhadas com o retorno real da consulta G12FORMULARIO para contratos
    var COLUNAS = [
        "IDMOV",
        "NUMERO_MOVIMENTO",
        "COLIGADA",
        "FILIAL",
        "IDPRJ",
        "CNPJ",
        "CENTRO_DE_CUSTO",
        "CODIGO_DO_PROJETO",
        "DESCRICAO_PROJETO",
        "RUA_PROJETO",
        "ESTADO_PROJETO",
        "CIDADE_PROJETO",
        "COMPLEMENTO_PROJETO",
        "BAIRRO_PROJETO",
        "NUMERO_ENDERECO_PROJETO",
        "NUMERO_CONTRATO",
        "TIPO_CONTRATO",
        "NUMERO_LICITACAO",
        "CODIGO_CLIENTE",
        "DATA_CONTRATO",
        "DATA_INICIO_CONTRATO",
        "DATA_TERMINO",
        "PERIODICIDADE_MEDICAO",
        "CONDICAO_PAGAMENTO",
        "NOME_PRODUTO",
        "CODIGO_PRODUTO"
    ];

    try {

        var usuario = getAccess()[0];
        var pass = getAccess()[1];
        var senha = String(pass);

        log.info("[dsContratoRM] Usuario de execucao: " + usuario);

        // Registra colunas no dataset
        for (var i = 0; i < COLUNAS.length; i++) {
            dataset.addColumn(COLUNAS[i]);
        }

        // Leitura dos constraints
        if (constraints != null) {
            for (var i = 0; i < constraints.length; i++) {
                if (constraints[i].fieldName == "CODCOLIGADA") CODCOLIGADA = constraints[i].initialValue;
                if (constraints[i].fieldName == "IDMOV") IDMOV = constraints[i].initialValue;
                
            }
        }

        log.info("CODCOLIGADA: " + CODCOLIGADA);
        log.info("IDMOV: " + IDMOV);

        // Validacoes dos parametros obrigatorios
        if (CODCOLIGADA == undefined || CODCOLIGADA == null || String(CODCOLIGADA).trim() == "") {
            log.error("[dsContratoRM] CODCOLIGADA nao foi informado. Abortando.");
            return retornarErro("CODCOLIGADA nao foi informado", null, CODCOLIGADA, IDMOV);
        }

        if (IDMOV == undefined || IDMOV == null || String(IDMOV).trim() == "") {
            log.error("[dsContratoRM] IDMOV nao foi informado. Abortando.");
            return retornarErro("IDMOV nao foi informado", null, CODCOLIGADA, IDMOV);
        }

        var servico = ServiceManager.getService(NOME_SERVICO);
        var instancia = servico.instantiate(CAMINHO_SERVICO);
        var ws = instancia.getRMIwsConsultaSQL();
        var serviceHelper = servico.getBean();
        var authService = serviceHelper.getBasicAuthenticatedClient(ws, "com.totvs.IwsConsultaSQL", usuario, senha);

        var PARAMS = "CODCOLIGADA=" + CODCOLIGADA + ";IDMOV=" + IDMOV;
        log.info("[dsContratoRM] PARAMS enviados: " + PARAMS);

        var result = authService.realizarConsultaSQL("G12FORMULARIO", 0, "F", PARAMS);
        log.info("[dsContratoRM] Retorno bruto do RM: " + result);

        var JSONObj = org.json.XML.toJSONObject(result);
        log.info("[dsContratoRM] JSON parseado: " + JSONObj);

        var dados = JSONObj.get("NewDataSet").get("Resultado");
        log.info("[dsContratoRM] Dados extraidos: " + dados);

        // Funcao auxiliar para montar uma linha com fallback seguro
        function buildRow(row) {
            return new Array(
                row.has("IDMOV") ? row.get("IDMOV") : "",
                row.has("NUMERO_MOVIMENTO") ? row.get("NUMERO_MOVIMENTO") : "",
                row.has("COLIGADA") ? row.get("COLIGADA") : "",
                row.has("FILIAL") ? row.get("FILIAL") : "",
                row.has("IDPRJ") ? row.get("IDPRJ") : "",
                row.has("CNPJ") ? row.get("CNPJ") : "",
                row.has("CENTRO_DE_CUSTO") ? row.get("CENTRO_DE_CUSTO") : "",
                row.has("CODIGO_DO_PROJETO") ? row.get("CODIGO_DO_PROJETO") : "",
                row.has("DESCRICAO_PROJETO") ? row.get("DESCRICAO_PROJETO") : "",
                row.has("RUA_PROJETO") ? row.get("RUA_PROJETO") : "",
                row.has("ESTADO_PROJETO") ? row.get("ESTADO_PROJETO") : "",
                row.has("CIDADE_PROJETO") ? row.get("CIDADE_PROJETO") : "",
                row.has("COMPLEMENTO_PROJETO") ? row.get("COMPLEMENTO_PROJETO") : "",
                row.has("BAIRRO_PROJETO") ? row.get("BAIRRO_PROJETO") : "",
                row.has("NUMERO_ENDERECO_PROJETO") ? row.get("NUMERO_ENDERECO_PROJETO") : "",
                row.has("NUMERO_CONTRATO") ? row.get("NUMERO_CONTRATO") : "",
                row.has("TIPO_CONTRATO") ? row.get("TIPO_CONTRATO") : "",
                row.has("NUMERO_LICITACAO") ? row.get("NUMERO_LICITACAO") : "",
                row.has("CODIGO_CLIENTE") ? row.get("CODIGO_CLIENTE") : "",
                row.has("DATA_CONTRATO") ? row.get("DATA_CONTRATO") : "",
                row.has("DATA_INICIO_CONTRATO") ? row.get("DATA_INICIO_CONTRATO") : "",
                row.has("DATA_TERMINO") ? row.get("DATA_TERMINO") : "",
                row.has("PERIODICIDADE_MEDICAO") ? row.get("PERIODICIDADE_MEDICAO") : "",
                row.has("CONDICAO_PAGAMENTO") ? row.get("CONDICAO_PAGAMENTO") : "",
                row.has("NOME_PRODUTO") ? row.get("NOME_PRODUTO") : "",
                row.has("CODIGO_PRODUTO") ? row.get("CODIGO_PRODUTO") : ""
            );
        }

        if (dados.isNull(0)) {
            log.info("[dsContratoRM] Registro unico encontrado.");
            dataset.addRow(buildRow(dados));

        } else {
            // Multiplos registros
            log.info("[dsContratoRM] Multiplos registros encontrados: " + dados.length());
            for (var i = 0; i < dados.length(); i++) {
                dataset.addRow(buildRow(dados.get(i)));
            }
        }

    } catch (e) {
        log.error("[dsContratoRM] ERRO: " + String(e) + " | Linha: " + e.lineNumber);
        return retornarErro(String(e), e.lineNumber, CODCOLIGADA, IDMOV);
    }

    return dataset;
}

function retornarErro(mensagem, linha, codColigada, idMov) {
    var dsError = DatasetBuilder.newDataset();
    dsError.addColumn("ERROR");
    dsError.addColumn("LINE");
    dsError.addColumn("CODCOLIGADA");
    dsError.addColumn("IDMOV");
    dsError.addRow(new Array(
        mensagem,
        linha != null ? linha : "",
        codColigada != null ? codColigada : "",
        IDMOV != null ? idMov : ""
    ));
    return dsError;
}


function getAccess() {
    try {
        var dataset = DatasetFactory.getDataset("dsTBCConnector", null, null, null);
        var u = dataset.getValue(0, "user");
        var p = dataset.getValue(0, "pass");
        return [u, p];
    } catch (e) {
        throw "getAccess falhou: " + String(e);
    }
}


function onMobileSync(user) {

}