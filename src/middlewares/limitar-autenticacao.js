const { createHmac } = require("node:crypto");
const { pool } = require("../database/banco");

// Uma linha por chave em PostgreSQL: compartilhada entre todas as instancias.
// Nunca persistimos IP ou e-mail em texto simples.
const SQL_CONSUMIR = [
  "INSERT INTO organizaai_interno.limites_autenticacao AS atual",
  "  (chave, tentativas, expira_em)",
  "VALUES ($1, 1, now() + make_interval(secs => $2::integer))",
  "ON CONFLICT (chave) DO UPDATE SET",
  "  tentativas = CASE",
  "    WHEN atual.expira_em <= now() THEN 1",
  "    ELSE LEAST(atual.tentativas + 1, $3::integer + 1)",
  "  END,",
  "  expira_em = CASE",
  "    WHEN atual.expira_em <= now()",
  "      THEN now() + make_interval(secs => $2::integer)",
  "    ELSE atual.expira_em",
  "  END",
  "RETURNING tentativas,",
  "  GREATEST(1, CEIL(EXTRACT(EPOCH FROM (expira_em - now())))::integer)",
  "    AS aguardar_segundos"
].join("\n");

const REGRAS = Object.freeze({
  login: Object.freeze([
    { tipo: "ip", maximo: 30, janela: 15 * 60 },
    { tipo: "email", maximo: 10, janela: 15 * 60 }
  ]),
  cadastro: Object.freeze([
    { tipo: "ip", maximo: 5, janela: 60 * 60 }
  ])
});

function criarLimitadorAutenticacao({
  consultar = (sql, parametros) => pool.query(sql, parametros),
  segredo = process.env.SESSION_SECRET
} = {}) {
  if (typeof segredo !== "string" || segredo.length < 32) {
    throw new Error("SESSION_SECRET deve conter pelo menos 32 caracteres.");
  }

  function gerarChave(acao, tipo, identidade) {
    return createHmac("sha256", segredo)
      .update(acao + ":" + tipo + ":" + identidade, "utf8")
      .digest("hex");
  }

  return function limitarTentativas(acao) {
    const regras = REGRAS[acao];

    if (!regras) {
      throw new Error("Acao nao reconhecida pelo limitador.");
    }

    return async (req, res, next) => {
      try {
        const ip = req.ip || req.socket?.remoteAddress || "ip-indefinido";
        const email = typeof req.body?.email === "string"
          ? req.body.email.trim().toLowerCase()
          : "";

        for (const regra of regras) {
          if (regra.tipo === "email" && !email) {
            continue;
          }

          const identificador = regra.tipo === "ip" ? ip : email;
          const chave = gerarChave(acao, regra.tipo, identificador);

          // UPSERT atomico: sem contadores em memoria e sem janela
          // vulneravel a concorrencia entre replicas.
          const resultado = await consultar(SQL_CONSUMIR, [
            chave,
            regra.janela,
            regra.maximo
          ]);

          if (!resultado.rows?.[0]) {
            throw new Error("Resposta inesperada do limitador.");
          }

          const { tentativas, aguardar_segundos: aguardar } = resultado.rows[0];

          if (Number(tentativas) > regra.maximo) {
            const segundos = Math.max(1, Math.ceil(Number(aguardar) || 1));
            res.set("Retry-After", String(segundos));
            res.set("Cache-Control", "no-store");

            return res.status(429).json({
              erro: "Muitas tentativas. Tente novamente mais tarde."
            });
          }
        }

        next();
      } catch {
        // Falha fechada: indisponibilidade do banco nunca desativa a protecao.
        return res.status(503).json({
          erro: "Autenticacao temporariamente indisponivel."
        });
      }
    };
  };
}

module.exports = {
  criarLimitadorAutenticacao,
  SQL_CONSUMIR
};
