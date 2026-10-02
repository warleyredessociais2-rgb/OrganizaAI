const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");

const {
  pool
} = require("./src/database/banco");

const {
  criarUsuarioNoBanco
} = require(
  "./src/repositories/usuarios-banco"
);

const {
  criarProjetoNoBanco,
  editarProjetoNoBanco,
  excluirProjetoNoBanco,
  adicionarTarefaNoBanco,
  editarTarefaNoBanco,
  concluirTarefaNoBanco,
  excluirTarefaNoBanco,
  listarProjetosComTarefas
} = require(
  "./src/repositories/projetos-banco"
);

test(
  "CRUD e isolamento por usuario no PostgreSQL",
  async () => {
    const identificador =
      randomUUID();

    const nomeInicial =
      `Teste automático ${identificador}`;

    const nomeEditado =
      `Teste automático editado ${identificador}`;

    let usuarioPrincipalId = null;
    let outroUsuarioId = null;
    let projetoId = null;
    let tarefaId = null;

    try {
      const usuarioPrincipal =
        await criarUsuarioNoBanco(
          "Usuário principal do teste",
          `principal-${identificador}@organizaai.local`,
          "hash-temporario-de-integracao"
        );

      usuarioPrincipalId =
        usuarioPrincipal.id;

      const outroUsuario =
        await criarUsuarioNoBanco(
          "Outro usuário do teste",
          `outro-${identificador}@organizaai.local`,
          "hash-temporario-de-integracao"
        );

      outroUsuarioId =
        outroUsuario.id;

      const projetoCriado =
        await criarProjetoNoBanco(
          usuarioPrincipalId,
          nomeInicial,
          "Projeto temporário criado pelo teste automatizado."
        );

      projetoId =
        projetoCriado.id;

      assert.equal(
        projetoCriado.nome,
        nomeInicial
      );

      assert.equal(
        projetoCriado.usuario_id,
        usuarioPrincipalId
      );

      const projetosPrincipal =
        await listarProjetosComTarefas(
          usuarioPrincipalId
        );

      assert.ok(
        projetosPrincipal.some(
          projeto =>
            projeto.id === projetoId
        )
      );

      const projetosOutroUsuario =
        await listarProjetosComTarefas(
          outroUsuarioId
        );

      assert.equal(
        projetosOutroUsuario.some(
          projeto =>
            projeto.id === projetoId
        ),
        false
      );

      await assert.rejects(
        () =>
          editarProjetoNoBanco(
            outroUsuarioId,
            projetoId,
            "Tentativa indevida",
            "Outro usuário não pode editar."
          ),
        {
          message:
            "Projeto não encontrado."
        }
      );

      await assert.rejects(
        () =>
          adicionarTarefaNoBanco(
            outroUsuarioId,
            projetoId,
            "Tentativa indevida"
          ),
        {
          message:
            "Projeto não encontrado."
        }
      );

      const tarefaCriada =
        await adicionarTarefaNoBanco(
          usuarioPrincipalId,
          projetoId,
          "Tarefa temporária"
        );

      tarefaId =
        tarefaCriada.id;

      assert.equal(
        tarefaCriada.projeto_id,
        projetoId
      );

      assert.equal(
        tarefaCriada.titulo,
        "Tarefa temporária"
      );

      assert.equal(
        tarefaCriada.concluida,
        false
      );

      await assert.rejects(
        () =>
          editarTarefaNoBanco(
            outroUsuarioId,
            tarefaId,
            "Tentativa indevida"
          ),
        {
          message:
            "Tarefa não encontrada."
        }
      );

      await assert.rejects(
        () =>
          concluirTarefaNoBanco(
            outroUsuarioId,
            tarefaId
          ),
        {
          message:
            "Tarefa não encontrada."
        }
      );

      await assert.rejects(
        () =>
          excluirTarefaNoBanco(
            outroUsuarioId,
            tarefaId
          ),
        {
          message:
            "Tarefa não encontrada."
        }
      );

      const projetoEditado =
        await editarProjetoNoBanco(
          usuarioPrincipalId,
          projetoId,
          nomeEditado,
          "Descrição editada pelo teste automatizado."
        );

      assert.equal(
        projetoEditado.nome,
        nomeEditado
      );

      const tarefaEditada =
        await editarTarefaNoBanco(
          usuarioPrincipalId,
          tarefaId,
          "Tarefa temporária editada"
        );

      assert.equal(
        tarefaEditada.titulo,
        "Tarefa temporária editada"
      );

      const tarefaConcluida =
        await concluirTarefaNoBanco(
          usuarioPrincipalId,
          tarefaId
        );

      assert.equal(
        tarefaConcluida.concluida,
        true
      );

      const projetos =
        await listarProjetosComTarefas(
          usuarioPrincipalId
        );

      const projetoEncontrado =
        projetos.find(
          projeto =>
            projeto.id === projetoId
        );

      assert.ok(
        projetoEncontrado
      );

      assert.equal(
        projetoEncontrado.nome,
        nomeEditado
      );

      assert.equal(
        projetoEncontrado.tarefas.length,
        1
      );

      assert.equal(
        projetoEncontrado.tarefas[0].titulo,
        "Tarefa temporária editada"
      );

      assert.equal(
        projetoEncontrado.tarefas[0].concluida,
        true
      );

      const tarefaExcluida =
        await excluirTarefaNoBanco(
          usuarioPrincipalId,
          tarefaId
        );

      assert.equal(
        tarefaExcluida.id,
        tarefaId
      );

      tarefaId = null;

      const projetoExcluido =
        await excluirProjetoNoBanco(
          usuarioPrincipalId,
          projetoId
        );

      assert.equal(
        projetoExcluido.id,
        projetoId
      );

      projetoId = null;
    } finally {
      if (
        tarefaId &&
        usuarioPrincipalId
      ) {
        try {
          await excluirTarefaNoBanco(
            usuarioPrincipalId,
            tarefaId
          );
        } catch {}
      }

      if (
        projetoId &&
        usuarioPrincipalId
      ) {
        try {
          await excluirProjetoNoBanco(
            usuarioPrincipalId,
            projetoId
          );
        } catch {}
      }

      if (usuarioPrincipalId) {
        try {
          await pool.query(
            `
              delete from public.usuarios
              where id = $1
            `,
            [usuarioPrincipalId]
          );
        } catch {}
      }

      if (outroUsuarioId) {
        try {
          await pool.query(
            `
              delete from public.usuarios
              where id = $1
            `,
            [outroUsuarioId]
          );
        } catch {}
      }

      await pool.end();
    }
  }
);