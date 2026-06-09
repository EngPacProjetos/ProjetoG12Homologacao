/**
 * @Author ENOS ROCHA - PROGRAMADOR FULL STACK
 * @CRIACAO 18/05/2026
 * @PURPOSE CRIA UM DATASET RESPONSAVEL POR EXTRAIR TODAS AS INFORMACOES DE UMA CONSULTA SQL NO TOTVS RM
 *          E CARREGAR OS DADOS DIRETO DENTRO DO FORMULARIO FLUIG
 * @CONSULTA G12AJUSTARTRIBU — Retorna tributos nacionais e municipais por CODCOLIGADA, IDMOV
 */
function createDataset(fields, constraints, sortFields) {

    var dataset = DatasetBuilder.newDataset();

    var NOME_SERVICO = "WSCONSSQL";
    var CAMINHO_SERVICO = "com.totvs.WsConsultaSQL";

    var CODCOLIGADA;
    var IDMOV;

    var COLUNAS = [
        "CODIGO",
        "TIPO"
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

        log.info("[dsContratoRM] CODCOLIGADA: " + CODCOLIGADA);
        log.info("[dsContratoRM] IDMOV: " + IDMOV);

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


        var IDMOV_INT = java.lang.Integer.parseInt(String(IDMOV));

        var PARAMS = "CODCOLIGADA=" + CODCOLIGADA + ";IDMOV=" + IDMOV_INT;
        log.info("[dsContratoRM] PARAMS enviados: " + PARAMS);

        var result = authService.realizarConsultaSQL("G12AJUSTARTRIBU", 0, "T", PARAMS);
        log.info("[dsContratoRM] Retorno bruto do RM: " + result);

        var JSONObj = org.json.XML.toJSONObject(result);
        log.info("[dsContratoRM] JSON parseado: " + JSONObj);

        // Trata NewDataSet vazio
        var dados = JSONObj.get("NewDataSet").get("Resultado");
        if (dados == null || dados.toString().trim() == "") {
            log.warn("[dsContratoRM] Nenhum dado retornado pelo RM para IDMOV=" + IDMOV);
            return dataset;
        }


        function buildRow(row) {
            return new Array(
                row.has("CODIGO") ? row.get("CODIGO") : "",
                row.has("TIPO") ? row.get("TIPO") : ""
            );
        }

        if (dados.isNull(0)) {
            log.info("[dsContratoRM] Registro unico encontrado.");
            dataset.addRow(buildRow(dados));
        } else {
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
        idMov != null ? idMov : ""
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