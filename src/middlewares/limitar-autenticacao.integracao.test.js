require("../../scripts/preparar-banco-teste");

const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const { randomBytes } = require("node:crypto");
const express = require("express");
const request = require("supertest");
const { pool } = require("../database/banco");
const {
  SQL_CONSUMIR,
  criarLimitadorAutenticacao
} = require("./limitar-autenticacao");

after(async () => {
  await pool.end();
});

test("PostgreSQL compartilha contagem atomica entre requisicoes concorrentes", async () => {
  const chave = randomBytes(32).toString("hex");
  const janela = 120;
  const maximo = 3;

  try {
    const resultados = await Promise.all(
      Array.from({ length: 8 }, () => pool.query(SQL_CONSUMIR, [chave, janela, maximo]))
    );
    const tentativas = resultados.map(r => Number(r.rows[0].tentativas));
    assert.ok(tentativas.includes(1));
    assert.ok(tentativas.includes(maximo + 1));
    assert.ok(tentativas.every(n => n >= 1 && n <= maximo + 1));

    const seguinte = await pool.query(SQL_CONSUMIR, [chave, janela, maximo]);
    assert.equal(Number(seguinte.rows[0].tentativas), maximo + 1);
    assert.ok(Number(seguinte.rows[0].aguardar_segundos) >= 1);
  } finally {
    await pool.query("DELETE FROM organizaai_interno.limites_autenticacao WHERE chave = $1", [chave]);
  }
});

test("HTTP 429 real e Retry-After apos 10 logins no banco isolado", async () => {
  const chaves = new Set();
  const app = express();
  const limite = criarLimitadorAutenticacao({
    segredo: randomBytes(48).toString("hex"),
    consultar: async (sql, params) => {
      chaves.add(params[0]);
      return pool.query(sql, params);
    }
  });

  app.use(express.json());
  app.post("/auth/login", limite("login"), (req, res) => res.json({ ok: true }));

  try {
    for (let i = 0; i < 10; i++) {
      const resultado = await request(app)
        .post("/auth/login")
        .send({ email: "integracao@organizaai.local" });
      assert.equal(resultado.status, 200);
    }

    const bloqueado = await request(app)
      .post("/auth/login")
      .send({ email: "integracao@organizaai.local" });
    assert.equal(bloqueado.status, 429);
    assert.ok(Number(bloqueado.headers["retry-after"]) >= 1);
  } finally {
    if (chaves.size) {
      await pool.query(
        "DELETE FROM organizaai_interno.limites_autenticacao WHERE chave = ANY($1::varchar[])",
        [Array.from(chaves)]
      );
    }
  }
});
