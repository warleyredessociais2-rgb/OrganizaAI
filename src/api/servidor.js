const express = require("express");

const {
  listarProjetosComTarefas
} = require("../repositories/projetos-banco");

const app = express();

const PORTA = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    mensagem: "API do OrganizaAI funcionando."
  });
});

app.get("/projetos", async (req, res) => {
  try {
    const projetos =
      await listarProjetosComTarefas();

    res.json(projetos);
  } catch (erro) {
    console.error(
      "Erro ao listar projetos pela API:"
    );

    console.error(erro);

    res.status(500).json({
      erro: "Não foi possível listar os projetos."
    });
  }
});

app.listen(PORTA, () => {
  console.log(
    `API do OrganizaAI rodando em http://localhost:${PORTA}`
  );
});