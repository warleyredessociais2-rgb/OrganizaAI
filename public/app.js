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

function mostrarMensagem(texto, tipo = "sucesso") {
  mensagem.textContent = texto;

  mensagem.className =
    `mensagem visivel ${tipo}`;
}

function limparMensagem() {
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
  limparMensagem();

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
      () => editarProjeto(projeto)
    );

  const botaoExcluir =
    criarBotao(
      "Excluir",
      "botao-excluir",
      () => excluirProjeto(projeto)
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

      await adicionarTarefa(
        projeto.id,
        campo.value,
        botao
      );

      campo.value = "";
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
      () => editarTarefa(tarefa)
    );

  const botaoExcluir =
    criarBotao(
      "Excluir",
      "botao-excluir",
      () => excluirTarefa(tarefa)
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

async function criarProjeto(evento) {
  evento.preventDefault();

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

    mostrarMensagem(
      "Projeto criado com sucesso."
    );

    await carregarProjetos();
  } catch (erro) {
    mostrarMensagem(
      erro.message,
      "erro"
    );
  } finally {
    botao.disabled = false;
  }
}

async function editarProjeto(
  projeto
) {
  const novoNome =
    window.prompt(
      "Novo nome do projeto:",
      projeto.nome
    );

  if (novoNome === null) {
    return;
  }

  const nomeLimpo =
    novoNome.trim();

  if (!nomeLimpo) {
    mostrarMensagem(
      "O nome do projeto não pode ficar vazio.",
      "erro"
    );

    return;
  }

  const novaDescricao =
    window.prompt(
      "Nova descrição:",
      projeto.descricao || ""
    );

  if (novaDescricao === null) {
    return;
  }

  try {
    await requisicao(
      `/projetos/${projeto.id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          nome: nomeLimpo,
          descricao:
            novaDescricao.trim()
        })
      }
    );

    mostrarMensagem(
      "Projeto editado com sucesso."
    );

    await carregarProjetos();
  } catch (erro) {
    mostrarMensagem(
      erro.message,
      "erro"
    );
  }
}

async function excluirProjeto(
  projeto
) {
  const confirmou =
    window.confirm(
      `Excluir o projeto "${projeto.nome}"?`
    );

  if (!confirmou) {
    return;
  }

  try {
    await requisicao(
      `/projetos/${projeto.id}`,
      {
        method: "DELETE"
      }
    );

    mostrarMensagem(
      "Projeto excluído com sucesso."
    );

    await carregarProjetos();
  } catch (erro) {
    mostrarMensagem(
      erro.message,
      "erro"
    );
  }
}

async function adicionarTarefa(
  projetoId,
  titulo,
  botao
) {
  const tituloLimpo =
    titulo.trim();

  if (!tituloLimpo) {
    mostrarMensagem(
      "Informe o título da tarefa.",
      "erro"
    );

    return;
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

    mostrarMensagem(
      "Tarefa criada com sucesso."
    );

    await carregarProjetos();
  } catch (erro) {
    mostrarMensagem(
      erro.message,
      "erro"
    );
  } finally {
    botao.disabled = false;
  }
}

async function editarTarefa(
  tarefa
) {
  const novoTitulo =
    window.prompt(
      "Novo título da tarefa:",
      tarefa.titulo
    );

  if (novoTitulo === null) {
    return;
  }

  const tituloLimpo =
    novoTitulo.trim();

  if (!tituloLimpo) {
    mostrarMensagem(
      "O título da tarefa não pode ficar vazio.",
      "erro"
    );

    return;
  }

  try {
    await requisicao(
      `/tarefas/${tarefa.id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          titulo:
            tituloLimpo
        })
      }
    );

    mostrarMensagem(
      "Tarefa editada com sucesso."
    );

    await carregarProjetos();
  } catch (erro) {
    mostrarMensagem(
      erro.message,
      "erro"
    );
  }
}

async function concluirTarefa(
  tarefa
) {
  try {
    await requisicao(
      `/tarefas/${tarefa.id}/concluir`,
      {
        method: "PATCH"
      }
    );

    mostrarMensagem(
      "Tarefa concluída com sucesso."
    );

    await carregarProjetos();
  } catch (erro) {
    mostrarMensagem(
      erro.message,
      "erro"
    );
  }
}

async function excluirTarefa(
  tarefa
) {
  const confirmou =
    window.confirm(
      `Excluir a tarefa "${tarefa.titulo}"?`
    );

  if (!confirmou) {
    return;
  }

  try {
    await requisicao(
      `/tarefas/${tarefa.id}`,
      {
        method: "DELETE"
      }
    );

    mostrarMensagem(
      "Tarefa excluída com sucesso."
    );

    await carregarProjetos();
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
  carregarProjetos
);

carregarProjetos();