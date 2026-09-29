const {
  pool,
  testarConexao
} = require("./src/database/banco");

async function executar() {
  try {
    await testarConexao();
  } catch (erro) {
    console.error("Erro ao conectar ao PostgreSQL:");
    console.error(erro.message);
  } finally {
    await pool.end();
  }
}

executar();