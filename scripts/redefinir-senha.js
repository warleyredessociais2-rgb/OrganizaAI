#!/usr/bin/env node
"use strict";

// Ferramenta administrativa local: a senha é recebida via stdin, nunca por argumento.
// Exemplo de uso seguro em PowerShell:
//   $email = Read-Host "E-mail cadastrado"
//   $segura = Read-Host "Nova senha (minimo de 15 caracteres)" -AsSecureString
//   $senha = [System.Net.NetworkCredential]::new("", $segura).Password
//   try { @($email, $senha) | node scripts/redefinir-senha.js }
//   finally { Remove-Variable email, segura, senha -ErrorAction SilentlyContinue }

const readline = require("node:readline");

async function lerEntrada() {
  const linhas = [];
  const leitor = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity
  });

  for await (const linha of leitor) {
    linhas.push(linha);
    if (linhas.length > 2) {
      leitor.close();
      throw new Error("Entrada inválida: informe somente o e-mail e a nova senha.");
    }
  }

  if (linhas.length !== 2) {
    throw new Error("Informe o e-mail e a nova senha pela entrada padrão.");
  }

  return {
    email: linhas[0].trim().toLowerCase(),
    senha: linhas[1]
  };
}

async function executar() {
  if (process.stdin.isTTY) {
    throw new Error(
      "Por segurança, use o Read-Host -AsSecureString e envie os dados por stdin. " +
      "Não digite a senha na linha de comando."
    );
  }

  const { email, senha } = await lerEntrada();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("E-mail inválido.");
  }

  if (senha.length < 15) {
    throw new Error("A nova senha deve ter pelo menos 15 caracteres.");
  }

  const { pool } = require("../src/database/banco");
  const { gerarHashSenha } = require("../src/services/autenticacao");

  try {
    const existente = await pool.query(
      "select id from public.usuarios where email = $1 limit 1",
      [email]
    );

    if (existente.rowCount !== 1) {
      throw new Error("Nenhuma conta com esse e-mail foi encontrada.");
    }

    const senhaHash = await gerarHashSenha(senha);
    const alteracao = await pool.query(
      "update public.usuarios set senha_hash = $1 where id = $2",
      [senhaHash, existente.rows[0].id]
    );

    if (alteracao.rowCount !== 1) {
      throw new Error("A atualização não foi confirmada.");
    }

    console.log("Senha redefinida com sucesso para a conta existente.");
    console.log("Os projetos e as tarefas não foram alterados.");
  } finally {
    await pool.end();
  }
}

executar().catch(erro => {
  console.error("Não foi possível redefinir a senha:", erro.message);
  process.exitCode = 1;
});
