const express = require("express");
const path = require("node:path");

const repositorioPadrao = require(
  "../repositories/projetos-banco"
);

const {
  criarMiddlewareSessao
} = require("../config/sessao");

const {
  criarRouterAutenticacao
} = require("../routes/autenticacao");

const {
  exigirAutenticacao:
    exigirAutenticacaoPadrao
} = require(
  "../middlewares/exigir-autenticacao"
);

function criarApp(substituicoes = {}) {
  const repositorio = {
    ...repositorioPadrao,
    ...substituicoes
  };

  const {
    criarProjetoNoBanco,
    editarProjetoNoBanco,
    excluirProjetoNoBanco,
    adicionarTarefaNoBanco,
    editarTarefaNoBanco,
    concluirTarefaNoBanco,
    excluirTarefaNoBanco,
    listarProjetosComTarefas
  } = repositorio;

  const exigirAutenticacao =
    substituicoes.exigirAutenticacao ||
    exigirAutenticacaoPadrao;

  const app = express();

  const caminhoInterface = path.join(
    __dirname,
    "../../public"
  );

  app.use(express.json());

  app.use(
    criarMiddlewareSessao()
  );

  app.use(
    "/auth",
    criarRouterAutenticacao(
      substituicoes
    )
  );

  app.use(
    "/app",
    express.static(caminhoInterface)
  );

  function idUuidValido(valor) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      valor
    );
  }

  app.get("/", (req, res) => {
    res.json({
      mensagem:
        "API do OrganizaAI funcionando."
    });
  });

  app.use(
    "/projetos",
    exigirAutenticacao
  );

  app.use(
    "/tarefas",
    exigirAutenticacao
  );

  app.get(
    "/projetos",
    async (req, res) => {
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
          erro:
            "Não foi possível listar os projetos."
        });
      }
    }
  );

  app.post(
    "/projetos",
    async (req, res) => {
      try {
        const {
          nome,
          descricao = ""
        } = req.body || {};

        if (
          typeof nome !== "string" ||
          !nome.trim()
        ) {
          return res.status(400).json({
            erro:
              "O nome do projeto é obrigatório."
          });
        }

        if (
          typeof descricao !== "string"
        ) {
          return res.status(400).json({
            erro:
              "A descrição do projeto deve ser um texto."
          });
        }

        const projetoCriado =
          await criarProjetoNoBanco(
            nome,
            descricao
          );

        res
          .status(201)
          .json(projetoCriado);
      } catch (erro) {
        console.error(
          "Erro ao criar projeto pela API:"
        );

        console.error(erro);

        res.status(500).json({
          erro:
            "Não foi possível criar o projeto."
        });
      }
    }
  );

  app.put(
    "/projetos/:id",
    async (req, res) => {
      try {
        const {
          id
        } = req.params;

        const {
          nome,
          descricao = ""
        } = req.body || {};

        if (!idUuidValido(id)) {
          return res.status(400).json({
            erro:
              "O identificador do projeto é inválido."
          });
        }

        if (
          typeof nome !== "string" ||
          !nome.trim()
        ) {
          return res.status(400).json({
            erro:
              "O nome do projeto é obrigatório."
          });
        }

        if (
          typeof descricao !== "string"
        ) {
          return res.status(400).json({
            erro:
              "A descrição do projeto deve ser um texto."
          });
        }

        const projetoEditado =
          await editarProjetoNoBanco(
            id,
            nome,
            descricao
          );

        res.json({
          mensagem:
            "Projeto editado com sucesso.",
          projeto:
            projetoEditado
        });
      } catch (erro) {
        if (
          erro.message ===
          "Projeto não encontrado."
        ) {
          return res.status(404).json({
            erro:
              "Projeto não encontrado."
          });
        }

        console.error(
          "Erro ao editar projeto pela API:"
        );

        console.error(erro);

        res.status(500).json({
          erro:
            "Não foi possível editar o projeto."
        });
      }
    }
  );

  app.post(
    "/projetos/:projetoId/tarefas",
    async (req, res) => {
      try {
        const {
          projetoId
        } = req.params;

        const {
          titulo
        } = req.body || {};

        if (
          !idUuidValido(
            projetoId
          )
        ) {
          return res.status(400).json({
            erro:
              "O identificador do projeto é inválido."
          });
        }

        if (
          typeof titulo !== "string" ||
          !titulo.trim()
        ) {
          return res.status(400).json({
            erro:
              "O título da tarefa é obrigatório."
          });
        }

        const tarefaCriada =
          await adicionarTarefaNoBanco(
            projetoId,
            titulo
          );

        res
          .status(201)
          .json(tarefaCriada);
      } catch (erro) {
        if (
          erro.code === "23503"
        ) {
          return res.status(404).json({
            erro:
              "Projeto não encontrado."
          });
        }

        console.error(
          "Erro ao criar tarefa pela API:"
        );

        console.error(erro);

        res.status(500).json({
          erro:
            "Não foi possível criar a tarefa."
        });
      }
    }
  );

  app.put(
    "/tarefas/:id",
    async (req, res) => {
      try {
        const {
          id
        } = req.params;

        const {
          titulo
        } = req.body || {};

        if (!idUuidValido(id)) {
          return res.status(400).json({
            erro:
              "O identificador da tarefa é inválido."
          });
        }

        if (
          typeof titulo !== "string" ||
          !titulo.trim()
        ) {
          return res.status(400).json({
            erro:
              "O título da tarefa é obrigatório."
          });
        }

        const tarefaEditada =
          await editarTarefaNoBanco(
            id,
            titulo
          );

        res.json({
          mensagem:
            "Tarefa editada com sucesso.",
          tarefa:
            tarefaEditada
        });
      } catch (erro) {
        if (
          erro.message ===
          "Tarefa não encontrada."
        ) {
          return res.status(404).json({
            erro:
              "Tarefa não encontrada."
          });
        }

        console.error(
          "Erro ao editar tarefa pela API:"
        );

        console.error(erro);

        res.status(500).json({
          erro:
            "Não foi possível editar a tarefa."
        });
      }
    }
  );

  app.patch(
    "/tarefas/:id/concluir",
    async (req, res) => {
      try {
        const {
          id
        } = req.params;

        if (!idUuidValido(id)) {
          return res.status(400).json({
            erro:
              "O identificador da tarefa é inválido."
          });
        }

        const tarefaConcluida =
          await concluirTarefaNoBanco(
            id
          );

        res.json({
          mensagem:
            "Tarefa concluída com sucesso.",
          tarefa:
            tarefaConcluida
        });
      } catch (erro) {
        if (
          erro.message ===
          "Tarefa não encontrada."
        ) {
          return res.status(404).json({
            erro:
              "Tarefa não encontrada."
          });
        }

        console.error(
          "Erro ao concluir tarefa pela API:"
        );

        console.error(erro);

        res.status(500).json({
          erro:
            "Não foi possível concluir a tarefa."
        });
      }
    }
  );

  app.delete(
    "/tarefas/:id",
    async (req, res) => {
      try {
        const {
          id
        } = req.params;

        if (!idUuidValido(id)) {
          return res.status(400).json({
            erro:
              "O identificador da tarefa é inválido."
          });
        }

        const tarefaExcluida =
          await excluirTarefaNoBanco(
            id
          );

        res.json({
          mensagem:
            "Tarefa excluída com sucesso.",
          tarefa:
            tarefaExcluida
        });
      } catch (erro) {
        if (
          erro.message ===
          "Tarefa não encontrada."
        ) {
          return res.status(404).json({
            erro:
              "Tarefa não encontrada."
          });
        }

        console.error(
          "Erro ao excluir tarefa pela API:"
        );

        console.error(erro);

        res.status(500).json({
          erro:
            "Não foi possível excluir a tarefa."
        });
      }
    }
  );

  app.delete(
    "/projetos/:id",
    async (req, res) => {
      try {
        const {
          id
        } = req.params;

        if (!idUuidValido(id)) {
          return res.status(400).json({
            erro:
              "O identificador do projeto é inválido."
          });
        }

        const projetoExcluido =
          await excluirProjetoNoBanco(
            id
          );

        res.json({
          mensagem:
            "Projeto excluído com sucesso.",
          projeto:
            projetoExcluido
        });
      } catch (erro) {
        if (
          erro.message ===
          "Projeto não encontrado."
        ) {
          return res.status(404).json({
            erro:
              "Projeto não encontrado."
          });
        }

        console.error(
          "Erro ao excluir projeto pela API:"
        );

        console.error(erro);

        res.status(500).json({
          erro:
            "Não foi possível excluir o projeto."
        });
      }
    }
  );

  return app;
}

const app =
  criarApp();

module.exports = {
  app,
  criarApp
};