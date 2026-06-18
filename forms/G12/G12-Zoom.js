function setSelectedZoomItem(selectedItem) {


    var coligada = $("#CodColigada").val();
    var idmov = $("#idmov2").val();

    var parans = "CODCOLIGADA," + coligada + ",IDMOV," + idmov;

    console.log("PRINTANDO SELECTED ITEM DO ZOOM", selectedItem);



    if (selectedItem && (selectedItem.inputName != "" || selectedItem.inputName != null && selectedItem.inputName != "undefined")) {

        if (selectedItem.inputName.indexOf("ajusteIrrfZoom") != -1) {

            var codigo = selectedItem.CODIGO_IRRF;

            console.log("CODIGO IRRF SELECIONADO", codigo)

            var descricao = selectedItem.DESCRICAO_IRRF;

            console.log("DESCRICAO DE IRRF SELECIONADA", descricao);

            $("#irrfCodigoAjuste").val(codigo);
            $("#irrfDescricaoAjuste").val(descricao);

        }



        if (selectedItem.inputName.indexOf("ajusteInssZoom") != -1) {

            var codigo = selectedItem.CODIGO_INSS;
            var descricao = selectedItem.DESCRICAO_INSS;

            $("#inssCodigoAjuste").val(codigo)
            $("#inssDescricaoAjuste").val(descricao)

        }

    } else {

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

















}