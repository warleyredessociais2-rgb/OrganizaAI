const session = require("express-session");
const pgSession = require("connect-pg-simple");

const {
  pool
} = require("../database/banco");

const PostgreSqlStore =
  pgSession(session);

function criarMiddlewareSessao() {
  const sessionSecret =
    process.env.SESSION_SECRET;

  if (!sessionSecret) {
    throw new Error(
      "A variável SESSION_SECRET não foi encontrada no arquivo .env."
    );
  }

  const producao =
    process.env.NODE_ENV === "production";

  const armazenamento =
    new PostgreSqlStore({
      pool,
      schemaName: "public",
      tableName: "sessoes",
      createTableIfMissing: false
    });

  return session({
    name: "organizaai.sid",
    secret: sessionSecret,
    store: armazenamento,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: producao,
      maxAge:
        1000 *
        60 *
        60 *
        24 *
        7
    }
  });
}

module.exports = {
  criarMiddlewareSessao
};