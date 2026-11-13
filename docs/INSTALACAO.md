# Instalação local do OrganizaAI — etapa de preparação

Este guia descreve como preparar uma instalação **nova** do OrganizaAI. A validação completa com PostgreSQL ainda está pendente.

## Pré-requisitos

- Node.js e npm instalados.
- Um banco PostgreSQL disponível (local ou hospedado).
- Acesso autorizado ao banco e um backup, se ele já contiver dados.

## Preparar o projeto

No terminal, dentro da pasta do repositório:

```bash
npm ci
```

Copie `.env.example` para `.env`, sem incluir `.env` no Git. Preencha localmente:

```dotenv
DATABASE_URL=postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO
SESSION_SECRET=UMA_CHAVE_ALEATORIA_LONGA_E_SECRETA
```

A configuração exata do endereço do banco varia conforme o provedor. **Nunca compartilhe credenciais, senhas ou o conteúdo do arquivo `.env` em issues, commits ou mensagens.**

## Criar as tabelas em um banco novo

Execute na ordem:

```bash
node scripts/executar-migracao.js migrations/000_projetos_tarefas.sql
node scripts/executar-migracao.js migrations/001_autenticacao.sql
```

A primeira migração cria `projetos` e `tarefas`; a segunda cria `usuarios` e `sessoes` e adiciona a associação de projetos a usuários.

**Banco já existente:** não execute migrações sem antes conferir o esquema atual e realizar um backup. As migrações não atribuem automaticamente projetos legados a um usuário: registros anteriores podem ficar com `usuario_id` nulo e exigir uma migração de dados específica.

## Iniciar a aplicação

```bash
npm start
```

Abra `http://localhost:3000/app/` no navegador, salvo se você configurar outra porta.

## Testes

O comando `npm test` inclui testes que carregam o módulo de banco e, portanto, exigem configuração de ambiente. Alguns testes de integração fazem gravações temporárias no PostgreSQL. Use **um banco de testes isolado**, nunca seu banco de produção.

A execução efetiva dos testes e a preparação de uma configuração segura de produção são próximas etapas do projeto. Não considere este guia uma autorização para publicar o sistema.
