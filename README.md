# OrganizaAI

Aplicação para organização de projetos e tarefas, desenvolvida como projeto prático de aprendizagem em desenvolvimento de software, banco de dados, APIs, testes automatizados, arquitetura de software e inteligência artificial.

## Objetivo

Construir uma aplicação completa de forma incremental, utilizando cada etapa como oportunidade prática para aprender conceitos de desenvolvimento de software.

O OrganizaAI começou com persistência local em arquivos JSON e evoluiu para uma aplicação conectada a PostgreSQL, com menu de terminal, API REST utilizando Express e testes automatizados de integração.

A evolução planejada inclui interface web, autenticação, publicação na internet e exploração de recursos de inteligência artificial.

## Estado atual

Atualmente, o OrganizaAI possui:

- CRUD completo de projetos;
- CRUD completo de tarefas;
- persistência em PostgreSQL;
- banco hospedado no Supabase;
- menu de terminal conectado ao banco;
- API REST com Express;
- rotas para projetos e tarefas;
- consultas SQL parametrizadas;
- validação das requisições da API;
- tratamento de erros HTTP `400` e `404`;
- organização inicial em camadas;
- separação entre aplicação Express e servidor HTTP;
- testes automatizados do CRUD original;
- teste direto de integração com PostgreSQL;
- testes automatizados da API com Supertest;
- testes de validação HTTP `400`;
- testes de recursos inexistentes com HTTP `404`;
- teste completo da API contra o PostgreSQL real;
- limpeza automática dos dados temporários utilizados nos testes;
- controle de versão com Git;
- repositório remoto no GitHub.

A implementação antiga baseada em JSON ainda permanece no projeto como parte do histórico de aprendizagem e dos testes originais.

## Funcionalidades

O OrganizaAI permite:

- listar projetos;
- criar projetos;
- editar projetos;
- excluir projetos;
- adicionar tarefas a projetos;
- editar tarefas;
- concluir tarefas;
- excluir tarefas.

As operações principais são persistidas no PostgreSQL.

## Banco de dados

A aplicação utiliza PostgreSQL hospedado no Supabase.

Atualmente existem duas tabelas principais:

- `projetos`;
- `tarefas`.

As tarefas são relacionadas aos projetos por meio de uma chave estrangeira.

O acesso ao banco utiliza o pacote `pg` para Node.js.

A aplicação já executa operações SQL de:

- `INSERT`;
- `SELECT`;
- `UPDATE`;
- `DELETE`;
- `JOIN`.

As consultas utilizam parâmetros SQL, evitando a montagem direta de comandos com valores fornecidos pelo usuário.

## Arquitetura atual

A estrutura principal começou concentrada na raiz do projeto e está sendo reorganizada gradualmente em módulos dentro da pasta `src`.

Atualmente:

- `src/database` concentra a configuração da conexão com PostgreSQL;
- `src/repositories` concentra as operações de acesso aos dados;
- `src/api` concentra a API REST;
- `src/api/app.js` configura o Express e define as rotas;
- `src/api/servidor.js` é responsável apenas por iniciar o servidor HTTP;
- `app.js` mantém a aplicação de terminal;
- os testes utilizam os mesmos módulos usados pela aplicação.

A separação entre `app.js` da API e `servidor.js` permite testar o Express diretamente com Supertest sem precisar abrir manualmente a porta HTTP.

## API REST

A API utiliza Express.

Para iniciar:

```bash
npm run api
```

Por padrão, ela fica disponível em:

```text
http://localhost:3000
```

### Rotas disponíveis

#### Verificar funcionamento da API

```http
GET /
```

Resposta esperada:

```json
{
  "mensagem": "API do OrganizaAI funcionando."
}
```

#### Listar projetos

```http
GET /projetos
```

Retorna os projetos e suas respectivas tarefas.

#### Criar projeto

```http
POST /projetos
```

Exemplo de corpo:

```json
{
  "nome": "Meu projeto",
  "descricao": "Descrição do projeto"
}
```

#### Editar projeto

```http
PUT /projetos/:id
```

Exemplo de corpo:

```json
{
  "nome": "Novo nome",
  "descricao": "Nova descrição"
}
```

#### Excluir projeto

```http
DELETE /projetos/:id
```

#### Criar tarefa

```http
POST /projetos/:projetoId/tarefas
```

Exemplo de corpo:

```json
{
  "titulo": "Minha tarefa"
}
```

#### Editar tarefa

```http
PUT /tarefas/:id
```

Exemplo de corpo:

```json
{
  "titulo": "Novo título da tarefa"
}
```

#### Concluir tarefa

```http
PATCH /tarefas/:id/concluir
```

#### Excluir tarefa

```http
DELETE /tarefas/:id
```

## Validações da API

A API já possui validações incluindo:

- verificação de UUIDs;
- nome obrigatório para projetos;
- descrição de projeto em formato de texto;
- título obrigatório para tarefas;
- retorno `400` para dados ou identificadores inválidos;
- retorno `404` quando projetos ou tarefas não são encontrados;
- retorno `500` para erros internos inesperados.

As respostas `400` e `404` já possuem cobertura automatizada de testes.

## Tecnologias utilizadas

- JavaScript
- Node.js
- npm
- Express
- PostgreSQL
- Supabase
- `pg`
- `dotenv`
- Supertest
- Node.js Test Runner
- Git
- GitHub
- JSON

## Executando o projeto

Primeiro, instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` na raiz do projeto utilizando `.env.example` como referência.

Configure:

```text
DATABASE_URL=sua_connection_string
```

### Aplicação de terminal

Execute:

```bash
npm start
```

O OrganizaAI abrirá o menu no terminal.

### API REST

Execute:

```bash
npm run api
```

A API será iniciada, por padrão, em:

```text
http://localhost:3000
```

A porta também pode ser definida pela variável de ambiente `PORT`.

## Menu do terminal

A aplicação de terminal possui as seguintes opções:

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

As operações realizadas pelo menu são persistidas no PostgreSQL.

## Testes automatizados

O OrganizaAI possui diferentes níveis de testes.

### Testes executados por `npm test`

Execute:

```bash
npm test
```

Resultado atualmente validado:

```text
tests 22
pass 22
fail 0
```

Esse comando executa:

- 7 testes do CRUD original baseado em JSON;
- 14 testes da API, incluindo funcionamento básico e respostas HTTP `400` e `404`;
- 1 teste completo de integração da API com PostgreSQL.

### Teste direto do repositório PostgreSQL

Execute:

```bash
npm run test:banco
```

Resultado atualmente validado:

```text
tests 1
pass 1
fail 0
```

Esse teste exercita diretamente as funções do repositório de dados no PostgreSQL.

### Bateria completa

Execute:

```bash
npm run test:all
```

Esse comando executa:

```text
npm test
+
npm run test:banco
```

No estado atual do projeto, a bateria completa representa:

```text
23 testes
23 passando
0 falhas
```

## Testes HTTP da API

O arquivo:

```text
src/api/app.test.js
```

possui atualmente 14 testes.

Eles verificam:

- funcionamento do endpoint `GET /`;
- rejeição de projeto sem nome;
- rejeição de descrição de projeto que não seja texto;
- rejeição de UUID inválido em projeto;
- rejeição de UUID inválido ao criar tarefa;
- rejeição de UUID inválido ao editar tarefa;
- rejeição de UUID inválido ao concluir tarefa;
- rejeição de UUID inválido ao excluir tarefa;
- retorno `404` ao editar projeto inexistente;
- retorno `404` ao criar tarefa em projeto inexistente;
- retorno `404` ao editar tarefa inexistente;
- retorno `404` ao concluir tarefa inexistente;
- retorno `404` ao excluir tarefa inexistente;
- retorno `404` ao excluir projeto inexistente.

Os testes `404` utilizam UUIDs válidos gerados aleatoriamente para verificar a diferença entre um identificador inválido e um recurso que simplesmente não existe no banco.

## Teste de integração da API

O teste localizado em:

```text
src/api/app.integracao.test.js
```

utiliza Supertest e o PostgreSQL real.

Ele executa automaticamente o seguinte fluxo:

1. cria um projeto temporário pela API;
2. edita o projeto;
3. cria uma tarefa;
4. edita a tarefa;
5. conclui a tarefa;
6. consulta os dados;
7. confirma que projeto e tarefa foram persistidos corretamente;
8. exclui a tarefa;
9. exclui o projeto;
10. confirma que os dados temporários foram removidos.

O teste utiliza identificadores únicos e possui uma rotina de limpeza de segurança no bloco `finally`.

Assim, mesmo se alguma etapa falhar, o teste tenta excluir os registros temporários criados durante a execução.

## Teste direto do PostgreSQL

O arquivo:

```text
projetos-banco.integracao.js
```

testa diretamente o repositório PostgreSQL, sem passar pelas rotas HTTP.

Esse teste valida:

- criação de projeto;
- criação de tarefa;
- edição de projeto;
- edição de tarefa;
- conclusão de tarefa;
- consulta;
- exclusão de tarefa;
- exclusão de projeto;
- limpeza de segurança.

## Comandos disponíveis

### Aplicação de terminal

```bash
npm start
```

### API

```bash
npm run api
```

### Testes principais

```bash
npm test
```

### Integração direta com PostgreSQL

```bash
npm run test:banco
```

### Todos os testes

```bash
npm run test:all
```

## Segurança

O arquivo `.env` contém informações privadas de conexão com o banco de dados e não deve ser enviado para o GitHub.

O `.gitignore` deve impedir o versionamento desse arquivo.

O arquivo:

```text
.env.example
```

pode permanecer no repositório porque serve apenas como modelo de configuração e não deve conter credenciais reais.

Nunca devem ser adicionados ao repositório público:

- senha do PostgreSQL;
- `DATABASE_URL` real;
- tokens;
- chaves privadas;
- outras credenciais.

## Estrutura atual

```text
OrganizaAI
├── src
│   ├── api
│   │   ├── app.js
│   │   ├── app.test.js
│   │   ├── app.integracao.test.js
│   │   └── servidor.js
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

A primeira implementação armazenava projetos e tarefas localmente em arquivos JSON.

Essa fase permitiu aprender e testar:

- estruturas de dados;
- funções;
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
- tabelas para projetos e tarefas;
- relacionamento entre as tabelas;
- consultas SQL;
- CRUD completo;
- leitura de projetos com suas tarefas;
- integração real com o banco.

### Terceira etapa — menu integrado ao banco

O menu principal passou a utilizar o PostgreSQL como persistência.

Foram testadas manualmente:

- criação de projeto;
- edição de projeto;
- criação de tarefa;
- edição de tarefa;
- conclusão de tarefa;
- exclusão de tarefa;
- exclusão de projeto;
- consulta dos dados armazenados.

### Quarta etapa — integração automatizada com PostgreSQL

Foi criado um teste automatizado que executa o CRUD completo diretamente no PostgreSQL.

O teste utiliza dados temporários e remove esses dados ao final da execução.

### Quinta etapa — reorganização da arquitetura

Os módulos de banco de dados foram movidos para a pasta `src`.

A estrutura passou a separar:

```text
src/database
```

para conexão com o banco e:

```text
src/repositories
```

para operações de acesso aos dados.

### Sexta etapa — criação da API REST

Foi adicionado Express ao projeto.

A API passou a oferecer operações HTTP para projetos e tarefas.

Foram implementadas rotas para:

- listar projetos;
- criar projetos;
- editar projetos;
- excluir projetos;
- criar tarefas;
- editar tarefas;
- concluir tarefas;
- excluir tarefas.

### Sétima etapa — separação entre aplicação e servidor

A API foi dividida em:

```text
src/api/app.js
```

responsável pela aplicação Express e suas rotas, e:

```text
src/api/servidor.js
```

responsável apenas por iniciar a porta HTTP.

Essa separação tornou a API mais adequada para testes automatizados.

### Oitava etapa — testes da API com Supertest

Foi adicionado Supertest como dependência de desenvolvimento.

Primeiro, foi criado um teste para:

```http
GET /
```

Depois, foi criado um teste completo de integração da API com PostgreSQL.

A API passou a ser testada sem a necessidade de iniciar manualmente um servidor na porta `3000`.

### Nona etapa — comando unificado de testes

Foi criado:

```bash
npm run test:all
```

para executar a bateria completa de testes.

Também foi criado:

```bash
npm run api
```

para simplificar a inicialização da API.

### Décima etapa — testes de validação HTTP

A cobertura automatizada da API foi ampliada para verificar respostas de erro.

Foram adicionados testes para:

- requisições inválidas com resposta `400`;
- UUIDs inválidos;
- campos obrigatórios ausentes ou inválidos;
- projetos inexistentes com resposta `404`;
- tarefas inexistentes com resposta `404`.

No estado atualmente validado:

```text
23 testes
23 passando
0 falhas
```

## Próximas etapas

A evolução planejada inclui:

- adicionar testes para erros internos `500`;
- continuar ampliando a cobertura de testes;
- melhorar a organização dos módulos;
- separar responsabilidades da API em arquivos menores;
- criar controllers e/ou services conforme a evolução exigir;
- reduzir gradualmente a dependência da implementação antiga em JSON;
- desenvolver uma interface web;
- conectar a interface web à API;
- adicionar autenticação de usuários;
- preparar configurações para ambientes de desenvolvimento e produção;
- preparar a aplicação para publicação;
- publicar o OrganizaAI na web;
- explorar recursos de inteligência artificial.

## Status

Projeto em desenvolvimento contínuo.

A base atual já possui terminal, PostgreSQL, API REST e testes automatizados de integração e validação HTTP.

Atualmente, a bateria completa possui:

```text
23 testes
23 passando
0 falhas
```

O objetivo é utilizar cada nova etapa do OrganizaAI como oportunidade prática para aprender desenvolvimento de software, banco de dados, arquitetura, APIs, testes, publicação de aplicações e inteligência artificial.