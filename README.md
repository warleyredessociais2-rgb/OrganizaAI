# OrganizaAI

Aplicação web para organizar projetos e tarefas, criada também como projeto de aprendizagem em desenvolvimento de software e inteligência artificial.

## Situação da aplicação

A implementação atual oferece:

- Cadastro, login e logout, com senhas armazenadas como hash.
- Sessões persistidas no PostgreSQL.
- Projetos e tarefas vinculados ao usuário autenticado.
- Criação, consulta, edição e exclusão de projetos e tarefas.
- Busca, filtros e indicadores de progresso na interface web.
- API REST com Express e interface HTML/CSS/JavaScript.
- PostgreSQL (o projeto usa Supabase como provedor).
- Testes automatizados e testes de integração.

**Estado:** o gerenciamento de projetos e tarefas foi validado localmente e em um banco de testes separado, mas a publicação e a revisão final de segurança ainda estão pendentes. A versão descrita aqui não implementa ainda um módulo de documentos nem recursos de RAG, agentes ou MCP.

## Instalação local

Requer Node.js e npm, além de um banco PostgreSQL acessível.

```bash
npm ci
```

Crie o arquivo `.env` localmente a partir de `.env.example`, preenchendo `DATABASE_URL` e `SESSION_SECRET`. Não compartilhe essas credenciais nem envie o `.env` ao GitHub.

Para um **banco novo**, execute as migrações nesta ordem:

```bash
node scripts/executar-migracao.js migrations/000_projetos_tarefas.sql
node scripts/executar-migracao.js migrations/001_autenticacao.sql
```

**Atenção:** essas instruções se destinam a um banco novo. Em um banco existente, confira o esquema e faça backup antes de executar migrações.

Inicie o servidor:

```bash
npm start
```

Abra `http://localhost:3000/app/` no navegador.

Instruções mais detalhadas em [docs/INSTALACAO.md](docs/INSTALACAO.md).

## Testes

```bash
npm test
```

Executa os testes locais, sem gravação no PostgreSQL.

Para os testes de integração, configure `TEST_DATABASE_URL` apontando para um **banco de testes isolado e diferente de `DATABASE_URL`**. Os comandos abaixo gravam e excluem registros de teste:

```bash
npm run test:banco
npm run test:usuarios
npm run test:api
```

A execução agregada é `npm run test:all` e pressupõe o mesmo banco isolado. Uma proteção rejeita o uso da conexão principal, mas a configuração do banco de testes deve ser conferida pelo operador.

## Segurança e publicação

Antes de publicar, siga o [checklist de segurança e implantação](docs/SEGURANCA_E_PUBLICACAO.md). O fato de testes locais passarem **não** comprova segurança de produção.

## Próximas etapas

- Revisar segurança das conexões PostgreSQL, HTTPS, proxy e sessões.
- Finalizar preparação de hospedagem, backups e monitoramento.
- Validar fluxos e acessibilidade em navegadores e dispositivos diferentes.
- Desenvolver o módulo de documentos.
- Evoluir a interface, se necessário, para React.
- Estudar e implementar progressivamente Go e recursos de IA como RAG, agentes e MCP, de acordo com os objetivos originais.

As etapas futuras não devem ser confundidas com funcionalidades já entregues.
