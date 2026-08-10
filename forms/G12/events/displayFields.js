// function displayFields(form, customHTML) {


//     form.setShowDisabledFields(true);
//     form.setHidePrintLink(true);

//     var atividade = Number(getValue("WKNumState"));
//     var mode = form.getFormMode();
//     var mobile = form.getMobile();

//     var innerHtml = "<script>";

//     form.setValue("atividade", atividade);


//     if (mode == "MOD") {


//         if (atividade == 17) {
//             innerHtml += "$('#identificacaoProjetoDiv').show();"
//             innerHtml += "$('#detalhesContrato').show();"
//             innerHtml += "$('#aprovacaoSetorTecnico').show();"
//             innerHtml += "$('#historicoMovimento').show();"
//             innerHtml += "$('#validacaoContratos').hide();"
//             innerHtml += "$('#clienteFornecedor').hide();"
//             innerHtml += "$('#faturarNotas').hide();"
//             innerHtml += "$('#tributacao').hide();"
//             innerHtml += "$('#anexosRm').show();"
//             innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
//             innerHtml += "$('#erroAutorizarNotas').hide();"
//             innerHtml += "$('#enviarNota').hide();"
//             innerHtml += "$('#checagemDeTransmissao').hide();"
//         } else if (atividade == 173) {
//             innerHtml += "$('#identificacaoProjetoDiv').show();"
//             innerHtml += "$('#detalhesContrato').show();"
//             innerHtml += "$('#aprovacaoSetorTecnico').show();"
//             innerHtml += "$('#historicoMovimento').show();"
//             innerHtml += "$('#validacaoContratos').show();"
//             innerHtml += "$('#clienteFornecedor').hide();"
//             innerHtml += "$('#faturarNotas').hide();"
//             innerHtml += "$('#tributacao').hide();"
//             innerHtml += "$('#anexosRm').show();"
//             innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
//             innerHtml += "$('#erroAutorizarNotas').hide();"
//             innerHtml += "$('#enviarNota').hide();"
//             innerHtml += "$('#checagemDeTransmissao').hide();"
//         } else if (atividade == 23) {
//             innerHtml += "$('#identificacaoProjetoDiv').show();"
//             innerHtml += "$('#detalhesContrato').show();"
//             innerHtml += "$('#aprovacaoSetorTecnico').show();"
//             innerHtml += "$('#historicoMovimento').show();"
//             innerHtml += "$('#validacaoContratos').show();"
//             innerHtml += "$('#clienteFornecedor').show();"
//             innerHtml += "$('#faturarNotas').show();"
//             innerHtml += "$('#tributacao').show();"
//             innerHtml += "$('#anexosRm').show();"
//             innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
//             innerHtml += "$('#erroAutorizarNotas').hide();"
//             innerHtml += "$('#enviarNota').hide();"
//             innerHtml += "$('#checagemDeTransmissao').hide();"

//         } else if (atividade == 150) {
//             innerHtml += "$('#identificacaoProjetoDiv').show();"
//             innerHtml += "$('#detalhesContrato').show();"
//             innerHtml += "$('#aprovacaoSetorTecnico').show();"
//             innerHtml += "$('#historicoMovimento').show();"
//             innerHtml += "$('#validacaoContratos').show();"
//             innerHtml += "$('#clienteFornecedor').show();"
//             innerHtml += "$('#faturarNotas').show();"
//             innerHtml += "$('#tributacao').show();"
//             innerHtml += "$('#anexosRm').show();"
//             innerHtml += "$('#erroEnvioDeNotasDiv').show();"
//             innerHtml += "$('#erroAutorizarNotas').hide();"
//             innerHtml += "$('#enviarNota').hide();"
//             innerHtml += "$('#checagemDeTransmissao').hide();"

//         } else if (atividade == 158) {
//             innerHtml += "$('#identificacaoProjetoDiv').show();"
//             innerHtml += "$('#detalhesContrato').show();"
//             innerHtml += "$('#aprovacaoSetorTecnico').show();"
//             innerHtml += "$('#historicoMovimento').show();"
//             innerHtml += "$('#validacaoContratos').show();"
//             innerHtml += "$('#clienteFornecedor').show();"
//             innerHtml += "$('#faturarNotas').show();"
//             innerHtml += "$('#tributacao').show();"
//             innerHtml += "$('#anexosRm').show();"
//             innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
//             innerHtml += "$('#erroAutorizarNotas').show();"
//             innerHtml += "$('#enviarNota').hide();"
//             innerHtml += "$('#checagemDeTransmissao').hide();"
//         } else if (atividade == 61) {
//             innerHtml += "$('#identificacaoProjetoDiv').show();"
//             innerHtml += "$('#detalhesContrato').show();"
//             innerHtml += "$('#aprovacaoSetorTecnico').show();"
//             innerHtml += "$('#historicoMovimento').show();"
//             innerHtml += "$('#validacaoContratos').show();"
//             innerHtml += "$('#clienteFornecedor').show();"
//             innerHtml += "$('#faturarNotas').show();"
//             innerHtml += "$('#tributacao').show();"
//             innerHtml += "$('#anexosRm').show();"
//             innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
//             innerHtml += "$('#erroAutorizarNotas').hide();"
//             innerHtml += "$('#enviarNota').show();"
//             innerHtml += "$('#checagemDeTransmissao').hide();"
//         } else if (atividade == 242) {
//             innerHtml += "$('#identificacaoProjetoDiv').show();"
//             innerHtml += "$('#detalhesContrato').show();"
//             innerHtml += "$('#aprovacaoSetorTecnico').show();"
//             innerHtml += "$('#historicoMovimento').show();"
//             innerHtml += "$('#validacaoContratos').show();"
//             innerHtml += "$('#clienteFornecedor').show();"
//             innerHtml += "$('#faturarNotas').show();"
//             innerHtml += "$('#tributacao').show();"
//             innerHtml += "$('#anexosRm').show();"
//             innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
//             innerHtml += "$('#erroAutorizarNotas').hide();"
//             innerHtml += "$('#enviarNota').show();"
//             innerHtml += "$('#checagemDeTransmissao').show();"
//         }




//     }


//     innerHtml += "function getAtividade(){ return '" + atividade + "'};";
//     innerHtml += "function getMode(){ return '" + mode + "'};";
//     innerHtml += "function getMobile(){ return " + mobile + "};";

//     innerHtml += "</script>";

//     customHTML.append(innerHtml);
// }