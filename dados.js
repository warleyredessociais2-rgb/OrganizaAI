const fs = require("fs");
const path = require("path");

const caminhoDados = path.join(__dirname, "dados.json");

function carregarDados() {
  if (!fs.existsSync(caminhoDados)) {
    return [];
  }

  const conteudo = fs.readFileSync(caminhoDados, "utf-8");

  if (!conteudo.trim()) {
    return [];
  }

  return JSON.parse(conteudo);
}

function salvarDados(projetos) {
  fs.writeFileSync(
    caminhoDados,
    JSON.stringify(projetos, null, 2),
    "utf-8"
  );
}

module.exports = {
  carregarDados,
  salvarDados
};