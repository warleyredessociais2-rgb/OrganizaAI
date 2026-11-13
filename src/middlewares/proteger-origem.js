// Protecao de requisicoes de alteracao contra origens externas.
// Em producao, APP_ORIGIN define o dominio HTTPS autorizado.
// Em desenvolvimento, usamos a origem local da propria requisicao.
const metodosSeguros = new Set(["GET", "HEAD", "OPTIONS"]);

function origemConfigurada(origem) {
  if (!origem) {
    throw new Error("APP_ORIGIN deve ser configurada em producao.");
  }

  let url;
  try {
    url = new URL(origem);
  } catch {
    throw new Error("APP_ORIGIN deve ser uma URL HTTPS valida.");
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error("APP_ORIGIN deve ser apenas a origem HTTPS publica.");
  }

  return url.origin;
}

function origemRequisicao(req) {
  try {
    return new URL(`${req.protocol}://${req.get("host")}`).origin;
  } catch {
    return null;
  }
}

function criarProtecaoOrigem({
  producao = process.env.NODE_ENV === "production",
  origemPermitida = process.env.APP_ORIGIN
} = {}) {
  const origemFixa = producao
    ? origemConfigurada(origemPermitida)
    : null;

  return (req, res, next) => {
    if (metodosSeguros.has(req.method)) {
      return next();
    }

    res.vary("Origin");
    res.vary("Sec-Fetch-Site");

    const origemAlvo = origemFixa || origemRequisicao(req);
    const metadata = req.get("Sec-Fetch-Site");
    const origem = req.get("Origin");
    const referer = req.get("Referer");

    function bloquear() {
      return res.status(403).json({
        erro: "Origem da requisicao nao autorizada."
      });
    }

    // Nao confiamos em subdominios ou sites de outra origem.
    if (
      metadata &&
      !["same-origin", "none"].includes(metadata)
    ) {
      return bloquear();
    }

    if (origem) {
      return origem === origemAlvo ? next() : bloquear();
    }

    if (referer) {
      try {
        const origemReferer = new URL(referer).origin;
        return origemReferer === origemAlvo ? next() : bloquear();
      } catch {
        return bloquear();
      }
    }

    if (metadata === "same-origin") {
      return next();
    }

    // Ferramentas CLI e testes locais podem nao enviar cabecalhos
    // de navegador. Em producao, nao permitimos esse bypass.
    return producao ? bloquear() : next();
  };
}

module.exports = {
  criarProtecaoOrigem
};
