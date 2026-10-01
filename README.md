# OrganizaAI

Aplicação para organização de projetos e tarefas, desenvolvida como projeto prático de aprendizagem em desenvolvimento de software, banco de dados, APIs, testes automatizados, arquitetura de software e inteligência artificial.

O projeto evoluiu de uma implementação local baseada em JSON para uma aplicação com PostgreSQL, API REST e interface web integrada.

## Objetivo

Construir uma aplicação completa de forma incremental, utilizando cada etapa como oportunidade prática para aprender conceitos reais de desenvolvimento de software.

O OrganizaAI já passou pelas seguintes grandes fases:

- persistência local em JSON;
- integração com PostgreSQL;
- banco hospedado no Supabase;
- aplicação de terminal;
- API REST com Express;
- testes automatizados;
- testes de integração;
- tratamento de erros HTTP;
- reorganização gradual da arquitetura;
- interface web integrada à API.

A evolução futura poderá incluir autenticação, publicação na internet, melhorias arquiteturais e recursos de inteligência artificial.

---

# Estado atual

Atualmente, o OrganizaAI possui:

- CRUD completo de projetos;
- CRUD completo de tarefas;
- persistência em PostgreSQL;
- banco hospedado no Supabase;
- aplicação de terminal;
- API REST com Express;
- interface web integrada à API;
- consultas SQL parametrizadas;
- validação das requisições;
- tratamento de erros HTTP `400`, `404` e `500`;
- organização inicial em camadas;
- separação entre aplicação Express e servidor HTTP;
- testes automatizados;
- testes de integração com PostgreSQL;
- testes da API com Supertest;
- controle de versão com Git;
- repositório remoto no GitHub.

A implementação antiga baseada em JSON permanece no projeto como parte do histórico de aprendizagem e dos testes originais.

---

# Interface Web v1

O OrganizaAI possui atualmente uma interface web funcional servida pela própria aplicação Express.

Com a API em execução:

```bash
npm run api
```

a interface pode ser acessada em:

```text
http://localhost:3000/app/
```

Os arquivos da interface ficam em:

```text
public/
```

Atualmente:

```text
public/
├── index.html
├── app.js
└── styles.css
```

A aplicação Express disponibiliza essa pasta por meio de:

```javascript
app.use(
  "/app",
  express.static(caminhoInterface)
);
```

## Funcionalidades da interface

A interface web permite:

- visualizar projetos;
- criar projetos;
- editar projetos;
- excluir projetos;
- visualizar tarefas;
- adicionar tarefas;
- editar tarefas;
- concluir tarefas;
- excluir tarefas.

Todas essas operações utilizam a API REST e são persistidas no PostgreSQL.

---

# Experiência da interface

Além do CRUD principal, a Interface Web v1 possui recursos de experiência de uso adicionados gradualmente.

## Modais

As operações de edição utilizam janelas modais próprias da interface.

Existem modais para:

- editar projeto;
- editar tarefa;
- confirmar exclusão de projeto;
- confirmar exclusão de tarefa.

As confirmações de exclusão substituem confirmações simples do navegador e deixam o fluxo visualmente integrado ao sistema.

---

## Notificações flutuantes

Mensagens de sucesso e erro aparecem como notificações flutuantes no canto superior direito da tela.

Exemplos:

```text
Projeto criado com sucesso.
Projeto editado com sucesso.
Projeto excluído com sucesso.
Tarefa criada com sucesso.
Tarefa editada com sucesso.
Tarefa concluída com sucesso.
Tarefa excluída com sucesso.
```

As notificações desaparecem automaticamente após alguns segundos.

---

## Estados de carregamento

Durante operações assíncronas, os botões informam visualmente que uma ação está sendo processada.

Exemplos:

```text
Criando...
Adicionando...
Salvando...
Excluindo...
Concluindo...
Atualizando...
```

Enquanto a operação está em andamento, o botão correspondente é temporariamente desabilitado para reduzir cliques duplicados.

---

# Progresso dos projetos

Cada projeto possui um resumo automático de progresso.

Exemplo:

```text
1 de 2 tarefas concluídas                    50%
```

Também é exibida uma barra de progresso visual.

O percentual é calculado no navegador a partir das tarefas já retornadas pela API.

Nenhum campo adicional de progresso precisa ser salvo no banco.

O cálculo segue a relação:

```text
tarefas concluídas / total de tarefas
```

Se um projeto não possui tarefas, seu progresso é considerado:

```text
0%
```

---

# Filtros de tarefas

Cada projeto possui filtros para facilitar a visualização das tarefas.

Exemplo:

```text
Todas (2)
Pendentes (1)
Concluídas (1)
```

Os filtros são executados diretamente no navegador.

Não é necessário realizar uma nova consulta ao PostgreSQL ao alternar entre:

- todas;
- pendentes;
- concluídas.

Os contadores também são calculados automaticamente a partir das tarefas do projeto.

---

# Resumo geral

A Interface Web v1 possui um painel de indicadores gerais.

São exibidos quatro números:

```text
Projetos
Tarefas
Pendentes
Concluídas
```

Os valores são calculados automaticamente a partir dos dados retornados pela API.

Exemplo de estado atualmente utilizado durante o desenvolvimento:

```text
Projetos: 1
Tarefas: 2
Pendentes: 1
Concluídas: 1
```

Os indicadores são recalculados sempre que os projetos são novamente carregados.

Isso significa que operações como criação, exclusão ou conclusão de tarefas atualizam o resumo após a atualização da lista.

---

# Busca de projetos e tarefas

A Interface Web v1 também possui busca rápida.

O campo permite pesquisar:

- nome do projeto;
- descrição do projeto;
- título de tarefa.

Exemplo:

```text
GitHub
```

pode localizar um projeto que possua uma tarefa como:

```text
Aprender Git e GitHub
```

A busca acontece no navegador utilizando os projetos já carregados.

Não é realizada uma nova consulta ao banco a cada caractere digitado.

A comparação também normaliza o texto para facilitar buscas independentemente de:

- letras maiúsculas ou minúsculas;
- acentos.

A interface informa a quantidade de correspondências encontradas.

Exemplo:

```text
1 projeto encontrado • 1 tarefa correspondente
```

Existe também o botão:

```text
Limpar
```

para remover rapidamente o filtro de busca e restaurar a lista completa.

---

# Responsividade

A interface possui estilos responsivos.

Em telas maiores:

- os painéis principais aparecem lado a lado;
- os quatro indicadores do resumo geral aparecem em uma única linha.

Em telas intermediárias:

- o conteúdo se reorganiza;
- os indicadores podem aparecer em duas colunas.

Em telas menores:

- os painéis passam para uma coluna;
- os indicadores passam para uma coluna;
- botões e formulários são reorganizados;
- filtros de tarefas são adaptados;
- os modais ocupam uma largura apropriada para celular.

---

# Banco de dados

A aplicação utiliza PostgreSQL hospedado no Supabase.

Atualmente existem duas tabelas principais:

- `projetos`;
- `tarefas`.

As tarefas são relacionadas aos projetos por meio de uma chave estrangeira.

O acesso ao banco utiliza:

```text
pg
```

para Node.js.

A aplicação executa operações SQL de:

- `INSERT`;
- `SELECT`;
- `UPDATE`;
- `DELETE`;
- `JOIN`.

As consultas utilizam parâmetros SQL, evitando a montagem direta de comandos com valores fornecidos pelo usuário.

---

# Arquitetura atual

A aplicação está organizada gradualmente em módulos.

A estrutura principal é:

```text
src/database
```

responsável pela conexão com PostgreSQL;

```text
src/repositories
```

responsável pelas operações de acesso aos dados;

```text
src/api
```

responsável pela API REST;

```text
public
```

responsável pela interface web.

O arquivo:

```text
src/api/app.js
```

configura a aplicação Express, suas rotas e a interface estática.

O arquivo:

```text
src/api/servidor.js
```

é responsável por iniciar o servidor HTTP.

A aplicação de terminal continua disponível em:

```text
app.js
```

---

# Criação configurável da aplicação

A API possui a função:

```javascript
criarApp()
```

Essa função cria uma instância da aplicação Express.

Por padrão, utiliza o repositório PostgreSQL real.

Durante os testes, funções específicas do repositório podem ser substituídas por implementações simuladas.

Isso permite testar cenários de erro interno `500` sem precisar provocar falhas reais no PostgreSQL.

A aplicação padrão continua sendo exportada como:

```javascript
app
```

A separação entre aplicação Express e servidor HTTP permite utilizar Supertest sem precisar iniciar manualmente a porta `3000`.

---

# API REST

A API utiliza Express.

Para iniciar:

```bash
npm run api
```

Por padrão:

```text
http://localhost:3000
```

## Verificar funcionamento

```http
GET /
```

Resposta:

```json
{
  "mensagem": "API do OrganizaAI funcionando."
}
```

---

## Listar projetos

```http
GET /projetos
```

Retorna projetos e suas respectivas tarefas.

---

## Criar projeto

```http
POST /projetos
```

Exemplo:

```json
{
  "nome": "Meu projeto",
  "descricao": "Descrição do projeto"
}
```

---

## Editar projeto

```http
PUT /projetos/:id
```

Exemplo:

```json
{
  "nome": "Novo nome",
  "descricao": "Nova descrição"
}
```

---

## Excluir projeto

```http
DELETE /projetos/:id
```

---

## Criar tarefa

```http
POST /projetos/:projetoId/tarefas
```

Exemplo:

```json
{
  "titulo": "Minha tarefa"
}
```

---

## Editar tarefa

```http
PUT /tarefas/:id
```

Exemplo:

```json
{
  "titulo": "Novo título da tarefa"
}
```

---

## Concluir tarefa

```http
PATCH /tarefas/:id/concluir
```

---

## Excluir tarefa

```http
DELETE /tarefas/:id
```

---

# Validações e erros da API

A API possui validações incluindo:

- verificação de UUIDs;
- nome obrigatório para projetos;
- descrição de projeto em formato de texto;
- título obrigatório para tarefas;
- retorno `400` para dados ou identificadores inválidos;
- retorno `404` quando projetos ou tarefas não são encontrados;
- retorno `500` para erros internos inesperados.

Os principais cenários possuem cobertura automatizada.

---

# Tecnologias utilizadas

## Backend

- JavaScript
- Node.js
- Express
- PostgreSQL
- Supabase
- `pg`
- `dotenv`

## Frontend

- HTML
- CSS
- JavaScript
- Fetch API
- HTML Dialog API

## Testes

- Node.js Test Runner
- Supertest

## Versionamento

- Git
- GitHub

## Histórico

- JSON

---

# Executando o projeto

## Instalar dependências

```bash
npm install
```

## Configurar ambiente

Crie:

```text
.env
```

na raiz do projeto.

Utilize:

```text
.env.example
```

como referência.

Configure:

```text
DATABASE_URL=sua_connection_string
```

Nunca coloque a connection string real no GitHub.

---

# Aplicação de terminal

Execute:

```bash
npm start
```

O menu será aberto no terminal.

---

# API e interface web

Execute:

```bash
npm run api
```

A API será iniciada em:

```text
http://localhost:3000
```

A interface web ficará disponível em:

```text
http://localhost:3000/app/
```

A porta também pode ser definida pela variável:

```text
PORT
```

---

# Menu do terminal

A aplicação de terminal possui:

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

As operações utilizam PostgreSQL.

---

# Testes automatizados

O OrganizaAI possui diferentes níveis de testes.

## Testes principais

Execute:

```bash
npm test
```

Na bateria registrada durante a fase de desenvolvimento da API:

```text
tests 30
pass 30
fail 0
```

Essa bateria inclui:

- 7 testes do CRUD original baseado em JSON;
- 22 testes da API;
- 1 teste completo de integração da API com PostgreSQL.

---

# Teste direto do PostgreSQL

Execute:

```bash
npm run test:banco
```

Na validação registrada:

```text
tests 1
pass 1
fail 0
```

Esse teste exercita diretamente o repositório PostgreSQL.

---

# Bateria completa

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

A bateria completa registrada na fase de backend possui:

```text
31 testes
31 passando
0 falhas
```

---

# Testes HTTP da API

O arquivo:

```text
src/api/app.test.js
```

possui 22 testes registrados para a API.

Eles verificam:

- funcionamento de `GET /`;
- projeto sem nome;
- descrição de projeto inválida;
- UUID inválido em projeto;
- UUID inválido ao criar tarefa;
- UUID inválido ao editar tarefa;
- UUID inválido ao concluir tarefa;
- UUID inválido ao excluir tarefa;
- projeto inexistente;
- tarefa inexistente;
- erros internos ao listar;
- erros internos ao criar;
- erros internos ao editar;
- erros internos ao concluir;
- erros internos ao excluir.

A cobertura inclui respostas:

```text
400
404
500
```

---

# Testes de erros internos 500

Os testes utilizam:

```javascript
criarApp()
```

para substituir temporariamente funções do repositório.

As funções simuladas lançam:

```text
Falha interna simulada.
```

Os seguintes fluxos possuem cenários de erro interno:

```http
GET /projetos
POST /projetos
PUT /projetos/:id
POST /projetos/:projetoId/tarefas
PUT /tarefas/:id
PATCH /tarefas/:id/concluir
DELETE /tarefas/:id
DELETE /projetos/:id
```

Esses testes não precisam interromper o PostgreSQL real.

---

# Teste de integração da API

O arquivo:

```text
src/api/app.integracao.test.js
```

utiliza Supertest e PostgreSQL real.

O fluxo automatizado:

1. cria projeto temporário;
2. edita o projeto;
3. cria tarefa;
4. edita a tarefa;
5. conclui a tarefa;
6. consulta os dados;
7. confirma a persistência;
8. exclui a tarefa;
9. exclui o projeto;
10. confirma a remoção.

O teste possui limpeza de segurança para os dados temporários.

---

# Teste direto do PostgreSQL

O arquivo:

```text
projetos-banco.integracao.js
```

testa diretamente o repositório PostgreSQL.

Valida:

- criação de projeto;
- criação de tarefa;
- edição de projeto;
- edição de tarefa;
- conclusão de tarefa;
- consulta;
- exclusão de tarefa;
- exclusão de projeto;
- limpeza de segurança.

---

# Comandos disponíveis

## Terminal

```bash
npm start
```

## API e interface web

```bash
npm run api
```

## Testes principais

```bash
npm test
```

## Integração direta com PostgreSQL

```bash
npm run test:banco
```

## Todos os testes

```bash
npm run test:all
```

---

# Segurança

O arquivo:

```text
.env
```

contém informações privadas de conexão com o banco.

Ele não deve ser enviado para o GitHub.

O `.gitignore` deve impedir seu versionamento.

O arquivo:

```text
.env.example
```

pode permanecer no repositório como modelo.

Nunca devem ser publicados:

- senha do PostgreSQL;
- `DATABASE_URL` real;
- tokens;
- chaves privadas;
- outras credenciais.

---

# Estrutura atual

```text
OrganizaAI
├── public
│   ├── app.js
│   ├── index.html
│   └── styles.css
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

---

# Evolução do projeto

## 1. Persistência em JSON

A primeira versão armazenava projetos e tarefas em arquivos JSON.

Essa etapa trabalhou:

- estruturas de dados;
- funções;
- CRUD;
- persistência local;
- testes automatizados.

---

## 2. PostgreSQL e Supabase

O projeto passou a utilizar PostgreSQL hospedado no Supabase.

Foram implementados:

- conexão Node.js/PostgreSQL;
- tabelas de projetos e tarefas;
- relacionamento entre tabelas;
- SQL;
- CRUD completo;
- consultas com projetos e tarefas.

---

## 3. Menu integrado ao banco

A aplicação de terminal passou a utilizar PostgreSQL.

As principais operações foram integradas ao banco.

---

## 4. Integração automatizada com PostgreSQL

Foi criado um teste automatizado executando o CRUD completo diretamente no banco.

Dados temporários são removidos ao final.

---

## 5. Reorganização da arquitetura

Foram criadas as pastas:

```text
src/database
src/repositories
```

para separar conexão e acesso aos dados.

---

## 6. API REST

Express foi adicionado ao projeto.

Foram criadas rotas HTTP para projetos e tarefas.

---

## 7. Separação entre aplicação e servidor

A API foi dividida entre:

```text
src/api/app.js
```

e:

```text
src/api/servidor.js
```

facilitando os testes.

---

## 8. Supertest

A API passou a ser testada diretamente com Supertest.

---

## 9. Comandos de execução

Foram criados:

```bash
npm run api
npm run test:all
```

---

## 10. Validações HTTP

Foram adicionados cenários de:

```text
400
404
```

---

## 11. Erros internos

A arquitetura passou a utilizar:

```javascript
criarApp()
```

permitindo simular erros internos `500` durante testes.

---

## 12. Interface Web

Foi criada a pasta:

```text
public/
```

com:

```text
index.html
styles.css
app.js
```

A aplicação Express passou a servir a interface em:

```text
/app/
```

A interface foi conectada à API utilizando Fetch.

---

## 13. CRUD pela interface web

A interface passou a permitir:

- criar projeto;
- editar projeto;
- excluir projeto;
- criar tarefa;
- editar tarefa;
- concluir tarefa;
- excluir tarefa.

---

## 14. Modais

Foram adicionados modais próprios para:

- edição;
- confirmação de exclusão.

---

## 15. Notificações flutuantes

Mensagens de sucesso e erro passaram a aparecer como notificações temporárias.

---

## 16. Estados de carregamento

Os botões passaram a informar ações em andamento.

Exemplos:

```text
Criando...
Salvando...
Excluindo...
```

---

## 17. Progresso dos projetos

Cada projeto passou a mostrar:

- tarefas concluídas;
- total de tarefas;
- percentual;
- barra de progresso.

---

## 18. Filtros de tarefas

Foram adicionados:

```text
Todas
Pendentes
Concluídas
```

com contadores automáticos.

---

## 19. Resumo geral

A interface passou a mostrar:

```text
Projetos
Tarefas
Pendentes
Concluídas
```

em cartões de resumo.

---

## 20. Busca rápida

Foi adicionada busca local por:

- nome do projeto;
- descrição;
- título da tarefa.

A busca é feita diretamente nos dados já carregados no navegador.

---

# Marco da Interface Web v1

A primeira versão funcional da interface web chegou ao seguinte conjunto:

- integração com PostgreSQL por meio da API;
- CRUD completo de projetos;
- CRUD completo de tarefas;
- modais;
- confirmações de exclusão;
- notificações flutuantes;
- estados de carregamento;
- barra de progresso;
- filtros de tarefas;
- contadores;
- painel de resumo geral;
- busca rápida;
- layout responsivo;
- API REST integrada;
- Git e GitHub.

Esse conjunto representa o **marco Interface Web v1** do OrganizaAI.

---

# Próximas fases possíveis

As próximas evoluções poderão ser trabalhadas em blocos separados.

Entre elas:

- autenticação de usuários;
- contas individuais;
- associação de projetos a usuários;
- melhoria da organização interna do frontend;
- redução gradual da implementação antiga baseada em JSON;
- novos testes específicos da interface;
- ambientes separados de desenvolvimento e produção;
- publicação da aplicação;
- domínio;
- segurança para ambiente público;
- melhorias de acessibilidade;
- melhorias visuais;
- novos recursos de organização;
- recursos de inteligência artificial.

Esses itens não fazem parte do marco Interface Web v1.

---

# Status

O OrganizaAI está em desenvolvimento contínuo.

Marcos já alcançados:

```text
Backend funcional
PostgreSQL integrado
API REST funcional
Testes automatizados
Interface Web v1 funcional
```

A bateria automatizada registrada na fase de backend possui:

```text
31 testes
31 passando
0 falhas
```

O projeto continuará evoluindo em fases separadas, permitindo que cada novo recurso também funcione como exercício prático de desenvolvimento de software.