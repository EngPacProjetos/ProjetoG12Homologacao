function setSelectedZoomItem(selectedItem) {

    var coligada = $("#CodColigada").val();
    var idmov = $("#idmov2").val();

    console.log("PRINTANDO SELECTED ITEM DO ZOOM", selectedItem);

    var parans = "CODCOLIGADA," + coligada + ",IDMOV," + idmov;

    if (coligada != undefined && coligada != "" && idmov != undefined && idmov != "") {
        setTimeout(function reloadZoom() {
            // Fluig converte type zoom em select via WDK, então nunca filtre esse reload por input ... nao funciona .
            var campos = $("[name^='impostos_selecao___']");
            var index = campos.length;
            console.log("Campos zoom encontrados:", campos.length, "→ recarregando índice:", index);
            if (index >= 0) {
                reloadZoomFilterValues("impostos_selecao___" + index, parans);
            }
        }, 1000);
    }

}