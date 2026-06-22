/**
 * @Author ENOS ROCHA - PROGRAMADOR FULL STACK
 * @CRIACAO 22/06/2026
 * @PURPOSE CRIA UM DATASET RESPONSAVEL POR EXTRAIR TODAS AS INFORMACOES DE UMA CONSULTA SQL NO TOTVS RM
 *          E CARREGAR OS DADOS DIRETO DENTRO DO FORMULARIO FLUIG
 * @CONSULTA G12-EXERCICIO-FISCAL RETORNA O EXERFCICIO FISCAL DE FORMA FINAMICA PARA FATURAMENTOS
 */
function createDataset(fields, constraints, sortFields) {

    var dataset = DatasetBuilder.newDataset();

    var NOME_SERVICO = "WSCONSSQL";
    var CAMINHO_SERVICO = "com.totvs.WsConsultaSQL";

    var CODCOLIGADA;

    // Colunas alinhadas com o retorno real da consulta G12FORMULARIO para contratos
    var COLUNAS = [
        "ID_EXERCICIO"
    ];

    try {

        var usuario = getAccess()[0];
        var pass = getAccess()[1];
        var senha = String(pass);

        log.info("[G12-EXERCICIO-FISCAL] Usuario de execucao: " + usuario);

        // Registra colunas no dataset
        for (var i = 0; i < COLUNAS.length; i++) {
            dataset.addColumn(COLUNAS[i]);
        }

        // Leitura dos constraints
        if (constraints != null) {
            for (var i = 0; i < constraints.length; i++) {
                if (constraints[i].fieldName == "CODCOLIGADA") CODCOLIGADA = constraints[i].initialValue;
            }
        }

        if (CODCOLIGADA == undefined || CODCOLIGADA == null || String(CODCOLIGADA).trim() == "") {
            log.error("[G12-EXERCICIO-FISCAL] CODCOLIGADA nao foi informado. Abortando.");
            return retornarErro("CODCOLIGADA nao foi informado", null, CODCOLIGADA);
        }

        var servico = ServiceManager.getService(NOME_SERVICO);
        var instancia = servico.instantiate(CAMINHO_SERVICO);
        var ws = instancia.getRMIwsConsultaSQL();
        var serviceHelper = servico.getBean();
        var authService = serviceHelper.getBasicAuthenticatedClient(ws, "com.totvs.IwsConsultaSQL", usuario, senha);

        var PARAMS = "CODCOLIGADA=" + CODCOLIGADA;
        log.info("[G12-EXERCICIO-FISCAL] PARAMS enviados: " + PARAMS);

        var result = authService.realizarConsultaSQL("G12EXERCICIOFISC", 0, "F", PARAMS);
        log.info("[G12-EXERCICIO-FISCAL] Retorno bruto do RM: " + result);

        var JSONObj = org.json.XML.toJSONObject(result);
        log.info("[G12-EXERCICIO-FISCAL] JSON parseado: " + JSONObj);

        var dados = JSONObj.get("NewDataSet").get("Resultado");
        log.info("[G12-EXERCICIO-FISCAL] Dados extraidos: " + dados);

        // Funcao auxiliar para montar uma linha com fallback seguro
        function buildRow(row) {
            return new Array(
                row.has("ID_EXERCICIO") ? row.get("ID_EXERCICIO") : ""
            );
        }

        if (dados.isNull(0)) {
            log.info("[G12-EXERCICIO-FISCAL] Registro unico encontrado.");
            dataset.addRow(buildRow(dados));

        } else {
            // Multiplos registros
            log.info("[G12-EXERCICIO-FISCAL] Multiplos registros encontrados: " + dados.length());
            for (var i = 0; i < dados.length(); i++) {
                dataset.addRow(buildRow(dados.get(i)));
            }
        }

    } catch (e) {
        log.error("[G12-EXERCICIO-FISCAL] ERRO: " + String(e) + " | Linha: " + e.lineNumber);
        return retornarErro(String(e), e.lineNumber, CODCOLIGADA);
    }

    return dataset;
}

function retornarErro(mensagem, linha, coligada) {
    var dsError = DatasetBuilder.newDataset();
    dsError.addColumn("ERROR");
    dsError.addColumn("LINE");
    dsError.addColumn("CODCOLIGADA");
    dsError.addRow(new Array(
        mensagem,
        linha != null ? linha : "",
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