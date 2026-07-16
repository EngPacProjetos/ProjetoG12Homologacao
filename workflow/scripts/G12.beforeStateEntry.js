function beforeStateEntry(sequenceId) {


    if (sequenceId == 17 || sequenceId == 173 || sequenceId == 23 || sequenceId == 61 || sequenceId == 62 ||
        sequenceId == 13 || sequenceId == 180 || sequenceId == 183 || sequenceId == 71 || sequenceId == 74 ||
        sequenceId == 148 || sequenceId == 193 || sequenceId == 150 || sequenceId == 157 || sequenceId == 158 ||
        sequenceId == 200 || sequenceId == 78 || sequenceId == 81 || sequenceId == 43 || sequenceId == 87 ||
        sequenceId == 108 || sequenceId == 118 || sequenceId == 130 || sequenceId == 223 || sequenceId == 222 ||
        sequenceId == 129 || sequenceId == 117 || sequenceId == 107 || sequenceId == 90 || sequenceId == 30 ||
        sequenceId == 32) {

        var codColigada = hAPI.getCardValue("CodColigada");
        var idprj = hAPI.getCardValue("idprj");
        var idmov = hAPI.getCardValue("IdMov");
        var idContrato = hAPI.getCardValue("idContrato");
        var revisao = hAPI.getCardValue("revisaoProjeto");
        var periodoMedicaoFinal;

        log.info("COLIGADA GED - > " + codColigada);
        log.info("IDPRJ DO GED - > " + idprj);
        log.info("IDMOV DO GED - > " + idmov);
        log.info("ID DO CONTRATO DO GED - > " + idContrato);
        log.info("REVISAO DO GED - > " + revisao);
        log.info("PERIODO DO GED - > " + (periodoMedicaoFinal || "0"));




        try {
            var c1 = DatasetFactory.createConstraint("IDMOV", idmov, idmov, ConstraintType.MUST);
            var c2 = DatasetFactory.createConstraint("CODCOLIGADA", codColigada, codColigada, ConstraintType.MUST);



            var dataset = DatasetFactory.getDataset("G12-PERIODOS-MEDICAO", null, [c1, c2], null);


            if (dataset == null || dataset.rowsCount == 0) {
                log.warn("[G12-GED] Nenhum tributo retornado. CodColigada=" + codColigada + "  Idmov=" + idmov + " idContrato=" + idContrato);
                return;
            }

            for (var index = 0; index < dataset.rowsCount; index++) {
                periodoMedicaoFinal = safe(dataset.getValue(index, "PERIODOMED"));




            }

            hAPI.setCardValue("periodoMedicao", periodoMedicaoFinal);



        } catch (error) {
            log.error("G12-GED - > ERRO AO BUSCAR O PERIODO DE MEDICAO DO CONTRATO PARA BUSCA NO GED")
            throw error;
        }

        try {


            var c1 = DatasetFactory.createConstraint("CODCOLIGADA", codColigada, codColigada, ConstraintType.MUST);
            var c2 = DatasetFactory.createConstraint("IDPRJ", idprj, idprj, ConstraintType.MUST);
            var c3 = DatasetFactory.createConstraint("IDCONTRATO", idContrato, idContrato, ConstraintType.MUST);
            var c4 = DatasetFactory.createConstraint("PERIODO", periodoMedicaoFinal, periodoMedicaoFinal, ConstraintType.MUST);
            var c5 = DatasetFactory.createConstraint("REVISAO", revisao, revisao, ConstraintType.MUST);


            log.info("COLIGADA GED 2 - > " + codColigada);
            log.info("IDPRJ DO GED 2 - > " + idprj);
            log.info("IDMOV DO GED 2 - > " + idmov);
            log.info("ID DO CONTRATO DO GED 2 - > " + idContrato);
            log.info("REVISAO DO GED 2 - > " + revisao);
            log.info("PERIODO DO GED 2 - > " + (periodoMedicaoFinal || "0"));

            var valoresGuardados = new Array();

            var dataset = DatasetFactory.getDataset("G12-GED", null, [c1, c2, c3, c4, c5], null);


            if (dataset == null || dataset.rowsCount == 0) {
                log.warn("[G12-GED] Nenhum tributo retornado. CodColigada=" + codColigada + "  Idprj=" + idprj + " idContrato=" + idContrato + " periodo=" + periodoMedicaoFinal);
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
            throw error;
        }
    }


}