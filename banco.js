require("dotenv").config();

const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error(
    "A variável DATABASE_URL não foi encontrada no arquivo .env."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testarConexao() {
  const cliente = await pool.connect();

  try {
    const resultado = await cliente.query(
      "select current_database() as banco, now() as horario"
    );

    console.log("Conexão com PostgreSQL realizada com sucesso.");
    console.log(resultado.rows[0]);
  } finally {
    cliente.release();
  }
}

module.exports = {
  pool,
  testarConexao
};