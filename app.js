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
  if (!projeto) {
    console.log("Erro: projeto não encontrado.");
    return;
  }

  const tarefa = {
    titulo: titulo,
    concluida: false
  };

  projeto.tarefas.push(tarefa);
}

function concluirTarefa(projeto, titulo) {
  if (!projeto) {
    console.log("Erro: projeto não encontrado.");
    return;
  }

  const tarefa = projeto.tarefas.find(
    tarefa => tarefa.titulo === titulo
  );

  if (!tarefa) {
    console.log(`Erro: tarefa "${titulo}" não encontrada.`);
    return;
  }

  tarefa.concluida = true;
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

// Buscando os projetos

const organizaAI = buscarProjetoPorNome("OrganizaAI");
const estudos = buscarProjetoPorNome("Estudos");

// Adicionando tarefas

adicionarTarefa(
  organizaAI,
  "Criar estrutura inicial do projeto"
);

adicionarTarefa(
  organizaAI,
  "Aprender Git e GitHub"
);

adicionarTarefa(
  estudos,
  "Revisar JavaScript"
);

adicionarTarefa(
  estudos,
  "Estudar funções e arrays"
);

// Concluindo uma tarefa existente

concluirTarefa(
  organizaAI,
  "Aprender Git e GitHub"
);

// Testando projeto inexistente

const projetoInexistente = buscarProjetoPorNome("Projeto Fantasma");

adicionarTarefa(
  projetoInexistente,
  "Esta tarefa não deve ser adicionada"
);

// Testando tarefa inexistente

concluirTarefa(
  estudos,
  "Aprender banco de dados"
);

// Exibindo os dados

console.dir(projetos, { depth: null });