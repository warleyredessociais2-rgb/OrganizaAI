"use strict";

// Backup somente de leitura do banco principal, fora do repositorio Git.
// Requer Node.js, pg_dump/pg_restore e .env local. Nunca exibe credenciais.
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

require("dotenv").config({ quiet: true });

function falhar(mensagem) {
  console.error("Backup nao concluido:", mensagem);
  process.exitCode = 1;
}

function alvo(url) {
  return [
    url.hostname.toLowerCase(),
    url.port || "5432",
    decodeURIComponent(url.pathname),
    decodeURIComponent(url.username)
  ].join("|");
}

function dentroDaPasta(pasta, destino) {
  const relativo = path.relative(pasta, destino);
  return relativo === "" ||
    (!relativo.startsWith("..") && !path.isAbsolute(relativo));
}

function executar() {
  const pastaDestino = process.argv[2];
  if (!pastaDestino) {
    throw new Error(
      "Informe a pasta de destino como primeiro argumento."
    );
  }

  if (process.env.ORGANIZAAI_TEST_DATABASE === "1") {
    throw new Error("Ambiente de testes ativo: backup principal bloqueado.");
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL ausente no .env local.");
  }

  const conexao = new URL(process.env.DATABASE_URL);
  if (!["postgres:", "postgresql:"].includes(conexao.protocol)) {
    throw new Error("DATABASE_URL nao usa PostgreSQL.");
  }

  if (!conexao.username || !conexao.password || !conexao.hostname) {
    throw new Error("A conexao principal esta incompleta.");
  }

  if (process.env.TEST_DATABASE_URL) {
    const testes = new URL(process.env.TEST_DATABASE_URL);
    if (alvo(conexao) === alvo(testes)) {
      throw new Error("Banco principal e de testes nao estao isolados.");
    }
  }

  const destino = path.resolve(pastaDestino);
  if (dentroDaPasta(path.resolve(process.cwd()), destino)) {
    throw new Error(
      "Escolha uma pasta fora do repositorio para nao versionar dados sensiveis."
    );
  }

  const programaPgDump = process.env.ORGANIZAAI_PG_DUMP ||
    (process.platform === "win32"
      ? "C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe"
      : "pg_dump");
  const programaPgRestore = process.env.ORGANIZAAI_PG_RESTORE ||
    (process.platform === "win32"
      ? "C:\\Program Files\\PostgreSQL\\18\\bin\\pg_restore.exe"
      : "pg_restore");

  const ambiente = {
    ...process.env,
    PGHOST: conexao.hostname,
    PGPORT: conexao.port || "5432",
    PGUSER: decodeURIComponent(conexao.username),
    PGPASSWORD: decodeURIComponent(conexao.password),
    PGDATABASE: decodeURIComponent(conexao.pathname.slice(1)),
    PGSSLMODE: "verify-full",
    PGCONNECT_TIMEOUT: "20"
  };

  if (process.env.DB_SSL_CA_PATH) {
    const caminhoCA = path.resolve(process.env.DB_SSL_CA_PATH);
    if (!fs.existsSync(caminhoCA)) {
      throw new Error("Certificado CA principal nao foi encontrado.");
    }
    ambiente.PGSSLROOTCERT = caminhoCA;
  }

  fs.mkdirSync(destino, { recursive: true });

  const agora = new Date();
  const carimbo = [
    agora.getFullYear(),
    String(agora.getMonth() + 1).padStart(2, "0"),
    String(agora.getDate()).padStart(2, "0"),
    "-",
    String(agora.getHours()).padStart(2, "0"),
    String(agora.getMinutes()).padStart(2, "0"),
    String(agora.getSeconds()).padStart(2, "0")
  ].join("");

  const arquivo = path.join(
    destino,
    `OrganizaAI-principal-${carimbo}.backup`
  );
  if (fs.existsSync(arquivo)) {
    throw new Error("Ja existe backup com este nome; tente novamente.");
  }

  console.log("Gerando backup do esquema public no banco principal...");
  const exportacao = spawnSync(programaPgDump, [
    "--format=custom",
    "--schema=public",
    // Sessões são temporárias e seus identificadores não devem ficar
    // guardados em cópias de segurança. Mantemos a estrutura da tabela.
    "--exclude-table-data=public.sessoes",
    "--no-owner",
    "--no-acl",
    "--file", arquivo
  ], {
    env: ambiente,
    stdio: "inherit"
  });

  if (exportacao.error || exportacao.status !== 0) {
    fs.rmSync(arquivo, { force: true });
    throw new Error("pg_dump retornou erro; arquivo incompleto descartado.");
  }

  const estatisticas = fs.statSync(arquivo);
  if (estatisticas.size === 0) {
    fs.rmSync(arquivo, { force: true });
    throw new Error("O arquivo gerado esta vazio.");
  }

  const verificacao = spawnSync(
    programaPgRestore,
    ["--list", arquivo],
    { env: ambiente, encoding: "utf8" }
  );

  if (verificacao.error || verificacao.status !== 0) {
    throw new Error(
      "Arquivo criado, mas nao foi possivel validar o catalogo com pg_restore."
    );
  }

  const tabelas = ["usuarios", "projetos", "tarefas"];
  for (const tabela of tabelas) {
    const padrao = new RegExp(
      `\\bTABLE DATA\\s+public\\s+${tabela}\\b`
    );
    if (!padrao.test(verificacao.stdout)) {
      throw new Error(
        `Arquivo criado, mas a tabela ${tabela} nao consta no catalogo.`
      );
    }
  }

  console.log("BACKUP CRIADO E CATALOGO VALIDADO");
  console.log("Arquivo:", path.basename(arquivo));
  console.log("Tamanho em bytes:", estatisticas.size);
  console.log("Pasta:", destino);
  console.log(
    "A restauracao real deste novo arquivo ainda precisa ser testada em banco isolado."
  );
}

try {
  executar();
} catch (erro) {
  falhar(erro.message);
}
