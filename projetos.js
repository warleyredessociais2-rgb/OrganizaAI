const { randomUUID } = require("crypto");
const { carregarDados, salvarDados } = require("./dados");

let projetos = carregarDados();

function criarProjeto(nome, descricao) {
  const projeto = {
    id: randomUUID(),
    nome: nome,
    descricao: descricao,
    tarefas: []
  };

  projetos.push(projeto);
  salvarDados(projetos);

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
  salvarDados(projetos);

  return tarefa;
}

function concluirTarefaPorId(projeto, tarefaId) {
  if (!projeto) {
    console.log("Erro: projeto não encontrado.");
    return false;
  }

  const tarefa = projeto.tarefas.find(
    tarefa => tarefa.id === tarefaId
  );

  if (!tarefa) {
    console.log("Erro: tarefa não encontrada.");
    return false;
  }

  tarefa.concluida = true;
  salvarDados(projetos);

  return true;
}

function excluirTarefaPorId(projeto, tarefaId) {
  if (!projeto) {
    console.log("Erro: projeto não encontrado.");
    return false;
  }

  const indice = projeto.tarefas.findIndex(
    tarefa => tarefa.id === tarefaId
  );

  if (indice === -1) {
    console.log("Erro: tarefa não encontrada.");
    return false;
  }

  projeto.tarefas.splice(indice, 1);
  salvarDados(projetos);

  return true;
}

function excluirProjetoPorId(projetoId) {
  const indice = projetos.findIndex(
    projeto => projeto.id === projetoId
  );

  if (indice === -1) {
    console.log("Erro: projeto não encontrado.");
    return false;
  }

  projetos.splice(indice, 1);
  salvarDados(projetos);

  return true;
}

function listarProjetos() {
  return projetos;
}

module.exports = {
  criarProjeto,
  buscarProjetoPorNome,
  buscarProjetoPorId,
  adicionarTarefa,
  concluirTarefaPorId,
  excluirTarefaPorId,
  excluirProjetoPorId,
  listarProjetos
};