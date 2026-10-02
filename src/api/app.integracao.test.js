const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const request = require("supertest");

const { app } = require("./app");
const { pool } = require("../database/banco");

const {
  excluirProjetoNoBanco,
  excluirTarefaNoBanco
} = require("../repositories/projetos-banco");

test(
  "CRUD completo da API autenticada no PostgreSQL",
  async () => {
    const identificador =
      randomUUID();

    const nomeInicial =
      `Teste API ${identificador}`;

    const nomeEditado =
      `Teste API editado ${identificador}`;

    const emailUsuario =
      `teste-api-${identificador}@organizaai.local`;

    const senhaUsuario =
      "SenhaIntegracaoMuitoSegura123!";

    const agente =
      request.agent(app);

    let usuarioId = null;
    let projetoId = null;
    let tarefaId = null;

    try {
      // 1. Criar usuário e iniciar sessão
      const respostaCadastro =
        await agente
          .post("/auth/cadastro")
          .send({
            nome:
              "Usuário temporário da integração",
            email:
              emailUsuario,
            senha:
              senhaUsuario
          });

      assert.equal(
        respostaCadastro.status,
        201
      );

      assert.equal(
        respostaCadastro.body.mensagem,
        "Conta criada com sucesso."
      );

      usuarioId =
        respostaCadastro.body.usuario.id;

      assert.ok(usuarioId);

      // 2. Confirmar sessão autenticada
      const respostaUsuario =
        await agente
          .get("/auth/me");

      assert.equal(
        respostaUsuario.status,
        200
      );

      assert.equal(
        respostaUsuario.body.usuario.id,
        usuarioId
      );

      // 3. Criar projeto
      const respostaCriacaoProjeto =
        await agente
          .post("/projetos")
          .send({
            nome:
              nomeInicial,
            descricao:
              "Projeto temporário criado pelo teste automatizado da API."
          });

      assert.equal(
        respostaCriacaoProjeto.status,
        201
      );

      assert.equal(
        respostaCriacaoProjeto.body.nome,
        nomeInicial
      );

      projetoId =
        respostaCriacaoProjeto.body.id;

      assert.ok(projetoId);

      // 4. Editar projeto
      const respostaEdicaoProjeto =
        await agente
          .put(
            `/projetos/${projetoId}`
          )
          .send({
            nome:
              nomeEditado,
            descricao:
              "Projeto temporário editado pelo teste automatizado da API."
          });

      assert.equal(
        respostaEdicaoProjeto.status,
        200
      );

      assert.equal(
        respostaEdicaoProjeto.body.mensagem,
        "Projeto editado com sucesso."
      );

      assert.equal(
        respostaEdicaoProjeto.body.projeto.nome,
        nomeEditado
      );

      // 5. Criar tarefa
      const respostaCriacaoTarefa =
        await agente
          .post(
            `/projetos/${projetoId}/tarefas`
          )
          .send({
            titulo:
              "Tarefa temporária criada pela API"
          });

      assert.equal(
        respostaCriacaoTarefa.status,
        201
      );

      assert.equal(
        respostaCriacaoTarefa.body.projeto_id,
        projetoId
      );

      assert.equal(
        respostaCriacaoTarefa.body.titulo,
        "Tarefa temporária criada pela API"
      );

      assert.equal(
        respostaCriacaoTarefa.body.concluida,
        false
      );

      tarefaId =
        respostaCriacaoTarefa.body.id;

      assert.ok(tarefaId);

      // 6. Editar tarefa
      const respostaEdicaoTarefa =
        await agente
          .put(
            `/tarefas/${tarefaId}`
          )
          .send({
            titulo:
              "Tarefa temporária editada pela API"
          });

      assert.equal(
        respostaEdicaoTarefa.status,
        200
      );

      assert.equal(
        respostaEdicaoTarefa.body.mensagem,
        "Tarefa editada com sucesso."
      );

      assert.equal(
        respostaEdicaoTarefa.body.tarefa.titulo,
        "Tarefa temporária editada pela API"
      );

      // 7. Concluir tarefa
      const respostaConclusaoTarefa =
        await agente
          .patch(
            `/tarefas/${tarefaId}/concluir`
          );

      assert.equal(
        respostaConclusaoTarefa.status,
        200
      );

      assert.equal(
        respostaConclusaoTarefa.body.mensagem,
        "Tarefa concluída com sucesso."
      );

      assert.equal(
        respostaConclusaoTarefa.body.tarefa.concluida,
        true
      );

      // 8. Consultar projeto e tarefa
      const respostaConsulta =
        await agente
          .get("/projetos");

      assert.equal(
        respostaConsulta.status,
        200
      );

      assert.ok(
        Array.isArray(
          respostaConsulta.body
        )
      );

      const projetoEncontrado =
        respostaConsulta.body.find(
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
        projetoEncontrado.tarefas[0].id,
        tarefaId
      );

      assert.equal(
        projetoEncontrado.tarefas[0].titulo,
        "Tarefa temporária editada pela API"
      );

      assert.equal(
        projetoEncontrado.tarefas[0].concluida,
        true
      );

      // 9. Excluir tarefa
      const respostaExclusaoTarefa =
        await agente
          .delete(
            `/tarefas/${tarefaId}`
          );

      assert.equal(
        respostaExclusaoTarefa.status,
        200
      );

      assert.equal(
        respostaExclusaoTarefa.body.mensagem,
        "Tarefa excluída com sucesso."
      );

      assert.equal(
        respostaExclusaoTarefa.body.tarefa.id,
        tarefaId
      );

      tarefaId = null;

      // 10. Excluir projeto
      const respostaExclusaoProjeto =
        await agente
          .delete(
            `/projetos/${projetoId}`
          );

      assert.equal(
        respostaExclusaoProjeto.status,
        200
      );

      assert.equal(
        respostaExclusaoProjeto.body.mensagem,
        "Projeto excluído com sucesso."
      );

      assert.equal(
        respostaExclusaoProjeto.body.projeto.id,
        projetoId
      );

      projetoId = null;

      // 11. Confirmar que os dados temporários sumiram
      const respostaFinal =
        await agente
          .get("/projetos");

      assert.equal(
        respostaFinal.status,
        200
      );

      const projetoAindaExiste =
        respostaFinal.body.some(
          projeto =>
            projeto.nome ===
              nomeInicial ||
            projeto.nome ===
              nomeEditado
        );

      assert.equal(
        projetoAindaExiste,
        false
      );

      // 12. Encerrar a sessão
      const respostaLogout =
        await agente
          .post("/auth/logout");

      assert.equal(
        respostaLogout.status,
        200
      );

      const respostaDepoisLogout =
        await agente
          .get("/projetos");

      assert.equal(
        respostaDepoisLogout.status,
        401
      );
    } finally {
      // Limpeza de segurança caso alguma etapa falhe
      if (tarefaId) {
        try {
          await excluirTarefaNoBanco(
            tarefaId
          );
        } catch {}
      }

      if (projetoId) {
        try {
          await excluirProjetoNoBanco(
            projetoId
          );
        } catch {}
      }

      if (usuarioId) {
        try {
          await agente
            .post("/auth/logout");
        } catch {}

        try {
          await pool.query(
            `
              delete from public.usuarios
              where id = $1
            `,
            [usuarioId]
          );
        } catch {}
      }

      await pool.end();
    }
  }
);