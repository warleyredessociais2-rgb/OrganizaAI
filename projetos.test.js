const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// Arquivo único por execução: não sobrescreve dados.test.json.
const caminhoTeste = path.join(
  os.tmpdir(),
  `organizaai-projetos-teste-${process.pid}-${randomUUID()}.json`
);

process.env.ORGANIZAAI_DATA_FILE = caminhoTeste;

after(() => {
  if (fs.existsSync(caminhoTeste)) {
    fs.unlinkSync(caminhoTeste);
  }
});

const {
  criarProjeto,
  adicionarTarefa,
  editarProjeto,
  editarTarefaPorId,
  concluirTarefaPorId,
  excluirTarefaPorId,
  excluirProjetoPorId,
  listarProjetos
} = require("./projetos");

test("cria um projeto", () => {
  const projeto = criarProjeto(
    "Projeto Teste",
    "Descrição de teste"
  );

  assert.equal(
    projeto.nome,
    "Projeto Teste"
  );

  assert.equal(
    projeto.descricao,
    "Descrição de teste"
  );

  assert.equal(
    projeto.tarefas.length,
    0
  );
});

test("adiciona uma tarefa ao projeto", () => {
  const projeto = listarProjetos()[0];

  const tarefa = adicionarTarefa(
    projeto,
    "Tarefa de teste"
  );

  assert.equal(
    tarefa.titulo,
    "Tarefa de teste"
  );

  assert.equal(
    tarefa.concluida,
    false
  );

  assert.equal(
    projeto.tarefas.length,
    1
  );
});

test("edita um projeto", () => {
  const projeto = listarProjetos()[0];

  editarProjeto(
    projeto,
    "Projeto Editado",
    "Descrição editada"
  );

  assert.equal(
    projeto.nome,
    "Projeto Editado"
  );

  assert.equal(
    projeto.descricao,
    "Descrição editada"
  );
});

test("edita uma tarefa", () => {
  const projeto = listarProjetos()[0];
  const tarefa = projeto.tarefas[0];

  editarTarefaPorId(
    projeto,
    tarefa.id,
    "Tarefa editada"
  );

  assert.equal(
    tarefa.titulo,
    "Tarefa editada"
  );
});

test("conclui uma tarefa", () => {
  const projeto = listarProjetos()[0];
  const tarefa = projeto.tarefas[0];

  concluirTarefaPorId(
    projeto,
    tarefa.id
  );

  assert.equal(
    tarefa.concluida,
    true
  );
});

test("exclui uma tarefa", () => {
  const projeto = listarProjetos()[0];
  const tarefa = projeto.tarefas[0];

  excluirTarefaPorId(
    projeto,
    tarefa.id
  );

  assert.equal(
    projeto.tarefas.length,
    0
  );
});

test("exclui um projeto", () => {
  const projeto = listarProjetos()[0];

  excluirProjetoPorId(
    projeto.id
  );

  assert.equal(
    listarProjetos().length,
    0
  );
});