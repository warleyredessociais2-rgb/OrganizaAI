require("dotenv").config({ quiet: true });

const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error(
    "A variável DATABASE_URL não foi encontrada no arquivo .env."
  );
}

const fs = require("node:fs");

// Certificado opcional fornecido pelo provedor. Nunca desabilitar
// a validação do certificado TLS da conexão PostgreSQL.
const ssl = {
  rejectUnauthorized: true
};

if (process.env.DB_SSL_CA_PATH) {
  ssl.ca = fs.readFileSync(
    process.env.DB_SSL_CA_PATH,
    "utf8"
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl
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