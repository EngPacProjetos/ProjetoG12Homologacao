




// FUNCOES DE MUDANCA DE ETADADO ###############
function atualizarFiltroZoom() {
    var coligada = $("#CodColigada").val();
    if (coligada != undefined && coligada != "") {
        console.log("Aplicando filtro de Coligada no Zoom: " + coligada);
        // "idmovContratos" é o ID do campo no HTML
        reloadZoomFilterValues("idmovContratos", "CODCOLIGADA," + coligada);
    }
}