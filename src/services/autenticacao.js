const bcrypt = require("bcryptjs");

const CUSTO_HASH = 12;

async function gerarHashSenha(senha) {
  if (
    typeof senha !== "string" ||
    !senha
  ) {
    throw new Error(
      "A senha é obrigatória."
    );
  }

  return bcrypt.hash(
    senha,
    CUSTO_HASH
  );
}

async function verificarSenha(
  senha,
  senhaHash
) {
  if (
    typeof senha !== "string" ||
    !senha
  ) {
    return false;
  }

  if (
    typeof senhaHash !== "string" ||
    !senhaHash
  ) {
    return false;
  }

  return bcrypt.compare(
    senha,
    senhaHash
  );
}

module.exports = {
  gerarHashSenha,
  verificarSenha
};