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

O comando `npm test` executa apenas os testes locais de projetos, hash de senhas e autenticação simulada; **não grava no PostgreSQL**. Os testes de integração (`npm run test:banco`, `npm run test:usuarios` e `npm run test:api`) exigem `TEST_DATABASE_URL`, apontando para **outro banco**, diferente de `DATABASE_URL`. Se a configuração não estiver presente ou apontar para a mesma conexão, os testes são bloqueados. Não use seu banco de produção como banco de testes.

A execução efetiva dos testes e a preparação de uma configuração segura de produção são próximas etapas do projeto. Não considere este guia uma autorização para publicar o sistema.

## Certificado TLS do PostgreSQL

A aplicação valida o certificado TLS do PostgreSQL. Se aparecer um erro de CA não confiável, baixe o certificado do projeto no painel Supabase em Database Settings → SSL Configuration e defina o caminho local em `DB_SSL_CA_PATH`. Não desative a validação TLS e não armazene certificados privados ou senhas no repositório. Para os testes, o script `scripts/preparar-banco-teste.js` aceita `TEST_DB_SSL_CA_PATH` e substitui a configuração de CA da aplicação pela CA exclusiva do banco de testes. Verifique os dois certificados separadamente; não desative a validação.

## Proxy reverso e cookies seguros

O código envia cookies de sessão com `Secure` quando `NODE_ENV=production`. Caso o serviço Node.js esteja atrás de um terminador HTTPS/proxy reverso **confiável**, defina `TRUST_PROXY_HOPS` para a quantidade correta de saltos (normalmente `1` para apenas um proxy), conforme a documentação do provedor. Não habilite indiscriminadamente: o proxy deve sobrescrever os cabeçalhos `X-Forwarded-For`, `X-Forwarded-Host` e `X-Forwarded-Proto`, e o Node.js não pode estar diretamente acessível a clientes não confiáveis. Em ambiente local não é necessário configurar `TRUST_PROXY_HOPS`.

## Proteção de origem nas operações de escrita

Para publicar em produção, configure `NODE_ENV=production` e `APP_ORIGIN=https://dominio-publico.example` nas variáveis **privadas** da hospedagem, substituindo pelo domínio verdadeiro (sem `/app`). O processo falhará ao iniciar se `APP_ORIGIN` não apontar para uma origem HTTPS válida. A API recusa chamadas mutáveis sem prova de mesma origem; `POST`, `PUT`, `PATCH` e `DELETE` feitos por scripts externos precisarão de uma forma de autenticação própria, não cookies de sessão do navegador.

Durante o desenvolvimento local, `APP_ORIGIN` não é necessária; requisições com origem externa declarada continuam bloqueadas. A segurança em produção também depende de HTTPS, da configuração correta do proxy reverso e de testes no domínio real. Não configure `TRUST_PROXY_HOPS` por tentativa e erro.
