/**
 * @Author ENOS ROCHA - PROGRAMADOR FULL STACK
 * @CRIACAO 18/05/2026
 * @PURPOSE CRIA UM DATASET RESPONSAVEL POR EXTRAIR TODAS AS INFORMACOES DE UMA CONSULTA SQL NO TOTVS RM
 *          E CARREGAR OS DADOS DIRETO DENTRO DO FORMULARIO FLUIG
 * @CONSULTA G12MOV02 (cod 2) — Retorna os IDMOV dos movimentos gerados a partir do 2.1.02
 */
function createDataset(fields, constraints, sortFields) {

    var dataset = DatasetBuilder.newDataset();

    var NOME_SERVICO = "WSCONSSQL";
    var CAMINHO_SERVICO = "com.totvs.WsConsultaSQL";

    var IDMOV;
    var CODCOLIGADA;

    // Colunas alinhadas com o retorno real da consulta G12FORMULARIO para contratos
    var COLUNAS = [
        "DATA_EMISSAO",
        "DATA_AUTORIZACAO",
        "NUMERO_NFSE",
        "CODIGO_VERIFICACAO"
    ];

    try {

        var usuario = getAccess()[0];
        var pass = getAccess()[1];
        var senha = String(pass);

        log.info("[G12-INFO-NFSE] Usuario de execucao: " + usuario);

        // Registra colunas no dataset
        for (var i = 0; i < COLUNAS.length; i++) {
            dataset.addColumn(COLUNAS[i]);
        }

        // Leitura dos constraints
        if (constraints != null) {
            for (var i = 0; i < constraints.length; i++) {
                if (constraints[i].fieldName == "IDMOV") IDMOV = constraints[i].initialValue;
                if (constraints[i].fieldName == "CODCOLIGADA") CODCOLIGADA = constraints[i].initialValue;
            }
        }

        log.info("IDMOV: " + IDMOV);

        // Validacoes dos parametros obrigatorios
        if (IDMOV == undefined || IDMOV == null || String(IDMOV).trim() == "") {
            log.error("[G12-INFO-NFSE] IDMOV nao foi informado. Abortando.");
            return retornarErro("IDMOV nao foi informado", null, IDMOV, CODCOLIGADA);
        }
        if (CODCOLIGADA == undefined || CODCOLIGADA == null || String(CODCOLIGADA).trim() == "") {
            log.error("[G12-INFO-NFSE] CODCOLIGADA nao foi informado. Abortando.");
            return retornarErro("CODCOLIGADA nao foi informado", null, IDMOV, CODCOLIGADA);
        }

        var servico = ServiceManager.getService(NOME_SERVICO);
        var instancia = servico.instantiate(CAMINHO_SERVICO);
        var ws = instancia.getRMIwsConsultaSQL();
        var serviceHelper = servico.getBean();
        var authService = serviceHelper.getBasicAuthenticatedClient(ws, "com.totvs.IwsConsultaSQL", usuario, senha);

        var PARAMS = "CODCOLIGADA=" + CODCOLIGADA + ";IDMOV=" + IDMOV;
        log.info("[G12-INFO-NFSE] PARAMS enviados: " + PARAMS);

        var result = authService.realizarConsultaSQL("G12INFONFSE", 0, "F", PARAMS);
        log.info("[G12-INFO-NFSE] Retorno bruto do RM: " + result);

        var JSONObj = org.json.XML.toJSONObject(result);
        log.info("[G12-INFO-NFSE] JSON parseado: " + JSONObj);

        var dados = JSONObj.get("NewDataSet").get("Resultado");
        log.info("[G12-INFO-NFSE] Dados extraidos: " + dados);

        // Funcao auxiliar para montar uma linha com fallback seguro
        function buildRow(row) {
            return new Array(
                row.has("DATA_EMISSAO") ? row.get("DATA_EMISSAO") : "",
                row.has("DATA_AUTORIZACAO") ? row.get("DATA_AUTORIZACAO") : "",
                row.has("NUMERO_NFSE") ? row.get("NUMERO_NFSE") : "",
                row.has("CODIGO_VERIFICACAO") ? row.get("CODIGO_VERIFICACAO") : ""
            );
        }

        if (dados.isNull(0)) {
            log.info("[G12-INFO-NFSE] Registro unico encontrado.");
            dataset.addRow(buildRow(dados));

        } else {
            // Multiplos registros
            log.info("[G12-INFO-NFSE] Multiplos registros encontrados: " + dados.length());
            for (var i = 0; i < dados.length(); i++) {
                dataset.addRow(buildRow(dados.get(i)));
            }
        }

    } catch (e) {
        log.error("[G12-INFO-NFSE] ERRO: " + String(e) + " | Linha: " + e.lineNumber);
        return retornarErro(String(e), e.lineNumber, IDMOV, CODCOLIGADA);
    }

    return dataset;
}

function retornarErro(mensagem, linha, idMov, coligada) {
    var dsError = DatasetBuilder.newDataset();
    dsError.addColumn("ERROR");
    dsError.addColumn("LINE");
    dsError.addColumn("IDMOV");
    dsError.addColumn("CODCOLIGADA");
    dsError.addRow(new Array(
        mensagem,
        linha != null ? linha : "",
        idMov != null ? idMov : "",
        coligada != null ? coligada : ""
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