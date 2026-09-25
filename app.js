const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("process");

const {
  criarProjeto,
  adicionarTarefa,
  concluirTarefaPorId,
  listarProjetos
} = require("./projetos");

const rl = readline.createInterface({
  input,
  output
});

function mostrarMenu() {
  console.log("\n==============================");
  console.log("         OrganizaAI");
  console.log("==============================");
  console.log("1 - Listar projetos");
  console.log("2 - Criar projeto");
  console.log("3 - Adicionar tarefa");
  console.log("4 - Concluir tarefa");
  console.log("5 - Sair");
  console.log("==============================");
}

function listarProjetosNaTela() {
  const projetos = listarProjetos();

  if (projetos.length === 0) {
    console.log("\nNenhum projeto cadastrado.");
    return;
  }

  console.log("\nProjetos:");

  projetos.forEach((projeto, indice) => {
    console.log(`\n${indice + 1}. ${projeto.nome}`);
    console.log(`   ${projeto.descricao}`);

    if (projeto.tarefas.length === 0) {
      console.log("   Nenhuma tarefa cadastrada.");
      return;
    }

    projeto.tarefas.forEach((tarefa, tarefaIndice) => {
      const status = tarefa.concluida ? "[x]" : "[ ]";

      console.log(
        `   ${tarefaIndice + 1}. ${status} ${tarefa.titulo}`
      );
    });
  });
}

async function selecionarProjeto() {
  const projetos = listarProjetos();

  if (projetos.length === 0) {
    console.log("\nNenhum projeto cadastrado.");
    return null;
  }

  console.log("\nEscolha um projeto:");

  projetos.forEach((projeto, indice) => {
    console.log(`${indice + 1} - ${projeto.nome}`);
  });

  const resposta = await rl.question(
    "\nNúmero do projeto: "
  );

  const indice = Number(resposta) - 1;

  if (
    Number.isNaN(indice) ||
    indice < 0 ||
    indice >= projetos.length
  ) {
    console.log("\nProjeto inválido.");
    return null;
  }

  return projetos[indice];
}

async function criarNovoProjeto() {
  const nome = await rl.question(
    "\nNome do projeto: "
  );

  const descricao = await rl.question(
    "Descrição do projeto: "
  );

  if (!nome.trim()) {
    console.log("\nO nome do projeto não pode ficar vazio.");
    return;
  }

  criarProjeto(
    nome.trim(),
    descricao.trim()
  );

  console.log("\nProjeto criado com sucesso.");
}

async function adicionarNovaTarefa() {
  const projeto = await selecionarProjeto();

  if (!projeto) {
    return;
  }

  const titulo = await rl.question(
    "\nTítulo da tarefa: "
  );

  if (!titulo.trim()) {
    console.log("\nO título da tarefa não pode ficar vazio.");
    return;
  }

  adicionarTarefa(
    projeto,
    titulo.trim()
  );

  console.log("\nTarefa adicionada com sucesso.");
}

async function concluirUmaTarefa() {
  const projeto = await selecionarProjeto();

  if (!projeto) {
    return;
  }

  if (projeto.tarefas.length === 0) {
    console.log("\nEsse projeto não possui tarefas.");
    return;
  }

  console.log("\nEscolha uma tarefa:");

  projeto.tarefas.forEach((tarefa, indice) => {
    const status = tarefa.concluida ? "[x]" : "[ ]";

    console.log(
      `${indice + 1} - ${status} ${tarefa.titulo}`
    );
  });

  const resposta = await rl.question(
    "\nNúmero da tarefa: "
  );

  const indice = Number(resposta) - 1;

  if (
    Number.isNaN(indice) ||
    indice < 0 ||
    indice >= projeto.tarefas.length
  ) {
    console.log("\nTarefa inválida.");
    return;
  }

  const tarefa = projeto.tarefas[indice];

  if (tarefa.concluida) {
    console.log("\nEssa tarefa já está concluída.");
    return;
  }

  concluirTarefaPorId(
    projeto,
    tarefa.id
  );

  console.log("\nTarefa concluída com sucesso.");
}

async function iniciarPrograma() {
  let executando = true;

  while (executando) {
    mostrarMenu();

    const opcao = await rl.question(
      "\nEscolha uma opção: "
    );

    switch (opcao.trim()) {
      case "1":
        listarProjetosNaTela();
        break;

      case "2":
        await criarNovoProjeto();
        break;

      case "3":
        await adicionarNovaTarefa();
        break;

      case "4":
        await concluirUmaTarefa();
        break;

      case "5":
        executando = false;
        console.log("\nOrganizaAI encerrado.");
        break;

      default:
        console.log("\nOpção inválida.");
    }
  }

  rl.close();
}

iniciarPrograma();