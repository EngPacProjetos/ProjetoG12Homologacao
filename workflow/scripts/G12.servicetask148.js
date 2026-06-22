function servicetask148(attempt, message) {


    var codColigada = hAPI.getCardValue("CodColigada");
    var idMov = hAPI.getCardValue("idmov2"); // o IDMOV do movimento 2.1.02 gerado
    var filial = hAPI.getCardValue("filial");


    var usuario_rm = getConstante("rm_usuario");
    var senha_rm = getConstante("rm_senha");

    try {
        var servico = ServiceManager.getService("wsProcess");
        var instancia = servico.instantiate("com.totvs.WsProcess");
        var ws = instancia.getRMIwsProcess();

        var properties = {};
        properties['basic.authorization'] = 'true';
        properties['basic.authorization.username'] = usuario_rm;
        properties['basic.authorization.password'] = senha_rm;
        properties['disable.chunking'] = 'true';
        properties['log.soap.messages'] = 'true';
        properties['receive.timeout'] = '180000';

        var authService = servico.getCustomClient(ws, properties, []);

        log.info("[NFSe] Iniciando envio NFS-e. CODCOLIGADA=" + codColigada + " IDMOV=" + idMov);

        var xmlParams =
            '<FisNFSeEnvioParamsProc>' +
            '<CodColigada>' + codColigada + '</CodColigada>' +
            '<CodFilial>' + filial + '</CodFilial>' +
            '<QtdeNfseLote>0</QtdeNfseLote>' +
            '<ParametrosFracionados>false</ParametrosFracionados>' +
            '<PrimaryKeyList>' +
            '<ArrayOfanyType>' +
            '<anyType>' + codColigada + '</anyType>' +
            '<anyType>' + idMov + '</anyType>' +
            '</ArrayOfanyType>' +
            '</PrimaryKeyList>' +
            '</FisNFSeEnvioParamsProc>';

        var resp = authService.executeWithParams("MovEnviaNFSeMovAction", xmlParams);

        log.info("[NFSe] Resposta: " + resp);

    } catch (e) {
        log.error("[NFSe] Erro ao enviar NFS-e: " + String(e));
        throw e;
    }

}