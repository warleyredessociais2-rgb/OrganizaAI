const express = require("express");

const repositorioUsuariosPadrao = require(
  "../repositories/usuarios-banco"
);

const autenticacaoPadrao = require(
  "../services/autenticacao"
);

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

function regenerarSessao(req) {
  return new Promise(
    (resolve, reject) => {
      req.session.regenerate(
        erro => {
          if (erro) {
            reject(erro);
            return;
          }

          resolve();
        }
      );
    }
  );
}

function salvarSessao(req) {
  return new Promise(
    (resolve, reject) => {
      req.session.save(
        erro => {
          if (erro) {
            reject(erro);
            return;
          }

          resolve();
        }
      );
    }
  );
}

function destruirSessao(req) {
  return new Promise(
    (resolve, reject) => {
      req.session.destroy(
        erro => {
          if (erro) {
            reject(erro);
            return;
          }

          resolve();
        }
      );
    }
  );
}

function criarRouterAutenticacao(
  substituicoes = {}
) {
  const repositorioUsuarios = {
    ...repositorioUsuariosPadrao,
    ...substituicoes
  };

  const servicoAutenticacao = {
    ...autenticacaoPadrao,
    ...substituicoes
  };

  const {
    criarUsuarioNoBanco,
    buscarUsuarioPorEmailNoBanco,
    buscarUsuarioPorIdNoBanco
  } = repositorioUsuarios;

  const {
    gerarHashSenha,
    verificarSenha
  } = servicoAutenticacao;

  const router =
    express.Router();

  router.post(
    "/cadastro",
    async (req, res) => {
      try {
        const {
          nome,
          email,
          senha
        } = req.body || {};

        if (
          typeof nome !== "string" ||
          !nome.trim()
        ) {
          return res.status(400).json({
            erro:
              "O nome é obrigatório."
          });
        }

        if (
          typeof email !== "string" ||
          !emailValido(
            email.trim()
          )
        ) {
          return res.status(400).json({
            erro:
              "Informe um e-mail válido."
          });
        }

        if (
          typeof senha !== "string" ||
          senha.length < 15
        ) {
          return res.status(400).json({
            erro:
              "A senha deve ter pelo menos 15 caracteres."
          });
        }

        const usuarioExistente =
          await buscarUsuarioPorEmailNoBanco(
            email
          );

        if (usuarioExistente) {
          return res.status(409).json({
            erro:
              "Já existe uma conta com este e-mail."
          });
        }

        const senhaHash =
          await gerarHashSenha(
            senha
          );

        const usuarioCriado =
          await criarUsuarioNoBanco(
            nome,
            email,
            senhaHash
          );

        await regenerarSessao(req);

        req.session.usuarioId =
          usuarioCriado.id;

        await salvarSessao(req);

        res.status(201).json({
          mensagem:
            "Conta criada com sucesso.",
          usuario: usuarioCriado
        });
      } catch (erro) {
        if (erro.code === "23505") {
          return res.status(409).json({
            erro:
              "Já existe uma conta com este e-mail."
          });
        }

        console.error(
          "Erro ao cadastrar usuário:"
        );

        console.error(erro);

        res.status(500).json({
          erro:
            "Não foi possível criar a conta."
        });
      }
    }
  );

  router.post(
    "/login",
    async (req, res) => {
      try {
        const {
          email,
          senha
        } = req.body || {};

        if (
          typeof email !== "string" ||
          !email.trim() ||
          typeof senha !== "string" ||
          !senha
        ) {
          return res.status(400).json({
            erro:
              "E-mail e senha são obrigatórios."
          });
        }

        const usuario =
          await buscarUsuarioPorEmailNoBanco(
            email
          );

        if (!usuario) {
          return res.status(401).json({
            erro:
              "E-mail ou senha inválidos."
          });
        }

        const senhaValida =
          await verificarSenha(
            senha,
            usuario.senhaHash
          );

        if (!senhaValida) {
          return res.status(401).json({
            erro:
              "E-mail ou senha inválidos."
          });
        }

        await regenerarSessao(req);

        req.session.usuarioId =
          usuario.id;

        await salvarSessao(req);

        res.json({
          mensagem:
            "Login realizado com sucesso.",
          usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            criadoEm:
              usuario.criadoEm
          }
        });
      } catch (erro) {
        console.error(
          "Erro ao realizar login:"
        );

        console.error(erro);

        res.status(500).json({
          erro:
            "Não foi possível realizar o login."
        });
      }
    }
  );

  router.get(
    "/me",
    async (req, res) => {
      try {
        const usuarioId =
          req.session.usuarioId;

        if (!usuarioId) {
          return res.status(401).json({
            erro:
              "Usuário não autenticado."
          });
        }

        const usuario =
          await buscarUsuarioPorIdNoBanco(
            usuarioId
          );

        if (!usuario) {
          await destruirSessao(req);

          res.clearCookie(
            "organizaai.sid"
          );

          return res.status(401).json({
            erro:
              "Usuário não autenticado."
          });
        }

        res.json({
          usuario
        });
      } catch (erro) {
        console.error(
          "Erro ao consultar usuário autenticado:"
        );

        console.error(erro);

        res.status(500).json({
          erro:
            "Não foi possível consultar o usuário."
        });
      }
    }
  );

  router.post(
    "/logout",
    async (req, res) => {
      try {
        if (req.session) {
          await destruirSessao(req);
        }

        res.clearCookie(
          "organizaai.sid"
        );

        res.json({
          mensagem:
            "Logout realizado com sucesso."
        });
      } catch (erro) {
        console.error(
          "Erro ao realizar logout:"
        );

        console.error(erro);

        res.status(500).json({
          erro:
            "Não foi possível realizar o logout."
        });
      }
    }
  );

  return router;
}

module.exports = {
  criarRouterAutenticacao
};