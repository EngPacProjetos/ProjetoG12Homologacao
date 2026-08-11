function selecionarBotaoTransmissao(botao, sufixo) {
    sufixo = sufixo || "";

    var idInfoCorreta = "#infoTransmOK" + sufixo;
    $(idInfoCorreta).val("");

    $(botao).addClass('selecionado');
    $(botao).siblings().removeClass('selecionado');

    var $financeiro = $("#financeiroReponsavel" + sufixo);
    var $tecnico = $("#tecnicoReponsavel" + sufixo);
    var $motivo = $("#motivoReemissao" + sufixo);
    var $ajuste = $("#ajusteTransmissao" + sufixo);

    var idCorretas = "infoNfseCorretas" + sufixo;
    var idErradas = "infoNfseErradas" + sufixo;

    if (botao.id === idCorretas) {
        $(idInfoCorreta).val("sim");

        $financeiro.removeClass('campo-habilitado').addClass('campo-desabilitado');
        $tecnico.removeClass('campo-habilitado').addClass('campo-desabilitado');
        $motivo.removeClass('campo-habilitado').addClass('campo-desabilitado');
        $ajuste.removeClass('textarea-habilitado').addClass('textarea-desabilitado');

    } else if (botao.id === idErradas) {
        $(idInfoCorreta).val("nao");

        $financeiro.removeClass('campo-desabilitado').addClass('campo-habilitado');
        $tecnico.removeClass('campo-desabilitado').addClass('campo-habilitado');
        $motivo.removeClass('campo-desabilitado').addClass('campo-habilitado');
      
    }
}

function selecionarBotaoTransmissaoSetor(botao, sufixo) {
    sufixo = sufixo || "";

    $(botao).addClass('selecionado');
    $(botao).siblings().removeClass('selecionado');

    var idInfoSetor = "#infoSetorAjuste" + sufixo;
    var idFinanceiro = "financeiroReponsavel" + sufixo;
    var idTecnico = "tecnicoReponsavel" + sufixo;

    if (botao.id === idFinanceiro) {
        $(idInfoSetor).val("financeiro");
    } else if (botao.id === idTecnico) {
        $(idInfoSetor).val("tecnico");
    }
}

function chagenSelect(select) {
    var $select = $(select);
    var valueSelect = String(select.value).trim();
    var sufixo = select.id.indexOf("Recebimento") !== -1 ? "Recebimento" : "";

    var $textarea = $select
        .closest('div')
        .siblings('.form-group')
        .find("#ajusteTransmissao" + sufixo);

    if (valueSelect === "outros") {
        $textarea.removeClass('textarea-desabilitado').addClass('textarea-habilitado');
    } else {
        $textarea.removeClass('textarea-habilitado').addClass('textarea-desabilitado');
    }
}