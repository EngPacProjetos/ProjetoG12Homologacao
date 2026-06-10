/**
 * @Author ENOS ROCHA - PROGRAMADOR FULL STACK
 * @CRIACAO 18/05/2026
 * @PURPOSE CRIA UM DATASET RESPONSAVEL POR EXTRAIR TODAS AS INFORMACOES DE UMA CONSULTA SQL NO TOTVS RM
 *          E CARREGAR OS DADOS DIRETO DENTRO DO FORMULARIO FLUIG
 * @CONSULTA G12TRIBUTOS (cod 2) — Retorna daods tributarios por CODCOLIGADA, IDMOV
 */
function createDataset(fields, constraints, sortFields) {

    var dataset = DatasetBuilder.newDataset();

    var NOME_SERVICO = "WSCONSSQL";
    var CAMINHO_SERVICO = "com.totvs.WsConsultaSQL";

    var CODCOLIGADA;
    var IDMOV;
    var MUNICIPIO;

    // Colunas alinhadas com o retorno real da consulta G12TRIBUTOS para tributos
    var COLUNAS = [
        "TRIBUTOS_MUNICIPAIS",
        "CODIGO_MUNICIPIO"
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
                if (constraints[i].fieldName == "NOMEMUNICIPIO") MUNICIPIO = constraints[i].initialValue;
                
            }
        }

        log.info("CODCOLIGADA: " + CODCOLIGADA);
        log.info("IDMOV: " + IDMOV);
        log.info("NOMEMUNICIPIO: " + MUNICIPIO);

        // Validacoes dos parametros obrigatorios
        if (CODCOLIGADA == undefined || CODCOLIGADA == null || String(CODCOLIGADA).trim() == "") {
            log.error("[dsContratoRM] CODCOLIGADA nao foi informado. Abortando.");
            return retornarErro("CODCOLIGADA nao foi informado", null, CODCOLIGADA, IDMOV, MUNICIPIO);
        }

        if (IDMOV == undefined || IDMOV == null || String(IDMOV).trim() == "") {
            log.error("[dsContratoRM] IDMOV nao foi informado. Abortando.");
            return retornarErro("IDMOV nao foi informado", null, CODCOLIGADA, IDMOV, MUNICIPIO);
        }
        
        if (MUNICIPIO == undefined || MUNICIPIO == null || String(MUNICIPIO).trim() == "") {
            log.error("[dsContratoRM] MUNICIPIO nao foi informado. Abortando.");
            return retornarErro("MUNICIPIO nao foi informado", null, CODCOLIGADA, IDMOV, MUNICIPIO);
        }
        var servico = ServiceManager.getService(NOME_SERVICO);
        var instancia = servico.instantiate(CAMINHO_SERVICO);
        var ws = instancia.getRMIwsConsultaSQL();
        var serviceHelper = servico.getBean();
        var authService = serviceHelper.getBasicAuthenticatedClient(ws, "com.totvs.IwsConsultaSQL", usuario, senha);

        var PARAMS =  "IDMOV=" + IDMOV + ";CODCOLIGADA=" + CODCOLIGADA + ";NOMEMUNICIPIO=" + MUNICIPIO;
        log.info("[dsContratoRM] PARAMS enviados: " + PARAMS);

        var result = authService.realizarConsultaSQL("G12TRIBUMUNICI", 0, "F", PARAMS);
        log.info("[dsContratoRM] Retorno bruto do RM: " + result);

        var JSONObj = org.json.XML.toJSONObject(result);
        log.info("[dsContratoRM] JSON parseado: " + JSONObj);

        var dados = JSONObj.get("NewDataSet").get("Resultado");
        log.info("[dsContratoRM] Dados extraidos: " + dados);

       
        function buildRow(row) {
            return new Array(
                row.has("TRIBUTOS_MUNICIPAIS") ? row.get("TRIBUTOS_MUNICIPAIS") : "",
                row.has("CODIGO_MUNICIPIO") ? row.get("CODIGO_MUNICIPIO") : ""
             
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
        return retornarErro(String(e), e.lineNumber, CODCOLIGADA, IDMOV, MUNICIPIO);
    }

    return dataset;
}

function retornarErro(mensagem, linha, codColigada, idMov, MUNICIPIO) {
    var dsError = DatasetBuilder.newDataset();
    dsError.addColumn("ERROR");
    dsError.addColumn("LINE");
    dsError.addColumn("CODCOLIGADA");
    dsError.addColumn("IDMOV");
    dsError.addColumn("MUNICIPIO");
    dsError.addRow(new Array(
        mensagem,
        linha != null ? linha : "",
        codColigada != null ? codColigada : "",
        idMov != null ? idMov : "",
        MUNICIPIO != null ? MUNICIPIO : ""
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