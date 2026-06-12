/**
 * @Author ENOS ROCHA - PROGRAMADOR FULL STACK
 * @CRIACAO 11/06/2026
 * @PURPOSE CRIA UM DATASET RESPONSAVEL POR EXTRAIR TODAS AS INFORMACOES DE UMA CONSULTA SQL NO TOTVS RM
 *          E CARREGAR OS DADOS DIRETO DENTRO DO FORMULARIO FLUIG
 * @CONSULTA G12-IRRF-ZOOM RETORNA TODOS OS IRRF CADASTRADOS E SUAS ALQIUOTAS PARA AJUSTE VIA INTEGRACAO NO FORMULARIAO
 */
function createDataset(fields, constraints, sortFields) {

    var dataset = DatasetBuilder.newDataset();

    var NOME_SERVICO = "WSCONSSQL";
    var CAMINHO_SERVICO = "com.totvs.WsConsultaSQL";

    var CODCOLIGADA;
    var IDMOV;

    // Colunas alinhadas com o retorno real da consulta G12TRIBUTOS para tributos
    var COLUNAS = [
        "CODIGO_IRRF",
        "DESCRICAO_IRRF"
        
    ];

    try {

        var usuario = getAccess()[0];
        var pass = getAccess()[1];
        var senha = String(pass);

        log.info("[G12-IRRF-ZOOM] Usuario de execucao: " + usuario);

        // Registra colunas no dataset
        for (var i = 0; i < COLUNAS.length; i++) {
            dataset.addColumn(COLUNAS[i]);
        }

        var servico = ServiceManager.getService(NOME_SERVICO);
        var instancia = servico.instantiate(CAMINHO_SERVICO);
        var ws = instancia.getRMIwsConsultaSQL();
        var serviceHelper = servico.getBean();
        var authService = serviceHelper.getBasicAuthenticatedClient(ws, "com.totvs.IwsConsultaSQL", usuario, senha);

        var result = authService.realizarConsultaSQL("G12IRRFZOOM", 0, "F", "");
        log.info("[G12-IRRF-ZOOM] Retorno bruto do RM: " + result);

        var JSONObj = org.json.XML.toJSONObject(result);
        log.info("[G12-IRRF-ZOOM] JSON parseado: " + JSONObj);

        var dados = JSONObj.get("NewDataSet").get("Resultado");
        log.info("[G12-IRRF-ZOOM] Dados extraidos: " + dados);

        // Funcao auxiliar para montar uma linha com fallback seguro
        function buildRow(row) {
            return new Array(
                row.has("CODIGO_IRRF") ? row.get("CODIGO_IRRF") : "",
                row.has("DESCRICAO_IRRF") ? row.get("DESCRICAO_IRRF") : ""
             
            );
        }

        if (dados.isNull(0)) {
            log.info("[G12-IRRF-ZOOM] Registro unico encontrado.");
            dataset.addRow(buildRow(dados));

        } else {
            // Multiplos registros
            log.info("[G12-IRRF-ZOOM] Multiplos registros encontrados: " + dados.length());
            for (var i = 0; i < dados.length(); i++) {
                dataset.addRow(buildRow(dados.get(i)));
            }
        }

    } catch (e) {
        log.error("[G12-IRRF-ZOOM]] ERRO: " + String(e) + " | Linha: " + e.lineNumber);
        return retornarErro(String(e), e.lineNumber);
    }

    return dataset;
}

function retornarErro(mensagem, linha) {
    var dsError = DatasetBuilder.newDataset();
    dsError.addColumn("ERROR");
    dsError.addColumn("LINE");
    dsError.addRow(new Array(
        mensagem,
        linha != null ? linha : ""
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