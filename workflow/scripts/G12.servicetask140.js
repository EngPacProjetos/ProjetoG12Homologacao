function servicetask140(attempt, message) {

    var codColigada = hAPI.getCardValue("CodColigada");
    var idprj = hAPI.getCardValue("idprj");
    var idContrato = hAPI.getCardValue("idContrato");


    try {
        var c1 = DatasetFactory.createConstraint("CODCOLIGADA", codColigada, codColigada, ConstraintType.MUST);
        var c2 = DatasetFactory.createConstraint("IDPRJ", idprj, idprj, ConstraintType.MUST);
        var c3 = DatasetFactory.createConstraint("IDCONTRATO", idContrato, idContrato, ConstraintType.MUST);

        var valoresGuardados = new Array();

        var dataset = DatasetFactory.getDataset("G12-GED", null, [c1, c2, c3], null);


        if (dataset == null || dataset.rowsCount == 0) {
            log.warn("[G12-GED] Nenhum tributo retornado. CodColigada=" + codColigada + "  Idprj=" + idprj + " idContrato=" + idContrato);
            return;
        }

        for (var index = 0; index < dataset.rowsCount; index++) {
            var nomePasta = safe(dataset.getValue(index, "NOMEPASTA"));
            var codigoDocumento = safe(dataset.getValue(index, "CODDOCUMENTO"));
            var descricao = safe(dataset.getValue(index, "DESCRICAO"));

            var info = nomePasta + "|" + codigoDocumento + "|" + descricao

            valoresGuardados.push(info);

        }

        hAPI.setCardValue("gedInfo", valoresGuardados.join(";"));


    } catch (error) {
        log.error("G12-GED - > ERRO AO BUSCAR OS DADOS")
        throw e;
    }
}