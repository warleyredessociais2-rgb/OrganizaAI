const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const { app } = require("./app");

test("GET / informa que a API está funcionando", async () => {
  const resposta =
    await request(app)
      .get("/");

  assert.equal(
    resposta.status,
    200
  );

  assert.deepEqual(
    resposta.body,
    {
      mensagem: "API do OrganizaAI funcionando."
    }
  );
});

test("POST /projetos rejeita projeto sem nome", async () => {
  const resposta =
    await request(app)
      .post("/projetos")
      .send({
        descricao: "Projeto sem nome"
      });

  assert.equal(
    resposta.status,
    400
  );

  assert.deepEqual(
    resposta.body,
    {
      erro: "O nome do projeto é obrigatório."
    }
  );
});

test("POST /projetos rejeita descricao que nao seja texto", async () => {
  const resposta =
    await request(app)
      .post("/projetos")
      .send({
        nome: "Projeto inválido",
        descricao: 123
      });

  assert.equal(
    resposta.status,
    400
  );

  assert.deepEqual(
    resposta.body,
    {
      erro: "A descrição do projeto deve ser um texto."
    }
  );
});

test("PUT /projetos/:id rejeita identificador invalido", async () => {
  const resposta =
    await request(app)
      .put("/projetos/id-invalido")
      .send({
        nome: "Projeto",
        descricao: "Descrição"
      });

  assert.equal(
    resposta.status,
    400
  );

  assert.deepEqual(
    resposta.body,
    {
      erro: "O identificador do projeto é inválido."
    }
  );
});

test("POST /projetos/:projetoId/tarefas rejeita identificador invalido", async () => {
  const resposta =
    await request(app)
      .post(
        "/projetos/id-invalido/tarefas"
      )
      .send({
        titulo: "Nova tarefa"
      });

  assert.equal(
    resposta.status,
    400
  );

  assert.deepEqual(
    resposta.body,
    {
      erro: "O identificador do projeto é inválido."
    }
  );
});

test("PUT /tarefas/:id rejeita identificador invalido", async () => {
  const resposta =
    await request(app)
      .put("/tarefas/id-invalido")
      .send({
        titulo: "Tarefa editada"
      });

  assert.equal(
    resposta.status,
    400
  );

  assert.deepEqual(
    resposta.body,
    {
      erro: "O identificador da tarefa é inválido."
    }
  );
});

test("PATCH /tarefas/:id/concluir rejeita identificador invalido", async () => {
  const resposta =
    await request(app)
      .patch(
        "/tarefas/id-invalido/concluir"
      );

  assert.equal(
    resposta.status,
    400
  );

  assert.deepEqual(
    resposta.body,
    {
      erro: "O identificador da tarefa é inválido."
    }
  );
});

test("DELETE /tarefas/:id rejeita identificador invalido", async () => {
  const resposta =
    await request(app)
      .delete(
        "/tarefas/id-invalido"
      );

  assert.equal(
    resposta.status,
    400
  );

  assert.deepEqual(
    resposta.body,
    {
      erro: "O identificador da tarefa é inválido."
    }
  );
});