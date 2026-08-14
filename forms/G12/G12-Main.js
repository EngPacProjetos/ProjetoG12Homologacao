// FUNCOES DISPARADAS AO CARREGAR O DOM DA PAGINA 
$(document).ready(function () {
    dispararTributosTimeOut(); // atrasa a execuçao do ajuste de tributos para dar tepo do dom ser montado
    //checkOnCno();
    checkAllInfo(); // Check as informacoes do formulario para o bot exibir ao usuario 
    competenciaMudou(); // Marca de em algum momento a competência foi alterada ou nao 
    desabilitarParaAjuste(); //Desabilita campos quando entra na fase de ajuste de solicitacao
    renderizarHistoricoMovimentos(); // Monta a tabela do painel Historico dos Movimentos

})

$(document).on('change', 'input, select, textarea', function () {
    checkAllInfo();
    renderizarHistoricoMovimentos();
});







