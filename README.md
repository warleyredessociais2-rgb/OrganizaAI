# OrganizaAI

Aplicação para organização de projetos e tarefas, desenvolvida como projeto prático de aprendizagem em desenvolvimento de software, banco de dados e inteligência artificial.

## Objetivo

Construir uma aplicação completa de forma incremental, passando por fundamentos de programação, controle de versão, testes automatizados, banco de dados, arquitetura de software, APIs, front-end e recursos de inteligência artificial.

O projeto começou com persistência local em JSON e evoluiu para utilizar PostgreSQL como banco de dados principal.

Atualmente, o OrganizaAI funciona por meio de um menu no terminal e possui uma estrutura inicial organizada em camadas para preparar sua evolução para uma API e, posteriormente, uma interface web.

## Funcionalidades atuais

O OrganizaAI já permite:

- listar projetos;
- criar projetos;
- editar projetos;
- excluir projetos;
- adicionar tarefas;
- editar tarefas;
- concluir tarefas;
- excluir tarefas;
- armazenar projetos e tarefas em PostgreSQL;
- acessar o PostgreSQL pelo Node.js;
- utilizar o menu da aplicação conectado diretamente ao banco;
- executar testes automatizados do CRUD;
- executar teste de integração real com PostgreSQL;
- organizar o acesso ao banco em módulos dentro da pasta `src`.

## Banco de dados

A aplicação utiliza PostgreSQL hospedado no Supabase.

Atualmente existem duas tabelas principais:

- `projetos`;
- `tarefas`.

As tarefas são relacionadas aos projetos por meio de uma chave estrangeira.

A aplicação já realiza operações de:

- `INSERT`;
- `SELECT`;
- `UPDATE`;
- `DELETE`;
- `JOIN`.

As consultas utilizam parâmetros SQL, evitando a montagem direta dos comandos com dados fornecidos pelo usuário.

## Arquitetura atual

O projeto começou com todos os arquivos principais concentrados na raiz.

Com a evolução da aplicação, o acesso ao PostgreSQL começou a ser organizado dentro da pasta `src`.

Atualmente:

- `src/database` concentra a configuração da conexão com o PostgreSQL;
- `src/repositories` concentra as operações de acesso aos dados de projetos e tarefas;
- `app.js` continua responsável pela interação com o usuário através do terminal;
- os testes utilizam os mesmos módulos empregados pela aplicação.

Essa organização prepara o projeto para as próximas etapas de desenvolvimento, principalmente a criação de uma API.

## Tecnologias utilizadas

- JavaScript
- Node.js
- npm
- PostgreSQL
- Supabase
- `pg`
- `dotenv`
- Git
- GitHub
- JSON
- Node.js Test Runner

## Testes automatizados

O projeto mantém testes automatizados do CRUD original:

```bash
npm test
```

Resultado atual:

```text
tests 7
pass 7
fail 0
```

Também existe um teste de integração real com o PostgreSQL:

```bash
npm run test:banco
```

Resultado atual:

```text
tests 1
pass 1
fail 0
```

O teste de integração:

1. cria um projeto temporário;
2. cria uma tarefa;
3. edita o projeto;
4. edita a tarefa;
5. conclui a tarefa;
6. consulta os dados no PostgreSQL;
7. exclui a tarefa;
8. exclui o projeto;
9. realiza limpeza de segurança caso alguma etapa falhe.

Assim, o projeto principal utilizado pela aplicação não é alterado pelo teste.

Após a reorganização dos arquivos dentro da pasta `src`, os testes foram executados novamente para confirmar que a mudança de arquitetura não alterou o funcionamento da aplicação.

## Executando o projeto

Primeiro, instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` na raiz do projeto a partir do modelo:

```text
.env.example
```

Configure a variável de conexão:

```text
DATABASE_URL=sua_connection_string
```

Depois execute:

```bash
npm start
```

O OrganizaAI abrirá o menu no terminal.

## Menu atual

A aplicação possui as seguintes opções:

```text
1 - Listar projetos
2 - Criar projeto
3 - Editar projeto
4 - Adicionar tarefa
5 - Editar tarefa
6 - Concluir tarefa
7 - Excluir tarefa
8 - Excluir projeto
9 - Sair
```

As operações realizadas pelo menu são persistidas diretamente no PostgreSQL.

## Comandos disponíveis

Executar a aplicação:

```bash
npm start
```

Executar os testes do CRUD original:

```bash
npm test
```

Executar o teste de integração com PostgreSQL:

```bash
npm run test:banco
```

## Segurança

O arquivo `.env` contém informações privadas de conexão com o banco e não deve ser enviado para o GitHub.

O projeto utiliza `.gitignore` para impedir o versionamento desse arquivo.

O arquivo `.env.example` pode ser versionado porque contém apenas um modelo de configuração, sem credenciais reais.

Credenciais, senhas e strings reais de conexão nunca devem ser colocadas no README ou enviadas ao repositório público.

## Estrutura atual

```text
OrganizaAI
├── src
│   ├── database
│   │   └── banco.js
│   └── repositories
│       └── projetos-banco.js
├── app.js
├── projetos-banco.integracao.js
├── projetos.js
├── projetos.test.js
├── dados.js
├── dados.json
├── teste-banco.js
├── teste-leitura-banco.js
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
└── README.md
```

## Evolução do projeto

O OrganizaAI está sendo construído de forma incremental.

### Primeira etapa — persistência em JSON

A aplicação utilizava arquivos JSON para armazenar projetos e tarefas localmente.

Essa fase permitiu desenvolver e testar:

- estrutura de dados;
- criação de projetos;
- criação de tarefas;
- edição;
- conclusão;
- exclusão;
- persistência em arquivo;
- testes automatizados.

### Segunda etapa — PostgreSQL e Supabase

O projeto passou a utilizar PostgreSQL hospedado no Supabase.

Foram implementados:

- conexão entre Node.js e PostgreSQL;
- criação de tabelas;
- relacionamento entre projetos e tarefas;
- consultas SQL;
- CRUD completo no banco;
- leitura de projetos com suas tarefas;
- testes manuais de integração.

### Terceira etapa — menu integrado ao PostgreSQL

O menu principal do OrganizaAI passou a utilizar diretamente o PostgreSQL.

Com isso, as operações realizadas pelo usuário no terminal passaram a ser persistidas no banco de dados.

O fluxo completo foi testado manualmente, incluindo:

- criação de projeto;
- edição de projeto;
- criação de tarefa;
- edição de tarefa;
- conclusão de tarefa;
- exclusão de tarefa;
- exclusão de projeto;
- consulta dos dados armazenados.

### Quarta etapa — teste automatizado de integração

Foi adicionado um teste automatizado de integração com PostgreSQL.

Esse teste valida o CRUD diretamente no banco e remove automaticamente os dados temporários utilizados durante a execução.

Isso permite verificar que as funções de acesso ao PostgreSQL continuam funcionando após mudanças no código.

### Quinta etapa — organização da arquitetura

Os módulos responsáveis pelo acesso ao banco foram retirados da raiz do projeto e organizados dentro da pasta `src`.

A estrutura passou a utilizar:

```text
src/database
```

para a conexão com PostgreSQL e:

```text
src/repositories
```

para as operações de acesso aos dados.

Os caminhos utilizados pelo menu e pelos testes foram atualizados.

Depois da reorganização:

- os 7 testes do CRUD original continuaram passando;
- o teste de integração com PostgreSQL continuou passando;
- o menu da aplicação continuou funcionando;
- a leitura dos projetos armazenados no PostgreSQL foi validada;
- o encerramento da conexão com o banco continuou funcionando corretamente.

## Estado atual

Neste momento, o OrganizaAI possui:

- CRUD completo de projetos;
- CRUD completo de tarefas;
- persistência em PostgreSQL;
- integração com Supabase;
- menu de terminal conectado ao banco;
- consultas SQL parametrizadas;
- testes automatizados locais;
- teste automatizado de integração com PostgreSQL;
- estrutura inicial organizada em `src`;
- separação inicial entre conexão com banco e repositório de dados;
- controle de versão com Git;
- repositório remoto no GitHub.

A implementação antiga baseada em JSON ainda permanece no projeto como parte do histórico de aprendizagem e dos testes originais.

## Próximas etapas

A evolução planejada inclui:

- continuar melhorando a arquitetura e a organização dos módulos;
- ampliar a cobertura de testes;
- reduzir gradualmente a dependência da implementação antiga em JSON;
- criar uma API para o OrganizaAI;
- definir rotas para projetos e tarefas;
- conectar a API ao PostgreSQL;
- testar os endpoints da API;
- desenvolver uma interface web;
- adicionar autenticação de usuários;
- preparar a aplicação para publicação;
- publicar o OrganizaAI na web;
- explorar recursos de inteligência artificial.

## Status

Projeto em desenvolvimento contínuo.

O objetivo é utilizar cada nova etapa do OrganizaAI como oportunidade prática para aprender conceitos de desenvolvimento de software, banco de dados, arquitetura, APIs e inteligência artificial.