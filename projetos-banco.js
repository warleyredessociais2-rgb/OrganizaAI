const { pool } = require("./banco");

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
  listarProjetosComTarefas
};