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

**Entrega funcional da versão 1.0 (16/11/2026):** gestão de projetos e tarefas publicada na Render em HTTPS (`https://organizaai-ukvh.onrender.com/app/`), com login, consulta, criação, conclusão, edição e exclusão testados pelo proprietário. O cadastro público está desativado e oculto. Os testes automatizados foram aprovados, e um backup foi criado e restaurado com sucesso em banco local isolado. O backup semanal foi agendado e sua execução manual pelo Agendador do Windows foi aprovada. **Escopo da versão 1.0 entregue; não é certificação de segurança para operação pública irrestrita.** Revisões adicionais e gestão de credenciais, criptografia/retencão de backups, acessibilidade e recuperação automatizada de senha permanecem melhorias de segurança e operação. A versão não inclui módulo de documentos nem recursos de RAG, agentes ou MCP.

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

A primeira versão já está publicada. Para manutenção, recuperação e qualquer uso com mais pessoas ou dados sensíveis, consulte o [checklist de segurança e implantação](docs/SEGURANCA_E_PUBLICACAO.md), o [guia Render + Supabase](docs/HOSPEDAGEM_RENDER.md) e o [registro de validações e riscos conhecidos](docs/VERSAO_1_0_CANDIDATA.md). Os testes concluídos **não** são uma auditoria de segurança.

## Próximas etapas

- Revisar segurança das conexões PostgreSQL, HTTPS, proxy e sessões.
- Consolidar a hospedagem existente, backups atualizados, restauracao isolada e monitoramento.
- Validar fluxos e acessibilidade em navegadores e dispositivos diferentes.
- Desenvolver o módulo de documentos.
- Evoluir a interface, se necessário, para React.
- Estudar e implementar progressivamente Go e recursos de IA como RAG, agentes e MCP, de acordo com os objetivos originais.

As etapas futuras não devem ser confundidas com funcionalidades já entregues.
