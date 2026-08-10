function selecionarBotaoTransmissao(botao) {

    $("#infoSetorAjuste").val("");

    var id = botao.id;

    if (id == "infoNfseCorretas") {
        $(botao).css("background", "#1eaad9");
        $(botao).css("color", "white");

        var siblings = $(botao).siblings();

        $(siblings).css("background", "none");
        $(siblings).css("color", "black");

        var infoTransmissaoCorreta = $("#infoTransmissaoCorreta").val("sim");

        $("#financeiroReponsavel").css("pointer-events", "none")
        $("#tecnicoReponsavel").css("pointer-events", "none")
        $("#financeiroReponsavel").css("background", "#e9ecef")
        $("#tecnicoReponsavel").css("background", "#e9ecef")
        $("#financeiroReponsavel").css("color", "#6c757d")
        $("#tecnicoReponsavel").css("color", "#6c757d")
        $("#ajusteTransmissao").css("pointer-events", "none");
        $("#ajusteTransmissao").css("background", "#e9ecef");
    }
    if (id == "infoNfseErradas") {
        $(botao).css("background", "#1eaad9");
        $(botao).css("color", "white");

        var siblings = $(botao).siblings();

        $(siblings).css("background", "none");
        $(siblings).css("color", "black");

        var infoTransmissaoCorreta = $("#infoTransmissaoCorreta").val("nao");

        $("#financeiroReponsavel").css("pointer-events", "auto")
        $("#tecnicoReponsavel").css("pointer-events", "auto")
        $("#financeiroReponsavel").css("background", "none")
        $("#tecnicoReponsavel").css("background", "none")
        $("#financeiroReponsavel").css("color", "#000000")
        $("#tecnicoReponsavel").css("color", "#000000")
        $("#ajusteTransmissao").css("pointer-events", "auto");
        $("#ajusteTransmissao").css("background", "none");
    }

}
function selecionarBotaoTransmissaoSetor(botao) {

    var id = botao.id;

    if (id == "financeiroReponsavel") {
        $(botao).css("background", "#1eaad9");
        $(botao).css("color", "white");

        var siblings = $(botao).siblings();

        $(siblings).css("background", "none");
        $(siblings).css("color", "black");

        var infoSetorAjuste = $("#infoSetorAjuste").val("financeiro");
        console.log(infoSetorAjuste)
    }
    if (id == "tecnicoReponsavel") {
        $(botao).css("background", "#1eaad9");
        $(botao).css("color", "white");

        var siblings = $(botao).siblings();

        $(siblings).css("background", "none");
        $(siblings).css("color", "black");

        var infoSetorAjuste = $("#infoSetorAjuste").val("tecnico");
        console.log(infoSetorAjuste)
    }

}


function selecionarBotaoTransmissaoRecebimento(botao) {

    $("#infoSetorAjuste").val("");

    var id = botao.id;

    if (id == "infoNfseCorretasRecebimento") {
        $(botao).css("background", "#1eaad9");
        $(botao).css("color", "white");

        var siblings = $(botao).siblings();

        $(siblings).css("background", "none");
        $(siblings).css("color", "black");

        var infoTransmissaoCorreta = $("#infoTransmissaoCorreta").val("sim");

        $("#financeiroReponsavelRecebimento").css("pointer-events", "none")
        $("#tecnicoReponsavelRecebimento").css("pointer-events", "none")
        $("#financeiroReponsavelRecebimento").css("background", "#e9ecef")
        $("#tecnicoReponsavelRecebimento").css("background", "#e9ecef")
        $("#financeiroReponsavelRecebimento").css("color", "#6c757d")
        $("#tecnicoReponsavelRecebimento").css("color", "#6c757d")
        $("#ajusteTransmissaoRecebimento").css("pointer-events", "none");
        $("#ajusteTransmissaoRecebimento").css("background", "#e9ecef");
    }
    if (id == "infoNfseErradasRecebimento") {
        $(botao).css("background", "#1eaad9");
        $(botao).css("color", "white");

        var siblings = $(botao).siblings();

        $(siblings).css("background", "none");
        $(siblings).css("color", "black");

        var infoTransmissaoCorreta = $("#infoTransmissaoCorreta").val("nao");

        $("#financeiroReponsavelRecebimento").css("pointer-events", "auto")
        $("#tecnicoReponsavelRecebimento").css("pointer-events", "auto")
        $("#financeiroReponsavelRecebimento").css("background", "none")
        $("#tecnicoReponsavelRecebimento").css("background", "none")
        $("#financeiroReponsavelRecebimento").css("color", "#000000")
        $("#tecnicoReponsavelRecebimento").css("color", "#000000")
        $("#ajusteTransmissaoRecebimento").css("pointer-events", "auto");
        $("#ajusteTransmissaoRecebimento").css("background", "none");
    }

}
function selecionarBotaoTransmissaoSetorRecebimento(botao) {

    var id = botao.id;

    if (id == "financeiroReponsavelRecebimento") {
        $(botao).css("background", "#1eaad9");
        $(botao).css("color", "white");

        var siblings = $(botao).siblings();

        $(siblings).css("background", "none");
        $(siblings).css("color", "black");

        var infoSetorAjuste = $("#infoSetorAjuste").val("financeiro");
        console.log(infoSetorAjuste)
    }
    if (id == "tecnicoReponsavelRecebimento") {
        $(botao).css("background", "#1eaad9");
        $(botao).css("color", "white");

        var siblings = $(botao).siblings();

        $(siblings).css("background", "none");
        $(siblings).css("color", "black");

        var infoSetorAjuste = $("#infoSetorAjuste").val("tecnico");
        console.log(infoSetorAjuste)
    }

}