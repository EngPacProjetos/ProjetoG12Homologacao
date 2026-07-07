/***********************************************************************************************
 * @author 		Enos Rocha - Desenvolvedor FLUIG
 * @data   		06/07/2026
 * @Versao
 * @Descricao	Mecanismo para decidir em qual grupo de validacao de contratos o processo deve ser encaminhado.
 ***********************************************************************************************/
function resolve(process, colleague) {
	try {

		var CentroDeCusto = hAPI.getCardValue('centro_de_custo');
		var CodColigada = hAPI.getCardValue('coligada');
		var Filial = hAPI.getCardValue('filial');

		var user = getGroup(CentroDeCusto, CodColigada, Filial);

		if (user.isEmpty()) {
			throw ("Nenhum centro de custo encontrado no formulário " + CentroDeCusto + " e CodColigada: " + CodColigada);
		}

		return user;
	} catch (e) {
		log.error("Erro na funcao resolve: " + e.message);
		throw e;
	}
}

function getGroup(CentroDeCusto, CodColigada, Filial) {
	var userList = new java.util.ArrayList();

	if (CodColigada == 2) {
		if (CentroDeCusto == "02.01.01.01.001" /* ADM REGIONAL JOAO PESSOA */
			|| CentroDeCusto == "02.01.01.01.003" /* SEECT PB ITEM 1 */
			|| CentroDeCusto == "02.01.01.01.004" /* SEECT PB ITEM 2 */
			|| CentroDeCusto == "02.01.01.01.008" /* ADM REGIONAL PARAIBA */
			|| CentroDeCusto == "02.01.01.01.010" /* SEINFRA PB - REFORMA ESCOLAS */
			|| CentroDeCusto == "02.01.01.01.011" /* ICMBIO - PB */
			|| CentroDeCusto == "02.01.01.01.012" /* SUPLAN - PB */
			|| CentroDeCusto == "02.01.01.02.001" /* ADM REGIONAL CAMPINA GRANDE */
			|| CentroDeCusto == "02.01.01.02.003" /* SEECT PB ITEM 3 */
			|| CentroDeCusto == "02.01.01.02.004" /* SEECT PB ITEM 4 */
			|| CentroDeCusto == "02.01.01.02.005" /* SEECT PB ITEM 5 */
			|| CentroDeCusto == "02.01.01.02.007" /* SEDUC - PB */) {
			userList.add('Pool:Group:G12-ANALISECONTRATOS-PB');
		} else {
			userList.add('Pool:Group:G12-ANALISECONTRATOS-GERAL');
		}
	} else if (CodColigada == 1) {
		if (Filial == 1 || Filial == 5) {
			userList.add('Pool:Group:G12-ANALISECONTRATOS-DFGO');
		} else {
			userList.add('Pool:Group:G12-ANALISECONTRATOS-GERAL');
		}
	} else if (CodColigada == 3) {
		if (Filial == 2) {
			userList.add('Pool:Group:G12-ANALISECONTRATOS-DFGO');
		} else {
			userList.add('Pool:Group:G12-ANALISECONTRATOS-GERAL');
		}
	}
	return userList;
}
