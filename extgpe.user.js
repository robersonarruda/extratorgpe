// ==UserScript==
// @name       Extrator Contatos GPE 3
// @fullname      Extrator Contatos GPE 3
// @version    3.3.5.1
// @description  Consulta e salva dados de contato dos Servidores do sigeduca.
// @include	*sigeduca.seduc.mt.gov.br/grh/hwmgrhServidor.aspx*
// @author       Roberson Arruda
// @homepage      https://github.com/robersonarruda/extratorgpe/blob/main/extgpe.user.js
// @downloadURL   https://github.com/robersonarruda/extratorgpe/raw/main/extgpe.user.js
// @updateURL     https://github.com/robersonarruda/extratorgpe/raw/main/extgpe.user.js
// @copyright  2019, Roberson Arruda (robersonarruda@outlook.com)
// ==/UserScript==


//CARREGA libJquery
var libJquery = document.createElement('script');
libJquery.src = 'https://code.jquery.com/jquery-3.4.0.min.js';
libJquery.language='javascript';
libJquery.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(libJquery);

//CSS DOS BOTÕES
var styleSCT = document.createElement('style');
styleSCT.type = 'text/css';
styleSCT.innerHTML =
'.botaoSCT {'+
'	-moz-box-shadow:inset 1px 1px 0px 0px #b2ced4;'+
'	-webkit-box-shadow:inset 1px 1px 0px 0px #b2ced4;'+
'	box-shadow:inset 1px 1px 0px 0px #b2ced4;'+
'	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr="#4e88ed", endColorstr="#3255c7");'+
'	background-color:#4e88ed;'+
'	border:1px solid #102b4d;'+
'	display:inline-block;'+
'	color:#ffffff;'+
'	font-family:Trebuchet MS;'+
'	font-size:11px;'+
'	font-weight:bold;'+
'	padding:2px 0px;'+
'	width:152px;'+
'	text-decoration:none;'+
'	text-shadow:1px 1px 0px #100d29;'+
'}.botaoSCT:hover {'+
'	background:-webkit-gradient( linear, left top, left bottom, color-stop(0.05, #3255c7), color-stop(1, #4e88ed) );'+
'	background:-moz-linear-gradient( center top, #3255c7 5%, #4e88ed 100% );'+
'	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr="#3255c7", endColorstr="#4e88ed");'+
'	background-color:#3255c7;'+
'}.botaoSCT:active {'+
'	position:relative;'+
'	top:1px;}'+
'.menuSCT{'+
'	-moz-border-radius:4px;'+
'	-webkit-border-radius:4px;'+
'	border-radius:4px;'+
'	border:1px solid #b9b8b9;'+
'   background:radial-gradient(#c8ced5, #d5d5d533)}'
document.getElementsByTagName('head')[0].appendChild(styleSCT);

//Variáveis
var nomeArquivo;
var vetServidor = [0];
var dadosPessoal = [0];
var dadosCTPS = [0];
var codUnidade="";
var n = 0;
var o = 0;
var urlDadosIni = "";
var urlDadosFim = "";
var cabecalho1 = "COD SERVIDOR; SERVIDOR; ESTADO CIVIL; DATA NASCIMENTO; NATURALIDADE; UF; RG; CPF; MÃE; TEL RES; CELULAR; CONTATO; E-MAIL; BAIRRO; RUA; NÚMERO; COMPLEMENTO; CIDADE; UF; CEP;";
var cabecalho2 = "COD SERVIDOR; Nro CTPS; SÉRIE CTPS; UF CTPS; Nro TÍTULO ELEITOR; SEÇÃO TÍTULO; ZONA TÍTULO; UF TÍTULO; PIS";
var urlListaServ = "http://sigeduca.seduc.mt.gov.br/grh/hwmgrhpreatribuicao.aspx";

var urlFichaServIni = "http://sigeduca.seduc.mt.gov.br/grh/hwtgrhpessoa1.aspx?";
var urlFichaServFim = ",HWMGrhServidor,DSP,0,";

var urlCTPSServIni = "http://sigeduca.seduc.mt.gov.br/grh/hwtgrhpessoa2.aspx?";
var urlCTPSServFim = ",HWMGrhServidor,DSP,2,";
var urlProcessos = "http://sigeduca.seduc.mt.gov.br/grh/hwmgrhconsultaprocesso.aspx?es"

function resetarVariaveis(){
    vetServidor = [0];
    dadosPessoal = [0];
    dadosCTPS = [0];
    txtareaDados.value ="";
    n = 0;
    o = 0;
}

//FUNÇÃO SALVAR CONTEÚDO EM CSV
function saveTextAsFile() {
    var conteudo = document.getElementById("txtDados").value;
    var a = document.createElement('a');

    // Atribuindo diretamente as propriedades do objeto 'a'
    a.href = 'data:text/csv;base64,' + btoa(conteudo);
    a.download = nomeArquivo + '.csv';

    // Adicionando o link ao DOM, clicando e removendo
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function iniciar(){
    resetarVariaveis();
    nomeArquivo = elemSelServ[elemSelServ.selectedIndex].innerText.trim(); //Nome que será dado ao arquivo com base no Tipo de servidor selecionado atual.
    if(codUnidade !== ""){
        ifrIframe1.removeEventListener("load", coletaDados);
        ifrIframe1.src = urlListaServ;
        ifrIframe1.addEventListener("load", copyCodServ);
    }
    else{
        ifrIframe1.src = urlProcessos;
        ifrIframe1.addEventListener("load", obterCodUnidade);
    }
}

function obterCodUnidade(){
    ifrIframe1.removeEventListener("load", obterCodUnidade);
    var optUnidade = parent.frames[0].document.getElementById('vWGERLOTCOD');
    codUnidade = optUnidade[optUnidade.selectedIndex].value.trim();
    iniciar();
}

function copyCodServ(){
    // Função que será chamada quando o 'gx_ajax_notification' desaparecer
    function onElementHidden() {
        var tabela = parent.frames[0].document.getElementById('Grid1ContainerTbl');
        var nLinhas = tabela.getElementsByTagName('tr').length - 1;
        if (nLinhas >= 1) {
            for (var i = 1; i <= nLinhas; i++) {
                vetServidor[i-1] = parent.frames[0].document.getElementById('span_GERPESCOD_'+String(i).padStart(4, '0')).innerText.trim();
                if (i == nLinhas) {
                    vetServidor = [...new Set(vetServidor)];
                    ifrIframe1.removeEventListener("load", copyCodServ);
                    vetServidor = vetServidor.filter(function(item) {return item !== ""; });
                    ifrIframe1.src= urlDadosIni+vetServidor[n]+urlDadosFim;
                    ifrIframe1.addEventListener("load", coletaDados);
                }
            }
        } else {
            alert("Nenhum servidor localizado para o Tipo Selecionado ou sistema indisponível no momento. Tente novamente mais tarde!");
        }
    }

    // Configuração do MutationObserver para observar alterações no estilo de 'gx_ajax_notification'
    function observeNotification() {
        var targetNode = parent.frames[0].document.getElementById('gx_ajax_notification');
        if (!targetNode) return; // Se o elemento não existe, não faz nada.

        var config = { attributes: true, attributeFilter: ['style'] };

        // Callback para o MutationObserver
        var callback = function (mutationsList, observer) {
            mutationsList.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    // Verifica se 'display' é 'none'
                    var displayValue = targetNode.style.display;
                    if (displayValue === 'none') {
                        // Quando o elemento desaparecer, chama a função desejada
                        onElementHidden();
                        observer.disconnect(); // Desconecta o observer após a execução
                    }
                }
            });
        };

        // Cria e começa a observar o 'gx_ajax_notification'
        var observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }
    // Inicia a observação. Quando o gx_ajax_notification for exibido e sumir, significa que a lista de servidores consultada logo abaixo já foi exibida, chamando a função onElementHidden.
    observeNotification();

    //Consulta lista de servidores da categoria selecionada, para pegar os códigos deles.
    parent.frames[0].document.getElementById('vGERLOTCOD').value = codUnidade;
    parent.frames[0].document.getElementById('vGRHTPOSRVCOD').value = elemSelServ.value;
    parent.frames[0].document.getElementsByName('BCONSULTAR')[0].click();

}

function coletaDados() {
    if(n < vetServidor.length){
        //Dados gerais
        dadosPessoal[n] = vetServidor[n] +";"; //Cod Servidor
        dadosPessoal[n] = dadosPessoal[n] + parent.frames[0].document.getElementById('CTLGERPESNOM').value +";"; //Nome Servidor
        var optCivil = parent.frames[0].document.getElementById('CTLGERPESESTCIV'); //Elemento option do Estado civil
        dadosPessoal[n] = dadosPessoal[n] + optCivil[optCivil.selectedIndex].innerHTML.trim()+";";//Estado civil selecionado
        dadosPessoal[n] = dadosPessoal[n] + parent.frames[0].document.getElementById('CTLGERPESDTANASC').value +";"; //Data Nascimento
        dadosPessoal[n] = dadosPessoal[n] + parent.frames[0].document.getElementById('span_CTLGERPESNATDSC').innerHTML +";"; //Cidade Naturalidade
        dadosPessoal[n] = dadosPessoal[n] + parent.frames[0].document.getElementById('span_CTLGERPESNATUF').innerHTML +";"; //UF Naturalidade
        dadosPessoal[n] = dadosPessoal[n] + parent.frames[0].document.getElementById('CTLGERPESRG').value +";"; //RG Servidor
        if(parent.frames[0].document.getElementById('span_CTLGERPESCPF') !== null){
            dadosPessoal[n] = dadosPessoal[n] + parent.frames[0].document.getElementById('span_CTLGERPESCPF').innerHTML+";"; //span_CTLGERPESCPF CPF
        }
        else if(parent.frames[0].document.getElementById('CTLGERPESCPF') !== null){
            dadosPessoal[n] = dadosPessoal[n] + parent.frames[0].document.getElementById('CTLGERPESCPF').value+";"; //CTLGERPESCPF CPF
        }
        dadosPessoal[n] = dadosPessoal[n] + parent.frames[0].document.getElementById('CTLGERPESNOMMAE').value +";"; //Nome da mãe
        //Contato
        dadosPessoal[n] = dadosPessoal[n] + "("+parent.frames[0].document.getElementById('CTLGERPESTELRESDDD').value+")"; //DDD Residencial
        dadosPessoal[n] = dadosPessoal[n] + parent.frames[0].document.getElementById('CTLGERPESTELRES').value+";"; //Tel Residencial
        dadosPessoal[n] = dadosPessoal[n] + "("+parent.frames[0].document.getElementById('CTLGERPESTELCELDDD').value+")"; //DDD Celular
        dadosPessoal[n] = dadosPessoal[n] + parent.frames[0].document.getElementById('CTLGERPESTELCEL').value+";"; //Tel Celular
        dadosPessoal[n] = dadosPessoal[n] + "("+parent.frames[0].document.getElementById('CTLGERPESTELCONDDD').value+")"; //DDD Contato
        dadosPessoal[n] = dadosPessoal[n] + parent.frames[0].document.getElementById('CTLGERPESTELCON').value+";"; //Tel Contato
        dadosPessoal[n] = dadosPessoal[n] + parent.frames[0].document.getElementById('CTLGERPESEMAIL').value+";"; //E-mail
        //Endereço
        dadosPessoal[n] = dadosPessoal[n] + parent.frames[0].document.getElementById('CTLGERPESBAIRRO').value+";"; //Bairro
        dadosPessoal[n] = dadosPessoal[n] + parent.frames[0].document.getElementById('CTLGERPESEND').value+";"; // rua
        dadosPessoal[n] = dadosPessoal[n] + parent.frames[0].document.getElementById('CTLGERPESNMRLOG').value+";"; // numero
        dadosPessoal[n] = dadosPessoal[n] + parent.frames[0].document.getElementById('CTLGERPESCMPLOG').value+";"; // complemento
        dadosPessoal[n] = dadosPessoal[n] + parent.frames[0].document.getElementById('span_CTLGERPESENDCIDDSC').innerHTML+";"; // cidade
        dadosPessoal[n] = dadosPessoal[n] + parent.frames[0].document.getElementById('span_CTLGERPESENDUF').innerHTML+";"; // uf
        dadosPessoal[n] = dadosPessoal[n] + parent.frames[0].document.getElementById('CTLGERPESCEP').value+";"; // cep
        txtareaDados.value = "extraindo informações de "+vetServidor[n];
        n=n+1;
        if(n < vetServidor.length){
            ifrIframe1.src = urlDadosIni+vetServidor[n]+urlDadosFim;
        }
        else{
            urlDadosIni = urlCTPSServIni;
            urlDadosFim = urlCTPSServFim;
            ifrIframe1.src = urlDadosIni+vetServidor[o]+urlDadosFim;
        }

    }
    if(n >= vetServidor.length){
        //DADOS DO CTPS
        dadosCTPS[o] = vetServidor[o] +";"; //Cod Servidor
        dadosCTPS[o] = dadosCTPS[o] + parent.frames[0].document.getElementById('CTLGRHSRVNMRCRTTRB').value +";"; //Nro Carteria Trab:
        dadosCTPS[o] = dadosCTPS[o] + parent.frames[0].document.getElementById('CTLGRHSRVSERCRTTRB').value +";"; //Serie Carteria Trab:
        let optUFCTPS = parent.frames[0].document.getElementById('CTLGRHSRVUFCRTTRB'); //Elemento option da UF da CTPS
        dadosCTPS[o] = dadosCTPS[o] + optUFCTPS[optUFCTPS.selectedIndex].innerText.trim()+";";//UF da CTPS selecionado
        dadosCTPS[o] = dadosCTPS[o] + parent.frames[0].document.getElementById('CTLGRHSRVNMRTITELE').value +";"; //Nro Título Eleitor:
        dadosCTPS[o] = dadosCTPS[o] + parent.frames[0].document.getElementById('CTLGRHSRVSECTITELE').value +";"; //Seção:
        dadosCTPS[o] = dadosCTPS[o] + parent.frames[0].document.getElementById('CTLGRHSRVZONTITELE').value +";"; //Zona:
        var optUFTITULO = parent.frames[0].document.getElementById('CTLGRHSRVUFTITELE'); //Elemento option da UF do Título
        dadosCTPS[o] = dadosCTPS[o] + optUFTITULO[optUFTITULO.selectedIndex].innerText.trim() +";";//UF do Título selecionado
        dadosCTPS[o] = dadosCTPS[o] + parent.frames[0].document.getElementById('span_CTLGRHSRVNMRPISPAS').innerText.trim() +";"; //PIS PASEP
        txtareaDados.value = "extraindo informações de "+vetServidor[o];
        o=o+1;
        if(o < vetServidor.length){
            ifrIframe1.src = urlDadosIni+vetServidor[o]+urlDadosFim;
        }
        else{
            txtareaDados.value = cabecalho1+cabecalho2+"\n";
            for(var j = 0; j < vetServidor.length;j++){
                txtareaDados.value = txtareaDados.value + dadosPessoal[j] + dadosCTPS[j] +"\n";
            }
            ifrIframe1.removeEventListener("load", coletaDados, false);
            alert('finalizado');
            ifrIframe1.src= urlListaServ;
        }
    }
}

//BOTÃO EXIBIR ou ESCONDER
var exibir = '$("#credito1").slideToggle();if(this.value=="ESCONDER"){this.value="EXIBIR"}else{this.value="ESCONDER"}';
var btnExibir = document.createElement('input');
    btnExibir.setAttribute('type','button');
    btnExibir.setAttribute('id','exibir1');
    btnExibir.setAttribute('value','ESCONDER');
    btnExibir.setAttribute('class','menuSCT');
    btnExibir.setAttribute('style','background:#FF3300; width: 187px; border: 1px solid rgb(0, 0, 0); position: fixed; z-index: 2002; bottom: 0px; right: 30px;');
    btnExibir.setAttribute('onmouseover', 'this.style.backgroundColor = "#FF7A00"');
    btnExibir.setAttribute('onmouseout', 'this.style.backgroundColor = "#FF3300"');
    btnExibir.setAttribute('onmousedown', 'this.style.backgroundColor = "#EB8038"');
    btnExibir.setAttribute('onmouseup', 'this.style.backgroundColor = "#FF7A00"');
    btnExibir.setAttribute('onclick', exibir);
document.getElementsByTagName('body')[0].appendChild(btnExibir);

//QUEBRA LINHA
var br1;

//DIV principal (corpo)
var divCorpo = document.createElement('div');
    divCorpo.setAttribute('id','credito1');
    divCorpo.setAttribute('name','credito2');
    divCorpo.setAttribute('class','menuSCT');
    divCorpo.setAttribute('style',' color: #000; width: 300px; text-align: center;font-weight: bold;position: fixed;z-index: 2002;padding: 5px 0px 0px 5px;bottom: 24px;right: 30px;height: 340px;');
document.getElementsByTagName('body')[0].appendChild(divCorpo);

//Iframe
var ifrIframe1 = document.createElement("iframe");
ifrIframe1.setAttribute("id","iframe1");
ifrIframe1.setAttribute("src","about:blank");
ifrIframe1.setAttribute("style","height: 100px; width: 355px;display:none");
divCorpo.appendChild(ifrIframe1);

//TEXTO Selecionar Tipo de Servidor
var textSelServ = document.createTextNode("Selecionar Tipo de Servidor");
divCorpo.appendChild(textSelServ);

br1 = document.createElement("br");//Quebra de linha
divCorpo.appendChild(br1); //Quebra de linha

var elemSelServ = document.createElement('select');
elemSelServ.setAttribute('id','selServ');
document.getElementById('credito1').appendChild(elemSelServ);

var comboServ = document.getElementById("selServ");
    var opt0 = document.createElement("option");
    opt0.value = "4";
    opt0.text = "APOIO ADM CONTRATO";
    comboServ.add(opt0, comboServ.options[0]);

    var opt1 = document.createElement("option");
    opt1.value = "3";
    opt1.text = "APOIO ADM EFETIVO";
    comboServ.add(opt1, comboServ.options[1]);

    var opt2 = document.createElement("option");
    opt2.value = "1";
    opt2.text = "PROFESSOR EFETIVO";
    comboServ.add(opt2, comboServ.options[2]);

    var opt3 = document.createElement("option");
    opt3.value = "2";
    opt3.text = "PROFESSOR CONTRATO";
    comboServ.add(opt3, comboServ.options[3]);

    var opt4 = document.createElement("option");
    opt4.value = "6";
    opt4.text = "TAE CONTRATO";
    comboServ.add(opt4, comboServ.options[4]);

    var opt5 = document.createElement("option");
    opt5.value = "5";
    opt5.text = "TAE EFETIVO";
    comboServ.add(opt5, comboServ.options[5]);

br1 = document.createElement("br");//Quebra de linha
divCorpo.appendChild(br1); //Quebra de linha

br1 = document.createElement("br");//Quebra de linha
divCorpo.appendChild(br1); //Quebra de linha

//BOTÃO COLETAR
var btnColetaFicha = document.createElement('input');
btnColetaFicha.setAttribute('type','button');
btnColetaFicha.setAttribute('name','btnColetaFicha');
btnColetaFicha.setAttribute('value','Extrair Pessoal');
btnColetaFicha.setAttribute('class','botaoSCT');
divCorpo.appendChild(btnColetaFicha);
btnColetaFicha.onclick = ()=>{urlDadosIni = urlFichaServIni; urlDadosFim = urlFichaServFim; iniciar()};

br1 = document.createElement("br");//Quebra de linha
divCorpo.appendChild(br1); //Quebra de linha

br1 = document.createElement("br");//Quebra de linha
divCorpo.appendChild(br1); //Quebra de linha

//TEXTO DADOS COLETADOS
var textColetados = document.createTextNode("DADOS COLETADOS");
divCorpo.appendChild(textColetados);

//textarea pra dados coletados
var txtareaDados = document.createElement('TEXTAREA');
txtareaDados.setAttribute('name','txtDados');
txtareaDados.setAttribute('id','txtDados');
txtareaDados.setAttribute('value','');
txtareaDados.setAttribute('style','border:1px solid #000000;width: 285px;height: 150px; resize: none');
txtareaDados.readOnly = true;
divCorpo.appendChild(txtareaDados);

//BOTAO SALVAR EM TXT
var btnSalvarTxt = document.createElement('input');
btnSalvarTxt.setAttribute('type','button');
btnSalvarTxt.setAttribute('name','btnSalvarTxt');
btnSalvarTxt.setAttribute('value','salvar em CSV (Excel)');
btnSalvarTxt.setAttribute('class','botaoSCT');
divCorpo.appendChild(btnSalvarTxt);
btnSalvarTxt.onclick = saveTextAsFile;

//DIV CREDITO
var divCredito = document.createElement('div');
divCorpo.appendChild(divCredito);

br1 = document.createElement("br");//Quebra de linha
divCorpo.appendChild(br1); //Quebra de linha

var span1 = document.createElement('span');
span1.innerHTML = '>>Roberson Arruda<<';
divCredito.appendChild(span1);

br1 = document.createElement('br');
span1.appendChild(br1);

span1 = document.createElement('span');
span1.innerHTML = '(robersonarruda@outlook.com)';
divCredito.appendChild(span1);

br1 = document.createElement('br');
span1.appendChild(br1);

span1 = document.createElement('span');
span1.innerHTML = 'Extrator informações GPE';
divCredito.appendChild(span1);

window.scrollTo(0, document.body.scrollHeight);
