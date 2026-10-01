const formProjeto =
  document.querySelector("#form-projeto");

const campoNomeProjeto =
  document.querySelector("#nome-projeto");

const campoDescricaoProjeto =
  document.querySelector("#descricao-projeto");

const botaoAtualizar =
  document.querySelector("#botao-atualizar");

const campoBusca =
  document.querySelector("#campo-busca");

const botaoLimparBusca =
  document.querySelector(
    "#botao-limpar-busca"
  );

const resultadoBusca =
  document.querySelector(
    "#resultado-busca"
  );

const listaProjetos =
  document.querySelector("#lista-projetos");

const mensagem =
  document.querySelector("#mensagem");

const resumoProjetos =
  document.querySelector("#resumo-projetos");

const resumoTarefas =
  document.querySelector("#resumo-tarefas");

const resumoPendentes =
  document.querySelector("#resumo-pendentes");

const resumoConcluidas =
  document.querySelector("#resumo-concluidas");

const modalEdicao =
  document.querySelector("#modal-edicao");

const tituloModalEdicao =
  document.querySelector(
    "#titulo-modal-edicao"
  );

const formEdicao =
  document.querySelector("#form-edicao");

const grupoEdicaoProjeto =
  document.querySelector(
    "#grupo-edicao-projeto"
  );

const grupoEdicaoTarefa =
  document.querySelector(
    "#grupo-edicao-tarefa"
  );

const campoEdicaoNomeProjeto =
  document.querySelector(
    "#edicao-nome-projeto"
  );

const campoEdicaoDescricaoProjeto =
  document.querySelector(
    "#edicao-descricao-projeto"
  );

const campoEdicaoTituloTarefa =
  document.querySelector(
    "#edicao-titulo-tarefa"
  );

const botaoFecharEdicao =
  document.querySelector(
    "#botao-fechar-edicao"
  );

const botaoCancelarEdicao =
  document.querySelector(
    "#botao-cancelar-edicao"
  );

const botaoSalvarEdicao =
  document.querySelector(
    "#botao-salvar-edicao"
  );

const modalConfirmacao =
  document.querySelector(
    "#modal-confirmacao"
  );

const textoConfirmacao =
  document.querySelector(
    "#texto-confirmacao"
  );

const botaoFecharConfirmacao =
  document.querySelector(
    "#botao-fechar-confirmacao"
  );

const botaoCancelarConfirmacao =
  document.querySelector(
    "#botao-cancelar-confirmacao"
  );

const botaoConfirmarExclusao =
  document.querySelector(
    "#botao-confirmar-exclusao"
  );

let itemEmEdicao = null;
let itemParaExcluir = null;
let temporizadorMensagem = null;
let projetosCarregados = [];

const filtrosTarefas =
  new Map();

function definirCarregamentoBotao(
  botao,
  carregando,
  textoCarregando
) {
  if (!botao) {
    return;
  }

  if (carregando) {
    botao.dataset.textoOriginal =
      botao.textContent;

    botao.textContent =
      textoCarregando;

    botao.disabled = true;

    return;
  }

  const textoOriginal =
    botao.dataset.textoOriginal;

  if (textoOriginal) {
    botao.textContent =
      textoOriginal;

    delete botao.dataset.textoOriginal;
  }

  botao.disabled = false;
}

function mostrarMensagem(
  texto,
  tipo = "sucesso"
) {
  if (temporizadorMensagem) {
    clearTimeout(
      temporizadorMensagem
    );
  }

  mensagem.textContent = texto;

  mensagem.className =
    `mensagem visivel ${tipo}`;

  temporizadorMensagem =
    setTimeout(
      () => {
        limparMensagem();
      },
      3500
    );
}

function limparMensagem() {
  if (temporizadorMensagem) {
    clearTimeout(
      temporizadorMensagem
    );

    temporizadorMensagem = null;
  }

  mensagem.textContent = "";
  mensagem.className = "mensagem";
}

async function requisicao(
  endereco,
  opcoes = {}
) {
  const configuracao = {
    ...opcoes,
    headers: {
      ...(opcoes.body
        ? {
            "Content-Type":
              "application/json"
          }
        : {}),
      ...(opcoes.headers || {})
    }
  };

  const resposta =
    await fetch(
      endereco,
      configuracao
    );

  let dados = null;

  const tipoConteudo =
    resposta.headers.get(
      "content-type"
    );

  if (
    tipoConteudo &&
    tipoConteudo.includes(
      "application/json"
    )
  ) {
    dados = await resposta.json();
  }

  if (!resposta.ok) {
    const textoErro =
      dados?.erro ||
      "Ocorreu um erro inesperado.";

    throw new Error(textoErro);
  }

  return dados;
}

function criarBotao(
  texto,
  classes,
  aoClicar
) {
  const botao =
    document.createElement("button");

  botao.type = "button";
  botao.textContent = texto;

  botao.className =
    `botao botao-pequeno ${classes}`;

  botao.addEventListener(
    "click",
    aoClicar
  );

  return botao;
}

function normalizarTexto(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim();
}

function projetoCorrespondeBusca(
  projeto,
  termo
) {
  const nome =
    normalizarTexto(
      projeto.nome
    );

  const descricao =
    normalizarTexto(
      projeto.descricao
    );

  if (
    nome.includes(termo) ||
    descricao.includes(termo)
  ) {
    return true;
  }

  const tarefas =
    Array.isArray(projeto.tarefas)
      ? projeto.tarefas
      : [];

  return tarefas.some(
    tarefa =>
      normalizarTexto(
        tarefa.titulo
      ).includes(termo)
  );
}

function contarTarefasCorrespondentes(
  projetos,
  termo
) {
  let total = 0;

  for (const projeto of projetos) {
    const tarefas =
      Array.isArray(projeto.tarefas)
        ? projeto.tarefas
        : [];

    total += tarefas.filter(
      tarefa =>
        normalizarTexto(
          tarefa.titulo
        ).includes(termo)
    ).length;
  }

  return total;
}

function atualizarResultadoBusca(
  projetosEncontrados,
  tarefasEncontradas,
  termo
) {
  if (!termo) {
    resultadoBusca.textContent = "";
    return;
  }

  if (
    projetosEncontrados === 0
  ) {
    resultadoBusca.textContent =
      "Nenhum projeto ou tarefa encontrado.";

    return;
  }

  const textoProjetos =
    projetosEncontrados === 1
      ? "1 projeto encontrado"
      : `${projetosEncontrados} projetos encontrados`;

  const textoTarefas =
    tarefasEncontradas === 1
      ? "1 tarefa correspondente"
      : `${tarefasEncontradas} tarefas correspondentes`;

  resultadoBusca.textContent =
    `${textoProjetos} • ${textoTarefas}`;
}

function aplicarBusca() {
  const termo =
    normalizarTexto(
      campoBusca.value
    );

  if (!termo) {
    resultadoBusca.textContent = "";

    renderizarProjetos(
      projetosCarregados
    );

    return;
  }

  const projetosFiltrados =
    projetosCarregados.filter(
      projeto =>
        projetoCorrespondeBusca(
          projeto,
          termo
        )
    );

  const tarefasEncontradas =
    contarTarefasCorrespondentes(
      projetosFiltrados,
      termo
    );

  atualizarResultadoBusca(
    projetosFiltrados.length,
    tarefasEncontradas,
    termo
  );

  renderizarProjetos(
    projetosFiltrados,
    true
  );
}

function atualizarResumoGeral(
  projetos
) {
  const lista =
    Array.isArray(projetos)
      ? projetos
      : [];

  const totalProjetos =
    lista.length;

  let totalTarefas = 0;
  let totalConcluidas = 0;

  for (const projeto of lista) {
    const tarefas =
      Array.isArray(projeto.tarefas)
        ? projeto.tarefas
        : [];

    totalTarefas +=
      tarefas.length;

    totalConcluidas +=
      tarefas.filter(
        tarefa =>
          tarefa.concluida
      ).length;
  }

  const totalPendentes =
    totalTarefas -
    totalConcluidas;

  resumoProjetos.textContent =
    String(totalProjetos);

  resumoTarefas.textContent =
    String(totalTarefas);

  resumoPendentes.textContent =
    String(totalPendentes);

  resumoConcluidas.textContent =
    String(totalConcluidas);
}

async function carregarProjetos() {
  listaProjetos.innerHTML = "";

  const carregando =
    document.createElement("p");

  carregando.className =
    "estado-vazio";

  carregando.textContent =
    "Carregando projetos...";

  listaProjetos.appendChild(
    carregando
  );

  try {
    const projetos =
      await requisicao(
        "/projetos"
      );

    projetosCarregados =
      Array.isArray(projetos)
        ? projetos
        : [];

    atualizarResumoGeral(
      projetosCarregados
    );

    aplicarBusca();
  } catch (erro) {
    projetosCarregados = [];

    atualizarResumoGeral([]);

    resultadoBusca.textContent = "";

    listaProjetos.innerHTML = "";

    const aviso =
      document.createElement("p");

    aviso.className =
      "estado-vazio";

    aviso.textContent =
      "Não foi possível carregar os projetos.";

    listaProjetos.appendChild(
      aviso
    );

    mostrarMensagem(
      erro.message,
      "erro"
    );
  }
}

function renderizarProjetos(
  projetos,
  buscaAtiva = false
) {
  listaProjetos.innerHTML = "";

  if (
    !Array.isArray(projetos) ||
    projetos.length === 0
  ) {
    const vazio =
      document.createElement("p");

    vazio.className =
      "estado-vazio";

    vazio.textContent =
      buscaAtiva
        ? "Nenhum projeto ou tarefa corresponde à busca."
        : "Nenhum projeto cadastrado.";

    listaProjetos.appendChild(
      vazio
    );

    return;
  }

  for (const projeto of projetos) {
    const elementoProjeto =
      criarElementoProjeto(
        projeto
      );

    listaProjetos.appendChild(
      elementoProjeto
    );
  }
}

function criarElementoProjeto(
  projeto
) {
  const artigo =
    document.createElement("article");

  artigo.className = "projeto";

  const cabecalho =
    document.createElement("div");

  cabecalho.className =
    "projeto-cabecalho";

  const informacoes =
    document.createElement("div");

  const titulo =
    document.createElement("h3");

  titulo.textContent =
    projeto.nome;

  const descricao =
    document.createElement("p");

  descricao.className =
    "projeto-descricao";

  descricao.textContent =
    projeto.descricao ||
    "Sem descrição.";

  informacoes.append(
    titulo,
    descricao
  );

  const acoes =
    document.createElement("div");

  acoes.className = "acoes";

  const botaoEditar =
    criarBotao(
      "Editar",
      "botao-editar",
      () =>
        abrirEdicaoProjeto(
          projeto
        )
    );

  const botaoExcluir =
    criarBotao(
      "Excluir",
      "botao-excluir",
      () =>
        abrirConfirmacaoProjeto(
          projeto
        )
    );

  acoes.append(
    botaoEditar,
    botaoExcluir
  );

  cabecalho.append(
    informacoes,
    acoes
  );

  artigo.appendChild(
    cabecalho
  );

  artigo.appendChild(
    criarResumoProgresso(
      projeto
    )
  );

  const areaTarefas =
    criarAreaTarefas(
      projeto
    );

  artigo.appendChild(
    areaTarefas
  );

  return artigo;
}

function criarResumoProgresso(
  projeto
) {
  const tarefas =
    Array.isArray(projeto.tarefas)
      ? projeto.tarefas
      : [];

  const total =
    tarefas.length;

  const concluidas =
    tarefas.filter(
      tarefa =>
        tarefa.concluida
    ).length;

  const percentual =
    total === 0
      ? 0
      : Math.round(
          (concluidas / total) * 100
        );

  const resumo =
    document.createElement("div");

  resumo.className =
    "progresso-projeto";

  const cabecalho =
    document.createElement("div");

  cabecalho.className =
    "progresso-cabecalho";

  const texto =
    document.createElement("span");

  texto.className =
    "progresso-texto";

  const palavraTarefa =
    total === 1
      ? "tarefa"
      : "tarefas";

  const palavraConcluida =
    total === 1
      ? "concluída"
      : "concluídas";

  texto.textContent =
    `${concluidas} de ${total} ${palavraTarefa} ${palavraConcluida}`;

  const numero =
    document.createElement("strong");

  numero.className =
    "progresso-percentual";

  numero.textContent =
    `${percentual}%`;

  cabecalho.append(
    texto,
    numero
  );

  const barra =
    document.createElement("div");

  barra.className =
    "progresso-barra";

  barra.setAttribute(
    "role",
    "progressbar"
  );

  barra.setAttribute(
    "aria-valuemin",
    "0"
  );

  barra.setAttribute(
    "aria-valuemax",
    "100"
  );

  barra.setAttribute(
    "aria-valuenow",
    String(percentual)
  );

  barra.setAttribute(
    "aria-label",
    `Progresso do projeto: ${percentual}%`
  );

  const preenchimento =
    document.createElement("div");

  preenchimento.className =
    "progresso-preenchimento";

  preenchimento.style.width =
    `${percentual}%`;

  barra.appendChild(
    preenchimento
  );

  resumo.append(
    cabecalho,
    barra
  );

  return resumo;
}

function criarAreaTarefas(
  projeto
) {
  const area =
    document.createElement("div");

  area.className = "tarefas";

  const tarefas =
    Array.isArray(projeto.tarefas)
      ? projeto.tarefas
      : [];

  const total =
    tarefas.length;

  const concluidas =
    tarefas.filter(
      tarefa =>
        tarefa.concluida
    ).length;

  const pendentes =
    total - concluidas;

  let filtroAtual =
    filtrosTarefas.get(
      projeto.id
    ) || "todas";

  const cabecalho =
    document.createElement("div");

  cabecalho.className =
    "tarefas-cabecalho";

  const titulo =
    document.createElement("h4");

  titulo.textContent = "Tarefas";

  const filtros =
    document.createElement("div");

  filtros.className =
    "filtros-tarefas";

  const lista =
    document.createElement("div");

  lista.className =
    "lista-tarefas";

  const botoesFiltro =
    new Map();

  const opcoesFiltro = [
    {
      id: "todas",
      texto: `Todas (${total})`
    },
    {
      id: "pendentes",
      texto: `Pendentes (${pendentes})`
    },
    {
      id: "concluidas",
      texto: `Concluídas (${concluidas})`
    }
  ];

  function atualizarBotoesFiltro() {
    for (
      const [
        id,
        botao
      ]
      of botoesFiltro
    ) {
      botao.classList.toggle(
        "ativo",
        id === filtroAtual
      );

      botao.setAttribute(
        "aria-pressed",
        String(
          id === filtroAtual
        )
      );
    }
  }

  function obterTarefasFiltradas() {
    if (
      filtroAtual ===
      "pendentes"
    ) {
      return tarefas.filter(
        tarefa =>
          !tarefa.concluida
      );
    }

    if (
      filtroAtual ===
      "concluidas"
    ) {
      return tarefas.filter(
        tarefa =>
          tarefa.concluida
      );
    }

    return tarefas;
  }

  function renderizarLista() {
    lista.innerHTML = "";

    const tarefasVisiveis =
      obterTarefasFiltradas();

    if (
      tarefasVisiveis.length === 0
    ) {
      const vazio =
        document.createElement("p");

      vazio.className =
        "estado-vazio";

      if (
        filtroAtual ===
        "pendentes"
      ) {
        vazio.textContent =
          "Nenhuma tarefa pendente.";
      } else if (
        filtroAtual ===
        "concluidas"
      ) {
        vazio.textContent =
          "Nenhuma tarefa concluída.";
      } else {
        vazio.textContent =
          "Nenhuma tarefa cadastrada.";
      }

      lista.appendChild(
        vazio
      );

      return;
    }

    for (
      const tarefa
      of tarefasVisiveis
    ) {
      lista.appendChild(
        criarElementoTarefa(
          tarefa
        )
      );
    }
  }

  for (
    const opcao
    of opcoesFiltro
  ) {
    const botao =
      document.createElement(
        "button"
      );

    botao.type = "button";

    botao.className =
      "filtro-tarefa";

    botao.textContent =
      opcao.texto;

    botao.addEventListener(
      "click",
      () => {
        filtroAtual =
          opcao.id;

        filtrosTarefas.set(
          projeto.id,
          filtroAtual
        );

        atualizarBotoesFiltro();
        renderizarLista();
      }
    );

    botoesFiltro.set(
      opcao.id,
      botao
    );

    filtros.appendChild(
      botao
    );
  }

  atualizarBotoesFiltro();

  cabecalho.append(
    titulo,
    filtros
  );

  area.append(
    cabecalho,
    lista
  );

  renderizarLista();

  const formulario =
    document.createElement("form");

  formulario.className =
    "form-tarefa";

  const campo =
    document.createElement("input");

  campo.type = "text";

  campo.placeholder =
    "Nova tarefa";

  campo.required = true;

  const botao =
    document.createElement("button");

  botao.type = "submit";

  botao.className =
    "botao botao-primario botao-pequeno";

  botao.textContent =
    "Adicionar";

  formulario.append(
    campo,
    botao
  );

  formulario.addEventListener(
    "submit",
    async evento => {
      evento.preventDefault();

      filtrosTarefas.set(
        projeto.id,
        "todas"
      );

      const sucesso =
        await adicionarTarefa(
          projeto.id,
          campo.value,
          botao
        );

      if (sucesso) {
        campo.value = "";
      }
    }
  );

  area.appendChild(
    formulario
  );

  return area;
}

function criarElementoTarefa(
  tarefa
) {
  const elemento =
    document.createElement("div");

  elemento.className =
    "tarefa";

  if (tarefa.concluida) {
    elemento.classList.add(
      "tarefa-concluida"
    );
  }

  const titulo =
    document.createElement("span");

  titulo.className =
    "titulo-tarefa";

  titulo.textContent =
    tarefa.titulo;

  const acoes =
    document.createElement("div");

  acoes.className = "acoes";

  if (!tarefa.concluida) {
    const botaoConcluir =
      criarBotao(
        "Concluir",
        "botao-editar",
        () =>
          concluirTarefa(
            tarefa,
            botaoConcluir
          )
      );

    acoes.appendChild(
      botaoConcluir
    );
  }

  const botaoEditar =
    criarBotao(
      "Editar",
      "botao-editar",
      () =>
        abrirEdicaoTarefa(
          tarefa
        )
    );

  const botaoExcluir =
    criarBotao(
      "Excluir",
      "botao-excluir",
      () =>
        abrirConfirmacaoTarefa(
          tarefa
        )
    );

  acoes.append(
    botaoEditar,
    botaoExcluir
  );

  elemento.append(
    titulo,
    acoes
  );

  return elemento;
}

function abrirEdicaoProjeto(
  projeto
) {
  itemEmEdicao = {
    tipo: "projeto",
    id: projeto.id
  };

  tituloModalEdicao.textContent =
    "Editar projeto";

  grupoEdicaoProjeto.classList.remove(
    "oculto"
  );

  grupoEdicaoTarefa.classList.add(
    "oculto"
  );

  campoEdicaoNomeProjeto.value =
    projeto.nome;

  campoEdicaoDescricaoProjeto.value =
    projeto.descricao || "";

  modalEdicao.showModal();

  campoEdicaoNomeProjeto.focus();
}

function abrirEdicaoTarefa(
  tarefa
) {
  itemEmEdicao = {
    tipo: "tarefa",
    id: tarefa.id
  };

  tituloModalEdicao.textContent =
    "Editar tarefa";

  grupoEdicaoProjeto.classList.add(
    "oculto"
  );

  grupoEdicaoTarefa.classList.remove(
    "oculto"
  );

  campoEdicaoTituloTarefa.value =
    tarefa.titulo;

  modalEdicao.showModal();

  campoEdicaoTituloTarefa.focus();
}

function fecharEdicao() {
  if (modalEdicao.open) {
    modalEdicao.close();
  }
}

async function salvarEdicao(
  evento
) {
  evento.preventDefault();

  if (!itemEmEdicao) {
    return;
  }

  definirCarregamentoBotao(
    botaoSalvarEdicao,
    true,
    "Salvando..."
  );

  try {
    if (
      itemEmEdicao.tipo ===
      "projeto"
    ) {
      const nome =
        campoEdicaoNomeProjeto
          .value
          .trim();

      const descricao =
        campoEdicaoDescricaoProjeto
          .value
          .trim();

      if (!nome) {
        mostrarMensagem(
          "O nome do projeto não pode ficar vazio.",
          "erro"
        );

        campoEdicaoNomeProjeto.focus();

        return;
      }

      await requisicao(
        `/projetos/${itemEmEdicao.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            nome,
            descricao
          })
        }
      );

      fecharEdicao();

      await carregarProjetos();

      mostrarMensagem(
        "Projeto editado com sucesso."
      );

      return;
    }

    const titulo =
      campoEdicaoTituloTarefa
        .value
        .trim();

    if (!titulo) {
      mostrarMensagem(
        "O título da tarefa não pode ficar vazio.",
        "erro"
      );

      campoEdicaoTituloTarefa.focus();

      return;
    }

    await requisicao(
      `/tarefas/${itemEmEdicao.id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          titulo
        })
      }
    );

    fecharEdicao();

    await carregarProjetos();

    mostrarMensagem(
      "Tarefa editada com sucesso."
    );
  } catch (erro) {
    mostrarMensagem(
      erro.message,
      "erro"
    );
  } finally {
    definirCarregamentoBotao(
      botaoSalvarEdicao,
      false
    );
  }
}

function abrirConfirmacaoProjeto(
  projeto
) {
  itemParaExcluir = {
    tipo: "projeto",
    id: projeto.id
  };

  textoConfirmacao.textContent =
    `Tem certeza de que deseja excluir o projeto "${projeto.nome}"?`;

  modalConfirmacao.showModal();

  botaoConfirmarExclusao.focus();
}

function abrirConfirmacaoTarefa(
  tarefa
) {
  itemParaExcluir = {
    tipo: "tarefa",
    id: tarefa.id
  };

  textoConfirmacao.textContent =
    `Tem certeza de que deseja excluir a tarefa "${tarefa.titulo}"?`;

  modalConfirmacao.showModal();

  botaoConfirmarExclusao.focus();
}

function fecharConfirmacao() {
  if (modalConfirmacao.open) {
    modalConfirmacao.close();
  }
}

async function confirmarExclusao() {
  if (!itemParaExcluir) {
    return;
  }

  definirCarregamentoBotao(
    botaoConfirmarExclusao,
    true,
    "Excluindo..."
  );

  try {
    if (
      itemParaExcluir.tipo ===
      "projeto"
    ) {
      await requisicao(
        `/projetos/${itemParaExcluir.id}`,
        {
          method: "DELETE"
        }
      );

      fecharConfirmacao();

      await carregarProjetos();

      mostrarMensagem(
        "Projeto excluído com sucesso."
      );

      return;
    }

    await requisicao(
      `/tarefas/${itemParaExcluir.id}`,
      {
        method: "DELETE"
      }
    );

    fecharConfirmacao();

    await carregarProjetos();

    mostrarMensagem(
      "Tarefa excluída com sucesso."
    );
  } catch (erro) {
    mostrarMensagem(
      erro.message,
      "erro"
    );
  } finally {
    definirCarregamentoBotao(
      botaoConfirmarExclusao,
      false
    );
  }
}

async function criarProjeto(
  evento
) {
  evento.preventDefault();

  limparMensagem();

  const botao =
    formProjeto.querySelector(
      'button[type="submit"]'
    );

  const nome =
    campoNomeProjeto
      .value
      .trim();

  const descricao =
    campoDescricaoProjeto
      .value
      .trim();

  if (!nome) {
    mostrarMensagem(
      "Informe o nome do projeto.",
      "erro"
    );

    return;
  }

  definirCarregamentoBotao(
    botao,
    true,
    "Criando..."
  );

  try {
    await requisicao(
      "/projetos",
      {
        method: "POST",
        body: JSON.stringify({
          nome,
          descricao
        })
      }
    );

    formProjeto.reset();

    await carregarProjetos();

    mostrarMensagem(
      "Projeto criado com sucesso."
    );
  } catch (erro) {
    mostrarMensagem(
      erro.message,
      "erro"
    );
  } finally {
    definirCarregamentoBotao(
      botao,
      false
    );
  }
}

async function adicionarTarefa(
  projetoId,
  titulo,
  botao
) {
  limparMensagem();

  const tituloLimpo =
    titulo.trim();

  if (!tituloLimpo) {
    mostrarMensagem(
      "Informe o título da tarefa.",
      "erro"
    );

    return false;
  }

  definirCarregamentoBotao(
    botao,
    true,
    "Adicionando..."
  );

  try {
    await requisicao(
      `/projetos/${projetoId}/tarefas`,
      {
        method: "POST",
        body: JSON.stringify({
          titulo:
            tituloLimpo
        })
      }
    );

    await carregarProjetos();

    mostrarMensagem(
      "Tarefa criada com sucesso."
    );

    return true;
  } catch (erro) {
    mostrarMensagem(
      erro.message,
      "erro"
    );

    return false;
  } finally {
    definirCarregamentoBotao(
      botao,
      false
    );
  }
}

async function concluirTarefa(
  tarefa,
  botao
) {
  limparMensagem();

  definirCarregamentoBotao(
    botao,
    true,
    "Concluindo..."
  );

  try {
    await requisicao(
      `/tarefas/${tarefa.id}/concluir`,
      {
        method: "PATCH"
      }
    );

    await carregarProjetos();

    mostrarMensagem(
      "Tarefa concluída com sucesso."
    );
  } catch (erro) {
    mostrarMensagem(
      erro.message,
      "erro"
    );

    definirCarregamentoBotao(
      botao,
      false
    );
  }
}

formProjeto.addEventListener(
  "submit",
  criarProjeto
);

campoBusca.addEventListener(
  "input",
  () => {
    filtrosTarefas.clear();
    aplicarBusca();
  }
);

botaoLimparBusca.addEventListener(
  "click",
  () => {
    campoBusca.value = "";

    resultadoBusca.textContent = "";

    filtrosTarefas.clear();

    renderizarProjetos(
      projetosCarregados
    );

    campoBusca.focus();
  }
);

botaoAtualizar.addEventListener(
  "click",
  async () => {
    limparMensagem();

    definirCarregamentoBotao(
      botaoAtualizar,
      true,
      "Atualizando..."
    );

    try {
      await carregarProjetos();
    } finally {
      definirCarregamentoBotao(
        botaoAtualizar,
        false
      );
    }
  }
);

formEdicao.addEventListener(
  "submit",
  salvarEdicao
);

botaoFecharEdicao.addEventListener(
  "click",
  fecharEdicao
);

botaoCancelarEdicao.addEventListener(
  "click",
  fecharEdicao
);

botaoConfirmarExclusao.addEventListener(
  "click",
  confirmarExclusao
);

botaoFecharConfirmacao.addEventListener(
  "click",
  fecharConfirmacao
);

botaoCancelarConfirmacao.addEventListener(
  "click",
  fecharConfirmacao
);

modalEdicao.addEventListener(
  "close",
  () => {
    itemEmEdicao = null;
    formEdicao.reset();
  }
);

modalConfirmacao.addEventListener(
  "close",
  () => {
    itemParaExcluir = null;

    textoConfirmacao.textContent =
      "Tem certeza de que deseja excluir este item?";
  }
);

modalEdicao.addEventListener(
  "click",
  evento => {
    if (
      evento.target ===
      modalEdicao
    ) {
      fecharEdicao();
    }
  }
);

modalConfirmacao.addEventListener(
  "click",
  evento => {
    if (
      evento.target ===
      modalConfirmacao
    ) {
      fecharConfirmacao();
    }
  }
);

carregarProjetos();