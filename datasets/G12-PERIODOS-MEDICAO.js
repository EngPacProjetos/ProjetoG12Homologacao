/**
 * @Author ENOS ROCHA - PROGRAMADOR FULL STACK
 * @CRIACAO 17/06/2026
 * @PURPOSE CRIA UM DATASET RESPONSAVEL POR EXTRAIR TODAS AS INFORMACOES DE UMA CONSULTA SQL NO TOTVS RM
 *          E CARREGAR OS DADOS DIRETO DENTRO DO FORMULARIO FLUIG
 * @CONSULTA G12-GED — Retorna os codigodas das pastas por periodo para criar o ged do G12
 */
function createDataset(fields, constraints, sortFields) {

    var dataset = DatasetBuilder.newDataset();

    var NOME_SERVICO = "WSCONSSQL";
    var CAMINHO_SERVICO = "com.totvs.WsConsultaSQL";

    var IDMOV;
    var CODCOLIGADA;

    var COLUNAS = [
        "PERIODOMED"
    ];

    try {

        var usuario = getAccess()[0];
        var pass = getAccess()[1];
        var senha = String(pass);

        log.info("[G12-GED-MEDICAO] Usuario de execucao: " + usuario);

        for (var i = 0; i < COLUNAS.length; i++) {
            dataset.addColumn(COLUNAS[i]);
        }

        if (constraints != null) {
            for (var i = 0; i < constraints.length; i++) {
                if (constraints[i].fieldName == "IDMOV") IDMOV = constraints[i].initialValue;
                if (constraints[i].fieldName == "CODCOLIGADA") CODCOLIGADA = constraints[i].initialValue;
            }
        }

        log.info("[G12-GED-MEDICAO] IDMOV: " + IDMOV);


        if (IDMOV == undefined || IDMOV == null || String(IDMOV).trim() == "") {
            log.error("[G12-GED-MEDICAO] IDMOV nao foi informado. Abortando.");
            return retornarErro("IDMOV nao foi informado", null, IDMOV);
        }
        if (CODCOLIGADA == undefined || CODCOLIGADA == null || String(CODCOLIGADA).trim() == "") {
            log.error("[G12-GED-MEDICAO] CODCOLIGADA nao foi informado. Abortando.");
            return retornarErro("CODCOLIGADA nao foi informado", null, CODCOLIGADA);
        }



        var servico = ServiceManager.getService(NOME_SERVICO);
        var instancia = servico.instantiate(CAMINHO_SERVICO);
        var ws = instancia.getRMIwsConsultaSQL();
        var serviceHelper = servico.getBean();
        var authService = serviceHelper.getBasicAuthenticatedClient(ws, "com.totvs.IwsConsultaSQL", usuario, senha);


        var PARAMS = "CODCOLIGADA=" + CODCOLIGADA + ";IDMOV=" + IDMOV
        log.info("[G12-GED-MEDICAO] PARAMS enviados: " + PARAMS);

        var result = authService.realizarConsultaSQL("G12PERIODOMED", 0, "F", PARAMS);
        log.info("[G12-GED-MEDICAO] Retorno bruto do RM: " + result);

        var JSONObj = org.json.XML.toJSONObject(result);
        log.info("[G12-GED-MEDICAO] JSON parseado: " + JSONObj);

        // Trata NewDataSet vazio
        var dados = JSONObj.get("NewDataSet").get("Resultado");
        if (dados == null || dados.toString().trim() == "") {
            log.warn("[G12-GED-MEDICAO] Nenhum dado retornado pelo RM para " + "IDMOV=" + IDMOV + "CODCOLIGADA=" + CODCOLIGADA);
            return dataset;
        }


        function buildRow(row) {
            return new Array(
                row.has("PERIODOMED") ? row.get("PERIODOMED") : ""
            );
        }

        if (dados.isNull(0)) {
            log.info("[G12-GED-MEDICAO] Registro unico encontrado.");
            dataset.addRow(buildRow(dados));
        } else {
            log.info("[G12-GED-MEDICAO] Multiplos registros encontrados: " + dados.length());
            for (var i = 0; i < dados.length(); i++) {
                dataset.addRow(buildRow(dados.get(i)));
            }
        }

    } catch (e) {
        log.error("[G12-GED-MEDICAO] ERRO: " + String(e) + " | Linha: " + e.lineNumber);
        return retornarErro(String(e), e.lineNumber, IDMOV, CODCOLIGADA);
    }

    return dataset;
}

function retornarErro(mensagem, linha, idmov, coligada) {
    var dsError = DatasetBuilder.newDataset();
    dsError.addColumn("ERROR");
    dsError.addColumn("LINE");
    dsError.addColumn("IDMOV");
    dsError.addColumn("CODCOLIGADA");

    dsError.addRow(new Array(
        mensagem,
        linha != null ? linha : "",
        idmov != null ? idmov : "",
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

function onMobileSync(user) { }