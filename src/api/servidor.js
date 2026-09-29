const express = require("express");

const {
  criarProjetoNoBanco,
  excluirProjetoNoBanco,
  listarProjetosComTarefas
} = require("../repositories/projetos-banco");

const app = express();

const PORTA = 3000;

app.use(express.json());

function idUuidValido(valor) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    valor
  );
}

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

app.post("/projetos", async (req, res) => {
  try {
    const {
      nome,
      descricao = ""
    } = req.body;

    if (
      typeof nome !== "string" ||
      !nome.trim()
    ) {
      return res.status(400).json({
        erro: "O nome do projeto é obrigatório."
      });
    }

    if (typeof descricao !== "string") {
      return res.status(400).json({
        erro: "A descrição do projeto deve ser um texto."
      });
    }

    const projetoCriado =
      await criarProjetoNoBanco(
        nome,
        descricao
      );

    res.status(201).json(projetoCriado);
  } catch (erro) {
    console.error(
      "Erro ao criar projeto pela API:"
    );

    console.error(erro);

    res.status(500).json({
      erro: "Não foi possível criar o projeto."
    });
  }
});

app.delete("/projetos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!idUuidValido(id)) {
      return res.status(400).json({
        erro: "O identificador do projeto é inválido."
      });
    }

    const projetoExcluido =
      await excluirProjetoNoBanco(id);

    res.json({
      mensagem: "Projeto excluído com sucesso.",
      projeto: projetoExcluido
    });
  } catch (erro) {
    if (erro.message === "Projeto não encontrado.") {
      return res.status(404).json({
        erro: "Projeto não encontrado."
      });
    }

    console.error(
      "Erro ao excluir projeto pela API:"
    );

    console.error(erro);

    res.status(500).json({
      erro: "Não foi possível excluir o projeto."
    });
  }
});

app.listen(PORTA, () => {
  console.log(
    `API do OrganizaAI rodando em http://localhost:${PORTA}`
  );
});