function displayFields(form, customHTML) {


    // form.setShowDisabledFields(true);
    // form.setHidePrintLink(true);

    var atividade = Number(getValue("WKNumState"));
    var mode = form.getFormMode();
    var mobile = form.getMobile();

    var innerHtml = "<script>";

    form.setValue("atividade", atividade);


    var recebimentoFluxo = form.getValue("controleDeFluxo");


    if (mode == "MOD") {


        if (atividade == 17) {
            innerHtml += "$('#identificacaoProjetoDiv').show();"
            innerHtml += "$('#detalhesContrato').show();"
            innerHtml += "$('#aprovacaoSetorTecnico').show();"
            innerHtml += "$('#historicoMovimento').show();"
            innerHtml += "$('#validacaoContratos').hide();"
            innerHtml += "$('#clienteFornecedor').hide();"
            innerHtml += "$('#faturarNotas').hide();"
            innerHtml += "$('#tributacao').hide();"
            innerHtml += "$('#anexosRm').show();"
            innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
            innerHtml += "$('#erroAutorizarNotas').hide();"
            innerHtml += "$('#enviarNota').hide();"
            innerHtml += "$('#checagemDeTransmissao').hide();"

            innerHtml += "$('#ajusteFinanceiro').hide();"
            innerHtml += "$('#aguardandoRecebimento').hide();"

        } else if (atividade == 173) {
            innerHtml += "$('#identificacaoProjetoDiv').show();"
            innerHtml += "$('#detalhesContrato').show();"
            innerHtml += "$('#aprovacaoSetorTecnico').show();"
            innerHtml += "$('#historicoMovimento').show();"
            innerHtml += "$('#validacaoContratos').show();"
            innerHtml += "$('#clienteFornecedor').hide();"
            innerHtml += "$('#faturarNotas').hide();"
            innerHtml += "$('#tributacao').hide();"
            innerHtml += "$('#anexosRm').show();"
            innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
            innerHtml += "$('#erroAutorizarNotas').hide();"
            innerHtml += "$('#enviarNota').hide();"
            innerHtml += "$('#checagemDeTransmissao').hide();"

            innerHtml += "$('#ajusteFinanceiro').hide();"
            innerHtml += "$('#aguardandoRecebimento').hide();"
        } else if (atividade == 23) {
            innerHtml += "$('#identificacaoProjetoDiv').show();"
            innerHtml += "$('#detalhesContrato').show();"
            innerHtml += "$('#aprovacaoSetorTecnico').show();"
            innerHtml += "$('#historicoMovimento').show();"
            innerHtml += "$('#validacaoContratos').show();"
            innerHtml += "$('#clienteFornecedor').show();"
            innerHtml += "$('#faturarNotas').show();"
            innerHtml += "$('#tributacao').show();"
            innerHtml += "$('#anexosRm').show();"
            innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
            innerHtml += "$('#erroAutorizarNotas').hide();"
            innerHtml += "$('#enviarNota').hide();"
            innerHtml += "$('#checagemDeTransmissao').hide();"

            innerHtml += "$('#ajusteFinanceiro').hide();"
            innerHtml += "$('#aguardandoRecebimento').hide();"

        } else if (atividade == 150) {
            innerHtml += "$('#identificacaoProjetoDiv').show();"
            innerHtml += "$('#detalhesContrato').show();"
            innerHtml += "$('#aprovacaoSetorTecnico').show();"
            innerHtml += "$('#historicoMovimento').show();"
            innerHtml += "$('#validacaoContratos').show();"
            innerHtml += "$('#clienteFornecedor').show();"
            innerHtml += "$('#faturarNotas').show();"
            innerHtml += "$('#tributacao').show();"
            innerHtml += "$('#anexosRm').show();"
            innerHtml += "$('#erroEnvioDeNotasDiv').show();"
            innerHtml += "$('#erroAutorizarNotas').hide();"
            innerHtml += "$('#enviarNota').hide();"
            innerHtml += "$('#checagemDeTransmissao').hide();"

            innerHtml += "$('#ajusteFinanceiro').hide();"
            innerHtml += "$('#aguardandoRecebimento').hide();"

        } else if (atividade == 158) {
            innerHtml += "$('#identificacaoProjetoDiv').show();"
            innerHtml += "$('#detalhesContrato').show();"
            innerHtml += "$('#aprovacaoSetorTecnico').show();"
            innerHtml += "$('#historicoMovimento').show();"
            innerHtml += "$('#validacaoContratos').show();"
            innerHtml += "$('#clienteFornecedor').show();"
            innerHtml += "$('#faturarNotas').show();"
            innerHtml += "$('#tributacao').show();"
            innerHtml += "$('#anexosRm').show();"
            innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
            innerHtml += "$('#erroAutorizarNotas').show();"
            innerHtml += "$('#enviarNota').hide();"
            innerHtml += "$('#checagemDeTransmissao').hide();"

            innerHtml += "$('#ajusteFinanceiro').hide();"
            innerHtml += "$('#aguardandoRecebimento').hide();"
        } else if (atividade == 61) {
            innerHtml += "$('#identificacaoProjetoDiv').show();"
            innerHtml += "$('#detalhesContrato').show();"
            innerHtml += "$('#aprovacaoSetorTecnico').show();"
            innerHtml += "$('#historicoMovimento').show();"
            innerHtml += "$('#validacaoContratos').show();"
            innerHtml += "$('#clienteFornecedor').show();"
            innerHtml += "$('#faturarNotas').show();"
            innerHtml += "$('#tributacao').show();"
            innerHtml += "$('#anexosRm').show();"
            innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
            innerHtml += "$('#erroAutorizarNotas').hide();"
            innerHtml += "$('#enviarNota').show();"
            innerHtml += "$('#checagemDeTransmissao').hide();"

            innerHtml += "$('#ajusteFinanceiro').hide();"
            innerHtml += "$('#aguardandoRecebimento').hide();"
        } else if (atividade == 242) {
            innerHtml += "$('#identificacaoProjetoDiv').show();"
            innerHtml += "$('#detalhesContrato').show();"
            innerHtml += "$('#aprovacaoSetorTecnico').show();"
            innerHtml += "$('#historicoMovimento').show();"
            innerHtml += "$('#validacaoContratos').show();"
            innerHtml += "$('#clienteFornecedor').show();"
            innerHtml += "$('#faturarNotas').show();"
            innerHtml += "$('#tributacao').show();"
            innerHtml += "$('#anexosRm').show();"
            innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
            innerHtml += "$('#erroAutorizarNotas').hide();"
            innerHtml += "$('#enviarNota').show();"
            innerHtml += "$('#checagemDeTransmissao').show();"

            innerHtml += "$('#ajusteFinanceiro').hide();"
            innerHtml += "$('#aguardandoRecebimento').hide();"


            form.setValue("controleDeFluxo", "1");



        } else if (atividade == 250) {

            if (recebimentoFluxo == "2") {
                innerHtml += "$('#identificacaoProjetoDiv').show();"
                innerHtml += "$('#detalhesContrato').show();"
                innerHtml += "$('#aprovacaoSetorTecnico').show();"
                innerHtml += "$('#historicoMovimento').show();"
                innerHtml += "$('#validacaoContratos').show();"
                innerHtml += "$('#clienteFornecedor').show();"
                innerHtml += "$('#faturarNotas').show();"
                innerHtml += "$('#tributacao').show();"
                innerHtml += "$('#anexosRm').show();"
                innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
                innerHtml += "$('#erroAutorizarNotas').hide();"
                innerHtml += "$('#enviarNota').show();"
                innerHtml += "$('#checagemDeTransmissao').show();"

                innerHtml += "$('#ajusteFinanceiro').show();"
                innerHtml += "$('#aguardandoRecebimento').show();"
            } else if (recebimentoFluxo == "1") {
                innerHtml += "$('#identificacaoProjetoDiv').show();"
                innerHtml += "$('#detalhesContrato').show();"
                innerHtml += "$('#aprovacaoSetorTecnico').show();"
                innerHtml += "$('#historicoMovimento').show();"
                innerHtml += "$('#validacaoContratos').show();"
                innerHtml += "$('#clienteFornecedor').show();"
                innerHtml += "$('#faturarNotas').show();"
                innerHtml += "$('#tributacao').show();"
                innerHtml += "$('#anexosRm').show();"
                innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
                innerHtml += "$('#erroAutorizarNotas').hide();"
                innerHtml += "$('#enviarNota').show();"
                innerHtml += "$('#checagemDeTransmissao').show();"

                innerHtml += "$('#ajusteFinanceiro').show();"
                innerHtml += "$('#aguardandoRecebimento').hide();"
            }
            form.setValue("controleDeFluxo", "3");

        }


        else if (atividade == 62) {

            if (recebimentoFluxo == "3") {
                innerHtml += "$('#identificacaoProjetoDiv').show();"
                innerHtml += "$('#detalhesContrato').show();"
                innerHtml += "$('#aprovacaoSetorTecnico').show();"
                innerHtml += "$('#historicoMovimento').show();"
                innerHtml += "$('#validacaoContratos').show();"
                innerHtml += "$('#clienteFornecedor').show();"
                innerHtml += "$('#faturarNotas').show();"
                innerHtml += "$('#tributacao').show();"
                innerHtml += "$('#anexosRm').show();"
                innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
                innerHtml += "$('#erroAutorizarNotas').hide();"
                innerHtml += "$('#enviarNota').show();"
                innerHtml += "$('#checagemDeTransmissao').show();"

                innerHtml += "$('#aguardandoRecebimento').show();"


                innerHtml += "$('#ajusteFinanceiro').show();"
            } else {
                innerHtml += "$('#identificacaoProjetoDiv').show();"
                innerHtml += "$('#detalhesContrato').show();"
                innerHtml += "$('#aprovacaoSetorTecnico').show();"
                innerHtml += "$('#historicoMovimento').show();"
                innerHtml += "$('#validacaoContratos').show();"
                innerHtml += "$('#clienteFornecedor').show();"
                innerHtml += "$('#faturarNotas').show();"
                innerHtml += "$('#tributacao').show();"
                innerHtml += "$('#anexosRm').show();"
                innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
                innerHtml += "$('#erroAutorizarNotas').hide();"
                innerHtml += "$('#enviarNota').show();"
                innerHtml += "$('#checagemDeTransmissao').show();"

                innerHtml += "$('#aguardandoRecebimento').show();"


                innerHtml += "$('#ajusteFinanceiro').hide();"
            }



            form.setValue("controleDeFluxo", "2");
        }


        innerHtml += "function getAtividade(){ return '" + atividade + "'};";
        innerHtml += "function getMode(){ return '" + mode + "'};";
        innerHtml += "function getMobile(){ return " + mobile + "};";

        innerHtml += "</script>";

        customHTML.append(innerHtml);
    }

}
