const { pool } = require("./src/database/banco");

const {
  listarProjetosComTarefas
} = require("./src/repositories/projetos-banco");

async function executar() {
  try {
    const projetos = await listarProjetosComTarefas();

    console.dir(
      projetos,
      {
        depth: null,
        colors: true
      }
    );
  } catch (erro) {
    console.error(
      "Erro ao consultar projetos no PostgreSQL:"
    );

    console.error(erro.message);
  } finally {
    await pool.end();
  }
}

executar();