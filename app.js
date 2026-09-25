const {
  criarProjeto,
  adicionarTarefa,
  concluirTarefaPorId,
  listarProjetos
} = require("./projetos");

const projetos = listarProjetos();

if (projetos.length === 0) {
  const organizaAI = criarProjeto(
    "OrganizaAI",
    "Projeto para aprender desenvolvimento de software e inteligência artificial."
  );

  const estudos = criarProjeto(
    "Estudos",
    "Projeto para organizar conteúdos e atividades de estudo."
  );

  adicionarTarefa(
    organizaAI,
    "Criar estrutura inicial do projeto"
  );

  const tarefaGit = adicionarTarefa(
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

  concluirTarefaPorId(
    organizaAI,
    tarefaGit.id
  );

  console.log("Dados iniciais criados e salvos.");
} else {
  console.log("Dados carregados do arquivo.");
}

console.dir(listarProjetos(), { depth: null });