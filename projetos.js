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

  salvarDados(projetos);
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
  listarProjetos
};