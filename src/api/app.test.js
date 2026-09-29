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