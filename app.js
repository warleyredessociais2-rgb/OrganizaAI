const projetos = [];

function criarProjeto(nome, descricao) {
  const projeto = {
    nome: nome,
    descricao: descricao,
    tarefas: []
  };

  projetos.push(projeto);
}

function buscarProjetoPorNome(nome) {
  return projetos.find(
    projeto => projeto.nome === nome
  );
}

function adicionarTarefa(projeto, titulo) {
  const tarefa = {
    titulo: titulo,
    concluida: false
  };

  projeto.tarefas.push(tarefa);
}

function concluirTarefa(projeto, titulo) {
  const tarefa = projeto.tarefas.find(
    tarefa => tarefa.titulo === titulo
  );

  if (tarefa) {
    tarefa.concluida = true;
  }
}

// Criando os projetos

criarProjeto(
  "OrganizaAI",
  "Projeto para aprender desenvolvimento de software e inteligência artificial."
);

criarProjeto(
  "Estudos",
  "Projeto para organizar conteúdos e atividades de estudo."
);

// Buscando os projetos pelo nome

const organizaAI = buscarProjetoPorNome("OrganizaAI");
const estudos = buscarProjetoPorNome("Estudos");

// Adicionando tarefas ao OrganizaAI

adicionarTarefa(
  organizaAI,
  "Criar estrutura inicial do projeto"
);

adicionarTarefa(
  organizaAI,
  "Aprender Git e GitHub"
);

// Adicionando tarefas ao projeto Estudos

adicionarTarefa(
  estudos,
  "Revisar JavaScript"
);

adicionarTarefa(
  estudos,
  "Estudar funções e arrays"
);

// Concluindo uma tarefa específica

concluirTarefa(
  organizaAI,
  "Aprender Git e GitHub"
);

// Exibindo todos os projetos

console.dir(projetos, { depth: null });