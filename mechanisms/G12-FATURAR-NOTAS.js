/***********************************************************************************************
 * @author 		Enos Rocha - Desenvolvedor fullstack FLUIG
 * @data   		29/08/2026
 * @Versao  
 * @Descricao	Mecanismo de faturar notas fiscais
 ***********************************************************************************************/
function resolve(process, colleague) {
    try {
        log.info("Thread atual: " + java.lang.Thread.currentThread().getName());
        log.info("Iniciando funcao resolve");

        var CentroDeCusto = hAPI.getCardValue('CCcustoMEC');
        var CodColigada = hAPI.getCardValue('EmpresaMEC');

        log.info("CentroDeCusto recebido: " + CentroDeCusto);
        log.info("CodColigada recebido: " + CodColigada);

        var user = getGroup(CentroDeCusto, CodColigada);
        log.info("usuario encontrado: " + user);

        if (user.isEmpty()) {
            throw new Error("Nenhum usuário encontrado para CentroDeCusto: " + CentroDeCusto + " e CodColigada: " + CodColigada);
        }

        return user;
    } catch (e) {
        log.error("Erro na funcao resolve: " + e.message);
        throw e;
    }
}


function getGroup(CentroDeCusto, CodColigada){
	var userList = new java.util.ArrayList();
	
	if(CodColigada == 2){
			userList.add('Pool:Group:G12-ENGPAC-FATURAR-NOTAS');
	} else if(CodColigada == 1) {
			userList.add('Pool:Group:G12-GENNESIS-FATURAR-NOTAS');
	} else if(CodColigada == 3){
			userList.add('Pool:Group:G12-ECONTECX-FATURAR-NOTAS');
	} else  {
		userList.add('Pool:Group:Suporte');//Fluig
	}
	return userList;
}