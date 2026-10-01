const formProjeto =
  document.querySelector("#form-projeto");

const campoNomeProjeto =
  document.querySelector("#nome-projeto");

const campoDescricaoProjeto =
  document.querySelector("#descricao-projeto");

const botaoAtualizar =
  document.querySelector("#botao-atualizar");

const listaProjetos =
  document.querySelector("#lista-projetos");

const mensagem =
  document.querySelector("#mensagem");

const modalEdicao =
  document.querySelector("#modal-edicao");

const tituloModalEdicao =
  document.querySelector("#titulo-modal-edicao");

const formEdicao =
  document.querySelector("#form-edicao");

const grupoEdicaoProjeto =
  document.querySelector("#grupo-edicao-projeto");

const grupoEdicaoTarefa =
  document.querySelector("#grupo-edicao-tarefa");

const campoEdicaoNomeProjeto =
  document.querySelector("#edicao-nome-projeto");

const campoEdicaoDescricaoProjeto =
  document.querySelector("#edicao-descricao-projeto");

const campoEdicaoTituloTarefa =
  document.querySelector("#edicao-titulo-tarefa");

const botaoFecharEdicao =
  document.querySelector("#botao-fechar-edicao");

const botaoCancelarEdicao =
  document.querySelector("#botao-cancelar-edicao");

const botaoSalvarEdicao =
  document.querySelector("#botao-salvar-edicao");

const modalConfirmacao =
  document.querySelector("#modal-confirmacao");

const textoConfirmacao =
  document.querySelector("#texto-confirmacao");

const botaoFecharConfirmacao =
  document.querySelector("#botao-fechar-confirmacao");

const botaoCancelarConfirmacao =
  document.querySelector("#botao-cancelar-confirmacao");

const botaoConfirmarExclusao =
  document.querySelector("#botao-confirmar-exclusao");

let itemEmEdicao = null;
let itemParaExcluir = null;
let temporizadorMensagem = null;

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

    renderizarProjetos(
      projetos
    );
  } catch (erro) {
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

function renderizarProjetos(projetos) {
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
      "Nenhum projeto cadastrado.";

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

function criarElementoProjeto(projeto) {
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

  const areaTarefas =
    criarAreaTarefas(
      projeto
    );

  artigo.appendChild(
    areaTarefas
  );

  return artigo;
}

function criarAreaTarefas(projeto) {
  const area =
    document.createElement("div");

  area.className = "tarefas";

  const titulo =
    document.createElement("h4");

  titulo.textContent = "Tarefas";

  area.appendChild(titulo);

  const lista =
    document.createElement("div");

  lista.className =
    "lista-tarefas";

  if (
    !Array.isArray(
      projeto.tarefas
    ) ||
    projeto.tarefas.length === 0
  ) {
    const vazio =
      document.createElement("p");

    vazio.className =
      "estado-vazio";

    vazio.textContent =
      "Nenhuma tarefa cadastrada.";

    lista.appendChild(vazio);
  } else {
    for (
      const tarefa
      of projeto.tarefas
    ) {
      lista.appendChild(
        criarElementoTarefa(
          tarefa
        )
      );
    }
  }

  area.appendChild(lista);

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

function criarElementoTarefa(tarefa) {
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
            tarefa
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

function abrirEdicaoProjeto(projeto) {
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

function abrirEdicaoTarefa(tarefa) {
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

async function salvarEdicao(evento) {
  evento.preventDefault();

  if (!itemEmEdicao) {
    return;
  }

  botaoSalvarEdicao.disabled = true;

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
    botaoSalvarEdicao.disabled = false;
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

  botaoConfirmarExclusao.disabled = true;

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
    botaoConfirmarExclusao.disabled = false;
  }
}

async function criarProjeto(evento) {
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

  botao.disabled = true;

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
    botao.disabled = false;
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

  botao.disabled = true;

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
    botao.disabled = false;
  }
}

async function concluirTarefa(
  tarefa
) {
  limparMensagem();

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
  }
}

formProjeto.addEventListener(
  "submit",
  criarProjeto
);

botaoAtualizar.addEventListener(
  "click",
  async () => {
    limparMensagem();
    await carregarProjetos();
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