const fs = require("node:fs/promises");
const path = require("node:path");

const {
  pool
} = require("../src/database/banco");

async function executarMigracao() {
  const arquivoInformado =
    process.argv[2];

  if (!arquivoInformado) {
    throw new Error(
      "Informe o caminho do arquivo de migração."
    );
  }

  if (
    path.extname(
      arquivoInformado
    ).toLowerCase() !== ".sql"
  ) {
    throw new Error(
      "O arquivo de migração deve ter a extensão .sql."
    );
  }

  const caminhoMigracao =
    path.resolve(
      process.cwd(),
      arquivoInformado
    );

  const sql =
    await fs.readFile(
      caminhoMigracao,
      "utf8"
    );

  const cliente =
    await pool.connect();

  try {
    console.log(
      `Executando migração: ${arquivoInformado}`
    );

    await cliente.query(sql);

    console.log(
      "Migração executada com sucesso."
    );
  } catch (erro) {
    try {
      await cliente.query(
        "rollback"
      );
    } catch {
      // A conexão será liberada logo abaixo.
    }

    throw erro;
  } finally {
    cliente.release();
  }
}

executarMigracao()
  .catch(erro => {
    console.error(
      "Falha ao executar a migração:"
    );

    console.error(
      erro.message
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });