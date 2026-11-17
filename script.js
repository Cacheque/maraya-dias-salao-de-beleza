/* =========================================================
   Mayara Dias - Hair Designer  |  script.js
   Navegação entre as telas do aplicativo.
   ========================================================= */

'use strict';

/* Ordem das telas, exatamente como no layout original.
   O botão PROSSEGUIR, as setas e o "voltar" seguem esta lista. */
const ORDEM_DAS_TELAS = ['home', 'portfolio', 'historia', 'horario', 'redes', 'faq', 'menu'];
const ID_DA_TELA_INICIAL = 'home';
const NOME_DO_SITE = 'Mayara Dias Hair Designer';

const telasDoAplicativo = document.querySelectorAll('.tela');


/* Descobre qual tela foi pedida pelo endereço (ex.: index.html#portfolio) */
function obterIdDaTelaPedida() {
  const idPedido = window.location.hash.slice(1);
  return ORDEM_DAS_TELAS.includes(idPedido) ? idPedido : ID_DA_TELA_INICIAL;
}


/* Aponta cada link rel="next" / rel="prev" para a tela vizinha na ordem */
function apontarLinksSequenciais() {
  ORDEM_DAS_TELAS.forEach((idDaTela, posicaoNaOrdem) => {
    const telaAtual = document.getElementById(idDaTela);
    if (!telaAtual) return;

    const idDaProximaTela = ORDEM_DAS_TELAS[posicaoNaOrdem + 1];
    const idDaTelaAnterior = ORDEM_DAS_TELAS[posicaoNaOrdem - 1];

    if (idDaProximaTela) {
      telaAtual.querySelectorAll('[rel~="next"]').forEach((linkParaProxima) => {
        linkParaProxima.setAttribute('href', `#${idDaProximaTela}`);
      });
    }

    if (idDaTelaAnterior) {
      telaAtual.querySelectorAll('[rel~="prev"]').forEach((linkParaAnterior) => {
        linkParaAnterior.setAttribute('href', `#${idDaTelaAnterior}`);
      });
    }
  });
}


/* Mostra somente a tela pedida e atualiza título da aba e foco */
function exibirTela(idDaTelaPedida, { moverFoco }) {
  telasDoAplicativo.forEach((tela) => {
    tela.hidden = tela.id !== idDaTelaPedida;
  });

  const telaExibida = document.getElementById(idDaTelaPedida);
  const tituloDaPagina = telaExibida.dataset.tituloDaPagina;
  document.title = `${tituloDaPagina} - ${NOME_DO_SITE}`;

  window.scrollTo(0, 0);

  /* Leitores de tela passam a ler a nova tela quando o foco muda para ela */
  if (moverFoco) {
    telaExibida.focus({ preventScroll: true });
  }
}


/* Relógio da barra de status: mostra a hora real do aparelho (ex.: 9:41 ou 14:05) */
const relogiosDaBarraDeStatus = document.querySelectorAll('.barra-status__hora');
const MILISSEGUNDOS_EM_UM_MINUTO = 60 * 1000;

function atualizarRelogioDaBarraDeStatus() {
  const agora = new Date();
  const horas = agora.getHours();
  const minutos = String(agora.getMinutes()).padStart(2, '0');

  relogiosDaBarraDeStatus.forEach((relogio) => {
    relogio.textContent = `${horas}:${minutos}`;
    relogio.setAttribute('datetime', `${String(horas).padStart(2, '0')}:${minutos}`);
  });
}

function manterRelogioAtualizado() {
  atualizarRelogioDaBarraDeStatus();

  /* Espera até a virada do minuto e, a partir dela, atualiza a cada minuto */
  const milissegundosAteOProximoMinuto =
    MILISSEGUNDOS_EM_UM_MINUTO - (Date.now() % MILISSEGUNDOS_EM_UM_MINUTO);

  setTimeout(() => {
    atualizarRelogioDaBarraDeStatus();
    setInterval(atualizarRelogioDaBarraDeStatus, MILISSEGUNDOS_EM_UM_MINUTO);
  }, milissegundosAteOProximoMinuto);
}


/* ---------------------------------------------------------
   Bateria, Wi-Fi e sinal de rede da barra de status
   Mostram a situação real do aparelho quando o navegador informa.
   --------------------------------------------------------- */
const LARGURA_TOTAL_DA_CARGA = 12;
const COR_BATERIA_NORMAL = '#000';
const COR_BATERIA_CARREGANDO = '#2a9d3f';
const COR_BATERIA_BAIXA = '#d62828';
const NIVEL_DE_BATERIA_BAIXO = 0.2;
const OPACIDADE_ICONE_APAGADO = 0.25;

const cargasDaBateria = document.querySelectorAll('.barra-status__bateria-carga');
const barrasDeSinal = document.querySelectorAll('.barra-status__sinal-de-rede');
const iconesDeWifi = document.querySelectorAll('.barra-status__wifi');

/* Nem todo navegador tem esta informação (Chrome e Edge têm; Safari e Firefox não) */
const informacoesDaConexao =
  navigator.connection || navigator.mozConnection || navigator.webkitConnection;


/* ----- Bateria ----- */
function atualizarBateria(bateria) {
  const nivelDaCarga = Math.max(bateria.level, 0.05);
  const larguraDaCarga = (LARGURA_TOTAL_DA_CARGA * nivelDaCarga).toFixed(2);

  let corDaCarga = COR_BATERIA_NORMAL;
  if (bateria.charging) {
    corDaCarga = COR_BATERIA_CARREGANDO;
  } else if (bateria.level <= NIVEL_DE_BATERIA_BAIXO) {
    corDaCarga = COR_BATERIA_BAIXA;
  }

  cargasDaBateria.forEach((cargaDaBateria) => {
    cargaDaBateria.setAttribute('width', larguraDaCarga);
    cargaDaBateria.setAttribute('fill', corDaCarga);
  });
}

function acompanharBateria() {
  if (typeof navigator.getBattery !== 'function') return;

  navigator.getBattery().then((bateria) => {
    atualizarBateria(bateria);
    bateria.addEventListener('levelchange', () => atualizarBateria(bateria));
    bateria.addEventListener('chargingchange', () => atualizarBateria(bateria));
  });
}


/* ----- Sinal de rede (quantidade de barras, de 0 a 4) ----- */
function calcularQuantidadeDeBarrasDeSinal() {
  if (!navigator.onLine) return 0;

  switch (informacoesDaConexao && informacoesDaConexao.effectiveType) {
    case 'slow-2g': return 1;
    case '2g':      return 2;
    case '3g':      return 3;
    default:        return 4;
  }
}

function atualizarSinalDeRede() {
  const barrasAcesas = calcularQuantidadeDeBarrasDeSinal();

  barrasDeSinal.forEach((grupoDeBarras) => {
    grupoDeBarras.querySelectorAll('.barra-status__barra-de-sinal').forEach((barra, posicao) => {
      barra.setAttribute('opacity', posicao < barrasAcesas ? 1 : OPACIDADE_ICONE_APAGADO);
    });
  });
}


/* ----- Wi-Fi (aceso só quando há internet e a conexão não é de celular) ----- */
function estaConectadoAoWifi() {
  if (!navigator.onLine) return false;
  return !(informacoesDaConexao && informacoesDaConexao.type === 'cellular');
}

function atualizarWifi() {
  const opacidadeDoWifi = estaConectadoAoWifi() ? 1 : OPACIDADE_ICONE_APAGADO;
  iconesDeWifi.forEach((iconeDeWifi) => {
    iconeDeWifi.setAttribute('opacity', opacidadeDoWifi);
  });
}


function atualizarSituacaoDaConexao() {
  atualizarSinalDeRede();
  atualizarWifi();
}

function acompanharConexao() {
  atualizarSituacaoDaConexao();
  window.addEventListener('online', atualizarSituacaoDaConexao);
  window.addEventListener('offline', atualizarSituacaoDaConexao);
  if (informacoesDaConexao) {
    informacoesDaConexao.addEventListener('change', atualizarSituacaoDaConexao);
  }
}


function iniciarNavegacao() {
  apontarLinksSequenciais();
  exibirTela(obterIdDaTelaPedida(), { moverFoco: false });

  window.addEventListener('hashchange', () => {
    exibirTela(obterIdDaTelaPedida(), { moverFoco: true });
  });
}

iniciarNavegacao();
manterRelogioAtualizado();
acompanharBateria();
acompanharConexao();


/* ---------------------------------------------------------
   Responsividade: ajusta o tamanho do aplicativo à tela do aparelho.
   O design tem 352px de largura; a escala amplia ou reduz tudo por igual.
   --------------------------------------------------------- */
const LARGURA_BASE_DO_DESIGN = 352;
const ALTURA_BASE_DO_DESIGN = 764;
const ALTURA_MINIMA_DA_TELA = 760;
const LARGURA_MAXIMA_DE_CELULAR = 600;
const MARGEM_LATERAL_NO_COMPUTADOR = 24;
const ESCALA_MAXIMA_NO_COMPUTADOR = 1.6;
const ESCALA_MAXIMA_NO_TABLET_EM_PE = 1.8;

function calcularEscala(larguraDisponivel, alturaDisponivel) {
  /* Celular: preenche a largura inteira do aparelho (de 320px até 600px) */
  if (larguraDisponivel <= LARGURA_MAXIMA_DE_CELULAR) {
    return larguraDisponivel / LARGURA_BASE_DO_DESIGN;
  }

  /* Tablet e computador: a moldura cresce, mas nunca passa da largura da janela */
  const escalaQueCabeNaLargura =
    (larguraDisponivel - MARGEM_LATERAL_NO_COMPUTADOR) / LARGURA_BASE_DO_DESIGN;
  const estaEmPe = alturaDisponivel > larguraDisponivel;

  /* Tablet em pé: usa a largura. Computador e tablet deitado: usa a altura. */
  const escalaDesejada = estaEmPe
    ? escalaQueCabeNaLargura
    : alturaDisponivel / ALTURA_BASE_DO_DESIGN;
  const escalaMaxima = estaEmPe ? ESCALA_MAXIMA_NO_TABLET_EM_PE : ESCALA_MAXIMA_NO_COMPUTADOR;

  return Math.min(Math.max(escalaDesejada, 1), escalaQueCabeNaLargura, escalaMaxima);
}

function ajustarEscalaDoAplicativo() {
  const larguraDisponivel = document.documentElement.clientWidth;
  const alturaDisponivel = window.innerHeight;
  const escala = calcularEscala(larguraDisponivel, alturaDisponivel);
  const ehCelular = larguraDisponivel <= LARGURA_MAXIMA_DE_CELULAR;

  /* Em celulares mais compridos que o design, a tela se estica até o fim do
     aparelho (a barra rosa "Menu" fica sempre colada embaixo). */
  const alturaDaTela = ehCelular
    ? Math.max(ALTURA_MINIMA_DA_TELA, Math.ceil(alturaDisponivel / escala))
    : ALTURA_MINIMA_DA_TELA;

  const raiz = document.documentElement.style;
  raiz.setProperty('--escala', escala.toFixed(3));
  raiz.setProperty('--altura-minima-da-tela', `${alturaDaTela}px`);
}

ajustarEscalaDoAplicativo();
window.addEventListener('resize', ajustarEscalaDoAplicativo);
window.addEventListener('orientationchange', ajustarEscalaDoAplicativo);
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', ajustarEscalaDoAplicativo);
}
