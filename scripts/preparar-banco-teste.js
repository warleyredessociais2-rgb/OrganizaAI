"use strict";

// Falha de forma segura se tentarem rodar testes de escrita no banco da aplicação.
// É carregado antes de qualquer módulo que inicialize o pool PostgreSQL.
require("dotenv").config({ quiet: true });

const urlAplicacao = process.env.DATABASE_URL;
const urlTeste = process.env.TEST_DATABASE_URL;

if (!urlTeste) {
  throw new Error(
    "Teste de integração bloqueado: configure TEST_DATABASE_URL apontando para um banco exclusivo de testes."
  );
}

function alvoConexao(endereco) {
  const url = new URL(endereco);
  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("O banco de teste precisa usar uma URL PostgreSQL.");
  }
  // Credenciais não são exibidas; username pode distinguir projetos no pooler do Supabase.
  return [
    url.hostname.toLowerCase(),
    url.port || "5432",
    url.pathname.toLowerCase(),
    decodeURIComponent(url.username).toLowerCase()
  ].join("|");
}

try {
  if (urlAplicacao && alvoConexao(urlAplicacao) === alvoConexao(urlTeste)) {
    throw new Error(
      "Teste de integração bloqueado: TEST_DATABASE_URL aponta para o mesmo banco da aplicação."
    );
  }

  alvoConexao(urlTeste);
} catch (erro) {
  throw new Error(erro.message);
}

// Os testes de integração passam a usar exclusivamente o banco de testes.
process.env.DATABASE_URL = urlTeste;
