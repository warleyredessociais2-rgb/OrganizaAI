const projetos = [];

function criarProjeto(nome, descricao) {
  const projeto = {
    nome: nome,
    descricao: descricao,
    tarefas: []
  };

  projetos.push(projeto);
}

criarProjeto(
  "OrganizaAI",
  "Projeto para aprender desenvolvimento de software e inteligência artificial."
);

console.log(projetos);