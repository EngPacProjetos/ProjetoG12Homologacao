/***********************************************************************************************
 * @author 		Enos Rocha - Desenvolvedor FLUIG
 * @data   		21/05/2026
 * @Versao
 * @Descricao	Mec. Aprovacao das solicitacoes do G12 pelo setor de engenharia
 ***********************************************************************************************/
function resolve(process, colleague) {
	try {

		var CentroDeCusto = hAPI.getCardValue('centro_de_custo');
		var CodColigada = hAPI.getCardValue('CodColigada');

		log.info("MECANISMO G12 -> CENTRO DE CUSTO: " + CentroDeCusto);
		log.info("MECANISMO G12 -> COLIGADA: " + CodColigada);


		var user = getUser(CentroDeCusto, CodColigada);
		log.info("usuario encontrado: " + user);

		if (user.isEmpty()) {
			throw new Error("Nenhum usuario encontrado para CentroDeCusto: " + CentroDeCusto + " e CodColigada: " + CodColigada);
		}

		return user;
	} catch (e) {
		log.error("Erro na funcao resolve: " + e.message);
		throw e;
	}
}

function getUser(CentroDeCusto, CodColigada) {
	var userList = new java.util.ArrayList();

	userList.add('4ef20412-7687-40a4-b1c8-095c0a92503e');//Fluig

	// if (CodColigada == 2) {
	// 	if (CentroDeCusto == '02.01.01.01.005' || CentroDeCusto == '02.01.01.01.009' || CentroDeCusto == '02.02.01.05.001') {
	// 		userList.add('44001bcd-2fdb-48a2-a2b0-362062806204');//higor
	// 	} else if (CentroDeCusto == "02.02.01.01.011" || CentroDeCusto == "02.02.01.02.005" || CentroDeCusto == '02.01.01.01.006' || CentroDeCusto == '02.02.01.01.005'
	// 		|| CentroDeCusto == '02.02.01.01.006' || CentroDeCusto == '02.02.01.01.007' || CentroDeCusto == '02.02.01.01.009' || CentroDeCusto == '02.02.01.02.001'
	// 		|| CentroDeCusto == '02.02.01.03.001' || CentroDeCusto == '02.02.01.03.002' || CentroDeCusto == "02.02.01.04.001" || CentroDeCusto == '02.02.01.01.013'
	// 		|| CentroDeCusto == "02.02.01.01.014" || CentroDeCusto == '02.02.01.01.015' || CentroDeCusto == "02.02.01.01.016" || CentroDeCusto == "02.02.01.01.018"
	// 		|| CentroDeCusto == "02.02.01.01.019" || CentroDeCusto == "02.02.01.01.003" || CentroDeCusto == "02.02.01.01.004" || CentroDeCusto == "02.03.01.02.005"
	// 		|| CentroDeCusto == "02.02.01.01.020" || CentroDeCusto == "02.02.01.01.021" || CentroDeCusto == "02.02.01.01.022" || CentroDeCusto == "02.02.01.01.023"
	// 		|| CentroDeCusto == "02.02.01.01.024") {
	// 		userList.add('bbe0cc93-5544-472a-9632-e60de59733c3');//odijerfeson
	// 	}
	// 	else if (CentroDeCusto == '02.01.01.01.007' || CentroDeCusto == '02.01.01.01.011') {
	// 		userList.add('fdbc23c0-649a-4928-8394-38baba8950ca'); // Vanylk Souza
	// 	} else if (CentroDeCusto == '02.01.01.01.010') {
	// 		userList.add('fdbc23c0-649a-4928-8394-38baba8950ca');// Vanylk Souza
	// 	} else if (CentroDeCusto == "02.01.01.02.007") {
	// 		userList.add('438783e2-7339-4348-91de-4aaf9faa4426');// Anderson Ferreira
	// 	} else if (CentroDeCusto == "02.06.01.01.003" || CentroDeCusto == "02.06.01.01.004") {
	// 		userList.add('a7bb35a9-ef96-43a7-9371-892f470c39cf') // Brigida
	// 	} else if (CentroDeCusto == "02.06.01.01.005") {
	// 		userList.add('5c34f62c-91f2-4781-b7d2-82b799cf3ca3') // Aprovador lote 52
	// 	} else if (CentroDeCusto == "02.06.01.03.004" || CentroDeCusto == "02.06.01.03.005" || CentroDeCusto == "02.06.01.02.003" || CentroDeCusto == "02.06.01.02.004" || CentroDeCusto == "02.06.01.02.005" || CentroDeCusto == "02.06.01.02.002") {
	// 		userList.add('1a7409b5-f0ef-4619-bbd3-4a703a898281') //Claudio.Jorge
	// 	} else if (CentroDeCusto == '02.02.01.06.001') {
	// 		userList.add('fb9696f7-006b-4849-bd7a-963d6fd08dbc');//ulisses
	// 	} else if (CentroDeCusto == '02.01.01.02.006') {
	// 		userList.add('a2808599-f0c1-46b4-89d4-634074ffc7a4')//Tercio Porto
	// 	} else if (CentroDeCusto == "02.05.01.01.003" || CentroDeCusto == "02.05.01.01.004" || CentroDeCusto == "02.05.01.01.005") {
	// 		userList.add('d733d878-d25b-46de-bed9-6c6766905d7b'); // thiago.leite
	// 	} else if (CentroDeCusto == "02.05.01.01.002" || CentroDeCusto == "02.05.01.01.006") { //smobi BH - OESTE
	// 		userList.add('d733d878-d25b-46de-bed9-6c6766905d7b'); // thiago.leite
	// 	} else if (CentroDeCusto == '02.02.01.01.010') {
	// 		userList.add('e221ebe7-9044-463b-acf2-34f748ab6caa');//gabriela
	// 	} else if (CentroDeCusto == '02.03.01.01.001') {
	// 		userList.add('70f0fe39-f805-4a44-a44a-dc52cabc626a');//diego
	// 	} else if (CentroDeCusto == '02.02.01.01.002' || CentroDeCusto == "02.03.01.01.002" || CentroDeCusto == '02.03.01.01.003' || CentroDeCusto == "02.03.01.01.004" || CentroDeCusto == "02.03.01.01.006"
	// 		|| CentroDeCusto == "02.03.01.01.007" || CentroDeCusto == "02.03.01.01.008" || CentroDeCusto == "02.03.01.01.010" || CentroDeCusto == "02.03.01.01.011" || CentroDeCusto == "02.03.01.01.012"
	// 		|| CentroDeCusto == "02.03.01.01.009") {
	// 		userList.add('d60eeee8-9923-482a-a272-4340ab578415');//lucas.vinicius
	// 	} else if (CentroDeCusto == '02.05.01.01.003') {
	// 		userList.add('15f59b7e-47fa-4a34-9761-a37c59aa4a66');//kaio.dorneles
	// 	} else if (CentroDeCusto == '02.01.01.01.012') {
	// 		userList.add('0f50eb1b-7ef5-4e3a-b3f1-1a2186f7695f');//	Rodrigo Medeiros
	// 	} else if (CentroDeCusto == '02.04.01.01.001' || CentroDeCusto == "02.04.01.01.002") {
	// 		userList.add('36278aad-579c-4862-9bd1-af07db3c9aec')// Luan Patrick Fernandes
	// 	} else if (CentroDeCusto == '02.06.01.04.001') {
	// 		userList.add('f1c60079-1177-4d76-89e1-787a1df7a088')//Sergio Medeiros
	// 	} else if (CentroDeCusto == '02.06.01.04.002' || CentroDeCusto == '02.06.01.04.003' || CentroDeCusto == '02.06.01.04.004' || CentroDeCusto == '02.06.01.04.005' || CentroDeCusto == '02.06.01.04.006') {
	// 		userList.add('0f50eb1b-7ef5-4e3a-b3f1-1a2186f7695f')//Rodrigo Medeiros
	// 	} else if (CentroDeCusto == "02.01.01.01.003" /* PB ITEM 1 */ || CentroDeCusto == "02.01.01.01.004" /* PB ITEM 2 */ || CentroDeCusto == "02.01.01.02.003" /* PB ITEM 3 */
	// 		|| CentroDeCusto == "02.01.01.02.004" /* PB ITEM 4 */ || CentroDeCusto == "02.01.01.02.005" /* PB ITEM 5 */ || CentroDeCusto == "02.06.01.05.002") {
	// 		userList.add('44001bcd-2fdb-48a2-a2b0-362062806204')//Higor Wesley
	// 	} else {
	// 		userList.add('4ef20412-7687-40a4-b1c8-095c0a92503e');//Fluig
	// 	}
	// } else if (CodColigada == 1) {
	// 	if (CentroDeCusto == "02.02.01.01.008" || CentroDeCusto == "02.02.01.01.009") {
	// 		userList.add('980c81e5-8d07-4908-8675-e7db8b0a0a3d');//yuri medeiros
	// 	} else if (CentroDeCusto == "02.04.01.01.002" || CentroDeCusto == "02.04.01.01.003" || CentroDeCusto == "02.04.01.01.005" || CentroDeCusto == "02.04.01.01.006" || CentroDeCusto == "02.04.01.01.009"
	// 		|| CentroDeCusto == "02.04.01.01.010" || CentroDeCusto == "02.04.01.01.011" || CentroDeCusto == "02.04.01.01.012" || CentroDeCusto == "02.04.01.01.013" || CentroDeCusto == "02.04.01.01.014") {
	// 		userList.add('70f0fe39-f805-4a44-a44a-dc52cabc626a');//diego
	// 	} else if (CentroDeCusto == "02.03.01.01.001" || CentroDeCusto == "02.03.01.01.002" || CentroDeCusto == "02.03.01.01.003" || CentroDeCusto == '02.04.01.01.001') {
	// 		userList.add('36278aad-579c-4862-9bd1-af07db3c9aec')// Luan Patrick Fernandes
	// 	} else if (CentroDeCusto == "02.04.01.01.008" || CentroDeCusto == "02.04.01.01.021" || CentroDeCusto == "02.04.01.01.022" || CentroDeCusto == "02.04.01.01.023" || CentroDeCusto == "02.04.01.01.020"
	// 		|| CentroDeCusto == "02.02.01.01.005" || CentroDeCusto == "02.04.01.01.015" || CentroDeCusto == "02.04.01.01.016" || CentroDeCusto == "02.04.01.01.017" || CentroDeCusto == "02.04.01.01.018" || CentroDeCusto == "02.04.01.01.019") {
	// 		userList.add('d60eeee8-9923-482a-a272-4340ab578415');//lucas.vinicius
	// 	} else if (CentroDeCusto == "02.02.01.01.006" || CentroDeCusto == "02.02.01.01.007" || CentroDeCusto == "02.02.01.04.001") {
	// 		userList.add('bbe0cc93-5544-472a-9632-e60de59733c3');//odijerfeson
	// 	} else if (CentroDeCusto == "02.02.01.01.004" || CentroDeCusto == "02.02.01.01.010") {
	// 		userList.add('284678ce-8fbf-47d4-b1af-55c91f0d1a97');//isaac.medeiros
	// 	} else if (CentroDeCusto == "02.05.01.01.001") {
	// 		userList.add('15f59b7e-47fa-4a34-9761-a37c59aa4a66');//kaio.dorneles
	// 	}
	// 	else if (CentroDeCusto == "02.01.01.01.013" || CentroDeCusto == "02.01.01.01.027" ||
	// 		CentroDeCusto == "02.01.01.01.018" || CentroDeCusto == "02.01.01.01.019" || CentroDeCusto == "02.01.01.01.020" ||
	// 		CentroDeCusto == "02.01.01.01.021" || CentroDeCusto == "02.01.01.01.001" || CentroDeCusto == "02.01.01.01.010" ||
	// 		CentroDeCusto == "02.01.01.01.029" || CentroDeCusto == "02.01.01.01.030" || CentroDeCusto == "02.01.01.01.031") {
	// 		userList.add("0288d7f0-9044-4b35-aef3-b351a9cc44a4"); // ciro.farias
	// 	} else if (
	// 		CentroDeCusto == "02.01.01.01.002" || CentroDeCusto == "02.01.01.01.003" || CentroDeCusto == "02.01.01.01.004" || CentroDeCusto == "02.01.01.01.006"
	// 		|| CentroDeCusto == "02.01.01.01.005" || CentroDeCusto == "02.01.01.01.007" || CentroDeCusto == "02.01.01.01.008" || CentroDeCusto == "02.01.01.01.009" || CentroDeCusto == "02.01.01.01.016"
	// 		|| CentroDeCusto == "02.01.01.01.011" || CentroDeCusto == "02.01.01.01.012" || CentroDeCusto == "02.01.01.01.014" || CentroDeCusto == "02.01.01.01.015" || CentroDeCusto == "02.01.01.01.028"
	// 		|| CentroDeCusto == "02.01.01.01.017" || CentroDeCusto == "02.01.01.01.022" || CentroDeCusto == "02.01.01.01.025" || CentroDeCusto == '02.01.01.01.032' || CentroDeCusto == '02.05.01.01.003'
	// 		|| CentroDeCusto == '02.01.01.01.033' || CentroDeCusto == '02.01.01.01.034' || CentroDeCusto == "02.01.01.01.035" || CentroDeCusto == "02.06.01.01.001" || CentroDeCusto == "02.06.01.01.002"
	// 		|| CentroDeCusto == '02.06.01.01.010' || CentroDeCusto == '02.06.01.01.011' || CentroDeCusto == '02.06.01.01.014' || CentroDeCusto == '02.06.01.01.015'
	// 		|| CentroDeCusto == '02.06.01.01.018' || CentroDeCusto == "02.06.01.01.003" || CentroDeCusto == "02.06.01.01.004" || CentroDeCusto == "02.06.01.01.005" || CentroDeCusto == "02.06.01.01.012"
	// 		|| CentroDeCusto == "02.06.01.01.013" || CentroDeCusto == "02.06.01.01.016" || CentroDeCusto == "02.06.01.01.019" || CentroDeCusto == "02.06.01.01.020" || CentroDeCusto == "02.06.01.01.021"
	// 	) {
	// 		userList.add("2abf965d-0de6-435c-b944-ff5022e0799b")// S�?©rgio Franco
	// 	} else if (CentroDeCusto == '02.05.01.01.004') {
	// 		userList.add('fdbc23c0-649a-4928-8394-38baba8950ca');// Vanylk Souza
	// 	}
	// 	else {
	// 		userList.add('4ef20412-7687-40a4-b1c8-095c0a92503e');//Fluig
	// 	}
	// } else if (CodColigada == 3) {
	// 	if (CentroDeCusto == "02.01.01.01.001") {
	// 		userList.add("0288d7f0-9044-4b35-aef3-b351a9cc44a4"); // ciro.farias
	// 	} else if (CentroDeCusto == "02.03.01.01.001" || CentroDeCusto == "02.03.01.01.003" || CentroDeCusto == "02.03.01.01.004" || CentroDeCusto == "02.03.01.01.005"
	// 		|| CentroDeCusto == "02.03.01.02.004" || CentroDeCusto == "02.03.01.02.005") {
	// 		userList.add("bbe0cc93-5544-472a-9632-e60de59733c3"); // odijerffeson
	// 	} else if (CentroDeCusto == "02.03.01.02.003" || CentroDeCusto == "02.03.01.02.002") {
	// 		userList.add("bbe0cc93-5544-472a-9632-e60de59733c3"); // odijerffeson
	// 	} else if (CentroDeCusto == "02.02.01.01.001" /* SEFAZ PB - LOTE 1*/ || CentroDeCusto == "02.02.01.01.002" /*SEFAZ PB - LOTE 2*/
	// 		|| CentroDeCusto == "02.02.01.02.001" /* SEFAZ PB - LOTE 3 */ || CentroDeCusto == "02.02.01.02.002" /* SEFAZ PB - LOTE 4 */
	// 		|| CentroDeCusto == "02.02.01.02.003" /*SEFAZ PB - LOTE 5*/) {
	// 		userList.add('4b63d52d-4457-4d88-bb5c-a44ec6701314')//Jo�?£o Azevedo
	// 	} else if (CentroDeCusto == "02.03.01.02.001") {
	// 		userList.add("9ee42ece-5df3-43aa-b974-d4b1a0c52602"); //marcelo maia
	// 	} else {
	// 		userList.add('4ef20412-7687-40a4-b1c8-095c0a92503e');//Fluig
	// 	}
	// }
	return userList;
}
