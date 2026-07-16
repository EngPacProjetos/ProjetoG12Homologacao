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