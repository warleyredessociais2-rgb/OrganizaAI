const {
  test
} = require("node:test");

const assert =
  require("node:assert/strict");

const {
  gerarHashSenha,
  verificarSenha
} = require("./autenticacao");

test(
  "gerarHashSenha cria um hash diferente da senha original",
  async () => {
    const senha =
      "SenhaSegura123!";

    const senhaHash =
      await gerarHashSenha(
        senha
      );

    assert.notEqual(
      senhaHash,
      senha
    );

    assert.equal(
      typeof senhaHash,
      "string"
    );

    assert.ok(
      senhaHash.length > 0
    );
  }
);

test(
  "verificarSenha aceita a senha correta",
  async () => {
    const senha =
      "SenhaSegura123!";

    const senhaHash =
      await gerarHashSenha(
        senha
      );

    const senhaValida =
      await verificarSenha(
        senha,
        senhaHash
      );

    assert.equal(
      senhaValida,
      true
    );
  }
);

test(
  "verificarSenha rejeita uma senha incorreta",
  async () => {
    const senhaHash =
      await gerarHashSenha(
        "SenhaSegura123!"
      );

    const senhaValida =
      await verificarSenha(
        "SenhaErrada456!",
        senhaHash
      );

    assert.equal(
      senhaValida,
      false
    );
  }
);