const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");

const {
  pool
} = require("./src/database/banco");

const {
  criarUsuarioNoBanco,
  buscarUsuarioPorEmailNoBanco,
  buscarUsuarioPorIdNoBanco
} = require(
  "./src/repositories/usuarios-banco"
);

const {
  gerarHashSenha,
  verificarSenha
} = require(
  "./src/services/autenticacao"
);

test(
  "cadastro e consulta de usuario no PostgreSQL",
  async () => {
    const identificador =
      randomUUID();

    const nome =
      "Usuário de teste";

    const emailOriginal =
      `TESTE-${identificador}@ORGANIZAAI.LOCAL`;

    const emailNormalizado =
      emailOriginal.toLowerCase();

    const senha =
      "SenhaIntegracao123!";

    let usuarioId = null;

    try {
      const senhaHash =
        await gerarHashSenha(
          senha
        );

      const usuarioCriado =
        await criarUsuarioNoBanco(
          nome,
          emailOriginal,
          senhaHash
        );

      usuarioId =
        usuarioCriado.id;

      assert.ok(
        usuarioId
      );

      assert.equal(
        usuarioCriado.nome,
        nome
      );

      assert.equal(
        usuarioCriado.email,
        emailNormalizado
      );

      assert.equal(
        usuarioCriado.senhaHash,
        undefined
      );

      const usuarioPorEmail =
        await buscarUsuarioPorEmailNoBanco(
          emailNormalizado
        );

      assert.ok(
        usuarioPorEmail
      );

      assert.equal(
        usuarioPorEmail.id,
        usuarioId
      );

      assert.equal(
        usuarioPorEmail.email,
        emailNormalizado
      );

      assert.notEqual(
        usuarioPorEmail.senhaHash,
        senha
      );

      const senhaCorreta =
        await verificarSenha(
          senha,
          usuarioPorEmail.senhaHash
        );

      assert.equal(
        senhaCorreta,
        true
      );

      const usuarioPorId =
        await buscarUsuarioPorIdNoBanco(
          usuarioId
        );

      assert.ok(
        usuarioPorId
      );

      assert.equal(
        usuarioPorId.id,
        usuarioId
      );

      assert.equal(
        usuarioPorId.email,
        emailNormalizado
      );

      assert.equal(
        usuarioPorId.senhaHash,
        undefined
      );
    } finally {
      if (usuarioId) {
        await pool.query(
          `
            delete from public.usuarios
            where id = $1
          `,
          [usuarioId]
        );
      }

      await pool.end();
    }
  }
);