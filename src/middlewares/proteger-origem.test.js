const { test } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const { criarProtecaoOrigem } = require("./proteger-origem");

function appProtegida() {
  const app = express();
  app.use(criarProtecaoOrigem({
    producao: true,
    origemPermitida: "https://organizaai.example"
  }));
  app.all("/alterar", (req, res) => res.json({ ok: true }));
  return app;
}

test("bloqueia Origin de outro dominio", async () => {
  const r = await request(appProtegida())
    .post("/alterar")
    .set("Origin", "https://atacante.example");
  assert.equal(r.status, 403);
  assert.equal(r.body.erro, "Origem da requisicao nao autorizada.");
});

test("aceita Origin idêntica a APP_ORIGIN", async () => {
  const r = await request(appProtegida())
    .post("/alterar")
    .set("Origin", "https://organizaai.example");
  assert.equal(r.status, 200);
});

test("bloqueia metadados cross-site em escrita", async () => {
  const r = await request(appProtegida())
    .delete("/alterar")
    .set("Sec-Fetch-Site", "cross-site");
  assert.equal(r.status, 403);
});

test("bloqueia same-site que nao seja same-origin", async () => {
  const r = await request(appProtegida())
    .post("/alterar")
    .set("Sec-Fetch-Site", "same-site");
  assert.equal(r.status, 403);
});

test("bloqueia escrita sem prova de origem em producao", async () => {
  const r = await request(appProtegida()).post("/alterar");
  assert.equal(r.status, 403);
});

test("permite escrita com Sec-Fetch-Site same-origin", async () => {
  const r = await request(appProtegida())
    .post("/alterar")
    .set("Sec-Fetch-Site", "same-origin");
  assert.equal(r.status, 200);
});

test("permite Referer da origem correta", async () => {
  const r = await request(appProtegida())
    .patch("/alterar")
    .set("Referer", "https://organizaai.example/app/");
  assert.equal(r.status, 200);
});

test("GET continua disponivel sem metadados", async () => {
  const r = await request(appProtegida()).get("/alterar");
  assert.equal(r.status, 200);
});

test("rejeita APP_ORIGIN sem HTTPS", () => {
  assert.throws(
    () => criarProtecaoOrigem({
      producao: true,
      origemPermitida: "http://organizaai.example"
    }),
    /APP_ORIGIN/
  );
});
