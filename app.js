const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const caminhoDados = path.join(__dirname, "dados.json");

let projetos = carregarDados();

function carregarDados() {
  if (!fs.existsSync(caminhoDados)) {
    return [];
  }

  const conteudo = fs.readFileSync(caminhoDados, "utf-8");

  if (!conteudo.trim()) {
    return [];
  }

  return JSON.parse(conteudo);
}

function salvarDados() {
  fs.writeFileSync(
    caminhoDados,
    JSON.stringify(projetos, null, 2),
    "utf-8"
  );
}

function criarProjeto(nome, descricao) {
  const projeto = {
    id: randomUUID(),
    nome: nome,
    descricao: descricao,
    tarefas: []
  };

  projetos.push(projeto);

  salvarDados();

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

  salvarDados();

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

  salvarDados();
}

// Cria os dados iniciais somente se ainda não houver dados salvos

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

// Exibe os dados atuais

console.dir(projetos, { depth: null });