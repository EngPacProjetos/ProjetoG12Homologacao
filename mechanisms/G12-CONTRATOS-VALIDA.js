/***********************************************************************************************
 * @author 		Enos Rocha - Desenvolvedor FLUIG
 * @data   		21/05/2026
 * @Versao
 * @Descricao	MECANISMO DE ATRIBUICAO DE USUARIO PARA VALIDACAO DE CONTRATOS
 ***********************************************************************************************/
function resolve(process, colleague) {
	try {

		var CentroDeCusto = hAPI.getCardValue('centro_de_custo');
		var CodColigada = hAPI.getCardValue('CodColigada');
		var Filial = hAPI.getCardValue('Filial');

		log.info("MECANISMO G12 CONTRATOS -> CENTRO DE CUSTO: " + CentroDeCusto);
		log.info("MECANISMO G12 CONTRATOS -> COLIGADA: " + CodColigada);
		log.info("FILIAL G12 CONTRATOS -> FILIAL: " + Filial);

		var user = getGroup(CentroDeCusto, CodColigada, Filial);

		if (user.isEmpty()) {
			throw ("Nenhum usuário encontrado para CentroDeCusto: " + CentroDeCusto + " e CodColigada: " + CodColigada);
		}

		return user;
	} catch (e) {
		log.error("Erro na funcao resolve: " + e.message);
		throw e;
	}
}

function getGroup(CentroDeCusto, CodColigada, Filial) {
	var userList = new java.util.ArrayList();

	userList.add("4ef20412-7687-40a4-b1c8-095c0a92503e");
	// if (CodColigada == 2) {
	// 	if (CentroDeCusto == "02.01.01.01.003" /* PB ITEM 1 */ || CentroDeCusto == "02.01.01.01.004" /* PB ITEM 2 */ || CentroDeCusto == "02.01.01.02.003" /* PB ITEM 3 */
	// 		|| CentroDeCusto == "02.01.01.02.004" /* PB ITEM 4 */ || CentroDeCusto == "02.01.01.02.005") /* PB ITEM 5 */ {
	// 		userList.add('Pool:Group:G12-ANALISECONTRATOS-SEECTPB');
	// 	} else {
	// 		userList.add('Pool:Group:G12-ANALISECONTRATOS-GERAL');
	// 	}
	// } else if (CodColigada == 1) {
	// 	if (Filial == 1 || Filial == 5) {
	// 		userList.add('Pool:Group:G12-ANALISECONTRATOS-DFGO');
	// 	} else {
	// 		userList.add('Pool:Group:G12-ANALISECONTRATOS-GERAL');
	// 	}
	// } else if (CodColigada == 3) {
	// 	if (Filial == 2) {
	// 		userList.add('Pool:Group:G12-ANALISECONTRATOS-DFGO');
	// 	} else {
	// 		userList.add('Pool:Group:G12-ANALISECONTRATOS-GERAL');
	// 	}
	// }
	return userList;
}
