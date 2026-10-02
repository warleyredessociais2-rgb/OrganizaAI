const {
  pool
} = require("../database/banco");

function validarUsuarioId(
  usuarioId
) {
  if (!usuarioId) {
    throw new Error(
      "O usuário é obrigatório."
    );
  }
}

async function criarProjetoNoBanco(
  usuarioId,
  nome,
  descricao
) {
  validarUsuarioId(
    usuarioId
  );

  const nomeLimpo =
    nome.trim();

  const descricaoLimpa =
    descricao.trim();

  if (!nomeLimpo) {
    throw new Error(
      "O nome do projeto não pode ficar vazio."
    );
  }

  const resultado =
    await pool.query(
      `
        insert into public.projetos (
          usuario_id,
          nome,
          descricao
        )
        values ($1, $2, $3)
        returning
          id,
          usuario_id,
          nome,
          descricao,
          criado_em
      `,
      [
        usuarioId,
        nomeLimpo,
        descricaoLimpa
      ]
    );

  return resultado.rows[0];
}

async function editarProjetoNoBanco(
  usuarioId,
  projetoId,
  novoNome,
  novaDescricao
) {
  validarUsuarioId(
    usuarioId
  );

  const nomeLimpo =
    novoNome.trim();

  const descricaoLimpa =
    novaDescricao.trim();

  if (!projetoId) {
    throw new Error(
      "O identificador do projeto é obrigatório."
    );
  }

  if (!nomeLimpo) {
    throw new Error(
      "O nome do projeto não pode ficar vazio."
    );
  }

  const resultado =
    await pool.query(
      `
        update public.projetos
        set
          nome = $1,
          descricao = $2
        where
          id = $3
          and usuario_id = $4
        returning
          id,
          usuario_id,
          nome,
          descricao,
          criado_em
      `,
      [
        nomeLimpo,
        descricaoLimpa,
        projetoId,
        usuarioId
      ]
    );

  if (
    resultado.rowCount === 0
  ) {
    throw new Error(
      "Projeto não encontrado."
    );
  }

  return resultado.rows[0];
}

async function excluirProjetoNoBanco(
  usuarioId,
  projetoId
) {
  validarUsuarioId(
    usuarioId
  );

  if (!projetoId) {
    throw new Error(
      "O identificador do projeto é obrigatório."
    );
  }

  const resultado =
    await pool.query(
      `
        delete from public.projetos
        where
          id = $1
          and usuario_id = $2
        returning
          id,
          usuario_id,
          nome,
          descricao,
          criado_em
      `,
      [
        projetoId,
        usuarioId
      ]
    );

  if (
    resultado.rowCount === 0
  ) {
    throw new Error(
      "Projeto não encontrado."
    );
  }

  return resultado.rows[0];
}

async function adicionarTarefaNoBanco(
  usuarioId,
  projetoId,
  titulo
) {
  validarUsuarioId(
    usuarioId
  );

  const tituloLimpo =
    titulo.trim();

  if (!projetoId) {
    throw new Error(
      "O projeto é obrigatório."
    );
  }

  if (!tituloLimpo) {
    throw new Error(
      "O título da tarefa não pode ficar vazio."
    );
  }

  const resultado =
    await pool.query(
      `
        insert into public.tarefas (
          projeto_id,
          titulo,
          concluida
        )
        select
          p.id,
          $1,
          false
        from public.projetos as p
        where
          p.id = $2
          and p.usuario_id = $3
        returning
          id,
          projeto_id,
          titulo,
          concluida,
          criada_em
      `,
      [
        tituloLimpo,
        projetoId,
        usuarioId
      ]
    );

  if (
    resultado.rowCount === 0
  ) {
    throw new Error(
      "Projeto não encontrado."
    );
  }

  return resultado.rows[0];
}

async function editarTarefaNoBanco(
  usuarioId,
  tarefaId,
  novoTitulo
) {
  validarUsuarioId(
    usuarioId
  );

  const tituloLimpo =
    novoTitulo.trim();

  if (!tarefaId) {
    throw new Error(
      "O identificador da tarefa é obrigatório."
    );
  }

  if (!tituloLimpo) {
    throw new Error(
      "O título da tarefa não pode ficar vazio."
    );
  }

  const resultado =
    await pool.query(
      `
        update public.tarefas as t
        set
          titulo = $1
        from public.projetos as p
        where
          t.id = $2
          and p.id = t.projeto_id
          and p.usuario_id = $3
        returning
          t.id,
          t.projeto_id,
          t.titulo,
          t.concluida,
          t.criada_em
      `,
      [
        tituloLimpo,
        tarefaId,
        usuarioId
      ]
    );

  if (
    resultado.rowCount === 0
  ) {
    throw new Error(
      "Tarefa não encontrada."
    );
  }

  return resultado.rows[0];
}

async function concluirTarefaNoBanco(
  usuarioId,
  tarefaId
) {
  validarUsuarioId(
    usuarioId
  );

  if (!tarefaId) {
    throw new Error(
      "O identificador da tarefa é obrigatório."
    );
  }

  const resultado =
    await pool.query(
      `
        update public.tarefas as t
        set
          concluida = true
        from public.projetos as p
        where
          t.id = $1
          and p.id = t.projeto_id
          and p.usuario_id = $2
        returning
          t.id,
          t.projeto_id,
          t.titulo,
          t.concluida,
          t.criada_em
      `,
      [
        tarefaId,
        usuarioId
      ]
    );

  if (
    resultado.rowCount === 0
  ) {
    throw new Error(
      "Tarefa não encontrada."
    );
  }

  return resultado.rows[0];
}

async function excluirTarefaNoBanco(
  usuarioId,
  tarefaId
) {
  validarUsuarioId(
    usuarioId
  );

  if (!tarefaId) {
    throw new Error(
      "O identificador da tarefa é obrigatório."
    );
  }

  const resultado =
    await pool.query(
      `
        delete from public.tarefas as t
        using public.projetos as p
        where
          t.id = $1
          and p.id = t.projeto_id
          and p.usuario_id = $2
        returning
          t.id,
          t.projeto_id,
          t.titulo,
          t.concluida,
          t.criada_em
      `,
      [
        tarefaId,
        usuarioId
      ]
    );

  if (
    resultado.rowCount === 0
  ) {
    throw new Error(
      "Tarefa não encontrada."
    );
  }

  return resultado.rows[0];
}

async function listarProjetosComTarefas(
  usuarioId
) {
  validarUsuarioId(
    usuarioId
  );

  const resultado =
    await pool.query(
      `
        select
          p.id as projeto_id,
          p.nome as projeto_nome,
          p.descricao as projeto_descricao,
          p.criado_em as projeto_criado_em,
          t.id as tarefa_id,
          t.titulo as tarefa_titulo,
          t.concluida as tarefa_concluida,
          t.criada_em as tarefa_criada_em
        from public.projetos as p
        left join public.tarefas as t
          on t.projeto_id = p.id
        where
          p.usuario_id = $1
        order by
          p.criado_em,
          t.criada_em
      `,
      [
        usuarioId
      ]
    );

  const projetos =
    new Map();

  for (
    const linha
    of resultado.rows
  ) {
    if (
      !projetos.has(
        linha.projeto_id
      )
    ) {
      projetos.set(
        linha.projeto_id,
        {
          id:
            linha.projeto_id,
          nome:
            linha.projeto_nome,
          descricao:
            linha.projeto_descricao,
          criadoEm:
            linha.projeto_criado_em,
          tarefas: []
        }
      );
    }

    if (linha.tarefa_id) {
      projetos
        .get(
          linha.projeto_id
        )
        .tarefas
        .push({
          id:
            linha.tarefa_id,
          titulo:
            linha.tarefa_titulo,
          concluida:
            linha.tarefa_concluida,
          criadaEm:
            linha.tarefa_criada_em
        });
    }
  }

  return Array.from(
    projetos.values()
  );
}

module.exports = {
  criarProjetoNoBanco,
  editarProjetoNoBanco,
  excluirProjetoNoBanco,
  adicionarTarefaNoBanco,
  editarTarefaNoBanco,
  concluirTarefaNoBanco,
  excluirTarefaNoBanco,
  listarProjetosComTarefas
};