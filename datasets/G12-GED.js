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

    var CODCOLIGADA;
    var IDPRJ;
    var IDCONTRATO;
    var PERIODO;
    var REVISAO;



    var COLUNAS = [
        "NOMEPASTA",
        "CODDOCUMENTO",
        "DESCRICAO"
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
                if (constraints[i].fieldName == "IDPRJ") IDPRJ = constraints[i].initialValue;
                if (constraints[i].fieldName == "IDCONTRATO") IDCONTRATO = constraints[i].initialValue;
                if (constraints[i].fieldName == "PERIODO") PERIODO = constraints[i].initialValue;
                if (constraints[i].fieldName == "REVISAO") REVISAO = constraints[i].initialValue;
            }
        }

        log.info("[G12-GED] CODCOLIGADA: " + CODCOLIGADA);
        log.info("[G2-GED] IDPRJ: " + IDPRJ);
        log.info("[G2-GED] IDCONTRATO: " + IDCONTRATO);
        log.info("[G2-GED] PERIODO: " + PERIODO);
        log.info("[G2-GED] REVISAO: " + REVISAO);

        // Validacoes dos parametros obrigatorios
        if (CODCOLIGADA == undefined || CODCOLIGADA == null || String(CODCOLIGADA).trim() == "") {
            log.error("[dsContratoRM] CODCOLIGADA nao foi informado. Abortando.");
            return retornarErro("CODCOLIGADA nao foi informado", null, CODCOLIGADA, IDPRJ, IDCONTRATO, PERIODO, REVISAO);
        }

        if (IDPRJ == undefined || IDPRJ == null || String(IDPRJ).trim() == "") {
            log.error("[G12-GED] IDPRJ nao foi informado. Abortando.");
            return retornarErro("IDPRJ nao foi informado", null, CODCOLIGADA, IDPRJ, IDCONTRATO, PERIODO, REVISAO);
        }

        if (IDCONTRATO == undefined || IDCONTRATO == null || String(IDCONTRATO).trim() == "") {
            log.error("[G12-GED] IDCONTRATO nao foi informado. Abortando.");
            return retornarErro("IDCONTRATO nao foi informado", null, CODCOLIGADA, IDPRJ, IDCONTRATO, PERIODO, REVISAO);
        }

        if (REVISAO == undefined || REVISAO == null || String(REVISAO).trim() == "") {
            log.error("[G12-GED] REVISAO nao foi informado. Abortando.");
            return retornarErro("REVISAO nao foi informado", null, CODCOLIGADA, IDPRJ, IDCONTRATO, PERIODO, REVISAO);
        }

        if (PERIODO == undefined || PERIODO == null || String(PERIODO).trim() == "") {
            log.error("[G12-GED] PERIODO nao foi informado. Abortando.");
            return retornarErro("PERIODO nao foi informado", null, CODCOLIGADA, IDPRJ, IDCONTRATO, PERIODO, REVISAO);
        }

        var servico = ServiceManager.getService(NOME_SERVICO);
        var instancia = servico.instantiate(CAMINHO_SERVICO);
        var ws = instancia.getRMIwsConsultaSQL();
        var serviceHelper = servico.getBean();
        var authService = serviceHelper.getBasicAuthenticatedClient(ws, "com.totvs.IwsConsultaSQL", usuario, senha);


        var PARAMS = "CODCOLIGADA=" + CODCOLIGADA + ";IDPRJ=" + IDPRJ + ";IDCONTRATO=" + IDCONTRATO + ";PERIODO=" + PERIODO + ";REVISAO=" + REVISAO;
        log.info("[G12-GED] PARAMS enviados: " + PARAMS);

        var result = authService.realizarConsultaSQL("G12GED", 0, "F", PARAMS);
        log.info("[G12-GED] Retorno bruto do RM: " + result);

        var JSONObj = org.json.XML.toJSONObject(result);
        log.info("[G12-GED] JSON parseado: " + JSONObj);

        // Trata NewDataSet vazio
        var dados = JSONObj.get("NewDataSet").get("Resultado");
        if (dados == null || dados.toString().trim() == "") {
            log.warn("[G12-GED] Nenhum dado retornado pelo RM para " + "CODCOLIGADA=" + CODCOLIGADA + ";IDPRJ=" + IDPRJ + ";IDCONTRATO=" + IDCONTRATO);
            return dataset;
        }


        function buildRow(row) {
            return new Array(
                row.has("NOMEPASTA") ? row.get("NOMEPASTA") : "",
                row.has("CODDOCUMENTO") ? row.get("CODDOCUMENTO") : "",
                row.has("DESCRICAO") ? row.get("DESCRICAO") : ""
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
        return retornarErro(String(e), e.lineNumber, CODCOLIGADA, IDPRJ, IDCONTRATO);
    }

    return dataset;
}

function retornarErro(mensagem, linha, codColigada, idprj, idContrato, periodo, revisao) {
    var dsError = DatasetBuilder.newDataset();
    dsError.addColumn("ERROR");
    dsError.addColumn("LINE");
    dsError.addColumn("CODCOLIGADA");
    dsError.addColumn("IDPRJ");
    dsError.addColumn("IDCONTRATO");
    dsError.addRow(new Array(
        mensagem,
        linha != null ? linha : "",
        codColigada != null ? codColigada : "",
        idprj != null ? idprj : "",
        idContrato != null ? idContrato : "",
        periodo != null ? periodo : "",
        revisao != null ? revisao : ""
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