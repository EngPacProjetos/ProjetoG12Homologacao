function servicetask71(attempt, message) {
    /**
     * AUTHOR: ENOS DESENVOLVEDOR FLUIG/FULL STACK 
     * CRIADO EM: 29/05/2026
     * PROPOSITO: FATURAR OS MOVIMENTOS DE VENDAS DO TIPO 2.1.01 , CRIAR MOVIMENTO 2.1.02 E GERAR O RELACIONAMENTO ENTRE ELES DENTRO DO RM 
    */



    var codColigada = hAPI.getCardValue("CodColigada");
    var idMov = hAPI.getCardValue("IdMov");
    var codFilial = hAPI.getCardValue("filial");
    var today = new java.text.SimpleDateFormat("yyyy-MM-dd").format(new java.util.Date());

    var usuario_rm = getConstante("rm_usuario"); 
    var senha_rm = getConstante("rm_senha"); 

    try {

        /* 
        AQUI VAI ACONTECER A MÁGICA DA INTEGRACAO 
        1 - ServiceManager.getService("wsProcess")- > PRIMEIRO É NECESSÁRIO PEGAR O SERVICO QUE SERA RESPONSAVEL PELA INTEGRACAO DENTRO DO SEU FLUIG , EM PAIENL DE CONTROLE - SERVICOS 
        2 - instantiate() - > O SERVICO RESPOSAVEL POR INTEGRACOES MAIS COMPLEXAS DENTRO DO FLUIG É O WSPROCESS, TAMBÉM EXISTE O WSDATASERVER POREM ELE SERVE PARA CRUD MAIS SIMPLES, ALTERAR, EXCLUIR MOVIMENTOS, REALIZAR UPDATES ETCC
            COMO NESSE CASO É UMA OPERAÇÃO COMPLEXA QUE ENVOLVE RELACIONAMENTOS, FATURAMENTO, GERAÇÃO , TRANSFERENCIA DE DADOS ENTRE OS MOVIMENTOS ETC.. O WSPROCESS EXECUTA ISSO PERFEITAMENTE. 
        3 - IRÁ INSTANCIAR ESSE SERVICO , FAZER UMA ESPÉCIA DE CÓPIA DA CLASSE WSPROCESS (servico.instantiate("com.totvs.WsProcess"))
        4 - getRMIwsProcess() -> TEM ACESSO AOS METODOS DA CLASSE INTANCIADA 
        5 - properties -> INFORMACOES PARA AUTORIZACAO DO USO DO SERVICO DENTRO DO SERVIDOR DO RM, PRINCIPALMENTE O USUARIO E SENHA 
            E, INDISCUTIVELMENTE, UM TIMEOUT BOM, POIS, ISSO PODE IMPEDIR A EXECUSAO DA ATIVIDADE.
        6- getCustomClient() - > PASSAR AS INFORMACOES DE AUTORIZACOES E OS METODOS DA CLASSE INTANCIADA 
        7- executeWithParams() - > Metodo para faturar movimentos , passando o server name e o corpo XML -> executeWithParams("MovFaturamentoProc", xmlParams)
        
        */
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

        log.info("### Servico OK, executando faturamento IDMOV=" + idMov);

        var xmlParams = 
            '<MovFaturamentoProcParams>' +
            '<movCopiaFatPar>' +
            '<CodColigada>' + codColigada + '</CodColigada>' +
            '<CodSistema>T</CodSistema>' +
            '<CodTmvDestino>2.1.02</CodTmvDestino>' +
            '<CodTmvOrigem>2.1.01</CodTmvOrigem>' +
            '<CodUsuario>fluig</CodUsuario>' +
            '<GrupoFaturamento></GrupoFaturamento>' +
            '<IdExercicioFiscal>3</IdExercicioFiscal>' +
            '<IdMov>' +
            '<int>' + idMov + '</int>' +
            '</IdMov>' +
            '<TipoFaturamento>0</TipoFaturamento>' +
            '<dataBase>' + today + '</dataBase>' +
            '<dataEmissao/>' +
            '<dataSaida/>' +
            '<efeitoPedidoFatAutomatico>1</efeitoPedidoFatAutomatico>' +
            '<listaMovItemFatAutomatico/>' +
            '<numeroMov></numeroMov>' +
            '<realizaBaixaPedido>true</realizaBaixaPedido>' +
            '</movCopiaFatPar>' +
            '</MovFaturamentoProcParams>';

        var resp = authService.executeWithParams("MovFaturamentoProc", xmlParams);


    } catch (e) {
        log.error("### Erro: " + e);
        throw e;
    }



}


function getConstante(param) {
  var aConstraint = [];
  aConstraint.push(DatasetFactory.createConstraint('id', param, param, ConstraintType.MUST));
  var oConstantes = DatasetFactory.getDataset('ds_Constantes', null, null, null);
  for (var i = 0; i < oConstantes.rowsCount; i++) {
    if (oConstantes.getValue(i, "id").trim() == param.trim()) {
      return oConstantes.getValue(i, "Valor").trim();
    }
  }
  return '0';
}