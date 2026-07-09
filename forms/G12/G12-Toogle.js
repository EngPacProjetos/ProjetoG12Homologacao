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
