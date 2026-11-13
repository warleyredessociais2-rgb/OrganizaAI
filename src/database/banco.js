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

// No processo de testes, a CA selecionada para o banco isolado
// tem prioridade. Em producao, usamos apenas a CA do banco principal.
const caminhoCa =
  process.env.ORGANIZAAI_TEST_DATABASE === "1"
    ? process.env.TEST_DB_SSL_CA_PATH || process.env.DB_SSL_CA_PATH
    : process.env.DB_SSL_CA_PATH;

if (caminhoCa) {
  ssl.ca = fs.readFileSync(
    caminhoCa,
    "utf8"
  );

  if (!ssl.ca.includes("-----BEGIN CERTIFICATE-----")) {
    throw new Error(
      "O arquivo CA PostgreSQL informado nao possui um certificado PEM valido."
    );
  }
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