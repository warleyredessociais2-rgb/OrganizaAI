const {
  pool
} = require("../database/banco");

function normalizarEmail(email) {
  return email
    .trim()
    .toLowerCase();
}

async function criarUsuarioNoBanco(
  nome,
  email,
  senhaHash
) {
  const nomeLimpo = nome.trim();
  const emailNormalizado =
    normalizarEmail(email);

  if (!nomeLimpo) {
    throw new Error(
      "O nome do usuário não pode ficar vazio."
    );
  }

  if (!emailNormalizado) {
    throw new Error(
      "O e-mail do usuário não pode ficar vazio."
    );
  }

  if (!senhaHash) {
    throw new Error(
      "O hash da senha é obrigatório."
    );
  }

  const resultado =
    await pool.query(
      `
        insert into public.usuarios (
          nome,
          email,
          senha_hash
        )
        values ($1, $2, $3)
        returning
          id,
          nome,
          email,
          criado_em
      `,
      [
        nomeLimpo,
        emailNormalizado,
        senhaHash
      ]
    );

  return resultado.rows[0];
}

async function buscarUsuarioPorEmailNoBanco(
  email
) {
  const emailNormalizado =
    normalizarEmail(email);

  const resultado =
    await pool.query(
      `
        select
          id,
          nome,
          email,
          senha_hash,
          criado_em
        from public.usuarios
        where email = $1
        limit 1
      `,
      [emailNormalizado]
    );

  if (resultado.rowCount === 0) {
    return null;
  }

  const usuario =
    resultado.rows[0];

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    senhaHash: usuario.senha_hash,
    criadoEm: usuario.criado_em
  };
}

async function buscarUsuarioPorIdNoBanco(
  usuarioId
) {
  const resultado =
    await pool.query(
      `
        select
          id,
          nome,
          email,
          criado_em
        from public.usuarios
        where id = $1
        limit 1
      `,
      [usuarioId]
    );

  if (resultado.rowCount === 0) {
    return null;
  }

  const usuario =
    resultado.rows[0];

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    criadoEm: usuario.criado_em
  };
}

module.exports = {
  criarUsuarioNoBanco,
  buscarUsuarioPorEmailNoBanco,
  buscarUsuarioPorIdNoBanco
};