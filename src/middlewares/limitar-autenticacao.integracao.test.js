require("../../scripts/preparar-banco-teste");

const test = require("node:test");
const assert = require("node:assert/strict");
const { randomBytes } = require("node:crypto");
const { pool } = require("../database/banco");
const { SQL_CONSUMIR } = require("./limitar-autenticacao");

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
    try {
      await pool.query("DELETE FROM organizaai_interno.limites_autenticacao WHERE chave = $1", [chave]);
    } finally {
      await pool.end();
    }
  }
});
