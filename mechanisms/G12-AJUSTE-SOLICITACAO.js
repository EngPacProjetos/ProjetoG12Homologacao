/***********************************************************************************************
 * @author 		Enos Rocha - Desenvolvedor full stack(fluig)
 * @data   		20/07/2026
 * @Versao  
 * @Descricao	Mecaniosmo juste de solicitacoes do financeiro
 ***********************************************************************************************/
function resolve(process, colleague) {
    try {

        var CentroDeCusto = hAPI.getCardValue('centro_de_custo');
        var CodColigada = hAPI.getCardValue('CodColigada');

        log.info("CentroDeCusto recebido: " + CentroDeCusto);
        log.info("CodColigada recebido: " + CodColigada);

        var group = getGroup(CentroDeCusto, CodColigada);
        log.info("grupo encontrado: " + group);

        if (group.isEmpty()) {
            throw new Error("Nenhum grupo encontrado para Centro de custo: " + CentroDeCusto + " e CodColigada: " + CodColigada);
        }

        return group;
    } catch (e) {
        log.error("Erro na funcao resolve: " + e.message);
        throw e;
    }
}


function getGroup(CentroDeCusto, CodColigada) {
    var groupList = new java.util.ArrayList();
    log.info("INICIANDO MECANISMO DE DECISAO DO G12-AJUSTE-SOLICITACAO")

    if (CodColigada == 2) {
        groupList.add('Pool:Group:G12-ENGPAC-AJUSTELICITACOES-FINANCEIRO');
    } else if (CodColigada == 1) {
        groupList.add('Pool:Group:G12-GENNESIS-AJUSTELICITACOES-FINANCEIRO');
    } else if (CodColigada == 3) {
        groupList.add('Pool:Group:G12-ECONTECX-AJUSTELICITACOES-FINANCEIRO');
    } else {
        groupList.add('Pool:Group:G12-AJUSTE-SEM GRUPO');//Fluig
    }
    return groupList;
}