const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const request = require("supertest");

const { app } = require("./app");
const { pool } = require("../database/banco");

const {
  excluirProjetoNoBanco,
  excluirTarefaNoBanco
} = require("../repositories/projetos-banco");

test("CRUD completo da API no PostgreSQL", async () => {
  const identificador = randomUUID();

  const nomeInicial =
    `Teste API ${identificador}`;

  const nomeEditado =
    `Teste API editado ${identificador}`;

  let projetoId = null;
  let tarefaId = null;

  try {
    // 1. Criar projeto
    const respostaCriacaoProjeto =
      await request(app)
        .post("/projetos")
        .send({
          nome: nomeInicial,
          descricao:
            "Projeto temporário criado pelo teste automatizado da API."
        });

    assert.equal(
      respostaCriacaoProjeto.status,
      201
    );

    assert.equal(
      respostaCriacaoProjeto.body.nome,
      nomeInicial
    );

    projetoId =
      respostaCriacaoProjeto.body.id;

    assert.ok(projetoId);

    // 2. Editar projeto
    const respostaEdicaoProjeto =
      await request(app)
        .put(`/projetos/${projetoId}`)
        .send({
          nome: nomeEditado,
          descricao:
            "Projeto temporário editado pelo teste automatizado da API."
        });

    assert.equal(
      respostaEdicaoProjeto.status,
      200
    );

    assert.equal(
      respostaEdicaoProjeto.body.mensagem,
      "Projeto editado com sucesso."
    );

    assert.equal(
      respostaEdicaoProjeto.body.projeto.nome,
      nomeEditado
    );

    // 3. Criar tarefa
    const respostaCriacaoTarefa =
      await request(app)
        .post(
          `/projetos/${projetoId}/tarefas`
        )
        .send({
          titulo:
            "Tarefa temporária criada pela API"
        });

    assert.equal(
      respostaCriacaoTarefa.status,
      201
    );

    assert.equal(
      respostaCriacaoTarefa.body.projeto_id,
      projetoId
    );

    assert.equal(
      respostaCriacaoTarefa.body.titulo,
      "Tarefa temporária criada pela API"
    );

    assert.equal(
      respostaCriacaoTarefa.body.concluida,
      false
    );

    tarefaId =
      respostaCriacaoTarefa.body.id;

    assert.ok(tarefaId);

    // 4. Editar tarefa
    const respostaEdicaoTarefa =
      await request(app)
        .put(`/tarefas/${tarefaId}`)
        .send({
          titulo:
            "Tarefa temporária editada pela API"
        });

    assert.equal(
      respostaEdicaoTarefa.status,
      200
    );

    assert.equal(
      respostaEdicaoTarefa.body.mensagem,
      "Tarefa editada com sucesso."
    );

    assert.equal(
      respostaEdicaoTarefa.body.tarefa.titulo,
      "Tarefa temporária editada pela API"
    );

    // 5. Concluir tarefa
    const respostaConclusaoTarefa =
      await request(app)
        .patch(
          `/tarefas/${tarefaId}/concluir`
        );

    assert.equal(
      respostaConclusaoTarefa.status,
      200
    );

    assert.equal(
      respostaConclusaoTarefa.body.mensagem,
      "Tarefa concluída com sucesso."
    );

    assert.equal(
      respostaConclusaoTarefa.body.tarefa.concluida,
      true
    );

    // 6. Consultar projeto e tarefa
    const respostaConsulta =
      await request(app)
        .get("/projetos");

    assert.equal(
      respostaConsulta.status,
      200
    );

    assert.ok(
      Array.isArray(respostaConsulta.body)
    );

    const projetoEncontrado =
      respostaConsulta.body.find(
        projeto =>
          projeto.id === projetoId
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
      projetoEncontrado.tarefas[0].id,
      tarefaId
    );

    assert.equal(
      projetoEncontrado.tarefas[0].titulo,
      "Tarefa temporária editada pela API"
    );

    assert.equal(
      projetoEncontrado.tarefas[0].concluida,
      true
    );

    // 7. Excluir tarefa
    const respostaExclusaoTarefa =
      await request(app)
        .delete(`/tarefas/${tarefaId}`);

    assert.equal(
      respostaExclusaoTarefa.status,
      200
    );

    assert.equal(
      respostaExclusaoTarefa.body.mensagem,
      "Tarefa excluída com sucesso."
    );

    assert.equal(
      respostaExclusaoTarefa.body.tarefa.id,
      tarefaId
    );

    tarefaId = null;

    // 8. Excluir projeto
    const respostaExclusaoProjeto =
      await request(app)
        .delete(
          `/projetos/${projetoId}`
        );

    assert.equal(
      respostaExclusaoProjeto.status,
      200
    );

    assert.equal(
      respostaExclusaoProjeto.body.mensagem,
      "Projeto excluído com sucesso."
    );

    assert.equal(
      respostaExclusaoProjeto.body.projeto.id,
      projetoId
    );

    projetoId = null;

    // 9. Confirmar que os dados temporários sumiram
    const respostaFinal =
      await request(app)
        .get("/projetos");

    assert.equal(
      respostaFinal.status,
      200
    );

    const projetoAindaExiste =
      respostaFinal.body.some(
        projeto =>
          projeto.nome === nomeInicial ||
          projeto.nome === nomeEditado
      );

    assert.equal(
      projetoAindaExiste,
      false
    );
  } finally {
    // Limpeza de segurança caso o teste falhe
    if (tarefaId) {
      try {
        await excluirTarefaNoBanco(
          tarefaId
        );
      } catch {}
    }

    if (projetoId) {
      try {
        await excluirProjetoNoBanco(
          projetoId
        );
      } catch {}
    }

    await pool.end();
  }
});