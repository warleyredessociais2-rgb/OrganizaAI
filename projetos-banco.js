const { pool } = require("./banco");

async function criarProjetoNoBanco(nome, descricao) {
  const nomeLimpo = nome.trim();
  const descricaoLimpa = descricao.trim();

  if (!nomeLimpo) {
    throw new Error("O nome do projeto não pode ficar vazio.");
  }

  const resultado = await pool.query(
    `
      insert into public.projetos (
        nome,
        descricao
      )
      values ($1, $2)
      returning
        id,
        nome,
        descricao,
        criado_em
    `,
    [
      nomeLimpo,
      descricaoLimpa
    ]
  );

  return resultado.rows[0];
}

async function editarProjetoNoBanco(
  projetoId,
  novoNome,
  novaDescricao
) {
  const nomeLimpo = novoNome.trim();
  const descricaoLimpa = novaDescricao.trim();

  if (!projetoId) {
    throw new Error("O identificador do projeto é obrigatório.");
  }

  if (!nomeLimpo) {
    throw new Error("O nome do projeto não pode ficar vazio.");
  }

  const resultado = await pool.query(
    `
      update public.projetos
      set
        nome = $1,
        descricao = $2
      where id = $3
      returning
        id,
        nome,
        descricao,
        criado_em
    `,
    [
      nomeLimpo,
      descricaoLimpa,
      projetoId
    ]
  );

  if (resultado.rowCount === 0) {
    throw new Error("Projeto não encontrado.");
  }

  return resultado.rows[0];
}

async function excluirProjetoNoBanco(projetoId) {
  if (!projetoId) {
    throw new Error("O identificador do projeto é obrigatório.");
  }

  const resultado = await pool.query(
    `
      delete from public.projetos
      where id = $1
      returning
        id,
        nome,
        descricao,
        criado_em
    `,
    [projetoId]
  );

  if (resultado.rowCount === 0) {
    throw new Error("Projeto não encontrado.");
  }

  return resultado.rows[0];
}

async function adicionarTarefaNoBanco(projetoId, titulo) {
  const tituloLimpo = titulo.trim();

  if (!projetoId) {
    throw new Error("O projeto é obrigatório.");
  }

  if (!tituloLimpo) {
    throw new Error("O título da tarefa não pode ficar vazio.");
  }

  const resultado = await pool.query(
    `
      insert into public.tarefas (
        projeto_id,
        titulo,
        concluida
      )
      values ($1, $2, false)
      returning
        id,
        projeto_id,
        titulo,
        concluida,
        criada_em
    `,
    [
      projetoId,
      tituloLimpo
    ]
  );

  return resultado.rows[0];
}

async function editarTarefaNoBanco(tarefaId, novoTitulo) {
  const tituloLimpo = novoTitulo.trim();

  if (!tarefaId) {
    throw new Error("O identificador da tarefa é obrigatório.");
  }

  if (!tituloLimpo) {
    throw new Error("O título da tarefa não pode ficar vazio.");
  }

  const resultado = await pool.query(
    `
      update public.tarefas
      set titulo = $1
      where id = $2
      returning
        id,
        projeto_id,
        titulo,
        concluida,
        criada_em
    `,
    [
      tituloLimpo,
      tarefaId
    ]
  );

  if (resultado.rowCount === 0) {
    throw new Error("Tarefa não encontrada.");
  }

  return resultado.rows[0];
}

async function concluirTarefaNoBanco(tarefaId) {
  if (!tarefaId) {
    throw new Error("O identificador da tarefa é obrigatório.");
  }

  const resultado = await pool.query(
    `
      update public.tarefas
      set concluida = true
      where id = $1
      returning
        id,
        projeto_id,
        titulo,
        concluida,
        criada_em
    `,
    [tarefaId]
  );

  if (resultado.rowCount === 0) {
    throw new Error("Tarefa não encontrada.");
  }

  return resultado.rows[0];
}

async function excluirTarefaNoBanco(tarefaId) {
  if (!tarefaId) {
    throw new Error("O identificador da tarefa é obrigatório.");
  }

  const resultado = await pool.query(
    `
      delete from public.tarefas
      where id = $1
      returning
        id,
        projeto_id,
        titulo,
        concluida,
        criada_em
    `,
    [tarefaId]
  );

  if (resultado.rowCount === 0) {
    throw new Error("Tarefa não encontrada.");
  }

  return resultado.rows[0];
}

async function listarProjetosComTarefas() {
  const resultado = await pool.query(`
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
    order by
      p.criado_em,
      t.criada_em
  `);

  const projetos = new Map();

  for (const linha of resultado.rows) {
    if (!projetos.has(linha.projeto_id)) {
      projetos.set(linha.projeto_id, {
        id: linha.projeto_id,
        nome: linha.projeto_nome,
        descricao: linha.projeto_descricao,
        criadoEm: linha.projeto_criado_em,
        tarefas: []
      });
    }

    if (linha.tarefa_id) {
      projetos.get(linha.projeto_id).tarefas.push({
        id: linha.tarefa_id,
        titulo: linha.tarefa_titulo,
        concluida: linha.tarefa_concluida,
        criadaEm: linha.tarefa_criada_em
      });
    }
  }

  return Array.from(projetos.values());
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