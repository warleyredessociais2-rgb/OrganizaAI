const { test } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const { criarLimitadorAutenticacao, SQL_CONSUMIR } = require("./limitar-autenticacao");

function bancoSimulado() {
  const estado = new Map();
  const chaves = [];

  async function consultar(sql, [chave, janela, maximo]) {
    assert.equal(sql, SQL_CONSUMIR);
    assert.ok(sql.includes("ON CONFLICT"));
    assert.equal(chave.length, 64);
    assert.ok(Number.isInteger(janela) && janela > 0);
    chaves.push(chave);

    const contagem = Math.min((estado.get(chave) || 0) + 1, maximo + 1);
    estado.set(chave, contagem);

    return {
      rows: [{ tentativas: contagem, aguardar_segundos: janela }]
    };
  }

  return { consultar, chaves, estado };
}

function appTeste(controlar, { ipViaHeader = false } = {}) {
  const app = express();
  if (ipViaHeader) {
    app.set("trust proxy", true); // Apenas neste teste isolado.
  }
  app.use(express.json());
  app.post("/login", controlar("login"), (req, res) => res.json({ ok: true }));
  app.post("/cadastro", controlar("cadastro"), (req, res) => res.json({ ok: true }));
  return app;
}

const segredo = "segredo-ficticio-de-testes-com-mais-de-32-caracteres";

test("cadastro limita a sexta tentativa por IP em uma hora", async () => {
  const banco = bancoSimulado();
  const controlar = criarLimitadorAutenticacao({ consultar: banco.consultar, segredo });
  const app = appTeste(controlar);

  for (let i = 0; i < 5; i++) {
    const r = await request(app).post("/cadastro").send({});
    assert.equal(r.status, 200);
  }

  const r = await request(app).post("/cadastro").send({});
  assert.equal(r.status, 429);
  assert.equal(r.headers["retry-after"], "3600");
  assert.equal(r.headers["cache-control"], "no-store");
});

test("login limita tentativas repetidas por e-mail", async () => {
  const banco = bancoSimulado();
  const controlar = criarLimitadorAutenticacao({ consultar: banco.consultar, segredo });
  const app = appTeste(controlar, { ipViaHeader: true });

  for (let i = 0; i < 10; i++) {
    const r = await request(app)
      .post("/login")
      .set("X-Forwarded-For", "192.0.2." + (i + 1))
      .send({ email: "USUARIO@EXEMPLO.COM" });
    assert.equal(r.status, 200);
  }
  const r = await request(app).post("/login")
    .set("X-Forwarded-For", "192.0.2.99")
    .send({ email: "usuario@exemplo.com" });
  assert.equal(r.status, 429);
  assert.equal(r.headers["retry-after"], "900");
});

test("limite por IP de login impede dispersar ataques em muitos e-mails", async () => {
  const banco = bancoSimulado();
  const controlar = criarLimitadorAutenticacao({ consultar: banco.consultar, segredo });
  const app = appTeste(controlar);

  for (let i = 0; i < 30; i++) {
    const r = await request(app).post("/login")
      .send({ email: "pessoa" + i + "@exemplo.com" });
    assert.equal(r.status, 200);
  }
  const r = await request(app).post("/login")
    .send({ email: "mais-uma@exemplo.com" });
  assert.equal(r.status, 429);
});

test("limites sao compartilhados por duas instancias que usam o mesmo PostgreSQL", async () => {
  const banco = bancoSimulado();
  const a = appTeste(criarLimitadorAutenticacao({ consultar: banco.consultar, segredo }));
  const b = appTeste(criarLimitadorAutenticacao({ consultar: banco.consultar, segredo }));

  for (let i = 0; i < 5; i++) {
    const app = i % 2 ? a : b;
    assert.equal((await request(app).post("/cadastro")).status, 200);
  }
  assert.equal((await request(b).post("/cadastro")).status, 429);
});

test("chaves HMAC nao registram IP ou e-mail em claro", async () => {
  const banco = bancoSimulado();
  const app = appTeste(criarLimitadorAutenticacao({ consultar: banco.consultar, segredo }));
  await request(app).post("/login").send({ email: "segredo@exemplo.com" });
  assert.equal(banco.chaves.length, 2);
  assert.ok(banco.chaves.every(chave => /^[a-f0-9]{64}$/.test(chave)));
  assert.ok(banco.chaves.every(chave => !chave.includes("segredo@exemplo.com")));
  assert.notEqual(banco.chaves[0], banco.chaves[1]);
});

test("login e cadastro nao compartilham os mesmos contadores", async () => {
  const banco = bancoSimulado();
  const app = appTeste(criarLimitadorAutenticacao({ consultar: banco.consultar, segredo }));

  await request(app).post("/login").send({});
  await request(app).post("/cadastro").send({});
  assert.equal(banco.chaves.length, 2);
  assert.notEqual(banco.chaves[0], banco.chaves[1]);
});

test("falha do armazenamento retorna 503 em vez de liberar tentativas", async () => {
  const controlar = criarLimitadorAutenticacao({
    segredo,
    consultar: async () => { throw new Error("Falha simulada"); }
  });
  const r = await request(appTeste(controlar)).post("/login").send({});
  assert.equal(r.status, 503);
  assert.equal(r.body.erro, "Autenticacao temporariamente indisponivel.");
});

test("exige segredo forte e nome de acao conhecido", () => {
  assert.throws(() => criarLimitadorAutenticacao({ segredo: "curto" }), /SESSION_SECRET/);
  const limitar = criarLimitadorAutenticacao({
    segredo,
    consultar: async () => ({ rows: [{ tentativas: 1, aguardar_segundos: 10 }] })
  });
  assert.throws(() => limitar("acao-invalida"), /Acao nao reconhecida/);
});
