const {
  test
} = require("node:test");

const assert =
  require("node:assert/strict");

const {
  randomUUID
} = require("node:crypto");

const express =
  require("express");

const session =
  require("express-session");

const request =
  require("supertest");

const {
  criarRouterAutenticacao
} = require("../routes/autenticacao");

function criarAmbienteTeste() {
  const usuariosPorId =
    new Map();

  const usuariosPorEmail =
    new Map();

  async function criarUsuarioNoBanco(
    nome,
    email,
    senhaHash
  ) {
    const usuario = {
      id: randomUUID(),
      nome: nome.trim(),
      email:
        email
          .trim()
          .toLowerCase(),
      senhaHash,
      criadoEm:
        new Date().toISOString()
    };

    usuariosPorId.set(
      usuario.id,
      usuario
    );

    usuariosPorEmail.set(
      usuario.email,
      usuario
    );

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      criadoEm:
        usuario.criadoEm
    };
  }

  async function buscarUsuarioPorEmailNoBanco(
    email
  ) {
    const emailNormalizado =
      email
        .trim()
        .toLowerCase();

    return (
      usuariosPorEmail.get(
        emailNormalizado
      ) || null
    );
  }

  async function buscarUsuarioPorIdNoBanco(
    usuarioId
  ) {
    const usuario =
      usuariosPorId.get(
        usuarioId
      );

    if (!usuario) {
      return null;
    }

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      criadoEm:
        usuario.criadoEm
    };
  }

  async function gerarHashSenha(
    senha
  ) {
    return `hash:${senha}`;
  }

  async function verificarSenha(
    senha,
    senhaHash
  ) {
    return (
      senhaHash ===
      `hash:${senha}`
    );
  }

  const app =
    express();

  app.use(
    express.json()
  );

  app.use(
    session({
      secret:
        "segredo-exclusivo-dos-testes-do-organizaai",
      resave: false,
      saveUninitialized: false
    })
  );

  app.use(
    "/auth",
    criarRouterAutenticacao({
      criarUsuarioNoBanco,
      buscarUsuarioPorEmailNoBanco,
      buscarUsuarioPorIdNoBanco,
      gerarHashSenha,
      verificarSenha
    })
  );

  return {
    app
  };
}

test(
  "POST /auth/cadastro cria conta e inicia sessao",
  async () => {
    const {
      app
    } =
      criarAmbienteTeste();

    const agente =
      request.agent(app);

    const respostaCadastro =
      await agente
        .post("/auth/cadastro")
        .send({
          nome: "Usuário Teste",
          email:
            "USUARIO@EXEMPLO.COM",
          senha:
            "SenhaMuitoSegura123!"
        });

    assert.equal(
      respostaCadastro.status,
      201
    );

    assert.equal(
      respostaCadastro.body.mensagem,
      "Conta criada com sucesso."
    );

    assert.equal(
      respostaCadastro.body.usuario.nome,
      "Usuário Teste"
    );

    assert.equal(
      respostaCadastro.body.usuario.email,
      "usuario@exemplo.com"
    );

    assert.equal(
      respostaCadastro.body.usuario.senhaHash,
      undefined
    );

    const respostaMe =
      await agente
        .get("/auth/me");

    assert.equal(
      respostaMe.status,
      200
    );

    assert.equal(
      respostaMe.body.usuario.email,
      "usuario@exemplo.com"
    );
  }
);

test(
  "POST /auth/cadastro rejeita nome vazio",
  async () => {
    const {
      app
    } =
      criarAmbienteTeste();

    const resposta =
      await request(app)
        .post("/auth/cadastro")
        .send({
          nome: "   ",
          email:
            "usuario@exemplo.com",
          senha:
            "SenhaMuitoSegura123!"
        });

    assert.equal(
      resposta.status,
      400
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "O nome é obrigatório."
      }
    );
  }
);

test(
  "POST /auth/cadastro rejeita email invalido",
  async () => {
    const {
      app
    } =
      criarAmbienteTeste();

    const resposta =
      await request(app)
        .post("/auth/cadastro")
        .send({
          nome: "Usuário",
          email:
            "email-invalido",
          senha:
            "SenhaMuitoSegura123!"
        });

    assert.equal(
      resposta.status,
      400
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "Informe um e-mail válido."
      }
    );
  }
);

test(
  "POST /auth/cadastro rejeita senha com menos de 15 caracteres",
  async () => {
    const {
      app
    } =
      criarAmbienteTeste();

    const resposta =
      await request(app)
        .post("/auth/cadastro")
        .send({
          nome: "Usuário",
          email:
            "usuario@exemplo.com",
          senha:
            "SenhaCurta"
        });

    assert.equal(
      resposta.status,
      400
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "A senha deve ter pelo menos 15 caracteres."
      }
    );
  }
);

test(
  "POST /auth/cadastro rejeita email ja cadastrado",
  async () => {
    const {
      app
    } =
      criarAmbienteTeste();

    await request(app)
      .post("/auth/cadastro")
      .send({
        nome: "Primeiro Usuário",
        email:
          "usuario@exemplo.com",
        senha:
          "SenhaMuitoSegura123!"
      });

    const resposta =
      await request(app)
        .post("/auth/cadastro")
        .send({
          nome: "Segundo Usuário",
          email:
            "USUARIO@EXEMPLO.COM",
          senha:
            "OutraSenhaSegura456!"
        });

    assert.equal(
      resposta.status,
      409
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "Já existe uma conta com este e-mail."
      }
    );
  }
);

test(
  "POST /auth/login autentica usuario com credenciais corretas",
  async () => {
    const {
      app
    } =
      criarAmbienteTeste();

    await request(app)
      .post("/auth/cadastro")
      .send({
        nome: "Usuário",
        email:
          "usuario@exemplo.com",
        senha:
          "SenhaMuitoSegura123!"
      });

    const agente =
      request.agent(app);

    const respostaLogin =
      await agente
        .post("/auth/login")
        .send({
          email:
            "usuario@exemplo.com",
          senha:
            "SenhaMuitoSegura123!"
        });

    assert.equal(
      respostaLogin.status,
      200
    );

    assert.equal(
      respostaLogin.body.mensagem,
      "Login realizado com sucesso."
    );

    assert.equal(
      respostaLogin.body.usuario.email,
      "usuario@exemplo.com"
    );

    assert.equal(
      respostaLogin.body.usuario.senhaHash,
      undefined
    );

    const respostaMe =
      await agente
        .get("/auth/me");

    assert.equal(
      respostaMe.status,
      200
    );
  }
);

test(
  "POST /auth/login rejeita senha incorreta",
  async () => {
    const {
      app
    } =
      criarAmbienteTeste();

    await request(app)
      .post("/auth/cadastro")
      .send({
        nome: "Usuário",
        email:
          "usuario@exemplo.com",
        senha:
          "SenhaMuitoSegura123!"
      });

    const resposta =
      await request(app)
        .post("/auth/login")
        .send({
          email:
            "usuario@exemplo.com",
          senha:
            "SenhaIncorreta456!"
        });

    assert.equal(
      resposta.status,
      401
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "E-mail ou senha inválidos."
      }
    );
  }
);

test(
  "POST /auth/login usa a mesma resposta para email inexistente",
  async () => {
    const {
      app
    } =
      criarAmbienteTeste();

    const resposta =
      await request(app)
        .post("/auth/login")
        .send({
          email:
            "inexistente@exemplo.com",
          senha:
            "SenhaMuitoSegura123!"
        });

    assert.equal(
      resposta.status,
      401
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "E-mail ou senha inválidos."
      }
    );
  }
);

test(
  "GET /auth/me rejeita usuario nao autenticado",
  async () => {
    const {
      app
    } =
      criarAmbienteTeste();

    const resposta =
      await request(app)
        .get("/auth/me");

    assert.equal(
      resposta.status,
      401
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "Usuário não autenticado."
      }
    );
  }
);

test(
  "POST /auth/logout encerra a sessao",
  async () => {
    const {
      app
    } =
      criarAmbienteTeste();

    const agente =
      request.agent(app);

    await agente
      .post("/auth/cadastro")
      .send({
        nome: "Usuário",
        email:
          "usuario@exemplo.com",
        senha:
          "SenhaMuitoSegura123!"
      });

    const respostaAntes =
      await agente
        .get("/auth/me");

    assert.equal(
      respostaAntes.status,
      200
    );

    const respostaLogout =
      await agente
        .post("/auth/logout");

    assert.equal(
      respostaLogout.status,
      200
    );

    assert.deepEqual(
      respostaLogout.body,
      {
        mensagem:
          "Logout realizado com sucesso."
      }
    );

    const respostaDepois =
      await agente
        .get("/auth/me");

    assert.equal(
      respostaDepois.status,
      401
    );
  }
);