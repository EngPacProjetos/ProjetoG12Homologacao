function exibitInfo() {
    var exibe = $("#exibirCheck").val();

    if (exibe == "") {
        $("#inforChecagem").slideDown(250);
        $("#exibirCheck").val("1");
    } else {
        $("#inforChecagem").slideUp(250);
        $("#exibirCheck").val("");
    }
}

function exibirEdicaoManual() {
    $("#enviarNota input[readonly]").prop('readonly', false);
}
function ajusteCompetencia() {
    $("#dataDeCompetencia").prop('readonly', false);
}


function pickerDate(campo) {

    var prop = $("input[name^='dataDeCompetencia']")[0].readOnly;

    if (prop) return;

    var campo_nome = campo.name.split("___")[0];


    // PICKER DATE PARA DATA DE COMPETENCIA
    var datePickerSelecionado = FLUIGC.calendar(campo, {
        pickDate: true
    });


}

function competenciaMudou() {

    var atividade = $('#atividade').val();

    console.log(atividade)

    if (atividade != 23) return;

    var valueInputCompetencia = $('input#dataDeCompetencia').val();

    if (valueInputCompetencia == null || valueInputCompetencia == "" || valueInputCompetencia == "undefined") return

    var valorInput = $('input#dataDeCompetencia').closest('.alteracao-competencia');

    console.log(valorInput)

    var found = valorInput.find('h5');

    console.log(found)

    if (found.length > 0) return;

    var javaScript = "";

    var div = $("#dataDeCompetencia").closest('.alteracao-competencia');

    console.log(div)

    javaScript += "<h5 style='margin-botton: 10px !important; color: #1eaad9;'>A data de competência já foi alterada ! <h5/>";

    div.append(javaScript);
}

function desabilitarParaAjuste() {
    var atividade = $("#atividade").val();
    console.log("ATIVIDADE DA VEZ -->", atividade)
    if (atividade == 250 || atividade == 43) {
        var valores = document.querySelectorAll("input, textarea, button, select");
        var valoresTransmissao = document.querySelectorAll(".botaoTransmissao");

        valores.forEach(input => {
            console.log("DESABILITOU")
            $(input).prop("readOnly", true);
            $(input).css("pointer-events", "none");
            $(input).css("background", "#dddddd");

        })
        valoresTransmissao.forEach(input => {
            console.log("DESABILITOU")
            $(input).css("pointer-events", "none");
            $(input).css("background", "#dddddd");

        })


    }
}


