const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");

const { pool } = require("./banco");

const {
  criarProjetoNoBanco,
  editarProjetoNoBanco,
  excluirProjetoNoBanco,
  adicionarTarefaNoBanco,
  editarTarefaNoBanco,
  concluirTarefaNoBanco,
  excluirTarefaNoBanco,
  listarProjetosComTarefas
} = require("./projetos-banco");

test("CRUD completo no PostgreSQL", async () => {
  const identificador = randomUUID();

  const nomeInicial =
    `Teste automático ${identificador}`;

  const nomeEditado =
    `Teste automático editado ${identificador}`;

  let projetoId = null;
  let tarefaId = null;

  try {
    const projetoCriado =
      await criarProjetoNoBanco(
        nomeInicial,
        "Projeto temporário criado pelo teste automatizado."
      );

    projetoId = projetoCriado.id;

    assert.equal(
      projetoCriado.nome,
      nomeInicial
    );

    const tarefaCriada =
      await adicionarTarefaNoBanco(
        projetoId,
        "Tarefa temporária"
      );

    tarefaId = tarefaCriada.id;

    assert.equal(
      tarefaCriada.projeto_id,
      projetoId
    );

    assert.equal(
      tarefaCriada.titulo,
      "Tarefa temporária"
    );

    assert.equal(
      tarefaCriada.concluida,
      false
    );

    const projetoEditado =
      await editarProjetoNoBanco(
        projetoId,
        nomeEditado,
        "Descrição editada pelo teste automatizado."
      );

    assert.equal(
      projetoEditado.nome,
      nomeEditado
    );

    const tarefaEditada =
      await editarTarefaNoBanco(
        tarefaId,
        "Tarefa temporária editada"
      );

    assert.equal(
      tarefaEditada.titulo,
      "Tarefa temporária editada"
    );

    const tarefaConcluida =
      await concluirTarefaNoBanco(
        tarefaId
      );

    assert.equal(
      tarefaConcluida.concluida,
      true
    );

    const projetos =
      await listarProjetosComTarefas();

    const projetoEncontrado =
      projetos.find(
        projeto => projeto.id === projetoId
      );

    assert.ok(projetoEncontrado);

    assert.equal(
      projetoEncontrado.nome,
      nomeEditado
    );

    assert.equal(
      projetoEncontrado.tarefas.length,
      1
    );

    assert.equal(
      projetoEncontrado.tarefas[0].titulo,
      "Tarefa temporária editada"
    );

    assert.equal(
      projetoEncontrado.tarefas[0].concluida,
      true
    );

    const tarefaExcluida =
      await excluirTarefaNoBanco(
        tarefaId
      );

    assert.equal(
      tarefaExcluida.id,
      tarefaId
    );

    tarefaId = null;

    const projetoExcluido =
      await excluirProjetoNoBanco(
        projetoId
      );

    assert.equal(
      projetoExcluido.id,
      projetoId
    );

    projetoId = null;
  } finally {
    if (tarefaId) {
      try {
        await excluirTarefaNoBanco(tarefaId);
      } catch {}
    }

    if (projetoId) {
      try {
        await excluirProjetoNoBanco(projetoId);
      } catch {}
    }

    await pool.end();
  }
});