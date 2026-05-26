function setSelectedZoomItem(selectedItem) {

    var coligada = $("#CodColigada").val();







    //  FUNCAO PARA ATUALIZACAO O CAMPO DE IDMOV DO SERVICO COM O VALOR DA COLIGADA 
    if (coligada != undefined && coligada != "") {
        setTimeout(function reloadZoom() {
            console.log("Aplicando filtro de Coligada no Zoom: " + coligada);
            reloadZoomFilterValues("idmovContratos", "CODCOLIGADA," + coligada);
        }, 1000)

    }
}