const { randomUUID } = require("crypto");

const projetos = [];

function criarProjeto(nome, descricao) {
  const projeto = {
    id: randomUUID(),
    nome: nome,
    descricao: descricao,
    tarefas: []
  };

  projetos.push(projeto);

  return projeto;
}

function buscarProjetoPorNome(nome) {
  return projetos.find(
    projeto => projeto.nome === nome
  );
}

function buscarProjetoPorId(id) {
  return projetos.find(
    projeto => projeto.id === id
  );
}

function adicionarTarefa(projeto, titulo) {
  if (!projeto) {
    console.log("Erro: projeto não encontrado.");
    return;
  }

  const tarefa = {
    id: randomUUID(),
    titulo: titulo,
    concluida: false
  };

  projeto.tarefas.push(tarefa);

  return tarefa;
}

function concluirTarefaPorId(projeto, tarefaId) {
  if (!projeto) {
    console.log("Erro: projeto não encontrado.");
    return;
  }

  const tarefa = projeto.tarefas.find(
    tarefa => tarefa.id === tarefaId
  );

  if (!tarefa) {
    console.log("Erro: tarefa não encontrada.");
    return;
  }

  tarefa.concluida = true;
}

// Criando projetos

const organizaAI = criarProjeto(
  "OrganizaAI",
  "Projeto para aprender desenvolvimento de software e inteligência artificial."
);

const estudos = criarProjeto(
  "Estudos",
  "Projeto para organizar conteúdos e atividades de estudo."
);

// Adicionando tarefas ao OrganizaAI

const tarefaEstrutura = adicionarTarefa(
  organizaAI,
  "Criar estrutura inicial do projeto"
);

const tarefaGit = adicionarTarefa(
  organizaAI,
  "Aprender Git e GitHub"
);

// Adicionando tarefas ao projeto Estudos

const tarefaJavaScript = adicionarTarefa(
  estudos,
  "Revisar JavaScript"
);

const tarefaFuncoes = adicionarTarefa(
  estudos,
  "Estudar funções e arrays"
);

// Concluindo uma tarefa pelo ID

concluirTarefaPorId(
  organizaAI,
  tarefaGit.id
);

// Testando busca de projeto pelo ID

const projetoEncontrado = buscarProjetoPorId(
  estudos.id
);

console.log(
  "Projeto encontrado pelo ID:",
  projetoEncontrado.nome
);

// Exibindo todos os dados

console.dir(projetos, { depth: null });